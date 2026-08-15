import asyncio
import hashlib
import json
import os
import sys
import uuid
import grpc
import psycopg

# Include project paths
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

from proto.py import assessment_pb2
from proto.py import assessment_pb2_grpc

# Default configuration matching the services
DB_URL = os.environ.get("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/zeyro")
ORCHESTRATOR_ADDR = "localhost:8012"
SEED_PARTNER_ID = "00000000-0000-0000-0000-000000000001"

# Hashed mobile number for Rahul (Approve path)
RAHUL_PHONE = "+919876543210"
RAHUL_HASH = hashlib.sha256(RAHUL_PHONE.encode("utf-8")).hexdigest()

async def insert_dummy_assessment(a_id: str) -> None:
    """Pre-insert a dummy PENDING assessment into the database to satisfy the UPDATE logic."""
    print(f"Connecting to database to insert assessment: {a_id}")
    async with await psycopg.AsyncConnection.connect(DB_URL) as aconn:
        async with aconn.cursor() as cur:
            # Check if seed partner exists, if not insert it
            await cur.execute("SELECT id FROM partners WHERE id = %s", (SEED_PARTNER_ID,))
            if not await cur.fetchone():
                print("Inserting seed partner...")
                await cur.execute(
                    "INSERT INTO partners (id, partner_code, display_name) VALUES (%s, 'test_partner', 'Test Partner')",
                    (SEED_PARTNER_ID,)
                )

            # Insert PENDING assessment
            await cur.execute(
                """
                INSERT INTO assessments (id, partner_id, user_ref_hash, status, requested_products)
                VALUES (%s, %s, %s, 'PENDING', %s)
                """,
                (a_id, SEED_PARTNER_ID, RAHUL_HASH, ["bfs", "rps", "atp", "fraud"])
            )
    print("Dummy assessment row inserted successfully.")

async def trigger_assessment(a_id: str) -> None:
    """Send gRPC AssessmentRequest to the orchestrator service on port 8012."""
    print(f"Triggering gRPC CreateAssessment call to {ORCHESTRATOR_ADDR}...")
    async with grpc.aio.insecure_channel(ORCHESTRATOR_ADDR) as channel:
        stub = assessment_pb2_grpc.AssessmentServiceStub(channel)
        
        request = assessment_pb2.AssessmentRequest(
            assessment_id=a_id,
            partner_id=SEED_PARTNER_ID,
            user_ref_hash=RAHUL_HASH,
            products=["bfs", "rps", "atp", "fraud"],
            consent_id="",
            partner_ref_id="ref_" + a_id[:8]
        )
        
        response = await stub.CreateAssessment(request)
        print(f"\n--- gRPC Assessment Response ---")
        print(f"Assessment ID: {response.assessment_id}")
        print(f"Status:        {response.status}")
        print(f"Signal:        {response.overall_signal}")
        print(f"Score Version: {response.score_version}")

async def main():
    a_id = str(uuid.uuid4())
    try:
        await insert_dummy_assessment(a_id)
        await trigger_assessment(a_id)
    except Exception as e:
        print(f"Error executing test: {e}")

if __name__ == "__main__":
    asyncio.run(main())
