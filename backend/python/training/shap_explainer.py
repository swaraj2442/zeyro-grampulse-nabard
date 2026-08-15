"""SHAP explainability helpers — global and local contributions.

Global SHAP:
    Mean |SHAP| per feature across a sample of observations.
    Answers: "Which features matter most to this model overall?"

Local SHAP:
    Per-observation SHAP values showing exactly how each feature
    pushed a single prediction up or down.
    Answers: "Why did this specific borrower get this score?"

Usage:
    from training.shap_explainer import (
        compute_shap,
        global_shap_importance,
        local_shap_contributions,
        shap_adverse_codes,
    )

    explainer, shap_vals = compute_shap(model, X_val_sample)
    global_imp  = global_shap_importance(shap_vals, feature_names)
    local_contribs = local_shap_contributions(shap_vals, X_val_sample, feature_names, n_samples=5)
"""

from __future__ import annotations

import numpy as np
import pandas as pd
from typing import Any


# ---------------------------------------------------------------------------
# Core SHAP computation
# ---------------------------------------------------------------------------

def compute_shap(
    model,
    X: pd.DataFrame,
) -> tuple:
    """
    Compute SHAP values using TreeExplainer (exact, fast for tree models).

    Args:
        model: Trained XGBClassifier or XGBRegressor.
        X: Feature DataFrame — same columns used at training time.

    Returns:
        Tuple of (shap.TreeExplainer, np.ndarray of shape [n_samples, n_features]).
        Binary classifiers: returns positive-class SHAP values only.
    """
    try:
        import shap
    except ImportError as exc:
        raise ImportError("shap is required. pip install shap") from exc

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)

    # Normalise: multi-class or older shap returns list[class_0, class_1, ...]
    if isinstance(shap_values, list):
        shap_values = shap_values[1]  # positive class

    return explainer, np.asarray(shap_values)


# ---------------------------------------------------------------------------
# Global SHAP — population-level feature importance
# ---------------------------------------------------------------------------

def global_shap_importance(
    shap_values: np.ndarray,
    feature_names: list[str],
    feature_to_reason: dict[str, str] | None = None,
    top_n: int | None = None,
) -> list[dict[str, Any]]:
    """
    Mean absolute SHAP per feature, ranked descending.

    This is the canonical global feature importance for tree models —
    more reliable than XGBoost's built-in gain/cover importance because
    it accounts for interaction effects and is measured in prediction units.

    Args:
        shap_values: 2-D array [n_samples, n_features].
        feature_names: Feature column names in matching order.
        feature_to_reason: Optional mapping of feature names to human-readable reasons.
        top_n: If set, return only the top N features.

    Returns:
        List of dicts: [{"feature": name, "mean_shap": float, "reason": str|None}]
    """
    mean_abs = np.abs(shap_values).mean(axis=0)
    ranked = sorted(zip(feature_names, mean_abs), key=lambda x: x[1], reverse=True)
    if top_n is not None:
        ranked = ranked[:top_n]
        
    feature_to_reason = feature_to_reason or {}
    
    return [
        {
            "feature": name,
            "mean_shap": round(float(val), 6),
            "reason": feature_to_reason.get(name),
        }
        for name, val in ranked
    ]


# ---------------------------------------------------------------------------
# Local SHAP — per-observation contributions
# ---------------------------------------------------------------------------

def local_shap_contributions(
    shap_values: np.ndarray,
    X: pd.DataFrame,
    feature_names: list[str],
    n_samples: int = 5,
    sample_indices: list[int] | None = None,
) -> list[dict]:
    """
    Per-observation SHAP breakdown for a set of sample rows.

    Each returned dict shows how much each feature pushed the prediction
    higher (positive SHAP) or lower (negative SHAP) relative to the
    model's base rate.

    Args:
        shap_values: 2-D array [n_samples, n_features].
        X: Feature DataFrame (same rows as shap_values).
        feature_names: Feature column names.
        n_samples: How many sample rows to return (ignored if sample_indices set).
        sample_indices: Explicit row indices to explain (overrides n_samples).

    Returns:
        List of dicts, one per observation:
          {
            "row_index": int,
            "feature_values": {feature: raw_value, ...},
            "shap_contributions": {feature: shap_value, ...},  # sorted by |shap|
            "top_positive_drivers": [feature, ...],  # pushed risk UP
            "top_negative_drivers": [feature, ...],  # pushed risk DOWN
          }
    """
    indices = sample_indices if sample_indices is not None else list(range(min(n_samples, len(X))))
    X_arr = X.values if isinstance(X, pd.DataFrame) else X
    results = []

    for idx in indices:
        obs_shap = shap_values[idx]  # 1-D array of shap values
        obs_feat = X_arr[idx]        # 1-D array of raw feature values

        # Sort features by absolute SHAP descending
        ranked = sorted(
            zip(feature_names, obs_shap, obs_feat),
            key=lambda t: abs(t[1]),
            reverse=True,
        )

        results.append({
            "row_index": idx,
            "feature_values": {
                name: round(float(val), 6) for name, _, val in ranked
            },
            "shap_contributions": {
                name: round(float(shap_v), 6) for name, shap_v, _ in ranked
            },
            "top_positive_drivers": [
                name for name, shap_v, _ in ranked if shap_v > 0
            ][:3],
            "top_negative_drivers": [
                name for name, shap_v, _ in ranked if shap_v < 0
            ][:3],
        })

    return results


def single_observation_shap(
    shap_values: np.ndarray,
    X: pd.DataFrame,
    feature_names: list[str],
    idx: int = 0,
) -> dict:
    """
    SHAP breakdown for a single observation. Convenience wrapper.

    Args:
        shap_values: 2-D array [n_samples, n_features].
        X: Feature DataFrame.
        feature_names: Feature column names.
        idx: Row index to explain.

    Returns:
        Single contribution dict (same schema as local_shap_contributions items).
    """
    return local_shap_contributions(
        shap_values, X, feature_names, sample_indices=[idx]
    )[0]


# ---------------------------------------------------------------------------
# Adverse action codes from SHAP
# ---------------------------------------------------------------------------

def shap_adverse_codes(
    obs_shap: np.ndarray,
    feature_names: list[str],
    feature_to_code: dict[str, str],
    top_n: int = 3,
) -> list[str]:
    """
    Derive adverse action codes for one prediction from its SHAP values.

    Features with positive SHAP (pushing predicted default probability up)
    are the drivers of a decline.

    Args:
        obs_shap: 1-D SHAP array for a single observation.
        feature_names: Feature column names.
        feature_to_code: Mapping feature_name → adverse action code string.
        top_n: Number of codes to return.

    Returns:
        List of adverse action code strings, worst-first.
    """
    positive = sorted(
        [(feat, val) for feat, val in zip(feature_names, obs_shap) if val > 0],
        key=lambda x: x[1],
        reverse=True,
    )
    codes: list[str] = []
    for feat, _ in positive[:top_n]:
        code = feature_to_code.get(feat)
        if code and code not in codes:
            codes.append(code)
    return codes


# ---------------------------------------------------------------------------
# Jupyter Notebook Visualization Wrappers
# ---------------------------------------------------------------------------

def plot_waterfall(explainer, shap_values: np.ndarray, X: pd.DataFrame, idx: int = 0):
    """Render a SHAP waterfall plot for a specific observation."""
    import shap
    import matplotlib.pyplot as plt
    
    # SHAP's waterfall plot expects an Explanation object. 
    # We construct one on the fly for this specific row.
    exp = shap.Explanation(
        values=shap_values[idx],
        base_values=explainer.expected_value,
        data=X.iloc[idx].values,
        feature_names=X.columns.tolist()
    )
    shap.plots.waterfall(exp)
    plt.show()

def init_notebook_js():
    """Initialise JS for interactive SHAP plots (Force plots)."""
    import shap
    shap.initjs()

def plot_force(explainer, shap_values: np.ndarray, X: pd.DataFrame, idx: int = 0):
    """Render an interactive force plot for a single observation."""
    import shap
    return shap.force_plot(
        explainer.expected_value, 
        shap_values[idx], 
        X.iloc[idx, :], 
        matplotlib=False
    )

def plot_stacked_force(explainer, shap_values: np.ndarray, X: pd.DataFrame, limit: int = 100):
    """Render a stacked force plot for multiple observations."""
    import shap
    n = min(limit, len(X))
    return shap.force_plot(
        explainer.expected_value, 
        shap_values[:n], 
        X.iloc[:n, :], 
        matplotlib=False
    )

def plot_summary(shap_values: np.ndarray, X: pd.DataFrame, plot_type: str = "dot"):
    """
    Render a summary plot (dot or bar).
    plot_type: 'dot' for standard impact view, 'bar' for mean absolute impact.
    """
    import shap
    import matplotlib.pyplot as plt
    shap.summary_plot(shap_values, X, plot_type=plot_type)
    plt.show()

def plot_dependence(shap_values: np.ndarray, X: pd.DataFrame, feature_name: str):
    """Render a dependence plot for a specific feature to show interactions."""
    import shap
    import matplotlib.pyplot as plt
    shap.dependence_plot(feature_name, shap_values, X)
    plt.show()


# ---------------------------------------------------------------------------
# Confusion Matrix Visualisations
# ---------------------------------------------------------------------------

def plot_confusion_matrix(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    labels: list[str] | None = None,
    title: str = "Confusion Matrix (Raw Counts)",
    ax=None,
    cmap: str = "Blues",
    annot_fontsize: int = 12,
) -> None:
    """
    Plot a raw-count confusion matrix as a seaborn heatmap.

    Parameters
    ----------
    y_true : array-like
        Ground-truth binary (or multi-class) labels.
    y_pred : array-like
        Predicted labels at a given threshold.
    labels : list[str] | None
        Human-readable class names, e.g. ["No Default", "Default"].
        Inferred from unique sorted values if omitted.
    title : str
        Axes title.
    ax : matplotlib.axes.Axes | None
        Existing axes to draw on.  A new figure/axes is created if None.
    cmap : str
        Matplotlib / seaborn colour map.
    annot_fontsize : int
        Font size for cell annotations.
    """
    import matplotlib.pyplot as plt
    import seaborn as sns
    from sklearn.metrics import confusion_matrix as _cm

    cm = _cm(y_true, y_pred)
    unique_classes = sorted(np.unique(np.concatenate([y_true, y_pred])))
    tick_labels = labels if labels is not None else [str(c) for c in unique_classes]

    created_fig = ax is None
    if created_fig:
        _, ax = plt.subplots(figsize=(6, 5))

    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap=cmap,
        ax=ax,
        xticklabels=tick_labels,
        yticklabels=tick_labels,
        annot_kws={"size": annot_fontsize},
        linewidths=0.5,
        linecolor="white",
    )
    ax.set_title(title, fontweight="bold", pad=12)
    ax.set_ylabel("Actual", fontweight="bold")
    ax.set_xlabel("Predicted", fontweight="bold")

    if created_fig:
        plt.tight_layout()
        plt.show()


def plot_confusion_matrix_normalized(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    labels: list[str] | None = None,
    title: str = "Confusion Matrix (Row-Normalised)",
    ax=None,
    cmap: str = "Blues",
    annot_fontsize: int = 12,
) -> None:
    """
    Plot a row-normalised confusion matrix as a seaborn heatmap.

    Each row is divided by the row total so the colour scale reflects
    per-class recall, making class-imbalance effects immediately visible.

    Parameters
    ----------
    y_true : array-like
        Ground-truth binary (or multi-class) labels.
    y_pred : array-like
        Predicted labels at a given threshold.
    labels : list[str] | None
        Human-readable class names.  Inferred from data if omitted.
    title : str
        Axes title.
    ax : matplotlib.axes.Axes | None
        Existing axes to draw on.  A new figure is created if None.
    cmap : str
        Matplotlib / seaborn colour map.
    annot_fontsize : int
        Font size for cell annotations.
    """
    import matplotlib.pyplot as plt
    import seaborn as sns
    from sklearn.metrics import confusion_matrix as _cm

    cm = _cm(y_true, y_pred)
    row_sums = cm.sum(axis=1, keepdims=True)
    # Avoid division by zero for degenerate groups
    cm_norm = np.where(row_sums > 0, cm.astype(float) / row_sums, 0.0)

    unique_classes = sorted(np.unique(np.concatenate([y_true, y_pred])))
    tick_labels = labels if labels is not None else [str(c) for c in unique_classes]

    created_fig = ax is None
    if created_fig:
        _, ax = plt.subplots(figsize=(6, 5))

    sns.heatmap(
        cm_norm,
        annot=True,
        fmt=".1%",
        cmap=cmap,
        ax=ax,
        xticklabels=tick_labels,
        yticklabels=tick_labels,
        vmin=0.0,
        vmax=1.0,
        annot_kws={"size": annot_fontsize},
        linewidths=0.5,
        linecolor="white",
    )
    ax.set_title(title, fontweight="bold", pad=12)
    ax.set_ylabel("Actual", fontweight="bold")
    ax.set_xlabel("Predicted", fontweight="bold")

    if created_fig:
        plt.tight_layout()
        plt.show()


def plot_confusion_matrix_pair(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    labels: list[str] | None = None,
    title_raw: str = "Confusion Matrix (Raw Counts)",
    title_norm: str = "Confusion Matrix (Row-Normalised)",
    figsize: tuple[int, int] = (14, 5),
    cmap: str = "Blues",
    suptitle: str | None = None,
) -> None:
    """
    Side-by-side raw-count and row-normalised confusion matrices.

    Convenience wrapper around :func:`plot_confusion_matrix` and
    :func:`plot_confusion_matrix_normalized`.  Infers class labels from
    ``y_true``/``y_pred`` when ``labels`` is omitted — no hardcoded names.

    Parameters
    ----------
    y_true : array-like
        Ground-truth binary (or multi-class) labels.
    y_pred : array-like
        Predicted labels at a given threshold.
    labels : list[str] | None
        Human-readable class names.  Inferred from data if omitted.
    title_raw : str
        Title for the raw-count panel.
    title_norm : str
        Title for the normalised panel.
    figsize : tuple[int, int]
        Overall figure size (width, height) in inches.
    cmap : str
        Matplotlib / seaborn colour map for both panels.
    suptitle : str | None
        Optional figure-level super-title.

    Example
    -------
    >>> from training.shap_explainer import plot_confusion_matrix_pair
    >>> plot_confusion_matrix_pair(
    ...     y_test, y_pred,
    ...     labels=["No Default", "Default"],
    ...     suptitle="XGBoost — Test Set",
    ... )
    """
    import matplotlib.pyplot as plt

    fig, axes = plt.subplots(1, 2, figsize=figsize)

    if suptitle:
        fig.suptitle(suptitle, fontsize=14, fontweight="bold", y=1.02)

    plot_confusion_matrix(
        y_true, y_pred,
        labels=labels, title=title_raw, ax=axes[0], cmap=cmap,
    )
    plot_confusion_matrix_normalized(
        y_true, y_pred,
        labels=labels, title=title_norm, ax=axes[1], cmap=cmap,
    )

    plt.tight_layout()
    plt.show()
