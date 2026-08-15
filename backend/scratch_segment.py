import json

notebook = {
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# Segment Analysis (BFS v0.6 Governance)\n",
    "This notebook evaluates the BFS v0.5 benchmark model across critical borrower segments to ensure fairness and prevent disproportionate failure rates in vulnerable cohorts."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "import os\n",
    "import joblib\n",
    "import pandas as pd\n",
    "import numpy as np\n",
    "import matplotlib.pyplot as plt\n",
    "import seaborn as sns\n",
    "from sklearn.metrics import roc_auc_score\n",
    "import warnings\n",
    "warnings.filterwarnings('ignore')"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# 1. Load Data & Model\n",
    "data_dir = \"../dummtdatasets/cibil_ind\"\n",
    "target_col = \"Approved_Flag\"\n",
    "\n",
    "df_test = pd.read_csv(os.path.join(data_dir, \"cibil_test.csv\"))\n",
    "df_test.replace(-99999, np.nan, inplace=True)\n",
    "\n",
    "def map_target(y):\n",
    "    return y.map({'P1': 0, 'P2': 0, 'P3': 1, 'P4': 1}).fillna(0).astype(int)\n",
    "y_test = map_target(df_test[target_col])\n",
    "\n",
    "drop_cols = [\n",
    "    target_col, \"PROSPECTID\", \"Credit_Score\",\n",
    "    \"enq_L3m\", \"enq_L6m\", \"enq_L12m\", \"tot_enq\", \"time_since_recent_enq\",\n",
    "    \"CC_enq\", \"CC_enq_L6m\", \"CC_enq_L12m\", \"PL_enq\", \"PL_enq_L6m\", \"PL_enq_L12m\",\n",
    "    \"pct_PL_enq_L6m_of_ever\", \"pct_CC_enq_L6m_of_ever\", \"pct_PL_enq_L6m_of_L12m\", \"pct_CC_enq_L6m_of_L12m\",\n",
    "    \"Age_Oldest_TL\", \"Age_Newest_TL\",\n",
    "    \"time_since_recent_deliquency\", \"time_since_first_deliquency\",\n",
    "    \"num_std_12mts\", \"num_std_6mts\", \"num_std\", \"num_times_delinquent\", \"max_delinquency_level\",\n",
    "    \"recent_level_of_deliq\", \"max_recent_level_of_deliq\",\n",
    "    \"CC_Flag\", \"PL_Flag\", \"HL_Flag\", \"GL_Flag\"\n",
    "]\n",
    "X_test = df_test.drop(columns=[c for c in drop_cols if c in df_test.columns])\n",
    "\n",
    "cat_cols = X_test.select_dtypes(include=['object']).columns.tolist()\n",
    "for col in cat_cols:\n",
    "    X_test[col] = X_test[col].astype('category')\n",
    "\n",
    "model_path = os.path.join(data_dir, \"xgboost_cibil_calibrated.pkl\")\n",
    "model = joblib.load(model_path)\n",
    "y_prob = model.predict_proba(X_test)[:, 1]\n",
    "\n",
    "print(\"Global AUC:\", roc_auc_score(y_test, y_prob))"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# 2. Define Segments\n",
    "segments = {\n",
    "    \"Age < 30\": df_test['AGE'] < 30,\n",
    "    \"Age > 45\": df_test['AGE'] > 45,\n",
    "    \"Thin File (Total_TL < 2)\": df_test['Total_TL'] < 2,\n",
    "    \"High Utilization (Top 25%)\": df_test['max_unsec_exposure_inPct'] > df_test['max_unsec_exposure_inPct'].quantile(0.75)\n",
    "}\n",
    "\n",
    "results = []\n",
    "for name, mask in segments.items():\n",
    "    if mask.sum() > 0:\n",
    "        seg_y = y_test[mask]\n",
    "        seg_prob = y_prob[mask]\n",
    "        if len(seg_y.unique()) > 1:\n",
    "            auc = roc_auc_score(seg_y, seg_prob)\n",
    "            results.append({'Segment': name, 'AUC': auc, 'N': mask.sum()})\n",
    "        else:\n",
    "            results.append({'Segment': name, 'AUC': np.nan, 'N': mask.sum()})\n",
    "\n",
    "df_res = pd.DataFrame(results)\n",
    "display(df_res)\n",
    "\n",
    "plt.figure(figsize=(10, 5))\n",
    "sns.barplot(data=df_res, x='AUC', y='Segment', palette='viridis')\n",
    "plt.axvline(roc_auc_score(y_test, y_prob), color='red', linestyle='--', label='Global AUC')\n",
    "plt.title('AUC by Borrower Segment')\n",
    "plt.legend()\n",
    "plt.show()"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python (CIBIL XGBoost)",
   "language": "python",
   "name": "venv_sys"
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
   "version": "3.9.6"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 4
}

with open("bfs/monitoring/segment_report.ipynb", "w") as f:
    json.dump(notebook, f, indent=1)
