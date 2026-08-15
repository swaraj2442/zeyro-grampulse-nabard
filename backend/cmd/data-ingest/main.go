package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/arthazeyro/zeyro-b2b/internal/crypto"
	"github.com/arthazeyro/zeyro-b2b/internal/domain"
	"github.com/arthazeyro/zeyro-b2b/internal/infra/postgres"
	"github.com/arthazeyro/zeyro-b2b/internal/messaging"
	"github.com/arthazeyro/zeyro-b2b/internal/middleware"
	"github.com/arthazeyro/zeyro-b2b/internal/repository"
	postgresRepo "github.com/arthazeyro/zeyro-b2b/internal/repository/postgres"
	"github.com/arthazeyro/zeyro-b2b/internal/repository/postgres/gen"
	"github.com/arthazeyro/zeyro-b2b/internal/token"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
)

func main() {
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

	if err := messaging.SetupEventStream(context.Background(), js); err != nil {
		log.Fatalf("Failed to setup event stream: %v", err)
	}

	var logger messaging.AuditLogger = messaging.NewNatsAuditLogger(js)
	var eventPub messaging.EventPublisher = messaging.NewNatsEventPublisher(js)

	dbURL := envOrDefault("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/zeyro?sslmode=disable")
	dbPool, err := postgres.NewPool(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer dbPool.Close()

	txRepo := postgresRepo.NewTransactionRepository(dbPool)
	q := gen.New(dbPool)
	consentRepo := postgresRepo.NewConsentRepository(q)

	pubKeyHex := envOrDefault("ZEYRO_PASETO_PUBLIC_KEY", "e97ff8b1510a191fa86b7729730afebca3036bfcbe1fc7134a7475af5da3d7c2")
	if err := token.InitPasetoChecker(pubKeyHex); err != nil {
		log.Fatalf("Failed to init paseto checker: %v", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		middleware.WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	ingestHandler := middleware.RequirePASETOAuth(func(w http.ResponseWriter, r *http.Request) {
		handleUPIIngest(w, r, logger, eventPub, txRepo, consentRepo)
	})

	mux.HandleFunc("/ingest/upi", ingestHandler)
	mux.HandleFunc("/v1/ingest/upi", ingestHandler)

	addr := ":" + envOrDefault("DATA_INGEST_PORT", "8003")
	log.Printf("data-ingest listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}

func handleUPIIngest(w http.ResponseWriter, r *http.Request, audit messaging.AuditLogger, eventPub messaging.EventPublisher, repo repository.TransactionRepository, consentRepo postgresRepo.ConsentRepository) {
	if r.Method != http.MethodPost {
		middleware.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	payload := middleware.GetAuthPayload(r.Context())
	if payload == nil {
		middleware.WriteError(w, http.StatusUnauthorized, "invalid or missing token payload")
		return
	}

	var req domain.RawUPITransaction
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Trust the token's PartnerID, ignoring any potentially spoofed PartnerID in the payload
	req.PartnerID = payload.PartnerID

	if err := validateUPIRequest(req); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	userRefHash := crypto.SHA256Hex(req.UserRef)

	// Enforce Consent
	consent, err := consentRepo.GetConsentByUserAndPurpose(r.Context(), req.PartnerID, userRefHash, "DATA_INGESTION")
	if err != nil || consent.Status != "ACTIVE" {
		log.Printf("Consent enforcement failed for partner %s and user %s: err=%v", req.PartnerID, userRefHash, err)
		
		audit.Write(context.Background(), domain.AuditEvent{
			EventType:    "INGEST_UPI_DENIED",
			PartnerID:    req.PartnerID,
			ActorType:    "PARTNER",
			ActorRef:     req.PartnerID,
			ResourceType: "CONSENT",
			ResourceRef:  req.UserRef,
			Status:       "DENIED",
			Payload: map[string]any{
				"reason": "missing_or_inactive_consent",
			},
		})

		middleware.WriteError(w, http.StatusForbidden, "active consent required for ingestion")
		return
	}

	if err := repo.SaveRawTransaction(r.Context(), req); err != nil {
		log.Printf("Failed to save raw transaction: %v", err)
		middleware.WriteError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	audit.Write(context.Background(), domain.AuditEvent{
		EventType:    "INGEST_UPI_ACCEPTED",
		PartnerID:    req.PartnerID,
		ActorType:    "PARTNER",
		ActorRef:     req.PartnerID,
		ResourceType: "RAW_TRANSACTION",
		ResourceRef:  req.TxnID,
		Status:       "ACCEPTED",
		Payload: map[string]any{
			"user_ref_hash": userRefHash,
			"data_source":   req.DataSource,
			"direction":     req.Direction,
			"amount_inr":    req.AmountINR,
		},
	})

	if err := eventPub.Publish(context.Background(), "EVENTS.transaction.raw", req); err != nil {
		log.Printf("Failed to publish transaction event: %v", err)
	}

	middleware.WriteJSON(w, http.StatusAccepted, domain.IngestAcceptedResponse{
		Status:     "ACCEPTED",
		TxnID:      req.TxnID,
		ReceivedAt: time.Now().UTC(),
	})
}

func validateUPIRequest(req domain.RawUPITransaction) error {
	if req.PartnerID == "" {
		return errString("partner_id is required")
	}
	if req.UserRef == "" {
		return errString("user_ref is required")
	}
	if req.TxnID == "" {
		return errString("txn_id is required")
	}
	if req.AmountINR <= 0 {
		return errString("amount_inr must be greater than zero")
	}
	if req.Direction != "DEBIT" && req.Direction != "CREDIT" {
		return errString("direction must be DEBIT or CREDIT")
	}
	if req.DataSource == "" {
		return errString("data_source is required")
	}
	if req.Timestamp.IsZero() {
		return errString("timestamp is required")
	}
	return nil
}

type errString string

func (e errString) Error() string {
	return string(e)
}

func envOrDefault(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
