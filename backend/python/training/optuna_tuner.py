"""Automated Bayesian Hyperparameter Tuning using Optuna.

Industry best practice for tree models is to automate the search for optimal
hyperparameters using Bayesian Optimization. Optuna intelligently navigates
the parameter space, learning from previous trials to find the best setup
in a fraction of the time a Grid Search would take.

Data Splitting Strategy (3-Stage Nested):
  Stage 1 — Outer Hold-Out (15%):  Locked away. Never seen by Optuna or any
                                    training during the search phase.
  Stage 2 — Optuna K-Fold CV (on remaining 85%): Each trial scores itself as
                                    the MEAN AUC across K stratified folds.
                                    This eliminates validation-set overfitting.
                                    Bad trials are pruned early via MedianPruner.
  Stage 3 — Final Training: Retrain on the full 85% dev set with best params.

Crash Safety:
  Study state is persisted to a SQLite database under artifact_dir. If the
  notebook crashes mid-search, re-running with the same run_name automatically
  resumes from the last completed trial.

Usage:
    from training.optuna_tuner import tune_bfs

    best_params = tune_bfs(df_clean, n_trials=50, run_name="bfs_optuna_v1")

    # Then train final model with these params:
    run_bfs(df_clean, run_name="bfs_final", xgb_params=best_params)
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

import numpy as np
import optuna
import pandas as pd
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import StratifiedKFold, train_test_split
from xgboost import XGBClassifier

try:
    from optuna.integration import XGBoostPruningCallback
    _PRUNING_AVAILABLE = True
except ImportError:
    _PRUNING_AVAILABLE = False

logger = logging.getLogger(__name__)

ARTIFACT_ROOT = Path(__file__).parent.parent.parent / "artifacts"


def _suggest_xgb_params(trial: optuna.Trial) -> dict[str, Any]:
    """Suggest a strong, industry-standard XGBoost search space."""
    return {
        "n_estimators": trial.suggest_int("n_estimators", 200, 1000, step=100),
        "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.1, log=True),
        "max_depth": trial.suggest_int("max_depth", 3, 8),
        "min_child_weight": trial.suggest_int("min_child_weight", 1, 20),
        "subsample": trial.suggest_float("subsample", 0.5, 1.0),
        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 1.0),
        "reg_alpha": trial.suggest_float("reg_alpha", 1e-3, 10.0, log=True),
        "reg_lambda": trial.suggest_float("reg_lambda", 1e-3, 10.0, log=True),
        "random_state": 42,
        "n_jobs": -1,
        "objective": "binary:logistic",
        "eval_metric": "auc",
    }


def _run_optimization(
    df: pd.DataFrame,
    target_col: str,
    feature_cols: list[str],
    n_trials: int,
    run_name: str,
    n_folds: int = 5,
    test_size: float = 0.15,
    early_stopping_rounds: int = 15,
    artifact_dir: Path | None = None,
    data_source: str = "proxy_homecredit",
) -> dict:
    """
    Core optimization loop using K-Fold CV on development set.

    Strategy:
      1. Lock away `test_size` fraction as an outer hold-out — Optuna NEVER sees this.
      2. For each trial, score using K-Fold CV on the remaining development set.
         Bad trials are pruned early via MedianPruner (saves ~30-50% compute).
      3. Score = mean AUC across all K folds.
      4. Study is persisted to SQLite — safe to interrupt and resume.
    """
    optuna.logging.set_verbosity(optuna.logging.WARNING)

    # -----------------------------------------------------------------------
    # Resolve output directory and SQLite storage path
    # -----------------------------------------------------------------------
    out_dir = (artifact_dir or ARTIFACT_ROOT / run_name.split("_")[0]) / run_name
    out_dir.mkdir(parents=True, exist_ok=True)
    storage_path = f"sqlite:///{out_dir / 'optuna_study.db'}"

    # -----------------------------------------------------------------------
    # Stage 1: Lock away the outer hold-out test set
    # This data is NEVER passed to Optuna or any trial.
    # -----------------------------------------------------------------------
    from .features import prepare_features  # noqa: PLC0415 — intentional lazy import

    X_all = prepare_features(df, feature_cols)
    y_all = np.asarray(df[target_col], dtype=np.int32)

    X_dev, X_test_outer, y_dev, y_test_outer = train_test_split(
        X_all, y_all, test_size=test_size, stratify=y_all, random_state=42
    )
    logger.info(
        "[OPTUNA] Outer hold-out locked: %d rows. Dev set for CV: %d rows.",
        len(X_test_outer), len(X_dev),
    )

    # -----------------------------------------------------------------------
    # Stage 2: Optuna K-Fold CV on the development set only
    # -----------------------------------------------------------------------
    skf = StratifiedKFold(n_splits=n_folds, shuffle=True, random_state=42)

    def objective(trial: optuna.Trial) -> float:
        params = _suggest_xgb_params(trial)
        fold_aucs: list[float] = []

        for fold_idx, (train_idx, val_idx) in enumerate(skf.split(X_dev, y_dev)):
            X_tr, X_val = X_dev.iloc[train_idx], X_dev.iloc[val_idx]
            y_tr, y_val = y_dev[train_idx], y_dev[val_idx]

            callbacks = []
            if _PRUNING_AVAILABLE:
                # Prune unpromising trials after each boosting round on fold 0.
                # Using fold 0 as the pruning signal avoids redundant callback state.
                if fold_idx == 0:
                    callbacks.append(
                        XGBoostPruningCallback(trial, "validation_0-auc")
                    )
            
            from .callbacks import TqdmCallback
            callbacks.append(
                TqdmCallback(
                    total_epochs=params["n_estimators"],
                    desc=f"Trial {trial.number} Fold {fold_idx}",
                    leave=False,  # Clear the bar when the fold is done to prevent clutter
                )
            )

            model = XGBClassifier(
                early_stopping_rounds=early_stopping_rounds,
                callbacks=callbacks or None,
                **params,
            )
            model.fit(
                X_tr, y_tr,
                eval_set=[(X_val, y_val)],
                verbose=False,
            )

            y_prob_val = model.predict_proba(X_val)[:, 1]
            fold_auc = float(roc_auc_score(y_val, y_prob_val))
            fold_aucs.append(fold_auc)
            logger.debug("  [Trial %d] Fold %d AUC: %.4f", trial.number, fold_idx, fold_auc)

            # Report intermediate value so pruner can act between folds
            trial.report(float(np.mean(fold_aucs)), step=fold_idx)
            if trial.should_prune():
                raise optuna.TrialPruned()

        mean_auc = float(np.mean(fold_aucs))
        std_auc = float(np.std(fold_aucs))
        
        msg = (
            f"Trial {trial.number:03d} | Mean CV AUC: {mean_auc:.4f} ± {std_auc:.4f} "
            f"| Folds: {[round(a, 4) for a in fold_aucs]}"
        )
        logger.info(msg)
        
        try:
            from tqdm.auto import tqdm  # type: ignore
            tqdm.write(msg)
        except ImportError:
            print(msg)

        return mean_auc

    # -----------------------------------------------------------------------
    # Create (or resume) persistent study
    # -----------------------------------------------------------------------
    import mlflow
    from optuna.integration.mlflow import MLflowCallback
    from .zeyro_mlflow import TRACKING_URI, get_git_sha
    
    mlflow.set_tracking_uri(TRACKING_URI)
    
    mlflow_cb = MLflowCallback(
        tracking_uri=TRACKING_URI,
        metric_name="cv_mean_auc",
        create_experiment=True,
        mlflow_kwargs={
            "nested": True,
            "tags": {
                "data_source": data_source,
                "git_sha": get_git_sha(),
                "model_target": "OPTUNA_TUNING"
            }
        },
    )

    pruner = (
        optuna.pruners.MedianPruner() if _PRUNING_AVAILABLE
        else optuna.pruners.NopPruner()
    )

    study = optuna.create_study(
        direction="maximize",
        study_name=f"{run_name}_tuning",
        storage=storage_path,
        load_if_exists=True,  # resume safely if interrupted
        pruner=pruner,
    )

    completed_before = len([t for t in study.trials if t.state == optuna.trial.TrialState.COMPLETE])
    remaining = max(0, n_trials - completed_before)

    if remaining == 0:
        logger.info("[OPTUNA] Study '%s' already has %d completed trials. Skipping search.", run_name, completed_before)
    else:
        if completed_before > 0:
            logger.info("[OPTUNA] Resuming study '%s' — %d trials done, %d remaining.", run_name, completed_before, remaining)
        logger.info(
            "[OPTUNA] Starting %d-Fold CV search | %d trials | study: %s",
            n_folds, remaining, run_name,
        )
        study.optimize(objective, n_trials=remaining, show_progress_bar=True, callbacks=[mlflow_cb])

    logger.info("[OPTUNA] Optimization complete.")
    logger.info("[OPTUNA] Best trial #%d — Mean CV AUC: %.4f", study.best_trial.number, study.best_value)

    # -----------------------------------------------------------------------
    # Reconstruct full best params (tuned + fixed non-tunable defaults)
    # -----------------------------------------------------------------------
    best_params: dict[str, Any] = {
        **study.best_params,
        "objective": "binary:logistic",
        "eval_metric": "auc",
        "random_state": 42,
        "n_jobs": -1,
    }
    logger.info("[OPTUNA] Best parameters: %s", best_params)

    # -----------------------------------------------------------------------
    # Persist summary artefact alongside the SQLite study DB
    # -----------------------------------------------------------------------
    completed_trials = [t for t in study.trials if t.state == optuna.trial.TrialState.COMPLETE]
    pruned_trials = [t for t in study.trials if t.state == optuna.trial.TrialState.PRUNED]

    summary: dict[str, Any] = {
        "run_name": run_name,
        "best_params": best_params,
        "best_mean_cv_auc": round(study.best_value, 6),
        "best_trial_number": study.best_trial.number,
        "n_folds": n_folds,
        "n_trials_requested": n_trials,
        "n_trials_completed": len(completed_trials),
        "n_trials_pruned": len(pruned_trials),
        "dev_set_rows": len(X_dev),
        "outer_holdout_rows": len(X_test_outer),
        "storage": storage_path,
    }
    (out_dir / "best_params.json").write_text(json.dumps(summary, indent=2))
    logger.info("[OPTUNA] Summary saved to: %s", out_dir / "best_params.json")

    return best_params


def tune_bfs(
    df: pd.DataFrame,
    n_trials: int = 50,
    run_name: str = "bfs_optuna",
    feature_cols: list[str] | None = None,
    n_folds: int = 5,
    artifact_dir: Path | None = None,
    data_source: str = "proxy_homecredit",
) -> dict:
    """
    Tune BFS model using nested K-Fold CV. Maximises mean validation AUC.

    Args:
        df:           Clean input DataFrame.
        n_trials:     Number of Optuna trials. Pruned trials don't count.
        run_name:     Identifier for the study. Reusing a name resumes the study.
        feature_cols: Override default BFS feature set.
        n_folds:      Number of CV folds (default 5).
        artifact_dir: Root directory for artefacts. Defaults to artifacts/bfs/.

    Returns:
        dict: Best hyperparameters ready to pass as `xgb_params` to train_bfs.run().
    """
    from .features import BFS_FEATURES, BFS_TARGET

    cols = feature_cols if feature_cols is not None else BFS_FEATURES
    base_dir = artifact_dir or (ARTIFACT_ROOT / "bfs")
    return _run_optimization(
        df=df,
        target_col=BFS_TARGET,
        feature_cols=cols,
        n_trials=n_trials,
        run_name=run_name,
        n_folds=n_folds,
        artifact_dir=base_dir,
        data_source=data_source,
    )


def tune_rps(
    df: pd.DataFrame,
    n_trials: int = 50,
    run_name: str = "rps_optuna",
    feature_cols: list[str] | None = None,
    n_folds: int = 5,
    artifact_dir: Path | None = None,
    data_source: str = "proxy_homecredit",
) -> dict:
    """
    Tune RPS model using nested K-Fold CV. Maximises mean validation AUC.

    Args:
        df:           Clean input DataFrame.
        n_trials:     Number of Optuna trials. Pruned trials don't count.
        run_name:     Identifier for the study. Reusing a name resumes the study.
        feature_cols: Override default RPS feature set.
        n_folds:      Number of CV folds (default 5).
        artifact_dir: Root directory for artefacts. Defaults to artifacts/rps/.

    Returns:
        dict: Best hyperparameters ready to pass as `xgb_params` to train_rps.run().
    """
    from .features import RPS_FEATURES, RPS_TARGET

    cols = feature_cols if feature_cols is not None else RPS_FEATURES
    base_dir = artifact_dir or (ARTIFACT_ROOT / "rps")
    return _run_optimization(
        df=df,
        target_col=RPS_TARGET,
        feature_cols=cols,
        n_trials=n_trials,
        run_name=run_name,
        n_folds=n_folds,
        artifact_dir=base_dir,
        data_source=data_source,
    )


def tune_credit(
    df: pd.DataFrame,
    feature_cols: list[str],
    n_trials: int = 50,
    run_name: str = "credit_optuna",
    n_folds: int = 5,
    artifact_dir: Path | None = None,
    data_source: str = "proxy_homecredit",
) -> dict:
    """
    Tune Credit Default model using nested K-Fold CV. Maximises mean validation AUC.

    Args:
        df:           Clean input DataFrame.
        feature_cols: Feature columns to use (required — no default set for credit).
        n_trials:     Number of Optuna trials. Pruned trials don't count.
        run_name:     Identifier for the study. Reusing a name resumes the study.
        n_folds:      Number of CV folds (default 5).
        artifact_dir: Root directory for artefacts. Defaults to artifacts/credit/.

    Returns:
        dict: Best hyperparameters ready to pass as `xgb_params` to the credit trainer.
    """
    from .features import CREDIT_DEFAULT_TARGET

    base_dir = artifact_dir or (ARTIFACT_ROOT / "credit")
    return _run_optimization(
        df=df,
        target_col=CREDIT_DEFAULT_TARGET,
        feature_cols=feature_cols,
        n_trials=n_trials,
        run_name=run_name,
        n_folds=n_folds,
        artifact_dir=base_dir,
        data_source=data_source,
    )


def load_best_params(run_name: str, model_type: str = "credit") -> dict[str, Any]:
    """
    Helper function to load the best tuned hyperparameters from a previous Optuna run.
    
    Args:
        run_name: The name of the study (e.g., "credit_optuna_v1").
        model_type: The subfolder in artifacts (e.g., "credit", "bfs", "rps").
        
    Returns:
        dict: The best parameters, ready to be passed as `xgb_params`.
    """
    path = ARTIFACT_ROOT / model_type / run_name / "best_params.json"
    
    if not path.exists():
        raise FileNotFoundError(f"No tuned parameters found at: {path}")
        
    return json.loads(path.read_text())["best_params"]
