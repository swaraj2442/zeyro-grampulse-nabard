import pandas as pd
import json, math

def safe_json(obj):
    if isinstance(obj, list): return [safe_json(v) for v in obj]
    if isinstance(obj, dict): return {k: safe_json(v) for k, v in obj.items()}
    if isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)): return None
    return obj

df = pd.read_csv("data/nabard_enterprise_monthly.csv")
df = df.where(pd.notnull(df), None)

ent_id = df['entity_id'].unique()[0]
df_ent = df[df['entity_id'] == ent_id].copy()

# Print columns to understand structure
print("Columns:", df.columns.tolist())
print("\ntime_idx range:", df_ent['time_idx'].min(), "to", df_ent['time_idx'].max())
print("History rows (<=23):", len(df_ent[df_ent['time_idx'] <= 23]))
print("Future rows (24-29):", len(df_ent[(df_ent['time_idx'] > 23) & (df_ent['time_idx'] <= 29)]))
