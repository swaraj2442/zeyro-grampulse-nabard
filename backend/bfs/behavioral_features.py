import pandas as pd
import numpy as np

def extract_behavioral_features(transactions_df):
    """
    Computes behavioral features per user.
    - Velocity (V)
    - Spending Volatility (SV)
    - Weekend Ratio (WR)
    - Spending Concentration (SC)
    - Merchant Churn (MC)
    - Recurrence Score (RS)
    """
    df = transactions_df.copy()
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    features = []
    
    for user, user_df in df.groupby('user_id'):
        # Time horizon
        days_active = max(1, (user_df['timestamp'].max() - user_df['timestamp'].min()).days)
        
        # Velocity
        velocity = len(user_df) / days_active
        
        # Spending Volatility
        volatility = user_df['amount'].std()
        if pd.isna(volatility):
            volatility = 0.0
            
        # Weekend Ratio
        # Assuming 'is_weekend' is a column, if not we calculate it
        if 'is_weekend' in user_df.columns:
            weekend_spend = user_df.loc[user_df['is_weekend'] == 1, 'amount'].sum()
        else:
            weekend_spend = user_df.loc[user_df['timestamp'].dt.dayofweek >= 5, 'amount'].sum()
        total_spend = user_df['amount'].sum()
        weekend_ratio = weekend_spend / total_spend if total_spend > 0 else 0.0
        
        # Spending Concentration
        merchant_spend = user_df.groupby('receiver_id')['amount'].sum()
        max_merchant_spend = merchant_spend.max() if not merchant_spend.empty else 0.0
        spending_concentration = max_merchant_spend / total_spend if total_spend > 0 else 0.0
        
        # Merchant Churn (30d)
        max_date = user_df['timestamp'].max()
        last_30d = user_df[user_df['timestamp'] >= (max_date - pd.Timedelta(days=30))]
        historical = user_df[user_df['timestamp'] < (max_date - pd.Timedelta(days=30))]
        
        known_merchants = set(historical['receiver_id'])
        recent_merchants = set(last_30d['receiver_id'])
        
        new_merchants = recent_merchants - known_merchants
        merchant_churn = len(new_merchants) / len(recent_merchants) if len(recent_merchants) > 0 else 0.0
        
        # Recurrence Score
        visits = user_df['receiver_id'].value_counts()
        repeat_visits = visits[visits > 1].sum()
        recurrence_score = repeat_visits / len(user_df) if len(user_df) > 0 else 0.0
        
        features.append({
            'user_id': user,
            'velocity': velocity,
            'spending_volatility': volatility,
            'weekend_ratio': weekend_ratio,
            'spending_concentration': spending_concentration,
            'merchant_churn_30d': merchant_churn,
            'recurrence_score': recurrence_score
        })
        
    return pd.DataFrame(features)

if __name__ == "__main__":
    df = pd.read_csv("dummtdatasets/upi/transactions.csv")
    beh_features = extract_behavioral_features(df)
    print(beh_features.head())
