# Zeyro B2B Underwriting Backend API Specification (`z-b2b`)

**Version:** 2.0  
**Date:** July 2026  
**Target Backend:** `z-b2b` (Go / Node.js Microservices)  
**Spec Reference:** `Zeyro_Underwriting_Spec_v2.docx` & `BFS_ONBOARDING_API.md`

---

## 1. Architectural Overview & Context

The **Zeyro B2B Underwriting Backend (`z-b2b`)** serves as the central intelligence and orchestration layer powering the **Underwriting Agent Workspace**. It interfaces with:
1. **Loan Origination Systems (LOS):** Webhook & REST integrations to ingest applicant data.
2. **Findoc Document Analyser:** Document parsing, field extraction, OCR transcription, and confidence scoring.
3. **Account Aggregator (AA - Sahamati) & Credit Bureaus (CIBIL/Experian):** Financial statements and bureau report auto-fetching.
4. **BFS Scoring Engine:** Proprietary credit scoring computing Ability to Pay (ATP), Repayment Score (RPS), Business Cashflow Stability (BCS), and Financial Dependency Score (FDS).
5. **AI Credit Memo Generator:** Generates structured credit memos with citation tracking using LLM agents.
6. **Integrated Chat & Auto-Outreach:** Handles automated applicant outreach for missing/flagged documents and loan officer messaging.

---

## 2. Core Database Entities & Schemas

### 2.1 `applications`
- `id` (UUID, PK)
- `app_number` (VARCHAR, Unique - e.g., `APP-2831`)
- `applicant_name` (VARCHAR)
- `entity_type` (ENUM: `individual`, `corporate`)
- `applicant_segment` (ENUM: `salaried`, `self_employed`, `msme`, `gig`)
- `loan_amount` (DECIMAL)
- `tenure_months` (INT)
- `assigned_officer_id` (UUID, FK -> `users`)
- `stage` (ENUM: `submitted`, `document_collection`, `underwriting`, `memo_ready`, `decided`)
- `status` (ENUM: `pending`, `approved`, `approved_with_conditions`, `rejected`, `escalated`)
- `bfs_score` (INT)
- `risk_tier` (ENUM: `low`, `medium`, `high`, `critical`)
- `recommendation` (ENUM: `approve`, `approve_with_conditions`, `reject`, `escalate`)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 2.2 `documents`
- `id` (UUID, PK)
- `application_id` (UUID, FK -> `applications`)
- `doc_type` (ENUM: `bank_statement`, `cibil_report`, `experian_report`, `itr`, `gst_return`, `salary_slips`, `kyc`, `sanction_letter`)
- `source` (ENUM: `aa_feed`, `cibil_api`, `experian_api`, `findoc_upload`, `applicant_upload`)
- `status` (ENUM: `verified`, `analysing`, `missing`, `flagged`, `not_required`)
- `confidence_score` (DECIMAL, 0-100)
- `extracted_fields` (JSONB)
- `raw_transcription` (TEXT)
- `file_url` (VARCHAR)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 2.3 `flags`
- `id` (UUID, PK)
- `application_id` (UUID, FK -> `applications`)
- `document_id` (UUID, FK -> `documents`, Nullable)
- `flag_type` (ENUM: `missing_document`, `income_mismatch`, `enquiry_spike`, `dpd_history`, `fraud_alert`)
- `severity` (ENUM: `info`, `warning`, `critical`)
- `title` (VARCHAR)
- `consequence_description` (TEXT)
- `downstream_impact` (JSONB) -- e.g., `{"cap_atp_score": 61, "max_emi": 8200}`
- `is_resolved` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

### 2.4 `bfs_scores`
- `id` (UUID, PK)
- `application_id` (UUID, FK -> `applications`)
- `composite_score` (INT, 0-100)
- `risk_tier` (VARCHAR)
- `confidence_score` (DECIMAL)
- `atp_score` (INT), `rps_score` (INT), `bcs_score` (INT), `fds_score` (INT)
- `atp_metrics` (JSONB) -- `{monthly_surplus, emi_ratio, max_recommended_emi}`
- `positive_signals` (JSONB Array)
- `risk_signals` (JSONB Array)
- `citations` (JSONB Array)
- `calculated_at` (TIMESTAMPTZ)

### 2.5 `credit_memos`
- `id` (UUID, PK)
- `application_id` (UUID, FK -> `applications`)
- `executive_summary` (TEXT)
- `financial_analysis` (TEXT)
- `risk_assessment` (TEXT)
- `mitigants` (TEXT)
- `recommendation` (VARCHAR)
- `citation_map` (JSONB)
- `officer_edits` (JSONB) -- `{section: "financial_analysis", edited_by: "officer_123", timestamp: "..."}`
- `pdf_export_url` (VARCHAR)
- `generated_at` (TIMESTAMPTZ)

### 2.6 `decision_logs`
- `id` (UUID, PK)
- `application_id` (UUID, FK -> `applications`)
- `officer_id` (UUID, FK -> `users`)
- `ai_recommendation` (VARCHAR)
- `final_decision` (VARCHAR)
- `override_occurred` (BOOLEAN)
- `override_reason` (TEXT)
- `conditions` (JSONB Array)
- `outcome_90d` (ENUM: `on_time`, `missed_payment`, `npa`, `pending`)
- `decided_at` (TIMESTAMPTZ)

### 2.7 `chat_messages`
- `id` (UUID, PK)
- `application_id` (UUID, FK -> `applications`)
- `sender_type` (ENUM: `agent`, `officer`, `applicant`, `system`)
- `sender_id` (VARCHAR)
- `message_text` (TEXT)
- `attachment_doc_id` (UUID, FK -> `documents`, Nullable)
- `is_auto_outreach` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

---

## 3. REST API Endpoint Specifications

### 3.1 Application Pipeline & Workspace APIs

#### `GET /api/v1/underwriting/applications`
Fetch paginated application pipeline with filter controls.

**Query Parameters:**
- `search` (string) - Search applicant name, App ID, or officer
- `status` (string) - Filter by stage (`submitted`, `document_collection`, `underwriting`, `memo_ready`, `decided`)
- `entity_type` (string) - `individual` | `corporate`
- `loan_min` / `loan_max` (number)
- `officer_id` (string)
- `page` (int, default: 1), `limit` (int, default: 20)

**Response `200 OK`:**
```json
{
  "total": 342,
  "page": 1,
  "limit": 20,
  "applications": [
    {
      "id": "app_98124712",
      "appNumber": "APP-2831",
      "applicantName": "Acme Software Solutions Pvt Ltd",
      "entityType": "corporate",
      "loanAmount": 2500000,
      "tenureMonths": 24,
      "stage": "underwriting",
      "progressPercentage": 75,
      "status": "pending",
      "bfsScore": 78,
      "riskTier": "low",
      "recommendation": "approve",
      "assignedOfficer": {
        "id": "usr_441",
        "name": "Sarah Jenkins",
        "avatarUrl": "https://cdn.zeyro.com/avatars/sarah.jpg"
      },
      "lastActivityAt": "2026-07-21T09:15:00Z"
    }
  ]
}
```

#### `GET /api/v1/underwriting/applications/{id}`
Fetch detailed application header and drill-down context.

**Response `200 OK`:**
```json
{
  "id": "app_98124712",
  "appNumber": "APP-2831",
  "applicantName": "Acme Software Solutions Pvt Ltd",
  "entityType": "corporate",
  "segment": "msme",
  "loanAmount": 2500000,
  "tenureMonths": 24,
  "submissionDate": "2026-07-20T14:30:00Z",
  "stage": "underwriting",
  "progressPercentage": 75,
  "assignedOfficer": {
    "id": "usr_441",
    "name": "Sarah Jenkins"
  },
  "bfsSummary": {
    "score": 78,
    "riskTier": "low",
    "recommendation": "approve",
    "confidenceScore": 91.5
  },
  "unresolvedFlagsCount": 1
}
```

#### `POST /api/v1/underwriting/applications`
Manually create a new application in the workspace.

**Request Schema:**
```json
{
  "applicantName": "Rajesh Kumar",
  "entityType": "individual",
  "segment": "salaried",
  "loanAmount": 500000,
  "tenureMonths": 36,
  "assignedOfficerId": "usr_441"
}
```

#### `POST /api/v1/underwriting/applications/los-webhook`
LOS Webhook endpoint to ingest new applications directly from NBFC Loan Origination System.

---

### 3.2 Document Checklist & Findoc / AA Intelligence APIs

#### `GET /api/v1/underwriting/applications/{id}/documents`
Fetch document checklist status with extracted summary fields and active flags.

**Response `200 OK`:**
```json
{
  "applicationId": "app_98124712",
  "completedCount": 7,
  "totalCount": 8,
  "documents": [
    {
      "id": "doc_101",
      "docType": "bank_statement",
      "source": "aa_feed",
      "status": "flagged",
      "confidenceScore": 97.0,
      "extractedFields": {
        "monthsCovered": 11,
        "avgMonthlyInflow": 215000,
        "savingsRate": 18.5,
        "nsfCount": 0
      },
      "flag": {
        "id": "flag_551",
        "severity": "warning",
        "title": "NEEDS REVIEW - March Statement Missing",
        "consequenceExplanation": "Bank statement covers April-May only. March is missing, so 3-month deposit avg cannot be computed. ATP capped at 61.",
        "downstreamImpact": {
          "cappedAtpScore": 61,
          "maxRecommendedEmi": 8200
        }
      }
    },
    {
      "id": "doc_102",
      "docType": "cibil_report",
      "source": "cibil_api",
      "status": "verified",
      "confidenceScore": 100.0,
      "extractedFields": {
        "score": 752,
        "dpdHistory": "0 DPD last 24m",
        "activeLoansCount": 2,
        "enquiries60d": 1
      }
    }
  ]
}
```

#### `GET /api/v1/underwriting/documents/{doc_id}/viewer`
Fetch detailed document view payload for document viewer modal (PDF stream link, extracted fields, AA cross-validation result, raw transcription).

**Response `200 OK`:**
```json
{
  "documentId": "doc_103",
  "docType": "itr",
  "source": "findoc_upload",
  "fileUrl": "https://cdn.zeyro.com/docs/app_2831/itr_ay24-25.pdf",
  "confidenceScore": 94.2,
  "extractedFields": [
    {"label": "Gross Income", "value": "₹8,40,000"},
    {"label": "Net Taxable Income", "value": "₹7,20,000"},
    {"label": "Tax Paid", "value": "₹62,500"},
    {"label": "ITR Form Type", "value": "ITR-3"}
  ],
  "crossValidation": {
    "hasMismatch": true,
    "sourceA": {"label": "AA Derived Income", "value": "₹6,20,000"},
    "sourceB": {"label": "ITR Declared Income", "value": "₹8,40,000"},
    "gapAmount": 220000,
    "gapPercentage": 26.2,
    "thresholdPercentage": 15.0,
    "warningText": "ITR declares ₹8.4L gross income but AA-derived income is ₹6.2L (26% gap). Exceeds 15% threshold."
  },
  "rawTranscription": "INDIAN INCOME TAX RETURN ACKNOWLEDGEMENT... Assessment Year: 2024-25..."
}
```

#### `POST /api/v1/underwriting/applications/{id}/documents/upload`
Upload document file (Findoc processing trigger).

---

### 3.3 BFS (Business Financial Scoring) Engine APIs

#### `GET /api/v1/underwriting/applications/{id}/bfs-score`
Fetch composite score, risk tier, 4-component breakdown, surplus/ATP metrics, and citation chips.

**Response `200 OK`:**
```json
{
  "applicationId": "app_98124712",
  "compositeScore": 78,
  "riskTier": "low",
  "confidenceLevel": 91.5,
  "scoringZone": "medium_low",
  "scoredAt": "2026-07-21T08:00:00Z",
  "components": {
    "atp": {
      "score": 75,
      "weight": 0.35,
      "contribution": 26.25,
      "monthlySurplus": 45000,
      "emiObligationRatio": 28.5,
      "maxRecommendedEmi": 18000
    },
    "rps": {
      "score": 84,
      "weight": 0.30,
      "contribution": 25.20
    },
    "bcs": {
      "score": 72,
      "weight": 0.20,
      "contribution": 14.40
    },
    "fds": {
      "score": 80,
      "weight": 0.15,
      "contribution": 12.00
    }
  },
  "positiveSignals": [
    {
      "text": "Consistent salary credit for 12+ consecutive months",
      "citation": {"docId": "doc_101", "page": 2, "line": 45}
    },
    {
      "text": "Low existing EMI obligation ratio (28.5% < 35% threshold)",
      "citation": {"docId": "doc_102", "page": 1, "line": 12}
    }
  ],
  "riskSignals": [
    {
      "text": "Income mismatch gap of 26.2% between ITR and AA feed",
      "citation": {"docId": "doc_103", "page": 1, "line": 8}
    }
  ]
}
```

#### `POST /api/v1/underwriting/applications/{id}/bfs-score/recalculate`
Trigger scoring engine re-computation.

#### `GET/PUT /api/v1/underwriting/settings/bfs-threshold`
Configure auto-approval threshold parameters across the NBFC workspace.

---

### 3.4 Credit Memo Auto-Generation APIs

#### `GET /api/v1/underwriting/applications/{id}/credit-memo`
Fetch structured credit memo with citation mapping and edit history.

**Response `200 OK`:**
```json
{
  "applicationId": "app_98124712",
  "memoId": "memo_9012",
  "sections": {
    "executiveSummary": "Applicant demonstrates strong repayment history with a BFS score of 78...",
    "financialAnalysis": "Average monthly inflow is ₹2,15,000 with a monthly surplus of ₹45,000...",
    "riskAssessment": "Primary risk factor is a 26.2% variance between declared ITR income and AA inflows...",
    "recommendation": "Approve loan of ₹25,00,000 for 24 months subject to ITR clarification."
  },
  "citationChips": [
    {
      "chipId": "cit_1",
      "claim": "Average monthly inflow ₹2,15,000",
      "sourceDocId": "doc_101",
      "sourceLine": "Page 3, Line 18"
    }
  ],
  "officerEdits": [
    {
      "sectionKey": "financialAnalysis",
      "editedByOfficer": "Sarah Jenkins",
      "editedAt": "2026-07-21T09:10:00Z"
    }
  ]
}
```

#### `POST /api/v1/underwriting/applications/{id}/credit-memo/generate`
Trigger AI generation workflow (Claude Sonnet 4.6 agent call).

#### `PATCH /api/v1/underwriting/applications/{id}/credit-memo/section`
Update a specific section of the credit memo manually.

**Request Schema:**
```json
{
  "sectionKey": "financialAnalysis",
  "updatedContent": "Updated financial analysis text by loan officer..."
}
```

#### `GET /api/v1/underwriting/applications/{id}/credit-memo/export`
Generate and download PDF credit memo.

---

### 3.5 Decisioning, Conditions & Audit Log APIs

#### `POST /api/v1/underwriting/applications/{id}/decision`
Submit final human underwriting decision.

**Request Schema:**
```json
{
  "decision": "approved_with_conditions",
  "conditions": [
    "Submit March 2026 bank statement",
    "Provide written clarification for ITR income variance"
  ],
  "decisionNotes": "Approved based on strong repayment track record despite ITR variance.",
  "overrideOccurred": true,
  "overrideReason": "Officer verified cash sales offset the AA variance."
}
```

#### `GET /api/v1/underwriting/conditions`
Fetch conditions tracker table across conditional approvals.

**Query Parameters:** `status` (`pending` | `met` | `waived`), `officer_id`, `page`

**Response `200 OK`:**
```json
{
  "conditions": [
    {
      "conditionId": "cond_801",
      "applicationId": "app_98124712",
      "appNumber": "APP-2831",
      "applicantName": "Acme Software Solutions Pvt Ltd",
      "description": "Submit March 2026 bank statement",
      "status": "pending",
      "daysSinceApproval": 3,
      "metDate": null
    }
  ]
}
```

#### `PATCH /api/v1/underwriting/conditions/{condition_id}`
Update condition status (`met` | `waived`) or trigger chat reminder.

#### `GET /api/v1/underwriting/decision-log`
Fetch decision audit log with 90-day outcome tags.

#### `POST /api/v1/underwriting/decision-log/rbi-export`
Export decision log in RBI-mandated regulatory audit format (CSV/PDF).

---

### 3.6 Integrated Chat & Applicant Communication APIs

#### `GET /api/v1/underwriting/applications/{id}/chat`
Fetch chat message thread for an application.

**Response `200 OK`:**
```json
{
  "applicationId": "app_98124712",
  "messages": [
    {
      "id": "msg_001",
      "senderType": "agent",
      "senderName": "Zeyro AI Assistant",
      "messageText": "We noticed your March bank statement is missing. Please upload it to complete underwriting.",
      "isAutoOutreach": true,
      "timestamp": "2026-07-20T15:00:00Z"
    },
    {
      "id": "msg_002",
      "senderType": "applicant",
      "senderName": "Acme Founder",
      "messageText": "Here is the March statement.",
      "attachmentDocId": "doc_109",
      "timestamp": "2026-07-21T08:30:00Z"
    }
  ]
}
```

#### `POST /api/v1/underwriting/applications/{id}/chat/messages`
Send message from loan officer or applicant.

#### `POST /api/v1/underwriting/applications/{id}/chat/auto-outreach`
Trigger AI agent automated outreach for missing docs/flags.

---

### 3.7 Portfolio Insights & Team Workload APIs

#### `GET /api/v1/underwriting/insights/pipeline`
Fetch high-level portfolio metrics, decision breakdowns, top rejection reasons, and approval drivers.

#### `GET /api/v1/underwriting/insights/rejection-analysis`
Fetch rejection distribution histograms, segment breakdown, and missing doc frequencies.

#### `GET /api/v1/underwriting/insights/team-workload`
Fetch team load table (files per officer, active pipeline value, needs action counts).

#### `GET /api/v1/underwriting/agent-logs`
Stream or fetch real-time agent execution logs (`INFO`, `WARN`, `ERROR`).

---

## 4. Real-time Event Stream (WebSocket / SSE)

For real-time UI updates (e.g., as Findoc reads documents, BFS score updates, or applicant messages arrive), `z-b2b` exposes a Server-Sent Events (SSE) or WebSocket endpoint:

**Endpoint:** `GET /api/v1/underwriting/stream?applicationId={id}`

**Event Types:**
- `document.analyzing` - Document parsing started.
- `document.verified` - Document verified with confidence score.
- `document.flagged` - Flag generated with consequence explanation.
- `bfs.updated` - BFS score recomputed.
- `chat.message` - New chat message received.

---

## 5. Summary of Implementation Roadmap for `z-b2b`

1. **P0 (Blocking / Core Flow):**
   - Endpoints: Pipeline List, App Header Details, Document Checklist, Findoc/AA Integration, BFS Score Breakdown, AI Credit Memo Generation, Decision Submission, Integrated Chat.
2. **P1 (Core Feature / Enterprise):**
   - Endpoints: Audit Trail / Decision Log, Override History, Conditions Tracker, Portfolio Insights, Team Workload, PDF Credit Memo Export.
3. **P2 (Enhancements & Compliance):**
   - Endpoints: Rejection Analysis, RBI Format Audit Export, Threshold Configuration UI, Notification Rules Webhook.
