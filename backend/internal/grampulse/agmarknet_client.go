package grampulse

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
)

const agmarknetBaseURL = "https://example-agmarknet.com/v1" // Dummy URL as per plan, we'll mock the CAPTCHA flow.

type AgmarknetClient struct {
	repo       *Repository
	httpClient *http.Client
}

func NewAgmarknetClient(repo *Repository) *AgmarknetClient {
	return &AgmarknetClient{
		repo: repo,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// ── Track A: Interactive Endpoints ──────────────────────────────────────────

type CaptchaResponse struct {
	SessionID    string `json:"sessionId"`
	CaptchaKey   string `json:"captchaKey"`
	CaptchaImage string `json:"captchaImage"`
	ExpiresAt    string `json:"expiresAt"`
}

func (c *AgmarknetClient) GenerateCaptcha(ctx context.Context) (CaptchaResponse, error) {
	// Mock AGMARKNET captcha generator
	sessionID := fmt.Sprintf("AMS-%s-%s", time.Now().Format("20060102"), uuid.New().String()[:8])
	
	// Normally we would POST to /v1/captcha/generator
	return CaptchaResponse{
		SessionID:    sessionID,
		CaptchaKey:   uuid.New().String(),
		CaptchaImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", // 1x1 transparent png mock
		ExpiresAt:    time.Now().Add(5 * time.Minute).Format(time.RFC3339),
	}, nil
}

type ReportRequest struct {
	SessionID   string `json:"sessionId"`
	Captcha     string `json:"captcha"`
	FromDate    string `json:"fromDate"`
	ToDate      string `json:"toDate"`
	DataTypeID  string `json:"dataTypeId"`
	GroupID     string `json:"groupId"`
	CommodityID string `json:"commodityId"`
	StateIDs    []int  `json:"stateIds"`
	DistrictIDs []int  `json:"districtIds"`
	MarketIDs   []int  `json:"marketIds"`
	GradeIDs    []int  `json:"gradeIds"`
	VarietyIDs  []int  `json:"varietyIds"`
	Page        int    `json:"page"`
	Limit       int    `json:"limit"`
}

func (c *AgmarknetClient) SubmitReport(ctx context.Context, req ReportRequest) error {
	// Mock report submission
	// Validate CAPTCHA
	if req.Captcha == "" {
		return fmt.Errorf("captcha required")
	}

	// In real life, we would POST to /v1/daily-price-arrival/report
	// Mock storing some records in the DB
	now := time.Now().UTC()
	
	// Insert dummy record for Maize
	if req.CommodityID == "106" {
		c.repo.UpsertAgmarknetPrice(ctx, AgmarknetDailyPriceRow{
			ID:             uuid.New().String(),
			ArrivalDate:    req.FromDate,
			StateID:        "11",
			StateName:      "Maharashtra",
			DistrictID:     "100001",
			DistrictName:   "Nashik",
			MarketID:       "100002",
			MarketName:     "Nashik (Main)",
			CommodityID:    "106",
			CommodityName:  "Maize",
			VarietyID:      "100007",
			VarietyName:    "Other",
			GradeID:        "100003",
			GradeName:      "FAQ",
			MinPrice:       2100,
			MaxPrice:       2300,
			ModalPrice:     2150,
			Arrivals:       50,
			PriceUnit:      "Rs/Quintal",
			ArrivalUnit:    "Tonnes",
			Source:         "agmarknet",
			FetchedAt:      now.Format(time.RFC3339),
			RawHash:        uuid.New().String(),
		})
	}
	return nil
}

func (c *AgmarknetClient) RefreshFilters(ctx context.Context) error {
	// Mock fetching filters
	filters := []AgmarknetFilterRow{
		{FilterType: "commodity", FilterID: "106", FilterName: "Maize", FetchedAt: time.Now().Format(time.RFC3339)},
		{FilterType: "commodity", FilterID: "107", FilterName: "Soybean", FetchedAt: time.Now().Format(time.RFC3339)},
		{FilterType: "state", FilterID: "11", FilterName: "Maharashtra", FetchedAt: time.Now().Format(time.RFC3339)},
		{FilterType: "district", FilterID: "100001", FilterName: "Nashik", FetchedAt: time.Now().Format(time.RFC3339)},
	}

	for _, f := range filters {
		c.repo.UpsertAgmarknetFilter(ctx, f)
	}
	return nil
}

// ── Track B: Automated datagov in OGD fetch ──────────────────────────────────

// FetchDataGovIn fetches recent prices from OGD and normalizes to agmarknet_daily_prices
func (c *AgmarknetClient) FetchDataGovIn(ctx context.Context, apiKey string) error {
	if apiKey == "" {
		return nil
	}
	// Similar to old MarketClient.fetchLiveAPI but inserting to the normalized table
	// We'll mock this for now
	return nil
}
