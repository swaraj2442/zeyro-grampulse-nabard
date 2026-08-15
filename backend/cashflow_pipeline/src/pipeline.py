"""
End-to-End Pipeline Runner: raw AA transactions → output bundle.

Supports two entity types:
  - "msme":    Business entities (vendor, GST, revenue scenarios)
  - "general": Individual users (salary, personal spend, personal stress scenarios)

Also supports multiple bank accounts per entity — transactions are aggregated
across accounts before feature engineering.

Orchestration:
  1. Ingest raw transactions (multi-account, multi-entity-type supported)
  2. Categorize transaction narrations (taxonomy per entity_type)
  3. Engineer monthly features (entity_type-specific)
  4. Fit Prophet + LightGBM forecaster
  5. Run Monte Carlo shortfall simulation
  6. Apply liquidity stress scenarios (entity_type-specific)
  7. Evaluate EWS rules (entity_type-specific)
  8. Assemble output bundle
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd

from src.ews_rules import evaluate_ews_rules
from src.feature_engineer import build_monthly_features
from src.forecaster import CashflowForecaster
from src.hierarchical_forecaster import HierarchicalTFTForecaster
from src.ingestor import load_transactions
from src.monte_carlo import compute_shortfall_probabilities
from src.output_bundler import build_output_bundle
from src.stress_engine import StressEngine
from src.transaction_categorizer import categorize_transactions


def _select_model_config(features_df: pd.DataFrame) -> dict:
    has_profile = "city_tier" in features_df.columns or "age_band" in features_df.columns
    has_behaviour = "festival_month" in features_df.columns
    n_months = len(features_df)

    if n_months < 12:
        return {"prophet_weight": 0.2, "lgbm_weight": 0.8}
    elif has_profile and has_behaviour:
        return {"prophet_weight": 0.3, "lgbm_weight": 0.7}
    elif has_profile:
        return {"prophet_weight": 0.4, "lgbm_weight": 0.6}
    else:
        return {"prophet_weight": 0.5, "lgbm_weight": 0.5}


def run_pipeline(
    transactions_path: str | Path | None = None,
    entity_id: str | None = None,
    entity_type: str = "msme",
    forecast_horizon: int = 12,
    prophet_weight: float | None = None,
    lgbm_weight: float | None = None,
    n_mc_simulations: int = 1000,
    features_df: pd.DataFrame | None = None,
    profile_df: pd.DataFrame | None = None,
    tree_model_type: str = "lgbm",
    tft_model_path: str | Path | None = None,
    tft_dataset_params_path: str | Path | None = None,
) -> dict[str, Any]:
    """
    Run the complete cashflow forecasting and liquidity stress pipeline.

    Args:
        transactions_path:  Path to the AA transactions CSV.
        entity_id:          Entity identifier to run the pipeline for.
        entity_type:        "msme" (default) or "general".
                            If the CSV has an entity_type column, this is also
                            read per-row — providing it here overrides for all rows.
        forecast_horizon:   Number of months ahead to forecast (default 12).
        prophet_weight:     Ensemble weight for Prophet (lgbm_weight = 1 - this).
        lgbm_weight:        Ensemble weight for LightGBM.
        n_mc_simulations:   Number of Monte Carlo draws for shortfall probability.

    Returns:
        Structured output bundle dict (JSON-serializable).

    Raises:
        ValueError: If the entity is not found in the transactions file.
        FileNotFoundError: If the transactions file does not exist.
    """
    et = entity_type.lower().strip()

    # ── Data prep ─────────────────────────────────────────────────────────────
    if features_df is None:
        if transactions_path is None or entity_id is None:
            raise ValueError("Must provide either features_df or both (transactions_path and entity_id)")
        # ── 1. Ingest ─────────────────────────────────────────────────────────────
        raw_df = load_transactions(transactions_path)

        if entity_id not in raw_df["entity_id"].unique():
            raise ValueError(
                f"No data found for entity_id='{entity_id}'. "
                f"Available entities: {sorted(raw_df['entity_id'].unique().tolist())}"
            )

        # ── 2. Categorize ─────────────────────────────────────────────────────────
        categorized_df = categorize_transactions(raw_df, entity_type=et)

        # ── 3. Feature engineering ────────────────────────────────────────────────
        features_df = build_monthly_features(
            categorized_df, entity_id=entity_id, entity_type=et, profile_df=profile_df
        )
    else:
        if entity_id is None and "entity_id" in features_df.columns:
            entity_id = str(features_df["entity_id"].iloc[0])

    # ── 3. Initialize & Fit Forecaster ────────────────────────────────────────
    if tft_model_path is None and Path("models/tft_best").exists():
        tft_model_path = "models/tft_best"
    if tft_dataset_params_path is None and Path("models/tft_dataset_params.pkl").exists():
        tft_dataset_params_path = "models/tft_dataset_params.pkl"

    if tft_model_path and tft_dataset_params_path and Path(tft_model_path).exists() and Path(tft_dataset_params_path).exists():
        forecaster = HierarchicalTFTForecaster(
            tft_model_path=tft_model_path,
            dataset_params_path=tft_dataset_params_path,
        )
    else:
        if prophet_weight is None or lgbm_weight is None:
            config = _select_model_config(features_df)
            prophet_weight = config["prophet_weight"]
            lgbm_weight = config["lgbm_weight"]
    
        forecaster = CashflowForecaster(
            prophet_weight=prophet_weight,
            lgbm_weight=lgbm_weight,
            tree_model_type=tree_model_type,
        )

    forecaster.fit(features_df)
    forecast_df = forecaster.predict(horizon=forecast_horizon)

    # Attach projected inflow/outflow (historical means) for stress engine
    forecast_df["total_inflow"] = float(features_df["total_inflow"].mean())
    forecast_df["total_outflow"] = float(features_df["total_outflow"].mean())

    # Attach EMI amount if available (used by general user stress scenarios)
    if "emi_amount" in features_df.columns:
        forecast_df["emi_amount"] = float(features_df["emi_amount"].mean())

    # ── 5. Shortfall probabilities ────────────────────────────────────────────
    forecast_with_probs = compute_shortfall_probabilities(
        forecast_df, n_simulations=n_mc_simulations
    )

    # ── 6. Stress testing ─────────────────────────────────────────────────────
    stress_engine = StressEngine()
    stress_results = stress_engine.run(forecast_with_probs, entity_type=et)

    # ── 7. EWS rules ──────────────────────────────────────────────────────────
    ews_result = evaluate_ews_rules(features_df, entity_type=et)

    # ── 8. Bundle ─────────────────────────────────────────────────────────────
    if entity_id is None:
        entity_id = "unknown"
        
    return build_output_bundle(
        entity_id=entity_id,
        forecast_df=forecast_with_probs,
        stress_results=stress_results,
        ews_result=ews_result,
    )
