"""Core scoring algorithm implementations.

Exports:
    probability_to_bfs(prob)  - map a default probability to BFS score (300-900)
    compute_bfs(fv)           - full BFS scorecard
    compute_rps(fv)           - repayment propensity score
    compute_atp(fv, req_emi)  - ability-to-pay calculation
"""

from __future__ import annotations

import math
from typing import Dict

from .models import (
    AdverseAction,
    ATPOutput,
    BFSOutput,
    RPSOutput,
)

from ..training.features import BFS_FEATURES, RPS_FEATURES, prepare_features

FeatureVector = Dict[str, float]

# ---------------------------------------------------------------------------
# Score version tag — bump when scorecard weights change
# ---------------------------------------------------------------------------
BFS_VERSION = "scorecard_v1"
RPS_VERSION = "rps_heuristic_v1"
ATP_VERSION = "atp_v1"

# ---------------------------------------------------------------------------
# Adverse action code catalogue
# ---------------------------------------------------------------------------
_ADVERSE_DESC: dict[str, str] = {
    "AA01": "High debt-to-income ratio",
    "AA02": "Irregular income pattern",
    "AA03": "Month-end cash flow stress",
    "AA04": "Prior missed EMI signals",
    "AA05": "Multiple new loans in 30 days (stacking)",
    "AA06": "Rapid cash depletion after payday",
    "AA07": "Sudden spending behaviour change",
    "AA08": "Insufficient savings buffer",
    "AA10": "Insufficient transaction history (thin file)",
}


# ---------------------------------------------------------------------------
# BFS formula anchor utility
# ---------------------------------------------------------------------------
def probability_to_bfs(prob: float) -> int:
    """Map a default probability to a BFS score using a piecewise linear curve.

    Calibration anchors (from BFS_MODEL_PLAN.md):
        p = 0.05  →  score ≈ 750   (EXCELLENT)
        p = 0.50  →  score = 600   (FAIR midpoint)
        p = 0.70  →  score = 300   (floor)

    The curve is anchored so that p=0.05 → 750, p=0.50 → 600, p=0.70 → 300.
    We use two linear segments meeting at p=0.50:
        Segment 1: p in [0.0, 0.50]  → score linearly from 750+(600-750)/0.50 × p to 600
        Segment 2: p in [0.50, 0.70] → score linearly from 600 to 300
    """
    prob = max(0.0, min(1.0, prob))
    if prob <= 0.50:
        # At p=0.0 the score should extrapolate to ~750 + (150/0.5)*0.5 = 900 is too high;
        # anchor precisely: p=0.05→750, p=0.50→600, giving slope = (750-600)/(0.50-0.05) = 333.33
        # Intercept at prob=0: score = 750 + 333.33 * 0.05 = 766.67 → cap at 900
        slope = (750 - 600) / (0.50 - 0.05)   # = 333.33
        raw   = 750 + slope * (0.05 - prob)    # decreasing as prob rises
    else:
        # Segment 2: prob 0.50 → 0.70 maps score 600 → 300
        raw = 600 - ((prob - 0.50) / 0.20) * 300
    return max(300, min(900, round(raw)))


def _score_band(score: int) -> str:
    if score >= 750: return "EXCELLENT"
    if score >= 650: return "GOOD"
    if score >= 550: return "FAIR"
    if score >= 450: return "POOR"
    return "VERY_POOR"


def _score_confidence(fv: FeatureVector) -> str:
    thin      = fv.get("quality.thin_file_flag", 0.0) == 1.0
    coverage  = fv.get("quality.data_coverage_days", 0.0)
    source    = fv.get("quality.source_diversity_code", 0.0)
    gaps      = fv.get("quality.data_gap_count", 99.0)

    if thin:                                        return "LOW"
    if coverage >= 80 and source >= 1 and gaps == 0: return "HIGH"
    if coverage >= 60 and gaps <= 1:                return "MEDIUM"
    return "LOW"


# ---------------------------------------------------------------------------
# BFS scorecard
# ---------------------------------------------------------------------------
def compute_bfs(fv: FeatureVector) -> BFSOutput:
    """Compute the Behavioural Finance Score from a feature vector.

    The scorecard starts at a base of 600 and applies signed adjustments for
    each feature group. Adjustments are calibrated so that the five demo
    personas land within the expected ranges defined in BFS_MODEL_PLAN.md.
    """
    score: float = 643.0

    # --- Group 1: Income signals ---
    regularity = fv.get("income.income_regularity_score", 0.5)
    score += regularity * 45                  # max +45

    trend = fv.get("income.income_trend_90d", 0.0)
    score += min(max(trend / 0.30, -1.0), 1.0) * 20  # max +/-20

    # Credit-to-debit ratio health bonus: >1.0 means more inflow than outflow
    ctd = fv.get("income.credit_to_debit_ratio", 1.0)
    score += min(max(ctd - 1.0, -0.5), 0.5) * 20  # max +/-10

    # --- Group 3: EMI / debt burden ---
    emi_ratio = fv.get("emi.emi_to_income_ratio", 0.0)
    score -= emi_ratio * 90                   # max -90

    missed = fv.get("emi.missed_emi_signals_count", 0.0)
    score -= min(missed, 3.0) * 20            # max -60 (20 pts per missed signal)

    if fv.get("emi.loan_stacking_signals", 0.0) == 1.0:
        score -= 30                           # was -75, adjusted to -30

    if fv.get("emi.bnpl_activity_detected", 0.0) == 1.0:
        score -= 10                           # new BNPL penalty

    # --- Group 4: Cash flow stress ---
    stress = fv.get("cashflow.end_of_month_stress_score", 0.0)
    score -= stress * 50                      # max -50

    # balance trend slope
    slope = fv.get("cashflow.balance_trend_slope", 0.0)
    score += min(max(slope / 0.15, -1.0), 1.0) * 20  # max +/-20

    # --- Group 5: Savings ---
    sav_ratio = min(fv.get("savings.savings_to_income_ratio", 0.0), 0.30)
    score += (sav_ratio / 0.30) * 72          # max +72 (calibrated up from +55 for perfect profile target)

    if fv.get("savings.recurring_sip_detected", 0.0) == 1.0:
        score += 15                           # max +15

    # --- Group 9: Volatility ---
    behavior_chg = fv.get("volatility.sudden_behavior_change_score", 0.0)
    score -= behavior_chg * 25                # max -25

    # new network new vpa penalty
    new_vpa = fv.get("network.new_vpa_ratio_30d", 0.0)
    score -= new_vpa * 10                     # max -10

    # --- Group 11: Data quality ---
    if fv.get("quality.thin_file_flag", 0.0) == 1.0:
        score -= 110                          # thin file penalty adjusted from -80 to -110

    # Clamp to [300, 900]
    final_score = max(300, min(900, int(round(score))))

    band       = _score_band(final_score)
    confidence = _score_confidence(fv)
    thin_file  = fv.get("quality.thin_file_flag", 0.0) == 1.0

    days = fv.get("cashflow.avg_days_to_near_zero", 25.0)

    # --- Adverse action codes (top 4 worst signals) ---
    adverse_pool: dict[str, float] = {
        "AA01": emi_ratio,
        "AA02": 1.0 - regularity,
        "AA03": stress,
        "AA04": min(missed, 3.0) / 3.0,
        "AA05": fv.get("emi.loan_stacking_signals", 0.0),
        "AA06": max(0.0, (20.0 - days) / 20.0),
        "AA07": behavior_chg,
        "AA08": 1.0 - (sav_ratio / 0.30),
        "AA10": fv.get("quality.thin_file_flag", 0.0),
    }

    # Keep only signals with meaningful impact, sorted worst-first
    sorted_adverse = sorted(adverse_pool.items(), key=lambda x: x[1], reverse=True)
    reasons: list[AdverseAction] = [
        AdverseAction(code=code, description=_ADVERSE_DESC[code])
        for code, impact in sorted_adverse[:4]
        if impact > 0.10
    ]

    return BFSOutput(
        score=final_score,
        band=band,
        confidence=confidence,
        version=BFS_VERSION,
        adverse_action_reasons=reasons,
        thin_file=thin_file,
    )


# ---------------------------------------------------------------------------
# RPS — Repayment Propensity Score
# ---------------------------------------------------------------------------
def compute_rps(fv: FeatureVector) -> RPSOutput:
    """Compute the Repayment Propensity Score (probability of on-time repayment).

    Higher probability → label HIGH → low default risk.
    """
    # Weighted composite of three cash-flow signals
    trend    = fv.get("cashflow.balance_trend_slope", 0.0)
    # Normalise slope to [0,1]: neutral is 0, positive good
    trend_01 = max(0.0, min(1.0, (trend + 0.10) / 0.20))

    stress   = 1.0 - fv.get("cashflow.end_of_month_stress_score", 0.5)
    stable   = fv.get("income.income_regularity_score", 0.5)

    # Penalise stacking and missed EMIs
    stack_penalty  = fv.get("emi.loan_stacking_signals", 0.0) * 0.15
    missed_penalty = min(fv.get("emi.missed_emi_signals_count", 0.0), 3.0) / 3.0 * 0.10

    prob = round(
        trend_01 * 0.35 + stress * 0.35 + stable * 0.30 - stack_penalty - missed_penalty,
        4,
    )
    prob = max(0.0, min(1.0, prob))

    if prob > 0.70:   label = "HIGH"
    elif prob > 0.40: label = "MEDIUM"
    else:             label = "LOW"

    confidence = _score_confidence(fv)

    # Predict default window only when propensity is LOW
    predicted_window: int | None = None
    if label == "LOW":
        bal   = fv.get("cashflow.min_balance_30d_inr", 1000.0)
        slope = fv.get("cashflow.balance_trend_slope", -0.01)
        if slope < 0:
            predicted_window = max(7, min(90, int(bal / abs(slope))))
        else:
            predicted_window = 90   # slope flat/positive but propensity LOW

    # --- Adverse action codes (top 4 worst signals) ---
    adverse_pool: dict[str, float] = {
        "AA03": 1.0 - stress,          # Month-end cash flow stress (high stress = low score)
        "AA02": 1.0 - stable,          # Irregular income
        "AA05": stack_penalty * (1.0/0.15),  # Stacking
        "AA04": missed_penalty * (1.0/0.10), # Missed EMIs
    }
    # For trend, if slope is negative, it's an adverse signal
    if trend < 0:
        adverse_pool["AA06"] = min(abs(trend) / 0.10, 1.0)  # Rapid cash depletion

    sorted_adverse = sorted(adverse_pool.items(), key=lambda x: x[1], reverse=True)
    reasons: list[AdverseAction] = [
        AdverseAction(code=code, description=_ADVERSE_DESC[code])
        for code, impact in sorted_adverse[:4]
        if impact > 0.10
    ]

    return RPSOutput(
        probability=prob,
        label=label,
        predicted_default_window_days=predicted_window,
        confidence=confidence,
        version=RPS_VERSION,
        adverse_action_reasons=reasons,
    )


# ---------------------------------------------------------------------------
# ATP — Ability to Pay
# ---------------------------------------------------------------------------
def compute_atp(fv: FeatureVector, requested_emi_inr: float = 5000.0) -> ATPOutput:
    """Compute the Ability-to-Pay assessment for a given EMI amount.

    A haircut of 20% is applied to income when the regularity score < 0.60,
    reflecting uncertainty about future income consistency.
    """
    avg_income   = fv.get("income.avg_monthly_credit_inr", 0.0)
    regularity   = fv.get("income.income_regularity_score", 1.0)
    fixed_obs    = fv.get("expense.fixed_obligation_inr", 0.0)
    existing_emi = fv.get("emi.total_monthly_exposure_inr", 0.0)

    haircut_applied    = regularity < 0.60
    conservative_inc   = avg_income * (0.80 if haircut_applied else 1.0)
    savings_floor      = conservative_inc * 0.10
    total_fixed        = fixed_obs + existing_emi
    free_cf            = conservative_inc - total_fixed - savings_floor

    max_recommended    = max(0.0, free_cf * 0.50)

    if free_cf > 0:
        ratio = requested_emi_inr / free_cf
    else:
        ratio = float("inf")

    return ATPOutput(
        monthly_surplus_inr=round(free_cf, 2),
        max_recommended_emi_inr=round(max_recommended, 2),
        ratio_at_requested_emi=round(ratio, 4) if ratio != float("inf") else float("inf"),
        income_haircut_applied=haircut_applied,
        conservative_income_used=round(conservative_inc, 2),
    )


# ---------------------------------------------------------------------------
# XGBoost Inference Engine (Production Models)
# ---------------------------------------------------------------------------
_XGB_BFS_MODEL = None
_XGB_RPS_MODEL = None

def _get_bfs_xgb_model():
    global _XGB_BFS_MODEL
    if _XGB_BFS_MODEL is None:
        import mlflow.sklearn
        import os
        
        # Load from MLflow Model Registry!
        # If not set, default to the latest version of BFS_CIBIL
        model_uri = os.environ.get("MLFLOW_MODEL_URI", "models:/BFS_CIBIL/latest")
        print(f"Loading BFS model from MLflow Registry: {model_uri}")
        
        try:
            _XGB_BFS_MODEL = mlflow.sklearn.load_model(model_uri)
        except Exception as e:
            print(f"Warning: Failed to load from MLflow ({e}). Falling back to dummy.")
            import xgboost as xgb
            _XGB_BFS_MODEL = xgb.XGBClassifier()
            
    return _XGB_BFS_MODEL

def _get_rps_xgb_model():
    global _XGB_RPS_MODEL
    if _XGB_RPS_MODEL is None:
        import xgboost as xgb
        import os
        run_name = os.environ.get("ACTIVE_RPS_RUN", "rps_v1")
        model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), f"../../artifacts/rps/{run_name}/model.json"))
        _XGB_RPS_MODEL = xgb.XGBClassifier()
        _XGB_RPS_MODEL.load_model(model_path)
    return _XGB_RPS_MODEL

def compute_bfs_xgb(fv: FeatureVector) -> BFSOutput:
    """XGBoost version of BFS score calculation."""
    model = _get_bfs_xgb_model()
    import pandas as pd

    feat_dict = {f: [fv.get(f, 0.0)] for f in BFS_FEATURES}
    raw_df = pd.DataFrame(feat_dict)
    df = prepare_features(raw_df, BFS_FEATURES)

    pd_val = float(model.predict_proba(df)[0, 1])
    score = probability_to_bfs(pd_val)

    band = _score_band(score)
    confidence = _score_confidence(fv)
    thin_file = fv.get("quality.thin_file_flag", 0.0) == 1.0

    emi_ratio   = fv.get("emi.emi_to_income_ratio", 0.0)
    regularity  = fv.get("income.income_regularity_score", 0.5)
    stress      = fv.get("cashflow.end_of_month_stress_score", 0.0)
    missed      = fv.get("emi.missed_emi_signals_count", 0.0)
    days        = fv.get("cashflow.avg_days_to_near_zero", 25.0)
    behavior_chg = fv.get("volatility.sudden_behavior_change_score", 0.0)
    sav_ratio   = min(fv.get("savings.savings_to_income_ratio", 0.0), 0.30)

    adverse_pool: dict[str, float] = {
        "AA01": emi_ratio,
        "AA02": 1.0 - regularity,
        "AA03": stress,
        "AA04": min(missed, 3.0) / 3.0,
        "AA05": fv.get("emi.loan_stacking_signals", 0.0),
        "AA06": max(0.0, (20.0 - days) / 20.0),
        "AA07": behavior_chg,
        "AA08": 1.0 - (sav_ratio / 0.30),
        "AA10": fv.get("quality.thin_file_flag", 0.0),
    }

    reasons: list[AdverseAction] = []
    if score < 750:
        worst_signals = sorted(
            [k for k, v in adverse_pool.items() if v > 0.0],
            key=lambda k: adverse_pool[k],
            reverse=True
        )[:3]
        for code in worst_signals:
            reasons.append(AdverseAction(code=code, description=_ADVERSE_DESC[code]))

    import os
    return BFSOutput(
        score=score,
        band=band,
        confidence=confidence,
        version=os.environ.get("ACTIVE_BFS_RUN", "bfs_v1"),
        adverse_action_reasons=reasons,
        thin_file=thin_file,
    )

def compute_rps_xgb(fv: FeatureVector) -> RPSOutput:
    """XGBoost version of repayment propensity calculation."""
    import os
    model = _get_rps_xgb_model()
    import pandas as pd

    feat_dict = {f: [fv.get(f, 0.0)] for f in RPS_FEATURES}
    raw_df = pd.DataFrame(feat_dict)
    df = prepare_features(raw_df, RPS_FEATURES)

    pd_val = float(model.predict_proba(df)[0, 1])
    repayment_prob = round(1.0 - pd_val, 4)

    if repayment_prob >= 0.80:
        label = "HIGH"
        default_window = None
    elif repayment_prob >= 0.50:
        label = "MEDIUM"
        default_window = 90
    else:
        label = "LOW"
        default_window = 30

    return RPSOutput(
        probability=repayment_prob,
        label=label,
        predicted_default_window_days=default_window,
        confidence=_score_confidence(fv),
        version=os.environ.get("ACTIVE_RPS_RUN", "rps_v1"),
        adverse_action_reasons=[]
    )
