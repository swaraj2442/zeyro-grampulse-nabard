import pandas as pd
import numpy as np

def calculate_entropy(series):
    """Calculates Shannon entropy for a pandas Series of categorical data."""
    counts = series.value_counts()
    probabilities = counts / counts.sum()
    entropy = -np.sum(probabilities * np.log(probabilities + 1e-9))
    return entropy

def extract_entropy_features(transactions_df):
    """
    Computes Shannon Entropy features per user.
    - Merchant Entropy
    - Category Entropy
    - Temporal Entropy
    """
    df = transactions_df.copy()
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    features = []
    
    for user, user_df in df.groupby('user_id'):
        # Merchant Entropy
        merchant_entropy = calculate_entropy(user_df['receiver_id'])
        
        # Category Entropy (using transaction_type if category isn't available)
        category_entropy = calculate_entropy(user_df['transaction_type'])
        
        # Temporal Entropy (by hour of day)
        temporal_entropy = calculate_entropy(user_df['timestamp'].dt.hour)
        
        features.append({
            'user_id': user,
            'merchant_entropy': merchant_entropy,
            'category_entropy': category_entropy,
            'temporal_entropy': temporal_entropy
        })
        
    return pd.DataFrame(features)

if __name__ == "__main__":
    df = pd.read_csv("dummtdatasets/upi/transactions.csv")
    ent_features = extract_entropy_features(df)
    print(ent_features.head())
