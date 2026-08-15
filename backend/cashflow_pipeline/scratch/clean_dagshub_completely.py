import json

nb_path = 'notebooks/cashflow_tft_training_local.ipynb'
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb.get('cells', []):
    if cell['cell_type'] == 'code' or cell['cell_type'] == 'markdown':
        new_source = []
        for line in cell['source']:
            # Skip any line containing dagshub references
            lower_line = line.lower()
            if 'dagshub' in lower_line or 'daghub' in lower_line or 'dagshub_token' in lower_line or 'dagshub_username' in lower_line:
                continue
            new_source.append(line)
        cell['source'] = new_source

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)
    
print("Notebook thoroughly scrubbed of all Dagshub references.")
