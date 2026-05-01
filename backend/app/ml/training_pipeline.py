import pandas as pd
import numpy as np
import os
import sys
import logging
from datetime import datetime
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.metrics import mean_squared_error, mean_absolute_error, accuracy_score, log_loss
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import joblib

# Ensure backend directory is in the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.ml.models.traditional import TraditionalModels
from app.ml.models.ensemble import ElectionModelEnsemble

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TrainingPipeline:
    def __init__(self, data_path: str = "backend/data/processed/master_dataset.csv"):
        self.data_path = data_path
        self.trad_models = TraditionalModels()
        self.ensemble = ElectionModelEnsemble()
        self.feature_columns = []
        self.preprocessor = None

    def generate_structured_synthetic_data(self):
        """Phase 8: Structured synthetic data with realistic dependencies"""
        logger.info("Generating Phase 8 structured synthetic data...")
        states = ['West Bengal', 'Assam', 'Tamil Nadu', 'Kerala']
        parties = ['INC', 'BJP', 'REGIONAL_1', 'REGIONAL_2', 'OTH']
        alliances = ['UPA', 'NDA', 'THIRD_FRONT', 'NONE']
        
        data = []
        for state in states:
            for const_id in range(50):
                const_name = f"{state}_AC_{const_id}"
                base_turnout = np.random.uniform(60, 85)
                for year in [2006, 2011, 2016, 2021]:
                    turnout = base_turnout + np.random.normal(0, 3)
                    prev_turnout = base_turnout + np.random.normal(0, 3) if year > 2006 else turnout
                    raw_shares = np.random.dirichlet(np.ones(len(parties)), size=1)[0] * 100
                    incumbent_party = np.random.choice(parties)
                    for i, party in enumerate(parties):
                        vote_share = raw_shares[i]
                        if year > 2006:
                            prev_vs = vote_share + np.random.normal(0, 5)
                            prev_vs = max(0, min(100, prev_vs))
                        else:
                            prev_vs = vote_share
                        is_incumbent = 1 if party == incumbent_party else 0
                        alliance = alliances[i % len(alliances)]
                        data.append({
                            'STATE': state, 'CONSTITUENCY': const_name, 'YEAR': year, 'PARTY': party,
                            'VOTE_SHARE': vote_share, 'TURNOUT': turnout, 'PREV_TURNOUT': prev_turnout,
                            'INCUMBENT': is_incumbent, 'ALLIANCE': alliance, 'PREV_VOTE_SHARE': prev_vs,
                            'PREV_WINNER': 1 if is_incumbent else 0
                        })
        return pd.DataFrame(data)

    def engineer_features(self, df):
        """Phase 2: Advanced Feature Engineering"""
        logger.info("Performing Phase 2 Feature Engineering...")
        df['VOTE_SWING'] = df['VOTE_SHARE'] - df['PREV_VOTE_SHARE']
        df['TURNOUT_CHANGE'] = df['TURNOUT'] - df['PREV_TURNOUT']
        df['INCUMBENT_ADVANTAGE'] = df['INCUMBENT'] * df['PREV_VOTE_SHARE']
        df['LAG_VOTE_SHARE_2'] = df['PREV_VOTE_SHARE'] * 0.9 + np.random.normal(0, 2, len(df))
        return df

    def load_and_preprocess(self):
        """Phase 1 & 3: Data Schema & Preprocessing"""
        if not os.path.exists(self.data_path):
            df = self.generate_structured_synthetic_data()
        else:
            df = pd.read_csv(self.data_path)
            
        df = self.engineer_features(df)
        train_df = df[df['YEAR'] < 2021].copy()
        test_df = df[df['YEAR'] == 2021].copy()
        
        cat_features = ['STATE', 'PARTY', 'ALLIANCE']
        num_features = ['PREV_VOTE_SHARE', 'TURNOUT', 'TURNOUT_CHANGE', 'INCUMBENT', 'INCUMBENT_ADVANTAGE', 'LAG_VOTE_SHARE_2']
        self.feature_columns = cat_features + num_features
        
        self.preprocessor = ColumnTransformer(
            transformers=[
                ('num', Pipeline([
                    ('imputer', SimpleImputer(strategy='median')),
                    ('scaler', StandardScaler())
                ]), num_features),
                ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat_features)
            ]
        )
        
        self.preprocessor.fit(train_df[self.feature_columns])
        
        # Get feature names for DataFrame conversion
        cat_names = self.preprocessor.named_transformers_['cat'].get_feature_names_out(cat_features)
        all_names = num_features + list(cat_names)
        
        X_train = pd.DataFrame(self.preprocessor.transform(train_df[self.feature_columns]), columns=all_names)
        y_train_vs = train_df['VOTE_SHARE']
        y_train_win = train_df['PREV_WINNER']
        
        X_test = pd.DataFrame(self.preprocessor.transform(test_df[self.feature_columns]), columns=all_names)
        y_test_vs = test_df['VOTE_SHARE']
        y_test_win = test_df['PREV_WINNER']
        
        return X_train, y_train_vs, y_train_win, X_test, y_test_vs, y_test_win, test_df, all_names

    def run_monte_carlo(self, base_predictions):
        """Phase 7: Monte Carlo Simulation Engine"""
        logger.info("Running Phase 7 Monte Carlo Simulation...")
        num_sims = 1000
        n_samples = len(base_predictions)
        sim_results = []
        for _ in range(num_sims):
            noise = np.random.normal(0, 5.0, n_samples)
            sim_pred = base_predictions + noise
            sim_results.append(sim_pred)
        sim_matrix = np.array(sim_results)
        return np.mean(sim_matrix, axis=0), np.percentile(sim_matrix, 2.5, axis=0), np.percentile(sim_matrix, 97.5, axis=0)

    def run(self):
        logger.info("Starting Upgraded Training Pipeline...")
        X_train, y_train_vs, y_train_win, X_test, y_test_vs, y_test_win, test_df, all_names = self.load_and_preprocess()
        
        reg_models = self.trad_models.train_regression_models(X_train, y_train_vs)
        clf_models = self.trad_models.train_classification_models(X_train, y_train_win)
        
        reg_preds_val = {name: model.predict(X_train) for name, model in reg_models.items()}
        self.ensemble.calculate_performance_weights(reg_preds_val, y_train_vs)
        
        test_preds = {name: model.predict(X_test) for name, model in reg_models.items()}
        final_ensemble_vs = self.ensemble.predict_ensemble(test_preds)
        
        rmse = np.sqrt(mean_squared_error(y_test_vs, final_ensemble_vs))
        mae = mean_absolute_error(y_test_vs, final_ensemble_vs)
        logger.info(f"Ensemble RMSE: {rmse:.4f}, MAE: {mae:.4f}")
        
        mean_vs, lb, ub = self.run_monte_carlo(final_ensemble_vs)
        fi = self.trad_models.get_feature_importance('xgboost', all_names)
        
        best_clf = clf_models['rf_classifier']
        acc = accuracy_score(y_test_win, best_clf.predict(X_test))
        
        logger.info("Pipeline Complete.")
        return {
            'rmse': rmse, 'mae': mae, 'accuracy': acc,
            'feature_importance': fi.to_dict(orient='records') if fi is not None else [],
            'predictions': {'vote_share': mean_vs.tolist(), 'ci_lower': lb.tolist(), 'ci_upper': ub.tolist()}
        }

if __name__ == "__main__":
    pipeline = TrainingPipeline()
    pipeline.run()
