"""SQLite database initialisation and connection management."""
from __future__ import annotations

import sqlite3
import threading
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "grampulse.db"

_local = threading.local()


def get_conn() -> sqlite3.Connection:
    """Return a per-thread SQLite connection (create if needed)."""
    if not hasattr(_local, "conn") or _local.conn is None:
        _local.conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
        _local.conn.row_factory = sqlite3.Row
        _local.conn.execute("PRAGMA journal_mode=WAL")
        _local.conn.execute("PRAGMA foreign_keys=ON")
    return _local.conn


def init_db() -> None:
    """Create all tables if they do not already exist."""
    conn = get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS financial_records (
            id TEXT PRIMARY KEY,
            enterprise_id TEXT NOT NULL,
            month TEXT NOT NULL,
            operating_inflow REAL,
            operating_outflow REAL,
            savings REAL,
            loan_repayment REAL,
            inventory_cost REAL,
            recorded_at TEXT NOT NULL,
            sync_status TEXT DEFAULT 'synced'
        );

        CREATE TABLE IF NOT EXISTS forecast_cache (
            enterprise_id TEXT NOT NULL,
            record_hash TEXT NOT NULL,
            model_version TEXT,
            forecast_json TEXT,
            generated_at TEXT,
            PRIMARY KEY (enterprise_id, record_hash)
        );

        CREATE TABLE IF NOT EXISTS risk_assessments (
            enterprise_id TEXT PRIMARY KEY,
            risk_score INTEGER,
            risk_level TEXT,
            forecast_deficit REAL,
            debt_service_shortfall REAL,
            stress_month TEXT,
            warning_lead_time_days INTEGER,
            drivers_json TEXT,
            assessed_at TEXT
        );

        CREATE TABLE IF NOT EXISTS alerts (
            id TEXT PRIMARY KEY,
            enterprise_id TEXT NOT NULL,
            risk_level TEXT,
            title TEXT,
            description TEXT,
            created_at TEXT,
            status TEXT DEFAULT 'Active'
        );

        CREATE TABLE IF NOT EXISTS interventions (
            id TEXT PRIMARY KEY,
            enterprise_id TEXT NOT NULL,
            recommended_intervention TEXT,
            illustrative_amount REAL,
            assigned_officer TEXT,
            visit_date TEXT,
            follow_up_date TEXT,
            notes TEXT,
            status TEXT DEFAULT 'Pending',
            created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS timeline_events (
            id TEXT PRIMARY KEY,
            enterprise_id TEXT NOT NULL,
            date TEXT NOT NULL,
            title TEXT,
            description TEXT
        );

        CREATE TABLE IF NOT EXISTS weather_cache (
            location_key TEXT NOT NULL,
            date_range TEXT NOT NULL,
            data_json TEXT,
            fetched_at TEXT,
            PRIMARY KEY (location_key, date_range)
        );

        CREATE TABLE IF NOT EXISTS market_cache (
            commodity TEXT NOT NULL,
            state TEXT NOT NULL,
            month TEXT NOT NULL,
            modal_price REAL,
            fetched_at TEXT,
            PRIMARY KEY (commodity, state, month)
        );
    """)
    conn.commit()


connected: bool = False


def connect() -> None:
    global connected
    init_db()
    connected = True
