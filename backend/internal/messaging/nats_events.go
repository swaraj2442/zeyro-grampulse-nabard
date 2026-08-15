package messaging

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/nats-io/nats.go/jetstream"
)

const EventStreamName = "EVENTS"

type EventPublisher interface {
	Publish(ctx context.Context, subject string, event any) error
}

type NatsEventPublisher struct {
	js jetstream.JetStream
}

func NewNatsEventPublisher(js jetstream.JetStream) *NatsEventPublisher {
	return &NatsEventPublisher{js: js}
}

func (p *NatsEventPublisher) Publish(ctx context.Context, subject string, event any) error {
	data, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal event: %w", err)
	}

	_, err = p.js.Publish(ctx, subject, data)
	if err != nil {
		return fmt.Errorf("failed to publish event to %s: %w", subject, err)
	}

	return nil
}

func SetupEventStream(ctx context.Context, js jetstream.JetStream) error {
	_, err := js.CreateOrUpdateStream(ctx, jetstream.StreamConfig{
		Name:     EventStreamName,
		Subjects: []string{"EVENTS.*", "EVENTS.*.*"},
	})
	if err != nil {
		return fmt.Errorf("failed to create or update event stream %s: %w", EventStreamName, err)
	}
	return nil
}
