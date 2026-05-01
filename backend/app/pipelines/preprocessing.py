import pandas as pd
import numpy as np
import os

class DataPreprocessor:
    def __init__(self, raw_dir: str = "backend/data/raw", processed_dir: str = "backend/data/processed"):
        self.raw_dir = raw_dir
        self.processed_dir = processed_dir
        os.makedirs(self.processed_dir, exist_ok=True)
        
        self.party_map = {
            "All India Trinamool Congress": "TMC",
            "Trinamool Congress": "TMC",
            "AITC": "TMC",
            "Bharatiya Janata Party": "BJP",
            "Indian National Congress": "INC",
            "Communist Party of India (Marxist)": "CPIM",
            "CPI(M)": "CPIM",
            "Dravida Munnetra Kazhagam": "DMK",
            "All India Anna Dravida Munnetra Kazhagam": "AIADMK",
            "AIADMK": "AIADMK"
        }

    def clean_ge_ac_segments(self):
        """Cleans the GE 2024 Assembly Segment wise results."""
        path = os.path.join(self.raw_dir, "ge_2024_ac_segments.csv")
        if not os.path.exists(path):
            print(f"Warning: {path} not found.")
            return
            
        # The file has some header issues (34 - Details Of Assembly Segment...)
        df = pd.read_csv(path, skiprows=1)
        
        # Clean column names
        df.columns = [c.strip().replace(' ', '_').upper() for c in df.columns]
        
        # Filter for target states
        target_states = ["West Bengal", "Assam", "Tamil Nadu", "Kerala"]
        df = df[df['STATE/UT_NAME'].isin(target_states)]
        
        # Normalize party
        df['PARTY_CLEAN'] = df['PARTY'].map(lambda x: self.party_map.get(x, x))
        
        output_path = os.path.join(self.processed_dir, "ge_2024_ac_cleaned.csv")
        df.to_csv(output_path, index=False)
        print(f"Saved cleaned GE AC data to {output_path}")

    def run_all(self):
        self.clean_ge_ac_segments()

if __name__ == "__main__":
    preprocessor = DataPreprocessor()
    preprocessor.run_all()
