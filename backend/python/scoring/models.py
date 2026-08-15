"""Pydantic output contract models for the Zeyro scoring engine.

This file is the canonical definition of all response shapes.
It does not change unless a new product is added or upstream data changes.
"""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field


class AdverseAction(BaseModel):
    code: str
    description: str


class BFSOutput(BaseModel):
    score: int = Field(..., ge=300, le=900, description="Behavioural Finance Score (300-900)")
    band: str = Field(..., description="EXCELLENT|GOOD|FAIR|POOR|VERY_POOR")
    confidence: str = Field(..., description="HIGH|MEDIUM|LOW")
    version: str
    adverse_action_reasons: list[AdverseAction]
    thin_file: bool
    percentile_in_cohort: float = 0.0
    expert_routing: dict[str, float] = {}   # populated in MoE phase


class RPSOutput(BaseModel):
    probability: float = Field(..., ge=0.0, le=1.0)
    label: str = Field(..., description="HIGH|MEDIUM|LOW")
    predicted_default_window_days: Optional[int] = None
    confidence: str
    version: str
    adverse_action_reasons: list[AdverseAction] = Field(default_factory=list)


class ATPOutput(BaseModel):
    monthly_surplus_inr: float
    max_recommended_emi_inr: float
    ratio_at_requested_emi: float   # may be inf if surplus is zero/negative
    income_haircut_applied: bool
    conservative_income_used: float


class FraudOutput(BaseModel):
    risk_label: str = Field(..., description="CLEAR|LOW|MEDIUM|HIGH|VERY_HIGH")
    risk_probability: float = Field(..., ge=0.0, le=1.0)
    signals: list[dict]
    stacking_detected: bool
    network_anomaly_score: float
    manual_review_recommended: bool


class AssessmentResponse(BaseModel):
    assessment_id: str
    partner_ref_id: Optional[str] = None
    status: str
    generated_at: str
    bfs: Optional[BFSOutput] = None
    rps: Optional[RPSOutput] = None
    atp: Optional[ATPOutput] = None
    fraud: Optional[FraudOutput] = None
    overall_signal: str = Field(..., description="PROCEED|REVIEW|DECLINE")
    risk_narrative: Optional[str] = None
    model_versions: dict[str, str] = {}
