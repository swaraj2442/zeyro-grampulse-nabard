"""gRPC Server for scoring engine.

All scoring calculations are delegated to the tested algorithm modules:
    scoring.scoring  → compute_bfs, compute_rps, compute_atp
    scoring.fraud    → compute_fraud

The inline heuristics that previously lived in GetScores() have been removed.
"""

import asyncio
import hashlib
import json
import os
import sys
from typing import Dict, Any, List

import grpc
import psycopg

# Add path to include proto files
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from proto.py import scoring_pb2
from proto.py import scoring_pb2_grpc

# ---------------------------------------------------------------------------
# Import the tested, calibrated scoring modules via the model version registry
# ---------------------------------------------------------------------------
from .registry import get_scoring_version_handlers
from .fixtures import RAHUL_FV

# ---------------------------------------------------------------------------
# Demo persona feature vectors (mock lookup by phone hash)
# ---------------------------------------------------------------------------
from .fixtures import RAHUL_FV, PRIYA_FV, MOHAMMED_FV, SUNITA_FV, VIKRAM_FV

_DEMO_PHONES = {
    "+919876543210": RAHUL_FV,
    "+919876543211": PRIYA_FV,
    "+919876543212": MOHAMMED_FV,
    "+919876543213": SUNITA_FV,
    "+919876543214": VIKRAM_FV,
}

# Pre-hash the phone numbers for O(1) lookup
MOCK_HASHES: Dict[str, Dict[str, float]] = {
    hashlib.sha256(phone.encode("utf-8")).hexdigest(): fv
    for phone, fv in _DEMO_PHONES.items()
}

# ---------------------------------------------------------------------------
# Neutral defaults used when a real user has no features in the DB yet
# ---------------------------------------------------------------------------
_NEUTRAL_DEFAULTS: Dict[str, float] = {
    "income.avg_monthly_credit_inr":         35000.0,
    "income.income_regularity_score":         0.70,
    "income.income_trend_90d":                0.0,
    "income.credit_to_debit_ratio":           1.05,
    "expense.fixed_obligation_inr":           10000.0,
    "expense.fixed_obligation_ratio":         0.30,
    "expense.discretionary_spend_ratio":      0.40,
    "emi.count_active":                       1.0,
    "emi.total_monthly_exposure_inr":         5000.0,
    "emi.emi_to_income_ratio":                0.15,
    "emi.missed_emi_signals_count":           0.0,
    "emi.loan_stacking_signals":              0.0,
    "emi.bnpl_activity_detected":             0.0,
    "cashflow.end_of_month_stress_score":     0.30,
    "cashflow.avg_days_to_near_zero":         18.0,
    "cashflow.min_balance_30d_inr":           2500.0,
    "cashflow.balance_trend_slope":           0.0,
    "savings.recurring_sip_detected":         0.0,
    "savings.savings_to_income_ratio":        0.05,
    "behavior.unique_merchant_count_30d":     15.0,
    "behavior.round_amount_transfer_ratio":   0.15,
    "network.unique_p2p_recipients_30d":      5.0,
    "network.p2p_transfer_ratio":             0.20,
    "network.new_vpa_ratio_30d":              0.10,
    "volatility.spend_coefficient_variation_30d": 0.30,
    "volatility.sudden_behavior_change_score":     0.10,
    "temporal.active_days_ratio_30d":         0.60,
    "temporal.longest_inactive_streak_days":  5.0,
    "quality.thin_file_flag":                 0.0,
    "quality.data_coverage_days":             90.0,
    "quality.source_diversity_code":          1.0,
    "quality.data_gap_count":                 0.0,
}


# ---------------------------------------------------------------------------
# Helper: determine overall credit signal from all four model outputs
# ---------------------------------------------------------------------------
def _determine_overall_signal(bfs_label: str, fraud_label: str, confidence: str, thin_file: bool, bfs_score: int) -> str:
    """Deterministic routing rule — mirrors the test suite's logic exactly."""
    if fraud_label in ("HIGH", "VERY_HIGH"):
        return "DECLINE"
    if thin_file or confidence == "LOW":
        return "REVIEW"
    if bfs_score >= 650 and fraud_label == "CLEAR":
        return "PROCEED"
    if bfs_score >= 500:
        return "REVIEW"
    return "DECLINE"


class ScoringServicer(scoring_pb2_grpc.ScoringServiceServicer):

    def __init__(self, db_url: str):
        self.db_url = db_url

    async def _get_user_features(self, user_ref_hash: str) -> Dict[str, float]:
        """Fetch user features from Postgres, falling back to mock/demo if matched."""
        # 1. Mock persona fast-path
        if user_ref_hash in MOCK_HASHES:
            print(f"[scoring] Mock persona hit for hash: {user_ref_hash[:12]}…")
            return MOCK_HASHES[user_ref_hash]

        # 2. Real DB fetch
        print(f"[scoring] Querying DB for hash: {user_ref_hash[:12]}…")
        fv: Dict[str, float] = {}
        try:
            async with await psycopg.AsyncConnection.connect(self.db_url) as aconn:
                async with aconn.cursor() as cur:
                    await cur.execute(
                        """
                        SELECT feature_group, feature_name, feature_value_json
                        FROM feature_vectors
                        WHERE user_ref_hash = %s AND feature_window = '90d'
                        """,
                        (user_ref_hash,),
                    )
                    rows = await cur.fetchall()
                    for group, name, val_json in rows:
                        key = f"{group}.{name}"
                        val = json.loads(val_json) if isinstance(val_json, str) else val_json
                        fv[key] = float(val) if val is not None else 0.0

            if not fv:
                print(f"[scoring] No features in DB for {user_ref_hash[:12]}…, using neutral defaults")
                return dict(_NEUTRAL_DEFAULTS)
            return fv

        except Exception as exc:
            print(f"[scoring] DB error: {exc} — falling back to neutral defaults")
            return dict(_NEUTRAL_DEFAULTS)

    async def GetScores(
        self, request: scoring_pb2.ScoreRequest, context
    ) -> scoring_pb2.ScoreResponse:
        user_hash = request.user_ref_hash
        products  = list(request.products)
        version   = request.score_version or "scorecard_v1"
        print(f"[scoring] GetScores user={user_hash[:12]}… products={products} version={version}")

        # Resolve handlers from version registry
        compute_bfs_fn, compute_rps_fn, compute_atp_fn, compute_fraud_fn = get_scoring_version_handlers(version)

        fv      = await self._get_user_features(user_hash)
        results: List[scoring_pb2.ScoreResult] = []

        # ----------------------------------------------------------------
        # BFS
        # ----------------------------------------------------------------
        if "bfs" in products:
            bfs = compute_bfs_fn(fv)
            factors = [
                scoring_pb2.ScoreFactor(
                    code=aa.code,
                    description=aa.description,
                    impact=0.0,   # proto impact field kept for compatibility
                )
                for aa in bfs.adverse_action_reasons
            ]
            results.append(scoring_pb2.ScoreResult(
                product="bfs",
                label=bfs.band,
                value=float(bfs.score),
                factors=factors,
            ))

        # ----------------------------------------------------------------
        # RPS
        # ----------------------------------------------------------------
        if "rps" in products:
            rps = compute_rps_fn(fv)
            factors = []
            if rps.predicted_default_window_days is not None:
                factors.append(scoring_pb2.ScoreFactor(
                    code="DEFAULT_WINDOW",
                    description="Predicted default window in days",
                    impact=float(rps.predicted_default_window_days),
                ))
            results.append(scoring_pb2.ScoreResult(
                product="rps",
                label=rps.label,
                value=float(rps.probability),
                factors=factors,
            ))

        # ----------------------------------------------------------------
        # ATP
        # ----------------------------------------------------------------
        if "atp" in products:
            requested_emi = float(getattr(request, "requested_emi_inr", 5000.0) or 5000.0)
            atp = compute_atp_fn(fv, requested_emi_inr=requested_emi)
            label = "SUSTAINABLE" if (
                atp.ratio_at_requested_emi != float("inf")
                and atp.ratio_at_requested_emi <= 0.50
            ) else "STRESSED"
            results.append(scoring_pb2.ScoreResult(
                product="atp",
                label=label,
                value=float(atp.max_recommended_emi_inr),
                factors=[
                    scoring_pb2.ScoreFactor(
                        code="MONTHLY_SURPLUS",
                        description="Monthly cash surplus after fixed obligations",
                        impact=float(atp.monthly_surplus_inr),
                    ),
                    scoring_pb2.ScoreFactor(
                        code="RATIO_AT_EMI",
                        description="Ratio of requested EMI to free cash flow",
                        impact=float(atp.ratio_at_requested_emi) if atp.ratio_at_requested_emi != float("inf") else -1.0,
                    ),
                ],
            ))

        # ----------------------------------------------------------------
        # Fraud
        # ----------------------------------------------------------------
        if "fraud" in products:
            fraud = compute_fraud_fn(fv)
            factors = [
                scoring_pb2.ScoreFactor(
                    code=s["signal_type"],
                    description=s["description"],
                    impact=float(s["risk_contribution"]),
                )
                for s in fraud.signals
            ]
            results.append(scoring_pb2.ScoreResult(
                product="fraud",
                label=fraud.risk_label,
                value=float(fraud.risk_probability),
                factors=factors,
            ))

        # ----------------------------------------------------------------
        # Overall signal — computed only when BFS + Fraud both requested
        # ----------------------------------------------------------------
        overall_signal = ""
        if "bfs" in products and "fraud" in products:
            bfs_result   = next((r for r in results if r.product == "bfs"), None)
            fraud_result = next((r for r in results if r.product == "fraud"), None)
            if bfs_result and fraud_result:
                bfs_obj   = compute_bfs_fn(fv)   # re-use cached result (no extra DB call)
                overall_signal = _determine_overall_signal(
                    bfs_label=bfs_obj.band,
                    fraud_label=fraud_result.label,
                    confidence=bfs_obj.confidence,
                    thin_file=bfs_obj.thin_file,
                    bfs_score=bfs_obj.score,
                )
                print(f"[scoring] overall_signal={overall_signal} bfs={bfs_obj.score} fraud={fraud_result.label}")

        return scoring_pb2.ScoreResponse(
            user_ref_hash=user_hash,
            score_version=version,
            results=results,
        )


async def serve() -> None:
    db_url = os.environ.get("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/zeyro")
    port   = os.environ.get("SCORING_SERVICE_PORT", "8013")

    server = grpc.aio.server()
    scoring_pb2_grpc.add_ScoringServiceServicer_to_server(ScoringServicer(db_url), server)

    listen_addr = f"[::]:{port}"
    server.add_insecure_port(listen_addr)
    print(f"[scoring] gRPC service listening on {listen_addr}")

    await server.start()
    await server.wait_for_termination()


if __name__ == "__main__":
    asyncio.run(serve())
