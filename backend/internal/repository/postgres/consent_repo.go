package postgres

import (
	"context"
	"errors"

	"github.com/arthazeyro/zeyro-b2b/internal/repository/postgres/gen"
	"github.com/jackc/pgx/v5/pgtype"
)

type ConsentRepository interface {
	CreateConsentArtifact(ctx context.Context, partnerID string, userRefHash string, purposeCode string) (*gen.ConsentArtifact, error)
	GetConsentByUserAndPurpose(ctx context.Context, partnerID string, userRefHash string, purposeCode string) (*gen.ConsentArtifact, error)
	GetConsentById(ctx context.Context, id string) (*gen.ConsentArtifact, error)
	UpdateConsentStatus(ctx context.Context, id string, status string) error
}

type pgConsentRepository struct {
	q *gen.Queries
}

func NewConsentRepository(q *gen.Queries) ConsentRepository {
	return &pgConsentRepository{q: q}
}

func (r *pgConsentRepository) CreateConsentArtifact(ctx context.Context, partnerID string, userRefHash string, purposeCode string) (*gen.ConsentArtifact, error) {
	var pID pgtype.UUID
	if err := pID.Scan(partnerID); err != nil {
		return nil, errors.New("invalid partner id format")
	}

	consent, err := r.q.CreateConsentArtifact(ctx, gen.CreateConsentArtifactParams{
		PartnerID:   pID,
		UserRefHash: userRefHash,
		PurposeCode: purposeCode,
	})
	if err != nil {
		return nil, err
	}
	return &consent, nil
}

func (r *pgConsentRepository) GetConsentByUserAndPurpose(ctx context.Context, partnerID string, userRefHash string, purposeCode string) (*gen.ConsentArtifact, error) {
	var pID pgtype.UUID
	if err := pID.Scan(partnerID); err != nil {
		return nil, errors.New("invalid partner id format")
	}

	consent, err := r.q.GetConsentByUserAndPurpose(ctx, gen.GetConsentByUserAndPurposeParams{
		PartnerID:   pID,
		UserRefHash: userRefHash,
		PurposeCode: purposeCode,
	})
	if err != nil {
		return nil, err
	}
	return &consent, nil
}

func (r *pgConsentRepository) GetConsentById(ctx context.Context, id string) (*gen.ConsentArtifact, error) {
	var cID pgtype.UUID
	if err := cID.Scan(id); err != nil {
		return nil, errors.New("invalid consent id format")
	}

	consent, err := r.q.GetConsentById(ctx, cID)
	if err != nil {
		return nil, err
	}
	return &consent, nil
}

func (r *pgConsentRepository) UpdateConsentStatus(ctx context.Context, id string, status string) error {
	var cID pgtype.UUID
	if err := cID.Scan(id); err != nil {
		return errors.New("invalid consent id format")
	}

	return r.q.UpdateConsentStatus(ctx, gen.UpdateConsentStatusParams{
		ID:     cID,
		Status: status,
	})
}
