package underwriting

import (
	"context"
	"fmt"

	"github.com/arthazeyro/zeyro-b2b/internal/domain"
	"github.com/arthazeyro/zeyro-b2b/internal/repository/postgres/gen"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

// AllowedTransitions map defines the explicit application stage state machine
var AllowedTransitions = map[gen.ApplicationStage][]gen.ApplicationStage{
	gen.ApplicationStageDraft: {
		gen.ApplicationStageSubmitted,
		gen.ApplicationStageCancelled,
	},
	gen.ApplicationStageSubmitted: {
		gen.ApplicationStageDocumentsPending,
		gen.ApplicationStageDocumentsProcessing,
		gen.ApplicationStageCancelled,
	},
	gen.ApplicationStageDocumentsPending: {
		gen.ApplicationStageDocumentsProcessing,
		gen.ApplicationStageCancelled,
	},
	gen.ApplicationStageDocumentsProcessing: {
		gen.ApplicationStageReviewReady,
		gen.ApplicationStageDocumentsPending,
	},
	gen.ApplicationStageReviewReady: {
		gen.ApplicationStageUnderReview,
	},
	gen.ApplicationStageUnderReview: {
		gen.ApplicationStageAdditionalInformationRequired,
		gen.ApplicationStageConditionallyApproved,
		gen.ApplicationStageApproved,
		gen.ApplicationStageRejected,
		gen.ApplicationStageWithdrawn,
	},
	gen.ApplicationStageAdditionalInformationRequired: {
		gen.ApplicationStageDocumentsProcessing,
		gen.ApplicationStageUnderReview,
		gen.ApplicationStageWithdrawn,
	},
	gen.ApplicationStageConditionallyApproved: {
		gen.ApplicationStageConditionsPending,
		gen.ApplicationStageReadyForDisbursement,
		gen.ApplicationStageApproved,
		gen.ApplicationStageWithdrawn,
		gen.ApplicationStageRejected,
	},
	gen.ApplicationStageApproved: {
		gen.ApplicationStageReadyForDisbursement,
		gen.ApplicationStageWithdrawn,
	},
	gen.ApplicationStageConditionsPending: {
		gen.ApplicationStageReadyForDisbursement,
		gen.ApplicationStageWithdrawn,
	},
	gen.ApplicationStageReadyForDisbursement: {
		gen.ApplicationStageDisbursed,
		gen.ApplicationStageWithdrawn,
	},
	gen.ApplicationStageDisbursed: {
		gen.ApplicationStageClosed,
	},
}

// WorkflowEngine manages stage transitions and timeline audits
type WorkflowEngine struct {
	queries *gen.Queries
}

func NewWorkflowEngine(queries *gen.Queries) *WorkflowEngine {
	return &WorkflowEngine{queries: queries}
}

// CanTransition checks if moving from currentStage to targetStage is allowed
func (we *WorkflowEngine) CanTransition(currentStage, targetStage gen.ApplicationStage) bool {
	if currentStage == targetStage {
		return true
	}
	allowed, ok := AllowedTransitions[currentStage]
	if !ok {
		return false
	}
	for _, s := range allowed {
		if s == targetStage {
			return true
		}
	}
	return false
}

// TransitionStage executes stage validation, DB update, and logs to application_timeline
func (we *WorkflowEngine) TransitionStage(
	ctx context.Context,
	tenantID uuid.UUID,
	appID uuid.UUID,
	targetStage gen.ApplicationStage,
	actorID *uuid.UUID,
	reason string,
	requestID string,
) (*gen.Application, error) {
	pgTenantID := pgtype.UUID{Bytes: tenantID, Valid: true}
	pgAppID := pgtype.UUID{Bytes: appID, Valid: true}

	app, err := we.queries.GetApplicationByID(ctx, gen.GetApplicationByIDParams{
		ID:       pgAppID,
		TenantID: pgTenantID,
	})
	if err != nil {
		return nil, domain.ErrApplicationNotFound
	}

	if !we.CanTransition(app.Stage, targetStage) {
		return nil, fmt.Errorf("%w: cannot transition from %s to %s", domain.ErrInvalidStageChange, app.Stage, targetStage)
	}

	progressPct := calculateProgress(targetStage)

	updatedApp, err := we.queries.UpdateApplicationStage(ctx, gen.UpdateApplicationStageParams{
		ID:                 pgAppID,
		TenantID:           pgTenantID,
		Stage:              targetStage,
		Status:             mapStageToStatus(targetStage),
		ProgressPercentage: progressPct,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update application stage: %w", err)
	}

	// Audit event in application_timeline
	var pgActorID pgtype.UUID
	if actorID != nil {
		pgActorID = pgtype.UUID{Bytes: *actorID, Valid: true}
	}

	var pgReason pgtype.Text
	if reason != "" {
		pgReason = pgtype.Text{String: reason, Valid: true}
	}

	var pgReqID pgtype.Text
	if requestID != "" {
		pgReqID = pgtype.Text{String: requestID, Valid: true}
	}

	_, _ = we.queries.CreateTimelineEvent(ctx, gen.CreateTimelineEventParams{
		TenantID:      pgTenantID,
		ApplicationID: pgAppID,
		EventType:     "stage_transition",
		PreviousStage: gen.NullApplicationStage{ApplicationStage: app.Stage, Valid: true},
		NewStage:      gen.NullApplicationStage{ApplicationStage: targetStage, Valid: true},
		ActorID:       pgActorID,
		ActorType:     "user",
		Reason:        pgReason,
		Metadata:      []byte("{}"),
		RequestID:     pgReqID,
	})

	return &updatedApp, nil
}

func calculateProgress(stage gen.ApplicationStage) int32 {
	switch stage {
	case gen.ApplicationStageDraft:
		return 10
	case gen.ApplicationStageSubmitted:
		return 25
	case gen.ApplicationStageDocumentsPending:
		return 35
	case gen.ApplicationStageDocumentsProcessing:
		return 50
	case gen.ApplicationStageReviewReady:
		return 75
	case gen.ApplicationStageUnderReview:
		return 85
	case gen.ApplicationStageAdditionalInformationRequired:
		return 60
	case gen.ApplicationStageConditionallyApproved:
		return 90
	case gen.ApplicationStageConditionsPending:
		return 92
	case gen.ApplicationStageReadyForDisbursement:
		return 95
	case gen.ApplicationStageApproved, gen.ApplicationStageDisbursed, gen.ApplicationStageClosed, gen.ApplicationStageRejected, gen.ApplicationStageWithdrawn, gen.ApplicationStageCancelled:
		return 100
	default:
		return 0
	}
}

func mapStageToStatus(stage gen.ApplicationStage) gen.ApplicationStatus {
	switch stage {
	case gen.ApplicationStageApproved, gen.ApplicationStageReadyForDisbursement, gen.ApplicationStageDisbursed, gen.ApplicationStageClosed:
		return gen.ApplicationStatusApproved
	case gen.ApplicationStageConditionallyApproved, gen.ApplicationStageConditionsPending:
		return gen.ApplicationStatusApprovedWithConditions
	case gen.ApplicationStageRejected:
		return gen.ApplicationStatusRejected
	case gen.ApplicationStageWithdrawn, gen.ApplicationStageCancelled:
		return gen.ApplicationStatusWithdrawn
	default:
		return gen.ApplicationStatusPending
	}
}
