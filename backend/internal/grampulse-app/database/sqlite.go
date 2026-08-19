package database

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	_ "modernc.org/sqlite"

	"github.com/arthazeyro/zeyro-b2b/internal/grampulse-app/models"
)

type SQLiteDB struct {
	DB *sql.DB
}

func NewSQLiteDB(dbPath string) (*SQLiteDB, error) {
	if dbPath == "" {
		dbPath = "data/grampulse.db"
	}

	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create db directory: %w", err)
	}

	db, err := sql.Open("sqlite", dbPath+"?_pragma=busy_timeout(5000)&_pragma=journal_mode(WAL)")
	if err != nil {
		return nil, fmt.Errorf("failed to open sqlite database: %w", err)
	}

	db.SetMaxOpenConns(1) // SQLite single-writer safe
	db.SetMaxIdleConns(1)
	db.SetConnMaxLifetime(time.Hour)

	s := &SQLiteDB{DB: db}
	if err := s.migrate(context.Background()); err != nil {
		return nil, fmt.Errorf("migration failed: %w", err)
	}

	if err := s.seedIfEmpty(context.Background()); err != nil {
		log.Printf("WARNING: Seeding error: %v", err)
	}

	return s, nil
}

func (s *SQLiteDB) Close() error {
	return s.DB.Close()
}

func (s *SQLiteDB) migrate(ctx context.Context) error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS enterprises (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			location TEXT NOT NULL,
			sector TEXT NOT NULL,
			since TEXT NOT NULL,
			revenue REAL NOT NULL,
			status TEXT NOT NULL,
			data_json TEXT NOT NULL,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS subscreens (
			id TEXT PRIMARY KEY,
			enterprise_id TEXT NOT NULL,
			screen_type TEXT NOT NULL,
			data_json TEXT NOT NULL,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(enterprise_id, screen_type)
		);`,
		`CREATE TABLE IF NOT EXISTS visits (
			id TEXT PRIMARY KEY,
			enterprise_id TEXT NOT NULL,
			enterprise_name TEXT NOT NULL,
			location TEXT NOT NULL,
			time TEXT NOT NULL,
			risk_level TEXT NOT NULL,
			data_json TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS interventions (
			id TEXT PRIMARY KEY,
			enterprise_id TEXT NOT NULL,
			enterprise_name TEXT NOT NULL,
			title TEXT NOT NULL,
			description TEXT NOT NULL,
			severity TEXT NOT NULL,
			status TEXT NOT NULL,
			assigned_officer_id TEXT NOT NULL,
			assigned_officer_name TEXT NOT NULL,
			data_json TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS alerts (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			subtitle TEXT NOT NULL,
			severity TEXT NOT NULL,
			time TEXT NOT NULL,
			location TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS officer (
			id TEXT PRIMARY KEY,
			data_json TEXT NOT NULL,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`,
	}

	for _, q := range queries {
		if _, err := s.DB.ExecContext(ctx, q); err != nil {
			return fmt.Errorf("exec query failed: %w", err)
		}
	}
	return nil
}

func (s *SQLiteDB) seedIfEmpty(ctx context.Context) error {
	var count int
	err := s.DB.QueryRowContext(ctx, "SELECT COUNT(*) FROM enterprises").Scan(&count)
	if err != nil {
		return err
	}
	if count > 0 {
		return nil // Already seeded
	}

	log.Println("[SQLITE] Seeding database with consistent enterprise intelligence datasets...")

	enterprises := getSeedEnterprises()
	for _, e := range enterprises {
		dataBytes, _ := json.Marshal(e)
		_, err := s.DB.ExecContext(ctx, `
			INSERT INTO enterprises (id, name, location, sector, since, revenue, status, data_json, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`, e.ID, e.Name, e.Location, e.Sector, e.Since, e.Revenue, e.Status, string(dataBytes), time.Now())
		if err != nil {
			return fmt.Errorf("seed enterprise %s failed: %w", e.ID, err)
		}

		// Seed subscreens for this enterprise
		subscreens := getSeedSubscreensForEnterprise(e)
		for screenType, screenData := range subscreens {
			subBytes, _ := json.Marshal(screenData)
			subID := fmt.Sprintf("%s_%s", e.ID, screenType)
			_, err := s.DB.ExecContext(ctx, `
				INSERT OR REPLACE INTO subscreens (id, enterprise_id, screen_type, data_json, updated_at)
				VALUES (?, ?, ?, ?, ?)
			`, subID, e.ID, screenType, string(subBytes), time.Now())
			if err != nil {
				return fmt.Errorf("seed subscreen %s for %s failed: %w", screenType, e.ID, err)
			}
		}
	}

	// Seed Visits
	visits := getSeedVisits()
	for _, v := range visits {
		vBytes, _ := json.Marshal(v)
		_, _ = s.DB.ExecContext(ctx, `
			INSERT OR REPLACE INTO visits (id, enterprise_id, enterprise_name, location, time, risk_level, data_json, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		`, v.ID, v.EnterpriseID, v.EnterpriseName, v.Location, v.Time, v.RiskLevel, string(vBytes), v.CreatedAt)
	}

	// Seed Interventions
	interventions := getSeedInterventions()
	for _, iv := range interventions {
		ivBytes, _ := json.Marshal(iv)
		_, _ = s.DB.ExecContext(ctx, `
			INSERT OR REPLACE INTO interventions (id, enterprise_id, enterprise_name, title, description, severity, status, assigned_officer_id, assigned_officer_name, data_json, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`, iv.ID, iv.EnterpriseID, iv.EnterpriseName, iv.Title, iv.Description, iv.Severity, iv.Status, iv.AssignedOfficerID, iv.AssignedOfficerName, string(ivBytes), iv.CreatedAt)
	}

	// Seed Alerts
	alerts := getSeedAlerts()
	for _, a := range alerts {
		_, _ = s.DB.ExecContext(ctx, `
			INSERT OR REPLACE INTO alerts (id, title, subtitle, severity, time, location, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`, a.ID, a.Title, a.Subtitle, a.Severity, a.Time, a.Location, a.CreatedAt)
	}

	// Seed Officer Profile
	officer := models.OfficerProfile{
		Name:             "Priya Sharma",
		Role:             "Regional Officer",
		Region:           "NABARD Nashik",
		AvatarInitials:   "PS",
		EnterprisesCount: 10,
		VisitsPerMonth:   28,
		RecoveryRate:     "92%",
	}
	offBytes, _ := json.Marshal(officer)
	_, _ = s.DB.ExecContext(ctx, `INSERT OR REPLACE INTO officer (id, data_json, updated_at) VALUES ('current', ?, ?)`, string(offBytes), time.Now())

	log.Println("[SQLITE] Successfully seeded SQLite database with 10 harmonized enterprise profiles.")
	return nil
}
