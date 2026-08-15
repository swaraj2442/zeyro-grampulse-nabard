import pandas as pd
import zipfile
import os

html_content = "<html><head><title>Zeyro Dataset Profiling</title></head><body>"
html_content += "<h1>Milestone 0: Dataset Profiling Report</h1>"

def profile_dataset(name, df):
    content = f"<h2>{name}</h2>"
    content += f"<p><b>Shape:</b> {df.shape[0]} rows, {df.shape[1]} columns</p>"
    
    # Missing values
    missing = df.isnull().sum()
    missing = missing[missing > 0]
    if not missing.empty:
        content += "<h3>Missing Values</h3>"
        content += missing.to_frame(name='Missing Count').to_html()
    else:
        content += "<p><b>Missing Values:</b> None</p>"
        
    # Duplicate rows
    dupes = df.duplicated().sum()
    content += f"<p><b>Duplicate Rows:</b> {dupes}</p>"
    
    # Summary statistics
    content += "<h3>Summary Statistics (Numeric)</h3>"
    content += df.describe().T.to_html()
    
    # Data Types
    content += "<h3>Data Types</h3>"
    content += df.dtypes.to_frame(name='Type').to_html()
    
    return content

print("Loading Dataset 1: Customer Financial Profiles")
try:
    df_indian = pd.read_csv("retail_lending/data/raw/Customer_financial_profiles.csv")
    html_content += profile_dataset("Dataset 1: Indian Transactions (Customer_financial_profiles.csv)", df_indian)
except Exception as e:
    html_content += f"<p>Error loading Dataset 1: {e}</p>"

print("Loading Dataset 2: UCI Bank Marketing")
try:
    with zipfile.ZipFile("retail_lending/data/raw/bank+marketing/bank-additional.zip", 'r') as zip_ref:
        zip_ref.extractall("retail_lending/data/raw/bank+marketing/")
    df_uci = pd.read_csv("retail_lending/data/raw/bank+marketing/bank-additional/bank-additional-full.csv", sep=";")
    html_content += profile_dataset("Dataset 2: UCI Bank Marketing (bank-additional-full.csv)", df_uci)
except Exception as e:
    html_content += f"<p>Error loading Dataset 2: {e}</p>"

html_content += "</body></html>"

with open("dataset_profile.html", "w") as f:
    f.write(html_content)
    
print("Successfully generated dataset_profile.html")
