-- name: UpsertUser :one
INSERT INTO users (id, email, full_name, role, company_name)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    company_name = EXCLUDED.company_name
RETURNING *;

-- name: GetUser :one
SELECT id, email, full_name, role, company_name, created_at
FROM users
WHERE id = $1;

-- name: CreateWorkspace :one
INSERT INTO workspaces (name, type)
VALUES ($1, $2)
RETURNING *;

-- name: AddWorkspaceMember :exec
INSERT INTO workspace_members (workspace_id, user_id, role, is_default)
VALUES ($1, $2, $3, $4)
ON CONFLICT (workspace_id, user_id) DO NOTHING;

-- name: GetUserWorkspaces :many
SELECT w.id, w.name, w.type, w.created_at, wm.is_default
FROM workspaces w
JOIN workspace_members wm ON w.id = wm.workspace_id
WHERE wm.user_id = $1;

-- name: ListWorkspaces :many
SELECT id, name, type, created_at
FROM workspaces;
