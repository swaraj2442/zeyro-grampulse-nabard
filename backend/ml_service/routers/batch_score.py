"""ml_service/routers/batch_score.py

POST /ml/batch-score

Accepts a list of enterprise IDs + their history data.
Returns risk assessments for all of them in a single call.
Called by the Go batch scorer goroutine at startup.
"""
from __future__ import annotations
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ml_service.routers.forecast import (
    MarketFeatures, WeatherFeatures, LoanObligations,
    _run_catboost, _normalise_ew, _inject_live_features,
)

router = APIRouter(prefix="/ml", tags=["batch"])

import pandas as pd


class EnterpriseScoreRequest(BaseModel):
    enterpriseId: str
    history: List[Dict[str, Any]]
    loanObligations: Optional[LoanObligations] = None


class BatchScoreRequest(BaseModel):
    enterprises: List[EnterpriseScoreRequest]
    marketFeatures: Optional[MarketFeatures] = None
    weatherFeatures: Optional[WeatherFeatures] = None


@router.post("/batch-score")
def batch_score(body: BatchScoreRequest):
    from ml_service.main import models, preprocessor, manifest, CATBOOST_AVAILABLE

    if not CATBOOST_AVAILABLE or len(models) < 18 or preprocessor is None:
        raise HTTPException(status_code=503, detail="Models not loaded")

    market = body.marketFeatures or MarketFeatures()
    weather = body.weatherFeatures or WeatherFeatures()

    scores = []
    errors = []

    for ent in body.enterprises:
        try:
            if not ent.history:
                continue
            history_df = pd.DataFrame(ent.history)
            loan = ent.loanObligations or LoanObligations()
            future_rows = history_df.tail(6).copy()
            _inject_live_features(future_rows, market, weather, loan)
            raw = _run_catboost(history_df, future_rows, models, preprocessor, manifest)
            ew = raw.get("early_warning", {})
            scores.append({
                "enterpriseId": ent.enterpriseId,
                "riskScore": ew.get("risk_score", 0),
                "riskLevel": ew.get("risk_level", "Low"),
                "forecastDeficit": ew.get("forecast_deficit", 0),
                "debtServiceShortfall": ew.get("debt_service_shortfall", 0),
                "stressMonth": ew.get("stress_month", ""),
                "warningLeadTimeDays": ew.get("warning_lead_time_days", 0),
                "drivers": ew.get("drivers", []),
                "isLatest": True,
            })
        except Exception as e:
            errors.append({"enterpriseId": ent.enterpriseId, "error": str(e)})

    return {
        "scored": len(scores),
        "errors": len(errors),
        "scores": scores,
        "errorDetails": errors[:10],  # truncate to avoid large payloads
    }
