# Zeyro B2B

Monorepo bootstrap for the Zeyro B2B intelligence platform described in [Architecture V2.md](./Architecture%20V2.md).

## Current scope

This repository currently includes:

- Shared monorepo structure for Go services, Python intelligence services, contracts, infra, and tests
- Local development dependencies via Docker Compose
- Starter manifests for Go and Python workspaces
- First-pass database schema, API contracts, and bootstrap HTTP services for auth and ingestion
- Durable AI session context in `context/`

## Phase 1 goals

The first implementation phase focuses on platform foundations:

- `auth-service`
- `partner-config`
- `audit-service`
- `data-ingest`
- `consent-orchestration`
- `enrichment-engine`
- `feature-pipeline`
- `scoring-engine`

## Repository map

```text
cmd/         Go service entrypoints
internal/    Shared Go packages
python/      Python intelligence services
proto/       gRPC contracts
api/         External API contracts and SDK stubs
migrations/  Database schema migrations
infra/       Docker, Helm, Kubernetes, Terraform
configs/     Partner and model configuration
tests/       Integration, compliance, and load tests
docs/        Architecture and operational documentation
```

## Getting started

1. Start local dependencies with `make up`
2. Review bootstrap tasks with `make help`
3. Read `context/README.md` and `context/current-status.md` before continuing implementation in a new AI session
4. Run `go run ./cmd/auth-service` to start the auth service
5. Run `go run ./cmd/data-ingest` to start the ingest service
6. Expand the contracts in `proto/` and wire persistence into the bootstrap services

## AI context workflow

To generate a draft update for future prompting sessions:

```bash
make context-draft
```

That creates `context/_generated/session-draft.md`, which you can review and then use to update the curated files in `context/`.

## Bootstrap service configuration

Auth service environment variables:

- `AUTH_SERVICE_PORT` default `8001`
- `ZEYRO_STATIC_API_KEY` default `dev-api-key`
- `ZEYRO_STATIC_PARTNER_ID` default `00000000-0000-0000-0000-000000000001`
- `ZEYRO_STATIC_SCOPES` default `credit,fraud,outcomes`
- `ZEYRO_JWT_SECRET` default `dev-secret`

Data ingest environment variables:

- `DATA_INGEST_PORT` default `8003`
