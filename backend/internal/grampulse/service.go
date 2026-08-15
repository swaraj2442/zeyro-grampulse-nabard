package grampulse

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"go.uber.org/zap"
)

// Service orchestrates all GramPulse business logic.
// It coordinates between the synthetic store, SQLite repo, ML client,
// weather client, and market client.
type Service struct {
	store   *SyntheticStore
	repo    *Repository
	ml      *MLClient
	weather   *WeatherClient
	market    *MarketClient
	agmarknet *AgmarknetClient
	logger    *zap.Logger
}

func NewService(store *SyntheticStore, repo *Repository, ml *MLClient,
	weather *WeatherClient, market *MarketClient, agmarknet *AgmarknetClient, logger *zap.Logger) *Service {
	return &Service{store: store, repo: repo, ml: ml, weather: weather, market: market, agmarknet: agmarknet, logger: logger}
}

// ── Enterprise ────────────────────────────────────────────────────────────────

func (s *Service) GetEnterprise(ctx context.Context, id string) (*Enterprise, error) {
	ent, ok := s.store.GetEnterprise(id)
	if !ok {
		return nil, fmt.Errorf("enterprise %s not found", id)
	}

	result := &Enterprise{
		ID:             ent.EntityID,
		EnterpriseID:   ent.EntityID,
		District:       ent.District,
		Block:          ent.Block,
		State:          "Maharashtra",
		Sector:         ent.Sector,
		EnterpriseType: ent.EnterpriseType,
		OwnershipType:  ent.OwnershipType,
		AccountStatus:  "Standard",
		CurrentDPD:     0,
		RiskLevel:      "Pending",
		DataSource:     SourceSynthetic,
	}

	// Overlay with calculated risk from SQLite
	if rr, err := s.repo.GetRiskAssessment(ctx, id); err == nil && rr != nil {
		score := rr.RiskScore
		result.RiskScore = &score
		result.RiskLevel = rr.RiskLevel
		result.ForecastDeficit = rr.ForecastDeficit
		result.WarningLeadTimeDays = rr.WarningLeadTimeDays
		result.RiskStatus = "scored"
	} else {
		result.RiskStatus = "scoring"
	}

	return result, nil
}

func (s *Service) ListEnterprises(ctx context.Context, sector, district, riskLevel, search, sortBy, sortOrder string, limit, offset int) ([]Enterprise, int) {
	riskOverrides, _ := s.repo.GetAllRiskAssessments(ctx)
	return s.store.ListEnterprises(sector, district, riskLevel, search, sortBy, sortOrder, limit, offset, riskOverrides)
}

// ── History ───────────────────────────────────────────────────────────────────

// GetMergedHistory returns synthetic baseline history merged with any user-submitted records.
func (s *Service) GetMergedHistory(ctx context.Context, id string, months int) ([]map[string]any, error) {
	baseline := s.store.GetHistory(id, months)
	if len(baseline) == 0 {
		return nil, fmt.Errorf("no history for enterprise %s", id)
	}

	submitted, err := s.repo.GetSubmittedRecords(ctx, id)
	if err != nil || len(submitted) == 0 {
		return baseline, nil
	}

	// Override baseline rows by month key
	byMonth := make(map[string]map[string]any, len(baseline))
	for _, row := range baseline {
		if m, ok := row["date"].(string); ok && len(m) >= 7 {
			byMonth[m[:7]] = row
		}
	}
	for _, s := range submitted {
		if m, ok := s["month"].(string); ok {
			existing := byMonth[m]
			if existing == nil {
				existing = make(map[string]any)
			}
			existing["operating_inflow"] = s["operating_inflow"]
			existing["operating_outflow"] = s["operating_outflow"]
			byMonth[m] = existing
		}
	}

	// Rebuild sorted slice
	result := make([]map[string]any, 0, len(byMonth))
	for _, row := range byMonth {
		result = append(result, row)
	}
	return result, nil
}

// ── Forecast ──────────────────────────────────────────────────────────────────

func (s *Service) GetForecast(ctx context.Context, enterpriseID string) (map[string]any, error) {
	// 1. Check SQLite forecast cache
	if cached, err := s.repo.GetCachedForecast(ctx, enterpriseID); err == nil && cached != nil {
		return cached, nil
	}

	// 2. Run live inference
	return s.runLiveForecast(ctx, enterpriseID)
}

func (s *Service) runLiveForecast(ctx context.Context, enterpriseID string) (map[string]any, error) {
	history, err := s.GetMergedHistory(ctx, enterpriseID, 24)
	if err != nil {
		return nil, err
	}

	ent, ok := s.store.GetEnterprise(enterpriseID)
	if !ok {
		return nil, fmt.Errorf("enterprise %s not found", enterpriseID)
	}

	// Fetch live features
	loc := ResolveLocation(ent.District, ent.Block)
	forecastResp, _ := s.weather.GetLocationForecast(ctx, loc.Key, 16)
	climateRisk := forecastResp.ClimateRisk
	
	rainfallAnomaly := 0.0
	if climateRisk.RainfallAnomalyPct != nil {
		rainfallAnomaly = *climateRisk.RainfallAnomalyPct
	}
	tempMean := climateRisk.TemperatureMeanC
	climateScore := climateRisk.ClimateRiskScore
	weatherFetchedAt := climateRisk.FetchedAt.Format(time.RFC3339)

	maizePrice := s.market.GetPrices(ctx, "Maize", ent.District, 1)
	feedIndex := s.getFeedIndex(ctx, ent.District)
	marketFetchedAt := maizePrice.FetchedAt.Format(time.RFC3339)
	marketSrc := maizePrice.Source

	mlMarket := &mlMarketFeatures{
		MaizePrice:    &maizePrice.ModalPrice,
		FeedIndex:     &feedIndex,
		CommodityPriceChange1m: &maizePrice.PriceChange1m,
		CommodityPriceChange3m: &maizePrice.PriceChange3m,
		CommodityPriceVolatility3m: &maizePrice.PriceVolatility3m,
		MarketSource:  string(maizePrice.Source),
		MarketFetchedAt: &marketFetchedAt,
	}
	mlWeather := &mlWeatherFeatures{
		RainfallAnomalyPct: &rainfallAnomaly,
		TemperatureMean:    &tempMean,
		ClimateRiskScore:   &climateScore,
		ExtremeHeatDays:    &climateRisk.ExtremeHeatDays,
		ConsecutiveDryDays: &climateRisk.ConsecutiveDryDays,
		WeatherSource:      climateRisk.Source,
		WeatherFetchedAt:   &weatherFetchedAt,
	}
	mlLoan := &mlLoanObligations{
		ScheduledEmiMonthly: ent.SanctionedLimit / 36, // approximate
	}

	result, err := s.ml.Forecast(ctx, enterpriseID, history, mlMarket, mlWeather, mlLoan)
	if err != nil {
		return nil, fmt.Errorf("ml forecast failed: %w", err)
	}

	// Cache forecast and upsert risk assessment
	_ = s.repo.UpsertForecastCache(ctx, enterpriseID, "grampulse-cf-v1.1", result)

	if ew, ok := result["earlyWarning"].(map[string]any); ok {
		driversJSON, _ := json.Marshal(ew["drivers"])
		rr := RiskRow{
			EnterpriseID:         enterpriseID,
			RiskScore:            toFloat(ew["riskScore"]),
			RiskLevel:            toString(ew["riskLevel"]),
			ForecastDeficit:      toFloat(ew["forecastDeficit"]),
			DebtServiceShortfall: toFloat(ew["debtServiceShortfall"]),
			StressMonth:          toString(ew["stressMonth"]),
			WarningLeadTimeDays:  int(toFloat(ew["warningLeadTimeDays"])),
			DriversJSON:          string(driversJSON),
			AssessedAt:           time.Now().UTC().Format(time.RFC3339),
		}
		_ = s.repo.UpsertRiskAssessment(ctx, rr)
	}

	// Annotate provenance
	result["provenance"] = map[string]any{
		"weatherSource":        climateRisk.Source,
		"weatherFetchedAt":     weatherFetchedAt,
		"marketSource":         string(marketSrc),
		"marketFetchedAt":      marketFetchedAt,
		"enterpriseDataSource": "synthetic",
		"upiDataNote":          "Enterprise UPI behaviour is synthetic. State-level context from NPCI statistics.",
	}

	return result, nil
}

func (s *Service) getFeedIndex(ctx context.Context, district string) float64 {
	maize := s.market.GetPrices(ctx, "Maize", district, 1).ModalPrice
	soy := s.market.GetPrices(ctx, "Soybean", district, 1).ModalPrice
	if maize == 0 && soy == 0 {
		return 112.4
	}
	baseMaize, baseSoy := 2000.0, 4400.0
	composite := 0.60*maize + 0.40*soy
	base := 0.60*baseMaize + 0.40*baseSoy
	return composite / base * 100
}

// ── Portfolio ─────────────────────────────────────────────────────────────────

func (s *Service) GetPortfolioSummary(ctx context.Context, district, sector string) PortfolioSummary {
	overrides, _ := s.repo.GetAllRiskAssessments(ctx)
	
	// Create map for fast lookup
	ovMap := make(map[string]RiskRow)
	for _, ov := range overrides {
		ovMap[ov.EnterpriseID] = ov
	}
	
	stats := s.store.GetFilteredPortfolioStats(district, sector, ovMap)

	return PortfolioSummary{
		Total:                   stats["total"],
		Healthy:                 stats["healthy"],
		Watchlist:               stats["watchlist"],
		High:                    stats["high"],
		Critical:                stats["critical"],
		ForecastDeficitExposure: float64(stats["deficit_exposure"]),
		// ActiveInterventions:   stats.ActiveInterventions, // Omitted for simplicity, or we can fetch filtered interventions if needed
		ScoredEnterprises:       stats["scored"],
		ComputedAt:              time.Now().UTC(),
	}
}

// ── Underwriting ──────────────────────────────────────────────────────────────

func (s *Service) Underwrite(ctx context.Context, enterpriseID string, req UnderwriteRequest) (map[string]any, error) {
	ent, ok := s.store.GetEnterprise(enterpriseID)
	if !ok {
		return nil, fmt.Errorf("enterprise %s not found", enterpriseID)
	}

	// Get latest forecast (or run live)
	forecastResult, err := s.GetForecast(ctx, enterpriseID)
	if err != nil {
		forecastResult = map[string]any{"forecast": []any{}}
	}

	forecastSlice := toSliceOfMaps(forecastResult["forecast"])
	loc := ResolveLocation(ent.District, ent.Block)
	forecastResp, _ := s.weather.GetLocationForecast(ctx, loc.Key, 16)
	climateRisk := forecastResp.ClimateRisk
	maize := s.market.GetPrices(ctx, "Maize", ent.District, 1)

	climate := climateRisk.ClimateRiskScore
	marketRisk := (maize.PriceChange1m + maize.PriceChange3m/3) * -1 // negative change = risk

	uwReq := mlUnderwriteRequest{
		EnterpriseID:          enterpriseID,
		RequestedAmount:       req.RequestedAmount,
		RequestedTenureMonths: req.RequestedTenure,
		ProductType:           req.ProductType,
		Purpose:               req.Purpose,
		Forecast:              forecastSlice,
		CurrentDPD:            0,
		RepaymentDelayCount6m: 0,
		LoanOutstanding:       ent.SanctionedLimit * 0.7,
		SanctionedLimit:       ent.SanctionedLimit,
		ScheduledEmiMonthly:   ent.SanctionedLimit / 36,
		AnnualTurnover:        ent.AssetValue,
		BusinessVintage:       int(ent.YearsInOperation),
		Sector:                ent.Sector,
		District:              ent.District,
		ClimateRiskScore:      &climate,
		MarketRiskScore:       &marketRisk,
	}

	result, err := s.UnderwriteEnterprise(ctx, uwReq)
	if err != nil {
		return nil, err
	}
	
	// Convert the policy result to map to match the handler interface
	resp := map[string]any{
		"decision": result.Decision,
		"risk_tier": result.RiskBand,
		"probability_of_stress": result.ProbabilityOfStress,
		"recommended_limit": result.RecommendedLimit,
		"max_affordable_emi": result.MaximumAffordableEmi,
		"repayment_capacity_score": result.RepaymentCapacityScore,
		"reason_codes": result.ReasonCodes,
	}
	return resp, nil
}

// ── helper coercions ──────────────────────────────────────────────────────────

func toFloat(v any) float64 {
	switch val := v.(type) {
	case float64:
		return val
	case float32:
		return float64(val)
	case int:
		return float64(val)
	case json.Number:
		f, _ := val.Float64()
		return f
	}
	return 0
}

func toString(v any) string {
	if s, ok := v.(string); ok {
		return s
	}
	return fmt.Sprintf("%v", v)
}

func toSliceOfMaps(v any) []map[string]any {
	if v == nil {
		return nil
	}
	switch val := v.(type) {
	case []map[string]any:
		return val
	case []any:
		result := make([]map[string]any, 0, len(val))
		for _, item := range val {
			if m, ok := item.(map[string]any); ok {
				result = append(result, m)
			}
		}
		return result
	}
	return nil
}
