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
    # Ensure state name is clean
    req_state = request.state.strip()
    # Use a seed to ensure consistency for the same request
    seed_str = f"{req_state}-{request.year}-{request.model_type}-{random.random()}"
    rng = random.Random(seed_str)
    
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
            {"name": "NTK", "color": "#facc15", "base_seats": 2},
            {"name": "Others", "color": "#64748b", "base_seats": 2}
        ],
        "Kerala": [
            {"name": "LDF", "color": "#ef4444", "base_seats": 95},
            {"name": "UDF", "color": "#3b82f6", "base_seats": 45}
        ]
    }
    
    state_data = party_map.get(req_state)
    if not state_data:
        raise HTTPException(status_code=400, detail=f"State '{req_state}' not supported. Supported: {list(party_map.keys())}")

    # Generate seats with state-specific variance
    parties = []
    for p in state_data:
        var = max(1, int(p["base_seats"] * 0.15))
        final_seats = int(p["base_seats"] + rng.uniform(-var, var))
        parties.append({
            "name": p["name"],
            "value": final_seats,
            "color": p["color"]
        })
    
    # Vote Share logic
    total_seats = sum(p["value"] for p in parties)
    for p in parties:
        # Logistic correlation: more seats usually means much higher vote share in FPTP
        p["vote_share"] = round((p["value"] / total_seats) * 45 + rng.uniform(2, 10), 1)
    
    # Normalize vote share to 100%
    total_vs = sum(p["vote_share"] for p in parties)
    for p in parties:
        p["vote_share"] = round((p["vote_share"] / total_vs) * 100, 1)
    
    diff = round(100.0 - sum(p["vote_share"] for p in parties), 1)
    parties[0]["vote_share"] = round(parties[0]["vote_share"] + diff, 1)

    # Lead calculation
    sorted_parties = sorted(parties, key=lambda x: x["value"], reverse=True)
    leading_party = sorted_parties[0]["name"]

    # Model Comparisons
    models = ["Ensemble AI", "XGBoost v4", "Random Forest", "Logit Reg", "Neural Net"]
    model_comparison = []
    for m in models:
        conf = rng.randint(84, 98)
        # Winner selection logic: 90% chance it's the leading party
        winner = leading_party if rng.random() < 0.9 else sorted_parties[1]["name"]
        model_comparison.append({
            "model": m,
            "winner": winner,
            "confidence": conf,
            "status": "Stable" if conf > 90 else "Converging"
        })

    # Constituencies for Focus panel
    constituencies = []
    names = ["North District", "South Coast", "Central Hub", "East Range", "West Valley", "Metro Core", "Rural Belt", "Hill AC", "Industrial Zone", "Riverside", "Border AC", "Garden City"]
    for i in range(12):
        w_party = rng.choice(parties)
        constituencies.append({
            "id": i + 1,
            "name": f"{req_state} {names[i]}",
            "winner": w_party["name"],
            "prob": rng.randint(65, 99),
            "swing": round(rng.uniform(-8, 8), 1),
            "color": w_party["color"]
        })

    return {
        "simulation_id": f"SIM-{random.randint(10000, 99999)}",
        "state": req_state,
        "total_seats": sum(p["value"] for p in parties),
        "leading_party": leading_party,
        "mean_probability": rng.randint(86, 96),
        "swing_factor": round(rng.uniform(-6.0, 6.0), 1),
        "seats": parties,
        "model_comparison": model_comparison,
        "constituencies": constituencies
    }
