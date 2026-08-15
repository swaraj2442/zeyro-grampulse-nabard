"""Income Estimation Model.

Predicts actual Monthly Income from behavioral transaction features using XGBoost.
"""

import numpy as np
import pandas as pd
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, mean_absolute_percentage_error
from sklearn.model_selection import train_test_split
import mlflow

class IncomeEstimator:
    def __init__(self):
        self.model = XGBRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=4,
            random_state=42
        )

    def train(self, X: pd.DataFrame, y: pd.Series):
        """Train the regression model and log to MLflow."""
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        mlflow.set_experiment("Retail_Lending_Hackathon")
        with mlflow.start_run(run_name="Income_Estimator_XGBoost"):
            self.model.fit(X_train, y_train)
            preds = self.model.predict(X_test)
            
            # Metrics
            rmse = np.sqrt(mean_squared_error(y_test, preds))
            mae = mean_absolute_error(y_test, preds)
            mape = mean_absolute_percentage_error(y_test, preds)
            
            # Log params & metrics
            mlflow.log_param("n_estimators", 100)
            mlflow.log_param("learning_rate", 0.1)
            mlflow.log_param("max_depth", 4)
            
            mlflow.log_metric("rmse", rmse)
            mlflow.log_metric("mae", mae)
            mlflow.log_metric("mape", mape)
            
            mlflow.xgboost.log_model(self.model, "income_estimator_model")
        
        return {
            "rmse": rmse,
            "mae": mae,
            "mape": mape
        }

    def predict(self, features: pd.DataFrame) -> np.ndarray:
        """Predict monthly income."""
        return self.model.predict(features)
