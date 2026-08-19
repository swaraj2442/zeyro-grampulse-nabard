"""Interventions router — SQLite-backed CRUD.

GET    /api/v1/interventions                   ?status enterprise_id officer
POST   /api/v1/interventions
GET    /api/v1/interventions/{id}
PATCH  /api/v1/interventions/{id}/status
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from api.data.db import get_conn

router = APIRouter(prefix="/api/v1/interventions", tags=["interventions"])


def _now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _append_timeline(conn, enterprise_id: str, title: str, description: str):
    conn.execute(
        "INSERT INTO timeline_events (id, enterprise_id, date, title, description) VALUES (?,?,?,?,?)",
        (f"EV-{uuid.uuid4().hex[:9]}", enterprise_id, _now(), title, description),
    )


class InterventionCreate(BaseModel):
    enterpriseId: str
    recommendedIntervention: str
    illustrativeAmount: Optional[float] = None
    assignedOfficer: str
    visitDate: Optional[str] = None
    followUpDate: Optional[str] = None
    notes: str = ""


class StatusUpdate(BaseModel):
    status: str


@router.get("")
def list_interventions(
    status: Optional[str] = None,
    enterprise_id: Optional[str] = None,
    officer: Optional[str] = None,
):
    conn = get_conn()
    query = "SELECT * FROM interventions WHERE 1=1"
    params: list = []
    if status:
        query += " AND status = ?"
        params.append(status)
    if enterprise_id:
        query += " AND enterprise_id = ?"
        params.append(enterprise_id)
    if officer:
        query += " AND assigned_officer = ?"
        params.append(officer)
    query += " ORDER BY created_at DESC"
    rows = conn.execute(query, params).fetchall()
    return [dict(r) for r in rows]


@router.post("")
def create_intervention(body: InterventionCreate):
    conn = get_conn()
    intervention_id = f"INT-{uuid.uuid4().hex[:9]}"
    now = _now()
    conn.execute(
        """INSERT INTO interventions
           (id, enterprise_id, recommended_intervention, illustrative_amount,
            assigned_officer, visit_date, follow_up_date, notes, status, created_at)
           VALUES (?,?,?,?,?,?,?,?,'Pending',?)""",
        (intervention_id, body.enterpriseId, body.recommendedIntervention,
         body.illustrativeAmount, body.assignedOfficer,
         body.visitDate, body.followUpDate, body.notes, now),
    )
    _append_timeline(
        conn, body.enterpriseId,
        "Intervention case created",
        f"{body.recommendedIntervention} · Assigned to {body.assignedOfficer}",
    )
    conn.commit()
    return {"id": intervention_id, "enterpriseId": body.enterpriseId, "status": "Pending", "createdAt": now}


@router.get("/{intervention_id}")
def get_intervention(intervention_id: str):
    conn = get_conn()
    row = conn.execute("SELECT * FROM interventions WHERE id = ?", (intervention_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Intervention not found")
    return dict(row)


@router.patch("/{intervention_id}/status")
def update_status(intervention_id: str, body: StatusUpdate):
    valid = {"Pending", "Active", "Closed", "Resolved"}
    if body.status not in valid:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid}")
    conn = get_conn()
    row = conn.execute("SELECT * FROM interventions WHERE id = ?", (intervention_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Intervention not found")
    conn.execute("UPDATE interventions SET status = ? WHERE id = ?", (body.status, intervention_id))
    _append_timeline(
        conn, row["enterprise_id"],
        f"Intervention status updated to {body.status}",
        f"Case {intervention_id}",
    )
    conn.commit()
    return {"id": intervention_id, "status": body.status}
