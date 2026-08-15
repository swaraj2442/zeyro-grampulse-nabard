# Decision Log

## 2026-06-29

### NumPy Elimination in Feature Pipeline

Decision:
Avoided importing `numpy` in the feature computation pipeline by writing native Python mathematical helper functions for mean, standard deviation, and linear regression slope.

Why:
- keeps python dependencies extremely lightweight and portable
- avoids issues with pre-compiled C-extensions on target execution environments
- pure-Python implementation is fast enough for the rolling cash flow analytics since data inputs are already filtered by date window

### Python Protobuf Subdirectory and Relative Import Refactoring

Decision:
Compiled Python protobuf definitions into a nested `proto/py` directory and post-processed generated gRPC files to replace absolute pb2 imports with relative package imports (e.g. `from . import X_pb2`).

Why:
- separates generated Python interfaces from Go files and source configurations
- fixes typical Python gRPC import issues when files are imported as nested packages
- makes the `proto/py` directory an importable, self-contained Python package module

## 2026-06-25

### Monorepo as the starting architecture

Decision:
Use a monorepo for shared platform services, intelligence services, contracts, infra, and partner configuration.

Why:
- shared contracts will evolve together early on
- architecture has strong cross-service data coupling
- compliance rules need uniform implementation
- a small team benefits from one development surface

### Shared platform plus partner-specific extensions

Decision:
Treat the product as a shared core platform with partner-specific configuration and later extension modules, rather than separate forks per partner.

Why:
- the core moat is shared data and scoring infrastructure
- partner differences should mostly live in config, adapters, policies, and enabled modules
- forking services per partner would create long-term maintenance drag

### Keep AI context minimal and current

Decision:
Use a small `context/` folder with summary files instead of a large all-purpose memory dump.

Why:
- future prompting sessions need high-signal context, not long archives
- stale or bloated context tends to reduce usefulness

### Database Access with SQLC

Decision:
Use `sqlc` to generate type-safe Go repository code from raw SQL queries instead of using an ORM or manual `pgx` mappings.

Why:
- maintains precise control over queries
- eliminates boilerplate without sacrificing type safety or performance
- standardizes database access patterns across all Go services

### Raw Ingest Staging Table

Decision:
Store incoming UPI transactions exactly as received in a `raw_upi_transactions` staging table before they enter the enrichment pipeline.

Why:
- allows the `data-ingest` service to persist immediately without waiting for synchronous enrichment
- the existing `enriched_transactions` table has strict `NOT NULL` constraints for derived fields (like business category and tier) that aren't present at ingest
- decouples ingest throughput from the slower enrichment engine
