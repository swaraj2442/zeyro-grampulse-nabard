package database

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Database struct {
	Pool *pgxpool.Pool
}

func NewDatabase(ctx context.Context, dbURL string) (*Database, error) {
	if dbURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is empty")
	}
	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		return nil, fmt.Errorf("unable to connect to database: %w", err)
	}

	// Auto-create chat_sessions table for now (in a real app, use migrations)
	createTableQuery := `
	CREATE TABLE IF NOT EXISTS chat_sessions (
		id UUID PRIMARY KEY,
		user_id UUID NOT NULL,
		messages JSONB NOT NULL,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(user_id)
	);`
	if _, err := pool.Exec(ctx, createTableQuery); err != nil {
		return nil, fmt.Errorf("could not create chat_sessions table: %w", err)
	}

	return &Database{Pool: pool}, nil
}

func (db *Database) Close() {
	db.Pool.Close()
}
