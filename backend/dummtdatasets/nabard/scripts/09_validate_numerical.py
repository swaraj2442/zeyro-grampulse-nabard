import sys
import logging
from pathlib import Path
from datasets import load_dataset
import numpy as np

# Add parent directory to path to import config
sys.path.append(str(Path(__file__).resolve().parent.parent))
from scripts.config import SYNTHETIC_DIR

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def validate_accounting(record):
    """Ensure cash flow math is perfect."""
    expected_closing = (
        record['opening_cash_balance'] + 
        record['operating_inflow'] - 
        record['operating_outflow'] - 
        record['debt_service']
    )
    # Floating point comparison
    return abs(expected_closing - record['closing_cash_balance']) < 1.0

def validate_ranges(record):
    """Ensure non-negative limits."""
    return (
        record['operating_inflow'] >= 0 and
        record['operating_outflow'] >= 0 and
        record['debt_service'] >= 0 and
        record['dpd'] >= 0
    )

def main():
    panel_path = SYNTHETIC_DIR / "grampulse_enterprise_monthly_v2.parquet"
    if not panel_path.exists():
        logging.error(f"Panel not found at {panel_path}")
        sys.exit(1)
        
    logging.info(f"Loading synthetic dataset for validation from {panel_path}")
    
    # Load via HF Datasets
    ds = load_dataset(
        "parquet",
        data_files=str(panel_path),
        split="train"
    )
    
    total_records = len(ds)
    logging.info(f"Loaded {total_records} records.")
    
    # Run filters
    ds_valid_acct = ds.filter(validate_accounting, num_proc=1)
    ds_valid_range = ds_valid_acct.filter(validate_ranges, num_proc=1)
    
    valid_records = len(ds_valid_range)
    failed_records = total_records - valid_records
    
    logging.info(f"Validation complete.")
    logging.info(f"Passed: {valid_records} / {total_records}")
    logging.info(f"Failed: {failed_records}")
    
    if failed_records > 0:
        logging.error("Accounting or Range invariants were violated! Do not scale up yet.")
        sys.exit(1)
    else:
        logging.info("All numerical validations passed successfully.")
        
if __name__ == "__main__":
    main()
