"""RPS post-hoc calibration script.

Run this AFTER real loan outcomes are available — not at training time.

The RPS model outputs P(default). Calibration ensures that the model's
predicted probability matches the actual observed default rate per decile,
so that P(default) = 0.20 truly means ~20% of those borrowers defaulted.

Usage from a notebook:

    from training.calibrate_rps import run as calibrate_rps

    result = calibrate_rps(
        df_outcomes=df,
        model_run_name="rps_v1",
        cal_run_name="rps_v1_cal_2026q3",
        method="isotonic",
    )

Outputs written to:
    artifacts/rps/<cal_run_name>/
        calibrator.pkl
        calibration_metrics.json
        reliability_diagram.json
"""

from __future__ import annotations

import json
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from xgboost import XGBClassifier

from .calibration import (
    calibration_passes,
    fit_calibrator,
    reliability_diagram,
)
from .features import RPS_FEATURES, RPS_TARGET, prepare_features
from .validation import classification_metrics

ARTIFACT_ROOT = Path(__file__).parent.parent.parent / "artifacts" / "rps"


def run(
    df_outcomes: pd.DataFrame,
    model_run_name: str,
    cal_run_name: str,
    method: str = "isotonic",
    artifact_dir: Path | None = None,
) -> dict:
    """
    Fit a calibrator on top of an existing trained RPS model using real outcomes.

    Args:
        df_outcomes: DataFrame with RPS_FEATURES + RPS_TARGET (observed outcomes).
                     Records must have fully resolved — the 90-day window elapsed
                     and the default label confirmed.
        model_run_name: Run name of the previously trained model to load.
        cal_run_name: Name for this calibration run's output directory.
        method: "isotonic" or "sigmoid".
        artifact_dir: Override artifact root.

    Returns:
        Dict with calibrator path, before/after metrics, gate result.

    Raises:
        FileNotFoundError: If the base model artefact does not exist.
    """
    root = artifact_dir or ARTIFACT_ROOT
    model_path = root / model_run_name / "model.json"

    if not model_path.exists():
        raise FileNotFoundError(
            f"No trained model found at {model_path}. "
            f"Run train_rps.run(..., run_name='{model_run_name}') first."
        )

    out_dir = root / cal_run_name
    out_dir.mkdir(parents=True, exist_ok=True)

    # ------------------------------------------------------------------
    # 1. Load base model
    # ------------------------------------------------------------------
    model = XGBClassifier()
    model.load_model(str(model_path))
    print(f"[RPS-CAL] Loaded model from {model_path}")

    # ------------------------------------------------------------------
    # 2. Prepare features and observed labels
    # ------------------------------------------------------------------
    X = prepare_features(df_outcomes, RPS_FEATURES)
    y = np.asarray(df_outcomes[RPS_TARGET], dtype=np.int32)

    print(f"[RPS-CAL] Calibrating on {len(X)} resolved outcomes "
          f"(default rate: {float(np.mean(y)):.2%})")

    # ------------------------------------------------------------------
    # 3. Metrics BEFORE calibration
    # ------------------------------------------------------------------
    prob_raw = model.predict_proba(X)[:, 1]
    metrics_before = classification_metrics(y, prob_raw, label="rps_pre_cal")
    diag_before = reliability_diagram(y, prob_raw)
    print(f"[RPS-CAL] Metrics before calibration: {metrics_before}")

    # ------------------------------------------------------------------
    # 4. Fit calibrator
    # ------------------------------------------------------------------
    calibrator = fit_calibrator(model, X, y, method=method)
    prob_cal = calibrator.predict_proba(X)[:, 1]

    # ------------------------------------------------------------------
    # 5. Metrics AFTER calibration
    # ------------------------------------------------------------------
    metrics_after = classification_metrics(y, prob_cal, label="rps_post_cal")
    diag_after = reliability_diagram(y, prob_cal)
    passed = calibration_passes(y, prob_cal)

    print(f"[RPS-CAL] Metrics after calibration: {metrics_after}")
    print(f"[RPS-CAL] Max decile deviation: {diag_after['max_deviation']} "
          f"— {'✅ PASS' if passed else '❌ FAIL'}")

    # ------------------------------------------------------------------
    # 6. Persist
    # ------------------------------------------------------------------
    cal_path = out_dir / "calibrator.pkl"
    cal_metrics_path = out_dir / "calibration_metrics.json"
    diag_path = out_dir / "reliability_diagram.json"

    with open(cal_path, "wb") as f:
        pickle.dump(calibrator, f)

    cal_metrics = {
        "base_model_run": model_run_name,
        "calibration_method": method,
        "n_outcomes": len(X),
        "observed_default_rate": round(float(y.mean()), 4),
        "before": metrics_before,
        "after": metrics_after,
        "gate_passed": passed,
    }
    cal_metrics_path.write_text(json.dumps(cal_metrics, indent=2))
    diag_path.write_text(json.dumps({"before": diag_before, "after": diag_after}, indent=2))

    print(f"[RPS-CAL] Artefacts written to: {out_dir}")

    return {
        "cal_run_name": cal_run_name,
        "calibrator_path": str(cal_path),
        "metrics": cal_metrics,
        "gate_passed": passed,
    }
