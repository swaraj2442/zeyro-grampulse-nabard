import pandas as pd
import json
import math
import urllib.request
import urllib.error

def safe_json(obj):
    """Recursively replace NaN/Inf with None for JSON compliance."""
    if isinstance(obj, list):
        return [safe_json(v) for v in obj]
    if isinstance(obj, dict):
        return {k: safe_json(v) for k, v in obj.items()}
    if isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
        return None
    return obj

df = pd.read_csv("data/nabard_enterprise_monthly.csv")
df = df.where(pd.notnull(df), None)

# Pick a few different enterprises
enterprises = df['entity_id'].unique()[:3]
results = {}

for ent_id in enterprises:
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
            results[ent_id] = {"forecast": json.loads(resp.read().decode())}
    except Exception as e:
        results[ent_id] = {"forecast_error": str(e)}
    
    # Early warning GET endpoint
    ew_req = urllib.request.Request(
        f"http://127.0.0.1:8000/api/v1/enterprises/{ent_id}/early-warning",
        method="GET"
    )
    try:
        with urllib.request.urlopen(ew_req, timeout=10) as resp:
            results[ent_id]["early_warning"] = json.loads(resp.read().decode())
    except Exception as e:
        results[ent_id]["early_warning_error"] = str(e)

with open("scratch_api_results.json", "w") as f:
    json.dump(results, f, indent=2)

print("Done. Results saved to scratch_api_results.json")
for ent_id, data in results.items():
    print(f"\n=== {ent_id} ===")
    if "forecast_error" in data:
        print(f"  FORECAST ERROR: {data['forecast_error']}")
    else:
        fc = data.get("forecast", {})
        print(f"  Model version: {fc.get('model_version')}")
        print(f"  Forecast months: {len(fc.get('forecast', []))}")
        ew = fc.get("early_warning", {})
        print(f"  Risk score: {ew.get('risk_score')}")
        print(f"  Risk level: {ew.get('risk_level')}")
        print(f"  Risk confidence index: {ew.get('risk_confidence_index')}")
        print(f"  Forecast deficit: {ew.get('forecast_deficit')}")
        print(f"  Debt service shortfall: {ew.get('debt_service_shortfall')}")
        print(f"  Stress month: {ew.get('stress_month')}")
        print(f"  Warning lead time: {ew.get('warning_lead_time_days')} days")
        print(f"  Drivers: {len(ew.get('drivers', []))}")
        for driver in ew.get("drivers", [])[:3]:
            print(f"    - {driver.get('feature')}: {driver.get('observed_value')} ({driver.get('explanation', '')[:60]})")
        print(f"  Recommended intervention: {list(ew.get('recommended_intervention', {}).keys())}")
