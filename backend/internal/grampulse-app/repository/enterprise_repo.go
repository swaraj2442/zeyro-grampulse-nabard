package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/arthazeyro/zeyro-b2b/internal/grampulse-app/database"
	"github.com/arthazeyro/zeyro-b2b/internal/grampulse-app/models"
)

type EnterpriseRepository interface {
	GetAll(ctx context.Context, statusFilter string, searchQuery string) ([]models.Enterprise, error)
	GetByID(ctx context.Context, id string) (*models.Enterprise, error)
	GetSubScreenData(ctx context.Context, enterpriseID string, screenType string) (any, error)
	GetAllSubscreens(ctx context.Context, enterpriseID string) (map[string]any, error)
	GetVisits(ctx context.Context) ([]models.Visit, error)
	GetInterventions(ctx context.Context) ([]models.Intervention, error)
	GetAlerts(ctx context.Context) ([]models.Alert, error)
	GetOfficerProfile(ctx context.Context) (*models.OfficerProfile, error)
	GetPortfolioSummary(ctx context.Context) (*models.PortfolioSummary, error)
}

type SQLiteEnterpriseRepository struct {
	db *database.SQLiteDB
}

func NewSQLiteEnterpriseRepository(db *database.SQLiteDB) *SQLiteEnterpriseRepository {
	return &SQLiteEnterpriseRepository{db: db}
}

func (r *SQLiteEnterpriseRepository) GetAll(ctx context.Context, statusFilter string, searchQuery string) ([]models.Enterprise, error) {
	query := "SELECT data_json FROM enterprises WHERE 1=1"
	var args []any

	if statusFilter != "" && statusFilter != "All" {
		query += " AND status = ?"
		args = append(args, statusFilter)
	}

	if searchQuery != "" {
		query += " AND (name LIKE ? OR location LIKE ? OR sector LIKE ?)"
		searchPattern := "%" + searchQuery + "%"
		args = append(args, searchPattern, searchPattern, searchPattern)
	}

	query += " ORDER BY CASE status WHEN 'Critical' THEN 1 WHEN 'Watchlist' THEN 2 ELSE 3 END, name ASC"

	rows, err := r.db.DB.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("query enterprises: %w", err)
	}
	defer rows.Close()

	var list []models.Enterprise
	for rows.Next() {
		var dataJSON string
		if err := rows.Scan(&dataJSON); err != nil {
			return nil, fmt.Errorf("scan enterprise: %w", err)
		}
		var e models.Enterprise
		if err := json.Unmarshal([]byte(dataJSON), &e); err != nil {
			return nil, fmt.Errorf("unmarshal enterprise: %w", err)
		}
		list = append(list, e)
	}

	return list, nil
}

func (r *SQLiteEnterpriseRepository) GetByID(ctx context.Context, id string) (*models.Enterprise, error) {
	var dataJSON string
	err := r.db.DB.QueryRowContext(ctx, "SELECT data_json FROM enterprises WHERE id = ?", id).Scan(&dataJSON)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("get enterprise %s: %w", id, err)
	}

	var e models.Enterprise
	if err := json.Unmarshal([]byte(dataJSON), &e); err != nil {
		return nil, fmt.Errorf("unmarshal enterprise %s: %w", id, err)
	}
	return &e, nil
}

func (r *SQLiteEnterpriseRepository) GetSubScreenData(ctx context.Context, enterpriseID string, screenType string) (any, error) {
	// Normalize screenType
	screenType = strings.ReplaceAll(screenType, "-", "_")

	var dataJSON string
	err := r.db.DB.QueryRowContext(ctx, "SELECT data_json FROM subscreens WHERE enterprise_id = ? AND screen_type = ?", enterpriseID, screenType).Scan(&dataJSON)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// If not found for specific ID, try finding default or synthesize from enterprise
			e, entErr := r.GetByID(ctx, enterpriseID)
			if entErr == nil && e != nil {
				return e, nil
			}
			return nil, nil
		}
		return nil, fmt.Errorf("get subscreen %s for %s: %w", screenType, enterpriseID, err)
	}

	var result any
	if err := json.Unmarshal([]byte(dataJSON), &result); err != nil {
		return nil, fmt.Errorf("unmarshal subscreen: %w", err)
	}
	return result, nil
}

func (r *SQLiteEnterpriseRepository) GetAllSubscreens(ctx context.Context, enterpriseID string) (map[string]any, error) {
	rows, err := r.db.DB.QueryContext(ctx, "SELECT screen_type, data_json FROM subscreens WHERE enterprise_id = ?", enterpriseID)
	if err != nil {
		return nil, fmt.Errorf("query subscreens for %s: %w", enterpriseID, err)
	}
	defer rows.Close()

	results := make(map[string]any)
	for rows.Next() {
		var screenType, dataJSON string
		if err := rows.Scan(&screenType, &dataJSON); err != nil {
			return nil, fmt.Errorf("scan subscreen: %w", err)
		}
		var parsed any
		_ = json.Unmarshal([]byte(dataJSON), &parsed)
		results[screenType] = parsed
	}

	return results, nil
}

func (r *SQLiteEnterpriseRepository) GetVisits(ctx context.Context) ([]models.Visit, error) {
	rows, err := r.db.DB.QueryContext(ctx, "SELECT data_json FROM visits ORDER BY created_at DESC")
	if err != nil {
		return nil, fmt.Errorf("query visits: %w", err)
	}
	defer rows.Close()

	var list []models.Visit
	for rows.Next() {
		var dataJSON string
		if err := rows.Scan(&dataJSON); err != nil {
			return nil, fmt.Errorf("scan visit: %w", err)
		}
		var v models.Visit
		if err := json.Unmarshal([]byte(dataJSON), &v); err != nil {
			return nil, fmt.Errorf("unmarshal visit: %w", err)
		}
		list = append(list, v)
	}
	return list, nil
}

func (r *SQLiteEnterpriseRepository) GetInterventions(ctx context.Context) ([]models.Intervention, error) {
	rows, err := r.db.DB.QueryContext(ctx, "SELECT data_json FROM interventions ORDER BY created_at DESC")
	if err != nil {
		return nil, fmt.Errorf("query interventions: %w", err)
	}
	defer rows.Close()

	var list []models.Intervention
	for rows.Next() {
		var dataJSON string
		if err := rows.Scan(&dataJSON); err != nil {
			return nil, fmt.Errorf("scan intervention: %w", err)
		}
		var iv models.Intervention
		if err := json.Unmarshal([]byte(dataJSON), &iv); err != nil {
			return nil, fmt.Errorf("unmarshal intervention: %w", err)
		}
		list = append(list, iv)
	}
	return list, nil
}

func (r *SQLiteEnterpriseRepository) GetAlerts(ctx context.Context) ([]models.Alert, error) {
	rows, err := r.db.DB.QueryContext(ctx, "SELECT id, title, subtitle, severity, time, location, created_at FROM alerts ORDER BY created_at DESC")
	if err != nil {
		return nil, fmt.Errorf("query alerts: %w", err)
	}
	defer rows.Close()

	var list []models.Alert
	for rows.Next() {
		var a models.Alert
		if err := rows.Scan(&a.ID, &a.Title, &a.Subtitle, &a.Severity, &a.Time, &a.Location, &a.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan alert: %w", err)
		}
		list = append(list, a)
	}
	return list, nil
}

func (r *SQLiteEnterpriseRepository) GetOfficerProfile(ctx context.Context) (*models.OfficerProfile, error) {
	var dataJSON string
	err := r.db.DB.QueryRowContext(ctx, "SELECT data_json FROM officer WHERE id = 'current'").Scan(&dataJSON)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return &models.OfficerProfile{
				Name:             "Priya Sharma",
				Role:             "Regional Officer",
				Region:           "NABARD Nashik",
				AvatarInitials:   "PS",
				EnterprisesCount: 10,
				VisitsPerMonth:   28,
				RecoveryRate:     "92%",
			}, nil
		}
		return nil, fmt.Errorf("get officer: %w", err)
	}

	var off models.OfficerProfile
	if err := json.Unmarshal([]byte(dataJSON), &off); err != nil {
		return nil, fmt.Errorf("unmarshal officer: %w", err)
	}
	return &off, nil
}

func (r *SQLiteEnterpriseRepository) GetPortfolioSummary(ctx context.Context) (*models.PortfolioSummary, error) {
	enterprises, err := r.GetAll(ctx, "", "")
	if err != nil {
		return nil, err
	}

	officer, err := r.GetOfficerProfile(ctx)
	if err != nil {
		return nil, err
	}

	criticalCount := 0
	watchlistCount := 0
	stableCount := 0
	totalScore := 0

	for _, e := range enterprises {
		switch e.Status {
		case "Critical":
			criticalCount++
		case "Watchlist":
			watchlistCount++
		default:
			stableCount++
		}
		scoreSum := 0
		for _, ci := range e.CompositeIndicators {
			scoreSum += ci.Score
		}
		if len(e.CompositeIndicators) > 0 {
			totalScore += scoreSum / len(e.CompositeIndicators)
		} else {
			totalScore += 75
		}
	}

	avgScore := 0
	if len(enterprises) > 0 {
		avgScore = totalScore / len(enterprises)
	}

	return &models.PortfolioSummary{
		TotalEnterprises:   len(enterprises),
		CriticalCount:      criticalCount,
		WatchlistCount:     watchlistCount,
		StableCount:        stableCount,
		AvgHealthScore:     avgScore,
		TotalOutflowAtRisk: "₹1.2L",
		Officer:            *officer,
	}, nil
}
