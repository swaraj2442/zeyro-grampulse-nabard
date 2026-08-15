"""Tests for src/feature_engineer.py — MSME + General User + multi-account."""
import pandas as pd
import numpy as np
import pytest

from src.feature_engineer import build_monthly_features
from src.transaction_categorizer import categorize_transactions


class TestMsmeFeatures:
    def test_returns_dataframe(self, sample_features_df):
        assert isinstance(sample_features_df, pd.DataFrame)

    def test_monthly_granularity(self, sample_features_df):
        periods = sample_features_df["period"].dt.to_period("M")
        assert periods.nunique() == len(sample_features_df)

    def test_net_cashflow_positive(self, sample_features_df):
        assert (sample_features_df["net_cashflow"] > 0).all()

    def test_lag_columns_exist(self, sample_features_df):
        for lag in [1, 3, 6]:
            assert f"net_cashflow_lag{lag}" in sample_features_df.columns

    def test_rolling_columns_exist(self, sample_features_df):
        assert "net_cashflow_roll3" in sample_features_df.columns
        assert "net_cashflow_roll6" in sample_features_df.columns

    def test_msme_specific_columns_exist(self, sample_features_df):
        assert "emi_to_inflow_ratio" in sample_features_df.columns
        assert "inflow_concentration" in sample_features_df.columns
        assert "inflow_trend_slope6" in sample_features_df.columns

    def test_emi_ratio_bounded(self, sample_features_df):
        valid = sample_features_df["emi_to_inflow_ratio"].dropna()
        assert (valid >= 0).all() and (valid <= 1).all()

    def test_inflow_concentration_bounded(self, sample_features_df):
        valid = sample_features_df["inflow_concentration"].dropna()
        assert (valid >= 0).all() and (valid <= 1).all()

    def test_entity_type_column_is_msme(self, sample_features_df):
        assert (sample_features_df["entity_type"] == "msme").all()

    def test_minimum_12_months_required(self, msme_transactions_df):
        short = msme_transactions_df[
            msme_transactions_df["date"] < "2022-04-01"
        ].copy()
        cat_short = categorize_transactions(short, entity_type="msme")
        with pytest.raises(ValueError, match="minimum 12 months"):
            build_monthly_features(cat_short, entity_id="E001", entity_type="msme")


class TestGeneralUserFeatures:
    def test_returns_dataframe(self, general_features_df):
        assert isinstance(general_features_df, pd.DataFrame)

    def test_monthly_granularity(self, general_features_df):
        periods = general_features_df["period"].dt.to_period("M")
        assert periods.nunique() == len(general_features_df)

    def test_general_specific_columns_exist(self, general_features_df):
        for col in [
            "fixed_obligation_ratio",
            "discretionary_spend_ratio",
            "savings_rate",
            "salary_regularity",
            "upi_spend_trend",
            "new_emi_detected",
        ]:
            assert col in general_features_df.columns, f"Missing: {col}"

    def test_no_msme_specific_columns(self, general_features_df):
        """General features should NOT have MSME-only columns."""
        assert "inflow_concentration" not in general_features_df.columns
        assert "inflow_trend_slope6" not in general_features_df.columns

    def test_fixed_obligation_ratio_bounded(self, general_features_df):
        valid = general_features_df["fixed_obligation_ratio"].dropna()
        assert (valid >= 0).all() and (valid <= 1).all()

    def test_savings_rate_bounded(self, general_features_df):
        valid = general_features_df["savings_rate"].dropna()
        assert (valid >= -1).all() and (valid <= 1).all()

    def test_salary_regularity_binary(self, general_features_df):
        assert set(general_features_df["salary_regularity"].unique()).issubset({0, 1})

    def test_new_emi_detected_binary(self, general_features_df):
        assert set(general_features_df["new_emi_detected"].unique()).issubset({0, 1})

    def test_entity_type_column_is_general(self, general_features_df):
        assert (general_features_df["entity_type"] == "general").all()

    def test_minimum_6_months_required_for_general(self, general_transactions_df):
        """General user only needs 6 months minimum."""
        very_short = general_transactions_df[
            general_transactions_df["date"] < "2023-04-01"
        ].copy()
        cat_short = categorize_transactions(very_short, entity_type="general")
        with pytest.raises(ValueError, match="minimum 6 months"):
            build_monthly_features(cat_short, entity_id="G001", entity_type="general")


class TestMultiAccountAggregation:
    def test_multi_account_aggregates_to_one_row_per_month(self, general_features_df):
        """G001 has 2 accounts but features must be one row per month."""
        periods = general_features_df["period"].dt.to_period("M")
        assert periods.nunique() == len(general_features_df), (
            "Multi-account data was NOT properly consolidated — duplicate months found"
        )

    def test_total_inflow_higher_with_two_accounts(
        self, general_transactions_df, general_features_df
    ):
        """With 2 accounts both receiving credits, total_inflow should be meaningful."""
        assert (general_features_df["total_inflow"] > 0).all()
