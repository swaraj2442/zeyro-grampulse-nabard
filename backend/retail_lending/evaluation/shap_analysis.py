"""SHAP Explainability Engine.

Generates local feature importance for individual lead scores.
"""
import shap
import pandas as pd
from typing import Dict, Any

class ShapEngine:
    def __init__(self, trained_model):
        self.model = trained_model
        # Use TreeExplainer for XGBoost/Tree models
        self.explainer = shap.TreeExplainer(trained_model)

    def explain_prediction(self, user_features: pd.DataFrame) -> Dict[str, Any]:
        """
        Returns the top 5 reasons (positive and negative) contributing to the score.
        """
        shap_values = self.explainer.shap_values(user_features)
        
        # If binary classification, shap_values is a list. Take class 1.
        if isinstance(shap_values, list):
            shap_vals = shap_values[1][0]
        else:
            shap_vals = shap_values[0]
            
        feature_names = user_features.columns
        
        # Combine feature names with their shap impacts
        impacts = list(zip(feature_names, shap_vals))
        # Sort by absolute impact magnitude
        impacts.sort(key=lambda x: abs(x[1]), reverse=True)
        
        top_reasons = []
        for feat, impact in impacts[:5]:
            if impact > 0:
                reason = f"✓ High {feat}" if "ratio" not in feat else f"✓ Favorable {feat}"
            else:
                reason = f"✗ Low {feat}" if "ratio" not in feat else f"✗ Unfavorable {feat}"
            top_reasons.append(reason)
            
        return {
            "top_reasons": top_reasons,
            "raw_shap": {f: float(v) for f, v in impacts[:5]}
        }
