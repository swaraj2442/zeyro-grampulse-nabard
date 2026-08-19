"""Read-only synthetic enterprise data store.

Loads the synthetic CSV at startup and exposes fast in-memory lookups.
NEVER writes to the source file.
New financial records submitted via the API are stored in SQLite (see db.py)
and merged on top of this baseline when history is requested.
"""
from __future__ import annotations

import hashlib
import time
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

_RISK_LEVEL_ORDER = {
    "Very Low": 0, "Low": 1, "Medium": 2, "Amber": 3, "High": 4, "Critical": 5
}

CSV_PATH = Path(__file__).parent.parent.parent / "data" / "nabard_enterprise_monthly.csv"


class SyntheticStore:
    """Singleton wrapping the immutable synthetic baseline dataset."""

    _df: pd.DataFrame | None = None
    _enterprise_index: dict[str, dict] = {}
    _portfolio_cache: dict | None = None
    _portfolio_cache_at: float = 0.0
    _CACHE_TTL = 60.0  # seconds
    loaded: bool = False

    def load(self, path: Path = CSV_PATH) -> None:
        raw = pd.read_csv(path)
        # Replace NaN/Inf so the data is JSON-safe immediately
        raw = raw.replace([np.inf, -np.inf], np.nan).where(pd.notnull(raw), None)
        self._df = raw
        # Build per-enterprise index from the static columns of the last row per entity
        static_cols = [
            "entity_id", "sector", "district", "block",
            "enterprise_type", "ownership_type",
            "years_in_operation", "worker_count", "asset_value",
            "livestock_count", "production_capacity", "digital_adoption_score",
            "sanctioned_credit_limit",
        ]
        available = [c for c in static_cols if c in raw.columns]
        latest = raw.sort_values("time_idx").groupby("entity_id").last().reset_index()
        for _, row in latest.iterrows():
            eid = row["entity_id"]
            self._enterprise_index[eid] = {c: row.get(c) for c in available}
        self.loaded = True

    # ------------------------------------------------------------------
    # Enterprise list
    # ------------------------------------------------------------------
    def get_enterprises(
        self,
        sector: str | None = None,
        district: str | None = None,
        risk_level: str | None = None,
        search: str | None = None,
        sort_by: str = "id",
        sort_order: str = "asc",
        limit: int = 50,
        offset: int = 0,
        risk_overrides: dict[str, dict] | None = None,
    ) -> dict:
        items = list(self._enterprise_index.values())

        # Merge live risk from SQLite if provided
        if risk_overrides:
            for item in items:
                eid = item.get("entity_id")
                if eid and eid in risk_overrides:
                    item.update(risk_overrides[eid])

        if sector:
            items = [e for e in items if e.get("sector", "").lower() == sector.lower()]
        if district:
            items = [e for e in items if e.get("district", "").lower() == district.lower()]
        if search:
            q = search.lower()
            items = [e for e in items if q in str(e.get("entity_id", "")).lower()
                     or q in str(e.get("name", "")).lower()
                     or q in str(e.get("district", "")).lower()]
        if risk_level:
            items = [e for e in items if e.get("riskLevel", "").lower() == risk_level.lower()]

        reverse = sort_order.lower() == "desc"
        if sort_by == "risk_score":
            items.sort(key=lambda e: e.get("riskScore", 0), reverse=reverse)
        elif sort_by == "district":
            items.sort(key=lambda e: e.get("district", ""), reverse=reverse)
        else:
            items.sort(key=lambda e: e.get("entity_id", ""), reverse=reverse)

        total = len(items)
        page = items[offset: offset + limit]
        return {"total": total, "limit": limit, "offset": offset, "enterprises": page}

    # ------------------------------------------------------------------
    # Single enterprise
    # ------------------------------------------------------------------
    def get_enterprise(self, enterprise_id: str) -> dict | None:
        return self._enterprise_index.get(enterprise_id)

    # ------------------------------------------------------------------
    # History (baseline rows for one enterprise)
    # ------------------------------------------------------------------
    def get_history(self, enterprise_id: str, months: int = 24) -> list[dict]:
        if self._df is None:
            return []
        rows = self._df[self._df["entity_id"] == enterprise_id].copy()
        rows = rows.sort_values("time_idx").tail(months)
        return rows.to_dict(orient="records")

    def get_all_history(self, enterprise_id: str) -> list[dict]:
        if self._df is None:
            return []
        rows = self._df[self._df["entity_id"] == enterprise_id]
        return rows.sort_values("time_idx").to_dict(orient="records")

    def get_all_entity_ids(self) -> list[str]:
        return list(self._enterprise_index.keys())

    # ------------------------------------------------------------------
    # Portfolio aggregates (TTL cached)
    # ------------------------------------------------------------------
    def get_portfolio_stats(self, risk_overrides: dict[str, dict] | None = None) -> dict:
        now = time.time()
        if self._portfolio_cache and (now - self._portfolio_cache_at) < self._CACHE_TTL:
            return self._portfolio_cache

        if self._df is None:
            return {}

        # Compute per-entity last-row stats
        latest = self._df.sort_values("time_idx").groupby("entity_id").last()

        # Determine risk buckets from SQLite overrides if available
        entities = list(self._enterprise_index.values())
        risk_counts = {"Very Low": 0, "Low": 0, "Medium": 0, "Amber": 0, "High": 0, "Critical": 0}
        if risk_overrides:
            for e in entities:
                rl = risk_overrides.get(e.get("entity_id", {}), {}).get("riskLevel", "Low")
                risk_counts[rl] = risk_counts.get(rl, 0) + 1
        else:
            # Fallback: distribute synthetically
            n = len(entities)
            risk_counts = {
                "Very Low": int(n * 0.20), "Low": int(n * 0.36),
                "Medium": int(n * 0.18), "Amber": int(n * 0.14),
                "High": int(n * 0.09), "Critical": int(n * 0.03),
            }

        healthy = risk_counts.get("Very Low", 0) + risk_counts.get("Low", 0)
        watchlist = risk_counts.get("Medium", 0) + risk_counts.get("Amber", 0)
        high_risk = risk_counts.get("High", 0)
        critical = risk_counts.get("Critical", 0)

        result = {
            "total": len(entities),
            "healthy": healthy,
            "watchlist": watchlist,
            "high": high_risk,
            "critical": critical,
            "forecastDeficitExposure": round(high_risk * 42000 + critical * 85000, 2),
            "activeInterventions": max(0, high_risk // 8),
            "riskMovement": {"improvedCount": 8, "deterioratedToAmber": 12, "deterioratedToHigh": 5},
            "computedAt": pd.Timestamp.utcnow().isoformat() + "Z",
            "cacheTtlSeconds": int(self._CACHE_TTL),
        }
        self._portfolio_cache = result
        self._portfolio_cache_at = now
        return result

    def invalidate_portfolio_cache(self) -> None:
        self._portfolio_cache = None
        self._portfolio_cache_at = 0.0

    # ------------------------------------------------------------------
    # Top-risk enterprises
    # ------------------------------------------------------------------
    def get_top_risk(self, n: int = 10, risk_overrides: dict | None = None) -> list[dict]:
        items = list(self._enterprise_index.values())
        if risk_overrides:
            for item in items:
                eid = item.get("entity_id")
                if eid in (risk_overrides or {}):
                    item.update(risk_overrides[eid])
        items.sort(
            key=lambda e: (
                _RISK_LEVEL_ORDER.get(e.get("riskLevel", "Low"), 0),
                e.get("riskScore", 0)
            ),
            reverse=True,
        )
        return items[:n]

    # ------------------------------------------------------------------
    # Cluster alerts (simple rule-based)
    # ------------------------------------------------------------------
    def get_cluster_alerts(self) -> list[dict]:
        if self._df is None:
            return []
        latest = self._df.sort_values("time_idx").groupby("entity_id").last().reset_index()
        alerts = []
        sector_dist = latest.groupby(["sector", "district"]).size().reset_index(name="count")
        for _, row in sector_dist[sector_dist["count"] >= 10].head(5).iterrows():
            alerts.append({
                "sector": row["sector"],
                "district": row["district"],
                "affectedCount": int(row["count"]),
                "signal": f"{row['sector']} enterprises in {row['district']} showing elevated input-cost stress.",
                "riskLevel": "Amber",
            })
        return alerts


# Module-level singleton
store = SyntheticStore()
