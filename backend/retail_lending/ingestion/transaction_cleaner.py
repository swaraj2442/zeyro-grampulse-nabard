"""Transaction Normalization Engine.

Cleans and normalizes raw transaction logs.
- Removes duplicates
- Parses dates
- Normalizes merchant names
- Classifies category
"""

import pandas as pd
from typing import Dict, Any, List
from .merchant_classifier import MerchantClassifier

class TransactionCleaner:
    def __init__(self):
        self.classifier = MerchantClassifier()

    def normalize_merchant_name(self, narrative: str) -> str:
        """Cleans up raw narrative into a normalized counterparty/merchant name."""
        if not narrative:
            return "UNKNOWN"
        
        # Remove common bank prefixes
        clean = narrative.upper()
        for prefix in ["UPI/", "NEFT/", "IMPS/", "RTGS/"]:
            clean = clean.replace(prefix, "")
            
        # Strip special characters and extra spaces
        clean = "".join([c if c.isalnum() else " " for c in clean])
        clean = " ".join(clean.split())
        return clean

    def clean_transactions(self, raw_txns: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Converts a list of raw transaction dicts into a normalized DataFrame.
        Expected input keys: date, amount, type, narrative, account_id
        """
        if not raw_txns:
            return pd.DataFrame()
            
        df = pd.DataFrame(raw_txns)
        
        # Standardize dates
        if "date" in df.columns:
            df["date"] = pd.to_datetime(df["date"], errors="coerce")
            
        # Drop strict duplicates
        df = df.drop_duplicates()
        
        # Normalize merchant and classify
        if "narrative" in df.columns:
            df["merchant"] = df["narrative"].apply(self.normalize_merchant_name)
            df["category"] = df["narrative"].apply(self.classifier.classify)
        else:
            df["merchant"] = "UNKNOWN"
            df["category"] = "Unknown"
            
        return df
