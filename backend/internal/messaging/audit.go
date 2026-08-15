package messaging

import (
	"context"
	"log"

	"github.com/arthazeyro/zeyro-b2b/internal/domain"
)

type AuditLogger interface {
	Write(ctx context.Context, event domain.AuditEvent)
}

type StdoutAuditLogger struct{}

func (StdoutAuditLogger) Write(_ context.Context, event domain.AuditEvent) {
	log.Printf("audit event type=%s resource=%s status=%s", event.EventType, event.ResourceRef, event.Status)
}
