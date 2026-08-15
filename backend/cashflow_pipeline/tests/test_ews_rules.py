"""Tests for src/ews_rules.py — MSME and General User rule sets."""
import pandas as pd
import numpy as np
import pytest

from src.ews_rules import evaluate_ews_rules, EWS_TIER


# ── MSME fixtures ──────────────────────────────────────────────────────────────

def _make_healthy_msme() -> pd.DataFrame:
    periods = pd.date_range("2022-01-01", periods=24, freq="MS")
    return pd.DataFrame({
        "period": periods, "entity_type": "msme",
        "net_cashflow": [30_000.0] * 24,
        "total_inflow": [80_000.0] * 24,
        "total_outflow": [50_000.0] * 24,
        "emi_to_inflow_ratio": [0.15] * 24,
        "inflow_concentration": [0.30] * 24,
        "inflow_mom_change": [0.02] * 24,
    })


class TestMsmeEwsRules:
    def test_healthy_entity_returns_green(self):
        assert evaluate_ews_rules(_make_healthy_msme())["tier"] == EWS_TIER.GREEN

    def test_high_emi_ratio_triggers_amber(self):
        df = _make_healthy_msme()
        df["emi_to_inflow_ratio"] = 0.45
        result = evaluate_ews_rules(df)
        assert result["tier"] in (EWS_TIER.AMBER, EWS_TIER.RED)

    def test_very_high_emi_ratio_triggers_red(self):
        df = _make_healthy_msme()
        df["emi_to_inflow_ratio"] = 0.65
        assert evaluate_ews_rules(df)["tier"] == EWS_TIER.RED

    def test_negative_cashflow_triggers_red(self):
        df = _make_healthy_msme()
        df.loc[df.index[-1], "net_cashflow"] = -5_000.0
        assert evaluate_ews_rules(df)["tier"] == EWS_TIER.RED

    def test_sustained_inflow_decline_triggers_amber(self):
        df = _make_healthy_msme()
        df.loc[df.index[-2], "inflow_mom_change"] = -0.25
        df.loc[df.index[-1], "inflow_mom_change"] = -0.25
        assert evaluate_ews_rules(df)["tier"] in (EWS_TIER.AMBER, EWS_TIER.RED)

    def test_triggers_list_present(self):
        result = evaluate_ews_rules(_make_healthy_msme())
        assert isinstance(result["triggers"], list)

    def test_tier_is_ews_tier_enum(self):
        result = evaluate_ews_rules(_make_healthy_msme())
        assert isinstance(result["tier"], EWS_TIER)


# ── General User fixtures ─────────────────────────────────────────────────────

def _make_healthy_general() -> pd.DataFrame:
    periods = pd.date_range("2022-01-01", periods=18, freq="MS")
    return pd.DataFrame({
        "period": periods, "entity_type": "general",
        "net_cashflow": [35_000.0] * 18,     # Must be > fixed_obligations (28k) to avoid buffer warning
        "total_inflow": [95_000.0] * 18,
        "total_outflow": [60_000.0] * 18,
        "fixed_obligations": [28_000.0] * 18,
        "fixed_obligation_ratio": [0.33] * 18,    # well below 0.45 AMBER threshold
        "discretionary_spend_ratio": [0.12] * 18,
        "savings_rate": [0.25] * 18,               # well above 5%
        "salary_regularity": [1] * 18,
        "new_emi_detected": [0] * 18,
        "inflow_mom_change": [0.01] * 18,
    })


class TestGeneralUserEwsRules:
    def test_healthy_general_user_returns_green(self):
        result = evaluate_ews_rules(_make_healthy_general(), entity_type="general")
        assert result["tier"] == EWS_TIER.GREEN

    def test_salary_missed_triggers_red(self):
        df = _make_healthy_general()
        df.loc[df.index[-1], "salary_regularity"] = 0
        result = evaluate_ews_rules(df, entity_type="general")
        assert result["tier"] == EWS_TIER.RED

    def test_critical_fo_ratio_triggers_red(self):
        df = _make_healthy_general()
        df["fixed_obligation_ratio"] = 0.65
        result = evaluate_ews_rules(df, entity_type="general")
        assert result["tier"] == EWS_TIER.RED

    def test_elevated_fo_ratio_triggers_amber(self):
        df = _make_healthy_general()
        df["fixed_obligation_ratio"] = 0.50
        result = evaluate_ews_rules(df, entity_type="general")
        assert result["tier"] in (EWS_TIER.AMBER, EWS_TIER.RED)

    def test_new_emi_detected_triggers_amber(self):
        df = _make_healthy_general()
        df.loc[df.index[-1], "new_emi_detected"] = 1
        result = evaluate_ews_rules(df, entity_type="general")
        assert result["tier"] in (EWS_TIER.AMBER, EWS_TIER.RED)

    def test_upi_overspend_triggers_amber(self):
        df = _make_healthy_general()
        df.loc[df.index[-2], "discretionary_spend_ratio"] = 0.45
        df.loc[df.index[-1], "discretionary_spend_ratio"] = 0.45
        result = evaluate_ews_rules(df, entity_type="general")
        assert result["tier"] in (EWS_TIER.AMBER, EWS_TIER.RED)

    def test_thin_buffer_triggers_amber(self):
        """When net_cashflow < fixed_obligations, thin buffer warning fires."""
        df = _make_healthy_general()
        df.loc[df.index[-1], "net_cashflow"] = 10_000.0  # < fixed_obligations=46k
        result = evaluate_ews_rules(df, entity_type="general")
        assert result["tier"] in (EWS_TIER.AMBER, EWS_TIER.RED)

    def test_low_savings_rate_triggers_amber(self):
        df = _make_healthy_general()
        df.loc[df.index[-2], "savings_rate"] = 0.02
        df.loc[df.index[-1], "savings_rate"] = 0.02
        result = evaluate_ews_rules(df, entity_type="general")
        assert result["tier"] in (EWS_TIER.AMBER, EWS_TIER.RED)

    def test_result_has_correct_keys(self):
        result = evaluate_ews_rules(_make_healthy_general(), entity_type="general")
        assert {"tier", "triggers", "trigger_count", "red_flag_count", "watch_flag_count"}.issubset(
            set(result.keys())
        )

    def test_entity_type_auto_detected_from_column(self):
        """entity_type should be inferred from features_df column if present."""
        df = _make_healthy_general()  # has entity_type="general" column
        result = evaluate_ews_rules(df)  # no explicit entity_type param
        # Should use general rules — healthy general user → GREEN
        assert result["tier"] == EWS_TIER.GREEN
