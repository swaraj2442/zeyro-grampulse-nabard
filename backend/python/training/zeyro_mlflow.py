"""
Zeyro MLflow Wrapper

Enforces correct tracking URIs, artifact storage, and required tagging (data_source)
to maintain MLflow compliance for audit and migration.
"""
import os
import subprocess
import logging
from pathlib import Path
from contextlib import contextmanager
import mlflow

logger = logging.getLogger(__name__)

# Config
# Default to local SQLite database for development. 
# In production, set MLFLOW_TRACKING_URI to your Supabase Postgres connection string.
DEFAULT_DB_PATH = Path(__file__).parent.parent.parent / "mlflow.db"
TRACKING_URI = os.getenv(
    "MLFLOW_TRACKING_URI", 
    f"sqlite:///{DEFAULT_DB_PATH.as_posix()}"
)

def init_mlflow():
    """Initializes the MLflow tracking URI globally."""
    mlflow.set_tracking_uri(TRACKING_URI)

def get_git_sha() -> str:
    """Returns the current Git SHA."""
    try:
        return subprocess.check_output(["git", "rev-parse", "HEAD"]).decode().strip()
    except Exception as e:
        logger.warning("Could not retrieve git SHA: %s", e)
        return "unknown"

@contextmanager
def start_training_run(
    run_name: str, 
    model_target: str, 
    data_source: str,
    feature_set_version: str = "1.0",
    nested: bool = False,
    autolog: bool = True
):
    """
    Context manager to start a compliant MLflow run.
    
    Args:
        run_name: Unique name for the run and experiment.
        model_target: The model type being trained (e.g. 'BFS', 'RPS', 'ATP').
        data_source: Must be explicitly provided (e.g. 'proxy_homecredit', 'finarkein_real').
        feature_set_version: Version of the feature definitions used.
        nested: True if this run is inside an Optuna study.
        autolog: True to enable mlflow.xgboost.autolog (disable for tuning).
    """
    if not data_source:
        raise ValueError("CRITICAL: data_source tag is REQUIRED (e.g. 'proxy_homecredit' or 'finarkein_real').")

    init_mlflow()
    mlflow.set_experiment(run_name)
    
    with mlflow.start_run(run_name=run_name, nested=nested) as run:
        mlflow.set_tags({
            "data_source": data_source,
            "git_sha": get_git_sha(),
            "model_target": model_target,
            "feature_set_version": feature_set_version,
        })
        
        if autolog:
            mlflow.xgboost.autolog(log_models=True, log_input_examples=False)
            
        yield run
