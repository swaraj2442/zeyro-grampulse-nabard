"""Scenario router — CatBoost re-inference + deterministic cash adjustments.

POST /api/v1/enterprises/{id}/scenario

Scenario variables fed through CatBoost models (confirmed in feature schema):
  future_input_cost_scenario
  future_commodity_price_scenario
  future_forecast_rainfall_anomaly_pct
  future_scheduled_emi
  future_scheduled_loan_repayment

Deterministic adjustments (NOT model features, applied post-inference):
  workingCapitalSupport  → direct cash balance addition (month 1) with 0.70 decay
  grantSupport           → same treatment as working capital
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from api.data.synthetic_store import store

router = APIRouter(prefix="/api/v1/enterprises", tags=["scenarios"])


def _now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


class ScenarioRequest(BaseModel):
    workingCapitalSupport: float = 0.0
    grantSupport: float = 0.0
    inputCostChange: float = 0.0          # fractional: -0.05 = 5% reduction
    outputPriceChange: float = 0.0        # fractional: -0.10 = 10% decline
    rainfallAnomalyChange: float = 0.0    # pct points added to anomaly
    demandIndexChange: float = 0.0        # fractional change in demand index
    emiAdjustment: float = 0.0            # absolute monthly EMI change (negative = relief)


@router.post("/{enterprise_id}/scenario")
def run_scenario(enterprise_id: str, body: ScenarioRequest):
    try:
        from api.inference_api import predict_enterprise_cashflow
        from api.routers.enterprises import _load_demo_fixture, DEMO_FIXTURE_ID
    except ImportError as e:
        raise HTTPException(status_code=503, detail=f"Inference engine unavailable: {e}")

    # ── Load history ───────────────────────────────────────────────────────
    history_rows = store.get_all_history(enterprise_id)
    if not history_rows:
        raise HTTPException(status_code=404, detail="No history data for this enterprise")

    history_df = pd.DataFrame(history_rows)
    base_future = history_df.tail(6).copy()

    # ── 1. Baseline forecast ───────────────────────────────────────────────
    try:
        baseline_raw = predict_enterprise_cashflow(history_df, base_future)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Baseline inference failed: {e}")

    # ── 2. Modified future for scenario model features ─────────────────────
    modified_future = base_future.copy()

    if body.inputCostChange != 0:
        if "input_cost_scenario" in modified_future.columns:
            modified_future["input_cost_scenario"] = (
                modified_future["input_cost_scenario"] * (1 + body.inputCostChange)
            )
    if body.outputPriceChange != 0:
        if "commodity_price_scenario" in modified_future.columns:
            modified_future["commodity_price_scenario"] = (
                modified_future["commodity_price_scenario"] * (1 + body.outputPriceChange)
            )
    if body.rainfallAnomalyChange != 0:
        if "forecast_rainfall_anomaly_pct" in modified_future.columns:
            modified_future["forecast_rainfall_anomaly_pct"] = (
                modified_future["forecast_rainfall_anomaly_pct"] + body.rainfallAnomalyChange
            )
    if body.emiAdjustment != 0:
        if "scheduled_emi" in modified_future.columns:
            modified_future["scheduled_emi"] = (
                modified_future["scheduled_emi"] + body.emiAdjustment
            ).clip(lower=0)

    # ── 3. CatBoost re-inference with modified inputs ──────────────────────
    try:
        scenario_raw = predict_enterprise_cashflow(history_df, modified_future)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Scenario inference failed: {e}")

    # ── 4. Deterministic cash adjustment (working capital / grant) ─────────
    cash_injection = body.workingCapitalSupport + body.grantSupport
    if cash_injection > 0:
        decay = [1.0, 0.70, 0.49, 0.34, 0.24, 0.17]
        for i, month in enumerate(scenario_raw.get("forecast", [])):
            if i < len(decay):
                month["closing_cash_balance"] = (
                    (month.get("closing_cash_balance") or 0) + cash_injection * decay[i]
                )
                month["cash_after_debt_service"] = (
                    (month.get("cash_after_debt_service") or 0) + cash_injection * decay[i]
                )

    # ── 5. Normalise both forecasts to frontend shape ─────────────────────
    baseline_fc = _normalise(enterprise_id, baseline_raw)
    scenario_fc = _normalise(enterprise_id, scenario_raw)

    # ── 6. Extract risk from each ─────────────────────────────────────────
    baseline_ew = baseline_raw.get("early_warning", {})
    scenario_ew = scenario_raw.get("early_warning", {})

    return {
        "enterpriseId": enterprise_id,
        "generatedAt": _now(),
        "scenarioInputs": body.dict(),
        "baseline": {
            "forecast": baseline_fc["forecast"],
            "earlyWarning": _normalise_ew(enterprise_id, baseline_ew),
        },
        "scenario": {
            "forecast": scenario_fc["forecast"],
            "earlyWarning": _normalise_ew(enterprise_id, scenario_ew),
        },
        "delta": {
            "riskScoreChange": (scenario_ew.get("risk_score", 0) or 0) - (baseline_ew.get("risk_score", 0) or 0),
            "forecastDeficitChange": (scenario_ew.get("forecast_deficit", 0) or 0) - (baseline_ew.get("forecast_deficit", 0) or 0),
            "previousRiskLevel": baseline_ew.get("risk_level", "Low"),
            "newRiskLevel": scenario_ew.get("risk_level", "Low"),
            "riskLevelChanged": baseline_ew.get("risk_level") != scenario_ew.get("risk_level"),
        },
    }


def _normalise(enterprise_id: str, raw: dict) -> dict:
    months = []
    for i, m in enumerate(raw.get("forecast", [])):
        months.append({
            "month": m.get("month", ""),
            "horizon": i + 1,
            "operatingInflow": round(m.get("operating_inflow", 0) or 0, 2),
            "operatingOutflow": round(m.get("operating_outflow", 0) or 0, 2),
            "closingCashBalance": round(m.get("closing_cash_balance", 0) or 0, 2),
            "cashAfterDebtService": round(m.get("cash_after_debt_service", 0) or 0, 2),
            "lower": round((m.get("closing_cash_balance", 0) or 0) * 0.85, 2),
            "upper": round((m.get("closing_cash_balance", 0) or 0) * 1.15, 2),
        })
    return {
        "enterpriseId": enterprise_id,
        "modelVersion": raw.get("model_version", "grampulse-cf-v1.1"),
        "forecastGeneratedAt": _now(),
        "forecast": months,
    }


def _normalise_ew(enterprise_id: str, ew: dict) -> dict:
    return {
        "enterpriseId": enterprise_id,
        "riskScore": ew.get("risk_score", 0),
        "riskLevel": ew.get("risk_level", "Low"),
        "forecastDeficit": ew.get("forecast_deficit", 0),
        "debtServiceShortfall": ew.get("debt_service_shortfall", 0),
        "stressMonth": ew.get("stress_month", ""),
        "warningLeadTimeDays": ew.get("warning_lead_time_days", 0),
        "drivers": [
            {
                "feature": d.get("feature", ""),
                "observedValue": d.get("observed_value", 0),
                "unit": d.get("unit", ""),
                "contributionPoints": d.get("contribution_points", 0),
                "explanation": d.get("explanation", ""),
            }
            for d in ew.get("drivers", [])
        ],
    }
