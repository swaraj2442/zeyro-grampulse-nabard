"""BFS (Behavioural Finance Score) XGBoost training script.

Callable from a Jupyter notebook:

    from training.train_credit import run as train_credit
    result = train_credit(df_clean, run_name="credit_default_v1", feature_cols=["age", "cibil_score"])

Pipeline:
  1. Feature preparation  (features.py — assumes upstream data is clean)
  2. Stratified 70/15/15 train/val/test split
  3. XGBoost training with early stopping + epoch logging + checkpointing
  4. Evaluation: AUC, KS, Gini, Brier, F1, Precision, Recall, Accuracy,
                 TP, TN, FP, FN  (validation.py)
  5. Global SHAP importance  (population-level feature importance)
  6. Local SHAP contributions (per-observation explanations, 5 samples)
  7. Artefact serialisation (metrics and SHAP computed for both Val and Test)
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import cast

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
import mlflow
from .zeyro_mlflow import start_training_run

from .callbacks import CheckpointCallback, EpochLogCallback
from .features import CREDIT_DEFAULT_TARGET, prepare_features, FEATURE_TO_REASON
from .run_logger import RunLogger
from .shap_explainer import compute_shap, global_shap_importance, local_shap_contributions
from .validation import classification_metrics
from .fairness import fairness_report
from .bias_mitigation import optimize_thresholds, save_thresholds, compute_fairness_weights
from .psi import extract_baseline, calculate_psi

logger = logging.getLogger(__name__)

DEFAULT_PARAMS: dict = {
    "n_estimators": 500,
    "learning_rate": 0.05,
    "max_depth": 5,
    "min_child_weight": 10,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "reg_alpha": 0.1,
    "reg_lambda": 1.0,
    "objective": "binary:logistic",
    "eval_metric": "auc",
    "use_label_encoder": False,
    "random_state": 42,
    "n_jobs": -1,
}

ARTIFACT_ROOT = Path(__file__).parent.parent.parent / "artifacts" / "credit_default"


def run(
    df: pd.DataFrame,
    run_name: str,
    feature_cols: list[str],
    xgb_params: dict | None = None,
    early_stopping_rounds: int = 30,
    checkpoint_interval: int = 100,
    eval_threshold: float = 0.5,
    artifact_dir: Path | None = None,
    data_source: str = "proxy_homecredit",
    # ------------------------------------------------------------------
    # Fairness audit + in-artefact threshold persistence (optional)
    # ------------------------------------------------------------------
    protected_attr_col: str | None = None,
    fairness_optimize_metric: str = "balanced_accuracy",
    fairness_di_low: float = 0.8,
    fairness_di_high: float = 1.25,
    sample_weight_col: str | None = None,
) -> dict:
    """
    Train, evaluate, and persist a credit default XGBoost model.

    Args:
        df: Clean training DataFrame.
        run_name: Unique identifier for this run.
        feature_cols: Feature columns to use (required — no default for credit).
        xgb_params: XGBoost hyperparameter overrides.
        early_stopping_rounds: Early stopping patience.
        checkpoint_interval: Checkpoint every N estimators.
        eval_threshold: Decision threshold for binary classification metrics.
        artifact_dir: Override artefact root directory.
        protected_attr_col: Column in ``df`` for fairness auditing.  When
            provided, runs fairness_report, optimize_thresholds, and saves
            ``thresholds.json`` + ``fairness.json`` in the artefact dir.
            If ``None``, the fairness step is skipped.
        fairness_optimize_metric: Metric to optimise per group
            (``f1``, ``balanced_accuracy``, etc.).  Default ``balanced_accuracy``.
        fairness_di_low: Lower disparate-impact bound (default 0.8).
        fairness_di_high: Upper disparate-impact bound (default 1.25).
    """
    params = {**DEFAULT_PARAMS, **(xgb_params or {})}
    out_dir = (artifact_dir or ARTIFACT_ROOT) / run_name
    ckpt_dir = out_dir / "checkpoints"
    out_dir.mkdir(parents=True, exist_ok=True)
    
    log = RunLogger(model_name="BFS", run_name=run_name, out_dir=out_dir)

    # ------------------------------------------------------------------
    # 1. Features + target
    # ------------------------------------------------------------------
    X = prepare_features(df, feature_cols)
    feature_cols = list(X.columns)
    y = df[CREDIT_DEFAULT_TARGET].to_numpy(dtype="int32")
    log.start(params=params, n_rows=len(X), default_rate=float(y.mean()))

    # ------------------------------------------------------------------
    # 2. Stratified 70/15/15 split
    # ------------------------------------------------------------------
    # First split off 15% for strict Test
    X_temp, X_test, y_temp, y_test = train_test_split(
        X, y, test_size=0.15, stratify=y, random_state=42
    )
    # Remaining 85% is split to get ~70% Train, ~15% Val
    # 0.15 / 0.85 = 0.17647
    X_tr, X_val, y_tr, y_val = train_test_split(
        X_temp, y_temp, test_size=0.17647, stratify=y_temp, random_state=42
    )
    log.split(len(X_tr), len(X_val) + len(X_test))
    logger.info("[SPLIT]  Val size: %d | Test size: %d", len(X_val), len(X_test))

    with log.phase("PSI_BASELINE"):
        psi_baseline = extract_baseline(cast(pd.DataFrame, X_tr), feature_cols)
        (out_dir / "psi_baseline.json").write_text(json.dumps(psi_baseline, indent=2))

    # ------------------------------------------------------------------
    # 3. Train XGBoost
    # ------------------------------------------------------------------
    # ------------------------------------------------------------------
    # 3. Train XGBoost
    # ------------------------------------------------------------------
    model = XGBClassifier(
        early_stopping_rounds=early_stopping_rounds,
        callbacks=[
            CheckpointCallback(ckpt_dir, interval=checkpoint_interval),
            EpochLogCallback(log_every=50),
        ],
        **params
    )
    sample_weight_tr = None
    if sample_weight_col is not None:
        if sample_weight_col in df.columns:
            sample_weight_tr = df.loc[X_tr.index, sample_weight_col]
        else:
            logger.warning("[FAIRNESS] sample_weight_col '%s' not found — skipping weights.", sample_weight_col)

    with start_training_run(
        run_name=run_name,
        model_target="CREDIT_DEFAULT",
        data_source=data_source,
    ):
        with log.phase("TRAIN"):
            model.fit(
                X_tr, y_tr,
                sample_weight=sample_weight_tr,
                eval_set=[(X_val, y_val)],
                verbose=False,
            )
        log.best_round(model.best_iteration)

        # ------------------------------------------------------------------
        # 4. Epoch history (training curve)
        # ------------------------------------------------------------------
        training_curve: dict = model.evals_result()

        # ------------------------------------------------------------------
        # 5. Evaluation (Train, Validation & Test)
        # ------------------------------------------------------------------
        y_prob_tr = model.predict_proba(X_tr)[:, 1]
        y_prob_val = model.predict_proba(X_val)[:, 1]
        y_prob_test = model.predict_proba(X_test)[:, 1]
    
        metrics_tr = classification_metrics(
            y_true=np.asarray(y_tr), y_prob=y_prob_tr, label="credit_default_train", threshold=eval_threshold
        )
        log.metrics(metrics_tr, title="METRICS - TRAIN")

        metrics_val = classification_metrics(
            y_true=np.asarray(y_val), y_prob=y_prob_val, label="credit_default_val", threshold=eval_threshold
        )
        log.metrics(metrics_val, title="METRICS - VALIDATION")
    
        metrics_test = classification_metrics(
            y_true=np.asarray(y_test), y_prob=y_prob_test, label="credit_default_test", threshold=eval_threshold
        )
        log.metrics(metrics_test, title="METRICS - TEST (HELD OUT)")

        # ------------------------------------------------------------------
        # 6. SHAP — global (Train, Validation & Test)
        # ------------------------------------------------------------------
        with log.phase("SHAP"):
            # Train SHAP (Full Set)
            _, shap_vals_tr = compute_shap(model, cast(pd.DataFrame, X_tr))
            shap_global_tr = global_shap_importance(
                shap_vals_tr, feature_cols, feature_to_reason=FEATURE_TO_REASON, top_n=20
            )

            # Validation SHAP (Full Set)
            _, shap_vals_val = compute_shap(model, cast(pd.DataFrame, X_val))
            shap_global_val = global_shap_importance(
                shap_vals_val, feature_cols, feature_to_reason=FEATURE_TO_REASON, top_n=20
            )
        
            # Test SHAP (Full Set)
            _, shap_vals_test = compute_shap(model, cast(pd.DataFrame, X_test))
            shap_global_test = global_shap_importance(
                shap_vals_test, feature_cols, feature_to_reason=FEATURE_TO_REASON, top_n=20
            )
        
        log.shap_summary(shap_global_test)

        # ------------------------------------------------------------------
        # 7. Persist artefacts
        # ------------------------------------------------------------------
        model_path = out_dir / "model.json"
    
        # Physically discard trees built after early stopping to ensure true rollback on disk
        best_booster = model.get_booster()[: model.best_iteration + 1]
        best_booster.save_model(str(model_path))

        (out_dir / "metrics_tr.json").write_text(json.dumps(metrics_tr, indent=2))
        (out_dir / "metrics_val.json").write_text(json.dumps(metrics_val, indent=2))
        (out_dir / "metrics_test.json").write_text(json.dumps(metrics_test, indent=2))
        (out_dir / "training_curve.json").write_text(json.dumps(training_curve, indent=2))
    
        (out_dir / "shap_global_tr.json").write_text(json.dumps(shap_global_tr, indent=2))
        (out_dir / "shap_global_val.json").write_text(json.dumps(shap_global_val, indent=2))
        (out_dir / "shap_global_test.json").write_text(json.dumps(shap_global_test, indent=2))
    
        with log.phase("PSI_TEST"):
            psi_test = calculate_psi(psi_baseline, cast(pd.DataFrame, X_test))
            (out_dir / "psi_test.json").write_text(json.dumps(psi_test, indent=2))

        # ------------------------------------------------------------------
        # 8. Fairness audit + threshold persistence (optional)
        # ------------------------------------------------------------------
        fairness_result: dict | None = None
        thresholds: dict | None = None

        if protected_attr_col is not None:
            if protected_attr_col not in df.columns:
                logger.warning(
                    "[FAIRNESS] Column '%s' not found in df -- skipping fairness audit.",
                    protected_attr_col,
                )
            else:
                with log.phase("FAIRNESS"):
                    pa_test = df.loc[X_test.index, protected_attr_col]

                    fairness_result = fairness_report(
                        y_true=y_test,
                        y_pred=(y_prob_test >= eval_threshold).astype(int),
                        y_pred_proba=y_prob_test,
                        protected_attr=pa_test,
                        di_low=fairness_di_low,
                        di_high=fairness_di_high,
                    )

                    thresholds = optimize_thresholds(
                        y_true=y_test,
                        y_pred_proba=y_prob_test,
                        protected_attr=pa_test,
                        optimize_metric=fairness_optimize_metric,
                    )

                    save_thresholds(
                        thresholds,
                        path=out_dir / "thresholds.json",
                        protected_attr_col=protected_attr_col,
                        fallback_threshold=eval_threshold,
                        optimize_metric=fairness_optimize_metric,
                        metadata={
                            "run_name": run_name,
                            "di_ratio": fairness_result["disparate_impact"]["ratio"],
                            "di_passes": fairness_result["disparate_impact"]["passes"],
                            "eod": fairness_result["equal_opportunity"]["eod"],
                            "overall_passes": fairness_result["overall_passes"],
                        },
                    )

                    fairness_json = {
                        "disparate_impact": fairness_result["disparate_impact"],
                        "equal_opportunity": fairness_result["equal_opportunity"],
                        "equalized_odds": fairness_result["equalized_odds"],
                        "demographic_parity": fairness_result["demographic_parity"],
                        "overall_passes": fairness_result["overall_passes"],
                        "per_group": fairness_result["metrics_df"].to_dict(orient="records"),
                        "thresholds": {str(k): v for k, v in thresholds.items()},
                    }
                    (out_dir / "fairness.json").write_text(
                        json.dumps(fairness_json, indent=2)
                    )

                    logger.info(
                        "[FAIRNESS] DI=%.4f | EOD=%.4f | passes=%s",
                        fairness_result["disparate_impact"]["ratio"],
                        fairness_result["equal_opportunity"]["eod"],
                        fairness_result["overall_passes"],
                    )

        log.artifacts(out_dir)

        # MLflow explicit logging
        mlflow.log_metrics({
            "auc_test": metrics_test["auc"],
            "gini_test": metrics_test["gini"],
            "brier_test": metrics_test["brier"],
        })
        if fairness_result:
            mlflow.log_metrics({
                "disparate_impact": fairness_result["disparate_impact"]["ratio"]
            })
        # Log all JSON artifacts to S3
        mlflow.log_artifacts(str(out_dir))
        log.finish()

    return {
        "run_name": run_name,
        "best_round": model.best_iteration,
        "model_path": str(model_path),
        "metrics": {"train": metrics_tr, "val": metrics_val, "test": metrics_test},
        "training_curve": training_curve,
        "shap": {
            "global_train": shap_global_tr,
            "global_val": shap_global_val,
            "global_test": shap_global_test,
        },
        "fairness": fairness_result,
        "thresholds": thresholds,
    }
