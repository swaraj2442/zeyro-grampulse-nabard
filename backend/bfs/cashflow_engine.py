import pandas as pd
import numpy as np

def extract_cashflow_features(transactions_df):
    """
    Computes cashflow features per user from transaction data.
    - Income Periodicity (IPS)
    - Cash Burn (CB)
    - Savings Ratio (SR)
    - Buffer Capacity (BC)
    """
    df = transactions_df.copy()
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values(by=['user_id', 'timestamp'])
    
    # We assume 'amount' is outflow for P2M/Bill Payment, but without true inflow tags,
    # we will proxy inflow by the positive delta in 'balance_after_transaction'.
    # If balance goes up, it's an inflow (income). If it goes down, it's an outflow.
    
    # Calculate balance changes
    df['prev_balance'] = df.groupby('user_id')['balance_after_transaction'].shift(1)
    df['balance_delta'] = df['balance_after_transaction'] - df['prev_balance']
    
    df['is_inflow'] = df['balance_delta'] > 0
    df['is_outflow'] = df['balance_delta'] < 0
    
    features = []
    
    for user, user_df in df.groupby('user_id'):
        # Income Periodicity Score (IPS)
        inflows = user_df[user_df['is_inflow']]
        if len(inflows) > 1:
            time_deltas = inflows['timestamp'].diff().dt.days.dropna()
            if len(time_deltas) > 1 and time_deltas.mean() > 0:
                ips = 1 - (time_deltas.std() / time_deltas.mean())
            else:
                ips = 0.0
        else:
            ips = 0.0
            
        # Cash Burn (30d)
        # Using the last 30 days of the user's transaction history
        max_date = user_df['timestamp'].max()
        last_30d = user_df[user_df['timestamp'] >= (max_date - pd.Timedelta(days=30))]
        outflows_30d = np.abs(last_30d.loc[last_30d['is_outflow'], 'balance_delta'].sum())
        inflows_30d = last_30d.loc[last_30d['is_inflow'], 'balance_delta'].sum()
        
        cb_30d = outflows_30d / inflows_30d if inflows_30d > 0 else (outflows_30d / 1.0)
        
        # Savings Ratio (SR)
        total_inflow = user_df.loc[user_df['is_inflow'], 'balance_delta'].sum()
        total_outflow = np.abs(user_df.loc[user_df['is_outflow'], 'balance_delta'].sum())
        sr = (total_inflow - total_outflow) / total_inflow if total_inflow > 0 else 0.0
        
        # Buffer Capacity (BC)
        avg_balance = user_df['balance_after_transaction'].mean()
        avg_daily_spend = np.abs(user_df.loc[user_df['is_outflow'], 'balance_delta'].sum()) / max(1, (user_df['timestamp'].max() - user_df['timestamp'].min()).days)
        bc = avg_balance / (avg_daily_spend * 30) if avg_daily_spend > 0 else avg_balance
        
        features.append({
            'user_id': user,
            'ips_score': np.clip(ips, 0, 1),
            'cash_burn_30d': cb_30d,
            'savings_ratio': np.clip(sr, -1, 1),
            'buffer_capacity': bc
        })
        
    return pd.DataFrame(features)

if __name__ == "__main__":
    df = pd.read_csv("dummtdatasets/upi/transactions.csv")
    cf_features = extract_cashflow_features(df)
    print(cf_features.head())
