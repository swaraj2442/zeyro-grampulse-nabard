import pandas as pd
import numpy as np
import logging
from pathlib import Path
import sys

# Add parent directory to path to import config
sys.path.append(str(Path(__file__).resolve().parent.parent))
from scripts.config import SYNTHETIC_DIR

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def generate_shocks():
    """Generate explicit shocks for the causal simulator."""
    shocks = []
    
    # We will generate a few targeted shocks based on district/sector/month
    # 1. Market Shock (Feed Cost Spike for Food Processing in Pune)
    shocks.append({
        "shock_id": "SH-001",
        "district": "Pune",
        "sector": "Food Processing",
        "start_month": "2023-05-01",
        "duration_months": 3,
        "shock_type": "input_cost_spike",
        "magnitude": 0.20 # 20% increase in variable costs
    })
    
    # 2. Climate Shock (Drought in Nashik impacting Retail footfall)
    shocks.append({
        "shock_id": "SH-002",
        "district": "Nashik",
        "sector": "Retail",
        "start_month": "2024-03-01",
        "duration_months": 2,
        "shock_type": "demand_drop",
        "magnitude": -0.15 # 15% drop in inflow
    })
    
    # 3. Macro Shock (Broad economic slowdown across all sectors in Aurangabad)
    shocks.append({
        "shock_id": "SH-003",
        "district": "Aurangabad",
        "sector": "All",
        "start_month": "2024-10-01",
        "duration_months": 6,
        "shock_type": "demand_drop",
        "magnitude": -0.10 # 10% drop
    })
    
    df = pd.DataFrame(shocks)
    output_path = SYNTHETIC_DIR / "shocks.parquet"
    df.to_parquet(output_path, index=False)
    logging.info(f"Saved {len(df)} explicit shocks to {output_path}")

if __name__ == "__main__":
    generate_shocks()
