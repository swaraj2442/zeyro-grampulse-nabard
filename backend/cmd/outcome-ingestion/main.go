package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5/pgtype"

	"github.com/arthazeyro/zeyro-b2b/internal/infra/postgres"
	"github.com/arthazeyro/zeyro-b2b/internal/middleware"
	postgresRepo "github.com/arthazeyro/zeyro-b2b/internal/repository/postgres"
	"github.com/arthazeyro/zeyro-b2b/internal/repository/postgres/gen"
	"github.com/arthazeyro/zeyro-b2b/internal/token"
)

type OutcomeRequest struct {
	AssessmentID  string  `json:"assessment_id"`
	OutcomeLabel  string  `json:"outcome_label"` // PAID_ON_TIME | DEFAULTED | PREPAID
	LoanAmountINR float64 `json:"loan_amount_inr"`
	LoanTenorDays int32   `json:"loan_tenor_days"`
	ProductType   string  `json:"product_type"`
}

func main() {
	dbURL := envOrDefault("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/zeyro?sslmode=disable")
	dbPool, err := postgres.NewPool(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer dbPool.Close()

	q := gen.New(dbPool)
	assessmentRepo := postgresRepo.NewAssessmentRepository(q)

	pubKeyHex := envOrDefault("ZEYRO_PASETO_PUBLIC_KEY", "e97ff8b1510a191fa86b7729730afebca3036bfcbe1fc7134a7475af5da3d7c2")
	if err := token.InitPasetoChecker(pubKeyHex); err != nil {
		log.Fatalf("Failed to init paseto checker: %v", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		middleware.WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	mux.HandleFunc("/v1/outcomes", middleware.RequirePASETOAuth(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			middleware.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
			return
		}
		handleCreateOutcome(w, r, q, assessmentRepo)
	}))

	port := envOrDefault("OUTCOME_INGESTION_PORT", "8024")
	log.Printf("outcome-ingestion listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}

func handleCreateOutcome(w http.ResponseWriter, r *http.Request, q *gen.Queries, assessmentRepo postgresRepo.AssessmentRepository) {
	payload := middleware.GetAuthPayload(r.Context())
	if payload == nil {
		middleware.WriteError(w, http.StatusUnauthorized, "invalid or missing credentials")
		return
	}

	var req OutcomeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.AssessmentID == "" || req.OutcomeLabel == "" {
		middleware.WriteError(w, http.StatusBadRequest, "assessment_id and outcome_label are required")
		return
	}

	// 1. Fetch the corresponding assessment
	assessment, err := assessmentRepo.GetAssessment(r.Context(), req.AssessmentID)
	if err != nil {
		middleware.WriteError(w, http.StatusNotFound, "assessment record not found")
		return
	}

	// 2. Parse response_json to extract BFS score and RPS label
	var respMap map[string]any
	if err := json.Unmarshal(assessment.ResponseJson, &respMap); err != nil {
		log.Printf("Failed to unmarshal assessment response_json: %v", err)
		middleware.WriteError(w, http.StatusInternalServerError, "internal data error")
		return
	}

	var cssScore int32
	if bfs, ok := respMap["bfs"].(map[string]any); ok {
		if score, ok := bfs["score"].(float64); ok {
			cssScore = int32(score)
		}
	}

	var rpsLabel string
	if rps, ok := respMap["rps"].(map[string]any); ok {
		if label, ok := rps["label"].(string); ok {
			rpsLabel = label
		}
	}

	// 3. Insert the outcome record using SQLC
	var aID pgtype.UUID
	aID.Scan(req.AssessmentID)

	var pID pgtype.UUID
	pID.Scan(payload.PartnerID)

	var cssScoreVal pgtype.Int4
	if cssScore > 0 {
		cssScoreVal = pgtype.Int4{Int32: cssScore, Valid: true}
	}

	var rpsLabelVal pgtype.Text
	if rpsLabel != "" {
		rpsLabelVal = pgtype.Text{String: rpsLabel, Valid: true}
	}

	var loanAmtVal pgtype.Numeric
	loanAmtVal.Scan(req.LoanAmountINR)

	var loanTenorVal pgtype.Int4
	if req.LoanTenorDays > 0 {
		loanTenorVal = pgtype.Int4{Int32: req.LoanTenorDays, Valid: true}
	}

	var prodTypeVal pgtype.Text
	if req.ProductType != "" {
		prodTypeVal = pgtype.Text{String: req.ProductType, Valid: true}
	}

	_, err = q.CreateOutcome(r.Context(), gen.CreateOutcomeParams{
		AssessmentID:  aID,
		PartnerID:     pID,
		UserRefHash:   assessment.UserRefHash,
		ScoreVersion:  assessment.ScoreVersion.String,
		CssScore:      cssScoreVal,
		RpsLabel:      rpsLabelVal,
		OutcomeLabel:  pgtype.Text{String: req.OutcomeLabel, Valid: true},
		LoanAmountInr: loanAmtVal,
		LoanTenorDays: loanTenorVal,
		ProductType:   prodTypeVal,
	})

	if err != nil {
		log.Printf("Failed to insert outcome into DB: %v", err)
		middleware.WriteError(w, http.StatusInternalServerError, "database error saving outcome")
		return
	}

	middleware.WriteJSON(w, http.StatusCreated, map[string]string{"status": "ACCEPTED"})
}

func envOrDefault(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
