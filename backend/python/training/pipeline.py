"""Top-level orchestrator for running BFS and RPS model training pipelines.

Callable from a Jupyter notebook:

    from training.pipeline import run_all
    results = run_all(df_bfs, df_rps)

Or run individual models:

    from training.pipeline import run_bfs
    result = run_bfs(df_clean)

DataFrames may be the same cleaned dataset if all targets are present,
or different DataFrames if the label populations differ.
"""

from __future__ import annotations

import pandas as pd

from .train_bfs import run as _run_bfs
from .train_rps import run as _run_rps


def run_bfs(df: pd.DataFrame, run_name: str = "bfs_v1", **kwargs) -> dict:
    """Train the BFS model. See train_bfs.run for full parameter docs."""
    print("=" * 60)
    print(f" BFS training — run: {run_name}")
    print("=" * 60)
    return _run_bfs(df, run_name=run_name, **kwargs)


def run_rps(df: pd.DataFrame, run_name: str = "rps_v1", **kwargs) -> dict:
    """Train the RPS model. See train_rps.run for full parameter docs."""
    print("=" * 60)
    print(f" RPS training — run: {run_name}")
    print("=" * 60)
    return _run_rps(df, run_name=run_name, **kwargs)


def run_all(
    df_bfs: pd.DataFrame,
    df_rps: pd.DataFrame,
    version_tag: str = "v1",
) -> dict:
    """
    Run BFS and RPS training pipelines sequentially and collect results.

    Args:
        df_bfs: Cleaned DataFrame for BFS training.
        df_rps: Cleaned DataFrame for RPS training.
        version_tag: Appended to each run_name (e.g. "v1" → "bfs_v1").

    Returns:
        Dict with keys "bfs", "rps" → individual result dicts.
    """
    return {
        "bfs": run_bfs(df_bfs, run_name=f"bfs_{version_tag}"),
        "rps": run_rps(df_rps, run_name=f"rps_{version_tag}"),
    }
