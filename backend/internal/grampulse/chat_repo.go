package grampulse

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type ChatSession struct {
	ID        uuid.UUID
	UserID    uuid.UUID
	Messages  []map[string]interface{}
	CreatedAt time.Time
	UpdatedAt time.Time
}

type ChatRepository interface {
	GetSessionForUser(ctx context.Context, userID uuid.UUID) (*ChatSession, error)
	SaveSession(ctx context.Context, session *ChatSession) error
}

type SQLiteChatRepository struct {
	dbConn *sql.DB
}

func NewSQLiteChatRepository(dbConn *sql.DB) *SQLiteChatRepository {
	return &SQLiteChatRepository{dbConn: dbConn}
}

// GetSessionForUser returns the most recent chat session for a user, or creates a new one in memory if none exist
func (r *SQLiteChatRepository) GetSessionForUser(ctx context.Context, userID uuid.UUID) (*ChatSession, error) {
	if r.dbConn == nil {
		return &ChatSession{
			ID:       uuid.New(),
			UserID:   userID,
			Messages: []map[string]interface{}{},
		}, nil
	}

	query := `
		SELECT id, user_id, messages, created_at, updated_at 
		FROM chat_sessions 
		WHERE user_id = ? 
		ORDER BY updated_at DESC 
		LIMIT 1
	`
	
	row := r.dbConn.QueryRowContext(ctx, query, userID.String())
	
	var session ChatSession
	var messagesBytes []byte
	var idStr, userIDStr string
	var createdAtStr, updatedAtStr string
	
	err := row.Scan(&idStr, &userIDStr, &messagesBytes, &createdAtStr, &updatedAtStr)
	
	if err == sql.ErrNoRows {
		// Return a fresh session if none exists
		return &ChatSession{
			ID:       uuid.New(),
			UserID:   userID,
			Messages: []map[string]interface{}{},
		}, nil
	}
	
	if err != nil {
		return nil, fmt.Errorf("error fetching chat session: %w", err)
	}

	session.ID, _ = uuid.Parse(idStr)
	session.UserID, _ = uuid.Parse(userIDStr)
	// SQLite datetime format handling (UTC/RFC3339)
	session.CreatedAt, _ = time.Parse(time.RFC3339, createdAtStr)
	session.UpdatedAt, _ = time.Parse(time.RFC3339, updatedAtStr)

	if err := json.Unmarshal(messagesBytes, &session.Messages); err != nil {
		return nil, fmt.Errorf("error parsing messages json: %w", err)
	}

	return &session, nil
}

func (r *SQLiteChatRepository) SaveSession(ctx context.Context, session *ChatSession) error {
	if r.dbConn == nil {
		return nil // Ignore save if no DB is connected
	}

	messagesBytes, err := json.Marshal(session.Messages)
	if err != nil {
		return fmt.Errorf("error marshalling messages: %w", err)
	}

	now := time.Now().UTC().Format(time.RFC3339)

	query := `
		INSERT INTO chat_sessions (id, user_id, messages, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?)
		ON CONFLICT (user_id) DO UPDATE 
		SET messages = excluded.messages, updated_at = excluded.updated_at
	`
	
	_, err = r.dbConn.ExecContext(ctx, query, session.ID.String(), session.UserID.String(), string(messagesBytes), now, now)
	if err != nil {
		return fmt.Errorf("error saving chat session: %w", err)
	}

	return nil
}
