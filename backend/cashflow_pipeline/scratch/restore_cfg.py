import json

orig_nb_path = 'notebooks/cashflow_tft_training.ipynb'
local_nb_path = 'notebooks/cashflow_tft_training_local.ipynb'

with open(orig_nb_path, 'r', encoding='utf-8') as f:
    orig_nb = json.load(f)

cfg_cell = None
for cell in orig_nb.get('cells', []):
    if cell['cell_type'] == 'code':
        source = "".join(cell.get('source', []))
        if "CFG =" in source or "CFG = {" in source:
            cfg_cell = cell
            break

if cfg_cell:
    with open(local_nb_path, 'r', encoding='utf-8') as f:
        local_nb = json.load(f)
        
    # We want to insert it right before the mlflow cell
    insert_idx = 0
    for i, cell in enumerate(local_nb.get('cells', [])):
        if cell['cell_type'] == 'code' and 'mlflow.set_experiment(' in "".join(cell.get('source', [])):
            insert_idx = i
            break
            
    local_nb['cells'].insert(insert_idx, cfg_cell)
    
    with open(local_nb_path, 'w', encoding='utf-8') as f:
        json.dump(local_nb, f, indent=1, ensure_ascii=False)
    print("Successfully restored the original CFG cell!")
else:
    print("Could not find CFG cell in original notebook either?!")
