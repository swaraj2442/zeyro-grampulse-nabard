import json

file_path = 'notebooks/kaggle_finance_eda.ipynb'
with open(file_path, 'r', encoding='utf-8') as f:
    d = json.load(f)

for cell in d.get('cells', []):
    if cell.get('cell_type') == 'code':
        source = cell.get('source', [])
        for i, line in enumerate(source):
            if '{forecast_horizon} Months' in line:
                source[i] = line.replace('(Next {forecast_horizon} Months) ', '')

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(d, f, indent=1)
