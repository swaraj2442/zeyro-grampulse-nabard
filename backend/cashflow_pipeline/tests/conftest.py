"""
Shared pytest fixtures for the cashflow pipeline test suite.

Session-scoped fixtures cover both MSME (E001) and General User (G001)
entities to avoid redundant I/O and Prophet fitting.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from src.transaction_categorizer import categorize_transactions


# ── Data generation ───────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def msme_transactions_df() -> pd.DataFrame:
    """30 months of synthetic MSME transactions for entity E001."""
    from data.generate import generate_msme_transactions
    return generate_msme_transactions(entity_id="E001", seed=42)


@pytest.fixture(scope="session")
def general_transactions_df() -> pd.DataFrame:
    """18 months of synthetic general user transactions for entity G001 (2 accounts)."""
    from data.generate import generate_general_user_transactions
    return generate_general_user_transactions(entity_id="G001", seed=99)


@pytest.fixture(scope="session")
def combined_transactions_df(msme_transactions_df, general_transactions_df) -> pd.DataFrame:
    return pd.concat([msme_transactions_df, general_transactions_df], ignore_index=True)


@pytest.fixture(scope="session")
def sample_transactions_df(msme_transactions_df) -> pd.DataFrame:
    """Backwards-compatible alias for MSME transactions."""
    return msme_transactions_df


@pytest.fixture(scope="session")
def sample_transactions_csv(tmp_path_factory, combined_transactions_df) -> str:
    """Write combined transactions to a temp CSV; return path as str."""
    tmp = tmp_path_factory.mktemp("data")
    path = tmp / "transactions.csv"
    combined_transactions_df.to_csv(path, index=False)
    return str(path)


@pytest.fixture(scope="session")
def msme_transactions_csv(tmp_path_factory, msme_transactions_df) -> str:
    """Write MSME-only transactions to a temp CSV."""
    tmp = tmp_path_factory.mktemp("msme_data")
    path = tmp / "msme_transactions.csv"
    msme_transactions_df.to_csv(path, index=False)
    return str(path)


# ── Monthly features ──────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def sample_features_df(msme_transactions_df) -> pd.DataFrame:
    """MSME monthly features for entity E001 (session-scoped)."""
    from src.feature_engineer import build_monthly_features
    cat_df = categorize_transactions(msme_transactions_df, entity_type="msme")
    return build_monthly_features(cat_df, entity_id="E001", entity_type="msme")


@pytest.fixture(scope="session")
def general_features_df(general_transactions_df) -> pd.DataFrame:
    """General user monthly features for entity G001 (session-scoped)."""
    from src.feature_engineer import build_monthly_features
    cat_df = categorize_transactions(general_transactions_df, entity_type="general")
    return build_monthly_features(cat_df, entity_id="G001", entity_type="general")


# ── Minimal synthetic features ────────────────────────────────────────────────

@pytest.fixture
def minimal_features_df() -> pd.DataFrame:
    """24 months of synthetic MSME features for fast unit tests."""
    periods = pd.date_range("2022-01-01", periods=24, freq="MS")
    np.random.seed(0)
    return pd.DataFrame({
        "period": periods, "entity_id": "E001", "entity_type": "msme",
        "net_cashflow": np.random.normal(20_000, 5_000, 24),
        "total_inflow": np.random.normal(50_000, 8_000, 24),
        "total_outflow": np.random.normal(30_000, 4_000, 24),
        "emi_amount": np.random.uniform(5_000, 15_000, 24),
        "emi_to_inflow_ratio": np.random.uniform(0.10, 0.35, 24),
        "inflow_concentration": np.random.uniform(0.20, 0.60, 24),
        "net_cashflow_lag1": np.random.normal(20_000, 5_000, 24),
        "net_cashflow_lag3": np.random.normal(20_000, 5_000, 24),
        "net_cashflow_lag6": np.random.normal(20_000, 5_000, 24),
        "net_cashflow_roll3": np.random.normal(20_000, 4_000, 24),
        "net_cashflow_roll6": np.random.normal(20_000, 4_000, 24),
        "inflow_trend_slope6": np.random.normal(100, 50, 24),
        "inflow_volatility6": np.random.normal(5_000, 1_000, 24),
        "month": [p.month for p in periods],
        "inflow_mom_change": np.random.normal(0, 0.10, 24),
    })


@pytest.fixture
def minimal_general_features_df() -> pd.DataFrame:
    """18 months of synthetic general user features for fast unit tests."""
    periods = pd.date_range("2022-01-01", periods=18, freq="MS")
    np.random.seed(7)
    return pd.DataFrame({
        "period": periods, "entity_id": "G001", "entity_type": "general",
        "net_cashflow": np.random.normal(15_000, 3_000, 18),
        "total_inflow": np.full(18, 85_000.0) + np.random.normal(0, 2_000, 18),
        "total_outflow": np.full(18, 70_000.0) + np.random.normal(0, 3_000, 18),
        "emi_amount": np.full(18, 28_000.0),
        "rent_amount": np.full(18, 18_000.0),
        "subscription_amount": np.random.uniform(400, 800, 18),
        "fixed_obligations": np.full(18, 47_000.0),
        "fixed_obligation_ratio": np.full(18, 0.55),
        "discretionary_spend_ratio": np.random.uniform(0.10, 0.25, 18),
        "savings_rate": np.random.uniform(0.10, 0.20, 18),
        "salary_regularity": np.ones(18, dtype=int),
        "upi_send_amount": np.random.uniform(5_000, 12_000, 18),
        "upi_spend_trend": np.random.normal(0.05, 0.10, 18),
        "new_emi_detected": np.zeros(18, dtype=int),
        "net_cashflow_lag1": np.random.normal(15_000, 3_000, 18),
        "net_cashflow_lag3": np.random.normal(15_000, 3_000, 18),
        "net_cashflow_lag6": np.random.normal(15_000, 3_000, 18),
        "net_cashflow_roll3": np.random.normal(15_000, 2_500, 18),
        "net_cashflow_roll6": np.random.normal(15_000, 2_500, 18),
        "inflow_volatility6": np.random.normal(2_000, 500, 18),
        "month": [p.month for p in periods],
        "inflow_mom_change": np.random.normal(0, 0.02, 18),
    })


# ── Forecast DataFrames ───────────────────────────────────────────────────────

@pytest.fixture
def sample_forecast_df() -> pd.DataFrame:
    """12-month MSME forecast DataFrame."""
    periods = pd.date_range("2024-07-01", periods=12, freq="MS")
    np.random.seed(1)
    forecast = np.random.normal(20_000, 3_000, 12)
    return pd.DataFrame({
        "period": periods,
        "forecast": forecast,
        "lower_p10": forecast - 10_000,
        "upper_p90": forecast + 10_000,
        "prophet_forecast": forecast * 1.02,
        "lgbm_forecast": forecast * 0.98,
        "total_inflow": np.full(12, 50_000.0),
        "total_outflow": np.full(12, 30_000.0),
        "emi_amount": np.full(12, 8_000.0),
        "shortfall_probability": np.random.uniform(0.05, 0.20, 12),
    })


@pytest.fixture
def general_forecast_df() -> pd.DataFrame:
    """12-month General User forecast DataFrame."""
    periods = pd.date_range("2024-01-01", periods=12, freq="MS")
    np.random.seed(2)
    forecast = np.random.normal(15_000, 2_000, 12)
    return pd.DataFrame({
        "period": periods,
        "forecast": forecast,
        "lower_p10": forecast - 8_000,
        "upper_p90": forecast + 8_000,
        "prophet_forecast": forecast * 1.01,
        "lgbm_forecast": forecast * 0.99,
        "total_inflow": np.full(12, 85_000.0),
        "total_outflow": np.full(12, 70_000.0),
        "emi_amount": np.full(12, 28_000.0),
        "shortfall_probability": np.random.uniform(0.03, 0.15, 12),
    })
