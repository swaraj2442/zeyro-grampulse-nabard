"""GramPulse ML Service — internal only, port 8001.

Called exclusively by the Go API gateway. Never exposed to the frontend.
No CORS. No auth (internal network only).
"""
from __future__ import annotations

import json
import os
import pickle
from pathlib import Path

from fastapi import FastAPI

try:
    from catboost import CatBoostRegressor, CatBoostClassifier
    CATBOOST_AVAILABLE = True
except ImportError:
    CATBOOST_AVAILABLE = False

from dummtdatasets.cashflow.nabard_cashflow_utils import (
    RuralEnterprisePreprocessor,
    engineer_model_features,
    build_early_warning,
)

app = FastAPI(
    title="GramPulse ML Service",
    description="Internal CatBoost inference service. Not exposed to frontend.",
    version="1.0.0",
)

# ── Global model state ────────────────────────────────────────────────────────
models: dict = {}           # (target, horizon) → CatBoostRegressor
uw_model = None             # CatBoostClassifier for underwriting
preprocessor: RuralEnterprisePreprocessor | None = None
manifest: dict = {}
uw_policy: dict = {}

MODEL_DIR = Path("models")
CATBOOST_DIR = MODEL_DIR / "catboost"

REQUIRED_SCENARIO_FEATURES = {
    "future_commodity_price_scenario",
    "future_forecast_rainfall_anomaly_pct",
    "future_input_cost_scenario",
    "future_scheduled_emi",
    "future_scheduled_loan_repayment",
}


@app.on_event("startup")
def startup():
    global preprocessor, manifest, uw_model, uw_policy

    if not CATBOOST_AVAILABLE:
        print("⚠️  CatBoost not installed — running in degraded mode")
        return

    preprocessor_path = MODEL_DIR / "preprocessor.pkl"
    manifest_path = MODEL_DIR / "model_manifest.json"

    if not preprocessor_path.exists() or not manifest_path.exists():
        print("⚠️  Model artifacts missing — running in degraded mode")
        return

    with open(preprocessor_path, "rb") as f:
        preprocessor = pickle.load(f)
    with open(manifest_path, "r") as f:
        manifest = json.load(f)

    # Load 18 cashflow models
    for target in manifest["targets"]:
        for horizon in manifest["horizons"]:
            cbm_path = CATBOOST_DIR / f"{target}_h{horizon}.cbm"
            if cbm_path.exists():
                m = CatBoostRegressor()
                m.load_model(str(cbm_path))
                models[(target, horizon)] = m

    # Load underwriting model (optional)
    uw_path = CATBOOST_DIR / "underwriting_repayment_failure.cbm"
    if uw_path.exists():
        uw_model = CatBoostClassifier()
        uw_model.load_model(str(uw_path))

    # Load policy rules
    policy_path = MODEL_DIR / "underwriting_policy.json"
    if policy_path.exists():
        with open(policy_path, "r") as f:
            uw_policy = json.load(f)

    print(f"✅ ML Service: {len(models)} cashflow models, UW model: {uw_model is not None}")


# ── Register routers ──────────────────────────────────────────────────────────
from ml_service.routers.forecast import router as forecast_router
from ml_service.routers.risk import router as risk_router
from ml_service.routers.scenario import router as scenario_router
from ml_service.routers.underwriting import router as uw_router
from ml_service.routers.batch_score import router as batch_router

app.include_router(forecast_router)
app.include_router(risk_router)
app.include_router(scenario_router)
app.include_router(uw_router)
app.include_router(batch_router)


@app.get("/ml/health")
def health():
    return {
        "ready": len(models) == 18,
        "modelsLoaded": len(models),
        "preprocessorLoaded": preprocessor is not None,
        "underwritingModelLoaded": uw_model is not None,
        "modelVersion": manifest.get("model_version", "unknown"),
        "catboostAvailable": CATBOOST_AVAILABLE,
    }
