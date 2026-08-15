-- name: GetFeatures :many
SELECT * FROM feature_vectors
WHERE user_ref_hash = $1
  AND feature_window = $2
  AND feature_group = ANY(sqlc.arg(feature_groups)::text[]);
