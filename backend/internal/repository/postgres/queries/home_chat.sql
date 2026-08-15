-- name: GetHomeBanner :one
SELECT id, title, subtitle, completion_percentage, hero_image_url 
FROM home_banners 
WHERE workspace_id = $1 
ORDER BY created_at DESC LIMIT 1;

-- name: GetHomeTasks :many
SELECT id, title, description, duration_minutes, status, icon_type 
FROM home_tasks 
WHERE workspace_id = $1 
ORDER BY display_order ASC;

-- name: GetRecommendedSteps :many
SELECT id, title 
FROM home_recommended_steps 
WHERE workspace_id = $1 
ORDER BY display_order ASC;

-- name: CreateChatThread :one
INSERT INTO chat_threads (workspace_id, user_id, title) 
VALUES ($1, $2, $3) 
RETURNING id, workspace_id, user_id, title, created_at;

-- name: CreateChatMessage :one
INSERT INTO chat_messages (thread_id, sender_type, content) 
VALUES ($1, $2, $3) 
RETURNING id, thread_id, sender_type, content, created_at;

-- name: GetChatMessages :many
SELECT id, thread_id, sender_type, content, created_at 
FROM chat_messages 
WHERE thread_id = $1 
ORDER BY created_at ASC;
