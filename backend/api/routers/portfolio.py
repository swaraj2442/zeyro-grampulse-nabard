"""Portfolio aggregates router.

GET /api/v1/portfolio/summary
GET /api/v1/portfolio/risk-distribution
GET /api/v1/portfolio/top-risk
GET /api/v1/portfolio/cluster-alerts
GET /api/v1/portfolio/forecast-exposure
GET /api/v1/portfolio/districts
"""
from __future__ import annotations

from fastapi import APIRouter

from api.data.synthetic_store import store
from api.data.db import get_conn

router = APIRouter(prefix="/api/v1/portfolio", tags=["portfolio"])


def _risk_overrides() -> dict:
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


@router.get("/summary")
def portfolio_summary():
    overrides = _risk_overrides()
    stats = store.get_portfolio_stats(risk_overrides=overrides)

    # Merge live intervention count from SQLite
    conn = get_conn()
    active_cases = conn.execute(
        "SELECT COUNT(*) as n FROM interventions WHERE status IN ('Pending', 'Active')"
    ).fetchone()
    if active_cases:
        stats["activeInterventions"] = active_cases["n"]
    return stats


@router.get("/risk-distribution")
def risk_distribution():
    overrides = _risk_overrides()
    result = store.get_enterprises(limit=9999, risk_overrides=overrides)
    enterprises = result.get("enterprises", [])

    by_sector: dict[str, dict[str, int]] = {}
    by_district: dict[str, dict[str, int]] = {}

    for e in enterprises:
        sector = e.get("sector", "Other")
        district = e.get("district", "Unknown")
        rl = e.get("riskLevel", "Low")

        if sector not in by_sector:
            by_sector[sector] = {}
        by_sector[sector][rl] = by_sector[sector].get(rl, 0) + 1

        if district not in by_district:
            by_district[district] = {}
        by_district[district][rl] = by_district[district].get(rl, 0) + 1

    return {"bySector": by_sector, "byDistrict": by_district}


@router.get("/top-risk")
def top_risk(n: int = 10):
    overrides = _risk_overrides()
    enterprises = store.get_top_risk(n=n, risk_overrides=overrides)
    return {"enterprises": enterprises}


@router.get("/cluster-alerts")
def cluster_alerts():
    alerts = store.get_cluster_alerts()
    return {"clusterAlerts": alerts}


@router.get("/forecast-exposure")
def forecast_exposure():
    overrides = _risk_overrides()
    total_deficit = sum(
        v.get("forecastDeficit", 0) for v in overrides.values()
        if v.get("riskLevel") in ("High", "Critical")
    )
    high_count = sum(1 for v in overrides.values() if v.get("riskLevel") in ("High", "Critical"))
    return {
        "totalForecastDeficit": round(total_deficit, 2),
        "enterprisesAtRisk": high_count,
        "averageDeficit": round(total_deficit / max(high_count, 1), 2),
    }


@router.get("/districts")
def district_health():
    overrides = _risk_overrides()
    all_ents = store.get_enterprises(limit=9999, risk_overrides=overrides)
    enterprises = all_ents.get("enterprises", [])

    district_map: dict[str, dict] = {}
    for e in enterprises:
        d = e.get("district", "Unknown")
        if d not in district_map:
            district_map[d] = {"district": d, "total": 0, "high": 0, "critical": 0, "healthy": 0}
        district_map[d]["total"] += 1
        rl = e.get("riskLevel", "Low")
        if rl in ("High", "Critical"):
            district_map[d]["high"] += 1
        if rl == "Critical":
            district_map[d]["critical"] += 1
        if rl in ("Very Low", "Low"):
            district_map[d]["healthy"] += 1

    return {"districts": list(district_map.values())}
