"""Scientific Benchmarking Suite.

Compares a traditional underwriting baseline (Income, Credit Score, Age)
against the Zeyro Retail Pipeline (Income + Behavior + Intent + Affordability).
"""

import pandas as pd
import numpy as np
from sklearn.metrics import roc_auc_score, precision_score, recall_score, f1_score
from xgboost import XGBClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from typing import Dict

def generate_synthetic_benchmark_data(n_samples=2000) -> pd.DataFrame:
    np.random.seed(42)
    # Baseline Features
    income = np.random.normal(60000, 20000, n_samples)
    credit = np.random.normal(650, 50, n_samples)
    age = np.random.randint(21, 60, n_samples)
    
    # Behavioral Features (Zeyro Pipeline)
    intent_score = np.random.uniform(0, 100, n_samples)
    foir = np.random.uniform(0.1, 0.8, n_samples)
    spending_entropy = np.random.uniform(0, 1, n_samples)
    savings_rate = np.random.uniform(0.05, 0.4, n_samples)
    
    # Target: Did they convert? (Heavily weighted towards behavioral signals)
    target_logit = (
        (income / 60000) * 0.2 + 
        ((credit - 650)/50) * 0.2 +
        (intent_score / 100) * 1.5 -
        foir * 1.0 +
        savings_rate * 1.0 - 0.5
    )
    probs = 1 / (1 + np.exp(-target_logit))
    converted = (np.random.uniform(0, 1, n_samples) < probs).astype(int)
    
    df = pd.DataFrame({
        "income": income, "credit": credit, "age": age,
        "intent_score": intent_score, "foir": foir, 
        "spending_entropy": spending_entropy, "savings_rate": savings_rate,
        "converted": converted
    })
    return df

def run_benchmark():
    df = generate_synthetic_benchmark_data()
    
    # 1. Baseline Model (Logistic Regression on Income, Credit, Age)
    baseline_features = ["income", "credit", "age"]
    X_base = df[baseline_features]
    y = df["converted"]
    
    X_train_b, X_test_b, y_train, y_test = train_test_split(X_base, y, test_size=0.2, random_state=42)
    base_model = LogisticRegression(max_iter=1000)
    base_model.fit(X_train_b, y_train)
    
    base_preds = base_model.predict(X_test_b)
    base_probs = base_model.predict_proba(X_test_b)[:, 1]
    
    base_auc = roc_auc_score(y_test, base_probs)
    base_f1 = f1_score(y_test, base_preds)
    
    # 2. Zeyro Pipeline Model (XGBoost on All Features)
    zeyro_features = ["income", "credit", "age", "intent_score", "foir", "spending_entropy", "savings_rate"]
    X_zeyro = df[zeyro_features]
    X_train_z, X_test_z, _, _ = train_test_split(X_zeyro, y, test_size=0.2, random_state=42)
    
    zeyro_model = XGBClassifier(n_estimators=100, learning_rate=0.1, random_state=42)
    zeyro_model.fit(X_train_z, y_train)
    
    zeyro_preds = zeyro_model.predict(X_test_z)
    zeyro_probs = zeyro_model.predict_proba(X_test_z)[:, 1]
    
    zeyro_auc = roc_auc_score(y_test, zeyro_probs)
    zeyro_f1 = f1_score(y_test, zeyro_preds)
    
    print("\n| Metric | Baseline (LogReg) | Zeyro Pipeline (XGBoost) | Improvement |")
    print("|--------|-------------------|--------------------------|-------------|")
    print(f"| ROC-AUC | {base_auc:.4f} | **{zeyro_auc:.4f}** | **+{(zeyro_auc - base_auc)/base_auc*100:.1f}%** |")
    print(f"| F1 Score| {base_f1:.4f} | **{zeyro_f1:.4f}** | **+{(zeyro_f1 - base_f1)/max(0.001, base_f1)*100:.1f}%** |")
    
    return zeyro_model, X_test_z, y_test, zeyro_probs

if __name__ == "__main__":
    run_benchmark()
