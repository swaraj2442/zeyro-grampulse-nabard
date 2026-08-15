import json
import re

nb_path = 'notebooks/cashflow_tft_training_local.ipynb'
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb.get('cells', []):
    if cell['cell_type'] == 'code':
        source = "".join(cell['source'])
        if "sample_aa_transactions.csv" in source:
            new_source = source.replace("sample_aa_transactions.csv", "transactions_large.csv")
            cell['source'] = new_source.splitlines(keepends=True)
            print("Replaced sample_aa_transactions.csv with transactions_large.csv")

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)
