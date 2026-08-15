import json
import os

notebook = {
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# Home Credit V2: Consortium & Deep Feature Engineering\n",
    "This notebook trains a 3-model Consortium on the 63-column Home Credit V2 dataset, splitting features into External (BFS) and Internal (RPS) subsets."
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
    "import xgboost as xgb\n",
    "import shap\n",
    "from IPython.display import display\n",
    "from sklearn.metrics import roc_auc_score, roc_curve\n",
    "\n",
    "# Add project root to sys.path\n",
    "sys.path.insert(0, os.path.abspath(os.path.join(os.getcwd(), '../')))\n",
    "\n",
    "from python.training.train_credit import run as train_credit\n",
    "from python.training.features import CREDIT_DEFAULT_TARGET, prepare_features\n",
    "from python.scoring.scoring import probability_to_bfs\n",
    "\n",
    "import warnings\n",
    "warnings.filterwarnings('ignore')"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 1. Load the V2 Dataset & EDA"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "DATA_PATH = r'd:\\z-business\\dummtdatasets\\csv\\homecredit_engineered_v2.csv'\n",
    "df = pd.read_csv(DATA_PATH)\n",
    "\n",
    "print(f\"Dataset Shape: {df.shape}\")\n",
    "print(f\"Target '{CREDIT_DEFAULT_TARGET}' Default Rate: {df[CREDIT_DEFAULT_TARGET].mean()*100:.2f}%\")\n",
    "display(df.head())"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "fig, axes = plt.subplots(1, 3, figsize=(15, 4))\n",
    "sns.histplot(df['age'], bins=30, ax=axes[0], color='skyblue').set_title('Age Distribution')\n",
    "sns.histplot(df['EXT_SOURCE_2'], bins=30, ax=axes[1], color='lightgreen').set_title('EXT_SOURCE_2 Distribution')\n",
    "sns.countplot(x=CREDIT_DEFAULT_TARGET, data=df, ax=axes[2], palette='viridis').set_title('Default Balance')\n",
    "plt.tight_layout()\n",
    "plt.show()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 2. Consortium Feature Mapping (63 Features)\n",
    "We split the 63 V2 features into the External Demographic model (BFS) and the Internal Behavioral model (RPS)."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "all_cols = list(df.columns)\n",
    "all_cols.remove('SK_ID_CURR')\n",
    "all_cols.remove('will_default')\n",
    "\n",
    "# =========================================================\n",
    "# 1. BFS (Behavioural Finance Score) Model\n",
    "# Purpose: External & Demographic Risk — who is this person?\n",
    "# Sources used:\n",
    "#  - application_train.csv:\n",
    "#      Age, Income, Credit, Annuity (base numerics)\n",
    "#      LTV ratio, debt/income ratio, annuity/income ratio (derived)\n",
    "#      Owns car/realty (asset collateral)\n",
    "#      Children/family members (dependency stress)\n",
    "#      Region rating, city mismatch flags (geographic instability)\n",
    "#      Social circle default rates (social risk contagion)\n",
    "#      Credit bureau enquiries (hard-pull desperation)\n",
    "#      Days since phone/ID change (recency signals)\n",
    "#      One-Hot: Education, Housing, Occupation, Gender, Income type, Family status\n",
    "#  - EXT_SOURCE_1/2/3, ext_source_product, ext_source_mean (external bureau scores)\n",
    "#  - bureau.csv: external bank debts, limits, active counts, max overdue, utilisation\n",
    "#  - bureau_balance.csv: monthly DPD status history (overdue rate, recent arrears)\n",
    "# =========================================================\n",
    "CREDIT_BFS_FEATURES_V2 = [c for c in all_cols if\n",
    "    # One-Hot demographic flags\n",
    "    c.startswith('NAME_') or c.startswith('OCCUPATION_') or c.startswith('CODE_GENDER')\n",
    "    # External bureau scores and interactions\n",
    "    or c.startswith('EXT_SOURCE') or c in ['ext_source_product', 'ext_source_mean']\n",
    "    # External credit history (bureau tables)\n",
    "    or c.startswith('bureau_') or c.startswith('bb_')\n",
    "    # Application base & derived features\n",
    "    or c in [\n",
    "        'age', 'years_employed',\n",
    "        'AMT_INCOME_TOTAL', 'AMT_CREDIT', 'AMT_ANNUITY',\n",
    "        'debt_income_ratio', 'annuity_income_ratio', 'ltv_ratio',\n",
    "        'owns_car', 'owns_realty',\n",
    "        'CNT_CHILDREN', 'CNT_FAM_MEMBERS',\n",
    "        'REGION_RATING_CLIENT',\n",
    "        'REG_CITY_NOT_WORK_CITY', 'LIVE_CITY_NOT_WORK_CITY',\n",
    "        'social_circle_default_rate_30', 'social_circle_default_rate_60',\n",
    "        'AMT_REQ_CREDIT_BUREAU_MON', 'AMT_REQ_CREDIT_BUREAU_QRT', 'AMT_REQ_CREDIT_BUREAU_YEAR',\n",
    "        'days_last_phone_change', 'days_id_publish', 'has_bureau_history'\n",
    "    ]\n",
    "]\n",
    "\n",
    "# =========================================================\n",
    "# 2. RPS (Repayment Propensity Score) Model\n",
    "# Purpose: Internal Behavioral & Cashflow Risk — how do they actually repay?\n",
    "# Sources used:\n",
    "#  - installments_payments.csv:\n",
    "#      Days late (max, mean), payment fractions\n",
    "#      Recency-weighted lateness (recent late payments penalised more)\n",
    "#      Last 6-month payment fraction only\n",
    "#  - credit_card_balance.csv:\n",
    "#      ATM cash advances, CC DPD, balance, payment total\n",
    "#      CC utilisation ratio (balance / limit)\n",
    "#      Drawing count (spending intensity)\n",
    "#  - POS_CASH_balance.csv:\n",
    "#      Max DPD, defined DPD, mean DPD (internal point-of-sale)\n",
    "#  - previous_application.csv:\n",
    "#      Refusal/approval counts, grant ratio\n",
    "#      Down payment amount & rate (commitment level)\n",
    "#      Recency of most recent internal decision\n",
    "# =========================================================\n",
    "CREDIT_RPS_FEATURES_V2 = [c for c in all_cols if\n",
    "    c.startswith('prev_') or c.startswith('inst_')\n",
    "    or c.startswith('cc_') or c.startswith('pos_')\n",
    "    or c in ['has_previous_application', 'has_installment_history', 'has_cc_history', 'has_pos_history']\n",
    "]\n",
    "\n",
    "# =========================================================\n",
    "# 3. Credit Default (Master) Model\n",
    "# Purpose: Predict ultimate probability of default.\n",
    "# Sources used: ALL features from both BFS and RPS combined.\n",
    "# =========================================================\n",
    "CREDIT_DEFAULT_FEATURES_V2 = all_cols\n",
    "\n",
    "# Verify no overlap and no missing features\n",
    "bfs_set = set(CREDIT_BFS_FEATURES_V2)\n",
    "rps_set = set(CREDIT_RPS_FEATURES_V2)\n",
    "overlap = bfs_set & rps_set\n",
    "unassigned = set(all_cols) - bfs_set - rps_set\n",
    "\n",
    "print(f'BFS Feature Count : {len(CREDIT_BFS_FEATURES_V2)}')\n",
    "print(f'BFS Features      : {CREDIT_BFS_FEATURES_V2}\\n')\n",
    "print(f'RPS Feature Count : {len(CREDIT_RPS_FEATURES_V2)}')\n",
    "print(f'RPS Features      : {CREDIT_RPS_FEATURES_V2}\\n')\n",
    "print(f'Total (Default)   : {len(CREDIT_DEFAULT_FEATURES_V2)}')\n",
    "print(f'BFS/RPS Overlap   : {overlap}  ← should be empty')\n",
    "print(f'Unassigned cols   : {unassigned}  ← assigned to Default only')"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 3. Optuna Hyperparameter Tuning\n",
    "Run Optuna trials to find the best XGBoost parameters for the V2 features."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "from python.training.optuna_tuner import tune_credit\n",
    "\n",
    "print(\"=== Tuning Credit Default Model ===\")\n",
    "best_params_default = tune_credit(df=df, feature_cols=CREDIT_DEFAULT_FEATURES_V2, n_trials=5, run_name=\"homecredit_default_optuna\")\n",
    "print(f\"\\nBest Default Params: {best_params_default}\\n\")\n",
    "\n",
    "print(\"=== Tuning Credit BFS Model ===\")\n",
    "best_params_bfs = tune_credit(df=df, feature_cols=CREDIT_BFS_FEATURES_V2, n_trials=5, run_name=\"homecredit_bfs_optuna\")\n",
    "print(f\"\\nBest BFS Params: {best_params_bfs}\\n\")\n",
    "\n",
    "print(\"=== Tuning Credit RPS Model ===\")\n",
    "best_params_rps = tune_credit(df=df, feature_cols=CREDIT_RPS_FEATURES_V2, n_trials=5, run_name=\"homecredit_rps_optuna\")\n",
    "print(f\"\\nBest RPS Params: {best_params_rps}\\n\")"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 4. Train Consortium Pipeline (Train/Val/Test)\n",
    "We use the core `train_credit` script which enforces the rigorous 70/15/15 validation split and exports the models to the artifacts directory."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "print(\"=== Training Credit Default Model ===\")\n",
    "res_default = train_credit(df=df, run_name=\"homecredit_default\", feature_cols=CREDIT_DEFAULT_FEATURES_V2, xgb_params=best_params_default)\n",
    "\n",
    "print(\"\\n=== Training Credit BFS Model ===\")\n",
    "res_bfs = train_credit(df=df, run_name=\"homecredit_bfs\", feature_cols=CREDIT_BFS_FEATURES_V2, xgb_params=best_params_bfs)\n",
    "\n",
    "print(\"\\n=== Training Credit RPS Model ===\")\n",
    "res_rps = train_credit(df=df, run_name=\"homecredit_rps\", feature_cols=CREDIT_RPS_FEATURES_V2, xgb_params=best_params_rps)"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 4. Inference & Score Conversion\n",
    "Predict the raw probabilities, apply `probability_to_bfs()`, and evaluate ROC AUC!"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# For inference, we use the train_test_split logic equivalent to what train_credit did \n",
    "# (so we don't cheat by evaluating on train data)\n",
    "from sklearn.model_selection import train_test_split\n",
    "_, test_df = train_test_split(df, test_size=0.15, random_state=42, stratify=df['will_default'])\n",
    "\n",
    "X_test_default = prepare_features(test_df, CREDIT_DEFAULT_FEATURES_V2)\n",
    "X_test_bfs = prepare_features(test_df, CREDIT_BFS_FEATURES_V2)\n",
    "X_test_rps = prepare_features(test_df, CREDIT_RPS_FEATURES_V2)\n",
    "\n",
    "# Default\n",
    "model_default = xgb.XGBClassifier()\n",
    "model_default.load_model(res_default['model_path'])\n",
    "test_df['prob_default'] = model_default.predict_proba(X_test_default)[:, 1]\n",
    "\n",
    "# BFS\n",
    "model_bfs = xgb.XGBClassifier()\n",
    "model_bfs.load_model(res_bfs['model_path'])\n",
    "test_df['prob_bfs'] = model_bfs.predict_proba(X_test_bfs)[:, 1]\n",
    "test_df['bfs_score_300_900'] = [probability_to_bfs(p) for p in test_df['prob_bfs']]\n",
    "\n",
    "# RPS\n",
    "model_rps = xgb.XGBClassifier()\n",
    "model_rps.load_model(res_rps['model_path'])\n",
    "test_df['prob_rps'] = model_rps.predict_proba(X_test_rps)[:, 1]\n",
    "\n",
    "def rps_label(prob):\n",
    "    if prob <= 0.20: return 'HIGH_PROPENSITY'\n",
    "    if prob <= 0.50: return 'MEDIUM_PROPENSITY'\n",
    "    return 'LOW_PROPENSITY'\n",
    "test_df['rps_label'] = [rps_label(p) for p in test_df['prob_rps']]\n",
    "\n",
    "display(test_df[['will_default', 'prob_default', 'bfs_score_300_900', 'rps_label']].head(10))"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "fpr_def, tpr_def, _ = roc_curve(test_df['will_default'], test_df['prob_default'])\n",
    "fpr_bfs, tpr_bfs, _ = roc_curve(test_df['will_default'], test_df['prob_bfs'])\n",
    "fpr_rps, tpr_rps, _ = roc_curve(test_df['will_default'], test_df['prob_rps'])\n",
    "\n",
    "plt.figure(figsize=(8, 6))\n",
    "plt.plot(fpr_def, tpr_def, label=f\"Default Model (All 63)\")\n",
    "plt.plot(fpr_bfs, tpr_bfs, label=f\"BFS Model (External)\")\n",
    "plt.plot(fpr_rps, tpr_rps, label=f\"RPS Model (Internal)\")\n",
    "plt.plot([0, 1], [0, 1], 'k--')\n",
    "plt.xlabel('False Positive Rate')\n",
    "plt.ylabel('True Positive Rate')\n",
    "plt.title('Consortium ROC Curves')\n",
    "plt.legend()\n",
    "plt.show()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 5. Global Feature Importance (SHAP)\n",
    "What drives the master Credit Default model?"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "print(\"Calculating SHAP...\")\n",
    "explainer = shap.TreeExplainer(model_default)\n",
    "shap_values = explainer.shap_values(X_test_default.sample(5000, random_state=42))\n",
    "\n",
    "plt.figure(figsize=(10, 8))\n",
    "shap.summary_plot(shap_values, X_test_default.sample(5000, random_state=42), max_display=15)"
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
   "codemirror_mode": {
    "name": "ipython",
    "version": 3
   },
   "file_extension": ".py",
   "mimetype": "text/x-python",
   "name": "python",
   "nbconvert_exporter": "python",
   "pygments_lexer": "ipython3",
   "version": "3.8.10"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 4
}

out_path = r"d:\z-business\notebooks\homecredit_v2_exploration.ipynb"
with open(out_path, "w") as f:
    json.dump(notebook, f, indent=1)
print(f"Notebook created at {out_path}")
