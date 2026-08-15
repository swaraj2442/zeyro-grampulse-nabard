-- name: ListIntelligenceModules :many
SELECT id, name, description, is_active, created_at 
FROM intelligence_modules 
WHERE is_active = true
ORDER BY created_at ASC;
