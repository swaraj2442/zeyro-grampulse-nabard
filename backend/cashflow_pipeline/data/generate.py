"""
Synthetic AA transaction data generator.

Generates two entities:
  E001 — MSME (business), single account, 30 months
  G001 — General User (individual), 2 bank accounts, 18 months

Both datasets are saved to a single CSV with the schema:
  entity_id, account_id, entity_type, date, amount, type, narration

Run once: python data/generate.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pandas as pd
import numpy as np
from pathlib import Path

OUTPUT_PATH = Path(__file__).parent / "sample_aa_transactions.csv"


# ── MSME generator ────────────────────────────────────────────────────────────

def generate_msme_transactions(
    entity_id: str = "E001",
    start: str = "2022-01-01",
    end: str = "2024-06-30",
    seed: int = 42,
) -> pd.DataFrame:
    """Generate synthetic daily AA-style business (MSME) transactions."""
    np.random.seed(seed)
    dates = pd.date_range(start, end, freq="D")
    rows = []

    credit_narrations = [
        "NEFT/SALES PAYMENT", "UPI/CUSTOMER PAY", "RTGS/INVOICE 1234",
        "NEFT/SALES BULK ORDER", "UPI/GPAY CUSTOMER", "IMPS/CUSTOMER PAY",
    ]
    debit_narrations = [
        "EMI/HDFC LOAN", "UPI/VENDOR PAY", "NEFT/SALARY", "GST PAYMENT",
        "RENT/OFFICE", "TDS PAYMENT", "ELECTRICITY BILL", "NEFT/SUPPLIER PAY",
    ]

    for d in dates:
        season_factor = 1.3 if d.month in (10, 11, 12) else 1.0
        for _ in range(np.random.randint(2, 5)):
            rows.append({
                "entity_id": entity_id, "account_id": "CURR001",
                "entity_type": "msme", "date": d,
                "amount": round(np.random.lognormal(9, 0.8) * season_factor, 2),
                "type": "credit",
                "narration": np.random.choice(credit_narrations),
            })
        for _ in range(np.random.randint(1, 4)):
            rows.append({
                "entity_id": entity_id, "account_id": "CURR001",
                "entity_type": "msme", "date": d,
                "amount": round(np.random.lognormal(8.5, 0.7), 2),
                "type": "debit",
                "narration": np.random.choice(debit_narrations),
            })

    return pd.DataFrame(rows)


# ── General User generator ────────────────────────────────────────────────────

def generate_general_user_transactions(
    entity_id: str = "G001",
    start: str = "2022-12-01",
    end: str = "2024-06-30",
    seed: int = 99,
) -> pd.DataFrame:
    """
    Generate synthetic daily personal-finance transactions for a general user.

    Two accounts:
      SAV001 — Savings account (salary credited here, EMIs debited)
      SAV002 — UPI/spending account (receives transfers from SAV001, UPI debits)

    Pattern:
      - Salary of ~₹85,000 credited on 1st of each month to SAV001
      - Home loan EMI of ~₹28,000 on 5th to SAV001
      - Monthly transfer of ~₹15,000 from SAV001 to SAV002 on 3rd
      - Daily UPI spends (food, entertainment, subscriptions) from SAV002
      - Rent of ~₹18,000 on 2nd from SAV001
      - Annual insurance premium in April
    """
    np.random.seed(seed)
    dates = pd.date_range(start, end, freq="D")
    rows = []

    upi_spend_narrations = [
        "UPI/ZOMATO", "UPI/SWIGGY", "UPI/BLINKIT", "UPI/GPAY VENDOR",
        "UPI/PHONEPE", "UPI/AMAZON PAY", "UPI/PETROL PUMP",
    ]
    entertainment_narrations = [
        "NETFLIX SUBSCRIPTION", "BOOKMYSHOW/PVR", "SPOTIFY PREMIUM",
        "AMAZON PRIME", "HOTSTAR SUBSCRIPTION",
    ]
    medical_narrations = ["APOLLO PHARMACY", "NETMEDS", "HOSPITAL PAYMENT"]

    salary_amount = 85_000
    emi_amount = 28_000
    rent_amount = 18_000

    for d in dates:
        day = d.day
        month = d.month

        # ── SAV001 transactions ───────────────────────────────────────────────
        # Salary on 1st (±1 day randomness)
        if day == 1:
            rows.append({
                "entity_id": entity_id, "account_id": "SAV001",
                "entity_type": "general", "date": d,
                "amount": round(salary_amount * np.random.uniform(0.97, 1.03), 2),
                "type": "credit", "narration": "NEFT/SALARY TRANSFER EMPLOYER",
            })

        # Rent on 2nd
        if day == 2:
            rows.append({
                "entity_id": entity_id, "account_id": "SAV001",
                "entity_type": "general", "date": d,
                "amount": round(rent_amount * np.random.uniform(0.98, 1.02), 2),
                "type": "debit", "narration": "NEFT/RENT LANDLORD PAYMENT",
            })

        # Transfer to spending account on 3rd
        if day == 3:
            rows.append({
                "entity_id": entity_id, "account_id": "SAV001",
                "entity_type": "general", "date": d,
                "amount": round(15_000 * np.random.uniform(0.90, 1.10), 2),
                "type": "debit", "narration": "IMPS/TRANSFER TO SELF SAV002",
            })
            rows.append({
                "entity_id": entity_id, "account_id": "SAV002",
                "entity_type": "general", "date": d,
                "amount": round(15_000 * np.random.uniform(0.90, 1.10), 2),
                "type": "credit", "narration": "IMPS/TRANSFER RECEIVED FROM SAV001",
            })

        # Home loan EMI on 5th
        if day == 5:
            rows.append({
                "entity_id": entity_id, "account_id": "SAV001",
                "entity_type": "general", "date": d,
                "amount": round(emi_amount * np.random.uniform(0.99, 1.01), 2),
                "type": "debit", "narration": "EMI/HOME LOAN HDFC BANK",
            })

        # Monthly subscriptions on 10th
        if day == 10:
            rows.append({
                "entity_id": entity_id, "account_id": "SAV002",
                "entity_type": "general", "date": d,
                "amount": round(np.random.choice([199, 299, 499, 649]), 2),
                "type": "debit",
                "narration": np.random.choice(entertainment_narrations),
            })

        # Annual insurance in April
        if day == 15 and month == 4:
            rows.append({
                "entity_id": entity_id, "account_id": "SAV001",
                "entity_type": "general", "date": d,
                "amount": round(np.random.uniform(18_000, 30_000), 2),
                "type": "debit", "narration": "NEFT/INSURANCE PREMIUM HDFC LIFE",
            })

        # ── SAV002: Daily UPI spends ──────────────────────────────────────────
        # 1–3 UPI food/grocery spends
        for _ in range(np.random.randint(0, 3)):
            rows.append({
                "entity_id": entity_id, "account_id": "SAV002",
                "entity_type": "general", "date": d,
                "amount": round(np.random.uniform(80, 1_500), 2),
                "type": "debit",
                "narration": np.random.choice(upi_spend_narrations),
            })

        # Occasional medical spend (~10% of days)
        if np.random.random() < 0.10:
            rows.append({
                "entity_id": entity_id, "account_id": "SAV002",
                "entity_type": "general", "date": d,
                "amount": round(np.random.uniform(200, 3_000), 2),
                "type": "debit",
                "narration": np.random.choice(medical_narrations),
            })

        # Utility bills on 20th
        if day == 20:
            rows.append({
                "entity_id": entity_id, "account_id": "SAV001",
                "entity_type": "general", "date": d,
                "amount": round(np.random.uniform(1_500, 4_000), 2),
                "type": "debit", "narration": "ELECTRICITY BILL PAYMENT BESCOM",
            })

    return pd.DataFrame(rows)


if __name__ == "__main__":
    msme_df = generate_msme_transactions()
    general_df = generate_general_user_transactions()
    combined_df = pd.concat([msme_df, general_df], ignore_index=True)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    combined_df.to_csv(OUTPUT_PATH, index=False)

    print(f"Generated {len(combined_df):,} rows -> {OUTPUT_PATH}")
    print()
    for eid in combined_df["entity_id"].unique():
        subset = combined_df[combined_df["entity_id"] == eid]
        accs = subset["account_id"].unique().tolist()
        etype = subset["entity_type"].iloc[0]
        print(f"  {eid} ({etype}): {len(subset):,} rows | "
              f"accounts: {accs} | "
              f"{subset['date'].min().date()} to {subset['date'].max().date()}")
