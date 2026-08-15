"""
Benchmarking harness for the cashflow forecasting pipeline.

Runs walk-forward cross-validation and prints a formatted metrics table.

Metrics:
  MAPE         — Mean Absolute Percentage Error (lower is better)
  RMSE         — Root Mean Squared Error (lower is better)
  MAE          — Mean Absolute Error (lower is better)
  R²           — Variance explained (higher is better, max 1.0)
  CI Coverage  — % actuals inside P10–P90 band (target > 70%)

Run with:
  python benchmarks/benchmark_runner.py
"""
from __future__ import annotations

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "src"))

import numpy as np
import pandas as pd

from ingestor import load_transactions
from transaction_categorizer import categorize_transactions
from feature_engineer import build_monthly_features
from forecaster import CashflowForecaster
from monte_carlo import compute_shortfall_probabilities
from ml_trainer import (
    chronological_split,
    compute_all_metrics,
    compute_mape,
    compute_rmse,
    compute_mae,
    compute_r2,
    compute_coverage,
)

TRANSACTIONS_PATH = "data/sample_aa_transactions.csv"
ENTITY_ID = "E001"
N_SPLITS = 4
FORECAST_HORIZON = 3    # months per fold
MIN_TRAIN_MONTHS = 15


def _divider(char: str = "─", width: int = 72) -> str:
    return char * width


def _header(text: str, width: int = 72) -> str:
    pad = (width - len(text) - 2) // 2
    return f"{'═' * pad} {text} {'═' * (width - pad - len(text) - 2)}"


def run_walk_forward_cv(
    features_df: pd.DataFrame,
    n_splits: int = N_SPLITS,
    horizon: int = FORECAST_HORIZON,
) -> tuple[list[dict], dict]:
    """Walk-forward CV on the training portion of features_df."""
    train_df, _, _ = chronological_split(features_df)
    n = len(train_df)
    fold_results: list[dict] = []

    print(_divider())
    print(
        f"  {'Fold':>4}  {'Train':>6}  {'Test':>5}  "
        f"{'MAPE':>7}  {'RMSE':>10}  {'MAE':>10}  "
        f"{'R²':>6}  {'CI%':>6}"
    )
    print(_divider())

    for fold in range(n_splits):
        test_end = n - fold * horizon
        test_start = test_end - horizon
        train_end = test_start

        if train_end < MIN_TRAIN_MONTHS:
            print(f"  Fold {fold + 1:>2}: insufficient training data ({train_end}m), skipping")
            continue

        fold_train = train_df.iloc[:train_end].copy()
        fold_test = train_df.iloc[test_start:test_end].copy()

        if len(fold_test) == 0:
            continue

        fc = CashflowForecaster(prophet_weight=0.5, lgbm_weight=0.5)
        fc.fit(fold_train)
        pred_df = fc.predict(horizon=len(fold_test))

        actual = fold_test["net_cashflow"].values
        predicted = pred_df["forecast"].values[: len(actual)]
        lower = pred_df["lower_p10"].values[: len(actual)]
        upper = pred_df["upper_p90"].values[: len(actual)]

        m = compute_all_metrics(actual, predicted, lower, upper)
        mape_str = f"{m['mape']:6.1f}%" if not np.isnan(m["mape"]) else "   N/A"
        print(
            f"  {fold + 1:>4}  {train_end:>6}m  {len(actual):>5}m  "
            f"{mape_str:>7}  {m['rmse']:>10,.0f}  {m['mae']:>10,.0f}  "
            f"{m['r2']:>+6.3f}  {m['ci_coverage_pct']:>5.1f}%"
        )

        fold_results.append({"fold": fold + 1, "train_months": train_end, **m})

    if not fold_results:
        return [], {}

    print(_divider())

    avg: dict = {
        k: float(np.mean([r[k] for r in fold_results]))
        for k in ["mape", "rmse", "mae", "r2", "ci_coverage_pct"]
    }
    mape_str = f"{avg['mape']:6.1f}%" if not np.isnan(avg["mape"]) else "   N/A"
    print(
        f"  {'AVG':>4}  {'':>6}   {'':>5}   "
        f"{mape_str:>7}  {avg['rmse']:>10,.0f}  {avg['mae']:>10,.0f}  "
        f"{avg['r2']:>+6.3f}  {avg['ci_coverage_pct']:>5.1f}%"
    )
    print(_divider())

    return fold_results, avg


def run_train_val_test_evaluation(features_df: pd.DataFrame) -> None:
    """Evaluate on formal train / val / test split."""
    print()
    print(_header("TRAIN / VAL / TEST EVALUATION"))
    print()

    train_df, val_df, test_df = chronological_split(features_df)
    print(f"  Train: {len(train_df)} months | Val: {len(val_df)} months | Test: {len(test_df)} months")
    print()

    # ── Train final model on train split ─────────────────────────────────────
    fc_trainonly = CashflowForecaster()
    fc_trainonly.fit(train_df)

    val_pred = fc_trainonly.predict(horizon=len(val_df))
    val_actual = val_df["net_cashflow"].values
    val_m = compute_all_metrics(
        val_actual,
        val_pred["forecast"].values[: len(val_actual)],
        val_pred["lower_p10"].values[: len(val_actual)],
        val_pred["upper_p90"].values[: len(val_actual)],
    )

    # ── Re-train on train+val for test ───────────────────────────────────────
    trainval_df = pd.concat([train_df, val_df], ignore_index=True)
    fc_trainval = CashflowForecaster()
    fc_trainval.fit(trainval_df)

    test_pred = fc_trainval.predict(horizon=len(test_df))
    test_actual = test_df["net_cashflow"].values
    test_m = compute_all_metrics(
        test_actual,
        test_pred["forecast"].values[: len(test_actual)],
        test_pred["lower_p10"].values[: len(test_actual)],
        test_pred["upper_p90"].values[: len(test_actual)],
    )

    # ── Print table ───────────────────────────────────────────────────────────
    print(_divider())
    print(f"  {'Split':>8}  {'MAPE':>7}  {'RMSE':>10}  {'MAE':>10}  {'R²':>6}  {'CI%':>6}")
    print(_divider())
    for split_name, m in [("Val", val_m), ("Test", test_m)]:
        mape_str = f"{m['mape']:6.1f}%" if not np.isnan(m["mape"]) else "   N/A"
        print(
            f"  {split_name:>8}  {mape_str:>7}  {m['rmse']:>10,.0f}  "
            f"{m['mae']:>10,.0f}  {m['r2']:>+6.3f}  {m['ci_coverage_pct']:>5.1f}%"
        )
    print(_divider())

    # ── CI coverage assessment ────────────────────────────────────────────────
    cov = test_m["ci_coverage_pct"]
    status = "✓ PASS" if cov >= 70 else "✗ BELOW TARGET"
    print(f"\n  CI Coverage: {cov:.1f}%  (target > 70%)  → {status}")


def main() -> None:
    print()
    print(_header("CASHFLOW PIPELINE BENCHMARK"))
    print(f"  Transactions : {TRANSACTIONS_PATH}")
    print(f"  Entity       : {ENTITY_ID}")
    print()

    # ── Load data ─────────────────────────────────────────────────────────────
    raw_df = load_transactions(TRANSACTIONS_PATH)
    cat_df = categorize_transactions(raw_df)
    features_df = build_monthly_features(cat_df, entity_id=ENTITY_ID)

    print(f"  History      : {len(features_df)} months")
    print(f"  Date range   : {features_df['period'].min():%Y-%m} → {features_df['period'].max():%Y-%m}")
    print()

    # ── Walk-forward CV ───────────────────────────────────────────────────────
    print(_header(f"WALK-FORWARD CV  ({N_SPLITS} folds, {FORECAST_HORIZON}-month horizon)"))
    print()
    fold_results, avg = run_walk_forward_cv(features_df)

    if avg:
        cov = avg["ci_coverage_pct"]
        ci_status = "✓ PASS" if cov >= 70.0 else "✗ BELOW TARGET"
        r2_status = "✓ PASS" if avg["r2"] >= 0.5 else "✗ LOW"
        print(f"\n  CI Coverage target (>70%): {ci_status}  ({cov:.1f}%)")
        print(f"  R² target (>0.5):          {r2_status}  ({avg['r2']:+.3f})")

    # ── Train/val/test ────────────────────────────────────────────────────────
    run_train_val_test_evaluation(features_df)

    print()
    print(_header("BENCHMARK COMPLETE"))
    print()


if __name__ == "__main__":
    main()
