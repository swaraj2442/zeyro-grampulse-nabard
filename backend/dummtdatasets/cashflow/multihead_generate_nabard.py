#!/usr/bin/env python3
"""Generate a privacy-preserving NABARD rural-enterprise monthly panel.

The generator creates one row per enterprise-month and is designed for a
3–6 month cash-flow forecasting and early-warning prototype. It does not
contain real UPI transactions or personally identifiable information.

Example
-------
python multihead_generate_nabard.py \
  --n-enterprises 3250 --months 36 \
  --output /kaggle/working/tft_experiment_temp/data/nabard_enterprise_monthly.csv
"""
from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, Tuple

import numpy as np
import pandas as pd


SECTOR_CONFIG: Dict[str, Dict[str, float]] = {
    "Dairy": {
        "base_monthly_inflow": 145_000,
        "variable_cost_ratio": 0.52,
        "fixed_cost": 27_000,
        "output_price": 39.0,
        "input_price": 25.0,
        "climate_sensitivity": 0.18,
        "market_sensitivity": 0.20,
        "capacity_low": 8,
        "capacity_high": 45,
    },
    "Poultry": {
        "base_monthly_inflow": 190_000,
        "variable_cost_ratio": 0.62,
        "fixed_cost": 32_000,
        "output_price": 112.0,
        "input_price": 36.0,
        "climate_sensitivity": 0.12,
        "market_sensitivity": 0.28,
        "capacity_low": 500,
        "capacity_high": 5000,
    },
    "Food Processing": {
        "base_monthly_inflow": 220_000,
        "variable_cost_ratio": 0.56,
        "fixed_cost": 41_000,
        "output_price": 100.0,
        "input_price": 72.0,
        "climate_sensitivity": 0.08,
        "market_sensitivity": 0.22,
        "capacity_low": 100,
        "capacity_high": 1200,
    },
    "Rural Retail": {
        "base_monthly_inflow": 125_000,
        "variable_cost_ratio": 0.68,
        "fixed_cost": 19_000,
        "output_price": 100.0,
        "input_price": 79.0,
        "climate_sensitivity": 0.04,
        "market_sensitivity": 0.16,
        "capacity_low": 80,
        "capacity_high": 700,
    },
}

SECTOR_PROBABILITIES = [0.40, 0.22, 0.18, 0.20]
DISTRICT_BLOCKS = {
    "Nashik": ["Dindori", "Niphad", "Sinnar", "Surgana", "Deola", "Nashik Rural"],
    "Pune": ["Baramati", "Junnar", "Indapur", "Daund"],
    "Ahmednagar": ["Sangamner", "Rahata", "Shrigonda", "Karjat"],
    "Jalgaon": ["Chalisgaon", "Bhusawal", "Raver", "Amalner"],
}
DISTRICT_PROBABILITIES = [0.56, 0.16, 0.16, 0.12]

# Seasonal multipliers by calendar month (Jan..Dec).
SEASONALITY = {
    "Dairy": np.array([0.97, 0.98, 1.00, 1.02, 1.03, 0.99, 0.96, 0.95, 0.97, 1.03, 1.07, 1.04]),
    "Poultry": np.array([1.03, 1.01, 0.99, 0.96, 0.95, 0.97, 1.01, 1.02, 1.04, 1.08, 1.11, 1.07]),
    "Food Processing": np.array([0.93, 0.95, 0.98, 0.99, 1.00, 1.02, 1.03, 1.02, 1.04, 1.10, 1.13, 1.08]),
    "Rural Retail": np.array([0.94, 0.95, 0.98, 0.99, 1.00, 1.01, 1.01, 1.02, 1.04, 1.12, 1.16, 1.10]),
}


@dataclass(frozen=True)
class GeneratorConfig:
    n_enterprises: int = 3250
    months: int = 36
    start_date: str = "2023-01-01"
    seed: int = 42
    missing_rate: float = 0.004


def _bounded(value: float, low: float, high: float) -> float:
    return float(np.clip(value, low, high))


def _make_environment(
    dates: pd.DatetimeIndex, rng: np.random.Generator
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Create block-level climate and sector-level market scenarios."""
    climate_rows = []
    all_blocks = [(district, block) for district, blocks in DISTRICT_BLOCKS.items() for block in blocks]

    rainfall_norm = np.array([5, 4, 6, 12, 35, 155, 235, 210, 145, 55, 18, 7], dtype=float)
    temp_norm = np.array([22, 24, 28, 32, 34, 30, 27, 27, 28, 29, 26, 23], dtype=float)

    for district, block in all_blocks:
        anomaly_state = rng.normal(0, 7)
        block_rain_factor = rng.uniform(0.86, 1.14)
        block_temp_shift = rng.normal(0, 0.8)
        hist_rainfall_anomaly = []
        hist_temp_mean = []
        for t, date in enumerate(dates):
            month_idx = date.month - 1
            anomaly_state = 0.62 * anomaly_state + rng.normal(0, 13)
            # Reproducible stress events that produce meaningful early-warning cases.
            if t in {19, 20} and district == "Nashik":
                anomaly_state -= 24
            if t == 28 and block in {"Surgana", "Dindori"}:
                anomaly_state += 45

            rainfall_anomaly = _bounded(anomaly_state, -65, 80)
            rainfall = max(0.0, rainfall_norm[month_idx] * block_rain_factor * (1 + rainfall_anomaly / 100))
            temperature = temp_norm[month_idx] + block_temp_shift + rng.normal(0, 1.0)
            extreme_heat_days = max(0, int(round((temperature - 31) * 2.2 + rng.normal(1.5, 1.8))))
            consecutive_dry_days = max(0, int(round((35 - rainfall) / 5 + rng.normal(2, 2))))
            excess_rainfall_days = max(0, int(round((rainfall - 160) / 35 + rng.normal(0.5, 0.8))))
            climate_risk = _bounded(
                abs(min(rainfall_anomaly, 0)) * 0.9
                + max(rainfall_anomaly - 35, 0) * 0.55
                + extreme_heat_days * 1.6
                + consecutive_dry_days * 1.1,
                0,
                100,
            )
            
            hist_rainfall_anomaly.append(rainfall_anomaly)
            hist_temp_mean.append(temperature)
            
            # Forecasts based on historical 3-month rolling average
            f_rain_anom = np.mean(hist_rainfall_anomaly[-4:-1]) if len(hist_rainfall_anomaly) > 1 else rainfall_anomaly
            f_temp_mean = np.mean(hist_temp_mean[-4:-1]) if len(hist_temp_mean) > 1 else temperature

            climate_rows.append(
                {
                    "district": district,
                    "block": block,
                    "date": date,
                    "rainfall_mm": rainfall,
                    "rainfall_anomaly_pct": rainfall_anomaly,
                    "temperature_mean": temperature,
                    "extreme_heat_days": extreme_heat_days,
                    "consecutive_dry_days": consecutive_dry_days,
                    "excess_rainfall_days": excess_rainfall_days,
                    "climate_risk_score": climate_risk,
                    # These are forecast/scenario inputs, not leaked actuals.
                    "forecast_rainfall_anomaly_pct": float(f_rain_anom),
                    "forecast_temperature_mean": float(f_temp_mean),
                }
            )

    market_rows = []
    for sector, cfg in SECTOR_CONFIG.items():
        output_price = cfg["output_price"] * rng.uniform(0.94, 1.06)
        input_price = cfg["input_price"] * rng.uniform(0.94, 1.06)
        demand_state = rng.normal(0, 2)
        hist_out_price = []
        hist_in_cost_index = []
        for t, date in enumerate(dates):
            month_idx = date.month - 1
            output_price *= np.exp(rng.normal(0.003, 0.025))
            input_price *= np.exp(rng.normal(0.004, 0.030))
            demand_state = 0.65 * demand_state + rng.normal(0, 3.2)
            disruption = 0

            # Sector shocks intentionally create non-trivial test behaviour.
            if sector in {"Dairy", "Poultry"} and t in {20, 21}:
                input_price *= 1.08
                disruption = 1
            if sector == "Dairy" and t == 30:
                output_price *= 0.92
                disruption = 1
            if sector in {"Food Processing", "Rural Retail"} and t == 31:
                demand_state -= 13
                disruption = 1

            local_demand = _bounded(100 + demand_state + (SEASONALITY[sector][month_idx] - 1) * 55, 60, 140)
            input_cost_index = 100 * input_price / cfg["input_price"]
            
            hist_out_price.append(output_price)
            hist_in_cost_index.append(input_cost_index)
            
            f_out_price = np.mean(hist_out_price[-4:-1]) if len(hist_out_price) > 1 else output_price
            f_in_cost_index = np.mean(hist_in_cost_index[-4:-1]) if len(hist_in_cost_index) > 1 else input_cost_index

            market_rows.append(
                {
                    "sector": sector,
                    "date": date,
                    "output_commodity_price": output_price,
                    "input_commodity_price": input_price,
                    "local_demand_index": local_demand,
                    "input_cost_index": input_cost_index,
                    "market_disruption_flag": disruption,
                    "commodity_price_scenario": float(f_out_price),
                    "input_cost_scenario": float(f_in_cost_index),
                }
            )

    climate = pd.DataFrame(climate_rows)
    market = pd.DataFrame(market_rows)
    return climate, market


def _sample_enterprise_static(rng: np.random.Generator, enterprise_num: int) -> Dict[str, object]:
    sector = rng.choice(list(SECTOR_CONFIG), p=SECTOR_PROBABILITIES)
    district = rng.choice(list(DISTRICT_BLOCKS), p=DISTRICT_PROBABILITIES)
    block = rng.choice(DISTRICT_BLOCKS[district])
    enterprise_type = rng.choice(
        ["Individual", "Micro Enterprise", "SHG", "FPO"],
        p=[0.45, 0.35, 0.14, 0.06],
    )
    ownership_type = rng.choice(
        ["Women-led", "Men-led", "Joint", "Community-owned"],
        p=[0.35, 0.42, 0.17, 0.06],
    )
    cfg = SECTOR_CONFIG[sector]
    capacity = float(rng.integers(int(cfg["capacity_low"]), int(cfg["capacity_high"]) + 1))
    if enterprise_type in {"SHG", "FPO"}:
        capacity *= rng.uniform(1.25, 2.3)

    years = int(rng.integers(1, 19))
    workers = int(max(1, round(rng.lognormal(mean=1.0, sigma=0.55))))
    if enterprise_type in {"SHG", "FPO"}:
        workers += int(rng.integers(3, 14))

    asset_value = float(rng.lognormal(mean=np.log(550_000), sigma=0.72))
    asset_value *= 1 + 0.18 * years
    digital_adoption = _bounded(rng.beta(2.2, 2.0) * 100, 5, 98)
    livestock_count = int(round(capacity)) if sector in {"Dairy", "Poultry"} else 0
    sanctioned_limit = float(asset_value * rng.uniform(0.18, 0.52))
    initial_loan = sanctioned_limit * rng.uniform(0.45, 0.95)

    health_profile = rng.choice(["healthy", "watchlist", "stressed"], p=[0.60, 0.25, 0.15])
    profile_margin_adjustment = {
        "healthy": rng.uniform(0.08, 0.20),
        "watchlist": rng.uniform(-0.02, 0.07),
        "stressed": rng.uniform(-0.18, -0.03),
    }[health_profile]

    return {
        "entity_id": f"RE-{enterprise_num:05d}",
        "sector": sector,
        "district": district,
        "block": block,
        "enterprise_type": enterprise_type,
        "ownership_type": ownership_type,
        "years_in_operation": years,
        "worker_count": workers,
        "asset_value": asset_value,
        "livestock_count": livestock_count,
        "production_capacity": capacity,
        "digital_adoption_score": digital_adoption,
        "sanctioned_credit_limit": sanctioned_limit,
        "initial_loan_outstanding": initial_loan,
        "health_profile": health_profile,
        "profile_margin_adjustment": profile_margin_adjustment,
    }


def _generate_enterprise_rows(
    static: Dict[str, object],
    dates: pd.DatetimeIndex,
    climate_lookup: pd.DataFrame,
    market_lookup: pd.DataFrame,
    rng: np.random.Generator,
) -> Iterable[Dict[str, object]]:
    health_profile = static["health_profile"]
    margin_adj = float(static["profile_margin_adjustment"])
    
    sector = str(static["sector"])
    cfg = SECTOR_CONFIG[sector]
    
    adjusted_variable_cost_ratio = max(0.1, cfg["variable_cost_ratio"] - margin_adj)
    volatility_scale = 1.0 if health_profile == "healthy" else (1.5 if health_profile == "watchlist" else 2.5)
    
    capacity_scale = float(static["production_capacity"]) / ((cfg["capacity_low"] + cfg["capacity_high"]) / 2)
    maturity_scale = 0.82 + min(float(static["years_in_operation"]), 15) * 0.018
    base_inflow = cfg["base_monthly_inflow"] * capacity_scale * maturity_scale * rng.lognormal(0, 0.18)
    fixed_cost = cfg["fixed_cost"] * (0.75 + 0.22 * np.sqrt(float(static["worker_count"])))

    loan_outstanding = float(static["initial_loan_outstanding"])
    sanctioned_limit = float(static["sanctioned_credit_limit"])
    annual_rate = rng.uniform(0.105, 0.175)
    tenure_remaining = int(rng.integers(24, 61))
    monthly_rate = annual_rate / 12
    scheduled_emi = (
        loan_outstanding * monthly_rate * (1 + monthly_rate) ** tenure_remaining
        / ((1 + monthly_rate) ** tenure_remaining - 1)
        if loan_outstanding > 0
        else 0.0
    )
    has_seasonal_repayment = bool(rng.random() < 0.22)
    
    cash_multiplier = 0.8 if health_profile == "healthy" else (0.4 if health_profile == "watchlist" else 0.1)
    cash_balance = float(rng.uniform(cash_multiplier, cash_multiplier + 0.4) * base_inflow)
    previous_dpd = 0 if health_profile == "healthy" else (15 if health_profile == "watchlist" else 45)
    restructured = 0
    enterprise_trend = rng.normal(0.004, 0.004) if health_profile == "healthy" else rng.normal(-0.002, 0.004)
    idiosyncratic_state = rng.normal(0, 0.025 * volatility_scale)

    for t, date in enumerate(dates):
        climate = climate_lookup.loc[(str(static["district"]), str(static["block"]), date)]
        market = market_lookup.loc[(sector, date)]
        month_idx = date.month - 1

        idiosyncratic_state = 0.55 * idiosyncratic_state + rng.normal(0, 0.035 * volatility_scale)
        one_off_shock = 0.0
        if rng.random() < (0.025 * volatility_scale):
            one_off_shock = rng.uniform(-0.22, -0.08)

        climate_effect = -cfg["climate_sensitivity"] * float(climate["climate_risk_score"]) / 100
        demand_effect = (float(market["local_demand_index"]) - 100) / 100 * cfg["market_sensitivity"]
        output_price_effect = (
            float(market["output_commodity_price"]) / cfg["output_price"] - 1
        ) * 0.35
        seasonality = SEASONALITY[sector][month_idx]
        growth = 1 + enterprise_trend * t

        operating_inflow = base_inflow * seasonality * growth * (
            1 + demand_effect + output_price_effect + climate_effect + idiosyncratic_state + one_off_shock
        )
        operating_inflow = max(8_000.0, operating_inflow * rng.lognormal(0, 0.06 * volatility_scale))

        input_pressure = max(0.72, float(market["input_cost_index"]) / 100)
        variable_cost = operating_inflow * adjusted_variable_cost_ratio * input_pressure
        climate_cost = operating_inflow * float(climate["climate_risk_score"]) / 100 * 0.055 * volatility_scale
        disruption_cost = operating_inflow * float(market["market_disruption_flag"]) * rng.uniform(0.02, 0.07 * volatility_scale)
        operating_outflow = fixed_cost + variable_cost + climate_cost + disruption_cost
        operating_outflow *= rng.lognormal(0, 0.045)

        digital_share = _bounded(
            0.08 + float(static["digital_adoption_score"]) / 125 + (t / max(len(dates) - 1, 1)) * 0.12 + rng.normal(0, 0.035),
            0.05,
            0.92,
        )
        upi_inflow_value = operating_inflow * digital_share
        upi_outflow_value = operating_outflow * _bounded(digital_share * rng.uniform(0.55, 0.88), 0.03, 0.82)
        avg_in_ticket = rng.uniform(380, 2200) if sector == "Rural Retail" else rng.uniform(1200, 8500)
        avg_out_ticket = rng.uniform(700, 6500)
        upi_inflow_count = max(1, int(round(upi_inflow_value / avg_in_ticket)))
        upi_outflow_count = max(1, int(round(upi_outflow_value / avg_out_ticket)))
        upi_active_days = int(np.clip(round(8 + digital_share * 22 + rng.normal(0, 2.5)), 3, 31))

        scheduled_loan_repayment = 0.0
        if has_seasonal_repayment and date.month in {3, 9}:
            scheduled_loan_repayment = min(loan_outstanding * 0.055, base_inflow * 0.18)

        scheduled_debt = min(loan_outstanding, scheduled_emi + scheduled_loan_repayment)
        pre_debt_cash = cash_balance + operating_inflow - operating_outflow
        repayment_capacity = max(0.0, pre_debt_cash + max(cash_balance, 0) * 0.20)
        amount_repaid = min(scheduled_debt, repayment_capacity)

        shortfall_ratio = 0.0 if scheduled_debt <= 1 else max(0.0, 1 - amount_repaid / scheduled_debt)
        if shortfall_ratio > 0.50:
            days_past_due = min(120, max(previous_dpd + int(rng.integers(12, 32)), 30))
        elif shortfall_ratio > 0.10:
            days_past_due = min(60, max(previous_dpd + int(rng.integers(3, 14)), 7))
        else:
            days_past_due = max(0, previous_dpd - int(rng.integers(8, 24)))

        interest_component = loan_outstanding * monthly_rate
        principal_paid = max(0.0, amount_repaid - interest_component)
        loan_outstanding = max(0.0, loan_outstanding - principal_paid)
        closing_cash_balance = cash_balance + operating_inflow - operating_outflow - amount_repaid
        closing_cash_balance = max(-0.35 * base_inflow, closing_cash_balance)

        net_operating_cashflow = operating_inflow - operating_outflow
        dscr = net_operating_cashflow / max(scheduled_debt, 1.0)
        debt_service_ratio = scheduled_debt / max(operating_inflow, 1.0)
        credit_utilisation = loan_outstanding / max(sanctioned_limit, 1.0)

        if days_past_due >= 45 and previous_dpd >= 30 and t >= 10:
            restructured = 1
            scheduled_emi *= 0.86

        yield {
            **{k: v for k, v in static.items() if k not in {"initial_loan_outstanding", "health_profile", "profile_margin_adjustment"}},
            "date": date,
            "time_idx": t,
            "month": date.month,
            "quarter": f"Q{date.quarter}",
            "is_festival_month": int(date.month in {10, 11}),
            "operating_inflow": operating_inflow,
            "operating_outflow": operating_outflow,
            "opening_cash_balance": cash_balance,
            "closing_cash_balance": closing_cash_balance,
            "net_operating_cashflow": net_operating_cashflow,
            "upi_inflow_value": upi_inflow_value,
            "upi_inflow_count": upi_inflow_count,
            "upi_outflow_value": upi_outflow_value,
            "upi_outflow_count": upi_outflow_count,
            "upi_active_days": upi_active_days,
            "digital_collection_share": digital_share,
            "average_upi_ticket_size": upi_inflow_value / max(upi_inflow_count, 1),
            "output_commodity_price": float(market["output_commodity_price"]),
            "input_commodity_price": float(market["input_commodity_price"]),
            "local_demand_index": float(market["local_demand_index"]),
            "input_cost_index": float(market["input_cost_index"]),
            "market_disruption_flag": int(market["market_disruption_flag"]),
            "rainfall_mm": float(climate["rainfall_mm"]),
            "rainfall_anomaly_pct": float(climate["rainfall_anomaly_pct"]),
            "temperature_mean": float(climate["temperature_mean"]),
            "extreme_heat_days": int(climate["extreme_heat_days"]),
            "consecutive_dry_days": int(climate["consecutive_dry_days"]),
            "excess_rainfall_days": int(climate["excess_rainfall_days"]),
            "climate_risk_score": float(climate["climate_risk_score"]),
            "forecast_rainfall_anomaly_pct": float(climate["forecast_rainfall_anomaly_pct"]),
            "forecast_temperature_mean": float(climate["forecast_temperature_mean"]),
            "commodity_price_scenario": float(market["commodity_price_scenario"]),
            "input_cost_scenario": float(market["input_cost_scenario"]),
            "loan_outstanding": loan_outstanding,
            "scheduled_emi": scheduled_emi,
            "scheduled_loan_repayment": scheduled_loan_repayment,
            "amount_repaid": amount_repaid,
            "days_past_due": days_past_due,
            "debt_service_ratio": debt_service_ratio,
            "dscr": dscr,
            "credit_utilisation": credit_utilisation,
            "restructured_flag": restructured,
        }
        cash_balance = closing_cash_balance
        previous_dpd = days_past_due


def _add_derived_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.sort_values(["entity_id", "time_idx"]).reset_index(drop=True)
    group = df.groupby("entity_id", sort=False)

    df["upi_inflow_growth_1m"] = group["upi_inflow_value"].pct_change(1).replace([np.inf, -np.inf], np.nan)
    df["upi_inflow_growth_3m"] = group["upi_inflow_value"].pct_change(3).replace([np.inf, -np.inf], np.nan)
    df["upi_active_days_change"] = group["upi_active_days"].diff(1)
    df["commodity_price_change_1m"] = group["output_commodity_price"].pct_change(1)
    df["commodity_price_change_3m"] = group["output_commodity_price"].pct_change(3)
    df["commodity_price_volatility_3m"] = group["output_commodity_price"].transform(
        lambda s: s.pct_change().rolling(3, min_periods=2).std()
    )
    df["repayment_delay_count_6m"] = group["days_past_due"].transform(
        lambda s: (s > 0).astype(int).rolling(6, min_periods=1).sum()
    )
    df["cash_after_debt_service"] = (
        df["operating_inflow"]
        - df["operating_outflow"]
        - df["scheduled_emi"]
        - df["scheduled_loan_repayment"]
    )

    def _future_label(series: pd.Series, condition) -> pd.Series:
        shifted = pd.concat([series.shift(-i) for i in (1, 2, 3)], axis=1)
        complete = shifted.notna().all(axis=1)
        values = condition(shifted).astype(float)
        values[~complete] = -1.0
        return values

    df["cash_deficit_3m"] = group["cash_after_debt_service"].transform(
        lambda s: _future_label(s, lambda x: (x < 0).any(axis=1))
    )
    df["persistent_stress_3m"] = group["cash_after_debt_service"].transform(
        lambda s: _future_label(s, lambda x: ((x < 0).sum(axis=1) >= 2))
    )
    future_dscr = pd.concat([group["dscr"].shift(-i) for i in (1, 2, 3)], axis=1)
    future_dpd = pd.concat([group["days_past_due"].shift(-i) for i in (1, 2, 3)], axis=1)
    complete = future_dscr.notna().all(axis=1) & future_dpd.notna().all(axis=1)
    repayment_risk = ((future_dscr < 1.0).any(axis=1) | (future_dpd > 30).any(axis=1)).astype(float)
    repayment_risk[~complete] = -1.0
    df["repayment_risk_3m"] = repayment_risk.to_numpy()
    return df


def _inject_missingness(df: pd.DataFrame, rate: float, rng: np.random.Generator) -> pd.DataFrame:
    if rate <= 0:
        return df
    missing_candidates = [
        "upi_inflow_value",
        "upi_outflow_value",
        "upi_active_days",
        "rainfall_anomaly_pct",
        "temperature_mean",
        "output_commodity_price",
        "input_commodity_price",
        "local_demand_index",
    ]
    for col in missing_candidates:
        mask = rng.random(len(df)) < rate
        # Keep the first row of every entity intact for stable forward filling.
        mask &= df["time_idx"].to_numpy() > 0
        df.loc[mask, col] = np.nan
    return df


def generate_dataset(config: GeneratorConfig) -> pd.DataFrame:
    if config.months < 30:
        raise ValueError("At least 30 months are required; 36 is recommended for 24/6/6 splitting.")
    if config.n_enterprises < 1:
        raise ValueError("n_enterprises must be positive")

    rng = np.random.default_rng(config.seed)
    dates = pd.date_range(config.start_date, periods=config.months, freq="MS")
    climate, market = _make_environment(dates, rng)
    climate_lookup = climate.set_index(["district", "block", "date"])
    market_lookup = market.set_index(["sector", "date"])

    rows = []
    for i in range(1, config.n_enterprises + 1):
        static = _sample_enterprise_static(rng, i)
        rows.extend(_generate_enterprise_rows(static, dates, climate_lookup, market_lookup, rng))

    df = pd.DataFrame(rows)
    df = _add_derived_features(df)
    df = _inject_missingness(df, config.missing_rate, rng)
    return df


def _metadata(df: pd.DataFrame, config: GeneratorConfig) -> Dict[str, object]:
    return {
        "dataset_name": "GramPulse NABARD Rural Enterprise Panel v1",
        "privacy": "Fully synthetic; no PII and no individual UPI transaction records",
        "n_enterprises": int(df["entity_id"].nunique()),
        "n_rows": int(len(df)),
        "months_per_enterprise": int(config.months),
        "date_min": str(pd.to_datetime(df["date"]).min().date()),
        "date_max": str(pd.to_datetime(df["date"]).max().date()),
        "sectors": df["sector"].value_counts().to_dict(),
        "seed": config.seed,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--n-enterprises", type=int, default=3250)
    parser.add_argument("--months", type=int, default=36)
    parser.add_argument("--start-date", default="2023-01-01")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--missing-rate", type=float, default=0.004)
    parser.add_argument(
        "--output",
        default="/kaggle/working/tft_experiment_temp/data/nabard_enterprise_monthly.csv",
    )
    args = parser.parse_args()

    config = GeneratorConfig(
        n_enterprises=args.n_enterprises,
        months=args.months,
        start_date=args.start_date,
        seed=args.seed,
        missing_rate=args.missing_rate,
    )
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)

    df = generate_dataset(config)
    df.to_csv(output, index=False)
    metadata_path = output.with_suffix(".metadata.json")
    metadata_path.write_text(json.dumps(_metadata(df, config), indent=2), encoding="utf-8")

    print(f"Generated {len(df):,} rows for {df['entity_id'].nunique():,} enterprises")
    print(f"Saved dataset: {output}")
    print(f"Saved metadata: {metadata_path}")
    print("Sector distribution:")
    print(df["sector"].value_counts().to_string())


if __name__ == "__main__":
    main()
