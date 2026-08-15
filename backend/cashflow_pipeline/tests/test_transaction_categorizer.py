"""Tests for src/transaction_categorizer.py — dual taxonomy (MSME + General User)."""
import pandas as pd
import pytest

from src.transaction_categorizer import (
    categorize_transactions,
    _match_category,
    _MSME_COMPILED,
    _GENERAL_COMPILED,
)


class TestMsmeCategoryRules:
    @pytest.mark.parametrize("narration, expected", [
        ("EMI/HDFC LOAN", "emi"),
        ("HOME LOAN EMI", "emi"),
        ("NEFT/SALARY TRANSFER", "salary"),
        ("GST PAYMENT Q3", "gst"),
        ("TDS PAYMENT", "tax"),
        ("RENT/OFFICE", "rent"),
        ("ELECTRICITY BILL", "utility"),
        ("UPI/CUSTOMER PAY", "upi_in"),
        ("VENDOR PAYMENT", "vendor"),
        ("NEFT/SALES PAYMENT", "sales"),
        ("RTGS/INVOICE 1234", "sales"),
        ("NEFT TRANSFER", "transfer"),
        ("RANDOM XYZABC 9999", "other"),
    ])
    def test_msme_match(self, narration, expected):
        assert _match_category(narration, _MSME_COMPILED) == expected

    def test_msme_case_insensitive(self):
        assert _match_category("emi/hdfc loan", _MSME_COMPILED) == "emi"


class TestGeneralCategoryRules:
    @pytest.mark.parametrize("narration, expected", [
        ("NEFT/SALARY TRANSFER EMPLOYER", "salary"),
        ("EMI/HOME LOAN HDFC BANK", "emi"),
        ("NEFT/RENT LANDLORD PAYMENT", "rent"),
        ("NETFLIX SUBSCRIPTION", "subscription"),
        ("SPOTIFY PREMIUM", "subscription"),
        ("UPI/ZOMATO", "food"),
        ("UPI/SWIGGY", "food"),
        ("BOOKMYSHOW/PVR", "entertainment"),
        ("APOLLO PHARMACY", "medical"),
        ("NETMEDS", "medical"),
        ("ELECTRICITY BILL PAYMENT", "utility"),
        ("IMPS/TRANSFER RECEIVED FROM SAV001", "upi_receive"),
        ("UPI/PHONEPE", "upi_send"),
        ("NEFT TRANSFER", "transfer"),
        ("RANDOM XYZABC 9999", "other"),
    ])
    def test_general_match(self, narration, expected):
        assert _match_category(narration, _GENERAL_COMPILED) == expected


class TestCategorizeTransactions:
    def test_msme_entity_type_uses_msme_taxonomy(self):
        df = pd.DataFrame({
            "narration": ["GST PAYMENT", "NEFT/SALES PAYMENT"],
            "type": ["debit", "credit"],
        })
        result = categorize_transactions(df, entity_type="msme")
        assert result.loc[0, "category"] == "gst"
        assert result.loc[1, "category"] == "sales"

    def test_general_entity_type_uses_general_taxonomy(self):
        df = pd.DataFrame({
            "narration": ["UPI/ZOMATO", "NEFT/SALARY TRANSFER EMPLOYER"],
            "type": ["debit", "credit"],
        })
        result = categorize_transactions(df, entity_type="general")
        assert result.loc[0, "category"] == "food"
        assert result.loc[1, "category"] == "salary"

    def test_per_row_dispatch_from_column(self):
        """Mixed entity_type column → each row uses the right taxonomy."""
        df = pd.DataFrame({
            "narration": ["GST PAYMENT", "UPI/ZOMATO"],
            "type": ["debit", "debit"],
            "entity_type": ["msme", "general"],
        })
        result = categorize_transactions(df)
        assert result.loc[0, "category"] == "gst"      # MSME rule
        assert result.loc[1, "category"] == "food"     # General rule

    def test_category_column_always_present(self):
        df = pd.DataFrame({"narration": ["NEFT/SALES"], "type": ["credit"]})
        result = categorize_transactions(df, entity_type="msme")
        assert "category" in result.columns
        assert result["category"].notna().all()

    def test_does_not_modify_original(self):
        df = pd.DataFrame({"narration": ["EMI/HDFC"], "type": ["debit"]})
        original_cols = list(df.columns)
        categorize_transactions(df, entity_type="msme")
        assert list(df.columns) == original_cols

    def test_unknown_narration_gets_other(self):
        df = pd.DataFrame({"narration": ["RANDOM XYZABC 9999"], "type": ["debit"]})
        result = categorize_transactions(df, entity_type="general")
        assert result.loc[0, "category"] == "other"
