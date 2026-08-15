# GramPulse Dashboard — Backend Data Requirements

> A complete guide to all data points needed to make the GramPulse NABARD Enterprise Intelligence Dashboard fully functional, where to source them, and how they map to each screen.

---

## Table of Contents

1. [Core Enterprise / Borrower Data](#1-core-enterprise--borrower-data)
2. [Financial & Cashflow Data](#2-financial--cashflow-data)
3. [Credit & Loan Data](#3-credit--loan-data)
4. [Operations Data (Dairy-specific)](#4-operations-data-dairy-specific)
5. [Climate & Weather Data](#5-climate--weather-data)
6. [Market & Price Data](#6-market--price-data)
7. [AI / Risk Model Outputs](#7-ai--risk-model-outputs)
8. [Timeline & Events Data](#8-timeline--events-data)
9. [Portfolio-level Aggregates](#9-portfolio-level-aggregates)
10. [Data Source Quick Reference](#10-data-source-quick-reference)
11. [Suggested API Structure](#11-suggested-api-structure)
12. [Implementation Roadmap](#12-implementation-roadmap)

---

## 1. Core Enterprise / Borrower Data

**Used in:** Overview, all tabs (header section)

### Required Fields per Enterprise

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique enterprise identifier (e.g. `ENT-000124`) |
| `name` | `string` | Enterprise / farmer name |
| `district` | `string` | District (e.g. Satara) |
| `block` | `string` | Block/Tehsil name |
| `state` | `string` | State name |
| `sector` | `string` | Sector (Dairy, Poultry, Fishery, etc.) |
| `enterpriseType` | `string` | Type of enterprise (Dairy, Agri, etc.) |
| `ownershipType` | `string` | Proprietorship / Partnership / FPO / SHG |
| `accountStatus` | `enum` | `Standard` / `Watchlist` / `NPA` |
| `currentDpd` | `number` | Current Days Past Due |
| `borrowerSince` | `date` | Date since bank relationship started |
| `annualTurnover` | `number` | Annual turnover in INR |
| `vintage` | `number` | Enterprise age in years |
| `activeLoanCount` | `number` | Count of active loan accounts |
| `totalExposure` | `number` | Total loan exposure in INR |

### Where to Get It

- **Primary:** Your own **Core Banking System (CBS)** — Finacle, Bancs, or equivalent
- **Secondary:** NABARD's **ENSURE Portal** (for FPO-linked enterprises)
- **Fallback:** Manual upload from field officers via CSV/Excel

---

## 2. Financial & Cashflow Data

**Used in:** Financial tab, Overview, AI Edition, Forecast tab

### Monthly Cashflow Records

| Field | Type | Description |
|---|---|---|
| `enterpriseId` | `string` | Link to enterprise |
| `month` | `string` | Month-Year (e.g. `May 2024`) |
| `operatingInflow` | `number` | Total inflows (Lakhs INR) |
| `operatingOutflow` | `number` | Total outflows (Lakhs INR) |
| `netCashflow` | `number` | Inflow minus Outflow |
| `inflowBreakdown.milkSales` | `number` | Revenue from milk sales |
| `inflowBreakdown.calfSales` | `number` | Revenue from calf sales |
| `inflowBreakdown.govtSubsidy` | `number` | Government subsidies received |
| `inflowBreakdown.otherIncome` | `number` | Other income sources |
| `outflowBreakdown.feedCost` | `number` | Feed and fodder expenses |
| `outflowBreakdown.labourCost` | `number` | Labour/wages paid |
| `outflowBreakdown.vetMedicine` | `number` | Veterinary and medicine costs |
| `outflowBreakdown.otherExpenses` | `number` | Other operational expenses |
| `loanRepayment` | `number` | EMI/loan repayment amount |
| `savings` | `number` | Monthly savings |

### Transaction-level Records

| Field | Type | Description |
|---|---|---|
| `date` | `date` | Transaction date |
| `particular` | `string` | Description (e.g. Milk Sale - Gokul Dairy) |
| `type` | `enum` | `Inflow` / `Outflow` |
| `amount` | `number` | Transaction amount (INR) |
| `category` | `string` | Milk Sales / Feed Cost / Vet & Medicine / etc. |

### Where to Get It

- **Milk sales:** Integration with **Dairy Co-operative / MCC system** (AMUL, Gokul, etc.) — they have APIs
- **Feed purchases:** Receipts from field officers or **FPO purchase records**
- **Bank transactions:** **Account Statement API** from CBS (if borrower has account with your bank)
- **Govt. subsidy:** NIC / DBT data feeds from PM-KISAN, PMMSY, RKVY schemes
- **Manual entry:** GramPulse mobile app for field officers (offline-first)

---

## 3. Credit & Loan Data

**Used in:** Credit tab, Overview, Risk Centre

### Loan Account Details

| Field | Type | Description |
|---|---|---|
| `accountNumber` | `string` | Loan account number |
| `productType` | `string` | Term Loan / Working Capital / KCC / OD |
| `sanctionedAmount` | `number` | Sanctioned loan amount (INR) |
| `outstandingAmount` | `number` | Current outstanding (INR) |
| `rateOfInterest` | `number` | ROI in % |
| `tenure` | `number` | Tenure in months |
| `emiAmount` | `number` | Monthly installment (INR) |
| `startDate` | `date` | Loan start date |
| `nextDueDate` | `date` | Next repayment due date |
| `status` | `enum` | `Active` / `Closed` / `NPA` |
| `dpd` | `number` | Days past due |

### Repayment History (monthly)

| Field | Type | Description |
|---|---|---|
| `month` | `string` | Month-Year |
| `paidOnTime` | `boolean` | Whether paid on time |
| `dpdAtMonth` | `number` | DPD at that month |
| `amountPaid` | `number` | Amount paid (INR) |

### Credit Scoring Inputs

| Field | Type | Description |
|---|---|---|
| `repaymentProbability` | `number` | AI-predicted probability 0-100% |
| `creditUtilization` | `number` | % of sanctioned limit used |
| `dscrScore` | `number` | Debt Service Coverage Ratio |
| `bankingBehaviourScore` | `number` | Account activity score |
| `cibilScore` | `number` | CIBIL/Bureau score if available |
| `collateralType` | `string` | Land / Livestock / Machinery / None |
| `collateralValue` | `number` | Estimated collateral value (INR) |

### Where to Get It

- **Primary:** **Core Banking System (CBS)** — all loan account data
- **Repayment history:** CBS transaction tables
- **CIBIL:** TransUnion CIBIL API (commercial license required)
- **DSCR calculation:** Derived from cashflow data above

---

## 4. Operations Data (Dairy-specific)

**Used in:** Operations tab

> This section is **dairy-specific**. For other sectors (Poultry, Fishery, etc.), adapt accordingly.

### Daily/Weekly Herd & Production

| Field | Type | Description |
|---|---|---|
| `date` | `date` | Date of observation |
| `totalAnimals` | `number` | Total herd count |
| `milchAnimals` | `number` | Milching animals |
| `dryAnimals` | `number` | Dry animals |
| `heifers` | `number` | Heifer count |
| `calves` | `number` | Calf count |
| `dailyMilkProduction` | `number` | Total milk in Litres/day |
| `avgFatPercent` | `number` | Average fat % in milk |
| `avgSnfPercent` | `number` | Average SNF % in milk |

### Feed & Input Records

| Field | Type | Description |
|---|---|---|
| `date` | `date` | Date |
| `concentrateFeed` | `number` | Concentrate feed in kg |
| `fodder` | `number` | Fodder in kg |
| `silage` | `number` | Silage in kg |
| `feedCostPerDay` | `number` | Daily feed cost (INR) |
| `feedConversionRatio` | `number` | Feed (kg) per litre of milk |

### Health & Veterinary Events

| Field | Type | Description |
|---|---|---|
| `date` | `date` | Event date |
| `eventType` | `string` | Vaccination / Treatment / Check-up |
| `animalsAffected` | `number` | Number of animals |
| `disease` | `string` | Disease name (if any) |
| `treatment` | `string` | Treatment given |
| `cost` | `number` | Veterinary cost (INR) |

### Where to Get It

- **Milk production:** **Milk Collection Centre (MCC) digital weighing machines** — APIs from Stellapps, Lely, DeLaval, or cooperative's own system
- **Herd data:** **INAPH portal** (National Animal Disease Reporting System) / **Nakul Swasthya Patra** (livestock health card)
- **Vaccination records:** **NADCP** (National Animal Disease Control Programme) portal
- **Feed records:** Manual field entry via GramPulse mobile app or FPO/cooperative system
- **IoT integrations:** Stellapps MooFarm, BovControl

---

## 5. Climate & Weather Data

**Used in:** Climate tab, Risk Centre, Overview

### Station-level Weather Data (Daily)

| Field | Type | Description |
|---|---|---|
| `date` | `date` | Observation date |
| `district` | `string` | District name |
| `rainfallMm` | `number` | Rainfall in mm |
| `maxTempC` | `number` | Max temperature (Celsius) |
| `minTempC` | `number` | Min temperature (Celsius) |
| `avgHumidityPct` | `number` | Average humidity (%) |
| `windSpeedKmh` | `number` | Wind speed (km/h) |
| `heatIndexDays` | `number` | Number of high heat index days (monthly) |

### Climate Forecasts & Alerts

| Field | Type | Description |
|---|---|---|
| `forecastMonth` | `string` | Month being forecast |
| `rainfallForecastMm` | `number` | Expected rainfall (mm) |
| `rainfallNormalMm` | `number` | Normal/historical rainfall (mm) |
| `rainfallDeviation` | `number` | % deviation from normal |
| `extremeWeatherRisk` | `enum` | `Low` / `Medium` / `High` |
| `floodRisk` | `boolean` | Flood risk in district |
| `droughtRisk` | `boolean` | Drought conditions |
| `fodderAvailabilityIndex` | `number` | Index 0-100 |

### Where to Get It (Free Indian Government APIs)

| Source | Data | URL |
|---|---|---|
| **IMD (India Meteorological Dept.)** | Daily rainfall, temp, humidity, forecasts | `imdpune.gov.in` |
| **NRSC / ISRO Bhuvan** | Satellite drought/flood indices, NDVI | `bhuvan.nrsc.gov.in` |
| **Open-Meteo** | Fully free weather API (no key needed) | `open-meteo.com` |
| **OpenWeather API** | Real-time + 7-day forecast | `openweathermap.org` (free tier) |
| **NICMET / MEGHDOOT** | Agro-meteorological advisories | `meghdoot.icar.gov.in` |
| **Skymet** | India-specific commercial weather | `skymet.com` (paid) |

---

## 6. Market & Price Data

**Used in:** Market tab, Overview

### Milk Price Data (Monthly by district)

| Field | Type | Description |
|---|---|---|
| `month` | `string` | Month-Year |
| `district` | `string` | District |
| `avgMilkPricePerLitre` | `number` | Average price INR/litre |
| `cooperativeProcurementPrice` | `number` | Cooperative buying price |
| `privateDairyPrice` | `number` | Private dairy price |
| `demandIndex` | `number` | Demand index 0-100 |

### Feed & Input Prices (Weekly)

| Field | Type | Description |
|---|---|---|
| `date` | `date` | Date |
| `district` | `string` | District |
| `concentratePricePerKg` | `number` | INR/kg |
| `fodderPricePerKg` | `number` | INR/kg |
| `maizePricePerQuintal` | `number` | INR/quintal |
| `soyabeanMealPricePerKg` | `number` | INR/kg |
| `feedPriceIndex` | `number` | Composite feed price index |

### Where to Get It

| Source | Data | How to Access |
|---|---|---|
| **AGMARKNET** | Milk & commodity prices by APMC/mandi | `agmarknet.gov.in` — free API + CSV download |
| **NDDB (National Dairy Dev. Board)** | Milk procurement prices, cooperative data | `nddb.coop` — contact for API |
| **NHB (National Horticulture Board)** | Commodity price bulletins | `nhb.gov.in` |
| **State Agriculture Dept.** | District-level market prices | e.g. `agri.maharashtra.gov.in` |
| **Dairy co-operative ERPs** | Direct milk price feeds | Partner with AMUL, Gokul, Mahananda |
| **Custom scraper** | Scrape AGMARKNET / mandi portals | Python + schedule |

---

## 7. AI / Risk Model Outputs

**Used in:** Risk Centre, AI Edition, Overview, Forecast

> These are **computed/predicted fields** generated by your ML models. Pre-compute and store, then serve via API.

### Per-Enterprise Risk Scores

| Field | Type | Description |
|---|---|---|
| `enterpriseId` | `string` | Enterprise ID |
| `riskScore` | `number` | Risk score 0-100 |
| `riskLevel` | `enum` | `Low` / `Medium` / `High` / `Critical` |
| `repaymentProbability` | `number` | Probability of on-time repayment (0-100%) |
| `probabilityOfDefault` | `number` | PD in % |
| `exposureAtRisk` | `number` | EAR in INR |
| `earlyWarningSignals` | `number` | Count of active warning flags |
| `watchlistStatus` | `enum` | `Normal` / `Watch` / `Alert` |
| `confidenceScore` | `number` | AI model confidence (0-100%) |
| `modelVersion` | `string` | ML model version string |
| `computedAt` | `datetime` | When scores were last computed |

### Risk Drivers (per Enterprise)

| Field | Type | Description |
|---|---|---|
| `feature` | `string` | Driver name (e.g. Repayment Behaviour) |
| `observedValue` | `number` | Actual observed metric |
| `contributionPoints` | `number` | Impact on risk score |
| `explanation` | `string` | Human-readable explanation |

### Cashflow Forecast (3-6 Months)

| Field | Type | Description |
|---|---|---|
| `forecastMonth` | `string` | Month being forecast |
| `expectedInflow` | `number` | Forecasted inflow (Lakhs INR) |
| `expectedOutflow` | `number` | Forecasted outflow (Lakhs INR) |
| `netCashflowForecast` | `number` | Forecasted net (Lakhs INR) |
| `confidenceLower` | `number` | Lower bound |
| `confidenceUpper` | `number` | Upper bound |
| `stressScenario` | `number` | Worst-case net cashflow |

### How to Build the AI Layer

| Component | Approach |
|---|---|
| **Repayment Probability Model** | Train on historical repayment + cashflow data using XGBoost / LightGBM |
| **Cashflow Forecasting** | ARIMA or Prophet model trained on 12+ months of monthly cashflow per enterprise |
| **Risk Score** | Composite index of Repayment Probability, DSCR, Climate Risk, and Market Risk |
| **AI Explanation** | Use SHAP (SHapley Additive exPlanations) for feature-level explanations |
| **LLM Summaries** | Use Gemini API with structured prompts to generate natural language summaries |
| **Serving** | FastAPI microservices; batch scoring daily/weekly; store in PostgreSQL |

---

## 8. Timeline & Events Data

**Used in:** Timeline tab, Enterprise Overview

### Event Record

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique event ID |
| `enterpriseId` | `string` | Linked enterprise |
| `date` | `date` | Event date |
| `category` | `enum` | `Financial` / `Operations` / `Climate` / `Market` / `Credit` |
| `title` | `string` | Short event title |
| `description` | `string` | Detailed description |
| `impact` | `string` | Impact on enterprise |
| `amount` | `number` | Financial amount if applicable (INR) |
| `status` | `enum` | `Completed` / `Upcoming` / `Alert` / `Info` |
| `riskLevel` | `enum` | `Low` / `Medium` / `High` |

### Where to Get It

- **Credit events:** CBS (repayments, disbursements)
- **Operational events:** Field officer app entries / cooperative data
- **Climate events:** Auto-generated from weather alerts
- **Market events:** Auto-generated when price thresholds breach
- **AI-generated:** Trigger programmatically when model scores cross thresholds

---

## 9. Portfolio-level Aggregates

**Used in:** Dashboard Overview, District Overview, Portfolio Screen, Risk Centre Heat Map

| Field | Type | Description |
|---|---|---|
| `totalEnterprises` | `number` | Total enterprises in portfolio |
| `totalExposure` | `number` | Total loan exposure (Cr INR) |
| `npaCount` | `number` | Count of NPA accounts |
| `npaRate` | `number` | NPA % |
| `watchlistCount` | `number` | Accounts on watchlist |
| `highRiskCount` | `number` | High-risk enterprises (AI) |
| `averageRiskScore` | `number` | Portfolio-average risk score |
| `repaymentRate` | `number` | % of on-time repayments |
| `cashflowPositivePct` | `number` | % of enterprises with positive cashflow |
| `byDistrict` | `array` | Risk/exposure breakdown by district |
| `bySector` | `array` | Risk/exposure breakdown by sector |

### Where to Get It

- Aggregated from CBS + AI model outputs
- Run daily batch jobs and cache in Redis or PostgreSQL materialized views

---

## 10. Data Source Quick Reference

| Data Category | Best Free Source | Best Commercial Source |
|---|---|---|
| Borrower/Enterprise | CBS (internal) | — |
| Loan/Credit | CBS (internal) | CIBIL API (TransUnion) |
| Milk Production | INAPH, cooperative system | Stellapps / DeLaval API |
| Feed Prices | AGMARKNET | Reuters Eikon |
| Milk Prices | AGMARKNET, NDDB portal | NDDB API (on request) |
| Rainfall / Weather | IMD, Open-Meteo | Skymet, IBM Weather |
| Drought / NDVI | NRSC Bhuvan | Planet Labs |
| Disease Outbreaks | NADCP, INAPH | — |
| AI Risk Scores | Build in-house (see section 7) | Experian Model Bank |
| Govt. Subsidy Data | DBT Bharat portal | — |

---

## 11. Suggested API Structure

```
GET  /api/enterprise/:id                     → Enterprise profile
GET  /api/enterprise/:id/financial           → Monthly cashflow records
GET  /api/enterprise/:id/credit              → Loan accounts + repayment history
GET  /api/enterprise/:id/operations          → Herd, milk production, feed data
GET  /api/enterprise/:id/climate             → Weather data for enterprise district
GET  /api/enterprise/:id/market              → Milk & feed price trends
GET  /api/enterprise/:id/risk                → AI risk scores + drivers
GET  /api/enterprise/:id/forecast            → Cashflow forecast (3-6 months)
GET  /api/enterprise/:id/timeline            → Events timeline

GET  /api/portfolio/summary                  → Portfolio-level KPIs
GET  /api/portfolio/heatmap                  → Risk heatmap data
GET  /api/portfolio/district/:district       → District-level breakdown

POST /api/enterprise/:id/intervention        → Create intervention case
POST /api/financial-record                   → Add a new cashflow record
POST /api/sync                               → Offline-first sync endpoint
```

---

## 12. Implementation Roadmap

### Phase 1 — Core Foundation (Month 1-2)
- CBS integration for enterprise + loan data
- Manual cashflow entry via field officer mobile app
- Basic rule-based risk scoring

### Phase 2 — Data Intelligence (Month 3-4)
- Milk production API integration (Stellapps / cooperative)
- Weather data ingestion (Open-Meteo + IMD)
- AGMARKNET price feeds
- Train first ML model for repayment prediction

### Phase 3 — AI-Powered (Month 5-6)
- Full cashflow forecasting model (per enterprise)
- SHAP-based AI explanations
- Gemini API for natural language summaries
- Real-time alert engine

### Phase 4 — Scale (Month 7+)
- Multi-bank, multi-district rollout
- CIBIL / bureau integration
- Advanced scenario modelling
- Offline-first mobile app for field officers

---

> **Maintained by:** GramPulse Engineering Team
> **Last Updated:** August 2026
