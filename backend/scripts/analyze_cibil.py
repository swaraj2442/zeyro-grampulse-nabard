import pandas as pd
import os

dir_path = "/Users/swaraj/Documents/z-b2b/dummtdatasets/cibil_ind"
files = ["External_Cibil_Dataset.xlsx", "Internal_Bank_Dataset.xlsx", "Unseen_Dataset.xlsx"]

for f in files:
    f_path = os.path.join(dir_path, f)
    print(f"=== Analyzing {f} ===")
    try:
        df = pd.read_excel(f_path)
        print(f"Shape: {df.shape}")
        print("Columns:")
        print(df.columns.tolist()[:20], "..." if len(df.columns) > 20 else "")
        if len(df.columns) > 0:
            print("First row:")
            print(df.iloc[0].to_dict())
    except Exception as e:
        print(f"Error loading {f}: {e}")
    print("\n")
