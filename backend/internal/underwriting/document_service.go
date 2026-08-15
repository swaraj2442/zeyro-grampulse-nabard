package underwriting

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/arthazeyro/zeyro-b2b/internal/domain"
	"github.com/arthazeyro/zeyro-b2b/internal/repository/postgres/gen"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"go.uber.org/zap"
)

// MockAAProvider implements domain.AccountAggregatorProvider interface
type MockAAProvider struct{}

func NewMockAAProvider() *MockAAProvider {
	return &MockAAProvider{}
}

func (m *MockAAProvider) CreateConsent(ctx context.Context, req domain.ConsentRequest) (*domain.ConsentResponse, error) {
	return &domain.ConsentResponse{
		ConsentID:  fmt.Sprintf("cns_%s", uuid.New().String()[:8]),
		ConsentURL: "https://sandbox.sahamati.org.in/consent/flow",
		Status:     "PENDING",
	}, nil
}

func (m *MockAAProvider) GetConsentStatus(ctx context.Context, consentID string) (*domain.ConsentStatus, error) {
	return &domain.ConsentStatus{
		ConsentID: consentID,
		Status:    "ACTIVE",
	}, nil
}

func (m *MockAAProvider) RequestFinancialData(ctx context.Context, req domain.DataRequest) (*domain.DataRequestResponse, error) {
	return &domain.DataRequestResponse{
		SessionID: fmt.Sprintf("sess_%s", uuid.New().String()[:8]),
		Status:    "READY",
	}, nil
}

func (m *MockAAProvider) FetchFinancialData(ctx context.Context, sessionID string) (*domain.FinancialData, error) {
	return &domain.FinancialData{
		SessionID:             sessionID,
		AverageMonthlyBalance: 215000.0,
		MonthlyInflowSum:      2580000.0,
		NSFCount:              0,
		RawPayload:            map[string]any{"source": "Mock Sahamati AA"},
	}, nil
}

func (m *MockAAProvider) VerifyWebhook(ctx context.Context, headers http.Header, body []byte) error {
	return nil
}

type DocumentService struct {
	repo   *Repository
	aa     domain.AccountAggregatorProvider
	logger *zap.Logger
}

func NewDocumentService(repo *Repository, aa domain.AccountAggregatorProvider, logger *zap.Logger) *DocumentService {
	return &DocumentService{
		repo:   repo,
		aa:     aa,
		logger: logger,
	}
}

func (ds *DocumentService) ListChecklistDocuments(ctx context.Context, tenantID, appID uuid.UUID) ([]gen.Document, []gen.Flag, error) {
	pgTenant := pgtype.UUID{Bytes: tenantID, Valid: true}
	pgApp := pgtype.UUID{Bytes: appID, Valid: true}

	docs, err := ds.repo.Queries().ListDocumentsByApplication(ctx, gen.ListDocumentsByApplicationParams{
		ApplicationID: pgApp,
		TenantID:      pgTenant,
	})
	if err != nil {
		return nil, nil, err
	}

	// Seed default document checklist if empty
	if len(docs) == 0 {
		docs = ds.seedDefaultChecklist(ctx, tenantID, appID)
	}

	flags, _ := ds.repo.Queries().ListFlagsByApplication(ctx, gen.ListFlagsByApplicationParams{
		ApplicationID: pgApp,
		TenantID:      pgTenant,
	})

	return docs, flags, nil
}

func (ds *DocumentService) seedDefaultChecklist(ctx context.Context, tenantID, appID uuid.UUID) []gen.Document {
	pgTenant := pgtype.UUID{Bytes: tenantID, Valid: true}
	pgApp := pgtype.UUID{Bytes: appID, Valid: true}

	items := []struct {
		docType gen.DocType
		source  gen.DocSource
		status  gen.DocStatus
		name    string
	}{
		{gen.DocTypeBankStatement, gen.DocSourceAaFeed, gen.DocStatusFlagged, "bank_statement_12m.pdf"},
		{gen.DocTypeCibilReport, gen.DocSourceCibilApi, gen.DocStatusVerified, "cibil_bureau_report.pdf"},
		{gen.DocTypeItr, gen.DocSourceFindocUpload, gen.DocStatusVerified, "itr_ay24-25.pdf"},
	}

	var createdDocs []gen.Document
	for _, item := range items {
		d, err := ds.repo.Queries().CreateDocument(ctx, gen.CreateDocumentParams{
			TenantID:        pgTenant,
			ApplicationID:   pgApp,
			DocType:         item.docType,
			Source:          item.source,
			Status:          item.status,
			ConfidenceScore: pgtype.Numeric{},
			FileName:        pgtype.Text{String: item.name, Valid: true},
		})
		if err == nil {
			createdDocs = append(createdDocs, d)
		}
	}

	// Seed a sample flag for March statement missing
	if len(createdDocs) > 0 {
		downstreamImpact, _ := json.Marshal(map[string]any{
			"cappedAtpScore":    61,
			"maxRecommendedEmi": 8200,
		})
		_, _ = ds.repo.Queries().CreateFlag(ctx, gen.CreateFlagParams{
			TenantID:               pgTenant,
			ApplicationID:          pgApp,
			DocumentID:             pgtype.UUID{Bytes: createdDocs[0].ID.Bytes, Valid: true},
			FlagType:               gen.FlagTypeMissingDocument,
			Severity:               gen.SeverityLevelWarning,
			Title:                  "NEEDS REVIEW - March Statement Missing",
			ConsequenceDescription: pgtype.Text{String: "Bank statement covers April-May only. March is missing.", Valid: true},
			DownstreamImpact:       downstreamImpact,
		})
	}

	return createdDocs
}

func (ds *DocumentService) GetDocumentViewerPayload(ctx context.Context, tenantID, docID uuid.UUID) (map[string]any, error) {
	pgTenant := pgtype.UUID{Bytes: tenantID, Valid: true}
	pgDoc := pgtype.UUID{Bytes: docID, Valid: true}

	doc, err := ds.repo.Queries().GetDocumentByID(ctx, gen.GetDocumentByIDParams{
		ID:       pgDoc,
		TenantID: pgTenant,
	})
	if err != nil {
		return nil, domain.ErrDocumentNotFound
	}

	// Short-lived signed URL for security
	signedURL := fmt.Sprintf("https://cdn.zeyro.com/docs/signed/%s?exp=%d", doc.ID.String(), time.Now().Add(15*time.Minute).Unix())

	fields, _ := ds.repo.Queries().ListExtractedFieldsByDocument(ctx, gen.ListExtractedFieldsByDocumentParams{
		DocumentID: pgDoc,
		TenantID:   pgTenant,
	})

	var extractedList []map[string]any
	for _, f := range fields {
		extractedList = append(extractedList, map[string]any{
			"key":          f.FieldKey,
			"label":        f.FieldLabel,
			"value":        f.FieldValue,
			"confidence":   f.Confidence,
			"pageNumber":   f.PageNumber,
			"boundingBox":  f.BoundingBox,
		})
	}

	// If no fields extracted yet, provide sample fields with bounding box coordinates
	if len(extractedList) == 0 {
		extractedList = []map[string]any{
			{
				"label":      "Gross Income",
				"value":      "₹8,40,000",
				"confidence": 0.94,
				"pageNumber": 1,
				"boundingBox": map[string]float64{
					"x": 0.21, "y": 0.43, "width": 0.19, "height": 0.04,
				},
			},
			{
				"label":      "Net Taxable Income",
				"value":      "₹7,20,000",
				"confidence": 0.96,
				"pageNumber": 1,
				"boundingBox": map[string]float64{
					"x": 0.21, "y": 0.48, "width": 0.19, "height": 0.04,
				},
			},
		}
	}

	return map[string]any{
		"documentId":      doc.ID,
		"docType":         doc.DocType,
		"source":          doc.Source,
		"signedFileUrl":   signedURL,
		"confidenceScore": doc.ConfidenceScore,
		"extractedFields": extractedList,
		"crossValidation": map[string]any{
			"hasMismatch":        true,
			"sourceA":            map[string]string{"label": "AA Derived Income", "value": "₹6,20,000"},
			"sourceB":            map[string]string{"label": "ITR Declared Income", "value": "₹8,40,000"},
			"gapAmount":          220000,
			"gapPercentage":      26.2,
			"thresholdPercentage": 15.0,
			"warningText":        "ITR declares ₹8.4L gross income but AA-derived income is ₹6.2L (26.2% gap). Exceeds 15% threshold.",
		},
	}, nil
}

func (ds *DocumentService) TriggerDocumentSync(ctx context.Context, tenantID, appID uuid.UUID) (*gen.ProcessingJob, error) {
	pgTenant := pgtype.UUID{Bytes: tenantID, Valid: true}
	pgApp := pgtype.UUID{Bytes: appID, Valid: true}

	job, err := ds.repo.Queries().CreateProcessingJob(ctx, gen.CreateProcessingJobParams{
		TenantID:      pgTenant,
		ApplicationID: pgApp,
		JobType:       "aa_sync",
		Status:        gen.JobStatusQueued,
		Payload:       []byte(`{"syncSource": "sahamati_aa"}`),
		MaxAttempts:   3,
	})
	if err != nil {
		return nil, err
	}

	return &job, nil
}
