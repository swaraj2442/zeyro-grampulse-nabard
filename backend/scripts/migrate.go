package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://zeyro:zeyro@localhost:5432/zeyro?sslmode=disable"
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		fmt.Printf("Failed to connect to database: %v\n", err)
		os.Exit(1)
	}
	defer pool.Close()

	files, err := filepath.Glob("migrations/*.sql")
	if err != nil {
		fmt.Printf("Failed to list migrations: %v\n", err)
		os.Exit(1)
	}
	
	for _, f := range files {
		sqlBytes, err := os.ReadFile(f)
		if err != nil {
			fmt.Printf("Failed to read migration file %s: %v\n", f, err)
			continue
		}

		_, err = pool.Exec(ctx, string(sqlBytes))
		if err != nil {
			fmt.Printf("Failed to execute migration %s (might already be applied): %v\n", f, err)
		} else {
			fmt.Printf("Successfully applied migration %s\n", f)
		}
	}
}
