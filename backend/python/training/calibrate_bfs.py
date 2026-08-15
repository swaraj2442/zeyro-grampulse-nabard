"""BFS post-hoc calibration script.

Run this AFTER real loan outcomes are available — not at training time.

Calibration corrects for the gap between the model's predicted P(default)
and the actual observed default rates per score decile. It requires a labelled
dataset of predictions that have since resolved:

    df_outcomes:
        - All columns from BFS_FEATURES (same feature vector used at scoring time)
        - `defaulted_within_90d`  ← the actual observed outcome (0 or 1)

Usage from a notebook:

    from training.calibrate_bfs import run as calibrate_bfs

    result = calibrate_bfs(
        df_outcomes=df,           # resolved outcome data
        model_run_name="bfs_v1", # which trained model to calibrate against
        cal_run_name="bfs_v1_cal_2026q3",
        method="isotonic",
    )

Outputs written to:
    artifacts/bfs/<cal_run_name>/
        calibrator.pkl         ← fitted CalibratedClassifierCV
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
from .features import BFS_FEATURES, BFS_TARGET, prepare_features
from .validation import classification_metrics

ARTIFACT_ROOT = Path(__file__).parent.parent.parent / "artifacts" / "bfs"


def run(
    df_outcomes: pd.DataFrame,
    model_run_name: str,
    cal_run_name: str,
    method: str = "isotonic",
    artifact_dir: Path | None = None,
) -> dict:
    """
    Fit a calibrator on top of an existing trained BFS model using real outcomes.

    Args:
        df_outcomes: DataFrame with BFS_FEATURES + BFS_TARGET (observed outcomes).
                     These must be records that have fully resolved — i.e., the
                     90-day window has elapsed and the default label is confirmed.
        model_run_name: The run_name of the previously trained model to load
                        (e.g. "bfs_v1"). Must exist under the artifact root.
        cal_run_name: Name for this calibration run's output directory.
        method: "isotonic" (non-parametric, needs ~1k+ samples) or
                "sigmoid" (Platt scaling, works with smaller datasets).
        artifact_dir: Override artifact root.

    Returns:
        Dict with calibrator path, metrics before/after, and gate result.

    Raises:
        FileNotFoundError: If the base model artefact does not exist.
    """
    root = artifact_dir or ARTIFACT_ROOT
    model_path = root / model_run_name / "model.json"

    if not model_path.exists():
        raise FileNotFoundError(
            f"No trained model found at {model_path}. "
            f"Run train_bfs.run(..., run_name='{model_run_name}') first."
        )

    out_dir = root / cal_run_name
    out_dir.mkdir(parents=True, exist_ok=True)

    # ------------------------------------------------------------------
    # 1. Load the trained base model
    # ------------------------------------------------------------------
    model = XGBClassifier()
    model.load_model(str(model_path))
    print(f"[BFS-CAL] Loaded model from {model_path}")

    # ------------------------------------------------------------------
    # 2. Prepare features and observed labels
    # ------------------------------------------------------------------
    X = prepare_features(df_outcomes, BFS_FEATURES)
    y = df_outcomes[BFS_TARGET].to_numpy(dtype="int32")

    print(f"[BFS-CAL] Calibrating on {len(X)} resolved outcomes "
          f"(default rate: {y.mean():.2%})")

    # ------------------------------------------------------------------
    # 3. Metrics BEFORE calibration (raw model)
    # ------------------------------------------------------------------
    prob_raw = model.predict_proba(X)[:, 1]
    metrics_before = classification_metrics(y, prob_raw, label="bfs_pre_cal")
    diag_before = reliability_diagram(y, prob_raw)
    print(f"[BFS-CAL] Metrics before calibration: {metrics_before}")

    # ------------------------------------------------------------------
    # 4. Fit calibrator
    # ------------------------------------------------------------------
    calibrator = fit_calibrator(model, X, y, method=method)
    prob_cal = calibrator.predict_proba(X)[:, 1]

    # ------------------------------------------------------------------
    # 5. Metrics AFTER calibration
    # ------------------------------------------------------------------
    metrics_after = classification_metrics(y, prob_cal, label="bfs_post_cal")
    diag_after = reliability_diagram(y, prob_cal)
    passed = calibration_passes(y, prob_cal)

    print(f"[BFS-CAL] Metrics after calibration:  {metrics_after}")
    print(f"[BFS-CAL] Max decile deviation: {diag_after['max_deviation']} "
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

    print(f"[BFS-CAL] Artefacts written to: {out_dir}")

    return {
        "cal_run_name": cal_run_name,
        "calibrator_path": str(cal_path),
        "metrics": cal_metrics,
        "gate_passed": passed,
    }
