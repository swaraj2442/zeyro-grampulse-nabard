# Cashflow Forecasting + Liquidity Stress Pipeline

A Python ML pipeline that ingests Account Aggregator bank data, produces 12-month cashflow forecasts with confidence bands, shortfall probabilities, and liquidity stress tests — outputting a structured bundle per entity for bank underwriting consumption.

## Architecture

```
Raw AA Transactions
       │
       ▼
   Ingestor ──► Categorizer ──► Feature Engineer
                                        │
                              ┌─────────┴──────────┐
                              ▼                    ▼
                        ML Trainer           Prophet + LightGBM
                     (train/val/test)           Forecaster
                     (MLflow logging)               │
                              │              ┌──────┴───────┐
                              │              ▼              ▼
                              │       Monte Carlo      Stress Engine
                              │      (shortfall P)    (5 scenarios)
                              │              │              │
                              └──────────────┴──────┬───────┘
                                                    ▼
                                               EWS Rules
                                            (GREEN/AMBER/RED)
                                                    │
                                                    ▼
                                           Output Bundle
                                      (structured dict per entity)
```

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Generate synthetic data
python data/generate.py

# Run end-to-end pipeline
python -c "
from src.pipeline import run_pipeline
import json
result = run_pipeline('data/sample_aa_transactions.csv', entity_id='E001')
print(json.dumps(result, indent=2, default=str))
"

# Run ML training with train/val/test split + MLflow tracking
python -c "
from src.ml_trainer import run_training_experiment
report = run_training_experiment('data/sample_aa_transactions.csv', entity_id='E001')
print(report)
"

# Run benchmark (walk-forward CV)
python benchmarks/benchmark_runner.py

# Run tests
pytest tests/ -v

# Launch MLflow UI (view tracked runs)
mlflow ui --port 5001
```

## Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| MAPE | Mean Absolute Percentage Error | < 20% |
| RMSE | Root Mean Square Error | Context-dependent |
| MAE | Mean Absolute Error | Context-dependent |
| R² | Variance explained | > 0.5 |
| CI Coverage | % actuals inside P10–P90 band | > 70% |
| Shortfall Calibration | P(shortfall) vs actual shortfall rate | < 0.10 Brier score |

## Tech Stack

- **Forecasting**: Prophet (seasonality) + LightGBM (tabular features) ensemble
- **Simulation**: Monte Carlo (1000 draws per month) for shortfall probability
- **Stress Testing**: 5 scenarios (revenue mild/moderate/severe, expense shock, combined)
- **EWS**: Rule-based GREEN/AMBER/RED tiering
- **Tracking**: MLflow experiment logging
- **Explainability**: SHAP feature importance
