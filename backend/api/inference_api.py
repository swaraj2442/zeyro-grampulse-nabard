"""GramPulse Inference API — main entry point.

Handles:
  - CatBoost model loading + startup validation
  - CORS with explicit origin allowlist
  - Synthetic data store initialization
  - SQLite DB initialization
  - Health + readiness endpoints
  - Router registration (enterprises, portfolio, interventions, scenarios)
  - Core predict_enterprise_cashflow() function used by all routers
"""
from __future__ import annotations

import json
import os
import pickle
from pathlib import Path
from typing import Any, Dict, List

import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ── CatBoost ────────────────────────────────────────────────────────────────
try:
    from catboost import CatBoostRegressor
    CATBOOST_AVAILABLE = True
except ImportError:
    CATBOOST_AVAILABLE = False

# ── Utility functions ────────────────────────────────────────────────────────
from dummtdatasets.cashflow.nabard_cashflow_utils import (
    RuralEnterprisePreprocessor,
    engineer_model_features,
    build_early_warning,
)

# ── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="GramPulse Inference API",
    description="CatBoost-powered rural enterprise cashflow forecasting and risk engine.",
    version="1.1.0",
)

# ── CORS — explicit origin allowlist (never wildcard) ────────────────────────
_raw_origins = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
)
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Configuration ────────────────────────────────────────────────────────────
MOCK_MODE = os.environ.get("GRAM_PULSE_MOCK_MODE", "false").lower() == "true"
MODEL_DIR = Path("models")
CATBOOST_DIR = MODEL_DIR / "catboost"

# Scenario features that MUST exist in every trained model
REQUIRED_SCENARIO_FEATURES = {
    "future_commodity_price_scenario",
    "future_forecast_rainfall_anomaly_pct",
    "future_input_cost_scenario",
    "future_scheduled_emi",
    "future_scheduled_loan_repayment",
}

# ── Global state ─────────────────────────────────────────────────────────────
models: dict = {}
preprocessor: RuralEnterprisePreprocessor | None = None
manifest: dict = {}

# ── External feed status (set during startup) ────────────────────────────────
_weather_feed_status = "unknown"
_market_feed_status = "unknown"


# ── Startup ──────────────────────────────────────────────────────────────────
@app.on_event("startup")
def startup():
    global preprocessor, manifest, _weather_feed_status, _market_feed_status

    # 1. Initialize SQLite
    from api.data.db import connect as db_connect
    db_connect()

    # 2. Load synthetic baseline (read-only)
    from api.data.synthetic_store import store
    csv_path = Path("data") / "nabard_enterprise_monthly.csv"
    if csv_path.exists():
        store.load(csv_path)
        print(f"✅ Synthetic store loaded: {len(store.get_all_entity_ids())} enterprises")
    else:
        print("⚠️  Synthetic CSV not found — enterprise endpoints will return empty data")

    if MOCK_MODE:
        print("🟡 Starting in MOCK MODE — CatBoost models will not be loaded.")
        return

    # 3. Validate model artifacts
    if not CATBOOST_AVAILABLE:
        raise RuntimeError("CatBoost is not installed. Run: pip install catboost")

    cbm_files = list(CATBOOST_DIR.glob("*.cbm")) if CATBOOST_DIR.exists() else []
    if len(cbm_files) < 18:
        raise RuntimeError(
            f"Expected 18 .cbm model files, found {len(cbm_files)}. "
            "Export trained models before starting the API."
        )

    preprocessor_path = MODEL_DIR / "preprocessor.pkl"
    if not preprocessor_path.exists():
        raise RuntimeError("preprocessor.pkl is missing from the models/ directory.")

    manifest_path = MODEL_DIR / "model_manifest.json"
    if not manifest_path.exists():
        raise RuntimeError("model_manifest.json is missing from the models/ directory.")

    # 4. Load artifacts
    with open(preprocessor_path, "rb") as f:
        preprocessor = pickle.load(f)

    with open(manifest_path, "r") as f:
        manifest = json.load(f)

    # 5. Load all 18 models + validate scenario features
    for target in manifest["targets"]:
        for horizon in manifest["horizons"]:
            model = CatBoostRegressor()
            cbm_path = CATBOOST_DIR / f"{target}_h{horizon}.cbm"
            if not cbm_path.exists():
                raise RuntimeError(f"Missing model artifact: {cbm_path}")
            model.load_model(str(cbm_path))

            # Validate that scenario features exist in this model
            missing = REQUIRED_SCENARIO_FEATURES - set(model.feature_names_)
            if missing:
                raise RuntimeError(
                    f"Scenario features missing from {target}_h{horizon}: {sorted(missing)}"
                )
            models[(target, horizon)] = model

    print(f"✅ {len(models)} CatBoost models loaded ({manifest['model_version']})")

    # 6. Non-blocking external feed check
    try:
        import urllib.request
        urllib.request.urlopen("https://archive-api.open-meteo.com/v1/archive?latitude=19&longitude=73&start_date=2024-01-01&end_date=2024-01-01&daily=rain_sum", timeout=3)
        _weather_feed_status = "live"
    except Exception:
        _weather_feed_status = "cached"

    _market_feed_status = "csv" if (Path("data") / "agmarknet_fallback.csv").exists() else "synthetic"
    print(f"🌤  Weather feed: {_weather_feed_status} | 📊 Market feed: {_market_feed_status}")


# ── Routers ──────────────────────────────────────────────────────────────────
from api.routers.enterprises import router as enterprises_router
from api.routers.portfolio import router as portfolio_router
from api.routers.interventions import router as interventions_router
from api.routers.scenarios import router as scenarios_router
from api.routers.weather import router as weather_router
from api.routers.market import router as market_router

app.include_router(enterprises_router)
app.include_router(portfolio_router)
app.include_router(interventions_router)
app.include_router(scenarios_router)
app.include_router(weather_router)
app.include_router(market_router)


# ── Health & Readiness ───────────────────────────────────────────────────────
@app.get("/health", tags=["system"])
def health():
    from api.data.synthetic_store import store
    from api.data import db
    return {
        "status": "ok",
        "modelsLoaded": len(models),
        "preprocessorLoaded": preprocessor is not None,
        "syntheticDataLoaded": store.loaded,
        "dbConnected": db.connected,
        "weatherFeed": _weather_feed_status,
        "marketFeed": _market_feed_status,
        "modelVersion": manifest.get("model_version", "unknown"),
        "mockMode": MOCK_MODE,
        "allowedOrigins": ALLOWED_ORIGINS,
    }


@app.get("/ready", tags=["system"])
def ready():
    from api.data.synthetic_store import store
    from api.data import db
    if MOCK_MODE:
        return {"ready": True, "mode": "mock"}
    ok = len(models) >= 18 and preprocessor is not None and db.connected
    if not ok:
        raise HTTPException(status_code=503, detail="Service not ready")
    return {"ready": True, "modelsLoaded": len(models)}


# ── Core inference function (used by enterprises + scenarios routers) ─────────
def predict_enterprise_cashflow(
    enterprise_history: pd.DataFrame,
    future_scenarios: pd.DataFrame,
) -> dict:
    """Run 18-model CatBoost multi-horizon inference.

    Returns snake_case dict matching:
      { enterprise_id, model_version, forecast: [...], early_warning: {...} }
    """
    if MOCK_MODE:
        eid = enterprise_history["entity_id"].iloc[0] if len(enterprise_history) > 0 else "ENT-000"
        return _mock_prediction(eid)

    # Ensure time_idx present
    if "time_idx" not in enterprise_history.columns:
        enterprise_history = enterprise_history.copy()
        enterprise_history["time_idx"] = range(len(enterprise_history))
    if "time_idx" not in future_scenarios.columns:
        future_scenarios = future_scenarios.copy()
        start = int(enterprise_history["time_idx"].max()) + 1
        future_scenarios["time_idx"] = range(start, start + len(future_scenarios))

    # Coerce numeric columns
    for col in ["scheduled_emi", "scheduled_loan_repayment", "month", "is_festival_month"]:
        for df in [enterprise_history, future_scenarios]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    df = pd.concat([enterprise_history, future_scenarios], ignore_index=True)
    df = preprocessor.transform(df)
    df = engineer_model_features(df)

    forecast_origin_idx = len(enterprise_history) - 1
    base_features = df.iloc[forecast_origin_idx: forecast_origin_idx + 1].copy()

    predictions = []
    for i, horizon in enumerate(manifest["horizons"]):
        row: dict = {"horizon": horizon}
        features = base_features.copy()

        if i < len(future_scenarios):
            frow = future_scenarios.iloc[i]
            _inject_future = {
                "future_month": frow.get("month", features["month"].values[0] if "month" in features else 1),
                "future_is_festival_month": frow.get("is_festival_month", 0),
                "future_scheduled_emi": frow.get("scheduled_emi", 0),
                "future_scheduled_loan_repayment": frow.get("scheduled_loan_repayment", 0),
                "future_forecast_rainfall_anomaly_pct": frow.get("forecast_rainfall_anomaly_pct", 0.0),
                "future_forecast_temperature_mean": frow.get("forecast_temperature_mean", 25.0),
                "future_commodity_price_scenario": frow.get("commodity_price_scenario", 0.0),
                "future_input_cost_scenario": frow.get("input_cost_scenario", 0.0),
                "future_quarter": frow.get("quarter", "Q1"),
            }
            for k, v in _inject_future.items():
                features[k] = v

        for target in manifest["targets"]:
            model = models[(target, horizon)]
            feat_cols = model.feature_names_
            for col in feat_cols:
                if col not in features.columns:
                    features[col] = 0
            pred = float(model.predict(features[feat_cols])[0])
            row[f"pred_{target}"] = pred

        predictions.append(row)

    future = pd.DataFrame(predictions)
    future["scheduled_emi"] = future_scenarios["scheduled_emi"].values[: len(future)]
    future["scheduled_loan_repayment"] = future_scenarios["scheduled_loan_repayment"].values[: len(future)]
    future["date"] = future_scenarios["date"].values[: len(future)]
    base_time_idx = int(enterprise_history["time_idx"].max()) + 1
    future["time_idx"] = range(base_time_idx, base_time_idx + len(future))
    future["pred_cash_after_debt"] = (
        future["pred_operating_inflow"]
        - future["pred_operating_outflow"]
        - future["scheduled_emi"]
        - future["scheduled_loan_repayment"]
    )

    latest = enterprise_history.iloc[-1].to_dict()
    record = build_early_warning(latest["entity_id"], future, latest)

    forecast_out = [
        {
            "month": pd.to_datetime(row["date"]).strftime("%Y-%m"),
            "operating_inflow": float(row["pred_operating_inflow"]),
            "operating_outflow": float(row["pred_operating_outflow"]),
            "closing_cash_balance": float(row["pred_closing_cash_balance"]),
            "cash_after_debt_service": float(row["pred_cash_after_debt"]),
        }
        for _, row in future.iterrows()
    ]

    return {
        "enterprise_id": latest["entity_id"],
        "model_version": manifest["model_version"],
        "forecast": forecast_out,
        "early_warning": {
            "risk_score": record.risk_score,
            "risk_level": record.risk_level,
            "risk_confidence_index": record.risk_confidence_index,
            "forecast_deficit": record.forecast_deficit,
            "debt_service_shortfall": record.debt_service_shortfall,
            "stress_month": record.stress_month,
            "warning_lead_time_days": record.warning_lead_time_days,
            "drivers": [
                {
                    "feature": d.feature,
                    "observed_value": d.observed_value,
                    "unit": d.unit,
                    "contribution_points": d.contribution_points,
                    "explanation": d.explanation,
                }
                for d in record.drivers
            ],
            "recommended_intervention": record.recommended_intervention,
        },
    }


def _mock_prediction(enterprise_id: str) -> dict:
    return {
        "enterprise_id": enterprise_id,
        "model_version": "grampulse-cf-v1.1-mock",
        "forecast": [
            {"month": f"2026-{8+i:02d}", "operating_inflow": 142500 - i * 3000,
             "operating_outflow": 128200 + i * 2500, "closing_cash_balance": 47600 - i * 5500,
             "cash_after_debt_service": 7300 - i * 5500}
            for i in range(6)
        ],
        "early_warning": {
            "risk_score": 74, "risk_level": "High", "risk_confidence_index": 0.74,
            "forecast_deficit": 38400, "debt_service_shortfall": 7200,
            "stress_month": "2026-10", "warning_lead_time_days": 61, "drivers": [],
            "recommended_intervention": "Working-capital review",
        },
    }


# ── Legacy POST endpoint (kept for backward compatibility) ────────────────────
class InferenceRequest(BaseModel):
    history: List[Dict[str, Any]]
    scenarios: List[Dict[str, Any]]


@app.post("/api/v1/inference/forecast", tags=["legacy"])
async def legacy_forecast(enterprise_id: str, request: InferenceRequest):
    """Legacy direct-inference endpoint. Use GET /api/v1/enterprises/{id}/forecast instead."""
    try:
        history_df = pd.DataFrame(request.history)
        scenarios_df = pd.DataFrame(request.scenarios)
        return predict_enterprise_cashflow(history_df, scenarios_df)
    except Exception as e:
        import traceback
        raise HTTPException(status_code=400, detail=traceback.format_exc())
