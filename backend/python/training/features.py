"""Feature manifest and pre-processing contract for ML training.

This module is the single source of truth for:
  - Which columns exist in the cleaned dataset
  - Which feature subset each model uses
  - Any light transformations applied *after* cleaning (clipping, log, etc.)

Upstream cleaning (deduplication, imputation, type coercion, outlier removal)
is handled separately by the data-engineering pipeline before this layer.
By the time data reaches these helpers it is assumed to be:
  - A pandas DataFrame with no NaN values
  - All numeric columns already cast to float32
  - A boolean `defaulted_within_90d` target column for BFS/RPS
"""

from __future__ import annotations

import numpy as np
import pandas as pd
from typing import cast

# ---------------------------------------------------------------------------
# Canonical column groups
# ---------------------------------------------------------------------------

INCOME_FEATURES: list[str] = [
    "income.income_regularity_score",
    "income.income_trend_90d",
    "income.credit_to_debit_ratio",
    "income.avg_monthly_credit_inr",
]

EMI_FEATURES: list[str] = [
    "emi.emi_to_income_ratio",
    "emi.missed_emi_signals_count",
    "emi.loan_stacking_signals",
    "emi.bnpl_activity_detected",
    "emi.total_monthly_exposure_inr",
]

CASHFLOW_FEATURES: list[str] = [
    "cashflow.end_of_month_stress_score",
    "cashflow.balance_trend_slope",
    "cashflow.avg_days_to_near_zero",
    "cashflow.min_balance_30d_inr",
]

SAVINGS_FEATURES: list[str] = [
    "savings.savings_to_income_ratio",
    "savings.recurring_sip_detected",
]

VOLATILITY_FEATURES: list[str] = [
    "volatility.sudden_behavior_change_score",
]

NETWORK_FEATURES: list[str] = [
    "network.new_vpa_ratio_30d",
    "network.p2p_transfer_ratio",
]

BEHAVIOR_FEATURES: list[str] = [
    "behavior.round_amount_transfer_ratio",
]

QUALITY_FEATURES: list[str] = [
    "quality.thin_file_flag",
    "quality.data_coverage_days",
    "quality.source_diversity_code",
    "quality.data_gap_count",
]

EXPENSE_FEATURES: list[str] = [
    "expense.fixed_obligation_inr",
]

# ---------------------------------------------------------------------------
# Per-model feature sets
# ---------------------------------------------------------------------------

BFS_FEATURES: list[str] = (
    INCOME_FEATURES
    + EMI_FEATURES
    + CASHFLOW_FEATURES
    + SAVINGS_FEATURES
    + VOLATILITY_FEATURES
    + NETWORK_FEATURES
    + QUALITY_FEATURES
)

RPS_FEATURES: list[str] = (
    CASHFLOW_FEATURES
    + INCOME_FEATURES[:1]   # income_regularity_score
    + EMI_FEATURES[2:4]     # loan_stacking_signals, bnpl_activity_detected
    + [EMI_FEATURES[1]]     # missed_emi_signals_count
)

CREDIT_DEFAULT_FEATURES: list[str] = [
    "age",
    "annual_income_inr",
    "credit_limit_inr",
    "cibil_score",
    "avg_credit_utilisation",
    "payment_ratio",
    "months_inactive",
    "balance_trend_inr",
    "num_credit_products",
    "dpd_30_count",
    "emi_obligations_inr"
]


# ---------------------------------------------------------------------------
# Target column names
# ---------------------------------------------------------------------------

BFS_TARGET: str = "defaulted_within_90d"          # binary 0/1
RPS_TARGET: str = "defaulted_within_90d"               # binary 0/1
CREDIT_DEFAULT_TARGET: str = "will_default"

# ---------------------------------------------------------------------------
# Light feature engineering applied at training time
# ---------------------------------------------------------------------------

def clip_and_log_inr(series: pd.Series, cap: float = 1_000_000.0) -> pd.Series:
    """Clip large INR values then apply log1p to reduce skew."""
    return cast(pd.Series, np.log1p(series.clip(lower=0.0, upper=cap)))


def prepare_features(df: pd.DataFrame, feature_cols: list[str]) -> pd.DataFrame:
    """
    Select and lightly engineer features for model training.

    Steps applied:
      1. Select only the requested feature columns.
      2. Apply log1p to high-magnitude INR columns (clip at 1M).
      3. Cast everything to float32 for XGBoost efficiency.

    Args:
        df: Cleaned, fully-imputed DataFrame from the data pipeline.
        feature_cols: List of column names to use (e.g. BFS_FEATURES).

    Returns:
        DataFrame with selected, transformed features.
    """
    X = df[feature_cols].copy()

    # Phase A: High-Impact Feature Engineering
    if "AMT_ANNUITY" in X.columns and "AMT_CREDIT" in X.columns:
        X["annuity_to_credit_ratio"] = X["AMT_ANNUITY"] / (X["AMT_CREDIT"] + 1e-5)
        
    if "AMT_INCOME_TOTAL" in X.columns and "years_employed" in X.columns:
        X["income_lifetime_wealth"] = X["AMT_INCOME_TOTAL"] * X["years_employed"]
        
    if "bureau_total_loans" in X.columns and "age" in X.columns:
        X["bureau_velocity"] = X["bureau_total_loans"] / (X["age"] + 1e-5)
        
    if "inst_max_days_late" in X.columns and "bb_total_months" in X.columns:
        X["late_payment_freq"] = X["inst_max_days_late"] / (X["bb_total_months"] + 1e-5)
        
    if "AMT_REQ_CREDIT_BUREAU_YEAR" in X.columns and "AMT_REQ_CREDIT_BUREAU_MON" in X.columns:
        X["credit_bureau_hits_velocity"] = X["AMT_REQ_CREDIT_BUREAU_YEAR"] / (X["AMT_REQ_CREDIT_BUREAU_MON"] * 12 + 1e-5)
        
    if "cc_utilisation" in X.columns and "debt_income_ratio" in X.columns:
        X["cross_domain_interaction"] = X["cc_utilisation"] * X["debt_income_ratio"]

    # Phase A.2: Temporal Features (Trend, Velocity, Acceleration)
    if "AMT_REQ_CREDIT_BUREAU_MON" in X.columns and "AMT_REQ_CREDIT_BUREAU_QRT" in X.columns:
        # Velocity: Inquiries this month compared to average per month this quarter
        X["inquiry_velocity_recent"] = X["AMT_REQ_CREDIT_BUREAU_MON"] / ((X["AMT_REQ_CREDIT_BUREAU_QRT"] / 3.0) + 1e-5)
    
    if "AMT_REQ_CREDIT_BUREAU_QRT" in X.columns and "AMT_REQ_CREDIT_BUREAU_YEAR" in X.columns:
        # Acceleration: Inquiries this quarter (annualized) compared to full year
        X["inquiry_acceleration"] = (X["AMT_REQ_CREDIT_BUREAU_QRT"] * 4.0) / (X["AMT_REQ_CREDIT_BUREAU_YEAR"] + 1e-5)
        
    if "bb_overdue_months_recent" in X.columns and "bb_overdue_months_total" in X.columns and "bb_total_months" in X.columns:
        # Acceleration of late payments: recent vs historical average
        avg_overdue_hist = X["bb_overdue_months_total"] / (X["bb_total_months"] + 1e-5)
        X["late_payment_acceleration"] = X["bb_overdue_months_recent"] / (avg_overdue_hist + 1e-5)
        
    if "inst_recent_payment_frac" in X.columns and "inst_mean_payment_fraction" in X.columns:
        # Trend: recent repayment fraction vs historical average repayment fraction
        X["recent_payment_trend"] = X["inst_recent_payment_frac"] / (X["inst_mean_payment_fraction"] + 1e-5)

    # Phase B: Prism-Like Behavioral Proxies (Using Available Data Only)
    if "AMT_REQ_CREDIT_BUREAU_YEAR" in X.columns and "bureau_total_loans" in X.columns:
        # Credit Hunger: Inquiries relative to existing portfolio size
        X["credit_hunger"] = X["AMT_REQ_CREDIT_BUREAU_YEAR"] / (X["bureau_total_loans"] + 1)
        
    if "AMT_CREDIT" in X.columns and "AMT_INCOME_TOTAL" in X.columns:
        # Buffer Days: How many days of current income the requested credit limit covers
        X["buffer_days"] = X["AMT_CREDIT"] / ((X["AMT_INCOME_TOTAL"] / 365.0) + 1e-5)
        
    # Financial Stress Index (FSI)
    # A latent composite feature mathematically proxying stress across EMI, Debt, and Delinquency domains.
    if "annuity_income_ratio" in X.columns and "debt_income_ratio" in X.columns and "late_payment_acceleration" in X.columns:
        X["financial_stress_index"] = (X["annuity_income_ratio"] * 0.4) + \
                                      (X["debt_income_ratio"] * 0.3) + \
                                      (X["late_payment_acceleration"] * 0.3)

    inr_cols = [c for c in X.columns if c.endswith("_inr")]
    for col in inr_cols:
        series_col = cast(pd.Series, X[col])
        X[col] = clip_and_log_inr(series_col)

    # Coerce any non-numeric columns (e.g. bool dtype or string 'True'/'False'
    # that appear after CSV round-trip) to numeric before the float32 cast.
    # errors='coerce' turns unconvertible values into NaN; we then fill with 0.
    for col in X.columns:
        if X[col].dtype == object or X[col].dtype == bool:
            X[col] = pd.to_numeric(X[col], errors="coerce").fillna(0)

    return cast(pd.DataFrame, X.astype("float32"))



# ---------------------------------------------------------------------------
# ML Feature Explanations (Adverse Reasons)
# ---------------------------------------------------------------------------

FEATURE_TO_REASON: dict[str, str] = {
    "emi.emi_to_income_ratio": "High debt-to-income ratio",
    "income.income_regularity_score": "Irregular income pattern",
    "cashflow.end_of_month_stress_score": "Month-end cash flow stress",
    "emi.missed_emi_signals_count": "Prior missed EMI signals",
    "emi.loan_stacking_signals": "Multiple new loans in 30 days (stacking)",
    "cashflow.avg_days_to_near_zero": "Rapid cash depletion after payday",
    "volatility.sudden_behavior_change_score": "Sudden spending behaviour change",
    "savings.savings_to_income_ratio": "Insufficient savings buffer",
    "quality.thin_file_flag": "Insufficient transaction history (thin file)",
    "cashflow.balance_trend_slope": "Negative balance trajectory",
    "network.new_vpa_ratio_30d": "High proportion of transfers to new unknown counterparties",
    "dpd_30_count": "Historical delinquencies",
    "avg_credit_utilisation": "High credit utilization",
    "months_inactive": "Account inactivity",
    "annuity_to_credit_ratio": "High loan repayment burden",
    "income_lifetime_wealth": "Low lifetime accumulated wealth",
    "bureau_velocity": "High rate of new credit applications",
    "late_payment_freq": "Frequent late payments historically",
    "credit_bureau_hits_velocity": "Sudden surge in credit inquiries",
    "cross_domain_interaction": "Compounding debt and high credit card utilization",
    "inquiry_velocity_recent": "Sudden spike in credit inquiries this month",
    "inquiry_acceleration": "Accelerating rate of credit inquiries this quarter",
    "late_payment_acceleration": "Recent increase in late payments compared to history",
    "recent_payment_trend": "Deteriorating recent repayment fractions",
    "credit_hunger": "High rate of inquiries relative to existing credit lines",
    "buffer_days": "Low liquidity buffer relative to expenses",
    "financial_stress_index": "High overall financial stress index (combining debt, liquidity, and delinquencies)",
}
