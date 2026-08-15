"""ml_service/routers/underwriting.py

POST /ml/underwrite

Two-layer underwriting engine:
  Layer A: CatBoost classifier predicts repayment_failure_6m probability
  Layer B: Deterministic policy rules convert probability → decision label

Decision labels:
  ELIGIBLE | CONDITIONALLY_ELIGIBLE | MANUAL_REVIEW | NOT_ELIGIBLE
"""
from __future__ import annotations
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/ml", tags=["underwriting"])

_DECISIONS = {
    (0.0, 0.20): "ELIGIBLE",
    (0.20, 0.45): "CONDITIONALLY_ELIGIBLE",
    (0.45, 0.70): "MANUAL_REVIEW",
    (0.70, 1.01): "NOT_ELIGIBLE",
}


def _now():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _uw_id():
    return f"UW-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"


class UnderwriteRequest(BaseModel):
    enterpriseId: str
    requestedAmount: float
    requestedTenureMonths: int = 12
    productType: str = "Working Capital"
    purpose: str = ""
    # Forecast features (from /ml/forecast result)
    forecast: List[Dict[str, Any]] = []
    # Borrower attributes
    currentDpd: int = 0
    repaymentDelayCount6m: int = 0
    loanOutstanding: float = 0.0
    sanctionedLimit: float = 0.0
    scheduledEmiMonthly: float = 0.0
    annualTurnover: float = 0.0
    businessVintage: int = 0
    sector: str = ""
    district: str = ""
    upiInflowGrowth1m: Optional[float] = None
    upiActiveDaysAvg: Optional[int] = None
    marketRiskScore: Optional[float] = None
    climateRiskScore: Optional[float] = None


@router.post("/underwrite")
def underwrite(body: UnderwriteRequest):
    from ml_service.main import uw_model, CATBOOST_AVAILABLE, manifest

    # ── 1. Compute deterministic attributes required by model ─────────────────
    min_dscr, forecast_deficit, _ = _compute_affordability(body)
    max_affordable_emi = _compute_max_emi(body)
    requested_emi = body.requestedAmount / max(body.requestedTenureMonths, 1)
    credit_util = body.loanOutstanding / max(body.sanctionedLimit, body.requestedAmount, 1)

    # ── 2. Build underwriting feature vector ──────────────────────────────────
    features = {
        "requested_amount": body.requestedAmount,
        "requested_tenure_months": body.requestedTenureMonths,
        "current_dpd": body.currentDpd,
        "repayment_delay_count_6m": body.repaymentDelayCount6m,
        "loan_outstanding": body.loanOutstanding,
        "credit_utilisation": credit_util,
        "annual_turnover": body.annualTurnover,
        "business_vintage": body.businessVintage,
        "scheduled_emi": body.scheduledEmiMonthly,
        "min_projected_dscr": min_dscr,
        "forecast_deficit": forecast_deficit,
        "max_affordable_emi": max_affordable_emi,
        "requested_emi": requested_emi,
        "upi_inflow_growth_1m": body.upiInflowGrowth1m or 0.0,
        "upi_active_days_avg": body.upiActiveDaysAvg or 15,
        "market_risk_score": body.marketRiskScore or 50.0,
        "climate_risk_score": body.climateRiskScore or 50.0,
    }
    feat_df = pd.DataFrame([features])

    # ── 3. ML Risk Score Prediction ───────────────────────────────────────────
    failure_prob = None
    model_version = "grampulse-underwriting-v1.0"

    if CATBOOST_AVAILABLE and uw_model is not None:
        try:
            feat_cols = uw_model.feature_names_
            for col in feat_cols:
                if col not in feat_df.columns:
                    feat_df[col] = 0
            failure_prob = float(uw_model.predict_proba(feat_df[feat_cols])[0][1])
        except Exception:
            pass

    if failure_prob is None:
        failure_prob = _deterministic_failure_prob(min_dscr, body.currentDpd, forecast_deficit, credit_util)
        model_version = "grampulse-underwriting-v1.0-deterministic"

    # Return pure Risk Oracle probability
    return {
        "enterpriseId": body.enterpriseId,
        "probability_of_stress": round(failure_prob, 4),
        "modelVersion": model_version,
        "computedAt": _now(),
    }


# ── Helpers ────────────────────────────────────────────────────────────────────

def _compute_affordability(body: UnderwriteRequest):
    """Compute min DSCR and forecast deficit from forecast months."""
    if not body.forecast:
        return 0.8, 0.0, ""

    dscrList = []
    min_dscr = float("inf")
    forecast_deficit = 0.0
    stress_month = ""

    for m in body.forecast:
        cads = m.get("cashAfterDebtService", 0) or 0
        inflow = m.get("operatingInflow", 1) or 1
        dscr = (inflow - m.get("operatingOutflow", 0)) / max(body.scheduledEmiMonthly, 1)
        dscrList.append(dscr)
        if cads < 0 and abs(cads) > forecast_deficit:
            forecast_deficit = abs(cads)
            stress_month = m.get("month", "")

    min_dscr = min(dscrList) if dscrList else 0.8
    return min_dscr, forecast_deficit, stress_month


def _compute_max_emi(body: UnderwriteRequest) -> float:
    """Max EMI = 40% of average monthly net operating surplus."""
    if not body.forecast:
        return body.annualTurnover / 12 * 0.4

    surpluses = [
        (m.get("operatingInflow", 0) or 0) - (m.get("operatingOutflow", 0) or 0)
        for m in body.forecast
    ]
    avg_surplus = sum(surpluses) / max(len(surpluses), 1)
    return max(avg_surplus * 0.40, 0)


def _deterministic_failure_prob(min_dscr, dpd, deficit, credit_util) -> float:
    prob = 0.15
    if min_dscr < 1.0:
        prob += 0.20 * (1 - min_dscr)
    if dpd > 30:
        prob += 0.30
    elif dpd > 0:
        prob += 0.10
    if deficit > 0:
        prob += 0.15
    if credit_util > 0.80:
        prob += 0.10
    return min(prob, 0.99)


def _apply_policy_rules(body, failure_prob, min_dscr, forecast_deficit, max_emi, req_emi):
    decision = next(
        (label for (lo, hi), label in _DECISIONS.items() if lo <= failure_prob < hi),
        "MANUAL_REVIEW"
    )
    conditions = []
    reason_codes = []

    # Hard overrides
    if body.currentDpd > 30:
        decision = "NOT_ELIGIBLE"
        reason_codes.append("Current DPD > 30 days — policy hard stop")
    if min_dscr < 0.8:
        decision = "NOT_ELIGIBLE" if decision != "NOT_ELIGIBLE" else decision
        reason_codes.append(f"Minimum projected DSCR {min_dscr:.2f} below 0.8 threshold")
    elif min_dscr < 1.0:
        if decision == "ELIGIBLE":
            decision = "CONDITIONALLY_ELIGIBLE"
        reason_codes.append(f"Projected DSCR {min_dscr:.2f} falls below 1.0 in at least one forecast month")

    if forecast_deficit > 0:
        reason_codes.append(f"Forecast cash deficit of ₹{forecast_deficit:,.0f} in stress month")

    if req_emi > max_emi * 1.1:
        conditions.append("Requested EMI exceeds affordability — reduce loan amount or extend tenure")

    if body.businessVintage < 2:
        conditions.append("Business vintage < 2 years — field verification required")

    if not reason_codes:
        reason_codes.append("Positive operating surplus across forecast horizon")
        reason_codes.append("Repayment history satisfactory")

    if decision in ("CONDITIONALLY_ELIGIBLE", "MANUAL_REVIEW") and not conditions:
        conditions.append("Field verification required")

    return decision, conditions, reason_codes


def _compute_recommended_limit(body, max_emi, decision) -> float:
    if decision == "NOT_ELIGIBLE":
        return 0.0
    # Max loan = max EMI × tenure (principal, ignoring interest for simplicity)
    capacity_limit = max_emi * body.requestedTenureMonths
    return round(min(body.requestedAmount, capacity_limit * 0.9), -3)


def _risk_band(prob: float) -> str:
    if prob < 0.20:
        return "Low"
    if prob < 0.45:
        return "Medium"
    if prob < 0.70:
        return "High"
    return "Very High"
