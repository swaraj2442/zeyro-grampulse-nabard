"""Scoring package public API.

All key functions, models, and fixtures are re-exported here so callers
can use simple `from scoring import ...` imports.
"""

from .models import (
    AdverseAction,
    AssessmentResponse,
    ATPOutput,
    BFSOutput,
    FraudOutput,
    RPSOutput,
)
from .scoring import (
    BFS_VERSION,
    ATP_VERSION,
    RPS_VERSION,
    compute_atp,
    compute_bfs,
    compute_rps,
    probability_to_bfs,
)
from .fraud import compute_fraud, FRAUD_VERSION
from .fixtures import (
    RAHUL_FV,
    PRIYA_FV,
    MOHAMMED_FV,
    SUNITA_FV,
    VIKRAM_FV,
    ALL_PERSONAS,
    generate_random_fv,
)

__all__ = [
    # Models
    "AdverseAction",
    "AssessmentResponse",
    "ATPOutput",
    "BFSOutput",
    "FraudOutput",
    "RPSOutput",
    # Scoring
    "BFS_VERSION",
    "ATP_VERSION",
    "RPS_VERSION",
    "FRAUD_VERSION",
    "compute_bfs",
    "compute_rps",
    "compute_atp",
    "compute_fraud",
    "probability_to_bfs",
    # Fixtures
    "RAHUL_FV",
    "PRIYA_FV",
    "MOHAMMED_FV",
    "SUNITA_FV",
    "VIKRAM_FV",
    "ALL_PERSONAS",
    "generate_random_fv",
]
