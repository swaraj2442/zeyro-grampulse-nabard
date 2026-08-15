# AI Context

This folder stores durable project context for future AI-assisted development sessions.

The goal is to keep context:

- small enough to load quickly
- specific enough to guide implementation
- current enough to trust

Do not treat this folder as a dumping ground. If a file stops helping future sessions, trim it.

## Recommended read order

1. `project-overview.md`
2. `repo-map.md`
3. `current-status.md`
4. `decision-log.md`
5. `next-session.md`

## File purposes

- `project-overview.md`: what this product is, core architecture, and non-negotiables
- `repo-map.md`: where code lives and how responsibilities are split
- `current-status.md`: latest implementation state and what is already working
- `decision-log.md`: decisions made during development and why
- `next-session.md`: short handoff for the next prompting session
- `templates/session-update-template.md`: template for adding a new session handoff

## Update rules

- Update `current-status.md` when the actual repo state changes meaningfully.
- Update `decision-log.md` only for decisions with lasting impact.
- Update `next-session.md` at the end of a meaningful work session.
- Prefer replacing stale text instead of appending endless history.
- Keep each file concise and skimmable.

## Semi-automatic updates

Use the draft generator when you want a fast starting point:

```bash
make context-draft
```

This writes a draft file to:

- `context/_generated/session-draft.md`

Suggested workflow:

1. Run `make context-draft`
2. Review the generated draft
3. Copy only the useful parts into:
   - `context/current-status.md`
   - `context/decision-log.md`
   - `context/next-session.md`
   - `context/session-history.md`
4. Trim anything noisy or stale

This is intentionally semi-automatic. The generated file should help with speed, but the curated context files should still stay human-reviewed.
