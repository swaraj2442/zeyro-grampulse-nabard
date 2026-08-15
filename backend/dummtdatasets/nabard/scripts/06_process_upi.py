import os
import sys
import logging
import pandas as pd
import numpy as np
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))
from scripts.config import PROCESSED_DIR

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def process_upi():
    logging.info("Processing NPCI UPI Macro calibration data...")
    
    months = pd.date_range(start="2023-01-01", end="2025-12-01", freq="MS")
    
    # Generate realistic UPI adoption curves
    data = []
    base_adoption = 0.30
    
    for month in months:
        # Logistic-like growth over time
        progress = (month.year - 2023) * 12 + month.month
        adoption_rate = min(0.85, base_adoption + (progress * 0.015) + np.random.normal(0, 0.01))
        p2m_share = min(0.65, 0.40 + (progress * 0.005) + np.random.normal(0, 0.02))
        
        data.append({
            "month": month.strftime("%Y-%m"),
            "digital_adoption_rate": round(adoption_rate, 4),
            "p2m_volume_share": round(p2m_share, 4),
            "monthly_ecosystem_growth": round(np.random.normal(0.05, 0.02), 4)
        })

    df = pd.DataFrame(data)
    
    out_path = PROCESSED_DIR / "upi_macro_monthly.parquet"
    df.to_parquet(out_path, index=False)
    logging.info(f"UPI Macro calibration saved to {out_path} ({len(df)} months)")

if __name__ == "__main__":
    process_upi()
