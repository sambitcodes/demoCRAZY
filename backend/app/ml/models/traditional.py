import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
import xgboost as xgb
import lightgbm as lgb
from sklearn.model_selection import TimeSeriesSplit, cross_val_score
import joblib
import os

class TraditionalModels:
    def __init__(self, model_dir: str = "backend/app/ml/artifacts"):
        self.model_dir = model_dir
        os.makedirs(self.model_dir, exist_ok=True)
        self.models = {}

    def train_regression_baseline(self, X, y):
        """Linear Regression for Vote Share"""
        model = LinearRegression()
        model.fit(X, y)
        self.models['linear_regression'] = model
        joblib.dump(model, os.path.join(self.model_dir, "linear_regression.pkl"))
        return model

    def train_classification_baseline(self, X, y):
        """Logistic Regression for Win Probability"""
        model = LogisticRegression(max_iter=1000)
        model.fit(X, y)
        self.models['logistic_regression'] = model
        joblib.dump(model, os.path.join(self.model_dir, "logistic_regression.pkl"))
        return model

    def train_random_forest(self, X_reg, y_reg, X_clf, y_clf):
        """Random Forest for both Vote Share and Winning Party"""
        reg_model = RandomForestRegressor(n_estimators=200, max_depth=10, random_state=42)
        reg_model.fit(X_reg, y_reg)
        self.models['rf_regressor'] = reg_model
        
        clf_model = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42)
        clf_model.fit(X_clf, y_clf)
        self.models['rf_classifier'] = clf_model
        
        joblib.dump(reg_model, os.path.join(self.model_dir, "rf_regressor.pkl"))
        joblib.dump(clf_model, os.path.join(self.model_dir, "rf_classifier.pkl"))
        return reg_model, clf_model

    def train_boosting(self, X, y, type='xgboost'):
        """XGBoost or LightGBM for High-Accuracy Vote Share"""
        if type == 'xgboost':
            model = xgb.XGBRegressor(n_estimators=500, learning_rate=0.05, max_depth=6)
        else:
            model = lgb.LGBMRegressor(n_estimators=500, learning_rate=0.05, max_depth=6)
        
        model.fit(X, y)
        self.models[type] = model
        joblib.dump(model, os.path.join(self.model_dir, f"{type}.pkl"))
        return model

    def evaluate_with_cv(self, model_name, X, y, cv_type='time'):
        """Cross-validation to prevent leakage"""
        model = self.models.get(model_name)
        if not model:
            return None
        
        if cv_type == 'time':
            cv = TimeSeriesSplit(n_splits=5)
        else:
            cv = 5
            
        scores = cross_val_score(model, X, y, cv=cv, scoring='neg_mean_squared_error')
        return np.sqrt(-scores)
