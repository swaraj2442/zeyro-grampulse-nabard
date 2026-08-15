-- name: CreateOutcome :one
INSERT INTO consortium_outcomes (
    assessment_id, partner_id, user_ref_hash, score_version, css_score, rps_label,
    outcome_label, outcome_reported_at, loan_amount_inr, loan_tenor_days, product_type
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10
) RETURNING *;
