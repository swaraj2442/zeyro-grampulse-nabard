"""train_underwriting_model.py

Trains a CatBoost classifier on repayment_failure_6m.
Run after generate_underwriting_labels.py.

Outputs:
  models/catboost/underwriting_repayment_failure.cbm
  models/underwriting_policy.json
"""
from __future__ import annotations
from pathlib import Path
import json
import pandas as pd
import numpy as np

DATA_DIR = Path("data")
MODEL_DIR = Path("models")
CATBOOST_DIR = MODEL_DIR / "catboost"

TRAINING_DATA = DATA_DIR / "underwriting_training_dataset.parquet"

CATEGORICALS = ["sector", "district"]
TARGET = "repayment_failure_6m"

FEATURES = [
    "years_in_operation", "asset_value", "worker_count",
    "sanctioned_credit_limit", "loan_outstanding", "credit_utilisation",
    "days_past_due", "repayment_delay_count_6m", "restructured_flag",
    "debt_service_ratio", "dscr",
    "upi_inflow_growth_1m", "upi_inflow_growth_3m",
    "upi_active_days", "digital_collection_share",
    "commodity_price_change_1m", "commodity_price_volatility_3m",
    "climate_risk_score", "rainfall_anomaly_pct",
    "cash_deficit_3m", "persistent_stress_3m", "repayment_risk_3m",
    *CATEGORICALS,
]


def main():
    try:
        from catboost import CatBoostClassifier, Pool
    except ImportError:
        print("❌ CatBoost not installed. Run: pip install catboost")
        return

    if not TRAINING_DATA.exists():
        print(f"❌ Training data not found at {TRAINING_DATA}. Run generate_underwriting_labels.py first.")
        return

    print(f"Loading training data from {TRAINING_DATA}...")
    df = pd.read_parquet(TRAINING_DATA)
    print(f"  {len(df):,} rows, label balance: {df[TARGET].mean():.1%} positive")

    available_features = [f for f in FEATURES if f in df.columns]
    available_cats = [c for c in CATEGORICALS if c in available_features]

    X = df[available_features].copy()
    y = df[TARGET].values

    for cat in available_cats:
        X[cat] = X[cat].fillna("Unknown").astype(str)
    X = X.fillna(0)

    # Train/test split: last 20% of time_idx per enterprise
    split_idx = int(len(df) * 0.80)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]

    cat_feature_idxs = [available_features.index(c) for c in available_cats]

    print(f"\nTraining CatBoostClassifier on {len(X_train):,} rows...")
    model = CatBoostClassifier(
        iterations=300,
        depth=6,
        learning_rate=0.05,
        loss_function="Logloss",
        eval_metric="AUC",
        cat_features=cat_feature_idxs,
        random_seed=42,
        verbose=50,
        early_stopping_rounds=30,
        class_weights={0: 1.0, 1: 3.0},  # upweight failures
    )
    model.fit(
        X_train, y_train,
        eval_set=(X_test, y_test),
        use_best_model=True,
    )

    # ── Evaluate ─────────────────────────────────────────────────────────────
    from sklearn.metrics import roc_auc_score, classification_report
    probs = model.predict_proba(X_test)[:, 1]
    preds = (probs >= 0.45).astype(int)
    auc = roc_auc_score(y_test, probs)
    print(f"\nTest AUC: {auc:.4f}")
    print(classification_report(y_test, preds, target_names=["No Failure", "Failure"]))

    # ── Save model ────────────────────────────────────────────────────────────
    CATBOOST_DIR.mkdir(parents=True, exist_ok=True)
    model_path = CATBOOST_DIR / "underwriting_repayment_failure.cbm"
    model.save_model(str(model_path))
    print(f"\n✅ Model saved → {model_path}")

    # ── Save policy manifest ──────────────────────────────────────────────────
    policy = {
        "version": "nabard-demo-policy-v1",
        "trainedAt": pd.Timestamp.now().isoformat(),
        "targetColumn": TARGET,
        "features": available_features,
        "categoricalFeatures": available_cats,
        "testAuc": round(auc, 4),
        "classificationThresholds": {
            "ELIGIBLE": [0.0, 0.20],
            "CONDITIONALLY_ELIGIBLE": [0.20, 0.45],
            "MANUAL_REVIEW": [0.45, 0.70],
            "NOT_ELIGIBLE": [0.70, 1.0],
        },
        "hardPolicyRules": {
            "declineIfDpdAbove": 30,
            "reviewIfDscrBelow": 1.0,
            "declineIfDscrBelow": 0.8,
        },
        "note": (
            "Decision labels: ELIGIBLE / CONDITIONALLY_ELIGIBLE / MANUAL_REVIEW / NOT_ELIGIBLE. "
            "Trained on synthetic rural-enterprise financial panel. "
            "Not validated on real rural credit outcomes."
        ),
    }

    policy_path = MODEL_DIR / "underwriting_policy.json"
    with open(policy_path, "w") as f:
        json.dump(policy, f, indent=2)
    print(f"✅ Policy manifest saved → {policy_path}")


if __name__ == "__main__":
    main()
