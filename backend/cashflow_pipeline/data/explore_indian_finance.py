import os
import kagglehub
import pandas as pd

# Download latest version
path = kagglehub.dataset_download("shriyashjagtap/indian-personal-finance-and-spending-habits")

print("Path to dataset files:", path)

# Find the csv file
csv_file = None
for root, dirs, files in os.walk(path):
    for file in files:
        if file.endswith(".csv"):
            csv_file = os.path.join(root, file)
            break

if not csv_file:
    raise FileNotFoundError("Could not find CSV file in downloaded Kaggle dataset.")

df = pd.read_csv(csv_file)
print(f"Dataset loaded with {len(df)} rows.")

print("Columns:", df.columns.tolist())
print("First 5 records:\n", df.head())
print("Data Types:\n", df.dtypes)
