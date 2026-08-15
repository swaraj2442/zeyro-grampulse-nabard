"""Mixture of Experts (MoE) Router.

Fuses the structured CIBIL model score with the unstructured Behavioral EWS metrics
to achieve a blended 90% accuracy target.
"""

from typing import Dict, Any

def fuse_scores(
    cibil_pd: float, 
    ews_runway_months: float, 
    behavior_shock: bool
) -> float:
    """
    Dynamically weigh the structured CIBIL Probability of Default (PD) against 
    the unstructured Early Warning Signals (EWS).
    
    Returns the fused Probability of Default.
    """
    # Base weight for structured bureau data
    cibil_weight = 0.60
    ews_weight = 0.40
    
    # If the user is facing imminent liquidity collapse (runway < 3 months),
    # the behavioral data overrides the historical CIBIL score.
    if ews_runway_months < 3.0:
        cibil_weight = 0.20
        ews_weight = 0.80
    elif ews_runway_months > 24.0:
        # Very healthy, trust CIBIL more
        cibil_weight = 0.80
        ews_weight = 0.20
        
    # EWS risk factor (0.0 to 1.0)
    # If runway is 0, risk is 1.0. If runway > 12, risk drops to 0.1
    ews_pd = max(0.0, min(1.0, 1.0 - (ews_runway_months / 12.0)))
    
    # Sudden behavior changes (unstructured) add a shock penalty
    shock_penalty = 0.15 if behavior_shock else 0.0
    
    fused_pd = (cibil_pd * cibil_weight) + (ews_pd * ews_weight) + shock_penalty
    
    # Cap at 99% probability
    return min(0.99, fused_pd)


def route_and_score(
    cibil_score_out: Any, 
    cashflow_features: Dict[str, float]
) -> Dict[str, Any]:
    """
    The MoE Router Entrypoint.
    Takes the CIBIL scoring output and the raw cashflow features,
    computes the EWS signals, and outputs a fused interpretation.
    """
    import sys
    import os
    # Local import of EWS Engine to avoid circular deps
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
    from bfs.ews_engine import EWSEngine
    
    # 1. Compute Unstructured EWS
    engine = EWSEngine(runway_threshold_months=12)
    ews_signals = engine.generate_ews_signals(cashflow_features)
    
    runway = ews_signals["liquidity_runway_months"]
    shock = ews_signals["behavior_shock_flag"]
    
    # We infer PD from the raw CIBIL score (300-900). 
    # Approx logic: 300 = 99% PD, 900 = 1% PD
    cibil_score = getattr(cibil_score_out, "score", 600)
    cibil_pd = 1.0 - ((cibil_score - 300) / 600.0)
    cibil_pd = max(0.01, min(0.99, cibil_pd))
    
    # 2. Fuse
    final_pd = fuse_scores(cibil_pd, runway, shock)
    
    # Convert fused PD back to BFS (300-900)
    final_score = int(900 - (final_pd * 600))
    
    return {
        "fused_probability_of_default": round(final_pd, 4),
        "fused_bfs_score": final_score,
        "ews_runway_months": runway,
        "ews_stress_severity": ews_signals["stress_severity"],
        "moe_cibil_weight_applied": "high" if runway > 12 else ("low" if runway < 3 else "medium")
    }
