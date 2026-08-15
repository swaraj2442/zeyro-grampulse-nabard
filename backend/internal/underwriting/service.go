package underwriting

import (
	"context"
	"fmt"
	"math/rand"

	"github.com/arthazeyro/zeyro-b2b/internal/domain"
	"github.com/arthazeyro/zeyro-b2b/internal/repository/postgres/gen"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"go.uber.org/zap"
)

type Service struct {
	repo     *Repository
	workflow *WorkflowEngine
	logger   *zap.Logger
}

func NewService(repo *Repository, logger *zap.Logger) *Service {
	return &Service{
		repo:     repo,
		workflow: NewWorkflowEngine(repo.Queries()),
		logger:   logger,
	}
}

func (s *Service) CreateApplication(
	ctx context.Context,
	tenantID uuid.UUID,
	actorID uuid.UUID,
	req domain.CreateApplicationRequest,
) (*gen.Application, error) {
	pgTenantID := pgtype.UUID{Bytes: tenantID, Valid: true}
	pgActorID := pgtype.UUID{Bytes: actorID, Valid: true}

	appNum := req.AppNumber
	if appNum == "" {
		appNum = fmt.Sprintf("APP-%d", 2000+rand.Intn(8000))
	}

	var assignedOfficer pgtype.UUID
	if req.AssignedOfficer != nil && *req.AssignedOfficer != "" {
		if uid, err := uuid.Parse(*req.AssignedOfficer); err == nil {
			assignedOfficer = pgtype.UUID{Bytes: uid, Valid: true}
		}
	}

	var loanAmount pgtype.Numeric
	_ = loanAmount.Scan(fmt.Sprintf("%.2f", req.LoanAmount))

	app, err := s.repo.Queries().CreateApplication(ctx, gen.CreateApplicationParams{
		TenantID:           pgTenantID,
		AppNumber:          appNum,
		ApplicantName:      req.ApplicantName,
		EntityType:         gen.EntityType(req.EntityType),
		ApplicantSegment:   gen.ApplicantSegment(req.ApplicantSegment),
		LoanAmount:         loanAmount,
		TenureMonths:       int32(req.TenureMonths),
		AssignedOfficerID:  assignedOfficer,
		Stage:              gen.ApplicationStageDraft,
		Status:             gen.ApplicationStatusPending,
		ProgressPercentage: 10,
		CreatedBy:          pgActorID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create application: %w", err)
	}

	// Create party entry
	_, _ = s.repo.Queries().CreateApplicationParty(ctx, gen.CreateApplicationPartyParams{
		TenantID:      pgTenantID,
		ApplicationID: app.ID,
		PartyType:     "borrower",
		FullName:      req.ApplicantName,
	})

	// Log creation to application_timeline
	_, _ = s.repo.Queries().CreateTimelineEvent(ctx, gen.CreateTimelineEventParams{
		TenantID:      pgTenantID,
		ApplicationID: app.ID,
		EventType:     "application_created",
		PreviousStage: gen.NullApplicationStage{},
		NewStage:      gen.NullApplicationStage{ApplicationStage: gen.ApplicationStageDraft, Valid: true},
		ActorID:       pgActorID,
		ActorType:     "user",
		Reason:        pgtype.Text{String: "Application created", Valid: true},
	})

	return &app, nil
}

func (s *Service) GetApplication(ctx context.Context, tenantID, appID uuid.UUID) (*gen.Application, error) {
	app, err := s.repo.Queries().GetApplicationByID(ctx, gen.GetApplicationByIDParams{
		ID:       pgtype.UUID{Bytes: appID, Valid: true},
		TenantID: pgtype.UUID{Bytes: tenantID, Valid: true},
	})
	if err != nil {
		return nil, domain.ErrApplicationNotFound
	}
	return &app, nil
}

func (s *Service) ListApplications(
	ctx context.Context,
	tenantID uuid.UUID,
	search string,
	stage *gen.ApplicationStage,
	status *gen.ApplicationStatus,
	entityType *gen.EntityType,
	officerID *uuid.UUID,
	archivedFilter string,
	page int,
	limit int,
) ([]gen.Application, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	pgTenantID := pgtype.UUID{Bytes: tenantID, Valid: true}

	var stageStr string
	if stage != nil {
		stageStr = string(*stage)
	}

	var statusStr string
	if status != nil {
		statusStr = string(*status)
	}

	var entityStr string
	if entityType != nil {
		entityStr = string(*entityType)
	}

	var officerStr string
	if officerID != nil {
		officerStr = officerID.String()
	}

	apps, err := s.repo.Queries().ListApplications(ctx, gen.ListApplicationsParams{
		TenantID:          pgTenantID,
		Search:            search,
		Stage:             stageStr,
		Status:            statusStr,
		EntityType:        entityStr,
		AssignedOfficerID: officerStr,
		ArchivedFilter:    archivedFilter,
		LimitVal:          int32(limit),
		OffsetVal:         int32(offset),
	})
	if err != nil {
		return nil, 0, err
	}

	total, err := s.repo.Queries().CountApplications(ctx, gen.CountApplicationsParams{
		TenantID:          pgTenantID,
		Search:            search,
		Stage:             stageStr,
		Status:            statusStr,
		EntityType:        entityStr,
		AssignedOfficerID: officerStr,
		ArchivedFilter:    archivedFilter,
	})
	if err != nil {
		total = int64(len(apps))
	}

	return apps, total, nil
}

func (s *Service) ArchiveApplication(ctx context.Context, tenantID, appID, actorID uuid.UUID, reason string) (*gen.Application, error) {
	pgTenant := pgtype.UUID{Bytes: tenantID, Valid: true}
	pgApp := pgtype.UUID{Bytes: appID, Valid: true}
	pgActor := pgtype.UUID{Bytes: actorID, Valid: true}

	app, err := s.repo.Queries().ArchiveApplication(ctx, gen.ArchiveApplicationParams{
		ID:            pgApp,
		TenantID:      pgTenant,
		ArchivedBy:    pgActor,
		ArchiveReason: pgtype.Text{String: reason, Valid: true},
	})
	if err != nil {
		return nil, err
	}

	_, _ = s.repo.Queries().CreateTimelineEvent(ctx, gen.CreateTimelineEventParams{
		TenantID:      pgTenant,
		ApplicationID: pgApp,
		EventType:     "application_archived",
		ActorID:       pgActor,
		ActorType:     "user",
		Reason:        pgtype.Text{String: reason, Valid: true},
	})

	return &app, nil
}

func (s *Service) RestoreApplication(ctx context.Context, tenantID, appID, actorID uuid.UUID) (*gen.Application, error) {
	pgTenant := pgtype.UUID{Bytes: tenantID, Valid: true}
	pgApp := pgtype.UUID{Bytes: appID, Valid: true}
	pgActor := pgtype.UUID{Bytes: actorID, Valid: true}

	app, err := s.repo.Queries().RestoreApplication(ctx, gen.RestoreApplicationParams{
		ID:       pgApp,
		TenantID: pgTenant,
	})
	if err != nil {
		return nil, err
	}

	_, _ = s.repo.Queries().CreateTimelineEvent(ctx, gen.CreateTimelineEventParams{
		TenantID:      pgTenant,
		ApplicationID: pgApp,
		EventType:     "application_restored",
		ActorID:       pgActor,
		ActorType:     "user",
		Reason:        pgtype.Text{String: "Application restored from archive", Valid: true},
	})

	return &app, nil
}

func (s *Service) DisburseApplication(ctx context.Context, tenantID, appID, actorID uuid.UUID, loanAccountID string, disbursedAmount float64, referenceNumber string) (*gen.Application, error) {
	pgTenant := pgtype.UUID{Bytes: tenantID, Valid: true}
	pgApp := pgtype.UUID{Bytes: appID, Valid: true}
	pgActor := pgtype.UUID{Bytes: actorID, Valid: true}

	// 1. Verify mandatory conditions fulfilled
	pendingMandatoryCount, err := s.repo.Queries().CountPendingMandatoryConditions(ctx, gen.CountPendingMandatoryConditionsParams{
		ApplicationID: pgApp,
		TenantID:      pgTenant,
	})
	if err != nil {
		return nil, err
	}
	if pendingMandatoryCount > 0 {
		return nil, fmt.Errorf("cannot disburse: %d mandatory conditions are pending fulfillment", pendingMandatoryCount)
	}

	// 2. Disburse
	app, err := s.repo.Queries().DisburseApplication(ctx, gen.DisburseApplicationParams{
		ID:       pgApp,
		TenantID: pgTenant,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to disburse application (verify stage is ready_for_disbursement): %w", err)
	}

	auditMsg := fmt.Sprintf("Disbursed ₹%.2f via %s (Ref: %s)", disbursedAmount, loanAccountID, referenceNumber)
	_, _ = s.repo.Queries().CreateTimelineEvent(ctx, gen.CreateTimelineEventParams{
		TenantID:      pgTenant,
		ApplicationID: pgApp,
		EventType:     "application_disbursed",
		PreviousStage: gen.NullApplicationStage{ApplicationStage: gen.ApplicationStageReadyForDisbursement, Valid: true},
		NewStage:      gen.NullApplicationStage{ApplicationStage: gen.ApplicationStageDisbursed, Valid: true},
		ActorID:       pgActor,
		ActorType:     "user",
		Reason:        pgtype.Text{String: auditMsg, Valid: true},
	})

	return &app, nil
}

func (s *Service) AssignOfficer(
	ctx context.Context,
	tenantID uuid.UUID,
	appID uuid.UUID,
	officerID uuid.UUID,
	actorID uuid.UUID,
) (*gen.Application, error) {
	pgTenantID := pgtype.UUID{Bytes: tenantID, Valid: true}
	pgAppID := pgtype.UUID{Bytes: appID, Valid: true}
	pgOfficerID := pgtype.UUID{Bytes: officerID, Valid: true}

	app, err := s.repo.Queries().UpdateApplicationAssignment(ctx, gen.UpdateApplicationAssignmentParams{
		ID:                pgAppID,
		TenantID:          pgTenantID,
		AssignedOfficerID: pgOfficerID,
	})
	if err != nil {
		return nil, err
	}

	_, _ = s.repo.Queries().CreateTimelineEvent(ctx, gen.CreateTimelineEventParams{
		TenantID:      pgTenantID,
		ApplicationID: pgAppID,
		EventType:     "officer_assigned",
		ActorID:       pgtype.UUID{Bytes: actorID, Valid: true},
		ActorType:     "user",
		Reason:        pgtype.Text{String: fmt.Sprintf("Assigned to officer %s", officerID), Valid: true},
	})

	return &app, nil
}

func (s *Service) TransitionStage(
	ctx context.Context,
	tenantID uuid.UUID,
	appID uuid.UUID,
	targetStage gen.ApplicationStage,
	actorID uuid.UUID,
	reason string,
	requestID string,
) (*gen.Application, error) {
	return s.workflow.TransitionStage(ctx, tenantID, appID, targetStage, &actorID, reason, requestID)
}

func (s *Service) ListTimelineEvents(ctx context.Context, tenantID, appID uuid.UUID) ([]gen.ApplicationTimeline, error) {
	return s.repo.Queries().ListTimelineEvents(ctx, gen.ListTimelineEventsParams{
		ApplicationID: pgtype.UUID{Bytes: appID, Valid: true},
		TenantID:      pgtype.UUID{Bytes: tenantID, Valid: true},
	})
}
