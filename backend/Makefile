PROJECT_NAME := zeyro-b2b

.PHONY: help up down ps fmt lint test bootstrap context-draft

help:
	@printf "Available targets:\n"
	@printf "  make up         Start local infrastructure\n"
	@printf "  make down       Stop local infrastructure\n"
	@printf "  make ps         Show local infrastructure status\n"
	@printf "  make fmt        Placeholder for repo formatting\n"
	@printf "  make lint       Placeholder for repo linting\n"
	@printf "  make test       Placeholder for repo tests\n"
	@printf "  make bootstrap  Print next implementation steps\n"
	@printf "  make context-draft  Generate a draft AI context update\n"
	@printf "\nMLOps Targets:\n"
	@printf "  make train-cibil    Run BFS v0.5 supervised training\n"
	@printf "  make train-behavior Run BFS v1 representation learning\n"
	@printf "  make train-all      Run both training tracks\n"
	@printf "  make mlflow-ui      Start local MLflow dashboard\n"
	@printf "  make notebooks      Launch JupyterLab for auditing\n"
	@printf "  make test-scoring   Ping the gRPC scoring API\n"

up:
	docker compose up -d

down:
	docker compose down

ps:
	docker compose ps

fmt:
	@printf "Formatting hooks will be added with language tooling.\n"

lint:
	@printf "Lint hooks will be added with language tooling.\n"

test:
	@printf "Test targets will be added as services become runnable.\n"

bootstrap:
	@printf "Next steps:\n"
	@printf "  1. Define protobuf and OpenAPI contracts\n"
	@printf "  2. Add initial Postgres schema migration\n"
	@printf "  3. Implement auth, audit, and ingest service skeletons\n"
	@printf "  4. Build enrichment, features, and scoring service baselines\n"

context-draft:
	./scripts/update-context.sh

### MLOps Pipeline ###

PYTHON := .venv_sys/bin/python

.PHONY: train-cibil train-behavior train-all mlflow-ui notebooks test-scoring

train-cibil:
	@printf "Training CIBIL Supervised Model...\n"
	$(PYTHON) scripts/train_cibil_xgboost.py

train-behavior:
	@printf "Generating UPI Behavioral Embeddings...\n"
	$(PYTHON) bfs/behavior_embeddings.py

train-all: train-cibil train-behavior
	@printf "All BFS models trained successfully.\n"

mlflow-ui:
	@printf "Starting MLflow UI on http://localhost:5001\n"
	.venv_sys/bin/mlflow ui --port 5001

notebooks:
	@printf "Starting JupyterLab environment...\n"
	$(MAKE) -C notebooks run

test-scoring:
	@printf "Triggering gRPC Scoring Service...\n"
	$(PYTHON) scripts/trigger_scoring_service.py

seed-underwriting:
	@printf "Seeding underwriting data...\n"
	docker exec -i zeyro-postgres psql -U zeyro -d zeyro < scripts/seed_underwriting.sql
