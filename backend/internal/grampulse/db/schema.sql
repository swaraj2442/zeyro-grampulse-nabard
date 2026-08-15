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
    created_at TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS timeline_events (
    id TEXT PRIMARY KEY,
    enterprise_id TEXT NOT NULL,
    date TEXT NOT NULL,
    title TEXT,
    description TEXT
);

CREATE TABLE IF NOT EXISTS weather_cache (
    location_key TEXT,
    date_range TEXT,
    data_json TEXT,
    district TEXT,
    rainfall_anomaly REAL,
    temperature_mean REAL,
    climate_risk_score REAL,
    fetched_at TEXT
);

CREATE TABLE IF NOT EXISTS market_cache (
    commodity TEXT NOT NULL,
    state TEXT NOT NULL,
    month TEXT NOT NULL,
    modal_price REAL,
    fetched_at TEXT,
    PRIMARY KEY (commodity, state, month)
);

CREATE TABLE IF NOT EXISTS weather_cache_v2 (
    cache_key TEXT PRIMARY KEY,
    location_key TEXT NOT NULL,
    request_type TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    source TEXT NOT NULL,
    fetched_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agmarknet_daily_prices (
    id TEXT PRIMARY KEY,
    arrival_date DATE NOT NULL,
    state_id TEXT,
    state_name TEXT,
    district_id TEXT,
    district_name TEXT,
    market_id TEXT,
    market_name TEXT,
    commodity_id TEXT,
    commodity_name TEXT,
    variety_id TEXT,
    variety_name TEXT,
    grade_id TEXT,
    grade_name TEXT,
    min_price NUMERIC,
    max_price NUMERIC,
    modal_price NUMERIC,
    arrivals NUMERIC,
    price_unit TEXT,
    arrival_unit TEXT,
    source TEXT NOT NULL,
    fetched_at TIMESTAMP NOT NULL,
    raw_hash TEXT NOT NULL,
    UNIQUE (
        arrival_date,
        market_id,
        commodity_id,
        variety_id,
        grade_id
    )
);

CREATE TABLE IF NOT EXISTS agmarknet_filters (
    filter_type TEXT NOT NULL,
    filter_id TEXT NOT NULL,
    filter_name TEXT NOT NULL,
    fetched_at TIMESTAMP NOT NULL,
    PRIMARY KEY (filter_type, filter_id)
);
