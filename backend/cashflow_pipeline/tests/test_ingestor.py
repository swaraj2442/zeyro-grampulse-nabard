"""Tests for src/ingestor.py — updated for multi-account and entity_type support."""
import pandas as pd
import pytest

from src.ingestor import load_transactions, validate_schema


class TestValidateSchema:
    def test_raises_on_missing_column(self):
        df = pd.DataFrame({"entity_id": ["E001"], "date": ["2023-01-01"]})
        with pytest.raises(ValueError, match="Missing columns"):
            validate_schema(df)

    def test_passes_with_all_required_columns(self):
        df = pd.DataFrame({
            "entity_id": ["E001"], "date": ["2023-01-01"],
            "amount": [1000.0], "type": ["credit"], "narration": ["NEFT/SALES"],
        })
        validate_schema(df)  # should not raise


class TestLoadTransactions:
    def test_returns_dataframe(self, sample_transactions_csv):
        df = load_transactions(sample_transactions_csv)
        assert isinstance(df, pd.DataFrame)

    def test_required_columns_present(self, sample_transactions_csv):
        df = load_transactions(sample_transactions_csv)
        required = {"entity_id", "date", "amount", "type", "narration"}
        assert required.issubset(set(df.columns))

    def test_optional_columns_injected(self, sample_transactions_csv):
        """account_id and entity_type must always be present after loading."""
        df = load_transactions(sample_transactions_csv)
        assert "account_id" in df.columns
        assert "entity_type" in df.columns

    def test_date_column_is_datetime(self, sample_transactions_csv):
        df = load_transactions(sample_transactions_csv)
        assert pd.api.types.is_datetime64_any_dtype(df["date"])

    def test_amount_is_positive(self, sample_transactions_csv):
        df = load_transactions(sample_transactions_csv)
        assert (df["amount"] > 0).all()

    def test_type_column_only_valid_values(self, sample_transactions_csv):
        df = load_transactions(sample_transactions_csv)
        assert set(df["type"].unique()).issubset({"credit", "debit"})

    def test_entity_type_valid_values(self, sample_transactions_csv):
        df = load_transactions(sample_transactions_csv)
        assert set(df["entity_type"].unique()).issubset({"msme", "general"})

    def test_multiple_accounts_present(self, sample_transactions_csv):
        """Combined CSV has both CURR001 (MSME) and SAV001/SAV002 (General)."""
        df = load_transactions(sample_transactions_csv)
        assert df["account_id"].nunique() >= 2

    def test_multiple_entities_present(self, sample_transactions_csv):
        df = load_transactions(sample_transactions_csv)
        assert df["entity_id"].nunique() >= 2

    def test_sorted_by_entity_account_date(self, sample_transactions_csv):
        df = load_transactions(sample_transactions_csv)
        for (eid, acc), grp in df.groupby(["entity_id", "account_id"]):
            assert grp["date"].is_monotonic_increasing, (
                f"Not sorted for entity={eid}, account={acc}"
            )

    def test_raises_file_not_found(self, tmp_path):
        with pytest.raises(FileNotFoundError):
            load_transactions(tmp_path / "nonexistent.csv")

    def test_missing_account_id_gets_default(self, tmp_path):
        """CSV without account_id column → 'primary' injected."""
        df = pd.DataFrame({
            "entity_id": ["E001"], "date": ["2023-01-01"],
            "amount": [1000.0], "type": ["credit"], "narration": ["NEFT/SALES"],
        })
        path = tmp_path / "no_account.csv"
        df.to_csv(path, index=False)
        result = load_transactions(path)
        assert (result["account_id"] == "primary").all()
