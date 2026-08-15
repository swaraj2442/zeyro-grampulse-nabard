import pandas as pd
import numpy as np
import networkx as nx

def extract_graph_features(transactions_df):
    """
    Computes graph-based features per user.
    - Degree Centrality
    - PageRank
    """
    df = transactions_df.copy()
    
    # Create a bipartite graph of users and merchants
    G = nx.Graph()
    
    # Add edges based on transactions
    # We use user_id and receiver_id
    edges = df[['user_id', 'receiver_id']].drop_duplicates()
    G.add_edges_from([tuple(x) for x in edges.to_numpy()])
    
    # Compute NetworkX metrics
    degree_centrality = nx.degree_centrality(G)
    pagerank = nx.pagerank(G)
    
    features = []
    
    for user in df['user_id'].unique():
        features.append({
            'user_id': user,
            'degree_centrality': degree_centrality.get(user, 0.0),
            'pagerank': pagerank.get(user, 0.0)
        })
        
    return pd.DataFrame(features)

if __name__ == "__main__":
    df = pd.read_csv("dummtdatasets/upi/transactions.csv")
    graph_features = extract_graph_features(df)
    print(graph_features.head())
