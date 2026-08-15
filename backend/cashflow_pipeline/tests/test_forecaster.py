"""Tests for src/forecaster.py"""
import numpy as np
import pandas as pd
import pytest

from src.forecaster import CashflowForecaster


class TestCashflowForecasterInit:
    def test_default_weights(self):
        fc = CashflowForecaster()
        assert fc.prophet_weight == 0.5
        assert fc.lgbm_weight == 0.5

    def test_custom_weights(self):
        fc = CashflowForecaster(prophet_weight=0.4, lgbm_weight=0.6)
        assert abs(fc.prophet_weight + fc.lgbm_weight - 1.0) < 1e-9

    def test_invalid_weights_raise(self):
        with pytest.raises(ValueError, match="must equal 1.0"):
            CashflowForecaster(prophet_weight=0.3, lgbm_weight=0.3)


class TestCashflowForecasterFitPredict:
    def test_fit_returns_self(self, minimal_features_df):
        fc = CashflowForecaster()
        result = fc.fit(minimal_features_df)
        assert result is fc

    def test_predict_before_fit_raises(self):
        fc = CashflowForecaster()
        with pytest.raises(RuntimeError, match="must call fit"):
            fc.predict(horizon=12)

    def test_predict_returns_12_rows(self, minimal_features_df):
        fc = CashflowForecaster()
        fc.fit(minimal_features_df)
        result = fc.predict(horizon=12)
        assert len(result) == 12

    def test_output_has_required_columns(self, minimal_features_df):
        fc = CashflowForecaster()
        fc.fit(minimal_features_df)
        result = fc.predict(horizon=12)
        required = {"period", "forecast", "lower_p10", "upper_p90"}
        assert required.issubset(set(result.columns))

    def test_confidence_band_ordering(self, minimal_features_df):
        fc = CashflowForecaster()
        fc.fit(minimal_features_df)
        result = fc.predict(horizon=12)
        assert (result["lower_p10"] <= result["forecast"]).all()
        assert (result["forecast"] <= result["upper_p90"]).all()

    def test_prophet_and_lgbm_forecasts_in_output(self, minimal_features_df):
        fc = CashflowForecaster()
        fc.fit(minimal_features_df)
        result = fc.predict(horizon=6)
        assert "prophet_forecast" in result.columns
        assert "lgbm_forecast" in result.columns

    def test_future_periods_start_after_history(self, minimal_features_df):
        fc = CashflowForecaster()
        fc.fit(minimal_features_df)
        result = fc.predict(horizon=3)
        last_history = minimal_features_df["period"].max()
        assert (result["period"] > last_history).all()


class TestCashflowForecasterSaveLoad:
    def test_save_and_load(self, minimal_features_df, tmp_path):
        fc = CashflowForecaster()
        fc.fit(minimal_features_df)
        path = tmp_path / "test_forecaster.joblib"
        fc.save(path)
        assert path.exists()

        loaded_fc = CashflowForecaster.load(path)
        assert loaded_fc._fitted
        result = loaded_fc.predict(horizon=3)
        assert len(result) == 3
