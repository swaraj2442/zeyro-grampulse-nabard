import pandas as pd
from typing import Dict, Any, Optional

def apply_climate_features(out: pd.DataFrame, live_context: Optional[Dict[str, Any]]) -> pd.DataFrame:
    feature_blocks = {}
    sources = ["rainfall_anomaly_pct"]
    for col in sources:
        if col not in out.columns: continue
        grouped = out.groupby("entity_id", sort=False)[col]
        for lag in (1, 3, 6): feature_blocks[f"{col}_lag{lag}"] = grouped.shift(lag)
        shifted = grouped.shift(1)
        grouped_shifted = shifted.groupby(out["entity_id"], sort=False)
        for window in (3, 6):
            feature_blocks[f"{col}_roll{window}"] = grouped_shifted.transform(lambda values, w=window: values.rolling(w, min_periods=1).mean())
            
    feature_frame = pd.DataFrame(feature_blocks, index=out.index)
    out = pd.concat([out, feature_frame], axis=1)
    
    # LIVE API OVERRIDE FOR INFERENCE (HORIZON SPLITTING)
    if live_context and "climate" in live_context:
        cli = live_context["climate"]
        # Override Horizon 1 (Current Month Prediction) with Live 16-Day Forecast Data
        # For Horizon 2+, this would remain synthetic climatology or explicit scenario overrides
        if "rainfall_anomaly_pct" in cli:
            # We apply the live anomaly to the current inference row
            out["rainfall_anomaly_pct"] = cli["rainfall_anomaly_pct"]
        if "extreme_heat_days" in cli:
            out["extreme_heat_days"] = cli["extreme_heat_days"]
            
    return out
