package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	"github.com/arthazeyro/zeyro-b2b/internal/crypto"
	"github.com/arthazeyro/zeyro-b2b/internal/infra/postgres"
	"github.com/arthazeyro/zeyro-b2b/internal/middleware"
	postgresRepo "github.com/arthazeyro/zeyro-b2b/internal/repository/postgres"
	"github.com/arthazeyro/zeyro-b2b/internal/repository/postgres/gen"
	"github.com/arthazeyro/zeyro-b2b/internal/token"
	assessmentpb "github.com/arthazeyro/zeyro-b2b/proto/assessment"
)

type AssessmentRequest struct {
	UserMobile string   `json:"user_mobile"`
	Products   []string `json:"products"`
	ConsentID  string   `json:"consent_id"`
	Context    struct {
		LoanAmountINR float64 `json:"loan_amount_inr"`
		LoanTenorDays int     `json:"loan_tenor_days"`
	} `json:"context"`
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
	assessmentRepo := postgresRepo.NewAssessmentRepository(q)

	pubKeyHex := envOrDefault("ZEYRO_PASETO_PUBLIC_KEY", "e97ff8b1510a191fa86b7729730afebca3036bfcbe1fc7134a7475af5da3d7c2")
	if err := token.InitPasetoChecker(pubKeyHex); err != nil {
		log.Fatalf("Failed to init paseto checker: %v", err)
	}

	orchestratorAddr := envOrDefault("ORCHESTRATOR_ADDR", "localhost:8012")

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		middleware.WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	// POST /v1/assessments
	mux.HandleFunc("/v1/assessments", middleware.RequirePASETOAuth(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			middleware.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
			return
		}
		handleCreateAssessment(w, r, consentRepo, assessmentRepo, orchestratorAddr)
	}))

	// GET /v1/assessments/{id}
	mux.HandleFunc("/v1/assessments/", middleware.RequirePASETOAuth(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			middleware.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
			return
		}
		handleGetAssessment(w, r, assessmentRepo)
	}))

	// GET /v1/insights/{user_ref}
	mux.HandleFunc("/v1/insights/", middleware.RequirePASETOAuth(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			middleware.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
			return
		}
		handleGetInsights(w, r, q)
	}))

	port := envOrDefault("REPORT_SERVICE_PORT", "8020")
	log.Printf("report-service listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}

func handleCreateAssessment(w http.ResponseWriter, r *http.Request, consentRepo postgresRepo.ConsentRepository, assessmentRepo postgresRepo.AssessmentRepository, orchestratorAddr string) {
	payload := middleware.GetAuthPayload(r.Context())
	if payload == nil {
		middleware.WriteError(w, http.StatusUnauthorized, "invalid or missing credentials")
		return
	}

	var req AssessmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.UserMobile == "" {
		middleware.WriteError(w, http.StatusBadRequest, "user_mobile is required")
		return
	}

	if len(req.Products) == 0 {
		req.Products = []string{"bfs", "fraud", "atp"}
	}

	userRefHash := crypto.SHA256Hex(req.UserMobile)

	// Check Consent status
	consent, err := consentRepo.GetConsentByUserAndPurpose(r.Context(), payload.PartnerID, userRefHash, "DATA_INGESTION")
	if err != nil || consent.Status != "ACTIVE" {
		log.Printf("Consent verification failed for user %s: err=%v", userRefHash, err)
		middleware.WriteError(w, http.StatusForbidden, "active consent required for assessment")
		return
	}

	var consentIDStr string
	cIDBytes, _ := consent.ID.MarshalJSON()
	json.Unmarshal(cIDBytes, &consentIDStr)

	// 1. Create a PENDING assessment record in DB
	aID := uuid.New().String()
	scoreVer := "scorecard_v1"

	_, err = assessmentRepo.CreateAssessment(
		r.Context(),
		aID,
		payload.PartnerID,
		consentIDStr,
		"", // partner_ref_id
		userRefHash,
		"PENDING",
		req.Products,
		scoreVer,
	)
	if err != nil {
		log.Printf("Failed to create assessment in database: %v", err)
		middleware.WriteError(w, http.StatusInternalServerError, "database error")
		return
	}

	// 2. Call Python Agent Orchestrator gRPC server
	log.Printf("Calling orchestrator gRPC at %s for assessment %s", orchestratorAddr, aID)
	conn, err := grpc.Dial(orchestratorAddr, grpc.WithTransportCredentials(insecure.NewCredentials()), grpc.WithBlock(), grpc.WithTimeout(5*time.Second))
	if err != nil {
		log.Printf("Failed to connect to orchestrator gRPC: %v", err)
		middleware.WriteError(w, http.StatusServiceUnavailable, "risk engine unavailable")
		return
	}
	defer conn.Close()

	client := assessmentpb.NewAssessmentServiceClient(conn)
	grpcCtx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	resp, err := client.CreateAssessment(grpcCtx, &assessmentpb.AssessmentRequest{
		AssessmentId: aID,
		PartnerId:    payload.PartnerID,
		UserRefHash:  userRefHash,
		Products:     req.Products,
		ConsentId:    consentIDStr,
	})

	if err != nil {
		log.Printf("Orchestrator assessment gRPC call failed: %v", err)
		middleware.WriteError(w, http.StatusInternalServerError, "assessment computation failed")
		return
	}

	log.Printf("Assessment computation completed with status: %s, signal: %s", resp.Status, resp.OverallSignal)

	// 3. Query the completed assessment JSON from DB and return it to user
	completedAssessment, err := assessmentRepo.GetAssessment(r.Context(), aID)
	if err != nil {
		log.Printf("Failed to fetch final assessment record: %v", err)
		middleware.WriteError(w, http.StatusInternalServerError, "database error retrieving result")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(completedAssessment.ResponseJson)
}

func handleGetAssessment(w http.ResponseWriter, r *http.Request, assessmentRepo postgresRepo.AssessmentRepository) {
	// Extract assessment ID from URL
	parts := strings.Split(r.URL.Path, "/v1/assessments/")
	if len(parts) < 2 || parts[1] == "" {
		middleware.WriteError(w, http.StatusBadRequest, "assessment id is required")
		return
	}
	aID := parts[1]

	assessment, err := assessmentRepo.GetAssessment(r.Context(), aID)
	if err != nil {
		middleware.WriteError(w, http.StatusNotFound, "assessment not found")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(assessment.ResponseJson)
}

func handleGetInsights(w http.ResponseWriter, r *http.Request, q *gen.Queries) {
	// Extract user_ref from URL
	parts := strings.Split(r.URL.Path, "/v1/insights/")
	if len(parts) < 2 || parts[1] == "" {
		middleware.WriteError(w, http.StatusBadRequest, "user_ref or user_ref_hash is required")
		return
	}
	userRef := parts[1]

	// If it is not a 64-char hex string (SHA256), hash it
	userRefHash := userRef
	if len(userRef) != 64 {
		userRefHash = crypto.SHA256Hex(userRef)
	}

	rows, err := q.GetFeatures(r.Context(), gen.GetFeaturesParams{
		UserRefHash:   userRefHash,
		FeatureWindow: "90d",
		FeatureGroups: []string{"income", "expense", "emi", "cashflow", "savings", "behavior", "network", "volatility", "temporal", "quality"},
	})
	if err != nil {
		log.Printf("Failed to retrieve insights from DB: %v", err)
		middleware.WriteError(w, http.StatusInternalServerError, "database error retrieving insights")
		return
	}

	insights := make(map[string]map[string]any)
	for _, row := range rows {
		if _, exists := insights[row.FeatureGroup]; !exists {
			insights[row.FeatureGroup] = make(map[string]any)
		}
		var val any
		json.Unmarshal(row.FeatureValueJson, &val)
		insights[row.FeatureGroup][row.FeatureName] = val
	}

	middleware.WriteJSON(w, http.StatusOK, insights)
}

func envOrDefault(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
