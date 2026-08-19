package grampulse

import "time"

// ── Enterprise ────────────────────────────────────────────────────────────────

type Enterprise struct {
	ID                     string     `json:"id"`
	EnterpriseID           string     `json:"enterpriseId"`
	Name                   string     `json:"name"`
	District               string     `json:"district"`
	Block                  string     `json:"block"`
	Village                string     `json:"village,omitempty"`
	State                  string     `json:"state"`
	Sector                 string     `json:"sector"`
	EnterpriseType         string     `json:"enterpriseType"`
	OwnershipType          string     `json:"ownershipType"`
	AccountStatus          string     `json:"accountStatus"`
	CurrentDPD             int        `json:"currentDpd"`
	AnnualTurnover         float64    `json:"annualTurnover,omitempty"`
	BusinessVintage        int        `json:"businessVintage,omitempty"`
	TotalExposure          float64    `json:"totalExposure,omitempty"`
	RiskScore              *float64   `json:"riskScore"`
	RiskLevel              string     `json:"riskLevel"`
	RiskStatus             string     `json:"riskStatus,omitempty"`
	ForecastDeficit        float64    `json:"forecastDeficit"`
	WarningLeadTimeDays    int        `json:"warningLeadTimeDays"`
	DataSource             DataSource `json:"enterpriseDataSource"`
}

type EnterpriseListResponse struct {
	Total       int          `json:"total"`
	Enterprises []Enterprise `json:"enterprises"`
}

// ── Financial record ──────────────────────────────────────────────────────────

type FinancialRecordInput struct {
	EnterpriseID     string  `json:"enterpriseId"`
	Month            string  `json:"month"`
	OperatingInflow  float64 `json:"operatingInflow"`
	OperatingOutflow float64 `json:"operatingOutflow"`
	Savings          float64 `json:"savings"`
	LoanRepayment    float64 `json:"loanRepayment"`
	InventoryCost    float64 `json:"inventoryCost"`
}

type FinancialRecordResult struct {
	ID               string `json:"id"`
	EnterpriseID     string `json:"enterpriseId"`
	RecordedAt       string `json:"recordedAt"`
	SyncStatus       string `json:"syncStatus"`
	ForecastRefreshed bool  `json:"forecastRefreshed"`
	RiskChanged      bool   `json:"riskChanged"`
	PreviousRiskLevel string `json:"previousRiskLevel,omitempty"`
	NewRiskLevel     string `json:"newRiskLevel,omitempty"`
}

// ── Forecast ──────────────────────────────────────────────────────────────────

type ForecastMonth struct {
	Month                string  `json:"month"`
	Horizon              int     `json:"horizon"`
	OperatingInflow      float64 `json:"operatingInflow"`
	OperatingOutflow     float64 `json:"operatingOutflow"`
	ClosingCashBalance   float64 `json:"closingCashBalance"`
	CashAfterDebtService float64 `json:"cashAfterDebtService"`
	Lower                float64 `json:"lower"`
	Upper                float64 `json:"upper"`
}

type ForecastResponse struct {
	EnterpriseID        string          `json:"enterpriseId"`
	ModelVersion        string          `json:"modelVersion"`
	ForecastGeneratedAt time.Time       `json:"forecastGeneratedAt"`
	Forecast            []ForecastMonth `json:"forecast"`
	Provenance          Provenance      `json:"provenance"`
}

// ── Early warning ─────────────────────────────────────────────────────────────

type RiskDriver struct {
	Feature            string  `json:"feature"`
	ObservedValue      float64 `json:"observedValue"`
	Unit               string  `json:"unit"`
	ContributionPoints float64 `json:"contributionPoints"`
	Explanation        string  `json:"explanation"`
}

type EarlyWarningResponse struct {
	EnterpriseID         string       `json:"enterpriseId"`
	RiskScore            float64      `json:"riskScore"`
	RiskLevel            string       `json:"riskLevel"`
	ForecastDeficit      float64      `json:"forecastDeficit"`
	DebtServiceShortfall float64      `json:"debtServiceShortfall"`
	StressMonth          string       `json:"stressMonth"`
	WarningLeadTimeDays  int          `json:"warningLeadTimeDays"`
	Drivers              []RiskDriver `json:"drivers"`
	RecommendedIntervention string   `json:"recommendedIntervention"`
	ForecastStatus       string       `json:"forecastStatus,omitempty"`
	LastSuccessfulForecast *time.Time `json:"lastSuccessfulForecast,omitempty"`
	Provenance           *Provenance  `json:"provenance,omitempty"`
}

// ── Portfolio ─────────────────────────────────────────────────────────────────

type PortfolioSummary struct {
	Total                  int     `json:"total"`
	Healthy                int     `json:"healthy"`
	Watchlist              int     `json:"watchlist"`
	High                   int     `json:"high"`
	Critical               int     `json:"critical"`
	ForecastDeficitExposure float64 `json:"forecastDeficitExposure"`
	ActiveInterventions    int     `json:"activeInterventions"`
	ScoredEnterprises      int     `json:"scoredEnterprises"`
	LastBatchScoredAt      *time.Time `json:"lastBatchScoredAt,omitempty"`
	ComputedAt             time.Time  `json:"computedAt"`
}

// ── Intervention ──────────────────────────────────────────────────────────────

type InterventionInput struct {
	EnterpriseID              string  `json:"enterpriseId"`
	RecommendedIntervention   string  `json:"recommendedIntervention"`
	IllustrativeAmount        float64 `json:"illustrativeAmount,omitempty"`
	AssignedOfficer           string  `json:"assignedOfficer"`
	VisitDate                 string  `json:"visitDate,omitempty"`
	FollowUpDate              string  `json:"followUpDate,omitempty"`
	Notes                     string  `json:"notes,omitempty"`
}

type Intervention struct {
	ID                      string  `json:"id"`
	EnterpriseID            string  `json:"enterpriseId"`
	RecommendedIntervention string  `json:"recommendedIntervention"`
	IllustrativeAmount      float64 `json:"illustrativeAmount,omitempty"`
	AssignedOfficer         string  `json:"assignedOfficer"`
	VisitDate               string  `json:"visitDate,omitempty"`
	FollowUpDate            string  `json:"followUpDate,omitempty"`
	Notes                   string  `json:"notes,omitempty"`
	Status                  string  `json:"status"`
	CreatedAt               string  `json:"createdAt"`
	UpdatedAt               string  `json:"updatedAt"`
}

// ── Underwriting ──────────────────────────────────────────────────────────────

type UnderwriteRequest struct {
	RequestedAmount      float64 `json:"requestedAmount"`
	RequestedTenure      int     `json:"requestedTenureMonths"`
	ProductType          string  `json:"productType"`
	Purpose              string  `json:"purpose,omitempty"`
}

type UnderwriteResponse struct {
	DecisionID                   string     `json:"decisionId"`
	EnterpriseID                 string     `json:"enterpriseId"`
	RequestedAmount              float64    `json:"requestedAmount"`
	Decision                     string     `json:"decision"`
	RecommendedLimit             float64    `json:"recommendedLimit"`
	MaximumAffordableEmi         float64    `json:"maximumAffordableEmi"`
	RepaymentCapacityScore       int        `json:"repaymentCapacityScore"`
	DefaultRiskBand              string     `json:"defaultRiskBand"`
	Conditions                   []string   `json:"conditions"`
	ReasonCodes                  []string   `json:"reasonCodes"`
	ModelVersion                 string     `json:"modelVersion"`
	PolicyVersion                string     `json:"policyVersion"`
	ComputedAt                   time.Time  `json:"computedAt"`
	Provenance                   Provenance `json:"provenance"`
}

// ── Scenario ──────────────────────────────────────────────────────────────────

type ScenarioRequest struct {
	WorkingCapitalSupport float64 `json:"workingCapitalSupport"`
	GrantSupport          float64 `json:"grantSupport"`
	InputCostChange       float64 `json:"inputCostChange"`
	OutputPriceChange     float64 `json:"outputPriceChange"`
	RainfallAnomalyChange float64 `json:"rainfallAnomalyChange"`
	EmiAdjustment         float64 `json:"emiAdjustment"`
}

// ── Timeline ──────────────────────────────────────────────────────────────────

type TimelineEvent struct {
	ID           string `json:"id"`
	EnterpriseID string `json:"enterpriseId"`
	Date         string `json:"date"`
	Title        string `json:"title"`
	Description  string `json:"description"`
}

type TimelineResponse struct {
	EnterpriseID string          `json:"enterpriseId"`
	Events       []TimelineEvent `json:"events"`
}

// ── Alert ─────────────────────────────────────────────────────────────────────

type Alert struct {
	ID           string `json:"id"`
	EnterpriseID string `json:"enterpriseId"`
	RiskLevel    string `json:"riskLevel"`
	Title        string `json:"title"`
	Description  string `json:"description"`
	CreatedAt    string `json:"createdAt"`
	Status       string `json:"status"`
}

// ── Weather ───────────────────────────────────────────────────────────────────

type ClimateRisk struct {
	District           string     `json:"district"`
	ClimateRiskScore   float64    `json:"climateRiskScore"`
	RainfallAnomaly    float64    `json:"rainfallAnomaly"`
	TemperatureMean    float64    `json:"temperatureMean"`
	DroughtRisk        string     `json:"droughtRisk"`
	ConsecutiveDryDays int        `json:"consecutiveDryDays"`
	ExtremeHeatDays    int        `json:"extremeHeatDays"`
	ForecastRainfall   float64    `json:"forecastRainfall"`
	Source             DataSource `json:"source"`
	FetchedAt          time.Time  `json:"fetchedAt"`
	IsStale            bool       `json:"isStale"`
}

type DailyWeatherPoint struct {
	Date                       string   `json:"date"`
	TemperatureMaxC            *float64 `json:"temperature_max_c"`
	TemperatureMinC            *float64 `json:"temperature_min_c"`
	RainfallMm                 *float64 `json:"rainfall_mm"`
	PrecipitationProbabilityPct *float64 `json:"precipitation_probability_pct"`
	WindSpeedMaxKmh            *float64 `json:"wind_speed_max_kmh"`
	WeatherCode                *int     `json:"weather_code"`
}

type ClimateRiskSummary struct {
	District             string    `json:"district"`
	Block                string    `json:"block,omitempty"`
	RainfallForecastMm   float64   `json:"rainfall_forecast_mm"`
	RainfallAnomalyPct   *float64  `json:"rainfall_anomaly_pct"`
	TemperatureMeanC     float64   `json:"temperature_mean_c"`
	ExtremeHeatDays      int       `json:"extreme_heat_days"`
	HeavyRainDays        int       `json:"heavy_rain_days"`
	ConsecutiveDryDays   int       `json:"consecutive_dry_days"`
	DroughtRisk          string    `json:"drought_risk"`
	FloodRisk            string    `json:"flood_risk"`
	ClimateRiskScore     float64   `json:"climate_risk_score"`
	Source               string    `json:"source"`
	SourceStatus         string    `json:"source_status"`
	FetchedAt            time.Time `json:"fetched_at"`
	IsStale              bool      `json:"is_stale"`
}

type WeatherForecastResponse struct {
	LocationKey  string               `json:"location_key"`
	Latitude     float64              `json:"latitude"`
	Longitude    float64              `json:"longitude"`
	Timezone     string               `json:"timezone"`
	Daily        []DailyWeatherPoint  `json:"daily"`
	ClimateRisk  ClimateRiskSummary   `json:"climate_risk"`
}

// ── Market ────────────────────────────────────────────────────────────────────

type MarketPrice struct {
	CommodityID      string     `json:"commodityId"`
	Commodity        string     `json:"commodity"`
	DistrictID       *string    `json:"districtId,omitempty"`
	District         *string    `json:"district,omitempty"`
	Market           string     `json:"market,omitempty"`
	ModalPrice       float64    `json:"modalPrice"`
	Unit             string     `json:"unit"`
	ArrivalDate      string     `json:"arrivalDate,omitempty"`
	LatestMonth      string     `json:"latestMonth"`
	PriceChange1m    float64    `json:"priceChange1m"`
	PriceChange3m    float64    `json:"priceChange3m"`
	PriceVolatility3m float64   `json:"priceVolatility3m"`
	Source           DataSource `json:"source"`
	SourceType       string     `json:"sourceType"`
	FetchedAt        time.Time  `json:"fetchedAt"`
	IsStale          bool       `json:"isStale"`
}

type FeedIndex struct {
	DistrictID  string     `json:"districtId"`
	District    string     `json:"district"`
	FeedIndex   float64    `json:"feedIndex"`
	MaizePrice  float64    `json:"maizePrice"`
	SoybeanPrice float64   `json:"soybeanPrice"`
	Change1m    float64    `json:"change1m"`
	Change3m    float64    `json:"change3m"`
	Series      []any      `json:"series"`
	Source      DataSource `json:"source"`
	FetchedAt   time.Time  `json:"fetchedAt"`
	IsStale     bool       `json:"isStale"`
}

// ── System ────────────────────────────────────────────────────────────────────

type HealthResponse struct {
	Status          string `json:"status"`
	MLServiceReady  bool   `json:"mlServiceReady"`
	MLModelsLoaded  int    `json:"mlModelsLoaded"`
	DBConnected     bool   `json:"dbConnected"`
	SyntheticLoaded bool   `json:"syntheticDataLoaded"`
	WeatherFeed     string `json:"weatherFeed"`
	MarketFeed      string `json:"marketFeed"`
}

type PortfolioForecastDataPoint struct {
	Day      string   `json:"day"`
	Actual   *float64 `json:"actual,omitempty"`
	Forecast *float64 `json:"forecast,omitempty"`
	Lower    *float64 `json:"lower,omitempty"`
	Upper    *float64 `json:"upper,omitempty"`
}

type PortfolioForecastTimeseriesResponse struct {
	Growth   []PortfolioForecastDataPoint `json:"growth"`
	Cashflow []PortfolioForecastDataPoint `json:"cashflow"`
	Risk     []PortfolioForecastDataPoint `json:"risk"`
	Npa      []PortfolioForecastDataPoint `json:"npa"`
}
