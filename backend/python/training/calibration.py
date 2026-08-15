"""Probability calibration layer for XGBoost classifiers.

XGBoost is already reasonably well calibrated, but for regulated lending:
  - Regulators expect probabilities to match observed default rates per decile
  - The Brier score must fall below 0.15

This module wraps scikit-learn's CalibratedClassifierCV and exposes a
simple interface:

    calibrator = fit_calibrator(model, X_cal, y_cal, method="isotonic")
    calibrated_proba = calibrate(calibrator, X_new)

Two calibration methods:
  - "isotonic"  → Isotonic regression (non-parametric, needs ~1k+ samples)
  - "sigmoid"   → Platt scaling (parametric, works with smaller hold-out sets)
"""

from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.base import BaseEstimator


def fit_calibrator(
    base_model: BaseEstimator,
    X_cal: pd.DataFrame,
    y_cal: np.ndarray,
    method: str = "isotonic",
    cv: str = "prefit",
) -> CalibratedClassifierCV:
    """
    Fit a calibration wrapper around an already-trained XGBoost model.

    The calibration data (X_cal, y_cal) should be a *held-out* split that
    was NOT used during XGBoost training or evaluation — typically 10-15% of
    the overall dataset.

    Args:
        base_model: Trained XGBClassifier (with prefit=True, so cv="prefit").
        X_cal: Calibration feature DataFrame.
        y_cal: Binary calibration labels.
        method: "isotonic" or "sigmoid".
        cv: "prefit" means the base_model is already trained.

    Returns:
        Fitted CalibratedClassifierCV that wraps base_model.
    """
    calibrator = CalibratedClassifierCV(base_model, method=method, cv=cv)
    calibrator.fit(X_cal, y_cal)
    return calibrator


def calibrate(
    calibrator: CalibratedClassifierCV,
    X: pd.DataFrame,
) -> np.ndarray:
    """
    Return calibrated positive-class probabilities.

    Args:
        calibrator: Fitted CalibratedClassifierCV.
        X: Feature DataFrame.

    Returns:
        1-D array of calibrated P(default) values in [0, 1].
    """
    return calibrator.predict_proba(X)[:, 1]


def reliability_diagram(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    n_bins: int = 10,
) -> dict:
    """
    Compute reliability diagram data (predicted vs actual rates per bin).

    Returns:
        Dict with keys:
          "fraction_of_positives": observed default rate per bin
          "mean_predicted_value":  mean predicted probability per bin
          "max_deviation":         worst abs(predicted - actual) across bins
    """
    frac_pos, mean_pred = calibration_curve(y_true, y_prob, n_bins=n_bins)
    max_dev = round(float(np.abs(frac_pos - mean_pred).max()), 4)

    return {
        "fraction_of_positives": frac_pos.tolist(),
        "mean_predicted_value": mean_pred.tolist(),
        "max_deviation": max_dev,
    }


def calibration_passes(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    max_deviation_threshold: float = 0.03,
    n_bins: int = 10,
) -> bool:
    """
    Gate check: passes if no bin deviates more than `max_deviation_threshold`.

    The BFS_MODEL_PLAN.md specifies ±3% per decile as the acceptance criterion.

    Args:
        y_true: Binary labels.
        y_prob: Predicted (calibrated) probabilities.
        max_deviation_threshold: Acceptable max abs deviation (default 0.03 = 3%).
        n_bins: Number of calibration bins.

    Returns:
        True if calibration is within tolerance.
    """
    diag = reliability_diagram(y_true, y_prob, n_bins=n_bins)
    return diag["max_deviation"] <= max_deviation_threshold
