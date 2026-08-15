"""
ML Trainer: formal train/val/test split, MLflow experiment tracking,
and comprehensive metric reporting for the CashflowForecaster.

Split strategy (chronological — no leakage):
  Train:       First 60% of monthly history
  Validation:  Next 20%   (used for hyperparameter signal)
  Test:        Last 20%   (held-out, reported once)

Walk-forward CV runs on the train portion only.

Metrics:
  MAPE    — Mean Absolute Percentage Error
  RMSE    — Root Mean Squared Error
  MAE     — Mean Absolute Error
  R2      — Coefficient of Determination
  Coverage — % actuals inside P10–P90 band (target > 70%)
  Calibration — Brier score of shortfall probabilities
"""
from __future__ import annotations

import warnings
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import mlflow
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from src.forecaster import CashflowForecaster
from src.monte_carlo import compute_shortfall_probabilities

warnings.filterwarnings("ignore")

MLFLOW_EXPERIMENT_NAME = "cashflow_forecasting"
DEFAULT_FORECAST_HORIZON = 3   # months per CV fold prediction


# ── Metric helpers ────────────────────────────────────────────────────────────


def compute_mape(actual: Any, predicted: Any) -> float:
    """Mean Absolute Percentage Error (excludes zero-actual rows)."""
    mask = actual != 0.0
    if not mask.any():
        return float("nan")
    return float(
        np.mean(np.abs((actual[mask] - predicted[mask]) / actual[mask])) * 100
    )


def compute_rmse(actual: Any, predicted: Any) -> float:
    return float(np.sqrt(mean_squared_error(actual, predicted))) # type: ignore


def compute_mae(actual: Any, predicted: Any) -> float:
    return mean_absolute_error(actual, predicted) # type: ignore


def compute_r2(actual: Any, predicted: Any) -> float:
    return r2_score(actual, predicted) # type: ignore


def compute_coverage(
    actual: Any, lower: Any, upper: Any
) -> float:
    """Percentage of actuals that fall inside the [lower, upper] band."""
    inside = (actual >= lower) & (actual <= upper) # type: ignore
    return float(np.mean(inside) * 100)


def compute_brier_score(
    shortfall_probs: Any, actual_shortfalls: Any
) -> float:
    """
    Brier score = mean squared error of probability forecasts.
    Lower is better; 0 = perfect, 0.25 = random baseline.
    """
    return float(np.mean((shortfall_probs - actual_shortfalls) ** 2)) # type: ignore


def compute_all_metrics(
    actual: Any,
    predicted: Any,
    lower: Any,
    upper: Any,
) -> dict[str, float]:
    """Compute all forecast metrics in one call."""
    return {
        "mape": compute_mape(actual, predicted),
        "rmse": compute_rmse(actual, predicted),
        "mae": compute_mae(actual, predicted),
        "r2": compute_r2(actual, predicted),
        "ci_coverage_pct": compute_coverage(actual, lower, upper),
    }


# ── Split helper ──────────────────────────────────────────────────────────────


def chronological_split(
    df: pd.DataFrame,
    train_ratio: float = 0.60,
    val_ratio: float = 0.20,
) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Split a sorted monthly features DataFrame into train / val / test sets
    using chronological ordering (no data leakage).

    Args:
        df:          Monthly features DataFrame, sorted by period.
        train_ratio: Fraction allocated to training.
        val_ratio:   Fraction allocated to validation.

    Returns:
        (train_df, val_df, test_df)

    Raises:
        ValueError: If the resulting splits are too small to be useful.
    """
    n = len(df)
    train_end = int(n * train_ratio)
    val_end = train_end + int(n * val_ratio)

    train_df = df.iloc[:train_end].copy()
    val_df = df.iloc[train_end:val_end].copy()
    test_df = df.iloc[val_end:].copy()

    if len(train_df) < 12:
        raise ValueError(
            f"Training set has only {len(train_df)} months; minimum 12 required. "
            "Provide more historical data."
        )
    if len(val_df) == 0 or len(test_df) == 0:
        raise ValueError("Validation or test split is empty. Provide more data.")

    return train_df, val_df, test_df


# ── Report dataclass ─────────────────────────────────────────────────────────


@dataclass
class TrainingReport:
    """
    Structured result from a full training experiment run.

    Attributes:
        train_metrics:   Metrics on training set (in-sample).
        val_metrics:     Metrics on validation set.
        test_metrics:    Metrics on held-out test set.
        cv_fold_metrics: Per-fold walk-forward CV metrics (list of dicts).
        cv_summary:      Averaged CV metrics.
        shap_importance: Feature importance DataFrame from SHAP.
        mlflow_run_id:   MLflow run ID for this experiment.
        params:          Hyperparameters used.
        n_train:         Number of training months.
        n_val:           Number of validation months.
        n_test:          Number of test months.
    """

    train_metrics: dict[str, float] = field(default_factory=dict)
    val_metrics: dict[str, float] = field(default_factory=dict)
    test_metrics: dict[str, float] = field(default_factory=dict)
    cv_fold_metrics: list[dict[str, Any]] = field(default_factory=list)
    cv_summary: dict[str, float] = field(default_factory=dict)
    shap_importance: pd.DataFrame | None = None
    mlflow_run_id: str = ""
    params: dict[str, Any] = field(default_factory=dict)
    n_train: int = 0
    n_val: int = 0
    n_test: int = 0

    def summary_table(self) -> pd.DataFrame:
        """Return a compact metrics comparison table across splits."""
        rows = []
        for split_name, metrics in [
            ("train", self.train_metrics),
            ("val", self.val_metrics),
            ("test", self.test_metrics),
            ("cv_avg", self.cv_summary),
        ]:
            rows.append({"split": split_name, **metrics})
        return pd.DataFrame(rows).set_index("split")

    def __repr__(self) -> str:
        lines = [
            "═" * 60,
            "  CASHFLOW FORECASTER — TRAINING REPORT",
            "═" * 60,
            f"  MLflow Run ID : {self.mlflow_run_id}",
            f"  Train months  : {self.n_train}",
            f"  Val months    : {self.n_val}",
            f"  Test months   : {self.n_test}",
            "",
            "  ── Metrics by Split ──",
        ]
        for split, m in [
            ("Train ", self.train_metrics),
            ("Val   ", self.val_metrics),
            ("Test  ", self.test_metrics),
            ("CV Avg", self.cv_summary),
        ]:
            if m:
                mape = m.get("mape", float("nan"))
                rmse = m.get("rmse", float("nan"))
                mae = m.get("mae", float("nan"))
                r2 = m.get("r2", float("nan"))
                cov = m.get("ci_coverage_pct", float("nan"))
                lines.append(
                    f"  {split} | MAPE={mape:6.1f}%  RMSE={rmse:10,.0f}  "
                    f"MAE={mae:10,.0f}  R²={r2:+.3f}  CI%={cov:.1f}%"
                )
        lines.append("═" * 60)
        return "\n".join(lines)


# ── Walk-forward CV ───────────────────────────────────────────────────────────


def walk_forward_cv(
    train_df: pd.DataFrame,
    n_splits: int = 3,
    horizon: int = DEFAULT_FORECAST_HORIZON,
    prophet_weight: float = 0.5,
    lgbm_weight: float = 0.5,
    lgbm_params: dict[str, Any] | None = None,
    tree_model_type: str = "lgbm",
) -> tuple[list[dict[str, Any]], dict[str, float]]:
    """
    Expanding-window walk-forward cross-validation on training data.

    Args:
        train_df:      Monthly features DataFrame (training portion only).
        n_splits:      Number of folds.
        horizon:       Forecast horizon per fold (months).
        prophet_weight: Ensemble weight for Prophet.
        lgbm_weight:   Ensemble weight for LightGBM.
        lgbm_params:   LightGBM hyperparameter overrides.

    Returns:
        (fold_results, avg_summary) — per-fold metric dicts and their averages.
    """
    n = len(train_df)
    fold_results: list[dict[str, Any]] = []

    for fold in range(n_splits):
        test_end = n - fold * horizon
        test_start = test_end - horizon
        train_end = test_start

        if train_end < 12:
            print(f"  CV Fold {fold + 1}: insufficient training data ({train_end} months), skipping")
            continue

        fold_train = train_df.iloc[:train_end].copy()
        fold_test = train_df.iloc[test_start:test_end].copy()

        if len(fold_test) == 0:
            continue

        fc = CashflowForecaster(
            prophet_weight=prophet_weight,
            lgbm_weight=lgbm_weight,
            lgbm_params=lgbm_params,
            tree_model_type=tree_model_type,
        )
        fc.fit(fold_train)
        pred_df = fc.predict(horizon=len(fold_test))

        actual = fold_test["net_cashflow"].values
        predicted = pred_df["forecast"].values[: len(actual)]
        lower = pred_df["lower_p10"].values[: len(actual)]
        upper = pred_df["upper_p90"].values[: len(actual)]

        metrics = compute_all_metrics(actual, predicted, lower, upper) # type: ignore
        fold_result: dict[str, Any] = {
            "fold": fold + 1,
            "train_months": train_end,
            "test_months": len(actual),
            **metrics,
        }
        fold_results.append(fold_result)

        mape_str = f"{metrics['mape']:.1f}%" if not np.isnan(metrics["mape"]) else "N/A"
        print(
            f"  CV Fold {fold + 1}: MAPE={mape_str}  "
            f"RMSE={metrics['rmse']:,.0f}  "
            f"MAE={metrics['mae']:,.0f}  "
            f"R²={metrics['r2']:+.3f}  "
            f"CI%={metrics['ci_coverage_pct']:.1f}%"
        )

    if not fold_results:
        return [], {}

    summary: dict[str, float] = {
        f"cv_avg_{k}": float(np.mean([r[k] for r in fold_results if k in r]))
        for k in ["mape", "rmse", "mae", "r2", "ci_coverage_pct"]
    }
    # Also expose without prefix for summary_table compatibility
    summary.update(
        {k: float(np.mean([r[k] for r in fold_results if k in r]))
         for k in ["mape", "rmse", "mae", "r2", "ci_coverage_pct"]}
    )
    return fold_results, summary


# ── Main training experiment ─────────────────────────────────────────────────


def run_training_experiment(
    transactions_path: str | Path | None = None,
    entity_id: str | int | None = None,
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    prophet_weight: float = 0.5,
    lgbm_weight: float = 0.5,
    lgbm_params: dict[str, Any] | None = None,
    n_cv_splits: int = 3,
    n_mc_simulations: int = 500,
    model_output_dir: str | Path = "models",
    mlflow_tracking_uri: str = "sqlite:///mlflow.db",
    features_df: pd.DataFrame | None = None,
    tree_model_type: str = "lgbm",
) -> TrainingReport:
    """
    Run a full training experiment with train/val/test evaluation and MLflow logging.

    Steps:
      1. Load and preprocess data
      2. Chronological train/val/test split
      3. Walk-forward CV on training set
      4. Final model training on full training set
      5. Evaluate on val and test sets
      6. Compute SHAP importances
      7. Log everything to MLflow
      8. Save model artifact

    Args:
        transactions_path:   Path to the AA transactions CSV.
        entity_id:           Entity to train for.
        train_ratio:         Fraction of months for training.
        val_ratio:           Fraction of months for validation.
        prophet_weight:      Ensemble weight for Prophet.
        lgbm_weight:         Ensemble weight for LightGBM.
        lgbm_params:         LightGBM hyperparameter overrides.
        n_cv_splits:         Walk-forward CV folds.
        n_mc_simulations:    Monte Carlo draws for calibration.
        model_output_dir:    Directory to save the fitted model.
        mlflow_tracking_uri: MLflow tracking URI.

    Returns:
        TrainingReport with all metrics, SHAP importances, and MLflow run ID.
    """
    from src.ingestor import load_transactions
    from src.transaction_categorizer import categorize_transactions
    from src.feature_engineer import build_monthly_features

    print("=" * 60)
    print(f"  CASHFLOW TRAINING EXPERIMENT — Entity: {entity_id}")
    print("=" * 60)

    # ── Data prep ─────────────────────────────────────────────────────────────
    if features_df is None:
        if transactions_path is None or entity_id is None:
            raise ValueError("Must provide either features_df or both (transactions_path and entity_id)")
        raw_df = load_transactions(transactions_path)
        if entity_id not in raw_df["entity_id"].unique():
            raise ValueError(f"No data found for entity_id='{entity_id}'")

        cat_df = categorize_transactions(raw_df)
        features_df = build_monthly_features(cat_df, entity_id=str(entity_id))
        features_df = features_df.sort_values("period").reset_index(drop=True)
    else:
        features_df = features_df.sort_values("period").reset_index(drop=True)
        if entity_id is None and "entity_id" in features_df.columns:
            entity_id = str(features_df["entity_id"].iloc[0])

    train_df, val_df, test_df = chronological_split(
        features_df, train_ratio=train_ratio, val_ratio=val_ratio
    )
    print(f"  Split: train={len(train_df)}m  val={len(val_df)}m  test={len(test_df)}m")

    params: dict[str, Any] = {
        "entity_id": entity_id,
        "train_ratio": train_ratio,
        "val_ratio": val_ratio,
        "prophet_weight": prophet_weight,
        "lgbm_weight": lgbm_weight,
        "n_cv_splits": n_cv_splits,
        "n_mc_simulations": n_mc_simulations,
        **(lgbm_params or {}),
    }

    mlflow.set_tracking_uri(mlflow_tracking_uri)
    mlflow.set_experiment(MLFLOW_EXPERIMENT_NAME)

    with mlflow.start_run() as run:
        mlflow.log_params(params)

        # ── Walk-forward CV ───────────────────────────────────────────────────
        print(f"\n  ── Walk-Forward CV ({n_cv_splits} folds) ──")
        cv_fold_metrics, cv_summary = walk_forward_cv(
            train_df,
            n_splits=n_cv_splits,
            prophet_weight=prophet_weight,
            lgbm_weight=lgbm_weight,
            lgbm_params=lgbm_params,
            tree_model_type=tree_model_type,
        )
        for k, v in cv_summary.items():
            if k.startswith("cv_avg_") and not np.isnan(v):
                mlflow.log_metric(k, v)

        # ── Final model training on train split ───────────────────────────────
        print("\n  ── Training Final Model ──")
        final_forecaster = CashflowForecaster(
            prophet_weight=prophet_weight,
            lgbm_weight=lgbm_weight,
            lgbm_params=lgbm_params,
            tree_model_type=tree_model_type,
        )
        final_forecaster.fit(train_df)

        # ── In-sample (train) metrics ─────────────────────────────────────────
        train_pred = final_forecaster.predict(horizon=len(val_df) + len(test_df))
        assert final_forecaster._prophet is not None
        train_in_sample_pred = final_forecaster._prophet.predict(
            pd.DataFrame({"ds": train_df["period"]})
        )["yhat"].to_numpy()

        train_metrics = compute_all_metrics(
            train_df["net_cashflow"].to_numpy(),
            train_in_sample_pred,
            train_in_sample_pred - 1.28 * final_forecaster._residual_std(),
            train_in_sample_pred + 1.28 * final_forecaster._residual_std(),
        ) # type: ignore
        _log_metrics_prefixed(train_metrics, "train")

        # ── Validation metrics ────────────────────────────────────────────────
        val_horizon = len(val_df)
        val_pred_df = final_forecaster.predict(horizon=val_horizon)
        val_actual = val_df["net_cashflow"].to_numpy()
        val_predicted = val_pred_df["forecast"].to_numpy()[: len(val_actual)]
        val_lower = val_pred_df["lower_p10"].to_numpy()[: len(val_actual)]
        val_upper = val_pred_df["upper_p90"].to_numpy()[: len(val_actual)]
        val_metrics = compute_all_metrics(val_actual, val_predicted, val_lower, val_upper) # type: ignore
        _log_metrics_prefixed(val_metrics, "val")

        # ── Re-train on train+val for test evaluation ─────────────────────────
        trainval_df = pd.concat([train_df, val_df], ignore_index=True)
        test_forecaster = CashflowForecaster(
            prophet_weight=prophet_weight,
            lgbm_weight=lgbm_weight,
            lgbm_params=lgbm_params,
            tree_model_type=tree_model_type,
        )
        test_forecaster.fit(trainval_df)

        test_pred_df = test_forecaster.predict(horizon=len(test_df))
        test_actual = test_df["net_cashflow"].to_numpy()
        test_predicted = test_pred_df["forecast"].to_numpy()[: len(test_actual)]
        test_lower = test_pred_df["lower_p10"].to_numpy()[: len(test_actual)]
        test_upper = test_pred_df["upper_p90"].to_numpy()[: len(test_actual)]
        test_metrics = compute_all_metrics(
            test_actual, test_predicted, test_lower, test_upper
        ) # type: ignore
        _log_metrics_prefixed(test_metrics, "test")

        # ── Shortfall calibration (Brier score on test) ───────────────────────
        test_pred_with_probs = compute_shortfall_probabilities(
            test_pred_df[: len(test_actual)], n_simulations=n_mc_simulations
        )
        actual_shortfalls = np.asarray(test_actual < 0, dtype=float)
        shortfall_probs = test_pred_with_probs["shortfall_probability"].to_numpy()[: len(test_actual)]
        brier = compute_brier_score(shortfall_probs, actual_shortfalls)
        mlflow.log_metric("test_shortfall_brier_score", brier)

        # ── SHAP importances ──────────────────────────────────────────────────
        print("\n  ── Computing SHAP Importances ──")
        shap_df: pd.DataFrame | None = None
        try:
            shap_df = final_forecaster.explain()
            # Log top-3 features as tags
            for i, (_, row) in enumerate(shap_df.head(3).iterrows()):
                mlflow.set_tag(
                    f"shap_top_{i+1}",
                    f"{row['feature']}={row['mean_abs_shap']:.2f}",
                )
        except Exception as e:
            print(f"  SHAP skipped: {e}")

        # ── Save model ────────────────────────────────────────────────────────
        model_dir = Path(model_output_dir)
        model_dir.mkdir(parents=True, exist_ok=True)
        model_path = model_dir / f"forecaster_{entity_id}.joblib"
        final_forecaster.save(model_path)
        mlflow.log_artifact(str(model_path))
        mlflow.set_tag("model_path", str(model_path))

        run_id = run.info.run_id

    print(f"\n  MLflow Run ID: {run_id}")

    report = TrainingReport(
        train_metrics=train_metrics,
        val_metrics=val_metrics,
        test_metrics=test_metrics,
        cv_fold_metrics=cv_fold_metrics,
        cv_summary=cv_summary,
        shap_importance=shap_df,
        mlflow_run_id=run_id,
        params=params,
        n_train=len(train_df),
        n_val=len(val_df),
        n_test=len(test_df),
    )
    print(f"\n{report}")
    return report

def compare_and_select_best_model(**kwargs) -> TrainingReport:
    """Run training for both LightGBM and XGBoost, return the one with the lowest validation RMSE."""
    print("\n" + "=" * 60)
    print("  RUNNING LIGHTGBM EXPERIMENT")
    print("=" * 60)
    lgbm_report = run_training_experiment(**kwargs, tree_model_type="lgbm")
    
    print("\n" + "=" * 60)
    print("  RUNNING XGBOOST EXPERIMENT")
    print("=" * 60)
    xgb_report = run_training_experiment(**kwargs, tree_model_type="xgboost")
    
    lgbm_rmse = lgbm_report.val_metrics.get("rmse", float("inf"))
    xgb_rmse = xgb_report.val_metrics.get("rmse", float("inf"))
    
    if xgb_rmse <= lgbm_rmse:
        print(f"\n  XGBoost wins! (Val RMSE: {xgb_rmse:,.0f} <= LightGBM: {lgbm_rmse:,.0f})")
        # XGBoost was run last, so its model is on disk.
        return xgb_report
    else:
        print(f"\n  LightGBM wins! (Val RMSE: {lgbm_rmse:,.0f} < XGBoost: {xgb_rmse:,.0f})")
        # Rerun LightGBM to ensure its model artifact is the one saved to disk
        print("  Re-saving LightGBM model...")
        return run_training_experiment(**kwargs, tree_model_type="lgbm")



def _log_metrics_prefixed(metrics: dict[str, float], prefix: str) -> None:
    """Log a metrics dict to MLflow with a prefix on each key."""
    for k, v in metrics.items():
        if not np.isnan(v):
            mlflow.log_metric(f"{prefix}_{k}", v)

# ── Optuna Hyperparameter Tuning ─────────────────────────────────────────────

def _suggest_lgbm_params(trial: Any) -> dict[str, Any]:
    return {
        "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.1, log=True),
        "num_leaves": trial.suggest_int("num_leaves", 10, 64),
        "max_depth": trial.suggest_int("max_depth", 3, 10),
        "min_child_samples": trial.suggest_int("min_child_samples", 1, 20),
        "subsample": trial.suggest_float("subsample", 0.5, 1.0),
        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 1.0),
        "reg_alpha": trial.suggest_float("reg_alpha", 1e-3, 10.0, log=True),
        "reg_lambda": trial.suggest_float("reg_lambda", 1e-3, 10.0, log=True),
        "n_estimators": 500, # We rely on early stopping
        "random_state": 42,
        "n_jobs": -1,
    }


def tune_cashflow_forecaster(
    df: pd.DataFrame,
    n_trials: int = 50,
    run_name: str = "cashflow_optuna",
    n_folds: int = 5,
    horizon: int = DEFAULT_FORECAST_HORIZON,
    prophet_weight: float = 0.5,
    lgbm_weight: float = 0.5,
    artifact_dir: str | Path | None = None,
    mlflow_tracking_uri: str = "sqlite:///mlflow.db",
) -> dict[str, Any]:
    """
    Tune CashflowForecaster LightGBM parameters using walk-forward TimeSeries CV.
    Minimizes mean validation RMSE using Optuna and logs to MLflow.
    """
    import optuna
    import json
    from optuna.integration.mlflow import MLflowCallback
    from optuna.integration.lightgbm import LightGBMPruningCallback
    from lightgbm import early_stopping
    
    optuna.logging.set_verbosity(optuna.logging.WARNING)

    base_dir = Path(artifact_dir) if artifact_dir else Path("artifacts") / "cashflow"
    out_dir = base_dir / run_name
    out_dir.mkdir(parents=True, exist_ok=True)
    storage_path = f"sqlite:///{out_dir / 'optuna_study.db'}"

    # TimeSeries Walk-Forward Split setup
    n = len(df)
    
    def objective(trial: optuna.Trial) -> float:
        params = _suggest_lgbm_params(trial)
        fold_rmses: list[float] = []

        for fold in range(n_folds):
            test_end = n - fold * horizon
            test_start = test_end - horizon
            train_end = test_start

            if train_end < 12:
                continue

            fold_train = df.iloc[:train_end].copy()
            fold_test = df.iloc[test_start:test_end].copy()

            if len(fold_test) == 0:
                continue
                
            # Setup Early Stopping and Pruning (only prune based on first fold to be safe)
            callbacks = [early_stopping(stopping_rounds=15, verbose=False)]
            if fold == 0:
                callbacks.append(LightGBMPruningCallback(trial, "l2", valid_name="valid_0"))

            fc = CashflowForecaster(
                prophet_weight=prophet_weight,
                lgbm_weight=lgbm_weight,
                lgbm_params=params,
            )
            fc.fit(fold_train, eval_df=fold_test, callbacks=callbacks)
            
            # Evaluate using CashflowForecaster full ensemble
            pred_df = fc.predict(horizon=len(fold_test))
            actual = fold_test["net_cashflow"].values
            predicted = pred_df["forecast"].values[: len(actual)]
            
            rmse = compute_rmse(actual, predicted)
            fold_rmses.append(rmse)

            trial.report(float(np.mean(fold_rmses)), step=fold)
            if trial.should_prune():
                raise optuna.TrialPruned()

        if not fold_rmses:
            return float('inf')
            
        mean_rmse = float(np.mean(fold_rmses))
        print(f"Trial {trial.number:03d} | Mean CV RMSE: {mean_rmse:,.0f} | Folds: {[round(r) for r in fold_rmses]}")
        return mean_rmse

    mlflow.set_tracking_uri(mlflow_tracking_uri)
    mlflow_cb = MLflowCallback(
        tracking_uri=mlflow_tracking_uri,
        metric_name="cv_mean_rmse",
        create_experiment=True,
    )

    study = optuna.create_study(
        direction="minimize",
        study_name=f"{run_name}_tuning",
        storage=storage_path,
        load_if_exists=True,
        pruner=optuna.pruners.MedianPruner(),
    )

    completed_before = len([t for t in study.trials if t.state == optuna.trial.TrialState.COMPLETE])
    remaining = max(0, n_trials - completed_before)

    if remaining > 0:
        print(f"\n[OPTUNA] Starting {n_folds}-Fold Walk-Forward CV Search | {remaining} trials remaining...")
        study.optimize(objective, n_trials=remaining, callbacks=[mlflow_cb])

    best_params = {
        **study.best_params,
        "n_estimators": 500,
        "random_state": 42,
        "n_jobs": -1,
    }
    
    print(f"[OPTUNA] Best trial #{study.best_trial.number} — Mean CV RMSE: {study.best_value:,.0f}")
    
    # Save summary artifact
    summary = {
        "run_name": run_name,
        "best_params": best_params,
        "best_mean_cv_rmse": study.best_value,
        "n_folds": n_folds,
        "storage": storage_path,
    }
    (out_dir / "best_params.json").write_text(json.dumps(summary, indent=2))
    
    return best_params
