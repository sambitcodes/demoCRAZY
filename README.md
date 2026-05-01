# DemoCRAZY 🗳️
### Advanced Electoral Intelligence & Predictive Analytics Platform

DemoCRAZY is a high-fidelity electoral intelligence platform designed to provide deep insights into Indian elections. Combining machine learning (XGBoost, LightGBM, Neural Networks) with real-time sentiment analysis and Monte Carlo simulations, it offers a comprehensive view of political landscapes at both state and constituency levels.

---

## 🚀 Key Features

### 1. **Predictive Modeling Engine**
- **Ensemble Forecasting**: Combines multiple models (Traditional ML + Deep Learning) for maximum accuracy.
- **Constituency-Party Schema**: Analyzes elections at the most granular level.
- **Feature Engineering**: Incorporates vote swing, turnout delta, anti-incumbency factors, and alliance weights.

### 2. **Monte Carlo Simulation**
- **Probabilistic Outcomes**: Runs 1,000+ iterations to generate seat-share confidence intervals.
- **Correlated Variance**: Simulates how a swing in one region impacts neighboring districts.

### 3. **Sentiment Intelligence**
- **Live Scraping**: Simulated ingestion of news and social media trends.
- **Topic Analysis**: Tracks performance scores for Economic Growth, Welfare Schemes, and more.
- **State-Specific Hotspots**: Identifies high-volatility regions requiring focus.

### 4. **Historical Archive**
- **Normalized Data**: Access to cleaned TCPD-formatted historical datasets (2001-2024).
- **Backtesting Suite**: Analytics tools to verify model performance against past results.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, Framer Motion, Recharts, Lucide Icons.
- **Backend**: FastAPI (Python), Pandas, Scikit-learn, XGBoost, LightGBM, PyTorch.
- **Architecture**: Microservices-ready, Dockerized environment.

---

## 📦 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 20+
- Docker (Optional)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/sambitcodes/demoCRAZY.git
   cd demoCRAZY
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📊 Project Structure

```text
demoCRAZY/
├── backend/
│   ├── app/
│   │   ├── ml/             # ML Models & Training Pipeline
│   │   └── main.py         # FastAPI Endpoints
│   └── data/               # Historical Datasets
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI Elements
│   │   ├── pages/          # Dashboard Views
│   │   └── App.jsx         # Routing & Layout
│   └── index.css           # Design System
└── README.md
```

---

## 🛡️ Security & Integrity
- **Seeded Randomness**: Ensures deterministic and consistent dashboard results.
- **Data Protection**: API keys and sensitive configurations are handled via environment variables (see `.env.example`).

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

**Built with ❤️ for Electoral Transparency.**
