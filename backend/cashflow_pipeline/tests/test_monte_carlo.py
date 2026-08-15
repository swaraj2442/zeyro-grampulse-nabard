"""Tests for src/monte_carlo.py"""
import numpy as np
import pandas as pd
import pytest

from src.monte_carlo import compute_shortfall_probabilities


class TestComputeShortfallProbabilities:
    def test_returns_dataframe_with_correct_rows(self, sample_forecast_df):
        result = compute_shortfall_probabilities(sample_forecast_df, n_simulations=500)
        assert len(result) == len(sample_forecast_df)

    def test_shortfall_probability_column_exists(self, sample_forecast_df):
        result = compute_shortfall_probabilities(sample_forecast_df, n_simulations=500)
        assert "shortfall_probability" in result.columns

    def test_probability_bounded_0_1(self, sample_forecast_df):
        result = compute_shortfall_probabilities(sample_forecast_df, n_simulations=500)
        assert (result["shortfall_probability"] >= 0).all()
        assert (result["shortfall_probability"] <= 1).all()

    def test_simulated_percentile_columns_exist(self, sample_forecast_df):
        result = compute_shortfall_probabilities(sample_forecast_df, n_simulations=500)
        assert "simulated_p10" in result.columns
        assert "simulated_p90" in result.columns

    def test_negative_forecast_high_shortfall_prob(self):
        periods = pd.date_range("2024-01-01", periods=3, freq="MS")
        fc = pd.DataFrame(
            {
                "period": periods,
                "forecast": [-5_000.0, -10_000.0, -8_000.0],
                "lower_p10": [-12_000.0, -18_000.0, -15_000.0],
                "upper_p90": [2_000.0, -2_000.0, -1_000.0],
            }
        )
        result = compute_shortfall_probabilities(fc, n_simulations=2_000)
        assert (result["shortfall_probability"] > 0.5).all()

    def test_positive_forecast_low_shortfall_prob(self):
        periods = pd.date_range("2024-01-01", periods=3, freq="MS")
        fc = pd.DataFrame(
            {
                "period": periods,
                "forecast": [100_000.0, 120_000.0, 110_000.0],
                "lower_p10": [80_000.0, 95_000.0, 88_000.0],
                "upper_p90": [120_000.0, 145_000.0, 132_000.0],
            }
        )
        result = compute_shortfall_probabilities(fc, n_simulations=2_000)
        assert (result["shortfall_probability"] < 0.10).all()

    def test_reproducible_with_same_seed(self, sample_forecast_df):
        r1 = compute_shortfall_probabilities(sample_forecast_df, n_simulations=200, seed=99)
        r2 = compute_shortfall_probabilities(sample_forecast_df, n_simulations=200, seed=99)
        np.testing.assert_array_almost_equal(
            r1["shortfall_probability"].values,
            r2["shortfall_probability"].values,
        )

    def test_does_not_modify_input(self, sample_forecast_df):
        original_cols = list(sample_forecast_df.columns)
        compute_shortfall_probabilities(sample_forecast_df, n_simulations=100)
        assert list(sample_forecast_df.columns) == original_cols
