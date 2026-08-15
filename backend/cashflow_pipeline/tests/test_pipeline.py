"""Tests for src/pipeline.py (end-to-end integration)"""
import pytest
from src.pipeline import run_pipeline
from src.stress_engine import SCENARIOS


class TestRunPipeline:
    """Integration tests — session-scoped CSV avoids repeated I/O."""

    @pytest.fixture(scope="class")
    def pipeline_result(self, sample_transactions_csv):
        """Run the pipeline once per test class."""
        return run_pipeline(
            transactions_path=sample_transactions_csv,
            entity_id="E001",
        )

    def test_returns_bundle_for_entity(self, pipeline_result):
        assert pipeline_result["entity_id"] == "E001"

    def test_cashflow_forecast_12_months(self, pipeline_result):
        assert len(pipeline_result["cashflow_forecast_12m"]) == 12

    def test_shortfall_probability_12_months(self, pipeline_result):
        assert len(pipeline_result["shortfall_probability_12m"]) == 12

    def test_confidence_band_12_months(self, pipeline_result):
        assert len(pipeline_result["confidence_band"]) == 12

    def test_stress_results_present(self, pipeline_result):
        assert "stress_results" in pipeline_result

    def test_all_stress_scenarios_present(self, pipeline_result):
        for scenario in SCENARIOS:
            assert scenario in pipeline_result["stress_results"]

    def test_ews_tier_valid(self, pipeline_result):
        assert pipeline_result["ews_tier"] in ("GREEN", "AMBER", "RED")

    def test_generated_at_present(self, pipeline_result):
        assert "generated_at" in pipeline_result
        assert pipeline_result["generated_at"]  # non-empty

    def test_summary_present(self, pipeline_result):
        assert "summary" in pipeline_result
        assert "avg_forecast_cashflow" in pipeline_result["summary"]

    def test_raises_for_unknown_entity(self, msme_transactions_csv):
        with pytest.raises(ValueError, match="No data found"):
            run_pipeline(
                transactions_path=msme_transactions_csv,
                entity_id="UNKNOWN_ENTITY_XYZ",
            )

    def test_forecast_values_are_numeric(self, pipeline_result):
        for item in pipeline_result["cashflow_forecast_12m"]:
            assert isinstance(item["value"], (int, float))

    def test_shortfall_probs_bounded(self, pipeline_result):
        for item in pipeline_result["shortfall_probability_12m"]:
            assert 0 <= item["probability"] <= 1


class TestGeneralUserPipeline:
    """Integration tests for the general user entity (G001, 2 accounts)."""

    @pytest.fixture(scope="class")
    def general_result(self, sample_transactions_csv):
        return run_pipeline(
            transactions_path=sample_transactions_csv,
            entity_id="G001",
            entity_type="general",
        )

    def test_returns_bundle(self, general_result):
        assert general_result["entity_id"] == "G001"

    def test_forecast_12_months(self, general_result):
        assert len(general_result["cashflow_forecast_12m"]) == 12

    def test_general_stress_scenarios_present(self, general_result):
        from src.stress_engine import GENERAL_SCENARIOS
        for scenario in GENERAL_SCENARIOS:
            assert scenario in general_result["stress_results"], \
                f"Missing general scenario: {scenario}"

    def test_ews_tier_valid(self, general_result):
        assert general_result["ews_tier"] in ("GREEN", "AMBER", "RED")

    def test_no_msme_scenarios_in_general_result(self, general_result):
        from src.stress_engine import SCENARIOS
        for msme_scenario in SCENARIOS:
            assert msme_scenario not in general_result["stress_results"], \
                f"MSME scenario leaked into general result: {msme_scenario}"
