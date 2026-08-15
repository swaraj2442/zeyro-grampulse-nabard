"""LangGraph-like Risk Agent Orchestration gRPC server."""

import asyncio
from concurrent import futures
import json
import os
import sys
from typing import List, Dict, Any
import grpc
import psycopg
from anthropic import AsyncAnthropic

# Add path to include proto files and python modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

from proto.py import assessment_pb2
from proto.py import assessment_pb2_grpc
from proto.py import scoring_pb2
from proto.py import scoring_pb2_grpc

# Shared routing rule — same function used by the scoring gRPC server

from scoring.server import _determine_overall_signal

SYSTEM_PROMPT = """You are a credit analyst writing a risk summary for a regulated Indian lending institution.
Write exactly 3 sentences.
Rules:
- Use ONLY the structured data provided. Do not invent details.
- No names, no PII. Neutral, professional tone.
- Do not say approve or decline — only describe the risk profile.
- If thin_file is true or confidence is LOW: note data limitations clearly.
- If stacking or fraud signals exist: describe the specific anomaly observed."""

class AssessmentServicer(assessment_pb2_grpc.AssessmentServiceServicer):
    
    def __init__(self, db_url: str, scoring_addr: str, anthropic_key: str):
        self.db_url = db_url
        self.scoring_addr = scoring_addr
        self.anthropic_key = anthropic_key
        
        if anthropic_key:
            self.anthropic_client = AsyncAnthropic(api_key=anthropic_key)
        else:
            self.anthropic_client = None

    async def _call_scoring_service(self, user_ref_hash: str, partner_id: str, products: List[str]) -> scoring_pb2.ScoreResponse:
        """Call the scoring service gRPC server to fetch BFS, RPS, ATP and Fraud metrics."""
        print(f"Calling scoring gRPC server at {self.scoring_addr}...")
        async with grpc.aio.insecure_channel(self.scoring_addr) as channel:
            stub = scoring_pb2_grpc.ScoringServiceStub(channel)
            request = scoring_pb2.ScoreRequest(
                partner_id=partner_id,
                user_ref_hash=user_ref_hash,
                products=products,
                score_version="scorecard_v1"
            )
            return await stub.GetScores(request)

    async def _generate_narrative(self, score_data: Dict[str, Any]) -> str:
        """Generate risk narrative using Claude, fallback to static template if API key is missing or fails."""
        if not self.anthropic_client:
            return self._static_fallback_narrative(score_data)
            
        try:
            print("Requesting Claude async narrative generation...")
            # Structure summary payload for Claude
            prompt_content = json.dumps(score_data, indent=2)
            
            message = await self.anthropic_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=300,
                temperature=0.0,
                system=SYSTEM_PROMPT,
                messages=[
                    {"role": "user", "content": prompt_content}
                ]
            )
            return message.content[0].text.strip()
        except Exception as e:
            print(f"Failed to generate narrative from Claude: {e}. Falling back.")
            return self._static_fallback_narrative(score_data)

    def _static_fallback_narrative(self, data: Dict[str, Any]) -> str:
        """Fallback rule-based text summary."""
        bfs_val = data.get("bfs_score", 600)
        bfs_band = data.get("bfs_band", "FAIR")
        confidence = data.get("confidence", "HIGH")
        fraud_risk = data.get("fraud_risk", "CLEAR")
        adverse_reasons = data.get("bfs_adverse_reasons", [])
        
        sentences = [
            f"The applicant presents a Behavioral Finance Score of {bfs_val}, placing them in the {bfs_band} risk band with {confidence} confidence."
        ]

        if fraud_risk != "CLEAR":
            sentences.append(f"Anomalies detected: elevated fraud risk label '{fraud_risk}' due to suspicious network activity or stacking.")
        else:
            sentences.append(f"Fraud risk indicators are clear.")

        if data.get("thin_file") or confidence == "LOW":
            sentences.append("Data coverage limitations exist due to a thin file or short transaction history.")
        elif adverse_reasons:
            reasons_str = ", ".join([r["description"].lower() for r in adverse_reasons[:2]])
            sentences.append(f"Risk factors noted include {reasons_str}.")
        else:
            sentences.append("Cash flows and income patterns suggest high repayment stability.")
            
        return " ".join(sentences)

    async def CreateAssessment(self, request: assessment_pb2.AssessmentRequest, context) -> assessment_pb2.AssessmentStatusResponse:
        a_id = request.assessment_id
        partner_id = request.partner_id
        user_hash = request.user_ref_hash
        products = list(request.products)
        consent_id = request.consent_id
        
        print(f"CreateAssessment: id={a_id}, partner={partner_id}, user={user_hash}, products={products}")
        
        # Parallel forks:
        # In a real LangGraph setup, we'd run structured state checks.
        # Here we fetch the scoring results in parallel/sequential call.
        try:
            # 1. Fetch scores from python/scoring gRPC
            score_resp = await self._call_scoring_service(user_hash, partner_id, products)
            
            # Map score response back to a dictionary for analysis and narrative
            score_map = {}
            bfs_obj = None
            rps_obj = None
            atp_obj = None
            fraud_obj = None
            
            for res in score_resp.results:
                prod = res.product
                score_map[prod] = {
                    "label": res.label,
                    "value": res.value,
                    "factors": [{"code": f.code, "desc": f.description, "impact": f.impact} for f in res.factors]
                }
                if prod == "bfs":
                    bfs_obj = res
                elif prod == "rps":
                    rps_obj = res
                elif prod == "atp":
                    atp_obj = res
                elif prod == "fraud":
                    fraud_obj = res
            
            # Extract key properties
            bfs_score = bfs_obj.value if bfs_obj else 600.0
            bfs_band = bfs_obj.label if bfs_obj else "FAIR"
            fraud_label = fraud_obj.label if fraud_obj else "CLEAR"
            
            thin_file = False
            bfs_factors = []
            if bfs_obj:
                for f in bfs_obj.factors:
                    bfs_factors.append({"code": f.code, "description": f.description})
                    if f.code == "AA10":
                        thin_file = True
            
            # Extract confidence (since the gRPC ScoreResult carries it or we infer it)
            # Default to "HIGH", but if thin_file is True, it's "LOW"
            confidence = "LOW" if thin_file else "HIGH"

            # 2. Assemble structured synthesis data
            synthesis_data = {
                "bfs_score": int(bfs_score),
                "bfs_band": bfs_band,
                "confidence": confidence,
                "thin_file": thin_file,
                "bfs_adverse_reasons": bfs_factors,
                "fraud_risk": fraud_label,
                "loan_stacking": any(f.code == "LOAN_STACKING" for f in (fraud_obj.factors if fraud_obj else [])),
                "monthly_surplus_inr": next((f.impact for f in (atp_obj.factors if atp_obj else []) if f.code == "MONTHLY_SURPLUS"), 0.0),
                "ratio_at_requested_emi": next((f.impact for f in (atp_obj.factors if atp_obj else []) if f.code == "RATIO_AT_EMI"), 0.0),
            }
            
            # 3. Generate narrative
            risk_narrative = await self._generate_narrative(synthesis_data)
            
            # 4. Determine overall signal (canonical logic shared with scoring server)
            # thin_file is signalled by AA10 adverse action code or LOW confidence from BFS
            thin_file = any(
                f.code == "AA10"
                for f in (bfs_obj.factors if bfs_obj else [])
            )
            confidence = "HIGH"  # default; AA10 presence implies LOW
            if thin_file:
                confidence = "LOW"

            overall_signal = _determine_overall_signal(
                bfs_label=bfs_band,
                fraud_label=fraud_label,
                confidence=confidence,
                thin_file=thin_file,
                bfs_score=int(bfs_score),
            )
                
            # Build full JSON report response
            report_response = {
                "assessment_id": a_id,
                "status": "COMPLETE",
                "overall_signal": overall_signal,
                "score_version": "scorecard_v1",
                "risk_narrative": risk_narrative,
                "bfs": {
                    "score": int(bfs_score),
                    "band": bfs_band,
                    "factors": [{"code": f.code, "description": f.description} for f in (bfs_obj.factors if bfs_obj else [])]
                } if bfs_obj else None,
                "rps": {
                    "probability": rps_obj.value,
                    "label": rps_obj.label,
                    "default_window": next((int(f.impact) for f in rps_obj.factors if f.code == "DEFAULT_WINDOW"), None) if rps_obj else None
                } if rps_obj else None,
                "atp": {
                    "max_recommended_emi": atp_obj.value,
                    "monthly_surplus": next((f.impact for f in atp_obj.factors if f.code == "MONTHLY_SURPLUS"), 0.0) if atp_obj else 0.0,
                    "ratio": next((f.impact for f in atp_obj.factors if f.code == "RATIO_AT_EMI"), 0.0) if atp_obj else 0.0,
                } if atp_obj else None,
                "fraud": {
                    "risk_label": fraud_label,
                    "score": fraud_obj.value,
                    "signals": [{"type": f.code, "description": f.description} for f in (fraud_obj.factors if fraud_obj else [])]
                } if fraud_obj else None
            }
            
            # 5. Persist the report details back into Postgres
            print(f"Persisting assessment report for ID: {a_id}")
            async with await psycopg.AsyncConnection.connect(self.db_url) as aconn:
                async with aconn.cursor() as cur:
                    await cur.execute(
                        """
                        UPDATE assessments
                        SET status = 'COMPLETE',
                            overall_signal = %s,
                            response_json = %s,
                            completed_at = NOW()
                        WHERE id = %s
                        """,
                        (overall_signal, json.dumps(report_response), a_id)
                    )
            
            return assessment_pb2.AssessmentStatusResponse(
                assessment_id=a_id,
                status="COMPLETE",
                overall_signal=overall_signal,
                score_version="scorecard_v1"
            )
            
        except Exception as e:
            print(f"Error executing assessment: {e}")
            # Mark assessment as FAILED in DB
            try:
                async with await psycopg.AsyncConnection.connect(self.db_url) as aconn:
                    async with aconn.cursor() as cur:
                        await cur.execute(
                            "UPDATE assessments SET status = 'FAILED', completed_at = NOW() WHERE id = %s",
                            (a_id,)
                        )
            except Exception as dbe:
                print(f"Failed to record failure state: {dbe}")
                
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Internal assessment failure: {e}")
            return assessment_pb2.AssessmentStatusResponse(
                assessment_id=a_id,
                status="FAILED",
                overall_signal="DECLINE",
                score_version="scorecard_v1"
            )

    async def GetAssessmentStatus(self, request: assessment_pb2.AssessmentStatusRequest, context) -> assessment_pb2.AssessmentStatusResponse:
        a_id = request.assessment_id
        print(f"GetAssessmentStatus request: {a_id}")
        
        try:
            async with await psycopg.AsyncConnection.connect(self.db_url) as aconn:
                async with aconn.cursor() as cur:
                    await cur.execute(
                        "SELECT status, overall_signal, score_version FROM assessments WHERE id = %s",
                        (a_id,)
                    )
                    row = await cur.fetchone()
                    if not row:
                        context.set_code(grpc.StatusCode.NOT_FOUND)
                        context.set_details(f"Assessment {a_id} not found")
                        return assessment_pb2.AssessmentStatusResponse()
                        
                    status, signal, ver = row
                    return assessment_pb2.AssessmentStatusResponse(
                        assessment_id=a_id,
                        status=status,
                        overall_signal=signal or "REVIEW",
                        score_version=ver or "scorecard_v1"
                    )
        except Exception as e:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Database query error: {e}")
            return assessment_pb2.AssessmentStatusResponse()

async def serve() -> None:
    db_url = os.environ.get("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/zeyro")
    scoring_addr = os.environ.get("SCORING_ADDR", "localhost:8013")
    anthropic_key = os.environ.get("ANTHROPIC_API_KEY", "")
    port = os.environ.get("ORCHESTRATOR_PORT", "8012")
    
    server = grpc.aio.server()
    assessment_pb2_grpc.add_AssessmentServiceServicer_to_server(
        AssessmentServicer(db_url, scoring_addr, anthropic_key), 
        server
    )
    
    listen_addr = f"[::]:{port}"
    server.add_insecure_port(listen_addr)
    print(f"Agent Orchestrator gRPC service listening on {listen_addr}")
    
    await server.start()
    await server.wait_for_termination()

if __name__ == "__main__":
    asyncio.run(serve())
