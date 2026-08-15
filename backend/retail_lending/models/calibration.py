"""Probability Calibration Module.

Uses Isotonic Regression to calibrate XGBoost probability outputs, ensuring
the Expected Conversion Probability is statistically meaningful.
"""

import numpy as np
from sklearn.isotonic import IsotonicRegression
from sklearn.metrics import brier_score_loss

class ProbabilityCalibrator:
    def __init__(self):
        self.calibrator = IsotonicRegression(out_of_bounds='clip')

    def fit(self, raw_probas: np.ndarray, y_true: np.ndarray):
        """Fit the isotonic regressor on validation probabilities."""
        self.calibrator.fit(raw_probas, y_true)
        
        calibrated = self.calibrator.predict(raw_probas)
        brier_before = brier_score_loss(y_true, raw_probas)
        brier_after = brier_score_loss(y_true, calibrated)
        
        return {
            "brier_uncalibrated": brier_before,
            "brier_calibrated": brier_after,
            "brier_improvement_pct": ((brier_before - brier_after) / brier_before) * 100
        }

    def calibrate(self, raw_prob: float) -> float:
        """Convert a raw model probability into a calibrated likelihood."""
        return float(self.calibrator.predict([raw_prob])[0])
