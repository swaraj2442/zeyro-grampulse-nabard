import pandas as pd
import numpy as np
from typing import Dict, Any, Optional

from .financial_features import apply_financial_features
from .credit_features import apply_credit_features
from .digital_features import apply_digital_features
from .market_features import apply_market_features
from .climate_features import apply_climate_features

def engineer_all_features(df: pd.DataFrame, live_context: Optional[Dict[str, Any]] = None) -> pd.DataFrame:
    """
    Main entry point for both training and FastAPI inference.
    live_context is a dictionary containing real-time data from AGMARKNET and Open-Meteo.
    """
    out = df.copy().sort_values(["entity_id", "time_idx"]).reset_index(drop=True)
    
    out = apply_financial_features(out)
    out = apply_credit_features(out)
    out = apply_digital_features(out)
    out = apply_market_features(out, live_context)
    out = apply_climate_features(out, live_context)
    
    # Impute missing values per sector
    numeric_cols = out.select_dtypes(include=[np.number]).columns.tolist()
    sector_medians = out.groupby("sector")[numeric_cols].transform("median")
    out[numeric_cols] = out[numeric_cols].fillna(sector_medians)
    out[numeric_cols] = out[numeric_cols].fillna(out[numeric_cols].median(numeric_only=True))
    
    return out
