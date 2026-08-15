import json
import re

nb_path = 'notebooks/cashflow_tft_training_local.ipynb'
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb.get('cells', []):
    if cell['cell_type'] == 'code':
        source_list = cell['source']
        if isinstance(source_list, list):
            source = "".join(source_list)
        else:
            source = source_list
            
        if "feature_store[col] = feature_store[col].fillna(0)" in source:
            new_source = source.replace(
                "feature_store[col].fillna(0).astype(float)", 
                "feature_store[col].replace([np.inf, -np.inf], 0).fillna(0).astype(float)"
            )
            cell['source'] = new_source.splitlines(keepends=True)

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)
    
print("Fixed infinity issue in notebook.")
