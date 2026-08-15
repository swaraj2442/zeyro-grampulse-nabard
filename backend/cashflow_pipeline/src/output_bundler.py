"""
Output Bundler: assembles the final JSON-serializable output bundle per entity.

The bundle is the contract consumed by downstream bank underwriting systems.
All values are Python primitives (no numpy arrays, no Timestamps) so the
bundle is directly serializable with json.dumps(bundle, default=str).
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import pandas as pd


def build_output_bundle(
    entity_id: str,
    forecast_df: pd.DataFrame,
    stress_results: dict[str, dict[str, Any]],
    ews_result: dict[str, Any],
) -> dict[str, Any]:
    """
    Assemble the structured output bundle for a single entity.

    Args:
        entity_id:      Unique entity identifier.
        forecast_df:    Forecast DataFrame with columns:
                            period, forecast, lower_p10, upper_p90,
                            shortfall_probability
                        and optionally: total_inflow, total_outflow.
        stress_results: Dict mapping scenario_name → metrics dict
                        (output of StressEngine.run()).
        ews_result:     Dict from evaluate_ews_rules() with keys:
                            tier, triggers, trigger_count, ...

    Returns:
        JSON-serializable dict with the full output bundle.
    """
    fc = forecast_df.copy().sort_values("period").reset_index(drop=True)

    # ── Forecast series ───────────────────────────────────────────────────────
    cashflow_forecast: list[dict[str, Any]] = [
        {
            "period": str(row["period"])[:7],
            "value": round(float(row["forecast"]), 2),
        }
        for _, row in fc.iterrows()
    ]

    # ── Shortfall probabilities ───────────────────────────────────────────────
    shortfall_prob: list[dict[str, Any]] = [
        {
            "period": str(row["period"])[:7],
            "probability": round(float(row["shortfall_probability"]), 4),
        }
        for _, row in fc.iterrows()
    ]

    # ── Confidence band ───────────────────────────────────────────────────────
    confidence_band: list[dict[str, Any]] = [
        {
            "period": str(row["period"])[:7],
            "p10": round(float(row["lower_p10"]), 2),
            "p90": round(float(row["upper_p90"]), 2),
        }
        for _, row in fc.iterrows()
    ]

    # ── Stress results (strip raw cashflow array; keep summary metrics) ───────
    stress_summary: dict[str, Any] = {}
    for scenario, metrics in stress_results.items():
        stress_summary[scenario] = {
            k: (round(v, 2) if isinstance(v, float) else v)
            for k, v in metrics.items()
            if k != "stressed_cashflow"
        }

    # ── EWS ──────────────────────────────────────────────────────────────────
    tier = ews_result["tier"]
    tier_str: str = (
        tier.value if hasattr(tier, "value") else str(tier)
    )

    # ── Summary statistics ────────────────────────────────────────────────────
    avg_forecast = round(float(fc["forecast"].mean()), 2)
    max_shortfall_prob = round(float(fc["shortfall_probability"].max()), 4)
    min_coverage_month = str(
        fc.loc[fc["shortfall_probability"].idxmax(), "period"]
    )[:7]

    return {
        "entity_id": entity_id,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "summary": {
            "avg_forecast_cashflow": avg_forecast,
            "max_shortfall_probability": max_shortfall_prob,
            "highest_risk_month": min_coverage_month,
            "ews_tier": tier_str,
        },
        "cashflow_forecast_12m": cashflow_forecast,
        "shortfall_probability_12m": shortfall_prob,
        "confidence_band": confidence_band,
        "stress_results": stress_summary,
        "ews_tier": tier_str,
        "ews_triggers": ews_result.get("triggers", []),
        "ews_trigger_count": ews_result.get("trigger_count", 0),
        "ews_red_flag_count": ews_result.get("red_flag_count", 0),
        "ews_watch_flag_count": ews_result.get("watch_flag_count", 0),
    }
