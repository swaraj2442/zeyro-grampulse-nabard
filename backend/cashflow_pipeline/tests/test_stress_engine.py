"""Tests for src/stress_engine.py — MSME and General User scenarios."""
import numpy as np
import pandas as pd
import pytest

from src.stress_engine import StressEngine, SCENARIOS, GENERAL_SCENARIOS


class TestMsmeStressEngine:
    def test_run_returns_all_msme_scenarios(self, sample_forecast_df):
        engine = StressEngine()
        result = engine.run(sample_forecast_df, entity_type="msme")
        for scenario_name in SCENARIOS:
            assert scenario_name in result, f"Missing scenario: {scenario_name}"

    def test_each_msme_scenario_has_required_keys(self, sample_forecast_df):
        engine = StressEngine()
        result = engine.run(sample_forecast_df, entity_type="msme")
        required = {
            "stressed_cashflow", "months_to_zero_balance",
            "minimum_cashflow_month", "stress_survival_score",
        }
        for name, metrics in result.items():
            assert required.issubset(set(metrics.keys())), \
                f"Scenario '{name}' missing: {required - set(metrics.keys())}"

    def test_severe_revenue_reduces_cashflow(self, sample_forecast_df):
        result = StressEngine().run(sample_forecast_df, entity_type="msme")
        base_mean = sample_forecast_df["forecast"].mean()
        assert np.mean(result["revenue_severe"]["stressed_cashflow"]) < base_mean

    def test_survival_score_bounded_0_100(self, sample_forecast_df):
        result = StressEngine().run(sample_forecast_df, entity_type="msme")
        for name, m in result.items():
            assert 0 <= m["stress_survival_score"] <= 100, \
                f"Score out of range for '{name}': {m['stress_survival_score']}"

    def test_months_to_zero_none_for_strong_business(self):
        periods = pd.date_range("2024-01-01", periods=12, freq="MS")
        strong = pd.DataFrame({
            "period": periods,
            "forecast": [500_000.0] * 12,
            "total_inflow": [800_000.0] * 12,
            "total_outflow": [300_000.0] * 12,
            "lower_p10": [400_000.0] * 12,
            "upper_p90": [600_000.0] * 12,
            "shortfall_probability": [0.01] * 12,
        })
        result = StressEngine().run(strong, entity_type="msme")
        assert result["revenue_mild"]["months_to_zero_balance"] is None

    def test_five_msme_scenarios(self):
        assert len(SCENARIOS) == 5


class TestGeneralUserStressEngine:
    def test_run_returns_all_general_scenarios(self, general_forecast_df):
        engine = StressEngine()
        result = engine.run(general_forecast_df, entity_type="general")
        for scenario_name in GENERAL_SCENARIOS:
            assert scenario_name in result, f"Missing: {scenario_name}"

    def test_each_general_scenario_has_required_keys(self, general_forecast_df):
        result = StressEngine().run(general_forecast_df, entity_type="general")
        required = {
            "stressed_cashflow", "months_to_zero_balance",
            "minimum_cashflow_month", "stress_survival_score",
        }
        for name, metrics in result.items():
            assert required.issubset(set(metrics.keys()))

    def test_job_loss_zeroes_inflow(self, general_forecast_df):
        """Job loss: inflow_shock=0 → stressed cashflow = -outflow."""
        result = StressEngine().run(general_forecast_df, entity_type="general")
        stressed = result["job_loss"]["stressed_cashflow"]
        expected = -general_forecast_df["total_outflow"].mean()
        # All months should be approximately equal to -outflow
        assert all(abs(cf - expected) < 1000 for cf in stressed)

    def test_medical_emergency_increases_first_month_outflow(self, general_forecast_df):
        """Medical emergency adds ₹1.5L to month 1 only."""
        result = StressEngine().run(general_forecast_df, entity_type="general")
        normal = StressEngine().run(general_forecast_df, entity_type="msme")
        # Month 1 of medical_emergency should be much lower than income_reduction month 1
        medical_m1 = result["medical_emergency"]["stressed_cashflow"][0]
        income_m1 = result["income_reduction"]["stressed_cashflow"][0]
        assert medical_m1 < income_m1, (
            "Medical emergency month 1 should have lower cashflow than income reduction"
        )

    def test_emi_increase_raises_outflow(self, general_forecast_df):
        """EMI repricing should produce lower cashflow than base."""
        result = StressEngine().run(general_forecast_df, entity_type="general")
        base_cf = (
            general_forecast_df["total_inflow"].mean()
            - general_forecast_df["total_outflow"].mean()
        )
        stressed_cf = np.mean(result["emi_increase"]["stressed_cashflow"])
        assert stressed_cf < base_cf

    def test_income_reduction_30pct(self, general_forecast_df):
        """Income reduction: inflow should be 70% of original."""
        result = StressEngine().run(general_forecast_df, entity_type="general")
        expected_cf = (
            general_forecast_df["total_inflow"].mean() * 0.70
            - general_forecast_df["total_outflow"].mean()
        )
        actual_avg = np.mean(result["income_reduction"]["stressed_cashflow"])
        assert abs(actual_avg - expected_cf) < 500

    def test_survival_score_bounded_general(self, general_forecast_df):
        result = StressEngine().run(general_forecast_df, entity_type="general")
        for name, m in result.items():
            assert 0 <= m["stress_survival_score"] <= 100

    def test_five_general_scenarios(self):
        assert len(GENERAL_SCENARIOS) == 5

    def test_max_cumulative_drawdown_present(self, general_forecast_df):
        result = StressEngine().run(general_forecast_df, entity_type="general")
        for metrics in result.values():
            assert "max_cumulative_drawdown" in metrics
