"""Model registry helpers for score version management."""

from typing import Dict, Any, Callable, Tuple
from .scoring import compute_bfs, compute_rps, compute_atp, compute_bfs_xgb, compute_rps_xgb
from .fraud import compute_fraud

# Define type signatures for scoring functions
ScoringRegistryEntry = Tuple[Callable[..., Any], Callable[..., Any], Callable[..., Any], Callable[..., Any]]

# The registry maps score_version strings to their corresponding compute functions
# format: { version_string: (compute_bfs, compute_rps, compute_atp, compute_fraud) }
_MODEL_REGISTRY: Dict[str, ScoringRegistryEntry] = {
    "scorecard_v1": (compute_bfs, compute_rps, compute_atp, compute_fraud),
    "xgboost_v1":   (compute_bfs_xgb, compute_rps_xgb, compute_atp, compute_fraud),
}

def get_scoring_version_handlers(version: str) -> ScoringRegistryEntry:
    """Retrieve the set of scoring functions associated with a specific version.
    
    Falls back to 'scorecard_v1' if the version is not found in the registry.
    """
    normalized_version = version or "scorecard_v1"
    if normalized_version not in _MODEL_REGISTRY:
        print(f"[registry] Warning: version '{normalized_version}' not found. Falling back to 'scorecard_v1'.")
        normalized_version = "scorecard_v1"
    return _MODEL_REGISTRY[normalized_version]
