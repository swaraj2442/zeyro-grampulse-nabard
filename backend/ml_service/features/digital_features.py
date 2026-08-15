import pandas as pd

def apply_digital_features(out: pd.DataFrame) -> pd.DataFrame:
    if "upi_inflow_value" in out.columns and "operating_inflow" in out.columns:
        out["upi_to_inflow_ratio"] = out["upi_inflow_value"] / out["operating_inflow"].clip(lower=1.0)
        
    feature_blocks = {}
    sources = ["upi_inflow_value", "digital_adoption_rate"]
    for col in sources:
        if col not in out.columns: continue
        grouped = out.groupby("entity_id", sort=False)[col]
        for lag in (1, 3, 6): feature_blocks[f"{col}_lag{lag}"] = grouped.shift(lag)
        shifted = grouped.shift(1)
        grouped_shifted = shifted.groupby(out["entity_id"], sort=False)
        for window in (3, 6):
            feature_blocks[f"{col}_roll{window}"] = grouped_shifted.transform(lambda values, w=window: values.rolling(w, min_periods=1).mean())
            
    feature_frame = pd.DataFrame(feature_blocks, index=out.index)
    return pd.concat([out, feature_frame], axis=1)
