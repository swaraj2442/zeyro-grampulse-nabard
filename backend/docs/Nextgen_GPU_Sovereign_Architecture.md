> ZEYRO · INFRASTRUCTURE ARCHITECTURE — PARTNER CONFIDENTIAL

# Zeyro Intelligence
## GPU Compute & Sovereign Data Services Architecture

*Prepared for: Nextgen (Cloud Infrastructure Partner)*  
*Classification: Partner Confidential*  
*Version: 1.0 · July 2026*  
*Arthazeyro Technologies Pvt. Ltd. · intelligence.zeyro.in*

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Principles](#2-architecture-principles)
3. [GPU Compute Architecture](#3-gpu-compute-architecture)
   - 3.1 [Model Training Infrastructure](#31-model-training-infrastructure)
   - 3.2 [Inference Serving Layer](#32-inference-serving-layer)
   - 3.3 [GPU Resource Scheduling](#33-gpu-resource-scheduling)
   - 3.4 [Model Registry & Lifecycle](#34-model-registry--lifecycle)
   - 3.5 [Observability & Cost Governance](#35-observability--cost-governance)
4. [Sovereign Data Services Architecture](#4-sovereign-data-services-architecture)
   - 4.1 [Sovereign Deployment Topology](#41-sovereign-deployment-topology)
   - 4.2 [Air-Gap Boundary Design](#42-air-gap-boundary-design)
   - 4.3 [Key Management & Cryptographic Architecture](#43-key-management--cryptographic-architecture)
   - 4.4 [Data Residency Enforcement](#44-data-residency-enforcement)
   - 4.5 [Offline Model Update Protocol](#45-offline-model-update-protocol)
5. [Integrated System Topology](#5-integrated-system-topology)
6. [Workload Classification](#6-workload-classification)
7. [Network Architecture](#7-network-architecture)
8. [Security & Compliance Posture](#8-security--compliance-posture)
9. [Operational Runbook Design](#9-operational-runbook-design)
10. [Capacity Planning & SLAs](#10-capacity-planning--slas)
11. [Partner Integration Requirements (Nextgen)](#11-partner-integration-requirements-nextgen)
12. [Decision Log](#12-decision-log)

---

## 1. Executive Summary

Zeyro Intelligence operates two distinct but tightly integrated infrastructure layers that require GPU-accelerated compute capabilities:

**Layer 1 — GPU Compute Platform**  
Powers training and real-time inference for Zeyro's six core intelligence products: Credit Underwriting (BFS scoring), Transaction Enrichment, Cashflow Monitoring, Device & Behavioural Intelligence, AI Agent Suite, and FinDoc Analyser. These models run on a shared GPU cluster with strict SLO requirements — 250ms p99 inference latency for synchronous API calls, and nightly batch retraining within a 6-hour window.

**Layer 2 — Sovereign Data Services**  
A fully air-gapped deployment stack for regulated government clients, PSUs, and defence-adjacent financial institutions (e.g. cooperative banks under NaBFID supervisory mandate, PSU insurance, government treasury operations) that cannot allow sensitive financial data to leave their physical premises or transit public networks. This layer runs Zeyro's full intelligence stack within a client-controlled data centre, with zero egress to Zeyro's cloud.

**Why Nextgen**  
Zeyro requires a GPU infrastructure partner with (a) India-domiciled compute (data residency), (b) bare-metal GPU availability at H100 / A100 tier, (c) private interconnect capability into client sovereign environments, and (d) compliance posture aligned with RBI digital lending guidelines and DPDP Act 2023 data localisation requirements.

---

## 2. Architecture Principles

### 2.1 Compute Separation by Workload Class

Training and inference workloads are physically separated across different GPU node pools. Training jobs have no path to production inference endpoints. Inference nodes are read-only consumers of the Model Registry.

```
[Training Cluster]  →  [Model Registry]  →  [Inference Cluster]
        ↑                                           ↓
[Feature Store]                           [API Gateway → Partners]
```

This separation eliminates the risk of a rogue training job polluting production inference and allows independent scaling of each workload class.

### 2.2 Sovereign Boundary is Cryptographic, Not Network-Only

A sovereign deployment is not simply a VPN or private link. The air-gap boundary is enforced by a **hardware-rooted attestation chain** — every model artifact that crosses the boundary is signed by a Zeyro-controlled HSM and verified by a client-side HSM before activation. Network isolation is a secondary control.

### 2.3 Model Artifacts are Versioned, Immutable, and Auditable

Every model version is an immutable artifact tagged with:
- Training dataset version hash
- Feature schema version
- Hyperparameter manifest
- Performance benchmarks (AUC, KS, Gini) on holdout set
- Regulatory model card (RBI MRM format)
- Digital signature (Zeyro HSM)

No model enters inference — cloud or sovereign — without passing automated benchmark gates and signing.

### 2.4 DPDP Act Compliance is Enforced at the Data Plane

Data access for model training is gated by a **Consent Enforcement Proxy (CEP)** that sits between the raw feature store and the training job launcher. No training job can access any user financial record without a valid, in-scope AA consent artifact. CEP is not application logic — it is an infrastructure component enforced at the network policy layer.

### 2.5 Cost Attribution is First-Class

Every GPU compute job (training run, inference request batch, embedding generation, document OCR) is tagged with:
- Product ID (`bfs`, `enrichment`, `cashflow`, `device`, `agent`, `findoc`)
- Client / partner ID
- Environment (`prod`, `staging`, `sovereign-{client-id}`)

This enables per-product, per-partner cost attribution and informs pricing models for sovereign deployments.

---

## 3. GPU Compute Architecture

### 3.1 Model Training Infrastructure

#### Node Configuration (Nextgen-hosted)

| Pool | GPU | Count | vRAM | Purpose |
|---|---|---|---|---|
| `training-h100` | NVIDIA H100 80GB SXM | 16 | 1.28 TB aggregate | Large model training (BFS v4+, LLM fine-tuning for agents) |
| `training-a100` | NVIDIA A100 40GB PCIe | 32 | 1.28 TB aggregate | Standard model training, embedding generation |
| `training-spot` | NVIDIA A100 40GB | Variable | — | Spot-class burst for non-critical retraining jobs |
| `ocr-inference` | NVIDIA T4 16GB | 8 | 128 GB aggregate | FinDoc Analyser OCR + layout analysis |

All training nodes run **NVIDIA CUDA 12.3**, **cuDNN 8.9**, and are provisioned via a **Kubernetes operator** (NVIDIA GPU Operator + MIG partitioning for A100 multi-tenant isolation).

#### Training Job Lifecycle

```
1. Feature Store Snapshot
   └─ CEP validates consent coverage for training cohort
   └─ Point-in-time snapshot exported to S3-compatible object store (India region)
   └─ Snapshot hash recorded in Audit Ledger

2. Job Submission
   └─ Training job submitted via Argo Workflows
   └─ Resource request: GPU count, memory, max runtime
   └─ Job tagged with {product_id, training_run_id, feature_snapshot_id}

3. Distributed Training (PyTorch DDP / FSDP)
   └─ Multi-node: NCCL backend over InfiniBand (100Gbps)
   └─ Gradient checkpointing for memory efficiency on BFS large models
   └─ MLflow experiment tracking (runs, params, metrics, artifacts)

4. Evaluation Gate
   └─ Automated holdout evaluation: AUC > 0.78, KS > 0.35, Gini > 0.55 (BFS thresholds)
   └─ Fairness check: no protected attribute proxy (caste, religion, gender proxies)
   └─ Drift check: concept drift vs production model < 5% KL divergence
   └─ [PASS] → artifact uploaded to Model Registry
   └─ [FAIL] → job marked failed, alert to ML team, no registry update

5. Model Card Generation
   └─ Automated RBI MRM-aligned model card: performance, data sources,
      feature importance, known limitations
   └─ Card attached to registry artifact
   └─ Card made available to partner compliance teams on request
```

#### Framework Stack

```yaml
training_stack:
  framework:           PyTorch 2.3 (primary) / XGBoost 2.1 (gradient boosting for BFS)
  orchestration:       Argo Workflows 3.5 on Kubernetes
  experiment_tracking: MLflow 2.14 (self-hosted, India region)
  distributed:         PyTorch DDP (2-8 node) / FSDP (8-16 node for large models)
  data_loading:        NVIDIA DALI (GPU-accelerated data pipeline for document models)
  hyperparameter:      Optuna 3.6 (TPE sampler, Kubernetes-native parallel trials)
  feature_store:       Feast 0.38 (point-in-time correct retrieval)
```

---

### 3.2 Inference Serving Layer

The inference layer is latency-critical. The SLO for synchronous API endpoints is **< 250ms p99 end-to-end** (network + model forward pass + post-processing).

#### Inference Node Configuration

| Pool | GPU | Count | vRAM | Serving Target |
|---|---|---|---|---|
| `inference-a100` | NVIDIA A100 40GB | 8 | 320 GB | BFS scoring, cashflow models (high-value, low-latency) |
| `inference-t4` | NVIDIA T4 16GB | 16 | 256 GB | Transaction enrichment embedding + classification |
| `inference-l4` | NVIDIA L4 24GB | 8 | 192 GB | Agent LLM inference (Llama-3.1 70B quantized) |
| `inference-t4-ocr` | NVIDIA T4 16GB | 8 | 128 GB | FinDoc OCR and layout models |

#### Serving Stack

```yaml
inference_stack:
  serving_framework: NVIDIA Triton Inference Server 2.46
  model_formats:     TensorRT (optimized), ONNX (portable), PyTorch TorchScript
  batching:          Dynamic batching (max_batch_size: 64, preferred: [8, 16, 32])
  quantization:      INT8 (enrichment + OCR) / FP16 (BFS scoring) / AWQ 4-bit (LLM agents)
  load_balancing:    NGINX upstream with least-connections to Triton pods
  autoscaling:       KEDA v2 — scales on GPU utilization metric from DCGM Exporter
  routing:           Istio service mesh — per-model canary routing (95/5 prod/shadow)
```

#### BFS Scoring Inference Path (Critical Path)

```
Partner API Call
   ↓ < 5ms
API Gateway (Kong) — auth + rate limit
   ↓ < 10ms
Enrichment Pre-processor — AA token decode + feature hydration from Feature Store (Redis)
   ↓ < 20ms
Triton Inference — BFS XGBoost model (TensorRT plan, batch_size=1 for sync calls)
   ↓ < 150ms  ← model forward pass budget
Post-processor — score normalization, risk tier assignment, adverse action reason generation
   ↓ < 15ms
Response formatter — JSON artifact construction (BFS score, income object, CAM draft)
   ↓ < 50ms
Partner API Response
─────────────────────────────────────────────
Total target:  < 250ms p99
```

#### Agent LLM Inference Path

AI Agent Suite agents (Credit Sentinel, Fraud Watchdog, Collections Oracle, etc.) use a **two-tier inference architecture**:

```
Tier 1 — Fast Path (< 500ms):
  Tool execution — structured lookups, BFS scoring, enrichment calls
  Response: structured JSON, no LLM

Tier 2 — Reasoning Path (< 5s):
  Complex multi-step reasoning, CAM drafting, anomaly explanation
  Model: Llama-3.1-70B-Instruct (AWQ 4-bit) on L4 cluster
  Context: persistent financial memory from pgvector + Neo4j graph
  Batched: max 8 concurrent reasoning chains per L4 node

Routing: Agent router classifies each task as Fast or Reasoning.
> 80% of agent requests resolve on Fast Path (tool execution only).
```

---

### 3.3 GPU Resource Scheduling

#### Kubernetes GPU Scheduling Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                    │
│                                                         │
│  ┌──────────────────┐    ┌──────────────────────────┐  │
│  │  Training Pool   │    │    Inference Pool        │  │
│  │  (A100/H100)     │    │    (T4/A100/L4)          │  │
│  │                  │    │                          │  │
│  │  NVIDIA MIG      │    │  NVIDIA Triton Pods      │  │
│  │  Partitioning    │    │  (1 GPU per pod)         │  │
│  │  (7 slices/A100) │    │                          │  │
│  └──────────────────┘    └──────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │          GPU Operator + Device Plugin            │  │
│  │  - DCGM Exporter (GPU metrics → Prometheus)     │  │
│  │  - MIG Manager (partition lifecycle)             │  │
│  │  - NVIDIA Feature Discovery (labels nodes)      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### Scheduling Policies

| Priority Class | Workloads | Preemptable | GPU Pool |
|---|---|---|---|
| `system-critical` | Live inference serving | No | `inference-*` |
| `high` | Nightly retraining (BFS, enrichment) | No | `training-a100` |
| `medium` | Weekly model refresh, embedding batch | Yes | `training-a100`, `training-spot` |
| `low` | Research experiments, hyperparameter search | Yes | `training-spot` |

**MIG Partitioning Strategy (A100)**:
```
Training node:   1 A100 → 7× MIG 1g.5gb slices (parallel HPO trials)
Inference node:  1 A100 → 1 full instance (no partition, max throughput)
OCR node:        1 T4   → 2× isolated inference pods (document isolation)
```

---

### 3.4 Model Registry & Lifecycle

```
Model Registry (self-hosted MLflow + MinIO object store, India region)

artifact_path:
  s3://zeyro-model-registry/{product_id}/{model_family}/{version}/
    ├── model.plan          # TensorRT optimized artifact
    ├── model.onnx          # portable format (sovereign transfer)
    ├── model_card.json     # RBI MRM-aligned documentation
    ├── feature_schema.json # input feature spec + versions
    ├── benchmark.json      # holdout AUC, KS, Gini, fairness metrics
    ├── signature.sig       # Zeyro HSM digital signature (Ed25519)
    └── manifest.json       # bundle manifest + SHA-256 hashes

Lifecycle stages:
  EXPERIMENTAL → STAGING → PRODUCTION → DEPRECATED → ARCHIVED

Promotion gates:
  EXPERIMENTAL → STAGING:
    manual ML team approval + benchmark pass
  STAGING → PRODUCTION:
    automated A/B shadow test (7 days, KS drift < 2%) + compliance sign-off
  PRODUCTION → DEPRECATED:
    successor model in PRODUCTION + 30-day overlap window
```

#### Canary Deployment

New model versions enter production via a **canary router** in the Istio service mesh:

```
Day 0:  New model → 0% traffic (shadow mode, logging only, no response served)
Day 1:  5% traffic (manual approval gate after Day 0 log review)
Day 3:  20% traffic (automated if error rate < 0.1% and p99 < 250ms)
Day 7:  100% traffic (automated if AUC degradation < 0.5% vs incumbent)
```

---

### 3.5 Observability & Cost Governance

#### GPU Metrics Stack

```yaml
metrics:
  collection:  DCGM Exporter → Prometheus → Grafana
  key_metrics:
    - gpu_utilization_percent              # per node, per product
    - gpu_memory_used_bytes                # VRAM headroom
    - nv_inference_request_success_total   # Triton success rate
    - nv_inference_request_duration_us     # Triton p50/p99 latency
    - training_job_gpu_seconds             # per job, for cost attribution

cost_attribution:
  labels: [product_id, partner_id, environment, model_version]
  export: daily report to internal finance dashboard (Metabase)
  alert:  job exceeds budget_gpu_hours → Slack alert + job soft-kill

alerting:
  - GPU utilization > 95% for 5 min    → scale-out trigger (KEDA)
  - Inference p99 > 200ms for 2 min    → PagerDuty P1 (SLO at risk)
  - Training job runtime > 2× history  → alert ML team
  - Registry push without HSM sig      → security alert
```

---

## 4. Sovereign Data Services Architecture

Sovereign deployment is Zeyro's fully air-gapped deployment offering for government departments, PSUs, defence-adjacent financial institutions, and regulated entities that cannot exfiltrate financial data to any third-party cloud — including Zeyro's own managed cloud.

**Target clients:**
- Cooperative banks under NaBFID supervisory mandate
- PSU insurance companies (LIC, GIC, New India)
- Government treasury operations, SIDBI, NABARD
- Defence Pay and Accounts Offices
- State government financial institutions

### 4.1 Sovereign Deployment Topology

```
╔══════════════════════════════════════════════════════════════════════╗
║                  CLIENT SOVEREIGN PERIMETER                         ║
║                  (Client-controlled data centre)                    ║
║                                                                      ║
║  ┌──────────────────────────────────────────────────────────────┐   ║
║  │                   Zeyro Sovereign Stack                      │   ║
║  │                                                              │   ║
║  │  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │   ║
║  │  │  API Layer │  │ Intelligence│  │  Data Infrastructure │  │   ║
║  │  │  (Kong OSS)│  │  Engine     │  │                      │  │   ║
║  │  │            │  │  (Triton +  │  │  - PostgreSQL        │  │   ║
║  │  │  - Auth    │  │  FastAPI)   │  │  - Redis             │  │   ║
║  │  │  - Rate    │  │             │  │  - pgvector          │  │   ║
║  │  │    Limit   │  │  All 6      │  │  - Neo4j             │  │   ║
║  │  │  - Audit   │  │  Products   │  │  - MinIO             │  │   ║
║  │  └────────────┘  └────────────┘  └──────────────────────┘  │   ║
║  │                                                              │   ║
║  │  ┌──────────────────────────────────────────────────────┐   │   ║
║  │  │              Sovereign GPU Compute                   │   │   ║
║  │  │   (Nextgen-supplied, client-rack, Zeyro-operated)    │   │   ║
║  │  │                                                      │   │   ║
║  │  │   Minimum: 4× NVIDIA A100 40GB  (Standard tier)     │   │   ║
║  │  │   Full:    8× NVIDIA H100 80GB  (Premium tier)      │   │   ║
║  │  └──────────────────────────────────────────────────────┘  │   ║
║  │                                                              │   ║
║  │  ┌──────────────┐  ┌────────────────────────────────────┐  │   ║
║  │  │ Client HSM   │  │    Consent Enforcement Proxy (CEP) │  │   ║
║  │  │ (Thales      │  │    (data access gating, audit log) │  │   ║
║  │  │  Luna T7)    │  │                                    │  │   ║
║  │  └──────────────┘  └────────────────────────────────────┘  │   ║
║  └──────────────────────────────────────────────────────────────┘   ║
║                                                                      ║
║  ══════ AIR GAP BOUNDARY ══ NO EGRESS ALLOWED BEYOND THIS LINE ════  ║
╚══════════════════════════════════════════════════════════════════════╝

                    ▲ ONE-WAY INBOUND ONLY
                    │ (Model updates via signed USB/optical courier)
                    │
╔══════════════════════════════════════════════════════════════════════╗
║              ZEYRO CLOUD (India Region — Nextgen-hosted)            ║
║                                                                      ║
║   Model Registry   Feature Schema   Model Cards   Update Bundles    ║
║   (signed artifacts only — no client data ever flows here)          ║
╚══════════════════════════════════════════════════════════════════════╝
```

### 4.2 Air-Gap Boundary Design

The air-gap is enforced at three independent layers:

#### Layer 1: Physical Network Isolation

```
- Sovereign stack runs on a physically isolated VLAN
- No public internet interface on any sovereign node
- All management access via client-controlled jump host (bastion)
- Network egress firewall rules: DROP ALL (no exceptions, no call-home)
- DNS is local (internal resolver only, no upstream forwarding)
```

#### Layer 2: Software Enforcement

```
- All containers built with SBOM (Software Bill of Materials) — no runtime pulls
- Container image registry is a mirrored, client-side registry (Harbor)
- No container pulls from docker.io, ghcr.io, or any external registry at runtime
- Kubernetes network policies: namespace isolation, no cross-namespace egress
- Zeyro application code: no HTTP client calls to Zeyro endpoints (verified by SAST gate)
```

#### Layer 3: Cryptographic Attestation

```
- Every running pod has its image digest verified against a client-side image allowlist
- Allowlist is signed by Zeyro HSM and countersigned by Client HSM
- Any image not on allowlist: pod admission denied by OPA Gatekeeper
- Model artifacts: signature verified on load — model server refuses unsigned artifacts
```

---

### 4.3 Key Management & Cryptographic Architecture

```
Key Hierarchy
─────────────────────────────────────────────────────────────────

Zeyro Root CA (Zeyro HSM — Luna Network HSM 7, FIPS 140-3 Level 3)
    │
    ├── Zeyro Model Signing Key (Ed25519)
    │     └── Signs every model artifact in registry
    │
    └── Zeyro Sovereign Deployment Key (RSA-4096)
          └── Issues per-client deployment certificates

Client HSM (Thales Luna T7 — installed at client DC, key material never leaves)
    │
    ├── Client Data Encryption Master Key (AES-256-GCM)
    │     └── Wraps all keys for data at rest
    │
    ├── Client TLS Identity Certificate (ECDSA P-384)
    │     └── mTLS for all inter-service communication within sovereign stack
    │
    └── Model Activation Key (derived from Zeyro Sovereign Deployment Key)
          └── Client HSM verifies Zeyro model signature before activation
          └── Model decryption key never transmitted — only derived inside HSM
```

**Model Delivery Encryption:**

```
1. Zeyro packages model bundle:
   model.onnx + model_card.json + feature_schema.json → tar.gz

2. Bundle encrypted with Client's public key (RSA-4096, from client cert)
   → model_bundle_{version}_{client_id}.enc

3. Bundle signed with Zeyro Model Signing Key (Ed25519)
   → model_bundle_{version}_{client_id}.enc.sig

4. Delivery: encrypted physical media (USB HSM token or optical disc)
   via courier with chain-of-custody manifest

5. Client-side activation:
   → Client HSM verifies Zeyro signature (.sig file)
   → Client HSM decrypts bundle (RSA private key never leaves HSM)
   → Decrypted artifact placed in local MinIO registry
   → Triton model server loads artifact, verifies internal SHA-256 manifest
   → Model is live — no Zeyro involvement in runtime operation
```

---

### 4.4 Data Residency Enforcement

#### What "Sovereign" Means for Data

| Data Category | Sovereign Handling | Leaves Sovereign Perimeter? |
|---|---|---|
| Raw financial transactions (AA data) | Stored in sovereign PostgreSQL, AES-256 at rest | **Never** |
| BFS scores and risk outputs | Stored in sovereign PostgreSQL | **Never** |
| Enriched transaction records | Stored in sovereign PostgreSQL + Redis | **Never** |
| User consent artifacts (AA tokens) | Stored in sovereign PostgreSQL, HSM-wrapped | **Never** |
| Model inference logs (audit) | Stored in sovereign audit ledger | **Never** |
| Model artifacts (weights, configs) | Delivered as signed bundle, stored in sovereign MinIO | **Never** |
| Performance metrics (GPU utilization) | Stored in sovereign Prometheus | Optional (client decision) |
| Anonymized aggregate model performance | Opt-in: client may share with Zeyro for model improvement | Client controls |
| Support telemetry | None by default. Client-controlled log export | Client controls |

#### Consent Enforcement Proxy (CEP) — Sovereign Mode

In sovereign mode, the CEP operates without AA framework connectivity (AA framework requires internet). The sovereign CEP operates on a **locally-stored consent ledger**:

```
Sovereign CEP Architecture:

┌─────────────────────────────────────────────────────────────┐
│                    Sovereign CEP                            │
│                                                             │
│  Consent Store (local PostgreSQL)                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  consent_id │ user_ref │ purpose │ expiry │ status  │   │
│  │  (issued by client's own AA FIU license, if any)   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Access Control Policy Engine:                             │
│  - Request must carry valid consent_id                      │
│  - Purpose must match requested data scope                  │
│  - Consent must not be expired or revoked                   │
│  - All access decisions logged to append-only audit ledger  │
│                                                             │
│  Audit Ledger (append-only, WORM-equivalent via pgaudit):  │
│  {timestamp, user_ref, consent_id, data_accessed,          │
│   model_used, decision}                                     │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.5 Offline Model Update Protocol

Sovereign clients receive model updates via a structured offline delivery process. No model update requires internet connectivity.

#### Update Cadence

| Model | Training Frequency | Sovereign Delivery | Method |
|---|---|---|---|
| BFS Credit Scoring | Weekly (nightly, rolling) | Monthly bundle | Signed encrypted USB |
| Transaction Enrichment | Daily (merchant graph) | Bi-weekly | Signed encrypted USB |
| FinDoc OCR + Layout | Monthly | Quarterly | Optical disc courier |
| Agent LLM (Llama-3.1) | On major release only | On major release | Signed encrypted optical |
| Merchant Entity Graph | Continuous (cloud) | Monthly snapshot | Signed encrypted USB |

#### Update Activation Workflow

```
Day -7:  Zeyro notifies client of pending update (email + signed notification)
Day -3:  Courier dispatches encrypted update bundle + chain-of-custody manifest
Day  0:  Client receives media, verifies chain-of-custody signatures
Day +1:  Client HSM operator performs:
           1. Verify Zeyro signature on bundle
           2. Decrypt bundle to sovereign MinIO staging path
           3. Run automated benchmark gate (offline holdout dataset)
           4. Review model card changes
           5. Approve activation (or reject and notify Zeyro)
Day +2:  If approved: Triton model server hot-swap (zero downtime canary)
Day +3:  Previous version → DEPRECATED in sovereign registry (retained 90 days)
```

---

## 5. Integrated System Topology

### Full End-to-End Data Flow (Sovereign Context)

```
CLIENT SYSTEM (e.g. PSU Bank Loan Origination System)
        │
        │  HTTPS (mTLS, client cert issued by Client CA)
        ▼
┌───────────────────────────────────────────────────────┐
│              Sovereign API Gateway (Kong OSS)         │
│  - API key auth (PASETO v4 tokens, Client HSM-issued) │
│  - Rate limiting per department                        │
│  - Request/response logging (local, WORM)             │
└──────────────────────┬────────────────────────────────┘
                       │
        ┌──────────────▼──────────────────────────────┐
        │         Consent Enforcement Proxy            │
        │  - Validate consent_id for this request      │
        │  - Enforce purpose limitation                 │
        │  - Log to audit ledger                        │
        └──────────────┬──────────────────────────────┘
                       │
        ┌──────────────▼──────────────────────────────┐
        │        Intelligence Routing Layer            │
        │  Routes to correct product service:          │
        │  BFS → Underwriting Service                  │
        │  TX  → Enrichment Service                    │
        │  DOC → FinDoc Service                        │
        └──────────┬────────┬────────┬────────────────┘
                   │        │        │
          ┌────────▼──┐ ┌───▼────┐ ┌▼──────────────┐
          │Underwriting│ │Enrich- │ │FinDoc Analyser│
          │  Service   │ │ment    │ │  Service      │
          │  (FastAPI) │ │Service │ │  (FastAPI)    │
          └──────┬─────┘ └───┬────┘ └──────┬────────┘
                 │           │             │
        ┌────────▼───────────▼─────────────▼──────────┐
        │          Sovereign GPU Cluster               │
        │  (Nextgen-supplied, Triton Inference Server) │
        │                                              │
        │  BFS Model (XGBoost / TensorRT)              │
        │  Enrichment Model (BERT + classifier)        │
        │  OCR + Layout Model (FinDoc)                 │
        └────────┬─────────────────────────────────────┘
                 │
        ┌────────▼─────────────────────────────────────┐
        │         Sovereign Data Layer                  │
        │  PostgreSQL (primary)  Redis (cache)          │
        │  pgvector (embeddings) Neo4j (entity graph)   │
        │  MinIO (model artifacts, documents)           │
        │                                               │
        │  All storage: AES-256-GCM, key in Client HSM  │
        └───────────────────────────────────────────────┘
```

---

## 6. Workload Classification

| Workload | GPU Required | Latency Class | Deployment |
|---|---|---|---|
| BFS Credit Score (sync) | A100 (inference) | < 250ms | Cloud + Sovereign |
| Transaction Enrichment (sync) | T4 (inference) | < 250ms | Cloud + Sovereign |
| Transaction Enrichment (batch 1M) | A100 (inference) | < 2hr batch | Cloud only |
| Cashflow Monitoring (AA-linked) | T4 (inference) | Event-driven | Cloud only |
| Device & Behavioural Score | T4 (inference) | < 250ms | Cloud + Sovereign |
| FinDoc OCR + Extraction | T4/L4 (inference) | < 3s/doc | Cloud + Sovereign |
| AI Agent (Fast Path) | None (CPU) | < 500ms | Cloud only |
| AI Agent (Reasoning Path) | L4 (LLM inference) | < 5s | Cloud only |
| BFS Model Training (weekly) | A100/H100 (training) | 4-6hr batch | Cloud only |
| Enrichment Embedding Training | A100 (training) | 2-4hr batch | Cloud only |
| Merchant Graph Refresh | A100 (training) | 1-2hr batch | Cloud only |
| HPO (hyperparameter search) | A100 spot (training) | 12-24hr | Cloud only |

> **Sovereign GPU minimum:** A100 × 4 (inference only). Training does not happen within sovereign perimeter — only inference on Zeyro-supplied, signed models.

---

## 7. Network Architecture

### Nextgen Infrastructure Requirements

#### Cloud Deployment (Nextgen-hosted, India Region)

```
Required Connectivity:
├── Public endpoint: api.zeyro.in → API Gateway (1Gbps min, DDoS-protected)
├── Internal mesh: Kubernetes pod-to-pod (Cilium CNI with eBPF)
├── GPU cluster interconnect: InfiniBand HDR (200Gbps) for training nodes
├── Storage: NVMe local (training scratch) + Ceph/HDFS (persistent object store)
└── Internet access: Restricted — only AA framework, GST API, bureau APIs

Outbound whitelist:
├── AA framework: Sahamati central registry (HTTPS, port 443)
├── Bureau APIs: CIBIL, CRIF, Experian, Equifax (HTTPS, port 443)
├── GSTN: GST API gateway (HTTPS, port 443)
└── NPCI: UPI metadata API (HTTPS, port 443)
```

#### Sovereign Deployment (Nextgen-supplied hardware at Client DC)

```
Network Requirements (enforced by Nextgen hardware config):
├── Client internal VLAN: all sovereign nodes on isolated VLAN
├── No public internet interface on any node (switch/router-enforced)
├── Management network: separate IPMI/BMC network for hardware management
├── InfiniBand (if H100 tier): within sovereign rack only, no external connectivity
├── Client LAN connectivity: 10GbE to client's LOS or core banking system
└── Optional: 1GbE management from client's secure operations network (SOC)

Firewall policy (configured by Nextgen, verified by Zeyro + client):
  INPUT:   ACCEPT from client_lan_cidr to tcp/443 (API)
  INPUT:   ACCEPT from mgmt_network to tcp/22 (SSH, bastion only)
  OUTPUT:  DROP ALL (no exceptions)
  FORWARD: DROP ALL
```

---

## 8. Security & Compliance Posture

### 8.1 Regulatory Alignment

| Regulation | Requirement | How Met |
|---|---|---|
| DPDP Act 2023 | Data localisation, purpose limitation, consent | CEP enforces purpose; all data India-resident; consent ledger |
| RBI Digital Lending (2022) | Explainability, audit trail, model docs | Model cards + adverse action reasons + WORM audit log |
| RBI IT Framework (2011) | Data centre standards, business continuity | Sovereign stack meets RBI DC standards; BCP included |
| CICRA 2005 | Bureau data consumer obligations | Bureau pulls via partner NBFC memberships; data not re-shared |
| AA Framework (RBI) | FIP-FIU consent model, data scoping | CEP enforces AA consent; FIU license for cloud deployment |
| ISO/IEC 27001 | Information security management | Cloud + sovereign stack aligned; audit available on request |
| FIPS 140-3 Level 3 | HSM standard for crypto operations | Thales Luna HSM for both Zeyro and client HSM |

### 8.2 Threat Model

| Threat | Mitigation |
|---|---|
| Rogue model update (tampered artifact) | HSM signature verification before model activation |
| Insider threat (Zeyro operator) | Sovereign: no Zeyro remote access; client controls all access |
| Insider threat (client operator) | WORM audit ledger; dual-person activation for model updates |
| GPU node compromise | Container image allowlist (OPA Gatekeeper); no runtime installs |
| Data exfiltration via API response | CEP consent scope enforcement; output scrubbing pipeline |
| Training data poisoning | CEP consent validation + holdout benchmark gate before promotion |
| Key compromise (cloud) | HSM-backed keys; no software key storage; physical presence required |
| Supply chain attack (deps) | SBOM for all containers; no runtime pulls; dependency pinning |

### 8.3 Penetration Testing & Audit Schedule

```
Cloud Infrastructure:
  - Quarterly automated DAST (OWASP ZAP + Burp Suite)
  - Annual third-party pentest (CERT-In empanelled firm)
  - Continuous CVE scanning (Trivy on all container images)

Sovereign Deployment:
  - Pre-deployment security review (joint Zeyro + client)
  - Annual audit by client's internal security or external auditor
  - Zeyro provides: SBOM, image digests, model card, key ceremony records
```

---

## 9. Operational Runbook Design

### 9.1 Cloud Operations (Nextgen infra, Zeyro software)

```
Responsibility Matrix:
┌────────────────────────────────────┬──────────┬────────┐
│ Responsibility                     │ Nextgen  │ Zeyro  │
├────────────────────────────────────┼──────────┼────────┤
│ Physical hardware (GPU nodes)      │    ✓     │        │
│ Hypervisor / bare metal OS         │    ✓     │        │
│ Network infrastructure             │    ✓     │        │
│ Kubernetes cluster management      │    ✓     │   ✓    │
│ GPU Driver + CUDA stack            │    ✓     │        │
│ Application containers             │          │   ✓    │
│ Model training + deployment        │          │   ✓    │
│ API keys + auth management         │          │   ✓    │
│ Data backup (object store)         │    ✓     │   ✓    │
│ Security patching (OS/drivers)     │    ✓     │        │
│ Security patching (application)    │          │   ✓    │
│ Incident response (infra)          │    ✓     │   ✓    │
│ Incident response (application)    │          │   ✓    │
└────────────────────────────────────┴──────────┴────────┘
```

### 9.2 Sovereign Operations

```
Responsibility Matrix:
┌────────────────────────────────────┬──────────┬────────┬────────┐
│ Responsibility                     │ Nextgen  │ Zeyro  │ Client │
├────────────────────────────────────┼──────────┼────────┼────────┤
│ Physical hardware supply           │    ✓     │        │        │
│ Hardware install at Client DC      │    ✓     │        │   ✓    │
│ Physical hardware maintenance      │    ✓     │        │        │
│ Network config (VLAN isolation)    │    ✓     │        │   ✓    │
│ OS-level security patching         │    ✓     │        │        │
│ Kubernetes + application software  │          │   ✓    │        │
│ Model updates (signed bundles)     │          │   ✓    │        │
│ Model activation (HSM operation)   │          │        │   ✓    │
│ HSM management (client HSM)        │          │        │   ✓    │
│ API key management                 │          │        │   ✓    │
│ Audit log retention                │          │        │   ✓    │
│ Data backup                        │          │        │   ✓    │
│ Access control (physical + logical)│          │        │   ✓    │
│ Incident response                  │          │   ✓    │   ✓    │
└────────────────────────────────────┴──────────┴────────┴────────┘

Note: Zeyro has NO remote access to sovereign deployments.
      All Zeyro involvement requires client-initiated access grant.
```

---

## 10. Capacity Planning & SLAs

### 10.1 Cloud Deployment SLAs

| Metric | Target | Measurement |
|---|---|---|
| API uptime | 99.9% monthly | Uptime Robot (external) |
| Inference p99 latency (sync) | < 250ms | DCGM + Prometheus |
| Inference p99 latency (agent) | < 5s | Application metrics |
| Training job start latency | < 5 min from submission | Argo Workflows |
| Model deployment (canary start) | < 30 min from registry push | Istio canary metrics |
| RTO (infrastructure failure) | < 1 hour | DR runbook |
| RPO (data loss window) | < 15 minutes | PostgreSQL WAL streaming |

### 10.2 Sovereign Deployment SLAs

| Metric | Target | Measurement |
|---|---|---|
| Inference p99 latency (sync) | < 350ms (sovereign overhead) | Client-side Prometheus |
| Uptime | 99.5% monthly (hardware dep.) | Client-side monitoring |
| Model update delivery | ≤ 30 days from Zeyro release | Courier SLA |
| Model activation window | < 2 business days from receipt | Client HSM operator |
| Zeyro support response (P1) | < 4 hours business hours | Ticket system |
| HW replacement (Nextgen) | < 48 hours for critical GPU node | Nextgen SLA |

### 10.3 Capacity Baseline (Sovereign Tier)

| Tier | GPU Spec | Throughput | Use Case |
|---|---|---|---|
| **Sovereign Standard** | 4× A100 40GB | 200 BFS/min, 50 doc/min | Single department, small PSU |
| **Sovereign Premium** | 8× H100 80GB | 1,000 BFS/min, 200 doc/min | PSU bank, large insurer |
| **Sovereign Enterprise** | 16× H100 80GB + IB | 5,000 BFS/min, 500 doc/min | National-level institution |

---

## 11. Partner Integration Requirements (Nextgen)

This section defines what Zeyro needs from Nextgen as the GPU infrastructure partner.

### 11.1 Cloud Infrastructure Requirements

```yaml
cloud_requirements:
  region:          India (Mumbai preferred, Delhi NCR acceptable)
  data_residency:  All compute and storage India-domiciled
  compliance:      ISO 27001, SOC 2 Type II (Nextgen certification required)

gpu_nodes:
  training_h100:
    count:         16 nodes minimum
    spec:          8× H100 80GB SXM per node (128 GPU total)
    interconnect:  InfiniBand NDR 400Gbps (node-to-node)
    storage:       Local NVMe 8TB per node (training scratch)

  inference_a100:
    count:         8 nodes minimum
    spec:          8× A100 40GB per node (64 GPU total)
    interconnect:  100GbE (InfiniBand not required)

  inference_t4:
    count:         16 nodes
    spec:          4× T4 16GB per node (64 GPU total)

  inference_l4:
    count:         8 nodes
    spec:          4× L4 24GB per node (32 GPU total)

kubernetes:
  version:         1.29+ (Nextgen managed or Zeyro managed, TBD)
  gpu_operator:    NVIDIA GPU Operator 23.9+
  cni:             Cilium 1.15+
  storage_class:   Ceph RBD or equivalent (block for PVCs)

networking:
  api_public:      1Gbps+ public endpoint, DDoS protection
  internal:        10GbE minimum node-to-node
  gpu_cluster:     InfiniBand HDR/NDR (training nodes only)
```

### 11.2 Sovereign Hardware Supply Requirements

```yaml
sovereign_hardware:
  delivery:         Nextgen ships hardware to client DC
                    Nextgen engineer on-site for rack-and-stack (1-2 days)
  warranty:         Minimum 3-year hardware warranty with on-site SLA
  maintenance:      Nextgen responsible for hardware break-fix
                    4hr on-site for GPU node failure (Premium/Enterprise)

sovereign_standard_spec:
  gpu_nodes:        1× server, 4× NVIDIA A100 40GB PCIe
  cpu:              2× AMD EPYC 7543 (64 cores total)
  ram:              512 GB DDR4
  storage:          2× 3.84TB NVMe (local), 2× 1.92TB SSD (OS)
  network:          2× 25GbE (client LAN) + 1× 1GbE (IPMI)
  power:            Dual PSU, 3,000W

sovereign_premium_spec:
  gpu_nodes:        2× servers, 4× H100 80GB SXM per server
  cpu:              2× AMD EPYC 9554 (64P-cores total per server)
  ram:              1 TB HBM3 (GPU) + 512 GB DDR5 (CPU) per server
  storage:          4× 7.68TB NVMe per server
  network:          2× 100GbE (client LAN) + InfiniBand (inter-server)
  power:            Dual PSU, 10,000W per server

client_hsm_supply:
  model:            Thales Luna T7 (Nextgen partners with Thales India)
  zeyro_provision:  Zeyro HSM operator performs key ceremony (day-0 setup)
  client_custody:   Client takes full custody of HSM + backup tokens after ceremony
```

### 11.3 Commercial Framework (Indicative)

| Component | Model | Notes |
|---|---|---|
| Cloud GPU (training) | Reserved instance (annual) + spot burst | Zeyro commits min GPU-hours/month |
| Cloud GPU (inference) | On-demand + reserved baseline | KEDA autoscaling within budget cap |
| Sovereign hardware | Capex (client via Nextgen) or Opex (Nextgen lease) | Zeyro software license separate |
| Sovereign support | Annual maintenance contract (Nextgen HW SLA) | Zeyro software support separate |
| Network transit | Included in Nextgen cloud (India region) | Inter-region egress excluded |

---

## 12. Decision Log

### Why separate training and inference clusters?

Training workloads have high memory pressure, require MIG partitioning, and tolerate minutes of setup latency. Inference workloads require constant sub-250ms response. Running both on shared nodes creates GPU memory contention and risks training jobs starving inference pods during peak. Physical separation is the only guaranteed isolation.

### Why NVIDIA Triton and not vLLM or TGI exclusively?

Triton supports ensemble pipelines — multiple models chained in a single request (e.g., OCR → layout → extraction for FinDoc). vLLM and TGI are optimized for single-model LLM serving. We use vLLM internally within Triton's Python backend for agent LLM inference, but Triton is the unified serving interface.

### Why Ed25519 for model signing?

Ed25519 provides strong security at 256-bit key size with fast verification — critical for the model activation path. RSA-4096 adds unnecessary overhead. Ed25519 is supported by all major HSM vendors including Thales Luna.

### Why no Zeyro-side remote access to sovereign deployments?

Two reasons: (1) **Regulatory** — RBI IT framework and DPDP Act require the data fiduciary (the PSU bank or insurer) to control access to systems processing their customers' data. Vendor remote access violates this control. (2) **Commercial trust** — PSU and government clients will not deploy a system where a private vendor can access their data. Zero remote access is a hard commercial requirement, not a technical preference.

### Why monthly model delivery cadence for sovereign (not continuous)?

Continuous delivery requires internet for pull-based update mechanisms. The air-gap makes this impossible by design. Monthly courier is the minimum cadence that keeps models within acceptable drift bounds (< 3% AUC degradation over 30 days, per historical analysis). Critical hotfixes (e.g. regulatory model changes) are delivered out-of-band via secure courier within 72 hours.

### Why Nextgen as infrastructure partner vs. AWS/Azure direct?

AWS/Azure offer GPU compute in India but (a) do not offer sovereign/bare-metal deployment into client data centres, (b) require data to transit their networks even for VPC deployments, and (c) lack the hardware supply chain and on-site support for sovereign delivery. Nextgen's ability to supply bare-metal GPU hardware into client DCs while also hosting the cloud training cluster in India creates a unified infrastructure partnership that neither hyperscaler can match for this use case.

---

*Arthazeyro Technologies Pvt. Ltd.*  
*intelligence.zeyro.in · Incubated at DA-IICT, Gandhinagar*  
*Partner Confidential — Prepared for Nextgen. Do not distribute.*  
*Version 1.0 · July 2026*
