from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import pandas as pd
import os
import random
import hashlib

app = FastAPI(title="DemoCRAZY Election API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/scrape")
async def scrape_sentiment(state: str = "West Bengal"):
    """Simulate a web scraping task for sentiment analysis."""
    # In a real app, this would trigger a Scrapy or Selenium job
    return {
        "status": "success",
        "message": f"Scraped live electoral data for {state}",
        "sources": ["Twitter/X", "Times of India", "Hindustan Times"],
        "records_ingested": random.randint(100, 500)
    }

class PredictionRequest(BaseModel):
    state: str
    year: int
    model_type: str = "ensemble"
    options: List[str] = ["seats", "probabilities"]

def get_seeded_random(seed_str):
    """Generate a stable random generator based on a string seed."""
    seed = int(hashlib.md5(seed_str.encode()).hexdigest(), 16) % (2**32)
    return random.Random(seed)

@app.get("/")
def read_root():
    return {"message": "Welcome to DemoCRAZY Election Prediction API"}

@app.get("/ping")
def ping():
    return {"status": "ok"}

@app.get("/sentiment")
async def get_sentiment(state: str = "West Bengal"):
    rng = get_seeded_random(state)
    
    # State-specific sentiment profiles
    profiles = {
        "West Bengal": {
            "pos": 42, "neu": 28, "neg": 30, 
            "hotspots": ["Kolkata North", "Asansol", "Siliguri", "Darjeeling"],
            "news": [
                "Mamata Banerjee announces new social welfare schemes ahead of 2026.",
                "BJP strengthens grassroots presence in North Bengal districts.",
                "Trinamool Congress focuses on urban development in Kolkata."
            ]
        },
        "Assam": {
            "pos": 55, "neu": 25, "neg": 20, 
            "hotspots": ["Guwahati", "Dibrugarh", "Silchar", "Tezpur"],
            "news": [
                "Infrastructure projects in Brahmaputra valley gain momentum.",
                "Assam CM emphasizes regional identity in latest rally.",
                "Tea garden workers' wages remain a key electoral issue."
            ]
        },
        "Tamil Nadu": {
            "pos": 48, "neu": 32, "neg": 20, 
            "hotspots": ["Chennai Central", "Coimbatore", "Madurai", "Salem"],
            "news": [
                "DMK highlights Dravidian model of governance.",
                "AIADMK reorganizes leadership for upcoming local polls.",
                "Investment summits in Chennai attract global tech giants."
            ]
        },
        "Kerala": {
            "pos": 52, "neu": 24, "neg": 24, 
            "hotspots": ["Kochi", "Thiruvananthapuram", "Kozhikode", "Kannur"],
            "news": [
                "LDF government focuses on health and education indices.",
                "UDF raises concerns over infrastructure debt.",
                "Tourism sector revival becomes a central campaign theme."
            ]
        }
    }
    
    profile = profiles.get(state, {"pos": 50, "neu": 30, "neg": 20, "hotspots": ["Zone A", "Zone B"], "news": ["Political landscape remains stable."]})
    
    return {
        "aggregate": {
            "positive": profile["pos"] + rng.randint(-3, 3),
            "neutral": profile["neu"] + rng.randint(-3, 3),
            "negative": profile["neg"] + rng.randint(-3, 3)
        },
        "hotspots": [
            {"location": loc, "sentiment": rng.choice(["Positive", "Mixed", "Positive", "Negative"]), "mentions": rng.randint(1200, 8000)}
            for loc in profile["hotspots"]
        ],
        "trends": [
            {"topic": "Economic Growth", "score": rng.randint(65, 95)},
            {"topic": "Welfare Schemes", "score": rng.randint(70, 90)},
            {"topic": "Anti-Incumbency", "score": rng.randint(30, 60)},
            {"topic": "Coalition Politics", "score": rng.randint(50, 85)}
        ],
        "news": [
            {"title": title, "source": "State News Service", "time": f"{rng.randint(1, 24)}h ago", "sentiment": rng.choice(["Positive", "Neutral", "Neutral"])}
            for title in profile["news"]
        ]
    }

@app.post("/predict/seats")
async def predict_seats(request: PredictionRequest):
    # Use a seed to ensure consistency for the same request
    seed_str = f"{request.state}-{request.year}-{request.model_type}"
    rng = get_seeded_random(seed_str)
    
    party_map = {
        "West Bengal": [
            {"name": "TMC", "color": "#6366f1", "base_seats": 165},
            {"name": "BJP", "color": "#f59e0b", "base_seats": 110},
            {"name": "INC+", "color": "#10b981", "base_seats": 15},
            {"name": "Others", "color": "#64748b", "base_seats": 4}
        ],
        "Assam": [
            {"name": "BJP+", "color": "#f59e0b", "base_seats": 75},
            {"name": "INC+", "color": "#10b981", "base_seats": 40},
            {"name": "AIUDF", "color": "#065f46", "base_seats": 11}
        ],
        "Tamil Nadu": [
            {"name": "DMK+", "color": "#dc2626", "base_seats": 150},
            {"name": "AIADMK+", "color": "#16a34a", "base_seats": 80},
            {"name": "Others", "color": "#64748b", "base_seats": 4}
        ],
        "Kerala": [
            {"name": "LDF", "color": "#ef4444", "base_seats": 95},
            {"name": "UDF", "color": "#3b82f6", "base_seats": 45}
        ]
    }
    
    if request.state not in party_map:
        raise HTTPException(status_code=400, detail="State not supported")

    # Generate seats with some variance
    parties = []
    for p in party_map[request.state]:
        var = p["base_seats"] * 0.1
        final_seats = int(p["base_seats"] + rng.uniform(-var, var))
        parties.append({
            "name": p["name"],
            "value": final_seats,
            "color": p["color"]
        })
    
    total_final_seats = sum(p["value"] for p in parties)
    
    # Calculate Vote Share: More realistic correlation
    # Top party gets a significant share but usually not 1:1 with seats (due to FPTP)
    raw_shares = []
    for p in parties:
        # FPTP usually gives more seats to higher vote share parties
        # So we inverse that: share = sqrt(seats) * factor
        # This makes the vote shares closer to each other than seat shares are.
        share = (p["value"] ** 0.8) * 5 + rng.uniform(2, 8)
        raw_shares.append(share)
    
    total_raw_share = sum(raw_shares)
    for i in range(len(parties)):
        parties[i]["vote_share"] = round((raw_shares[i] / total_raw_share) * 100, 1)
    
    diff = round(100.0 - sum(p["vote_share"] for p in parties), 1)
    parties[0]["vote_share"] = round(parties[0]["vote_share"] + diff, 1)

    # Varied Model Comparisons
    models = ["Ensemble", "XGBoost", "Random Forest", "Logistic Regression", "Neural Network"]
    model_comparison = []
    for m in models:
        # Slightly different winners for less stable states or lower confidence
        conf = 94 - rng.randint(0, 10)
        winner = parties[0]["name"] if conf > 90 else rng.choice([p["name"] for p in parties[:2]])
        model_comparison.append({
            "model": m,
            "winner": winner,
            "confidence": conf,
            "status": "Optimal" if conf > 90 else "Converged"
        })

    # Dynamic Constituencies
    constituencies = []
    for i in range(1, 7):
        winner_party = rng.choice(parties)
        constituencies.append({
            "id": i,
            "name": f"{request.state} District {chr(64+i)}",
            "winner": winner_party["name"],
            "prob": rng.randint(65, 95),
            "swing": round(rng.uniform(-5, 5), 1),
            "color": winner_party["color"]
        })

    return {
        "state": request.state,
        "year": request.year,
        "model": request.model_type,
        "total_seats": total_final_seats,
        "leading_party": max(parties, key=lambda x: x["value"])["name"],
        "mean_probability": 82 + rng.randint(-6, 8),
        "swing_factor": round(1.8 + rng.uniform(-2, 3), 1),
        "seats": parties,
        "model_comparison": model_comparison,
        "constituencies": constituencies
    }
