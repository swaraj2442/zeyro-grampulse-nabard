# cashflow_pipeline
"""
Cashflow Forecasting + Liquidity Stress Pipeline.

Modules:
    ingestor               - Parse and normalize raw AA transactions
    transaction_categorizer - Rule-based narration classifier
    feature_engineer       - Monthly aggregates and lag features
    forecaster             - Prophet + LightGBM ensemble
    ml_trainer             - Train/val/test split + MLflow tracking
    monte_carlo            - Shortfall probability simulation
    stress_engine          - Liquidity stress scenarios
    ews_rules              - Early warning signal rules
    output_bundler         - Final output bundle assembler
    pipeline               - End-to-end orchestrator
"""
