import json

nb_path = 'notebooks/cashflow_tft_training_local.ipynb'
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb.get('cells', []):
    if cell['cell_type'] == 'markdown':
        new_source = []
        for line in cell['source']:
            # Delete those specific instructions
            if 'Create a new repo' in line or 'Go to repo' in line or 'Go to User Settings' in line or 'Fill these in before running anything else.' in line:
                continue
            new_source.append(line)
        cell['source'] = new_source

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)
