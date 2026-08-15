package postgres

import (
	"context"
	"errors"

	"github.com/arthazeyro/zeyro-b2b/internal/repository/postgres/gen"
	"github.com/jackc/pgx/v5/pgtype"
)

type AssessmentRepository interface {
	CreateAssessment(ctx context.Context, id string, partnerID string, consentID string, partnerRefID string, userRefHash string, status string, requestedProducts []string, scoreVersion string) (*gen.Assessment, error)
	UpdateAssessmentResult(ctx context.Context, id string, status string, overallSignal string, responseJSON []byte) (*gen.Assessment, error)
	GetAssessment(ctx context.Context, id string) (*gen.Assessment, error)
}

type pgAssessmentRepository struct {
	q *gen.Queries
}

func NewAssessmentRepository(q *gen.Queries) AssessmentRepository {
	return &pgAssessmentRepository{q: q}
}

func (r *pgAssessmentRepository) CreateAssessment(ctx context.Context, id string, partnerID string, consentID string, partnerRefID string, userRefHash string, status string, requestedProducts []string, scoreVersion string) (*gen.Assessment, error) {
	var aID pgtype.UUID
	if err := aID.Scan(id); err != nil {
		return nil, errors.New("invalid assessment id format")
	}

	var pID pgtype.UUID
	if err := pID.Scan(partnerID); err != nil {
		return nil, errors.New("invalid partner id format")
	}

	var cID pgtype.UUID
	if consentID != "" {
		if err := cID.Scan(consentID); err != nil {
			return nil, errors.New("invalid consent id format")
		}
	}

	var refID pgtype.Text
	if partnerRefID != "" {
		refID = pgtype.Text{String: partnerRefID, Valid: true}
	}

	var sVer pgtype.Text
	if scoreVersion != "" {
		sVer = pgtype.Text{String: scoreVersion, Valid: true}
	}

	assessment, err := r.q.CreateAssessment(ctx, gen.CreateAssessmentParams{
		ID:                aID,
		PartnerID:         pID,
		ConsentID:         cID,
		PartnerRefID:      refID,
		UserRefHash:       userRefHash,
		Status:            status,
		RequestedProducts: requestedProducts,
		ScoreVersion:      sVer,
	})
	if err != nil {
		return nil, err
	}
	return &assessment, nil
}

func (r *pgAssessmentRepository) UpdateAssessmentResult(ctx context.Context, id string, status string, overallSignal string, responseJSON []byte) (*gen.Assessment, error) {
	var aID pgtype.UUID
	if err := aID.Scan(id); err != nil {
		return nil, errors.New("invalid assessment id format")
	}

	var sig pgtype.Text
	if overallSignal != "" {
		sig = pgtype.Text{String: overallSignal, Valid: true}
	}

	assessment, err := r.q.UpdateAssessmentResult(ctx, gen.UpdateAssessmentResultParams{
		ID:            aID,
		Status:        status,
		OverallSignal: sig,
		ResponseJson:  responseJSON,
	})
	if err != nil {
		return nil, err
	}
	return &assessment, nil
}

func (r *pgAssessmentRepository) GetAssessment(ctx context.Context, id string) (*gen.Assessment, error) {
	var aID pgtype.UUID
	if err := aID.Scan(id); err != nil {
		return nil, errors.New("invalid assessment id format")
	}

	assessment, err := r.q.GetAssessment(ctx, aID)
	if err != nil {
		return nil, err
	}
	return &assessment, nil
}
