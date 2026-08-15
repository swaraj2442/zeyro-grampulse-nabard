> ZEYRO · DEVELOPER DOCUMENTATION

# Zeyro Intelligence

## Product Catalog

Six intelligence products. Ten use cases. One unified API — *built natively for Indian banks, NBFCs, fintechs, and digital lenders.*

v1.0 · July 2025 · B2B · INDIA · intelligence.zeyro.in

## 00 · INTRODUCTION

### Financial intelligence infrastructure for banks.

Zeyro Intelligence is India's financial intelligence infrastructure — a suite of six intelligence products delivered via a unified API that enables banks, NBFCs, and fintechs to ingest financial data and transform it into production-ready intelligence.

Where legacy fintech data platforms provide raw data pipes, Zeyro provides **intelligence primitives** — enriched, reasoned, explainable outputs that your systems can act on directly. Underwriting decisions, fraud signals, cashflow alerts, document parsing, and autonomous agent actions — all from a single integration.

> **API PROMISE**
>
> Sub-250ms API response. 10+ intelligence models. Enterprise SLA. TypeScript and Python SDKs. Deploy on Zeyro managed cloud, your cloud (AWS/Azure/GCP), or private on-premises infrastructure.

#### Product catalog

| NO. | PRODUCT | DESCRIPTION |
| --- | --- | --- |
| 01 | **Credit Underwriting** | Behavioural credit intelligence beyond bureau scores |
| 02 | **Transaction Enrichment** | Real-time merchant classification and behavioural signals |
| 03 | **Cashflow Monitoring** | Continuous AA-linked income and liability tracking |
| 04 | **Device & Behavioural Intelligence** | Alternate data for thin-file and NTC borrowers |
| 05 | **AI Agent Suite** | Autonomous financial agents for complex decisioning workflows |
| 06 | **FinDoc Analyser** | Document parsing for bank statements, GST, ITR, and financial filings |

> **STATUS**
>
> All six products are in active development. Credit Underwriting and Transaction Enrichment are the first generally available products. Cashflow Monitoring, Device & Behavioural Intelligence, AI Agent Suite, and FinDoc Analyser are in private beta. Contact Zeyro to join the early access programme.

## PRODUCT 01

### Credit Underwriting

*Move beyond bureau scores. Behavioural intelligence, cashflow analysis, and explainable risk signals for faster, more accurate lending decisions.*

India's 9,500+ NBFCs and digital lenders collectively serve a credit market of over ₹54 trillion in AUM — yet the MSME credit gap stands at $380 billion. The majority of this gap exists because bureau-only underwriting cannot assess thin-file or new-to-credit (NTC) borrowers. Zeyro's Credit Underwriting product closes this gap.

#### Core capabilities

- **Behavioural Financial Score (BFS):** A proprietary risk score trained on UPI transaction patterns, NACH compliance, account balance velocity, and payment behaviour — not just bureau tradelines. Designed specifically for thin-file MSME and NTC consumer segments in India.

- **Multi-Bureau Intelligence:** Normalized pull and reconciliation across all four RBI-licensed bureaus — CIBIL TransUnion, CRIF High Mark, Experian, and Equifax. Consolidated tradeline view with adverse history contextually flagged.

- **AA-Powered Cashflow Underwriting:** Bank account data sourced via the RBI Account Aggregator framework (FIP-FIU consent model) parsed into income streams, EMI obligations, NACH bounce rate, seasonal variance, and average surplus.

- **GST Intelligence Layer:** GSTR-1 and GSTR-3B filings cross-validated against AA bank credits. Revenue declared vs. revenue received reconciliation. Filing regularity and compliance consistency scoring.

- **AI-Assisted CAM Output:** Structured Credit Assessment Memo (CAM) equivalent — income cross-validation, risk triggers, strength indicators, and eligibility estimate — in a format aligned with NBFC credit policy review workflows.

- **Explainable Decisioning:** Every output is traceable to source data. Designed for RBI model explainability expectations, internal credit committee review, and audit readiness under CICRA 2005 and DPDP Act 2023.

#### Supported lending products

- MSME working capital and term loans
- Consumer personal loans and credit lines
- Microfinance and JLG lending
- Supply chain finance (vendor / dealer)
- Commercial lending (mid-market and corporate)
- Co-lending arrangements with FLDG structuring
- Loan renewals and portfolio review (EWS signals)

#### API reference

| PARAMETER | DETAIL |
| --- | --- |
| Endpoint | POST /v1/underwriting/score |
| Auth | API Key (x-zeyro-api-key) |
| Avg latency | < 250ms |
| Inputs | AA consent token, bureau pull consent, GSTIN, PAN, Aadhaar (KYC) |
| Outputs | BFS score (0–1000), risk tier, income estimate, cashflow summary, CAM draft, anomaly flags |
| SDKs | Python (zeyro-python), TypeScript (zeyro-js) |
| Sandbox | Synthetic MSME and consumer borrower profiles included |

> **REGULATORY ALIGNMENT**
>
> Operates within CICRA 2005 via NBFC partner bureau memberships. AA data consumed under FIP-FIU consent model. Outputs designed for RBI Digital Lending Guidelines (2022) explainability and DPDP Act 2023 data processing compliance. Model documentation available on request for RBI MRM alignment.

## PRODUCT 02

### Transaction Enrichment

*Transform raw transaction strings into real-time behavioural signals — merchant identity, category, intent, and anomaly context.*

Every UPI transfer, NEFT credit, debit card spend, or NACH debit is raw text. Zeyro's Transaction Enrichment product converts this unstructured ledger data into structured intelligence — merchant identity, spending category, intent classification, behavioural patterns, and anomaly signals — in real time.

#### Core capabilities

- **Merchant Intelligence:** Normalize and identify merchants from raw UPI VPA strings, bank narrations, and card swipe descriptors. Returns standardized merchant name, category (MCC), logo, and trust score. Covers 10M+ Indian merchant identities.

- **Spending Category Classification:** Tag every transaction to a structured category taxonomy — F&B, travel, EMI, rent, utilities, healthcare, education, entertainment, and more. Supports both retail and MSME transaction classification.

- **Income & Credit Detection:** Identify salary credits, UPI receipts, GST settlement inflows, NACH mandates, and loan disbursals from transaction narratives. Separate structured income events from regular spend flows.

- **Behavioural Signal Extraction:** Derive signals: late-night spend velocity, weekend vs. weekday pattern, recurring vs. impulse spend ratio, merchant loyalty index, and peer benchmarking percentile for risk and engagement use cases.

- **Anomaly & Velocity Flags:** Real-time alerts for high transaction velocity, unusual merchant categories, sudden balance drawdowns, round-number transfers, and first-seen merchant contacts — inputs for fraud and early warning systems.

- **Longitudinal Financial Memory:** Maintain enriched transaction history across sessions. Build a persistent financial context layer that improves with every interaction — enabling personalization, trend analysis, and predictive modelling.

#### Use cases

- Credit underwriting: cashflow classification and income detection from bank statements
- Fraud detection: velocity anomalies and merchant trust scoring
- Personal finance management: category budgets and spend insights for consumer apps
- Digital banking: personalized offers and contextual nudges based on spending patterns
- Lending portfolio monitoring: real-time EWS signals from enriched transaction feeds

#### API reference

| PARAMETER | DETAIL |
| --- | --- |
| Endpoint | POST /v1/enrich/transaction (single) · POST /v1/enrich/batch (bulk) |
| Auth | API Key (x-zeyro-api-key) |
| Avg latency | < 250ms (single) · < 2s (batch 1000 tx) |
| Inputs | Raw transaction narrative string, amount, date, account ID |
| Outputs | Merchant name, MCC category, intent tag, income flag, anomaly score, behavioural signals |
| SDKs | Python (zeyro-python), TypeScript (zeyro-js) |
| Throughput | Up to 10M transactions/day per enterprise client |

## PRODUCT 03

### Cashflow Monitoring

*Continuous, AA-linked income and liability tracking for lenders, banks, and wealth platforms.*

Static bank statement analysis gives you a snapshot. Cashflow Monitoring gives you a live feed — continuously tracking income patterns, EMI obligations, NACH mandate compliance, account balance trends, and early warning triggers across an AA-consented borrower population.

#### Core capabilities

- **Continuous AA-Linked Monitoring:** Persist AA consent and receive real-time or scheduled refreshes of consented bank account data via FIP-FIU model. Monitor income, spending, and balance trends without requiring repeated borrower friction.

- **Income Stream Tracking:** Identify and track all income events — employer salary credits, UPI business receipts, GST settlements, freelance payments, rental credits, and investment redemptions. Flag income drops, delays, or source changes.

- **EMI & Obligation Intelligence:** Map all outgoing NACH mandates, standing instructions, and recurring debits to known loan obligations. Calculate FOIR (Fixed Obligation to Income Ratio) dynamically. Alert on missed or bounced EMIs.

- **Balance Velocity Analysis:** Track average monthly balance (AMB), minimum balance trends, end-of-month dips, and inter-account transfer patterns. Identify liquidity stress before it becomes a default signal.

- **Early Warning System (EWS) Signals:** Configurable triggers delivered via webhook: NACH bounce, income drop > X%, balance below threshold, new high-value debit, or first-seen credit from unknown source. Feed directly into collections or relationship manager workflows.

- **Portfolio-Level Dashboards:** Aggregate cashflow intelligence across your entire monitored borrower portfolio. Segment by income tier, FOIR range, or risk score. Run cohort analysis and identify systemic stress patterns.

#### API reference

| PARAMETER | DETAIL |
| --- | --- |
| Endpoint | POST /v1/cashflow/monitor (enrol) · GET /v1/cashflow/{id}/summary |
| Auth | API Key (x-zeyro-api-key) |
| Webhook | POST to your endpoint on trigger events |
| Inputs | AA consent token, monitoring frequency (daily / weekly / event-driven) |
| Outputs | Income summary, FOIR score, obligation map, EWS alerts, balance trend |
| SDKs | Python (zeyro-python), TypeScript (zeyro-js) |

## PRODUCT 04

### Device & Behavioural Intelligence

*Alternate data signals for thin-file and NTC borrowers — device metadata, app behaviour, and digital footprint analysis.*

India has 500 million+ people with thin or no credit files — not because they are poor credit risks, but because there is no formal data to underwrite them. Device & Behavioural Intelligence provides alternate data signals that extend underwriting reach into NTC, rural, and informal segments where bureau data is structurally absent.

#### Core capabilities

- **Device Risk Scoring:** Assess device health, app install patterns, device age, and metadata to generate a device trust score. Identify rooted devices, emulators, VPN usage, and other fraud-indicative signals at onboarding.

- **App Behaviour Intelligence:** Analyze installed app categories — banking apps, UPI apps, BNPL, investment platforms, and utility apps — as passive signals of financial engagement level and digital sophistication.

- **Communication Pattern Analysis:** With explicit user consent, analyze SMS and notification metadata (not content) to identify financial SMS patterns — salary alerts, EMI reminders, insurance renewals, and utility payments.

- **Digital Footprint Scoring:** Aggregate device, app, and behavioural signals into a Digital Footprint Score — a normalized alternate data score designed to complement bureau data for NTC borrowers.

- **Fraud Signal Detection:** Real-time device fingerprinting to detect account takeover, synthetic identity fraud, and coordinated application fraud rings across your borrower acquisition funnel.

- **DPDP-Compliant Consent Flow:** All device data collection is gated behind explicit borrower consent with purpose limitation, as required by the Digital Personal Data Protection Act 2023. SDK includes a pre-built consent UI module.

> **USE WITH CREDIT UNDERWRITING**
>
> Device & Behavioural Intelligence is designed to be used as a booster alongside the BFS Credit Underwriting score — particularly for NTC and thin-file borrowers where bureau and AA data are limited. The combined signal significantly improves prediction accuracy for this segment.

#### API reference

| PARAMETER | DETAIL |
| --- | --- |
| Endpoint | POST /v1/device/score |
| Auth | API Key (x-zeyro-api-key) |
| SDK trigger | Android SDK (zeyro-android) / iOS SDK (zeyro-ios) |
| Inputs | Device fingerprint token (generated by mobile SDK) |
| Outputs | Device trust score, digital footprint score, fraud signals, anomaly flags |
| Consent | Pre-built consent UI included in mobile SDK |

## PRODUCT 05

### AI Agent Suite

*Autonomous financial agents with persistent memory, contextual reasoning, and tool orchestration for complex financial decisioning workflows.*

The AI Agent Suite transforms Zeyro Intelligence outputs into autonomous agents that can reason, decide, and act across complex financial workflows — credit decisioning, fraud investigation, collections, compliance, customer engagement, and financial wellness guidance.

#### Included agents

- **Credit Sentinel:** Autonomous underwriting agent. Ingests multi-source financial data, runs BFS scoring, generates CAM draft, flags risk triggers, and returns a structured credit recommendation — all without human-in-the-loop for standard applications.

- **Fraud Watchdog:** Real-time fraud investigation agent. Monitors transaction streams for velocity anomalies, identity signals, device risk, and network-level fraud patterns. Escalates high-confidence alerts with supporting evidence to human reviewers.

- **Collections Oracle:** Intelligent collections agent. Predicts optimal contact timing, channel, and message for each borrower based on payment history, cashflow state, and communication response patterns. Reduces NPA formation through early intervention.

- **Wellness Advisor:** Consumer financial health agent. Analyzes spending patterns, income-to-obligation ratio, and savings behaviour. Delivers personalized, actionable guidance via chat or push notification. Built for Gen Z and first-time credit users.

- **Compliance Guard:** Regulatory monitoring agent. Continuously checks customer data against AML watchlists, PEP lists, adverse media, and court records. Automates KYC refresh, triggers re-verification on risk events, and maintains DPDP-compliant audit logs.

- **Onboarding Bot:** Intelligent onboarding agent. Guides new borrowers through KYC, AA consent, document upload, and pre-qualification — reducing drop-off and TAT from days to minutes. Supports Hinglish and regional language interactions.

#### Architecture

Agents are deployed on Zeyro's Railway/LangGraph/FastAPI infrastructure. Each agent has persistent financial memory via pgvector and Neo4j graph layers. Tool orchestration via a six-agent coordination layer. All agents expose a REST API and support webhook-based event triggers.

#### API reference

| PARAMETER | DETAIL |
| --- | --- |
| Endpoint | POST /v1/agents/{agent-id}/run |
| Agent IDs | credit-sentinel · fraud-watchdog · collections-oracle · wellness-advisor · compliance-guard · onboarding-bot |
| Auth | API Key (x-zeyro-api-key) + Agent Token |
| Inputs | Task payload (JSON) + context object |
| Outputs | Structured agent response + confidence score + action recommendations |
| Memory | Persistent financial memory per user across sessions |
| Deployment | Managed Cloud · Your Cloud (AWS/Azure/GCP) · Private |

## PRODUCT 06

### FinDoc Analyser

*Parse and extract structured intelligence from bank statements, GST filings, ITR, financial statements, payslips, and KYC documents.*

Manual document review is the primary bottleneck in Indian lending workflows — a single MSME file can contain 12 months of bank statements, two years of GSTR, ITR filings, audited financials, and supporting KYC documents. FinDoc Analyser converts this document burden into structured intelligence in seconds.

#### Supported document types

- **Bank Statement Analyser:** Parse PDF bank statements from all major Indian banks into structured transaction data. Extract income events, EMI outflows, NACH mandates, UPI patterns, average balance, and bounce history. Supports ePDF, scanned, and AA-fetched formats.

- **GST Analyser:** Extract and structure GSTR-1 and GSTR-3B data. Compute revenue trends, filing regularity score, and GST-to-bank reconciliation. Identify dormant filings, nil returns, and revenue declaration inconsistencies.

- **ITR Analyser:** Parse Income Tax Returns (ITR-1 through ITR-6) and Form 26AS. Extract declared income, TDS credits, advance tax, and business income across assessment years. Cross-validate with bank credits.

- **Financial Statement Analyser:** Parse audited and unaudited P&L, balance sheets, and cash flow statements. Extract key ratios: current ratio, DSCR, DSCR trend, gearing, net worth trajectory. Flag disclaimer qualifications and adverse audit notes.

- **Payslip Analyser:** Extract employer name, designation, gross salary, net pay, PF deduction, and statutory components from payslips. Validate against EPFO records and Form 26AS TDS credits.

- **KYC / KYB Document Parser:** Verify and extract data from Aadhaar, PAN, GST registration certificate, Udyam certificate, shop & establishment licence, MCA incorporation documents, and MSME Udyam certificate. Entity linking and director-level KYB.

#### Tamper detection

All document inputs are passed through Zeyro's document integrity layer — metadata analysis, font consistency checks, digital signature validation, and behavioural check — to flag potentially altered documents before extraction.

#### API reference

| PARAMETER | DETAIL |
| --- | --- |
| Endpoint | POST /v1/findoc/analyse |
| Auth | API Key (x-zeyro-api-key) |
| Avg latency | < 3s (single document) · < 30s (full file package) |
| Inputs | Document file (PDF/image) + document type tag |
| Outputs | Structured JSON extraction + confidence scores + anomaly flags + tamper indicators |
| SDKs | Python (zeyro-python), TypeScript (zeyro-js) |
| Formats | PDF (text + scanned), JPEG, PNG, ePDF (AA-fetched) |

## USE CASES · ALL WORKFLOWS

### Built for every financial intelligence workflow.

India's DPI stack — Aadhaar, UPI, GST, Account Aggregator, NACH — gives Indian lenders **a structural data advantage available nowhere else in the world**. Zeyro is built natively to consume it. Every use case below runs on the same unified intelligence layer.

| DOMAIN | USE CASE | WHAT YOU CAN BUILD |
| --- | --- | --- |
| 01 · Lending | **Credit Underwriting** | Go beyond bureau scores with behavioural intelligence, cashflow analysis, FinDoc parsing, and explainable risk signals for faster, more accurate lending decisions across MSME, consumer, and commercial segments. |
| 02 · Banking | **Digital Banking Intelligence** | Deliver personalized banking experiences with transaction enrichment, behavioural insights, financial memory, and real-time customer intelligence across your entire user base. |
| 03 · Insurance | **Underwriting & Risk Intelligence** | Assess risk using financial behaviour, income stability, spending patterns, claims signals, and contextual intelligence to improve underwriting accuracy and reduce loss ratios. |
| 04 · Fintech | **Embedded Financial Intelligence** | Add transaction enrichment, merchant intelligence, categorization, behavioural analytics, and AI-powered financial insights to any product with a single API integration. |
| 05 · Wealth | **Wealth & Investment Intelligence** | Build intelligent investment experiences with financial profiling, portfolio context, cashflow forecasting, and personalized recommendation engines for HNI and mass-affluent segments. |
| 06 · Accounting | **Accounting Automation** | Transform invoices, bank statements, GST records, and financial documents into structured data for reconciliation, bookkeeping, and regulatory reporting. |
| 07 · AI Agents | **Financial AI Agents** | Power autonomous agents with persistent financial memory, contextual reasoning, decision workflows, and tool orchestration for complex financial tasks and customer interactions. |
| 08 · Fraud | **Fraud & Anomaly Detection** | Detect unusual behaviour, suspicious transactions, identity risks, and financial anomalies using adaptive behavioural intelligence and real-time monitoring — before they reach your book. |
| 09 · Compliance | **Compliance & Financial Operations** | Automate KYC, KYB, AML monitoring, document verification, audit workflows, and regulatory reporting with explainable AI aligned to RBI and DPDP Act requirements. |
| 10 · Enterprise | **Enterprise Decision Intelligence** | Unify fragmented financial data across banking, ERP, accounting, payments, and internal systems to power organization-wide financial decision-making. |


---

*Zeyro Technologies Pvt. Ltd. · intelligence.zeyro.in · Incubated at DA-IICT, Gandhinagar · For internal and partner use only.*
