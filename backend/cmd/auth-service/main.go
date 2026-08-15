package main

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/arthazeyro/zeyro-b2b/internal/domain"
	"github.com/arthazeyro/zeyro-b2b/internal/middleware"
	"github.com/arthazeyro/zeyro-b2b/internal/repository/postgres/gen"
	"github.com/arthazeyro/zeyro-b2b/internal/token"
	"github.com/arthazeyro/zeyro-b2b/internal/underwriting"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

type Server struct {
	queries *gen.Queries
	maker   token.Maker
	zlog    *zap.Logger
}

func main() {
	// Try loading .env from multiple paths: current dir (project root) and
	// two levels up (when running via `go run` from cmd/auth-service/).
	for _, path := range []string{".env", "../../.env"} {
		if err := godotenv.Load(path); err == nil {
			break
		}
	}

	zlog, _ := zap.NewProduction()
	defer zlog.Sync()

	ctx := context.Background()

	// Initialize DB Pool
	dbURL := envOrDefault("DATABASE_URL", "postgres://zeyro:zeyro@localhost:5432/zeyro?sslmode=disable")
	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		zlog.Fatal("failed to connect to database", zap.Error(err))
	}
	defer pool.Close()

	queries := gen.New(pool)

	secretHex := envOrDefault("ZEYRO_PASETO_SECRET_KEY", "f37465fc64c6f99ae2e67754b5991112694c646be16995f49a615691b81b9c9de97ff8b1510a191fa86b7729730afebca3036bfcbe1fc7134a7475af5da3d7c2")
	maker, err := token.NewPasetoMaker(secretHex)
	if err != nil {
		zlog.Fatal("failed to init paseto maker", zap.Error(err))
	}

	server := &Server{
		queries: queries,
		maker:   maker,
		zlog:    zlog,
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		middleware.WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	mux.HandleFunc("/auth/token", server.handleToken)
	mux.HandleFunc("/v1/token", server.handleToken)
	mux.HandleFunc("/auth/supabase-exchange", server.handleSupabaseExchange)

	mux.HandleFunc("/api/user/profile", server.handleUserProfile)
	mux.HandleFunc("/api/workspaces", server.handleWorkspaces)
	mux.HandleFunc("/api/intelligence-modules", server.handleIntelligenceModules)
	mux.HandleFunc("/api/home", server.handleHomeDashboard)
	mux.HandleFunc("/api/chat", server.handleChat)

	// Underwriting Agent Workspace Service
	underwritingRepo := underwriting.NewRepository(pool)
	underwritingService := underwriting.NewService(underwritingRepo, zlog)
	
	sseBroker := underwriting.NewSSEBroker()
	mockAA := underwriting.NewMockAAProvider()
	docService := underwriting.NewDocumentService(underwritingRepo, mockAA, zlog)
	bfsService := underwriting.NewBFSService(underwritingRepo, zlog)

	worker := underwriting.NewWorker(underwritingRepo, zlog, sseBroker)
	go worker.Start(ctx)

	underwritingHandler := underwriting.NewHandler(underwritingService, docService, bfsService, sseBroker, zlog)
	underwritingHandler.RegisterRoutes(mux)

	addr := ":" + envOrDefault("AUTH_SERVICE_PORT", "8000")
	zlog.Info("auth-service listening", zap.String("address", addr))

	if err := http.ListenAndServe(addr, mux); err != nil {
		zlog.Fatal("auth-service failed", zap.Error(err))
	}
}

func (s *Server) handleToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		middleware.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var req domain.TokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	expectedAPIKey := envOrDefault("ZEYRO_STATIC_API_KEY", "dev-api-key")
	if req.APIKey == "" || req.APIKey != expectedAPIKey {
		middleware.WriteError(w, http.StatusUnauthorized, "invalid api key")
		return
	}

	partnerID := envOrDefault("ZEYRO_STATIC_PARTNER_ID", "00000000-0000-0000-0000-000000000001")
	scopes := splitCSV(envOrDefault("ZEYRO_STATIC_SCOPES", "credit,fraud,outcomes"))
	duration := 1 * time.Hour

	payload := &token.Payload{
		PartnerID: partnerID,
		Scopes:    scopes,
	}

	tokenStr, err := s.maker.CreateToken(payload, duration)
	if err != nil {
		s.zlog.Error("failed to create token", zap.Error(err))
		middleware.WriteError(w, http.StatusInternalServerError, "failed to issue token")
		return
	}

	resp := domain.TokenResponse{
		AccessToken: tokenStr,
		TokenType:   "Bearer",
		ExpiresIn:   int64(duration.Seconds()),
		PartnerID:   partnerID,
		Scopes:      scopes,
	}
	middleware.WriteJSON(w, http.StatusOK, resp)
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}

func envOrDefault(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

type UserDetails struct {
	FullName    string `json:"full_name"`
	Role        string `json:"role"`
	CompanyName string `json:"company_name"`
}

func (s *Server) handleSupabaseExchange(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		middleware.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var req struct {
		AccessToken string       `json:"access_token"`
		UserDetails *UserDetails `json:"user_details,omitempty"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	supabaseSecret := os.Getenv("SUPABASE_JWT_SECRET")
	if supabaseSecret == "" {
		// Use a dummy secret for local testing if not set
		supabaseSecret = envOrDefault("SUPABASE_JWT_SECRET_DEV", "super-secret-jwt-token-with-at-least-32-characters-long")
	}

	s.zlog.Info("supabase secret loaded", zap.Bool("is_set", os.Getenv("SUPABASE_JWT_SECRET") != ""))

	// Supabase signs JWTs with the raw UTF-8 bytes of the JWT secret string.
	jwtToken, err := jwt.Parse(req.AccessToken, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(supabaseSecret), nil
	})

	if err != nil || !jwtToken.Valid {
		s.zlog.Warn("failed to verify supabase token", zap.Error(err))
		middleware.WriteError(w, http.StatusUnauthorized, "invalid supabase token")
		return
	}

	claims, ok := jwtToken.Claims.(jwt.MapClaims)
	if !ok {
		middleware.WriteError(w, http.StatusUnauthorized, "invalid token claims")
		return
	}

	sub, _ := claims["sub"].(string)
	email, _ := claims["email"].(string)

	userID, err := uuid.Parse(sub)
	if err != nil {
		s.zlog.Error("failed to parse sub to uuid", zap.Error(err))
		middleware.WriteError(w, http.StatusUnauthorized, "invalid user id format")
		return
	}

	ctx := r.Context()

	// If user details are provided (e.g. sign up flow)
	if req.UserDetails != nil {
		// Upsert User
		_, err := s.queries.UpsertUser(ctx, gen.UpsertUserParams{
			ID:          pgtype.UUID{Bytes: userID, Valid: true},
			Email:       email,
			FullName:    pgtype.Text{String: req.UserDetails.FullName, Valid: true},
			Role:        pgtype.Text{String: req.UserDetails.Role, Valid: true},
			CompanyName: pgtype.Text{String: req.UserDetails.CompanyName, Valid: true},
		})
		if err != nil {
			s.zlog.Error("failed to upsert user", zap.Error(err))
		} else {
			// Create default workspace
			workspace, err := s.queries.CreateWorkspace(ctx, gen.CreateWorkspaceParams{
				Name: "Zeyro Sandbox",
				Type: "sandbox",
			})
			if err == nil {
				// Add user to workspace
				_ = s.queries.AddWorkspaceMember(ctx, gen.AddWorkspaceMemberParams{
					WorkspaceID: workspace.ID,
					UserID:      pgtype.UUID{Bytes: userID, Valid: true},
					Role:        "admin",
					IsDefault:   pgtype.Bool{Bool: true, Valid: true},
				})
			}
		}
	}

	// Issue a PASETO token for the frontend
	duration := 24 * time.Hour
	payload := &token.Payload{
		PartnerID: sub,
		Scopes:    []string{"user"},
	}

	tokenStr, err := s.maker.CreateToken(payload, duration)
	if err != nil {
		s.zlog.Error("failed to create paseto token", zap.Error(err))
		middleware.WriteError(w, http.StatusInternalServerError, "failed to issue paseto token")
		return
	}

	resp := domain.TokenResponse{
		AccessToken: tokenStr,
		TokenType:   "Bearer",
		ExpiresIn:   int64(duration.Seconds()),
		PartnerID:   sub,
		Scopes:      payload.Scopes,
	}
	middleware.WriteJSON(w, http.StatusOK, resp)
}

func (s *Server) extractUserID(r *http.Request) (uuid.UUID, error) {
	authHeader := r.Header.Get("Authorization")
	if !strings.HasPrefix(authHeader, "Bearer ") {
		return uuid.Nil, http.ErrNoCookie // Just a generic error for missing token
	}
	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

	payload, err := s.maker.VerifyToken(tokenStr)
	if err != nil {
		return uuid.Nil, err
	}

	userID, err := uuid.Parse(payload.PartnerID)
	if err != nil {
		return uuid.Nil, err
	}

	return userID, nil
}

func (s *Server) handleUserProfile(w http.ResponseWriter, r *http.Request) {
	middleware.SetCORS(w)
	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Methods", "GET, PUT")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodGet && r.Method != http.MethodPut {
		middleware.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID, err := s.extractUserID(r)
	if err != nil {
		middleware.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	ctx := r.Context()
	
	if r.Method == http.MethodPut {
		var req struct {
			FullName    string `json:"full_name"`
			Role        string `json:"role"`
			CompanyName string `json:"company_name"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			middleware.WriteError(w, http.StatusBadRequest, "invalid request body")
			return
		}
		
		// Get existing user to preserve email
		user, err := s.queries.GetUser(ctx, pgtype.UUID{Bytes: userID, Valid: true})
		if err != nil {
			s.zlog.Error("failed to get user for update", zap.Error(err))
			middleware.WriteError(w, http.StatusInternalServerError, "user not found")
			return
		}
		
		// Update user via Upsert
		_, err = s.queries.UpsertUser(ctx, gen.UpsertUserParams{
			ID:          pgtype.UUID{Bytes: userID, Valid: true},
			Email:       user.Email,
			FullName:    pgtype.Text{String: req.FullName, Valid: true},
			Role:        pgtype.Text{String: req.Role, Valid: true},
			CompanyName: pgtype.Text{String: req.CompanyName, Valid: true},
		})
		
		if err != nil {
			s.zlog.Error("failed to update user profile", zap.Error(err))
			middleware.WriteError(w, http.StatusInternalServerError, "failed to update profile")
			return
		}
	}

	user, err := s.queries.GetUser(ctx, pgtype.UUID{Bytes: userID, Valid: true})
	if err != nil {
		s.zlog.Error("failed to get user", zap.Error(err))
		middleware.WriteError(w, http.StatusInternalServerError, "failed to fetch user profile")
		return
	}

	resp := map[string]interface{}{
		"id":           user.ID,
		"email":        user.Email,
		"full_name":    user.FullName.String,
		"role":         user.Role.String,
		"company_name": user.CompanyName.String,
		"created_at":   user.CreatedAt.Time,
	}

	middleware.WriteJSON(w, http.StatusOK, resp)
}

func (s *Server) handleWorkspaces(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		middleware.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID, err := s.extractUserID(r)
	if err != nil {
		middleware.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	ctx := r.Context()
	userWorkspaces, err := s.queries.GetUserWorkspaces(ctx, pgtype.UUID{Bytes: userID, Valid: true})
	if err != nil {
		s.zlog.Error("failed to get workspaces", zap.Error(err))
		middleware.WriteError(w, http.StatusInternalServerError, "failed to fetch workspaces")
		return
	}

	var respWorkspaces []map[string]interface{}
	for _, w := range userWorkspaces {
		respWorkspaces = append(respWorkspaces, map[string]interface{}{
			"id":         w.ID,
			"name":       w.Name,
			"type":       w.Type,
			"created_at": w.CreatedAt.Time,
			"is_default": w.IsDefault.Bool,
		})
	}

	middleware.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"workspaces": respWorkspaces,
	})
}

func (s *Server) handleIntelligenceModules(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Methods", "GET")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodGet {
		middleware.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	modules, err := s.queries.ListIntelligenceModules(r.Context())
	if err != nil {
		s.zlog.Error("failed to list intelligence modules", zap.Error(err))
		middleware.WriteError(w, http.StatusInternalServerError, "failed to fetch intelligence modules")
		return
	}

	var respModules []map[string]interface{}
	for _, m := range modules {
		respModules = append(respModules, map[string]interface{}{
			"id":          m.ID,
			"name":        m.Name,
			"description": m.Description.String,
			"is_active":   m.IsActive.Bool,
		})
	}

	middleware.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"modules": respModules,
	})
}

func (s *Server) handleHomeDashboard(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Methods", "GET")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodGet {
		middleware.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	ctx := r.Context()
	
	// Fast track sandbox ID for demo purposes
	var workspaceID pgtype.UUID
	
	ws, err := s.queries.ListWorkspaces(ctx) // getting any workspace for now
	if err == nil && len(ws) > 0 {
		workspaceID = ws[0].ID
	} else {
		workspaceID = pgtype.UUID{Valid: true}
	}
	
	banner, _ := s.queries.GetHomeBanner(ctx, workspaceID)
	tasks, _ := s.queries.GetHomeTasks(ctx, workspaceID)
	steps, _ := s.queries.GetRecommendedSteps(ctx, workspaceID)
	
	middleware.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"banner": map[string]interface{}{
			"id": banner.ID,
			"title": banner.Title,
			"subtitle": banner.Subtitle.String,
			"completion_percentage": banner.CompletionPercentage.Int32,
			"hero_image_url": banner.HeroImageUrl.String,
		},
		"tasks":  tasks,
		"steps":  steps,
	})
}

func (s *Server) handleChat(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		middleware.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var req struct {
		Message string `json:"message"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid request")
		return
	}

	mockResponse := "I'm Zeyro Copilot! I received your message: " + req.Message + ". I'm ready to assist you with your financial intelligence workflow!"

	middleware.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"response": mockResponse,
		"status":   "success",
	})
}
