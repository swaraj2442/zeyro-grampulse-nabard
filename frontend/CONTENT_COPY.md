# ZEYRO B2B PLATFORM
## Underwriting Agent Workspace
### Feature Specification & Engineering Task List
**Version 2.0 · July 2026 · Internal**

---

## Overview

This document is the complete feature specification for the Underwriting Agent Workspace inside the Zeyro B2B platform. It supersedes v1.0 and covers all screens, views, data points, UI instructions, copy, and engineering tasks required to ship a production-ready workspace.

The workspace has three structural layers: a global pipeline view, an application drill-down environment, and a persistent right panel. Every section below specifies what is shown, what data populates it, what the copy says, and what UI behaviour is expected.

---

# 1. Global Navigation & Views

The global view is active when no individual application is selected. It gives the loan officer and credit head a portfolio-level picture of the entire underwriting operation.

---

## 1.1 Header Bar

Fixed top bar, full width, white background, 1px bottom border (`#E5E5E5`).

**LEFT:** Back link `← Applications` in muted gray 14px · Page title `Underwriting Agent` 18px semibold · Green dot + `Agent Active` 13px · `· Sandbox Mode` muted gray 13px

**RIGHT:** `Last run: 2 minutes ago` muted gray 13px · `[Request production access →]` amber pill button

---

## 1.2 Stat Cards Row

Four cards in a row. White background, 1px border (`#E5E5E5`), 12px radius, 24px padding, 8px gap. Primary number 32px medium. Label 12px muted. Delta line 12px — green for positive, red for negative.

| Card | Primary Value | Label | Delta |
|---|---|---|---|
| Applications Reviewed | 342 | today | ↑ 28 vs yesterday |
| Approval Rate | 67% | this period | ↓ 3% vs avg |
| Avg Decision Time | 4.2s | per application | ↑ 0.8s vs avg |
| BFS Threshold | Score ≥ 62 | auto-approve | [Edit →] |

---

## 1.3 Left Navigation

220px fixed panel. Light gray background (`#F7F7F5`). Full height. 16px padding.

Section headers in small caps 11px muted gray. Active item: 2px left border in dark green (`#1A6B3C`), 13px semibold, subtle white background. Inactive: 13px regular muted gray.

### Navigation Structure

```
UNDERWRITING
  ● Application Pipeline          ← default active view
  ○ Document Checklist            ← activates on app selection
  ○ BFS Score View                ← activates on app selection
  ○ Credit Memo                   ← activates on app selection

DECISIONS
  ○ Decision Log
  ○ Override History
  ○ Conditions Tracker

PORTFOLIO
  ○ Pipeline Insights
  ○ Team Workload
  ○ Rejection Analysis
```

### Bottom Badge — persistent across all views

White card inside the left nav, bottom-anchored. 12px padding.

```
─────────────────────
Portfolio BFS Score
74 / 100
↑ 3 pts this week
─────────────────────
```

Label `Portfolio BFS Score` 11px muted. Score `74 / 100` 24px semibold dark green. Delta `↑ 3 pts this week` 12px green.

---

## 1.4 Application Pipeline View

Default center view. Shows every application fetched from the LOS as a table row.

### Section Header Copy

```
Application Pipeline
Track every application from submission to decision.
```

### Filter Row

```
[Search applicant, app ID, loan officer...]
STATUS [All ▾]  TYPE [All ▾]  LOAN SIZE [Any ▾]  OFFICER [All ▾]
                                              [+ New Application]
```

### Table Columns

| Column | Data | Format | Notes |
|---|---|---|---|
| APPLICANT | Name + App ID + Type | Two-line cell | App ID in muted 12px below name |
| LOAN | Amount + Type | Amount bold, type muted | ₹ formatted |
| STATUS | Stage pill | Colored pill | See pill definitions below |
| PROGRESS | Bar + % | 8px bar + % right | Green fill, gray track |
| OFFICER | Name + avatar | Avatar + name | Assigned officer |
| LAST ACTIVITY | Relative time | "2m ago" | Tooltip shows full timestamp |

### Status Pill Definitions

- **READY TO DECIDE** — dark green background (`#1A6B3C`), white text. Progress 100%.
- **DOCS INCOMPLETE** — amber background (`#B45309`), white text. Progress 40–80%.
- **ANALYSING** — blue background (`#1D4ED8`), white text. Progress 40–70%. Animated pulse dot.
- **COLLECTING DOCS** — gray background (`#6B7280`), white text. Progress 10–40%.
- **FLAGGED** — red background (`#B91C1C`), white text. Override or compliance issue.

### Processing Stage Tooltip (hover on progress bar)

Five stages shown as stepper on hover:

```
(1) Data Collection → (2) KYC & Compliance → (3) BFS Analysis → (4) Underwriting → (5) Final Decision
```

Current stage highlighted. Completed stages show checkmark.

### Row Behaviour

- Row height 56px. 1px bottom border.
- Hover: subtle gray background.
- Click anywhere on row: opens Document Checklist view for that application.
- Kebab menu (`⋮`) on hover right: View / Assign Officer / Archive.

---

## 1.5 Decision Log

Full audit trail of all decisions made by the AI agent and loan officers.

### Columns

App ID · Applicant Name · BFS Score at decision · Decision (Approved / Rejected / Conditional / Escalated) · Loan Amount · Officer · Timestamp · Conditions count (if any)

### Filter Options

- Decision outcome (Approved / Rejected / Conditional / Escalated)
- Date range · Officer · BFS score range · Loan amount range

### Row Actions

- Click row → opens read-only application drill-down for that decision
- `[Download audit log]` — exports filtered view as CSV or PDF

---

## 1.6 Override History

Logs every instance where a loan officer overrode the AI agent recommendation.

### Columns

App ID · Agent Recommendation → Override Decision · Officer Name · Override Reason (free text) · Date · 90-Day Outcome

### 90-Day Outcome Tracking

For every overridden approval, the system tracks repayment behaviour for 90 days post-disbursement:

- **Repaying on time** — green tag
- **Missed 1 EMI** — amber tag
- **NPA** — red tag
- **Pending (< 90 days)** — gray tag

This creates an accountability loop: loan officers see the accuracy of their overrides over time.

### Summary Stats at Top

- Total overrides this month
- Override accuracy rate (overridden approvals that repaid on time)
- Most common override direction (AI rejected → human approved vs AI approved → human rejected)

---

## 1.7 Conditions Tracker

Tracks post-approval conditions required before disbursement across all conditional approvals.

### Per Application Row

- Applicant name + App ID
- Loan amount + officer
- Conditions count: X of Y met — progress bar
- Days since conditional approval
- Status: In Progress / Disbursed / Expired

### Expanded View (click to expand)

Itemized condition checklist per applicant:

- Condition description (e.g., "Submit March bank statement")
- Status: Pending / Met / Waived
- Met date (when completed)
- `[Mark as met]` button for loan officers
- `[Send reminder]` — triggers message in integrated chat to applicant

---

## 1.8 Pipeline Insights

Portfolio-level view of decisions, patterns, and team performance.

### Top Metrics Row

- **Total Pipeline Value** — sum of all active application loan amounts
- **Approval Rate** — approved / total decided
- **Avg BFS Score** — across all scored applications this period
- **Close Rate from Memo-Ready** — % of memo-ready applications that resulted in disbursement
- **Value Left on Table** — loan value of withdrawn or expired applications

### Decision Breakdown

Approved, Declined, Conditional — each with count, total loan value, split by Individual vs Corporate entity type. Shown as horizontal bar chart with counts.

### Top Rejection Reasons

Ranked list with frequency bars:

- BFS below threshold
- Income-declared mismatch (ITR vs AA gap > 15%)
- Thin bureau file (score < 600)
- Missing documents (checklist incomplete)
- Fraud/device flag (Fraud Watchdog escalation)

### Top Approval Drivers

Ranked list with frequency bars:

- Consistent salary credit (12+ months)
- Low EMI obligation ratio (< 35%)
- Clean DPD history
- High savings rate (> 20%)
- Strong business cashflow (MSME segment)

### Team Workload Table

| Officer | Active Files | Pipeline ₹ | Load | Needs Action |
|---|---|---|---|---|
| Rahul Sharma | 12 | ₹8.4Cr | ████████░░ | + 3 |
| Priya Mehta | 9 | ₹6.1Cr | ██████░░░░ | + 1 |
| Ankit Joshi | 14 | ₹11.2Cr | ██████████ | + 5 |

---

## 1.9 Rejection Analysis

Tracks rejection patterns to help the NBFC refine product-market fit and sourcing quality.

### Charts

- Rejection rate by applicant segment (Salaried / Self-employed / MSME / Gig)
- BFS score distribution of rejected cohort — histogram
- Most common missing documents by frequency
- Rejection rate trend — week-on-week line chart
- Officer-level rejection rate comparison (admin view only)

---

# 2. Application Drill-Down Views

When a user clicks any application row, the workspace transforms into a focused environment for that specific file. The left nav shows Document Checklist, BFS Score View, and Credit Memo as active items. A back link appears at the top.

---

## 2.1 Application Header

Persistent across all drill-down views. White card, full width, 20px padding, 1px border.

### Content

```
Rajesh Kumar                                          APP-2847
Salaried · ₹4,20,000 Personal Loan · 36 months
Submitted: 18 Jul 2026 · Officer: Rahul Sharma

Progress: [████████████████████] 100% · Ready to decide

BFS Score: 78/100  ●  Risk: Low  ●  Recommendation: Approve

[View BFS Breakdown]  [Open Credit Memo]  [Make Decision]
```

---

## 2.2 Document Checklist

Consolidated view of all documents fetched and parsed. The checklist updates in real time as the agent reads each document.

### Section Header Copy

```
REQUIRED DOCUMENTS (8 of 8 complete)
All documents read and cross-checked by Zeyro AI.
```

### Standard Document Set (8 documents)

| # | Document | Source | Key Extracted Fields |
|---|---|---|---|
| 1 | Bank Statement (12 months) | AA feed (Sahamati) | Months covered · Avg inflow · Savings rate · NSF items |
| 2 | CIBIL Bureau Report | Auto-fetched | Score · DPD history · Active loans · Enquiries (60d) |
| 3 | Experian Bureau Report | Auto-fetched | Score · Negative marks · Enquiry count |
| 4 | ITR AY2024-25 | Findoc upload / AA | Gross income · Net taxable · Tax paid · ITR type |
| 5 | GST Returns (6 months) | Findoc upload | Turnover · Quarters filed · Gap months |
| 6 | Salary Slips (3 months) | Findoc upload | Employer · Gross salary · Net salary · Month range |
| 7 | KYC Documents | Uploaded by applicant | Name · Aadhaar last 4 · PAN · DOB |
| 8 | Existing Loan Sanction Letters | Findoc upload | Lender · Outstanding · EMI · Tenure remaining |

### Row States & Visual Treatment

- **Verified (✓)** — green check icon left. Row normal weight. 3–4 extracted fields shown inline below document name.
- **Analysing (⟳)** — animated spinner icon. Progress bar below document name. "Reading now..." in muted italic.
- **Missing (○)** — gray circle icon. "Not yet received" muted. `[Request document]` link triggers chat outreach.
- **Flagged (⚠)** — amber warning icon. Amber 3px left border. Inline consequence explanation (see 2.3). Link to chat thread.
- **Not required** — gray strikethrough text. No action needed.

### Verified Row Example

```
✓  Bank Statement             bank-statement-rajesh.pdf          Accepted
   MONTHS           AVG INFLOW        SAVINGS RATE    NSF ITEMS
   14 months        ₹52,400           22%             0
```

### Flagged Row Example

```
⚠  Bank Statement             bank-stmt-apr-may.pdf              Needs review
   ┌─────────────────────────────────────────────────────────────────────┐
   │ Bank statement covers April–May only. March is missing, so the      │
   │ 3-month deposit average cannot be computed. This caps the ATP score  │
   │ at 61 and limits max recommended EMI to ₹8,200 instead of ₹14,000.  │
   │ → Zeyro has requested the missing month from the applicant.          │
   └─────────────────────────────────────────────────────────────────────┘
   MONTHS           APRIL DEPOSITS    MAY DEPOSITS    ENDING BAL
   Apr–May only     ₹46,980           ₹49,440         ₹61,840
```

---

## 2.3 Flag Consequence Explanation

**This is a critical missing feature from v1.0.** A status tag alone is insufficient — every flag must explain its downstream impact on the BFS score and recommendation.

### Flag Banner Format

Shown below the document name on any Flagged row. Amber-tinted background (`#FEF3C7`). 13px text. Left 3px amber border.

### Example: Missing March Bank Statement

```
⚠ NEEDS REVIEW
Bank statement covers April–May only. March is missing, so the 3-month
deposit average cannot be computed. This caps the ATP score at 61 and
limits the maximum recommended EMI to ₹8,200 instead of the applied
₹14,000. Zeyro has requested the missing month from the applicant via
the platform chat.
```

### Example: ITR vs AA Income Mismatch

```
⚠ INCOME MISMATCH
ITR declares ₹8.4L gross income but AA-derived income is ₹6.2L — a 26%
gap above the 15% threshold. BFS score is capped until reconciled. This
may indicate income inflation for loan eligibility. Request ITR
clarification or GST turnover confirmation before approving.
```

### Example: Bureau Enquiry Spike

```
⚠ DISTRESS SIGNAL POSSIBLE
4 bureau enquiries detected in the last 60 days. This reduces the RPS
sub-score by 8 points. If enquiries resulted in new credit, EMI
obligations used in ATP may be understated. Verify no new loans were
drawn post-application.
```

---

## 2.4 Document Viewer Modal

Opens when user clicks any document row in the checklist. Full-screen modal overlay.

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ PDF  Balance Sheet  [Accepted]                               [×]    │
│      Casa_Verde_Balance_Sheet.pdf · received via Findoc upload      │
├──────────────────────────────────┬──────────────────────────────────┤
│                                  │ Extracted fields  Raw transcript │
│                                  │ ─────────────────────────────── │
│                                  │ Source-verified ████████████ 97% │
│                                  │                                  │
│         [PDF renders here]       │ EXTRACTED FIELDS (11)            │
│                                  │                                  │
│                                  │ As of            May 31, 2026    │
│                                  │ Total assets     ₹3,86,000       │
│                                  │ Net worth        ₹2,38,000       │
│                                  │ Total liabilities ₹1,48,000      │
│                                  │ Cash & equiv     ₹72,400         │
│                                  │ [+ 6 more fields]                │
│                                  │                                  │
│                                  │ AA CROSS-CHECK                   │
│                                  │ Declared  ₹8,40,000              │
│                                  │ AA-derived ₹6,20,000             │
│                                  │ Gap       ₹2,20,000 (26%) ⚠      │
└──────────────────────────────────┴──────────────────────────────────┘
```

### Extracted Fields Tab

- `Source-verified [progress bar] 97%` at top — reflects extraction confidence
- `EXTRACTED FIELDS (N)` label in small caps
- Each field: label in 11px small caps muted · value in 18px regular dark
- `[+ N more fields]` expandable link if > 6 fields

### Cross-Validation Block (shown when mismatch exists)

- AA-derived value vs Findoc-extracted value side by side
- Gap amount and percentage
- Threshold marker (e.g., "> 15% triggers flag")
- Amber background if gap exceeds threshold

### Needs Review Banner

If document is flagged, amber banner at top of modal below header:

```
ISSUE: [consequence explanation text — same as flag banner copy from 2.3]
```

### Raw Transcription Tab

Full text extracted from PDF in monospace font. `[Copy to clipboard]` button top right. Useful for compliance review.

---

## 2.5 BFS Score View

Proprietary scoring view. Opens from `[View BFS Breakdown]` in application header or from left nav.

### Score Header

```
78 / 100
Low Risk  ·  Confidence 91%

[░░░░░░░░░░░░░░████████████████████████████] 
0          45          62                  100
Critical   High        Medium              Low

Data sources: AA · CIBIL · Experian · Findoc v2.1
Scored at: 18 Jul 2026, 10:34 AM IST
```

### Four Component Scores

| Component | Score | Weight | Contribution | Key Signals |
|---|---|---|---|---|
| Cash Flow Health | 81 / 100 | 35% | 28.4 pts | Inflow stability, savings rate, surplus ratio |
| Bureau & Repayment History | 76 / 100 | 30% | 22.8 pts | DPD, bureau score, EMI consistency |
| Banking Behaviour | 74 / 100 | 20% | 14.8 pts | Spend discipline, P2P flags, cash withdrawals |
| Business Vintage & Stability | 71 / 100 | 15% | 10.65 pts | ITR consistency, GST filing, employer tenure |
| **COMPOSITE** | **78 / 100** | **100%** | **76.65 → 78** | |

### Per-Component Breakdown Format

For each component show:

- **Positive signals** — green check, signal description, citation chip `[1]` linking to source document
- **Risk signals** — amber warning, signal description, mitigant explanation in muted text below
- **Neutral signals** — gray, informational only

### Example: Cash Flow Health Breakdown

```
CASH FLOW HEALTH — 81 / 100

POSITIVE SIGNALS
  ✓  Consistent salary credit for 14 consecutive months [1]
     ₹52,400 avg inflow, zero months below ₹48,000

  ✓  Savings rate 22% — above segment avg of 16% [1]

  ✓  Essential spend dominates — 68% of outflows [1]

RISK SIGNALS
  ⚠  Discretionary spend spike — October 2025 [1]
     → Mitigant: Festival season pattern. Spend reverted to
       baseline ₹7,800 in November 2025.
```

### ATP Calculation Block

```
ATP — ABILITY TO PAY
─────────────────────────────────────────
Monthly avg inflow              ₹52,400   [1]
Existing EMI obligations        ₹14,200   [3]
Net monthly surplus             ₹38,200
Applied EMI                     ₹14,200
Post-loan surplus               ₹24,000
Surplus / EMI ratio             1.69x     ✓ Above 1.2x threshold
Max recommended EMI             ₹18,400
```

### Citation Chips

Every data point in the BFS view must have a citation chip `[1]` `[2]` `[3]` inline. Chips are small gray rounded pills in 12px monospace. Click opens Document Viewer modal to the exact source line.

**Citation Index (shown at bottom of view):**
```
[1] Bank Statement — AA feed · 14 months
[2] Findoc extraction · ITR AY2024-25
[3] CIBIL Bureau report
[4] Experian Bureau report
```

---

## 2.6 Credit Memo

Auto-generated structured document. Opens from `[Open Credit Memo]` in application header. Primary output the loan officer reviews before making a decision.

### Header

```
CREDIT DECISION MEMO
Application APP-2847 · Rajesh Kumar
Drafted: 18 Jul 2026, 10:41 AM · Zeyro AI Underwriter v2.1
                                        [i]  [🔒]  [✎]  [↓]
```

Right sidebar tabs: `Documents  10` · `Chat  4`

### Memo Sections

**1. Deal Summary** — `drafted by Zeyro AI Underwriter` [i] [🔒] [✎]

```
Rajesh Kumar is a salaried software engineer at Infosys Ltd seeking
a ₹4,20,000 personal loan over 36 months at the proposed EMI of
₹14,200/month [1][3]. Monthly net salary is ₹52,400 with 14 months
of consistent credit history [1]. Loan purpose: home renovation.
Existing obligations: one active personal loan EMI of ₹8,200/month [3].
```

**2. Financial Summary** — `drafted by Zeyro AI Underwriter` [i] [🔒] [✎]

| Metric | Applicant | Benchmark |
|---|---|---|
| Gross income | ₹6,80,000 | — |
| Net monthly inflow | ₹52,400 | — |
| Savings rate | 22% | 16% (segment avg) |
| EMI obligation ratio | 27% | < 40% (threshold) |
| Post-loan surplus | ₹24,000/month | — |
| Bureau score | 741 | > 650 (threshold) |
| BFS composite | 78/100 | ≥ 62 (auto-approve) |

**3. Strengths, Risks & Mitigants** — `drafted by Zeyro AI Underwriter` [i] [🔒] [✎]

```
STRENGTHS
● Consistent salary credit for 14 consecutive months [1]
  → ₹52,400 avg inflow, zero months below ₹48,000

● Savings discipline — 22% savings rate [1]
  → Above segment average of 16% for salaried applicants

● Clean bureau history — zero DPD, no defaults [3][4]
  → 2 enquiries noted but assessed as non-distress

RISKS & MITIGANTS
● 2 bureau enquiries in last 60 days [3]
  Mitigant: Both enquiries pre-date this application by 45 days.
  No new credit drawn since. Pattern consistent with rate shopping.

● Discretionary spend spike October 2025 [1]
  Mitigant: Festival season pattern confirmed by merchant analysis.
  Spend reverted to baseline from November 2025 onwards.
```

**4. Cash Flow & DSCR** — `drafted by Zeyro AI Underwriter` [i] [🔒] [✎]

Net cash build chart (sparkline). Inflow/outflow table. Surplus computation. DSCR if applicable.

**5. Recommendation** — `drafted by Zeyro AI Underwriter` [i] [🔒] [✎]

```
RECOMMENDED — APPROVE

Rajesh Kumar demonstrates strong repayment propensity, consistent
income, and sufficient surplus to service the proposed EMI. BFS
composite of 78 exceeds the auto-approve threshold of 62 [1][3][4].
Post-loan surplus of ₹24,000/month provides adequate buffer.

No conditions required for this application.
```

### Citation Chips — mandatory throughout

Every number and every claim in the credit memo must have a citation chip `[1]` `[2]` `[3]` inline. Click opens document viewer to source line. This is the RBI audit mechanism.

### Section Edit Mode

Each section header shows `drafted by Zeyro AI Underwriter` 12px muted right-aligned. Edit icon (pencil) allows loan officer to override any section. Lock icon marks a section as reviewed and locked. Edited sections show `edited by [Officer Name]` instead.

---

## 2.7 Decision Actions

Fixed bottom bar in the Credit Memo view. Always visible regardless of scroll position.

```
[Approve]  [Approve with conditions ▾]  [Reject]  [Escalate to Credit Head]

Add note: _________________________________________________ [Submit]
```

### Approve with Conditions Dropdown

Slides down from the button:

```
CONDITIONS PRIOR TO DISBURSEMENT
─────────────────────────────────────────────
☐  Submit 3 months salary slips (only 1 month provided)
☐  Confirm loan purpose documentation (home renovation estimate)
☐  [+ Add custom condition]

[Generate conditions PDF]  [Send to applicant via platform chat]
[Save conditions and approve pending]
```

- AI pre-populates conditions from flags and missing items identified during review
- Loan officer can add manual conditions
- `[Send to applicant via platform chat]` triggers a message in the chat thread
- `[Save conditions and approve pending]` sets status to Conditional and activates Conditions Tracker

---

# 3. Right Panel — Integrated Chat & Logs

380px fixed right panel. Persistent across all views. Two tabs at top with live counts. Auto-resets context and loads correct application thread when switching between applications.

```
┌─────────────────────────────────────────────┐
│  Chat  4          Agent Logs  12            │
│  ──────                                     │
```

---

## 3.1 Chat Tab — Normal State

### Thread Structure

- Sender name + role tag + timestamp on every message
- **AI messages:** left-aligned, light gray bubble (`#F3F4F6`), dark text
- **Loan officer messages:** right-aligned, dark bubble (`#111111`), white text
- **System notes:** centered, 12px muted italic, no bubble, subtle left border
- **Applicant messages:** left-aligned, pale teal bubble (`#E6F4F1`), `Applicant · APP-XXXX` tag
- **AI "To Applicant" outbound:** left-aligned, 3px teal left border, light background, `Zeyro AI · To Applicant` label

### Sample Thread — Normal State (APP-2847)

```
Zeyro AI  · Agent  · 10:32 AM
I've reviewed all 8 documents for APP-2847. Everything is in order —
BFS score is 78, risk tier is Low. Credit memo is ready for your
review. Ready to take a decision?

─── Loan officer joined ─────────────────────────────── 10:33 AM

Rahul Sharma  · Loan Officer  · 10:33 AM
Looks good. Any concerns on the October spend spike?

Zeyro AI  · Agent  · 10:33 AM
October spike is festival season — Diwali pattern visible across the
portfolio. Same applicant spent ₹14,200 that month vs avg ₹8,400.
Reverted to ₹7,800 in November. Not assessed as a risk signal. [1]

[1] Bank Statement AA feed · Oct 2025 entry

─── Decision recorded ──────────────────────────────── 10:41 AM
  ✓ APP-2847 approved · ₹4,20,000 · 36 months
```

---

## 3.2 Chat Tab — Document Issue State

When the agent identifies a missing or flagged document, it automatically composes an outreach message to the applicant within the platform chat. The loan officer sees the full thread.

### Trigger Conditions for Auto-Outreach

- Document status = Missing and it is required for BFS computation
- Flag raised that requires applicant explanation (income mismatch, cash dip, bounce)
- Condition post-approval requires a document from the applicant

### Message Types

| Type | Visual Treatment | Label |
|---|---|---|
| Internal AI note | Light gray bubble, left-aligned | `Zeyro AI · Agent` |
| Outbound to applicant | Teal 3px left border, light bg | `Zeyro AI · To Applicant` |
| Applicant reply | Pale teal bubble, left-aligned | `Applicant · APP-XXXX` |
| Loan officer | Dark bubble, right-aligned | `[Officer Name] · Loan Officer` |
| System note | Centered, italic, muted | No bubble |

### Sample Thread — Document Gap Flow (APP-2831)

```
Zeyro AI  · Agent  · 10:28 AM
I've read 7 of 8 documents for APP-2831. One issue found:

Bank statement covers April–May only. March is missing. Without March,
the 3-month deposit average cannot be computed — this caps ATP and
limits max recommended EMI. I've sent a message to the applicant
requesting the missing month.

─── Applicant message sent ──────────────────────────── 10:28 AM

Zeyro AI  · To Applicant  · 10:28 AM
Hi, we're reviewing your loan application (APP-2831). Your bank
statement covers April and May — we need March as well to complete
the 3-month income verification. Could you upload the March statement
from your bank app or share a PDF? We'll update your file as soon as
we receive it.
[Delivered]

Rahul Sharma  · Loan Officer  · 10:29 AM
Good catch. Let's wait for the response before proceeding.

─── Applicant replied ───────────────────────────────── 10:34 AM

Applicant  · APP-2831  · 10:34 AM
Sorry about that, grabbed the wrong file. Here's the full March to
May statement.
[📎 Bank_Statement_Mar_May_2831.pdf]

Zeyro AI  · Agent  · 10:34 AM
Got it. Reading the March statement now.

─── Document updated ────────────────────────────────── 10:35 AM

Zeyro AI  · Agent  · 10:35 AM
March statement processed. Key finding: April deposits ran light
(₹31,200 vs avg ₹48,400) — flagged for review. I've asked the
applicant about this.

Zeyro AI  · To Applicant  · 10:35 AM
One more thing — April deposits were lower than your other months
and the balance dipped that month. Can you help us understand what
happened? This helps our underwriter read the trend accurately.
[Delivered]

Applicant  · APP-2831  · 10:37 AM
In April we prepaid the full year on our kitchen equipment lease,
so cash was tight for a couple of weeks. Bounced right back in May.

Zeyro AI  · Agent  · 10:37 AM
Logged. April dip recorded as one-time annual lease prepayment —
not a cashflow problem. Reconciled against May deposits.

─── Document status updated ─────────────────────────── 10:37 AM
  ✓ Bank Statements accepted · 3 months complete
    March, April, May all present.

Zeyro AI  · Agent  · 10:38 AM
All 8 documents now accepted. BFS score updated. Credit memo is ready.

APP-2831 BFS Score: 61/100
Risk Tier: Medium
Recommendation: Approve with conditions
```

---

## 3.3 Agent Logs Tab

Real-time developer and compliance event stream.

**Visual:** Dark background (`#1A1A1A`). Monospace 12px. Green for `[INFO]`, amber for `[WARN]`, red for `[ERROR]`. Scrollable, newest at bottom.

### Log Line Format

```
[HH:MM:SS]  [LEVEL]   [Agent/Source] · [Event description] · [Detail]
```

### Sample Log Lines

```
10:28:04  [INFO]   APP-2831 · Document parse triggered · bank-stmt-apr-may.pdf
10:28:06  [INFO]   Findoc v2.1 · Extraction complete · 8 fields · confidence 94%
10:28:06  [WARN]   Coverage gap detected · March 2026 missing from statement
10:28:07  [INFO]   ATP score computation paused · insufficient months
10:28:08  [INFO]   Applicant outreach message composed · APP-2831
10:28:08  [INFO]   Message delivered to applicant thread
10:34:12  [INFO]   Applicant response received · attachment detected
10:34:13  [INFO]   New document queued · Bank_Statement_Mar_May_2831.pdf
10:34:21  [INFO]   Findoc v2.1 · Extraction complete · 12 fields · confidence 97%
10:34:22  [WARN]   April deposits ₹31,200 · 35% below 6-month avg
10:34:23  [INFO]   Follow-up message composed · April anomaly
10:37:44  [INFO]   Applicant explanation received · logged to file
10:37:45  [INFO]   Context note added: April dip = lease prepayment + seasonality
10:37:46  [INFO]   Bank statements status → Accepted
10:37:47  [INFO]   BFS score recomputed · 54 → 61
10:38:01  [INFO]   Credit memo generated · APP-2831
10:38:01  [INFO]   Recommendation: Approve with conditions
```

### Controls

```
[Download logs]  [Copy to clipboard]  [Filter: ALL ▾]
```

Filter options: ALL / INFO / WARN / ERROR

---

# 4. Empty / Sandbox State

Shown when no applications are connected or the workspace is in sandbox mode with no data. First screen a new NBFC client sees in a demo.

### Sandbox Banner

Persistent 32px bar at top of page, amber background:

```
You're in Sandbox Mode — all data is simulated.
Request production access to connect real applications. →
```

### Empty Center State

```
No applications yet.

Connect your Loan Origination System or create your first application
manually to get started. Zeyro will read every document, score every
applicant, and have a credit memo ready before your loan officer
opens the file.

[Connect LOS via API]     [Create application manually]

Already have files? Upload documents to a test application →
```

---

# 5. Engineering Tasks

All tasks required to ship the complete Underwriting Agent Workspace. Prioritised P0 (blocking / demo-ready), P1 (core feature / enterprise sale-ready), P2 (enhancement / production polish).

---

## 5.1 P0 — Blocking (Demo-Ready)

| Task ID | Task | Owner | Status |
|---|---|---|---|
| UW-001 | Build Application Pipeline table with status pills, progress bar, and stage tooltip on hover | Frontend | To Do |
| UW-002 | Implement pipeline progress bar — 5 stages, computed from document checklist + BFS + decision state | Frontend | To Do |
| UW-003 | Build Document Checklist view — real-time status updates (Verified / Analysing / Missing / Flagged) | Frontend | To Do |
| UW-004 | Integrate Findoc Analyser output into Document Checklist — extracted fields shown inline per row | Full Stack | To Do |
| UW-005 | Build Document Viewer modal — PDF left panel + Extracted fields right panel | Frontend | To Do |
| UW-006 | Source-verified percentage in Document Viewer — pulled from Findoc confidence score | Full Stack | To Do |
| UW-007 | AA vs Findoc cross-validation block in Document Viewer — income mismatch detection and display | Backend | To Do |
| UW-008 | Flag consequence explanation — compute and display downstream BFS impact for each flag type | Backend | To Do |
| UW-009 | BFS Score View — four component breakdown with individual scores, weights, contribution column | Frontend | To Do |
| UW-010 | BFS positive signals and risk signals per component — pulled from scoring engine output | Full Stack | To Do |
| UW-011 | ATP calculation block in BFS view — surplus, ratio, max EMI computation | Backend | To Do |
| UW-012 | Citation chips throughout BFS view — chip → document viewer to source line | Frontend | To Do |
| UW-013 | Credit Memo auto-generation — structured memo from BFS + document outputs | Backend / AI | To Do |
| UW-014 | Citation chips in Credit Memo — every claim linked to source document line | Frontend | To Do |
| UW-015 | Decision Actions bottom bar — Approve / Approve with conditions / Reject / Escalate | Frontend | To Do |
| UW-016 | Approve with conditions dropdown — AI-generated condition list + manual add + send to applicant | Full Stack | To Do |
| UW-017 | Integrated Chat — full thread UI with role-tagged messages, timestamps, system notes | Frontend | To Do |
| UW-018 | Agent auto-outreach — trigger logic: which flags generate automatic applicant messages | Backend / AI | To Do |
| UW-019 | Chat thread — applicant reply handling: message appears, attachment chip, checklist auto-updates | Full Stack | To Do |
| UW-020 | Chat context reset on application switch — thread clears and loads correct app thread | Frontend | To Do |

---

## 5.2 P1 — Core Feature (Enterprise Sale-Ready)

| Task ID | Task | Owner | Status |
|---|---|---|---|
| UW-021 | Agent Logs tab — real-time event stream, colour coded by level, filter controls | Frontend | To Do |
| UW-022 | Left nav portfolio BFS score badge — live score from Credit Sentinel | Frontend | To Do |
| UW-023 | Stat cards row — four cards with delta vs yesterday, BFS threshold with edit link | Frontend | To Do |
| UW-024 | Decision Log — full audit trail table with filters, CSV/PDF export | Full Stack | To Do |
| UW-025 | Override History — log with agent recommendation → human decision → officer → reason | Full Stack | To Do |
| UW-026 | 90-day outcome tracking on overrides — repayment status tag (on time / missed / NPA / pending) | Backend | To Do |
| UW-027 | Conditions Tracker — itemized checklist per applicant, [Mark as met] action, [Send reminder] via chat | Full Stack | To Do |
| UW-028 | Pipeline Insights view — decision breakdown, top rejection reasons, top approval drivers, bar charts | Frontend | To Do |
| UW-029 | Team Workload table — files per officer, pipeline value, load bar, needs action count | Full Stack | To Do |
| UW-030 | Credit Memo section edit mode — pencil icon per section, [edited by Officer] tag on modified sections | Frontend | To Do |
| UW-031 | Raw Transcription tab in Document Viewer — full PDF text extraction, copy to clipboard | Full Stack | To Do |
| UW-032 | Application header — persistent across all drill-down views, progress bar, action buttons | Frontend | To Do |
| UW-033 | Sandbox state — empty center copy, CTAs, sandbox banner at top | Frontend | To Do |
| UW-034 | New Application manual creation flow — form with document upload, sends to checklist | Full Stack | To Do |
| UW-035 | LOS API integration — fetch applications from NBFC loan origination system via webhook | Backend | To Do |

---

## 5.3 P2 — Enhancement (Production Polish)

| Task ID | Task | Owner | Status |
|---|---|---|---|
| UW-036 | Rejection Analysis view — charts: rejection rate by segment, BFS histogram, missing docs frequency | Frontend | To Do |
| UW-037 | Officer-level rejection rate comparison in Rejection Analysis (admin view only) | Full Stack | To Do |
| UW-038 | Pipeline filter persistence — save filter state across page navigation | Frontend | To Do |
| UW-039 | Credit Memo PDF export — [Generate PDF] button, formatted output with citations | Full Stack | To Do |
| UW-040 | RBI-format audit log export from Decision Log — structured export for regulatory submission | Backend | To Do |
| UW-041 | Notification rules — email/webhook alert when application reaches Ready to Decide stage | Backend | To Do |
| UW-042 | BFS threshold configuration UI — [Edit] link in stat card opens threshold settings panel | Full Stack | To Do |
| UW-043 | Chat — loan officer can manually draft and send messages to applicant, not just AI-generated | Frontend | To Do |
| UW-044 | Processing stage tooltip with stepper component on progress bar hover | Frontend | To Do |
| UW-045 | Kebab menu on pipeline rows — View / Assign Officer / Archive actions | Frontend | To Do |

---

## 5.4 Priority Summary

| Priority | Tasks | Count | What it unlocks |
|---|---|---|---|
| P0 | UW-001 to UW-020 | 20 | Core underwriting workflow: pipeline → checklist → score → memo → decision → chat. Demo-ready and pilot-ready. |
| P1 | UW-021 to UW-035 | 15 | Audit trail, override history, conditions tracker, portfolio insights, team workload. Enterprise sale-ready. |
| P2 | UW-036 to UW-045 | 10 | Rejection analysis, RBI export, PDF credit memo, notification rules, threshold config. Production polish. |
| **Total** | | **45** | |

---

# 6. Open Questions for Engineering

1. **UW-018:** What is the exact trigger logic for auto-outreach? All missing required docs, or only those that block BFS computation?

2. **UW-016:** Who generates the conditions list — the AI agent based on flags, or always manual by loan officer? Define the default set per flag type.

3. **UW-007:** AA cross-validation threshold — currently set at 15% mismatch. Is this configurable per NBFC client?

4. **UW-026:** 90-day outcome tracking requires a post-disbursement data feed from the LOS. Confirm this webhook exists or needs to be built.

5. **UW-035:** LOS integration — confirm which NBFC clients have an existing LOS API, and which will use manual application creation as the default path.

6. **UW-013:** Credit Memo generation — confirm whether this runs on `claude-sonnet-4-6` via Railway agent or direct Anthropic API call from Next.js.

7. **Chat delivery:** Applicant messages are sent via the platform UI. Does the applicant receive a notification (email/SMS) when a new message arrives, or is it in-app only?

---

*Zeyro B2B · Underwriting Agent Workspace · Spec v2.0 · July 2026 · Internal Use Only*