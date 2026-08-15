import json

nb_path = 'notebooks/cashflow_tft_training_local.ipynb'
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

cfg_idx = -1
mlflow_idx = -1

for i, cell in enumerate(nb.get('cells', [])):
    if cell['cell_type'] == 'code':
        source = "".join(cell['source'])
        if "CFG = {" in source or "CFG =" in source:
            cfg_idx = i
        if "mlflow.set_experiment(" in source:
            mlflow_idx = i

if mlflow_idx != -1 and cfg_idx != -1 and mlflow_idx < cfg_idx:
    print(f"MLflow cell is at {mlflow_idx}, CFG cell is at {cfg_idx}. Moving MLflow cell down!")
    mlflow_cell = nb['cells'].pop(mlflow_idx)
    # After popping, cfg_idx shifts by -1
    nb['cells'].insert(cfg_idx, mlflow_cell)
    
    with open(nb_path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=1, ensure_ascii=False)
    print("Notebook cell order fixed!")
elif mlflow_idx != -1 and cfg_idx != -1:
    print(f"Order is correct: MLflow is at {mlflow_idx}, CFG is at {cfg_idx}")
else:
    print(f"Could not find cells. MLflow: {mlflow_idx}, CFG: {cfg_idx}")
