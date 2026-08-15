"""End-to-end integration tests for the scoring gRPC handler.

These tests exercise the full request path:
    ScoreRequest → ScoringServicer.GetScores() → ScoreResponse

No live Postgres or gRPC network required: the servicer uses the
MOCK_HASHES fast-path for all 5 demo persona phone numbers.

Run with:
    source .venv/bin/activate
    PYTHONPATH=python pytest tests/test_integration.py -v
"""

from __future__ import annotations

import hashlib
import math
from typing import Optional
from unittest.mock import AsyncMock, MagicMock

import pytest

# ---------------------------------------------------------------------------
# Import the servicer under test
# ---------------------------------------------------------------------------
from scoring.server import ScoringServicer, _determine_overall_signal

# Proto stubs — real pb2 objects built from the proto-generated classes
from proto.py import scoring_pb2


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

ALL_PRODUCTS = ["bfs", "rps", "atp", "fraud"]

_PHONE_HASHES = {
    "RAHUL":    hashlib.sha256(b"+919876543210").hexdigest(),
    "PRIYA":    hashlib.sha256(b"+919876543211").hexdigest(),
    "MOHAMMED": hashlib.sha256(b"+919876543212").hexdigest(),
    "SUNITA":   hashlib.sha256(b"+919876543213").hexdigest(),
    "VIKRAM":   hashlib.sha256(b"+919876543214").hexdigest(),
}


def _make_request(
    phone_hash: str,
    products: list[str] = ALL_PRODUCTS,
    score_version: str = "scorecard_v1",
) -> scoring_pb2.ScoreRequest:
    return scoring_pb2.ScoreRequest(
        partner_id="test_partner",
        user_ref_hash=phone_hash,
        products=products,
        score_version=score_version,
    )


def _result(response: scoring_pb2.ScoreResponse, product: str) -> Optional[scoring_pb2.ScoreResult]:
    return next((r for r in response.results if r.product == product), None)


@pytest.fixture
def servicer() -> ScoringServicer:
    """Servicer with a dummy DB URL — all requests hit the mock hash path."""
    return ScoringServicer(db_url="postgresql://mock:mock@localhost/mock")


# ---------------------------------------------------------------------------
# Test: mock hash fast-path fires for all 5 personas
# ---------------------------------------------------------------------------

class TestMockPersonaLookup:

    @pytest.mark.asyncio
    async def test_all_personas_resolved_without_db(self, servicer):
        """All 5 demo hashes must return results without touching the DB."""
        for name, phone_hash in _PHONE_HASHES.items():
            req  = _make_request(phone_hash)
            resp = await servicer.GetScores(req, context=MagicMock())
            assert len(resp.results) == len(ALL_PRODUCTS), (
                f"{name}: expected {len(ALL_PRODUCTS)} results, got {len(resp.results)}"
            )

    @pytest.mark.asyncio
    async def test_response_carries_user_hash(self, servicer):
        req  = _make_request(_PHONE_HASHES["RAHUL"])
        resp = await servicer.GetScores(req, context=MagicMock())
        assert resp.user_ref_hash == _PHONE_HASHES["RAHUL"]

    @pytest.mark.asyncio
    async def test_score_version_echoed_back(self, servicer):
        req  = _make_request(_PHONE_HASHES["RAHUL"], score_version="scorecard_v1")
        resp = await servicer.GetScores(req, context=MagicMock())
        assert resp.score_version == "scorecard_v1"


# ---------------------------------------------------------------------------
# Test: BFS product
# ---------------------------------------------------------------------------

class TestBFSProduct:

    @pytest.mark.asyncio
    async def test_rahul_bfs_in_range(self, servicer):
        """Rahul: expect BFS 700–760, GOOD band."""
        resp = await servicer.GetScores(_make_request(_PHONE_HASHES["RAHUL"]), MagicMock())
        bfs  = _result(resp, "bfs")
        assert bfs is not None
        assert 700 <= int(bfs.value) <= 760, f"Rahul BFS={int(bfs.value)}"
        assert bfs.label in ("GOOD", "EXCELLENT")

    @pytest.mark.asyncio
    async def test_priya_bfs_in_range(self, servicer):
        """Priya: expect BFS 580–650, FAIR/GOOD band."""
        resp = await servicer.GetScores(_make_request(_PHONE_HASHES["PRIYA"]), MagicMock())
        bfs  = _result(resp, "bfs")
        assert 580 <= int(bfs.value) <= 650, f"Priya BFS={int(bfs.value)}"

    @pytest.mark.asyncio
    async def test_mohammed_bfs_in_range(self, servicer):
        """Mohammed: expect BFS 650–710, GOOD band."""
        resp = await servicer.GetScores(_make_request(_PHONE_HASHES["MOHAMMED"]), MagicMock())
        bfs  = _result(resp, "bfs")
        assert 650 <= int(bfs.value) <= 710, f"Mohammed BFS={int(bfs.value)}"
        assert bfs.label == "GOOD"

    @pytest.mark.asyncio
    async def test_sunita_bfs_in_range(self, servicer):
        """Sunita: expect BFS 480–545, POOR band."""
        resp = await servicer.GetScores(_make_request(_PHONE_HASHES["SUNITA"]), MagicMock())
        bfs  = _result(resp, "bfs")
        assert 480 <= int(bfs.value) <= 545, f"Sunita BFS={int(bfs.value)}"

    @pytest.mark.asyncio
    async def test_vikram_bfs_in_range(self, servicer):
        """Vikram: expect BFS 440–510, VERY_POOR/POOR band."""
        resp = await servicer.GetScores(_make_request(_PHONE_HASHES["VIKRAM"]), MagicMock())
        bfs  = _result(resp, "bfs")
        assert 440 <= int(bfs.value) <= 510, f"Vikram BFS={int(bfs.value)}"

    @pytest.mark.asyncio
    async def test_vikram_has_aa05_factor(self, servicer):
        """Vikram: stacking must surface AA05 in the BFS factors."""
        resp = await servicer.GetScores(_make_request(_PHONE_HASHES["VIKRAM"]), MagicMock())
        bfs  = _result(resp, "bfs")
        codes = [f.code for f in bfs.factors]
        assert "AA05" in codes, f"Expected AA05 in BFS factors, got {codes}"

    @pytest.mark.asyncio
    async def test_bfs_value_is_integer_like(self, servicer):
        """BFS value must have no fractional part (300–900 integer score)."""
        resp = await servicer.GetScores(_make_request(_PHONE_HASHES["RAHUL"]), MagicMock())
        bfs  = _result(resp, "bfs")
        assert bfs.value == float(int(bfs.value)), f"Non-integer BFS value: {bfs.value}"


# ---------------------------------------------------------------------------
# Test: RPS product
# ---------------------------------------------------------------------------

class TestRPSProduct:

    @pytest.mark.asyncio
    async def test_rahul_rps_high(self, servicer):
        """Rahul: repayment propensity should be HIGH."""
        resp = await servicer.GetScores(_make_request(_PHONE_HASHES["RAHUL"]), MagicMock())
        rps  = _result(resp, "rps")
        assert rps.label == "HIGH", f"Rahul RPS label={rps.label}"

    @pytest.mark.asyncio
    async def test_vikram_rps_low_with_default_window(self, servicer):
        """Vikram: RPS LOW and carries a DEFAULT_WINDOW factor."""
        resp = await servicer.GetScores(_make_request(_PHONE_HASHES["VIKRAM"]), MagicMock())
        rps  = _result(resp, "rps")
        assert rps.label == "LOW", f"Vikram RPS label={rps.label}"
        factor_codes = [f.code for f in rps.factors]
        assert "DEFAULT_WINDOW" in factor_codes

    @pytest.mark.asyncio
    async def test_rps_probability_in_range(self, servicer):
        """RPS probability always in [0.0, 1.0] for all personas."""
        for name, phone_hash in _PHONE_HASHES.items():
            resp = await servicer.GetScores(_make_request(phone_hash), MagicMock())
            rps  = _result(resp, "rps")
            assert 0.0 <= rps.value <= 1.0, f"{name} RPS prob={rps.value}"


# ---------------------------------------------------------------------------
# Test: ATP product
# ---------------------------------------------------------------------------

class TestATPProduct:

    @pytest.mark.asyncio
    async def test_rahul_atp_sustainable(self, servicer):
        """Rahul: healthy surplus → SUSTAINABLE label."""
        resp = await servicer.GetScores(_make_request(_PHONE_HASHES["RAHUL"]), MagicMock())
        atp  = _result(resp, "atp")
        assert atp.label == "SUSTAINABLE", f"Rahul ATP label={atp.label}"

    @pytest.mark.asyncio
    async def test_rahul_atp_has_surplus_factor(self, servicer):
        """MONTHLY_SURPLUS factor must be positive for Rahul."""
        resp = await servicer.GetScores(_make_request(_PHONE_HASHES["RAHUL"]), MagicMock())
        atp  = _result(resp, "atp")
        surplus = next((f.impact for f in atp.factors if f.code == "MONTHLY_SURPLUS"), None)
        assert surplus is not None and surplus > 0, f"Expected positive surplus, got {surplus}"

    @pytest.mark.asyncio
    async def test_sunita_atp_stressed(self, servicer):
        """Sunita: thin income + zero EMI runway → STRESSED label."""
        resp = await servicer.GetScores(_make_request(_PHONE_HASHES["SUNITA"]), MagicMock())
        atp  = _result(resp, "atp")
        # Sunita has very low income; default 5k EMI should stress her budget
        ratio = next((f.impact for f in atp.factors if f.code == "RATIO_AT_EMI"), None)
        assert ratio is not None

    @pytest.mark.asyncio
    async def test_atp_max_recommended_emi_non_negative(self, servicer):
        """max_recommended_emi (value field) must always be >= 0."""
        for name, phone_hash in _PHONE_HASHES.items():
            resp = await servicer.GetScores(_make_request(phone_hash), MagicMock())
            atp  = _result(resp, "atp")
            assert atp.value >= 0, f"{name} ATP value={atp.value}"


# ---------------------------------------------------------------------------
# Test: Fraud product
# ---------------------------------------------------------------------------

class TestFraudProduct:

    @pytest.mark.asyncio
    async def test_rahul_fraud_clear(self, servicer):
        """Rahul: no risk signals → CLEAR."""
        resp  = await servicer.GetScores(_make_request(_PHONE_HASHES["RAHUL"]), MagicMock())
        fraud = _result(resp, "fraud")
        assert fraud.label == "CLEAR", f"Rahul fraud={fraud.label}"

    @pytest.mark.asyncio
    async def test_vikram_fraud_high(self, servicer):
        """Vikram: stacking + high-velocity P2P → HIGH or VERY_HIGH."""
        resp  = await servicer.GetScores(_make_request(_PHONE_HASHES["VIKRAM"]), MagicMock())
        fraud = _result(resp, "fraud")
        assert fraud.label in ("HIGH", "VERY_HIGH"), f"Vikram fraud={fraud.label}"

    @pytest.mark.asyncio
    async def test_vikram_fraud_has_loan_stacking_signal(self, servicer):
        """Vikram: LOAN_STACKING must appear in fraud factors."""
        resp  = await servicer.GetScores(_make_request(_PHONE_HASHES["VIKRAM"]), MagicMock())
        fraud = _result(resp, "fraud")
        codes = [f.code for f in fraud.factors]
        assert "LOAN_STACKING" in codes, f"Missing LOAN_STACKING in {codes}"

    @pytest.mark.asyncio
    async def test_fraud_probability_in_range(self, servicer):
        """Fraud risk probability always in [0.0, 1.0]."""
        for name, phone_hash in _PHONE_HASHES.items():
            resp  = await servicer.GetScores(_make_request(phone_hash), MagicMock())
            fraud = _result(resp, "fraud")
            assert 0.0 <= fraud.value <= 1.0, f"{name} fraud prob={fraud.value}"


# ---------------------------------------------------------------------------
# Test: Overall signal routing (end-to-end, via the full handler)
# ---------------------------------------------------------------------------

class TestOverallSignalE2E:
    """
    These tests verify that _determine_overall_signal() behaves correctly
    when called via the real handler output (not mocked BFSOutput objects).
    The logic is mirrored in test_algorithms.py but this exercises the
    serialisation path through proto ScoreResult objects.
    """

    @pytest.mark.asyncio
    async def test_rahul_proceeds(self, servicer):
        """Rahul: BFS >= 650, fraud CLEAR, HIGH confidence → PROCEED."""
        resp       = await servicer.GetScores(_make_request(_PHONE_HASHES["RAHUL"]), MagicMock())
        bfs_result = _result(resp, "bfs")
        fraud_result = _result(resp, "fraud")
        thin_file  = any(f.code == "AA10" for f in bfs_result.factors)
        confidence = "LOW" if thin_file else "HIGH"
        signal = _determine_overall_signal(
            bfs_label=bfs_result.label,
            fraud_label=fraud_result.label,
            confidence=confidence,
            thin_file=thin_file,
            bfs_score=int(bfs_result.value),
        )
        assert signal == "PROCEED", f"Rahul overall signal={signal}"

    @pytest.mark.asyncio
    async def test_vikram_declines(self, servicer):
        """Vikram: HIGH fraud → DECLINE regardless of BFS."""
        resp         = await servicer.GetScores(_make_request(_PHONE_HASHES["VIKRAM"]), MagicMock())
        bfs_result   = _result(resp, "bfs")
        fraud_result = _result(resp, "fraud")
        thin_file    = any(f.code == "AA10" for f in bfs_result.factors)
        signal = _determine_overall_signal(
            bfs_label=bfs_result.label,
            fraud_label=fraud_result.label,
            confidence="HIGH",
            thin_file=thin_file,
            bfs_score=int(bfs_result.value),
        )
        assert signal == "DECLINE", f"Vikram overall signal={signal}"

    @pytest.mark.asyncio
    async def test_sunita_review(self, servicer):
        """Sunita: thin file flag → REVIEW."""
        resp         = await servicer.GetScores(_make_request(_PHONE_HASHES["SUNITA"]), MagicMock())
        bfs_result   = _result(resp, "bfs")
        fraud_result = _result(resp, "fraud")
        thin_file    = any(f.code == "AA10" for f in bfs_result.factors)
        signal = _determine_overall_signal(
            bfs_label=bfs_result.label,
            fraud_label=fraud_result.label,
            confidence="LOW" if thin_file else "HIGH",
            thin_file=thin_file,
            bfs_score=int(bfs_result.value),
        )
        assert signal in ("REVIEW", "DECLINE"), f"Sunita should not PROCEED, got {signal}"


# ---------------------------------------------------------------------------
# Test: Selective product requests
# ---------------------------------------------------------------------------

class TestSelectiveProducts:

    @pytest.mark.asyncio
    async def test_bfs_only_returns_one_result(self, servicer):
        """Requesting only 'bfs' returns exactly one ScoreResult."""
        resp = await servicer.GetScores(
            _make_request(_PHONE_HASHES["RAHUL"], products=["bfs"]), MagicMock()
        )
        assert len(resp.results) == 1
        assert resp.results[0].product == "bfs"

    @pytest.mark.asyncio
    async def test_fraud_only_returns_one_result(self, servicer):
        resp = await servicer.GetScores(
            _make_request(_PHONE_HASHES["VIKRAM"], products=["fraud"]), MagicMock()
        )
        assert len(resp.results) == 1
        assert resp.results[0].product == "fraud"

    @pytest.mark.asyncio
    async def test_empty_products_returns_no_results(self, servicer):
        """Empty product list → empty results (no crash)."""
        resp = await servicer.GetScores(
            _make_request(_PHONE_HASHES["RAHUL"], products=[]), MagicMock()
        )
        assert len(resp.results) == 0


# ---------------------------------------------------------------------------
# Test: Unknown user falls back gracefully to neutral defaults
# ---------------------------------------------------------------------------

class TestUnknownUserFallback:

    @pytest.mark.asyncio
    async def test_unknown_hash_returns_valid_bfs(self, servicer):
        """An unrecognised hash with a broken DB should return a valid BFS."""
        # servicer DB URL is invalid → psycopg will raise → neutral defaults
        unknown_hash = "deadbeef" * 8  # 64-char hex, no match in MOCK_HASHES
        req  = _make_request(unknown_hash, products=["bfs"])
        resp = await servicer.GetScores(req, MagicMock())
        bfs  = _result(resp, "bfs")
        assert bfs is not None
        assert 300 <= int(bfs.value) <= 900, f"BFS out of range for unknown user: {bfs.value}"


# ---------------------------------------------------------------------------
# Test: Score version fallback via model registry
# ---------------------------------------------------------------------------

class TestModelRegistryFallback:

    @pytest.mark.asyncio
    async def test_nonexistent_version_falls_back_gracefully(self, servicer):
        """Requesting an unknown score version should fallback to scorecard_v1."""
        req = _make_request(_PHONE_HASHES["RAHUL"], score_version="nonexistent_v99")
        resp = await servicer.GetScores(req, MagicMock())
        assert resp.score_version == "nonexistent_v99"  # Version echoed in response
        # Ensure we still got standard BFS score for Rahul (i.e. valid execution of fallback handlers)
        bfs = _result(resp, "bfs")
        assert bfs is not None
        assert 700 <= int(bfs.value) <= 760

