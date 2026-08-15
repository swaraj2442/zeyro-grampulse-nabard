import pandas as pd
import numpy as np

df = pd.read_csv(r"d:\z-business\cashflow_pipeline\data\feature_store.csv")

print("--- DATASET OVERVIEW ---")
print(f"Total Rows: {len(df)}")
print(f"Unique Entities: {df['entity_id'].nunique()}")
print(f"Date Range: {df['period'].min()} to {df['period'].min()}") # actually max()
print(f"Columns: {len(df.columns)}")

print("\n--- TARGET VARIABLE (net_cashflow) ---")
print(df['net_cashflow'].describe())
print(f"Zero values in net_cashflow: {(df['net_cashflow'] == 0).sum()} ({(df['net_cashflow'] == 0).mean()*100:.2f}%)")

print("\n--- TIME SERIES CONTINUITY ---")
# Check how many months of data per entity
months_per_entity = df.groupby('entity_id').size()
print(months_per_entity.describe())

print("\n--- SPARSITY IN INFLOW/OUTFLOW ---")
print(f"Zero values in total_inflow: {(df['total_inflow'] == 0).sum()} ({(df['total_inflow'] == 0).mean()*100:.2f}%)")
print(f"Zero values in total_outflow: {(df['total_outflow'] == 0).sum()} ({(df['total_outflow'] == 0).mean()*100:.2f}%)")

print("\n--- MISSING VALUES (NaNs) ---")
missing = df.isna().sum()
missing = missing[missing > 0]
if len(missing) == 0:
    print("No missing values (NaNs) found.")
else:
    print(missing)

