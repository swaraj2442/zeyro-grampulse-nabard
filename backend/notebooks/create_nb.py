import json

notebook = {
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# Credit Consortium Training\n",
    "This notebook trains a consortium of three models (Credit Default, BFS, RPS) directly defining the feature sets here, and utilizing the generic training scripts."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "import os\n",
    "import sys\n",
    "import pandas as pd\n",
    "import numpy as np\n",
    "import matplotlib.pyplot as plt\n",
    "import seaborn as sns\n",
    "from IPython.display import display\n",
    "\n",
    "# Add project root to sys.path\n",
    "sys.path.insert(0, os.path.abspath(os.path.join(os.getcwd(), '../')))\n",
    "\n",
    "from python.training.optuna_tuner import tune_credit\n",
    "from python.training.train_credit import run as train_credit\n",
    "from python.training.features import CREDIT_DEFAULT_TARGET\n",
    "\n",
    "import warnings\n",
    "warnings.filterwarnings('ignore')"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 1. Define Consortium Feature Sets"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "CREDIT_DEFAULT_FEATURES = [\n",
    "    \"age\", \"annual_income_inr\", \"credit_limit_inr\", \"cibil_score\", \n",
    "    \"avg_credit_utilisation\", \"payment_ratio\", \"months_inactive\", \n",
    "    \"balance_trend_inr\", \"num_credit_products\", \"dpd_30_count\", \n",
    "    \"emi_obligations_inr\"\n",
    "]\n",
    "\n",
    "CREDIT_BFS_FEATURES = [\n",
    "    \"age\", \"annual_income_inr\", \"credit_limit_inr\", \"cibil_score\", \n",
    "    \"num_credit_products\", \"months_inactive\", \"avg_credit_utilisation\"\n",
    "]\n",
    "\n",
    "CREDIT_RPS_FEATURES = [\n",
    "    \"dpd_30_count\", \"emi_obligations_inr\", \"balance_trend_inr\", \n",
    "    \"payment_ratio\", \"avg_credit_utilisation\"\n",
    "]\n",
    "\n",
    "print(\"Features defined successfully.\")"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 2. Load Data"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "df = pd.read_csv(r'd:\\z-business\\dummtdatasets\\csv\\dataset1_credit_default.csv')\n",
    "print(f\"Target '{CREDIT_DEFAULT_TARGET}' Default Rate: {df[CREDIT_DEFAULT_TARGET].mean()*100:.2f}%\")\n",
    "display(df.head())\n",
    "display(df.describe())"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 3. Optuna Hyperparameter Tuning for Consortium"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# We use n_trials=5 for a quick demonstration. Increase in production.\n",
    "print(\"Tuning Credit Default (Full Features)...\")\n",
    "best_params_default = tune_credit(df, feature_cols=CREDIT_DEFAULT_FEATURES, n_trials=5, run_name=\"credit_default_optuna\")\n",
    "\n",
    "print(\"\\nTuning Credit BFS...\")\n",
    "best_params_bfs = tune_credit(df, feature_cols=CREDIT_BFS_FEATURES, n_trials=5, run_name=\"credit_bfs_optuna\")\n",
    "\n",
    "print(\"\\nTuning Credit RPS...\")\n",
    "best_params_rps = tune_credit(df, feature_cols=CREDIT_RPS_FEATURES, n_trials=5, run_name=\"credit_rps_optuna\")\n",
    "\n",
    "print(\"\\n*** BEST PARAMETERS ***\")\n",
    "print(\"Credit Default:\", best_params_default)\n",
    "print(\"Credit BFS:\", best_params_bfs)\n",
    "print(\"Credit RPS:\", best_params_rps)"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 4. Final Model Training & Evaluation (Consortium)"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "print(\"Training Credit Default model...\")\n",
    "res_default = train_credit(\n",
    "    df=df,\n",
    "    run_name=\"credit_default_prod_v1\",\n",
    "    feature_cols=CREDIT_DEFAULT_FEATURES,\n",
    "    xgb_params=best_params_default\n",
    ")\n",
    "m_def = res_default['metrics']['val']\n",
    "print(f\"-> Val Metrics: AUC: {m_def['auc']:.4f} | KS: {m_def['ks']:.4f} | Gini: {m_def['gini']:.4f} | F1: {m_def['f1']:.4f} | Brier: {m_def['brier']:.4f}\")\n",
    "print(f\"-> Confusion: TP:{m_def['tp']} TN:{m_def['tn']} FP:{m_def['fp']} FN:{m_def['fn']}\")\n",
    "print(f\"-> Top Drivers: {[f['feature'] for f in res_default['shap']['global_val'][:3]]}\")\n",
    "\n",
    "print(\"\\nTraining Credit BFS model...\")\n",
    "res_bfs = train_credit(\n",
    "    df=df,\n",
    "    run_name=\"credit_bfs_prod_v1\",\n",
    "    feature_cols=CREDIT_BFS_FEATURES,\n",
    "    xgb_params=best_params_bfs\n",
    ")\n",
    "m_bfs = res_bfs['metrics']['val']\n",
    "print(f\"-> Val Metrics: AUC: {m_bfs['auc']:.4f} | KS: {m_bfs['ks']:.4f} | Gini: {m_bfs['gini']:.4f} | F1: {m_bfs['f1']:.4f} | Brier: {m_bfs['brier']:.4f}\")\n",
    "print(f\"-> Confusion: TP:{m_bfs['tp']} TN:{m_bfs['tn']} FP:{m_bfs['fp']} FN:{m_bfs['fn']}\")\n",
    "print(f\"-> Top Drivers: {[f['feature'] for f in res_bfs['shap']['global_val'][:3]]}\")\n",
    "\n",
    "print(\"\\nTraining Credit RPS model...\")\n",
    "res_rps = train_credit(\n",
    "    df=df,\n",
    "    run_name=\"credit_rps_prod_v1\",\n",
    "    feature_cols=CREDIT_RPS_FEATURES,\n",
    "    xgb_params=best_params_rps\n",
    ")\n",
    "m_rps = res_rps['metrics']['val']\n",
    "print(f\"-> Val Metrics: AUC: {m_rps['auc']:.4f} | KS: {m_rps['ks']:.4f} | Gini: {m_rps['gini']:.4f} | F1: {m_rps['f1']:.4f} | Brier: {m_rps['brier']:.4f}\")\n",
    "print(f\"-> Confusion: TP:{m_rps['tp']} TN:{m_rps['tn']} FP:{m_rps['fp']} FN:{m_rps['fn']}\")\n",
    "print(f\"-> Top Drivers: {[f['feature'] for f in res_rps['shap']['global_val'][:3]]}\")\n",
    "\n",
    "print(\"\\nConsortium training completed successfully!\")"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 5. Calculate Scores (Inference)\n",
    "Now we load the trained models from their artifacts and score the entire dataset to calculate the BFS, RPS, and Default probabilities."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "import xgboost as xgb\n",
    "from python.training.features import prepare_features\n",
    "from python.scoring.scoring import probability_to_bfs\n",
    "\n",
    "# Prepare features for each model\n",
    "X_default = prepare_features(df, CREDIT_DEFAULT_FEATURES)\n",
    "X_bfs = prepare_features(df, CREDIT_BFS_FEATURES)\n",
    "X_rps = prepare_features(df, CREDIT_RPS_FEATURES)\n",
    "\n",
    "# Load models and calculate probabilities (Scores)\n",
    "model_default = xgb.XGBClassifier()\n",
    "model_default.load_model(res_default['model_path'])\n",
    "df['predicted_default_prob'] = model_default.predict_proba(X_default)[:, 1]\n",
    "df['credit_default_score'] = df['predicted_default_prob'].apply(probability_to_bfs)\n",
    "\n",
    "model_bfs = xgb.XGBClassifier()\n",
    "model_bfs.load_model(res_bfs['model_path'])\n",
    "df['predicted_bfs_prob'] = model_bfs.predict_proba(X_bfs)[:, 1]\n",
    "df['bfs_score'] = df['predicted_bfs_prob'].apply(probability_to_bfs)\n",
    "\n",
    "model_rps = xgb.XGBClassifier()\n",
    "model_rps.load_model(res_rps['model_path'])\n",
    "df['predicted_rps_prob'] = model_rps.predict_proba(X_rps)[:, 1]\n",
    "# RPS is generally evaluated as HIGH/MEDIUM/LOW, but we leave raw prob here for analysis\n",
    "\n",
    "# Display results\n",
    "display_cols = ['customer_id', CREDIT_DEFAULT_TARGET, 'predicted_default_prob', 'credit_default_score', 'predicted_bfs_prob', 'bfs_score', 'predicted_rps_prob']\n",
    "display(df[display_cols].head(10))"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 6. SHAP Explanations\n",
    "Let's look at the SHAP values (feature contributions) for a specific customer using the Credit Default model."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "from python.training.shap_explainer import compute_shap, single_observation_shap, plot_waterfall\n",
    "\n",
    "# Compute SHAP values for the Credit Default model on a subset to save time\n",
    "explainer, shap_vals = compute_shap(model_default, X_default.head(100))\n",
    "\n",
    "# Get a detailed breakdown for the first customer (index 0)\n",
    "local_shap = single_observation_shap(shap_vals, X_default.head(100), CREDIT_DEFAULT_FEATURES, idx=0)\n",
    "print(\"Top Positive Drivers (Pushing Risk UP):\", local_shap['top_positive_drivers'])\n",
    "print(\"Top Negative Drivers (Pushing Risk DOWN):\", local_shap['top_negative_drivers'])\n",
    "\n",
    "# Render a visual waterfall plot\n",
    "plot_waterfall(explainer, shap_vals, X_default.head(100), idx=0)"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "name": "python",
   "version": "3.10.0"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 4
}

with open(r'd:\z-business\notebooks\credit_default_exploration.ipynb', 'w') as f:
    json.dump(notebook, f, indent=1)
