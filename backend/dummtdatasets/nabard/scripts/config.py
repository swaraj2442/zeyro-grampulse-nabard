import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / "raw"
PROCESSED_DIR = BASE_DIR / "processed"
SYNTHETIC_DIR = BASE_DIR / "synthetic"
HF_DATASETS_DIR = BASE_DIR / "hf_datasets"

# Create directories if they don't exist
for d in [RAW_DIR, PROCESSED_DIR, SYNTHETIC_DIR, HF_DATASETS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Raw Data Paths
ASUSE_DIR = RAW_DIR / "asuse_2022_23"
AIDIS_DIR = RAW_DIR / "aidis_2019"

# Processed Data Paths
ENTERPRISE_DIST_PATH = PROCESSED_DIR / "enterprise_distributions.parquet"
CREDIT_DIST_PATH = PROCESSED_DIR / "credit_distributions.parquet"
COMMODITY_MONTHLY_PATH = PROCESSED_DIR / "commodity_monthly.parquet"
CLIMATE_OBSERVED_PATH = PROCESSED_DIR / "climate_observed_monthly.parquet"
CLIMATE_FORECAST_PATH = PROCESSED_DIR / "climate_forecast_monthly.parquet"

# HF Hub Settings
HF_ORG = "grampulse"  # Default org, change as needed
