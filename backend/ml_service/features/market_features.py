import pandas as pd
from typing import Dict, Any, Optional

def apply_market_features(out: pd.DataFrame, live_context: Optional[Dict[str, Any]]) -> pd.DataFrame:
    # Basic market feature engineering
    if "input_commodity_price" in out.columns and "output_commodity_price" in out.columns:
        out["input_output_price_ratio"] = out["input_commodity_price"] / out["output_commodity_price"].clip(lower=1e-3)
        
    feature_blocks = {}
    sources = ["local_demand_index", "input_cost_index", "commodity_price_change1m", "commodity_price_change3m", "commodity_price_volatility3m"]
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
    
    # LIVE API OVERRIDE FOR INFERENCE
    if live_context and "market" in live_context:
        mkt = live_context["market"]
        # In a real pipeline, we would inject these into the target prediction row for Horizon 1.
        # This aligns the ML Service to respect live external conditions (AGMARKNET).
        if "price_change_1m" in mkt: out["commodity_price_change1m"] = mkt["price_change_1m"]
        if "price_change_3m" in mkt: out["commodity_price_change3m"] = mkt["price_change_3m"]
        if "volatility_3m" in mkt: out["commodity_price_volatility3m"] = mkt["volatility_3m"]
        
    return out
