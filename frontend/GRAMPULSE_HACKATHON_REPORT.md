# HACKATHON SUBMISSION REPORT
## **Zeyro GramPulse: AI-Driven Cash Flow Prediction & Risk Flagging System for Rural Micro-Enterprises**

**Track / Category:** AI/ML for Rural Credit & Micro-Enterprise Financial Resilience  
**Target Organization:** National Bank for Agriculture and Rural Development (NABARD)  
**Live Prototype URL:** [https://grampulse-nabard-demo.netlify.app](https://grampulse-nabard-demo.netlify.app)  
**Date:** July 2026  

---

## 1. Executive Summary

India is home to tens of millions of rural micro-enterprises—including **Self-Help Groups (SHGs)**, **Farmer Producer Organizations (FPOs)**, and individual rural entrepreneurs. Despite being the backbone of the rural economy, these entities struggle to access formal institutional credit due to a lack of traditional credit histories, collateral, and audited financial statements. 

**Zeyro GramPulse** solves this challenge by harnessing alternative data streams—specifically **UPI transaction proxies, market commodity intelligence, long-term crop productivity data, and satellite climate patterns**—to power an end-to-end predictive intelligence platform. GramPulse forecasts enterprise cash flows over a 3-to-6-month horizon, provides automated early warnings for credit risk, and generates actionable intervention recommendations for NABARD regional managers, field officers, and micro-entrepreneurs.

---

## 2. Problem Statement & Context

### Current Challenges in Rural Micro-Enterprise Lending
1. **The Credit Invisible Gap:** Rural enterprises operate predominantly in informal ecosystems. Without traditional balance sheets or CIBIL scores, traditional credit appraisal models automatically reject or under-fund viable micro-enterprises.
2. **Manual & Delayed Risk Monitoring:** Loan monitoring by field officers is largely manual, periodic, and reactive. Financial distress (e.g., fodder price spikes in Dairy, rainfall deficits, or demand drops) is identified only after defaults occur.
3. **Underutilized Digital Signals:** The rapid adoption of UPI and digital payments has created rich real-time transaction data. However, financial institutions currently lack integrated platforms to translate these velocity signals into predictive credit insights.

---

## 3. The Solution: Zeyro GramPulse Platform

Zeyro GramPulse is a multi-persona, web/mobile intelligence platform designed to bridge the gap between grant-based rural development and sustainable institutional credit.

```
       +-----------------------------------------------------------------------+
       |                         DATA INGESTION LAYER                          |
       |  Financials  |  UPI Signals  |  Market Feeds  |  Climate & Satellite  |
       +-----------------------------------------------------------------------+
                                           |
                                           v
       +-----------------------------------------------------------------------+
       |                     ZEYRO AI PREDICTIVE ENGINE                        |
       |    Ensemble Cash Flow Forecasting (3-6 mo)  |  BFS-R Credit Scoring   |
       +-----------------------------------------------------------------------+
                                           |
                    +----------------------+----------------------+
                    |                                             |
                    v                                             v
       +--------------------------+                 +--------------------------+
       |   NABARD FIELD OFFICERS  |                 |    MICRO-ENTERPRISES     |
       | - Portfolio & Risk Map   |                 | - Simple Self-Data Entry |
       | - GramPulse Recommender  |                 | - Cash Flow Projections  |
       | - Enterprise Twin (360°) |                 | - Offline Storage Sync   |
       +--------------------------+                 +--------------------------+
```

---

## 4. Key Platform Features & Modules

### 4.1. GramPulse Recommender (AI Risk Feed & Actionable Insights)
- Located prominently as a primary sidebar navigation tool.
- Provides real-time, AI-ranked risk mitigation suggestions for field officers (e.g., *"Seasonal EMI Restructuring suggested for Nashik Dairy Cluster due to fodder price surge"*).
- Categorizes alerts by severity: **Critical, High, Medium, Low**.

### 4.2. Risk Center & Early Warning System
- **5 Core Risk Metrics:** Total At-Risk Enterprises (`4,321`), High-Risk Enterprises (`612`), Average Risk Score (`72`), Watchlist Units (`2,390`), and Critical Alerts (`156`).
- **Risk Score Distribution:** 5-tier breakdown (**High Risk [81-100]**, **Medium-High [61-80]**, **Medium [41-60]**, **Low [21-40]**, **Very Low [0-20]**).
- **Risk Trend (Last 6 Months):** Multi-line historical tracker for early stress detection.
- **Top At-Risk Enterprises Table:** Direct breakdown of risk reasons (*Low Cash Flow*, *High Delinquency*, *Payment Delays*).

### 4.3. Predictive Forecast Center
- **3-to-6 Month Horizon Cash Flow Projections:** Line & Area charts featuring upper and lower confidence bounds.
- **Scenario Simulation Engine:** Allows managers to model the impact of interest rate changes, rainfall deficits, or raw material price increases on portfolio health.
- **Revenue vs. Cash Flow Tracking:** Separates accrual revenue from actual liquid cash flow to detect working capital bottlenecks early.

### 4.4. Enterprise Digital Twin (360° Profile)
- Detailed digital representation of each enterprise (e.g., *Ramesh Dairy*, *Shiv Poultry Farm*).
- **7-Dimensional Health Radar / Arc Gauges:** Financial (80), **UPI Proxy (88)**, Health (75), Market (82), Climate (70), Credit (85), and Growth (78).
- **Entity Classification:** Badges for **SHG (Self-Help Group)**, **FPO (Farmer Producer Organization)**, and **Individual Micro-Entrepreneurs**.

### 4.5. Portfolio Health & Interactive Geography Map
- **Whole India Map:** Interactive SVG map (`india-states.topojson`) with dynamic state selection and color-coded health scores.
- **State & District Drill-down Panel:** Dynamically loads district-level health scores, critical counts, and trends for any selected state (e.g., Nashik, Pune, Ahmednagar for Maharashtra).

### 4.6. Sector-Specific Risk Engine
- Dedicated intelligence models for key rural sectors: **Dairy, Poultry, Food Processing, Handicrafts, Rural Retail, and Agri Services**.
- Tracks sector-specific vulnerabilities (e.g., feed cost spikes for poultry, milk procurement prices for dairy).

### 4.7. Micro-Enterprise Self Data Entry Mode (`+ Entry`)
- Lightweight modal allowing rural entrepreneurs or field officers to record daily **Income, Expenses, Savings, and Loan Repayments**.
- Updates the cash flow forecast model instantly.

### 4.8. Offline & Low-Bandwidth Resilience
- Features an **"Offline Ready"** local-first architecture.
- Ensures field officers operating in remote rural areas with poor connectivity can log entries and view cached profiles without data loss.

### 4.9. Multilingual Support
- Built-in interface toggle supporting **English (EN)**, **Hindi (HI - हिंदी)**, and **Marathi (MR - मराठी)** for high rural adoption.

---

## 5. Technical Architecture & Stack

- **Frontend Framework:** Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Data Visualization & Mapping:** Recharts, React-Simple-Maps, D3 Geo
- **UI & Icons:** Lucide React, Custom Tailwind Glassmorphism Theme
- **Data Layer:** Local-first IndexedDB/LocalStorage Caching Engine for offline resilience
- **Deployment Platform:** Netlify Production (`https://grampulse-nabard-demo.netlify.app`)

---

## 6. Value Creation for NABARD

| # | Value Pillar | Impact & Benefit for NABARD |
|---|---|---|
| **1** | **Enhanced Credit Flow** | Enables partner banks and RRBs to assess micro-enterprises accurately without collateral, unlocking formal credit for underserved rural borrowers. |
| **2** | **Credit-Led Development** | Helps SHGs and FPOs transition from dependence on government grants to sustainable, institutional credit lines for business scaling. |
| **3** | **Digital Public Good (DPG)** | Provides a common, standardized digital infrastructure for rural enterprise profiling, cash flow evaluation, and regional risk monitoring. |
| **4** | **Proactive Beneficiary Support** | Empowers field officers with early warning signals 60–90 days before default risk materializes, allowing timely restructuring or intervention. |

---

## 7. Deliverables & Demonstration

- **Live Prototype URL:** [https://grampulse-nabard-demo.netlify.app](https://grampulse-nabard-demo.netlify.app)
- **Source Code Structure:**
  - `src/app/nabard-demo/GramPulseApp.tsx` — Main application container & navigation router
  - `src/app/nabard-demo/screens/OverviewScreen.tsx` — Executive Overview Dashboard
  - `src/app/nabard-demo/screens/AlertsScreen.tsx` — GramPulse Recommender
  - `src/app/nabard-demo/screens/RiskCenterScreen.tsx` — Risk Center & Early Warning System
  - `src/app/nabard-demo/screens/ForecastScreen.tsx` — 3-6 Month Cash Flow Prediction Center
  - `src/app/nabard-demo/screens/EnterpriseTwinScreen.tsx` — Digital Twin with UPI Proxy Gauge
  - `src/app/nabard-demo/screens/GeographyScreen.tsx` — Portfolio Health (India & District Drill-down)
  - `src/app/nabard-demo/components/DataEntryModal.tsx` — Micro-Enterprise Data Entry Portal

---

*Report prepared for NABARD Hackathon Submission · Zeyro Artificial Intelligence Team · July 2026*
