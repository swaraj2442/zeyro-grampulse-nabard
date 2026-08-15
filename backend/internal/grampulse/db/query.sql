-- name: GetRiskAssessment :one
SELECT enterprise_id, risk_score, risk_level, forecast_deficit, debt_service_shortfall,
       stress_month, warning_lead_time_days, drivers_json, assessed_at
FROM risk_assessments WHERE enterprise_id = ?
ORDER BY assessed_at DESC LIMIT 1;

-- name: UpsertRiskAssessment :exec
INSERT OR REPLACE INTO risk_assessments
 (enterprise_id, risk_score, risk_level, forecast_deficit, debt_service_shortfall,
  stress_month, warning_lead_time_days, drivers_json, assessed_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);

-- name: GetAllRiskAssessments :many
SELECT enterprise_id, risk_score, risk_level, forecast_deficit, warning_lead_time_days
FROM risk_assessments;

-- name: GetCachedForecast :one
SELECT forecast_json FROM forecast_cache WHERE enterprise_id = ?
ORDER BY generated_at DESC LIMIT 1;

-- name: UpsertForecastCache :exec
INSERT OR REPLACE INTO forecast_cache (enterprise_id, record_hash, model_version, forecast_json, generated_at)
VALUES (?, ?, ?, ?, ?);

-- name: InsertFinancialRecord :exec
INSERT OR REPLACE INTO financial_records
 (id, enterprise_id, month, operating_inflow, operating_outflow,
  savings, loan_repayment, inventory_cost, recorded_at, sync_status)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced');

-- name: GetSubmittedRecords :many
SELECT month, operating_inflow, operating_outflow, savings, loan_repayment, inventory_cost
FROM financial_records WHERE enterprise_id = ? ORDER BY month ASC;

-- name: ListInterventionsByEnterprise :many
SELECT id, enterprise_id, recommended_intervention, illustrative_amount,
       assigned_officer, visit_date, follow_up_date, notes, status, created_at, updated_at
FROM interventions WHERE enterprise_id = ? ORDER BY created_at DESC;

-- name: ListRecentInterventions :many
SELECT id, enterprise_id, recommended_intervention, illustrative_amount,
       assigned_officer, visit_date, follow_up_date, notes, status, created_at, updated_at
FROM interventions ORDER BY created_at DESC LIMIT 100;

-- name: InsertIntervention :exec
INSERT INTO interventions (id, enterprise_id, recommended_intervention, illustrative_amount,
  assigned_officer, visit_date, follow_up_date, notes, status, created_at, updated_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- name: UpdateInterventionStatus :exec
UPDATE interventions SET status = ?, updated_at = ? WHERE id = ?;

-- name: GetAlerts :many
SELECT id, enterprise_id, risk_level, title, description, created_at, status
FROM alerts WHERE enterprise_id = ? ORDER BY created_at DESC;

-- name: InsertAlert :exec
INSERT INTO alerts (id, enterprise_id, risk_level, title, description, created_at, status)
VALUES (?, ?, ?, ?, ?, ?, ?);

-- name: GetTimeline :many
SELECT id, enterprise_id, date, title, description
FROM timeline_events WHERE enterprise_id = ? ORDER BY date DESC LIMIT 50;

-- name: InsertTimelineEvent :exec
INSERT INTO timeline_events (id, enterprise_id, date, title, description) VALUES (?, ?, ?, ?, ?);

-- name: GetPortfolioRiskStats :many
SELECT risk_level, COUNT(*) as n, COALESCE(SUM(forecast_deficit),0) as deficit
FROM risk_assessments GROUP BY risk_level;

-- name: GetActiveInterventionCount :one
SELECT COUNT(*) FROM interventions WHERE status IN ('Pending','Active');

-- name: GetMarketCache :one
SELECT commodity, state, month, modal_price, fetched_at
FROM market_cache WHERE commodity=? AND state='Maharashtra' AND month=?
ORDER BY fetched_at DESC LIMIT 1;

-- name: UpsertMarketCache :exec
INSERT OR REPLACE INTO market_cache (commodity, state, month, modal_price, fetched_at)
VALUES (?, 'Maharashtra', ?, ?, ?);

-- name: UpsertAgmarknetPrice :exec
INSERT OR REPLACE INTO agmarknet_daily_prices 
 (id, arrival_date, state_id, state_name, district_id, district_name, market_id, market_name, 
  commodity_id, commodity_name, variety_id, variety_name, grade_id, grade_name, 
  min_price, max_price, modal_price, arrivals, price_unit, arrival_unit, source, fetched_at, raw_hash)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- name: GetLatestAgmarknetPrices :many
SELECT id, arrival_date, state_id, state_name, district_id, district_name, market_id, market_name,
       commodity_id, commodity_name, variety_id, variety_name, grade_id, grade_name,
       min_price, max_price, modal_price, arrivals, price_unit, arrival_unit, source, fetched_at, raw_hash
FROM agmarknet_daily_prices
WHERE commodity_name = ? AND (district_name = ? OR district_name = '')
ORDER BY arrival_date DESC LIMIT ?;

-- name: UpsertAgmarknetFilter :exec
INSERT OR REPLACE INTO agmarknet_filters (filter_type, filter_id, filter_name, fetched_at)
VALUES (?, ?, ?, ?);

-- name: GetAgmarknetFilters :many
SELECT filter_type, filter_id, filter_name, fetched_at FROM agmarknet_filters;

-- name: GetLocationWeatherCacheV2 :one
SELECT cache_key, location_key, request_type, payload_json, source, fetched_at, expires_at
FROM weather_cache_v2 WHERE cache_key = ?;

-- name: UpsertLocationWeatherCacheV2 :exec
INSERT OR REPLACE INTO weather_cache_v2 
 (cache_key, location_key, request_type, payload_json, source, fetched_at, expires_at)
VALUES (?, ?, ?, ?, ?, ?, ?);

-- name: GetWeatherCache :one
SELECT district, rainfall_anomaly, temperature_mean, climate_risk_score, fetched_at
FROM weather_cache WHERE district=?
ORDER BY fetched_at DESC LIMIT 1;

-- name: UpsertWeatherCache :exec
INSERT OR REPLACE INTO weather_cache (district, rainfall_anomaly, temperature_mean, climate_risk_score, fetched_at)
VALUES (?, ?, ?, ?, ?);
