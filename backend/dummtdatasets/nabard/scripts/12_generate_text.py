import sys
import logging
import json
from pathlib import Path

# Add parent directory to path to import config
sys.path.append(str(Path(__file__).resolve().parent.parent))
from scripts.config import SYNTHETIC_DIR

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# We only import the heavy libraries if the script runs
def generate_texts_pipeline(mock=True):
    """
    Run DataTrove -> Transformers -> Outlines text generation.
    """
    source_path = SYNTHETIC_DIR / "source_records.parquet"
    output_path = SYNTHETIC_DIR / "language_corpus.parquet"
    
    if not source_path.exists():
        logging.error(f"Cannot find source records: {source_path}")
        sys.exit(1)
        
    logging.info("Initializing DataTrove pipeline...")
    
    if mock:
        # For the hackathon/demo environment without GPUs, we mock the heavy generation.
        import pandas as pd
        df = pd.read_parquet(source_path)
        
        logging.info(f"Loaded {len(df)} records. Generating mock structured texts...")
        outputs = []
        for _, row in df.iterrows():
            record = {
                "enterprise_id": row['enterprise_id'],
                "source_context": {
                    "financial": json.loads(row['financial']),
                    "credit": json.loads(row['credit']),
                    "risk": json.loads(row['risk'])
                },
                "risk_summary": "Based on the recent financial metrics, the enterprise is operating within expected parameters." if "Normal" in row['risk'] else "The enterprise is experiencing cash flow stress, primarily driven by external shocks.",
                "recommended_intervention": "Standard monitoring." if "Normal" in row['risk'] else "Immediate debt restructuring and subsidized working capital loan.",
                "generation_model": "Mock-SmolLM2-1.7B-Instruct"
            }
            outputs.append(record)
            
        out_df = pd.DataFrame(outputs)
        out_df['source_context'] = out_df['source_context'].apply(json.dumps)
        out_df.to_parquet(output_path, index=False)
        logging.info(f"Saved {len(out_df)} language records to {output_path}")
        return
        
    # --- Actual Implementation (Skipped in mock mode to avoid GPU memory OOM) ---
    from datatrove.pipeline.readers import ParquetReader
    from datatrove.pipeline.writers import ParquetWriter
    from datatrove.pipeline.filters import LambdaFilter
    from datatrove.pipeline.formatters import PromptFormatter
    import outlines
    
    # 1. Pydantic Schema
    from pydantic import BaseModel
    class RiskAssessment(BaseModel):
        risk_summary: str
        recommended_intervention: str

    # 2. Load Model via Outlines
    # model = outlines.models.transformers("HuggingFaceTB/SmolLM2-1.7B-Instruct", device="auto")
    # generator = outlines.generate.json(model, RiskAssessment)
    
    # 3. DataTrove Custom Block for generation
    class OutlinesGeneratorBlock:
        def __init__(self, generator):
            self.generator = generator
            
        def __call__(self, data, rank=0):
            for doc in data:
                # doc.text contains the prompted text
                # result = self.generator(doc.text)
                # doc.metadata['structured_output'] = result.model_dump_json()
                yield doc

    # Pipeline definition
    # pipeline = [
    #    ParquetReader(str(source_path)),
    #    PromptFormatter("Analyze this enterprise financial data and output a risk assessment:\n\n{text}"),
    #    OutlinesGeneratorBlock(generator),
    #    ParquetWriter(str(output_path))
    # ]
    # 
    # from datatrove.executor.local import LocalPipelineExecutor
    # executor = LocalPipelineExecutor(pipeline=pipeline, tasks=1)
    # executor.run()

if __name__ == "__main__":
    generate_texts_pipeline(mock=True)
