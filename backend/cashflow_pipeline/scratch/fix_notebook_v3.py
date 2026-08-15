import json
import re

nb_path = 'notebooks/cashflow_tft_training_local.ipynb'
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb.get('cells', []):
    if cell['cell_type'] == 'code':
        source = "".join(cell['source'])
        
        if "dagshub.com" in source or "DAGSHUB" in source:
            new_source = re.sub(r"MLFLOW_TRACKING_URI\s*=\s*f?['\"]https://dagshub.com/.*?['\"]", "MLFLOW_TRACKING_URI = 'sqlite:///mlflow.db'", source)
            new_source = re.sub(r"os\.environ\['DAGSHUB_USER_TOKEN'\].*?\n", "# DAGSHUB_USER_TOKEN removed\n", new_source)
            cell['source'] = new_source.splitlines(keepends=True)

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)
