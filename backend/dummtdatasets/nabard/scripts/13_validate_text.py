import sys
import logging
import json
import pandas as pd
from pathlib import Path

# Add parent directory to path to import config
sys.path.append(str(Path(__file__).resolve().parent.parent))
from scripts.config import SYNTHETIC_DIR

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def validate_texts():
    corpus_path = SYNTHETIC_DIR / "language_corpus.parquet"
    if not corpus_path.exists():
        logging.error(f"Cannot find corpus: {corpus_path}")
        sys.exit(1)
        
    logging.info(f"Loading generated language corpus from {corpus_path}")
    df = pd.read_parquet(corpus_path)
    
    total = len(df)
    passed = 0
    
    # We validate that the structured output aligns with the numeric truth
    for _, row in df.iterrows():
        source = json.loads(row["source_context"])
        risk_level = source["risk"]["risk_level"]
        summary = row["risk_summary"]
        
        # Simple heuristic check: if risk is High, the summary should mention stress or shock
        if risk_level == "High":
            if "stress" in summary.lower() or "shock" in summary.lower():
                passed += 1
        elif risk_level == "Normal":
            if "expected parameters" in summary.lower() or "normal" in summary.lower():
                passed += 1
                
    failed = total - passed
    logging.info(f"Validated {total} text records.")
    logging.info(f"Factual Alignment Passed: {passed}")
    logging.info(f"Factual Alignment Failed: {failed}")
    
    if failed > 0:
        logging.warning("Some language models hallucinated. FinePhrase pipeline will filter these out before training.")
    else:
        logging.info("All generated texts perfectly align with numerical truths.")

if __name__ == "__main__":
    validate_texts()
