package domain

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/google/uuid"
)

// RBAC Roles
type Role string

const (
	RoleUnderwritingViewer  Role = "underwriting_viewer"
	RoleCreditOfficer       Role = "credit_officer"
	RoleSeniorCreditOfficer Role = "senior_credit_officer"
	RoleCreditManager       Role = "credit_manager"
	RoleRiskAdmin           Role = "risk_admin"
	RoleTenantAdmin         Role = "tenant_admin"
)

// Common Domain Errors
var (
	ErrUnauthorized        = errors.New("unauthorized access")
	ErrForbidden           = errors.New("forbidden: insufficient role permissions")
	ErrApplicationNotFound = errors.New("application not found")
	ErrInvalidStageChange  = errors.New("invalid application stage transition")
	ErrDocumentNotFound    = errors.New("document not found")
	ErrPolicyNotFound      = errors.New("active BFS policy version not found")
)

// Context Keys for Multi-Tenancy & Auth
type contextKey string

const (
	TenantIDContextKey contextKey = "tenant_id"
	UserIDContextKey   contextKey = "user_id"
	UserRoleContextKey contextKey = "user_role"
)

// Account Aggregator Provider Interface
type AccountAggregatorProvider interface {
	CreateConsent(ctx context.Context, req ConsentRequest) (*ConsentResponse, error)
	GetConsentStatus(ctx context.Context, consentID string) (*ConsentStatus, error)
	RequestFinancialData(ctx context.Context, req DataRequest) (*DataRequestResponse, error)
	FetchFinancialData(ctx context.Context, sessionID string) (*FinancialData, error)
	VerifyWebhook(ctx context.Context, headers http.Header, body []byte) error
}

type ConsentRequest struct {
	ApplicantID string   `json:"applicant_id"`
	FIPTypes    []string `json:"fip_types"`
	RedirectURL string   `json:"redirect_url"`
}

type ConsentResponse struct {
	ConsentID  string `json:"consent_id"`
	ConsentURL string `json:"consent_url"`
	Status     string `json:"status"`
}

type ConsentStatus struct {
	ConsentID string `json:"consent_id"`
	Status    string `json:"status"`
}

type DataRequest struct {
	ConsentID string    `json:"consent_id"`
	FromDate  time.Time `json:"from_date"`
	ToDate    time.Time `json:"to_date"`
}

type DataRequestResponse struct {
	SessionID string `json:"session_id"`
	Status    string `json:"status"`
}

type FinancialData struct {
	SessionID          string            `json:"session_id"`
	AverageMonthlyBalance float64        `json:"average_monthly_balance"`
	MonthlyInflowSum   float64           `json:"monthly_inflow_sum"`
	NSFCount           int               `json:"nsf_count"`
	RawPayload         map[string]any    `json:"raw_payload"`
}

// Configurable LLM Memo Generator Interface
type MemoGenerator interface {
	Generate(ctx context.Context, input MemoGenerationInput) (*GeneratedMemo, error)
}

type MemoGenerationInput struct {
	ApplicationID   uuid.UUID      `json:"application_id"`
	ApplicantName   string         `json:"applicant_name"`
	LoanAmount      float64        `json:"loan_amount"`
	BFSScore        int            `json:"bfs_score"`
	RiskTier        string         `json:"risk_tier"`
	ScoreComponents map[string]int `json:"score_components"`
	Flags           []string       `json:"flags"`
}

type GeneratedMemo struct {
	ExecutiveSummary string             `json:"executive_summary"`
	FinancialAnalysis string            `json:"financial_analysis"`
	RiskAssessment   string             `json:"risk_assessment"`
	Mitigants        string             `json:"mitigants"`
	Recommendation   string             `json:"recommendation"`
	Citations        []MemoCitationChip `json:"citations"`
}

type MemoCitationChip struct {
	ChipID       string `json:"chip_id"`
	Claim        string `json:"claim"`
	SourceDocID  string `json:"source_doc_id"`
	SourceLine   string `json:"source_line"`
}

// DTO Requests & Responses
type CreateApplicationRequest struct {
	AppNumber        string  `json:"appNumber,omitempty"`
	ApplicantName    string  `json:"applicantName"`
	EntityType       string  `json:"entityType"`       // individual | corporate
	ApplicantSegment string  `json:"applicantSegment"` // salaried | self_employed | msme | gig
	LoanAmount       float64 `json:"loanAmount"`
	TenureMonths     int     `json:"tenureMonths"`
	AssignedOfficer  *string `json:"assignedOfficerId,omitempty"`
}

type AssignOfficerRequest struct {
	OfficerID string `json:"officerId"`
}

type ChangeStageRequest struct {
	NewStage string `json:"newStage"`
	Reason   string `json:"reason,omitempty"`
}

type CreateBFSPolicyRequest struct {
	PolicyName            string  `json:"policyName"`
	PolicyVersion         string  `json:"policyVersion"`
	ATPWeight             float64 `json:"atpWeight"`
	RPSWeight             float64 `json:"rpsWeight"`
	BCSWeight             float64 `json:"bcsWeight"`
	FDSWeight             float64 `json:"fdsWeight"`
	MinPassScore          int     `json:"minPassScore"`
	AutoApproveThreshold  int     `json:"autoApproveThreshold"`
}
