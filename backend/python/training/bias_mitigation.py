"""Bias mitigation helpers — post-processing and in-processing strategies.

Two complementary levels of mitigation are provided:

Level 1 — Post-processing (threshold shifting)
    The trained model is **frozen**.  Only the decision boundary moves.
    Fastest to deploy; no retraining required; AUC is unaffected.

    compute_fairness_weights  — NOT used here; only applies to Level 2.
    optimize_thresholds       — per-group optimal cut-offs.
    apply_group_thresholds    — apply those cut-offs to raw probabilities.
    mitigation_report         — before/after fairness comparison.

Level 2 — In-processing (sample weight rebalancing)
    Fairness is baked into training by assigning higher loss weight to
    under-represented groups.  Requires a full model retrain.
    The weights are computed here (pure function), then passed to
    ``model.fit(sample_weight=...)`` in the training scripts.

    compute_fairness_weights  — returns a weight per training observation.

Design contract
---------------
All functions are **pure**: arrays in, dicts / arrays out.
No matplotlib, no I/O, no hardcoded column names.

Workflow — Level 1 (post-processing)
-------------------------------------
    from training.bias_mitigation import (
        optimize_thresholds, apply_group_thresholds, mitigation_report,
    )

    thresholds   = optimize_thresholds(y_test, y_prob, df_test["age_group"])
    y_pred_fair  = apply_group_thresholds(y_prob, df_test["age_group"], thresholds)
    report       = mitigation_report(y_test, y_pred, y_pred_fair, y_prob, df_test["age_group"])

Workflow — Level 2 (in-processing, inside train_*.py)
------------------------------------------------------
    from training.bias_mitigation import compute_fairness_weights

    sample_weights = compute_fairness_weights(
        y_train,
        protected_attr=df_train["age_group"],
        strategy="equalize_groups",   # or "equalize_positive", "custom"
        custom_group_weights={"18-25": 1.5, "26-40": 1.0},
    )
    model.fit(X_train, y_train, sample_weight=sample_weights, ...)
"""

from __future__ import annotations

import json
import warnings
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)

from .fairness import fairness_report, _coerce_arrays


# ---------------------------------------------------------------------------
# Supported optimisation metrics
# ---------------------------------------------------------------------------

_METRIC_REGISTRY: dict[str, Any] = {
    "f1":                 lambda yt, yp: f1_score(yt, yp, zero_division=0),
    "accuracy":           accuracy_score,
    "balanced_accuracy":  balanced_accuracy_score,
    "precision":          lambda yt, yp: precision_score(yt, yp, zero_division=0),
    "recall":             lambda yt, yp: recall_score(yt, yp, zero_division=0),
}


# ---------------------------------------------------------------------------
# Threshold persistence  (training → serving handoff)
# ---------------------------------------------------------------------------

def save_thresholds(
    thresholds: dict[Any, float],
    path: Path | str,
    protected_attr_col: str,
    fallback_threshold: float = 0.5,
    optimize_metric: str = "unknown",
    metadata: dict[str, Any] | None = None,
) -> None:
    """
    Persist per-group decision thresholds to a JSON file.

    The saved file is self-describing: it carries the protected attribute
    column name, fallback threshold, and any caller-supplied metadata so
    the serving layer can load it without additional configuration.

    Parameters
    ----------
    thresholds : dict[group, float]
        Output of :func:`optimize_thresholds`.
    path : Path | str
        Destination file path (e.g. ``artifacts/bfs/run_v2/thresholds.json``).
    protected_attr_col : str
        Name of the DataFrame column used as the protected attribute
        (e.g. ``"age_group"``).  Stored so the serving layer knows which
        feature to look up.
    fallback_threshold : float
        Threshold used for groups not in the dict (default 0.5).
    optimize_metric : str
        The metric that was optimised (for audit trail).
    metadata : dict | None
        Any extra key-value pairs to embed (run_name, timestamp, DI score …).

    Example
    -------
    >>> save_thresholds(
    ...     thresholds,
    ...     path=out_dir / "thresholds.json",
    ...     protected_attr_col="age_group",
    ...     fallback_threshold=0.5,
    ...     optimize_metric="balanced_accuracy",
    ...     metadata={"run_name": run_name, "di_ratio": 0.87},
    ... )
    """
    # Guard against caller metadata keys silently overwriting reserved fields.
    reserved = {"protected_attr_col", "fallback_threshold", "optimize_metric", "thresholds", "meta"}
    if metadata:
        colliding = reserved & set(metadata.keys())
        if colliding:
            raise ValueError(
                f"metadata keys {colliding} collide with reserved payload keys. "
                "Use different key names or nest them under a custom key."
            )

    payload: dict[str, Any] = {
        "protected_attr_col":  protected_attr_col,
        "fallback_threshold":  fallback_threshold,
        "optimize_metric":     optimize_metric,
        # JSON keys must be strings; we coerce all group labels
        "thresholds":          {str(k): v for k, v in thresholds.items()},
        # Caller metadata is nested to avoid any future key collisions
        "meta":                metadata or {},
    }
    dest = Path(path)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(payload, indent=2))


def load_thresholds(path: Path | str) -> dict[str, Any]:
    """
    Load per-group decision thresholds from a JSON file written by
    :func:`save_thresholds`.

    Parameters
    ----------
    path : Path | str
        Path to ``thresholds.json``.

    Returns
    -------
    dict with keys:

    ==================== ==============================================
    protected_attr_col   Column name to use at serving time (str)
    fallback_threshold   Threshold for unseen groups (float)
    optimize_metric      Metric that was optimised (str)
    thresholds           ``{group_str: threshold_float}`` mapping (dict)
    ==================== ==============================================
    Plus any extra metadata embedded at save time.

    Raises
    ------
    FileNotFoundError
        If the file does not exist.
    ValueError
        If the file is missing required keys.

    Example
    -------
    >>> payload = load_thresholds(artifact_dir / "thresholds.json")
    >>> thr = payload["thresholds"].get(str(applicant_age_group), payload["fallback_threshold"])
    >>> decision = int(pred_proba >= thr)
    """
    src = Path(path)
    if not src.exists():
        raise FileNotFoundError(f"Threshold file not found: {src}")

    try:
        payload = json.loads(src.read_text())
    except json.JSONDecodeError as exc:
        raise ValueError(f"thresholds.json at {src} is not valid JSON.") from exc

    required = {"protected_attr_col", "fallback_threshold", "thresholds"}
    missing = required - set(payload.keys())
    if missing:
        raise ValueError(
            f"thresholds.json at {src} is missing required keys: {missing}"
        )

    # Type-safety guards so callers can rely on the contract
    if not isinstance(payload["thresholds"], dict):
        raise ValueError(
            f"'thresholds' in {src} must be a dict, got {type(payload['thresholds'])}"
        )
    if not isinstance(payload["fallback_threshold"], (int, float)):
        raise ValueError(
            f"'fallback_threshold' in {src} must be numeric, "
            f"got {type(payload['fallback_threshold'])}"
        )

    return payload



# ---------------------------------------------------------------------------
# Level 2 — In-processing: sample weight computation
# ---------------------------------------------------------------------------

_WEIGHT_STRATEGIES = frozenset({"equalize_groups", "equalize_positive", "custom"})


def compute_fairness_weights(
    y_true: Any,
    protected_attr: Any,
    strategy: str = "equalize_groups",
    custom_group_weights: dict[str, float] | None = None,
    class_weight_balance: bool = True,
    min_group_size: int = 10,
) -> np.ndarray:
    """
    Compute per-observation sample weights to reduce group-level bias during training.

    This is a **Level 2 (in-processing)** mitigation tool.  The returned
    array is passed directly to ``model.fit(sample_weight=weights)``.
    It does NOT modify the model, labels, or features.

    The weights are normalised so that ``weights.mean() == 1.0``, which
    preserves the effective learning rate and total loss scale across runs.

    Strategies
    ----------
    ``"equalize_groups"``
        Upweights each observation so that every group contributes an equal
        fraction of the total gradient signal.  Groups that are
        under-represented in the training set receive higher weights.
        Equivalent to inverse-frequency weighting by group.

    ``"equalize_positive"``
        Within each group, upweights positive-class (default = 1) observations
        by the group's own negative-to-positive ratio.  Addresses within-group
        class imbalance *and* cross-group imbalance simultaneously.
        Most useful when positive-class rates differ significantly across groups.

    ``"custom"``
        Multiplies each observation's base weight by a caller-supplied
        per-group scalar from ``custom_group_weights``.  Groups not present
        in the dict receive a multiplier of 1.0.

    Parameters
    ----------
    y_true : array-like of shape (n_samples,)
        Ground-truth binary labels (0 / 1).
    protected_attr : array-like of shape (n_samples,)
        Protected attribute values for each observation (e.g. age group,
        gender, region).  Any hashable type is accepted.
    strategy : str
        One of ``"equalize_groups"``, ``"equalize_positive"``, ``"custom"``.
        Default ``"equalize_groups"``.
    custom_group_weights : dict[str, float] | None
        Required when ``strategy="custom"``.  Maps group label (as string)
        to a scalar multiplier.  Groups absent from the dict get weight 1.0.
    class_weight_balance : bool
        When ``True`` (default), applies sklearn-style class balancing on top
        of the group weights: each class receives weight
        ``n_samples / (n_classes * class_count)``.  Set to ``False`` to skip.
    min_group_size : int
        Groups with fewer than ``min_group_size`` observations emit a warning
        and receive weight 1.0 instead of the computed value.

    Returns
    -------
    np.ndarray of shape (n_samples,), dtype float64
        Per-observation weights normalised to mean == 1.0.

    Raises
    ------
    ValueError
        If ``strategy`` is not one of the supported values, or if
        ``strategy="custom"`` is used without ``custom_group_weights``.

    Example — equalize groups
    --------------------------
    >>> weights = compute_fairness_weights(
    ...     y_train,
    ...     protected_attr=df_train["age_group"],
    ...     strategy="equalize_groups",
    ... )
    >>> model.fit(X_train, y_train, sample_weight=weights)

    Example — custom multipliers
    -----------------------------
    >>> weights = compute_fairness_weights(
    ...     y_train,
    ...     protected_attr=df_train["age_group"],
    ...     strategy="custom",
    ...     custom_group_weights={"18-25": 1.5, "26-40": 1.0, "60+": 1.3},
    ... )
    """
    if strategy not in _WEIGHT_STRATEGIES:
        raise ValueError(
            f"Unknown strategy '{strategy}'. "
            f"Must be one of: {sorted(_WEIGHT_STRATEGIES)}"
        )
    if strategy == "custom" and not custom_group_weights:
        raise ValueError(
            "strategy='custom' requires custom_group_weights to be a non-empty dict."
        )

    yt = np.asarray(y_true).ravel()
    pa = np.asarray(protected_attr).ravel()

    if len(yt) != len(pa):
        raise ValueError(
            f"y_true (len={len(yt)}) and protected_attr (len={len(pa)}) "
            "must have the same length."
        )

    n_samples = len(yt)
    weights = np.ones(n_samples, dtype=np.float64)
    groups, group_indices = np.unique(pa, return_inverse=True)

    # ---------------------------------------------------------------
    # Strategy-specific weight computation
    # ---------------------------------------------------------------
    if strategy == "equalize_groups":
        # Each group should contribute equally: weight = n_samples / (n_groups * group_count)
        n_groups = len(groups)
        for idx, group in enumerate(groups):
            mask = group_indices == idx
            group_count = int(mask.sum())
            if group_count < min_group_size:
                warnings.warn(
                    f"compute_fairness_weights: group '{group}' has only "
                    f"{group_count} samples (< min_group_size={min_group_size}). "
                    "Assigning weight 1.0.",
                    UserWarning,
                    stacklevel=2,
                )
                continue
            weights[mask] = n_samples / (n_groups * group_count)

    elif strategy == "equalize_positive":
        # Within each group: upweight positives by the group's neg/pos ratio.
        # Cross-group: also equalise group contributions (equalize_groups baseline).
        n_groups = len(groups)
        for idx, group in enumerate(groups):
            mask = group_indices == idx
            group_count = int(mask.sum())
            if group_count < min_group_size:
                warnings.warn(
                    f"compute_fairness_weights: group '{group}' has only "
                    f"{group_count} samples (< min_group_size={min_group_size}). "
                    "Assigning weight 1.0.",
                    UserWarning,
                    stacklevel=2,
                )
                continue
            # Base: equalise group size
            group_base = n_samples / (n_groups * group_count)
            n_pos = int(yt[mask].sum())
            n_neg = group_count - n_pos
            if n_pos == 0 or n_neg == 0:
                # Degenerate group — only one class present, can't compute ratio
                weights[mask] = group_base
                continue
            pos_mask = mask & (yt == 1)
            neg_mask = mask & (yt == 0)
            # Positive class gets upweighted by n_neg/n_pos within the group
            weights[pos_mask] = group_base * (n_neg / n_pos)
            weights[neg_mask] = group_base

    elif strategy == "custom":
        # Apply caller-supplied multipliers; default to 1.0 for unknown groups
        for idx, group in enumerate(groups):
            mask = group_indices == idx
            multiplier = float(
                custom_group_weights.get(str(group), 1.0)  # type: ignore[union-attr]
            )
            weights[mask] *= multiplier

    # ---------------------------------------------------------------
    # Optional sklearn-style class balancing on top
    # ---------------------------------------------------------------
    if class_weight_balance:
        n_classes = len(np.unique(yt))
        for cls_val in np.unique(yt):
            cls_mask = yt == cls_val
            cls_count = int(cls_mask.sum())
            if cls_count > 0:
                weights[cls_mask] *= n_samples / (n_classes * cls_count)

    # ---------------------------------------------------------------
    # Normalise so mean weight == 1.0 (preserves effective loss scale)
    # ---------------------------------------------------------------
    mean_w = weights.mean()
    if mean_w > 0:
        weights /= mean_w

    return weights


# ---------------------------------------------------------------------------
# Per-group threshold optimisation
# ---------------------------------------------------------------------------

def optimize_thresholds(
    y_true: Any,
    y_pred_proba: Any,
    protected_attr: Any,
    optimize_metric: str = "f1",
    threshold_range: tuple[float, float] = (0.3, 0.7),
    step: float = 0.01,
    min_group_size: int = 10,
) -> dict[Any, float]:
    """
    Find the per-group decision threshold that maximises ``optimize_metric``.

    Each group in ``protected_attr`` gets its *own* optimal threshold,
    chosen by exhaustive grid search over ``threshold_range``.  This is a
    post-processing fairness intervention: the model is not retrained.

    Parameters
    ----------
    y_true : array-like of shape (n_samples,)
        Ground-truth binary labels (0 / 1).
    y_pred_proba : array-like of shape (n_samples,)
        Predicted positive-class probabilities from the trained model.
    protected_attr : array-like of shape (n_samples,)
        Group membership (any categorical dtype).
    optimize_metric : str
        Metric to maximise within each group.  One of:
        ``"f1"`` (default), ``"accuracy"``, ``"balanced_accuracy"``,
        ``"precision"``, ``"recall"``.
    threshold_range : tuple[float, float]
        (low, high) inclusive range for the grid search.
        Defaults to (0.3, 0.7) — a sensible range around 0.5.
    step : float
        Grid step size.  Smaller values give finer thresholds but are slower.
    min_group_size : int
        Groups below this size are optimized with a warning — their
        thresholds may not generalise.

    Returns
    -------
    dict[group_label, float]
        Per-group optimal threshold.  Groups not in the protected_attr are
        absent from the dict.

    Raises
    ------
    ValueError
        If ``optimize_metric`` is not one of the supported options.
    ValueError
        If input arrays have inconsistent lengths.

    Example
    -------
    >>> thresholds = optimize_thresholds(
    ...     y_true=y_test,
    ...     y_pred_proba=y_prob,
    ...     protected_attr=df_test["income_bracket"],
    ...     optimize_metric="balanced_accuracy",
    ... )
    >>> thresholds
    {'Low': 0.42, 'Medium': 0.51, 'High': 0.47}
    """
    if optimize_metric not in _METRIC_REGISTRY:
        raise ValueError(
            f"optimize_metric='{optimize_metric}' is not supported. "
            f"Choose from: {sorted(_METRIC_REGISTRY)}"
        )

    # Coerce + NaN-drop in one pass
    yt_arr  = np.asarray(y_true).ravel()
    ypp_arr = np.asarray(y_pred_proba).ravel()
    pa_arr  = np.asarray(protected_attr).ravel()

    lengths = {"y_true": len(yt_arr), "y_pred_proba": len(ypp_arr), "protected_attr": len(pa_arr)}
    if len(set(lengths.values())) != 1:
        raise ValueError(f"All input arrays must have the same length. Got: {lengths}")

    try:
        valid_mask = ~pd.isnull(pa_arr)
    except TypeError:
        valid_mask = np.ones(len(pa_arr), dtype=bool)

    n_dropped = int((~valid_mask).sum())
    if n_dropped > 0:
        warnings.warn(
            f"optimize_thresholds: dropping {n_dropped} rows where protected_attr is NaN.",
            UserWarning,
            stacklevel=2,
        )

    yt_arr  = yt_arr[valid_mask]
    ypp_arr = ypp_arr[valid_mask]
    pa_arr  = pa_arr[valid_mask]

    metric_fn = _METRIC_REGISTRY[optimize_metric]
    lo, hi = threshold_range
    grid = np.arange(lo, hi + step / 2, step).round(4)

    thresholds: dict[Any, float] = {}

    for group in np.unique(pa_arr):
        mask = pa_arr == group
        group_size = int(mask.sum())
        yt_g  = yt_arr[mask]
        ypp_g = ypp_arr[mask]

        if group_size < min_group_size:
            warnings.warn(
                f"bias_mitigation: group '{group}' has {group_size} samples "
                f"(< min_group_size={min_group_size}). Threshold may not generalise.",
                UserWarning,
                stacklevel=2,
            )

        # Degenerate group — only one class present
        if len(np.unique(yt_g)) < 2:
            warnings.warn(
                f"bias_mitigation: group '{group}' contains only one class. "
                f"Defaulting threshold to 0.5.",
                UserWarning,
                stacklevel=2,
            )
            thresholds[group] = 0.5
            continue

        best_score: float = -np.inf
        best_threshold: float = 0.5

        for thr in grid:
            yp_g = (ypp_g >= thr).astype(int)
            try:
                score = float(metric_fn(yt_g, yp_g))
            except Exception:
                continue
            if score > best_score:
                best_score = score
                best_threshold = float(thr)

        thresholds[group] = best_threshold

    return thresholds


# ---------------------------------------------------------------------------
# Apply per-group thresholds
# ---------------------------------------------------------------------------

def apply_group_thresholds(
    y_pred_proba: Any,
    protected_attr: Any,
    thresholds: dict[Any, float],
    fallback_threshold: float = 0.5,
) -> np.ndarray:
    """
    Convert predicted probabilities to binary labels using per-group thresholds.

    Parameters
    ----------
    y_pred_proba : array-like of shape (n_samples,)
        Predicted positive-class probabilities.
    protected_attr : array-like of shape (n_samples,)
        Group membership (same dtype / values as used in
        :func:`optimize_thresholds`).
    thresholds : dict[group_label, float]
        Per-group decision thresholds, e.g. from :func:`optimize_thresholds`.
    fallback_threshold : float
        Threshold used for observations whose group is not in ``thresholds``
        (e.g. unseen groups at inference time).  Default 0.5.

    Returns
    -------
    np.ndarray of shape (n_samples,) with dtype int
        Binary predictions (0 / 1).

    Raises
    ------
    ValueError
        If input arrays have inconsistent lengths.

    Example
    -------
    >>> y_pred_fair = apply_group_thresholds(
    ...     y_pred_proba=y_prob,
    ...     protected_attr=df_test["income_bracket"],
    ...     thresholds={"Low": 0.42, "Medium": 0.51, "High": 0.47},
    ... )
    """
    ypp  = np.asarray(y_pred_proba).ravel()
    pa   = np.asarray(protected_attr).ravel()

    if len(ypp) != len(pa):
        raise ValueError(
            f"y_pred_proba length ({len(ypp)}) != protected_attr length ({len(pa)})."
        )

    y_out = np.zeros(len(ypp), dtype=int)

    for i, (prob, group) in enumerate(zip(ypp, pa)):
        thr = thresholds.get(group, fallback_threshold)
        y_out[i] = int(prob >= thr)

    # Warn about any groups that fell back to the default threshold
    unseen = set(np.unique(pa)) - set(thresholds.keys())
    if unseen:
        warnings.warn(
            f"apply_group_thresholds: groups {unseen} were not in 'thresholds'. "
            f"Fallback threshold {fallback_threshold} was applied.",
            UserWarning,
            stacklevel=2,
        )

    return y_out


def apply_global_threshold(
    y_pred_proba: Any,
    threshold: float = 0.5,
) -> np.ndarray:
    """
    Apply a single global threshold to produce binary predictions.

    Convenience function used to establish the pre-mitigation baseline.

    Parameters
    ----------
    y_pred_proba : array-like of shape (n_samples,)
        Predicted positive-class probabilities.
    threshold : float
        Decision threshold (default 0.5).

    Returns
    -------
    np.ndarray of shape (n_samples,) with dtype int
    """
    return (np.asarray(y_pred_proba).ravel() >= threshold).astype(int)


# ---------------------------------------------------------------------------
# Before-vs-after mitigation report
# ---------------------------------------------------------------------------

def mitigation_report(
    y_true: Any,
    y_pred_before: Any,
    y_pred_after: Any,
    y_pred_proba: Any,
    protected_attr: Any,
    di_low: float = 0.8,
    di_high: float = 1.25,
    min_group_size: int = 10,
) -> dict[str, Any]:
    """
    Compare fairness and accuracy metrics before and after threshold mitigation.

    Runs a full :func:`~training.fairness.fairness_report` for both the
    original and the mitigated predictions and produces a structured
    comparison with accuracy trade-off quantified.

    Parameters
    ----------
    y_true : array-like of shape (n_samples,)
        Ground-truth binary labels (0 / 1).
    y_pred_before : array-like of shape (n_samples,)
        Binary predictions from the *original* (uniform-threshold) model.
    y_pred_after : array-like of shape (n_samples,)
        Binary predictions *after* applying group-specific thresholds.
    y_pred_proba : array-like of shape (n_samples,)
        Raw predicted probabilities (unchanged by mitigation — used for AUC).
    protected_attr : array-like of shape (n_samples,)
        Group membership (any categorical dtype).
    di_low : float
        Lower bound for disparate impact pass/fail (default 0.8).
    di_high : float
        Upper bound for disparate impact pass/fail (default 1.25).
    min_group_size : int
        Groups below this size receive a reliability warning.

    Returns
    -------
    dict with keys:

    ========================== =================================================
    before                     Full :func:`~training.fairness.fairness_report`
                               dict for pre-mitigation predictions.
    after                      Full :func:`~training.fairness.fairness_report`
                               dict for post-mitigation predictions.
    accuracy_before            Overall accuracy before (float)
    accuracy_after             Overall accuracy after (float)
    accuracy_delta             accuracy_after − accuracy_before (float, signed)
    accuracy_pct_change        Percentage accuracy change (float, signed)
    auc                        ROC-AUC on raw probabilities (unchanged) (float)
    di_improvement             after DI ratio − before DI ratio (float)
    eod_improvement            before EOD − after EOD (float, positive = better)
    overall_passes_before      bool
    overall_passes_after       bool
    ========================== =================================================

    Example
    -------
    >>> report = mitigation_report(
    ...     y_true=y_test,
    ...     y_pred_before=y_pred_global,
    ...     y_pred_after=y_pred_fair,
    ...     y_pred_proba=y_prob,
    ...     protected_attr=df_test["age_group"],
    ... )
    >>> print_mitigation_report(report)
    """
    yt  = np.asarray(y_true).ravel()
    ypb = np.asarray(y_pred_before).ravel()
    ypa = np.asarray(y_pred_after).ravel()
    ypp = np.asarray(y_pred_proba).ravel()

    report_before = fairness_report(
        yt, ypb, ypp, protected_attr,
        di_low=di_low, di_high=di_high, min_group_size=min_group_size,
    )
    report_after = fairness_report(
        yt, ypa, ypp, protected_attr,
        di_low=di_low, di_high=di_high, min_group_size=min_group_size,
    )

    acc_before = float(accuracy_score(yt, ypb))
    acc_after  = float(accuracy_score(yt, ypa))
    acc_delta  = acc_after - acc_before
    acc_pct    = (acc_delta / acc_before * 100) if acc_before > 0 else float("nan")

    # AUC is on raw probabilities — unaffected by threshold changes
    try:
        auc = float(roc_auc_score(yt, ypp))
    except Exception:
        auc = float("nan")

    di_before  = report_before["disparate_impact"]["ratio"]
    di_after   = report_after["disparate_impact"]["ratio"]
    eod_before = report_before["equal_opportunity"]["eod"]
    eod_after  = report_after["equal_opportunity"]["eod"]

    return {
        "before":                report_before,
        "after":                 report_after,
        "accuracy_before":       round(acc_before, 4),
        "accuracy_after":        round(acc_after, 4),
        "accuracy_delta":        round(acc_delta, 4),
        "accuracy_pct_change":   round(acc_pct, 2),
        "auc":                   round(auc, 4),
        "di_improvement":        round(di_after - di_before, 4),
        "eod_improvement":       round(eod_before - eod_after, 4),
        "overall_passes_before": report_before["overall_passes"],
        "overall_passes_after":  report_after["overall_passes"],
    }


# ---------------------------------------------------------------------------
# Pretty-print helpers (no matplotlib dependency)
# ---------------------------------------------------------------------------

def print_thresholds(
    thresholds: dict[Any, float],
    title: str = "Per-Group Decision Thresholds",
) -> None:
    """
    Print per-group thresholds in a readable table format.

    Parameters
    ----------
    thresholds : dict
        Output of :func:`optimize_thresholds`.
    title : str
        Section header.
    """
    sep = "=" * 50
    print(f"\n[THRESHOLDS] {title}")
    print(sep)
    max_label_len = max((len(str(g)) for g in thresholds), default=5)
    for group, thr in sorted(thresholds.items(), key=lambda x: str(x[0])):
        print(f"  {str(group):<{max_label_len}}  →  {thr:.4f}")
    print(sep)


def print_mitigation_report(
    report: dict[str, Any],
    title: str = "Bias Mitigation Results",
) -> None:
    """
    Print a before-vs-after bias mitigation summary to stdout.

    Parameters
    ----------
    report : dict
        Output of :func:`mitigation_report`.
    title : str
        Section header.
    """
    sep = "=" * 70
    print(f"\n[REPORT] {title}")
    print(sep)

    di_b = report["before"]["disparate_impact"]
    di_a = report["after"]["disparate_impact"]
    eod_b = report["before"]["equal_opportunity"]["eod"]
    eod_a = report["after"]["equal_opportunity"]["eod"]

    # Disparate Impact
    status_before = "PASS" if di_b["passes"] else "FAIL"
    status_after  = "PASS" if di_a["passes"] else "FAIL"
    print(f"\nDisparate Impact  [{di_b['di_low']:.2f}-{di_b['di_high']:.2f} rule]")
    print(f"  Before:  {di_b['ratio']:.4f}  {status_before}")
    print(f"  After:   {di_a['ratio']:.4f}  {status_after}")
    improvement = report["di_improvement"]
    print(f"  Change:  {improvement:+.4f}")

    # Equal Opportunity Difference
    print(f"\nEqual Opportunity Difference (TPR gap)")
    print(f"  Before:  {eod_b:.4f}")
    print(f"  After:   {eod_a:.4f}")
    print(f"  Change:  {report['eod_improvement']:+.4f}  "
          f"({'improved' if report['eod_improvement'] > 0 else 'worsened'})")

    # Accuracy trade-off
    print(f"\nAccuracy")
    print(f"  Before:  {report['accuracy_before']:.4f}  ({report['accuracy_before']:.2%})")
    print(f"  After:   {report['accuracy_after']:.4f}  ({report['accuracy_after']:.2%})")
    print(f"  Delta:   {report['accuracy_delta']:+.4f}  "
          f"({report['accuracy_pct_change']:+.2f}%)")

    print(f"\nROC-AUC (unchanged -- raw probabilities):  {report['auc']:.4f}")

    # Headline
    if report["overall_passes_after"]:
        print(f"\n{sep}")
        print("[OK] SUCCESS: Fairness thresholds now meet all audit criteria.")
    else:
        print(f"\n{sep}")
        print("[WARN] Mitigation improved fairness, but further work may be needed.")
    print(sep)


# ---------------------------------------------------------------------------
# End-to-end pipeline summary
# ---------------------------------------------------------------------------

def print_pipeline_summary(
    metrics: dict,
    mitigation: dict,
    shap_global: list[dict] | None = None,
    n_samples: int | None = None,
    model_label: str = "Model",
    top_n_drivers: int = 3,
    objectives: list[str] | None = None,
) -> None:
    """
    Print a structured end-to-end pipeline summary after bias mitigation.

    Assembles output from the three core pipeline stages:
    - **Classification metrics**  — from :func:`~training.validation.classification_metrics`
    - **SHAP global importance**  — from :func:`~training.shap_explainer.global_shap_importance`
    - **Bias mitigation report**  — from :func:`mitigation_report`

    Everything is driven by the structured dicts the pipeline already
    returns — no hardcoded column names, dataset sizes, or class labels.

    Parameters
    ----------
    metrics : dict
        Output of :func:`~training.validation.classification_metrics` for
        the **test** split (keys: ``auc``, ``accuracy``, ``precision``,
        ``recall``, ``f1``, ``model``, ``threshold``, ...).
    mitigation : dict
        Output of :func:`mitigation_report`.  Must contain keys
        ``accuracy_before``, ``accuracy_after``, ``accuracy_pct_change``,
        ``di_improvement``, ``before``, ``after``, ``overall_passes_after``.
    shap_global : list[dict] | None
        Output of :func:`~training.shap_explainer.global_shap_importance`.
        Each dict must have keys ``feature`` and ``mean_shap``.
        If ``None``, the risk-drivers section is skipped.
    n_samples : int | None
        Total number of observations in the dataset.  If ``None``, omitted.
    model_label : str
        Human-readable model identifier shown in the header.
    top_n_drivers : int
        How many top SHAP drivers to display (default 3).
    objectives : list[str] | None
        Custom bullet points for the "Objectives Met" section.  If ``None``,
        a default list is auto-generated from the available data.

    Example
    -------
    >>> from training.bias_mitigation import print_pipeline_summary
    >>> print_pipeline_summary(
    ...     metrics=metrics_test,
    ...     mitigation=mit_report,
    ...     shap_global=shap_global_test,
    ...     n_samples=len(df_clean),
    ...     model_label="Credit Default XGBoost v2",
    ... )
    """
    import pandas as pd

    sep_wide  = "=" * 80
    sep_thin  = "-" * 80

    di_before  = mitigation["before"]["disparate_impact"]["ratio"]
    di_after   = mitigation["after"]["disparate_impact"]["ratio"]
    di_passes  = mitigation["overall_passes_after"]

    acc_before     = mitigation["accuracy_before"]
    acc_after      = mitigation["accuracy_after"]
    acc_pct_change = mitigation["accuracy_pct_change"]

    # ---------------------------------------------------------------
    # Build summary rows dynamically — only include rows with data
    # ---------------------------------------------------------------
    rows: list[tuple[str, str]] = []

    if n_samples is not None:
        rows.append(("Total Samples", f"{n_samples:,}"))

    rows += [
        ("Model",           metrics.get("model", model_label)),
        ("Threshold",       f"{metrics.get('threshold', 0.5):.2f}"),
        ("",                ""),  # spacer
        ("Accuracy",        f"{metrics.get('accuracy', float('nan')):.2%}"),
        ("ROC-AUC",         f"{metrics.get('auc', float('nan')):.4f}"),
        ("KS Statistic",    f"{metrics.get('ks', float('nan')):.4f}"),
        ("Gini",            f"{metrics.get('gini', float('nan')):.4f}"),
        ("Precision",       f"{metrics.get('precision', float('nan')):.4f}"),
        ("Recall (TPR)",    f"{metrics.get('recall', float('nan')):.4f}"),
        ("F1-Score",        f"{metrics.get('f1', float('nan')):.4f}"),
        ("Brier Score",     f"{metrics.get('brier', float('nan')):.4f}"),
    ]

    # Confusion matrix components if present
    if all(k in metrics for k in ("tp", "tn", "fp", "fn")):
        rows += [
            ("",                ""),
            ("True Positives",  f"{metrics['tp']:,}"),
            ("True Negatives",  f"{metrics['tn']:,}"),
            ("False Positives", f"{metrics['fp']:,}"),
            ("False Negatives", f"{metrics['fn']:,}"),
        ]

    # SHAP top drivers
    if shap_global:
        rows.append(("", ""))
        drivers = shap_global[:top_n_drivers]
        for rank, d in enumerate(drivers, start=1):
            feat  = d.get("feature", "?")
            shap_ = d.get("mean_shap", float("nan"))
            rows.append((f"Risk Driver #{rank}", f"{feat}  (mean|SHAP|={shap_:.4f})"))

    # Fairness / bias mitigation
    rows += [
        ("", ""),
        ("Disparate Impact (Before)", f"{di_before:.4f}"),
        ("Disparate Impact (After)",  f"{di_after:.4f}"),
        ("DI Improvement",            f"{mitigation['di_improvement']:+.4f}"),
        ("EOD Improvement",           f"{mitigation['eod_improvement']:+.4f}"),
        ("Accuracy Before Mitigation",f"{acc_before:.2%}"),
        ("Accuracy After Mitigation", f"{acc_after:.2%}"),
        ("Accuracy Change",           f"{acc_pct_change:+.2f}%"),
        ("Fairness Status",           "[OK] PASS" if di_passes else "[WARN] REVIEW"),
    ]

    summary_df = pd.DataFrame(rows, columns=["Metric", "Value"])

    # ---------------------------------------------------------------
    # Print
    # ---------------------------------------------------------------
    print(f"\n{sep_wide}")
    print(f"  {model_label.upper()} - PIPELINE SUMMARY")
    print(sep_wide)
    print(summary_df.to_string(index=False))
    print(sep_wide)

    # ---------------------------------------------------------------
    # Objectives section — auto-generate or use caller-supplied list
    # ---------------------------------------------------------------
    if objectives is None:
        auc_val  = metrics.get("auc", float("nan"))
        acc_val  = metrics.get("accuracy", float("nan"))
        objectives = [
            f"Built predictive model"
            + (f" on {n_samples:,} applications" if n_samples else ""),
            f"Achieved {acc_val:.2%} accuracy and {auc_val:.4f} ROC-AUC",
        ]
        if shap_global:
            objectives.append(
                f"Identified top risk driver: "
                f"{shap_global[0].get('feature', '?')}"
                f"  (mean|SHAP|={shap_global[0].get('mean_shap', 0):.4f})"
            )
        objectives += [
            "Implemented fairness audit framework (disparate impact + EOD)",
            f"Disparate Impact: {di_before:.4f} -> {di_after:.4f}  "
            f"({'PASS' if di_passes else 'needs further review'})",
            f"Accuracy trade-off from mitigation: {acc_pct_change:+.2f}%",
        ]

    print("\nObjectives Met:")
    for obj in objectives:
        print(f"  [+] {obj}")
    print(sep_wide)
