import json

with open('notebooks/cashflow_nabard_tft.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] != 'code': continue
    source = "".join(cell['source'])
    
    # 1. Update imports
    if 'from nabard_cashflow_utils' in source:
        source = source.replace('from nabard_cashflow_utils import', 'from dummtdatasets.cashflow.nabard_cashflow_utils import')
        source = source.replace('targeted_impute', 'RuralEnterprisePreprocessor')
        source = source.replace('multihead_generate_nabard', 'dummtdatasets.cashflow.multihead_generate_nabard')
        cell['source'] = [line + '\n' for line in source.split('\n')]
    
    # 2. Update imputation logic
    if 'df = targeted_impute(df)' in source:
        source = source.replace('df = targeted_impute(df)', 
'''preprocessor = RuralEnterprisePreprocessor()
train_mask = df["time_idx"] <= 23
preprocessor.fit(df.loc[train_mask])
df = preprocessor.transform(df)''')
        cell['source'] = [line + '\n' for line in source.split('\n')]

    # 3. Update early warning logic switch to CatBoost
    if 'tft_wide = test_tft_predictions.pivot_table' in source:
        new_source = '''champion_predictions = catboost_test_predictions.copy()

forecast_wide = champion_predictions.pivot_table(
    index=["entity_id", "time_idx", "horizon"],
    columns="target",
    values="y_pred",
    aggfunc="first",
).reset_index().rename(
    columns={
        "operating_inflow": "pred_operating_inflow",
        "operating_outflow": "pred_operating_outflow",
        "closing_cash_balance": "pred_closing_cash_balance",
    }
)

decoder_context = df[
    [
        "entity_id",
        "time_idx",
        "date",
        "scheduled_emi",
        "scheduled_loan_repayment",
    ]
].copy()

forecast_wide = forecast_wide.merge(
    decoder_context,
    on=["entity_id", "time_idx"],
    how="left",
)

forecast_wide["pred_cash_after_debt"] = (
    forecast_wide["pred_operating_inflow"]
    - forecast_wide["pred_operating_outflow"]
    - forecast_wide["scheduled_emi"]
    - forecast_wide["scheduled_loan_repayment"]
)

candidate_order = (
    forecast_wide[forecast_wide["horizon"] <= 3]
    .groupby("entity_id")["pred_cash_after_debt"]
    .min()
    .sort_values()
    .index
)

risk_records = []

for enterprise_id in candidate_order:
    future = forecast_wide[
        forecast_wide["entity_id"] == enterprise_id
    ].copy()

    latest = df[
        (df["entity_id"] == enterprise_id)
        & (df["time_idx"] == 29)
    ].iloc[0]

    record = build_early_warning(
        enterprise_id,
        future,
        latest,
    )

    risk_records.append(record)
'''
        cell['source'] = [line + '\n' for line in new_source.split('\n')]

    # 4. Add conformal intervals
    if 'all_test_predictions = pd.concat' in source and 'all_val_predictions = pd.concat' in source:
        # Append conformal intervals
        conformal_code = '''
calibration = (
    all_val_predictions
    .assign(
        absolute_error=lambda x: abs(x["y_true"] - x["y_pred"])
    )
    .groupby(["target", "horizon"])["absolute_error"]
    .quantile(0.90)
)

all_test_predictions = all_test_predictions.merge(
    calibration.rename("conformal_width"),
    on=["target", "horizon"],
)

all_test_predictions["lower"] = (
    all_test_predictions["y_pred"]
    - all_test_predictions["conformal_width"]
)

all_test_predictions["upper"] = (
    all_test_predictions["y_pred"]
    + all_test_predictions["conformal_width"]
)
'''
        source += conformal_code
        cell['source'] = [line + '\n' for line in source.split('\n')]
        
    # 5. Model artifact export logic in the last cell
    if 'catboost_dir.mkdir(exist_ok=True)' in source:
        source = source.replace('catboost_dir.mkdir(exist_ok=True)', 'catboost_dir.mkdir(parents=True, exist_ok=True)')
        if 'models/preprocessor.pkl' not in source:
            source += '''
# Save preprocessor
import pickle
with open(MODEL_DIR / 'preprocessor.pkl', 'wb') as handle:
    pickle.dump(preprocessor, handle)

# Save manifest
manifest = {
  "model_name": "CatBoost Direct Multi-Horizon",
  "model_version": "grampulse-cf-v1.1",
  "targets": [
    "operating_inflow",
    "operating_outflow",
    "closing_cash_balance"
  ],
  "horizons": [1, 2, 3, 4, 5, 6],
  "feature_schema_version": "nabard-features-v1",
  "training_cutoff": 23
}
with open(MODEL_DIR / 'model_manifest.json', 'w') as f:
    json.dump(manifest, f, indent=2)
'''
        cell['source'] = [line + '\n' for line in source.split('\n')]
        
with open('notebooks/cashflow_nabard_tft.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
