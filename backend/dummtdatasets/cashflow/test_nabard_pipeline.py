#!/usr/bin/env python3
"""Fast structural tests for the NABARD cash-flow implementation bundle."""
from __future__ import annotations

import tempfile
from pathlib import Path

import pandas as pd

from multihead_generate_nabard import GeneratorConfig, generate_dataset
from nabard_cashflow_utils import (
    TARGET_COLS,
    build_early_warning,
    engineer_model_features,
    make_naive_predictions,
    observed_feature_columns,
    split_24_6_6,
    targeted_impute,
    validate_no_leakage,
    validate_required_columns,
)


def main() -> None:
    raw = generate_dataset(GeneratorConfig(n_enterprises=24, months=36, seed=17, missing_rate=0.01))
    validate_required_columns(raw)
    assert raw.entity_id.nunique() == 24
    assert raw.groupby('entity_id').size().eq(36).all()
    assert set(raw.sector.unique()) <= {'Dairy', 'Poultry', 'Food Processing', 'Rural Retail'}
    assert set(raw.enterprise_type.unique()) <= {'Individual', 'Micro Enterprise', 'SHG', 'FPO'}
    assert raw[['cash_deficit_3m', 'persistent_stress_3m', 'repayment_risk_3m']].tail(3).eq(-1).all().all()

    clean = targeted_impute(raw)
    features = engineer_model_features(clean)
    assert not features.isna().any().any()
    observed = observed_feature_columns(features)
    assert set(TARGET_COLS).issubset(observed)
    assert not {'cash_deficit_3m', 'persistent_stress_3m', 'repayment_risk_3m'} & set(observed)

    splits = split_24_6_6(features)
    validate_no_leakage(splits)
    assert splits['train'].time_idx.max() == 23
    assert splits['validation'].time_idx.max() == 29
    assert splits['test'].time_idx.max() == 35

    naive = make_naive_predictions(features)
    assert set(naive.model.unique()) == {'Seasonal Naive', 'Moving Average (3M)'}
    assert naive.horizon.min() == 1 and naive.horizon.max() == 6

    enterprise_id = features.entity_id.iloc[0]
    future = features[(features.entity_id == enterprise_id) & features.time_idx.between(30, 32)].copy()
    future = future.rename(
        columns={
            'operating_inflow': 'pred_operating_inflow',
            'operating_outflow': 'pred_operating_outflow',
        }
    )
    latest = features[(features.entity_id == enterprise_id) & (features.time_idx == 29)].iloc[0]
    warning = build_early_warning(enterprise_id, future, latest)
    payload = warning.to_json()
    assert enterprise_id in payload
    assert warning.risk_level in {'Low', 'Medium', 'High'}
    assert 0 <= warning.risk_score <= 100

    print('All NABARD pipeline structural tests passed.')


if __name__ == '__main__':
    main()
