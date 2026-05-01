from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import pandas as pd
import os
import random
from app.services.simulator import MonteCarloSimulator

app = FastAPI(title="DemoCRAZY Election API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionRequest(BaseModel):
    state: str
    year: int
    model_type: str = "ensemble"
    options: List[str] = ["seats", "probabilities"]

@app.get("/")
def read_root():
    return {"message": "Welcome to DemoCRAZY Election Prediction API"}

@app.get("/ping")
def ping():
    return {"status": "ok"}

@app.get("/constituency/{id}")
async def get_constituency_detail(id: int, state: str):
    return {
        "id": id,
        "name": f"Constituency {id}",
        "state": state,
        "predicted_vote_share": [
            {"party": "TMC", "share": 48.5},
            {"party": "BJP", "share": 42.1},
            {"party": "INC+", "share": 9.4}
        ],
        "win_probability": 85.4,
        "previous_result": {"party": "TMC", "margin": 15000},
        "swing": 2.5
    }

@app.post("/predict/seats")
async def predict_seats(request: PredictionRequest):
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

    try:
        from app.ml.models.ensemble import ElectionModelEnsemble
        import numpy as np
        
        ensemble = ElectionModelEnsemble()
        model_variance = {
            "ensemble": 5, "xgboost": 8, "random_forest": 10, 
            "neural_network": 12, "linear_regression": 15
        }.get(request.model_type, 10)

        if request.year < 2026:
            model_variance *= 0.5
        
        parties = []
        total_vs = 0
        party_list = party_map[request.state]
        
        # Calculate vote shares that sum to 100%
        raw_shares = [30 + random.random() * 20 for _ in party_list]
        total_raw = sum(raw_shares)
        normalized_shares = [round((s / total_raw) * 100, 1) for s in raw_shares]
        # Adjust last one for rounding
        normalized_shares[-1] = round(100 - sum(normalized_shares[:-1]), 1)

        for i, p in enumerate(party_list):
            refinement = (np.random.rand() * model_variance * 2) - model_variance
            parties.append({
                "name": p["name"],
                "value": int(max(0, p["base_seats"] + refinement)),
                "color": p["color"],
                "vote_share": normalized_shares[i]
            })
    except Exception as e:
        print(f"Model Error: {e}")
        parties = []
        party_list = party_map[request.state]
        for p in party_list:
            variation = random.randint(-10, 10)
            parties.append({
                "name": p["name"],
                "value": max(0, p["base_seats"] + variation),
                "color": p["color"],
                "vote_share": round(100 / len(party_list), 1)
            })

    leading_party = max(parties, key=lambda x: x["value"])
    
    return {
        "state": request.state,
        "year": request.year,
        "model": request.model_type,
        "total_seats": sum(p["value"] for p in parties),
        "leading_party": leading_party["name"],
        "mean_probability": random.randint(75, 96),
        "swing_factor": round(random.uniform(-5, 10), 1),
        "seats": parties,
        "probability": [
            {"name": "Stability", "value": random.randint(70, 95)},
            {"name": "Volatility", "value": random.randint(5, 30)}
        ],
        "swing": [
            {"month": "Jan", "value": random.randint(5, 15)},
            {"month": "Feb", "value": random.randint(10, 20)},
            {"month": "Mar", "value": random.randint(15, 25)},
            {"month": "Apr", "value": random.randint(20, 35)},
            {"month": "May", "value": random.randint(30, 45)}
        ],
        "feature_importance": [
            {"name": "Anti-Incumbency", "value": 85},
            {"name": "Economic Growth", "value": 72},
            {"name": "Alliance Strength", "value": 90}
        ] if "feature_importance" in request.options else [],
        "model_comparison": [
            {"model": "Ensemble", "winner": "TMC", "confidence": 94},
            {"model": "XGBoost", "winner": "TMC", "confidence": 91},
            {"model": "RF", "winner": "BJP", "confidence": 88},
            {"model": "Neural Net", "winner": "TMC", "confidence": 89}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
