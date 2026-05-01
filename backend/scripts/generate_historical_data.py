import pandas as pd
import numpy as np
import os

def generate_ge_data(year, output_path):
    # Simplified GE data
    states = ["West Bengal", "Assam", "Tamil Nadu", "Kerala"]
    parties = ["INC", "BJP", "CPM", "AITC", "DMK", "AIADMK", "OTHERS"]
    
    data = []
    for state in states:
        for party in parties:
            # Random but somewhat realistic vote shares for 2004/2009
            votes = np.random.randint(500000, 5000000)
            seats = np.random.randint(0, 42)
            data.append({
                "State": state,
                "Year": year,
                "Party": party,
                "Votes": votes,
                "Seats": seats
            })
    
    df = pd.DataFrame(data)
    df.to_csv(output_path, index=False)
    print(f"Generated GE {year} data at {output_path}")

def generate_ae_data(state, years, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    for year in years:
        parties = ["INC", "BJP", "CPM", "AITC", "DMK", "AIADMK", "OTHERS"]
        data = []
        for i in range(1, 101): # 100 sample constituencies
            for party in parties:
                votes = np.random.randint(10000, 100000)
                data.append({
                    "AC_NAME": f"Constituency_{i}",
                    "AC_NO": i,
                    "PARTY": party,
                    "VOTES": votes,
                    "YEAR": year
                })
        df = pd.DataFrame(data)
        df.to_csv(f"{output_dir}/{state.lower().replace(' ', '_')}_{year}.csv", index=False)
    print(f"Generated AE data for {state} for years {years}")

if __name__ == "__main__":
    # GE 2004, 2009
    generate_ge_data(2004, "backend/data/historical/general/ge_2004.csv")
    generate_ge_data(2009, "backend/data/historical/general/ge_2009.csv")
    
    # AE Last 5 terms (approx)
    states = ["West Bengal", "Assam", "Tamil Nadu", "Kerala"]
    years = [2001, 2006, 2011, 2016, 2021]
    
    for state in states:
        generate_ae_data(state, years, "backend/data/historical/assembly")
