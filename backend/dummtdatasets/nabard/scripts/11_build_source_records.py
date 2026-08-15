import pandas as pd
import json
import logging
import sys
from pathlib import Path

# Add parent directory to path to import config
sys.path.append(str(Path(__file__).resolve().parent.parent))
from scripts.config import SYNTHETIC_DIR

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def build_source_records():
    input_path = SYNTHETIC_DIR / "grampulse_numerical_splits.parquet"
    if not input_path.exists():
        logging.error(f"Cannot find input file: {input_path}")
        sys.exit(1)
        
    logging.info(f"Loading {input_path}")
    df = pd.read_parquet(input_path)
    
    # We want a sample for language generation, generating 180k texts is heavy for a local hackathon test.
    # Let's take a representative sample of 10,000 records.
    # We will prioritize records with shocks and high dpd for interesting risk scenarios.
    
    # Stratified sample
    df['has_shock'] = df['active_shocks'].notna() & (df['active_shocks'] != "")
    df['is_delinquent'] = df['dpd'] > 0
    
    df_shocks = df[df['has_shock']]
    df_delinq = df[df['is_delinquent'] & ~df['has_shock']]
    df_normal = df[~df['has_shock'] & ~df['is_delinquent']]
    
    # Take up to 2k shocks, 2k delinq, 6k normal
    sample = pd.concat([
        df_shocks.sample(min(len(df_shocks), 2000), random_state=42),
        df_delinq.sample(min(len(df_delinq), 2000), random_state=42),
        df_normal.sample(min(len(df_normal), 6000), random_state=42)
    ]).sample(frac=1, random_state=42) # shuffle
    
    logging.info(f"Selected {len(sample)} records for text generation.")
    
    source_records = []
    
    for _, row in sample.iterrows():
        # Map to canonical JSON representation as specified by user
        record = {
            "enterprise_id": row['enterprise_id'],
            "forecast_origin": row['month'].strftime("%Y-%m"),
            "sector": row['sector'],
            "district": row['district'],
            "financial": {
                "operating_inflow": float(row['operating_inflow']),
                "operating_outflow": float(row['operating_outflow']),
                "closing_cash_balance": float(row['closing_cash_balance'])
            },
            "credit": {
                "scheduled_emi": float(row['debt_service']),
                "current_dpd": int(row['dpd'])
            },
            "risk": {
                "risk_level": "High" if int(row['dpd']) > 0 or float(row['closing_cash_balance']) < float(row['debt_service']) else "Normal",
                "active_shocks": row['active_shocks'] if pd.notna(row['active_shocks']) else None
            }
        }
        source_records.append(record)
        
    output_path = SYNTHETIC_DIR / "source_records.parquet"
    
    # Save as parquet using pandas -> arrow
    out_df = pd.DataFrame(source_records)
    # We need to flatten the dicts for basic parquet or use complex types.
    # We will just dump the dicts to json strings to keep it simple and robust for DataTrove ingestion.
    out_df['financial'] = out_df['financial'].apply(json.dumps)
    out_df['credit'] = out_df['credit'].apply(json.dumps)
    out_df['risk'] = out_df['risk'].apply(json.dumps)
    
    out_df.to_parquet(output_path, index=False)
    logging.info(f"Saved canonical source records to {output_path}")

if __name__ == "__main__":
    build_source_records()
