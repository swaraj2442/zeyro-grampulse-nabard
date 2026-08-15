"""ml_service/routers/scenario.py

POST /ml/scenario

Runs baseline + scenario CatBoost re-inference with modified future covariates,
then applies deterministic cash adjustments (working capital, grants).
"""
from __future__ import annotations
from typing import Any, Dict, List, Optional
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ml_service.routers.forecast import (
    MarketFeatures, WeatherFeatures, LoanObligations,
    _run_catboost, _normalise_forecast, _normalise_ew,
    _inject_live_features, _forecast_id, _now,
)

router = APIRouter(prefix="/ml", tags=["scenario"])


class ScenarioParams(BaseModel):
    workingCapitalSupport: float = 0.0
    grantSupport: float = 0.0
    inputCostChange: float = 0.0        # fractional: -0.05 = 5% reduction
    outputPriceChange: float = 0.0      # fractional: -0.10 = 10% decline
    rainfallAnomalyChange: float = 0.0  # pct points added
    emiAdjustment: float = 0.0          # absolute monthly EMI change


class ScenarioRequest(BaseModel):
    enterpriseId: str
    history: List[Dict[str, Any]]
    scenario: ScenarioParams
    marketFeatures: Optional[MarketFeatures] = None
    weatherFeatures: Optional[WeatherFeatures] = None
    loanObligations: Optional[LoanObligations] = None


@router.post("/scenario")
def run_scenario(body: ScenarioRequest):
    from ml_service.main import models, preprocessor, manifest, CATBOOST_AVAILABLE

    if not CATBOOST_AVAILABLE or len(models) < 18 or preprocessor is None:
        raise HTTPException(status_code=503, detail={
            "forecastStatus": "unavailable",
            "reason": "CatBoost models not loaded",
        })

    if not body.history:
        raise HTTPException(status_code=422, detail="history must not be empty")

    try:
        history_df = pd.DataFrame(body.history)
        market = body.marketFeatures or MarketFeatures()
        weather = body.weatherFeatures or WeatherFeatures()
        loan = body.loanObligations or LoanObligations()

        # ── Baseline ─────────────────────────────────────────────────────────
        base_future = history_df.tail(6).copy()
        _inject_live_features(base_future, market, weather, loan)
        baseline_raw = _run_catboost(history_df, base_future, models, preprocessor, manifest)

        # ── Scenario: modify covariates ───────────────────────────────────────
        sc = body.scenario
        mod_future = base_future.copy()

        if sc.inputCostChange != 0 and "input_cost_scenario" in mod_future.columns:
            mod_future["input_cost_scenario"] *= (1 + sc.inputCostChange)
        if sc.outputPriceChange != 0 and "commodity_price_scenario" in mod_future.columns:
            mod_future["commodity_price_scenario"] *= (1 + sc.outputPriceChange)
        if sc.rainfallAnomalyChange != 0 and "forecast_rainfall_anomaly_pct" in mod_future.columns:
            mod_future["forecast_rainfall_anomaly_pct"] += sc.rainfallAnomalyChange
        if sc.emiAdjustment != 0 and "scheduled_emi" in mod_future.columns:
            mod_future["scheduled_emi"] = (mod_future["scheduled_emi"] + sc.emiAdjustment).clip(lower=0)

        scenario_raw = _run_catboost(history_df, mod_future, models, preprocessor, manifest)

        # ── Deterministic cash injection ──────────────────────────────────────
        cash_injection = sc.workingCapitalSupport + sc.grantSupport
        decay = [1.0, 0.70, 0.49, 0.34, 0.24, 0.17]
        if cash_injection > 0:
            for i, m in enumerate(scenario_raw.get("forecast", [])):
                if i < len(decay):
                    m["closing_cash_balance"] = (m.get("closing_cash_balance") or 0) + cash_injection * decay[i]
                    m["cash_after_debt_service"] = (m.get("cash_after_debt_service") or 0) + cash_injection * decay[i]

        baseline_ew = baseline_raw.get("early_warning", {})
        scenario_ew = scenario_raw.get("early_warning", {})

        return {
            "enterpriseId": body.enterpriseId,
            "generatedAt": _now(),
            "scenarioInputs": sc.dict(),
            "scenarioMethod": {
                "marketImpact": "catboost-reinference" if any([sc.inputCostChange, sc.outputPriceChange, sc.rainfallAnomalyChange]) else "none",
                "workingCapital": "deterministic-cashflow-adjustment" if cash_injection > 0 else "none",
                "risk": "risk-engine-recalculation",
            },
            "provenance": {
                "forecastId": _forecast_id(),
                "computedAt": _now(),
                "weatherSource": weather.weatherSource,
                "marketSource": market.marketSource,
                "cashFlowModelVersion": manifest.get("model_version", "grampulse-cf-v1.1"),
            },
            "baseline": {
                "forecast": _normalise_forecast(baseline_raw),
                "earlyWarning": _normalise_ew(baseline_ew),
            },
            "scenario": {
                "forecast": _normalise_forecast(scenario_raw),
                "earlyWarning": _normalise_ew(scenario_ew),
            },
            "delta": {
                "riskScoreChange": (scenario_ew.get("risk_score", 0) or 0) - (baseline_ew.get("risk_score", 0) or 0),
                "forecastDeficitChange": (scenario_ew.get("forecast_deficit", 0) or 0) - (baseline_ew.get("forecast_deficit", 0) or 0),
                "previousRiskLevel": baseline_ew.get("risk_level", "Low"),
                "newRiskLevel": scenario_ew.get("risk_level", "Low"),
                "riskLevelChanged": baseline_ew.get("risk_level") != scenario_ew.get("risk_level"),
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Scenario inference failed: {e}")
