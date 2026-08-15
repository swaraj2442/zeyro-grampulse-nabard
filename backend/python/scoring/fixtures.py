"""Demo persona feature vectors and random feature vector generator.

Feature vector keys follow the convention `<group>.<feature_name>`.
Values are floats; boolean flags are encoded as 1.0 / 0.0.
"""

from __future__ import annotations
import random
from typing import Dict

FeatureVector = Dict[str, float]

# ---------------------------------------------------------------------------
# Persona 1: Rahul — Salaried, stable, approve path (~720 BFS)
# ---------------------------------------------------------------------------
RAHUL_FV: FeatureVector = {
    "income.avg_monthly_credit_inr":        85000.0,
    "income.income_regularity_score":        0.91,
    "income.income_trend_90d":               0.12,
    "income.credit_to_debit_ratio":          1.18,
    "expense.fixed_obligation_inr":          22000.0,
    "expense.fixed_obligation_ratio":        0.26,
    "expense.discretionary_spend_ratio":     0.22,
    "emi.count_active":                      1.0,
    "emi.total_monthly_exposure_inr":        12000.0,
    "emi.emi_to_income_ratio":               0.14,   # conservative; includes only EMI ÷ income
    "emi.missed_emi_signals_count":          0.0,
    "emi.loan_stacking_signals":             0.0,
    "emi.bnpl_activity_detected":            0.0,
    "cashflow.end_of_month_stress_score":    0.12,
    "cashflow.avg_days_to_near_zero":        21.4,
    "cashflow.min_balance_30d_inr":          8200.0,
    "cashflow.balance_trend_slope":          0.04,
    "savings.recurring_sip_detected":        1.0,
    "savings.savings_to_income_ratio":       0.15,
    "behavior.unique_merchant_count_30d":    28.0,
    "behavior.round_amount_transfer_ratio":  0.12,
    "network.unique_p2p_recipients_30d":     6.0,
    "network.p2p_transfer_ratio":            0.08,
    "network.new_vpa_ratio_30d":             0.09,
    "volatility.spend_coefficient_variation_30d": 0.21,
    "volatility.sudden_behavior_change_score":     0.08,
    "temporal.active_days_ratio_30d":        0.87,
    "temporal.longest_inactive_streak_days": 3.0,
    "quality.thin_file_flag":                0.0,
    "quality.data_coverage_days":            87.0,
    "quality.source_diversity_code":         1.0,
    "quality.data_gap_count":                0.0,
}

# ---------------------------------------------------------------------------
# Persona 2: Priya — Freelancer, irregular income, review path (~620 BFS)
# ---------------------------------------------------------------------------
PRIYA_FV: FeatureVector = {
    "income.avg_monthly_credit_inr":        52000.0,
    "income.income_regularity_score":        0.51,
    "income.income_trend_90d":               0.08,
    "income.credit_to_debit_ratio":          1.02,
    "expense.fixed_obligation_inr":          18000.0,
    "expense.fixed_obligation_ratio":        0.38,
    "expense.discretionary_spend_ratio":     0.45,
    "emi.count_active":                      2.0,
    "emi.total_monthly_exposure_inr":        15000.0,
    "emi.emi_to_income_ratio":               0.29,
    "emi.missed_emi_signals_count":          1.0,
    "emi.loan_stacking_signals":             0.0,
    "emi.bnpl_activity_detected":            1.0,
    "cashflow.end_of_month_stress_score":    0.51,
    "cashflow.avg_days_to_near_zero":        9.2,
    "cashflow.min_balance_30d_inr":          1200.0,
    "cashflow.balance_trend_slope":         -0.01,
    "savings.recurring_sip_detected":        0.0,
    "savings.savings_to_income_ratio":       0.04,
    "behavior.unique_merchant_count_30d":    12.0,
    "behavior.round_amount_transfer_ratio":  0.25,
    "network.unique_p2p_recipients_30d":     4.0,
    "network.p2p_transfer_ratio":            0.22,
    "network.new_vpa_ratio_30d":             0.18,
    "volatility.spend_coefficient_variation_30d": 0.44,
    "volatility.sudden_behavior_change_score":     0.24,
    "temporal.active_days_ratio_30d":        0.45,
    "temporal.longest_inactive_streak_days": 8.0,
    "quality.thin_file_flag":                0.0,
    "quality.data_coverage_days":            74.0,
    "quality.source_diversity_code":         0.0,
    "quality.data_gap_count":                1.0,
}

# ---------------------------------------------------------------------------
# Persona 3: Mohammed — MSME owner, high volume, approve path (~675 BFS)
# ---------------------------------------------------------------------------
MOHAMMED_FV: FeatureVector = {
    "income.avg_monthly_credit_inr":        120000.0,
    "income.income_regularity_score":        0.68,
    "income.income_trend_90d":               0.15,
    "income.credit_to_debit_ratio":          1.25,
    "expense.fixed_obligation_inr":          35000.0,
    "expense.fixed_obligation_ratio":        0.31,
    "expense.discretionary_spend_ratio":     0.35,
    "emi.count_active":                      2.0,
    "emi.total_monthly_exposure_inr":        20000.0,
    "emi.emi_to_income_ratio":               0.17,
    "emi.missed_emi_signals_count":          0.0,
    "emi.loan_stacking_signals":             0.0,
    "emi.bnpl_activity_detected":            0.0,
    "cashflow.end_of_month_stress_score":    0.19,
    "cashflow.avg_days_to_near_zero":        18.2,
    "cashflow.min_balance_30d_inr":          9500.0,
    "cashflow.balance_trend_slope":          0.05,
    "savings.recurring_sip_detected":        1.0,
    "savings.savings_to_income_ratio":       0.12,
    "behavior.unique_merchant_count_30d":    48.0,
    "behavior.round_amount_transfer_ratio":  0.31,
    "network.unique_p2p_recipients_30d":     15.0,
    "network.p2p_transfer_ratio":            0.35,
    "network.new_vpa_ratio_30d":             0.12,
    "volatility.spend_coefficient_variation_30d": 0.33,
    "volatility.sudden_behavior_change_score":     0.11,
    "temporal.active_days_ratio_30d":        0.92,
    "temporal.longest_inactive_streak_days": 2.0,
    "quality.thin_file_flag":                0.0,
    "quality.data_coverage_days":            83.0,
    "quality.source_diversity_code":         1.0,
    "quality.data_gap_count":                0.0,
}

# ---------------------------------------------------------------------------
# Persona 4: Sunita — Thin file, daily worker, decline/review path (~510 BFS)
# ---------------------------------------------------------------------------
SUNITA_FV: FeatureVector = {
    "income.avg_monthly_credit_inr":        18000.0,
    "income.income_regularity_score":        0.62,
    "income.income_trend_90d":               0.0,
    "income.credit_to_debit_ratio":          1.05,
    "expense.fixed_obligation_inr":          4000.0,
    "expense.fixed_obligation_ratio":        0.25,
    "expense.discretionary_spend_ratio":     0.50,
    "emi.count_active":                      0.0,
    "emi.total_monthly_exposure_inr":        0.0,
    "emi.emi_to_income_ratio":               0.0,
    "emi.missed_emi_signals_count":          0.0,
    "emi.loan_stacking_signals":             0.0,
    "emi.bnpl_activity_detected":            0.0,
    "cashflow.end_of_month_stress_score":    0.44,
    "cashflow.avg_days_to_near_zero":        12.0,
    "cashflow.min_balance_30d_inr":          800.0,
    "cashflow.balance_trend_slope":         -0.02,
    "savings.recurring_sip_detected":        0.0,
    "savings.savings_to_income_ratio":       0.02,
    "behavior.unique_merchant_count_30d":    4.0,
    "behavior.round_amount_transfer_ratio":  0.0,
    "network.unique_p2p_recipients_30d":     2.0,
    "network.p2p_transfer_ratio":            0.40,
    "network.new_vpa_ratio_30d":             0.30,
    "volatility.spend_coefficient_variation_30d": 0.60,
    "volatility.sudden_behavior_change_score":     0.15,
    "temporal.active_days_ratio_30d":        0.20,
    "temporal.longest_inactive_streak_days": 14.0,
    "quality.thin_file_flag":                1.0,   # thin file — triggers LOW confidence
    "quality.data_coverage_days":            34.0,
    "quality.source_diversity_code":         0.0,
    "quality.data_gap_count":                2.0,
}

# ---------------------------------------------------------------------------
# Persona 5: Vikram — Loan stacking, high-velocity P2P, fraud/decline (~470 BFS)
# ---------------------------------------------------------------------------
VIKRAM_FV: FeatureVector = {
    "income.avg_monthly_credit_inr":        45000.0,
    "income.income_regularity_score":        0.72,
    "income.income_trend_90d":              -0.10,
    "income.credit_to_debit_ratio":          0.90,
    "expense.fixed_obligation_inr":          15000.0,
    "expense.fixed_obligation_ratio":        0.35,
    "expense.discretionary_spend_ratio":     0.40,
    "emi.count_active":                      4.0,
    "emi.total_monthly_exposure_inr":        25000.0,
    "emi.emi_to_income_ratio":               0.56,
    "emi.missed_emi_signals_count":          2.0,
    "emi.loan_stacking_signals":             1.0,   # triggers AA05
    "emi.bnpl_activity_detected":            1.0,
    "cashflow.end_of_month_stress_score":    0.67,
    "cashflow.avg_days_to_near_zero":        5.4,
    "cashflow.min_balance_30d_inr":          300.0,
    "cashflow.balance_trend_slope":         -0.08,
    "savings.recurring_sip_detected":        0.0,
    "savings.savings_to_income_ratio":       0.01,
    "behavior.unique_merchant_count_30d":    18.0,
    "behavior.round_amount_transfer_ratio":  0.71,
    "network.unique_p2p_recipients_30d":     12.0,
    "network.p2p_transfer_ratio":            0.65,
    "network.new_vpa_ratio_30d":             0.68,
    "volatility.spend_coefficient_variation_30d": 0.75,
    "volatility.sudden_behavior_change_score":     0.82,
    "temporal.active_days_ratio_30d":        0.80,
    "temporal.longest_inactive_streak_days": 4.0,
    "quality.thin_file_flag":                0.0,
    "quality.data_coverage_days":            61.0,
    "quality.source_diversity_code":         0.0,
    "quality.data_gap_count":                1.0,
}

# ---------------------------------------------------------------------------
# All personas in a named dict for iteration
# ---------------------------------------------------------------------------
ALL_PERSONAS: dict[str, FeatureVector] = {
    "RAHUL":    RAHUL_FV,
    "PRIYA":    PRIYA_FV,
    "MOHAMMED": MOHAMMED_FV,
    "SUNITA":   SUNITA_FV,
    "VIKRAM":   VIKRAM_FV,
}

# ---------------------------------------------------------------------------
# Random feature vector generator for property-based tests
# ---------------------------------------------------------------------------
def generate_random_fv(seed: int | None = None) -> FeatureVector:
    """Return a plausible random feature vector for stress testing.

    All values are within realistic domain bounds.
    The returned FV is guaranteed to produce a BFS score in [300, 900].
    """
    if seed is not None:
        random.seed(seed)
    
    # Latent creditworthiness factor (0.0 = high risk, 1.0 = prime borrower)
    credit_factor = random.betavariate(2.0, 2.0)

    return {
        # Right-skewed: most applicants have EMI ratio < 0.35. Lower for prime borrowers.
        "emi.emi_to_income_ratio": min(0.9, random.betavariate(2.0, 5.0 + 8.0 * credit_factor)),
        # Left-skewed: most salaried applicants are income-regular. Higher for prime.
        "income.income_regularity_score": max(0.1, random.betavariate(2.0 + 6.0 * credit_factor, 2.0)),
        # Right-skewed: most applicants not in severe month-end stress. Lower for prime.
        "cashflow.end_of_month_stress_score": random.betavariate(1.5, 3.0 + 6.0 * credit_factor),
        # Right-skewed: many save little. Higher for prime.
        "savings.savings_to_income_ratio": random.betavariate(1.5 + 4.0 * credit_factor, 6.0),
        # Keep these uniform or as-is
        "income.income_trend_90d":             random.uniform(-0.3, 0.3) + 0.1 * (credit_factor - 0.5),
        "income.credit_to_debit_ratio":        random.uniform(0.6, 1.8) + 0.2 * (credit_factor - 0.5),
        "cashflow.balance_trend_slope":        random.uniform(-0.15, 0.15) + 0.05 * (credit_factor - 0.5),
        "cashflow.avg_days_to_near_zero":      random.uniform(1, 30),
        "cashflow.min_balance_30d_inr":        random.uniform(100, 20000),
        "emi.missed_emi_signals_count":        float(max(0, random.randint(0, 3) - int(3 * credit_factor))),
        "emi.loan_stacking_signals":           float(random.choices([0,1],[0.88 + 0.10 * credit_factor, 0.12 - 0.10 * credit_factor])[0]),
        "emi.bnpl_activity_detected":          float(random.choices([0,1],[0.72 + 0.15 * credit_factor, 0.28 - 0.15 * credit_factor])[0]),
        "savings.recurring_sip_detected":      float(random.choices([0,1],[0.60 - 0.30 * credit_factor, 0.40 + 0.30 * credit_factor])[0]),
        "behavior.round_amount_transfer_ratio":random.uniform(0.0, 0.7),
        "network.new_vpa_ratio_30d":           random.uniform(0.0, 0.6),
        "volatility.sudden_behavior_change_score": random.betavariate(1.5, 5.0 + 5.0 * credit_factor),
        "quality.thin_file_flag":              float(random.choices([0,1],[0.75,0.25])[0]),
        "quality.data_coverage_days":          random.uniform(30, 90),
        "quality.source_diversity_code":       float(random.choices([0,1,2],[0.50,0.35,0.15])[0]),
        "quality.data_gap_count":              float(random.randint(0, 3)),
        "expense.fixed_obligation_inr":        random.uniform(2000, 30000),
        "emi.total_monthly_exposure_inr":      random.uniform(0, 30000),
        "income.avg_monthly_credit_inr":       random.uniform(12000, 100000),
    }
