# Repo Map

## Top-level layout

- `cmd/`: Go service entrypoints
- `internal/`: shared Go packages
- `python/`: Python intelligence services
- `proto/`: gRPC contracts
- `api/`: external REST contract
- `migrations/`: Postgres schema history
- `infra/`: Docker, Helm, Terraform, Kubernetes
- `configs/`: partner and model config
- `tests/`: integration, compliance, and load tests
- `docs/`: human-facing project docs
- `context/`: durable AI session context

## Current service intent

- `cmd/auth-service`: bootstrap token issuance from static API key
- `cmd/data-ingest`: bootstrap UPI ingest endpoint with validation and audit logging
- `cmd/audit-service`: placeholder
- `cmd/consent-orchestration`: placeholder
- `cmd/partner-config`: placeholder
- `cmd/report-service`: placeholder
- `cmd/webhook-service`: placeholder
- `cmd/outcome-ingestion`: placeholder

## Shared packages in use

- `internal/domain`: DTOs and domain-level request/response structures
- `internal/middleware`: HTTP JSON helpers
- `internal/crypto`: hashing utilities
- `internal/messaging`: bootstrap audit logger abstraction

## Python packages

- `python/enrichment`: resolver, categorizer, pipeline placeholders
- `python/features`: worker and validation placeholders
- `python/scoring`: server and registry placeholders
- `python/agents`: orchestration placeholders
- `python/training`: offline training placeholders

