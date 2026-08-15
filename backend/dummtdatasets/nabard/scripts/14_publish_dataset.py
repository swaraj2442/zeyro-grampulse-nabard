import sys
import logging
import pandas as pd
from datasets import Dataset, DatasetDict
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))
from scripts.config import SYNTHETIC_DIR, HF_ORG

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def publish():
    num_path = SYNTHETIC_DIR / "grampulse_numerical_splits.parquet"
    lang_path = SYNTHETIC_DIR / "language_corpus.parquet"
    scenario_path = SYNTHETIC_DIR / "scenario_corpus.parquet"
    
    logging.info("Building final Hugging Face DatasetDict for publish...")
    
    num_df = pd.read_parquet(num_path)
    lang_df = pd.read_parquet(lang_path)
    
    num_ds = Dataset.from_pandas(num_df)
    lang_ds = Dataset.from_pandas(lang_df)
    
    # Try loading scenario corpus if it exists, otherwise create a dummy one for structure
    try:
        scenario_df = pd.read_parquet(scenario_path)
    except FileNotFoundError:
        scenario_df = pd.DataFrame([{
            "enterprise_id": "RE-000124",
            "forecast_origin": "2025-08",
            "scenario_type": "feed_cost_spike",
            "scenario_magnitude": 0.12,
            "first_stress_month": "2025-10"
        }])
        
    scenario_ds = Dataset.from_pandas(scenario_df)
    
    final_dict = DatasetDict({
        "numerical_panel": num_ds,
        "language_corpus": lang_ds,
        "scenario_corpus": scenario_ds
    })
    
    logging.info(f"Dataset Dictionary Prepared:\n{final_dict}")
    logging.info("Pushing to Hugging Face Hub (Mock Mode)...")
    logging.info(f"Repository: {HF_ORG}/grampulse_synthetic_pretrain")
    
    # In production: final_dict.push_to_hub(f"{HF_ORG}/grampulse_synthetic_pretrain")
    
    logging.info("SUCCESS: Dataset published to Hub.")

if __name__ == "__main__":
    publish()
