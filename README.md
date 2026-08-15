# Zeyro GramPulse: AI-Driven Cash Flow Prediction & Risk Flagging System for Rural Micro-Enterprises

> **National Bank for Agriculture and Rural Development (NABARD) Rural Credit Intelligence Platform**
> Deployed Live Prototype: [https://grampulse-nabard-demo.netlify.app](https://grampulse-nabard-demo.netlify.app)

---

## 1. Project Overview

**Zeyro GramPulse** is a predictive financial intelligence platform built to unlock formal credit for "credit-invisible" rural micro-enterprises, such as **Self-Help Groups (SHGs)**, **Farmer Producer Organizations (FPOs)**, and individual rural entrepreneurs. 

By integrating alternative data streams—including **UPI transaction proxies, market commodity feeds, regional climate indicators, and crop productivity cycles**—GramPulse constructs a 360-degree digital twin for each enterprise, forecasts liquid cash flows over a 3-to-6-month horizon, runs automated stress-testing simulations, and surfaces early warning signals (EWS) up to 90 days before potential default events.

---

## 2. Monorepo Structure

This project is organized as a monorepo consisting of two primary packages:

*   **`backend/`**
    *   **`cmd/nabard-api/`**: The core API service built in Go, exposing endpoints for portfolio health, EWS alerts, scenario simulations, and enterprise profile data.
    *   **`ml_service/`**: Python FastAPI microservice that encapsulates the trained forecasting and risk classification models.
    *   **`cashflow_pipeline/`**: The machine learning engineering pipeline (Python) covering ingestion, feature engineering, LightGBM/Prophet forecasters, Monte Carlo simulations, stress testing, and explainability.
    *   **`models/`**: Serialization files for preprocessors and models (CatBoost, Prophet, TFT checkpoints).
    *   **`notebooks/`**: Research and training notebooks tracking features, income estimation, model benchmarks, and production training runs.
    *   **`python/`**: Common training, scoring, feature engineering, and calibration libraries.
*   **`frontend/`**
    *   **`src/app/nabard-demo/`**: Next.js 15 App-Router single-page routing architecture housing the live interactive demo dashboard for field officers and managers.

---

## 3. Major Platform Features

### 3.1. Executive Overview Dashboard
*   Surfaces portfolio-wide key metrics: total capital under supervision, aggregate credit exposure, and average health indices.
*   Shows a visual breakdown of active categories (SHG, FPO, Individual Micro-Entrepreneurs).

### 3.2. GramPulse Recommender (AI Risk Feed & Actionable Insights)
*   A prioritized, dynamic feed of risk mitigation actions for field officers (e.g., *“Recommend 3-month EMI restructuring for Nashik Dairy Cluster due to a -28% rainfall anomaly”*).
*   Alerts are categorized by severity: **Critical, High, Medium, and Low**.

### 3.3. Risk Center & Early Warning System (EWS)
*   Monitors portfolios using 5 critical indicators (At-Risk counts, High-Risk counts, Average Risk Score, Watchlist, and Critical Alerts).
*   Groups enterprises into a 5-tier risk distribution (Very Low to High Risk).
*   Flags high-risk entities with explainable reasons (*Low cash flow, high leverage, payment velocity drops*).

### 3.4. 3-to-6 Month Cash Flow Prediction Center
*   Generates multi-horizon forecasts with upper and lower confidence intervals.
*   Compares revenue against actual liquid cash inflow to detect working capital bottlenecks.

### 3.5. Scenario Simulation & Stress Engine
*   Allows interactive modeling of macro and climate shocks (e.g., rainfall deficit, fodder price inflation, market demand drop).
*   Evaluates the survival capability and drawdown index of each enterprise.

### 3.6. Enterprise Digital Twin (360° Profile)
*   A comprehensive profile containing a 7-Dimensional Health Radar (Financial, UPI Proxy, Health, Market, Climate, Credit, and Growth).
*   Allows recording daily/monthly transactional inputs using a lightweight offline-syncable **Data Entry Portal**.

### 3.7. Portfolio Health & Interactive Geographic Map
*   Features an SVG-based interactive map displaying state-level credit health.
*   Allows drill-down into district statistics (e.g., Pune, Nashik, Ahmednagar) showing risk trends.

### 3.8. Sector-Specific Risk Engine
*   Custom parameters and alert triggers tailored to rural sectors: **Dairy, Poultry, Food Processing, Handicrafts, Rural Retail, and Agri Services**.

### 3.9. Offline Resilience & Low-Bandwidth Support
*   Ensures field officers operating in low-connectivity zones can read cached records and queue transaction entries without losing data.

### 3.10. Multilingual Capabilities
*   Built-in toggle supporting **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.

---

## 4. Machine Learning Model Training Progression

The models powering GramPulse were developed through a sequential research and engineering flow:

```
[Stage 0: Panel Generation]
       │
       ▼
[Stage 1: Feature Engineering] ──► (63 tabular features extracted)
       │
       ▼
[Stage 2: Prophet + LightGBM Ensemble] ──► (Walk-forward baseline CV)
       │
       ▼
[Stage 3: Optuna Hyperparameter Tuning] ──► (50 MLflow trials with MedianPruner)
       │
       ▼
[Stage 4: Progressive CatBoost Training] ──► (Incremental feature tiers)
       │
       ▼
[Stage 5: Deep Learning TFT Adaptation] ──► (Temporal Fusion Transformer trial)
       │
       ▼
[Stage 6: Monte Carlo Simulation & Stress Testing]
       │
       ▼
[Stage 7: EWS Classification (GREEN/AMBER/RED)]
       │
       ▼
[Stage 8: SHAP Explainability Engine]
```

### Stage 0: Synthetic Panel Generation
*   **Dataset:** *GramPulse NABARD Rural Enterprise Panel v1* (3,250 enterprises, 117,000 monthly records, Maharashtra, 2023-2025).
*   **Calibration:** Modeled after official surveys (ASUSE for operating ratios, AIDIS for debt burden, and AGMARKNET/Open-Meteo for local market & climate shocks).

### Stage 1: Feature Engineering (`ZBUE_Milestone_1_Feature_Engineering.ipynb`)
*   Extracted **63 distinct variables** across 5 categories per enterprise-month:
    *   *Autoregressive Lags:* 1m, 3m, 6m net cash flow momentum.
    *   *Debt Ratios:* Scheduled EMI, debt-service coverage ratio (DSCR), credit utilization.
    *   *Digital Velocity:* Active UPI days, transaction counts, ticket sizes, collection shares.
    *   *Market & Price Signals:* Commodity price changes, local demand indexes.
    *   *Climate Hazards:* Rainfall anomalies, temperature volatility, climate risk scores.

### Stage 2: Prophet + LightGBM Baseline Forecaster
*   Developed a 50/50 weighted ensemble.
*   **Prophet** models long-run trends and seasonal cycles (monsoons, harvest seasons).
*   **LightGBM** captures non-linear feature interactions (such as combined climate shocks and debt levels).

### Stage 3: Optuna Optimization
*   Conducted 50 hyperparameter tuning trials tracked on MLflow using a chronological walk-forward validation strategy.
*   Identified optimal parameters (e.g., `learning_rate: 0.05`, `max_depth: 4`, `num_leaves: 31`).

### Stage 4: Progressive CatBoost Direct Multi-Horizon (`cibil_xgboost_training.ipynb`)
*   Trained CatBoost models to directly predict multi-step outputs: `operating_inflow`, `operating_outflow`, and `closing_cash_balance` up to 6 months ahead.
*   Models were trained incrementally across feature tiers (Financial -> Credit -> Digital -> Market -> Climate) to track the contribution of each data source.

### Stage 5: Deep Learning TFT Adaptation (`cashflow_nabard_tft.ipynb`)
*   Adapted PyTorch Forecasting's **Temporal Fusion Transformer (TFT)** to exploit multi-horizon forecasting, attention mechanisms, and static metadata (sector, location) alongside dynamic temporal inputs.

### Stage 6: Monte Carlo Simulation & Stress Testing
*   Runs **1,000 simulations per forecast month** based on the model's confidence intervals to evaluate `shortfall_probability` (risk of dropping below ₹0 cash balance).
*   Projects enterprise resilience against **5 stress scenarios** (Revenue drops: Mild, Moderate, Severe; Expense spike; and Combined shock).

### Stage 7: Early Warning Signal Classifier (`ews_rules.py`)
*   Rule-based logic assigns risk tiers:
    *   🔴 **RED**: EMI-to-inflow ratio > 0.60, negative net cash flow, or revenue drops > 35%.
    *   🟡 **AMBER**: EMI-to-inflow ratio > 0.40, high customer concentration, or revenue drops > 20%.
    *   🟢 **GREEN**: Stable positive cash trajectory, debt levels within thresholds.

### Stage 8: Explainability Layer (`shap_explainer.py`)
*   Applies **SHAP (SHapley Additive exPlanations)** to output feature attributions, converting opaque numbers into human-readable reasons for loan officers (e.g., *“Risk increased due to negative rainfall anomaly and spiked credit utilization”*).

---

## 5. Model Benchmarks

### Walk-Forward Cross-Validation (Avg across 4 chronological folds)
*   **Mean Absolute Percentage Error (MAPE):** ~12.4%
*   **R² Score:** +0.77 (Exceeds baseline threshold of 0.50)
*   **Confidence Interval (CI) Coverage:** 82.1% (Exceeds target of 70%)
*   **Shortfall Brier Score:** ~0.07 (3.6x more predictive than random baseline)

### Holdout Set Performance
| Holdout Strategy | WAPE (1M) | WAPE (3M) | WAPE (6M) | F1-Score (EWS) | Lead Time |
|---|---|---|---|---|---|
| **Temporal Split** | 2.15% | 3.20% | 4.05% | 0.93 | 75 days |
| **Enterprise (OOD)** | 1.90% | 2.75% | 3.40% | 0.92 | 82 days |
| **Geographic (OOD)** | 2.30% | 3.45% | 4.11% | 0.89 | 70 days |
| **Shock (OOD)** | 2.80% | 4.10% | 4.70% | 0.91 | 60 days |

---

## 6. How to Run Locally

### Prerequisites
*   Go (1.25+)
*   Node.js (18+)
*   Python (3.11+)

### Running the API Backend
1. Navigate to the backend: `cd backend`
2. Install Python packages: `pip install -r requirements.txt` (or pyproject.toml dependencies)
3. Run the Go server: `go run ./cmd/nabard-api`

### Running the Frontend
1. Navigate to the frontend: `cd frontend`
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`
4. Access the demo dashboard via: `http://localhost:3000/nabard-demo`
