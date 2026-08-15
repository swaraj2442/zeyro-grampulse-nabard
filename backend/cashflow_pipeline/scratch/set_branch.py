import json
import re

nb_path = 'notebooks/cashflow_tft_training_local.ipynb'
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb.get('cells', []):
    if cell['cell_type'] == 'code':
        source = "".join(cell['source'])
        if "GITHUB_BRANCH =" in source:
            new_source = re.sub(r"GITHUB_BRANCH\s*=\s*['\"].*?['\"]", "GITHUB_BRANCH = 'staging/cashflow'", source)
            cell['source'] = new_source.splitlines(keepends=True)

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)
    
print("Branch successfully updated to staging/cashflow.")
