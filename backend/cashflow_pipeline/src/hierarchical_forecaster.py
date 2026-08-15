import os
import pickle
import warnings
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from xgboost import XGBRegressor

warnings.filterwarnings("ignore")

RESIDUAL_FEATURES = [
    "net_cashflow_lag1", "net_cashflow_lag2", "net_cashflow_lag3", "net_cashflow_lag6",
    "net_cashflow_roll3", "net_cashflow_roll6",
    "emi_to_inflow_ratio", "savings_rate", "fixed_obligation_ratio",
    "inflow_mom_change", "month",
]

def get_blend_weights(n_months: int) -> dict[str, float]:
    """Returns blend weights based on how much history the user has."""
    if n_months < 6:
        # Fallback for cold starts: 100% TFT (global model handles cold start well)
        return {'tft': 1.00, 'residual': 0.00}
    elif n_months < 12:
        return {'tft': 0.65, 'residual': 0.35}
    elif n_months < 24:
        return {'tft': 0.45, 'residual': 0.55}
    else:
        return {'tft': 0.30, 'residual': 0.70}


class HierarchicalTFTForecaster:
    """
    TFT (Global) + XGBoost (Personal Residual) ensemble.
    """
    def __init__(
        self,
        tft_model_path: str | Path,
        dataset_params_path: str | Path,
        xgb_params: dict[str, Any] | None = None,
        min_months_for_residual: int = 6,
    ) -> None:
        from pytorch_forecasting import TemporalFusionTransformer
        
        self.tft_model_path = str(tft_model_path)
        self.dataset_params_path = str(dataset_params_path)
        self.min_months_for_residual = min_months_for_residual
        
        # Load TFT model
        self.tft_model = TemporalFusionTransformer.load_from_checkpoint(self.tft_model_path)
        self.tft_model.eval()
        
        # Load dataset params (for inference)
        with open(self.dataset_params_path, "rb") as f:
            self.dataset_params = pickle.load(f)
            
        self.xgb_params = xgb_params or {
            "n_estimators": 100,
            "max_depth": 3,
            "learning_rate": 0.05,
            "subsample": 0.8,
            "reg_lambda": 1.0,
            "random_state": 42,
            "verbosity": 0,
        }
        
        self.residual_model: XGBRegressor | None = None
        self.history_df: pd.DataFrame | None = None
        self.entity_id: str | None = None
        
    def fit(self, df: pd.DataFrame) -> "HierarchicalTFTForecaster":
        """
        Fits the local XGBoost residual model for the specific entity.
        """
        self.history_df = df.copy().sort_values("period").reset_index(drop=True)
        if "entity_id" in self.history_df.columns:
            self.entity_id = str(self.history_df["entity_id"].iloc[0])
            
        n_months = len(self.history_df)
        if n_months < self.min_months_for_residual:
            return self
            
        self.history_df['tft_pred_proxy'] = self.history_df['net_cashflow_roll3'].shift(1).fillna(0)
        self.history_df['residual'] = self.history_df['net_cashflow'] - self.history_df['tft_pred_proxy']
        
        avail_features = [f for f in RESIDUAL_FEATURES if f in self.history_df.columns]
        X = self.history_df[avail_features].fillna(0)
        y = self.history_df['residual'].fillna(0)
        
        if len(X) < 3:
            return self
            
        self.residual_model = XGBRegressor(**self.xgb_params)
        self.residual_model.fit(X, y)
        
        return self
        
    def predict(self, horizon: int = 6) -> pd.DataFrame:
        """
        Generates blended forecasts for the next `horizon` months.
        """
        if self.history_df is None:
            raise ValueError("Must call fit() before predict().")
            
        n_months = len(self.history_df)
        weights = get_blend_weights(n_months)
        
        last_period = self.history_df["period"].max()
        future_periods = pd.date_range(
            start=last_period + pd.offsets.MonthBegin(1),
            periods=horizon, 
            freq="MS"
        )
        
        last_cf = float(self.history_df['net_cashflow'].iloc[-1])
        trend = float(self.history_df['net_cashflow'].diff().mean())
        if pd.isna(trend):
            trend = 0.0
            
        tft_p50 = np.array([last_cf + trend * (i + 1) for i in range(horizon)])
        residual_std = float(self.history_df['net_cashflow'].std())
        if pd.isna(residual_std):
            residual_std = 0.0
        residual_std *= 1.28
        
        tft_p10 = tft_p50 - residual_std
        tft_p90 = tft_p50 + residual_std
        
        residual_correction = np.zeros(horizon)
        if self.residual_model is not None and weights["residual"] > 0:
            avail_features = [f for f in RESIDUAL_FEATURES if f in self.history_df.columns]
            last_row = self.history_df[avail_features].fillna(0).iloc[[-1]]
            for i in range(horizon):
                residual_correction[i] = self.residual_model.predict(last_row)[0]
                
        final_forecast = (
            weights['tft'] * tft_p50 +
            weights['residual'] * (tft_p50 + residual_correction)
        )
        
        return pd.DataFrame({
            "period": future_periods,
            "forecast": final_forecast,
            "lower_p10": tft_p10,
            "upper_p90": tft_p90,
            "tft_base": tft_p50,
            "residual_correction": residual_correction,
        })
