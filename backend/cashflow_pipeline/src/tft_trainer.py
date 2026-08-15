import os
import pickle
import time
import warnings
from pathlib import Path
from typing import Any

import mlflow
import numpy as np
import pandas as pd
import lightning.pytorch as pl
import torch
from pytorch_forecasting import TemporalFusionTransformer, TimeSeriesDataSet
from pytorch_forecasting.data import GroupNormalizer
from pytorch_forecasting.metrics import QuantileLoss
from lightning.pytorch.callbacks import EarlyStopping, LearningRateMonitor, ModelCheckpoint
from lightning.pytorch.loggers import MLFlowLogger

from src.feature_engineer import build_monthly_features
from src.ingestor import load_transactions
from src.transaction_categorizer import categorize_transactions

warnings.filterwarnings("ignore")

TIME_VARYING_KNOWN_REALS = [
    "month",
    "is_festival_month",
    "is_gst_filing_month",
    "is_advance_tax_month",
]
TIME_VARYING_UNKNOWN_REALS = [
    "net_cashflow", "total_inflow", "total_outflow", "emi_to_inflow_ratio",
    "fixed_obligation_ratio", "savings_rate", "discretionary_spend_ratio",
    "upi_to_inflow_ratio", "net_cashflow_lag1", "net_cashflow_lag2",
    "net_cashflow_lag3", "net_cashflow_roll3", "net_cashflow_roll6",
    "inflow_mom_change", "upi_spend_mom", "fixed_obligation_mom"
]
STATIC_CATEGORICALS = ["employment_type", "city_tier", "age_band"]
STATIC_REALS = ["household_size", "cost_of_living_index"]
TIME_VARYING_KNOWN_CATEGORICALS = ["quarter"]

def build_global_feature_store(
    transactions_path: str | Path,
    profile_df: pd.DataFrame | None = None,
    min_history_months: int = 6
) -> pd.DataFrame:
    raw_df = load_transactions(transactions_path)
    cat_df = categorize_transactions(raw_df)

    all_features = []
    for entity_id in raw_df["entity_id"].unique():
        try:
            feats = build_monthly_features(cat_df, entity_id=entity_id, profile_df=profile_df)
            if len(feats) >= min_history_months:
                all_features.append(feats)
        except Exception:
            continue
            
    if not all_features:
        raise ValueError("No entities had enough history.")
        
    feature_store = pd.concat(all_features, ignore_index=True)
    feature_store = feature_store.sort_values(["entity_id", "period"]).reset_index(drop=True)
    
    # TFT needs an integer time index per entity
    feature_store["time_idx"] = (
        feature_store.groupby("entity_id")["period"]
        .transform(lambda s: (s - s.min()).dt.days // 30)
        .astype(int)
    )
    
    # Ensure categorical columns are strings
    cat_cols = ["entity_id"] + STATIC_CATEGORICALS + TIME_VARYING_KNOWN_CATEGORICALS
    for col in cat_cols:
        if col in feature_store.columns:
            feature_store[col] = feature_store[col].astype(str)
            
    # Fill numeric NaNs
    num_cols = TIME_VARYING_KNOWN_REALS + TIME_VARYING_UNKNOWN_REALS + STATIC_REALS
    for col in num_cols:
        if col in feature_store.columns:
            feature_store[col] = feature_store[col].fillna(0).astype(float)
            
    return feature_store


def train_global_tft(
    transactions_path: str | Path,
    profile_df: pd.DataFrame | None = None,
    model_output_dir: str | Path = "models",
    dagshub_username: str | None = None,
    dagshub_repo_name: str | None = None,
    dagshub_token: str | None = None,
    max_encoder_length: int = 12,
    max_prediction_length: int = 6,
    max_epochs: int = 30,
) -> tuple[str, str]:
    """Train the global TFT model and save to disk."""
    import dagshub
    
    os.makedirs(model_output_dir, exist_ok=True)
    
    if dagshub_token:
        os.environ['DAGSHUB_USER_TOKEN'] = dagshub_token
        
    if dagshub_username and dagshub_repo_name:
        dagshub.init(
            repo_owner=dagshub_username,
            repo_name=dagshub_repo_name,
            mlflow=True,
        )
        mlflow_tracking_uri = f'https://dagshub.com/{dagshub_username}/{dagshub_repo_name}.mlflow'
    else:
        mlflow_tracking_uri = "sqlite:///mlflow.db"
        
    mlflow.set_tracking_uri(mlflow_tracking_uri)
    mlflow.set_experiment("cashflow_tft_global")

    print("Building global feature store...")
    feature_store = build_global_feature_store(transactions_path, profile_df)
    
    max_time_idx = feature_store.groupby("entity_id")["time_idx"].transform("max")
    val_cutoff = max_time_idx - max_prediction_length
    train_df = feature_store[feature_store["time_idx"] <= val_cutoff].copy()
    val_df = feature_store.copy()
    
    def _filter_cols(cols):
        return [c for c in cols if c in feature_store.columns]
        
    training_dataset = TimeSeriesDataSet(
        train_df,
        time_idx="time_idx",
        target="net_cashflow",
        group_ids=["entity_id"],
        max_encoder_length=max_encoder_length,
        max_prediction_length=max_prediction_length,
        static_categoricals=_filter_cols(STATIC_CATEGORICALS),
        static_reals=_filter_cols(STATIC_REALS),
        time_varying_known_reals=_filter_cols(TIME_VARYING_KNOWN_REALS),
        time_varying_known_categoricals=_filter_cols(TIME_VARYING_KNOWN_CATEGORICALS),
        time_varying_unknown_reals=_filter_cols(TIME_VARYING_UNKNOWN_REALS),
        target_normalizer=GroupNormalizer(
            groups=["entity_id"],
            transformation="softplus",
        ),
        add_relative_time_idx=True,
        add_target_scales=True,
        add_encoder_length=True,
        allow_missing_timesteps=True,
    )
    
    validation_dataset = TimeSeriesDataSet.from_dataset(
        training_dataset,
        val_df,
        predict=True,
        stop_randomization=True,
    )
    
    train_loader = training_dataset.to_dataloader(train=True, batch_size=32, num_workers=0)
    val_loader = validation_dataset.to_dataloader(train=False, batch_size=64, num_workers=0)
    
    tft = TemporalFusionTransformer.from_dataset(
        training_dataset,
        hidden_size=32,
        attention_head_size=2,
        dropout=0.1,
        hidden_continuous_size=16,
        loss=QuantileLoss(quantiles=[0.1, 0.5, 0.9]),
        learning_rate=3e-3,
        reduce_on_plateau_patience=4,
    )
    
    checkpoint_path = Path(model_output_dir) / "tft_best"
    checkpoint_callback = ModelCheckpoint(
        dirpath=checkpoint_path,
        filename="tft-{epoch:02d}-{val_loss:.4f}",
        monitor="val_loss",
        mode="min",
        save_top_k=1,
        verbose=True,
    )
    callbacks: list[pl.Callback] = [
        EarlyStopping(monitor="val_loss", patience=5, mode="min", verbose=True),
        LearningRateMonitor(logging_interval="epoch"),
        checkpoint_callback,
    ]
    
    mlflow_logger = MLFlowLogger(
        experiment_name="cashflow_tft_global",
        tracking_uri=mlflow_tracking_uri,
        run_name="tft_training_run",
    )
    
    trainer = pl.Trainer(
        max_epochs=max_epochs,
        accelerator="auto",
        devices=1,
        gradient_clip_val=0.1,
        callbacks=callbacks,
        logger=mlflow_logger,
        enable_progress_bar=True,
    )
    
    print("Starting TFT training...")
    trainer.fit(tft, train_dataloaders=train_loader, val_dataloaders=val_loader)
    
    best_model_path = checkpoint_callback.best_model_path
    
    # Save dataset parameters for inference
    dataset_params_path = Path(model_output_dir) / "tft_dataset_params.pkl"
    with open(dataset_params_path, "wb") as f:
        pickle.dump(training_dataset.get_parameters(), f)
        
    return best_model_path, str(dataset_params_path)

if __name__ == "__main__":
    # Demo script if run directly
    data_path = Path("data/sample_aa_transactions.csv")
    profile_path = Path("data/user_profiles.csv")
    
    profile_df = None
    if profile_path.exists():
        profile_df = pd.read_csv(profile_path)
        
    best_model, params = train_global_tft(
        transactions_path=data_path,
        profile_df=profile_df,
        max_epochs=5  # Short for demo
    )
    print(f"Model saved to {best_model}")
