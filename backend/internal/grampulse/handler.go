package grampulse

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

// Handler implements all GramPulse HTTP handlers using Go 1.22+ ServeMux patterns.
type Handler struct {
	svc         *Service
	batchScorer *BatchScorer
	logger      *zap.Logger
}

func NewHandler(svc *Service, batchScorer *BatchScorer, logger *zap.Logger) *Handler {
	return &Handler{svc: svc, batchScorer: batchScorer, logger: logger}
}

func (h *Handler) RegisterRoutes(mux *http.ServeMux) {
	// Enterprises
	mux.HandleFunc("GET /api/v1/enterprises", h.listEnterprises)
	mux.HandleFunc("GET /api/v1/enterprises/{id}", h.getEnterprise)
	mux.HandleFunc("GET /api/v1/enterprises/{id}/history", h.getHistory)
	mux.HandleFunc("POST /api/v1/enterprises/{id}/records", h.submitRecord)
	mux.HandleFunc("GET /api/v1/enterprises/{id}/forecast", h.getForecast)
	mux.HandleFunc("GET /api/v1/enterprises/{id}/early-warning", h.getEarlyWarning)
	mux.HandleFunc("GET /api/v1/enterprises/{id}/risk", h.getEnterpriseRisk)
	mux.HandleFunc("GET /api/v1/enterprises/{id}/signals", h.getEnterpriseSignals)
	mux.HandleFunc("GET /api/v1/enterprises/{id}/loans", h.getEnterpriseLoans)
	mux.HandleFunc("GET /api/v1/enterprises/{id}/alerts", h.getAlerts)
	mux.HandleFunc("GET /api/v1/enterprises/{id}/timeline", h.getTimeline)
	mux.HandleFunc("GET /api/v1/enterprises/{id}/interventions", h.getEnterpriseInterventions)
	mux.HandleFunc("GET /api/v1/enterprises/{id}/digital-twin", h.getDigitalTwin)
	mux.HandleFunc("POST /api/v1/enterprises/{id}/scenario", h.runScenario)
	mux.HandleFunc("POST /api/v1/enterprises/{id}/underwrite", h.underwrite)

	// Auth & User
	mux.HandleFunc("POST /api/v1/auth/login", h.demoLogin)
	mux.HandleFunc("GET /api/v1/user/profile", h.userProfile)
	mux.HandleFunc("POST /api/v1/copilot/simulate", h.copilotSimulate)

	// Intelligence
	mux.HandleFunc("GET /api/v1/intelligence/early-warning/kpis", h.earlyWarningKPIs)
	mux.HandleFunc("GET /api/v1/intelligence/early-warning/watchlist", h.earlyWarningWatchlist)
	mux.HandleFunc("GET /api/v1/intelligence/early-warning/risk-drivers", h.earlyWarningRiskDrivers)

	// Portfolio
	mux.HandleFunc("GET /api/v1/portfolio/summary", h.portfolioSummary)
	mux.HandleFunc("GET /api/v1/portfolio/forecast-timeseries", h.portfolioForecastTimeseries)
	mux.HandleFunc("GET /api/v1/portfolio/top-risk", h.topRisk)
	mux.HandleFunc("GET /api/v1/portfolio/cluster-alerts", h.clusterAlerts)
	mux.HandleFunc("GET /api/v1/portfolio/risk-distribution", h.riskDistribution)
	mux.HandleFunc("GET /api/v1/portfolio/forecast-exposure", h.forecastExposure)
	mux.HandleFunc("GET /api/v1/portfolio/districts", h.districtHealth)
	mux.HandleFunc("GET /api/v1/portfolio/score-status", h.scoreStatus)

	// Interventions
	mux.HandleFunc("GET /api/v1/interventions", h.listInterventions)
	mux.HandleFunc("POST /api/v1/interventions", h.createIntervention)
	mux.HandleFunc("PATCH /api/v1/interventions/{id}/status", h.updateInterventionStatus)

	// Weather
	mux.HandleFunc("GET /api/v1/weather/forecast/{location_key}", h.weatherForecast)
	mux.HandleFunc("GET /api/v1/weather/climate-risk/{location_key}", h.weatherClimateRisk)
	mux.HandleFunc("GET /api/v1/weather/climate-risk", h.climateRiskLegacy)

	// Market
	mux.HandleFunc("GET /api/v1/market/prices", h.marketPrices)
	mux.HandleFunc("GET /api/v1/market/feed-index", h.feedIndex)
	mux.HandleFunc("GET /api/v1/market/commodities", h.commodities)
	mux.HandleFunc("POST /api/v1/market/agmarknet/refresh-filters", h.refreshAgmarknetFilters)
	mux.HandleFunc("GET /api/v1/market/agmarknet/filters", h.getAgmarknetFilters)
	mux.HandleFunc("POST /api/v1/market/agmarknet/report-session", h.createAgmarknetReportSession)
	mux.HandleFunc("POST /api/v1/market/agmarknet/report", h.submitAgmarknetReport)

	// System
	mux.HandleFunc("GET /health", h.health)
	mux.HandleFunc("GET /ready", h.ready)
}

// ── Enterprise handlers ───────────────────────────────────────────────────────

func (h *Handler) listEnterprises(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	sector := q.Get("sector")
	district := q.Get("district")
	riskLevel := q.Get("risk_level")
	search := q.Get("search")
	sortBy := defaultStr(q.Get("sort_by"), "id")
	sortOrder := defaultStr(q.Get("sort_order"), "asc")
	limit := queryInt(q, "limit", 50)
	offset := queryInt(q, "offset", 0)

	enterprises, total := h.svc.ListEnterprises(r.Context(), sector, district, riskLevel, search, sortBy, sortOrder, limit, offset)
	page := 1
	if limit > 0 {
		page = (offset / limit) + 1
	}
	writeJSONPaginated(w, http.StatusOK, map[string]any{"enterprises": enterprises}, page, limit, total)
}

func (h *Handler) getEnterprise(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	ent, err := h.svc.GetEnterprise(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, ent)
}

func (h *Handler) getHistory(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	months := queryInt(r.URL.Query(), "months", 24)
	history, err := h.svc.GetMergedHistory(r.Context(), id, months)
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"enterpriseId": id,
		"history":      history,
	})
}

func (h *Handler) submitRecord(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var body FinancialRecordInput
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON")
		return
	}
	if body.EnterpriseID != id {
		writeError(w, http.StatusBadRequest, "enterpriseId mismatch")
		return
	}

	now := time.Now().UTC().Format(time.RFC3339)
	recordID := "FR-" + uuid.New().String()[:9]

	err := h.svc.repo.InsertFinancialRecord(r.Context(), FinancialRecord{
		ID:               recordID,
		EnterpriseID:     id,
		Month:            body.Month,
		OperatingInflow:  body.OperatingInflow,
		OperatingOutflow: body.OperatingOutflow,
		Savings:          body.Savings,
		LoanRepayment:    body.LoanRepayment,
		InventoryCost:    body.InventoryCost,
		RecordedAt:       now,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Async forecast refresh
	forecastRefreshed := false
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
		defer cancel()
		if _, err := h.svc.runLiveForecast(ctx, id); err == nil {
			forecastRefreshed = true
		}
	}()

	_ = h.svc.repo.InsertTimelineEvent(r.Context(), TimelineEvent{
		ID:           "EV-" + uuid.New().String()[:9],
		EnterpriseID: id,
		Date:         now,
		Title:        fmt.Sprintf("Financial record submitted for %s", body.Month),
		Description:  fmt.Sprintf("Income ₹%.0f · Expenses ₹%.0f", body.OperatingInflow, body.OperatingOutflow),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"id":                recordID,
		"enterpriseId":      id,
		"recordedAt":        now,
		"syncStatus":        "synced",
		"forecastRefreshed": forecastRefreshed,
	})
}

func (h *Handler) getForecast(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	result, err := h.svc.GetForecast(r.Context(), id)
	if err != nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{
			"forecastStatus":       "unavailable",
			"reason":               err.Error(),
			"lastSuccessfulForecast": nil,
		})
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *Handler) getEarlyWarning(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	ctx := r.Context()

	// Check SQLite first
	rr, err := h.svc.repo.GetRiskAssessment(ctx, id)
	if err == nil && rr != nil {
		writeJSON(w, http.StatusOK, riskRowToResponse(rr))
		return
	}

	// Trigger live forecast which writes risk_assessments
	if _, ferr := h.svc.runLiveForecast(ctx, id); ferr != nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{
			"forecastStatus": "unavailable",
			"reason":         ferr.Error(),
		})
		return
	}

	// Re-query
	rr2, err2 := h.svc.repo.GetRiskAssessment(ctx, id)
	if err2 != nil || rr2 == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{
			"forecastStatus": "unavailable",
			"reason":         "Risk score not written after inference",
		})
		return
	}
	writeJSON(w, http.StatusOK, riskRowToResponse(rr2))
}

func (h *Handler) getAlerts(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	alerts, err := h.svc.repo.GetAlerts(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if alerts == nil {
		alerts = []Alert{}
	}
	writeJSON(w, http.StatusOK, alerts)
}

func (h *Handler) getTimeline(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	events, err := h.svc.repo.GetTimeline(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if events == nil {
		events = []TimelineEvent{}
	}
	writeJSON(w, http.StatusOK, TimelineResponse{EnterpriseID: id, Events: events})
}

func (h *Handler) getEnterpriseInterventions(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	interventions, err := h.svc.repo.ListInterventions(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if interventions == nil {
		interventions = []Intervention{}
	}
	writeJSON(w, http.StatusOK, interventions)
}

func (h *Handler) getDigitalTwin(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	ctx := r.Context()

	ent, err := h.svc.GetEnterprise(ctx, id)
	if err != nil {
		writeError(w, http.StatusNotFound, "Enterprise not found")
		return
	}

	forecast, _ := h.svc.GetForecast(ctx, id)

	var earlyWarning any
	rr, err := h.svc.repo.GetRiskAssessment(ctx, id)
	if err == nil && rr != nil {
		earlyWarning = riskRowToResponse(rr)
	} else {
		if _, ferr := h.svc.runLiveForecast(ctx, id); ferr == nil {
			if rr2, err2 := h.svc.repo.GetRiskAssessment(ctx, id); err2 == nil && rr2 != nil {
				earlyWarning = riskRowToResponse(rr2)
			}
		}
	}

	timeline, _ := h.svc.repo.GetTimeline(ctx, id)
	if timeline == nil {
		timeline = []TimelineEvent{}
	}

	alerts, _ := h.svc.repo.GetAlerts(ctx, id)
	if alerts == nil {
		alerts = []Alert{}
	}

	twinDetails := map[string]any{
		"last_sync": time.Now().Format(time.RFC3339),
		"status":    "active",
		"version":   "1.0",
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"identity":     ent,
		"forecast":     forecast,
		"earlyWarning": earlyWarning,
		"timeline":     TimelineResponse{EnterpriseID: id, Events: timeline},
		"alerts":       alerts,
		"twinDetails":  twinDetails,
	})
}

func (h *Handler) runScenario(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var body ScenarioRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON")
		return
	}

	history, err := h.svc.GetMergedHistory(r.Context(), id, 24)
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}

	ent, _ := h.svc.store.GetEnterprise(id)
	district := "Nashik"
	block := ""
	if ent != nil {
		district = ent.District
		block = ent.Block
	}

	loc := ResolveLocation(district, block)
	forecastResp, _ := h.svc.weather.GetLocationForecast(r.Context(), loc.Key, 16)
	climate := forecastResp.ClimateRisk

	maize := h.svc.market.GetPrices(r.Context(), "Maize", district, 1)
	feedIdx := h.svc.getFeedIndex(r.Context(), district)
	weatherAt := climate.FetchedAt.Format(time.RFC3339)
	marketAt := maize.FetchedAt.Format(time.RFC3339)

	rainfallAnomaly := 0.0
	if climate.RainfallAnomalyPct != nil {
		rainfallAnomaly = *climate.RainfallAnomalyPct
	}
	tempMean := climate.TemperatureMeanC
	climateScore := climate.ClimateRiskScore

	mlMarket := &mlMarketFeatures{
		MaizePrice:      &maize.ModalPrice,
		FeedIndex:       &feedIdx,
		CommodityPriceChange1m: &maize.PriceChange1m,
		CommodityPriceChange3m: &maize.PriceChange3m,
		CommodityPriceVolatility3m: &maize.PriceVolatility3m,
		MarketSource:    string(maize.Source),
		MarketFetchedAt: &marketAt,
	}
	mlWeather := &mlWeatherFeatures{
		RainfallAnomalyPct: &rainfallAnomaly,
		TemperatureMean:    &tempMean,
		ClimateRiskScore:   &climateScore,
		ExtremeHeatDays:    &climate.ExtremeHeatDays,
		ConsecutiveDryDays: &climate.ConsecutiveDryDays,
		WeatherSource:      climate.Source,
		WeatherFetchedAt:   &weatherAt,
	}
	var emi float64
	if ent != nil {
		emi = ent.SanctionedLimit / 36
	}
	mlLoan := &mlLoanObligations{ScheduledEmiMonthly: emi}

	result, err := h.svc.ml.Scenario(r.Context(), id, history, body, mlMarket, mlWeather, mlLoan)
	if err != nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{
			"forecastStatus": "unavailable", "reason": err.Error(),
		})
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *Handler) underwrite(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var req UnderwriteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON")
		return
	}
	result, err := h.svc.Underwrite(r.Context(), id, req)
	if err != nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{
			"forecastStatus": "unavailable", "reason": err.Error(),
		})
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *Handler) portfolioForecastTimeseries(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	district := q.Get("district")
	sector := q.Get("sector")
	if district == "All Districts" {
		district = ""
	}
	if sector == "All Sectors" {
		sector = ""
	}
	resp, err := h.svc.GetPortfolioForecastTimeseries(r.Context(), district, sector)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, resp)
}

// ── Portfolio ─────────────────────────────────────────────────────────────────

func (h *Handler) portfolioSummary(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	district := q.Get("district")
	sector := q.Get("sector")
	// "All Districts" or "All Sectors" logic
	if district == "All Districts" {
		district = ""
	}
	if sector == "All Sectors" {
		sector = ""
	}
	summary := h.svc.GetPortfolioSummary(r.Context(), district, sector)
	writeJSON(w, http.StatusOK, summary)
}

func (h *Handler) topRisk(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	n := queryInt(q, "n", 10)
	district := q.Get("district")
	sector := q.Get("sector")
	if district == "All Districts" {
		district = ""
	}
	if sector == "All Sectors" {
		sector = ""
	}
	enterprises, _ := h.svc.ListEnterprises(r.Context(), sector, district, "High", "", "risk_score", "desc", n, 0)
	writeJSON(w, http.StatusOK, map[string]any{"enterprises": enterprises})
}

func (h *Handler) clusterAlerts(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	district := q.Get("district")
	sector := q.Get("sector")
	if district == "All Districts" {
		district = ""
	}
	if sector == "All Sectors" {
		sector = ""
	}

	// Aggregate alerts from risk_assessments by district/sector
	overrides, _ := h.svc.repo.GetAllRiskAssessments(r.Context())
	byDistrict := make(map[string]int)
	for _, rr := range overrides {
		if rr.RiskLevel == "High" || rr.RiskLevel == "Critical" {
			ent, ok := h.svc.store.GetEnterprise(rr.EnterpriseID)
			if ok {
				if district != "" && !strings.EqualFold(ent.District, district) {
					continue
				}
				if sector != "" && !strings.EqualFold(ent.Sector, sector) {
					continue
				}
				byDistrict[ent.District]++
			}
		}
	}
	var alerts []map[string]any
	for d, count := range byDistrict {
		if count >= 3 {
			alerts = append(alerts, map[string]any{
				"districtId": makeID("DIST", d),
				"district": d, 
				"affectedCount": count,
				"severity": func() string {
					if count >= 10 {
						return "Critical"
					}
					return "High"
				}(),
			})
		}
	}
	if alerts == nil {
		alerts = []map[string]any{}
	}
	writeJSON(w, http.StatusOK, map[string]any{"clusterAlerts": alerts})
}

func (h *Handler) riskDistribution(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	district := q.Get("district")
	sector := q.Get("sector")
	if district == "All Districts" {
		district = ""
	}
	if sector == "All Sectors" {
		sector = ""
	}

	bySector := make(map[string]map[string]int)
	byDistrict := make(map[string]map[string]int)
	enterprises, _ := h.svc.ListEnterprises(r.Context(), sector, district, "", "", "id", "asc", 9999, 0)
	for _, e := range enterprises {
		rl := e.RiskLevel
		sName := e.Sector
		dName := e.District
		if sName == "" {
			sName = "Other"
		}
		if dName == "" {
			dName = "Unknown"
		}

		if _, ok := bySector[sName]; !ok {
			bySector[sName] = make(map[string]int)
		}
		bySector[sName][rl]++

		if _, ok := byDistrict[dName]; !ok {
			byDistrict[dName] = make(map[string]int)
		}
		byDistrict[dName][rl]++
	}
	
	writeJSON(w, http.StatusOK, map[string]any{"bySector": bySector, "byDistrict": byDistrict})
}

func (h *Handler) forecastExposure(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	district := q.Get("district")
	sector := q.Get("sector")
	if district == "All Districts" {
		district = ""
	}
	if sector == "All Sectors" {
		sector = ""
	}

	overrides, _ := h.svc.repo.GetAllRiskAssessments(r.Context())
	var total float64
	var count int
	for _, rr := range overrides {
		if rr.RiskLevel == "High" || rr.RiskLevel == "Critical" {
			ent, ok := h.svc.store.GetEnterprise(rr.EnterpriseID)
			if ok {
				if district != "" && !strings.EqualFold(ent.District, district) {
					continue
				}
				if sector != "" && !strings.EqualFold(ent.Sector, sector) {
					continue
				}
				total += rr.ForecastDeficit
				count++
			}
		}
	}
	avg := 0.0
	if count > 0 {
		avg = total / float64(count)
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"totalForecastDeficit": total,
		"enterprisesAtRisk":    count,
		"averageDeficit":       avg,
	})
}

func (h *Handler) districtHealth(w http.ResponseWriter, r *http.Request) {
	overrides, _ := h.svc.repo.GetAllRiskAssessments(r.Context())
	districts := make(map[string]map[string]any)
	enterprises, _ := h.svc.ListEnterprises(r.Context(), "", "", "", "", "id", "asc", 9999, 0)
	for _, e := range enterprises {
		dID := makeID("DIST", e.District)
		if _, ok := districts[dID]; !ok {
			districts[dID] = map[string]any{"districtId": dID, "district": e.District, "total": 0, "high": 0, "critical": 0, "healthy": 0}
		}
		d := districts[dID]
		d["total"] = d["total"].(int) + 1
		rl := e.RiskLevel
		if ov, ok := overrides[e.ID]; ok {
			rl = ov.RiskLevel
		}
		if rl == "Critical" {
			d["critical"] = d["critical"].(int) + 1
		}
		if rl == "High" || rl == "Critical" {
			d["high"] = d["high"].(int) + 1
		}
		if rl == "Low" || rl == "Very Low" {
			d["healthy"] = d["healthy"].(int) + 1
		}
	}
	var result []map[string]any
	for _, v := range districts {
		result = append(result, v)
	}
	writeJSON(w, http.StatusOK, map[string]any{"districts": result})
}

func (h *Handler) scoreStatus(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, h.batchScorer.Status())
}

// ── Intervention handlers ─────────────────────────────────────────────────────

func (h *Handler) listInterventions(w http.ResponseWriter, r *http.Request) {
	ivs, err := h.svc.repo.ListInterventions(r.Context(), "")
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if ivs == nil {
		ivs = []Intervention{}
	}
	writeJSON(w, http.StatusOK, ivs)
}

func (h *Handler) createIntervention(w http.ResponseWriter, r *http.Request) {
	var body InterventionInput
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON")
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	iv := Intervention{
		ID:                      "IV-" + uuid.New().String()[:9],
		EnterpriseID:            body.EnterpriseID,
		RecommendedIntervention: body.RecommendedIntervention,
		IllustrativeAmount:      body.IllustrativeAmount,
		AssignedOfficer:         body.AssignedOfficer,
		VisitDate:               body.VisitDate,
		FollowUpDate:            body.FollowUpDate,
		Notes:                   body.Notes,
		Status:                  "Pending",
		CreatedAt:               now,
		UpdatedAt:               now,
	}
	if err := h.svc.repo.InsertIntervention(r.Context(), iv); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, iv)
}

func (h *Handler) updateInterventionStatus(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var body struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON")
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	if err := h.svc.repo.UpdateInterventionStatus(r.Context(), id, body.Status, now); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"id": id, "status": body.Status, "updatedAt": now})
}

// ── Weather / Market handlers ─────────────────────────────────────────────────

func (h *Handler) weatherForecast(w http.ResponseWriter, r *http.Request) {
	locKey := r.PathValue("location_key")
	forecastDays := queryInt(r.URL.Query(), "forecast_days", 16)
	resp, err := h.svc.weather.GetLocationForecast(r.Context(), locKey, forecastDays)
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, resp)
}

func (h *Handler) weatherClimateRisk(w http.ResponseWriter, r *http.Request) {
	locKey := r.PathValue("location_key")
	resp, err := h.svc.weather.GetLocationForecast(r.Context(), locKey, 16)
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, resp.ClimateRisk)
}

// Keep legacy for existing frontend just in case
func (h *Handler) climateRiskLegacy(w http.ResponseWriter, r *http.Request) {
	district := r.URL.Query().Get("district")
	if district == "" {
		district = "Nashik"
	}
	loc := ResolveLocation(district, "")
	resp, err := h.svc.weather.GetLocationForecast(r.Context(), loc.Key, 16)
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, resp.ClimateRisk)
}

func (h *Handler) marketPrices(w http.ResponseWriter, r *http.Request) {
	commodity := defaultStr(r.URL.Query().Get("commodity"), "Maize")
	district := r.URL.Query().Get("district")
	months := queryInt(r.URL.Query(), "months", 3)
	_ = months
	price := h.svc.market.GetPrices(r.Context(), commodity, district, months)
	price.CommodityID = makeID("COM", commodity)
	if district != "" {
		dID := makeID("DIST", district)
		price.DistrictID = &dID
	}
	writeJSON(w, http.StatusOK, price)
}

func (h *Handler) feedIndex(w http.ResponseWriter, r *http.Request) {
	district := defaultStr(r.URL.Query().Get("district"), "Nashik")
	maize := h.svc.market.GetPrices(r.Context(), "Maize", district, 1)
	soy := h.svc.market.GetPrices(r.Context(), "Soybean", district, 1)
	baseMaize, baseSoy := 2000.0, 4400.0
	composite := 0.60*maize.ModalPrice + 0.40*soy.ModalPrice
	base := 0.60*baseMaize + 0.40*baseSoy
	idx := composite / base * 100
	writeJSON(w, http.StatusOK, FeedIndex{
		DistrictID:   makeID("DIST", district),
		District:     district,
		FeedIndex:    idx,
		MaizePrice:   maize.ModalPrice,
		SoybeanPrice: soy.ModalPrice,
		Source:       maize.Source,
		FetchedAt:    maize.FetchedAt,
		IsStale:      maize.IsStale,
	})
}



// ── AGMARKNET Handlers ───────────────────────────────────────────────────────

func (h *Handler) refreshAgmarknetFilters(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.agmarknet.RefreshFilters(r.Context()); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to refresh filters")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "message": "filters refreshed"})
}

func (h *Handler) getAgmarknetFilters(w http.ResponseWriter, r *http.Request) {
	filters, err := h.svc.repo.GetAgmarknetFilters(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch filters")
		return
	}
	writeJSON(w, http.StatusOK, filters)
}

func (h *Handler) createAgmarknetReportSession(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.agmarknet.GenerateCaptcha(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to generate captcha")
		return
	}
	writeJSON(w, http.StatusOK, resp)
}

func (h *Handler) submitAgmarknetReport(w http.ResponseWriter, r *http.Request) {
	var req ReportRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	
	if err := h.svc.agmarknet.SubmitReport(r.Context(), req); err != nil {
		writeError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "message": "report submitted and records stored"})
}

func (h *Handler) commodities(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"commodities": []map[string]any{
			{"commodityId": "COM-MAIZE", "name": "Maize", "sourceType": "live-api-or-csv"},
			{"commodityId": "COM-SOYBEAN", "name": "Soybean", "sourceType": "live-api-or-csv"},
			{"commodityId": "COM-ONION", "name": "Onion", "sourceType": "live-api-or-csv"},
			{"commodityId": "COM-TOMATO", "name": "Tomato", "sourceType": "live-api-or-csv"},
			{"commodityId": "COM-WHEAT", "name": "Wheat", "sourceType": "live-api-or-csv"},
			{"commodityId": "COM-FODDER", "name": "Fodder", "sourceType": "official-csv"},
			{"commodityId": "COM-POULTRY", "name": "Poultry", "sourceType": "official-csv"},
			{"commodityId": "COM-MILKCOW", "name": "MilkCow", "sourceType": "synthetic-enterprise-input",
				"note": "Milk procurement price is a synthetic enterprise input. Not sourced from AGMARKNET."},
		},
	})
}

// ── System handlers ───────────────────────────────────────────────────────────

func (h *Handler) health(w http.ResponseWriter, r *http.Request) {
	mlHealth, mlErr := h.svc.ml.Health(r.Context())
	writeJSON(w, http.StatusOK, map[string]any{
		"status":          "ok",
		"mlServiceReady":  mlErr == nil && mlHealth.Ready,
		"mlModelsLoaded":  mlHealth.ModelsLoaded,
		"dbConnected":     true,
		"syntheticLoaded": h.svc.store.IsLoaded(),
		"weatherFeed":     "open-meteo",
		"marketFeed":      "data-gov-in",
		"architecture":    "go-gateway + python-ml",
	})
}

func (h *Handler) ready(w http.ResponseWriter, r *http.Request) {
	if !h.svc.store.IsLoaded() {
		writeError(w, http.StatusServiceUnavailable, "synthetic store not loaded")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ready": true})
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type APIResponse struct {
	Data  any            `json:"data"`
	Meta  map[string]any `json:"meta"`
	Error *string        `json:"error"`
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if resp, ok := v.(APIResponse); ok {
		_ = json.NewEncoder(w).Encode(resp)
		return
	}
	_ = json.NewEncoder(w).Encode(APIResponse{
		Data:  v,
		Meta:  map[string]any{},
		Error: nil,
	})
}

func writeJSONPaginated(w http.ResponseWriter, status int, data any, page, limit, total int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	totalPages := 0
	if limit > 0 {
		totalPages = (total + limit - 1) / limit
	}
	_ = json.NewEncoder(w).Encode(APIResponse{
		Data: data,
		Meta: map[string]any{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": totalPages,
		},
		Error: nil,
	})
}

func writeError(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(APIResponse{
		Data:  map[string]any{},
		Meta:  map[string]any{},
		Error: &msg,
	})
}

func defaultStr(s, def string) string {
	if strings.TrimSpace(s) == "" {
		return def
	}
	return s
}

func queryInt(q interface{ Get(string) string }, key string, def int) int {
	v := q.Get(key)
	if v == "" {
		return def
	}
	var n int
	fmt.Sscanf(v, "%d", &n)
	if n <= 0 {
		return def
	}
	return n
}

func makeID(prefix, name string) string {
	if name == "" {
		return ""
	}
	return prefix + "-" + strings.ToUpper(strings.ReplaceAll(name, " ", "-"))
}

func riskRowToResponse(rr *RiskRow) EarlyWarningResponse {
	var drivers []RiskDriver
	_ = json.Unmarshal([]byte(rr.DriversJSON), &drivers)
	if drivers == nil {
		drivers = []RiskDriver{}
	}
	return EarlyWarningResponse{
		EnterpriseID:         rr.EnterpriseID,
		RiskScore:            rr.RiskScore,
		RiskLevel:            rr.RiskLevel,
		ForecastDeficit:      rr.ForecastDeficit,
		DebtServiceShortfall: rr.DebtServiceShortfall,
		StressMonth:          rr.StressMonth,
		WarningLeadTimeDays:  rr.WarningLeadTimeDays,
		Drivers:              drivers,
	}
}

// ── Mock & New Endpoints ──────────────────────────────────────────────────────

func (h *Handler) demoLogin(w http.ResponseWriter, r *http.Request) {
	// Generate a real JWT token for demo purposes
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		writeError(w, http.StatusInternalServerError, "Server configuration error")
		return
	}

	claims := UserClaims{
		ID:       "USR-101",
		Name:     "Rohit Deshmukh",
		Role:     "REGIONAL_MANAGER",
		RegionID: "MH-WEST",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   "USR-101",
		},
	}
	
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	user := map[string]any{
		"id":       "USR-101",
		"name":     "Rohit Deshmukh",
		"role":     "REGIONAL_MANAGER",
		"regionId": "MH-WEST",
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"accessToken": tokenString,
		"expiresIn":   3600,
		"user":        user,
	})
}

func (h *Handler) userProfile(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"user": map[string]any{
			"id":       "USR-101",
			"name":     "Rohit Deshmukh",
			"role":     "REGIONAL_MANAGER",
			"regionId": "MH-WEST",
			"initials": "R",
		},
		"unreadAlerts": 4,
	})
}

func (h *Handler) earlyWarningKPIs(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"kpis": []map[string]any{
			{"label": "Enterprises at Risk", "value": 1284, "trend": "up", "change": 124, "status": "warning"},
			{"label": "Portfolio at Risk", "value": 48.2, "unit": "INR_CRORE", "trend": "up", "change": 2.4, "status": "critical"},
		},
	})
}

func (h *Handler) earlyWarningWatchlist(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"watchlist": []map[string]any{
			{"enterpriseId": "ENT-10291", "enterprise": "Patil Dairy Farm", "districtId": "D-01", "district": "Pune"},
		},
	})
}

func (h *Handler) earlyWarningRiskDrivers(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"riskDrivers": []map[string]any{
			{"driverId": "DRV-1", "name": "Climate Anomaly", "impact": 0.8},
		},
	})
}

func (h *Handler) getEnterpriseRisk(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	writeJSON(w, http.StatusOK, map[string]any{
		"enterpriseId": id,
		"riskScore":    72,
		"riskLevel":    "High",
		"drivers": []map[string]any{
			{"driverId": "DRV-1", "name": "DTI Ratio", "impact": 0.6},
		},
	})
}

func (h *Handler) getEnterpriseSignals(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	writeJSON(w, http.StatusOK, map[string]any{
		"enterpriseId": id,
		"marketSignals": []map[string]any{
			{"signalId": "SIG-1", "type": "Price Drop", "commodityId": "COM-Maize", "impact": -0.2},
		},
		"climateSignals": []map[string]any{
			{"signalId": "SIG-2", "type": "Heatwave", "impact": -0.5},
		},
	})
}

func (h *Handler) getEnterpriseLoans(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	writeJSON(w, http.StatusOK, map[string]any{
		"enterpriseId": id,
		"loans": []map[string]any{
			{"loanId": "LN-991", "amount": 500000, "outstanding": 420000, "status": "ACTIVE"},
		},
	})
}


func (h *Handler) copilotSimulate(w http.ResponseWriter, r *http.Request) {
	var input struct {
		ScenarioType  string `json:"scenarioType"`
		Variables     struct {
			RainfallDeviation    int `json:"rainfallDeviation"`
			TemperatureIncrease  int `json:"temperatureIncrease"`
			CropYieldImpact      int `json:"cropYieldImpact"`
			CommodityPriceChange int `json:"commodityPriceChange"`
			InputCostChange      int `json:"inputCostChange"`
		} `json:"variables"`
		HorizonMonths int    `json:"horizonMonths"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		// Fallback for old payloads
		input.Variables.RainfallDeviation = -20
		input.Variables.TemperatureIncrease = 2
		input.Variables.CropYieldImpact = -15
		input.Variables.CommodityPriceChange = -10
		input.Variables.InputCostChange = 12
	}

	scenInput := ScenarioInput{
		ScenarioType:  input.ScenarioType,
		Variables:     input.Variables,
		HorizonMonths: 12,
	}

	res, err := h.svc.CopilotSimulate(r.Context(), scenInput)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, res)
}
