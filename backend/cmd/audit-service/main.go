package main

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/arthazeyro/zeyro-b2b/internal/domain"
	"github.com/arthazeyro/zeyro-b2b/internal/infra/postgres"
	"github.com/arthazeyro/zeyro-b2b/internal/messaging"
	postgresRepo "github.com/arthazeyro/zeyro-b2b/internal/repository/postgres"
	"github.com/arthazeyro/zeyro-b2b/internal/repository/postgres/gen"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
)

func main() {
	dbURL := envOrDefault("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/zeyro?sslmode=disable")
	dbPool, err := postgres.NewPool(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer dbPool.Close()

	q := gen.New(dbPool)
	auditRepo := postgresRepo.NewAuditRepository(q)

	natsURL := envOrDefault("NATS_URL", nats.DefaultURL)
	nc, err := nats.Connect(natsURL)
	if err != nil {
		log.Fatalf("Failed to connect to NATS: %v", err)
	}
	defer nc.Close()

	js, err := jetstream.New(nc)
	if err != nil {
		log.Fatalf("Failed to create JetStream context: %v", err)
	}

	if err := messaging.SetupAuditStream(context.Background(), js); err != nil {
		log.Fatalf("Failed to setup audit stream: %v", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cons, err := js.CreateOrUpdateConsumer(ctx, messaging.AuditStreamName, jetstream.ConsumerConfig{
		Durable:       "audit_service_consumer",
		FilterSubject: "AUDIT.*",
		AckPolicy:     jetstream.AckExplicitPolicy,
	})
	if err != nil {
		log.Fatalf("Failed to create consumer: %v", err)
	}

	log.Println("Audit service started, waiting for events...")

	cc, err := cons.Consume(func(msg jetstream.Msg) {
		var event domain.AuditEvent
		if err := json.Unmarshal(msg.Data(), &event); err != nil {
			log.Printf("Failed to unmarshal audit event: %v", err)
			msg.Ack()
			return
		}

		if err := auditRepo.CreateAuditEvent(context.Background(), event); err != nil {
			log.Printf("Failed to create audit event in DB: %v", err)
			msg.Nak()
			return
		}

		log.Printf("Audit event written to DB: type=%s, resource=%s", event.EventType, event.ResourceRef)
		msg.Ack()
	})
	if err != nil {
		log.Fatalf("Failed to start consuming: %v", err)
	}
	defer cc.Stop()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	log.Println("Shutting down audit service...")
}

func envOrDefault(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
