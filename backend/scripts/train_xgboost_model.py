import os
import argparse
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split

def train_model(dataset_path, target_col, ignore_cols, output_path):
    print(f"Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)
    
    # 1. Dynamic Feature Discovery
    # Drop the target column and any explicitly ignored columns (like IDs)
    cols_to_drop = [target_col] + ignore_cols
    
    # Verify cols to drop actually exist in the dataframe
    cols_to_drop = [c for c in cols_to_drop if c in df.columns]
    
    X = df.drop(columns=cols_to_drop)
    y = df[target_col]
    
    print(f"Automatically discovered {len(X.columns)} features.")
    
    # Optional: Automatically convert string columns to category for XGBoost native support
    for col in X.select_dtypes(include='object').columns:
        X[col] = X[col].astype('category')
    
    print(f"Training XGBoost classifier on {len(df)} samples...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 2. Train with native categorical support enabled (enable_categorical=True)
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.1,
        objective="binary:logistic",
        eval_metric="logloss",
        enable_categorical=True,  # Allows dynamic handling of string/categorical features
        random_state=42
    )
    model.fit(X_train, y_train)
    
    accuracy = model.score(X_test, y_test)
    print(f"Model test accuracy: {accuracy:.4f}")
    
    # 3. Save dynamically
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    model.save_model(output_path)
    print(f"Model successfully saved to: {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Dynamically train an XGBoost model on any CSV dataset.")
    parser.add_argument("--dataset", type=str, required=True, help="Path to the CSV dataset")
    parser.add_argument("--target", type=str, required=True, help="Name of the target column to predict")
    parser.add_argument("--ignore", type=str, default="", help="Comma-separated list of columns to ignore (e.g. user_id)")
    parser.add_argument("--output", type=str, default="python/scoring/xgboost_bfs.json", help="Path to save the model artifact")
    
    args = parser.parse_args()
    ignore_list = [c.strip() for c in args.ignore.split(",") if c.strip()]
    
    train_model(args.dataset, args.target, ignore_list, args.output)
