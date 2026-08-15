package grampulse

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/arthazeyro/zeyro-b2b/internal/grampulse/db"
	_ "modernc.org/sqlite"
)

type Repository struct {
	dbConn *sql.DB
	q      *db.Queries
}

func NewRepository(dbPath string) (*Repository, error) {
	dbConn, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("open sqlite: %w", err)
	}
	dbConn.SetMaxOpenConns(1) // SQLite: single writer
	if err := dbConn.Ping(); err != nil {
		return nil, fmt.Errorf("ping sqlite: %w", err)
	}

	// Initialize tables (we execute schema.sql so it's fully created if missing)
	// For now we keep the dynamic creation of missing tables but rely on schema.sql via sqlc.
	// We'll run the statements from schema.sql dynamically if needed, or assume it's created.
	// Actually, just creating the ones that Go specifically cares about is fine.
	_, err = dbConn.Exec(`
		CREATE TABLE IF NOT EXISTS weather_cache_v2 (
			cache_key TEXT PRIMARY KEY,
			location_key TEXT NOT NULL,
			request_type TEXT NOT NULL,
			payload_json TEXT NOT NULL,
			source TEXT NOT NULL,
			fetched_at TEXT NOT NULL,
			expires_at TEXT NOT NULL
		);
		CREATE TABLE IF NOT EXISTS agmarknet_daily_prices (
			id TEXT PRIMARY KEY,
			arrival_date DATE NOT NULL,
			state_id TEXT,
			state_name TEXT,
			district_id TEXT,
			district_name TEXT,
			market_id TEXT,
			market_name TEXT,
			commodity_id TEXT,
			commodity_name TEXT,
			variety_id TEXT,
			variety_name TEXT,
			grade_id TEXT,
			grade_name TEXT,
			min_price NUMERIC,
			max_price NUMERIC,
			modal_price NUMERIC,
			arrivals NUMERIC,
			price_unit TEXT,
			arrival_unit TEXT,
			source TEXT NOT NULL,
			fetched_at TIMESTAMP NOT NULL,
			raw_hash TEXT NOT NULL,
			UNIQUE (arrival_date, market_id, commodity_id, variety_id, grade_id)
		);
		CREATE TABLE IF NOT EXISTS agmarknet_filters (
			filter_type TEXT NOT NULL,
			filter_id TEXT NOT NULL,
			filter_name TEXT NOT NULL,
			fetched_at TIMESTAMP NOT NULL,
			PRIMARY KEY (filter_type, filter_id)
		);
		CREATE TABLE IF NOT EXISTS chat_sessions (
			id TEXT PRIMARY KEY,
			user_id TEXT UNIQUE,
			messages TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		return nil, fmt.Errorf("create tables: %w", err)
	}

	return &Repository{
		dbConn: dbConn,
		q:      db.New(dbConn),
	}, nil
}

func (r *Repository) DB() *sql.DB {
	return r.dbConn
}

func (r *Repository) Close() { r.dbConn.Close() }

// ── Risk assessments ──────────────────────────────────────────────────────────

type RiskRow struct {
	EnterpriseID         string
	RiskScore            float64
	RiskLevel            string
	ForecastDeficit      float64
	DebtServiceShortfall float64
	StressMonth          string
	WarningLeadTimeDays  int
	DriversJSON          string
	AssessedAt           string
}

func (r *Repository) GetRiskAssessment(ctx context.Context, enterpriseID string) (*RiskRow, error) {
	ra, err := r.q.GetRiskAssessment(ctx, enterpriseID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &RiskRow{
		EnterpriseID:         ra.EnterpriseID,
		RiskScore:            float64(ra.RiskScore.Int64),
		RiskLevel:            ra.RiskLevel.String,
		ForecastDeficit:      ra.ForecastDeficit.Float64,
		DebtServiceShortfall: ra.DebtServiceShortfall.Float64,
		StressMonth:          ra.StressMonth.String,
		WarningLeadTimeDays:  int(ra.WarningLeadTimeDays.Int64),
		DriversJSON:          ra.DriversJson.String,
		AssessedAt:           ra.AssessedAt.String,
	}, nil
}

func (r *Repository) UpsertRiskAssessment(ctx context.Context, rr RiskRow) error {
	return r.q.UpsertRiskAssessment(ctx, db.UpsertRiskAssessmentParams{
		EnterpriseID:         rr.EnterpriseID,
		RiskScore:            sql.NullInt64{Int64: int64(rr.RiskScore), Valid: true},
		RiskLevel:            sql.NullString{String: rr.RiskLevel, Valid: true},
		ForecastDeficit:      sql.NullFloat64{Float64: rr.ForecastDeficit, Valid: true},
		DebtServiceShortfall: sql.NullFloat64{Float64: rr.DebtServiceShortfall, Valid: true},
		StressMonth:          sql.NullString{String: rr.StressMonth, Valid: true},
		WarningLeadTimeDays:  sql.NullInt64{Int64: int64(rr.WarningLeadTimeDays), Valid: true},
		DriversJson:          sql.NullString{String: rr.DriversJSON, Valid: true},
		AssessedAt:           sql.NullString{String: rr.AssessedAt, Valid: true},
	})
}

func (r *Repository) GetAllRiskAssessments(ctx context.Context) (map[string]RiskRow, error) {
	rows, err := r.q.GetAllRiskAssessments(ctx)
	if err != nil {
		return nil, err
	}
	m := make(map[string]RiskRow)
	for _, ra := range rows {
		m[ra.EnterpriseID] = RiskRow{
			EnterpriseID:        ra.EnterpriseID,
			RiskScore:           float64(ra.RiskScore.Int64),
			RiskLevel:           ra.RiskLevel.String,
			ForecastDeficit:     ra.ForecastDeficit.Float64,
			WarningLeadTimeDays: int(ra.WarningLeadTimeDays.Int64),
		}
	}
	return m, nil
}

// ── Forecast cache ────────────────────────────────────────────────────────────

func (r *Repository) GetCachedForecast(ctx context.Context, enterpriseID string) (map[string]any, error) {
	raw, err := r.q.GetCachedForecast(ctx, enterpriseID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	var out map[string]any
	return out, json.Unmarshal([]byte(raw.String), &out)
}

func (r *Repository) UpsertForecastCache(ctx context.Context, enterpriseID, modelVersion string, data map[string]any) error {
	raw, _ := json.Marshal(data)
	return r.q.UpsertForecastCache(ctx, db.UpsertForecastCacheParams{
		EnterpriseID: enterpriseID,
		RecordHash:   fmt.Sprintf("%d", time.Now().UnixNano()),
		ModelVersion: sql.NullString{String: modelVersion, Valid: true},
		ForecastJson: sql.NullString{String: string(raw), Valid: true},
		GeneratedAt:  sql.NullString{String: time.Now().UTC().Format(time.RFC3339), Valid: true},
	})
}

// ── Financial records ─────────────────────────────────────────────────────────

type FinancialRecord struct {
	ID               string
	EnterpriseID     string
	Month            string
	OperatingInflow  float64
	OperatingOutflow float64
	Savings          float64
	LoanRepayment    float64
	InventoryCost    float64
	RecordedAt       string
}

func (r *Repository) InsertFinancialRecord(ctx context.Context, fr FinancialRecord) error {
	return r.q.InsertFinancialRecord(ctx, db.InsertFinancialRecordParams{
		ID:               fr.ID,
		EnterpriseID:     fr.EnterpriseID,
		Month:            fr.Month,
		OperatingInflow:  sql.NullFloat64{Float64: fr.OperatingInflow, Valid: true},
		OperatingOutflow: sql.NullFloat64{Float64: fr.OperatingOutflow, Valid: true},
		Savings:          sql.NullFloat64{Float64: fr.Savings, Valid: true},
		LoanRepayment:    sql.NullFloat64{Float64: fr.LoanRepayment, Valid: true},
		InventoryCost:    sql.NullFloat64{Float64: fr.InventoryCost, Valid: true},
		RecordedAt:       fr.RecordedAt,
	})
}

func (r *Repository) GetSubmittedRecords(ctx context.Context, enterpriseID string) ([]map[string]any, error) {
	rows, err := r.q.GetSubmittedRecords(ctx, enterpriseID)
	if err != nil {
		return nil, err
	}
	var out []map[string]any
	for _, row := range rows {
		out = append(out, map[string]any{
			"month":             row.Month,
			"operating_inflow":  row.OperatingInflow.Float64,
			"operating_outflow": row.OperatingOutflow.Float64,
			"savings":           row.Savings.Float64,
			"loan_repayment":    row.LoanRepayment.Float64,
			"inventory_cost":    row.InventoryCost.Float64,
		})
	}
	return out, nil
}

// ── Interventions ─────────────────────────────────────────────────────────────

func (r *Repository) ListInterventions(ctx context.Context, enterpriseID string) ([]Intervention, error) {
	var rows []db.Intervention
	var err error
	if enterpriseID != "" {
		rows, err = r.q.ListInterventionsByEnterprise(ctx, enterpriseID)
	} else {
		rows, err = r.q.ListRecentInterventions(ctx)
	}
	if err != nil {
		return nil, err
	}
	var out []Intervention
	for _, row := range rows {
		out = append(out, Intervention{
			ID:                      row.ID,
			EnterpriseID:            row.EnterpriseID,
			RecommendedIntervention: row.RecommendedIntervention.String,
			IllustrativeAmount:      row.IllustrativeAmount.Float64,
			AssignedOfficer:         row.AssignedOfficer.String,
			VisitDate:               row.VisitDate.String,
			FollowUpDate:            row.FollowUpDate.String,
			Notes:                   row.Notes.String,
			Status:                  row.Status.String,
			CreatedAt:               row.CreatedAt.String,
			UpdatedAt:               row.UpdatedAt.String,
		})
	}
	return out, nil
}

func (r *Repository) InsertIntervention(ctx context.Context, iv Intervention) error {
	return r.q.InsertIntervention(ctx, db.InsertInterventionParams{
		ID:                      iv.ID,
		EnterpriseID:            iv.EnterpriseID,
		RecommendedIntervention: sql.NullString{String: iv.RecommendedIntervention, Valid: true},
		IllustrativeAmount:      sql.NullFloat64{Float64: iv.IllustrativeAmount, Valid: iv.IllustrativeAmount != 0},
		AssignedOfficer:         sql.NullString{String: iv.AssignedOfficer, Valid: true},
		VisitDate:               sql.NullString{String: iv.VisitDate, Valid: true},
		FollowUpDate:            sql.NullString{String: iv.FollowUpDate, Valid: true},
		Notes:                   sql.NullString{String: iv.Notes, Valid: true},
		Status:                  sql.NullString{String: iv.Status, Valid: true},
		CreatedAt:               sql.NullString{String: iv.CreatedAt, Valid: true},
		UpdatedAt:               sql.NullString{String: iv.UpdatedAt, Valid: true},
	})
}

func (r *Repository) UpdateInterventionStatus(ctx context.Context, id, status, updatedAt string) error {
	return r.q.UpdateInterventionStatus(ctx, db.UpdateInterventionStatusParams{
		Status:    sql.NullString{String: status, Valid: true},
		UpdatedAt: sql.NullString{String: updatedAt, Valid: true},
		ID:        id,
	})
}

// ── Alerts ────────────────────────────────────────────────────────────────────

func (r *Repository) GetAlerts(ctx context.Context, enterpriseID string) ([]Alert, error) {
	rows, err := r.q.GetAlerts(ctx, enterpriseID)
	if err != nil {
		return nil, err
	}
	var out []Alert
	for _, row := range rows {
		out = append(out, Alert{
			ID:           row.ID,
			EnterpriseID: row.EnterpriseID,
			RiskLevel:    row.RiskLevel.String,
			Title:        row.Title.String,
			Description:  row.Description.String,
			CreatedAt:    row.CreatedAt.String,
			Status:       row.Status.String,
		})
	}
	return out, nil
}

func (r *Repository) InsertAlert(ctx context.Context, a Alert) error {
	return r.q.InsertAlert(ctx, db.InsertAlertParams{
		ID:           a.ID,
		EnterpriseID: a.EnterpriseID,
		RiskLevel:    sql.NullString{String: a.RiskLevel, Valid: true},
		Title:        sql.NullString{String: a.Title, Valid: true},
		Description:  sql.NullString{String: a.Description, Valid: true},
		CreatedAt:    sql.NullString{String: a.CreatedAt, Valid: true},
		Status:       sql.NullString{String: a.Status, Valid: true},
	})
}

// ── Timeline ──────────────────────────────────────────────────────────────────

func (r *Repository) GetTimeline(ctx context.Context, enterpriseID string) ([]TimelineEvent, error) {
	rows, err := r.q.GetTimeline(ctx, enterpriseID)
	if err != nil {
		return nil, err
	}
	var out []TimelineEvent
	for _, row := range rows {
		out = append(out, TimelineEvent{
			ID:           row.ID,
			EnterpriseID: row.EnterpriseID,
			Date:         row.Date,
			Title:        row.Title.String,
			Description:  row.Description.String,
		})
	}
	return out, nil
}

func (r *Repository) InsertTimelineEvent(ctx context.Context, e TimelineEvent) error {
	return r.q.InsertTimelineEvent(ctx, db.InsertTimelineEventParams{
		ID:           e.ID,
		EnterpriseID: e.EnterpriseID,
		Date:         e.Date,
		Title:        sql.NullString{String: e.Title, Valid: true},
		Description:  sql.NullString{String: e.Description, Valid: true},
	})
}

// ── Portfolio helpers ─────────────────────────────────────────────────────────

type PortfolioStats struct {
	High                int
	Critical            int
	Healthy             int
	Medium              int
	TotalDeficit        float64
	ActiveInterventions int
	ScoredCount         int
	LastBatchScoredAt   *time.Time
}

func (r *Repository) GetPortfolioStats(ctx context.Context) (PortfolioStats, error) {
	var s PortfolioStats
	
	rows, err := r.q.GetPortfolioRiskStats(ctx)
	if err != nil {
		return s, err
	}
	for _, row := range rows {
		n := int(row.N)
		s.ScoredCount += n
		
		// var deficit float64 // unused
		// The COALESCE(SUM(forecast_deficit),0) returns an interface{} in SQLite sqlc sometimes, but it's castable.
		// wait, let's cast it depending on sqlc type.
		if val, ok := row.Deficit.(float64); ok {
			s.TotalDeficit += val
		} else if val, ok := row.Deficit.(int64); ok {
		    s.TotalDeficit += float64(val)
		}
		
		switch row.RiskLevel.String {
		case "Critical":
			s.Critical = n
		case "High":
			s.High = n
		case "Medium", "Amber":
			s.Medium = n
		case "Low", "Very Low":
			s.Healthy = n
		}
	}

	n, _ := r.q.GetActiveInterventionCount(ctx)
	s.ActiveInterventions = int(n)

	return s, nil
}

func (r *Repository) GetActiveInterventionCount(ctx context.Context) int {
	n, _ := r.q.GetActiveInterventionCount(ctx)
	return int(n)
}

// ── Market cache ──────────────────────────────────────────────────────────────

type MarketCacheRow struct {
	Commodity   string
	State       string
	Month       string
	ModalPrice  float64
	FetchedAt   string
	SourceType  string
}

func (r *Repository) GetMarketCache(ctx context.Context, commodity, month string) (*MarketCacheRow, error) {
	mc, err := r.q.GetMarketCache(ctx, db.GetMarketCacheParams{
		Commodity: commodity,
		Month:     month,
	})
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &MarketCacheRow{
		Commodity:  mc.Commodity,
		State:      mc.State,
		Month:      mc.Month,
		ModalPrice: mc.ModalPrice.Float64,
		FetchedAt:  mc.FetchedAt.String,
	}, nil
}

func (r *Repository) UpsertMarketCache(ctx context.Context, commodity, month string, price float64, source string) error {
	return r.q.UpsertMarketCache(ctx, db.UpsertMarketCacheParams{
		Commodity:  commodity,
		Month:      month,
		ModalPrice: sql.NullFloat64{Float64: price, Valid: true},
		FetchedAt:  sql.NullString{String: time.Now().UTC().Format(time.RFC3339), Valid: true},
	})
}

// ── AGMARKNET Daily Prices ───────────────────────────────────────────────────

type AgmarknetDailyPriceRow struct {
	ID             string
	ArrivalDate    string
	StateID        string
	StateName      string
	DistrictID     string
	DistrictName   string
	MarketID       string
	MarketName     string
	CommodityID    string
	CommodityName  string
	VarietyID      string
	VarietyName    string
	GradeID        string
	GradeName      string
	MinPrice       float64
	MaxPrice       float64
	ModalPrice     float64
	Arrivals       float64
	PriceUnit      string
	ArrivalUnit    string
	Source         string
	FetchedAt      string
	RawHash        string
}

func (r *Repository) UpsertAgmarknetPrice(ctx context.Context, p AgmarknetDailyPriceRow) error {
	layout := "2006-01-02T15:04:05Z"
	t, _ := time.Parse(layout, p.FetchedAt)
	arrivalDate, _ := time.Parse("2006-01-02", p.ArrivalDate)
	return r.q.UpsertAgmarknetPrice(ctx, db.UpsertAgmarknetPriceParams{
		ID:            p.ID,
		ArrivalDate:   arrivalDate,
		StateID:       sql.NullString{String: p.StateID, Valid: true},
		StateName:     sql.NullString{String: p.StateName, Valid: true},
		DistrictID:    sql.NullString{String: p.DistrictID, Valid: true},
		DistrictName:  sql.NullString{String: p.DistrictName, Valid: true},
		MarketID:      sql.NullString{String: p.MarketID, Valid: true},
		MarketName:    sql.NullString{String: p.MarketName, Valid: true},
		CommodityID:   sql.NullString{String: p.CommodityID, Valid: true},
		CommodityName: sql.NullString{String: p.CommodityName, Valid: true},
		VarietyID:     sql.NullString{String: p.VarietyID, Valid: true},
		VarietyName:   sql.NullString{String: p.VarietyName, Valid: true},
		GradeID:       sql.NullString{String: p.GradeID, Valid: true},
		GradeName:     sql.NullString{String: p.GradeName, Valid: true},
		MinPrice:      sql.NullFloat64{Float64: p.MinPrice, Valid: true},
		MaxPrice:      sql.NullFloat64{Float64: p.MaxPrice, Valid: true},
		ModalPrice:    sql.NullFloat64{Float64: p.ModalPrice, Valid: true},
		Arrivals:      sql.NullFloat64{Float64: p.Arrivals, Valid: true},
		PriceUnit:     sql.NullString{String: p.PriceUnit, Valid: true},
		ArrivalUnit:   sql.NullString{String: p.ArrivalUnit, Valid: true},
		Source:        p.Source,
		FetchedAt:     t, // using the same for both since we don't have separate arrival_date parsing logic here. Wait!
		RawHash:       p.RawHash,
	})
}

func (r *Repository) GetLatestAgmarknetPrices(ctx context.Context, commodityName, districtName string, limit int) ([]AgmarknetDailyPriceRow, error) {
	rows, err := r.q.GetLatestAgmarknetPrices(ctx, db.GetLatestAgmarknetPricesParams{
		CommodityName: sql.NullString{String: commodityName, Valid: true},
		DistrictName:  sql.NullString{String: districtName, Valid: true},
		Limit:         int64(limit),
	})
	if err != nil {
		return nil, err
	}
	var out []AgmarknetDailyPriceRow
	for _, p := range rows {
		out = append(out, AgmarknetDailyPriceRow{
			ID:            p.ID,
			ArrivalDate:   p.ArrivalDate.Format("2006-01-02"), // Sqlc maps DATE to time.Time
			StateID:       p.StateID.String,
			StateName:     p.StateName.String,
			DistrictID:    p.DistrictID.String,
			DistrictName:  p.DistrictName.String,
			MarketID:      p.MarketID.String,
			MarketName:    p.MarketName.String,
			CommodityID:   p.CommodityID.String,
			CommodityName: p.CommodityName.String,
			VarietyID:     p.VarietyID.String,
			VarietyName:   p.VarietyName.String,
			GradeID:       p.GradeID.String,
			GradeName:     p.GradeName.String,
			MinPrice:      p.MinPrice.Float64,
			MaxPrice:      p.MaxPrice.Float64,
			ModalPrice:    p.ModalPrice.Float64,
			Arrivals:      p.Arrivals.Float64,
			PriceUnit:     p.PriceUnit.String,
			ArrivalUnit:   p.ArrivalUnit.String,
			Source:        p.Source,
			FetchedAt:     p.FetchedAt.Format(time.RFC3339),
			RawHash:       p.RawHash,
		})
	}
	return out, nil
}

// ── AGMARKNET Filters ────────────────────────────────────────────────────────

type AgmarknetFilterRow struct {
	FilterType string
	FilterID   string
	FilterName string
	FetchedAt  string
}

func (r *Repository) UpsertAgmarknetFilter(ctx context.Context, f AgmarknetFilterRow) error {
	t, _ := time.Parse(time.RFC3339, f.FetchedAt)
	return r.q.UpsertAgmarknetFilter(ctx, db.UpsertAgmarknetFilterParams{
		FilterType: f.FilterType,
		FilterID:   f.FilterID,
		FilterName: f.FilterName,
		FetchedAt:  t,
	})
}

func (r *Repository) GetAgmarknetFilters(ctx context.Context) (map[string][]AgmarknetFilterRow, error) {
	rows, err := r.q.GetAgmarknetFilters(ctx)
	if err != nil {
		return nil, err
	}
	filters := make(map[string][]AgmarknetFilterRow)
	for _, f := range rows {
		filters[f.FilterType] = append(filters[f.FilterType], AgmarknetFilterRow{
			FilterType: f.FilterType,
			FilterID:   f.FilterID,
			FilterName: f.FilterName,
			FetchedAt:  f.FetchedAt.Format(time.RFC3339),
		})
	}
	return filters, nil
}

// ── Weather cache (v2) ────────────────────────────────────────────────────────

type WeatherCacheRowV2 struct {
	CacheKey    string
	LocationKey string
	RequestType string
	PayloadJSON string
	Source      string
	FetchedAt   time.Time
	ExpiresAt   time.Time
}

func (r *Repository) GetLocationWeatherCache(ctx context.Context, cacheKey string) (*WeatherCacheRowV2, error) {
	wc, err := r.q.GetLocationWeatherCacheV2(ctx, cacheKey)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	
	fetchedAt, _ := time.Parse(time.RFC3339, wc.FetchedAt)
	expiresAt, _ := time.Parse(time.RFC3339, wc.ExpiresAt)
	
	return &WeatherCacheRowV2{
		CacheKey:    wc.CacheKey,
		LocationKey: wc.LocationKey,
		RequestType: wc.RequestType,
		PayloadJSON: wc.PayloadJson,
		Source:      wc.Source,
		FetchedAt:   fetchedAt,
		ExpiresAt:   expiresAt,
	}, nil
}

func (r *Repository) UpsertLocationWeatherCache(ctx context.Context, wc WeatherCacheRowV2) error {
	return r.q.UpsertLocationWeatherCacheV2(ctx, db.UpsertLocationWeatherCacheV2Params{
		CacheKey:    wc.CacheKey,
		LocationKey: wc.LocationKey,
		RequestType: wc.RequestType,
		PayloadJson: wc.PayloadJSON,
		Source:      wc.Source,
		FetchedAt:   wc.FetchedAt.Format(time.RFC3339),
		ExpiresAt:   wc.ExpiresAt.Format(time.RFC3339),
	})
}

// ── legacy weather cache (keep for now to avoid breaking other calls) ────────

type WeatherCacheRow struct {
	District         string
	RainfallAnomaly  float64
	TemperatureMean  float64
	ClimateRiskScore float64
	FetchedAt        string
}

func (r *Repository) GetWeatherCache(ctx context.Context, district string) (*WeatherCacheRow, error) {
	wc, err := r.q.GetWeatherCache(ctx, sql.NullString{String: district, Valid: true})
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &WeatherCacheRow{
		District:         wc.District.String,
		RainfallAnomaly:  wc.RainfallAnomaly.Float64,
		TemperatureMean:  wc.TemperatureMean.Float64,
		ClimateRiskScore: wc.ClimateRiskScore.Float64,
		FetchedAt:        wc.FetchedAt.String,
	}, nil
}

func (r *Repository) UpsertWeatherCache(ctx context.Context, wc WeatherCacheRow) error {
	return r.q.UpsertWeatherCache(ctx, db.UpsertWeatherCacheParams{
		District:         sql.NullString{String: wc.District, Valid: true},
		RainfallAnomaly:  sql.NullFloat64{Float64: wc.RainfallAnomaly, Valid: true},
		TemperatureMean:  sql.NullFloat64{Float64: wc.TemperatureMean, Valid: true},
		ClimateRiskScore: sql.NullFloat64{Float64: wc.ClimateRiskScore, Valid: true},
		FetchedAt:        sql.NullString{String: wc.FetchedAt, Valid: true},
	})
}
