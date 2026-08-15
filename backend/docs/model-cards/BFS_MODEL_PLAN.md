Direct answer: start with the output contract and work backwards.

Everything in your architecture, all five documents, all the math — it only matters if the API returns the right JSON reliably. So the implementation sequence is:

**Step 1 — Lock the contract (today, 2 hours)**

Before writing a single algorithm file, write `models.py` with every Pydantic schema. `BFSOutput`, `RPSOutput`, `ATPOutput`, `FraudOutput`, `AssessmentResponse`. Every field, every type, every default. This file changes zero times after today. If you ever feel the urge to change it, you're either adding a new product or something upstream is wrong.

```python
# models.py — write this first, nothing else
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AdverseAction(BaseModel):
    code: str
    description: str

class BFSOutput(BaseModel):
    score: int                                    # 300-900
    band: str                                     # EXCELLENT|GOOD|FAIR|POOR|VERY_POOR
    confidence: str                               # HIGH|MEDIUM|LOW
    version: str                                  # e.g. "scorecard_v1"
    adverse_action_reasons: list[AdverseAction]
    thin_file: bool
    percentile_in_cohort: float = 0.0
    expert_routing: dict[str, float] = {}         # populated in MoE phase

class RPSOutput(BaseModel):
    probability: float
    label: str
    predicted_default_window_days: Optional[int]
    confidence: str
    version: str

class ATPOutput(BaseModel):
    monthly_surplus_inr: float
    max_recommended_emi_inr: float
    ratio_at_requested_emi: float
    income_haircut_applied: bool
    conservative_income_used: float

class FraudOutput(BaseModel):
    risk_label: str
    risk_probability: float
    signals: list[dict]
    stacking_detected: bool
    network_anomaly_score: float
    manual_review_recommended: bool

class AssessmentResponse(BaseModel):
    assessment_id: str
    partner_ref_id: Optional[str]
    status: str
    generated_at: str
    bfs: Optional[BFSOutput]
    rps: Optional[RPSOutput]
    atp: Optional[ATPOutput]
    fraud: Optional[FraudOutput]
    overall_signal: str                           # PROCEED|REVIEW|DECLINE
    risk_narrative: Optional[str]
    model_versions: dict[str, str]
```

Once this exists, everything else is implementation detail.

---

**Step 2 — Set up the test harness before any algorithm (today, 1 hour)**

This is the most counterintuitive thing: write your tests before your algorithms. The tests define what "working" means. Without them you'll spend hours eyeballing outputs and guessing if they're right.

```python
# tests/test_algorithms.py

import pytest
from fixtures import RAHUL_FV, PRIYA_FV, MOHAMMED_FV, SUNITA_FV, VIKRAM_FV

class TestBFS:
    def test_score_range(self):
        """Score always 300-900, no exceptions"""
        from scoring import compute_bfs
        import random
        for _ in range(500):
            fv = generate_random_fv()  # all features in valid ranges
            result = compute_bfs(fv)
            assert 300 <= result.score <= 900

    def test_persona_scores(self):
        """Five demo personas land in expected ranges"""
        from scoring import compute_bfs
        assert 700 <= compute_bfs(RAHUL_FV).score    <= 760
        assert 580 <= compute_bfs(PRIYA_FV).score    <= 650
        assert 650 <= compute_bfs(MOHAMMED_FV).score <= 710
        assert 480 <= compute_bfs(SUNITA_FV).score   <= 545
        assert 440 <= compute_bfs(VIKRAM_FV).score   <= 510

    def test_thin_file_always_low_confidence(self):
        from scoring import compute_bfs
        result = compute_bfs(SUNITA_FV)
        assert result.thin_file == True
        assert result.confidence == "LOW"

    def test_monotonicity_emi_ratio(self):
        """Higher EMI ratio → lower score, all else equal"""
        from scoring import compute_bfs
        import copy
        base = copy.deepcopy(RAHUL_FV)
        high_emi = {**base, "emi.emi_to_income_ratio": 0.7}
        low_emi  = {**base, "emi.emi_to_income_ratio": 0.2}
        assert compute_bfs(high_emi).score < compute_bfs(low_emi).score

    def test_monotonicity_savings(self):
        """Higher savings ratio → higher score"""
        from scoring import compute_bfs
        base = dict(RAHUL_FV)
        high_sav = {**base, "savings.savings_to_income_ratio": 0.25}
        low_sav  = {**base, "savings.savings_to_income_ratio": 0.02}
        assert compute_bfs(high_sav).score > compute_bfs(low_sav).score

    def test_bfs_formula_anchors(self):
        """BFS score mapping matches defined anchors"""
        from scoring import probability_to_bfs
        assert probability_to_bfs(0.50) == 600
        assert 735 <= probability_to_bfs(0.05) <= 765
        assert probability_to_bfs(0.70) == 300

    def test_adverse_action_codes_on_decline(self):
        """Every below-threshold score has adverse action codes"""
        from scoring import compute_bfs
        result = compute_bfs(VIKRAM_FV)
        assert result.score < 550
        assert len(result.adverse_action_reasons) >= 2

    def test_stacking_produces_adverse_code(self):
        from scoring import compute_bfs
        result = compute_bfs(VIKRAM_FV)
        codes = [a.code for a in result.adverse_action_reasons]
        assert "AA05" in codes   # loan stacking code

class TestATP:
    def test_zero_income(self):
        from scoring import compute_atp
        fv = {**RAHUL_FV, "income.avg_monthly_credit_inr": 0}
        result = compute_atp(fv, 5000)
        assert result.monthly_surplus_inr <= 0
        assert result.ratio_at_requested_emi == float("inf")

    def test_haircut_triggers(self):
        from scoring import compute_atp
        fv = {**PRIYA_FV, "income.income_regularity_score": 0.45}
        result = compute_atp(fv, 5000)
        assert result.income_haircut_applied == True

    def test_haircut_does_not_trigger(self):
        from scoring import compute_atp
        result = compute_atp(RAHUL_FV, 5000)
        assert result.income_haircut_applied == False

    def test_ratio_affordable(self):
        from scoring import compute_atp
        result = compute_atp(RAHUL_FV, requested_emi_inr=3000)
        assert result.ratio_at_requested_emi < 0.5

    def test_ratio_exceeds_capacity(self):
        from scoring import compute_atp
        result = compute_atp(SUNITA_FV, requested_emi_inr=25000)
        assert result.ratio_at_requested_emi > 1.0

class TestRPS:
    def test_rahul_high(self):
        from scoring import compute_rps
        assert compute_rps(RAHUL_FV).label == "HIGH"

    def test_vikram_low(self):
        from scoring import compute_rps
        result = compute_rps(VIKRAM_FV)
        assert result.label == "LOW"
        assert result.predicted_default_window_days is not None
        assert 7 <= result.predicted_default_window_days <= 90

class TestFraud:
    def test_rahul_clear(self):
        from fraud import compute_fraud
        result = compute_fraud(RAHUL_FV)
        assert result.risk_label == "CLEAR"
        assert not result.stacking_detected

    def test_vikram_high(self):
        from fraud import compute_fraud
        result = compute_fraud(VIKRAM_FV)
        assert result.risk_label in ("HIGH", "VERY_HIGH")
        assert result.stacking_detected == True
        signal_types = [s["signal_type"] for s in result.signals]
        assert "LOAN_STACKING" in signal_types

    def test_manual_review_on_high(self):
        from fraud import compute_fraud
        result = compute_fraud(VIKRAM_FV)
        assert result.manual_review_recommended == True

class TestOverallSignal:
    def test_fraud_high_always_declines(self):
        from main import determine_overall_signal
        from models import FraudOutput, BFSOutput, ATPOutput
        # Even with good BFS, HIGH fraud = DECLINE
        fraud = FraudOutput(risk_label="HIGH", risk_probability=0.6,
                            signals=[], stacking_detected=True,
                            network_anomaly_score=0.5,
                            manual_review_recommended=True)
        bfs = BFSOutput(score=720, band="GOOD", confidence="HIGH",
                        version="test", adverse_action_reasons=[],
                        thin_file=False)
        atp = ATPOutput(monthly_surplus_inr=20000,
                        max_recommended_emi_inr=10000,
                        ratio_at_requested_emi=0.3,
                        income_haircut_applied=False,
                        conservative_income_used=40000)
        assert determine_overall_signal(bfs, fraud, atp) == "DECLINE"

    def test_thin_file_always_review(self):
        from main import determine_overall_signal
        from models import BFSOutput, FraudOutput, ATPOutput
        bfs = BFSOutput(score=720, band="GOOD", confidence="LOW",  # LOW = thin file
                        version="test", adverse_action_reasons=[],
                        thin_file=True)
        fraud = FraudOutput(risk_label="CLEAR", risk_probability=0.02,
                            signals=[], stacking_detected=False,
                            network_anomaly_score=0.05,
                            manual_review_recommended=False)
        atp = ATPOutput(monthly_surplus_inr=20000, max_recommended_emi_inr=10000,
                        ratio_at_requested_emi=0.3, income_haircut_applied=False,
                        conservative_income_used=40000)
        assert determine_overall_signal(bfs, fraud, atp) == "REVIEW"
```

Run `pytest tests/test_algorithms.py` after writing each algorithm. Nothing goes to Railway until all tests pass. This is not optional — it's what prevents spending 3 hours debugging a demo that fails because `ratio_at_requested_emi` returns `inf` for Sunita and crashes the JSON serializer.

---

**Step 3 — Write algorithms in this exact order**

Each one takes half a day. Don't start the next until the tests for the current one pass.

```
Day 1 morning:  fixtures.py — 5 persona feature vectors
Day 1 afternoon: models.py + auth.py + FastAPI shell (health check returns 200)

Day 2 morning:  scoring.py — BFS scorecard (run test_persona_scores after)
Day 2 afternoon: scoring.py — ATP formula (run test_atp after)

Day 3 morning:  scoring.py — RPS heuristic (run test_rps after)
Day 3 afternoon: fraud.py — 6 fraud rules (run test_fraud after)

Day 4 morning:  narrative.py — Claude API (manual check on all 5 personas)
Day 4 afternoon: main.py — wire everything, determine_overall_signal
                            (run full test suite: pytest tests/)

Day 5:          deploy to Railway. run full suite against live URL.
```

---

**Step 4 — The three tests that matter most before any NBFC sees the demo**

After all unit tests pass, run these three manually in Postman:

**Integration test 1 — Happy path end to end**
POST Rahul → status COMPLETE → BFS 700+ → fraud CLEAR → overall PROCEED → narrative mentions stable income. If narrative says "loan stacking" for Rahul, your system prompt is wrong.

**Integration test 2 — Fraud path**
POST Vikram → fraud HIGH → overall DECLINE → narrative explicitly mentions stacking. If overall signal is REVIEW instead of DECLINE, your `determine_overall_signal` logic has a bug.

**Integration test 3 — Error handling**
POST with wrong API key → 401 with clean JSON (not a stack trace). POST with missing `consent_id` → 422. POST with unknown mobile → 404 with `DEMO_USER_NOT_FOUND` code. If any of these return a 500 with a Python stack trace, the demo is not ready — an NBFC risk head seeing that will lose trust immediately.

---

**For testing the ML model phase (weeks 9–12, after you have 500 outcomes)**

When you start training XGBoost, three additional test types matter:

**Model tests** — run before any model version is promoted to staging:
```python
# tests/test_model.py

def test_auc_gate():
    """Model only deploys if AUC > 0.72 on out-of-time holdout"""
    assert model_metrics["auc_oot"] > 0.72

def test_brier_gate():
    assert model_metrics["brier_oot"] < 0.15

def test_shap_stability():
    """Top-5 SHAP features consistent across 3 random seeds"""
    # Kendall tau of SHAP rankings across seeds > 0.85
    assert kendall_tau_top5 > 0.85

def test_adverse_codes_always_present():
    """Every below-threshold prediction has codes"""
    below_threshold = [p for p in predictions if p.score < 600]
    for p in below_threshold:
        assert len(p.adverse_action_reasons) >= 2

def test_fairness_auc_gap():
    """AUC gap across income quartiles < 5%"""
    auc_by_quartile = compute_auc_by_quartile(predictions, y_true)
    assert max(auc_by_quartile) - min(auc_by_quartile) < 0.05
```

**Drift tests** — run weekly in production:
```python
def test_psi_score_distribution():
    """Score distribution hasn't shifted from training"""
    psi = compute_psi(current_scores, training_scores)
    assert psi < 0.20, f"Score PSI: {psi:.3f} — retrain triggered"

def test_expert_utilization():
    """No expert is dominating routing (MoE gating collapse check)"""
    utilization = compute_expert_utilization(routing_logs_7d)
    for expert, rate in utilization.items():
        assert rate < 0.60, f"Gating collapse: {expert} at {rate:.0%}"
        assert rate > 0.05, f"Dead expert: {expert} at {rate:.0%}"
```

**Calibration test** — run before any model deployment:
```python
def test_calibration_reliability():
    """Calibrated probs within ±3% of actual default rates per decile"""
    for decile_idx, (predicted_rate, actual_rate) in enumerate(reliability_diagram):
        assert abs(predicted_rate - actual_rate) < 0.03, \
            f"Calibration off at decile {decile_idx}: {predicted_rate:.3f} vs {actual_rate:.3f}"
```

---

**The one thing that kills implementation speed**

Not starting with the tests. Every engineer who builds first and tests later spends 40% of their time debugging outputs they can't verify. Write `test_persona_scores` before writing `compute_bfs`. When you run it and it fails, the failure message tells you exactly which persona is wrong and by how much — not just "something is broken somewhere."

Start with the contracts. Write the tests. Implement until the tests pass. Deploy. In that order, every time.