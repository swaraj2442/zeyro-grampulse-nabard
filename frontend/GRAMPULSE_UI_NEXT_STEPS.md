# GramPulse NABARD Prototype — UI and Presentation Next Steps

## Objective

The current GramPulse demo already includes portfolio monitoring, geographic intelligence, alerts, forecasting, enterprise digital twins, climate and market intelligence, interventions, data entry, reports, notifications, multilingual support, and offline-ready positioning.

The next phase should not add more screens. It should connect the existing screens into one complete workflow:

```text
New enterprise data
        ↓
Forecast refresh
        ↓
Risk alert generated
        ↓
Enterprise Digital Twin explains why
        ↓
Scenario tested
        ↓
Intervention recorded
        ↓
Follow-up monitoring begins
```

The product must feel like one operating system for proactive rural-enterprise credit monitoring, rather than a collection of dashboards.

---

# 1. Features Already Developed

## Authentication and usability

- Persona-based login
- Regional Manager
- Field Officer
- Branch Manager
- NABARD Admin
- Enterprise Owner
- English, Hindi, and Marathi support
- Offline-ready architecture

## Portfolio intelligence

- Executive overview
- Portfolio health indicators
- Geographic risk map
- State and district drill-down
- District health trends
- Portfolio analytics
- Sector intelligence

## Risk and predictive intelligence

- GramPulse Recommender
- Severity-based alerts
- Risk Center
- Historical risk trends
- Top at-risk enterprises
- Three-to-six-month cash-flow forecasting
- Confidence-bound charts
- Scenario simulation

## Enterprise intelligence

- Enterprise Explorer
- Enterprise Digital Twin
- Seven-dimensional health view
- Financial signals
- UPI proxy signals
- Market signals
- Climate signals
- Credit signals
- Growth signals

## Operations

- Daily data-entry modal
- Intervention tracking
- Credit views
- AI Copilot
- Reports
- Notifications

---

# 2. Main Product Gap

The screens need to share one consistent enterprise state.

When an enterprise is marked **High Risk** in the Risk Center, the same enterprise must show the same:

- risk score;
- forecast deficit;
- stress month;
- warning lead time;
- risk drivers;
- model version;
- intervention status; and
- assigned field officer

across Alerts, Enterprise Explorer, Enterprise Digital Twin, Forecast Center, Interventions, Reports, and Copilot.

The first priority is to create one source of truth for all demo data.

---

# 3. Priority Workflow to Make Functional

## Step 1 — Data Entry to Forecast Refresh

When a field officer records:

- income;
- expenses;
- savings;
- loan repayment;
- inventory cost; or
- field observations

GramPulse should:

1. save the record;
2. update the enterprise timeline;
3. refresh the cash-flow forecast;
4. recalculate the risk score;
5. show what changed; and
6. create, update, or close an alert.

Example confirmation:

```text
Monthly records updated

Operating inflow: ₹1,42,000
Operating outflow: ₹1,31,500
Forecast recalculated
Risk moved: Amber → High
```

## Step 2 — Alert to Enterprise Digital Twin

Every alert must link to the related enterprise.

Example:

```text
HIGH RISK

Shakti Poultry Farm may face a ₹38,400 cash deficit
within the next 61 days.

Primary cause:
Feed costs increased by 12%.
```

Primary action:

```text
Review enterprise
```

## Step 3 — Digital Twin to Scenario Simulator

The Digital Twin should provide:

```text
Run intervention scenario
```

The simulator should preload the enterprise and allow the officer to test:

- working-capital support;
- seasonal EMI adjustment;
- input-cost increase;
- output-price decline;
- rainfall shock; and
- local-demand change.

## Step 4 — Scenario to Intervention Case

After running a scenario, allow the officer to create an intervention case containing:

- enterprise;
- current risk;
- selected scenario;
- recommended intervention;
- illustrative amount;
- assigned officer;
- visit date;
- follow-up date;
- notes; and
- case status.

Primary action:

```text
Create intervention case
```

Avoid language such as `Approve loan`, because the model is decision support and not the final credit authority.

## Step 5 — Intervention to Monitoring Timeline

Every action should appear on the enterprise timeline.

Example:

```text
02 Aug — Monthly financial records submitted
03 Aug — Forecast recalculated
03 Aug — Risk moved from Amber to High
03 Aug — ₹38,400 deficit forecast for October
04 Aug — Field visit assigned
06 Aug — Working-capital review initiated
13 Aug — Follow-up due
```

---

# 4. Recommended Navigation

## Primary navigation

```text
Overview
Enterprises
Risk Center
Interventions
Portfolio Intelligence
AI Copilot
```

## Secondary navigation

Move the following under relevant screens or a `More` menu:

- Geography
- District Overview
- Forecast Center
- Sector Intelligence
- Market
- Climate
- Credit
- Reports
- Notifications

Suggested grouping:

- Geography, Sector, Market, and Climate under `Portfolio Intelligence`
- Forecast and Credit under `Enterprise Digital Twin`
- Reports and Notifications under utility menus

---

# 5. Enterprise Digital Twin Improvements

The Digital Twin should become the main operational screen.

## Header

```text
Shakti Poultry Farm

Surgana, Nashik
Poultry · Micro Enterprise
Current account: Standard
Forecast risk: High
```

Actions:

```text
Schedule Visit
Run Scenario
Record Intervention
Generate Report
```

## Summary strip

Show:

- risk score;
- expected stress month;
- forecast deficit;
- warning lead time;
- current DPD;
- scheduled EMI;
- closing cash balance; and
- current intervention status.

## Recommended tabs

```text
Overview
Cash Flow
Credit
Digital Activity
Market & Climate
Interventions
Timeline
```

## Overview layout

### Left panel

Show a six-month cash-flow chart containing:

- historical actuals;
- forecast inflow;
- forecast outflow;
- forecast closing balance;
- calibrated range; and
- expected stress point.

### Right panel

```text
High Risk

Cash deficit expected in 61 days
Forecast shortfall: ₹38,400
Debt-service shortfall: ₹7,200
```

### Risk drivers

```text
Feed costs +12%
UPI inflows −9%
Local demand −6%
Projected DSCR 0.74
```

### Recommended action

```text
Recommended:
Working-capital review and collective feed procurement assessment
```

---

# 6. Overview Dashboard Improvements

The dashboard should answer:

> What needs attention today?

## KPI row

- Enterprises monitored
- Healthy
- Watchlist
- High/Critical
- Forecast deficit exposure
- Active interventions

## Priority sections

### Enterprises requiring attention

Display only the top three to five cases.

### Risk movement

```text
12 moved to Amber
5 moved to High
8 improved
```

### Six-month portfolio outlook

Show:

- expected portfolio inflow;
- expected portfolio outflow;
- forecast liquidity gap; and
- upcoming repayment exposure.

### Cluster alerts

Example:

> Feed-cost inflation is affecting 84 poultry enterprises across Surgana and Dindori.

---

# 7. AI Copilot Scope

The Copilot should explain validated model and portfolio outputs. It should not independently calculate financial values.

Supported questions:

- Why is this enterprise high risk?
- Which enterprises need attention today?
- Which standard accounts may enter stress within 90 days?
- What is causing poultry-sector stress in Nashik?
- Generate an intervention plan for Surgana.
- What changed after the last field visit?

Each answer should include actions such as:

```text
View affected enterprises
Open forecast
Review intervention plan
```

---

# 8. Persona-Specific Default Views

## Regional Manager

- Portfolio health
- District and sector risk
- Cluster alerts
- Intervention performance
- Portfolio forecast

## Field Officer

- Assigned enterprises
- Visits due today
- New alerts
- Data-entry tasks
- Follow-ups
- Offline-sync status

## Branch Manager

- Branch portfolio
- Repayment exposure
- High-risk accounts
- Escalations
- Intervention approvals

## NABARD Admin

- Programme-level portfolio
- District comparisons
- Model monitoring
- Data quality
- Audit trail
- Reports

## Enterprise Owner

- Current financial health
- Upcoming EMI
- Three-month outlook
- Alerts
- Recommended actions
- Support request
- Record entry

---

# 9. Demo Enterprise

Use one enterprise consistently across all screens.

## Suggested profile

```text
Shakti Poultry Farm
Surgana, Nashik

Current DPD: 0
Current account status: Standard
Current cash position: Positive
Forecast risk: High
Forecast deficit: ₹38,400
Warning lead time: 61 days
```

## Risk drivers

- Feed costs increased by 12%
- UPI inflows declined by 9%
- Local demand softened
- Projected DSCR falls to 0.74

## Intervention scenario

```text
₹50,000 illustrative working-capital support
+
Collective feed procurement support
```

## Expected scenario result

```text
Forecast deficit: ₹0
Risk level: High → Amber
```

Use the same values on:

- Overview
- Risk Center
- Enterprise Explorer
- Enterprise Digital Twin
- Forecast Center
- Intervention Workspace
- AI Copilot
- Reports

---

# 10. Shared Data Contracts

Define consistent API contracts for:

```text
Portfolio summary
Enterprise list
Enterprise profile
Cash-flow forecast
Early-warning record
Scenario result
Intervention case
Enterprise timeline
Cluster alert
```

## Example forecast response

```json
{
  "enterprise_id": "RE-00124",
  "model_version": "grampulse-cf-v1.1",
  "forecast_generated_at": "2026-08-04T09:00:00Z",
  "forecast": [
    {
      "month": "2026-08",
      "horizon": 1,
      "operating_inflow": 142500,
      "operating_outflow": 128200,
      "closing_cash_balance": 47600,
      "cash_after_debt_service": 7300,
      "lower": 35200,
      "upper": 60000
    }
  ]
}
```

## Example early-warning response

```json
{
  "enterprise_id": "RE-00124",
  "risk_score": 74,
  "risk_level": "High",
  "forecast_deficit": 38400,
  "debt_service_shortfall": 7200,
  "stress_month": "2026-10",
  "warning_lead_time_days": 61,
  "drivers": [
    {
      "feature": "Input-cost increase",
      "observed_value": 12,
      "unit": "percent",
      "contribution_points": 14,
      "explanation": "Feed costs increased by 12%, reducing projected operating surplus."
    }
  ]
}
```

---

# 11. Reusable UI Components

Build and standardise:

- KPI card
- Risk badge
- Forecast chart
- Forecast-range band
- Risk-driver card
- Enterprise table
- Geographic heatmap
- Scenario control
- Baseline-versus-scenario comparison
- Intervention timeline
- Case-status pill
- Data-quality indicator
- Officer assignment control
- Audit-log entry
- Offline-sync indicator
- Human-review-required label

---

# 12. System States

Every major screen should support:

- loading;
- empty state;
- missing-data warning;
- forecast unavailable;
- model error;
- offline;
- sync pending;
- stale data;
- human review required; and
- successful update.

Example:

```text
Forecast temporarily unavailable

The latest enterprise record has been saved.
The forecast will refresh when connectivity is restored.
```

---

# 13. Trust and Explainability Labels

Display:

```text
Model: GramPulse Cashflow v1.1
Forecast generated: 4 Aug 2026
Data updated: 2 Aug 2026
Forecast horizon: 6 months
Human review required
```

For the hackathon version, also include:

```text
Based on simulated prototype data
```

---

# 14. Implementation Sprints

## Sprint 1 — Data consistency

### Goal

Create one source of truth across all screens.

### Tasks

- Define shared TypeScript interfaces.
- Create a common enterprise API or state store.
- Replace conflicting hardcoded values.
- Connect alert IDs to enterprise IDs.
- Add model version and forecast timestamps.
- Verify all demo-enterprise values across screens.

### Definition of done

The same enterprise shows identical values everywhere.

---

## Sprint 2 — Functional intelligence loop

### Goal

Make the core workflow functional.

### Tasks

- Connect data entry to enterprise history.
- Refresh the forecast after record submission.
- Recalculate risk.
- Add a timeline event.
- Open the same enterprise from an alert.
- Connect the scenario simulator.
- Convert a scenario into an intervention case.

### Definition of done

A user can move from new data to a recorded intervention without leaving the connected workflow.

---

## Sprint 3 — Persona workflows

### Goal

Make each role operationally relevant.

### Tasks

- Configure role-based landing screens.
- Filter field-officer tasks by assignment.
- Add manager escalation and approval states.
- Complete the enterprise-owner mobile flow.
- Verify English, Hindi, and Marathi labels.
- Add offline and sync-pending states.

### Definition of done

Every persona has a clear first action after login.

---

## Sprint 4 — Post-disbursement monitoring

### Goal

Show how GramPulse remains active after credit deployment.

### Tasks

- Add a daily event feed.
- Add weekly signal changes.
- Add monthly forecast refresh.
- Show Green-to-Amber-to-High risk migration.
- Add 7/30/60/90-day follow-ups.
- Add intervention outcomes.
- Add active-case counts to the portfolio view.

### Definition of done

The demo shows the lifecycle from disbursement to intervention and monitoring.

---

## Sprint 5 — Demo and presentation readiness

### Goal

Freeze and rehearse the hackathon experience.

### Tasks

- Freeze the Shakti Poultry Farm demo case.
- Verify all numbers and charts.
- Add loading and error fallbacks.
- Add prototype disclaimers.
- Capture screenshots.
- Record a backup demo video.
- Rehearse the five-minute flow.
- Prepare static fallback responses in case the API fails.

### Definition of done

The full demo can be presented in five minutes without explanation gaps.

---

# 15. Live Demo Flow

## 1. Login as Regional Manager

Show:

- portfolio overview;
- active high-risk enterprises; and
- one new cluster alert.

## 2. Open the Risk Center

Show Shakti Poultry Farm as currently standard but forecast to deteriorate.

## 3. Open the Digital Twin

Explain:

- current financial health;
- six-month forecast;
- expected stress month;
- warning lead time; and
- top risk drivers.

## 4. Run a scenario

Apply an illustrative working-capital intervention and show:

- improved closing balance;
- lower cash deficit;
- reduced risk score; and
- High-to-Amber movement.

## 5. Create the intervention

Assign a field officer and schedule a visit.

## 6. Switch to Field Officer persona

Show:

- assigned case;
- visit due;
- offline-ready data entry; and
- follow-up task.

## 7. Return to monitoring

Show:

- case timeline;
- forecast refresh;
- intervention status; and
- portfolio visibility.

---

# 16. Presentation Structure

## Slide 1 — Problem

> Rural enterprise stress is identified after repayment failure.

## Slide 2 — Existing signals

Show:

- financial records;
- UPI aggregates;
- repayments;
- commodity prices;
- demand; and
- climate.

## Slide 3 — Solution

```text
Data → Forecast → Warning → Intervention → Monitoring
```

## Slide 4 — Product workflow

1. Enterprise profile
2. Six-month forecast
3. Early-warning alert
4. Scenario simulator
5. Intervention
6. Post-credit monitoring

## Slide 5 — Model

```text
CatBoost Direct Multi-Horizon
3 targets
6 horizons
18 models
```

## Slide 6 — Results

- 1M WAPE: 7.22%
- 3M WAPE: 9.66%
- 6M WAPE: 10.83%
- Stress recall: 95.33%
- Stress precision: 90.19%

Add:

> Evaluated on a privacy-preserving synthetic dataset.

## Slide 7 — Enterprise case

Show the selected enterprise and early warning.

## Slide 8 — Intervention

Show baseline versus intervention scenario.

## Slide 9 — Post-credit monitoring

```text
Daily events
Weekly signals
Monthly forecasts
90-day follow-up
```

## Slide 10 — NABARD value

- Earlier field intervention
- Stronger post-disbursement monitoring
- Cluster-level risk intelligence
- Improved thin-file visibility
- Measurable intervention outcomes
- Rural financial intelligence infrastructure

---

# 17. What Not to Build Now

Avoid spending remaining time on:

- additional dashboard screens;
- additional chart styles;
- new forecasting models;
- nationwide real-data coverage;
- complex Copilot autonomy;
- full real-time UPI integration;
- advanced custom reports; or
- production-grade authentication redesign.

The existing breadth is sufficient. The winning improvement is depth and continuity.

---

# 18. Final Definition of Done

The prototype is hackathon-ready when this journey works:

```text
Currently standard enterprise
        ↓
New financial record submitted
        ↓
Forecast recalculated
        ↓
Future cash deficit detected
        ↓
Risk drivers explained
        ↓
Intervention scenario tested
        ↓
Case assigned to field officer
        ↓
Follow-up scheduled
        ↓
Outcome visible in portfolio monitoring
```

The product should be presented as a closed loop:

> **Observe the enterprise → predict future stress → explain why → intervene early → measure the outcome.**
