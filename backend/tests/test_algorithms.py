"""Algorithm unit test suite for Zeyro scoring engine.

Run with:
    source .venv/bin/activate
    pytest tests/test_algorithms.py -v

All tests must pass before any service code is updated.
"""

from __future__ import annotations

import copy
import math

import pytest

# ---------------------------------------------------------------------------
# Import scoring module (PYTHONPATH must include project root or `python/`)
# ---------------------------------------------------------------------------
from scoring import (
    compute_atp,
    compute_bfs,
    compute_fraud,
    compute_rps,
    generate_random_fv,
    probability_to_bfs,
    RAHUL_FV,
    PRIYA_FV,
    MOHAMMED_FV,
    SUNITA_FV,
    VIKRAM_FV,
)
from scoring.models import BFSOutput, FraudOutput, ATPOutput


# ============================================================
# Helper
# ============================================================

def determine_overall_signal(bfs: BFSOutput, fraud: FraudOutput, atp: ATPOutput) -> str:
    """Mirror of the orchestrator logic used in deterministic signal tests."""
    if fraud.risk_label in ("HIGH", "VERY_HIGH"):
        return "DECLINE"
    if bfs.thin_file or bfs.confidence == "LOW":
        return "REVIEW"
    if bfs.score >= 650 and fraud.risk_label == "CLEAR":
        return "PROCEED"
    if bfs.score >= 500:
        return "REVIEW"
    return "DECLINE"


# ============================================================
# BFS Tests
# ============================================================

class TestBFS:

    def test_score_range_random(self):
        """Score is always within [300, 900] for 500 random feature vectors."""
        for i in range(500):
            fv = generate_random_fv(seed=i)
            result = compute_bfs(fv)
            assert 300 <= result.score <= 900, (
                f"seed={i}: score {result.score} out of range"
            )

    def test_persona_scores(self):
        """Five demo personas land in expected BFS ranges."""
        assert 700 <= compute_bfs(RAHUL_FV).score    <= 760, "Rahul out of range"
        assert 580 <= compute_bfs(PRIYA_FV).score    <= 650, "Priya out of range"
        assert 650 <= compute_bfs(MOHAMMED_FV).score <= 710, "Mohammed out of range"
        assert 480 <= compute_bfs(SUNITA_FV).score   <= 545, "Sunita out of range"
        assert 440 <= compute_bfs(VIKRAM_FV).score   <= 510, "Vikram out of range"

    def test_thin_file_always_low_confidence(self):
        """Sunita (thin file) must have LOW confidence."""
        result = compute_bfs(SUNITA_FV)
        assert result.thin_file is True
        assert result.confidence == "LOW"

    def test_monotonicity_emi_ratio(self):
        """Higher EMI-to-income ratio → lower score, all else equal."""
        base     = copy.deepcopy(RAHUL_FV)
        high_emi = {**base, "emi.emi_to_income_ratio": 0.7}
        low_emi  = {**base, "emi.emi_to_income_ratio": 0.1}
        assert compute_bfs(high_emi).score < compute_bfs(low_emi).score

    def test_monotonicity_savings(self):
        """Higher savings ratio → higher score, all else equal."""
        base     = dict(RAHUL_FV)
        high_sav = {**base, "savings.savings_to_income_ratio": 0.25}
        low_sav  = {**base, "savings.savings_to_income_ratio": 0.01}
        assert compute_bfs(high_sav).score > compute_bfs(low_sav).score

    def test_bfs_formula_anchors(self):
        """probability_to_bfs matches the three calibration anchors."""
        assert probability_to_bfs(0.50) == 600
        assert 735 <= probability_to_bfs(0.05) <= 765
        assert probability_to_bfs(0.70) == 300

    def test_adverse_action_codes_on_decline(self):
        """Vikram (poor score) must have at least 2 adverse action reasons."""
        result = compute_bfs(VIKRAM_FV)
        assert result.score < 550
        assert len(result.adverse_action_reasons) >= 2

    def test_stacking_produces_aa05(self):
        """Vikram's stacking flag must surface adverse code AA05."""
        result = compute_bfs(VIKRAM_FV)
        codes = [a.code for a in result.adverse_action_reasons]
        assert "AA05" in codes, f"Expected AA05 in {codes}"

    def test_thin_file_flag_set_correctly(self):
        """thin_file=True only when quality.thin_file_flag is 1.0."""
        assert compute_bfs(SUNITA_FV).thin_file is True
        assert compute_bfs(RAHUL_FV).thin_file is False

    def test_good_profile_high_confidence(self):
        """Rahul has long coverage, multi-source, zero gaps → HIGH confidence."""
        result = compute_bfs(RAHUL_FV)
        assert result.confidence == "HIGH"


# ============================================================
# ATP Tests
# ============================================================

class TestATP:

    def test_zero_income(self):
        """Zero income → non-positive surplus and infinite ratio."""
        fv = {**RAHUL_FV, "income.avg_monthly_credit_inr": 0}
        result = compute_atp(fv, requested_emi_inr=5000)
        assert result.monthly_surplus_inr <= 0
        assert math.isinf(result.ratio_at_requested_emi)

    def test_haircut_triggers_below_threshold(self):
        """regularity < 0.60 → haircut applied."""
        fv = {**PRIYA_FV, "income.income_regularity_score": 0.45}
        result = compute_atp(fv, requested_emi_inr=5000)
        assert result.income_haircut_applied is True

    def test_haircut_does_not_trigger_above_threshold(self):
        """Rahul with regularity 0.91 → no haircut."""
        result = compute_atp(RAHUL_FV, requested_emi_inr=5000)
        assert result.income_haircut_applied is False

    def test_ratio_affordable_for_rahul(self):
        """Small EMI request vs Rahul's income → ratio well below 0.5."""
        result = compute_atp(RAHUL_FV, requested_emi_inr=3000)
        assert result.ratio_at_requested_emi < 0.5

    def test_ratio_exceeds_capacity_for_sunita(self):
        """Large EMI vs Sunita's thin income → ratio > 1.0."""
        result = compute_atp(SUNITA_FV, requested_emi_inr=25000)
        assert result.ratio_at_requested_emi > 1.0

    def test_max_recommended_emi_positive_for_rahul(self):
        """Rahul has surplus → positive max recommended EMI."""
        result = compute_atp(RAHUL_FV, requested_emi_inr=5000)
        assert result.max_recommended_emi_inr > 0

    def test_haircut_reduces_conservative_income(self):
        """With haircut, conservative_income < avg income."""
        fv = {**PRIYA_FV, "income.income_regularity_score": 0.40}
        result = compute_atp(fv, requested_emi_inr=5000)
        avg_income = fv["income.avg_monthly_credit_inr"]
        assert result.conservative_income_used < avg_income


# ============================================================
# RPS Tests
# ============================================================

class TestRPS:

    def test_rahul_high_propensity(self):
        """Rahul — stable income + positive trend → HIGH repayment propensity."""
        result = compute_rps(RAHUL_FV)
        assert result.label == "HIGH"

    def test_vikram_low_propensity(self):
        """Vikram — stacking + stress → LOW with predicted default window."""
        result = compute_rps(VIKRAM_FV)
        assert result.label == "LOW"
        assert result.predicted_default_window_days is not None
        assert 7 <= result.predicted_default_window_days <= 90

    def test_probability_in_valid_range(self):
        """RPS probability always in [0, 1]."""
        for name, fv in [("Rahul", RAHUL_FV), ("Vikram", VIKRAM_FV),
                          ("Sunita", SUNITA_FV), ("Priya", PRIYA_FV)]:
            prob = compute_rps(fv).probability
            assert 0.0 <= prob <= 1.0, f"{name}: prob {prob} out of range"

    def test_no_default_window_for_high(self):
        """HIGH label → predicted_default_window_days is None."""
        result = compute_rps(RAHUL_FV)
        assert result.label == "HIGH"
        assert result.predicted_default_window_days is None


# ============================================================
# Fraud Tests
# ============================================================

class TestFraud:

    def test_rahul_clear(self):
        """Rahul — clean profile → CLEAR risk, no stacking."""
        result = compute_fraud(RAHUL_FV)
        assert result.risk_label == "CLEAR"
        assert result.stacking_detected is False

    def test_vikram_high_risk(self):
        """Vikram — stacking + high-velocity P2P → HIGH or VERY_HIGH."""
        result = compute_fraud(VIKRAM_FV)
        assert result.risk_label in ("HIGH", "VERY_HIGH")
        assert result.stacking_detected is True

    def test_vikram_loan_stacking_signal(self):
        """Vikram's signal list must include LOAN_STACKING."""
        result = compute_fraud(VIKRAM_FV)
        signal_types = [s["signal_type"] for s in result.signals]
        assert "LOAN_STACKING" in signal_types

    def test_manual_review_on_high(self):
        """HIGH/VERY_HIGH risk → manual_review_recommended True."""
        result = compute_fraud(VIKRAM_FV)
        assert result.manual_review_recommended is True

    def test_no_manual_review_on_clear(self):
        """CLEAR risk → manual_review_recommended False."""
        result = compute_fraud(RAHUL_FV)
        assert result.manual_review_recommended is False

    def test_risk_probability_in_range(self):
        """Fraud probability always in [0, 1]."""
        for name, fv in [("Rahul", RAHUL_FV), ("Vikram", VIKRAM_FV)]:
            prob = compute_fraud(fv).risk_probability
            assert 0.0 <= prob <= 1.0, f"{name}: fraud prob {prob} out of range"


# ============================================================
# Overall Signal Logic Tests
# ============================================================

class TestOverallSignal:

    def test_fraud_high_always_declines(self):
        """Even with an excellent BFS, HIGH fraud → DECLINE."""
        fraud = FraudOutput(
            risk_label="HIGH", risk_probability=0.6,
            signals=[], stacking_detected=True,
            network_anomaly_score=0.5,
            manual_review_recommended=True,
        )
        bfs = BFSOutput(
            score=720, band="GOOD", confidence="HIGH",
            version="test", adverse_action_reasons=[],
            thin_file=False,
        )
        atp = ATPOutput(
            monthly_surplus_inr=20000, max_recommended_emi_inr=10000,
            ratio_at_requested_emi=0.3,
            income_haircut_applied=False, conservative_income_used=40000,
        )
        assert determine_overall_signal(bfs, fraud, atp) == "DECLINE"

    def test_thin_file_always_review(self):
        """Thin file (LOW confidence) → REVIEW even with good score."""
        bfs = BFSOutput(
            score=720, band="GOOD", confidence="LOW",
            version="test", adverse_action_reasons=[],
            thin_file=True,
        )
        fraud = FraudOutput(
            risk_label="CLEAR", risk_probability=0.02,
            signals=[], stacking_detected=False,
            network_anomaly_score=0.05,
            manual_review_recommended=False,
        )
        atp = ATPOutput(
            monthly_surplus_inr=20000, max_recommended_emi_inr=10000,
            ratio_at_requested_emi=0.3,
            income_haircut_applied=False, conservative_income_used=40000,
        )
        assert determine_overall_signal(bfs, fraud, atp) == "REVIEW"

    def test_good_profile_proceeds(self):
        """Rahul-equivalent: score ≥ 650, CLEAR fraud, HIGH confidence → PROCEED."""
        bfs   = compute_bfs(RAHUL_FV)
        fraud = compute_fraud(RAHUL_FV)
        atp   = compute_atp(RAHUL_FV)
        assert determine_overall_signal(bfs, fraud, atp) == "PROCEED"

    def test_vikram_declines(self):
        """Vikram: HIGH fraud → DECLINE."""
        bfs   = compute_bfs(VIKRAM_FV)
        fraud = compute_fraud(VIKRAM_FV)
        atp   = compute_atp(VIKRAM_FV)
        assert determine_overall_signal(bfs, fraud, atp) == "DECLINE"
