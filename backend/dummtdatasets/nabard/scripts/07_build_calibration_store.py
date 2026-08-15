import sys
import json
import logging
from datetime import datetime
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))
from scripts.config import PROCESSED_DIR

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def build_manifest():
    logging.info("Building detailed Calibration Manifest...")
    
    manifest = {
        "calibration_version": "grampulse-calibration-v1.0",
        "random_seed": 42,
        "built_at": datetime.utcnow().isoformat() + "Z",
        "sources": {
            "enterprise": {
                "source": "ASUSE",
                "reference_period": "2022-23",
                "raw_hash": "dummy_asuse_hash_8a7b9c",
                "processor_version": "01-v1.2",
                "file": "enterprise_distributions.parquet"
            },
            "credit": {
                "source": "AIDIS",
                "reference_period": "2019",
                "raw_hash": "dummy_aidis_hash_4x2y9z",
                "processor_version": "02-v1.1",
                "file": "credit_distributions.parquet"
            },
            "market": {
                "source": "AGMARKNET",
                "through_date": datetime.utcnow().strftime("%Y-%m-%d"),
                "processor_version": "03-v1.0",
                "file": "commodity_monthly.parquet",
                "catalog_url": "https://data.gov.in/catalog/agmarknet"
            },
            "weather": {
                "source": "Open-Meteo",
                "retrieved_at": datetime.utcnow().isoformat() + "Z",
                "processor_version": "04-v1.0",
                "files": [
                    "climate_observed_monthly.parquet",
                    "climate_forecast_monthly.parquet"
                ],
                "license": "CC-BY 4.0 (Non-Commercial)"
            },
            "livestock": {
                "source": "DAHD Official Stats (Simulated Base)",
                "reference_period": "2023",
                "processor_version": "05-v1.0",
                "file": "livestock_calibration.parquet"
            },
            "digital": {
                "source": "NPCI Macro UPI Stats",
                "through_date": "2025-12-01",
                "processor_version": "06-v1.0",
                "file": "upi_macro_monthly.parquet"
            }
        }
    }
    
    manifest_path = PROCESSED_DIR / "calibration_manifest.json"
    
    # Ensure all files exist
    missing = False
    for key, info in manifest["sources"].items():
        files_to_check = info.get("files", [info.get("file")] if "file" in info else [])
        for f in files_to_check:
            if not (PROCESSED_DIR / f).exists():
                logging.error(f"Missing required calibration file: {f} (Source: {key})")
                missing = True
                
    if missing:
        logging.error("Cannot build manifest. Some processing scripts have not been run.")
        sys.exit(1)
        
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=4)
        
    logging.info(f"Manifest successfully generated at {manifest_path}")

if __name__ == "__main__":
    build_manifest()
