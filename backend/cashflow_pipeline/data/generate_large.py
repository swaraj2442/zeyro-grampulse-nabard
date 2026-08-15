import pandas as pd
import numpy as np
from pathlib import Path
from datetime import timedelta
import random
import math

DATA_DIR = Path(__file__).parent
TRANSACTIONS_PATH = DATA_DIR / "transactions_large.csv"
PROFILES_PATH = DATA_DIR / "user_profiles.csv"

# ─── Festival / GST Months (same as feature engineer) ─────────────────────────
FESTIVAL_MONTHS = {10, 11}        # Oct, Nov — Diwali, Navratri
GST_FILING_MONTHS = {1, 4, 7, 10} # QRMP quarterly deadlines
ADVANCE_TAX_MONTHS = {3, 6, 9, 12} # Advance tax installments

def generate_large_dataset(num_users=2500, months=24):
    np.random.seed(42)
    random.seed(42)

    end_date = pd.to_datetime("2024-06-30")
    start_date = end_date - pd.DateOffset(months=months)
    dates = pd.date_range(start_date, end_date, freq="D")

    transactions = []
    profiles = []

    for i in range(num_users):
        entity_id = f"U{i:03d}"

        # ── Profile ───────────────────────────────────────────────────────────
        age      = random.choice(["18-25", "26-35", "36-50", "50+"])
        city     = random.choice(["Tier 1", "Tier 2", "Tier 3"])
        emp_type = random.choice(["Salaried", "Self-Employed", "Business"])

        profiles.append({
            "entity_id":           entity_id,
            "age_band":            age,
            "city_tier":           city,
            "employment_type":     emp_type,
            "household_size":      random.randint(1, 5),
            "cost_of_living_index": random.uniform(0.8, 1.5)
        })

        # ── Financial State ───────────────────────────────────────────────────
        base_income      = random.uniform(30000, 150000)
        current_balance  = random.uniform(10000, 500000)
        expense_ratio    = random.uniform(0.5, 0.8)
        base_daily_expense = (base_income * expense_ratio) / 30

        # AR(1) state for expenses — high persistence so it's predictable
        prev_expense = base_daily_expense

        # AR(1) state for Self-Employed / Business income trend
        # Gives them a realistic slow-drifting income level
        income_trend = base_income   # current "mean" income for this user
        income_ar    = base_income   # current AR(1) level

        # Fixed EMI fraction for this user (stable across months)
        emi_ratio = random.uniform(0.1, 0.25)

        for d in dates:
            month = d.month

            # ── Seasonal income multiplier (same signal as festival/GST features) ──
            seasonal_mult = 1.0
            if month in FESTIVAL_MONTHS:
                # Salaried get bonuses; business gets more sales
                seasonal_mult = random.uniform(1.1, 1.3)
            elif month in GST_FILING_MONTHS and emp_type != "Salaried":
                # GST filing months → higher inflows (quarterly collections)
                seasonal_mult = random.uniform(1.0, 1.15)
            elif month in ADVANCE_TAX_MONTHS and emp_type != "Salaried":
                # Advance tax months → lower net (cash goes out for tax)
                seasonal_mult = random.uniform(0.85, 0.95)

            # ── 1. Monthly Income ──────────────────────────────────────────────
            if d.day == 1 and emp_type == "Salaried":
                # Salaried: tight variance ±5%, seasonal bonus possible
                amt = round(base_income * seasonal_mult * random.uniform(0.97, 1.03), 2)
                current_balance += amt
                transactions.append({
                    "entity_id":       entity_id,
                    "account_id":      f"ACC_{entity_id}",
                    "entity_type":     "general",
                    "date":            d.strftime("%Y-%m-%d"),
                    "amount":          amt,
                    "type":            "credit",
                    "narration":       "NEFT/SALARY TRANSFER",
                    "closing_balance": round(current_balance, 2)
                })

            elif d.day == 1 and emp_type != "Salaried":
                # Self-Employed / Business: AR(1) income (persistent, predictable drift)
                # AR(1): new_income = mean + 0.75*(prev - mean) + small_shock
                shock = random.normalvariate(0, base_income * 0.12)
                income_ar = income_trend + 0.75 * (income_ar - income_trend) + shock
                income_ar = max(base_income * 0.4, income_ar)  # floor at 40% of base

                amt = round(income_ar * seasonal_mult, 2)
                current_balance += amt
                transactions.append({
                    "entity_id":       entity_id,
                    "account_id":      f"ACC_{entity_id}",
                    "entity_type":     "msme",
                    "date":            d.strftime("%Y-%m-%d"),
                    "amount":          amt,
                    "type":            "credit",
                    "narration":       "NEFT SALES",
                    "closing_balance": round(current_balance, 2)
                })

            # ── 2. Daily Expenses — AR(1), high persistence ───────────────────
            # Base expense also has a seasonal component (spend more in festival months)
            expense_seasonal = 1.1 if month in FESTIVAL_MONTHS else 1.0
            prev_expense = (
                base_daily_expense * expense_seasonal
                + 0.85 * (prev_expense - base_daily_expense * expense_seasonal)
                + random.normalvariate(0, base_daily_expense * 0.06)  # tighter noise
            )
            prev_expense = max(10.0, prev_expense)

            if random.random() < 0.80:
                num_txns   = random.randint(1, 3)
                split_expense = prev_expense / num_txns
                for _ in range(num_txns):
                    amt = round(split_expense * random.uniform(0.85, 1.15), 2)
                    current_balance -= amt
                    if emp_type == "Salaried":
                        narration = random.choice(["ZOMATO", "UBER", "ELECTRICITY", "NETFLIX"])
                    else:
                        narration = random.choice(["VENDOR PAY", "ELECTRICITY", "RAW MATERIALS"])
                    transactions.append({
                        "entity_id":       entity_id,
                        "account_id":      f"ACC_{entity_id}",
                        "entity_type":     "general" if emp_type == "Salaried" else "msme",
                        "date":            d.strftime("%Y-%m-%d"),
                        "amount":          amt,
                        "type":            "debit",
                        "narration":       narration,
                        "closing_balance": round(current_balance, 2)
                    })

            # ── 3. Fixed Monthly EMI (stable, predictable) ─────────────────────
            if d.day == 5:
                amt = round(base_income * emi_ratio, 2)  # fixed, not random each month!
                current_balance -= amt
                transactions.append({
                    "entity_id":       entity_id,
                    "account_id":      f"ACC_{entity_id}",
                    "entity_type":     "general" if emp_type == "Salaried" else "msme",
                    "date":            d.strftime("%Y-%m-%d"),
                    "amount":          amt,
                    "type":            "debit",
                    "narration":       "EMI/HDFC BANK",
                    "closing_balance": round(current_balance, 2)
                })

            # ── 4. GST Tax Outflow (Business only, quarterly) ──────────────────
            if emp_type != "Salaried" and d.day == 20 and month in GST_FILING_MONTHS:
                amt = round(income_ar * random.uniform(0.08, 0.12), 2)  # ~10% GST
                current_balance -= amt
                transactions.append({
                    "entity_id":       entity_id,
                    "account_id":      f"ACC_{entity_id}",
                    "entity_type":     "msme",
                    "date":            d.strftime("%Y-%m-%d"),
                    "amount":          amt,
                    "type":            "debit",
                    "narration":       "GST PAYMENT",
                    "closing_balance": round(current_balance, 2)
                })

            # ── 5. Rare Emergency (kept rare, not 0.2% per day — too frequent) ──
            # 0.002/day ≈ once every 500 days ≈ 1-2 events per user in 24 months
            # This is realistic. Keep it but reduce size.
            if random.random() < 0.002:
                amt = round(base_income * random.uniform(0.2, 0.5), 2)
                current_balance -= amt
                transactions.append({
                    "entity_id":       entity_id,
                    "account_id":      f"ACC_{entity_id}",
                    "entity_type":     "general" if emp_type == "Salaried" else "msme",
                    "date":            d.strftime("%Y-%m-%d"),
                    "amount":          amt,
                    "type":            "debit",
                    "narration":       "MEDICAL EMERGENCY" if emp_type == "Salaried" else "TAX PAYMENT / PENALTY",
                    "closing_balance": round(current_balance, 2)
                })

    df_txns = pd.DataFrame(transactions)
    df_prof = pd.DataFrame(profiles)

    df_txns.to_csv(TRANSACTIONS_PATH, index=False)
    df_prof.to_csv(PROFILES_PATH, index=False)

    print(f"Generated {len(df_txns):,} transactions for {num_users} users.")
    print(f"  Salaried : {sum(1 for p in profiles if p['employment_type']=='Salaried')}")
    print(f"  Self-Employed: {sum(1 for p in profiles if p['employment_type']=='Self-Employed')}")
    print(f"  Business : {sum(1 for p in profiles if p['employment_type']=='Business')}")
    print(f"Saved to {TRANSACTIONS_PATH} and {PROFILES_PATH}")

if __name__ == "__main__":
    generate_large_dataset(num_users=2500, months=24)
