import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
import xgboost as xgb
import lightgbm as lgb
from sklearn.model_selection import TimeSeriesSplit, cross_val_score
from sklearn.preprocessing import LabelEncoder
import joblib
import os

class TraditionalModels:
    def __init__(self, model_dir: str = "backend/app/ml/artifacts"):
        self.model_dir = model_dir
        os.makedirs(self.model_dir, exist_ok=True)
        self.models = {}

    def train_regression_models(self, X, y):
        """Train multiple regression models for Vote Share prediction"""
        results = {}
        
        # 1. Linear Regression (Baseline)
        lr = LinearRegression()
        lr.fit(X, y)
        self.models['linear_regression'] = lr
        results['linear_regression'] = lr
        
        # 2. Random Forest Regressor
        rf = RandomForestRegressor(n_estimators=200, max_depth=10, random_state=42)
        rf.fit(X, y)
        self.models['rf_regressor'] = rf
        results['rf_regressor'] = rf
        
        # 3. XGBoost Regressor
        xgb_model = xgb.XGBRegressor(n_estimators=500, learning_rate=0.05, max_depth=6)
        xgb_model.fit(X, y)
        self.models['xgboost'] = xgb_model
        results['xgboost'] = xgb_model
        
        # 4. LightGBM Regressor
        lgbm = lgb.LGBMRegressor(n_estimators=500, learning_rate=0.05, max_depth=6)
        lgbm.fit(X, y)
        self.models['lightgbm'] = lgbm
        results['lightgbm'] = lgbm
        
        # Save all
        for name, model in self.models.items():
            if 'regressor' in name or name in ['linear_regression', 'xgboost', 'lightgbm']:
                joblib.dump(model, os.path.join(self.model_dir, f"{name}.pkl"))
        
        return results

    def train_classification_models(self, X, y):
        """Train multiple classification models for Winner prediction"""
        results = {}
        
        # 1. Logistic Regression (Baseline)
        log_reg = LogisticRegression(max_iter=1000)
        log_reg.fit(X, y)
        self.models['logistic_regression'] = log_reg
        results['logistic_regression'] = log_reg
        
        # 2. Random Forest Classifier
        rf_clf = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42)
        rf_clf.fit(X, y)
        self.models['rf_classifier'] = rf_clf
        results['rf_classifier'] = rf_clf
        
        # Save all
        for name, model in self.models.items():
            if 'classifier' in name or name == 'logistic_regression':
                joblib.dump(model, os.path.join(self.model_dir, f"{name}.pkl"))
                
        return results

    def get_feature_importance(self, model_name, feature_names):
        model = self.models.get(model_name)
        if not model: return None
        
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
        elif hasattr(model, 'coef_'):
            importances = np.abs(model.coef_)
            if len(importances.shape) > 1: importances = importances.mean(axis=0)
        else:
            return None
            
        return pd.DataFrame({'feature': feature_names, 'importance': importances}).sort_values('importance', ascending=False)
