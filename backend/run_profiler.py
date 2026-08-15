import pandas as pd
import zipfile
import os
try:
    from ydata_profiling import ProfileReport
except ImportError:
    print("Installing ydata-profiling...")
    os.system(".venv_sys/bin/pip install ydata-profiling")
    from ydata_profiling import ProfileReport

print("Loading Dataset 1: Customer Financial Profiles")
df_indian = pd.read_csv("retail_lending/data/raw/Customer_financial_profiles.csv")
profile_indian = ProfileReport(df_indian, title="Dataset 1: Indian Transactions Profile", minimal=True)
profile_indian.to_file("dataset_profile_indian.html")

print("Loading Dataset 2: UCI Bank Marketing")
# Extract zip file
with zipfile.ZipFile("retail_lending/data/raw/bank+marketing/bank-additional.zip", 'r') as zip_ref:
    zip_ref.extractall("retail_lending/data/raw/bank+marketing/")
    
# It creates a folder bank-additional
df_uci = pd.read_csv("retail_lending/data/raw/bank+marketing/bank-additional/bank-additional-full.csv", sep=";")
profile_uci = ProfileReport(df_uci, title="Dataset 2: UCI Bank Marketing Profile", minimal=True)
profile_uci.to_file("dataset_profile_uci.html")

print("Done generating profiles.")
