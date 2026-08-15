"""ml_service/routers/risk.py

POST /ml/early-warning

Accepts a completed forecast + enterprise attributes.
Runs the risk engine and returns a structured early-warning record.
"""
from __future__ import annotations
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/ml", tags=["risk"])


class EarlyWarningRequest(BaseModel):
    enterpriseId: str
    forecast: List[Dict[str, Any]]   # normalised forecast months from /ml/forecast
    currentDpd: int = 0
    repaymentDelayCount6m: int = 0
    outstandingAmount: float = 0.0
    scheduledEmiMonthly: float = 0.0
    marketRiskScore: Optional[float] = None
    climateRiskScore: Optional[float] = None


@router.post("/early-warning")
def get_early_warning(body: EarlyWarningRequest):
    """Re-evaluate risk from a pre-computed forecast + current context."""
    if not body.forecast:
        raise HTTPException(status_code=422, detail="forecast must not be empty")

    try:
        import pandas as pd
        from dummtdatasets.cashflow.nabard_cashflow_utils import build_early_warning

        # Reconstruct a mini future DataFrame for build_early_warning
        rows = []
        for i, m in enumerate(body.forecast):
            rows.append({
                "horizon": i + 1,
                "pred_operating_inflow": m.get("operatingInflow", 0),
                "pred_operating_outflow": m.get("operatingOutflow", 0),
                "pred_closing_cash_balance": m.get("closingCashBalance", 0),
                "pred_cash_after_debt": m.get("cashAfterDebtService", 0),
                "scheduled_emi": body.scheduledEmiMonthly,
                "scheduled_loan_repayment": 0,
                "date": f"2026-{8 + i:02d}-01",
                "time_idx": i,
            })
        future_df = pd.DataFrame(rows)
        # Rename columns to match build_early_warning expectations
        future_df["pred_cash_after_debt"] = future_df["pred_cash_after_debt"]

        latest_context = {
            "entity_id": body.enterpriseId,
            "days_past_due": body.currentDpd,
            "repayment_delay_count_6m": body.repaymentDelayCount6m,
            "loan_outstanding": body.outstandingAmount,
        }

        record = build_early_warning(body.enterpriseId, future_df, latest_context)

        return {
            "enterpriseId": body.enterpriseId,
            "riskScore": record.risk_score,
            "riskLevel": record.risk_level,
            "forecastDeficit": record.forecast_deficit,
            "debtServiceShortfall": record.debt_service_shortfall,
            "stressMonth": record.stress_month,
            "warningLeadTimeDays": record.warning_lead_time_days,
            "drivers": [
                {"feature": d.feature, "observedValue": d.observed_value,
                 "unit": d.unit, "contributionPoints": d.contribution_points,
                 "explanation": d.explanation}
                for d in record.drivers
            ],
            "recommendedIntervention": record.recommended_intervention,
        }

    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Risk engine error: {e}")
