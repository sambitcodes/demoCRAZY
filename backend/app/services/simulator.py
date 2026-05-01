import numpy as np
import pandas as pd
from typing import Dict, List

class MonteCarloSimulator:
    def __init__(self, n_simulations: int = 1000):
        self.n_simulations = n_simulations

    def run_simulation(self, constituency_predictions: pd.DataFrame) -> Dict:
        """
        constituency_predictions: DataFrame with columns [AC_NAME, PARTY, PRED_VOTE_SHARE]
        """
        all_sim_results = []
        
        parties = constituency_predictions['PARTY'].unique()
        constituencies = constituency_predictions['AC_NAME'].unique()

        for i in range(self.n_simulations):
            # Add random swing noise (e.g., standard deviation of 3%)
            noise = np.random.normal(0, 3, size=len(constituency_predictions))
            sim_df = constituency_predictions.copy()
            sim_df['SIM_VOTE_SHARE'] = sim_df['PRED_VOTE_SHARE'] + noise
            
            # Determine winners for this simulation
            winners = sim_df.loc[sim_df.groupby('AC_NAME')['SIM_VOTE_SHARE'].idxmax()]
            
            # Count seats
            seat_counts = winners['PARTY'].value_counts().to_dict()
            all_sim_results.append(seat_counts)
        
        # Aggregate results
        agg_results = pd.DataFrame(all_sim_results).fillna(0)
        
        summary = {
            "mean_seats": agg_results.mean().to_dict(),
            "median_seats": agg_results.median().to_dict(),
            "p05_seats": agg_results.quantile(0.05).to_dict(),
            "p95_seats": agg_results.quantile(0.95).to_dict(),
            "win_probability": (agg_results > (len(constituencies) / 2)).mean().to_dict()
        }
        
        return summary

if __name__ == "__main__":
    # Mock data for testing
    mock_data = pd.DataFrame({
        'AC_NAME': ['AC1', 'AC1', 'AC2', 'AC2'],
        'PARTY': ['TMC', 'BJP', 'TMC', 'BJP'],
        'PRED_VOTE_SHARE': [45, 42, 48, 40]
    })
    sim = MonteCarloSimulator(n_simulations=100)
    results = sim.run_simulation(mock_data)
    print("Simulation Results:", results)
