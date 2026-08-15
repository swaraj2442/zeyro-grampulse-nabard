import pandas as pd
import requests
import json
import math

df = pd.read_csv("data/nabard_enterprise_monthly.csv")
# Replace NaNs with None so it serializes to JSON nulls instead of NaN
df = df.where(pd.notnull(df), None)

ent_id = df['entity_id'].unique()[0]
df_ent = df[df['entity_id'] == ent_id].copy()

history = df_ent[df_ent['time_idx'] <= 23].to_dict(orient='records')
future = df_ent[(df_ent['time_idx'] > 23) & (df_ent['time_idx'] <= 29)].to_dict(orient='records')

payload = {
    "history": history,
    "scenarios": future
}

response = requests.post(f"http://127.0.0.1:8000/api/v1/enterprises/{ent_id}/forecast", json=payload)
print(json.dumps(response.json(), indent=2))
