"""generate_underwriting_labels.py

Derives repayment_failure_6m binary labels from the existing synthetic panel.
Run once before train_underwriting_model.py.

Label definition:
  repayment_failure_6m = 1 if, in the next 6 months after this row:
    - days_past_due > 30 in any future month, OR
    - cash_deficit_3m > 0 for 2+ consecutive months (persistent stress)

Also computes credit_stress_score (0-100) as a continuous proxy.
"""
from __future__ import annotations
from pathlib import Path
import pandas as pd
import numpy as np

DATA_DIR = Path("data")
INPUT_CSV = DATA_DIR / "nabard_enterprise_monthly.csv"
OUTPUT_PARQUET = DATA_DIR / "underwriting_training_dataset.parquet"


def main():
    print(f"Loading {INPUT_CSV}...")
    df = pd.read_csv(INPUT_CSV)
    df = df.sort_values(["entity_id", "time_idx"]).reset_index(drop=True)
    print(f"  {len(df):,} rows, {df['entity_id'].nunique():,} enterprises")

    # ── 1. Derive forward-looking labels ─────────────────────────────────────
    df["repayment_failure_6m"] = 0
    df["credit_stress_score"] = 0.0

    for eid, group in df.groupby("entity_id"):
        idxs = group.index.tolist()
        n = len(idxs)
        for pos, idx in enumerate(idxs):
            future_idxs = idxs[pos + 1: pos + 7]  # next 6 months
            if not future_idxs:
                continue
            future = df.loc[future_idxs]

            # Hard failure: DPD > 30 in any future month
            dpd_failure = (future["days_past_due"] > 30).any() if "days_past_due" in future else False

            # Soft failure: cash deficit for 2+ consecutive months
            deficit_months = (future.get("cash_deficit_3m", pd.Series([0]*len(future))) > 0).values
            consecutive = 0
            max_consecutive = 0
            for d in deficit_months:
                consecutive = consecutive + 1 if d else 0
                max_consecutive = max(max_consecutive, consecutive)
            cash_stress = max_consecutive >= 2

            df.at[idx, "repayment_failure_6m"] = int(dpd_failure or cash_stress)

            # Continuous credit stress score
            dscr_penalty = max(0, 1 - df.at[idx, "dscr"]) * 30 if "dscr" in df.columns else 0
            dpd_penalty = min(df.at[idx, "days_past_due"] / 90 * 25, 25) if "days_past_due" in df.columns else 0
            util_penalty = max(0, (df.at[idx, "credit_utilisation"] - 0.6) / 0.4 * 20) if "credit_utilisation" in df.columns else 0
            risk_3m = df.at[idx, "repayment_risk_3m"] * 15 if "repayment_risk_3m" in df.columns else 0
            df.at[idx, "credit_stress_score"] = min(dscr_penalty + dpd_penalty + util_penalty + risk_3m, 100)

    # ── 2. Build underwriting feature set ────────────────────────────────────
    uw_features = [
        "entity_id", "time_idx", "sector", "district",
        "years_in_operation", "asset_value", "worker_count",
        "sanctioned_credit_limit", "loan_outstanding", "credit_utilisation",
        "days_past_due", "repayment_delay_count_6m", "restructured_flag",
        "debt_service_ratio", "dscr",
        "upi_inflow_value", "upi_inflow_growth_1m", "upi_inflow_growth_3m",
        "upi_active_days", "digital_collection_share",
        "output_commodity_price", "input_cost_index",
        "commodity_price_change_1m", "commodity_price_volatility_3m",
        "climate_risk_score", "rainfall_anomaly_pct",
        "cash_deficit_3m", "persistent_stress_3m", "repayment_risk_3m",
        "repayment_failure_6m", "credit_stress_score",
    ]
    available = [c for c in uw_features if c in df.columns]
    out = df[available].copy()

    # Require at least 3 months of history per enterprise
    out = out[out.groupby("entity_id")["time_idx"].transform("count") >= 3]

    # Drop last 6 rows per enterprise (no forward label possible)
    out = out.groupby("entity_id").apply(lambda g: g.iloc[:-6]).reset_index(drop=True)

    print(f"\nLabel distribution:")
    print(out["repayment_failure_6m"].value_counts())
    print(f"\nCredit stress score stats:")
    print(out["credit_stress_score"].describe())

    print(f"\nSaving {len(out):,} training rows → {OUTPUT_PARQUET}")
    out.to_parquet(OUTPUT_PARQUET, index=False)
    print("Done.")


if __name__ == "__main__":
    main()
