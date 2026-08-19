"""Market prices router — AGMARKNET/data.gov.in with CSV fallback.

Fetch priority:
  1. SQLite market cache (< 24 hours old)
  2. data.gov.in AGMARKNET API (if DATA_GOV_API_KEY env var set)
  3. Pre-downloaded CSV fallback  (data/agmarknet_fallback.csv)
  4. Synthetic price series

Feed Price Index = 0.60 × Maize + 0.40 × Soybean (modal price, indexed to 100 at 2024-01)

GET /api/v1/market/prices?commodity=Maize&district=Nashik
GET /api/v1/market/feed-index
GET /api/v1/market/price-history?commodity=Maize&district=Nashik&months=12
GET /api/v1/market/commodities
"""
from __future__ import annotations

import csv
import json
import os
import urllib.request
import urllib.parse
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional

import pandas as pd
from fastapi import APIRouter, Query

from api.data.db import get_conn

router = APIRouter(prefix="/api/v1/market", tags=["market"])

CSV_PATH = Path("data") / "agmarknet_fallback.csv"
DATA_GOV_API_KEY = os.environ.get("DATA_GOV_API_KEY", "")
CACHE_TTL_HOURS = 24

_csv_df: pd.DataFrame | None = None


def _load_csv() -> pd.DataFrame:
    global _csv_df
    if _csv_df is None and CSV_PATH.exists():
        _csv_df = pd.read_csv(CSV_PATH)
        _csv_df["modal_price"] = pd.to_numeric(_csv_df["modal_price"], errors="coerce")
        _csv_df["month"] = _csv_df["month"].astype(str)
    return _csv_df


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _cache_key(commodity: str, district: str, month: str) -> tuple:
    return (commodity, district or "all", month)


def _get_cached_price(commodity: str, district: str, month: str) -> float | None:
    conn = get_conn()
    row = conn.execute(
        "SELECT modal_price, fetched_at FROM market_cache WHERE commodity=? AND state='Maharashtra' AND month=?",
        (commodity, month),
    ).fetchone()
    if not row:
        return None
    fetched = datetime.fromisoformat(row["fetched_at"].replace("Z", "+00:00"))
    if (datetime.now(timezone.utc) - fetched).total_seconds() / 3600 > CACHE_TTL_HOURS:
        return None
    return row["modal_price"]


def _set_cached_price(commodity: str, month: str, price: float) -> None:
    conn = get_conn()
    conn.execute(
        """INSERT OR REPLACE INTO market_cache (commodity, state, month, modal_price, fetched_at)
           VALUES (?, 'Maharashtra', ?, ?, ?)""",
        (commodity, month, price, _now_iso()),
    )
    conn.commit()


def _fetch_agmarknet_live(commodity: str, state: str = "Maharashtra") -> list[dict] | None:
    """Fetch from data.gov.in AGMARKNET API if key is available."""
    if not DATA_GOV_API_KEY:
        return None
    try:
        params = urllib.parse.urlencode({
            "api-key": DATA_GOV_API_KEY,
            "format": "json",
            "limit": 100,
            "filters[state]": state,
            "filters[commodity]": commodity,
        })
        url = f"https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?{params}"
        req = urllib.request.Request(url, headers={"User-Agent": "GramPulse/1.1"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            return data.get("records", [])
    except Exception:
        return None


def _get_from_csv(commodity: str, district: Optional[str], months: int = 12) -> list[dict]:
    """Load price history from the fallback CSV."""
    df = _load_csv()
    if df is None or df.empty:
        return []
    mask = df["commodity"] == commodity
    if district:
        mask &= df["district"] == district
    sub = df[mask].copy()
    if sub.empty:
        return []
    monthly = (
        sub.groupby("month")["modal_price"].mean().reset_index()
        .sort_values("month").tail(months)
    )
    return monthly.to_dict(orient="records")


def _compute_price_change(series: list[dict]) -> tuple[float, float]:
    """Return (1m_change_pct, 3m_change_pct) from monthly series."""
    prices = [r["modal_price"] for r in series if r.get("modal_price")]
    if len(prices) < 2:
        return 0.0, 0.0
    change_1m = round((prices[-1] - prices[-2]) / prices[-2] * 100, 1) if len(prices) >= 2 else 0.0
    change_3m = round((prices[-1] - prices[-4]) / prices[-4] * 100, 1) if len(prices) >= 4 else 0.0
    return change_1m, change_3m


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/commodities")
def list_commodities():
    """Available commodities in the market feed."""
    df = _load_csv()
    if df is not None:
        return {"commodities": sorted(df["commodity"].unique().tolist())}
    return {"commodities": ["Maize", "Soybean", "Onion", "Tomato", "Wheat", "Fodder", "Poultry", "MilkCow"]}


@router.get("/prices")
def get_prices(
    commodity: str = Query("Maize"),
    district: Optional[str] = Query(None),
    months: int = Query(3, ge=1, le=24),
):
    """Current and recent modal prices for a commodity."""
    # Try live API first (if key set)
    live = _fetch_agmarknet_live(commodity)
    source = "synthetic"
    fallback_used = True

    if live:
        source = "agmarknet-live"
        fallback_used = False
        # Parse and store in cache
        for rec in live[:months]:
            month = rec.get("modal_price_date", "")[:7] or _now_iso()[:7]
            price = float(rec.get("modal_price", 0) or 0)
            if price:
                _set_cached_price(commodity, month, price)

    # Load from CSV
    history = _get_from_csv(commodity, district, months=months)
    if history:
        source = "agmarknet-csv" if not live else source
        fallback_used = False

    if not history:
        # Synthetic fallback
        base = {"Maize": 2150, "Soybean": 4600, "Onion": 1800, "MilkCow": 38}.get(commodity, 1500)
        history = [{"month": _now_iso()[:7], "modal_price": float(base)}]
        source = "synthetic"
        fallback_used = True

    change_1m, change_3m = _compute_price_change(history)
    latest = history[-1] if history else {}

    return {
        "commodity": commodity,
        "district": district,
        "unit": _get_unit(commodity),
        "latestModalPrice": latest.get("modal_price"),
        "latestMonth": latest.get("month"),
        "priceChange1m": change_1m,
        "priceChange3m": change_3m,
        "history": history,
        "source": source,
        "fetchedAt": _now_iso(),
        "isStale": False,
        "fallbackUsed": fallback_used,
    }


@router.get("/feed-index")
def get_feed_index():
    """Composite Feed Price Index: 60% Maize + 40% Soybean.
    Indexed to 100 at 2024-01. Used by Dairy sector risk engine.
    """
    maize_series = _get_from_csv("Maize", None, months=24)
    soybean_series = _get_from_csv("Soybean", None, months=24)

    if not maize_series or not soybean_series:
        return {
            "feedIndex": 112.4, "maizePrice": 2280, "soybeanPrice": 4750,
            "change1m": 2.1, "change3m": 6.8,
            "source": "synthetic", "fallbackUsed": True, "fetchedAt": _now_iso(),
        }

    # Align by month
    maize_map = {r["month"]: r["modal_price"] for r in maize_series}
    soybean_map = {r["month"]: r["modal_price"] for r in soybean_series}
    common_months = sorted(set(maize_map) & set(soybean_map))

    if not common_months:
        return {"feedIndex": 112.4, "source": "synthetic", "fallbackUsed": True, "fetchedAt": _now_iso()}

    # Base = first common month (ideally 2024-01)
    base_month = common_months[0]
    base_maize = maize_map[base_month]
    base_soy = soybean_map[base_month]

    series = []
    for month in common_months:
        m = maize_map.get(month, base_maize)
        s = soybean_map.get(month, base_soy)
        composite = 0.60 * m + 0.40 * s
        base_composite = 0.60 * base_maize + 0.40 * base_soy
        index_val = round(composite / base_composite * 100, 1)
        series.append({"month": month, "feedIndex": index_val, "maizePrice": m, "soybeanPrice": s})

    latest = series[-1]
    prev_1m = series[-2] if len(series) >= 2 else latest
    prev_3m = series[-4] if len(series) >= 4 else series[0]

    return {
        "feedIndex": latest["feedIndex"],
        "maizePrice": latest["maizePrice"],
        "soybeanPrice": latest["soybeanPrice"],
        "change1m": round(latest["feedIndex"] - prev_1m["feedIndex"], 1),
        "change3m": round(latest["feedIndex"] - prev_3m["feedIndex"], 1),
        "series": series[-12:],  # last 12 months for charting
        "source": "agmarknet-csv",
        "fetchedAt": _now_iso(),
        "isStale": False,
        "fallbackUsed": False,
    }


@router.get("/price-history")
def get_price_history(
    commodity: str = Query("Maize"),
    district: Optional[str] = Query(None),
    months: int = Query(12, ge=1, le=36),
):
    """Monthly modal price series for charting."""
    history = _get_from_csv(commodity, district, months=months)
    if not history:
        return {"commodity": commodity, "series": [], "source": "synthetic", "fallbackUsed": True}

    change_1m, change_3m = _compute_price_change(history)
    return {
        "commodity": commodity,
        "district": district,
        "unit": _get_unit(commodity),
        "series": history,
        "change1m": change_1m,
        "change3m": change_3m,
        "source": "agmarknet-csv",
        "fetchedAt": _now_iso(),
        "isStale": False,
        "fallbackUsed": False,
    }


def _get_unit(commodity: str) -> str:
    return {"MilkCow": "Litre", "Poultry": "Kg"}.get(commodity, "Quintal")
