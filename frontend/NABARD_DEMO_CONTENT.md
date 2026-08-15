# ZEYRO GRAMPULSE
## Complete Screen-by-Screen UI Flow Specification
**Product:** GramPulse — Ro-Powered Rural Enterprise Intelligence
**Version:** 1.0 · July 2026 · Internal**

---

## Product Overview

GramPulse is Zeyro's rural enterprise intelligence platform for NABARD field officers, regional managers, and enterprise owners. It surfaces cash flow forecasts, BFS-R scores, early warning alerts, climate risk signals, and intervention tracking across India's rural micro enterprise portfolio.

The product has 19 distinct screens across 6 functional areas: Authentication, Overview, Geography, Portfolio Intelligence, Enterprise Intelligence, Risk & Alerts, Market & Climate, Forecasting, Interventions, Credit, Reports, and Settings.

---

# SCREEN 1 — Login Screen

## Layout
Full-screen split. Left panel: brand + illustration. Right panel: login form.

## Left Panel
```
Zeyro GramPulse logo (top left)
  Icon: wheat/rural motif + Zeyro wordmark

Headline: "Welcome Rural"
Subline: "Ro-Powered Rural Enterprise Intelligence"

Illustration: Isometric rural town — fields, buildings,
              connectivity nodes, data flow lines
              Purple/indigo gradient background
```

## Right Panel — Login Form
```
"Welcome Back!"
"Sign in to your account"

Select Role [dropdown]
  Options:
  ● Regional Manager      ← default shown
  ● Field Officer
  ● Branch Manager
  ● NABARD Admin
  ● Enterprise Owner

Mobile Number
+91  [98765 43210          ]

[Send OTP]  ← primary purple button, full width

Enter OTP
[ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] [ 6 ]  ← 6-box OTP input

Didn't receive OTP? [Resend]
```

## UI Notes
- Background: deep purple/indigo (`#2D1B69`)
- Card: white, 24px radius, subtle shadow
- OTP boxes: 48px square, 1px border, focus state dark purple
- Role selector drives which dashboard loads post-login
- No password — OTP only, mobile-first auth

---

# SCREEN 2 — Overview Dashboard

## Layout
Three-column. Left: sidebar nav (240px). Center: main content (fluid). Top: global header.

## Global Header
```
[≡]  Zeyro GramPulse logo

Search: [Search enterprises, districts, officers...]    🔔  👤  ⚙

"Good Morning, Regional Manager"
"NABARD Maharashtra"
"30 May 2026 · Today"
```

## Left Sidebar Navigation
```
📊  Overview                  ← active
🏢  Portfolio
🔬  Enterprise Twin
📈  Analytics
⚠️  Risk Center
🗺️  Geography
🌾  Sectors
🌦️  Climate
💳  Credit
📅  Forecasts
🛠️  Interventions
🤖  AI Copilot
📄  Reports
⚙️  Settings
```

## Center — KPI Cards Row (4 cards)
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Total        │ │ Healthy      │ │ Watchlist    │ │ Critical     │
│ Enterprises  │ │              │ │              │ │              │
│              │ │              │ │              │ │              │
│  1,24,562    │ │    74%       │ │    18%       │ │     8%       │
│              │ │              │ │              │ │              │
│ +6.6% vs     │ │ +5% vs last  │ │ -2% vs last  │ │ -3% vs last  │
│ last month   │ │ month        │ │ month        │ │ month        │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

## Center — Second Row (3 cards)
```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Prediction       │ │ Expected NPA     │ │ Interventions    │
│ Accuracy         │ │                  │ │                  │
│                  │ │                  │ │                  │
│     92%          │ │     18%          │ │    4,321         │
│                  │ │                  │ │                  │
│ → vs last quarter│ │ → vs last quarter│ │ +12% vs last mo  │
└──────────────────┘ └──────────────────┘ └──────────────────┘

┌──────────────────┐
│ Avg. Health      │
│ Score            │
│                  │
│      76          │
│                  │
│ +7 pts vs last mo│
└──────────────────┘
```

## Center — Charts Row
```
LEFT CHART: Portfolio Health Distribution (donut)
  ● Healthy    74%
  ● Watchlist  18%
  ● Critical    8%
  Label: "74% Healthy"

RIGHT CHART: Portfolio Health Trend (line chart)
  X-axis: Aug Sep Oct Nov Dec Jan Feb Mar Apr May
  Y-axis: 0–100
  Single line trending upward with seasonal dip in Nov–Dec
  Label: "Last 12 Months"
```

## Right Panel — Today's AI Summary
```
TODAY'S AI SUMMARY

● Liquidity risk increasing in Nashik district (Dairy sector).

● Rainfall deficit may impact production in next 15 days.

● Working capital shortage expected in 11 days.

● Suggested intervention: Seasonal restructuring.
```

## UI Notes
- Sidebar: dark purple (`#1E1048`), white text, active item has left border accent
- Cards: white, subtle shadow, 12px radius
- Donut chart: green (healthy), amber (watchlist), red (critical)
- Line chart: purple line, gray grid
- AI Summary panel: light purple tinted background, bullet dots color-coded

---

# SCREEN 3 — Geography / Portfolio Map

## Layout
Full-width map view. Left: filter panel. Center: India choropleth map. Right: state detail panel.

## Filter Bar (top)
```
[India ▾]    [Health Score ▾]
```

## Map — India Choropleth
```
India map with states colour-coded by aggregate BFS-R health score:

  ■ 90–100   Dark green   (top performers)
  ■ 75–90    Medium green
  ■ 50–75    Amber
  ■ 25–50    Orange
  ■ 0–25     Red

Maharashtra highlighted / selected — showing popup:

  Maharashtra
  Avg. Health Score    72
  ↓ 3 pts vs last month

  Enterprises        18,562
  Healthy             2,341
  Critical            1,056
```

## Right Panel — State Detail (Maharashtra selected)
```
← Maharashtra  >  Nashik             🔔  👤

Nashik District Overview

Enterprises  Avg. Health Score    Watchlist   Critical
  2,341           65  ↓ 4 pts       412         156

Health Trend (Last 12 Months)
[Line chart — Nashik health score Aug–May, showing dip and recovery]

Sector Distribution (pie chart)
  ● Dairy        42%
  ● Poultry      19%
  ● Retail       18%
  ● Agriculture  12%
  ● Others        9%

Top 5 Villages by Risk
Village         Enterprises  Avg. Health  Critical  Trend
Pangalpur (B)       124           52         18      ↓
Yeola                98           55         12      →
Nandgaon             87           55         11      ↓
Sinnar               76           60          8      ↑
Dindori              65           62          6      ↑
```

## UI Notes
- Map uses D3 choropleth or similar
- Click state → right panel updates to state overview
- Click district → right panel updates to district overview
- Breadcrumb: India > Maharashtra > Nashik
- Color scale legend bottom-left of map
- Tooltip on hover shows enterprise count + health score

---

# SCREEN 4 — District Overview

## Layout
Continuation of Geography screen. Breadcrumb drills down from state to district.

## Header
```
← Maharashtra  >  Nashik

Nashik District Overview
```

## KPI Row
```
Enterprises   Avg. Health Score   Watchlist   Critical
  2,341            65  ↓ 4 pts      412         156
```

## Health Trend Chart
```
Line chart — last 12 months
X: Aug Sep Oct Nov Dec Jan Feb Mar Apr May
Y: Health score 0–100
Line shows decline Oct–Dec, recovery Jan–May
```

## Sector Distribution
```
Donut or pie chart:
  Dairy        42%
  Poultry      19%
  Retail       18%
  Agriculture  12%
  Others        9%
```

## Top 5 Villages by Risk Table
```
Village         Enterprises  Avg. Health  Critical  Trend
Pangalpur (B)       124           52         18      ↓
Yeola                98           55         12      →
Nandgaon             87           55         11      ↓
Sinnar               76           60          8      ↑
Dindori              65           62          6      ↑
```

## UI Notes
- Trend arrows: red ↓ for worsening, green ↑ for improving, gray → for stable
- Critical count in red text
- Row click → opens village-level drill-down (future state)

---

# SCREEN 5 — Portfolio Intelligence

## Layout
Left sidebar (same as Overview). Top: filter bar. Tabs: Summary | Health | Risk | Growth | Repayment.

## Filter Bar
```
State [All ▾]   District [All ▾]   Branch [All ▾]   Officer [All ▾]
This Month [▾]                                        [Export]
```

## Tabs
```
Summary  |  Health  |  Risk  |  Growth  |  Repayment
─────────
(Summary tab active)
```

## Summary Tab — KPI Cards
```
Total Loan Outstanding   Disbursed (This Month)   Repayment Rate   Delinquency Rate
  ₹1,856 Cr               ₹156 Cr                   91%               6.8%
  +12% vs last month      +18% vs last month         +4% vs last month  +1.2% vs last month
```

## Loan Outstanding Trend Chart
```
Area chart — ₹Cr on Y-axis
X: Jun Jul Aug Sep Oct Nov Dec Jan Feb Mar Apr May
Shaded area showing growth trend from ₹800Cr to ₹1,856Cr
```

## Top 5 Branches by Health
```
Rank  Branch          Health Score
1.    Nashik              80
2.    Ahmednagar          76
3.    Pune Rural          74
4.    Aurangabad          72
5.    Jalgaon             71
```

## UI Notes
- KPI cards: white, 12px radius, color-coded delta (green up, red up for bad metrics)
- Area chart: purple fill, subtle grid
- Branch rankings: simple numbered list, score in bold
- Filter bar sticky at top when scrolling

---

# SCREEN 6 — Enterprise Explorer

## Layout
Full-width table view with search, filters, and pagination.

## Header
```
← Enterprise Explorer                              [≡]  [👤]

[🔍 Search by enterprise name, village, or ID...]  [Filters]
```

## Table Columns
```
Enterprise | Village | District | Sector | Health | Risk | Loan Amt. | Officer
```

## Sample Rows
```
Enterprise          Village      District  Sector        Health  Risk    Loan Amt.   Officer
Ramesh Dairy        Borgaon      Nashik    Dairy           81    Low     ₹2,50,000   Priya S.
Shiv Poultry Farm   Borgaon      Nashik    Poultry         43    High    ₹1,80,000   Priya S.
Lakshmi Handicrafts Nimgon       Nashik    Handicrafts     62    Medium  ₹1,30,000   Amit P.
Ganesh Retail Store Nashik       Nashik    Retail          69    Low     ₹80,000     Priya S.
Sita Fishery        Pimgalpur    Nashik    Fishery         55    Medium  ₹1,10,000   Amit P.
Sunil Vegetables    Yeola        Nashik    Retail          70    Low     ₹80,000     Sandeep K.
Patil Agriculture   Dindori      Nashik    Agriculture     36    High    ₹1,50,000   Sandeep K.
Meena Tailoring     Sinnar       Nashik    Tailoring       64    Medium  ₹60,000     Amit P.
```

## Health Score Visual
```
Health column shows: score number + colored bar
  81 = green bar (long)
  43 = red bar (short)
  62 = amber bar (medium)
```

## Risk Pills
```
Low    = green pill
Medium = amber pill
High   = red pill
```

## Pagination
```
Showing 1 to 8 of 2,341
[ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] ... [ 293 ]  →
```

## UI Notes
- Row click → opens Enterprise Health Twin (Screen 7)
- Filter panel: sector, health range, risk level, district, officer
- Export button: CSV download of filtered view
- Search is real-time, debounced

---

# SCREEN 7 — Enterprise Health Twin

## Layout
Back button top left. Header with enterprise info. Tab bar. Center: score gauges + charts. Right: AI explanation panel.

## Header
```
← Back

[Avatar: R]  Ramesh Dairy                          Health Score
             Borgaon, Nashik  ·  Dairy  ·  Since 2017    [  81  ]
                                                        (circular gauge)
```

## Tab Bar
```
Overview | Financial | Operations | Market | Climate | Credit | Timeline
─────────
(Overview active)
```

## Score Gauges Row (6 gauges)
```
Financial   Health   Market   Climate   Credit   Growth
  80          75       82       70        85       78
```
Each gauge is a circular arc gauge, color-coded by score range.

## Cash Flow Forecast Chart (Next 3 Months)
```
"Cash Flow Forecast (Next 3 Months)"

Line chart with two lines:
  ─── Actual (solid purple)
  - - Forecast (dashed amber)

X: May  Jun  Jul  Aug
Y: ₹0.5L to ₹1.5L range

Both lines showing slight downward trend from May to Aug
Confidence band (shaded) around forecast line
```

## Right Panel — AI Explanation
```
AI Explanation

● Milk prices increased by 9%.

● Feed cost increased by 12%.

● Rainfall deficit may impact
  fodder availability.

● Inventory levels are optimal.

● Repayment probability: 96%
  Confidence 92%
```

## UI Notes
- Health score gauge: large circular arc, score in center, colored arc (green/amber/red)
- Six smaller gauges in a row for sub-scores
- Forecast chart: dual-line with confidence band
- AI Explanation panel: right side, white card, bullet points color-coded
- Tab bar: clicking Financial shows income/expense breakdown, Credit shows bureau data, etc.

---

# SCREEN 8 — Risk Center

## Layout
Left: filter panel. Main: risk table with enterprise list. Right sidebar (collapsed by default).

## Filter Bar
```
All Districts [▾]   All Sectors [▾]   All Risk Levels [▾]          [Export]

All  |  Critical  |  High  |  Medium  |  Low
─────────
```

## Risk Table Columns
```
Enterprise | District | Sector | Risk | Reason | Confidence | Suggested Action
```

## Sample Rows
```
Enterprise        District   Sector    Risk      Reason                    Conf.  Suggested Action
Milk Paradise     Nashik     Dairy     High      Rainfall Deficit          96%    Seasonal Restructure
Lakshmi Poultry   Nashik     Poultry   High      Feed Cost Spike           91%    Working Capital
Patil Agriculture Nashik     Agri.     Medium    Cash Deficit              88%    Inventory Support
Sai Retail Store  Sinnar     Retail    Medium    Repayment Delay           96%    EMI Reschedule
Meena Tailoring   Nashik     Tailoring Medium    Low Revenue               84%    Market Linkage
Raju Fishery      Dindori    Fishery   Low       Stable                    72%    Monitor
Sunil Vegetables  Yeola      Retail    Low       Stable                    70%    Monitor
```

## Risk Pills
```
High   = red filled pill
Medium = amber filled pill
Low    = green filled pill
```

## Pagination
```
Showing 1 to 7 of 412
[View All →]
```

## UI Notes
- Default sort: Critical first, then High, then Medium, then Low
- Row click → opens Enterprise Health Twin for that enterprise
- Confidence score in muted text
- Suggested Action column: actionable text, not just a label
- Export: CSV with all filtered rows

---

# SCREEN 9 — Sector Dashboard

## Layout
Grid of sector cards. Each card shows avg health score, trend sparkline, and enterprise count.

## Header
```
← Sector Dashboard                    This Quarter [▾]
```

## Sector Cards Grid (2×3 or 3×2)
```
┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│  Dairy             │  │  Poultry           │  │  Retail            │
│  Avg. Health       │  │  Avg. Health       │  │  Avg. Health       │
│       78           │  │       43           │  │       71           │
│  [sparkline ↑]     │  │  [sparkline ↓ ↓ ↓] │  │  [sparkline →]     │
│  3 ↓ alerts        │  │                    │  │                    │
└────────────────────┘  └────────────────────┘  └────────────────────┘

┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│  Agriculture       │  │  Fishery           │  │  Food Processing   │
│  Avg. Health       │  │  Avg. Health       │  │  Avg. Health       │
│       68           │  │       66           │  │       74           │
│  [sparkline →]     │  │  [sparkline ↑]     │  │  [sparkline ↑]     │
└────────────────────┘  └────────────────────┘  └────────────────────┘
```

## Each Card Contains
```
Sector name (bold, 16px)
Avg. Health (large number, 36px, color-coded)
Sparkline trend (last 6 months, 80px wide)
Alert count (red badge if > 0)
Enterprise count (muted, below score)
```

## UI Notes
- Card color: white with subtle left border matching health tier
- Poultry showing red/critical state — darker card treatment
- Click card → filters Enterprise Explorer to that sector
- "This Quarter" dropdown: Last Month / This Quarter / Last Quarter / YTD

---

# SCREEN 10 — Climate Intelligence

## Layout
Left: filter + map. Right: climate data panels.

## Header
```
← Climate Intelligence

Rainfall Anomaly [▾]          Next 16 Days [▾]
```

## Map Panel
```
Maharashtra district-level rainfall anomaly map

Color legend:
  ■ High Surplus   (deep blue)
  ■ Normal         (light blue)
  ■ Deficit        (amber)
  ■ High Deficit   (red)

Impacted Enterprises  2,857
High Risk (due to Rainfall Deficit): 1,043
Moderate Risk:                       1,614
```

## UI Notes
- Map: choropleth at district level
- Toggle: Rainfall Anomaly / Temperature / Flood Risk / Drought Index
- Time range: Next 16 Days / Next Month / Seasonal (3 months)
- Hover on district: shows enterprise count + risk level + primary crop/sector affected
- Data source: IMD integration

---

# SCREEN 11 — Market Intelligence

## Layout
Two panels. Left: commodity price table. Right: "This Month" summary.

## Header
```
← Market Intelligence                              [🔄]  [📋]
```

## Commodities Table
```
Commodity              Current Price   Change   Trend   Impact on Enterprises
Milk (per Ltr)         ₹42.5           +9%      ↑       Positive
Cattle Feed (per kg)   ₹28.0           +12%     ↑       Negative
Rice (per qt)          ₹36.0           -3%      ↓       Positive
Cotton (per kg)        ₹68.0           +5%      ↑       Positive
Turnip (per kg)        ₹148.0          +13%     ↑       Negative
Vegetables (Index)     ₹103.0          -2%      ↓       Neutral
```

## Impact Color Coding
```
Positive  = green text
Negative  = red text
Neutral   = gray text
```

## This Month Panel (right)
```
THIS MONTH

[Summary card showing top commodity movements and their enterprise impact this month]
```

## UI Notes
- Table sortable by any column
- Change column: green for price drop (benefit to buyer), red for price rise (cost to enterprise) — context-dependent
- Impact column considers whether enterprise is buyer or seller of that commodity
- Trend arrow: up/down with color
- Refresh button: pulls latest prices from AGMARKNET / commodity exchange feeds

---

# SCREEN 12 — Forecast Center

## Layout
Top: scenario selector. Center: health forecast chart + portfolio forecast. Right: NPA district breakdown.

## Header
```
← Forecast Center

Base Scenario [▾]     [←] Reset Horizon     Next 80 Days [▾]
```

## Top KPI Row
```
Healthy          At Risk         Repayment Rate   NPA
85,421           22,142 Cr       91%              6.4%
↓ 5.99%          +18%            +9%              -9.9%
```

## Portfolio Health Forecast Chart
```
Line chart — Jan to Apr (4 months)
X: Jan  Feb  Mar  Apr
Y: ₹Cr total loan outstanding, split by health tier

Bands:
  Green band (healthy)
  Amber band (at risk)
  Red band (NPA risk)

Legend: Jan/Feb historical, Mar/Apr forecast (dashed)
```

## NPA by District (right panel)
```
NPA BY DISTRICT
Nashik       5.2%
Ahmednagar   5.8%
Pune Rural   4.8%
Jalgaon      7.3%
Aurangabad   6.9%
```

## UI Notes
- Scenario dropdown: Base / Optimistic / Pessimistic / Stress Test
- "Reset Horizon" clears custom date range back to default
- NPA by district: horizontal bar chart, red bars, sorted by NPA rate
- Forecast lines are dashed to distinguish from historical
- Confidence band shown around forecast lines

---

# SCREEN 13 — Interventions Dashboard

## Layout
Top: summary KPIs. Center: intervention type table. Right: NPA by district.

## Header
```
← Interventions Dashboard                          [Export]

All Types [▾]     This Month [▾]
```

## KPI Row
```
Total Interventions   Accepted    In Progress   Completed
    4,321              3,542          612          2,930
    +19%               +6.82%        +5.16%        +198%
```

## Top Interventions Table
```
Type                  Accepted   In Progress   Completed   Success Rate
Seasonal Restructure    1,245        156         1,089         87%
Working Capital Support 1,100        180           920         83%
Market Linkage           168          62           478         84%
Insurance                320          86           402        -76%  ⚠
```

## UI Notes
- Success rate column: green if > 80%, amber if 60–80%, red if < 60%
- Insurance showing -76% success rate with warning indicator
- Export: full intervention log as CSV
- Click row → filtered view of that intervention type with enterprise list

---

# SCREEN 14 — AI Copilot

## Layout
Chat interface. Left: sidebar (same nav). Center: chat thread. Bottom: input bar.

## Chat Thread
```
[AI bubble — purple background]
Why is a Nashik district becoming risky?

[Response bubble — white card]
Nashik district is showing increased risk due to:

• Rainfall deficit of 32% below normal.
• Feed prices increased by 12%.
• Liquidity stress in Dairy and Poultry sectors.
• 184 enterprises likely to face cash deficit
  within 15 days.

Recommended action:
• Seasonal restructuring for Dairy farmers.
• Working capital support for Poultry farms.

[Suggested questions row]
[Why is Nashik district becoming risky?]
[Show critical enterprises]
[Generate intervention plan]
```

## Input Bar
```
[ Ask anything...                              ] [→ Send]
```

## UI Notes
- AI responses are structured: headline → bullet causes → recommended actions
- Suggested follow-up questions appear after each response
- Copilot context is aware of current filters (district, sector, time period)
- Chat history persists within session
- "Ask anything" placeholder — supports natural language queries about any enterprise, district, sector, or metric

---

# SCREEN 15 — Reports

## Layout
Three-column card grid. Each card is a report type with a [Generate] button.

## Report Cards
```
┌─────────────────────────┐  ┌─────────────────────────┐
│ 📊 Portfolio Summary    │  │ 🗺️ District Performance  │
│                         │  │                         │
│ Complete portfolio       │  │ District-level analysis │
│ health, loans,           │  │ and health trends.      │
│ repayments and risk.     │  │                         │
│                         │  │                         │
│         [Generate]      │  │         [Generate]      │
└─────────────────────────┘  └─────────────────────────┘

┌─────────────────────────┐  ┌─────────────────────────┐
│ 🌾 Sector Performance   │  │ 👤 Officer Performance  │
│                         │  │                         │
│ Sector-wise performance │  │ Officer productivity,   │
│ and risk trends.        │  │ interventions, and      │
│                         │  │ growth insights.        │
│         [Generate]      │  │         [Generate]      │
└─────────────────────────┘  └─────────────────────────┘
```

## UI Notes
- [Generate] triggers AI report generation — produces downloadable PDF
- Report cards can be expanded to show filter options before generating
- Reports include: date range, district/sector filters, comparison period
- Generated reports stored in report history (accessible via Reports nav)

---

# SCREEN 16 — Alerts Center

## Layout
Top: filter tabs. Center: alert feed sorted by severity. Each alert is a card row.

## Filter Tabs
```
All  |  Critical  |  High  |  Medium  |  Low     [Mark all as read]
─────────
```

## Alert Cards
```
[🔴]  Cash Deficit Alert                          10:32 AM
      Nashik district rainfall 32% below normal.

[🟠]  Milk Price Drop                            10:15 AM
      Milk price decreased 9% in the last 24 hours.

[🔴]  Cash Deficit Risk                          08:45 AM
      High risk cluster detected in Nashik block.

[🟠]  Repayment Delay Increased                  Yesterday
      Avg. repayment delay increased by 3%.
```

## Alert Card Structure
```
[Severity icon]  [Alert title]             [Timestamp]
                 [Alert description — one line]
                 [→ View affected enterprises]  [✓ Mark as read]
```

## UI Notes
- Critical alerts: red left border, red icon
- High alerts: amber left border, amber icon
- Unread alerts: slightly darker background
- Click alert → navigates to affected enterprises filtered in Enterprise Explorer
- "Mark all as read" clears unread state for current filter
- Bell icon in header shows unread count

---

# SCREEN 17 — Credit Dashboard

## Layout
Left: portfolio-level credit KPIs. Right: NPA by district breakdown.

## Header
```
← Credit Dashboard                    This Quarter [▾]
```

## KPI Row
```
Total Disbursed   Outstanding     Repayment Rate   NPA
  ₹456 Cr         ₹1,856 Cr          91%           6.8%
  +5.1%           +13%               -3%           +1.3%
```

## Credit Outstanding Trend Chart
```
Area chart — ₹Cr by month
X: Jun Jul Aug Sep Oct Nov Dec Jan Feb Mar Apr May
Stacked area: Healthy / At Risk / NPA bands
```

## NPA by District (right panel)
```
NPA BY DISTRICT
Nashik       5.2%
Ahmednagar   5.8%
Pune Rural   4.8%
Jalgaon      7.3%
Aurangabad   6.9%
```

## UI Notes
- NPA delta shown in red if worsening
- Trend chart: same color coding as health tiers (green/amber/red)
- District NPA panel: horizontal bars, red fill, sorted by NPA rate
- Click district → filters to that district in Enterprise Explorer

---

# SCREEN 18 — Settings

## Layout
Left: settings navigation list. Right: settings detail panel.

## Settings Navigation
```
👤  User Profile
    Update your profile information

👥  Users & Roles
    Manage users and permissions

🔔  Notification Preferences
    Manage alerts and notifications

🔌  Data & Integrations
    Manage data sources and integrations

🔒  Security
    Password, 2FA and security settings
```

## UI Notes
- Active setting highlighted with left border accent
- Each setting navigates to a detail panel on the right
- User Profile: name, mobile, region, role, join date (see Screen 19)
- Users & Roles: add/remove officers, assign districts, set permissions
- Notification Preferences: toggle each alert type, frequency, delivery channel (in-app / SMS / email)
- Data & Integrations: AA connection status, AGMARKNET status, IMD status, bureau status

---

# SCREEN 19 — My Profile

## Layout
Right panel (slide-over from Settings). Profile card with user details.

## Profile Card
```
[Avatar photo — Rohit Deshmukh]

Rohit Deshmukh
Regional Manager · NABARD Maharashtra

Email      rohit.deshmukh@nabard.org
Mobile     +91 98765 43210
Region     Maharashtra
Joined     12 Jan 2022

[Talk Profile]  ← AI-assisted profile update / summary button
```

## UI Notes
- Avatar: circular photo, 80px
- All fields editable inline on click
- "Talk Profile" — opens AI Copilot in context of the user's portfolio
- Back arrow returns to Settings main panel

---

# Complete Screen Index

| # | Screen | Primary User | Key Action |
|---|---|---|---|
| 1 | Login | All | Role-based OTP login |
| 2 | Overview Dashboard | Regional Manager | Portfolio health at a glance |
| 3 | Geography / Portfolio Map | Regional Manager | State-level drill-down |
| 4 | District Overview | Regional Manager | District-level metrics |
| 5 | Portfolio Intelligence | Branch Manager | Loan portfolio analysis |
| 6 | Enterprise Explorer | Field Officer | Find and filter enterprises |
| 7 | Enterprise Health Twin | Field Officer | Individual enterprise deep-dive |
| 8 | Risk Center | Field Officer / RM | Risk-ranked enterprise list |
| 9 | Sector Dashboard | Regional Manager | Sector-wise health comparison |
| 10 | Climate Intelligence | Regional Manager | Rainfall and climate risk map |
| 11 | Market Intelligence | Field Officer / RM | Commodity price tracking |
| 12 | Forecast Center | Regional Manager | 80-day portfolio forecast |
| 13 | Interventions Dashboard | Branch Manager | Intervention tracking |
| 14 | AI Copilot | All | Natural language Q&A |
| 15 | Reports | Regional Manager | Generate and download reports |
| 16 | Alerts Center | All | Risk alert feed |
| 17 | Credit Dashboard | Branch Manager | Credit health and NPA tracking |
| 18 | Settings | Admin | Platform configuration |
| 19 | My Profile | All | Personal profile management |

---

# Navigation Flow

```
Login (1)
    ↓ (role: Regional Manager)
Overview Dashboard (2)
    ├── Geography Map (3)
    │       └── District Overview (4)
    ├── Portfolio Intelligence (5)
    ├── Enterprise Explorer (6)
    │       └── Enterprise Health Twin (7)
    ├── Risk Center (8)
    ├── Sector Dashboard (9)
    ├── Climate Intelligence (10)
    ├── Market Intelligence (11)
    ├── Forecast Center (12)
    ├── Interventions Dashboard (13)
    ├── AI Copilot (14)
    ├── Reports (15)
    ├── Alerts Center (16)
    ├── Credit Dashboard (17)
    ├── Settings (18)
    │       └── My Profile (19)
    └── [All screens] → Enterprise Health Twin (7) via row click
```

---

*Zeyro GramPulse · UI Flow Specification · v1.0 · July 2026 · Internal*