import pandas as pd
import numpy as np
import sys
import logging
from pathlib import Path
from datasets import Dataset, DatasetDict

# Add parent directory to path to import config
sys.path.append(str(Path(__file__).resolve().parent.parent))
from scripts.config import SYNTHETIC_DIR, HF_ORG

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def create_splits(df):
    """
    Creates multiple holdout strategies for robust CatBoost training.
    """
    logging.info(f"Total input rows: {len(df)}")
    
    # Sort for reproducibility
    df = df.sort_values(by=['enterprise_id', 'month']).reset_index(drop=True)
    
    # 1. Temporal Holdout (Last 6 months)
    max_month = df['month'].max()
    temporal_cutoff = max_month - pd.DateOffset(months=6)
    
    df['is_temporal_holdout'] = df['month'] > temporal_cutoff
    
    # 2. Geographic Holdout (e.g. one district entirely held out)
    holdout_district = "Aurangabad"
    df['is_geo_holdout'] = df['district'] == holdout_district
    
    # 3. Enterprise Holdout (Random 10% of enterprises)
    enterprises = df['enterprise_id'].unique()
    np.random.seed(42)
    holdout_enterprises = np.random.choice(enterprises, size=int(len(enterprises)*0.1), replace=False)
    df['is_ent_holdout'] = df['enterprise_id'].isin(holdout_enterprises)
    
    # 4. Shock Holdout
    # Hold out any record that has an active shock containing 'SH-003' (Macro shock)
    df['is_shock_holdout'] = df['active_shocks'].str.contains('SH-003', na=False)
    
    # Define primary training mask (not in any holdout)
    df['is_train'] = ~(df['is_temporal_holdout'] | df['is_geo_holdout'] | df['is_ent_holdout'] | df['is_shock_holdout'])
    
    logging.info(f"Train records: {df['is_train'].sum()}")
    logging.info(f"Temporal Holdout records: {df['is_temporal_holdout'].sum()}")
    logging.info(f"Geographic Holdout records: {df['is_geo_holdout'].sum()}")
    logging.info(f"Enterprise Holdout records: {df['is_ent_holdout'].sum()}")
    logging.info(f"Shock Holdout records: {df['is_shock_holdout'].sum()}")
    
    return df

def main():
    panel_path = SYNTHETIC_DIR / "grampulse_enterprise_monthly_v2.parquet"
    if not panel_path.exists():
        logging.error(f"Panel not found at {panel_path}")
        sys.exit(1)
        
    logging.info(f"Loading synthetic panel from {panel_path}")
    df = pd.read_parquet(panel_path)
    
    df_splits = create_splits(df)
    
    output_path = SYNTHETIC_DIR / "grampulse_numerical_splits.parquet"
    df_splits.to_parquet(output_path, index=False)
    logging.info(f"Saved dataset with split flags to {output_path}")
    
    # Output to HF Dataset format
    train_df = df_splits[df_splits['is_train']].drop(columns=['is_train', 'is_temporal_holdout', 'is_geo_holdout', 'is_ent_holdout', 'is_shock_holdout'])
    val_df = df_splits[~df_splits['is_train']].drop(columns=['is_train', 'is_temporal_holdout', 'is_geo_holdout', 'is_ent_holdout', 'is_shock_holdout'])
    
    ds_dict = DatasetDict({
        "train": Dataset.from_pandas(train_df, preserve_index=False),
        "validation": Dataset.from_pandas(val_df, preserve_index=False)
    })
    
    logging.info(f"Final HF DatasetDict:\n{ds_dict}")
    
if __name__ == "__main__":
    main()
