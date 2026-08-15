"""Merchant Classification Engine.

Categorizes unstructured merchant narratives into strict Hackathon defined classes.
Avoids hardcoded regex where possible by setting up a framework for embedding lookup,
but provides a fallback heuristic mapping for Phase 1.
"""

from typing import List

VALID_CATEGORIES = {
    "Salary", "Rent", "Grocery", "Food", "Fuel", "Shopping", "Investment",
    "EMI", "Insurance", "Healthcare", "Education", "Utility", "Travel",
    "Cash Withdrawal", "Loan", "Business", "Unknown"
}

class MerchantClassifier:
    def __init__(self):
        # A mock embedding-based or dictionary-based lookup for Phase 1
        self.heuristic_map = {
            "zomato": "Food", "swiggy": "Food", "ubereats": "Food",
            "amazon": "Shopping", "flipkart": "Shopping",
            "salary": "Salary", "sal ": "Salary", "payroll": "Salary",
            "emi": "EMI", "bajaj": "EMI", "muthoot": "EMI",
            "zerodha": "Investment", "groww": "Investment",
            "atm": "Cash Withdrawal", "cash": "Cash Withdrawal",
            "hospital": "Healthcare", "pharmacy": "Healthcare",
            "bescom": "Utility", "airtel": "Utility", "jio": "Utility",
            "rent": "Rent", "landlord": "Rent"
        }

    def classify(self, narrative: str) -> str:
        """Classify a narrative into one of the 17 standard categories."""
        if not narrative:
            return "Unknown"
            
        text = narrative.lower()
        
        # In Phase 2, this would be an embedding-based similarity lookup (e.g. BERT)
        # For Phase 1, we use substring matching against our heuristic map
        for keyword, category in self.heuristic_map.items():
            if keyword in text:
                return category
                
        return "Unknown"
