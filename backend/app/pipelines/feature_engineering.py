import pandas as pd
import numpy as np
import os

class FeatureEngineer:
    def __init__(self, processed_dir: str = "backend/data/processed"):
        self.processed_dir = processed_dir

    def calculate_swing(self, current_df: pd.DataFrame, prev_df: pd.DataFrame, join_on: list = ['STATE', 'AC_NAME', 'PARTY']):
        """
        Calculates vote share swing between two elections.
        """
        merged = pd.merge(
            current_df, 
            prev_df, 
            on=join_on, 
            suffixes=('_curr', '_prev'),
            how='left'
        )
        merged['SWING'] = merged['VOTE_SHARE_curr'] - merged['VOTE_SHARE_prev'].fillna(0)
        return merged

    def add_incumbency(self, df: pd.DataFrame, state_winner_map: dict):
        """
        Adds a boolean feature for whether the party is currently in power in that state.
        """
        df['IS_INCUMBENT'] = df.apply(
            lambda x: 1 if state_winner_map.get(x['STATE']) == x['PARTY_CLEAN'] else 0,
            axis=1
        )
        return df

    def run_feature_pipeline(self):
        # Placeholder for full pipeline logic
        print("Running feature engineering pipeline...")
        # Load processed data
        # ge_2024 = pd.read_csv(os.path.join(self.processed_dir, "ge_2024_ac_cleaned.csv"))
        # ... logic to calculate features ...

if __name__ == "__main__":
    fe = FeatureEngineer()
    fe.run_feature_pipeline()
