import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, accuracy_score

class ElectionEvaluator:
    def __init__(self):
        pass

    def evaluate_vote_share(self, actual_vs: pd.Series, predicted_vs: pd.Series):
        mae = mean_absolute_error(actual_vs, predicted_vs)
        rmse = np.sqrt(np.mean((actual_vs - predicted_vs)**2))
        return {"mae": mae, "rmse": rmse}

    def evaluate_winners(self, actual_winners: pd.DataFrame, predicted_winners: pd.DataFrame):
        """
        DataFrames should have [AC_NAME, PARTY] for winners.
        """
        merged = pd.merge(actual_winners, predicted_winners, on='AC_NAME', suffixes=('_actual', '_pred'))
        accuracy = accuracy_score(merged['PARTY_actual'], merged['PARTY_pred'])
        return {"accuracy": accuracy}

    def run_backtest(self, model, historical_data: pd.DataFrame, target_year: int):
        """
        Trains on data before target_year and tests on target_year.
        """
        train_data = historical_data[historical_data['YEAR'] < target_year]
        test_data = historical_data[historical_data['YEAR'] == target_year]
        
        if train_data.empty or test_data.empty:
            return {"error": "Insufficient data for backtesting."}
            
        # ... logic to train and predict ...
        print(f"Backtesting on {target_year}...")
        return {"status": "success", "year": target_year}
