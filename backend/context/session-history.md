# Session History

Use this only for short milestone-level notes.

## 2026-06-29

- Implemented Go and Python protobuf contract compilation in separate Go subfolders and a nested Python package `proto/py` using relative path import post-processing.
- Implemented Python feature computation service and worker (`python/features`) with pure-Python math calculators (no NumPy dependency).
- Implemented gRPC Scoring Engine service (`python/scoring`) for BFS, RPS, ATP, and Fraud Risk scoring with 5 demo personas.
- Implemented gRPC Agent Orchestrator service (`python/agents`) coordinating the risk state machine and Claude API narratives.
- Implemented database migrations for `response_json` in `assessments`, SQLC query bindings, and database seeding scripts (`seed_db.py`).
- Implemented Go Report service (`cmd/report-service`) serving assessments REST APIs and Go Outcome Ingestion service (`cmd/outcome-ingestion`).

## 2026-06-25

- Bootstrapped the monorepo structure.
- Added local dev dependencies with Docker Compose.
- Added initial schema, proto contracts, and OpenAPI bootstrap.
- Implemented bootstrap `auth-service` and `data-ingest`.
- Added the `context/` folder for durable AI session context.
- Added Postgres database access layer using `pgxpool` and `sqlc` for `data-ingest`.
- Upgraded authentication from bootstrap JWT to secure PASETO V4 Asymmetric tokens.
