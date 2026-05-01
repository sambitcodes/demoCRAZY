import requests
import pandas as pd
import os
from typing import List

class LokDhabaScraper:
    BASE_URL = "https://lokdhaba.ashoka.edu.in/api/v1/data"
    
    def __init__(self, output_dir: str = "backend/data/raw"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        
    def download_state_data(self, state: str, election_type: str = "AE"):
        """
        election_type: 'AE' for Assembly Elections, 'GE' for General Elections
        """
        # Note: Lok Dhaba might require specific headers or session cookies if direct download is protected.
        # This is a placeholder for the logic identified.
        print(f"Downloading {election_type} data for {state}...")
        
        # Real-world scraping usually requires handling the 'Accept' modal.
        # If direct API fails, we use a pre-downloaded or mirror source.
        url = f"{self.BASE_URL}/{election_type}/{state}/download"
        
        # For this demo/setup, we will assume we have the CSVs or use a mirror.
        # I will implement a robust downloader if the API is public.
        
    def get_target_states(self):
        return ["West_Bengal", "Assam", "Tamil_Nadu", "Kerala"]

if __name__ == "__main__":
    scraper = LokDhabaScraper()
    states = scraper.get_target_states()
    for state in states:
        scraper.download_state_data(state)
