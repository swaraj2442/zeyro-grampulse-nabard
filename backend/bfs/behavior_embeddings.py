import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import umap
from sklearn.cluster import KMeans
import warnings
warnings.filterwarnings('ignore')
import mlflow

from cashflow_engine import extract_cashflow_features
from behavioral_features import extract_behavioral_features
from entropy_features import extract_entropy_features
from graph_features import extract_graph_features

def audit_features(df):
    """Performs Correlation, Missingness, and Stability Audits."""
    print("--- 1. Missingness Report ---")
    missing = df.isnull().sum() / len(df)
    print(missing[missing > 0].sort_values(ascending=False))
    if missing.max() == 0:
        print("No missing values found!")
        
    print("\n--- 2. Correlation Audit ---")
    # Drop string ID
    numeric_df = df.drop(columns=['user_id'])
    corr_matrix = numeric_df.corr().abs()
    
    upper = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
    to_drop = [column for column in upper.columns if any(upper[column] > 0.95)]
    if to_drop:
        print(f"Highly correlated features to drop (>0.95): {to_drop}")
    else:
        print("No highly collinear features found (All < 0.95).")
        
    print("\n--- 3. Stability Report (Bootstrapping Variance) ---")
    # Bootstrap 5 times and compute std dev of the feature means
    bootstraps = []
    for _ in range(5):
        sample = numeric_df.sample(frac=1.0, replace=True)
        bootstraps.append(sample.mean())
    stability = pd.DataFrame(bootstraps).std() / numeric_df.mean().replace(0, 1e-9)
    print(stability.sort_values(ascending=False).head(5))
    
    return to_drop

def generate_embeddings(df):
    """
    Generates behavioral cluster embeddings via PCA & UMAP.
    Dynamically finds the optimal number of clusters (k).
    """
    print("\n--- Generating Behavioral Embeddings ---")
    features = df.drop(columns=['user_id']).fillna(0)
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(features)
    
    # PCA
    pca = PCA(n_components=10)
    pca_result = pca.fit_transform(scaled_features)
    print(f"PCA explained variance (10 components): {np.sum(pca.explained_variance_ratio_):.4f}")
    
    # UMAP
    reducer = umap.UMAP(n_neighbors=15, min_dist=0.1, n_components=2, random_state=42)
    umap_result = reducer.fit_transform(scaled_features)
    
    print("\n--- Evaluating Optimal Clusters (k) ---")
    from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score
    
    best_k = 3
    best_silhouette = -1
    best_clusters = None
    
    for k in range(3, 11):
        kmeans = KMeans(n_clusters=k, random_state=42)
        clusters = kmeans.fit_predict(pca_result)
        
        sil = silhouette_score(pca_result, clusters)
        db = davies_bouldin_score(pca_result, clusters)
        ch = calinski_harabasz_score(pca_result, clusters)
        
        print(f"k={k}: Silhouette={sil:.4f}, Davies-Bouldin={db:.4f}, Calinski-Harabasz={ch:.1f}")
        
        if sil > best_silhouette:
            best_silhouette = sil
            best_k = k
            best_clusters = clusters
            
    print(f"\nDynamically selected optimal k={best_k} (Silhouette={best_silhouette:.4f})")
    mlflow.log_param("pca_components", 10)
    mlflow.log_param("umap_neighbors", 15)
    mlflow.log_param("optimal_k", best_k)
    mlflow.log_metric("silhouette_score", best_silhouette)
    return pca_result, best_clusters

if __name__ == "__main__":
    mlflow.set_experiment("BFS_UPI_Behavior")
    with mlflow.start_run(run_name="BFS_v1_Embeddings"):
        data_dir = "dummtdatasets/upi"
        tx_df = pd.read_csv(os.path.join(data_dir, "transactions.csv"))
        
        print("Extracting Cashflow Features...")
        cf = extract_cashflow_features(tx_df)
        
        print("Extracting Behavioral Features...")
        beh = extract_behavioral_features(tx_df)
        
        print("Extracting Entropy Features...")
        ent = extract_entropy_features(tx_df)
        
        print("Extracting Graph Features...")
        graph = extract_graph_features(tx_df)
        
        # Merge all
        print("Merging Feature Store...")
        df = cf.merge(beh, on='user_id').merge(ent, on='user_id').merge(graph, on='user_id')
        
        # Audits
        to_drop = audit_features(df)
        df.drop(columns=to_drop, inplace=True, errors='ignore')
        
        # Save Feature Store
        os.makedirs('data', exist_ok=True)
        fs_path = "data/feature_store.parquet"
        df.to_parquet(fs_path)
        print(f"\nSaved Feature Store to {fs_path} (Shape: {df.shape})")
        
        # Embeddings
        pca_embeddings, clusters = generate_embeddings(df)
        df['behavior_cluster_id'] = clusters
        
        # Save Embeddings
        emb_path = "data/behavior_embeddings.npy"
        np.save(emb_path, pca_embeddings)
        clust_path = "data/behavior_clusters.parquet"
        df[['user_id', 'behavior_cluster_id']].to_parquet(clust_path)
        print(f"Saved {emb_path} and {clust_path}")
        
        # Log artifacts to MLflow
        mlflow.log_artifact(fs_path)
        mlflow.log_artifact(emb_path)
        mlflow.log_artifact(clust_path)
        
        print("\nCluster Distribution:")
        print(df['behavior_cluster_id'].value_counts())
