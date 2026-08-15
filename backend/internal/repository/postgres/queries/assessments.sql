-- name: CreateAssessment :one
INSERT INTO assessments (
    id, partner_id, consent_id, partner_ref_id, user_ref_hash, status, requested_products, score_version
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
) RETURNING *;

-- name: UpdateAssessmentResult :one
UPDATE assessments
SET status = $2,
    overall_signal = $3,
    response_json = $4,
    completed_at = NOW()
WHERE id = $1
RETURNING *;

-- name: GetAssessment :one
SELECT * FROM assessments
WHERE id = $1 LIMIT 1;
