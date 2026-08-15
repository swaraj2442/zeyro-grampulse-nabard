import os
import sys
import logging
import pandas as pd
import numpy as np
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))
from scripts.config import PROCESSED_DIR

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def process_livestock():
    logging.info("Processing Livestock and Animal Husbandry calibration data...")
    
    # We create synthetic empirical distributions grounded in reality
    # This would normally ingest official DAHD (Dept of Animal Husbandry and Dairying) data
    
    sectors = ["Dairy", "Poultry"]
    districts = ["Pune", "Nashik", "Ahmednagar", "Solapur", "Satara"]
    
    data = []
    
    # Generate Dairy distributions (milch animals, productivity)
    for district in districts:
        data.append({
            "sector": "Dairy",
            "district": district,
            "metric": "median_herd_size",
            "value": np.random.uniform(2, 10),
            "unit": "animals"
        })
        data.append({
            "sector": "Dairy",
            "district": district,
            "metric": "milch_animal_share",
            "value": np.random.uniform(0.6, 0.85),
            "unit": "ratio"
        })
        data.append({
            "sector": "Dairy",
            "district": district,
            "metric": "milk_productivity_liters_per_day",
            "value": np.random.uniform(6.0, 14.0),
            "unit": "liters"
        })
        
    # Generate Poultry distributions (capacity, bird production)
    for district in districts:
        data.append({
            "sector": "Poultry",
            "district": district,
            "metric": "median_capacity",
            "value": np.random.uniform(500, 5000),
            "unit": "birds"
        })
        data.append({
            "sector": "Poultry",
            "district": district,
            "metric": "mortality_rate",
            "value": np.random.uniform(0.02, 0.08),
            "unit": "ratio"
        })

    df = pd.DataFrame(data)
    
    out_path = PROCESSED_DIR / "livestock_calibration.parquet"
    df.to_parquet(out_path, index=False)
    logging.info(f"Livestock calibration saved to {out_path} ({len(df)} records)")

if __name__ == "__main__":
    process_livestock()
