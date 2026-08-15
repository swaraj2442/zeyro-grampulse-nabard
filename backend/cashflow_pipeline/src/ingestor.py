"""
Ingestor: parse and normalize raw Account Aggregator (AA) bank transaction data.

Supports CSV input. `account_id` is optional — if absent, all transactions are
treated as belonging to a single "primary" account.
Multiple accounts per entity are fully supported: feature engineering
aggregates across accounts before building features.
"""
import pandas as pd
from pathlib import Path

REQUIRED_COLUMNS: frozenset[str] = frozenset(
    {"entity_id", "date", "amount", "type", "narration"}
)
OPTIONAL_COLUMNS: dict[str, str] = {
    "account_id": "primary",   # default value when column absent
    "entity_type": "msme",     # "msme" | "general"
}
VALID_TYPES: frozenset[str] = frozenset({"credit", "debit"})
VALID_ENTITY_TYPES: frozenset[str] = frozenset({"msme", "general"})

# Normalize any synonyms → canonical entity_type values
ENTITY_TYPE_NORMALIZATION: dict[str, str] = {
    "business": "msme",
    "self-employed": "msme",
    "self_employed": "msme",
    "selfemployed": "msme",
    "personal": "general",
    "salaried": "general",
    "retail": "general",
}


def validate_schema(df: pd.DataFrame) -> None:
    """
    Raise ValueError if the DataFrame is missing required columns.

    Args:
        df: Raw transaction DataFrame.

    Raises:
        ValueError: If any required column is absent.
    """
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns: {missing}")


def load_transactions(path: str | Path) -> pd.DataFrame:
    """
    Load and normalize AA transactions from a CSV file.

    Steps:
      1. Read CSV
      2. Validate required schema
      3. Inject optional columns with defaults if absent (account_id, entity_type)
      4. Coerce `date` to datetime, `amount` to positive float
      5. Normalize `type` and `entity_type` to lowercase stripped strings
      6. Validate value domains
      7. Sort by entity_id, account_id, date; reset index

    Args:
        path: Path to the CSV file.

    Returns:
        Cleaned, sorted DataFrame with standardised dtypes.
        Guaranteed columns: entity_id, date, amount, type, narration,
                            account_id, entity_type

    Raises:
        ValueError: On schema violations or invalid type/entity_type values.
        FileNotFoundError: If the file does not exist.
    """
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"Transaction file not found: {path}")

    df = pd.read_csv(path)
    validate_schema(df)

    # Inject optional columns with defaults if absent
    for col, default in OPTIONAL_COLUMNS.items():
        if col not in df.columns:
            df[col] = default # type: ignore

    df["date"] = pd.to_datetime(df["date"], errors="raise")
    df["amount"] = df["amount"].astype(float).abs()
    df["type"] = df["type"].str.lower().str.strip()
    df["entity_type"] = df["entity_type"].str.lower().str.strip()
    df["account_id"] = df["account_id"].astype(str).str.strip()

    invalid_types = set(df["type"].unique()) - VALID_TYPES
    if invalid_types:
        raise ValueError(
            f"type column contains invalid values: {invalid_types}. "
            f"Expected only {VALID_TYPES}."
        )

    # Normalize synonyms before validation (e.g. 'business' → 'msme')
    df["entity_type"] = df["entity_type"].map(
        lambda x: ENTITY_TYPE_NORMALIZATION.get(x, x)
    )
    # Silently coerce anything still unknown → 'msme' (fail-safe)
    df["entity_type"] = df["entity_type"].where(
        df["entity_type"].isin(VALID_ENTITY_TYPES), other="msme"
    )

    return (
        df
        .sort_values(["entity_id", "account_id", "date"])
        .reset_index(drop=True)
    )
