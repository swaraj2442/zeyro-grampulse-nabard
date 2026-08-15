"""Shared validation helpers for all trained models.

Metrics returned:
  Classification:
    - AUC-ROC
    - KS statistic (scipy vectorised)
    - Gini (= 2*AUC - 1)
    - Brier score
    - H-statistic
    - Accuracy, Precision, Recall, F1 (at configurable threshold)
    - TP, TN, FP, FN (confusion matrix decomposition)
  Population:
    - PSI
  Fairness:
    - Per-group AUC

All functions are pure: arrays in, dicts out. No side-effects, no I/O.
"""

from __future__ import annotations

import numpy as np
from typing import cast
from scipy.stats import ks_2samp
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    brier_score_loss,
    confusion_matrix,
    f1_score,
    log_loss,
    precision_score,
    recall_score,
    roc_auc_score,
)
from hmeasure import h_score


# ---------------------------------------------------------------------------
# Classification — core probabilistic metrics
# ---------------------------------------------------------------------------

def ks_statistic(y_true: np.ndarray, y_prob: np.ndarray) -> float:
    """
    KS separation between positive and negative score distributions.
    Uses scipy.stats.ks_2samp — vectorised, O(n log n).
    """
    scores_pos = y_prob[y_true == 1]
    scores_neg = y_prob[y_true == 0]
    if len(scores_pos) == 0 or len(scores_neg) == 0:
        return 0.0
    
    ks_result = ks_2samp(scores_pos, scores_neg)
    ks_val = cast(float, getattr(ks_result, "statistic", ks_result[0])) # type: ignore
    return round(ks_val, 4)


def gini(auc: float) -> float:
    return round(2.0 * auc - 1.0, 4)


# ---------------------------------------------------------------------------
# Classification — threshold-dependent metrics
# ---------------------------------------------------------------------------

def confusion_components(
    y_true: np.ndarray,
    y_pred_binary: np.ndarray,
) -> dict[str, int]:
    """
    Decompose the confusion matrix into TP, TN, FP, FN.

    Args:
        y_true: Binary ground-truth labels.
        y_pred_binary: Thresholded binary predictions.

    Returns:
        Dict with keys: tp, tn, fp, fn.
    """
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred_binary, labels=[0, 1]).ravel()
    return {
        "tp": int(tp),
        "tn": int(tn),
        "fp": int(fp),
        "fn": int(fn),
    }


def classification_metrics(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    label: str = "model",
    threshold: float = 0.5,
) -> dict:
    """
    Full classification evaluation suite — probabilistic + threshold metrics.

    Args:
        y_true: Binary ground-truth labels (0/1).
        y_prob: Predicted positive-class probabilities.
        label: Human-readable model identifier.
        threshold: Decision threshold for binary classification metrics.

    Returns:
        Dict containing:
          Probabilistic: auc, ks, gini, brier, average_precision
          Threshold-based (at `threshold`): accuracy, precision, recall, f1,
                                            tp, tn, fp, fn
    """
    y_pred = (y_prob >= threshold).astype(int)
    cm = confusion_components(y_true, y_pred)

    if len(np.unique(y_true)) < 2:
        return {
            "model": label,
            "threshold": threshold,
            "auc": 0.5,
            "ks": 0.0,
            "gini": 0.0,
            "brier": 0.0,
            "log_loss": 0.0,
            "average_precision": 0.0,
            "h_score": 0.0,
            "accuracy": round(float(accuracy_score(y_true, y_pred)), 4) if len(y_true) > 0 else 0.0,
            "precision": 0.0,
            "recall": 0.0,
            "f1": 0.0,
            **cm,
        }

    auc = round(float(roc_auc_score(y_true, y_prob)), 4)
    ks = ks_statistic(y_true, y_prob)
    brier = round(float(brier_score_loss(y_true, y_prob)), 4)
    lloss = round(float(log_loss(y_true, y_prob)), 4)
    avg_prec = round(float(average_precision_score(y_true, y_prob)), 4)
    try:
        h_stat = round(float(h_score(y_true, y_prob)), 4)
    except Exception:
        h_stat = 0.0

    return {
        "model": label,
        "threshold": threshold,
        # --- Probabilistic (threshold-independent) ---
        "auc": auc,
        "ks": ks,
        "gini": gini(auc),
        "brier": brier,
        "log_loss": lloss,
        "average_precision": avg_prec,
        "h_score": h_stat,
        # --- Threshold-based ---
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
        "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 4), # type: ignore
        "recall": round(float(recall_score(y_true, y_pred, zero_division=0)), 4), # type: ignore
        "f1": round(float(f1_score(y_true, y_pred, zero_division=0)), 4), # type: ignore
        # --- Confusion matrix ---
        **cm,
    }


# ---------------------------------------------------------------------------
# Population Stability Index
# ---------------------------------------------------------------------------

def psi(
    reference: np.ndarray,
    current: np.ndarray,
    n_bins: int = 10,
    eps: float = 1e-6,
) -> float:
    """
    Compute PSI between a reference and current score distribution.

    Thresholds:
        PSI < 0.10  → stable
        0.10–0.20   → warn
        > 0.20      → retrain

    Args:
        reference: Baseline score distribution (training period).
        current: Current score distribution (production period).
        n_bins: Number of equal-width bins.
        eps: Epsilon to prevent log(0).

    Returns:
        PSI float.
    """
    min_val = min(reference.min(), current.min())
    max_val = max(reference.max(), current.max())
    bins = np.linspace(min_val, max_val, n_bins + 1)

    ref_pct = (np.histogram(reference, bins=bins)[0] / len(reference)) + eps
    cur_pct = (np.histogram(current, bins=bins)[0] / len(current)) + eps

    return round(float(np.sum((cur_pct - ref_pct) * np.log(cur_pct / ref_pct))), 4)


# ---------------------------------------------------------------------------
# Fairness audit
# ---------------------------------------------------------------------------

def auc_by_group(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    groups: np.ndarray,
) -> dict[str, float]:
    """
    Per-group AUC to surface potential discriminatory patterns.

    Args:
        y_true: Binary labels.
        y_prob: Predicted probabilities.
        groups: Group membership array (e.g., income quartile).

    Returns:
        Dict: group_label → AUC.
    """
    result: dict[str, float] = {}
    for g in np.unique(groups):
        mask = groups == g
        if y_true[mask].sum() in (0, mask.sum()):
            continue  # degenerate group — skip
        result[str(g)] = round(float(roc_auc_score(y_true[mask], y_prob[mask])), 4)
    return result
