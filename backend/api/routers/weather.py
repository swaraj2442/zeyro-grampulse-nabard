"""Weather router — Open-Meteo with SQLite cache and synthetic fallback.

Fetch priority for every call:
  1. SQLite weather cache (< 6 hours old)
  2. Open-Meteo live API
  3. Last known cached value (isStale: true)
  4. District synthetic fallback

GET /api/v1/weather/climate-risk?district=Nashik
GET /api/v1/weather/history?district=Nashik&months=12
GET /api/v1/weather/forecast?district=Nashik
"""
from __future__ import annotations

import json
import urllib.request
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Query

from api.data.db import get_conn

router = APIRouter(prefix="/api/v1/weather", tags=["weather"])

# ── District → coordinates mapping (Maharashtra) ──────────────────────────
DISTRICT_COORDS: dict[str, tuple[float, float]] = {
    "Nashik":      (19.9975, 73.7898),
    "Pune":        (18.5204, 73.8567),
    "Ahmednagar":  (19.0948, 74.7480),
    "Jalgaon":     (21.0077, 75.5626),
}

# Synthetic fallbacks — representative Maharashtra climate
SYNTHETIC_CLIMATE: dict[str, dict] = {
    "Nashik": {
        "climateRiskScore": 55, "rainfallAnomaly": -12.3,
        "temperatureMean": 30.8, "droughtRisk": "Moderate",
        "consecutiveDryDays": 11, "extremeHeatDays": 5, "forecastRainfall": 48.0,
    },
    "Pune": {
        "climateRiskScore": 42, "rainfallAnomaly": 4.1,
        "temperatureMean": 28.6, "droughtRisk": "Low",
        "consecutiveDryDays": 7, "extremeHeatDays": 3, "forecastRainfall": 62.0,
    },
    "Ahmednagar": {
        "climateRiskScore": 67, "rainfallAnomaly": -22.1,
        "temperatureMean": 32.4, "droughtRisk": "High",
        "consecutiveDryDays": 18, "extremeHeatDays": 9, "forecastRainfall": 28.0,
    },
    "Jalgaon": {
        "climateRiskScore": 61, "rainfallAnomaly": -8.7,
        "temperatureMean": 33.1, "droughtRisk": "Moderate",
        "consecutiveDryDays": 14, "extremeHeatDays": 12, "forecastRainfall": 35.0,
    },
}
CACHE_TTL_HOURS = 6


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _cache_key(district: str, kind: str) -> str:
    return f"{district}_{kind}"


def _get_cached(location_key: str, date_range: str) -> dict | None:
    conn = get_conn()
    row = conn.execute(
        "SELECT data_json, fetched_at FROM weather_cache WHERE location_key=? AND date_range=?",
        (location_key, date_range),
    ).fetchone()
    if not row:
        return None
    fetched = datetime.fromisoformat(row["fetched_at"].replace("Z", "+00:00"))
    age_hours = (datetime.now(timezone.utc) - fetched).total_seconds() / 3600
    data = json.loads(row["data_json"])
    data["isStale"] = age_hours > CACHE_TTL_HOURS
    return data


def _set_cache(location_key: str, date_range: str, data: dict) -> None:
    conn = get_conn()
    conn.execute(
        """INSERT OR REPLACE INTO weather_cache (location_key, date_range, data_json, fetched_at)
           VALUES (?, ?, ?, ?)""",
        (location_key, date_range, json.dumps(data), _now_iso()),
    )
    conn.commit()


def _fetch_open_meteo_history(lat: float, lon: float, months: int = 12) -> dict | None:
    """Fetch historical daily data from Open-Meteo archive API."""
    end = datetime.now(timezone.utc).date()
    start = (datetime.now(timezone.utc) - timedelta(days=30 * months)).date()
    url = (
        f"https://archive-api.open-meteo.com/v1/archive"
        f"?latitude={lat}&longitude={lon}"
        f"&start_date={start}&end_date={end}"
        f"&daily=rain_sum,temperature_2m_max,temperature_2m_min,et0_fao_evapotranspiration"
        f"&timezone=Asia%2FKolkata"
    )
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "GramPulse/1.1"})
        with urllib.request.urlopen(req, timeout=8) as resp:
            return json.loads(resp.read())
    except Exception:
        return None


def _fetch_open_meteo_forecast(lat: float, lon: float) -> dict | None:
    """Fetch 7-day forecast from Open-Meteo."""
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&daily=rain_sum,temperature_2m_max,temperature_2m_min"
        f"&forecast_days=7&timezone=Asia%2FKolkata"
    )
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "GramPulse/1.1"})
        with urllib.request.urlopen(req, timeout=8) as resp:
            return json.loads(resp.read())
    except Exception:
        return None


def _compute_climate_risk(history_data: dict, district: str) -> dict:
    """Derive climate risk metrics from Open-Meteo daily data."""
    import statistics
    daily = history_data.get("daily", {})
    rain = [r for r in (daily.get("rain_sum") or []) if r is not None]
    t_max = [t for t in (daily.get("temperature_2m_max") or []) if t is not None]

    if not rain:
        return {**SYNTHETIC_CLIMATE.get(district, {}), "source": "synthetic", "fallbackUsed": True}

    total_rain = sum(rain)
    days = len(rain)
    avg_monthly = (total_rain / max(days, 1)) * 30
    # Historical average for Maharashtra: ~85mm/month during kharif
    historical_avg = 85.0
    anomaly_pct = round((avg_monthly - historical_avg) / historical_avg * 100, 1)

    dry_days = sum(1 for r in rain if r < 1.0)
    heat_days = sum(1 for t in t_max if t > 38.0)

    # Max consecutive dry days
    max_dry = 0
    current_dry = 0
    for r in rain:
        if r < 1.0:
            current_dry += 1
            max_dry = max(max_dry, current_dry)
        else:
            current_dry = 0

    # Risk score: 0-100, higher = riskier
    drought_penalty = max(0, -anomaly_pct) * 0.5   # negative anomaly = dry = risk
    heat_penalty = heat_days * 2.0
    dry_spell_penalty = max_dry * 1.5
    risk_score = min(100, round(drought_penalty + heat_penalty + dry_spell_penalty))

    if anomaly_pct < -20:
        drought_risk = "High"
    elif anomaly_pct < -5:
        drought_risk = "Moderate"
    else:
        drought_risk = "Low"

    return {
        "climateRiskScore": risk_score,
        "rainfallAnomaly": anomaly_pct,
        "temperatureMean": round(statistics.mean(t_max), 1) if t_max else 30.0,
        "droughtRisk": drought_risk,
        "consecutiveDryDays": max_dry,
        "extremeHeatDays": heat_days,
        "forecastRainfall": None,   # filled by forecast call
    }


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/climate-risk")
def get_climate_risk(district: str = Query("Nashik")):
    """Climate risk score for a district, used by ClimateScreen and EnterpriseTwinScreen."""
    cache_key = _cache_key(district, "climate_risk")
    cached = _get_cached(cache_key, "latest")
    if cached and not cached.get("isStale"):
        return {**cached, "district": district}

    coords = DISTRICT_COORDS.get(district)
    if not coords:
        return {**SYNTHETIC_CLIMATE.get(district, SYNTHETIC_CLIMATE["Nashik"]),
                "district": district, "source": "synthetic", "isStale": False, "fallbackUsed": True,
                "fetchedAt": _now_iso()}

    lat, lon = coords
    history = _fetch_open_meteo_history(lat, lon, months=6)

    if history:
        risk = _compute_climate_risk(history, district)
        # Fetch 7-day forecast for forecastRainfall
        forecast = _fetch_open_meteo_forecast(lat, lon)
        if forecast:
            daily_rain = forecast.get("daily", {}).get("rain_sum") or []
            risk["forecastRainfall"] = round(sum(r for r in daily_rain if r), 1)

        result = {
            **risk,
            "district": district,
            "source": "open-meteo",
            "fetchedAt": _now_iso(),
            "isStale": False,
            "fallbackUsed": False,
        }
    else:
        # Return stale cache if available
        if cached:
            return {**cached, "district": district, "isStale": True}
        # Full synthetic fallback
        result = {
            **SYNTHETIC_CLIMATE.get(district, SYNTHETIC_CLIMATE["Nashik"]),
            "district": district,
            "source": "synthetic",
            "fetchedAt": _now_iso(),
            "isStale": False,
            "fallbackUsed": True,
        }

    _set_cache(cache_key, "latest", result)
    return result


@router.get("/history")
def get_weather_history(
    district: str = Query("Nashik"),
    months: int = Query(12, ge=1, le=36),
):
    """Monthly rainfall and temperature series for charting."""
    cache_key = _cache_key(district, "history")
    cached = _get_cached(cache_key, f"months_{months}")
    if cached and not cached.get("isStale"):
        return cached

    coords = DISTRICT_COORDS.get(district)
    if not coords:
        return _synthetic_history(district, months)

    lat, lon = coords
    raw = _fetch_open_meteo_history(lat, lon, months=months)
    if not raw:
        return _synthetic_history(district, months)

    daily = raw.get("daily", {})
    dates = daily.get("time") or []
    rain = daily.get("rain_sum") or []
    t_max = daily.get("temperature_2m_max") or []
    t_min = daily.get("temperature_2m_min") or []

    # Aggregate to monthly
    monthly: dict[str, dict] = {}
    for i, d in enumerate(dates):
        month = d[:7]  # YYYY-MM
        if month not in monthly:
            monthly[month] = {"rain": [], "t_max": [], "t_min": []}
        if i < len(rain) and rain[i] is not None:
            monthly[month]["rain"].append(rain[i])
        if i < len(t_max) and t_max[i] is not None:
            monthly[month]["t_max"].append(t_max[i])
        if i < len(t_min) and t_min[i] is not None:
            monthly[month]["t_min"].append(t_min[i])

    series = []
    for month, vals in sorted(monthly.items()):
        import statistics
        series.append({
            "month": month,
            "rainfallMm": round(sum(vals["rain"]), 1),
            "temperatureMean": round(statistics.mean(vals["t_max"] + vals["t_min"]) if vals["t_max"] else 28.0, 1),
            "temperatureMax": round(max(vals["t_max"]) if vals["t_max"] else 35.0, 1),
        })

    result = {
        "district": district,
        "months": series,
        "source": "open-meteo",
        "fetchedAt": _now_iso(),
        "isStale": False,
        "fallbackUsed": False,
    }
    _set_cache(cache_key, f"months_{months}", result)
    return result


@router.get("/forecast")
def get_weather_forecast(district: str = Query("Nashik")):
    """7-day weather forecast for a district."""
    cache_key = _cache_key(district, "forecast")
    cached = _get_cached(cache_key, "7day")
    if cached and not cached.get("isStale"):
        return cached

    coords = DISTRICT_COORDS.get(district)
    if not coords:
        return {"district": district, "days": [], "source": "synthetic", "fallbackUsed": True}

    lat, lon = coords
    raw = _fetch_open_meteo_forecast(lat, lon)
    if not raw:
        if cached:
            return {**cached, "isStale": True}
        return {"district": district, "days": [], "source": "synthetic", "fallbackUsed": True}

    daily = raw.get("daily", {})
    dates = daily.get("time") or []
    rain = daily.get("rain_sum") or []
    t_max = daily.get("temperature_2m_max") or []
    t_min = daily.get("temperature_2m_min") or []

    days = []
    for i, d in enumerate(dates):
        days.append({
            "date": d,
            "rainfallMm": rain[i] if i < len(rain) else 0,
            "temperatureMax": t_max[i] if i < len(t_max) else 32.0,
            "temperatureMin": t_min[i] if i < len(t_min) else 22.0,
        })

    result = {
        "district": district,
        "days": days,
        "source": "open-meteo",
        "fetchedAt": _now_iso(),
        "isStale": False,
        "fallbackUsed": False,
    }
    _set_cache(cache_key, "7day", result)
    return result


# ── Helpers ───────────────────────────────────────────────────────────────────
def _synthetic_history(district: str, months: int) -> dict:
    """Generate plausible synthetic monthly series for Maharashtra."""
    import random
    random.seed(42)
    today = datetime.now(timezone.utc)
    series = []
    for m in range(months - 1, -1, -1):
        dt = today - timedelta(days=30 * m)
        month_str = dt.strftime("%Y-%m")
        # Maharashtra rainfall: peak Jun-Sep, dry Nov-Mar
        kharif = dt.month in (6, 7, 8, 9)
        rain = round(random.uniform(60, 180) if kharif else random.uniform(0, 20), 1)
        t_mean = round(random.uniform(25, 32) if not kharif else random.uniform(27, 34), 1)
        series.append({"month": month_str, "rainfallMm": rain, "temperatureMean": t_mean, "temperatureMax": t_mean + 5})
    return {
        "district": district, "months": series,
        "source": "synthetic", "fetchedAt": _now_iso(),
        "isStale": False, "fallbackUsed": True,
    }
