"""
Liquidity Stress Engine: applies adverse scenarios to a cashflow forecast
and computes resilience metrics per scenario.

Supports two entity types with entirely different scenario sets:

MSME scenarios (revenue/expense business shocks):
  revenue_mild      : 85% inflow, 100% outflow
  revenue_moderate  : 70% inflow, 100% outflow
  revenue_severe    : 50% inflow, 100% outflow
  expense_moderate  : 100% inflow, 120% outflow
  combined_shock    : 70% inflow, 120% outflow

General User scenarios (personal finance shocks):
  job_loss          : inflow drops to 0 (fixed obligations continue)
  medical_emergency : one-time large debit in month 1 (₹1.5L default)
  emi_increase      : outstanding EMIs repriced +20% (floating rate shock)
  expense_creep     : discretionary spend grows +20% MoM for 3 months
  income_reduction  : inflow drops 30% (salary cut / freelance slowdown)
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from typing import Any

# ── MSME scenario registry ────────────────────────────────────────────────────
SCENARIOS: dict[str, dict[str, float]] = {
    "revenue_mild":     {"inflow_shock": 0.85, "outflow_shock": 1.00},
    "revenue_moderate": {"inflow_shock": 0.70, "outflow_shock": 1.00},
    "revenue_severe":   {"inflow_shock": 0.50, "outflow_shock": 1.00},
    "expense_moderate": {"inflow_shock": 1.00, "outflow_shock": 1.20},
    "combined_shock":   {"inflow_shock": 0.70, "outflow_shock": 1.20},
}

# ── General User scenario registry ───────────────────────────────────────────
GENERAL_SCENARIOS: dict[str, dict[str, Any]] = {
    "job_loss": {
        "description": "Total income loss — inflow drops to 0",
        "inflow_shock": 0.00,
        "outflow_shock": 1.00,
    },
    "medical_emergency": {
        "description": "One-time large medical expense in month 1",
        "inflow_shock": 1.00,
        "outflow_shock": 1.00,
        "one_time_debit": 150_000.0,   # ₹1.5 lakh emergency
    },
    "emi_increase": {
        "description": "Floating rate repricing — EMIs increase 20%",
        "inflow_shock": 1.00,
        "outflow_shock": 1.00,
        "emi_shock": 0.20,  # 20% increase on the EMI portion of outflow
    },
    "expense_creep": {
        "description": "Discretionary spend grows +20% per month for 3 months",
        "inflow_shock": 1.00,
        "outflow_shock": 1.00,
        "creep_months": 3,
        "creep_rate": 0.20,
    },
    "income_reduction": {
        "description": "30% income reduction (salary cut / freelance slowdown)",
        "inflow_shock": 0.70,
        "outflow_shock": 1.00,
    },
}


class StressEngine:
    """
    Apply liquidity stress scenarios to a cashflow forecast.

    Required forecast_df columns:
        period, forecast, total_inflow, total_outflow, lower_p10, upper_p90

    General user scenarios additionally use:
        emi_amount (or emi_fraction), fixed_obligations (if available)
    """

    def run(
        self,
        forecast_df: pd.DataFrame,
        entity_type: str = "msme",
    ) -> dict[str, dict[str, Any]]:
        """
        Run all scenarios for the given entity type.

        Args:
            forecast_df: Forecast DataFrame with inflow/outflow projections.
            entity_type: "msme" or "general"

        Returns:
            Dict mapping scenario_name → metrics dict.
        """
        et = entity_type.lower().strip()
        results: dict[str, dict[str, Any]] = {}

        if et == "general":
            for scenario_name, params in GENERAL_SCENARIOS.items():
                results[scenario_name] = self._apply_general_scenario(
                    forecast_df, scenario_name, params
                )
        else:
            for scenario_name, params in SCENARIOS.items():
                results[scenario_name] = self._apply_msme_scenario(
                    forecast_df,
                    inflow_shock=params["inflow_shock"],
                    outflow_shock=params["outflow_shock"],
                    scenario_name=scenario_name,
                )
        return results

    # ── MSME scenario ─────────────────────────────────────────────────────────

    def _apply_msme_scenario(
        self,
        df: pd.DataFrame,
        inflow_shock: float,
        outflow_shock: float,
        scenario_name: str,
    ) -> dict[str, Any]:
        df = df.copy()
        stressed_inflow = df["total_inflow"] * inflow_shock
        stressed_outflow = df["total_outflow"] * outflow_shock
        stressed_cashflow: list[float] = (stressed_inflow - stressed_outflow).tolist()
        return self._build_metrics(stressed_cashflow, inflow_shock, outflow_shock, scenario_name)

    # ── General User scenarios ────────────────────────────────────────────────

    def _apply_general_scenario(
        self,
        df: pd.DataFrame,
        scenario_name: str,
        params: dict[str, Any],
    ) -> dict[str, Any]:
        df = df.copy()
        n = len(df)
        inflow = df["total_inflow"].values.copy()
        outflow = df["total_outflow"].values.copy()

        inflow_shock = params.get("inflow_shock", 1.0)
        outflow_shock = params.get("outflow_shock", 1.0)

        stressed_inflow = inflow * inflow_shock
        stressed_outflow = outflow * outflow_shock

        # ── medical_emergency: one-time large debit in month 1 ────────────────
        if scenario_name == "medical_emergency":
            one_time = params.get("one_time_debit", 150_000.0)
            stressed_outflow[0] += one_time

        # ── emi_increase: EMI portion of outflow repriced upward ──────────────
        elif scenario_name == "emi_increase":
            emi_shock = params.get("emi_shock", 0.20)
            if "emi_amount" in df.columns:
                emi_extra = df["emi_amount"].values * emi_shock
            else:
                # Estimate EMI as ~35% of outflow if not available
                emi_extra = stressed_outflow * 0.35 * emi_shock
            stressed_outflow = stressed_outflow + emi_extra

        # ── expense_creep: discretionary spend compound growth for N months ───
        elif scenario_name == "expense_creep":
            creep_months = int(params.get("creep_months", 3))
            creep_rate = float(params.get("creep_rate", 0.20))
            # Discretionary is estimated as 25% of outflow if column absent
            if "discretionary_spend" in df.columns:
                base_discr = df["discretionary_spend"].values.copy()
            else:
                base_discr = stressed_outflow * 0.25

            for i in range(min(creep_months, n)):
                extra = base_discr[i] * (creep_rate * (i + 1))
                stressed_outflow[i] += extra

        stressed_cashflow = (stressed_inflow - stressed_outflow).tolist()
        return self._build_metrics(
            stressed_cashflow, inflow_shock, outflow_shock, scenario_name, params
        )

    # ── Shared metric computation ─────────────────────────────────────────────

    def _build_metrics(
        self,
        stressed_cashflow: list[float],
        inflow_shock: float,
        outflow_shock: float,
        scenario_name: str,
        extra_params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        running_balance = np.cumsum(stressed_cashflow)

        negative_months = [i + 1 for i, b in enumerate(running_balance) if b < 0]
        months_to_zero: int | None = negative_months[0] if negative_months else None

        minimum_cashflow_month = int(np.argmin(stressed_cashflow)) + 1
        minimum_cashflow_value = round(float(min(stressed_cashflow)), 2)

        # Survival score (0–100)
        n_positive = sum(1 for c in stressed_cashflow if c >= 0)
        fraction_positive = n_positive / max(len(stressed_cashflow), 1)
        min_cf = min(stressed_cashflow)
        mean_cf = float(np.mean(stressed_cashflow))
        depth_penalty = max(0.0, -min_cf / (abs(mean_cf) + 1e-9)) * 10.0
        raw_score = fraction_positive * 100.0 - depth_penalty
        stress_survival_score = float(np.clip(raw_score, 0.0, 100.0))

        max_drawdown = float(min(running_balance)) if len(running_balance) > 0 else 0.0

        result: dict[str, Any] = {
            "stressed_cashflow": stressed_cashflow,
            "months_to_zero_balance": months_to_zero,
            "minimum_cashflow_month": minimum_cashflow_month,
            "minimum_cashflow_value": minimum_cashflow_value,
            "stress_survival_score": round(stress_survival_score, 2),
            "max_cumulative_drawdown": round(max_drawdown, 2),
            "inflow_shock_applied": inflow_shock,
            "outflow_shock_applied": outflow_shock,
            "scenario": scenario_name,
            "description": (extra_params or {}).get(
                "description",
                SCENARIOS.get(scenario_name, {}).get("description", "")
            ),
        }
        return result
