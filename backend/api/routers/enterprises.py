"""Enterprise router — all per-enterprise API endpoints.

POST /api/v1/enterprises/{id}/records
    → Saves to SQLite, refreshes forecast, recalculates risk,
      creates/updates alert, appends timeline event.

GET  /api/v1/enterprises             ?sector district risk_level search limit offset sort_by sort_order
GET  /api/v1/enterprises/{id}
GET  /api/v1/enterprises/{id}/history
GET  /api/v1/enterprises/{id}/forecast
GET  /api/v1/enterprises/{id}/early-warning
GET  /api/v1/enterprises/{id}/alerts
GET  /api/v1/enterprises/{id}/interventions
GET  /api/v1/enterprises/{id}/timeline
"""
from __future__ import annotations

import hashlib
import json
import uuid
from datetime import datetime, timezone
from typing import Optional

import pandas as pd
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from api.data.db import get_conn
from api.data.synthetic_store import store

router = APIRouter(prefix="/api/v1/enterprises", tags=["enterprises"])

DEMO_FIXTURE_ID = "RE-00001"
_DEMO_FIXTURE: dict | None = None


def _load_demo_fixture() -> dict:
    global _DEMO_FIXTURE
    if _DEMO_FIXTURE is None:
        import json, pathlib
        p = pathlib.Path(__file__).parent.parent / "data" / "demo_enterprises" / "shakti_poultry.json"
        _DEMO_FIXTURE = json.loads(p.read_text())
    return _DEMO_FIXTURE


def _now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _risk_overrides() -> dict:
    """Pull latest risk assessments from SQLite for all enterprises."""
    conn = get_conn()
    rows = conn.execute(
        "SELECT enterprise_id, risk_score, risk_level, forecast_deficit, warning_lead_time_days FROM risk_assessments"
    ).fetchall()
    return {
        r["enterprise_id"]: {
            "riskScore": r["risk_score"],
            "riskLevel": r["risk_level"],
            "forecastDeficit": r["forecast_deficit"],
            "warningLeadTimeDays": r["warning_lead_time_days"],
        }
        for r in rows
    }


# ─────────────────────────────────────────────────────────────
# Enterprise list
# ─────────────────────────────────────────────────────────────

@router.get("")
def list_enterprises(
    sector: Optional[str] = None,
    district: Optional[str] = None,
    risk_level: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = Query("id", enum=["id", "risk_score", "district", "sector"]),
    sort_order: str = Query("asc", enum=["asc", "desc"]),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    overrides = _risk_overrides()
    return store.get_enterprises(
        sector=sector, district=district, risk_level=risk_level,
        search=search, sort_by=sort_by, sort_order=sort_order,
        limit=limit, offset=offset, risk_overrides=overrides,
    )


# ─────────────────────────────────────────────────────────────
# Single enterprise profile
# ─────────────────────────────────────────────────────────────

@router.get("/{enterprise_id}")
def get_enterprise(enterprise_id: str):
    if enterprise_id == DEMO_FIXTURE_ID:
        fx = _load_demo_fixture()
        # Only return identity + raw inputs (no pinned model outputs)
        profile = {k: v for k, v in fx.items()}
        profile["id"] = fx["enterpriseId"]
        overrides = _risk_overrides()
        if enterprise_id in overrides:
            profile.update(overrides[enterprise_id])
        else:
            # Trigger live inference to seed risk_assessments, then return status
            profile["riskLevel"] = "Pending"
            profile["riskScore"] = None
            profile["riskStatus"] = "scoring"
        return profile

    ent = store.get_enterprise(enterprise_id)
    if not ent:
        raise HTTPException(status_code=404, detail=f"Enterprise {enterprise_id} not found")
    overrides = _risk_overrides()
    if enterprise_id in overrides:
        ent.update(overrides[enterprise_id])
    return {**ent, "id": ent.get("entity_id", enterprise_id)}


# ─────────────────────────────────────────────────────────────
# Financial history (baseline + submitted records merged)
# ─────────────────────────────────────────────────────────────

@router.get("/{enterprise_id}/history")
def get_history(enterprise_id: str, months: int = Query(24, ge=1, le=60)):
    baseline = store.get_history(enterprise_id, months=months)

    conn = get_conn()
    new_rows = conn.execute(
        "SELECT * FROM financial_records WHERE enterprise_id = ? ORDER BY month ASC",
        (enterprise_id,),
    ).fetchall()
    submitted = [dict(r) for r in new_rows]

    # Merge: submitted records override baseline by month
    baseline_by_month = {r.get("date", r.get("month", "")): r for r in baseline}
    for s in submitted:
        baseline_by_month[s["month"]] = {
            **baseline_by_month.get(s["month"], {}),
            "operating_inflow": s["operating_inflow"],
            "operating_outflow": s["operating_outflow"],
            "closing_cash_balance": (s.get("operating_inflow", 0) or 0) - (s.get("operating_outflow", 0) or 0),
        }
    merged = sorted(baseline_by_month.values(), key=lambda r: r.get("date", r.get("month", "")))
    return {"enterpriseId": enterprise_id, "history": merged[-months:]}


# ─────────────────────────────────────────────────────────────
# Financial record submission
# ─────────────────────────────────────────────────────────────

class FinancialRecordInput(BaseModel):
    enterpriseId: str
    month: str
    operatingInflow: float
    operatingOutflow: float
    savings: float = 0.0
    loanRepayment: float = 0.0
    inventoryCost: float = 0.0


@router.post("/{enterprise_id}/records")
def submit_record(enterprise_id: str, body: FinancialRecordInput):
    if body.enterpriseId != enterprise_id:
        raise HTTPException(status_code=400, detail="enterpriseId mismatch")

    conn = get_conn()
    record_id = f"FR-{uuid.uuid4().hex[:9]}"
    now = _now()

    conn.execute(
        """INSERT OR REPLACE INTO financial_records
           (id, enterprise_id, month, operating_inflow, operating_outflow,
            savings, loan_repayment, inventory_cost, recorded_at, sync_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced')""",
        (record_id, enterprise_id, body.month, body.operatingInflow,
         body.operatingOutflow, body.savings, body.loanRepayment,
         body.inventoryCost, now),
    )
    conn.commit()

    # Attempt live forecast refresh
    forecast_refreshed = False
    previous_risk = None
    new_risk = None
    alert_created = False
    alert_id = None

    try:
        from api.inference_api import predict_enterprise_cashflow, build_early_warning
        history_rows = store.get_all_history(enterprise_id)
        if history_rows:
            history_df = pd.DataFrame(history_rows)
            future_rows = history_df.tail(6).copy()
            forecast_result = predict_enterprise_cashflow(history_df, future_rows)

            # Fetch previous risk
            prev = conn.execute(
                "SELECT risk_level FROM risk_assessments WHERE enterprise_id = ?",
                (enterprise_id,)
            ).fetchone()
            previous_risk = prev["risk_level"] if prev else None

            ew = forecast_result.get("early_warning", {})
            new_risk = ew.get("risk_level", "Low")
            risk_score = ew.get("risk_score", 0)

            # Update risk assessment
            conn.execute(
                """INSERT OR REPLACE INTO risk_assessments
                   (enterprise_id, risk_score, risk_level, forecast_deficit,
                    debt_service_shortfall, stress_month, warning_lead_time_days,
                    drivers_json, assessed_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (enterprise_id, risk_score, new_risk,
                 ew.get("forecast_deficit", 0), ew.get("debt_service_shortfall", 0),
                 ew.get("stress_month", ""), ew.get("warning_lead_time_days", 0),
                 json.dumps(ew.get("drivers", [])), now),
            )

            # Create alert if risk changed or is High/Critical
            if new_risk in ("High", "Critical") and new_risk != previous_risk:
                alert_id = f"ALT-{uuid.uuid4().hex[:9]}"
                conn.execute(
                    """INSERT INTO alerts (id, enterprise_id, risk_level, title, description, created_at, status)
                       VALUES (?, ?, ?, ?, ?, ?, 'Active')""",
                    (alert_id, enterprise_id, new_risk,
                     f"{new_risk} Risk — {enterprise_id}",
                     f"Forecast deficit of ₹{ew.get('forecast_deficit', 0):,.0f} detected.",
                     now),
                )
                alert_created = True

            # Cache forecast
            record_hash = hashlib.md5(f"{enterprise_id}{body.month}{now}".encode()).hexdigest()
            conn.execute(
                """INSERT OR REPLACE INTO forecast_cache
                   (enterprise_id, record_hash, model_version, forecast_json, generated_at)
                   VALUES (?, ?, ?, ?, ?)""",
                (enterprise_id, record_hash, "grampulse-cf-v1.1",
                 json.dumps(forecast_result), now),
            )
            forecast_refreshed = True
            conn.commit()
            store.invalidate_portfolio_cache()
    except Exception:
        pass  # Forecast failure does not block record persistence

    # Append timeline event
    _append_timeline(conn, enterprise_id, now,
                     f"Financial record submitted for {body.month}",
                     f"Income ₹{body.operatingInflow:,.0f} · Expenses ₹{body.operatingOutflow:,.0f}")
    if forecast_refreshed and new_risk and new_risk != previous_risk:
        _append_timeline(conn, enterprise_id, now,
                         f"Risk level updated: {previous_risk or 'Unknown'} → {new_risk}",
                         "Forecast recalculated after new record submission.")
    conn.commit()

    return {
        "id": record_id,
        "enterpriseId": enterprise_id,
        "recordedAt": now,
        "syncStatus": "synced",
        "forecastRefreshed": forecast_refreshed,
        "riskChanged": new_risk != previous_risk if previous_risk else False,
        "previousRiskLevel": previous_risk,
        "newRiskLevel": new_risk,
        "alertCreated": alert_created,
        "alertId": alert_id,
    }


def _append_timeline(conn, enterprise_id: str, date: str, title: str, description: str):
    conn.execute(
        "INSERT INTO timeline_events (id, enterprise_id, date, title, description) VALUES (?, ?, ?, ?, ?)",
        (f"EV-{uuid.uuid4().hex[:9]}", enterprise_id, date, title, description),
    )


# ─────────────────────────────────────────────────────────────
# Forecast
# ─────────────────────────────────────────────────────────────

@router.get("/{enterprise_id}/forecast")
def get_forecast(enterprise_id: str):
    # 1. Check SQLite cache first (populated after record submission or batch score)
    cached = _get_cached_forecast(enterprise_id)
    if cached:
        return cached

    # 2. Live inference (works for any enterprise)
    return _run_live_forecast(enterprise_id)


def _get_cached_forecast(enterprise_id: str) -> dict | None:
    conn = get_conn()
    row = conn.execute(
        "SELECT forecast_json FROM forecast_cache WHERE enterprise_id = ? ORDER BY generated_at DESC LIMIT 1",
        (enterprise_id,),
    ).fetchone()
    if row:
        return json.loads(row["forecast_json"])
    return None


def _run_live_forecast(enterprise_id: str) -> dict:
    try:
        from api.inference_api import predict_enterprise_cashflow
        history_rows = store.get_all_history(enterprise_id)
        if not history_rows:
            raise HTTPException(status_code=404, detail="No history data for this enterprise")
        history_df = pd.DataFrame(history_rows)
        future_rows = history_df.tail(6).copy()
        result = predict_enterprise_cashflow(history_df, future_rows)
        # Normalise to frontend camelCase shape
        return _normalise_forecast(enterprise_id, result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Forecast unavailable: {e}")


def _normalise_forecast(enterprise_id: str, raw: dict) -> dict:
    """Convert snake_case API output to the camelCase frontend contract."""
    months = []
    for i, m in enumerate(raw.get("forecast", [])):
        months.append({
            "month": m.get("month", ""),
            "horizon": i + 1,
            "operatingInflow": round(m.get("operating_inflow", 0), 2),
            "operatingOutflow": round(m.get("operating_outflow", 0), 2),
            "closingCashBalance": round(m.get("closing_cash_balance", 0), 2),
            "cashAfterDebtService": round(m.get("cash_after_debt_service", 0), 2),
            "lower": round(m.get("lower", m.get("closing_cash_balance", 0)) * 0.85, 2),
            "upper": round(m.get("upper", m.get("closing_cash_balance", 0)) * 1.15, 2),
        })
    return {
        "enterpriseId": enterprise_id,
        "modelVersion": raw.get("model_version", "grampulse-cf-v1.1"),
        "forecastGeneratedAt": _now(),
        "forecast": months,
    }


# ─────────────────────────────────────────────────────────────
# Early warning
# ─────────────────────────────────────────────────────────────

@router.get("/{enterprise_id}/early-warning")
def get_early_warning(enterprise_id: str):
    conn = get_conn()
    row = conn.execute(
        "SELECT * FROM risk_assessments WHERE enterprise_id = ? ORDER BY assessed_at DESC LIMIT 1",
        (enterprise_id,)
    ).fetchone()
    if row:
        return _risk_row_to_response(row)

    # No cached score — trigger live forecast + risk calculation, store result
    try:
        forecast_result = _run_live_forecast(enterprise_id)
        # After _run_live_forecast the record submission path writes risk_assessments
        # Re-query after inference
        row2 = conn.execute(
            "SELECT * FROM risk_assessments WHERE enterprise_id = ? ORDER BY assessed_at DESC LIMIT 1",
            (enterprise_id,)
        ).fetchone()
        if row2:
            return _risk_row_to_response(row2)
        raise HTTPException(
            status_code=503,
            detail={
                "forecastStatus": "unavailable",
                "reason": "Model inference completed but risk score not written",
                "lastSuccessfulForecast": None,
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={
                "forecastStatus": "unavailable",
                "reason": str(e),
                "lastSuccessfulForecast": None,
            }
        )


def _risk_row_to_response(row) -> dict:
    return {
        "enterpriseId": row["enterprise_id"],
        "riskScore": row["risk_score"],
        "riskLevel": row["risk_level"],
        "forecastDeficit": row["forecast_deficit"],
        "debtServiceShortfall": row["debt_service_shortfall"],
        "stressMonth": row["stress_month"],
        "warningLeadTimeDays": row["warning_lead_time_days"],
        "drivers": json.loads(row["drivers_json"] or "[]"),
    }


# ─────────────────────────────────────────────────────────────
# Alerts
# ─────────────────────────────────────────────────────────────

@router.get("/{enterprise_id}/alerts")
def get_alerts(enterprise_id: str):
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM alerts WHERE enterprise_id = ? ORDER BY created_at DESC",
        (enterprise_id,),
    ).fetchall()
    return [dict(r) for r in rows]


# ─────────────────────────────────────────────────────────────
# Interventions
# ─────────────────────────────────────────────────────────────

@router.get("/{enterprise_id}/interventions")
def get_enterprise_interventions(enterprise_id: str):
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM interventions WHERE enterprise_id = ? ORDER BY created_at DESC",
        (enterprise_id,),
    ).fetchall()
    return [dict(r) for r in rows]


# ─────────────────────────────────────────────────────────────
# Timeline
# ─────────────────────────────────────────────────────────────

@router.get("/{enterprise_id}/timeline")
def get_timeline(enterprise_id: str):
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM timeline_events WHERE enterprise_id = ? ORDER BY date DESC",
        (enterprise_id,),
    ).fetchall()
    events = [dict(r) for r in rows]

    # Seed demo enterprise with initial timeline if empty
    if not events and enterprise_id == DEMO_FIXTURE_ID:
        events = [
            {"id": "EV-demo-001", "enterpriseId": enterprise_id,
             "date": "2026-08-04T09:00:00Z", "title": "Forecast recalculated",
             "description": "Risk level: High. ₹38,400 deficit forecast for October 2026."},
            {"id": "EV-demo-002", "enterpriseId": enterprise_id,
             "date": "2026-08-02T08:00:00Z", "title": "Monthly financial records submitted",
             "description": "Operating inflow ₹1,42,000 · Expenses ₹1,31,500"},
            {"id": "EV-demo-003", "enterpriseId": enterprise_id,
             "date": "2026-07-15T10:00:00Z", "title": "Field visit completed",
             "description": "Officer noted increased feed cost. No payment delays observed."},
        ]
    return {"enterpriseId": enterprise_id, "events": events}
