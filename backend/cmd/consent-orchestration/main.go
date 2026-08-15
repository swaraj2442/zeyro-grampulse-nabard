package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/arthazeyro/zeyro-b2b/internal/crypto"
	"github.com/arthazeyro/zeyro-b2b/internal/infra/postgres"
	"github.com/arthazeyro/zeyro-b2b/internal/middleware"
	postgresRepo "github.com/arthazeyro/zeyro-b2b/internal/repository/postgres"
	"github.com/arthazeyro/zeyro-b2b/internal/repository/postgres/gen"
	"github.com/arthazeyro/zeyro-b2b/internal/token"
)

type InitiateRequest struct {
	UserRef     string `json:"user_ref"`
	PurposeCode string `json:"purpose_code"`
}

type ActivateRequest struct {
	ConsentID string `json:"consent_id"`
}

type ConsentResponse struct {
	ConsentID string `json:"consent_id"`
	Status    string `json:"status"`
}

func main() {
	dbURL := envOrDefault("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/zeyro?sslmode=disable")
	dbPool, err := postgres.NewPool(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer dbPool.Close()

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

	mux.HandleFunc("/v1/consent/initiate", middleware.RequirePASETOAuth(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			middleware.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
			return
		}

		payload := middleware.GetAuthPayload(r.Context())
		if payload == nil {
			middleware.WriteError(w, http.StatusUnauthorized, "unauthorized")
			return
		}

		var req InitiateRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			middleware.WriteError(w, http.StatusBadRequest, "invalid request body")
			return
		}

		userRefHash := crypto.SHA256Hex(req.UserRef)
		consent, err := consentRepo.CreateConsentArtifact(r.Context(), payload.PartnerID, userRefHash, req.PurposeCode)
		if err != nil {
			log.Printf("Failed to create consent: %v", err)
			middleware.WriteError(w, http.StatusInternalServerError, "failed to create consent")
			return
		}

		var idStr string
		idBytes, _ := consent.ID.MarshalJSON()
		json.Unmarshal(idBytes, &idStr) // Strip quotes

		middleware.WriteJSON(w, http.StatusCreated, ConsentResponse{
			ConsentID: idStr,
			Status:    consent.Status,
		})
	}))

	mux.HandleFunc("/v1/consent/activate", func(w http.ResponseWriter, r *http.Request) {
		// INSECURE ADMIN ENDPOINT FOR TESTING
		if r.Method != http.MethodPost {
			middleware.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
			return
		}

		var req ActivateRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			middleware.WriteError(w, http.StatusBadRequest, "invalid request body")
			return
		}

		if err := consentRepo.UpdateConsentStatus(r.Context(), req.ConsentID, "ACTIVE"); err != nil {
			log.Printf("Failed to activate consent: %v", err)
			middleware.WriteError(w, http.StatusInternalServerError, "failed to activate consent")
			return
		}

		middleware.WriteJSON(w, http.StatusOK, map[string]string{"status": "ACTIVE"})
	})

	addr := ":" + envOrDefault("CONSENT_PORT", "8005")
	log.Printf("consent-orchestration listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}

func envOrDefault(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
