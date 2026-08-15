"""Tests for src/output_bundler.py"""
import pytest
from src.output_bundler import build_output_bundle
from src.ews_rules import EWS_TIER


class TestBuildOutputBundle:
    def test_bundle_has_all_top_level_keys(self, sample_forecast_df):
        bundle = self._make_bundle(sample_forecast_df)
        required = {
            "entity_id",
            "cashflow_forecast_12m",
            "shortfall_probability_12m",
            "confidence_band",
            "stress_results",
            "ews_tier",
            "ews_triggers",
            "generated_at",
            "summary",
        }
        assert required.issubset(set(bundle.keys()))

    def test_cashflow_forecast_is_list_of_12(self, sample_forecast_df):
        bundle = self._make_bundle(sample_forecast_df)
        assert len(bundle["cashflow_forecast_12m"]) == 12

    def test_shortfall_prob_is_list_of_12(self, sample_forecast_df):
        bundle = self._make_bundle(sample_forecast_df)
        assert len(bundle["shortfall_probability_12m"]) == 12

    def test_confidence_band_is_list_of_12(self, sample_forecast_df):
        bundle = self._make_bundle(sample_forecast_df)
        assert len(bundle["confidence_band"]) == 12

    def test_ews_tier_is_string(self, sample_forecast_df):
        bundle = self._make_bundle(sample_forecast_df)
        assert isinstance(bundle["ews_tier"], str)
        assert bundle["ews_tier"] in ("GREEN", "AMBER", "RED")

    def test_entity_id_matches(self, sample_forecast_df):
        bundle = self._make_bundle(sample_forecast_df, entity_id="TEST001")
        assert bundle["entity_id"] == "TEST001"

    def test_stress_results_excludes_raw_cashflow(self, sample_forecast_df):
        bundle = self._make_bundle(sample_forecast_df)
        for scenario, metrics in bundle["stress_results"].items():
            assert "stressed_cashflow" not in metrics

    def test_summary_has_expected_keys(self, sample_forecast_df):
        bundle = self._make_bundle(sample_forecast_df)
        summary = bundle["summary"]
        assert "avg_forecast_cashflow" in summary
        assert "max_shortfall_probability" in summary
        assert "ews_tier" in summary

    # ── Helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def _make_stress_results():
        from src.stress_engine import StressEngine, SCENARIOS
        import pandas as pd
        periods = pd.date_range("2024-07-01", periods=12, freq="MS")
        import numpy as np
        df = pd.DataFrame({
            "period": periods,
            "forecast": [20_000.0] * 12,
            "lower_p10": [12_000.0] * 12,
            "upper_p90": [28_000.0] * 12,
            "total_inflow": [50_000.0] * 12,
            "total_outflow": [30_000.0] * 12,
            "shortfall_probability": [0.1] * 12,
        })
        return StressEngine().run(df)

    @staticmethod
    def _make_ews_result():
        return {
            "tier": EWS_TIER.GREEN,
            "triggers": [],
            "trigger_count": 0,
            "red_flag_count": 0,
            "watch_flag_count": 0,
        }

    def _make_bundle(self, forecast_df, entity_id: str = "E001"):
        return build_output_bundle(
            entity_id=entity_id,
            forecast_df=forecast_df,
            stress_results=self._make_stress_results(),
            ews_result=self._make_ews_result(),
        )
