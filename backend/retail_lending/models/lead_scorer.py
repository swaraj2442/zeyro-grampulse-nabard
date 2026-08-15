"""Lead Scoring Engine.

Ensembles Income, Affordability, and Intent into a single conversion probability ranking.
"""

from typing import Dict, Any

class LeadScorer:
    def score_lead(self, 
                   intent_scores: Dict[str, float], 
                   affordability_metrics: Dict[str, float],
                   credit_score: int = 700) -> Dict[str, Any]:
        """
        Calculates the final Lead Score based on the ensemble formula:
        0.40 * Intent + 0.30 * Affordability + 0.20 * IncomeConfidence + 0.10 * Credit
        """
        
        # 1. Intent Component
        top_product = max(intent_scores, key=intent_scores.get)
        max_intent = intent_scores[top_product]
        intent_component = max_intent * 0.40
        
        # 2. Affordability Component (Normalize FOIR: lower is better, up to 100 points)
        # FOIR > 0.6 -> 0 points. FOIR < 0.2 -> 100 points
        foir = affordability_metrics.get("foir", 1.0)
        if foir > 0.6:
            capacity_score = 0.0
        elif foir < 0.2:
            capacity_score = 100.0
        else:
            capacity_score = 100.0 * (1.0 - ((foir - 0.2) / 0.4))
        capacity_component = capacity_score * 0.30
        
        # 3. Income Confidence Component
        conf = affordability_metrics.get("affordability_confidence", 0.5)
        income_component = (conf * 100.0) * 0.20
        
        # 4. Credit Score Component (Normalize 300-900 to 0-100)
        credit_normalized = max(0, min(100, (credit_score - 300) / 6.0))
        credit_component = credit_normalized * 0.10
        
        lead_score = intent_component + capacity_component + income_component + credit_component
        
        # Conversion probability heuristic based on lead score
        conversion_prob = max(0.01, min(0.99, (lead_score / 100.0) ** 1.5))
        
        return {
            "lead_score": round(lead_score, 1),
            "expected_conversion_probability": round(conversion_prob, 4),
            "recommended_product": top_product if max_intent > 20 else "Personal Loan",
            "top_intent_score": max_intent,
            "components": {
                "intent": round(intent_component, 1),
                "capacity": round(capacity_component, 1),
                "income_confidence": round(income_component, 1),
                "credit": round(credit_component, 1)
            }
        }
