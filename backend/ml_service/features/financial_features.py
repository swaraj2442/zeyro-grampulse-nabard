import pandas as pd
import numpy as np

def apply_financial_features(out: pd.DataFrame) -> pd.DataFrame:
    if "operating_inflow" not in out.columns or "operating_outflow" not in out.columns:
        return out
        
    out["net_operating_cashflow"] = out["operating_inflow"] - out["operating_outflow"]
    
    feature_blocks = {}
    rich_sources = ["operating_inflow", "operating_outflow", "closing_cash_balance", "net_operating_cashflow"]
    
    for col in rich_sources:
        if col not in out.columns: continue
        grouped = out.groupby("entity_id", sort=False)[col]
        for lag in (1, 2, 3, 6, 12):
            feature_blocks[f"{col}_lag{lag}"] = grouped.shift(lag)
        shifted = grouped.shift(1)
        for window in (3, 6, 12):
            grouped_shifted = shifted.groupby(out["entity_id"], sort=False)
            feature_blocks[f"{col}_roll{window}"] = grouped_shifted.transform(
                lambda values, w=window: values.rolling(w, min_periods=1).mean()
            )
        for window in (6, 12):
            grouped_shifted = shifted.groupby(out["entity_id"], sort=False)
            feature_blocks[f"{col}_std{window}"] = grouped_shifted.transform(
                lambda values, w=window: values.rolling(w, min_periods=2).std()
            )
            
    feature_frame = pd.DataFrame(feature_blocks, index=out.index)
    out = pd.concat([out, feature_frame], axis=1)
    
    grouped = out.groupby("entity_id", sort=False)
    out["inflow_mom_change"] = grouped["operating_inflow"].pct_change().replace([np.inf, -np.inf], np.nan)
    out["outflow_mom_change"] = grouped["operating_outflow"].pct_change().replace([np.inf, -np.inf], np.nan)
    
    return out
