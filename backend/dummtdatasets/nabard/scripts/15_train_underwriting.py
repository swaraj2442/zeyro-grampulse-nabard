import json
import os
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from catboost import CatBoostClassifier

# Paths
BASE_DIR = Path(__file__).parent.parent.parent.parent
DATA_DIR = BASE_DIR / "dummtdatasets" / "nabard"
PROCESSED_DIR = DATA_DIR / "processed"
MODEL_DIR = BASE_DIR / "models"
CATBOOST_DIR = MODEL_DIR / "catboost"
CATBOOST_DIR.mkdir(parents=True, exist_ok=True)

def build_underwriting_dataset():
    """
    Constructs the underwriting training set from the simulated panel.
    We target `closing_cash_balance_t6 < 0` (Cash Flow Failure).
    """
    df = pd.read_parquet(PROCESSED_DIR / "numerical_panel_split.parquet")
    df = df.sort_values(["enterprise_id", "month"]).reset_index(drop=True)
    
    # 1. Target Definition (Stress at t+6)
    df["target_t6"] = df.groupby("enterprise_id")["closing_cash_balance"].shift(-6)
    df = df.dropna(subset=["target_t6"]).copy()
    
    df["is_stressed"] = (df["target_t6"] < 0).astype(int)
    
    # 2. Build feature vector matching Underwriting API Request
    # Approximate fields that exist in the API Request
    
    # requested_amount ~ typical loan size in simulation
    df["requested_amount"] = df["loan_outstanding"].clip(lower=10000)
    df["requested_tenure_months"] = 12
    df["current_dpd"] = df["days_past_due"]
    
    # simulate repayment_delay_count_6m
    df["repayment_delay_count_6m"] = (df["days_past_due"] > 0).astype(int)
    
    df["loan_outstanding"] = df["loan_outstanding"]
    df["sanctioned_limit"] = df["loan_outstanding"] * 1.5
    df["credit_utilisation"] = df["loan_outstanding"] / df["sanctioned_limit"].clip(lower=1)
    
    # annual turnover = inflow * 12
    df["annual_turnover"] = df["operating_inflow"] * 12
    df["business_vintage"] = 5
    
    df["scheduled_emi"] = df["scheduled_emi"]
    
    # min_projected_dscr ~ proxy using current DSCR
    df["min_projected_dscr"] = df["operating_inflow"] / df["scheduled_emi"].clip(lower=1)
    df["forecast_deficit"] = np.where(df["closing_cash_balance"] < 0, abs(df["closing_cash_balance"]), 0)
    
    df["max_affordable_emi"] = (df["operating_inflow"] - df["operating_outflow"]) * 0.4
    df["requested_emi"] = df["requested_amount"] / 12
    
    df["upi_inflow_growth_1m"] = df.groupby("enterprise_id")["upi_inflow_value"].pct_change().fillna(0)
    df["upi_active_days_avg"] = 15
    
    df["market_risk_score"] = 50.0
    df["climate_risk_score"] = 50.0
    
    features = [
        "requested_amount", "requested_tenure_months", "current_dpd", "repayment_delay_count_6m",
        "loan_outstanding", "credit_utilisation", "annual_turnover", "business_vintage",
        "scheduled_emi", "min_projected_dscr", "forecast_deficit", "max_affordable_emi",
        "requested_emi", "upi_inflow_growth_1m", "upi_active_days_avg", "market_risk_score",
        "climate_risk_score"
    ]
    
    return df, features

def main():
    print("Building underwriting dataset...")
    df, features = build_underwriting_dataset()
    
    # Train on the train split to prevent leakage
    train_df = df[df["is_train"] == True]
    
    X_train = train_df[features]
    y_train = train_df["is_stressed"]
    
    print(f"Training CatBoost Classifier on {len(X_train)} records...")
    model = CatBoostClassifier(
        iterations=200,
        learning_rate=0.05,
        depth=6,
        loss_function='Logloss',
        verbose=50,
        random_seed=42
    )
    
    model.fit(X_train, y_train)
    
    out_path = CATBOOST_DIR / "underwriting_repayment_failure.cbm"
    model.save_model(str(out_path))
    print(f"✅ Underwriting model saved to {out_path}")

if __name__ == "__main__":
    main()
