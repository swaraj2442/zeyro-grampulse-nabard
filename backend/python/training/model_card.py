"""Model card generation helpers.

Serialises a training result dict (from any train_*.run()) into a structured
model card JSON that follows the BFS_MODEL_PLAN.md specification:

  - Model identity (name, version, date)
  - Training data summary (row count, target rate)
  - Evaluation metrics
  - Calibration status
  - Top SHAP features (explainability)
  - Deployment gate status (AUC and calibration thresholds)

Usage:
    from training.model_card import generate
    card = generate(result, model_name="BFS", training_rows=50000, target_rate=0.08)
    print(card)   # JSON string
"""

from __future__ import annotations

import json
from datetime import datetime, timezone


# ---------------------------------------------------------------------------
# Gate thresholds — from BFS_MODEL_PLAN.md
# ---------------------------------------------------------------------------
AUC_GATE: float = 0.72      # model only deploys if AUC > this
BRIER_GATE: float = 0.15    # model only deploys if Brier < this


def generate(
    result: dict,
    model_name: str,
    training_rows: int,
    target_rate: float,
    notes: str = "",
) -> str:
    """
    Generate a JSON model card string from a training result dict.

    Args:
        result: Dict returned by any train_*.run() function.
        model_name: Human-readable model name ("BFS", "RPS").
        training_rows: Total number of rows in the training set.
        target_rate: Positive label rate in the training set (e.g. 0.08 = 8%).
        notes: Free-text notes for this run.

    Returns:
        JSON string of the model card.
    """
    metrics = result.get("metrics", {})
    cal_metrics = metrics.get("calibrated", metrics)

    auc = cal_metrics.get("auc")
    brier = cal_metrics.get("brier")
    cal_passed = result.get("calibration_passed", True)

    # Deployment gate
    auc_ok = (auc is None) or (auc >= AUC_GATE)
    brier_ok = (brier is None) or (brier <= BRIER_GATE)
    deployment_ready = auc_ok and brier_ok and cal_passed

    card = {
        "model_name": model_name,
        "run_name": result.get("run_name", "unknown"),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "training_data": {
            "rows": training_rows,
            "target_rate": target_rate,
        },
        "metrics": metrics,
        "shap_top_features": list(result.get("shap_importance", {}).items())[:10],
        "deployment_gates": {
            "auc_gate": AUC_GATE,
            "brier_gate": BRIER_GATE,
            "auc_pass": auc_ok,
            "brier_pass": brier_ok,
            "calibration_pass": cal_passed,
            "deployment_ready": deployment_ready,
        },
        "notes": notes,
    }

    return json.dumps(card, indent=2)


def save(card_json: str, path: str) -> None:
    """Write a model card JSON string to a file."""
    with open(path, "w") as f:
        f.write(card_json)
    print(f"Model card saved to: {path}")
