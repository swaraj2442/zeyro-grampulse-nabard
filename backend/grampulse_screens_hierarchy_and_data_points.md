# GramPulse Application Screen Architecture & Data Points Specification

This document provides a comprehensive overview of all screens within the **GramPulse** application, organized by navigation hierarchy. Each screen details the summary, primary metadata fields, tabular data structures, key metrics, and specific graphical/chart components.

---

## Executive Summary & Application Hierarchy

```
GramPulse Application
├── 1. Home / Overview
├── 2. Portfolio
├── 3. AI Copilot
│   ├── 3.1 Decision Copilot
│   ├── 3.2 Scenario Simulator
│   └── 3.3 Policy Simulator
├── 4. Intelligence
│   ├── 4.1 Risk Center
│   ├── 4.2 Climate Intelligence
│   ├── 4.3 Market Intelligence
│   ├── 4.4 Behaviour Intelligence
│   ├── 4.5 Sector Intelligence
│   ├── 4.6 Early Warning
│   └── 4.7 Explainability
├── 5. Operations
│   ├── 5.1 Interventions
│   ├── 5.2 Field Officers
│   ├── 5.3 Tasks
│   ├── 5.4 Approvals
│   ├── 5.5 Offline Collection
│   ├── 5.6 Documents
│   └── 5.7 Notifications
├── 6. Forecasting
│   ├── 6.1 Forecast Center
│   ├── 6.2 Cashflow Forecast
│   ├── 6.3 Revenue Forecast
│   ├── 6.4 Demand Forecast
│   ├── 6.5 NPA Forecast
│   ├── 6.6 Climate Forecast
│   └── 6.7 Scenario Analysis
├── 7. Enterprise Twin (Deep Dive)
├── 8. Reports
└── 9. Administration & Settings
```

---

## 1. Top Level Navigation

| Screen Name | Section / Parent | Screen Key | Primary Purpose | Key Features |
| :--- | :--- | :--- | :--- | :--- |
| **Home (Overview)** | Root Nav | `overview` | High-level executive summary of rural portfolio health, alert distribution, and key regional metrics. | AI Summary, KPI cards, Regional maps, Delinquency trends. |
| **Portfolio** | Root Nav | `portfolio` | Complete portfolio explorer of rural micro-enterprises with health scoring and district performance. | Enterprise table, Donut distribution, Health score bar, Trend sparklines. |
| **Enterprise Twin** | Deep Dive | `twin` | 360-degree digital twin representation of an individual rural micro-enterprise. | Cashflow telemetry, Risk scores, Credit profile, Climate exposure. |

### 1.1 Home / Overview Screen Data Points

| Component Category | Element / Metric Name | Data Type / Format | Graphical Element Type | Data Points Captured |
| :--- | :--- | :--- | :--- | :--- |
| **Header Filters** | State, District, Sector, Date Range | Dropdowns | Control Bar | `State_Name`, `District_Name`, `Sector_Code`, `Start_Date`, `End_Date` |
| **AI Summary** | Portfolio Brief | Text + Confidence % | Alert Banner | `Summary_Text`, `Confidence_Score` (94%) |
| **KPI Metrics** | Total Loan Outstanding | Currency (₹ Cr) | KPI Card + Trend Arrow | `Total_Outstanding_Value`, `Monthly_Change_%` |
| **KPI Metrics** | Avg. Portfolio Health | Score (0 - 100) | KPI Card + Gauge | `Health_Score` (81/100), `Delta_Pts` |
| **KPI Metrics** | Active Enterprises | Integer | KPI Card + Sparkline | `Active_Count` (3,652), `Growth_%` |
| **KPI Metrics** | High Risk Enterprises | Integer | KPI Card + Red Badge | `Risk_Count` (356), `Delta_Count` |
| **Chart Data** | Loan Outstanding Trend | Area Series | Area Chart | `Month`, `Loan_Amount_Cr`, `Forecast_Amount_Cr` |
| **Chart Data** | Risk Distribution by Sector | Donut Slices | Donut Chart | `Sector_Name` (Dairy, Poultry, F&V), `Percentage`, `Enterprise_Count` |
| **Table Data** | High Risk Enterprises Watchlist | Table Grid | Table with Status Badges | `Enterprise_Name`, `District`, `Sector`, `Health_Score`, `NPA_Status`, `Loan_Amount` |

---

## 2. Portfolio Management

### 2.1 Portfolio Screen (`portfolio`)

| Component Category | Element / Metric Name | Data Type / Format | Graphical Element Type | Data Points Captured |
| :--- | :--- | :--- | :--- | :--- |
| **Hero AI Banner** | AI Portfolio Summary | Rich Text | Banner + Confidence Badge | `Attention_Count` (18), `High_Risk_Sectors`, `Preventable_Delinquencies` (₹2.48 Cr), `AI_Confidence` (92%) |
| **KPI Cards (6x)** | Total Enterprises | Numeric (Count) | Metric Card + Green Sparkline | `Value` (3,250), `Delta` (+120 vs last week) |
| **KPI Cards (6x)** | Portfolio Health Score | Score / 100 | Metric Card + Green Sparkline | `Value` (81/100), `Delta` (+6 pts vs last week) |
| **KPI Cards (6x)** | At Risk (Next 60 Days) | Numeric (Count) | Metric Card + Orange Sparkline | `Value` (18), `Delta` (-5 vs last week) |
| **KPI Cards (6x)** | Forecast NPA (Next 90 Days) | Percentage (%) | Metric Card + Red Sparkline | `Value` (2.7%), `Delta` (-0.6% vs last week) |
| **KPI Cards (6x)** | Cash-flow Deficit (60 Days) | Currency (₹ Cr) | Metric Card + Purple Sparkline | `Value` (₹2.48 Cr), `Delta` (+8% vs last week) |
| **KPI Cards (6x)** | Interventions Pending | Numeric (Count) | Metric Card + Purple Sparkline | `Value` (27), `Delta` (+6 vs last week) |
| **Table Grid** | Enterprise Portfolio Table | Paginated Data Grid | Table + Progress Bar + Sparklines | `Enterprise_ID`, `Enterprise_Name`, `Sector`, `District`, `Health_Score` (Bar), `Risk_Level`, `Repayment_Probability`, `Cashflow_Forecast` (Surplus/Deficit), `Forecast_NPA` |
| **Widget 1** | Sector Distribution | Donut Chart | Donut Chart + Legend | `Dairy` (35%), `Poultry` (28%), `Food Processing` (20%), `Rural Retail` (17%) |
| **Widget 2** | Health Score Distribution | Multi-segment Bar | Stacked Progress Bar | `Low (0-50)`: 420 (13%), `Medium`: 1,210 (37%), `High`: 1,620 (50%) |
| **Widget 3** | Portfolio Trends | Vertical List | List Item + Sparkline | `Enterprises Added` (+4%), `Enterprises At Risk` (-2%), `Cash-flow Deficit` (+8%), `Interventions Completed` (+6%) |

---

## 3. AI Copilot Navigation

| Screen Name | Sub-Item Label | Screen Key | Primary Purpose | Key Features |
| :--- | :--- | :--- | :--- | :--- |
| **Decision Copilot** | Decision Copilot | `copilot` | Interactive AI assistant for credit decisions, enterprise queries, and policy prompts. | Natural language chat, Contextual entity cards, Prompt shortcuts. |
| **Scenario Simulator** | Scenario Simulator | `copilot_scenario` | Interactive simulation tool for testing drought, price shock, or interest rate scenarios. | Parameter sliders, Impact comparison charts, Sensitivity matrix. |
| **Policy Simulator** | Policy Simulator | `copilot_policy` | Simulates macro policy changes (e.g. subsidy updates, restructuring schemes). | Policy toggle controls, Portfolio impact projection, Risk mitigation score. |

### 3.1 AI Copilot Data Points Specification

| Component Category | Element / Metric Name | Data Type / Format | Graphical Element Type | Data Points Captured |
| :--- | :--- | :--- | :--- | :--- |
| **Chat Telemetry** | Conversation Prompt | Text Input | Interactive Chat Window | `Query_Text`, `Suggested_Prompts`, `Session_ID` |
| **Copilot Response** | AI Answer & Reasoning | Rich Markdown | Formatted Output | `Answer_Body`, `Source_Citations`, `Confidence_Score` |
| **Simulator Inputs** | Rainfall Deficit Slider | Range (-50% to +50%) | Interactive Slider | `Rainfall_Delta_%`, `Feed_Price_Increase_%`, `Interest_Rate_Delta` |
| **Simulator Outputs** | Projected NPA Change | Delta % | Dual Bar Comparison | `Baseline_NPA_%`, `Simulated_NPA_%`, `Incremental_Loss_Val` |
| **Simulator Outputs** | High Risk Enterprise Shift | Count Shift | Donut / Heatmap | `Shifted_To_High_Risk_Count`, `Shifted_To_Medium_Risk_Count` |

---

## 4. Intelligence Module

| Screen Name | Sub-Item Label | Screen Key | Primary Purpose | Key Features |
| :--- | :--- | :--- | :--- | :--- |
| **Risk Center** | Risk Center | `intelligence_risk` | Comprehensive risk telemetry dashboard tracking credit, operational, and climate risk scores. | Risk heatmaps, Enterprise risk matrix, Category breakdown charts. |
| **Climate** | Climate | `intelligence_climate` | Climate vulnerability assessment, rainfall deviation, and NDVI crop health index. | Climate anomaly map, NDVI index line chart, Water stress indicators. |
| **Market** | Market | `intelligence_market` | Commodity pricing intelligence, demand-supply gap analysis, and market sentiment. | Commodity price line graphs, Demand vs Supply bar chart, Market watchlist table. |
| **Behaviour** | Behaviour | `intelligence_behaviour` | Behavioral scoring tracking repayment discipline, cashflow regularity, and savings habits. | Repayment over time chart, Cashflow stacked bars, Savings donut, District metric table. |
| **Sector** | Sector | `intelligence_sector` | Sectoral intelligence comparing Dairy, Poultry, Food Processing, and Agri-services. | Sector growth comparison, Margin index bar chart, Sector risk distribution. |
| **Early Warning** | Early Warning | `intelligence_warning` | Early warning system (EWS) flagging early signals of financial distress and default risk. | EWS trigger alerts, Vulnerability timeline, Early alert severity table. |
| **Explainability** | Explainability | `intelligence_explain` | SHAP/LIME-based AI explainability for credit scores and risk classifications. | Feature importance bar chart, Factor contribution waterfalls. |

### 4.1 Intelligence Module Data Points Specification

#### A. Climate Intelligence Data Points (`intelligence_climate`)

| Component Category | Element / Metric Name | Data Type / Format | Graphical Element Type | Data Points Captured |
| :--- | :--- | :--- | :--- | :--- |
| **Map Visualization** | District Climate Vulnerability | TopoJSON Geo Map | Interactive Choropleth Map | `District_Name`, `Vulnerability_Level` (High, Med, Low), `Rainfall_Deficit_%` |
| **Chart Data** | Rainfall Anomaly Trend | Composed Line & Bar | Bar + Line Chart | `Date`, `Actual_Rainfall_mm`, `Normal_Rainfall_mm`, `Forecast_mm` |
| **Chart Data** | Crop Vegetation Health (NDVI) | Line Series | Smooth Line Chart | `Date`, `NDVI_Index` (0.0 to 1.0) |
| **Risk Factors Table** | Factor Severity | Table Grid | Table + Icon Badges | `Factor_Name` (Water Stress, Temp Stress), `Severity_Level`, `Impacted_Blocks_Count` |
| **District Breakdown** | Climate Risk by Block | Table Grid | Paginated Table | `District`, `Block`, `Climate_Score`, `Rainfall_Dev_%`, `NDVI_Val`, `Water_Stress` |

#### B. Market Intelligence Data Points (`intelligence_market`)

| Component Category | Element / Metric Name | Data Type / Format | Graphical Element Type | Data Points Captured |
| :--- | :--- | :--- | :--- | :--- |
| **Price Data** | Commodity Price Index | Line Chart | Multi-Line Chart | `Commodity` (Milk, Paneer, Ghee), `Current_Price`, `Last_Week_Price`, `Trend_%` |
| **Supply-Demand** | Supply vs Demand Gap | Stacked Bar Chart | Bar Chart | `Date`, `Demand_MT`, `Supply_MT`, `Gap_MT` |
| **Price Forecast** | 4-Week Price Forecast | Composed Area Chart | Area Chart + Confidence Band | `Week`, `Predicted_Price`, `Lower_Bound`, `Upper_Bound` |
| **Watchlist Grid** | Regional Market Pricing | Table Grid | Table with Sparklines | `Market_Name`, `State`, `Current_Price`, `Weekly_Change`, `Demand_Volume`, `Market_Sentiment` |

#### C. Behaviour Intelligence Data Points (`intelligence_behaviour`)

| Component Category | Element / Metric Name | Data Type / Format | Graphical Element Type | Data Points Captured |
| :--- | :--- | :--- | :--- | :--- |
| **Gauge Metric** | Behaviour Risk Score | Score (0 - 100) | Radial Donut Gauge | `Score` (72), `Status` (Good), `Trend_Delta` (-6 pts) |
| **KPI Sparklines** | On-Time Repayment Rate | Percentage (%) | Metric Card + Sparkline | `Rate_%` (78%), `Trend_Pts` (+5 pts) |
| **KPI Sparklines** | Cashflow Regularity Rate | Percentage (%) | Metric Card + Sparkline | `Regularity_%` (83%), `Trend_Pts` (+6 pts) |
| **KPI Sparklines** | Savings Rate (Avg) | Percentage (%) | Metric Card + Sparkline | `Savings_%` (24%), `Trend_Pts` (+3 pts) |
| **KPI Sparklines** | Income Stability Index | Index (0 - 1.0) | Metric Card + Sparkline | `Index` (0.72), `Trend_Delta` (+0.05) |
| **Chart 1** | Repayment Behaviour Over Time | Multi-Line Series | Line Chart | `Month`, `On_Time_%`, `Late_%`, `Default_%` |
| **Chart 2** | Cashflow Regularity (Stacked) | Stacked Bar Series | 100% Stacked Bar Chart | `Month`, `Regular_Cashflow_%`, `Irregular_Cashflow_%` |
| **Chart 3** | Savings Behaviour Distribution | Donut Slices | Donut Chart | `High Savers (>20%)`, `Medium Savers`, `Low Savers`, `No Savings` |
| **Chart 4** | Income Stability Volatility | Bar Series | Column Bar Chart | `Month`, `Volatility_Index` (0.0 to 1.0) |
| **Table 1** | Behaviour Watchlist | Table Grid | Table + Alert Icons | `Enterprise_Name`, `District`, `Risk_Score`, `Repayment_Trend`, `Cashflow_Regularity`, `Alert_Flag` |
| **Table 2** | Behaviour Metrics by District | Table Grid | District Summary Table | `District`, `Enterprise_Count`, `On_Time_%`, `Cashflow_%`, `Savings_%`, `Stability_Index`, `Risk_Score`, `Trend` |

---

## 5. Operations Module

| Screen Name | Sub-Item Label | Screen Key | Primary Purpose | Key Features |
| :--- | :--- | :--- | :--- | :--- |
| **Interventions** | Interventions | `interventions` | Workflow tracking for field officer restructuring, advisory, and recovery interventions. | Kanban intervention pipeline, Status badges, Approval actions. |
| **Field Officers** | Field Officers | `operations_field_officers` | Field officer performance metrics, village assignments, and recovery conversion rates. | Officer leaderboard, Task completion rates, Officer location map. |
| **Tasks** | Tasks | `operations_tasks` | Operational task manager for site visits, verification, and audit assignments. | Task list grid, Priority tags, Due date calendar filters. |
| **Approvals** | Approvals | `operations_approvals` | Loan restructuring, emergency relief, and intervention sign-off management. | Pending approval cards, Multi-level sign-off triggers, Risk impact analysis. |
| **Offline Collection** | Offline Collection | `operations_offline` | Field collection telemetry, receipt generation, and cash synchronization logs. | Collection log table, Offline sync status indicators, Agent collection totals. |
| **Documents** | Documents | `operations_docs` | Document repository for enterprise KYC, financial statements, and site inspection logs. | Document viewer, Verification status, OCR metadata extractions. |
| **Notifications** | Notifications | `operations_notifications` | System alerts, risk trigger notifications, and broadcast messages. | Priority alert feeds, Unread badges, Category filters. |

### 5.1 Operations Data Points Specification

| Component Category | Element / Metric Name | Data Type / Format | Graphical Element Type | Data Points Captured |
| :--- | :--- | :--- | :--- | :--- |
| **Interventions** | Active Interventions | Count by Status | Kanban Columns / Cards | `Intervention_ID`, `Enterprise_Name`, `Officer_Assigned`, `Action_Type` (Restructure, Relief), `Status` |
| **Field Metrics** | Officer Recovery Rate | Percentage (%) | Leaderboard Bar Chart | `Officer_Name`, `Assigned_Enterprises`, `Visited_Count`, `Recovery_Rate_%` |
| **Approvals** | Relief Request Amount | Currency (₹ Lakh) | Approval Cards | `Request_ID`, `Enterprise_ID`, `Relief_Amount`, `Risk_Level`, `Approval_Stage` |
| **Offline Sync** | Sync Log Data | Timestamped Grid | Table Grid | `Agent_ID`, `Receipt_Number`, `Amount_Collected`, `Sync_Status` (Synced / Pending) |

---

## 6. Forecasting Module

| Screen Name | Sub-Item Label | Screen Key | Primary Purpose | Key Features |
| :--- | :--- | :--- | :--- | :--- |
| **Forecast Center** | Forecast Center | `forecast` | Centralized forecasting overview across cashflow, revenue, demand, and NPA metrics. | Multi-forecast toggle, Projected vs actual curves, Forecast error metrics. |
| **Cashflow Forecast** | Cashflow Forecast | `forecast_cashflow` | Predictive cashflow telemetry modeling future inflows vs outflows for micro-enterprises. | Monthly cashflow projection area chart, Surplus/Deficit bars, Liquidity index. |
| **Revenue Forecast** | Revenue Forecast | `forecast_revenue` | Seasonal and macroeconomic revenue forecasting across key enterprise sectors. | Revenue growth trend lines, Sectoral revenue contribution pie chart. |
| **Demand Forecast** | Demand Forecast | `forecast_demand` | Localized demand forecasting for products (dairy, poultry, retail goods). | Demand curve forecasts, Inventory requirement projections. |
| **NPA Forecast** | NPA Forecast | `forecast_npa` | Machine learning-based non-performing asset (NPA) transition modeling. | 30/60/90-day DPD transition matrix, NPA migration probability curves. |
| **Climate Forecast** | Climate Forecast | `forecast_climate` | Long-term climate scenario forecasting and yield impact modeling. | Monsoon projection lines, Crop yield impact heatmaps. |
| **Scenario Analysis** | Scenario Analysis | `forecast_scenario` | Multi-variable stress testing (e.g. 20% inflation + 30% rainfall deficit). | Comparative stress test area charts, Loss estimation tables. |

### 6.1 Forecasting Data Points Specification

| Component Category | Element / Metric Name | Data Type / Format | Graphical Element Type | Data Points Captured |
| :--- | :--- | :--- | :--- | :--- |
| **Cashflow Projection** | Monthly Cash Inflow vs Outflow | Currency Series | Dual Bar / Line Chart | `Month`, `Projected_Inflow`, `Projected_Outflow`, `Net_Cashflow` |
| **NPA Migration** | DPD Migration Matrix | Probability Matrix (%) | Heatmap Grid | `Current_Stage` (Standard, SMA-0, SMA-1, SMA-2), `Next_Stage_Probability_%` |
| **NPA Forecast Curve** | 90-Day Projected NPA % | Percentage Series | Line Chart with Shaded Band | `Future_Month`, `Projected_NPA_%`, `Best_Case_%`, `Worst_Case_%` |
| **Stress Test** | Scenario Deficit Impact | Currency (₹ Cr) | Waterfall / Comparison Chart | `Scenario_Name` (Base, Mild Stress, Severe Stress), `Expected_Credit_Loss` |

---

## 7. Deep Dive: Enterprise Digital Twin Screen (`twin`)

| Section / Component | Component Name | Data Type / Format | Visual Element | Captured Data Points |
| :--- | :--- | :--- | :--- | :--- |
| **Header** | Enterprise Profile | Object Data | Profile Header + Avatar | `Enterprise_ID`, `Enterprise_Name`, `Owner_Name`, `Sector`, `Location`, `KYC_Status` |
| **Scorecard** | Overall Health Score | Score (0 - 100) | Circular Radial Progress | `Health_Score`, `Score_Category` (Low Risk, Medium Risk, High Risk) |
| **Financial Telemetry** | Monthly Cashflow History | Currency Time-Series | Composed Bar & Line Chart | `Month`, `Revenue`, `Operating_Cost`, `Net_Margin`, `Repayment_Status` |
| **Credit Telemetry** | Loan & Repayment History | Table & Timeline | Step Timeline / Table | `Loan_ID`, `Sanctioned_Amount`, `Disbursed_Amount`, `POS`, `DPD_Count`, `Credit_Score` |
| **Climate Exposure** | Localized Weather & NDVI | Geospatial & Line | Map Widget + Line Chart | `Crop_Type`, `NDVI_Value`, `Soil_Moisture_%`, `Flood_Risk_Index` |
| **AI Recommendations** | Actionable Interventions | List of Recommendations | AI Action Cards | `Recommendation_Title`, `Priority` (High, Med, Low), `Impact_Score`, `Action_Button` |

---

## 8. Reports & Administration

| Screen Name | Sub-Item Label | Screen Key | Primary Purpose | Key Features |
| :--- | :--- | :--- | :--- | :--- |
| **Reports** | Reports | `reports` | Pre-built and customizable regulatory (NABARD/RBI) and internal audit report builder. | Report template selector, Scheduled email exports, PDF/CSV downloads. |
| **Administration** | Settings / Admin | `settings` | User role management, API configuration, model threshold tuning, and system logs. | User permission matrix, Risk score weights adjustment, Audit logs. |

---

## Technical Data Dictionary Summary

| Data Metric Key | Data Type | Usage Across Screens | Description |
| :--- | :--- | :--- | :--- |
| `health_score` | Integer (0-100) | Overview, Portfolio, Risk Center, Twin | Composite score combining credit, cashflow, and climate risk. |
| `repayment_prob` | Percentage (0-100%) | Portfolio, Behaviour, Early Warning, Twin | Probability of on-time loan repayment for the next cycle. |
| `cashflow_deficit` | Currency (INR) | Portfolio, Cashflow Forecast, Risk Center | Projected net negative cashflow over a 30/60/90 day horizon. |
| `forecast_npa_pct` | Percentage (%) | Overview, Portfolio, NPA Forecast | Estimated percentage of portfolio transitioning to NPA. |
| `ndvi_index` | Float (0.00 - 1.00) | Climate, Climate Forecast, Twin | Normalized Difference Vegetation Index indicating crop health. |
| `behaviour_risk_score`| Integer (0-100) | Behaviour Intelligence, Risk Center | Risk score based on historical payment timeliness & savings habits. |
