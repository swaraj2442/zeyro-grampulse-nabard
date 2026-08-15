import json

nb_path = 'notebooks/cashflow_tft_training_local.ipynb'
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Find where to insert (before the main training cell)
# First find the cell with TemporalFusionTransformer.from_dataset (which is training)
insert_idx = -1
for i, cell in enumerate(nb.get('cells', [])):
    source = "".join(cell.get('source', []))
    if 'TemporalFusionTransformer.from_dataset' in source and 'import' not in source:
        insert_idx = i
        break

if insert_idx == -1:
    print("Could not find the training cell. Appending to the end.")
    insert_idx = len(nb.get('cells', []))

# We want to insert an Optuna markdown cell and an Optuna code cell
optuna_md = {
    "cell_type": "markdown",
    "metadata": {},
    "source": [
        "## [Optional] Hyperparameter Tuning with Optuna\n",
        "Run this cell to find the best hyperparameters before training the final model. It is separate from the main training below."
    ]
}

optuna_code = {
    "cell_type": "code",
    "execution_count": None,
    "metadata": {},
    "outputs": [],
    "source": [
        "import optuna\n",
        "from pytorch_forecasting.models.temporal_fusion_transformer.tuning import optimize_hyperparameters\n",
        "\n",
        "# Only run this if you want to tune hyperparameters!\n",
        "RUN_OPTUNA = False\n",
        "\n",
        "if RUN_OPTUNA:\n",
        "    study = optimize_hyperparameters(\n",
        "        train_loader,\n",
        "        val_loader,\n",
        "        model_path='optuna_tft',\n",
        "        n_trials=10,         # Increase for a more thorough search\n",
        "        max_epochs=10,       # Train each trial for a max of 10 epochs\n",
        "        gradient_clip_val_range=(0.01, 1.0),\n",
        "        hidden_size_range=(16, 64),\n",
        "        hidden_continuous_size_range=(8, 32),\n",
        "        attention_head_size_range=(1, 4),\n",
        "        learning_rate_range=(0.001, 0.1),\n",
        "        dropout_range=(0.1, 0.3),\n",
        "        trainer_kwargs=dict(limit_train_batches=30, accelerator='auto', devices=1),\n",
        "        reduce_on_plateau_patience=4,\n",
        "        use_learning_rate_finder=False,\n",
        "    )\n",
        "    \n",
        "    print(f'Best trial parameters: {study.best_trial.params}')\n",
        "    print('Update the CFG dictionary at the top with these parameters before running the final training!')\n"
    ]
}

# Also append optuna to the !pip install cell if it exists
for cell in nb.get('cells', []):
    source = "".join(cell.get('source', []))
    if '!pip install' in source and 'optuna' not in source:
        cell['source'] = source.replace('xgboost pandas', 'xgboost pandas optuna').splitlines(keepends=True)

nb['cells'].insert(insert_idx, optuna_md)
nb['cells'].insert(insert_idx + 1, optuna_code)

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)
print("Optuna cell added successfully.")
