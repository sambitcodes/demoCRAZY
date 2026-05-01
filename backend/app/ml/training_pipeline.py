import pandas as pd
import numpy as np
import os
import sys
import logging
from datetime import datetime

# Ensure backend directory is in the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.ml.models.traditional import TraditionalModels
from app.ml.models.deep_learning import DLTrainer, ElectionFFN, ElectionLSTM
from app.ml.models.ensemble import ElectionModelEnsemble
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, accuracy_score

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TrainingPipeline:
    def __init__(self, data_path: str = "backend/data/processed/master_dataset.csv"):
        self.data_path = data_path
        self.trad_models = TraditionalModels()
        self.ensemble = ElectionModelEnsemble()
        self.scaler = StandardScaler()

    def load_and_preprocess(self):
        """Load and prepare data with strict time-based splitting to prevent leakage"""
        if not os.path.exists(self.data_path):
            logger.warning(f"Master dataset not found at {self.data_path}. Generating dummy data for initialization.")
            return self._generate_dummy_data()
        
        df = pd.read_csv(self.data_path)
        # Assuming 'YEAR' column exists for time-based splitting
        # Train on < 2021, Test on 2021
        train_df = df[df['YEAR'] < 2021]
        test_df = df[df['YEAR'] == 2021]
        
        return train_df, test_df

    def _generate_dummy_data(self):
        """Fallback for demo/initial setup"""
        data = []
        for year in [2001, 2006, 2011, 2016, 2021]:
            for i in range(200):
                data.append({
                    'YEAR': year,
                    'VOTES_PREV': np.random.rand() * 100000,
                    'TURNOUT': np.random.rand() * 100,
                    'SENTIMENT': np.random.rand() * 2 - 1,
                    'INCUMBENT': np.random.choice([0, 1]),
                    'VOTE_SHARE': np.random.rand() * 100,
                    'WINNER': np.random.choice([0, 1, 2])
                })
        df = pd.DataFrame(data)
        return df[df['YEAR'] < 2021], df[df['YEAR'] == 2021]

    def run(self):
        logger.info("Starting Modeling Pipeline...")
        train, test = self.load_and_preprocess()
        
        # Features and Targets
        X_train = train.drop(['VOTE_SHARE', 'WINNER', 'YEAR'], axis=1)
        y_train_vs = train['VOTE_SHARE']
        y_train_win = train['WINNER']
        
        X_test = test.drop(['VOTE_SHARE', 'WINNER', 'YEAR'], axis=1)
        y_test_vs = test['VOTE_SHARE']
        y_test_win = test['WINNER']
        
        # Scale
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # 1. Train Traditional Models
        logger.info("Training Traditional Models (LR, RF, XGB, LGBM)...")
        self.trad_models.train_regression_baseline(X_train_scaled, y_train_vs)
        self.trad_models.train_classification_baseline(X_train_scaled, y_train_win)
        self.trad_models.train_random_forest(X_train_scaled, y_train_vs, X_train_scaled, y_train_win)
        self.trad_models.train_boosting(X_train_scaled, y_train_vs, type='xgboost')
        self.trad_models.train_boosting(X_train_scaled, y_train_vs, type='lightgbm')
        
        # 2. Train Deep Learning (FNN)
        logger.info("Training Deep Learning Models (FNN)...")
        fnn = ElectionFFN(input_dim=X_train_scaled.shape[1])
        dl_trainer = DLTrainer(fnn)
        dl_trainer.train(X_train_scaled, y_train_vs.values, epochs=50)
        
        # 3. Ensemble and Evaluate
        logger.info("Evaluating and Ensembling...")
        base_preds = {}
        for name in ['linear_regression', 'rf_regressor', 'xgboost', 'lightgbm']:
            model = self.trad_models.models[name]
            base_preds[name] = model.predict(X_test_scaled)
        
        base_preds['fnn'] = dl_trainer.predict(X_test_scaled)
        
        final_pred = self.ensemble.predict_final(base_preds, method='weighted')
        rmse = np.sqrt(mean_squared_error(y_test_vs, final_pred))
        
        logger.info(f"Pipeline Complete. Ensemble RMSE: {rmse:.4f}")
        
        # Log results
        results = {
            'timestamp': datetime.now().isoformat(),
            'rmse': float(rmse),
            'model_count': len(base_preds)
        }
        pd.DataFrame([results]).to_csv("backend/app/ml/artifacts/training_log.csv", index=False)
        
        return results

if __name__ == "__main__":
    pipeline = TrainingPipeline()
    pipeline.run()
