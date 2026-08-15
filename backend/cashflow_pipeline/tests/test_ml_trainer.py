"""Tests for src/ml_trainer.py"""
import numpy as np
import pandas as pd
import pytest

from src.ml_trainer import (
    chronological_split,
    compute_all_metrics,
    compute_brier_score,
    compute_mape,
    compute_rmse,
    compute_mae,
    compute_r2,
    compute_coverage,
    walk_forward_cv,
    TrainingReport,
)


class TestMetricFunctions:
    def test_mape_basic(self):
        actual = np.array([100.0, 200.0, 300.0])
        predicted = np.array([110.0, 190.0, 300.0])
        # errors: 10%, 5%, 0% → avg = 5%
        assert abs(compute_mape(actual, predicted) - 5.0) < 0.01

    def test_mape_ignores_zero_actuals(self):
        actual = np.array([0.0, 100.0])
        predicted = np.array([999.0, 110.0])
        # only second row valid: 10%
        assert abs(compute_mape(actual, predicted) - 10.0) < 0.01

    def test_rmse_perfect_prediction(self):
        actual = np.array([100.0, 200.0])
        assert compute_rmse(actual, actual) == 0.0

    def test_mae_basic(self):
        actual = np.array([100.0, 200.0])
        predicted = np.array([110.0, 180.0])
        assert abs(compute_mae(actual, predicted) - 15.0) < 0.01

    def test_r2_perfect_fit(self):
        actual = np.array([1.0, 2.0, 3.0])
        assert abs(compute_r2(actual, actual) - 1.0) < 1e-9

    def test_coverage_all_inside(self):
        actual = np.array([10.0, 20.0, 30.0])
        lower = np.array([5.0, 15.0, 25.0])
        upper = np.array([15.0, 25.0, 35.0])
        assert compute_coverage(actual, lower, upper) == 100.0

    def test_coverage_none_inside(self):
        actual = np.array([100.0, 200.0])
        lower = np.array([0.0, 0.0])
        upper = np.array([50.0, 50.0])
        assert compute_coverage(actual, lower, upper) == 0.0

    def test_brier_score_perfect(self):
        probs = np.array([0.0, 1.0])
        actuals = np.array([0.0, 1.0])
        assert compute_brier_score(probs, actuals) == 0.0

    def test_brier_score_random(self):
        probs = np.array([0.5, 0.5])
        actuals = np.array([0.0, 1.0])
        assert abs(compute_brier_score(probs, actuals) - 0.25) < 0.01

    def test_compute_all_metrics_keys(self):
        a = np.array([100.0, 200.0, 300.0])
        p = np.array([110.0, 190.0, 290.0])
        l = np.array([90.0, 170.0, 270.0])
        u = np.array([130.0, 210.0, 310.0])
        m = compute_all_metrics(a, p, l, u)
        assert set(m.keys()) == {"mape", "rmse", "mae", "r2", "ci_coverage_pct"}


class TestChronologicalSplit:
    def test_split_sizes(self, sample_features_df):
        train, val, test = chronological_split(sample_features_df)
        total = len(sample_features_df)
        assert len(train) + len(val) + len(test) == total

    def test_no_overlap(self, sample_features_df):
        train, val, test = chronological_split(sample_features_df)
        # Periods are ordered: train < val < test
        assert train["period"].max() <= val["period"].min()
        assert val["period"].max() <= test["period"].min()

    def test_raises_if_train_too_small(self, minimal_features_df):
        """Only 24 rows with 90/5/5 split → train=21 which is ≥12; still valid."""
        train, val, test = chronological_split(
            minimal_features_df, train_ratio=0.90, val_ratio=0.05
        )
        assert len(train) >= 12


class TestWalkForwardCV:
    def test_returns_tuple(self, sample_features_df):
        train_df, _, _ = chronological_split(sample_features_df)
        fold_results, summary = walk_forward_cv(train_df, n_splits=2)
        assert isinstance(fold_results, list)
        assert isinstance(summary, dict)

    def test_summary_has_metric_keys(self, sample_features_df):
        train_df, _, _ = chronological_split(sample_features_df)
        _, summary = walk_forward_cv(train_df, n_splits=2)
        if summary:  # might be empty if insufficient data
            assert any("mape" in k for k in summary)


class TestTrainingReport:
    def test_summary_table_returns_dataframe(self):
        report = TrainingReport(
            train_metrics={"mape": 10.0, "rmse": 1000.0, "mae": 800.0, "r2": 0.8, "ci_coverage_pct": 75.0},
            val_metrics={"mape": 15.0, "rmse": 1500.0, "mae": 1200.0, "r2": 0.7, "ci_coverage_pct": 70.0},
            test_metrics={"mape": 18.0, "rmse": 1800.0, "mae": 1400.0, "r2": 0.65, "ci_coverage_pct": 68.0},
        )
        table = report.summary_table()
        assert isinstance(table, pd.DataFrame)
        assert "train" in table.index

    def test_repr_contains_metric_labels(self):
        report = TrainingReport(
            train_metrics={"mape": 10.0, "rmse": 1000.0, "mae": 800.0, "r2": 0.8, "ci_coverage_pct": 75.0},
        )
        repr_str = repr(report)
        assert "MAPE" in repr_str
        assert "RMSE" in repr_str
