-- name: CreateAuditEvent :one
INSERT INTO audit_events (
    event_type,
    partner_id,
    actor_type,
    actor_ref,
    resource_type,
    resource_ref,
    status,
    payload,
    occurred_at
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9
) RETURNING *;
