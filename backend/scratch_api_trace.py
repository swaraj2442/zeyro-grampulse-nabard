import sys
sys.path.insert(0, "/Users/swaraj/Documents/z-b2b")

import pandas as pd
import json, math
from dummtdatasets.cashflow.nabard_cashflow_utils import (
    RuralEnterprisePreprocessor, engineer_model_features
)
from catboost import CatBoostRegressor
import pickle

def safe_val(obj):
    if isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)): return None
    return obj

df = pd.read_csv("data/nabard_enterprise_monthly.csv")
df = df.where(pd.notnull(df), None)

ent_id = df['entity_id'].unique()[0]
df_ent = df[df['entity_id'] == ent_id].copy()

enterprise_history = df_ent[df_ent['time_idx'] <= 23].copy()
future_scenarios = df_ent[(df_ent['time_idx'] > 23) & (df_ent['time_idx'] <= 29)].copy()

print("History shape:", enterprise_history.shape)
print("Future shape:", future_scenarios.shape)

with open("models/preprocessor.pkl", "rb") as f:
    preprocessor = pickle.load(f)

df_combined = pd.concat([enterprise_history, future_scenarios], ignore_index=True)
print("Combined shape:", df_combined.shape)

df_transformed = preprocessor.transform(df_combined)
print("After transform:", df_transformed.shape)

df_features = engineer_model_features(df_transformed)
print("After feature engineering:", df_features.shape)

forecast_origin_idx = len(enterprise_history) - 1
base_features = df_features.iloc[forecast_origin_idx:forecast_origin_idx+1].copy()

manifest = json.load(open("models/model_manifest.json"))

for i, horizon in enumerate(manifest["horizons"]):
    features = base_features.copy()
    frow = future_scenarios.iloc[i]
    features["future_month"] = frow["month"]
    features["future_is_festival_month"] = frow["is_festival_month"]
    features["future_scheduled_emi"] = frow["scheduled_emi"]
    features["future_scheduled_loan_repayment"] = frow["scheduled_loan_repayment"]
    features["future_forecast_rainfall_anomaly_pct"] = frow["forecast_rainfall_anomaly_pct"]
    features["future_forecast_temperature_mean"] = frow["forecast_temperature_mean"]
    features["future_commodity_price_scenario"] = frow["commodity_price_scenario"]
    features["future_input_cost_scenario"] = frow["input_cost_scenario"]
    features["future_quarter"] = frow["quarter"]

    model = CatBoostRegressor()
    model.load_model(f"models/catboost/operating_inflow_h{horizon}.cbm")
    feat_cols = model.feature_names_
    for col in feat_cols:
        if col not in features.columns:
            features[col] = 0
    X = features[feat_cols]
    pred = model.predict(X)[0]
    print(f"  h{horizon} operating_inflow pred: {pred:,.0f}")

print("\n✅ Local trace succeeded!")
