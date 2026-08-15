import numpy as np
import pandas as pd
import pytest

from training.psi import extract_baseline, calculate_psi

def test_psi_continuous_normal():
    # Baseline with no NaNs
    np.random.seed(42)
    df_base = pd.DataFrame({"feat_cont": np.random.normal(0, 1, 1000)})
    
    baseline = extract_baseline(df_base, ["feat_cont"], max_bins=10)
    assert "feat_cont" in baseline
    b_info = baseline["feat_cont"]
    assert b_info["type"] == "continuous"
    assert b_info["realized_bins"] == 10
    assert len(b_info["edges"]) == 11
    assert len(b_info["proportions"]) == 11  # 10 bins + 1 Missing bin
    
    # Missing bin should be 0 since no NaNs
    assert b_info["proportions"][-1] == 0.0
    
    # Calculate PSI on exactly same data, should be very close to 0
    psi_scores = calculate_psi(baseline, df_base)
    assert psi_scores["feat_cont"] < 0.001

def test_psi_continuous_with_nan():
    # Baseline with NaNs
    df_base = pd.DataFrame({"feat_cont": [1.0, 2.0, 3.0, 4.0, 5.0, np.nan, np.nan]})
    baseline = extract_baseline(df_base, ["feat_cont"], max_bins=2)
    
    # New data with more NaNs (drift in missingness)
    df_new = pd.DataFrame({"feat_cont": [1.0, 2.0, 3.0, np.nan, np.nan, np.nan, np.nan]})
    
    psi_scores = calculate_psi(baseline, df_new)
    assert psi_scores["feat_cont"] > 0.05  # Drift in missing percentage should cause high PSI

def test_psi_categorical_unseen_category():
    # Baseline has 'A' and 'B'
    df_base = pd.DataFrame({"feat_cat": ["A", "A", "B", "B", "B"]})
    baseline = extract_baseline(df_base, ["feat_cat"], max_categories=10)
    
    # New data introduces 'C'
    df_new = pd.DataFrame({"feat_cat": ["A", "C", "C", "C", "B"]})
    psi_scores = calculate_psi(baseline, df_new)
    
    # 'C' should map to 'Other', causing drift
    assert psi_scores["feat_cat"] > 0.1
    
    b_info = baseline["feat_cat"]
    assert b_info["type"] == "categorical"
    assert "Missing" in b_info["categories"]
    assert "Other" in b_info["categories"]

def test_psi_categorical_high_cardinality():
    # Baseline has 25 unique categories, but max_categories=20
    cats = [f"cat_{i}" for i in range(25)]
    df_base = pd.DataFrame({"feat_cat": cats * 4})  # 100 rows
    
    baseline = extract_baseline(df_base, ["feat_cat"], max_categories=20)
    b_info = baseline["feat_cat"]
    
    # 20 top + Missing + Other = 22 categories tracked
    assert len(b_info["categories"]) == 22
    assert "Other" in b_info["categories"]
    
    # Proportion in 'Other' should be roughly 5/25 = 0.2
    other_idx = b_info["categories"].index("Other")
    assert np.isclose(b_info["proportions"][other_idx], 0.2)

def test_psi_continuous_skewed_duplicates():
    # Highly skewed data where qcut will have duplicate bin edges
    df_base = pd.DataFrame({"feat_skew": [0, 0, 0, 0, 0, 0, 0, 0, 1, 2]})
    
    # This would crash pd.qcut without duplicates='drop'
    baseline = extract_baseline(df_base, ["feat_skew"], max_bins=10)
    b_info = baseline["feat_skew"]
    
    # Since 80% of data is 0, it won't be able to form 10 bins.
    assert b_info["realized_bins"] < 10

def test_psi_epsilon_smoothing():
    df_base = pd.DataFrame({"feat_cat": ["A", "B"]})
    baseline = extract_baseline(df_base, ["feat_cat"], max_categories=10)
    
    # New data has NO 'B'. Without epsilon, log(0) would cause infinity
    df_new = pd.DataFrame({"feat_cat": ["A", "A"]})
    psi_scores = calculate_psi(baseline, df_new)
    
    assert not np.isinf(psi_scores["feat_cat"])
    assert not np.isnan(psi_scores["feat_cat"])
