import pandas as pd
import numpy as np
from datasets import Dataset
import sys
import logging
from pathlib import Path
from datetime import datetime, timedelta

# Add parent directory to path to import config
sys.path.append(str(Path(__file__).resolve().parent.parent))
from scripts.config import COMMODITY_MONTHLY_PATH

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def fetch_agmarknet_daily():
    """Mock fetching daily prices from data.gov.in."""
    # Generate 36 months of data for a few commodities
    dates = pd.date_range(start="2022-08-01", periods=1095, freq='D')
    
    records = []
    for comm in ["Maize", "Soybean", "Wheat", "Tomato"]:
        base_price = 2000 if comm in ["Maize", "Wheat"] else (4000 if comm == "Soybean" else 1500)
        # Random walk for prices
        prices = [base_price]
        for _ in range(1, len(dates)):
            prices.append(prices[-1] + np.random.normal(0, 50))
            
        for d, p in zip(dates, prices):
            records.append({
                "date": d,
                "district": "Nashik",
                "market": "Nashik Mandi",
                "commodity": comm,
                "modal_price": max(100, p), # Prevent negative
                "arrivals": max(10, np.random.normal(500, 100))
            })
            
    return pd.DataFrame(records)

def process_monthly_features(daily_df):
    """Roll up daily prices into monthly features."""
    daily_df['month'] = daily_df['date'].dt.to_period('M')
    
    monthly = daily_df.groupby(['district', 'market', 'commodity', 'month']).agg(
        modal_price=('modal_price', 'mean'),
        price_std=('modal_price', 'std'),
        arrival_mean=('arrivals', 'mean')
    ).reset_index()
    
    monthly['month'] = monthly['month'].dt.to_timestamp()
    monthly = monthly.sort_values(by=['district', 'market', 'commodity', 'month'])
    
    # Calculate lags
    monthly['price_lag_1m'] = monthly.groupby(['district', 'market', 'commodity'])['modal_price'].shift(1)
    monthly['price_lag_3m'] = monthly.groupby(['district', 'market', 'commodity'])['modal_price'].shift(3)
    
    monthly['price_change_1m'] = (monthly['modal_price'] - monthly['price_lag_1m']) / monthly['price_lag_1m']
    monthly['price_change_3m'] = (monthly['modal_price'] - monthly['price_lag_3m']) / monthly['price_lag_3m']
    monthly['price_volatility_3m'] = monthly['price_std'] / monthly['modal_price'] # Simple CV
    
    return monthly.dropna()

def main():
    logging.info("Starting AGMARKNET extraction...")
    
    daily_df = fetch_agmarknet_daily()
    monthly_df = process_monthly_features(daily_df)
    
    # Save as parquet
    monthly_df.to_parquet(COMMODITY_MONTHLY_PATH, index=False)
    logging.info(f"Saved commodity distributions to {COMMODITY_MONTHLY_PATH}")
    
    # Standardize to HF Dataset
    ds = Dataset.from_pandas(monthly_df)
    logging.info(f"HF Dataset representation:\n{ds}")

if __name__ == "__main__":
    main()
