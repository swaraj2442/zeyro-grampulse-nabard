"""
Transaction Categorizer: rule-based narration → category mapping.

Supports two taxonomies dispatched by entity_type:
  - "msme":    Business-finance categories (GST, vendor, sales, payroll …)
  - "general": Personal-finance categories (salary, subscription, food …)

Uses a priority-ordered regex rule table; first match wins.
Unknown narrations fall through to "other".
"""
from __future__ import annotations

import re
import pandas as pd

# ── MSME taxonomy ─────────────────────────────────────────────────────────────
MSME_CATEGORY_RULES: list[tuple[str, str]] = [
    ("emi",      r"EMI|LOAN\s*INST|HOME\s*LOAN|VEHICLE\s*LOAN|EQUATED"),
    ("salary",   r"SALARY|SAL\s*TRANS|PAYROLL|WAGES"),
    ("gst",      r"GST|IGST|CGST|SGST"),
    ("tax",      r"TDS|ADVANCE\s*TAX|INCOME\s*TAX|IT\s*DEPT"),
    ("rent",     r"RENT|LEASE"),
    ("utility",  r"ELECTRICITY|WATER|BROADBAND|MOBILE\s*BILL|INTERNET"),
    ("upi_in",   r"UPI.*PAY|PHONEPE|GPAY|PAYTM|BHIM"),
    ("vendor",   r"VENDOR|SUPPLIER|PURCHASE"),
    ("sales",    r"SALES|INVOICE|NEFT.*SALES|RTGS.*INVOICE"),
    ("transfer", r"NEFT|RTGS|IMPS|TRANSFER"),
]

# ── General (personal finance) taxonomy ──────────────────────────────────────
GENERAL_CATEGORY_RULES: list[tuple[str, str]] = [
    ("salary",       r"SALARY|SAL\s*TRANS|PAYROLL|WAGES|STIPEND"),
    ("emi",          r"\bEMI\b|LOAN\s*INST|HOME\s*LOAN|VEHICLE\s*LOAN|EQUATED|\bREPAY\b"),
    ("rent",         r"RENT|LEASE|HOUSE.*PAY|LANDLORD"),
    ("subscription", r"NETFLIX|PRIME|SPOTIFY|HOTSTAR|DISNEY|SWIGGY\s*ONE|"
                     r"ZOMATO\s*GOLD|SUBSCRIPTION|ANNUAL.*FEE|MEMBERSHIP"),
    ("food",         r"ZOMATO|SWIGGY|BLINKIT|ZEPTO|DUNZO|BIGBASKET|"
                     r"GROCERY|RESTAURANT|CAFE|FOOD"),
    ("transport",    r"UBER|OLA|RAPIDO|IRCTC|MAKE\s*MY\s*TRIP|FASTAG|METRO"),
    ("entertainment", r"BOOKMYSHOW|PVR|INOX|GAMING|STEAM|PLAYSTATION|CONCERT"),
    ("medical",      r"PHARMACY|HOSPITAL|CLINIC|APOLLO|MEDPLUS|NETMEDS|"
                     r"HEALTH|DOCTOR|DIAGNOSTIC|LAB\s*TEST"),
    ("utility",      r"ELECTRICITY|WATER|GAS|BROADBAND|MOBILE\s*BILL|INTERNET|RECHARGE"),
    ("investment",   r"ZERODHA|GROWW|UPSTOX|MUTUAL\s*FUND|SIP|ANGELONE|INDMONEY|FIXED\s*DEPOSIT"),
    ("high_risk",    r"DREAM11|RUMMY|COINDCX|BINANCE|WAZIRX|BET365|CASINO|LOTTERY|GAMBLE"),
    ("upi_receive",  r"UPI.*RECEIVED|UPI.*CR|PHONEPE.*CR|GPAY.*CR|PAYTM.*CR|"
                     r"IMPS.*RECEIVED|TRANSFER\s*RECEIVED"),
    ("upi_send",     r"UPI|PHONEPE|GPAY|PAYTM|BHIM"),
    ("transfer",     r"NEFT|RTGS|IMPS|TRANSFER|SWEEP"),
]

# Pre-compile both sets
_MSME_COMPILED: list[tuple[str, re.Pattern[str]]] = [
    (cat, re.compile(pat, re.IGNORECASE)) for cat, pat in MSME_CATEGORY_RULES
]
_GENERAL_COMPILED: list[tuple[str, re.Pattern[str]]] = [
    (cat, re.compile(pat, re.IGNORECASE)) for cat, pat in GENERAL_CATEGORY_RULES
]


def _match_category(narration: str, rules: list[tuple[str, re.Pattern[str]]]) -> str:
    """Apply an ordered rule list; return first match or 'other'."""
    text = str(narration).upper()
    for category, pattern in rules:
        if pattern.search(text):
            return category
    return "other"


def categorize_transactions(
    df: pd.DataFrame,
    entity_type: str | None = None,
) -> pd.DataFrame:
    """
    Add a 'category' column to a transactions DataFrame.

    The taxonomy used depends on entity_type:
      - "msme" (default): business-finance categories
      - "general": personal-finance categories

    If entity_type is None, the value is read from df["entity_type"] per row
    (set by the ingestor). If a single entity_type string is provided, it
    applies uniformly to all rows.

    Args:
        df:          DataFrame with at least 'narration' and optionally 'entity_type'.
        entity_type: Override entity type for all rows ("msme" | "general").

    Returns:
        Copy of df with a new 'category' column (str, never NaN).
    """
    result = df.copy()

    if entity_type is not None:
        # Uniform entity type — fast path
        et = entity_type.lower().strip()
        rules = _GENERAL_COMPILED if et == "general" else _MSME_COMPILED
        result["category"] = result["narration"].apply(
            lambda n: _match_category(n, rules)
        )
    elif "entity_type" in result.columns:
        # Per-row dispatch based on entity_type column
        def _dispatch(row: pd.Series) -> str:
            rules = (
                _GENERAL_COMPILED
                if str(row.get("entity_type", "msme")).lower() == "general"
                else _MSME_COMPILED
            )
            return _match_category(row["narration"], rules)

        result["category"] = result.apply(_dispatch, axis=1)
    else:
        # Fallback: MSME
        result["category"] = result["narration"].apply(
            lambda n: _match_category(n, _MSME_COMPILED)
        )

    return result
