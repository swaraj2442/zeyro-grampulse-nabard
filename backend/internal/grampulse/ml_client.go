package grampulse

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// MLClient calls the internal Python ML service on port 8001.
// All methods are blocking; callers should use contexts with timeouts.
type MLClient struct {
	baseURL    string
	httpClient *http.Client
}

func NewMLClient(baseURL string) *MLClient {
	return &MLClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 60 * time.Second,
		},
	}
}

func (c *MLClient) post(ctx context.Context, path string, req, out any) error {
	body, err := json.Marshal(req)
	if err != nil {
		return fmt.Errorf("marshal: %w", err)
	}
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+path, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("new request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return fmt.Errorf("do request: %w", err)
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("read body: %w", err)
	}

	if resp.StatusCode >= 400 {
		return fmt.Errorf("ml service %s %d: %s", path, resp.StatusCode, string(raw))
	}

	return json.Unmarshal(raw, out)
}

func (c *MLClient) get(ctx context.Context, path string, out any) error {
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+path, nil)
	if err != nil {
		return err
	}
	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 400 {
		return fmt.Errorf("ml service %s %d: %s", path, resp.StatusCode, string(raw))
	}
	return json.Unmarshal(raw, out)
}

// ── ML service request shapes ─────────────────────────────────────────────────

type mlForecastRequest struct {
	EnterpriseID    string            `json:"enterpriseId"`
	History         []map[string]any  `json:"history"`
	MarketFeatures  *mlMarketFeatures `json:"marketFeatures,omitempty"`
	WeatherFeatures *mlWeatherFeatures `json:"weatherFeatures,omitempty"`
	LoanObligations *mlLoanObligations `json:"loanObligations,omitempty"`
}

type mlMarketFeatures struct {
	MaizePrice            *float64 `json:"maizePrice,omitempty"`
	SoybeanPrice          *float64 `json:"soybeanPrice,omitempty"`
	OutputCommodityPrice  *float64 `json:"outputCommodityPrice,omitempty"`
	InputCostIndex        *float64 `json:"inputCostIndex,omitempty"`
	CommodityPriceChange1m    *float64 `json:"commodityPriceChange1m,omitempty"`
	CommodityPriceChange3m    *float64 `json:"commodityPriceChange3m,omitempty"`
	CommodityPriceVolatility3m *float64 `json:"commodityPriceVolatility3m,omitempty"`
	FeedIndex                 *float64 `json:"feedIndex,omitempty"`
	MarketSource          string   `json:"marketSource"`
	MarketFetchedAt       *string  `json:"marketFetchedAt,omitempty"`
}

type mlWeatherFeatures struct {
	RainfallAnomalyPct *float64 `json:"rainfallAnomalyPct,omitempty"`
	TemperatureMean    *float64 `json:"temperatureMean,omitempty"`
	ExtremeHeatDays    *int     `json:"extremeHeatDays,omitempty"`
	ConsecutiveDryDays *int     `json:"consecutiveDryDays,omitempty"`
	ClimateRiskScore   *float64 `json:"climateRiskScore,omitempty"`
	WeatherSource      string   `json:"weatherSource"`
	WeatherFetchedAt   *string  `json:"weatherFetchedAt,omitempty"`
}

type mlLoanObligations struct {
	ScheduledEmiMonthly             float64 `json:"scheduledEmiMonthly"`
	ScheduledLoanRepaymentMonthly   float64 `json:"scheduledLoanRepaymentMonthly"`
	OutstandingAmount               float64 `json:"outstandingAmount"`
}

type mlScenarioRequest struct {
	EnterpriseID    string            `json:"enterpriseId"`
	History         []map[string]any  `json:"history"`
	Scenario        ScenarioRequest   `json:"scenario"`
	MarketFeatures  *mlMarketFeatures  `json:"marketFeatures,omitempty"`
	WeatherFeatures *mlWeatherFeatures `json:"weatherFeatures,omitempty"`
	LoanObligations *mlLoanObligations `json:"loanObligations,omitempty"`
}

type mlUnderwriteRequest struct {
	EnterpriseID           string           `json:"enterpriseId"`
	RequestedAmount        float64          `json:"requestedAmount"`
	RequestedTenureMonths  int              `json:"requestedTenureMonths"`
	ProductType            string           `json:"productType"`
	Purpose                string           `json:"purpose,omitempty"`
	Forecast               []map[string]any `json:"forecast"`
	CurrentDPD             int              `json:"currentDpd"`
	RepaymentDelayCount6m  int              `json:"repaymentDelayCount6m"`
	LoanOutstanding        float64          `json:"loanOutstanding"`
	SanctionedLimit        float64          `json:"sanctionedLimit"`
	ScheduledEmiMonthly    float64          `json:"scheduledEmiMonthly"`
	AnnualTurnover         float64          `json:"annualTurnover"`
	BusinessVintage        int              `json:"businessVintage"`
	Sector                 string           `json:"sector"`
	District               string           `json:"district"`
	MarketRiskScore        *float64         `json:"marketRiskScore,omitempty"`
	ClimateRiskScore       *float64         `json:"climateRiskScore,omitempty"`
}

type mlBatchScoreRequest struct {
	Enterprises     []mlEnterpriseScore  `json:"enterprises"`
	MarketFeatures  *mlMarketFeatures     `json:"marketFeatures,omitempty"`
	WeatherFeatures *mlWeatherFeatures    `json:"weatherFeatures,omitempty"`
}

type mlEnterpriseScore struct {
	EnterpriseID    string           `json:"enterpriseId"`
	History         []map[string]any `json:"history"`
	LoanObligations *mlLoanObligations `json:"loanObligations,omitempty"`
}

type mlHealthResponse struct {
	Ready                  bool   `json:"ready"`
	ModelsLoaded           int    `json:"modelsLoaded"`
	UnderwritingModelLoaded bool  `json:"underwritingModelLoaded"`
	ModelVersion           string `json:"modelVersion"`
}

// ── Public methods ────────────────────────────────────────────────────────────

// Forecast runs the 18-model CatBoost cashflow forecast via Python ML service.
func (c *MLClient) Forecast(ctx context.Context, enterpriseID string, history []map[string]any,
	market *mlMarketFeatures, weather *mlWeatherFeatures, loan *mlLoanObligations) (map[string]any, error) {
	req := mlForecastRequest{
		EnterpriseID:    enterpriseID,
		History:         history,
		MarketFeatures:  market,
		WeatherFeatures: weather,
		LoanObligations: loan,
	}
	var out map[string]any
	err := c.post(ctx, "/ml/forecast", req, &out)
	return out, err
}

// Scenario runs CatBoost re-inference with modified scenario parameters.
func (c *MLClient) Scenario(ctx context.Context, enterpriseID string, history []map[string]any,
	scenario ScenarioRequest, market *mlMarketFeatures, weather *mlWeatherFeatures, loan *mlLoanObligations) (map[string]any, error) {
	req := mlScenarioRequest{
		EnterpriseID:    enterpriseID,
		History:         history,
		Scenario:        scenario,
		MarketFeatures:  market,
		WeatherFeatures: weather,
		LoanObligations: loan,
	}
	var out map[string]any
	err := c.post(ctx, "/ml/scenario", req, &out)
	return out, err
}

// Underwrite runs the underwriting model + policy engine.
func (c *MLClient) Underwrite(ctx context.Context, req mlUnderwriteRequest) (map[string]any, error) {
	var out map[string]any
	err := c.post(ctx, "/ml/underwrite", req, &out)
	return out, err
}

// BatchScore scores a slice of enterprises in one call.
func (c *MLClient) BatchScore(ctx context.Context, req mlBatchScoreRequest) (map[string]any, error) {
	var out map[string]any
	err := c.post(ctx, "/ml/batch-score", req, &out)
	return out, err
}

// Health checks if the Python ML service is ready.
func (c *MLClient) Health(ctx context.Context) (mlHealthResponse, error) {
	var out mlHealthResponse
	ctx2, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	err := c.get(ctx2, "/ml/health", &out)
	return out, err
}
