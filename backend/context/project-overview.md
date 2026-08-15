# Project Overview

## What this repo is

Zeyro B2B is a monorepo for a partner-facing financial intelligence platform built around:

- consent-governed financial data access
- UPI transaction ingestion and enrichment
- feature computation for underwriting and fraud signals
- scoring and structured intelligence outputs
- strong audit and compliance controls

The authoritative long-form architecture source is:

- [Architecture V2.md](/Users/swaraj/Documents/z-b2b/Architecture%20V2.md)

## Architecture direction

The system is intentionally split into:

- Go services for platform and control-plane concerns
- Python services for enrichment, features, scoring, agents, and training
- shared contracts in `proto/`
- shared external API definitions in `api/`
- shared infrastructure, migrations, and configs in top-level directories

## Core product principles

- Database-first, not model-first
- Compliance enforced at the data-access layer
- Shared platform with partner-specific modules and configs
- Raw financial data stays internal; APIs return structured intelligence
- Models are versioned and explainable; deterministic outputs are preferred where possible

## Current implementation phase

The repo is in bootstrap phase. The focus is building the first vertical slice:

- auth
- ingest
- audit
- schema/contracts
- then enrichment and persistence

