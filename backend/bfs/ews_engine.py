"""Early Warning System (EWS) Engine.

Calculates liquidity runway and triggers warnings up to 12 months in advance
based on behavioral cashflow trajectories.
"""

from typing import Dict, Any

class EWSEngine:
    def __init__(self, runway_threshold_months: int = 12):
        self.threshold = runway_threshold_months

    def calculate_runway(self, buffer_capacity: float, cash_burn_30d: float) -> float:
        """
        Estimates the number of months a borrower can survive current burn rates
        using their existing buffer capacity.
        """
        if cash_burn_30d <= 0:
            return 999.0 # Infinite runway / net positive
            
        runway_months = buffer_capacity / cash_burn_30d
        return round(runway_months, 2)

    def generate_ews_signals(self, cashflow_features: Dict[str, float]) -> Dict[str, Any]:
        """
        Generates 12-month advance EWS signals based on raw cashflow features.
        Expected keys in cashflow_features: 'buffer_capacity', 'cash_burn_30d', 'volatility.sudden_behavior_change_score'
        """
        buffer_cap = cashflow_features.get("buffer_capacity", 0.0)
        burn_rate = cashflow_features.get("cash_burn_30d", 0.0)
        behavior_change = cashflow_features.get("volatility.sudden_behavior_change_score", 0.0)

        runway = self.calculate_runway(buffer_cap, burn_rate)
        
        is_stressed = runway < self.threshold
        is_critical = runway < 3.0

        signals = {
            "liquidity_runway_months": runway,
            "ews_alert_12m": is_stressed,
            "ews_alert_critical": is_critical,
            "stress_severity": "CRITICAL" if is_critical else ("HIGH" if is_stressed else "LOW"),
            "behavior_shock_flag": behavior_change > 0.8
        }
        
        return signals
