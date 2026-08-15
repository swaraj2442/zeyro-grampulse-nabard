# BFS v0 CIBIL Model (XGBoost)

## Overview
This directory contains the training artifacts, data splits, and model checkpoints for the **BFS v0 Baseline Model** trained on the dummy `cibil_ind` datasets. The pipeline maps the target `Approved_Flag` risk buckets (P1-P4) into a binary risk score (`0` for Good/Approve, `1` for Bad/Reject).

## Model Details
* **Algorithm**: XGBoost Classifier (with native categorical support enabled)
* **Calibration**: Isotonic Regression (Scikit-Learn)
* **Target Feature**: `Approved_Flag` (Mapped)
* **Input Features**: 86 columns (joined from Internal and External sources based on `PROSPECTID`)

## Performance Metrics (Test Set)
The model was evaluated against a 15% hold-out test set (`cibil_test.csv`).

BFS v0.4 achieves:
* **ROC-AUC:** 0.7886
* **KS Stat:** 0.4411
* **Brier Score:** 0.1500
* **ECE:** 0.0239

This establishes a calibrated bureau-based underwriting benchmark for subsequent BFS behavioral models. 
Future versions will progressively replace bureau-derived signals with cashflow, UPI, AA and graph-based behavioral features.

## Feature Importance (SHAP)
SHAP analysis identifies the following top 5 most impactful features for the v0 decisions:
1. `Credit_Score` (Dominant signal in the dummy data)
2. `PROSPECTID` (Note: IDs should normally be excluded, kept here for testing)
3. `time_since_recent_payment`
4. `max_unsec_exposure_inPct`
5. `pct_tl_closed_L6M`

## Artifacts Generated
- `cibil_train.csv`: Training split (70%)
- `cibil_val.csv`: Validation split (15%, used for Isotonic Calibration)
- `cibil_test.csv`: Test split (15%)
- `xgboost_cibil_calibrated.pkl`: The final calibrated Sklearn pipeline containing the XGBoost model.
- `xgboost_cibil_calibrated.json`: Feature importance and SHAP summary dump.

## How to Run
You can reproduce this training process using either:
1. **Script**: Execute `.venv_sys/bin/python scripts/train_cibil_xgboost.py`
2. **Notebook**: Run `make run-cibil` in the `notebooks/` directory to programmatically execute the `cibil_xgboost_training.ipynb` file in the ML environment.

## Leakage Audit
> The v0 benchmark intentionally includes bureau-derived variables. Future versions will progressively remove direct approval proxies (`Credit_Score`, identifiers, post-underwriting variables) to approximate a true behavioral underwriting model.
>
> Expected production performance:
> * ROC-AUC: 0.75–0.85
> * KS: 0.35–0.50
> * Brier: < 0.12
