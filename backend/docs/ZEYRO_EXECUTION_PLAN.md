# Zeyro B2B — Execution Plan
### From Zero to Working Demo in 7 Days. Then to Production.

**Arthazeyro Technologies Pvt. Ltd. | Internal**
Owner: Swaraj Chouriwar · Version 2.0 · June 2026
**Team: Swaraj Chouriwar (Full Technical) · Abhimanyu (Semi-Technical / Non-Dev)**

---

## Read This First

Two people. Seven days. One working demo.

Every task in Part 1 is assigned to exactly one person.
No task is shared unless explicitly stated.
When in doubt about who owns something: Swaraj builds, Abhimanyu ships.

**Swaraj's rule this week:** You are not the CEO this week. You are the only engineer.
Every hour spent on calls, strategy, or planning that isn't in this document
is an hour the demo doesn't get built. Protect your build time.

**Abhimanyu's rule this week:** You are not a developer but you have real leverage here.
Partner research, demo script, documentation, deployment config, and outreach
are all yours. None of it requires writing Python. All of it determines
whether the demo actually lands with an NBFC.

---

# PART 1 — THE 7-DAY SPRINT

## What "Done" Looks Like on Day 7

A partner calls:
```
POST https://demo.zeyro.in/b2b/v1/assessments
Authorization: Bearer {jwt}
{
  "user_mobile": "+919876543210",
  "products": ["bfs", "fraud", "atp"],
  "consent_id": "demo-consent-001",
  "context": { "loan_amount_inr": 50000, "loan_tenor_days": 180 }
}
```

And gets back in < 3 seconds:
```json
{
  "assessment_id": "uuid",
  "status": "COMPLETE",
  "bfs": {
    "score": 712, "band": "GOOD", "confidence": "HIGH",
    "adverse_action_reasons": [
      {"code": "AA01", "description": "High existing debt-to-income ratio"}
    ]
  },
  "rps":   { "probability": 0.81, "label": "HIGH" },
  "atp":   { "monthly_surplus_inr": 14200, "max_recommended_emi_inr": 7100,
             "ratio_at_requested_emi": 0.38 },
  "fraud": { "fraud_risk_label": "CLEAR", "stacking_detected": false },
  "risk_narrative": "The applicant demonstrates stable income patterns..."
}
```

BFS is a weighted scorecard — not ML. Data is synthetic fixtures.
Narrative is real Claude API. It looks and behaves exactly like production.
The internals swap out later. **Ship first. Swap second.**

---

## The Stack for the Demo

```
demo/
├── main.py          ← FastAPI app, all routes
├── scoring.py       ← BFS scorecard, RPS heuristic, ATP formula
├── fraud.py         ← Rule-based fraud signals
├── narrative.py     ← Claude API call for risk narrative
├── fixtures.py      ← 5 synthetic demo users
├── auth.py          ← Hardcoded API key + JWT
├── models.py        ← Pydantic schemas
├── schema.sql       ← 2-table PostgreSQL schema
├── requirements.txt
└── docker-compose.yml
```

One Python service. One `uvicorn main:app` command. Railway for hosting.

---

## The 5 Demo Personas

These are the demo. Know them. Every API call maps to one of these stories.

```
PERSONA 1 — "Rahul"      Salaried SWE, Mumbai        BFS ~740  APPROVE path
PERSONA 2 — "Priya"      Freelance designer, Blr      BFS ~620  REVIEW path
PERSONA 3 — "Mohammed"   MSME owner, Hyderabad        BFS ~680  APPROVE (MSME path)
PERSONA 4 — "Sunita"     Thin file, Tier-2 city       BFS ~520  LOW confidence path
PERSONA 5 — "Vikram"     Loan stacking detected       BFS ~470  DECLINE + FRAUD path
```

---

## DAY-BY-DAY PLAN

---

### DAY 1 — Monday
**Theme: Repo foundations + partner research starts in parallel**

---

#### SWARAJ — Day 1
**Goal:** Repo initialized. API shell running. All routes return something.
**Time:** 7 hours

```
09:00–10:00   Initialize repo and install dependencies
              git init zeyro-b2b-demo && cd zeyro-b2b-demo
              python -m venv .venv && source .venv/bin/activate
              pip install fastapi uvicorn pydantic anthropic python-jose
                          python-dotenv psycopg2-binary
              touch main.py scoring.py fraud.py narrative.py
                    fixtures.py auth.py models.py schema.sql

10:00–11:30   Write models.py — all Pydantic schemas
              AssessmentRequest:
                user_mobile: str
                products: list[str]
                consent_id: str
                context: dict  (loan_amount_inr, loan_tenor_days)

              AssessmentResponse:
                assessment_id: str
                status: str
                bfs: BFSOutput | None
                rps: RPSOutput | None
                atp: ATPOutput | None
                fraud: FraudOutput | None
                risk_narrative: str | None

              BFSOutput:
                score: int           # 300–900
                band: str            # EXCELLENT|GOOD|FAIR|POOR|VERY_POOR
                confidence: str      # HIGH|MEDIUM|LOW
                version: str
                adverse_action_reasons: list[AdverseAction]
                thin_file: bool

              RPSOutput:
                probability: float
                label: str           # HIGH|MEDIUM|LOW

              ATPOutput:
                monthly_surplus_inr: float
                max_recommended_emi_inr: float
                ratio_at_requested_emi: float
                income_haircut_applied: bool

              FraudOutput:
                fraud_risk_label: str
                fraud_probability: float
                stacking_detected: bool
                fraud_signals: list[FraudSignal]
                manual_review_recommended: bool

              AdverseAction: code: str, description: str
              FraudSignal: signal_type, severity, description

11:30–13:00   Write auth.py — API key validation + JWT
              API_KEY = "demo_key_zeyro_001"  # hardcoded for demo
              JWT secret = "zeyro_demo_secret_change_in_prod"
              POST /v1/auth/token:
                receives {"api_key": "..."}
                validates against hardcoded key
                returns {"token": jwt, "expires_in": 3600}
              get_current_partner() dependency:
                extracts JWT from Authorization: Bearer header
                raises 401 if missing or invalid
                returns partner_id from JWT payload

13:00–14:00   BREAK

14:00–15:30   Write main.py — FastAPI shell, all 4 routes stubbed
              GET  /health
                → {"status": "ok", "service": "zeyro-b2b-demo", "version": "1.0.0"}
              POST /v1/auth/token
                → calls auth.py
              POST /v1/assessments
                → validates JWT
                → validates request body
                → returns {"assessment_id": str(uuid4()), "status": "PROCESSING"}
                  (full logic comes Day 3–4; today just the shell)
              GET  /v1/assessments/{id}
                → returns stub {"status": "COMPLETE"} for any id

15:30–17:00   Write docker-compose.yml + schema.sql + .env.example
              docker-compose.yml:
                services:
                  api:
                    build: .
                    ports: ["8000:8000"]
                    env_file: .env
                    depends_on: [postgres]
                  postgres:
                    image: postgres:16-alpine
                    environment:
                      POSTGRES_DB: zeyro_demo
                      POSTGRES_USER: zeyro
                      POSTGRES_PASSWORD: secret
                    ports: ["5432:5432"]

              schema.sql:
                CREATE TABLE IF NOT EXISTS assessments (
                  id UUID PRIMARY KEY,
                  partner_id TEXT NOT NULL,
                  user_ref TEXT NOT NULL,
                  status TEXT NOT NULL DEFAULT 'PROCESSING',
                  request_json JSONB,
                  response_json JSONB,
                  created_at TIMESTAMPTZ DEFAULT NOW()
                );
                CREATE TABLE IF NOT EXISTS audit_events (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  assessment_id UUID,
                  event_type TEXT,
                  payload JSONB,
                  created_at TIMESTAMPTZ DEFAULT NOW()
                );

              .env.example:
                ANTHROPIC_API_KEY=sk-ant-...
                POSTGRES_URL=postgres://zeyro:secret@localhost:5432/zeyro_demo
                JWT_SECRET=zeyro_demo_secret_change_in_prod
                DEMO_API_KEY=demo_key_zeyro_001
                ENV=development

              docker compose up -d
              curl http://localhost:8000/health → {"status": "ok"}
```

**Day 1 done condition:** All 4 routes return 200. Auth returns a JWT.
Malformed request to /v1/assessments returns 422.

---

#### ABHIMANYU — Day 1
**Goal:** 3 warm NBFC targets identified and profiled. Demo call framing drafted.
**Time:** 5 hours

```
09:00–10:30   Research 3 NBFC targets from your FIRSTWINGS contact list
              For each NBFC, answer:
                1. Name + size (AUM / loan book size)
                2. Who is the risk head or CTO? (LinkedIn)
                3. Are they using any alternative data today?
                   (Perfios, Karza, Finbox, Crif — check their job postings)
                4. What loan products do they run?
                   (Personal loan, MSME, consumer durables, gold)
                5. Do they have a technical team that can integrate an API?
              Output: A Google Doc with 3 NBFC profiles, 1 page each.

10:30–12:00   Draft the demo outreach message
              Target: NBFC's risk head or CTO, not the business head.
              Tone: peer-to-peer, technical, no pitch language.
              Length: 5 sentences maximum.

              Template:
              "Hi [Name], I'm Abhimanyu from Zeyro — we're building
              India's behavioral credit intelligence API on UPI and AA rails.
              We're running a closed early access program with 2–3 NBFCs
              this month — takes ~2 hours to integrate, returns BFS score,
              repayment propensity, and an AI-written risk narrative per assessment.
              Would a 20-min technical walkthrough make sense this week?"

              Draft 3 versions (one per target). Adjust language based on
              whether target is technical (CTO) or risk (Chief Risk Officer).

12:00–13:00   BREAK

13:00–15:00   Set up Postman workspace for the demo
              Create Postman collection: "Zeyro B2B Demo"
              Add 4 folders:
                1. Auth — POST /v1/auth/token
                2. Assessments — POST /v1/assessments, GET /v1/assessments/{id}
                3. Demo Personas — 5 pre-filled requests, one per persona
                4. Error Cases — invalid key, missing field, unknown mobile

              Use environment variables:
                {{base_url}} = http://localhost:8000 (local) / demo URL (production)
                {{api_key}}  = demo_key_zeyro_001
                {{token}}    = (auto-filled after auth call)

              Add a pre-request script to Auth folder:
                auto-saves token to environment after successful /auth/token call
                so all subsequent calls use the token automatically

15:00–17:00   Set up Railway account + project
              railway.app → sign up with GitHub
              Create new project: "zeyro-b2b-demo"
              Add PostgreSQL plugin to the project
              Note down the DATABASE_URL Railway provides
              Do NOT deploy yet — Swaraj deploys on Day 5
              Just have the project ready and share credentials with Swaraj
```

**Day 1 done condition:** 3 NBFC profiles in Google Doc.
3 outreach messages drafted (not sent yet — hold until Day 7).
Postman workspace exists with correct folder structure.
Railway project created with PostgreSQL provisioned.

---

### DAY 2 — Tuesday
**Theme: Feature data + scoring personas (Swaraj) · Competitor research + integration guide (Abhimanyu)**

---

#### SWARAJ — Day 2
**Goal:** All 5 persona feature vectors coded. Fixtures wire into the API.
**Time:** 7 hours

```
09:00–11:00   Write fixtures.py — all 5 persona feature vectors

              DEMO_USERS = {
                "+919876543210": RAHUL_FV,      # approve
                "+919876543211": PRIYA_FV,      # review
                "+919876543212": MOHAMMED_FV,   # approve / MSME
                "+919876543213": SUNITA_FV,     # thin file
                "+919876543214": VIKRAM_FV,     # fraud / decline
              }

              RAHUL_FV = {
                "income.avg_monthly_credit_inr":          85000,
                "income.income_regularity_score":         0.91,
                "income.income_trend_90d":                0.12,
                "income.credit_to_debit_ratio":           1.18,
                "expense.fixed_obligation_inr":           22000,
                "expense.fixed_obligation_ratio":         0.26,
                "expense.discretionary_spend_ratio":      0.22,
                "emi.count_active":                       1,
                "emi.total_monthly_exposure_inr":         12000,
                "emi.emi_to_income_ratio":                0.28,
                "emi.missed_emi_signals_count":           0,
                "emi.bnpl_activity_detected":             0,
                "emi.loan_stacking_signals":              0,
                "cashflow.end_of_month_stress_score":     0.12,
                "cashflow.avg_days_to_near_zero":         21.4,
                "cashflow.min_balance_30d_inr":           8200,
                "cashflow.balance_trend_slope":           0.04,
                "savings.recurring_sip_detected":         1,
                "savings.savings_to_income_ratio":        0.15,
                "behavior.unique_merchant_count_30d":     28,
                "behavior.round_amount_transfer_ratio":   0.12,
                "network.unique_p2p_recipients_30d":      6,
                "network.p2p_transfer_ratio":             0.08,
                "network.new_vpa_ratio_30d":              0.09,
                "volatility.spend_coefficient_variation_30d": 0.21,
                "volatility.sudden_behavior_change_score": 0.08,
                "temporal.active_days_ratio_30d":         0.87,
                "temporal.longest_inactive_streak_days":  3,
                "quality.thin_file_flag":                 0,
                "quality.data_coverage_days":             87,
                "quality.source_diversity_code":          1,  # UPI+AA
                "quality.data_gap_count":                 0,
              }

              PRIYA_FV = {
                "income.avg_monthly_credit_inr":          52000,
                "income.income_regularity_score":         0.51,  # irregular
                "income.income_trend_90d":                0.08,
                "expense.fixed_obligation_inr":           18000,
                "emi.emi_to_income_ratio":                0.41,
                "emi.missed_emi_signals_count":           1,
                "cashflow.end_of_month_stress_score":     0.51,
                "cashflow.avg_days_to_near_zero":         9.2,
                "savings.savings_to_income_ratio":        0.04,
                "volatility.sudden_behavior_change_score": 0.24,
                "network.new_vpa_ratio_30d":              0.18,
                "quality.thin_file_flag":                 0,
                "quality.data_coverage_days":             74,
                "quality.source_diversity_code":          0,  # UPI_ONLY
                "quality.data_gap_count":                 1,
                # fill remaining keys with neutral values
              }

              MOHAMMED_FV = {
                "income.avg_monthly_credit_inr":          120000,
                "income.income_regularity_score":         0.68,
                "income.primary_income_source_type":      "BUSINESS",
                "behavior.unique_merchant_count_30d":     48,
                "network.p2p_transfer_ratio":             0.31,
                "savings.recurring_sip_detected":         1,
                "emi.emi_to_income_ratio":                0.22,
                "cashflow.end_of_month_stress_score":     0.19,
                "quality.thin_file_flag":                 0,
                "quality.data_coverage_days":             83,
                "quality.source_diversity_code":          1,
                # fill remaining keys
              }

              SUNITA_FV = {
                "quality.thin_file_flag":                 1,   # ← KEY
                "quality.data_coverage_days":             34,
                "income.avg_monthly_credit_inr":          18000,
                "income.income_regularity_score":         0.62,
                "emi.emi_to_income_ratio":                0.33,
                "cashflow.end_of_month_stress_score":     0.44,
                "savings.savings_to_income_ratio":        0.02,
                "quality.source_diversity_code":          0,
                "quality.data_gap_count":                 2,
                # fill remaining keys
              }

              VIKRAM_FV = {
                "emi.loan_stacking_signals":              1,   # ← KEY
                "network.new_vpa_ratio_30d":              0.68,
                "volatility.sudden_behavior_change_score": 0.82,
                "behavior.round_amount_transfer_ratio":   0.71,
                "income.avg_monthly_credit_inr":          45000,
                "emi.emi_to_income_ratio":                0.58,
                "cashflow.end_of_month_stress_score":     0.67,
                "savings.savings_to_income_ratio":        0.01,
                "quality.thin_file_flag":                 0,
                "quality.data_coverage_days":             61,
                "quality.source_diversity_code":          0,
              }

              Also write:
              def get_feature_vector(mobile: str) -> dict | None:
                  user_ref = hashlib.sha256(mobile.encode()).hexdigest()[:16]
                  return DEMO_USERS.get(mobile)

              def get_mock_consent(user_ref: str) -> dict:
                  return {"consent_id": f"demo-consent-{user_ref[:8]}",
                          "status": "ACTIVE", "expiry": "2026-12-31"}

11:00–12:00   Wire fixtures into main.py assessment endpoint
              POST /v1/assessments now:
                1. validates JWT (already done Day 1)
                2. fv = get_feature_vector(request.user_mobile)
                3. if not fv: raise 404, detail="DEMO_USER_NOT_FOUND"
                4. assessment_id = str(uuid4())
                5. store in DB: INSERT INTO assessments...
                6. return {"assessment_id": assessment_id, "status": "PROCESSING"}

12:00–13:00   BREAK

13:00–15:00   Pre-validate all 5 personas manually BEFORE writing scoring code
              This prevents the Day 3 weight calibration spiral.

              For each persona, manually calculate expected BFS:
              Base score: 600

              Weights to apply mentally:
                income_regularity_score × 20
                income_trend_90d × 10 (if positive)
                emi_to_income_ratio × -80
                missed_emi × -15
                loan_stacking × -25
                stress_score × -40
                avg_days_to_zero penalty: if < 20 days: -(20-days)/20 × 20
                savings_ratio × 30
                behavior_change × -20
                thin_file: -60

              Expected outputs:
                Rahul:    ~710–740  (target: 712 in demo)
                Priya:    ~600–635
                Mohammed: ~665–695
                Sunita:   ~490–530  (thin file penalty hits)
                Vikram:   ~455–495  (stacking + behavior change compound)

              If manual calc doesn't produce expected ranges: fix weights here.
              Do not touch scoring.py until these manual checks pass.

15:00–17:00   Connect PostgreSQL in main.py
              import psycopg2
              conn = psycopg2.connect(os.getenv("POSTGRES_URL"))

              On startup: run schema.sql (CREATE TABLE IF NOT EXISTS)
              On POST /v1/assessments: INSERT assessment record (status=PROCESSING)
              On GET /v1/assessments/{id}: SELECT from assessments
```

**Day 2 done condition:** All 5 personas load from fixtures.
POST /v1/assessments with Rahul's number: 202 + assessment_id stored in DB.
Manual score calculations match expected ranges before any code is written.

---

#### ABHIMANYU — Day 2
**Goal:** Integration guide drafted. Competitor analysis done. Postman personas pre-filled.
**Time:** 5 hours

```
09:00–11:00   Write the Partner Integration Guide (Google Doc, 3 pages max)
              This is what you send to an NBFC's technical team after the demo call.
              Structure:

              Page 1: Overview
                What Zeyro B2B is (2 paragraphs)
                What you get: BFS score, RPS label, ATP sizing, fraud signals, narrative
                What we need from you: API call per assessment, outcome labels monthly

              Page 2: Quick Start (step by step, no code required — just the sequence)
                Step 1: Get API key (email us)
                Step 2: Initiate AA consent for user (one API call)
                Step 3: Wait for user to approve on their phone
                Step 4: Submit assessment request (one API call)
                Step 5: Receive score in < 3 seconds
                Step 6: Submit outcome after 90 days (one API call)

              Page 3: Response field glossary
                BFS score: what 300-900 means, what each band means
                Adverse action reasons: what they are and why they're RBI-required
                RPS: what HIGH/MEDIUM/LOW means for collections
                ATP: how to read ratio_at_requested_emi
                Fraud signals: what each signal type means

              Tone: written for a risk analyst who has never used an API.
              No jargon. No acronyms without explanation.

11:00–12:00   Research 3 competitors, answer: what are they missing?
              Perfios: bank statement analysis, bureau-linked, no UPI behavioral layer
              Karza: KYC + bureau enrichment, no real-time behavioral scoring
              Finbox: DSA network + credit data, not an intelligence API
              Experian India: bureau score, no alternative data
              
              For each: what does Zeyro do that they don't?
              Output: 1 slide or 1 table: Zeyro vs. competitors on 5 dimensions
              (UPI behavioral features / AA-native / real-time narrative / 
               Gen Z thin-file coverage / open API vs. closed platform)

12:00–13:00   BREAK

13:00–15:00   Fill in Postman demo persona requests (from Day 1 collection)
              For each of the 5 personas, pre-fill a saved Postman request:
                Name: "Persona 1 - Rahul (Approve)"
                URL: POST {{base_url}}/v1/assessments
                Headers: Authorization: Bearer {{token}}
                Body:
                  {
                    "user_mobile": "+919876543210",
                    "products": ["bfs", "fraud", "atp"],
                    "consent_id": "demo-consent-001",
                    "context": {
                      "loan_amount_inr": 50000,
                      "loan_tenor_days": 180
                    }
                  }
              Repeat for all 5. Save responses as examples once API is live.
              Add a description to each: "Expected: GOOD band, CLEAR fraud, comfortable ATP"

15:00–17:00   Write the demo call script (internal, not for partner)
              A 10-minute run of show for the demo call with an NBFC.
              Structure:
                0:00–1:00   Context: "We built India's behavioral credit API on UPI + AA"
                1:00–2:00   Show the API request (Postman) — one clean call
                2:00–3:00   Show Rahul response — explain BFS 712, narrative, ATP
                3:00–4:00   Show Priya response — explain REVIEW, why irregular income flagged
                4:00–5:00   Show Vikram response — explain fraud signals, stacking detection
                5:00–6:00   Show Sunita response — explain thin-file confidence=LOW
                6:00–8:00   Answer: "How does it work?" (data sources: UPI + AA)
                8:00–9:00   Answer: "How do we integrate?" (point to integration guide)
                9:00–10:00  CTA: "We're onboarding 2 NBFCs this month — 2-hour integration"
```

**Day 2 done condition:** Integration guide drafted (Google Doc, shareable link ready).
Competitor table complete. Postman collection has all 5 persona requests pre-filled.
Demo call script drafted.

---

### DAY 3 — Wednesday
**Theme: Scoring engine (Swaraj builds all three scores) · Demo rehearsal prep (Abhimanyu)**

---

#### SWARAJ — Day 3
**Goal:** BFS, RPS, and ATP all compute correctly and return via the API.
**Time:** 8 hours (longest day — this is the core product)

```
09:00–11:30   Write scoring.py — BFS weighted scorecard

from models import BFSOutput, AdverseAction

BANDS = [(750,"EXCELLENT"),(650,"GOOD"),(550,"FAIR"),(450,"POOR"),(0,"VERY_POOR")]

ADVERSE_CODES = {
  "emi.emi_to_income_ratio":                ("AA01","High debt-to-income ratio"),
  "income.income_regularity_score":          ("AA02","Irregular income pattern"),
  "cashflow.end_of_month_stress_score":      ("AA03","Month-end cash flow stress"),
  "emi.missed_emi_signals_count":            ("AA04","Prior missed EMI signals"),
  "emi.loan_stacking_signals":               ("AA05","Multiple new loans in 30 days"),
  "cashflow.avg_days_to_near_zero":          ("AA06","Rapid cash depletion after payday"),
  "volatility.sudden_behavior_change_score": ("AA07","Sudden behavior change detected"),
  "savings.savings_to_income_ratio":         ("AA08","No savings buffer detected"),
  "quality.thin_file_flag":                  ("AA10","Insufficient transaction history"),
}

def compute_bfs(fv: dict) -> BFSOutput:
    score = 600

    # Income signals (+30 max)
    score += fv.get("income.income_regularity_score", 0.5) * 20
    score += max(0, fv.get("income.income_trend_90d", 0)) / 0.3 * 10

    # EMI burden (-80 max from ratio alone)
    emi_ratio = fv.get("emi.emi_to_income_ratio", 0)
    score -= emi_ratio * 80
    score -= min(fv.get("emi.missed_emi_signals_count", 0), 3) * 15
    score -= fv.get("emi.loan_stacking_signals", 0) * 25

    # Cash flow stress (-60 max)
    score -= fv.get("cashflow.end_of_month_stress_score", 0) * 40
    days = fv.get("cashflow.avg_days_to_near_zero", 25)
    score -= max(0, (20 - days) / 20) * 20

    # Savings buffer (+30 max)
    score += min(fv.get("savings.savings_to_income_ratio", 0), 0.3) / 0.3 * 30

    # Behavioral volatility (-20 max)
    score -= fv.get("volatility.sudden_behavior_change_score", 0) * 20

    # Thin file penalty
    if fv.get("quality.thin_file_flag", 0) == 1:
        score -= 60

    score = max(300, min(900, int(score)))
    band = next(b for t, b in BANDS if score >= t)

    # Confidence
    thin = fv.get("quality.thin_file_flag", 0) == 1
    coverage = fv.get("quality.data_coverage_days", 0)
    source = fv.get("quality.source_diversity_code", 0)
    gaps = fv.get("quality.data_gap_count", 99)
    if thin:              confidence = "LOW"
    elif coverage >= 80 and source >= 1 and gaps == 0: confidence = "HIGH"
    elif coverage >= 60 and gaps <= 1:                  confidence = "MEDIUM"
    else:                                               confidence = "LOW"

    # Adverse action codes — top 3 worst signals
    risk_signals = {
      "emi.emi_to_income_ratio":                fv.get("emi.emi_to_income_ratio",0),
      "income.income_regularity_score":          1 - fv.get("income.income_regularity_score",1),
      "cashflow.end_of_month_stress_score":      fv.get("cashflow.end_of_month_stress_score",0),
      "emi.missed_emi_signals_count":            fv.get("emi.missed_emi_signals_count",0) / 3,
      "emi.loan_stacking_signals":               fv.get("emi.loan_stacking_signals",0),
      "volatility.sudden_behavior_change_score": fv.get("volatility.sudden_behavior_change_score",0),
      "savings.savings_to_income_ratio":         1 - min(fv.get("savings.savings_to_income_ratio",0),0.3)/0.3,
      "quality.thin_file_flag":                  fv.get("quality.thin_file_flag",0),
    }
    top_risks = sorted(risk_signals, key=risk_signals.get, reverse=True)[:3]
    adverse = [AdverseAction(code=ADVERSE_CODES[f][0], description=ADVERSE_CODES[f][1])
               for f in top_risks if f in ADVERSE_CODES]

    return BFSOutput(score=score, band=band, confidence=confidence,
                     version="scorecard_v1", adverse_action_reasons=adverse,
                     thin_file=thin)

11:30–12:30   Write RPS heuristic in scoring.py

from models import RPSOutput

def compute_rps(fv: dict) -> RPSOutput:
    trend   = max(0, min(1, (fv.get("cashflow.balance_trend_slope",0)+0.1)/0.2))
    stress  = 1 - fv.get("cashflow.end_of_month_stress_score", 0.5)
    stable  = fv.get("income.income_regularity_score", 0.5)
    prob    = round((trend*0.40) + (stress*0.35) + (stable*0.25), 3)
    label   = "HIGH" if prob > 0.70 else "MEDIUM" if prob > 0.40 else "LOW"

    window = None
    if label == "LOW":
        bal   = fv.get("cashflow.min_balance_30d_inr", 1000)
        slope = fv.get("cashflow.balance_trend_slope", -0.01)
        if slope < 0:
            window = max(7, min(90, int(bal / abs(slope))))

    return RPSOutput(probability=prob, label=label,
                     predicted_default_window_days=window)

12:30–13:30   BREAK

13:30–15:00   Write ATP calculator in scoring.py

from models import ATPOutput

SAVINGS_FLOOR = 0.10
FCF_CAP       = 0.50
HAIRCUT       = 0.80
REG_THRESHOLD = 0.60

def compute_atp(fv: dict, requested_emi: float) -> ATPOutput:
    avg_income   = fv.get("income.avg_monthly_credit_inr", 0)
    regularity   = fv.get("income.income_regularity_score", 1)
    fixed_obs    = fv.get("expense.fixed_obligation_inr", 0)
    existing_emi = fv.get("emi.total_monthly_exposure_inr", 0)

    haircut_applied = regularity < REG_THRESHOLD
    conservative    = avg_income * (HAIRCUT if haircut_applied else 1.0)
    total_fixed     = fixed_obs + existing_emi
    savings_floor   = conservative * SAVINGS_FLOOR
    free_cf         = conservative - total_fixed - savings_floor
    max_emi         = max(0, free_cf * FCF_CAP)
    ratio           = requested_emi / free_cf if free_cf > 0 else float("inf")

    return ATPOutput(
        monthly_surplus_inr=round(free_cf, 2),
        max_recommended_emi_inr=round(max_emi, 2),
        ratio_at_requested_emi=round(ratio, 3),
        income_haircut_applied=haircut_applied,
        conservative_income_used=round(conservative, 2)
    )

15:00–17:00   Run assertions on all 5 personas. Fix weights until all pass.

              bfs_r = compute_bfs(RAHUL_FV)
              assert 700 <= bfs_r.score <= 760,    f"Rahul: {bfs_r.score}"
              assert bfs_r.band == "GOOD"
              assert bfs_r.confidence == "HIGH"

              bfs_p = compute_bfs(PRIYA_FV)
              assert 590 <= bfs_p.score <= 650,    f"Priya: {bfs_p.score}"
              assert bfs_p.band in ("FAIR","GOOD")

              bfs_m = compute_bfs(MOHAMMED_FV)
              assert 650 <= bfs_m.score <= 710,    f"Mohammed: {bfs_m.score}"

              bfs_s = compute_bfs(SUNITA_FV)
              assert 480 <= bfs_s.score <= 545,    f"Sunita: {bfs_s.score}"
              assert bfs_s.thin_file == True
              assert bfs_s.confidence == "LOW"

              bfs_v = compute_bfs(VIKRAM_FV)
              assert 440 <= bfs_v.score <= 510,    f"Vikram: {bfs_v.score}"

              # RPS
              rps_r = compute_rps(RAHUL_FV)
              assert rps_r.label == "HIGH"
              rps_v = compute_rps(VIKRAM_FV)
              assert rps_v.label == "LOW"
              assert rps_v.predicted_default_window_days is not None

              # ATP
              atp_r = compute_atp(RAHUL_FV, requested_emi=8000)
              assert atp_r.ratio_at_requested_emi < 0.5
              atp_p = compute_atp(PRIYA_FV, requested_emi=8000)
              assert atp_p.income_haircut_applied == True
```

**Day 3 done condition:** All assertions pass. No guessing on weights.
Three scores (BFS, RPS, ATP) return correct values for all 5 personas.

---

#### ABHIMANYU — Day 3
**Goal:** Demo environment ready. Loom recording setup. LinkedIn post drafted.
**Time:** 4 hours

```
09:00–10:30   Set up Loom for demo recording
              Install Loom desktop app
              Create a Loom workspace: "Zeyro B2B"
              Record a 2-minute test video: just your screen + voice
              Verify audio quality is clear, screen resolution is sharp
              This will be used on Day 7 to record the full demo

10:30–12:00   Draft LinkedIn post announcing early access (DO NOT POST YET)
              Audience: fintech founders, NBFC risk leaders, lending product heads
              Format: 5–6 lines, no hashtag spam, one clear CTA

              Draft:
              "We've been quietly building India's behavioral credit
              intelligence API — scores derived entirely from UPI and
              Account Aggregator data, not bureau.

              We're running an early access program this month with
              2–3 NBFCs. If your team is looking at alternative data
              for thin-file or Gen Z borrowers, worth a 20-min call.

              DM me or comment below."

              Post on Day 7 after the demo is live and confirmed working.

12:00–13:00   BREAK

13:00–15:00   Read the Scoring Models Spec document end to end
              This is your homework so you can explain the product in the demo.
              You don't need to understand the math.
              You need to understand:
                - What BFS is (behavioral score, not bureau)
                - What adverse action codes are (why RBI requires them)
                - What ATP means for a lender (can this borrower afford the EMI?)
                - What thin_file means (why Sunita gets LOW confidence)
                - What loan stacking is (why Vikram gets flagged)

              Write 5 plain-English answers to these questions in your notes.
              You'll be asked these on the demo call.
```

**Day 3 done condition:** Loom setup tested. LinkedIn draft written and saved (not posted).
Can explain all 5 personas in plain English without reading from notes.

---

### DAY 4 — Thursday
**Theme: Fraud detection + Claude narrative (Swaraj) · One-pager design (Abhimanyu)**

---

#### SWARAJ — Day 4
**Goal:** Fraud signals work. Claude narrative API wired. Full response assembled.
**Time:** 8 hours

```
09:00–11:30   Write fraud.py — rule-based fraud signals

from models import FraudOutput, FraudSignal

def compute_fraud(fv: dict) -> FraudOutput:
    signals = []
    risk = 0.0

    if fv.get("emi.loan_stacking_signals", 0) == 1:
        signals.append(FraudSignal(
            signal_type="LOAN_STACKING", severity="HIGH",
            description="Multiple new EMI obligations in last 30 days"
        ))
        risk += 0.35

    if fv.get("volatility.sudden_behavior_change_score", 0) > 0.60:
        signals.append(FraudSignal(
            signal_type="SUDDEN_BEHAVIOR_SHIFT", severity="MEDIUM",
            description="Z-score > 2 vs personal 60-day baseline"
        ))
        risk += 0.20

    if fv.get("network.new_vpa_ratio_30d", 0) > 0.50:
        signals.append(FraudSignal(
            signal_type="HIGH_VELOCITY_P2P", severity="MEDIUM",
            description="High proportion of new counterparties in 30 days"
        ))
        risk += 0.15

    if fv.get("behavior.round_amount_transfer_ratio", 0) > 0.60:
        signals.append(FraudSignal(
            signal_type="ROUND_AMOUNT_PATTERN", severity="LOW",
            description="High ratio of round-amount P2P transfers"
        ))
        risk += 0.10

    risk  = min(1.0, risk)
    label = ("VERY_HIGH" if risk>=0.7 else "HIGH" if risk>=0.5 else
             "MEDIUM"    if risk>=0.3 else "LOW"  if risk>=0.1 else "CLEAR")

    return FraudOutput(
        fraud_risk_label=label,
        fraud_probability=round(risk,3),
        fraud_signals=signals,
        stacking_detected=fv.get("emi.loan_stacking_signals",0)==1,
        manual_review_recommended=(label in ("HIGH","VERY_HIGH"))
    )

              Validate:
              assert compute_fraud(RAHUL_FV).fraud_risk_label == "CLEAR"
              assert compute_fraud(VIKRAM_FV).fraud_risk_label in ("HIGH","VERY_HIGH")
              assert compute_fraud(VIKRAM_FV).stacking_detected == True

11:30–13:00   Write narrative.py — Claude API integration

import anthropic, os
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM = """You are a credit analyst writing a risk summary for a regulated
Indian lending institution. Write exactly 3 sentences.
Rules:
- Use ONLY the structured data provided. Do not invent details.
- No names, no PII. Neutral, professional tone.
- Do not say approve or decline — only describe the risk profile.
- If thin_file is true or confidence is LOW: note data limitations clearly.
- If stacking or fraud signals exist: describe the specific anomaly observed."""

def generate_narrative(bfs, rps, atp, fraud) -> str:
    data = {
        "bfs_score": bfs.score, "bfs_band": bfs.band,
        "confidence": bfs.confidence, "thin_file": bfs.thin_file,
        "adverse_factors": [r.description for r in bfs.adverse_action_reasons],
        "rps_label": rps.label,
        "fraud_risk": fraud.fraud_risk_label,
        "stacking": fraud.stacking_detected,
        "fraud_signals": [s.description for s in fraud.fraud_signals],
        "monthly_surplus_inr": atp.monthly_surplus_inr,
        "ratio_at_requested_emi": atp.ratio_at_requested_emi,
        "income_haircut_applied": atp.income_haircut_applied,
    }
    r = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=200, temperature=0,
        system=SYSTEM,
        messages=[{"role":"user","content":str(data)}]
    )
    return r.content[0].text

13:00–14:00   BREAK

14:00–16:00   Wire everything into POST /v1/assessments — full pipeline

              @app.post("/v1/assessments")
              async def create_assessment(req: AssessmentRequest,
                                          partner=Depends(get_current_partner)):
                  fv = get_feature_vector(req.user_mobile)
                  if not fv:
                      raise HTTPException(404, "DEMO_USER_NOT_FOUND")

                  assessment_id = str(uuid4())
                  loan_amount = req.context.get("loan_amount_inr", 50000)
                  tenor       = req.context.get("loan_tenor_days", 180)
                  monthly_emi = loan_amount / tenor * 30  # rough monthly

                  bfs   = compute_bfs(fv)
                  rps   = compute_rps(fv)
                  atp   = compute_atp(fv, monthly_emi)
                  fraud = compute_fraud(fv)
                  narr  = generate_narrative(bfs, rps, atp, fraud)

                  # Overall signal (deterministic)
                  if fraud.fraud_risk_label in ("HIGH","VERY_HIGH"):
                      signal = "DECLINE"
                  elif bfs.score >= 650 and fraud.fraud_risk_label == "CLEAR":
                      signal = "PROCEED"
                  elif bfs.score >= 500:
                      signal = "REVIEW"
                  else:
                      signal = "DECLINE"

                  response = AssessmentResponse(
                      assessment_id=assessment_id,
                      status="COMPLETE",
                      bfs=bfs, rps=rps, atp=atp, fraud=fraud,
                      risk_narrative=narr,
                      overall_signal=signal
                  )

                  # Store in DB
                  cur.execute(
                      "INSERT INTO assessments VALUES (%s,%s,%s,%s,%s,%s,NOW())",
                      (assessment_id, partner["id"],
                       req.user_mobile[-4:],  # store only last 4 digits
                       "COMPLETE",
                       req.json(), response.json())
                  )
                  conn.commit()
                  return response

16:00–17:30   Test all 5 personas end-to-end
              curl -X POST http://localhost:8000/v1/assessments \
                -H "Authorization: Bearer {token}" \
                -d '{"user_mobile":"+919876543210","products":["bfs","fraud","atp"],
                     "consent_id":"demo-001","context":{"loan_amount_inr":50000}}'

              For each persona: verify narrative is coherent and specific.
              Vikram narrative must mention stacking or fraud signal.
              Sunita narrative must mention limited data.
              Rahul narrative must describe stable income.

              Fix narrative system prompt if outputs are generic.
```

**Day 4 done condition:** All 5 personas return full AssessmentResponse in < 3 seconds.
Narratives are persona-specific. Fraud signals correct for all.

---

#### ABHIMANYU — Day 4
**Goal:** Partner one-pager PDF designed in Canva. Ready to send Day 7.
**Time:** 5 hours

```
09:00–12:00   Design partner one-pager in Canva
              Title: "Zeyro B2B — Behavioral Credit Intelligence API"
              Subtitle: "Early Access · June 2026"

              Section 1: The Problem (2 sentences)
                "Bureau scores miss 50M+ UPI-active Indians. Thin-file borrowers
                are declined not because they're risky — but because
                traditional data can't see them."

              Section 2: What Zeyro Does (3 bullets)
                → BFS: Behavioral Finance Score (300–900) from UPI + AA data
                → RPS: Repayment Propensity — predict who self-cures vs. defaults
                → ATP: Ability-to-Pay — max sustainable EMI from real cash flow

              Section 3: Sample API Response (screenshot or code snippet)
                Show the JSON response for Rahul (once API is live Day 4 evening)
                Highlight: score, narrative, adverse action codes

              Section 4: How It Works (simple 3-step visual)
                User consents → Zeyro processes UPI + AA data → Score in 3 seconds

              Section 5: Early Access Terms
                → Free during pilot (30 days)
                → 2-hour technical integration
                → Outcome label submission required monthly
                → DPDP-compliant, AA-framework, RBI MRM-aligned

              Footer: zeyro.in · b2b@zeyro.in · Arthazeyro Technologies Pvt. Ltd.

              Design notes: use Zeyro brand colors, clean minimal layout,
              no more than 1 page, PDF export at the end.

12:00–13:00   BREAK

13:00–15:00   Build the demo environment checklist
              This is what you verify before every demo call.
              Print this and keep it next to your laptop.

              PRE-DEMO CHECKLIST (run 30 minutes before every call):
              □ Open Postman — collection loads, environment set to prod URL
              □ Run POST /v1/auth/token → token received and auto-saved
              □ Run Persona 1 (Rahul) → BFS 700+ GOOD, fraud CLEAR
              □ Run Persona 5 (Vikram) → fraud HIGH, stacking_detected true
              □ Browser tab open: demo.zeyro.in/health → {"status":"ok"}
              □ Loom recording ready (will record the demo for async follow-up)
              □ Partner integration guide link ready to paste in chat
              □ One-pager PDF downloaded and ready to share screen
              □ Partner's name and company noted — personalize intro

              DURING DEMO:
              □ Share screen on Postman, not slides
              □ Run all 5 personas in order: approve → review → MSME → thin → fraud
              □ After each: pause, ask "does this make sense for your portfolio?"
              □ Record on Loom throughout

              POST DEMO:
              □ Send integration guide + one-pager within 1 hour
              □ Confirm next step: integration call with their tech team
```

**Day 4 done condition:** Canva one-pager PDF exported and saved.
Demo checklist printed. Pre-demo run verified against live API.

---

### DAY 5 — Friday
**Theme: Production deploy (Swaraj) · Demo polish + outreach staging (Abhimanyu)**

---

#### SWARAJ — Day 5
**Goal:** Demo deployed to Railway at live URL. Error handling complete. GET endpoint works.
**Time:** 6 hours

```
09:00–10:30   Complete GET /v1/assessments/{id}
              SELECT * FROM assessments WHERE id = %s AND partner_id = %s
              If not found: 404
              If found: return stored response_json
              (Demo always returns COMPLETE since processing is synchronous)

              Also add: GET /v1/insights/{mobile}
              Returns the raw feature vector for a demo user, grouped:
              {
                "income":    { all income.* features },
                "emi":       { all emi.* features },
                "cashflow":  { all cashflow.* features },
                "fraud":     { all network.* + behavior.* features },
                "quality":   { all quality.* features }
              }
              This shows the partner: "here's what's behind the score"
              High demo value — most NBFCs will ask "but what data is this from?"

10:30–12:00   Error handling pass — all error paths return clean JSON
              {"error": {"code": "AUTH_INVALID_KEY",
                         "message": "Invalid API key",
                         "request_id": "uuid"}}

              Test and verify each:
              □ No Authorization header → 401 AUTH_MISSING
              □ Wrong API key → 401 AUTH_INVALID_KEY
              □ Expired JWT → 401 AUTH_TOKEN_EXPIRED
              □ Unknown mobile → 404 DEMO_USER_NOT_FOUND
              □ Missing consent_id → 422 VALIDATION_ERROR (Pydantic handles)
              □ ANTHROPIC_API_KEY not set → 500 NARRATIVE_SERVICE_UNAVAILABLE
                (fallback: return static narrative, don't crash)
              □ DB connection failure → 500 DATABASE_UNAVAILABLE

              Add narrative fallback:
              try:
                  narr = generate_narrative(bfs, rps, atp, fraud)
              except Exception:
                  narr = f"Assessment complete. BFS score: {bfs.score} ({bfs.band})."

12:00–13:00   BREAK

13:00–15:30   Deploy to Railway
              In zeyro-b2b-demo directory:
              railway login
              railway link   (link to project Abhimanyu created Day 1)
              railway up

              Set environment variables in Railway dashboard:
              ANTHROPIC_API_KEY  = (from your Anthropic account)
              JWT_SECRET         = (random 32-char string)
              DEMO_API_KEY       = demo_key_zeyro_001
              POSTGRES_URL       = (from Railway PostgreSQL plugin — auto-populated)
              ENV                = production

              After deploy:
              curl https://zeyro-b2b-demo.railway.app/health
              → {"status": "ok", "service": "zeyro-b2b-demo"}

              Run all 5 personas against live URL via Postman.
              Update Postman environment: base_url = https://zeyro-b2b-demo.railway.app

15:30–17:00   Create Postman published collection link
              In Postman: Collection → Share → Publish
              Copy link. This is what you send to the NBFC's tech team.
              They can import it instantly and start testing.

              Write requirements.txt (final, all packages pinned):
              fastapi==0.111.0
              uvicorn[standard]==0.30.1
              pydantic==2.7.4
              anthropic==0.30.0
              python-jose[cryptography]==3.3.0
              python-dotenv==1.0.1
              psycopg2-binary==2.9.9

              Write Dockerfile:
              FROM python:3.12-slim
              WORKDIR /app
              COPY requirements.txt .
              RUN pip install --no-cache-dir -r requirements.txt
              COPY . .
              CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Day 5 done condition:** https://zeyro-b2b-demo.railway.app/health returns 200.
All 5 personas return correct responses via live URL in Postman.
Published Postman collection link exists.

---

#### ABHIMANYU — Day 5
**Goal:** Update Postman to live URL. Finalize outreach messages. Demo rehearsal.
**Time:** 5 hours

```
09:00–10:00   Update Postman environment to Railway live URL
              Change {{base_url}} from localhost:8000 to
              https://zeyro-b2b-demo.railway.app
              Run all 5 personas. Confirm responses match expected.
              Save example responses in Postman collection.

10:00–12:00   First full demo rehearsal (solo)
              Run through the 10-minute demo script from Day 2 yourself.
              Time it. Should be exactly 10 minutes.
              Things to verify:
              □ Can you explain BFS without saying "machine learning" or "algorithm"?
              □ Can you explain what adverse action codes are to a non-technical person?
              □ Do you know what to say when they ask "where does the data come from?"
              □ Do you know what to say when they ask "is this RBI compliant?"
                (Answer: AA-framework compliant, DPDP Act compliant, model cards per RBI MRM)

12:00–13:00   BREAK

13:00–14:30   Finalize the 3 outreach messages from Day 1
              Personalize each based on the NBFC profile:
              - If they use Perfios already: "We complement Perfios — behavioral
                UPI layer that bureau data and bank statements don't capture"
              - If they're MSME-focused: "Our MSME persona (Mohammed) shows how
                high merchant diversity + business cash flow predicts
                creditworthiness differently from salaried users"
              - If they're consumer lending: "We cover the thin-file Gen Z
                segment that bureau scores decline by default"

              Review with Swaraj before sending. Do not send until Day 7.

14:30–16:00   Write FAQ document (Google Doc, for partner follow-up)
              10 questions an NBFC will ask. Answer each in 2–3 sentences.

              Q1: What data do you use?
              Q2: Do you store the user's bank data?
              Q3: Is this DPDP compliant?
              Q4: How do we integrate? How long does it take?
              Q5: What does the BFS score mean vs. CIBIL?
              Q6: What is the accuracy of the fraud detection?
              Q7: Can we use this for our existing portfolio (collections)?
              Q8: What happens if AA consent is denied?
              Q9: How is the score explained to the borrower?
              Q10: What's your pricing?
                   (Answer: Free for pilot. Pricing post-pilot based on volume.
                    Do not give a number yet.)
```

**Day 5 done condition:** Postman live on Railway URL, all 5 personas verified.
FAQ document complete. Outreach messages finalized (pending Swaraj review).
First solo demo rehearsal completed and timed.

---

### DAY 6 — Saturday
**Theme: Buffer. Fix what broke. Add one bonus feature if time permits.**

---

#### SWARAJ — Day 6

```
Priority 1: Fix anything broken during Abhimanyu's Day 5 rehearsal.
            Known failure modes:
            - Narrative API timeout → check ANTHROPIC_API_KEY in Railway env
            - PostgreSQL connection drop → add connection retry logic
            - Postman auth flow broken → verify JWT expiry handling

Priority 2 (if no fires): Add POST /v1/consent/initiate
            Returns a mock consent object immediately:
            {
              "consent_id": "demo-consent-{uuid}",
              "status": "ACTIVE",
              "user_mobile": "+91...",
              "expiry": "2026-12-31",
              "message": "Demo mode: consent auto-approved"
            }
            This completes the full user journey in the demo:
            consent → assessment → score
            High demo value: shows you've thought through the AA flow.
```

---

#### ABHIMANYU — Day 6

```
Priority 1: Full demo rehearsal with Swaraj as the NBFC partner.
            Swaraj plays a skeptical NBFC risk head.
            Run the 10-minute demo exactly as you would on a real call.
            Swaraj asks hard questions. You answer.
            Repeat until smooth.

Priority 2: Record a Loom walkthrough of the demo (async version)
            5-minute version for people who can't take a call.
            Show: one API call, full response for Rahul, brief explanation.
            Upload to Loom. Copy shareable link.
            This link goes in the outreach messages alongside the one-pager.

Priority 3: Set up a simple landing page if time allows.
            Carrd.co or Framer — 10-minute setup.
            URL: b2b.zeyro.in
            Headline: "Behavioral Credit Intelligence for Indian NBFCs"
            CTA button: "Request Early Access" → mailto:b2b@zeyro.in
            Embed the Loom video.
            Do NOT spend more than 1 hour on this.
```

---

### DAY 7 — Sunday
**Theme: Final check. Send outreach. Post LinkedIn.**

---

#### SWARAJ — Day 7

```
09:00–10:00   Final production verification
              Run the complete demo checklist against live Railway URL.
              All 5 personas. All 4 routes. All error paths.

10:00–11:00   Review and approve outreach messages Abhimanyu drafted.
              One final check: are the technical claims accurate?
              "2-hour integration" — is that realistic? (Yes for REST API.)
              "Score in < 3 seconds" — verify on Railway. (Yes.)
              "AA + UPI data" — do we make this clear enough? 

11:00–13:00   Available on standby for any demo technical issues.
              If Abhimanyu's first outreach gets a fast reply and they want
              a same-day call: Swaraj joins to handle technical questions.
```

---

#### ABHIMANYU — Day 7

```
09:00–10:00   Final pre-send review of all materials
              □ Outreach messages (3): reviewed + Swaraj-approved
              □ Partner one-pager PDF: final version exported
              □ Integration guide: Google Doc link shareable
              □ Postman collection: public link working
              □ Loom demo video: link copied
              □ FAQ document: Google Doc link shareable

10:00–11:00   Send outreach to 3 NBFC targets
              Send all 3. Do not wait.
              Subject line: "Zeyro B2B — behavioral credit API early access"
              Attach: one-pager PDF
              Link: Loom demo video
              CTA: "20-min call this week?"

11:00–12:00   Post LinkedIn announcement
              Use the draft from Day 3.
              Post from Swaraj's LinkedIn (CEO voice, more reach in fintech).
              Pin it. Monitor comments. Reply to every comment within 2 hours.

12:00 onward  Monitor responses. Book calls.
              First call target: within 48 hours of outreach.
```

---

## 7-Day Deliverable Checklist

```
TECHNICAL (Swaraj)
✅ FastAPI service running on Railway: https://zeyro-b2b-demo.railway.app
✅ POST /v1/auth/token         → JWT issued
✅ POST /v1/assessments        → full response, all 5 personas, < 3s
✅ GET  /v1/assessments/{id}   → stored result retrieved
✅ GET  /v1/insights/{mobile}  → raw feature attributes grouped
✅ POST /v1/consent/initiate   → mock consent (if time allows)
✅ All error paths return clean JSON (not 500 stack traces)
✅ Postman collection published: public link ready
✅ BFS assertions pass for all 5 personas
✅ Fraud signals correct: Rahul=CLEAR, Vikram=HIGH

PRODUCT (Abhimanyu)
✅ 3 NBFC targets profiled (Google Doc)
✅ 3 outreach messages personalized + sent (Day 7)
✅ Partner one-pager PDF (Canva, 1 page)
✅ Partner integration guide (Google Doc, 3 pages)
✅ FAQ document (Google Doc, 10 questions)
✅ Demo call script (10 minutes, rehearsed 3+ times)
✅ Demo pre-flight checklist (printed)
✅ Loom demo recording (5-minute async version)
✅ LinkedIn post published (Day 7)
✅ b2b.zeyro.in landing page (if time allows)
```

---

## What The Demo Does NOT Have (And That Is Correct)

Do not build these this week. Do not feel bad about not having them.

```
✗ Real AA consent flow     — mock consent_id is fine
✗ Real UPI webhooks        — fixture data is fine
✗ Trained ML model         — scorecard is functionally identical for demo
✗ NATS message broker      — sync processing is fine
✗ Go microservices         — one Python service is fine
✗ gRPC                     — REST is fine
✗ Kubernetes               — Railway is fine
✗ Federated learning       — not relevant for demo
✗ GNN fraud detection      — rule-based is fine
```

A working demo with clean API design closes pilots.
A perfect architecture with no demo closes nothing.

---

# PART 2 — THE FULL ROADMAP

## Ownership After Day 7

All technical tasks: Swaraj.
All partner-facing, documentation, outreach, and coordination tasks: Abhimanyu.
When a task requires both: explicitly stated below.

---

## Phase 1: Demo → First Real Assessment (Weeks 2–4)

```
WEEK 2

S  P1  Sahamati AA sandbox integration (3 days)
       Replace mock consent with real Sahamati sandbox flow
       Real FIP data pull → parse AA JSON schema → extract transactions

S  P1  Feature pipeline from real AA data (3 days)
       Parse bank statement FIP response from Sahamati sandbox
       Extract income, EMI, cashflow features from real bank data
       Replace fixture lookup with actual feature computation

S  P2  Replace Railway with NxtGen FSC staging (2 days)
       Required before real user data touches infrastructure
       DPDP Act: India-based processing mandatory before first real consent

A  P1  Follow up on Day 7 outreach (ongoing)
       Within 48 hours: follow up with anyone who opened but didn't reply
       Book demo calls. Run demos. Send materials.

A  P2  Write data processing agreement template (Atharva to review)
       2-page DPA covering: what data Zeyro processes, how long, for what purpose
       Required before any NBFC goes live with real user data

WEEK 3

S  P1  UPI webhook receiver (2 days)
       POST /webhooks/upi receives Razorpay/Cashfree signed webhooks
       Validate HMAC signature, normalize to canonical schema

S  P1  VPA entity resolver v1 (2 days)
       200+ known VPA domain → business_type mapping
       Exact VPA lookup, queue unknown VPAs for review

S  P2  NATS JetStream setup (1 day)
       Replace synchronous pipeline with async NATS
       Required before first concurrent NBFC batch requests

A  P1  Negotiate first NBFC pilot agreement (with Swaraj input on technical terms)
       Free 30-day pilot
       Outcome label submission required
       Data processing agreement signed

A  P2  Set up b2b@zeyro.in email + response templates
       Template 1: Demo follow-up (after call, send materials)
       Template 2: Integration guide send (to tech team)
       Template 3: Outcome label reminder (monthly, automated)

WEEK 4

S  P1  Partner onboarding flow (3 days)
       Real API key issuance (not hardcoded)
       Partner config YAML: score version, webhook URL, data agreement
       mTLS certificate for production partner

S  P1  Outcome ingestion API — POST /v1/outcomes (1 day)
       This is the most important endpoint for long-term model quality
       PAID_ON_TIME | DEFAULTED | PREPAID → consortium_outcomes table
       Must be live from day 1 of first pilot. Non-negotiable.

S  P2  Basic monitoring (1 day)
       Grafana dashboard: assessment success rate, p99 latency, error rate
       PagerDuty alert: > 5% error rate → page Swaraj

A  P1  Onboard first NBFC partner — coordinate integration (1 week)
       Intro their tech team to Swaraj
       Track integration progress
       Unblock non-technical blockers (contracts, emails, introductions)

A  P2  Build partner portal concept (no code — wireframe in Figma/Canva)
       Partners want to see their usage, their assessments, their outcomes
       Wireframe the dashboard: assessment count, score distribution, outcome rate
       Hand to Swaraj for implementation in Phase 2
```

---

## Phase 2: First 1,000 Assessments → ML Model (Weeks 5–12)

```
WEEKS 5–8

S  P1  Feature pipeline completeness audit
       Log null_feature_rate per feature daily
       Fix any feature with > 20% null rate
       Target: < 5% null on all top-20 features before model training

S  P1  Home Credit dataset pipeline validation
       Train XGBoost on Home Credit dataset
       Validates pipeline before real data arrives
       AUC > 0.75, SHAP adverse action codes generate correctly

S  P2  VPA resolver v2 (fuzzy matching + GST lookup)
       rapidfuzz token_sort_ratio against known entity names
       GST registry lookup for detectable GSTIN in VPA

S  P2  Forward-looking cash flow features
       SARIMA on daily balance → predict 30d balance
       Add cashflow.predicted_30d_balance_inr to feature vector

A  P1  Second and third NBFC partner outreach + pilots (ongoing)
       Use learnings from first pilot to sharpen the pitch
       What objections came up? Update FAQ and integration guide.

A  P1  Monthly outcome label follow-up with first partner
       Email reminder on the 1st of each month
       Template: "Here's how to submit last month's outcomes via API"
       Track: how many labels received vs. assessments run

A  P2  Case study from first pilot (anonymous)
       With first NBFC's permission: write a 1-page anonymized case study
       "An NBFC used Zeyro B2B to score 200 thin-file applicants.
        Result: X% more approvals with Y% lower default rate vs. control."
       Used in outreach for subsequent NBFCs

WEEKS 9–12

S  P1  BFS v1 XGBoost model (trigger: >= 500 labeled outcomes)
       Full training pipeline: data prep, feature selection, hyperopt,
       calibration, evaluation, model card
       Gate: AUC > 0.72 on out-of-time test. Otherwise: stay on scorecard.

S  P1  Model deployment with A/B traffic split
       10% requests → BFS v1, 90% → scorecard
       After 200 assessments: compare KS. Full rollout if v1 wins.

S  P2  RPS logistic regression (trigger: >= 300 labeled outcomes)

S  P2  Weekly retraining cron
       Sunday 03:00 IST
       Triggers if >= 500 new outcomes since last run
       Slack notification with new AUC

A  P1  Seed round support (Swaraj leads, Abhimanyu supports)
       Update pitch materials with real pilot metrics
       Prepare for investor technical due diligence:
         "Here are the 3 NBFCs live. Here are the assessments run.
          Here are the outcome labels received. Here is the model AUC."
       Coordinate investor introductions from FIRSTWINGS network

A  P2  Pricing model finalization
       Define: per-assessment pricing tiers
       Research: what Perfios/Karza charge (Abhimanyu to find)
       Propose 3 tiers to Swaraj for review
```

---

## Phase 3: 3 Partners → 10 Partners (Months 3–6)

```
S  P1  Multi-tenant partner isolation (PostgreSQL row-level security)
S  P1  Collections Oracle product (RPS → strategic recommendation)
S  P1  Go microservices migration begins (auth-service, audit-service first)
S  P1  LangGraph agent orchestration (Credit Sentinel + Fraud Watchdog parallel)
S  P2  Cohort-specific BFS models (trigger: 2,000+ outcomes, 2 NBFC types)
S  P2  GNN fraud embeddings (trigger: 10,000+ transactions)
S  P3  Federated consortium model design (architecture only, not implementation)

A  P1  ZeyroInsights as standalone product (work with Swaraj on spec)
       Partners with own risk models want raw behavioral attributes
       Separate pricing tier, separate Postman collection, separate docs
A  P1  10 NBFC pipeline: outreach, demos, pilots, contracts
A  P1  Partner success: monthly check-ins, outcome label tracking, QBRs
A  P2  Content: LinkedIn posts, fintech community presence
       1 post/week: insights from behavioral data patterns (anonymized)
       Target: NBFC risk leaders, fintech founders, investors
A  P2  Regulatory: work with Atharva on RBI MRM documentation per partner
```

---

## Phase 4: Seed Round → Series A (Months 6–12)

```
S  P1  NxtGen FSC production migration (Mumbai region)
S  P1  Full Go microservices per architecture doc
S  P1  Temporal GNN (trigger: 50,000+ labeled fraud cases)
S  P1  Federated SCAFFOLD implementation (trigger: 5+ partners confirmed)
S  P2  Mixture of Experts BFS (trigger: 10,000+ outcomes, 3 NBFC profiles)

A  P1  Series A support: investor relations, deck, data room
A  P1  Enterprise NBFC outreach (> ₹500Cr AUM)
A  P2  Hire: BD person (first non-founding hire after Series A)
A  P2  Regulatory: SEBI Corporate RIA license utilization for B2C product parallel
```

---

## Full Timeline Summary

```
WEEK 1      Demo live. 5 personas. BFS scorecard. Real Claude narrative.
            Railway. Postman. One-pager. 3 NBFC outreach messages sent.

WEEKS 2–4   Real AA + UPI. First NBFC partner live.
            Outcome labels flowing from day 1 of pilot.
            NxtGen FSC staging.

WEEKS 5–8   Feature pipeline hardened. Home Credit validation.
            Second and third NBFC pilots. Monthly outcome tracking.

WEEKS 9–12  BFS v1 ML model. RPS model. Weekly retraining.
            Seed round deck updated with real metrics.

MONTHS 3–6  10 NBFC pipeline. Collections Oracle. ZeyroInsights product.
            Go microservices migration begins. GNN fraud.

MONTHS 6–12 Production infrastructure. Series A. Enterprise NBFCs.
            Federated consortium. MoE. 50+ partner pipeline.
```

---

## The One Thing That Kills This Plan

Swaraj losing build time to coordination tasks that Abhimanyu should own.

**The boundary is clear:**
- NBFC replied to outreach with questions? → Abhimanyu handles until they ask a technical question
- Partner wants a demo call? → Abhimanyu schedules and runs it; Swaraj joins only for technical Q&A
- Contract negotiation? → Abhimanyu leads with Atharva; Swaraj reviews only the technical terms
- Investor intro? → Abhimanyu warms the intro; Swaraj takes the meeting

Swaraj's time this week is for building. Every hour of context-switching between
building and coordinating costs 2 hours of productivity. Protect it.

---

*Document owner: Swaraj Chouriwar (CEO)*
*Classification: Internal*
*Version 2.0 · June 2026*
