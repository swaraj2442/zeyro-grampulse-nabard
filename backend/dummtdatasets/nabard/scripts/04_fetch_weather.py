import pandas as pd
import numpy as np
from datasets import Dataset
import sys
import logging
from pathlib import Path
from datetime import datetime, timedelta

# Add parent directory to path to import config
sys.path.append(str(Path(__file__).resolve().parent.parent))
from scripts.config import CLIMATE_OBSERVED_PATH, CLIMATE_FORECAST_PATH

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def fetch_weather_data(mode="observed"):
    """Mock fetching Open-Meteo data for 36 months."""
    dates = pd.date_range(start="2022-08-01", periods=1095, freq='D')
    
    # Generate for a few districts
    records = []
    for dist in ["Nashik", "Pune", "Aurangabad"]:
        for d in dates:
            # Different modes can have different error profiles
            if mode == "observed":
                rain = max(0, np.random.normal(5, 10)) if d.month in [6,7,8,9] else max(0, np.random.normal(0.5, 2))
                temp = np.random.normal(25, 5)
            else:
                # Forecast has slight smoothing
                rain = max(0, np.random.normal(5.5, 8)) if d.month in [6,7,8,9] else max(0, np.random.normal(0.6, 1.5))
                temp = np.random.normal(25, 4)
                
            records.append({
                "date": d,
                "district": dist,
                "precipitation_sum": rain,
                "temperature_2m_mean": temp,
                "soil_moisture": np.random.uniform(0.1, 0.4)
            })
            
    return pd.DataFrame(records)

def process_monthly_climate(daily_df):
    """Roll up daily weather into monthly climate features."""
    daily_df['month'] = daily_df['date'].dt.to_period('M')
    
    monthly = daily_df.groupby(['district', 'month']).agg(
        rainfall_mm=('precipitation_sum', 'sum'),
        temperature_mean=('temperature_2m_mean', 'mean'),
        soil_moisture_index=('soil_moisture', 'mean'),
        heavy_rain_days=('precipitation_sum', lambda x: (x > 20).sum())
    ).reset_index()
    
    monthly['month'] = monthly['month'].dt.to_timestamp()
    
    # Historical mean for anomaly
    hist_mean = monthly.groupby(['district', monthly['month'].dt.month])['rainfall_mm'].transform('mean')
    monthly['rainfall_anomaly_pct'] = np.where(hist_mean > 0, (monthly['rainfall_mm'] - hist_mean) / hist_mean, 0)
    
    return monthly

def main():
    logging.info("Starting Open-Meteo extraction...")
    
    # Observed
    obs_daily = fetch_weather_data(mode="observed")
    obs_monthly = process_monthly_climate(obs_daily)
    obs_monthly.to_parquet(CLIMATE_OBSERVED_PATH, index=False)
    logging.info(f"Saved observed climate to {CLIMATE_OBSERVED_PATH}")
    
    # Forecast
    fcst_daily = fetch_weather_data(mode="forecast")
    fcst_monthly = process_monthly_climate(fcst_daily)
    fcst_monthly.to_parquet(CLIMATE_FORECAST_PATH, index=False)
    logging.info(f"Saved forecast climate to {CLIMATE_FORECAST_PATH}")
    
    # HF Datasets preview
    ds_obs = Dataset.from_pandas(obs_monthly)
    ds_fcst = Dataset.from_pandas(fcst_monthly)
    logging.info(f"HF Dataset (Observed):\n{ds_obs}")
    logging.info(f"HF Dataset (Forecast):\n{ds_fcst}")

if __name__ == "__main__":
    main()
