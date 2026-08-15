# Current Status

Last updated: 2026-06-29

## What exists now

- **Monorepo skeleton and Docker infra** (Postgres, Redis, NATS) are fully functional.
- **Go Services:**
  - `auth-service`: Validates keys and issues PASETO V4 Asymmetric tokens.
  - `consent-orchestration`: Standard lifecycle management for AA consent records.
  - `data-ingest`: Ingests raw UPI payloads, validates active consent, persists raw transactions, and publishes raw NATS events.
  - `audit-service`: Daemon persisting audit logs from NATS.
  - `report-service`: Exposes `POST /v1/assessments`, `GET /v1/assessments/{id}`, and `GET /v1/insights/{user_ref}`. Interacts with the Python risk engine via gRPC.
  - `outcome-ingestion`: Exposes `POST /v1/outcomes` to ingest partner outcome labels (`PAID_ON_TIME`, `DEFAULTED`, `PREPAID`).
- **Python Components:**
  - `enrichment-engine`: Normalizes raw UPI text strings, resolves merchant entities, and publishes recompute triggers.
  - `features-pipeline` (`python/features`): Consumes NATS events, extracts 11 categories of rolling metrics, and persists to `feature_vectors` table.
  - `scoring-engine` (`python/scoring`): gRPC server on port `8013` implementing calculations for BFS (scorecard), RPS (propensity), ATP (ability to pay), and Fraud Risk. Includes fallback logic for **5 pre-defined demo personas**.
  - `agent-orchestrator` (`python/agents`): gRPC server on port `8012` running the risk assessment state machine and calling Claude async narrative APIs.
- **Protobuf Contracts:** Compiled for both Go (in package subdirectories) and Python (in [proto/py/](file:///Users/swaraj/Documents/z-b2b/proto/py)).

## Current behavior

- Tokens and consent gate ingest and assessment paths.
- UPI webhooks publish NATS events, triggering transaction enrichment.
- Enrichment engine updates the database and triggers feature recalculation.
- Assessment requests invoke the Python agent orchestrator, query the scoring engine, generate narrative profiles, and write report results back to the database.

## Verified state

- `go test ./...` passes cleanly on all services.
- `python3 -m compileall python` compiles successfully.
- All Python import targets resolve cleanly at runtime.

## Biggest gaps

- Dynamic integration testing of NATS events in local Docker environments.
- Deployment scripts and configuration staging.
