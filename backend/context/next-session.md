# Next Session

## Suggested starting prompt

Read `context/README.md`, `context/project-overview.md`, `context/repo-map.md`, and `context/current-status.md`, then run native/docker services and write integration scripts to verify the complete ingestion-to-assessment pipeline.

## Highest-value next tasks

1. Run the Postgres, Redis, and NATS docker containers and test database connectivity.
2. Write automated integration tests (bash or Python) to simulate raw transaction ingestion, NATS enrichment, feature computation, and final assessment retrieval.
3. Verify that assessment narrative outputs match the fallback templates for the 5 demo personas.

## Important cautions

- Ensure the python virtual environment (`.venv`) is activated when running Python servers to resolve dependencies.
- Use `scripts/compile_proto.py` if protobuf files are modified to ensure code generation is consistent.
- Do not check in Anthropic API keys; read them from environment variables.
