import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
import joblib
import os

class ElectionModelEnsemble:
    """Ensemble to combine predictions from Baseline, Advanced ML, and Deep Learning"""
    def __init__(self, model_dir: str = "backend/app/ml/artifacts"):
        self.model_dir = model_dir
        self.weights = {
            'xgboost': 0.35,
            'lightgbm': 0.25,
            'rf_regressor': 0.15,
            'fnn': 0.15,
            'linear_regression': 0.10
        }
        self.meta_model = None

    def averaging_ensemble(self, predictions: dict):
        """Simple mean of all model vote share predictions"""
        all_preds = [v for k, v in predictions.items() if k in self.weights]
        return np.mean(all_preds, axis=0)

    def weighted_averaging(self, predictions: dict):
        """Weighted mean based on pre-defined model reliability"""
        weighted_sum = np.zeros_like(next(iter(predictions.values())))
        total_weight = 0
        for name, pred in predictions.items():
            if name in self.weights:
                p = pred.flatten() if hasattr(pred, 'flatten') else pred
                weighted_sum += p * self.weights[name]
                total_weight += self.weights[name]
        return weighted_sum / total_weight if total_weight > 0 else np.mean(list(predictions.values()), axis=0)

    def train_stacking(self, base_predictions: np.ndarray, y_true: np.ndarray):
        """Train a meta-model (Logistic Regression) on top of base model outputs"""
        self.meta_model = LogisticRegression()
        self.meta_model.fit(base_predictions, y_true)
        joblib.dump(self.meta_model, os.path.join(self.model_dir, "meta_model.pkl"))
        return self.meta_model

    def predict_final(self, predictions: dict, method='weighted'):
        """Combine predictions using the chosen method"""
        if method == 'averaging':
            return self.averaging_ensemble(predictions)
        elif method == 'weighted':
            return self.weighted_averaging(predictions)
        elif method == 'stacking' and self.meta_model:
            # Combine all predictions into a feature matrix for the meta-model
            stacked_features = np.column_stack([predictions[m] for m in self.weights if m in predictions])
            return self.meta_model.predict_proba(stacked_features)
        else:
            return self.weighted_averaging(predictions)

if __name__ == "__main__":
    ensemble = ElectionModelEnsemble()
    # Mock predictions for testing
    mock_preds = {
        'xgboost': np.array([45.2, 38.1]),
        'lightgbm': np.array([44.8, 39.0]),
        'rf_regressor': np.array([43.5, 40.2]),
        'fnn': np.array([46.1, 37.5]),
        'linear_regression': np.array([42.0, 41.0])
    }
    final = ensemble.predict_final(mock_preds, method='weighted')
    print("Final Weighted Ensemble Prediction:", final)
