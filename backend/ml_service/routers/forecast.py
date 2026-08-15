"""ml_service/routers/forecast.py

POST /ml/forecast

Receives: enterprise history + market features + weather features + loan obligations
Returns:  6-month forecast + early warning + provenance

Called by Go API gateway only. No frontend access.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/ml", tags=["forecast"])


def _now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _forecast_id() -> str:
    return f"FCT-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"


# ── Request / Response contracts ──────────────────────────────────────────────

class MarketFeatures(BaseModel):
    maizePrice: Optional[float] = None
    soybeanPrice: Optional[float] = None
    outputCommodityPrice: Optional[float] = None
    inputCostIndex: Optional[float] = None
    commodityPriceChange1m: Optional[float] = None
    commodityPriceChange3m: Optional[float] = None
    commodityPriceVolatility3m: Optional[float] = None
    feedIndex: Optional[float] = None
    marketSource: str = "synthetic"
    marketFetchedAt: Optional[str] = None


class WeatherFeatures(BaseModel):
    rainfallAnomalyPct: Optional[float] = None
    temperatureMean: Optional[float] = None
    extremeHeatDays: Optional[int] = None
    consecutiveDryDays: Optional[int] = None
    climateRiskScore: Optional[float] = None
    droughtRisk: Optional[str] = None
    weatherSource: str = "synthetic"
    weatherFetchedAt: Optional[str] = None


class LoanObligations(BaseModel):
    scheduledEmiMonthly: float = 0.0
    scheduledLoanRepaymentMonthly: float = 0.0
    outstandingAmount: float = 0.0
    interestRatePct: float = 9.5


class ForecastRequest(BaseModel):
    enterpriseId: str
    history: List[Dict[str, Any]]        # monthly financial history rows
    marketFeatures: Optional[MarketFeatures] = None
    weatherFeatures: Optional[WeatherFeatures] = None
    loanObligations: Optional[LoanObligations] = None
    horizons: int = 6


class ForecastMonthResult(BaseModel):
    month: str
    horizon: int
    operatingInflow: float
    operatingOutflow: float
    closingCashBalance: float
    cashAfterDebtService: float
    lower: float
    upper: float


class EarlyWarningResult(BaseModel):
    riskScore: float
    riskLevel: str
    forecastDeficit: float
    debtServiceShortfall: float
    stressMonth: str
    warningLeadTimeDays: int
    drivers: List[Dict[str, Any]]
    recommendedIntervention: str


class ForecastProvenance(BaseModel):
    forecastId: str
    computedAt: str
    enterpriseDataSource: str = "synthetic"
    weatherSource: str
    weatherFetchedAt: Optional[str]
    marketSource: str
    marketFetchedAt: Optional[str]
    cashFlowModelVersion: str
    riskEngineVersion: str = "1.0"
    upiDataNote: str = (
        "Enterprise UPI behaviour is synthetic. "
        "State-level digital-payment context sourced from NPCI statistics."
    )


class ForecastResponse(BaseModel):
    enterpriseId: str
    forecast: List[Dict[str, Any]]
    earlyWarning: Dict[str, Any]
    provenance: Dict[str, Any]


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post("/forecast", response_model=ForecastResponse)
def run_forecast(body: ForecastRequest):
    """Run 18-model CatBoost cashflow forecast with live market/weather features."""
    from ml_service.main import models, preprocessor, manifest, CATBOOST_AVAILABLE

    if not CATBOOST_AVAILABLE or len(models) < 18 or preprocessor is None:
        raise HTTPException(
            status_code=503,
            detail={
                "forecastStatus": "unavailable",
                "reason": "CatBoost models not loaded",
                "lastSuccessfulForecast": None,
            },
        )

    if not body.history:
        raise HTTPException(status_code=422, detail="history must not be empty")

    try:
        history_df = pd.DataFrame(body.history)
        market = body.marketFeatures or MarketFeatures()
        weather = body.weatherFeatures or WeatherFeatures()
        loan = body.loanObligations or LoanObligations()

        # Build future_scenarios from last 6 rows with live feature injection
        future_rows = history_df.tail(6).copy()
        _inject_live_features(future_rows, market, weather, loan)

        live_context = {
            "market": {
                "price_change_1m": market.commodityPriceChange1m,
                "price_change_3m": market.commodityPriceChange3m,
                "volatility_3m": market.commodityPriceVolatility3m,
            },
            "climate": {
                "rainfall_anomaly_pct": weather.rainfallAnomalyPct,
                "extreme_heat_days": weather.extremeHeatDays,
            }
        }
        raw = _run_catboost(history_df, future_rows, models, preprocessor, manifest, live_context)

        forecast_months = _normalise_forecast(raw)
        early_warning = _normalise_ew(raw.get("early_warning", {}))

        provenance = {
            "forecastId": _forecast_id(),
            "computedAt": _now(),
            "enterpriseDataSource": "synthetic",
            "weatherSource": weather.weatherSource,
            "weatherFetchedAt": weather.weatherFetchedAt,
            "marketSource": market.marketSource,
            "marketFetchedAt": market.marketFetchedAt,
            "cashFlowModelVersion": manifest.get("model_version", "grampulse-cf-v1.1"),
            "riskEngineVersion": "1.0",
            "upiDataNote": "Enterprise UPI behaviour is synthetic. State-level context from NPCI statistics.",
        }

        return {
            "enterpriseId": body.enterpriseId,
            "forecast": forecast_months,
            "earlyWarning": early_warning,
            "provenance": provenance,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={
                "forecastStatus": "unavailable",
                "reason": str(e),
                "lastSuccessfulForecast": None,
            },
        )


# ── Helpers ───────────────────────────────────────────────────────────────────

def _inject_live_features(
    future_rows: pd.DataFrame,
    market: MarketFeatures,
    weather: WeatherFeatures,
    loan: LoanObligations,
) -> None:
    """Overwrite future scenario rows with live market/weather/loan signals."""
    if market.outputCommodityPrice is not None:
        future_rows["commodity_price_scenario"] = market.outputCommodityPrice
    if market.inputCostIndex is not None:
        future_rows["input_cost_scenario"] = market.inputCostIndex
    if weather.rainfallAnomalyPct is not None:
        future_rows["forecast_rainfall_anomaly_pct"] = weather.rainfallAnomalyPct
    if weather.temperatureMean is not None:
        future_rows["forecast_temperature_mean"] = weather.temperatureMean
    if loan.scheduledEmiMonthly:
        future_rows["scheduled_emi"] = loan.scheduledEmiMonthly
    if loan.scheduledLoanRepaymentMonthly:
        future_rows["scheduled_loan_repayment"] = loan.scheduledLoanRepaymentMonthly


def _run_catboost(history_df, future_rows, models, preprocessor, manifest, live_context) -> dict:
    """Core 18-model inference using shared feature registry."""
    import numpy as np
    from ml_service.features.pipeline import engineer_all_features
    from dummtdatasets.cashflow.nabard_cashflow_utils import build_early_warning

    # Ensure time_idx
    if "time_idx" not in history_df.columns:
        history_df = history_df.copy()
        history_df["time_idx"] = range(len(history_df))
    if "time_idx" not in future_rows.columns:
        future_rows = future_rows.copy()
        start = int(history_df["time_idx"].max()) + 1
        future_rows["time_idx"] = range(start, start + len(future_rows))

    for col in ["scheduled_emi", "scheduled_loan_repayment", "month", "is_festival_month"]:
        for df in [history_df, future_rows]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    df = pd.concat([history_df, future_rows], ignore_index=True)
    df = preprocessor.transform(df)
    
    # Extract feature base (with Live Context applied safely via pipeline)
    df = engineer_all_features(df, live_context)

    forecast_origin_idx = len(history_df) - 1
    base_features = df.iloc[forecast_origin_idx: forecast_origin_idx + 1].copy()

    predictions = []
    for i, horizon in enumerate(manifest["horizons"]):
        row: dict = {"horizon": horizon}
        features = base_features.copy()

        if i < len(future_rows):
            frow = future_rows.iloc[i]
            inject = {
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
            for k, v in inject.items():
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
    future["scheduled_emi"] = future_rows["scheduled_emi"].values[: len(future)]
    future["scheduled_loan_repayment"] = future_rows["scheduled_loan_repayment"].values[: len(future)]
    future["date"] = future_rows["date"].values[: len(future)]
    base_time_idx = int(history_df["time_idx"].max()) + 1
    future["time_idx"] = range(base_time_idx, base_time_idx + len(future))
    future["pred_cash_after_debt"] = (
        future["pred_operating_inflow"]
        - future["pred_operating_outflow"]
        - future["scheduled_emi"]
        - future["scheduled_loan_repayment"]
    )

    latest = history_df.iloc[-1].to_dict()
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
            "forecast_deficit": record.forecast_deficit,
            "debt_service_shortfall": record.debt_service_shortfall,
            "stress_month": record.stress_month,
            "warning_lead_time_days": record.warning_lead_time_days,
            "drivers": [
                {"feature": d.feature, "observed_value": d.observed_value,
                 "unit": d.unit, "contribution_points": d.contribution_points,
                 "explanation": d.explanation}
                for d in record.drivers
            ],
            "recommended_intervention": record.recommended_intervention,
        },
    }


def _normalise_forecast(raw: dict) -> list:
    months = []
    for i, m in enumerate(raw.get("forecast", [])):
        cb = m.get("closing_cash_balance", 0) or 0
        months.append({
            "month": m.get("month", ""),
            "horizon": i + 1,
            "operatingInflow": round(m.get("operating_inflow", 0), 2),
            "operatingOutflow": round(m.get("operating_outflow", 0), 2),
            "closingCashBalance": round(cb, 2),
            "cashAfterDebtService": round(m.get("cash_after_debt_service", 0), 2),
            "lower": round(cb * 0.85, 2),
            "upper": round(cb * 1.15, 2),
        })
    return months


def _normalise_ew(ew: dict) -> dict:
    return {
        "riskScore": ew.get("risk_score", 0),
        "riskLevel": ew.get("risk_level", "Low"),
        "forecastDeficit": ew.get("forecast_deficit", 0),
        "debtServiceShortfall": ew.get("debt_service_shortfall", 0),
        "stressMonth": ew.get("stress_month", ""),
        "warningLeadTimeDays": ew.get("warning_lead_time_days", 0),
        "drivers": ew.get("drivers", []),
        "recommendedIntervention": ew.get("recommended_intervention", ""),
    }
