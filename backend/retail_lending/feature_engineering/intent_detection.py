"""Loan Intent Detection Engine.

Uses behavioral sequencing of merchants to detect intent for specific loan products.
"""

import pandas as pd
from typing import Dict

class IntentDetectionEngine:
    def __init__(self):
        # Maps sequences or combinations of keywords to products
        self.intent_signatures = {
            "Auto Loan": ["dealership", "rto", "fastag", "fuel", "car", "showroom", "insurance"],
            "Home Loan": ["builder", "registration", "interior", "furniture", "cement", "architect"],
            "Medical Loan": ["hospital", "diagnostic", "pharmacy", "clinic", "surgery", "apollo"],
            "Personal Loan": ["travel", "makemytrip", "hotel", "wedding", "jeweller"]
        }

    def _calculate_overlap(self, user_merchants: set, keywords: list) -> float:
        """Calculate overlap between user's merchants/narratives and target keywords."""
        hits = 0
        for m in user_merchants:
            m_lower = str(m).lower()
            for kw in keywords:
                if kw in m_lower:
                    hits += 1
        return min(1.0, hits / max(1, len(keywords) * 0.5)) # Cap at 1.0

    def detect_intent(self, df: pd.DataFrame) -> Dict[str, float]:
        """
        Returns intent scores (0-100) across different loan products.
        Expects normalized transactions.
        """
        if df.empty or 'merchant' not in df.columns:
            return {prod: 0.0 for prod in self.intent_signatures.keys()}
            
        user_merchants = set(df['merchant'].dropna().unique())
        
        intent_scores = {}
        for product, keywords in self.intent_signatures.items():
            overlap_score = self._calculate_overlap(user_merchants, keywords)
            intent_scores[product] = round(overlap_score * 100, 2)
            
        # If no specific intent is found, personal loan baseline might be slightly higher
        if max(intent_scores.values()) == 0.0:
            intent_scores["Personal Loan"] = 15.0
            
        return intent_scores
