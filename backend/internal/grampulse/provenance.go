package grampulse

import (
	"time"
)

// ── Source provenance ─────────────────────────────────────────────────────────

// DataSource describes where a data point came from.
type DataSource string

const (
	SourceLiveAPI     DataSource = "live-api"
	SourceCachedAPI   DataSource = "cached-api"
	SourceOfficialCSV DataSource = "official-csv"
	SourceSynthetic   DataSource = "synthetic"
	SourceDemoFallback DataSource = "demo-fallback"
)

// DataMode is the overall mode shown to the frontend.
type DataMode string

const (
	ModeLive              DataMode = "LIVE"
	ModeCached            DataMode = "CACHED"
	ModeLiveWithSynthetic DataMode = "LIVE_WITH_SYNTHETIC_INPUTS"
	ModeDemoFallback      DataMode = "DEMO_FALLBACK"
)

// Provenance records the lineage of a model response.
type Provenance struct {
	ForecastID           string     `json:"forecastId"`
	ComputedAt           time.Time  `json:"computedAt"`
	EnterpriseDataSource DataSource `json:"enterpriseDataSource"`
	WeatherSource        DataSource `json:"weatherSource"`
	WeatherFetchedAt     *time.Time `json:"weatherFetchedAt,omitempty"`
	MarketSource         DataSource `json:"marketSource"`
	MarketFetchedAt      *time.Time `json:"marketFetchedAt,omitempty"`
	CashFlowModelVersion string     `json:"cashFlowModelVersion"`
	RiskEngineVersion    string     `json:"riskEngineVersion"`
	UPIDataNote          string     `json:"upiDataNote"`
}
