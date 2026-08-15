"""
Early Warning Signal (EWS) Rules: GREEN / AMBER / RED tiering.

Supports two entity types with different rule sets:

MSME rules:
  RED:   EMI ratio > 0.60 | net cashflow negative | inflow decline > -35%/2m
  AMBER: EMI ratio > 0.40 | inflow concentration > 0.70 | decline > -20%/2m |
         3m trend strongly negative | outflow spike > +30%

General User rules:
  RED:   salary missed this month | fixed_obligation_ratio > 0.60 |
         inflow decline > -35% for 2m
  AMBER: fixed_obligation_ratio > 0.45 | UPI spend > 40% of inflow for 2m |
         new EMI detected | buffer < 1 month of fixed obligations |
         savings_rate < 5% for 2m
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from enum import Enum
from typing import Any


class EWS_TIER(str, Enum):
    GREEN = "GREEN"
    AMBER = "AMBER"
    RED = "RED"


def evaluate_ews_rules(
    features_df: pd.DataFrame,
    entity_type: str = "msme",
) -> dict[str, Any]:
    """
    Evaluate rule-based early warning signals on the entity's feature history.

    Args:
        features_df: Monthly features DataFrame (output of build_monthly_features).
        entity_type: "msme" or "general" — selects the rule set.

    Returns:
        dict with keys:
            tier (EWS_TIER), triggers (list[str]),
            trigger_count, red_flag_count, watch_flag_count
    """
    et = entity_type.lower().strip()
    if "entity_type" in features_df.columns:
        # Prefer the column value if available
        detected = features_df["entity_type"].iloc[-1]
        if isinstance(detected, str):
            et = detected.lower().strip()

    df = features_df.copy().sort_values("period").reset_index(drop=True)

    if et == "general":
        return _evaluate_general(df)
    else:
        return _evaluate_msme(df)


# ── MSME rules ────────────────────────────────────────────────────────────────

def _evaluate_msme(df: pd.DataFrame) -> dict[str, Any]:
    last = df.iloc[-1]
    watch_flags: list[str] = []
    red_flags: list[str] = []

    # R1: EMI-to-inflow ratio
    emi_ratio = float(last.get("emi_to_inflow_ratio", 0) or 0)
    if emi_ratio > 0.60:
        red_flags.append(
            f"emi_to_inflow_ratio={emi_ratio:.2f} > 0.60 (critical debt burden)"
        )
    elif emi_ratio > 0.40:
        watch_flags.append(
            f"emi_to_inflow_ratio={emi_ratio:.2f} > 0.40 (elevated debt burden)"
        )

    # R2: Latest net cashflow negative
    net_cf = float(last.get("net_cashflow", 0) or 0)
    if net_cf < 0:
        red_flags.append(f"net_cashflow={net_cf:,.0f} negative in latest month")

    # R3/A3: Sustained inflow MoM decline
    _check_inflow_decline(df, watch_flags, red_flags)

    # A1: Inflow concentration
    if "inflow_concentration" in df.columns:
        conc = float(last.get("inflow_concentration", 0) or 0)
        if conc > 0.70:
            watch_flags.append(
                f"inflow_concentration={conc:.2f} > 0.70 (single customer dependency)"
            )

    # A2: Rolling 3-month cashflow slope negative
    if "net_cashflow" in df.columns and len(df) >= 3:
        recent_cf = df["net_cashflow"].iloc[-3:].values
        if len(recent_cf) == 3 and not np.isnan(recent_cf).any():
            slope = np.polyfit([0, 1, 2], recent_cf, 1)[0]
            mean_cf = float(np.mean(recent_cf))
            if mean_cf != 0 and slope / abs(mean_cf) < -0.20:
                watch_flags.append(
                    f"net_cashflow 3-month slope strongly negative "
                    f"(slope={slope:,.0f}, mean={mean_cf:,.0f})"
                )

    # A3: Outflow spike
    if "total_outflow" in df.columns and len(df) >= 2:
        prev = float(df["total_outflow"].iloc[-2])
        curr = float(df["total_outflow"].iloc[-1])
        if prev > 0 and (curr / prev) - 1.0 > 0.30:
            change = (curr / prev) - 1.0
            watch_flags.append(f"total_outflow spike +{change:.0%} MoM")

    return _build_result(watch_flags, red_flags)


# ── General User rules ────────────────────────────────────────────────────────

def _evaluate_general(df: pd.DataFrame) -> dict[str, Any]:
    last = df.iloc[-1]
    watch_flags: list[str] = []
    red_flags: list[str] = []

    # R1: Salary missed this month
    if "salary_regularity" in df.columns:
        val = last.get("salary_regularity", 1)
        sal_reg = float(val) if pd.notna(val) else 1.0
        if sal_reg == 0:
            red_flags.append("Salary not detected in latest month (missed/delayed)")

    # R2: Fixed obligation ratio
    if "fixed_obligation_ratio" in df.columns:
        fo_ratio = float(last.get("fixed_obligation_ratio", 0) or 0)
        if fo_ratio > 0.60:
            red_flags.append(
                f"fixed_obligation_ratio={fo_ratio:.2f} > 0.60 (overleveraged)"
            )
        elif fo_ratio > 0.45:
            watch_flags.append(
                f"fixed_obligation_ratio={fo_ratio:.2f} > 0.45 (elevated obligations)"
            )

    # R3/A1: High-risk spend (gambling/crypto)
    if "high_risk_spend_ratio" in df.columns:
        risk_ratio = float(last.get("high_risk_spend_ratio", 0) or 0)
        if risk_ratio > 0.15:
            red_flags.append(
                f"high_risk_spend_ratio={risk_ratio:.2f} > 0.15 (severe gambling/crypto risk)"
            )
        elif risk_ratio > 0.05:
            watch_flags.append(
                f"high_risk_spend_ratio={risk_ratio:.2f} > 0.05 (elevated gambling/crypto risk)"
            )

    # R3: Sustained inflow decline (shared logic)
    _check_inflow_decline(df, watch_flags, red_flags)

    # A1: UPI discretionary spend > 40% of inflow for 2+ months
    if "discretionary_spend_ratio" in df.columns and len(df) >= 2:
        recent_discr = df["discretionary_spend_ratio"].iloc[-2:].dropna().values
        if len(recent_discr) >= 2 and all(r > 0.40 for r in recent_discr):
            avg = float(np.mean(recent_discr))
            watch_flags.append(
                f"discretionary_spend_ratio={avg:.2f} > 0.40 for 2 months "
                "(overspending on discretionary)"
            )

    # A2: New EMI detected (jump in fixed obligations)
    if "new_emi_detected" in df.columns:
        new_emi = int(last.get("new_emi_detected", 0) or 0)
        if new_emi == 1:
            watch_flags.append(
                "New EMI detected — fixed obligations jumped > 15% MoM"
            )

    # A3: Thin buffer (net_cashflow < fixed_obligations)
    if "net_cashflow" in df.columns and "fixed_obligations" in df.columns:
        net_cf = float(last.get("net_cashflow", 0) or 0)
        # Add investments back to net_cf since they act as liquid buffer
        inv_amt = float(last.get("investment_amount", 0) or 0) if "investment_amount" in last else 0.0
        adjusted_cf = net_cf + inv_amt
        fixed_obs = float(last.get("fixed_obligations", 0) or 0)
        if fixed_obs > 0 and adjusted_cf < fixed_obs:
            watch_flags.append(
                f"adjusted_net_cashflow={adjusted_cf:,.0f} < fixed_obligations={fixed_obs:,.0f} (thin safety margin)"
            )

    # A4: Savings rate < 5% for 2+ months
    if "savings_rate" in df.columns and len(df) >= 2:
        recent_savings = df["savings_rate"].iloc[-2:].dropna().values
        if len(recent_savings) >= 2 and all(r < 0.05 for r in recent_savings):
            avg = float(np.mean(recent_savings))
            watch_flags.append(
                f"savings_rate={avg:.1%} < 5% for 2 consecutive months"
            )

    return _build_result(watch_flags, red_flags)


# ── Shared helpers ────────────────────────────────────────────────────────────

def _check_inflow_decline(
    df: pd.DataFrame,
    watch_flags: list[str],
    red_flags: list[str],
) -> None:
    """Shared rule: sustained inflow MoM decline for 2 consecutive months."""
    if "inflow_mom_change" not in df.columns or len(df) < 2:
        return
    recent_changes = df["inflow_mom_change"].iloc[-2:].dropna().values
    if len(recent_changes) < 2:
        return
    if all(c < -0.35 for c in recent_changes):
        red_flags.append(
            "Inflow MoM decline > -35% for 2 consecutive months (severe revenue shock)"
        )
    elif all(c < -0.20 for c in recent_changes):
        watch_flags.append(
            "Inflow MoM decline > -20% for 2 consecutive months"
        )


def _build_result(
    watch_flags: list[str], red_flags: list[str]
) -> dict[str, Any]:
    all_triggers = watch_flags + red_flags
    if red_flags:
        tier = EWS_TIER.RED
    elif watch_flags:
        tier = EWS_TIER.AMBER
    else:
        tier = EWS_TIER.GREEN

    return {
        "tier": tier,
        "triggers": all_triggers,
        "trigger_count": len(all_triggers),
        "red_flag_count": len(red_flags),
        "watch_flag_count": len(watch_flags),
    }
