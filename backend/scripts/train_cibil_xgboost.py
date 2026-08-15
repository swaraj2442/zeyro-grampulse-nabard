import os
import pandas as pd
import numpy as np
import xgboost as xgb
import optuna
from sklearn.calibration import CalibratedClassifierCV, FrozenEstimator, calibration_curve
from sklearn.metrics import roc_auc_score, brier_score_loss, log_loss
import shap
import json
import joblib
import mlflow
import mlflow.sklearn

def calculate_ks(y_true, y_prob):
    data = pd.DataFrame({'y': y_true, 'p': y_prob})
    data = data.sort_values(by='p', ascending=False).reset_index(drop=True)
    data['cum_bad'] = data['y'].cumsum() / data['y'].sum()
    data['cum_good'] = (1 - data['y']).cumsum() / (1 - data['y']).sum()
    return np.max(np.abs(data['cum_bad'] - data['cum_good']))

def calculate_psi(expected, actual, bins=10):
    # Determine bins from expected distribution
    breakpoints = np.percentile(expected, np.arange(0, 101, 100/bins))
    breakpoints[0] = -np.inf
    breakpoints[-1] = np.inf
    
    expected_percents = np.histogram(expected, breakpoints)[0] / len(expected)
    actual_percents = np.histogram(actual, breakpoints)[0] / len(actual)
    
    # Avoid div/0
    expected_percents = np.maximum(expected_percents, 0.0001)
    actual_percents = np.maximum(actual_percents, 0.0001)
    
    psi = (expected_percents - actual_percents) * np.log(expected_percents / actual_percents)
    return np.sum(psi)

def train_and_calibrate(data_dir, target_col):
    train_path = os.path.join(data_dir, "cibil_train.csv")
    val_path = os.path.join(data_dir, "cibil_val.csv")
    test_path = os.path.join(data_dir, "cibil_test.csv")
    
    print("Loading data splits...")
    df_train = pd.read_csv(train_path)
    df_val = pd.read_csv(val_path)
    df_test = pd.read_csv(test_path)
    
    df_train.replace(-99999, np.nan, inplace=True)
    df_val.replace(-99999, np.nan, inplace=True)
    df_test.replace(-99999, np.nan, inplace=True)
    
    cat_cols = df_train.select_dtypes(include=['object']).columns.tolist()
    for col in cat_cols:
        df_train[col] = df_train[col].astype('category')
        df_val[col] = df_val[col].astype('category')
        df_test[col] = df_test[col].astype('category')
        
    def map_target(y):
        return y.map({'P1': 0, 'P2': 0, 'P3': 1, 'P4': 1}).fillna(0).astype(int)
        
    drop_cols = [
        target_col, "PROSPECTID", "Credit_Score",
        "enq_L3m", "enq_L6m", "enq_L12m", "tot_enq", "time_since_recent_enq",
        "CC_enq", "CC_enq_L6m", "CC_enq_L12m", "PL_enq", "PL_enq_L6m", "PL_enq_L12m",
        "pct_PL_enq_L6m_of_ever", "pct_CC_enq_L6m_of_ever", "pct_PL_enq_L6m_of_L12m", "pct_CC_enq_L6m_of_L12m",
        "Age_Oldest_TL", "Age_Newest_TL",
        "time_since_recent_deliquency", "time_since_first_deliquency",
        "num_std_12mts", "num_std_6mts", "num_std", "num_times_delinquent", "max_delinquency_level",
        "recent_level_of_deliq", "max_recent_level_of_deliq",
        "CC_Flag", "PL_Flag", "HL_Flag", "GL_Flag"
    ]
    X_train = df_train.drop(columns=[c for c in drop_cols if c in df_train.columns])
    y_train = map_target(df_train[target_col])
    X_val = df_val.drop(columns=[c for c in drop_cols if c in df_val.columns])
    y_val = map_target(df_val[target_col])
    X_test = df_test.drop(columns=[c for c in drop_cols if c in df_test.columns])
    y_test = map_target(df_test[target_col])
    
    neg_pos_ratio = (y_train == 0).sum() / (y_train == 1).sum() if (y_train == 1).sum() > 0 else 1.0
    print(f"Features: {X_train.shape[1]}")
    
    # 1. Monotonic Constraints
    constraint_map = {
        'num_times_30p_dpd': 1,
        'max_deliq_12mts': 1,
        'pct_tl_open_L6M': -1,
        'pct_tl_open_L12M': -1,
        'pct_closed_tl': -1,
    }
    monotone_constraints = tuple(constraint_map.get(col, 0) for col in X_train.columns)

    # 3. Optuna Hyperparameter Search
    optuna.logging.set_verbosity(optuna.logging.WARNING)
    print("\nRunning Optuna hyperparameter search (20 trials)...")
    def objective(trial):
        params = {
            "n_estimators": 100,
            "max_depth": trial.suggest_int("max_depth", 3, 7),
            "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.3, log=True),
            "subsample": trial.suggest_float("subsample", 0.6, 1.0),
            "colsample_bytree": trial.suggest_float("colsample_bytree", 0.6, 1.0),
            "gamma": trial.suggest_float("gamma", 0, 5),
            "reg_lambda": trial.suggest_float("reg_lambda", 1, 10),
            "objective": "binary:logistic",
            "eval_metric": "logloss",
            "enable_categorical": True,
            "random_state": 42,
            "tree_method": "hist",
            "scale_pos_weight": neg_pos_ratio,
            "monotone_constraints": monotone_constraints
        }
        mod = xgb.XGBClassifier(**params)
        mod.fit(X_train, y_train)
        preds = mod.predict_proba(X_val)[:, 1]
        return roc_auc_score(y_val, preds)

    study = optuna.create_study(direction="maximize")
    study.optimize(objective, n_trials=20)
    print("Best Trial Params:", study.best_trial.params)

    best_params = study.best_trial.params
    best_params.update({
        "n_estimators": 100,
        "objective": "binary:logistic",
        "eval_metric": "logloss",
        "enable_categorical": True,
        "random_state": 42,
        "tree_method": "hist",
        "scale_pos_weight": neg_pos_ratio,
        "monotone_constraints": monotone_constraints
    })
    
    print("\nTraining final base XGBoost model with best params...")
    
    mlflow.log_params(best_params)
    
    model = xgb.XGBClassifier(**best_params)
    model.fit(X_train, y_train)
    
    print("Calibrating with Isotonic Regression on Validation set...")
    calibrated_clf = CalibratedClassifierCV(estimator=FrozenEstimator(model), method="isotonic")
    calibrated_clf.fit(X_val, y_val)
    
    print("\n--- Evaluation on Test Set ---")
    y_prob_test = calibrated_clf.predict_proba(X_test)[:, 1]
    
    auc = roc_auc_score(y_test, y_prob_test)
    brier = brier_score_loss(y_test, y_prob_test)
    ks = calculate_ks(y_test, y_prob_test)
    
    prob_true, prob_pred = calibration_curve(y_test, y_prob_test, n_bins=10)
    ece = np.mean(np.abs(prob_true - prob_pred))
    
    print(f"AUC:         {auc:.4f}")
    print(f"Brier Score: {brier:.4f}")
    print(f"KS Stat:     {ks:.4f}")
    print(f"ECE:         {ece:.4f}")
    
    mlflow.log_metrics({
        "auc": auc,
        "brier_score": brier,
        "ks_stat": ks,
        "ece": ece
    })
    
    # 4. Scorecard Mapping Layer
    print("\n--- Scorecard Mapping ---")
    eps = 1e-6
    y_prob_test_clipped = np.clip(y_prob_test, eps, 1 - eps)
    bfs_score = 600 - (72 * np.log(y_prob_test_clipped / (1 - y_prob_test_clipped)))
    bfs_score = np.clip(bfs_score, 300, 900)
    print(f"BFS Score Distribution - Mean: {np.mean(bfs_score):.1f}, Min: {np.min(bfs_score):.1f}, Max: {np.max(bfs_score):.1f}")
    
    print("\n--- Generating SHAP values ---")
    explainer = shap.TreeExplainer(model)
    shap_sample = X_train.sample(min(1000, len(X_train)), random_state=42)
    shap_values = explainer.shap_values(shap_sample)
    
    feature_importance = pd.DataFrame({
        'feature': X_train.columns,
        'importance': np.abs(shap_values).mean(axis=0)
    }).sort_values('importance', ascending=False)
    
    print("Top 5 important features (SHAP):")
    for _, row in feature_importance.head(5).iterrows():
        print(f"  {row['feature']}: {row['importance']:.4f}")
        
    # 2. PSI Feature Stability for top 5 features
    print("\n--- Feature Stability (PSI) ---")
    for _, row in feature_importance.head(5).iterrows():
        feature = row['feature']
        if X_train[feature].dtype.name != 'category':
            psi = calculate_psi(X_train[feature].dropna(), X_test[feature].dropna())
            status = "stable" if psi < 0.1 else ("watch" if psi < 0.25 else "drift")
            print(f"  {feature} PSI: {psi:.4f} ({status})")
        else:
            print(f"  {feature} PSI: N/A (categorical)")
        
    shap_csv_path = os.path.join(data_dir, "shap_importance.csv")
    feature_importance.to_csv(shap_csv_path, index=False)
    
    out_model = os.path.join(data_dir, "xgboost_cibil_calibrated.json")
    print(f"\nModel training complete! (Artifact to be saved: {out_model})")
    pkl_path = out_model.replace('.json', '.pkl')
    joblib.dump(calibrated_clf, pkl_path)
    print(f"Saved Calibrated model to: {pkl_path}")
    
    # Log artifacts to MLflow
    mlflow.log_artifact(shap_csv_path)
    mlflow.log_artifact(pkl_path)
    # Log the model specifically so it can be loaded later via models:/
    mlflow.sklearn.log_model(calibrated_clf, "model", registered_model_name="BFS_CIBIL")

if __name__ == "__main__":
    mlflow.set_experiment("BFS_CIBIL_Bureau")
    with mlflow.start_run(run_name="BFS_v0.5_CIBIL"):
        data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dummtdatasets", "cibil_ind"))
        target = "Approved_Flag"
        train_and_calibrate(data_dir, target)
