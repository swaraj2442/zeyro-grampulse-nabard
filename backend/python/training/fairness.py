"""Dataset-agnostic fairness audit helpers.

This module provides **pure computation** only — arrays / Series in,
structured dicts / DataFrames out.  No matplotlib, no I/O, no hardcoded
column names or class labels.  Plotting is left to the caller (or to the
plot helpers in ``shap_explainer.py``).

Core concepts
-------------
Selection Rate
    Fraction of observations in a group that receive a positive prediction
    (predicted default = 1).  Measures who the model flags.

Disparate Impact (DI)
    ``min(selection_rate) / max(selection_rate)`` across groups.
    The 80 % rule (DI ≥ 0.8) is the standard fair-lending threshold.
    Values > 1.25 indicate the reference group is over-selected.

Equal Opportunity Difference (EOD)
    ``max(TPR) - min(TPR)`` across groups.  Measures whether the model
    finds true positives equally well for every group.

Equalized Odds
    Requires *both* TPR and FPR parity.  Returns the maximum difference
    for each rate.

Usage
-----
    from training.fairness import fairness_report

    report = fairness_report(
        y_true=y_test,
        y_pred=y_pred,
        y_pred_proba=y_pred_proba,
        protected_attr=df_test["age_group"],   # any categorical column
    )

    print(report["disparate_impact"])
    print(report["metrics_df"])
"""

from __future__ import annotations

import warnings
from typing import Any

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    roc_auc_score,
)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _safe_divide(numerator: float, denominator: float, fallback: float = 0.0) -> float:
    """Return numerator / denominator, or fallback when denominator is zero."""
    return numerator / denominator if denominator > 0 else fallback


def _coerce_arrays(
    y_true: Any,
    y_pred: Any,
    y_pred_proba: Any | None,
    protected_attr: Any,
) -> tuple[np.ndarray, np.ndarray, np.ndarray | None, np.ndarray]:
    """
    Coerce all inputs to 1-D NumPy arrays with aligned indices.

    Accepts NumPy arrays, Pandas Series, or any array-like.  Drops NaN
    rows in ``protected_attr`` (and the corresponding rows in all other
    arrays) to avoid silent group-membership errors.

    Returns
    -------
    y_true, y_pred, y_pred_proba (or None), protected_attr — all np.ndarray,
    all the same length, NaNs in protected_attr removed.
    """
    yt = np.asarray(y_true).ravel()
    yp = np.asarray(y_pred).ravel()
    pa = np.asarray(protected_attr).ravel()
    ypp: np.ndarray | None = None if y_pred_proba is None else np.asarray(y_pred_proba).ravel()

    # Validate lengths
    lengths = {"y_true": len(yt), "y_pred": len(yp), "protected_attr": len(pa)}
    if y_pred_proba is not None:
        lengths["y_pred_proba"] = len(ypp)  # type: ignore[arg-type]
    if len(set(lengths.values())) != 1:
        raise ValueError(
            f"All input arrays must have the same length. Got: {lengths}"
        )

    # Drop NaN rows in protected_attr
    try:
        valid_mask = ~pd.isnull(pa)
    except TypeError:
        valid_mask = np.ones(len(pa), dtype=bool)

    n_dropped = int((~valid_mask).sum())
    if n_dropped > 0:
        warnings.warn(
            f"fairness: dropping {n_dropped} rows where protected_attr is NaN.",
            UserWarning,
            stacklevel=3,
        )

    yt = yt[valid_mask]
    yp = yp[valid_mask]
    pa = pa[valid_mask]
    if ypp is not None:
        ypp = ypp[valid_mask]

    return yt, yp, ypp, pa


# ---------------------------------------------------------------------------
# Core metric computation — per-group breakdown
# ---------------------------------------------------------------------------

def fairness_metrics_by_group(
    y_true: Any,
    y_pred: Any,
    y_pred_proba: Any | None,
    protected_attr: Any,
    min_group_size: int = 10,
) -> pd.DataFrame:
    """
    Compute comprehensive fairness metrics for every group in ``protected_attr``.

    The function is fully dataset-agnostic: group values are read directly
    from ``protected_attr``; no column names or class labels are hardcoded.

    Parameters
    ----------
    y_true : array-like of shape (n_samples,)
        Ground-truth binary labels (0 / 1).
    y_pred : array-like of shape (n_samples,)
        Thresholded binary predictions (0 / 1).
    y_pred_proba : array-like of shape (n_samples,) | None
        Predicted positive-class probabilities.  Required for AUC; set to
        ``None`` to skip AUC computation.
    protected_attr : array-like of shape (n_samples,)
        Group membership for each observation.  Any categorical dtype:
        string labels (e.g. ``"18-25"``) or integer codes both work.
    min_group_size : int
        Groups with fewer than ``min_group_size`` observations are still
        included but flagged with a warning — their metrics may be
        statistically unreliable.

    Returns
    -------
    pd.DataFrame
        One row per group.  Columns:

        =========== ============================================================
        Group        Group label from ``protected_attr``
        Size         Number of observations in group
        BaseRate     Fraction of actual positives in group
        SelectionRate Fraction predicted positive in group
        Accuracy     Accuracy within group
        TPR          True Positive Rate  (Sensitivity / Recall)
        FPR          False Positive Rate (1 − Specificity)
        TNR          True Negative Rate  (Specificity)
        FNR          False Negative Rate (Miss Rate)
        PPV          Positive Predictive Value (Precision)
        NPV          Negative Predictive Value
        AUC          ROC-AUC within group (NaN if y_pred_proba is None or
                     group is degenerate)
        =========== ============================================================

    Raises
    ------
    ValueError
        If input arrays have inconsistent lengths.

    Examples
    --------
    >>> df = fairness_metrics_by_group(
    ...     y_true=y_test,
    ...     y_pred=y_pred,
    ...     y_pred_proba=y_pred_proba,
    ...     protected_attr=df_test["age_group"],
    ... )
    >>> print(df[["Group", "TPR", "FPR", "SelectionRate"]])
    """
    yt, yp, ypp, pa = _coerce_arrays(y_true, y_pred, y_pred_proba, protected_attr)

    groups = np.unique(pa)
    rows: list[dict[str, Any]] = []

    for group in groups:
        mask = pa == group
        group_size = int(mask.sum())

        if group_size < min_group_size:
            warnings.warn(
                f"fairness: group '{group}' has only {group_size} samples "
                f"(< min_group_size={min_group_size}). Metrics may be unreliable.",
                UserWarning,
                stacklevel=2,
            )

        yt_g = yt[mask]
        yp_g = yp[mask]
        base_rate   = float(yt_g.mean()) if group_size > 0 else float("nan")
        selection_rate = float(yp_g.mean()) if group_size > 0 else float("nan")
        accuracy    = float(accuracy_score(yt_g, yp_g)) if group_size > 0 else float("nan")

        # Confusion matrix components — handle degenerate groups gracefully
        if group_size > 0 and len(np.unique(yt_g)) > 1:
            tn, fp, fn, tp = confusion_matrix(yt_g, yp_g, labels=[0, 1]).ravel()
        else:
            # Degenerate: all same class — compute what we can
            pos = int(yt_g.sum())
            neg = group_size - pos
            if pos == 0:
                # All negatives — only TN and FP possible
                tn = int((yp_g == 0).sum())
                fp = int((yp_g == 1).sum())
                fn, tp = 0, 0
            else:
                # All positives — only TP and FN possible
                tp = int((yp_g == 1).sum())
                fn = int((yp_g == 0).sum())
                tn, fp = 0, 0

        tpr = _safe_divide(tp, tp + fn)      # Sensitivity / Recall
        fpr = _safe_divide(fp, fp + tn)      # Fall-out
        tnr = _safe_divide(tn, tn + fp)      # Specificity
        fnr = _safe_divide(fn, fn + tp)      # Miss Rate
        ppv = _safe_divide(tp, tp + fp)      # Precision
        npv = _safe_divide(tn, tn + fn)      # Neg. Predictive Value

        # AUC — only meaningful when group has both classes and proba is available
        auc: float | None = None
        if ypp is not None and len(np.unique(yt_g)) == 2:
            try:
                auc = round(float(roc_auc_score(yt_g, ypp[mask])), 4)
            except Exception:
                auc = None

        rows.append({
            "Group":         group,
            "Size":          group_size,
            "BaseRate":      round(base_rate, 4),
            "SelectionRate": round(selection_rate, 4),
            "Accuracy":      round(accuracy, 4),
            "TPR":           round(tpr, 4),
            "FPR":           round(fpr, 4),
            "TNR":           round(tnr, 4),
            "FNR":           round(fnr, 4),
            "PPV":           round(ppv, 4),
            "NPV":           round(npv, 4),
            "AUC":           auc,
        })

    df = pd.DataFrame(rows)
    # Sort groups deterministically (works for string or numeric group labels)
    try:
        df = df.sort_values("Group").reset_index(drop=True)
    except TypeError:
        df = df.reset_index(drop=True)

    return df


# ---------------------------------------------------------------------------
# Scalar fairness metrics
# ---------------------------------------------------------------------------

def disparate_impact(
    fairness_df: pd.DataFrame,
    rate_col: str = "SelectionRate",
    di_low: float = 0.8,
    di_high: float = 1.25,
) -> dict[str, Any]:
    """
    Compute disparate impact from a pre-built fairness metrics DataFrame.

    DI = min(selection_rate_per_group) / max(selection_rate_per_group).

    The 80 % rule (EEOC / Uniform Guidelines) considers DI ∈ [0.8, 1.25]
    acceptable.  Values outside this band suggest adverse impact.

    Parameters
    ----------
    fairness_df : pd.DataFrame
        Output of :func:`fairness_metrics_by_group`.
    rate_col : str
        Column to use for the DI calculation.  Defaults to ``SelectionRate``;
        can be swapped to ``TPR`` to compute the equal-opportunity ratio.
    di_low : float
        Lower bound of acceptable DI range (default 0.8).
    di_high : float
        Upper bound of acceptable DI range (default 1.25).

    Returns
    -------
    dict with keys:

    =============== ============================================================
    ratio           DI value (float)
    max_rate        Maximum selection rate (float)
    min_rate        Minimum selection rate (float)
    max_group       Group with highest selection rate (Any)
    min_group       Group with lowest selection rate (Any)
    passes          True if di_low ≤ ratio ≤ di_high (bool)
    di_low          The lower bound used (float)
    di_high         The upper bound used (float)
    =============== ============================================================
    """
    if rate_col not in fairness_df.columns:
        raise ValueError(
            f"Column '{rate_col}' not found in fairness_df. "
            f"Available: {list(fairness_df.columns)}"
        )

    rates = fairness_df[rate_col].astype(float)
    max_rate = float(rates.max())
    min_rate = float(rates.min())

    max_group = fairness_df.loc[rates.idxmax(), "Group"]
    min_group = fairness_df.loc[rates.idxmin(), "Group"]

    ratio = _safe_divide(min_rate, max_rate, fallback=float("nan"))

    return {
        "ratio":     round(ratio, 4),
        "max_rate":  round(max_rate, 4),
        "min_rate":  round(min_rate, 4),
        "max_group": max_group,
        "min_group": min_group,
        "passes":    di_low <= ratio <= di_high,
        "di_low":    di_low,
        "di_high":   di_high,
    }


def equal_opportunity_difference(fairness_df: pd.DataFrame) -> dict[str, Any]:
    """
    Compute the Equal Opportunity Difference (EOD) across groups.

    EOD = max(TPR) − min(TPR).

    A value of 0 means the model recalls true positives equally well for
    every group.  The closer to 0, the fairer the model on this metric.

    Parameters
    ----------
    fairness_df : pd.DataFrame
        Output of :func:`fairness_metrics_by_group`.

    Returns
    -------
    dict with keys:

    ============== ================================================
    eod            Scalar difference (float)
    max_tpr        Highest per-group TPR (float)
    min_tpr        Lowest per-group TPR (float)
    max_group      Group with highest TPR (Any)
    min_group      Group with lowest TPR (Any)
    ============== ================================================
    """
    tprs = fairness_df["TPR"].astype(float)
    max_idx = tprs.idxmax()
    min_idx = tprs.idxmin()

    return {
        "eod":       round(float(tprs.max() - tprs.min()), 4),
        "max_tpr":   round(float(tprs.max()), 4),
        "min_tpr":   round(float(tprs.min()), 4),
        "max_group": fairness_df.loc[max_idx, "Group"],
        "min_group": fairness_df.loc[min_idx, "Group"],
    }


def equalized_odds_difference(fairness_df: pd.DataFrame) -> dict[str, Any]:
    """
    Compute the Equalized Odds Difference (TPR parity + FPR parity).

    Equalized Odds requires *both* TPR and FPR to be equal across groups.
    This function returns the maximum gap for each rate separately.

    Parameters
    ----------
    fairness_df : pd.DataFrame
        Output of :func:`fairness_metrics_by_group`.

    Returns
    -------
    dict with keys:

    =============== ===========================================================
    tpr_difference  max(TPR) − min(TPR) across groups (float)
    fpr_difference  max(FPR) − min(FPR) across groups (float)
    max_eod         max(tpr_difference, fpr_difference) — headline scalar (float)
    equalized_odds_passes  True if both differences < 0.1 (common threshold)
    =============== ===========================================================
    """
    tpr_diff = float(fairness_df["TPR"].max() - fairness_df["TPR"].min())
    fpr_diff = float(fairness_df["FPR"].max() - fairness_df["FPR"].min())
    max_eod = max(tpr_diff, fpr_diff)

    return {
        "tpr_difference":          round(tpr_diff, 4),
        "fpr_difference":          round(fpr_diff, 4),
        "max_eod":                 round(max_eod, 4),
        "equalized_odds_passes":   max_eod < 0.1,   # common soft threshold
    }


def demographic_parity_difference(fairness_df: pd.DataFrame) -> dict[str, Any]:
    """
    Compute the Demographic Parity Difference across groups.

    Demographic Parity requires every group to have the same selection
    rate (predicted positive rate), regardless of true label.

    DPD = max(SelectionRate) − min(SelectionRate).

    Parameters
    ----------
    fairness_df : pd.DataFrame
        Output of :func:`fairness_metrics_by_group`.

    Returns
    -------
    dict with keys:

    ============= ============================================================
    dpd           Scalar difference (float)
    max_rate      Group with highest selection rate (float)
    min_rate      Group with lowest selection rate (float)
    max_group     Label of group with highest selection rate (Any)
    min_group     Label of group with lowest selection rate (Any)
    ============= ============================================================
    """
    rates = fairness_df["SelectionRate"].astype(float)
    return {
        "dpd":       round(float(rates.max() - rates.min()), 4),
        "max_rate":  round(float(rates.max()), 4),
        "min_rate":  round(float(rates.min()), 4),
        "max_group": fairness_df.loc[rates.idxmax(), "Group"],
        "min_group": fairness_df.loc[rates.idxmin(), "Group"],
    }


# ---------------------------------------------------------------------------
# One-shot convenience report
# ---------------------------------------------------------------------------

def fairness_report(
    y_true: Any,
    y_pred: Any,
    y_pred_proba: Any | None,
    protected_attr: Any,
    di_low: float = 0.8,
    di_high: float = 1.25,
    min_group_size: int = 10,
) -> dict[str, Any]:
    """
    Run a complete fairness audit in one call and return a structured report.

    Computes per-group metrics, disparate impact, equal opportunity difference,
    equalized odds difference, and demographic parity difference.

    Parameters
    ----------
    y_true : array-like of shape (n_samples,)
        Ground-truth binary labels (0 / 1).
    y_pred : array-like of shape (n_samples,)
        Thresholded binary predictions (0 / 1).
    y_pred_proba : array-like of shape (n_samples,) | None
        Predicted positive-class probabilities.
    protected_attr : array-like of shape (n_samples,)
        Group membership (any dtype).
    di_low : float
        Lower bound of acceptable disparate impact range (default 0.8).
    di_high : float
        Upper bound of acceptable disparate impact range (default 1.25).
    min_group_size : int
        Groups below this size get a reliability warning.

    Returns
    -------
    dict with keys:

    ======================== ===================================================
    metrics_df               pd.DataFrame from :func:`fairness_metrics_by_group`
    disparate_impact         dict from :func:`disparate_impact`
    equal_opportunity        dict from :func:`equal_opportunity_difference`
    equalized_odds           dict from :func:`equalized_odds_difference`
    demographic_parity       dict from :func:`demographic_parity_difference`
    overall_passes           True only if all fairness checks pass (bool)
    ======================== ===================================================

    Example
    -------
    >>> report = fairness_report(
    ...     y_true=y_test,
    ...     y_pred=y_pred,
    ...     y_pred_proba=y_pred_proba,
    ...     protected_attr=df_test["income_bracket"],
    ...     di_low=0.8,
    ...     di_high=1.25,
    ... )
    >>> report["disparate_impact"]["ratio"]
    0.8743
    >>> report["overall_passes"]
    True
    """
    metrics_df = fairness_metrics_by_group(
        y_true, y_pred, y_pred_proba, protected_attr, min_group_size=min_group_size
    )

    di  = disparate_impact(metrics_df, di_low=di_low, di_high=di_high)
    eod = equal_opportunity_difference(metrics_df)
    eq_odds = equalized_odds_difference(metrics_df)
    dp  = demographic_parity_difference(metrics_df)

    overall_passes = di["passes"] and eq_odds["equalized_odds_passes"]

    return {
        "metrics_df":         metrics_df,
        "disparate_impact":   di,
        "equal_opportunity":  eod,
        "equalized_odds":     eq_odds,
        "demographic_parity": dp,
        "overall_passes":     overall_passes,
    }


# ---------------------------------------------------------------------------
# Pretty-print helpers (no matplotlib dependency)
# ---------------------------------------------------------------------------

def print_fairness_report(report: dict[str, Any], title: str = "Fairness Audit") -> None:
    """
    Print a human-readable fairness audit summary to stdout.

    Parameters
    ----------
    report : dict
        Output of :func:`fairness_report`.
    title : str
        Section header.
    """
    sep = "=" * 70

    print(f"\n[FAIRNESS] {title}")
    print(sep)

    # Per-group table
    print("\nPer-Group Metrics:")
    df = report["metrics_df"]
    print(df.to_string(index=False))

    # Disparate Impact
    di = report["disparate_impact"]
    status = "PASS" if di["passes"] else "FAIL"
    print(f"\n{sep}")
    print(f"Disparate Impact ({di['di_low']:.2f}-{di['di_high']:.2f} rule):  "
          f"{di['ratio']:.4f}  ->  {status}")
    print(f"  Most-selected group : {di['max_group']}  ({di['max_rate']:.2%})")
    print(f"  Least-selected group: {di['min_group']}  ({di['min_rate']:.2%})")

    # Equal Opportunity
    eod = report["equal_opportunity"]
    print(f"\nEqual Opportunity Difference:      {eod['eod']:.4f}")
    print(f"  Highest TPR: {eod['max_group']}  ({eod['max_tpr']:.4f})")
    print(f"  Lowest  TPR: {eod['min_group']}  ({eod['min_tpr']:.4f})")

    # Equalized Odds
    eq_odds = report["equalized_odds"]
    eo_status = "PASS" if eq_odds["equalized_odds_passes"] else "FAIL"
    print(f"\nEqualized Odds (max EOD < 0.10):  "
          f"TPR-diff={eq_odds['tpr_difference']:.4f}, "
          f"FPR-diff={eq_odds['fpr_difference']:.4f}  ->  {eo_status}")

    # Demographic Parity
    dp = report["demographic_parity"]
    print(f"\nDemographic Parity Difference:     {dp['dpd']:.4f}")

    # Headline
    headline = "[OK] ALL CHECKS PASS" if report["overall_passes"] else "[WARN] BIAS MITIGATION RECOMMENDED"
    print(f"\n{sep}")
    print(f"Overall:  {headline}")
    print(sep)
