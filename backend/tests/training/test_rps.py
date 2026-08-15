from pathlib import Path

import pandas as pd
import pytest

from training.features import RPS_FEATURES, RPS_TARGET
from training.train_rps import run


@pytest.fixture
def real_rps_data():
    """Load a real dataset sample for RPS testing."""
    data_path = Path(__file__).parent.parent / "data" / "sample_dataset.parquet"
    if not data_path.exists():
        pytest.skip(f"Test dataset not found at {data_path}. Generate it first.")
    
    df = pd.read_parquet(data_path)
    return df


def test_rps_training_pipeline(real_rps_data, tmp_path):
    """Test that the RPS training pipeline runs end-to-end without crashing."""
    result = run(
        df=real_rps_data,
        run_name="test_run",
        xgb_params={"n_estimators": 2, "max_depth": 2},
        artifact_dir=tmp_path,
    )

    assert "model_path" in result
    # Check that metrics were computed for both Val and Test
    assert "val" in result["metrics"]
    assert "test" in result["metrics"]
    assert "auc" in result["metrics"]["val"]
    
    # Check that dual artifact files were written
    out_dir = tmp_path / "test_run"
    assert (out_dir / "model.json").exists()
    assert (out_dir / "metrics_val.json").exists()
    assert (out_dir / "metrics_test.json").exists()
    assert (out_dir / "shap_global_val.json").exists()
    assert (out_dir / "shap_global_test.json").exists()
