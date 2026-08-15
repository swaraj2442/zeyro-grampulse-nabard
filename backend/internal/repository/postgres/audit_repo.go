package postgres

import (
	"context"
	"encoding/json"
	"time"

	"github.com/arthazeyro/zeyro-b2b/internal/domain"
	"github.com/arthazeyro/zeyro-b2b/internal/repository/postgres/gen"
	"github.com/jackc/pgx/v5/pgtype"
)

type AuditRepository interface {
	CreateAuditEvent(ctx context.Context, event domain.AuditEvent) error
}

type pgAuditRepository struct {
	q *gen.Queries
}

func NewAuditRepository(q *gen.Queries) AuditRepository {
	return &pgAuditRepository{q: q}
}

func (r *pgAuditRepository) CreateAuditEvent(ctx context.Context, event domain.AuditEvent) error {
	var partnerID pgtype.UUID
	if event.PartnerID != "" {
		_ = partnerID.Scan(event.PartnerID)
	}

	payloadBytes, _ := json.Marshal(event.Payload)
	if len(payloadBytes) == 0 {
		payloadBytes = []byte("{}")
	}

	actorType := event.ActorType
	if actorType == "" {
		actorType = "SERVICE"
	}
	actorRef := event.ActorRef
	if actorRef == "" {
		actorRef = "system"
	}

	_, err := r.q.CreateAuditEvent(ctx, gen.CreateAuditEventParams{
		EventType:    event.EventType,
		PartnerID:    partnerID,
		ActorType:    actorType,
		ActorRef:     actorRef,
		ResourceType: event.ResourceType,
		ResourceRef:  event.ResourceRef,
		Status:       event.Status,
		Payload:      payloadBytes,
		OccurredAt:   pgtype.Timestamptz{Time: time.Now(), Valid: true},
	})
	return err
}
