"""
Feature Engineer: transforms daily AA transactions into monthly ML features.

Supports two entity types with different feature sets:

MSME features:
  Core:        total_inflow, total_outflow, net_cashflow, emi_amount
  Lags:        net_cashflow_lag1/3/6
  Rolling:     net_cashflow_roll3/6, inflow_volatility6
  Ratios:      emi_to_inflow_ratio, inflow_concentration
  Trend:       inflow_trend_slope6
  Calendar:    month, inflow_mom_change

General User (personal finance) features:
  Core:        total_inflow, total_outflow, net_cashflow, emi_amount,
               rent_amount, subscription_amount
  Lags:        net_cashflow_lag1/3/6
  Rolling:     net_cashflow_roll3/6
  Ratios:      fixed_obligation_ratio, discretionary_spend_ratio, savings_rate
  Regularity:  salary_regularity (binary: did salary hit this month?)
  Trend:       upi_spend_trend (MoM change in UPI send), inflow_volatility6
  Calendar:    month, inflow_mom_change

Multi-account: aggregates across ALL accounts for an entity before feature
engineering, so the features represent the entity's consolidated cashflow.
"""
from __future__ import annotations

import numpy as np
import pandas as pd

MIN_MONTHS_MSME = 12
MIN_MONTHS_GENERAL = 6


def _rolling_slope(series: pd.Series) -> float:
    """Return linear regression slope for a series; NaN if too short or has NaN."""
    if series.isna().any() or len(series) < 3:
        return float("nan")
    x = np.arange(len(series), dtype=float)
    return float(np.polyfit(x, series.to_numpy(dtype=float), 1)[0])


def _aggregate_accounts(df: pd.DataFrame) -> pd.DataFrame:
    """
    Sum transactions across all accounts for a given entity, per day.
    This consolidates multi-account data into a single daily series.
    """
    agg_dict = {"amount": "sum"}
    if "closing_balance" in df.columns:
        agg_dict["closing_balance"] = "last"
        
    return df.groupby(
        ["entity_id", "date", "type", "narration", "category"], 
        as_index=False
    ).agg(agg_dict)


def build_monthly_features(
    df: pd.DataFrame,
    entity_id: str,
    entity_type: str | None = None,
    profile_df: pd.DataFrame | None = None,
) -> pd.DataFrame:
    """
    Aggregate daily transactions into monthly feature vectors.

    Multi-account support: transactions from all accounts for the entity are
    summed before any feature is computed — the output represents the entity's
    consolidated cashflow position.

    Args:
        df:          Categorized transactions DataFrame (requires: entity_id,
                     date, amount, type, category).
        entity_id:   The entity to process.
        entity_type: "msme" or "general" — controls which features are built
                     and the minimum months requirement.

    Returns:
        Monthly DataFrame sorted by period with all engineered features.

    Raises:
        ValueError: If the entity has fewer months than the minimum required.
    """
    # Filter entity
    entity_df = df[df["entity_id"] == entity_id].copy()

    # ── Determine entity_type if not explicitly provided ──────────────────────
    et = None
    if entity_type is not None:
        et = str(entity_type).lower().strip()
    elif profile_df is not None and not profile_df.empty:
        # Try to infer from profile
        prof = profile_df[profile_df["entity_id"] == entity_id]
        if not prof.empty and "employment_type" in prof.columns:
            emp = str(prof.iloc[0]["employment_type"]).lower()
            if emp in ["salaried", "personal", "retail", "general"]:
                et = "general"
            else:
                et = "msme"
    
    if et is None and "entity_type" in entity_df.columns:
        # Try to infer from transactions
        et_vals = entity_df["entity_type"].dropna().unique()
        if len(et_vals) > 0:
            et = str(et_vals[0]).lower().strip()
            
    if et is None:
        et = "msme"  # Fallback

    min_months = MIN_MONTHS_GENERAL if et == "general" else MIN_MONTHS_MSME

    # ── Multi-account consolidation ───────────────────────────────────────────
    # Aggregate across all accounts → one row per (date, type, narration, category)
    if "account_id" in entity_df.columns and entity_df["account_id"].nunique() > 1:
        entity_df = _aggregate_accounts(entity_df)

    entity_df["period"] = entity_df["date"].dt.to_period("M").dt.to_timestamp()

    n_months = entity_df["period"].nunique()
    if n_months < min_months:
        raise ValueError(
            f"Entity {entity_id} has {n_months} months of data; "
            f"minimum {min_months} months required for entity_type='{et}'."
        )

    # ── Core monthly inflow / outflow / net ───────────────────────────────────
    monthly = (
        entity_df.groupby(["period", "type"])["amount"]
        .sum()
        .unstack(fill_value=0)
        .reset_index()
    )
    monthly.columns.name = None
    if "credit" not in monthly.columns:
        monthly["credit"] = 0.0
    if "debit" not in monthly.columns:
        monthly["debit"] = 0.0
    monthly = monthly.rename(
        columns={"credit": "total_inflow", "debit": "total_outflow"}
    )
    monthly["net_cashflow"] = monthly["total_inflow"] - monthly["total_outflow"]

    # ── EMI amount per month (both entity types) ──────────────────────────────
    emi_monthly = (
        entity_df[entity_df["category"] == "emi"]
        .groupby("period")["amount"]
        .sum()
        .reset_index()
        .rename(columns={"amount": "emi_amount"})
    )
    monthly = monthly.merge(emi_monthly, on="period", how="left")
    monthly["emi_amount"] = monthly["emi_amount"].fillna(0.0)

    monthly = monthly.sort_values("period").reset_index(drop=True)

    # ── Month-End Balance ─────────────────────────────────────────────────────
    if "closing_balance" in entity_df.columns:
        closing = (
            entity_df.sort_values("date")
            .groupby("period")["closing_balance"]
            .last()
            .reset_index()
            .rename(columns={"closing_balance": "month_end_balance"})
        )
        monthly = monthly.merge(closing, on="period", how="left")
    else:
        monthly["month_end_balance"] = 0.0

    # ── Lag features (shared) ─────────────────────────────────────────────────
    for lag in [1, 2, 3, 6]:
        monthly[f"net_cashflow_lag{lag}"] = monthly["net_cashflow"].shift(lag)

    monthly["net_cashflow_roll3"] = monthly["net_cashflow"].shift(1).rolling(3).mean()
    monthly["net_cashflow_roll6"] = monthly["net_cashflow"].shift(1).rolling(6).mean()
    monthly["inflow_volatility6"] = monthly["total_inflow"].shift(1).rolling(6).std()
    monthly["month"] = monthly["period"].dt.month
    monthly["inflow_mom_change"] = monthly["total_inflow"].pct_change()

    # ── Entity-type-specific features ─────────────────────────────────────────
    if et == "msme":
        monthly = _add_msme_features(monthly, entity_df)
    else:
        monthly = _add_general_features(monthly, entity_df)

    # ── Category & Habit Lags ─────────────────────────────────────────────────
    # Add lag 1 for newly generated amount columns, habit counts, and month_end_balance
    for col in list(monthly.columns):
        if col.endswith("_amount") or col.endswith("_txn_count") or col == "month_end_balance":
            monthly[f"{col}_lag1"] = monthly[col].shift(1)

    # ── Behavioral signals ────────────────────────────────────────────────────
    FESTIVAL_MONTHS = {10, 11}
    GST_FILING_MONTHS = {1, 4, 7, 10}
    ADVANCE_TAX_MONTHS = {3, 6, 9, 12}
    
    monthly["is_festival_month"] = monthly["month"].isin(FESTIVAL_MONTHS).astype(int)
    monthly["is_gst_filing_month"] = monthly["month"].isin(GST_FILING_MONTHS).astype(int)
    monthly["is_advance_tax_month"] = monthly["month"].isin(ADVANCE_TAX_MONTHS).astype(int)
    monthly["quarter"] = ((monthly["month"] - 1) // 3 + 1).astype(str)
    
    salary_txns = entity_df[entity_df["category"] == "salary"]
    if not salary_txns.empty:
        mode_day = salary_txns["date"].dt.day.mode()
        monthly["salary_date"] = mode_day.iloc[0] if not mode_day.empty else 0
    else:
        monthly["salary_date"] = 0

    # ── Merge Profile Features ────────────────────────────────────────────────
    if profile_df is not None and not profile_df.empty:
        prof = profile_df[profile_df["entity_id"] == entity_id]
        if not prof.empty:
            for col in prof.columns:
                if col not in ["entity_id", "period", "date"]:
                    monthly[col] = prof.iloc[0][col]

    monthly["entity_id"] = entity_id
    monthly["entity_type"] = et
    return monthly


# ── MSME-specific features ────────────────────────────────────────────────────

def _add_msme_features(monthly: pd.DataFrame, entity_df: pd.DataFrame) -> pd.DataFrame:
    """Add MSME-specific features: inflow_concentration, inflow_trend_slope6, emi_to_inflow_ratio."""

    # Top counterparty concentration (inflow only)
    inflows = entity_df[entity_df["type"] == "credit"].copy()

    def _concentration(g: pd.DataFrame) -> float:
        total = g["amount"].sum()
        if total <= 0:
            return 0.0
        return float(g.groupby("narration")["amount"].sum().max() / total)

    concentration = (
        inflows.groupby("period")
        .apply(_concentration, include_groups=False)  # type: ignore
        .reset_index()
        .rename(columns={0: "inflow_concentration"})
    )
    monthly = monthly.merge(concentration, on="period", how="left")
    monthly["inflow_concentration"] = monthly["inflow_concentration"].fillna(0.0)

    # Inflow trend slope (6-month rolling linear regression)
    monthly["inflow_trend_slope6"] = (
        monthly["total_inflow"]
        .shift(1)
        .rolling(6)
        .apply(_rolling_slope, raw=False)
    )

    # EMI-to-inflow ratio
    monthly["emi_to_inflow_ratio"] = np.where(
        monthly["total_inflow"] > 0,
        (monthly["emi_amount"] / monthly["total_inflow"]).clip(0.0, 1.0),
        np.nan,
    )
    return monthly


# ── General User-specific features ───────────────────────────────────────────

def _add_general_features(monthly: pd.DataFrame, entity_df: pd.DataFrame) -> pd.DataFrame:
    """
    Add personal-finance features:
      rent_amount, subscription_amount
      fixed_obligation_ratio  = (emi + rent + subscription) / inflow
      discretionary_spend_ratio = (food + entertainment) / inflow
      savings_rate            = net_cashflow / inflow
      salary_regularity       = 1 if salary received this month else 0
      upi_spend_trend         = MoM change in UPI-send amount
    """
    # ── Component category amounts and habits per month ───────────────────────
    for cat in ["rent", "subscription", "food", "entertainment", "upi_send", "investment", "transport", "high_risk"]:
        cat_data = entity_df[entity_df["category"] == cat]
        
        # Total Amount
        cat_monthly = cat_data.groupby("period")["amount"].sum().reset_index().rename(columns={"amount": f"{cat}_amount"})
        monthly = monthly.merge(cat_monthly, on="period", how="left")
        monthly[f"{cat}_amount"] = monthly[f"{cat}_amount"].fillna(0.0)
        
        # Habit: Transaction Frequency (Count)
        cat_count = cat_data.groupby("period")["amount"].count().reset_index().rename(columns={"amount": f"{cat}_txn_count"})
        monthly = monthly.merge(cat_count, on="period", how="left")
        monthly[f"{cat}_txn_count"] = monthly[f"{cat}_txn_count"].fillna(0.0)

    # ── Salary regularity: binary flag ───────────────────────────────────────
    salary_months = set(
        entity_df[entity_df["category"] == "salary"]["period"].unique()
    )
    monthly["salary_regularity"] = monthly["period"].apply(
        lambda p: 1 if p in salary_months else 0
    )

    # ── Aggregated ratios ─────────────────────────────────────────────────────
    monthly["fixed_obligations"] = (
        monthly["emi_amount"]
        + monthly["rent_amount"]
        + monthly["subscription_amount"]
    )

    monthly["fixed_obligation_ratio"] = np.where(
        monthly["total_inflow"] > 0,
        (monthly["fixed_obligations"] / monthly["total_inflow"]).clip(0.0, 1.0),
        np.nan,
    )

    monthly["discretionary_spend_ratio"] = np.where(
        monthly["total_inflow"] > 0,
        (
            (monthly["food_amount"] + monthly["entertainment_amount"] + monthly["transport_amount"])
            / monthly["total_inflow"]
        ).clip(0.0, 1.0),
        np.nan,
    )

    # Savings rate treats investments as retained wealth, not lost cash
    monthly["savings_rate"] = np.where(
        monthly["total_inflow"] > 0,
        ((monthly["net_cashflow"] + monthly["investment_amount"]) / monthly["total_inflow"]).clip(-1.0, 1.0),
        np.nan,
    )

    monthly["wealth_creation_ratio"] = np.where(
        monthly["total_inflow"] > 0,
        (monthly["investment_amount"] / monthly["total_inflow"]).clip(0.0, 1.0),
        np.nan,
    )

    monthly["high_risk_spend_ratio"] = np.where(
        monthly["total_inflow"] > 0,
        (monthly["high_risk_amount"] / monthly["total_inflow"]).clip(0.0, 1.0),
        np.nan,
    )

    monthly["upi_to_inflow_ratio"] = np.where(
        monthly["total_inflow"] > 0,
        (monthly["upi_send_amount"] / monthly["total_inflow"]).clip(0.0, 1.0),
        np.nan,
    )

    # ── UPI spend trend (MoM pct change) ─────────────────────────────────────
    monthly["upi_spend_mom"] = monthly["upi_send_amount"].pct_change()

    # ── New EMI detection: jump in fixed obligations vs prior month ───────────
    monthly["fixed_obligation_mom"] = monthly["fixed_obligations"].pct_change()
    monthly["new_emi_detected"] = (
        monthly["fixed_obligation_mom"] > 0.15
    ).astype(int)

    return monthly
