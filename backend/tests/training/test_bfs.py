from pathlib import Path

import pandas as pd
import pytest

from training.features import BFS_FEATURES, BFS_TARGET
from training.train_bfs import run


@pytest.fixture
def real_bfs_data():
    """Load a real dataset sample for BFS testing."""
    data_path = Path(__file__).parent.parent / "data" / "sample_dataset.parquet"
    if not data_path.exists():
        pytest.skip(f"Test dataset not found at {data_path}. Generate it first.")
    
    df = pd.read_parquet(data_path)
    return df


def test_bfs_training_pipeline(real_bfs_data, tmp_path):
    """Test that the BFS training pipeline runs end-to-end on real data."""
    result = run(
        df=real_bfs_data,
        run_name="test_run",
        xgb_params={"n_estimators": 2, "max_depth": 2},  # fast test
        artifact_dir=tmp_path,
    )

    # Check that it returns the expected keys
    assert "model_path" in result
    assert "metrics" in result
    assert "shap" in result
    
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
