"""
Cashflow Forecaster: Prophet + LightGBM ensemble with SHAP explainability.

Architecture:
  - Prophet captures trend + seasonality from the monthly time series.
  - LightGBM captures non-linear patterns from engineered tabular features.
  - Ensemble = weighted average (default 50/50).
  - Confidence bands are derived from historical residual std.
  - SHAP values are available via the explain() method.
  - Models can be serialized to disk via save() / load().
"""
from __future__ import annotations

import warnings
from pathlib import Path
from typing import Any

import joblib
import lightgbm as lgb
import numpy as np
import pandas as pd
from prophet import Prophet
from xgboost import XGBRegressor

warnings.filterwarnings("ignore")

# Tabular features fed to LightGBM.
# Core features are always expected; entity-specific features are used only
# when present in the training DataFrame (missing values are filled with 0).
LGBM_FEATURES_CORE: list[str] = [
    "net_cashflow_lag1",
    "net_cashflow_lag3",
    "net_cashflow_lag6",
    "net_cashflow_roll3",
    "net_cashflow_roll6",
    "inflow_volatility6",
    "month",
    "inflow_mom_change",
    "total_inflow",
    "total_outflow",
]

# MSME-specific optional features
LGBM_FEATURES_MSME: list[str] = [
    "emi_to_inflow_ratio",
    "inflow_concentration",
    "inflow_trend_slope6",
]

# General user optional features
LGBM_FEATURES_GENERAL: list[str] = [
    "fixed_obligation_ratio",
    "discretionary_spend_ratio",
    "savings_rate",
    "salary_regularity",
    "upi_spend_trend",
]

# Kept for backwards compatibility
LGBM_FEATURES: list[str] = LGBM_FEATURES_CORE + LGBM_FEATURES_MSME

DEFAULT_LGBM_PARAMS: dict[str, Any] = {
    "n_estimators": 300,
    "learning_rate": 0.05,
    "max_depth": 4,
    "num_leaves": 31,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "reg_alpha": 0.1,
    "reg_lambda": 0.1,
    "min_child_samples": 5,
    "random_state": 42,
    "verbose": -1,
}

DEFAULT_XGB_PARAMS: dict[str, Any] = {
    "n_estimators": 200,
    "learning_rate": 0.05,
    "max_depth": 4,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "reg_alpha": 0.1,
    "reg_lambda": 1.0,
    "random_state": 42,
    "verbosity": 0,
}


class CashflowForecaster:
    """
    Prophet + LightGBM ensemble forecaster for monthly net cashflow.

    Args:
        prophet_weight: Weight for Prophet predictions in the ensemble (0-1).
        lgbm_weight:    Weight for LightGBM predictions (must sum to 1 with prophet_weight).
        lgbm_params:    Optional LightGBM hyperparameter overrides.
    """

    def __init__(
        self,
        prophet_weight: float = 0.5,
        lgbm_weight: float = 0.5,
        lgbm_params: dict[str, Any] | None = None,
        tree_model_type: str = "lgbm",
    ) -> None:
        if abs(prophet_weight + lgbm_weight - 1.0) > 1e-9:
            raise ValueError(
                f"prophet_weight ({prophet_weight}) + lgbm_weight ({lgbm_weight}) "
                "must equal 1.0"
            )
        self.prophet_weight = prophet_weight
        self.lgbm_weight = lgbm_weight
        self.tree_model_type = tree_model_type.lower()
        
        default_params = DEFAULT_XGB_PARAMS if self.tree_model_type == "xgboost" else DEFAULT_LGBM_PARAMS
        self._lgbm_params: dict[str, Any] = {
            **default_params,
            **(lgbm_params or {}),
        }

        self._prophet: Prophet | None = None
        self._lgbm: lgb.LGBMRegressor | None = None
        self._history_df: pd.DataFrame | None = None
        self._lgbm_features: list[str] = []
        self._fitted = False

    # ── Public API ────────────────────────────────────────────────────────────

    def fit(self, df: pd.DataFrame, eval_df: pd.DataFrame | None = None, callbacks: list | None = None) -> "CashflowForecaster":
        """
        Fit both Prophet and LightGBM on historical monthly features.

        Args:
            df: Monthly features DataFrame from feature_engineer.build_monthly_features().

        Returns:
            self (for chaining).
        """
        df = df.copy().sort_values("period").reset_index(drop=True)
        self._history_df = df

        self._fit_prophet(df)
        self._fit_lgbm(df, eval_df=eval_df, callbacks=callbacks)

        self._fitted = True
        return self

    def tune_and_fit(self, df: pd.DataFrame, n_trials: int = 50, run_name: str = "cashflow_optuna", n_folds: int = 5) -> "CashflowForecaster":
        """
        Run an Optuna study to find the best LightGBM hyperparameters, 
        and then fit the final ensemble model using those parameters.
        """
        from ml_trainer import tune_cashflow_forecaster
        
        # 1. Run the Optuna tuning study
        best_params = tune_cashflow_forecaster(
            df=df,
            n_trials=n_trials,
            run_name=run_name,
            n_folds=n_folds,
            prophet_weight=self.prophet_weight,
            lgbm_weight=self.lgbm_weight,
        )
        
        # 2. Update our internal params and fit the final model
        self._lgbm_params = best_params
        self.fit(df)
        return self

    def predict(self, horizon: int = 3) -> pd.DataFrame:
        """
        Generate ensemble forecast for the next `horizon` months.

        Args:
            horizon: Number of months ahead to forecast.

        Returns:
            DataFrame with columns:
                period, forecast, lower_p10, upper_p90,
                prophet_forecast, lgbm_forecast
        """
        self._assert_fitted()

        future_periods = self._make_future_periods(horizon)
        prophet_vals, prophet_lower, prophet_upper = self._prophet_predict(
            future_periods
        )
        lgbm_vals = self._lgbm_predict_recursive(future_periods)

        ensemble = (
            self.prophet_weight * prophet_vals + self.lgbm_weight * lgbm_vals # type: ignore
        )

        # Confidence bands from historical residuals
        residual_std = self._residual_std()
        lower = ensemble - 1.28 * residual_std  # P10 (z=1.28 for 80% CI)
        upper = ensemble + 1.28 * residual_std  # P90

        return pd.DataFrame(
            {
                "period": future_periods,
                "forecast": ensemble,
                "lower_p10": lower,
                "upper_p90": upper,
                "prophet_forecast": prophet_vals,
                "lgbm_forecast": lgbm_vals,
            }
        )

    def explain(self, n_samples: int | None = None) -> pd.DataFrame:
        """
        Compute SHAP feature importances for LightGBM on training data.

        Args:
            n_samples: Limit explanation to this many training rows (for speed).

        Returns:
            DataFrame with columns [feature, mean_abs_shap] sorted descending.

        Raises:
            RuntimeError: If fit() has not been called.
        """
        self._assert_fitted()

        try:
            import shap  # noqa: PLC0415
        except ImportError as exc:
            raise ImportError("pip install shap to use explain()") from exc

        assert self._history_df is not None
        X = self._history_df[self._lgbm_features].fillna(0)
        if n_samples is not None:
            X = X.head(n_samples)

        explainer = shap.TreeExplainer(self._lgbm)
        shap_values = explainer.shap_values(X)

        mean_abs = np.abs(shap_values).mean(axis=0)
        return (
            pd.DataFrame(
                {"feature": self._lgbm_features, "mean_abs_shap": mean_abs}
            )
            .sort_values("mean_abs_shap", ascending=False)
            .reset_index(drop=True)
        )

    def save(self, path: str | Path) -> None:
        """Serialize the fitted forecaster to disk using joblib."""
        self._assert_fitted()
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self, path)

    @classmethod
    def load(cls, path: str | Path) -> "CashflowForecaster":
        """Load a previously serialized forecaster from disk."""
        return joblib.load(Path(path))

    # ── Private helpers ───────────────────────────────────────────────────────

    def _assert_fitted(self) -> None:
        if not self._fitted:
            raise RuntimeError(
                "CashflowForecaster: must call fit() before predict() or explain()"
            )

    def _fit_prophet(self, df: pd.DataFrame) -> None:
        prophet_df = df[["period", "net_cashflow"]].rename(
            columns={"period": "ds", "net_cashflow": "y"}
        )
        self._prophet = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False,
            interval_width=0.8,
            changepoint_prior_scale=0.05,
        )
        self._prophet.fit(prophet_df)

    def _fit_lgbm(self, df: pd.DataFrame, eval_df: pd.DataFrame | None = None, callbacks: list | None = None) -> None:
        # Core features always used; entity-specific ones included only if present
        optional_candidates = LGBM_FEATURES_MSME + LGBM_FEATURES_GENERAL
        available = [
            f for f in LGBM_FEATURES_CORE + optional_candidates
            if f in df.columns
        ]
        self._lgbm_features = available
        X = df[available].fillna(0)
        y = df["net_cashflow"]
        
        if self.tree_model_type == "xgboost":
            self._lgbm = XGBRegressor(**self._lgbm_params)
        else:
            self._lgbm = lgb.LGBMRegressor(**self._lgbm_params)
        
        eval_set = None
        if eval_df is not None:
            X_val = eval_df[available].fillna(0)
            y_val = eval_df["net_cashflow"]
            eval_set = [(X_val, y_val)]

        self._lgbm.fit(
            X, y,
            eval_set=eval_set, # type: ignore
            callbacks=callbacks,
        )

    def _make_future_periods(self, horizon: int) -> pd.DatetimeIndex:
        assert self._history_df is not None
        last_period = self._history_df["period"].max()
        return pd.date_range(
            start=last_period + pd.offsets.MonthBegin(1),
            periods=horizon,
            freq="MS",
        )

    def _prophet_predict(
        self, future_periods: pd.DatetimeIndex
    ) -> tuple[Any, Any, Any]:
        assert self._prophet is not None
        future_df = pd.DataFrame({"ds": future_periods})
        pf = self._prophet.predict(future_df)
        return (
            pf["yhat"].to_numpy(),
            pf["yhat_lower"].to_numpy(),
            pf["yhat_upper"].to_numpy(),
        )

    def _lgbm_predict_recursive(
        self, future_periods: pd.DatetimeIndex
    ) -> np.ndarray:
        """Recursive multi-step LightGBM forecast using lagged predictions."""
        assert self._history_df is not None and self._lgbm is not None
        assert self._lgbm_features is not None, "Model not fitted"

        history_vals = list(self._history_df["net_cashflow"].values)
        lgbm_vals: list[float] = []

        # Precompute averages for all static features across both entity types
        static_averages = {}
        for feat in LGBM_FEATURES_MSME + LGBM_FEATURES_GENERAL + ["total_inflow", "total_outflow"]:
            if feat in self._history_df.columns:
                static_averages[feat] = self._history_df[feat].mean()
            else:
                static_averages[feat] = 0.0

        for period in future_periods:
            all_vals = history_vals + lgbm_vals
            lag1 = all_vals[-1] if len(all_vals) >= 1 else 0.0
            lag3 = all_vals[-3] if len(all_vals) >= 3 else lag1
            lag6 = all_vals[-6] if len(all_vals) >= 6 else lag1
            roll3 = float(np.mean(all_vals[-3:])) if len(all_vals) >= 3 else lag1
            roll6 = float(np.mean(all_vals[-6:])) if len(all_vals) >= 6 else lag1
            mom_change = (lag1 - lag3) / (abs(lag3) + 1e-9)

            # Build full dictionary of possible features
            row_dict = {
                "net_cashflow_lag1": lag1,
                "net_cashflow_lag3": lag3,
                "net_cashflow_lag6": lag6,
                "net_cashflow_roll3": roll3,
                "net_cashflow_roll6": roll6,
                "month": period.month,
                "inflow_mom_change": mom_change,
            }
            # Add all precomputed static averages
            row_dict.update(static_averages)

            # Filter row to exactly match self._lgbm_features used during fit
            row = pd.DataFrame([{f: row_dict.get(f, 0.0) for f in self._lgbm_features}])

            pred = self._lgbm.predict(row)[0]
            lgbm_vals.append(float(pred))

        return np.array(lgbm_vals) # type: ignore

    def _residual_std(self) -> float:
        """Compute residual std between Prophet in-sample predictions and actuals."""
        assert self._history_df is not None and self._prophet is not None
        prophet_in_sample = self._prophet.predict(
            pd.DataFrame({"ds": self._history_df["period"]})
        )["yhat"].values
        residuals = self._history_df["net_cashflow"].values - prophet_in_sample # type: ignore
        return float(np.std(residuals))
