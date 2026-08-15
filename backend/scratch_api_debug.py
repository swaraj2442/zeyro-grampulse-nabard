import pandas as pd
import json
import math
import urllib.request

def safe_json(obj):
    if isinstance(obj, list):
        return [safe_json(v) for v in obj]
    if isinstance(obj, dict):
        return {k: safe_json(v) for k, v in obj.items()}
    if isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
        return None
    return obj

df = pd.read_csv("data/nabard_enterprise_monthly.csv")
df = df.where(pd.notnull(df), None)

ent_id = df['entity_id'].unique()[0]
df_ent = df[df['entity_id'] == ent_id].copy()
history = df_ent[df_ent['time_idx'] <= 23].to_dict(orient='records')
future = df_ent[(df_ent['time_idx'] > 23) & (df_ent['time_idx'] <= 29)].to_dict(orient='records')

payload = safe_json({"history": history, "scenarios": future})
body = json.dumps(payload).encode()

req = urllib.request.Request(
    f"http://127.0.0.1:8000/api/v1/enterprises/{ent_id}/forecast",
    data=body,
    headers={"Content-Type": "application/json"},
    method="POST"
)
try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        print(resp.read().decode())
except urllib.error.HTTPError as e:
    print("ERROR BODY:", e.read().decode())
