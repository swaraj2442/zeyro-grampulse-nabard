"""Home Credit V2 — Full Feature Engineering Pipeline.

Extracts and engineers 100+ predictive signals from all 7 relational
tables in the Home Credit dataset.

Sources:
  application_train.csv  → demographics, income, asset ownership, social risk
  bureau.csv             → external credit history (debts, limits, overdue)
  bureau_balance.csv     → monthly DPD status history (entirely new)
  previous_application.csv → internal loan history, interest rates, rejection
  installments_payments.csv → repayment behaviour with recency weighting
  credit_card_balance.csv  → CC spending, utilisation, DPD
  POS_CASH_balance.csv     → internal point-of-sale DPD and obligations

Usage:
    python build_homecredit_v2.py
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

DATA_DIR = Path(r"d:\z-business\dummtdatasets\csv\homecredit_dataset")
OUTPUT_FILE = Path(r"d:\z-business\dummtdatasets\csv\homecredit_engineered_v2.csv")

HALF_LIFE_DAYS: int = 180  # 6-month exponential decay for recency weighting


def _load(filename: str, usecols: list[str]) -> pd.DataFrame:
    """Load a CSV from DATA_DIR with only the specified columns."""
    return pd.read_csv(DATA_DIR / filename, usecols=usecols)


def _build_application(df: pd.DataFrame) -> pd.DataFrame:
    """Engineer features from application_train.csv."""
    df = df.copy()

    # Age & employment
    df["age"] = df["DAYS_BIRTH"] / -365.0
    df["years_employed"] = (df["DAYS_EMPLOYED"] / -365.0).clip(lower=0)

    # Fill EXT_SOURCE nulls with column mean
    for col in ("EXT_SOURCE_1", "EXT_SOURCE_2", "EXT_SOURCE_3"):
        df[col] = df[col].fillna(df[col].mean())

    # --- Ratio & interaction features ---
    df["debt_income_ratio"]    = df["AMT_CREDIT"] / (df["AMT_INCOME_TOTAL"] + 1)
    df["annuity_income_ratio"] = df["AMT_ANNUITY"] / (df["AMT_INCOME_TOTAL"] + 1)
    df["ltv_ratio"]            = df["AMT_CREDIT"] / (
        df["AMT_GOODS_PRICE"].fillna(df["AMT_CREDIT"]) + 1
    )
    df["ext_source_product"] = (
        df["EXT_SOURCE_1"] * df["EXT_SOURCE_2"] * df["EXT_SOURCE_3"]
    )
    df["ext_source_mean"] = df[["EXT_SOURCE_1", "EXT_SOURCE_2", "EXT_SOURCE_3"]].mean(axis=1)

    # Social circle default rates (normalised)
    df["social_circle_default_rate_30"] = (
        df["DEF_30_CNT_SOCIAL_CIRCLE"] / (df["OBS_30_CNT_SOCIAL_CIRCLE"] + 1)
    )
    df["social_circle_default_rate_60"] = (
        df["DEF_60_CNT_SOCIAL_CIRCLE"] / (df["OBS_60_CNT_SOCIAL_CIRCLE"] + 1)
    )

    # Asset binary flags
    df["owns_car"]    = (df["FLAG_OWN_CAR"] == "Y").astype(int)
    df["owns_realty"] = (df["FLAG_OWN_REALTY"] == "Y").astype(int)

    # Recency signals (convert to positive days-ago)
    df["days_last_phone_change"] = df["DAYS_LAST_PHONE_CHANGE"].abs()
    df["days_id_publish"]        = df["DAYS_ID_PUBLISH"].abs()

    # One-Hot Encoding
    categoricals = [
        "NAME_EDUCATION_TYPE", "NAME_HOUSING_TYPE", "OCCUPATION_TYPE",
        "CODE_GENDER", "NAME_INCOME_TYPE", "NAME_FAMILY_STATUS",
    ]
    df = pd.get_dummies(df, columns=categoricals, dummy_na=True)

    df.rename(columns={"TARGET": "will_default"}, inplace=True)
    df.drop(columns=[
        "DAYS_BIRTH", "DAYS_EMPLOYED", "AMT_GOODS_PRICE",
        "FLAG_OWN_CAR", "FLAG_OWN_REALTY",
        "DEF_30_CNT_SOCIAL_CIRCLE", "OBS_30_CNT_SOCIAL_CIRCLE",
        "DEF_60_CNT_SOCIAL_CIRCLE", "OBS_60_CNT_SOCIAL_CIRCLE",
        "DAYS_LAST_PHONE_CHANGE", "DAYS_ID_PUBLISH",
    ], inplace=True, errors="ignore")

    return df


def _build_bureau(df_bureau: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Aggregate bureau.csv. Returns (bureau_agg, bureau_id_map)."""
    df = df_bureau.copy()
    df["is_active"] = (df["CREDIT_ACTIVE"] == "Active").astype(int)
    df["credit_history_length_days"] = df["DAYS_CREDIT"].abs()
    df["days_since_bureau_update"]   = df["DAYS_CREDIT_UPDATE"].abs()

    agg = df.groupby("SK_ID_CURR").agg(
        bureau_active_loans=("is_active", "sum"),
        bureau_total_loans=("SK_ID_CURR", "count"),
        bureau_total_debt=("AMT_CREDIT_SUM_DEBT", "sum"),
        bureau_total_limit=("AMT_CREDIT_SUM_LIMIT", "sum"),
        bureau_max_overdue=("AMT_CREDIT_MAX_OVERDUE", "max"),
        bureau_total_overdue=("AMT_CREDIT_SUM_OVERDUE", "sum"),  # NEW: live overdue amount
        bureau_mean_dpd=("CREDIT_DAY_OVERDUE", "mean"),
        bureau_max_credit_prolonged=("CNT_CREDIT_PROLONG", "max"),  # NEW: restructuring
        bureau_credit_history_days=("credit_history_length_days", "max"),  # NEW: history length
        bureau_days_since_update=("days_since_bureau_update", "min"),     # NEW: freshness
    ).reset_index()

    agg["bureau_utilisation"] = np.where(
        agg["bureau_total_limit"] > 0,
        agg["bureau_total_debt"] / agg["bureau_total_limit"],
        0.0,
    )
    # Keep ID map for bureau_balance join
    id_map = df[["SK_ID_BUREAU", "SK_ID_CURR"]].copy()
    return agg, id_map


def _build_bureau_balance(df_bb: pd.DataFrame, bureau_id_map: pd.DataFrame) -> pd.DataFrame:
    """Aggregate bureau_balance.csv (monthly DPD status per external credit)."""
    df = df_bb.merge(bureau_id_map, on="SK_ID_BUREAU", how="left")
    df["is_overdue"]        = df["STATUS"].isin(["1", "2", "3", "4", "5"]).astype(int)
    df["is_recent"]         = (df["MONTHS_BALANCE"] >= -12).astype(int)
    df["is_recent_overdue"] = df["is_overdue"] * df["is_recent"]

    agg = df.groupby("SK_ID_CURR").agg(
        bb_total_months=("MONTHS_BALANCE", "count"),
        bb_overdue_months_total=("is_overdue", "sum"),
        bb_overdue_months_recent=("is_recent_overdue", "sum"),
    ).reset_index()
    agg["bb_overdue_rate"] = agg["bb_overdue_months_total"] / (agg["bb_total_months"] + 1)
    return agg


def _build_prev_applications(df_prev: pd.DataFrame) -> pd.DataFrame:
    """Aggregate previous_application.csv."""
    df = df_prev.copy()
    df["is_refused"]  = (df["NAME_CONTRACT_STATUS"] == "Refused").astype(int)
    df["is_approved"] = (df["NAME_CONTRACT_STATUS"] == "Approved").astype(int)
    df["grant_ratio"] = np.where(
        df["AMT_APPLICATION"] > 0,
        df["AMT_CREDIT"] / df["AMT_APPLICATION"],
        1.0,
    )

    # Most frequent rejection reason per applicant
    reject_mode = (
        df[df["CODE_REJECT_REASON"].notna()]
        .groupby("SK_ID_CURR")["CODE_REJECT_REASON"]
        .agg(lambda x: x.mode().iloc[0] if len(x) > 0 else "NONE")
        .rename("prev_top_reject_reason")
        .reset_index()
    )

    agg = df.groupby("SK_ID_CURR").agg(
        prev_apps_refused=("is_refused", "sum"),
        prev_apps_approved=("is_approved", "sum"),
        prev_grant_ratio_mean=("grant_ratio", "mean"),
        prev_mean_down_payment=("AMT_DOWN_PAYMENT", "mean"),
        prev_mean_rate_down_payment=("RATE_DOWN_PAYMENT", "mean"),
        prev_most_recent_decision_days=("DAYS_DECISION", "max"),
        prev_mean_loan_term_payments=("CNT_PAYMENT", "mean"),       # NEW: avg loan term
        prev_mean_rate_interest=("RATE_INTEREST_PRIMARY", "mean"),  # NEW: avg interest rate charged
        prev_insured_rate=("NFLAG_INSURED_ON_APPROVAL", "mean"),    # NEW: took insurance (risk aware)
        prev_mean_hour_applied=("HOUR_APPR_PROCESS_START", "mean"), # NEW: time-of-day distress signal
    ).reset_index()

    agg = agg.merge(reject_mode, on="SK_ID_CURR", how="left")
    # One-Hot encode the top reject reason
    agg = pd.get_dummies(agg, columns=["prev_top_reject_reason"], dummy_na=True)
    return agg


def _build_installments(df_inst: pd.DataFrame) -> pd.DataFrame:
    """Aggregate installments_payments.csv with recency weighting."""
    df = df_inst.copy()
    df["days_late"] = df["DAYS_ENTRY_PAYMENT"] - df["DAYS_INSTALMENT"]
    df["payment_fraction"] = np.where(
        df["AMT_INSTALMENT"] > 0,
        df["AMT_PAYMENT"] / df["AMT_INSTALMENT"],
        1.0,
    )
    df["recency_weight"]     = np.exp(df["DAYS_INSTALMENT"] / HALF_LIFE_DAYS)
    df["weighted_days_late"] = df["days_late"] * df["recency_weight"]

    # Pre-filter for recent-only aggregation (avoids fragile lambda-on-index pattern)
    recent_mask = df["DAYS_INSTALMENT"] >= -180
    recent_frac = (
        df[recent_mask]
        .groupby("SK_ID_CURR")["payment_fraction"]
        .mean()
        .rename("inst_recent_payment_frac")
        .reset_index()
    )

    agg = df.groupby("SK_ID_CURR").agg(
        inst_max_days_late=("days_late", "max"),
        inst_mean_days_late=("days_late", "mean"),
        inst_mean_payment_fraction=("payment_fraction", "mean"),
        inst_weighted_late_sum=("weighted_days_late", "sum"),
        inst_weighted_late_mean=("weighted_days_late", "mean"),
    ).reset_index()

    return agg.merge(recent_frac, on="SK_ID_CURR", how="left")


def _build_credit_card(df_cc: pd.DataFrame) -> pd.DataFrame:
    """Aggregate credit_card_balance.csv."""
    agg = df_cc.groupby("SK_ID_CURR").agg(
        cc_mean_balance=("AMT_BALANCE", "mean"),
        cc_max_atm_drawings=("AMT_DRAWINGS_ATM_CURRENT", "max"),
        cc_max_dpd=("SK_DPD", "max"),
        cc_max_dpd_def=("SK_DPD_DEF", "max"),                         # NEW: defined DPD
        cc_mean_payment_total=("AMT_PAYMENT_TOTAL_CURRENT", "mean"),
        cc_mean_drawings_count=("CNT_DRAWINGS_CURRENT", "mean"),
        cc_mean_credit_limit=("AMT_CREDIT_LIMIT_ACTUAL", "mean"),
        cc_mean_receivable_principal=("AMT_RECEIVABLE_PRINCIPAL", "mean"),  # NEW: outstanding principal
        cc_mean_min_regularity=("AMT_INST_MIN_REGULARITY", "mean"),         # NEW: payment discipline
    ).reset_index()
    agg["cc_utilisation"] = np.where(
        agg["cc_mean_credit_limit"] > 0,
        agg["cc_mean_balance"] / agg["cc_mean_credit_limit"],
        0.0,
    )
    return agg


def _build_pos_cash(df_pos: pd.DataFrame) -> pd.DataFrame:
    """Aggregate POS_CASH_balance.csv."""
    return df_pos.groupby("SK_ID_CURR").agg(
        pos_max_dpd=("SK_DPD", "max"),
        pos_max_dpd_def=("SK_DPD_DEF", "max"),
        pos_mean_dpd=("SK_DPD", "mean"),
        pos_mean_instalment_future=("CNT_INSTALMENT_FUTURE", "mean"),  # NEW: ongoing obligation
    ).reset_index()


def build_dataset_v2() -> None:
    """Build and export the full V2 feature dataset."""

    # ── 1. Application ──────────────────────────────────────────────────────
    print("Loading application_train.csv...")
    cols_app = [
        "SK_ID_CURR", "TARGET", "DAYS_BIRTH", "DAYS_EMPLOYED",
        "AMT_INCOME_TOTAL", "AMT_CREDIT", "AMT_ANNUITY", "AMT_GOODS_PRICE",
        "EXT_SOURCE_1", "EXT_SOURCE_2", "EXT_SOURCE_3",
        "NAME_EDUCATION_TYPE", "NAME_HOUSING_TYPE", "OCCUPATION_TYPE",
        "CODE_GENDER", "NAME_INCOME_TYPE", "NAME_FAMILY_STATUS",
        "FLAG_OWN_CAR", "FLAG_OWN_REALTY",
        "CNT_CHILDREN", "CNT_FAM_MEMBERS",
        "REG_CITY_NOT_WORK_CITY", "LIVE_CITY_NOT_WORK_CITY",
        "REGION_RATING_CLIENT",
        "DEF_30_CNT_SOCIAL_CIRCLE", "OBS_30_CNT_SOCIAL_CIRCLE",
        "DEF_60_CNT_SOCIAL_CIRCLE", "OBS_60_CNT_SOCIAL_CIRCLE",
        "AMT_REQ_CREDIT_BUREAU_MON", "AMT_REQ_CREDIT_BUREAU_QRT",
        "AMT_REQ_CREDIT_BUREAU_YEAR",
        "DAYS_LAST_PHONE_CHANGE", "DAYS_ID_PUBLISH",
    ]
    df_app = _build_application(_load("application_train.csv", cols_app))

    # ── 2. Bureau ────────────────────────────────────────────────────────────
    print("Loading bureau.csv...")
    cols_bureau = [
        "SK_ID_BUREAU", "SK_ID_CURR", "CREDIT_ACTIVE",
        "AMT_CREDIT_SUM_DEBT", "AMT_CREDIT_SUM_LIMIT",
        "AMT_CREDIT_MAX_OVERDUE", "AMT_CREDIT_SUM_OVERDUE",
        "CREDIT_DAY_OVERDUE", "CNT_CREDIT_PROLONG",
        "DAYS_CREDIT", "DAYS_CREDIT_UPDATE",
    ]
    bureau_agg, bureau_id_map = _build_bureau(_load("bureau.csv", cols_bureau))

    # ── 3. Bureau Balance ────────────────────────────────────────────────────
    print("Loading bureau_balance.csv...")
    bb_agg = _build_bureau_balance(
        _load("bureau_balance.csv", ["SK_ID_BUREAU", "MONTHS_BALANCE", "STATUS"]),
        bureau_id_map,
    )
    del bureau_id_map

    # ── 4. Previous Applications ─────────────────────────────────────────────
    print("Loading previous_application.csv...")
    cols_prev = [
        "SK_ID_CURR", "NAME_CONTRACT_STATUS",
        "AMT_APPLICATION", "AMT_CREDIT",
        "AMT_DOWN_PAYMENT", "RATE_DOWN_PAYMENT",
        "DAYS_DECISION", "CNT_PAYMENT",
        "CODE_REJECT_REASON", "RATE_INTEREST_PRIMARY",
        "NFLAG_INSURED_ON_APPROVAL", "HOUR_APPR_PROCESS_START",
    ]
    prev_agg = _build_prev_applications(_load("previous_application.csv", cols_prev))

    # ── 5. Installments ──────────────────────────────────────────────────────
    print("Loading installments_payments.csv...")
    cols_inst = [
        "SK_ID_CURR", "AMT_INSTALMENT", "AMT_PAYMENT",
        "DAYS_INSTALMENT", "DAYS_ENTRY_PAYMENT",
    ]
    inst_agg = _build_installments(_load("installments_payments.csv", cols_inst))

    # ── 6. Credit Card ───────────────────────────────────────────────────────
    print("Loading credit_card_balance.csv...")
    cols_cc = [
        "SK_ID_CURR", "AMT_BALANCE", "AMT_DRAWINGS_ATM_CURRENT",
        "AMT_PAYMENT_TOTAL_CURRENT", "CNT_DRAWINGS_CURRENT",
        "AMT_CREDIT_LIMIT_ACTUAL", "SK_DPD", "SK_DPD_DEF",
        "AMT_RECEIVABLE_PRINCIPAL", "AMT_INST_MIN_REGULARITY",
    ]
    cc_agg = _build_credit_card(_load("credit_card_balance.csv", cols_cc))

    # ── 7. POS Cash ──────────────────────────────────────────────────────────
    print("Loading POS_CASH_balance.csv...")
    cols_pos = ["SK_ID_CURR", "SK_DPD", "SK_DPD_DEF", "CNT_INSTALMENT_FUTURE"]
    pos_agg = _build_pos_cash(_load("POS_CASH_balance.csv", cols_pos))

    # ── 8. Merge All ─────────────────────────────────────────────────────────
    print("Merging all tables...")
    df_final = df_app

    # Create 'has_history' flags based on whether the SK_ID_CURR existed in the respective aggregated tables
    df_final["has_bureau_history"] = df_final["SK_ID_CURR"].isin(bureau_agg["SK_ID_CURR"]).astype(int)
    df_final["has_previous_application"] = df_final["SK_ID_CURR"].isin(prev_agg["SK_ID_CURR"]).astype(int)
    df_final["has_installment_history"] = df_final["SK_ID_CURR"].isin(inst_agg["SK_ID_CURR"]).astype(int)
    df_final["has_cc_history"] = df_final["SK_ID_CURR"].isin(cc_agg["SK_ID_CURR"]).astype(int)
    df_final["has_pos_history"] = df_final["SK_ID_CURR"].isin(pos_agg["SK_ID_CURR"]).astype(int)

    for agg_df in [bureau_agg, bb_agg, prev_agg, inst_agg, cc_agg, pos_agg]:
        df_final = df_final.merge(agg_df, on="SK_ID_CURR", how="left")

    print("Leaving NaNs for behavioral features to allow XGBoost Sparsity Aware Splits...")
    # NOTE: df_app base features have already been imputed (e.g. EXT_SOURCE mean, clipping).
    # We DO NOT fillna(0) on the final joined dataframe because `0` has a distinct meaning
    # from `Missing` (e.g., 0 days late vs no installment history).


    print(f"Exporting V2 dataset with {df_final.shape[1]} columns to {OUTPUT_FILE}...")
    df_final.to_csv(OUTPUT_FILE, index=False)
    print(f"Done! Created {len(df_final)} rows.")


if __name__ == "__main__":
    build_dataset_v2()
