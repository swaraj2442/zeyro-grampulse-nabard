#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/context/_generated"
OUTPUT_FILE="$OUTPUT_DIR/session-draft.md"

mkdir -p "$OUTPUT_DIR"

cd "$ROOT_DIR"

DATE_UTC="$(date -u +"%Y-%m-%d %H:%M:%S UTC")"
DATE_LOCAL="$(date +"%Y-%m-%d %H:%M:%S %Z")"

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  GIT_BRANCH="$(git symbolic-ref --short -q HEAD 2>/dev/null || git rev-parse --short HEAD 2>/dev/null || echo "unknown")"
  GIT_STATUS="$(git status --short 2>/dev/null || true)"
  RECENT_COMMITS="$(git log --oneline -5 2>/dev/null || true)"
else
  GIT_BRANCH="not-a-git-repo"
  GIT_STATUS=""
  RECENT_COMMITS=""
fi

TOP_LEVEL_FILES="$(find . -maxdepth 2 -type f \
  ! -path "./.git/*" \
  ! -path "./context/_generated/*" \
  | sed 's#^\./##' \
  | sort)"

CHANGED_FILES="$(printf '%s\n' "$GIT_STATUS" | sed -E 's/^[[:space:]]*[A-Z?]{1,2}[[:space:]]+//' | sed '/^$/d' || true)"

group_files() {
  local pattern="$1"
  printf '%s\n' "$CHANGED_FILES" | grep -E "$pattern" || true
}

CHANGED_GO_SERVICES="$(group_files '^cmd/')"
CHANGED_GO_SHARED="$(group_files '^internal/')"
CHANGED_PYTHON="$(group_files '^python/')"
CHANGED_CONTRACTS="$(group_files '^(proto/|api/)')"
CHANGED_DATA_LAYER="$(group_files '^(migrations/|configs/)')"
CHANGED_INFRA="$(group_files '^(infra/|docker-compose.yml|Makefile)')"
CHANGED_CONTEXT="$(group_files '^context/')"
CHANGED_DOCS="$(group_files '^(docs/|README.md|Architecture V2\.md)')"

PLACEHOLDER_FILES="$(find cmd python internal api proto migrations docs \
  -type f \
  \( -name '*.go' -o -name '*.py' -o -name '*.md' -o -name '*.yaml' -o -name '*.proto' -o -name '*.sql' \) \
  -exec grep -l -E 'bootstrap placeholder|Placeholder|TODO|To define|will be tracked here|This .* should become' {} + 2>/dev/null \
  | sed 's#^\./##' \
  | sort || true)"

PROTO_FILES="$(find proto -maxdepth 1 -type f -name '*.proto' | sed 's#^\./##' | sort || true)"
MIGRATION_FILES="$(find migrations -maxdepth 1 -type f | sed 's#^\./##' | sort || true)"
API_FILES="$(find api -maxdepth 2 -type f | sed 's#^\./##' | sort || true)"

NEXT_TASKS_FILE="$OUTPUT_DIR/.next-tasks.tmp"
: > "$NEXT_TASKS_FILE"

append_task() {
  local task="$1"
  if ! grep -Fqx "$task" "$NEXT_TASKS_FILE"; then
    printf '%s\n' "$task" >> "$NEXT_TASKS_FILE"
  fi
}

if printf '%s\n' "$PLACEHOLDER_FILES" | grep -q '^cmd/audit-service/main.go$'; then
  append_task "Implement a real audit-service write path and connect services to it."
fi

if printf '%s\n' "$PLACEHOLDER_FILES" | grep -q '^cmd/consent-orchestration/main.go$'; then
  append_task "Build consent-orchestration next so data access can be guarded by real consent state."
fi

if printf '%s\n' "$PLACEHOLDER_FILES" | grep -q '^python/enrichment/pipeline.py$'; then
  append_task "Wire the enrichment pipeline to consume accepted ingest records and resolve entities."
fi

if printf '%s\n' "$PLACEHOLDER_FILES" | grep -q '^python/features/workers.py$'; then
  append_task "Add feature workers for income, EMI, and volatility as the first computed signal groups."
fi

if printf '%s\n' "$PLACEHOLDER_FILES" | grep -q '^python/scoring/server.py$'; then
  append_task "Turn the scoring server into a minimal BFS and ATP service using versioned contracts."
fi

if ! find internal -type f -name '*.go' ! -name 'doc.go' | grep -q .; then
  append_task "Add a repository layer for Postgres access before service logic grows further."
fi

if ! grep -R "jwt" internal cmd -n 2>/dev/null | grep -q "verify"; then
  append_task "Add shared JWT verification middleware instead of header-only bearer checks."
fi

if ! grep -R "INSERT INTO\\|ExecContext\\|QueryContext" cmd internal -n 2>/dev/null | grep -q .; then
  append_task "Persist accepted ingest requests to the database or a staging table before enrichment."
fi

LIKELY_NEXT_TASKS="$(sed '/^$/d' "$NEXT_TASKS_FILE" || true)"
rm -f "$NEXT_TASKS_FILE"

render_section() {
  local title="$1"
  local content="$2"
  printf '### %s\n\n' "$title"
  printf '```text\n'
  printf '%s\n' "${content:-None.}"
  printf '```\n\n'
}

cat > "$OUTPUT_FILE" <<EOF
# Context Draft

Generated: $DATE_LOCAL
Generated (UTC): $DATE_UTC

This is a semi-automatic draft. Review it before copying any part into:

- \`context/current-status.md\`
- \`context/decision-log.md\`
- \`context/next-session.md\`
- \`context/session-history.md\`

## Repo Snapshot

- Branch: \`$GIT_BRANCH\`
- Root: \`$ROOT_DIR\`

## Working Tree

\`\`\`text
${GIT_STATUS:-Working tree clean or unavailable.}
\`\`\`

## Changed Files By Area

$(render_section "Go Services" "$CHANGED_GO_SERVICES")
$(render_section "Go Shared Packages" "$CHANGED_GO_SHARED")
$(render_section "Python Services" "$CHANGED_PYTHON")
$(render_section "Contracts and API" "$CHANGED_CONTRACTS")
$(render_section "Data Layer and Config" "$CHANGED_DATA_LAYER")
$(render_section "Infra and Tooling" "$CHANGED_INFRA")
$(render_section "Context Files" "$CHANGED_CONTEXT")
$(render_section "Docs" "$CHANGED_DOCS")

## Recent Commits

\`\`\`text
${RECENT_COMMITS:-No commits yet or unavailable.}
\`\`\`

## Top-Level Files

\`\`\`text
$TOP_LEVEL_FILES
\`\`\`

## Contract and Schema Surface

### Proto Files

\`\`\`text
${PROTO_FILES:-None.}
\`\`\`

### Migration Files

\`\`\`text
${MIGRATION_FILES:-None.}
\`\`\`

### API Files

\`\`\`text
${API_FILES:-None.}
\`\`\`

## Placeholder and Gap Scan

\`\`\`text
${PLACEHOLDER_FILES:-No placeholder-like files found.}
\`\`\`

## Suggested Status Update

Fill this section after reviewing today's actual work.

- What changed:
- What now works:
- Important gaps:
- Risks or caveats:

## Suggested Next Session

- Start by reading \`context/README.md\` and \`context/current-status.md\`.
- Review the current working tree before making changes.
- Continue from the highest-value unfinished vertical slice.

### Likely Next Tasks From Repo State

\`\`\`text
${LIKELY_NEXT_TASKS:-No likely tasks inferred.}
\`\`\`

## Promotion Checklist

Before copying this draft into curated context files:

- Remove stale or low-signal details
- Keep only durable decisions
- Prefer replacing outdated summaries over appending long history
- Ensure the next-session note points to the real next task
EOF

printf "Wrote %s\n" "$OUTPUT_FILE"
