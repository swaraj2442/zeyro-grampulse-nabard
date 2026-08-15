import sys
sys.path.insert(0, "/Users/swaraj/Documents/z-b2b")

import pandas as pd
import json, math
import importlib
import dummtdatasets.cashflow.nabard_cashflow_utils as u
importlib.reload(u)

def safe_json(obj):
    if isinstance(obj, list): return [safe_json(v) for v in obj]
    if isinstance(obj, dict): return {k: safe_json(v) for k, v in obj.items()}
    if isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)): return None
    return obj

df = pd.read_csv("data/nabard_enterprise_monthly.csv")
df = df.where(pd.notnull(df), None)

ent_id = df['entity_id'].unique()[0]
df_ent = df[df['entity_id'] == ent_id].copy()
enterprise_history = df_ent[df_ent['time_idx'] <= 23].copy()
future_scenarios = df_ent[(df_ent['time_idx'] > 23) & (df_ent['time_idx'] <= 29)].copy()

# Simulate API serialization/deserialization 
payload = safe_json({"history": enterprise_history.to_dict(orient='records'), "scenarios": future_scenarios.to_dict(orient='records')})

# Now rebuild as the API does
history_df = pd.DataFrame(payload["history"])
scenarios_df = pd.DataFrame(payload["scenarios"])

print("history_df columns present 'time_idx':", "time_idx" in history_df.columns)

import pickle
with open("models/preprocessor.pkl", "rb") as f:
    preprocessor = pickle.load(f)

df_combined = pd.concat([history_df, scenarios_df], ignore_index=True)
print("Combined shape:", df_combined.shape)
print("time_idx in combined:", "time_idx" in df_combined.columns)

df_transformed = preprocessor.transform(df_combined)
print("transform succeeded:", df_transformed.shape)
