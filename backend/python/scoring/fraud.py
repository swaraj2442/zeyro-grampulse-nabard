"""Fraud risk evaluation rules.

Six rule-based signals are evaluated. Each signal contributes an additive
risk probability score (capped at 1.0). The final label is mapped from
the aggregate probability.
"""

from __future__ import annotations

from typing import Dict

from .models import FraudOutput

FeatureVector = Dict[str, float]

FRAUD_VERSION = "fraud_rules_v1"

# ---------------------------------------------------------------------------
# Individual signal evaluators
# ---------------------------------------------------------------------------

def _signal_loan_stacking(fv: FeatureVector) -> dict | None:
    if fv.get("emi.loan_stacking_signals", 0.0) == 1.0:
        return {
            "signal_type": "LOAN_STACKING",
            "description": "Multiple new EMI obligations opened in the last 30 days",
            "risk_contribution": 0.35,
        }
    return None


def _signal_sudden_behavior(fv: FeatureVector) -> dict | None:
    score = fv.get("volatility.sudden_behavior_change_score", 0.0)
    if score > 0.60:
        return {
            "signal_type": "SUDDEN_BEHAVIOUR_SHIFT",
            "description": "Spending z-score > 2 vs personal 60-day baseline",
            "risk_contribution": round(score * 0.25, 3),
        }
    return None


def _signal_high_velocity_p2p(fv: FeatureVector) -> dict | None:
    new_vpa = fv.get("network.new_vpa_ratio_30d", 0.0)
    p2p_ratio = fv.get("network.p2p_transfer_ratio", 0.0)
    if new_vpa > 0.50 and p2p_ratio > 0.40:
        return {
            "signal_type": "HIGH_VELOCITY_P2P",
            "description": "High proportion of transfers to new counterparties in 30 days",
            "risk_contribution": 0.15,
        }
    return None


def _signal_round_amount_transfers(fv: FeatureVector) -> dict | None:
    ratio = fv.get("behavior.round_amount_transfer_ratio", 0.0)
    if ratio > 0.60:
        return {
            "signal_type": "ROUND_AMOUNT_TRANSFER_CLUSTER",
            "description": "Unusually high proportion of round-amount P2P transfers",
            "risk_contribution": round(ratio * 0.15, 3),
        }
    return None


def _signal_bnpl_plus_stacking(fv: FeatureVector) -> dict | None:
    bnpl     = fv.get("emi.bnpl_activity_detected", 0.0) == 1.0
    stacking = fv.get("emi.loan_stacking_signals", 0.0) == 1.0
    if bnpl and stacking:
        return {
            "signal_type": "BNPL_STACKING_COMBO",
            "description": "BNPL activity combined with multiple new loan obligations",
            "risk_contribution": 0.10,
        }
    return None


def _signal_rapid_balance_depletion(fv: FeatureVector) -> dict | None:
    days = fv.get("cashflow.avg_days_to_near_zero", 30.0)
    if days < 8.0:
        contribution = round((8.0 - days) / 8.0 * 0.10, 3)
        return {
            "signal_type": "RAPID_BALANCE_DEPLETION",
            "description": "Balance depletes to near-zero within 8 days of salary credit",
            "risk_contribution": contribution,
        }
    return None


# ---------------------------------------------------------------------------
# Main fraud evaluator
# ---------------------------------------------------------------------------

def compute_fraud(fv: FeatureVector) -> FraudOutput:
    """Evaluate all fraud signals and return a structured FraudOutput."""
    evaluators = [
        _signal_loan_stacking,
        _signal_sudden_behavior,
        _signal_high_velocity_p2p,
        _signal_round_amount_transfers,
        _signal_bnpl_plus_stacking,
        _signal_rapid_balance_depletion,
    ]

    signals: list[dict] = []
    risk_prob: float = 0.0

    for evaluator in evaluators:
        result = evaluator(fv)
        if result is not None:
            signals.append(result)
            risk_prob += result["risk_contribution"]

    risk_prob = round(min(risk_prob, 1.0), 4)

    stacking_detected = fv.get("emi.loan_stacking_signals", 0.0) == 1.0
    network_anomaly   = round(
        fv.get("network.new_vpa_ratio_30d", 0.0) * 0.5
        + fv.get("network.p2p_transfer_ratio", 0.0) * 0.5,
        4,
    )

    # Map aggregate probability to label
    if risk_prob >= 0.55:   label = "VERY_HIGH"
    elif risk_prob >= 0.40: label = "HIGH"
    elif risk_prob >= 0.25: label = "MEDIUM"
    elif risk_prob >= 0.10: label = "LOW"
    else:                   label = "CLEAR"

    manual_review = label in ("HIGH", "VERY_HIGH")

    return FraudOutput(
        risk_label=label,
        risk_probability=risk_prob,
        signals=signals,
        stacking_detected=stacking_detected,
        network_anomaly_score=network_anomaly,
        manual_review_recommended=manual_review,
    )
