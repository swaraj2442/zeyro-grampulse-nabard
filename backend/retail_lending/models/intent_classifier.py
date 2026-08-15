"""Machine Learning Intent Classifier.

Replaces the rule-based intent engine with an XGBoost Classifier trained on
transactional sequences, merchant category counts, and temporal features.
"""

import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import mlflow

class IntentClassifier:
    def __init__(self):
        self.model = XGBClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=4,
            use_label_encoder=False,
            eval_metric="mlogloss",
            random_state=42
        )
        self.label_encoder = LabelEncoder()
        
    def extract_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Converts raw transaction df into ML features (merchant counts, recency, etc.)
        Expected output is 1 row per user.
        """
        # For hackathon purposes, this mock function assumes we already have a 
        # flattened feature set per user passed into train().
        return df

    def train(self, X: pd.DataFrame, y: pd.Series):
        """Train the multi-class intent classifier and log to MLflow."""
        y_encoded = self.label_encoder.fit_transform(y)
        
        X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)
        
        mlflow.set_experiment("Retail_Lending_Hackathon")
        with mlflow.start_run(run_name="Intent_Classifier_XGBoost"):
            self.model.fit(X_train, y_train)
            
            # Note: ROC AUC for multi-class requires probas
            probas = self.model.predict_proba(X_test)
            preds = self.model.predict(X_test)
            
            accuracy = (preds == y_test).mean()
            
            mlflow.log_param("n_estimators", 100)
            mlflow.log_metric("intent_accuracy", accuracy)
            mlflow.xgboost.log_model(self.model, "intent_classifier_model")
            
        return {"accuracy": accuracy}

    def predict_probas(self, features: pd.DataFrame) -> dict:
        """Predict probability of each loan intent class."""
        probas = self.model.predict_proba(features)[0]
        classes = self.label_encoder.classes_
        return {str(cls): round(float(prob)*100, 2) for cls, prob in zip(classes, probas)}
