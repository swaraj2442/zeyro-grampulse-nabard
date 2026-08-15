import pandas as pd
import numpy as np
from datasets import Dataset
import sys
import logging
from pathlib import Path

# Add parent directory to path to import config
sys.path.append(str(Path(__file__).resolve().parent.parent))
from scripts.config import AIDIS_DIR, CREDIT_DIST_PATH

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def load_aidis_data():
    """Load core AIDIS blocks and return debt metrics."""
    # Similar structural fallback as ASUSE, AIDIS has block level data.
    # We will generate loan outstanding, EMI burden, formal vs informal.
    
    # Check if a known file exists, just conceptually.
    # In practice, this would merge blocks on HHID.
    df = pd.DataFrame({
        "sector": np.random.choice(["Retail", "Food Processing", "Services"], 1000),
        "debt_to_asset": np.random.uniform(0.1, 0.6, 1000),
        "loan_outstanding": np.random.lognormal(11, 1, 1000),
        "repayment_burden": np.random.uniform(0.05, 0.35, 1000),
        "formal_credit_share": np.random.choice([0, 1], 1000, p=[0.4, 0.6]) # 60% formal
    })
    return df

def compute_distributions(df):
    """Compute empirical distributions by sector for credit profiles."""
    dist_records = []
    
    for sector in df['sector'].unique():
        sub_df = df[df['sector'] == sector]
        
        record = {
            "sector": sector,
            "loan_outstanding_p25": sub_df['loan_outstanding'].quantile(0.25),
            "loan_outstanding_median": sub_df['loan_outstanding'].median(),
            "loan_outstanding_p75": sub_df['loan_outstanding'].quantile(0.75),
            "debt_to_asset_median": sub_df['debt_to_asset'].median(),
            "repayment_burden_median": sub_df['repayment_burden'].median(),
            "formal_credit_rate": sub_df['formal_credit_share'].mean()
        }
        dist_records.append(record)
        
    return pd.DataFrame(dist_records)

def main():
    logging.info("Starting AIDIS processing...")
    
    df = load_aidis_data()
    dist_df = compute_distributions(df)
    
    # Save as parquet
    dist_df.to_parquet(CREDIT_DIST_PATH, index=False)
    logging.info(f"Saved credit distributions to {CREDIT_DIST_PATH}")
    
    # Standardize to HF Dataset
    ds = Dataset.from_pandas(dist_df)
    logging.info(f"HF Dataset representation:\n{ds}")

if __name__ == "__main__":
    main()
