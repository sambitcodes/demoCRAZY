import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error
import joblib
import os

class ElectionModelEnsemble:
    """Advanced Ensemble using Performance-based Weighting and Stacking (Phase 5)"""
    def __init__(self, model_dir: str = "backend/app/ml/artifacts"):
        self.model_dir = model_dir
        self.weights = {}
        self.meta_model = None

    def calculate_performance_weights(self, predictions_dict, y_true):
        """Option A: Weight = 1 / RMSE (Phase 5)"""
        rmses = {}
        for name, preds in predictions_dict.items():
            rmse = np.sqrt(mean_squared_error(y_true, preds))
            rmses[name] = max(rmse, 0.001) # Avoid division by zero
        
        # Inverse RMSE weighting
        inv_rmses = {k: 1.0 / v for k, v in rmses.items()}
        total_inv = sum(inv_rmses.values())
        self.weights = {k: v / total_inv for k, v in inv_rmses.items()}
        
        print(f"Performance-based weights: {self.weights}")
        return self.weights

    def train_stacking_meta_model(self, base_predictions_df, y_true):
        """Option B: Stacking (Phase 5)"""
        # Using Ridge regression as meta-model to handle multicollinearity
        self.meta_model = Ridge(alpha=1.0)
        self.meta_model.fit(base_predictions_df, y_true)
        joblib.dump(self.meta_model, os.path.join(self.model_dir, "meta_model_stacking.pkl"))
        return self.meta_model

    def predict_ensemble(self, predictions_dict, method='performance'):
        """Combine predictions using selected ensemble strategy"""
        if method == 'performance' and self.weights:
            final_pred = np.zeros_like(next(iter(predictions_dict.values())))
            for name, pred in predictions_dict.items():
                if name in self.weights:
                    final_pred += pred * self.weights[name]
            return final_pred
        
        elif method == 'stacking' and self.meta_model:
            # Prepare feature matrix from base models
            X_meta = pd.DataFrame(predictions_dict)
            return self.meta_model.predict(X_meta)
            
        else:
            # Fallback to simple average
            return np.mean(list(predictions_dict.values()), axis=0)
