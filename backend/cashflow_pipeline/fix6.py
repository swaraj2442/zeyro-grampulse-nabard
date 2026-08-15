import json

file_path = 'notebooks/kaggle_finance_eda.ipynb'
with open(file_path, 'r', encoding='utf-8') as f:
    d = json.load(f)

for cell in d.get('cells', []):
    if cell.get('cell_type') == 'code':
        source = cell.get('source', [])
        # Check if this is the cell predicting multiple horizons
        if len(source) > 1 and '# Predict for multiple horizons: 3, 6, 9, and 12 months\n' in source[0]:
            new_source = [
                "# Predict for multiple horizons: 3, 6, 9, and 12 months\n",
                "from IPython.display import display\n",
                "horizons = [3, 6, 9, 12]\n",
                "forecasts = {}\n",
                "\n",
                "for h in horizons:\n",
                "    print(f\"--- Forecasting {h} months ahead ---\")\n",
                "    forecast_df = forecaster.predict(horizon=h)\n",
                "    forecasts[h] = forecast_df\n",
                "    \n",
                "    # Display the results for this horizon\n",
                "    display(forecast_df.head(h))\n",
                "    print(\"\\n\")\n"
            ]
            cell['source'] = new_source

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(d, f, indent=1)
