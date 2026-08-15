import asyncio
import hashlib
import os
import sys
import grpc

# Include project paths
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

from proto.py import scoring_pb2
from proto.py import scoring_pb2_grpc

SCORING_ADDR = "localhost:8013"

# Hashed mobile number for Rahul (Approve path)
RAHUL_PHONE = "+919876543210"
RAHUL_HASH = hashlib.sha256(RAHUL_PHONE.encode("utf-8")).hexdigest()

async def trigger_scoring(version="scorecard_v1"):
    """Send gRPC ScoreRequest directly to the scoring service on port 8013."""
    print(f"\nTriggering gRPC GetScores call to {SCORING_ADDR} for version: {version}...")
    async with grpc.aio.insecure_channel(SCORING_ADDR) as channel:
        stub = scoring_pb2_grpc.ScoringServiceStub(channel)
        
        request = scoring_pb2.ScoreRequest(
            partner_id="test_partner",
            user_ref_hash=RAHUL_HASH,
            products=["bfs", "rps", "atp", "fraud"],
            score_version=version
        )
        
        response = await stub.GetScores(request)
        print(f"--- gRPC Scoring Response ({version}) ---")
        print(f"User Hash:     {response.user_ref_hash}")
        print(f"Score Version:  {response.score_version}")
        
        for result in response.results:
            print(f"\nProduct: {result.product}")
            print(f"  Value: {result.value}")
            print(f"  Label: {result.label}")
            print(f"  Factors:")
            for f in result.factors:
                print(f"    - [{f.code}] {f.description} (Impact: {f.impact})")

async def main():
    await trigger_scoring("scorecard_v1")
    await trigger_scoring("xgboost_v1")

if __name__ == "__main__":
    asyncio.run(main())
