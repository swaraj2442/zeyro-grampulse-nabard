# GramPulse NABARD Rural-Enterprise Cashflow Pipeline

This bundle implements the requested conversion of the existing personal-finance TFT notebook into a rural-enterprise forecasting and early-warning pipeline.

## Files

- `cashflow_nabard_tft.ipynb` — Kaggle/local training notebook.
- `multihead_generate_nabard.py` — new rural-enterprise synthetic panel generator.
- `multihead_generate.py` — compatibility copy for the filename referenced by the original notebook.
- `nabard_cashflow_utils.py` — validation, targeted imputation, feature engineering, baselines, metrics and early-warning schema.
- `test_nabard_pipeline.py` — fast structural and leakage tests.

## Decisions applied

1. A new generator was created because the existing `multihead_generate.py` was referenced but not included with the uploaded notebook.
2. CatBoost is embedded in the same notebook so validation/test logic is shared across every model.
3. XGBoost residual correction is removed.
4. FinePhrase is excluded from numeric training and remains a downstream explanation layer.
5. `scheduled_emi` and `scheduled_loan_repayment` are known future inputs rather than prediction targets.
6. Decoder-side climate and market variables are named as forecasts/scenarios to avoid presenting future actuals as known information.

## Generated dataset

Default generation produces:

- 3,250 enterprises
- 36 months per enterprise
- 117,000 enterprise-month rows
- Dairy, Poultry, Food Processing and Rural Retail sectors
- Individual, Micro Enterprise, SHG and FPO enterprise types
- Aggregate UPI proxies without UPI IDs or counterparties
- Market, climate, credit and repayment variables
- Forward-looking three-month stress labels

## Run on Kaggle

1. Upload all files in this bundle as a Kaggle Dataset or place them next to the notebook.
2. Open `cashflow_nabard_tft.ipynb`.
3. Enable a GPU accelerator.
4. Run cells in order.
5. Keep `CFG['run_optuna'] = False` until the full baseline completes successfully.
6. After the baseline run, enable Optuna only if time permits.

Generated artifacts are written to:

```text
/kaggle/working/nabard_cashflow/models
/kaggle/working/nabard_cashflow/artifacts
```

The key submission artifacts are:

- `test_model_summary.csv`
- `test_target_metrics.csv`
- `tft_interval_coverage.csv`
- `test_predictions_long.csv`
- `early_warning_sample.json`
- `early_warning_all.jsonl`
- `run_manifest.json`
- `nabard_tft_best.ckpt`

## Run structural tests locally

```bash
python test_nabard_pipeline.py
```

These tests check required columns, 36-month entity histories, future-label leakage, 24/6/6 split boundaries, missing-value handling, baseline output and early-warning JSON.

## Important evaluation language

Do not report training metrics as final performance. Use only the untouched months 31–36 from `test_model_summary.csv` and `test_target_metrics.csv`.

The synthetic data is suitable for demonstrating the end-to-end system and is explicitly privacy-preserving. It should be described as a calibrated synthetic prototype dataset rather than real NABARD beneficiary data.
