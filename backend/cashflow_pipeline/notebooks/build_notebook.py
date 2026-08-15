import nbformat as nbf

nb = nbf.v4.new_notebook()

# Markdown cell: Introduction
intro_md = """# Kaggle Indian Personal Finance EDA & Cashflow Prediction

This notebook loads the `shriyashjagtap/indian-personal-finance-and-spending-habits` dataset using `kagglehub`.
Since this dataset contains cross-sectional monthly snapshots for 20,000 individuals, we will synthesize `user_id` and `period` (date) columns so that we can run it through our time-series `CashflowForecaster` (Prophet + LightGBM).
"""

# Code cell: Imports
imports_code = """import os
import warnings
import kagglehub
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

import sys
from pathlib import Path

# Add src to Python path so we can import our pipeline components
src_path = Path(os.getcwd()).parent / "src"
if str(src_path) not in sys.path:
    sys.path.append(str(src_path))

from forecaster import CashflowForecaster
from forecaster import CashflowForecaster
from ml_trainer import tune_cashflow_forecaster, run_training_experiment

warnings.filterwarnings('ignore')
plt.style.use('ggplot')
sns.set_theme(style="whitegrid", palette="muted")
"""

# Markdown cell: Load Dataset
load_md = "## 1. Load Dataset"

load_code = """print("Downloading dataset...")
path = kagglehub.dataset_download("shriyashjagtap/indian-personal-finance-and-spending-habits")
print("Path to dataset files:", path)

# Find the csv file
csv_file = None
for root, dirs, files in os.walk(path):
    for file in files:
        if file.endswith(".csv"):
            csv_file = os.path.join(root, file)
            break

if not csv_file:
    raise FileNotFoundError("Could not find CSV file in downloaded Kaggle dataset.")

df = pd.read_csv(csv_file)
print(f"Dataset loaded with {len(df)} rows.")

df.head()
"""

# Markdown cell: Synthesize Time Series
synth_md = """## 2. Synthesize Time Series Features
The dataset lacks `user_id` and `date`. To use our time-series `CashflowForecaster`, we will group the 20,000 rows into 500 "users", each with 40 months of data.
"""

synth_code = """num_users = 500
records_per_user = len(df) // num_users

# Create date range of 40 months starting from 2020-01-01
dates = pd.date_range(start="2020-01-01", periods=records_per_user, freq='MS')

# Assign user_ids and dates
df['user_id'] = np.repeat(np.arange(num_users), records_per_user)
df['date'] = np.tile(dates, num_users)

df = df.sort_values(['user_id', 'date']).reset_index(drop=True)
df.head()
"""

# Markdown cell: Schema mapping
map_md = """## 3. Map Schema to Pipeline
We will map the existing financial columns to the schema expected by our pipeline: `period`, `total_inflow`, `total_outflow`, `net_cashflow`, etc.
"""

map_code = """def map_to_pipeline_schema(df: pd.DataFrame) -> pd.DataFrame:
    mapped = df.copy()
    
    # Map core expected features
    mapped = mapped.rename(columns={
        "date": "period",
        "Income": "total_inflow",
        "Rent": "rent_amount",
        "Loan_Repayment": "emi_amount"
    })
    
    # Calculate total outflow
    expense_cols = ['rent_amount', 'emi_amount', 'Insurance', 'Groceries', 
                    'Transport', 'Eating_Out', 'Entertainment', 'Utilities', 
                    'Healthcare', 'Education', 'Miscellaneous']
    
    mapped['total_outflow'] = mapped[expense_cols].sum(axis=1)
    
    # Calculate net cashflow
    mapped["net_cashflow"] = mapped["total_inflow"] - mapped["total_outflow"]
    
    # Calculate fixed obligation ratio
    mapped["fixed_obligations"] = mapped["emi_amount"] + mapped["rent_amount"]
    mapped["fixed_obligation_ratio"] = mapped["fixed_obligations"] / mapped["total_inflow"]
    
    # Calculate discretionary spending
    discretionary_cols = ['Eating_Out', 'Entertainment', 'Miscellaneous']
    mapped['discretionary_amount'] = mapped[discretionary_cols].sum(axis=1)
    
    # ── ADVANCED FEATURE ENGINEERING ──
    # 1. Savings Rate
    mapped['savings_rate'] = mapped['net_cashflow'] / mapped['total_inflow']
    
    # 2. Debt-to-Income Ratio
    mapped['debt_to_income_ratio'] = mapped['emi_amount'] / mapped['total_inflow']
    
    # 3. Discretionary Spending Ratio
    mapped['discretionary_ratio'] = mapped['discretionary_amount'] / mapped['total_inflow']
    
    # 4. Desired Savings Gap
    # If gap is positive, the person didn't reach their desired savings.
    mapped['desired_savings_gap'] = mapped['Desired_Savings'] - mapped['net_cashflow']
    
    # 5. Total Potential Savings
    potential_savings_cols = [c for c in mapped.columns if 'Potential_Savings' in c]
    mapped['total_potential_savings'] = mapped[potential_savings_cols].sum(axis=1)
    
    # 6. Optimized Cashflow (if they realized all potential savings)
    mapped['optimized_net_cashflow'] = mapped['net_cashflow'] + mapped['total_potential_savings']
    
    # 7. Age Decades
    mapped['age_decade'] = (mapped['Age'] // 10) * 10

    return mapped

mapped_df = map_to_pipeline_schema(df)
print("Engineered Features:")
print(mapped_df[['savings_rate', 'debt_to_income_ratio', 'discretionary_ratio', 'desired_savings_gap', 'total_potential_savings', 'optimized_net_cashflow']].head())
mapped_df.head()
"""

# Markdown cell: EDA
eda_md = """## 4. Exploratory Data Analysis (EDA)
Let's explore the distribution of Income vs Rent, and how Potential Savings vary by Occupation.
"""

eda_code = """fig, axes = plt.subplots(1, 2, figsize=(16, 6))

sns.scatterplot(data=mapped_df.sample(2000), x='total_inflow', y='rent_amount', hue='City_Tier', alpha=0.6, ax=axes[0])
axes[0].set_title('Income vs Rent by City Tier')

# Potential savings by occupation
sns.boxplot(data=mapped_df, x='Occupation', y='Potential_Savings_Miscellaneous', ax=axes[1])
axes[1].set_title('Potential Misc Savings by Occupation')
plt.xticks(rotation=45)

plt.tight_layout()
plt.show()
"""

# Markdown cell: ML Tuning
tune_md = """## 5. Model Tuning (Optuna)
We will extract the time-series for a target user and tune the LightGBM hyperparameters using Optuna (logged to MLflow).
"""

tune_code = """target_user = 0
user_df = mapped_df[mapped_df['user_id'] == target_user].copy()
user_df = user_df.sort_values('period')

print(f"Running Optuna tuning for User {target_user}...")
best_params = tune_cashflow_forecaster(
    df=user_df, 
    n_trials=10, 
    run_name=f"kaggle_indian_{target_user}_tuning"
)
print("\\nTuning Complete! Best LightGBM Parameters found:")
print(best_params)
"""

# Markdown cell: Full Training
train_md = """## 6. Full Training Experiment & Metrics (MLflow)
Now we'll run the full platform training pipeline (Train/Val/Test splits + SHAP) and explicitly print the test metrics.
"""

train_code = """# Run Full Training Experiment (Train/Val/Test + SHAP + MLflow)
print("\\nRunning Full Training Experiment...")
report = run_training_experiment(
    entity_id=target_user,
    features_df=user_df,
    lgbm_params=best_params
)

print("\\n=== Train Set Evaluation Metrics ===")
print(f"RMSE: {report.train_metrics.get('rmse', 0):.2f}")
print(f"MAE:  {report.train_metrics.get('mae', 0):.2f}")
print(f"MAPE: {report.train_metrics.get('mape', 0):.2f}%")
print(f"R2:   {report.train_metrics.get('r2', 0):.4f}")

print("\\n=== Test Set Evaluation Metrics ===")
print(f"RMSE: {report.test_metrics.get('rmse', 0):.2f}")
print(f"MAE:  {report.test_metrics.get('mae', 0):.2f}")
print(f"MAPE: {report.test_metrics.get('mape', 0):.2f}%")
print(f"R2:   {report.test_metrics.get('r2', 0):.4f}")

# Extract final forecaster for predictions
import joblib
from pathlib import Path
model_path = Path("models") / f"forecaster_{target_user}.joblib"
forecaster = joblib.load(model_path)
"""

pred_md = """## 7. Predict the Next 12 Months
Let's forecast cashflow for the next 3, 6, 9, and 12 months for this user.
"""

pred_code = """from IPython.display import display
horizons = [3, 6, 9, 12]
forecasts = {}

for h in horizons:
    print(f"--- Forecasting {h} months ahead ---")
    forecast_df = forecaster.predict(horizon=h)
    forecasts[h] = forecast_df
    display(forecast_df.head(h))
    print("\\n")
"""

nb['cells'] = [
    nbf.v4.new_markdown_cell(intro_md),
    nbf.v4.new_code_cell(imports_code),
    nbf.v4.new_markdown_cell(load_md),
    nbf.v4.new_code_cell(load_code),
    nbf.v4.new_markdown_cell(synth_md),
    nbf.v4.new_code_cell(synth_code),
    nbf.v4.new_markdown_cell(map_md),
    nbf.v4.new_code_cell(map_code),
    nbf.v4.new_markdown_cell(eda_md),
    nbf.v4.new_code_cell(eda_code),
    nbf.v4.new_markdown_cell(tune_md),
    nbf.v4.new_code_cell(tune_code),
    nbf.v4.new_markdown_cell(train_md),
    nbf.v4.new_code_cell(train_code),
    nbf.v4.new_markdown_cell(pred_md),
    nbf.v4.new_code_cell(pred_code)
]

with open('kaggle_indian_finance.ipynb', 'w', encoding='utf-8') as f:
    nbf.write(nb, f)
