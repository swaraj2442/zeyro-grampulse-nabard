# ZEYRO GRAMPULSE — DATA MAPPING & SCHEMA SPECIFICATION
## Comprehensive Reference Guide to Data Entities, Indicators & Component Mappings
**Version:** 1.0 · July 2026  
**Project:** GramPulse — AI-Driven Rural Enterprise Intelligence Platform for NABARD  

---

## 1. Overview & Data Architecture

Zeyro GramPulse integrates **traditional financial data** with **alternative digital proxies, market intelligence, and satellite climate feeds** to deliver predictive insights for rural credit monitoring.

```
+-----------------------------------------------------------------------------------+
|                                DATA SOURCES & PROXIES                             |
|                                                                                   |
|  [Financials]          [Digital Proxies]       [Market Intelligence]  [Climate]   |
|  • Loan Balances       • UPI Transaction       • APMC Commodity       • Rainfall  |
|  • Savings History       Velocity Index          Prices (Dairy/Feed)    Deficit   |
|  • Repayment Records   • Digital Pymt Frequency • Local Demand Index  • Monsoon   |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                              GRAMPULSE DATA PIPELINE                              |
|                                                                                   |
|  • BFS-R Scoring Engine (0-100)                 • 3-6 Month Cash Flow Predictor   |
|  • Early Warning Stress Classifier (4 Tiers)    • Sector Risk Modeling Engine     |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                             SCREEN DATA BINDINGS                                  |
|                                                                                   |
|  Overview | Risk Center | Forecasts | Enterprise Twin | Portfolio Map | Analytics  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Entity Schemas & Mappings

### 2.1. Enterprise Entity (`ENTERPRISES`)
The core micro-enterprise record representing SHGs, FPOs, and Individual Rural Entrepreneurs.

| Field Name | Type | Description / Constraints | Sample Values | Mapped Screens |
|---|---|---|---|---|
| `id` | `string` | Unique enterprise identifier | `"E-001"`, `"E-002"` | Enterprise Explorer, Twin, Analytics |
| `name` | `string` | Business name | `"Ramesh Dairy"`, `"Shiv Poultry"` | Explorer, Twin, Risk Center, Analytics |
| `type` | `enum` | Organizational structure | `"SHG"`, `"FPO"`, `"Individual"` | Explorer, Twin, Data Entry Modal |
| `village` | `string` | Village / Panchayat location | `"Borgaon"`, `"Pimpalgaon (B)"` | Explorer, Twin, Risk Center, Analytics |
| `district` | `string` | District jurisdiction | `"Nashik"`, `"Pune"`, `"Sinnar"` | Explorer, District Overview, Risk Center |
| `state` | `string` | State jurisdiction | `"Maharashtra"`, `"Gujarat"` | Portfolio Health, Overview |
| `sector` | `enum` | Rural economic sector | `"Dairy"`, `"Poultry"`, `"F&V"`, `"Retail"`, `"Food Processing"`, `"Agriculture"` | Explorer, Analytics, Sectors, Risk Center |
| `health` | `number` | Composite BFS-R score (0–100) | `81`, `43`, `62` | Explorer, Twin, Analytics |
| `risk` | `enum` | Risk severity classification | `"High"`, `"Medium-High"`, `"Medium"`, `"Low"` | Explorer, Risk Center, Analytics |
| `loan` | `string` | Total outstanding loan amount | `"₹2,50,000"`, `"₹18,50,000"` | Explorer, Portfolio, Analytics |
| `officer` | `string` | Assigned NABARD Field Officer | `"Priya S."`, `"Sandeep K."` | Enterprise Explorer, Twin |
| `reason` | `string` | Primary AI risk trigger | `"High Delinquency"`, `"Low Cash Flow"`, `"Payment Delays"` | Risk Center |

---

### 2.2. Enterprise Digital Twin Radar / Gauges (`GAUGES`)
A 7-dimensional score breakdown evaluating enterprise health across financial and non-traditional signals.

| Gauge Metric | Score Range | Indicator Data Mapping & Proxy Source | Weight in BFS-R |
|---|---|---|---|
| **Financial** | `0 – 100` | Savings balance ratio, debt-service coverage ratio (DSCR), loan repayment timeliness. | `20%` |
| **UPI Proxy** | `0 – 100` | **UPI Transaction Velocity Index**: Digital payment frequency, zero-delay transaction streak, UPI inflow volume. *(Privacy-safe, non-PII aggregate)* | `20%` |
| **Health** | `0 – 100` | Overall composite health score. | `15%` |
| **Market** | `0 – 100` | APMC commodity demand index, raw material margin stability (e.g., milk procurement price vs. fodder cost). | `15%` |
| **Climate** | `0 – 100` | Satellite rainfall deficit index, drought vulnerability, temperature anomaly impact. | `10%` |
| **Credit** | `0 – 100` | Repayment history, past delinquency flags, bank linkage status. | `10%` |
| **Growth** | `0 – 100` | 12-month revenue growth velocity, transaction volume growth. | `10%` |

---

### 2.3. Cash Flow Forecasting Engine Schema (`FORECAST_DATA`)
Predictive cash flow records driving the 3-to-6-month horizon charts.

| Field Name | Type | Description | Sample Values | Mapped Screens |
|---|---|---|---|---|
| `month` | `string` | Timeline month (Jul '25 – Jun '26) | `"Jul '25"`, `"Oct '25"`, `"Jan '26"` | Forecasts, Enterprise Twin |
| `actual` | `number \| null` | Historical actual cash flow (₹ Lakhs) | `1.2`, `1.15`, `null` | Forecasts, Enterprise Twin |
| `forecast` | `number \| null` | AI predicted cash flow (₹ Lakhs) | `null`, `1.05`, `0.95` | Forecasts, Enterprise Twin |
| `upperBound` | `number` | Confidence interval upper limit (₹ Lakhs) | `1.18`, `1.08` | Forecasts |
| `lowerBound` | `number` | Confidence interval lower limit (₹ Lakhs) | `0.92`, `0.82` | Forecasts |
| `revenue` | `number` | Total monthly revenue inflow (₹ Lakhs) | `1.45`, `1.50` | Forecasts |
| `expenses` | `number` | Total monthly operational expense (₹ Lakhs) | `0.40`, `0.42` | Forecasts |

---

### 2.4. Risk Center Data Schema (`KPIS`, `DONUT_DATA`, `TREND_DATA`, `ALERTS`)

#### Risk Metrics (`KPIS`)
- **Total At-Risk Enterprises:** `4,321` units (`↑ 3.4% vs last month`)
- **High-Risk Enterprises:** `612` units (`↑ 4.8% vs last month`)
- **Avg. Risk Score:** `72` / 100 (`↓ 2.1% vs last month`)
- **Watchlist Enterprises:** `2,390` units (`↑ 5.6% vs last month`)
- **Critical Alerts:** `156` active alerts (`↑ 12.3% vs last month`)

#### Risk Tiers (`DONUT_DATA`)
- **High Risk (81 – 100):** `612` units (`14%`) — Color: `#ef4444` (Red)
- **Medium-High Risk (61 – 80):** `950` units (`22%`) — Color: `#f97316` (Orange)
- **Medium Risk (41 – 60):** `1,209` units (`28%`) — Color: `#8b5cf6` (Purple)
- **Low Risk (21 – 40):** `1,036` units (`24%`) — Color: `#3b82f6` (Blue)
- **Very Low Risk (0 – 20):** `514` units (`12%`) — Color: `#10b981` (Green)

---

### 2.5. Portfolio Geography & Map Schema (`STATES`, `DISTRICTS`)

#### India State Map Dataset (`india-states.topojson`)
- **Center:** `[82.5, 22.5]`, **Scale:** `1050`
- **Mapped Fields:**
  - `geoName`: State name (`"Maharashtra"`, `"Gujarat"`, `"Rajasthan"`, `"Madhya Pradesh"`, etc.)
  - `score`: State average BFS-R health score (`72` for MH, `78` for GJ, `64` for RJ)
  - `enterprises`: Total active units (`18,562` for MH)
  - `healthy`: Healthy count (`2,341`)
  - `critical`: Critical count (`1,056`)

#### District Drill-down Dataset (`STATE_DISTRICTS`)
- **Mapped Fields for Selected State:**
  - `name`: District name (`"Nashik"`, `"Pune"`, `"Ahmednagar"`, `"Thane"`, `"Surat"`, `"Indore"`)
  - `health`: District health score (`81`, `86`, `72`)
  - `critical`: Critical enterprise count (`18`, `12`, `15`)
  - `trend`: Health trend direction (`"up"`, `"down"`, `"flat"`)

---

### 2.6. Sector Risk Intelligence Schema (`SECTORS`)

| Sector Name | Avg. Risk Score | High Risk % | Key Vulnerability Factor | Mapped Screens |
|---|---|---|---|---|
| **Dairy** | `81` | `18%` | Fodder price spikes, procurement price volatility | Sectors, Risk Center, Analytics |
| **Poultry** | `76` | `15%` | Maize/feed cost surge, temperature heatwaves | Sectors, Risk Center, Analytics |
| **Food Processing** | `72` | `14%` | Raw material supply disruption, seasonal crop yield | Sectors, Risk Center, Analytics |
| **Retail** | `68` | `12%` | Local consumer purchasing power, inventory turnover | Sectors, Risk Center, Analytics |
| **Agri Services** | `64` | `10%` | Equipment utilization rate, seasonal diesel costs | Sectors, Risk Center, Analytics |

---

### 2.7. Micro-Enterprise Data Entry Schema (`DataEntryModal`)
Schema for data logged directly by entrepreneurs or field officers via the `+ Entry` modal.

| Field Name | Type | Description | Input Options / Validation |
|---|---|---|---|
| `enterpriseId` | `string` | Target enterprise ID | Selected from enterprise dropdown |
| `entryType` | `enum` | Type of financial transaction | `'income'` \| `'expense'` \| `'savings'` \| `'loan'` |
| `amount` | `number` | Transaction amount in INR | Positive numeric input (e.g. `12500`) |
| `category` | `string` | Transaction description / note | Text string (e.g. *"Milk sales deposit"*) |
| `timestamp` | `string` | Event date and time | ISO string |
| `syncStatus` | `enum` | Local offline status | `'cached_locally'` \| `'synced'` |

---

## 3. Screen-by-Screen Component & Data Binding Matrix

| Screen Component | File Path | Primary Data Mapped | Visual Elements |
|---|---|---|---|
| **Executive Overview** | `OverviewScreen.tsx` | Total Enterprises, Portfolio Health %, NPA Expected, BFS-R Avg. | 4 KPI Cards, Health Donut, Timeframe Filter, Live Badge |
| **GramPulse Recommender** | `AlertsScreen.tsx` | AI Risk Feed, Recommendations, Severity Flags | Severity Filter Tabs, Recommendation Cards |
| **Risk Center** | `RiskCenterScreen.tsx` | At-Risk Enterprises, Risk Tiers, 6-Mo Trends, Sector Risk | 5 KPI Cards, Donut Chart, Trend Line, Top At-Risk Table |
| **Forecast Center** | `ForecastScreen.tsx` | 3-6 Month Cash Flow, Confidence Bounds, Scenarios | Area Chart with Confidence Bands, Cash Flow Multi-line |
| **Enterprise Twin** | `EnterpriseTwinScreen.tsx` | 7 Gauges (including UPI Proxy), Enterprise Details | Arc Gauges, Cash Flow Forecast, AI Summary Card |
| **Enterprise Explorer** | `EnterpriseExplorerScreen.tsx` | Enterprise List, SHG/FPO Badges, Risk Levels | Search Filter, Enterprise Data Table |
| **Portfolio Health** | `GeographyScreen.tsx` | India State Map, State Overview, District Drill-down | Interactive SVG India Map, District Table |
| **Analytics** | `AnalyticsScreen.tsx` | Enterprise Explorer List, KPI Summary, Sparklines | Top Filters, 5 KPI Cards, 10-Row Table, Pagination |
| **Notifications** | `NotificationsScreen.tsx` | System Announcements, Reports, Reminders | Tab Filter (System/Reports/Risk/Reminders), Unread Badges |
| **Data Entry Portal** | `DataEntryModal.tsx` | Income, Expenses, Savings, Loan Repayments | Modal Form, Offline Sync Ready Badge |

---

## 4. Real-World Integration Mapping (API Roadmap)

For live enterprise deployment, the GramPulse data pipeline maps directly to standard Indian financial & government APIs:

```
+---------------------------+--------------------------------------------------------+
| GramPulse Data Field      | Production API Data Source                             |
+---------------------------+--------------------------------------------------------+
| UPI Proxy Velocity        | NPCI Account Aggregator / UPI Analytics API            |
| Loan Balances & Savings   | CBS (Core Banking System) / NABARD SHG-Bank Linkage    |
| Commodity Prices          | Agmarknet APMC Market Price API (Min. of Agriculture)  |
| Climate & Rainfall        | IMD Weather API & ISRO Bhuvan Geo-Spatial Feeds       |
| Enterprise Registration   | Udyam Aadhar Portal / NRLM SHG Database API            |
+---------------------------+--------------------------------------------------------+
```

---

*Specification Document · Zeyro Artificial Intelligence Team · July 2026*
