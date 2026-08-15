-- name: CreateConsentArtifact :one
INSERT INTO consent_artifacts (
    partner_id,
    user_ref_hash,
    purpose_code,
    status
) VALUES (
    $1, $2, $3, 'PENDING'
) RETURNING *;

-- name: GetConsentByUserAndPurpose :one
SELECT * FROM consent_artifacts
WHERE partner_id = $1 AND user_ref_hash = $2 AND purpose_code = $3
ORDER BY created_at DESC
LIMIT 1;

-- name: GetConsentById :one
SELECT * FROM consent_artifacts
WHERE id = $1;

-- name: UpdateConsentStatus :exec
UPDATE consent_artifacts
SET status = $2, updated_at = NOW()
WHERE id = $1;
