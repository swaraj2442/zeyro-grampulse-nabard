package messaging

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/arthazeyro/zeyro-b2b/internal/domain"
	"github.com/nats-io/nats.go/jetstream"
)

const AuditSubject = "AUDIT.event"
const AuditStreamName = "AUDIT"

type NatsAuditLogger struct {
	js jetstream.JetStream
}

func NewNatsAuditLogger(js jetstream.JetStream) *NatsAuditLogger {
	return &NatsAuditLogger{
		js: js,
	}
}

func (l *NatsAuditLogger) Write(ctx context.Context, event domain.AuditEvent) {
	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("failed to marshal audit event: %v", err)
		return
	}

	_, err = l.js.Publish(ctx, AuditSubject, data)
	if err != nil {
		log.Printf("failed to publish audit event to nats: %v", err)
	}
}

// SetupAuditStream creates the JetStream stream if it doesn't exist
func SetupAuditStream(ctx context.Context, js jetstream.JetStream) error {
	_, err := js.CreateOrUpdateStream(ctx, jetstream.StreamConfig{
		Name:     AuditStreamName,
		Subjects: []string{"AUDIT.*"},
	})
	if err != nil {
		return fmt.Errorf("failed to create or update stream %s: %w", AuditStreamName, err)
	}
	return nil
}
