"""Utilities for the NABARD rural-enterprise cash-flow training notebook."""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Mapping, Sequence, Tuple

import numpy as np
import pandas as pd

TARGET_COLS = ["operating_inflow", "operating_outflow", "closing_cash_balance"]
STATIC_CATEGORICALS = ["sector", "district", "block", "enterprise_type", "ownership_type"]
STATIC_REALS = [
    "years_in_operation",
    "worker_count",
    "asset_value",
    "livestock_count",
    "production_capacity",
    "digital_adoption_score",
]
TIME_VARYING_KNOWN_REALS = [
    "month",
    "is_festival_month",
    "scheduled_emi",
    "scheduled_loan_repayment",
    "forecast_rainfall_anomaly_pct",
    "forecast_temperature_mean",
    "commodity_price_scenario",
    "input_cost_scenario",
]
TIME_VARYING_KNOWN_CATEGORICALS = ["quarter"]

RAW_REQUIRED_COLUMNS = [
    "entity_id",
    "date",
    "time_idx",
    *STATIC_CATEGORICALS,
    *STATIC_REALS,
    *TARGET_COLS,
    *TIME_VARYING_KNOWN_REALS,
    *TIME_VARYING_KNOWN_CATEGORICALS,
    "opening_cash_balance",
    "upi_inflow_value",
    "upi_inflow_count",
    "upi_outflow_value",
    "upi_outflow_count",
    "upi_active_days",
    "digital_collection_share",
    "average_upi_ticket_size",
    "upi_inflow_growth_1m",
    "upi_inflow_growth_3m",
    "upi_active_days_change",
    "output_commodity_price",
    "input_commodity_price",
    "commodity_price_change_1m",
    "commodity_price_change_3m",
    "commodity_price_volatility_3m",
    "local_demand_index",
    "input_cost_index",
    "market_disruption_flag",
    "rainfall_mm",
    "rainfall_anomaly_pct",
    "temperature_mean",
    "extreme_heat_days",
    "consecutive_dry_days",
    "excess_rainfall_days",
    "climate_risk_score",
    "loan_outstanding",
    "amount_repaid",
    "days_past_due",
    "repayment_delay_count_6m",
    "debt_service_ratio",
    "dscr",
    "credit_utilisation",
    "restructured_flag",
    "cash_deficit_3m",
    "persistent_stress_3m",
    "repayment_risk_3m",
]

ZERO_SEMANTIC_COLUMNS = [
    "is_festival_month",
    "market_disruption_flag",
    "extreme_heat_days",
    "consecutive_dry_days",
    "excess_rainfall_days",
    "scheduled_loan_repayment",
    "days_past_due",
    "repayment_delay_count_6m",
    "restructured_flag",
]

FORWARD_FILL_COLUMNS = [
    "upi_inflow_value",
    "upi_outflow_value",
    "upi_active_days",
    "rainfall_mm",
    "rainfall_anomaly_pct",
    "temperature_mean",
    "output_commodity_price",
    "input_commodity_price",
    "local_demand_index",
    "input_cost_index",
    "loan_outstanding",
]


def validate_required_columns(df: pd.DataFrame, required: Sequence[str] = RAW_REQUIRED_COLUMNS) -> None:
    missing = sorted(set(required) - set(df.columns))
    if missing:
        raise ValueError(f"Missing required columns: {missing}")


class RuralEnterprisePreprocessor:
    def __init__(self):
        self.sector_medians = {}
        self.global_medians = {}
        self.schema_version = "nabard-features-v1"

    def fit(self, df: pd.DataFrame) -> None:
        validate_required_columns(df)
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        for col in numeric_cols:
            self.sector_medians[col] = df.groupby("sector")[col].median().to_dict()
            self.global_medians[col] = df[col].median()

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        out = df.copy()
        out["date"] = pd.to_datetime(out["date"])
        # Ensure time_idx is present — reconstruct if needed
        if "time_idx" not in out.columns:
            out = out.sort_values(["entity_id", "date"]).reset_index(drop=True)
            out["time_idx"] = out.groupby("entity_id").cumcount()
        out = out.sort_values(["entity_id", "time_idx"]).reset_index(drop=True)

        for col in STATIC_CATEGORICALS + TIME_VARYING_KNOWN_CATEGORICALS:
            if col in out.columns:
                out[col] = out[col].astype("string").fillna("Unknown").astype(str)

        for col in FORWARD_FILL_COLUMNS:
            if col in out.columns:
                out[f"{col}_was_missing"] = out[col].isna().astype("int8")
                out[col] = out.groupby("entity_id", sort=False)[col].ffill()

        for col in ZERO_SEMANTIC_COLUMNS:
            if col in out.columns:
                out[col] = out[col].fillna(0)

        numeric_cols = out.select_dtypes(include=[np.number]).columns.tolist()
        remaining = [c for c in numeric_cols if out[c].isna().any()]
        if remaining:
            for col in remaining:
                if col in self.sector_medians:
                    sector_map = self.sector_medians[col]
                    global_val = self.global_medians.get(col, 0)
                    out[col] = out[col].fillna(out["sector"].map(sector_map))
                    out[col] = out[col].fillna(global_val)
                else:
                    out[col] = out[col].fillna(0)

        unresolved = out.columns[out.isna().any()].tolist()
        if unresolved:
            raise ValueError(f"Unresolved missing values after targeted imputation: {unresolved}")
        return out


def engineer_model_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create leakage-safe historical lags and rolling features."""
    out = df.copy().sort_values(["entity_id", "time_idx"]).reset_index(drop=True)
    out["net_operating_cashflow"] = out["operating_inflow"] - out["operating_outflow"]
    out["cash_after_debt_service"] = (
        out["net_operating_cashflow"] - out["scheduled_emi"] - out["scheduled_loan_repayment"]
    )
    out["forecast_dscr"] = out["net_operating_cashflow"] / (
        out["scheduled_emi"] + out["scheduled_loan_repayment"]
    ).clip(lower=1.0)
    out["history_months"] = out.groupby("entity_id", sort=False).cumcount() + 1

    feature_blocks = {}
    rich_sources = [
        "operating_inflow",
        "operating_outflow",
        "closing_cash_balance",
        "net_operating_cashflow",
    ]
    compact_sources = [
        "upi_inflow_value",
        "days_past_due",
        "loan_outstanding",
        "local_demand_index",
        "input_cost_index",
        "rainfall_anomaly_pct",
    ]

    for col in rich_sources:
        grouped = out.groupby("entity_id", sort=False)[col]
        for lag in (1, 2, 3, 6, 12):
            feature_blocks[f"{col}_lag{lag}"] = grouped.shift(lag)
        shifted = grouped.shift(1)
        for window in (3, 6, 12):
            grouped_shifted = shifted.groupby(out["entity_id"], sort=False)
            feature_blocks[f"{col}_roll{window}"] = grouped_shifted.transform(
                lambda values, w=window: values.rolling(w, min_periods=1).mean()
            )
        for window in (6, 12):
            grouped_shifted = shifted.groupby(out["entity_id"], sort=False)
            feature_blocks[f"{col}_std{window}"] = grouped_shifted.transform(
                lambda values, w=window: values.rolling(w, min_periods=2).std()
            )

    for col in compact_sources:
        grouped = out.groupby("entity_id", sort=False)[col]
        for lag in (1, 3, 6):
            feature_blocks[f"{col}_lag{lag}"] = grouped.shift(lag)
        shifted = grouped.shift(1)
        grouped_shifted = shifted.groupby(out["entity_id"], sort=False)
        for window in (3, 6):
            feature_blocks[f"{col}_roll{window}"] = grouped_shifted.transform(
                lambda values, w=window: values.rolling(w, min_periods=1).mean()
            )
        feature_blocks[f"{col}_std6"] = grouped_shifted.transform(
            lambda values: values.rolling(6, min_periods=2).std()
        )

    feature_frame = pd.DataFrame(feature_blocks, index=out.index)
    out = pd.concat([out, feature_frame], axis=1)
    grouped = out.groupby("entity_id", sort=False)
    out["inflow_mom_change"] = grouped["operating_inflow"].pct_change().replace([np.inf, -np.inf], np.nan)
    out["outflow_mom_change"] = grouped["operating_outflow"].pct_change().replace([np.inf, -np.inf], np.nan)
    out["debt_service_burden"] = (
        out["scheduled_emi"] + out["scheduled_loan_repayment"]
    ) / out["operating_inflow"].clip(lower=1.0)
    out["upi_to_inflow_ratio"] = out["upi_inflow_value"] / out["operating_inflow"].clip(lower=1.0)
    out["input_output_price_ratio"] = out["input_commodity_price"] / out["output_commodity_price"].clip(lower=1e-3)

    numeric_cols = out.select_dtypes(include=[np.number]).columns.tolist()
    sector_medians = out.groupby("sector")[numeric_cols].transform("median")
    out[numeric_cols] = out[numeric_cols].fillna(sector_medians)
    out[numeric_cols] = out[numeric_cols].fillna(out[numeric_cols].median(numeric_only=True))

    unresolved = out.columns[out.isna().any()].tolist()
    if unresolved:
        raise ValueError(f"Feature engineering left missing values: {unresolved}")
    return out

def split_24_6_6(df: pd.DataFrame) -> Dict[str, pd.DataFrame]:
    """Return sources for train, validation and untouched test windows.

    The full 36-month panel uses zero-based time_idx:
    train target source <= 23, validation source <= 29, test source <= 35.
    """
    if int(df["time_idx"].max()) < 35:
        raise ValueError("A 36-month panel (time_idx 0..35) is required for a 24/6/6 split.")
    return {
        "train": df[df["time_idx"] <= 23].copy(),
        "validation": df[df["time_idx"] <= 29].copy(),
        "test": df[df["time_idx"] <= 35].copy(),
    }


def validate_no_leakage(splits: Mapping[str, pd.DataFrame]) -> None:
    expected = {"train": 23, "validation": 29, "test": 35}
    for name, max_idx in expected.items():
        actual = int(splits[name]["time_idx"].max())
        if actual != max_idx:
            raise AssertionError(f"{name} max time_idx is {actual}, expected {max_idx}")
    if len(splits["train"]) >= len(splits["validation"]) or len(splits["validation"]) >= len(splits["test"]):
        raise AssertionError("Split sources must be nested chronologically: train < validation < test")


def observed_feature_columns(df: pd.DataFrame) -> List[str]:
    """Return a curated set of observed features without future-label leakage."""
    excluded = {
        "entity_id",
        "date",
        "time_idx",
        *STATIC_CATEGORICALS,
        *STATIC_REALS,
        *TIME_VARYING_KNOWN_REALS,
        *TIME_VARYING_KNOWN_CATEGORICALS,
        "cash_deficit_3m",
        "persistent_stress_3m",
        "repayment_risk_3m",
    }
    permitted_raw = {
        *TARGET_COLS,
        "opening_cash_balance",
        "net_operating_cashflow",
        "cash_after_debt_service",
        "forecast_dscr",
        "history_months",
        "upi_inflow_value",
        "upi_inflow_count",
        "upi_outflow_value",
        "upi_outflow_count",
        "upi_active_days",
        "digital_collection_share",
        "average_upi_ticket_size",
        "upi_inflow_growth_1m",
        "upi_inflow_growth_3m",
        "upi_active_days_change",
        "output_commodity_price",
        "input_commodity_price",
        "commodity_price_change_1m",
        "commodity_price_change_3m",
        "commodity_price_volatility_3m",
        "local_demand_index",
        "input_cost_index",
        "market_disruption_flag",
        "rainfall_mm",
        "rainfall_anomaly_pct",
        "temperature_mean",
        "extreme_heat_days",
        "consecutive_dry_days",
        "excess_rainfall_days",
        "climate_risk_score",
        "loan_outstanding",
        "amount_repaid",
        "days_past_due",
        "repayment_delay_count_6m",
        "debt_service_ratio",
        "dscr",
        "credit_utilisation",
        "restructured_flag",
        "inflow_mom_change",
        "outflow_mom_change",
        "debt_service_burden",
        "upi_to_inflow_ratio",
        "input_output_price_ratio",
    }
    engineered = {
        c for c in df.columns
        if any(token in c for token in ("_lag", "_roll", "_std"))
    }
    raw_missing_indicators = {c for c in df.columns if c.endswith("_was_missing")}
    candidates = (permitted_raw | engineered | raw_missing_indicators) - excluded
    return sorted(c for c in candidates if c in df.columns and pd.api.types.is_numeric_dtype(df[c]))

def make_naive_predictions(
    df: pd.DataFrame,
    forecast_start_idx: int = 30,
    horizon: int = 6,
) -> pd.DataFrame:
    """Create seasonal-naive and three-month moving-average forecasts."""
    records: List[Dict[str, object]] = []
    indexed = df.set_index(["entity_id", "time_idx"])
    entities = df["entity_id"].drop_duplicates().tolist()
    for entity_id in entities:
        for h in range(1, horizon + 1):
            target_idx = forecast_start_idx + h - 1
            for target in TARGET_COLS:
                seasonal_source = target_idx - 12
                seasonal = float(indexed.loc[(entity_id, seasonal_source), target])
                hist = [float(indexed.loc[(entity_id, t), target]) for t in range(forecast_start_idx - 3, forecast_start_idx)]
                moving = float(np.mean(hist))
                records.extend(
                    [
                        {
                            "model": "Seasonal Naive",
                            "entity_id": entity_id,
                            "time_idx": target_idx,
                            "horizon": h,
                            "target": target,
                            "y_pred": seasonal,
                        },
                        {
                            "model": "Moving Average (3M)",
                            "entity_id": entity_id,
                            "time_idx": target_idx,
                            "horizon": h,
                            "target": target,
                            "y_pred": moving,
                        },
                    ]
                )
    return pd.DataFrame(records)


def forecast_metric_table(pred_long: pd.DataFrame, actual_df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    actual = actual_df[["entity_id", "time_idx", *TARGET_COLS, "scheduled_emi", "scheduled_loan_repayment"]].copy()
    actual_long = actual.melt(
        id_vars=["entity_id", "time_idx", "scheduled_emi", "scheduled_loan_repayment"],
        value_vars=TARGET_COLS,
        var_name="target",
        value_name="y_true",
    )
    merged = pred_long.merge(actual_long, on=["entity_id", "time_idx", "target"], how="inner")
    merged["abs_error"] = (merged["y_true"] - merged["y_pred"]).abs()

    target_rows = []
    for (model, target, horizon), part in merged.groupby(["model", "target", "horizon"]):
        denom = part["y_true"].abs().sum()
        wape = 100 * part["abs_error"].sum() / max(denom, 1e-8)
        mae = part["abs_error"].mean()
        rmse = float(np.sqrt(np.mean((part["y_true"] - part["y_pred"]) ** 2)))
        target_rows.append(
            {"model": model, "target": target, "horizon": int(horizon), "WAPE%": wape, "MAE": mae, "RMSE": rmse}
        )
    target_metrics = pd.DataFrame(target_rows)

    # Stress metrics use the first three forecast months.
    wide = merged.pivot_table(
        index=["model", "entity_id", "time_idx", "horizon", "scheduled_emi", "scheduled_loan_repayment"],
        columns="target",
        values=["y_true", "y_pred"],
        aggfunc="first",
    ).reset_index()
    wide.columns = ["_".join([str(v) for v in col if str(v) != ""]).rstrip("_") if isinstance(col, tuple) else col for col in wide.columns]
    wide["actual_cash_after_debt"] = (
        wide["y_true_operating_inflow"]
        - wide["y_true_operating_outflow"]
        - wide["scheduled_emi"]
        - wide["scheduled_loan_repayment"]
    )
    wide["pred_cash_after_debt"] = (
        wide["y_pred_operating_inflow"]
        - wide["y_pred_operating_outflow"]
        - wide["scheduled_emi"]
        - wide["scheduled_loan_repayment"]
    )

    summary_rows = []
    for model, model_part in merged.groupby("model"):
        row: Dict[str, object] = {"model": model}
        for horizon in (1, 3, 6):
            values = target_metrics[(target_metrics["model"] == model) & (target_metrics["horizon"] == horizon)]["WAPE%"]
            row[f"{horizon}M Mean Target WAPE%"] = float(values.mean()) if len(values) else np.nan

        stress_part = wide[(wide["model"] == model) & (wide["horizon"] <= 3)]
        flags = stress_part.groupby("entity_id").agg(
            actual_stress=("actual_cash_after_debt", lambda s: int((s < 0).any())),
            predicted_stress=("pred_cash_after_debt", lambda s: int((s < 0).any())),
        )
        tp = int(((flags["actual_stress"] == 1) & (flags["predicted_stress"] == 1)).sum())
        fn = int(((flags["actual_stress"] == 1) & (flags["predicted_stress"] == 0)).sum())
        fp = int(((flags["actual_stress"] == 0) & (flags["predicted_stress"] == 1)).sum())
        row["Stress Recall%"] = 100 * tp / max(tp + fn, 1)
        row["Stress Precision%"] = 100 * tp / max(tp + fp, 1)
        summary_rows.append(row)
    return target_metrics, pd.DataFrame(summary_rows)


@dataclass
class RiskDriver:
    feature: str
    observed_value: float | str
    unit: str
    contribution_points: float
    explanation: str


@dataclass
class EarlyWarningRecord:
    enterprise_id: str
    risk_score: int
    risk_level: str
    stress_month: str | None
    risk_confidence_index: float
    forecast_deficit: float
    debt_service_shortfall: float
    warning_lead_time_days: int
    recommended_intervention: str
    drivers: List[RiskDriver]

    def to_json(self, path: str | Path | None = None) -> str:
        payload = asdict(self)
        text = json.dumps(payload, indent=2, ensure_ascii=False)
        if path is not None:
            Path(path).write_text(text, encoding="utf-8")
        return text


def build_early_warning(
    enterprise_id: str,
    forecast_rows: pd.DataFrame,
    latest_observed: pd.Series,
) -> EarlyWarningRecord:
    """Build a deterministic, auditable risk score from validated forecasts."""
    future = forecast_rows.sort_values("time_idx").head(3).copy()
    required = {"pred_operating_inflow", "pred_operating_outflow", "scheduled_emi", "scheduled_loan_repayment", "date"}
    missing = required - set(future.columns)
    if missing:
        raise ValueError(f"Forecast rows missing risk-engine fields: {sorted(missing)}")

    future["pred_cash_after_debt"] = (
        future["pred_operating_inflow"]
        - future["pred_operating_outflow"]
        - future["scheduled_emi"]
        - future["scheduled_loan_repayment"]
    )
    debt_service = (future["scheduled_emi"] + future["scheduled_loan_repayment"])
    net_operating_cashflow = (future["pred_operating_inflow"] - future["pred_operating_outflow"])
    future["pred_dscr"] = np.where(debt_service >= 1000, net_operating_cashflow / debt_service, np.nan)
    future["debt_service_shortfall"] = np.maximum(debt_service - net_operating_cashflow, 0)
    debt_service_shortfall = float(future["debt_service_shortfall"].max())

    scale = max(float(future["pred_operating_inflow"].median()), 1.0)
    min_cash = float(future["pred_cash_after_debt"].min())
    min_dscr = float(np.nanmin(future["pred_dscr"])) if not np.isnan(future["pred_dscr"]).all() else 999.0
    
    deficit_component = float(np.clip(-min_cash / (0.35 * scale), 0, 1))
    dscr_component = float(np.clip(1 - min_dscr, 0, 1)) if min_dscr != 999.0 else 0.0
    inflow_std = float(latest_observed.get("operating_inflow_std6", 0.0))
    inflow_mean = max(float(latest_observed.get("operating_inflow_roll6", scale)), 1.0)
    volatility_component = float(np.clip((inflow_std / inflow_mean) / 0.45, 0, 1))
    
    dpd = float(latest_observed.get("days_past_due", 0))
    repayment_component = float(
        np.clip(
            dpd / 60 * 0.6
            + float(latest_observed.get("repayment_delay_count_6m", 0)) / 6 * 0.4,
            0,
            1,
        )
    )
    market_component = float(
        np.clip(
            max(float(latest_observed.get("input_cost_index", 100)) - 100, 0) / 35 * 0.65
            + max(100 - float(latest_observed.get("local_demand_index", 100)), 0) / 35 * 0.25
            + float(latest_observed.get("market_disruption_flag", 0)) * 0.10,
            0,
            1,
        )
    )
    climate_component = float(np.clip(float(latest_observed.get("climate_risk_score", 0)) / 100, 0, 1))

    contributions = {
        "Forecasted cash deficit": 35 * deficit_component,
        "Debt-service capacity": 25 * dscr_component,
        "Income volatility": 15 * volatility_component,
        "Repayment behaviour": 10 * repayment_component,
        "Market stress": 8 * market_component,
        "Climate stress": 7 * climate_component,
    }
    risk_score = int(round(sum(contributions.values())))
    risk_level = "High" if risk_score >= 70 else "Medium" if risk_score >= 40 else "Low"

    deficit_rows = future[future["pred_cash_after_debt"] < 0]
    stress_month = None if deficit_rows.empty else pd.to_datetime(deficit_rows.iloc[0]["date"]).strftime("%B %Y")
    forecast_deficit = abs(min(min_cash, 0.0))
    risk_confidence_index = float(np.clip(0.18 + risk_score / 100 * 0.78, 0.05, 0.96))
    warning_lead_time_days = 0 if stress_month is None else max(30, int((pd.to_datetime(deficit_rows.iloc[0]["date"]) - pd.to_datetime(latest_observed["date"])).days))

    def _get_obs(name):
        return {
            "Forecasted cash deficit": (min_cash, "INR"),
            "Debt-service capacity": (min_dscr if min_dscr != 999.0 else "N/A", "DSCR"),
            "Income volatility": (inflow_std / inflow_mean, "ratio"),
            "Repayment behaviour": (dpd, "days"),
            "Market stress": (float(latest_observed.get('input_cost_index', 100)), "index_100"),
            "Climate stress": (float(latest_observed.get('climate_risk_score', 0)), "score_out_of_100"),
        }[name]

    drivers = [
        RiskDriver(
            feature=name,
            observed_value=round(_get_obs(name)[0], 2) if isinstance(_get_obs(name)[0], float) else _get_obs(name)[0],
            unit=_get_obs(name)[1],
            contribution_points=round(value, 2),
            explanation={
                "Forecasted cash deficit": f"Worst projected three-month post-debt cash position is ₹{min_cash:,.0f}.",
                "Debt-service capacity": f"Minimum projected DSCR is {min_dscr:.2f}." if min_dscr != 999.0 else "No material scheduled debt obligation.",
                "Income volatility": f"Six-month inflow coefficient of variation is {inflow_std / inflow_mean:.2f}.",
                "Repayment behaviour": f"Current DPD is {dpd:.0f} days.",
                "Market stress": f"Input-cost index is {float(latest_observed.get('input_cost_index', 100)):.1f}.",
                "Climate stress": f"Climate-risk score is {float(latest_observed.get('climate_risk_score', 0)):.1f}/100.",
            }[name],
        )
        for name, value in sorted(contributions.items(), key=lambda item: item[1], reverse=True)
        if value >= 1.0
    ]

    if deficit_component >= 0.55 and dscr_component >= 0.35:
        intervention = "Working-capital review with seasonal repayment restructuring assessment"
    elif market_component >= 0.50:
        intervention = "Market-linkage and input-cost support review"
    elif climate_component >= 0.50:
        intervention = "Climate-shock field verification and contingency planning"
    else:
        intervention = "Field review and 30-day cash-flow monitoring"

    return EarlyWarningRecord(
        enterprise_id=enterprise_id,
        risk_score=risk_score,
        risk_level=risk_level,
        stress_month=stress_month,
        risk_confidence_index=round(risk_confidence_index, 3),
        forecast_deficit=round(forecast_deficit, 2),
        debt_service_shortfall=round(debt_service_shortfall, 2),
        warning_lead_time_days=warning_lead_time_days,
        recommended_intervention=intervention,
        drivers=drivers,
    )
