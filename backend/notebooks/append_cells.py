import json

file_path = r'd:\z-business\notebooks\production_training_v2.ipynb'
with open(file_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

markdown_cell = {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## Inference: Apply Models to DataFrame\n",
    "Load the trained models from their artifacts and score the entire dataset to calculate the BFS Score and RPS probability."
   ]
}

code_cell = {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "import xgboost as xgb\n",
    "from python.training.features import prepare_features\n",
    "from python.scoring.scoring import probability_to_bfs\n",
    "\n",
    "# Prepare features\n",
    "X_bfs = prepare_features(df, BFS_FEATURES)\n",
    "X_rps = prepare_features(df, RPS_FEATURES)\n",
    "\n",
    "# Load models and calculate probabilities\n",
    "model_bfs = xgb.XGBClassifier()\n",
    "model_bfs.load_model(bfs_result['model_path'])\n",
    "df['predicted_bfs_prob'] = model_bfs.predict_proba(X_bfs)[:, 1]\n",
    "df['bfs_score'] = df['predicted_bfs_prob'].apply(probability_to_bfs)\n",
    "\n",
    "model_rps = xgb.XGBClassifier()\n",
    "model_rps.load_model(rps_result['model_path'])\n",
    "df['predicted_rps_prob'] = model_rps.predict_proba(X_rps)[:, 1]\n",
    "\n",
    "# Display results\n",
    "display_cols = ['predicted_bfs_prob', 'bfs_score', 'predicted_rps_prob']\n",
    "# Include targets if they exist in the dataframe\n",
    "if BFS_TARGET in df.columns:\n",
    "    display_cols.insert(0, BFS_TARGET)\n",
    "\n",
    "display(df[display_cols].head(10))"
   ]
}

nb['cells'].extend([markdown_cell, code_cell])

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
