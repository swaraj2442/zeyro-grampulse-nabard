import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dummtdatasets", "cibil_ind"))
    
    ext_path = os.path.join(base_dir, "External_Cibil_Dataset.xlsx")
    int_path = os.path.join(base_dir, "Internal_Bank_Dataset.xlsx")
    unseen_path = os.path.join(base_dir, "Unseen_Dataset.xlsx")
    
    out_train = os.path.join(base_dir, "cibil_train.csv")
    out_val = os.path.join(base_dir, "cibil_val.csv")
    out_test = os.path.join(base_dir, "cibil_test.csv")
    out_unseen = os.path.join(base_dir, "cibil_unseen.csv")
    
    print("Loading datasets...")
    df_ext = pd.read_excel(ext_path)
    df_int = pd.read_excel(int_path)
    df_unseen = pd.read_excel(unseen_path)
    
    print(f"External dataset shape: {df_ext.shape}")
    print(f"Internal dataset shape: {df_int.shape}")
    
    # 1. Join Datasets
    print("Joining datasets on PROSPECTID...")
    # Target Approved_Flag is in External_Cibil_Dataset.xlsx according to the user
    # We join df_ext and df_int
    df_joined = pd.merge(df_int, df_ext, on="PROSPECTID", how="inner")
    print(f"Joined dataset shape: {df_joined.shape}")
    
    # 2. Leakage Detection
    # Since Approved_Flag is our target, we check for columns that might leak it.
    target_col = "Approved_Flag"
    if target_col not in df_joined.columns:
        raise ValueError(f"Target column '{target_col}' not found in joined data!")
        
    # Drop known leakages (e.g. if there's any date of approval, or internal ID strings that correlate perfectly)
    leakage_cols = [] 
    for col in df_joined.columns:
        if col.lower().startswith("approved_date") or col.lower().startswith("rejection_reason"):
            leakage_cols.append(col)
    
    if leakage_cols:
        print(f"Dropping potential leakage columns: {leakage_cols}")
        df_joined.drop(columns=leakage_cols, inplace=True)
        
    # 3. Feature Audit
    # Calculate missing values percentage
    missing_pct = df_joined.isnull().mean() * 100
    highly_missing = missing_pct[missing_pct > 80].index.tolist()
    if highly_missing:
        print(f"Dropping columns with >80% missing values: {highly_missing}")
        df_joined.drop(columns=highly_missing, inplace=True)
        
    # Drop rows without target
    df_joined.dropna(subset=[target_col], inplace=True)
    
    # Stratified Split based on Approved_Flag
    # Train 70%, Val 15%, Test 15%
    print(f"Performing stratified split based on {target_col}...")
    X = df_joined.drop(columns=[target_col])
    y = df_joined[target_col]
    
    # First split to get 70% Train, 30% Temp
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.3, stratify=y, random_state=42
    )
    
    # Second split to get 15% Val and 15% Test
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, stratify=y_temp, random_state=42
    )
    
    # Reassemble and save
    df_train = X_train.copy()
    df_train[target_col] = y_train
    
    df_val = X_val.copy()
    df_val[target_col] = y_val
    
    df_test = X_test.copy()
    df_test[target_col] = y_test
    
    print(f"Train shape: {df_train.shape}")
    print(f"Validation shape: {df_val.shape}")
    print(f"Test shape: {df_test.shape}")
    
    # Save to CSV
    print("Saving to CSV...")
    df_train.to_csv(out_train, index=False)
    df_val.to_csv(out_val, index=False)
    df_test.to_csv(out_test, index=False)
    df_unseen.to_csv(out_unseen, index=False)
    
    print("Data preparation complete!")

if __name__ == "__main__":
    main()
