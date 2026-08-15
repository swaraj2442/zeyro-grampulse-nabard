package main

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/joho/godotenv"
	"go.uber.org/zap"

	"github.com/arthazeyro/zeyro-b2b/internal/grampulse"
)

func main() {
	_ = godotenv.Load() // Ignore error if .env file does not exist

	// ── Logger ────────────────────────────────────────────────────────────────
	logger, _ := zap.NewProduction()
	defer logger.Sync()

	// ── Config from env ───────────────────────────────────────────────────────
	mlServiceURL := envOr("ML_SERVICE_URL", "http://127.0.0.1:8001")
	dbPath := envOr("GRAMPULSE_DB", "api/grampulse.db")
	csvPath := envOr("SYNTHETIC_CSV", "data/nabard_enterprise_monthly.csv")
	agmarknetAPIKey := envOr("DATA_GOV_API_KEY", "")
	agmarknetCSV := envOr("AGMARKNET_CSV", "data/agmarknet_fallback.csv")
	port := envOr("PORT", "8000")
	allowedOrigins := strings.Split(envOr("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"), ",")
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET is required")
	}

	masterKeyB64 := os.Getenv("MASTER_KEY")
	groqKeyEnc := os.Getenv("GROQ_API_KEY_ENC")
	sarvamKeyEnc := os.Getenv("SARVAM_API_KEY_ENC")

	var groqAPIKey, sarvamAPIKey string
	if masterKeyB64 != "" {
		masterKey, err := base64.StdEncoding.DecodeString(masterKeyB64)
		if err == nil && len(masterKey) == 32 {
			if groqKeyEnc != "" {
				groqAPIKey = decrypt(masterKey, groqKeyEnc)
			}
			if sarvamKeyEnc != "" {
				sarvamAPIKey = decrypt(masterKey, sarvamKeyEnc)
			}
		} else {
			log.Println("WARNING: Invalid MASTER_KEY format")
		}
	} else {
		// Fallback to unencrypted for local dev if desired
		groqAPIKey = envOr("GROQ_API_KEY", "")
		sarvamAPIKey = envOr("SARVAM_API_KEY", "")
	}

	if groqAPIKey == "" {
		log.Println("WARNING: GROQ_API_KEY is not set. Chat calls will fail.")
	}
	if sarvamAPIKey == "" {
		log.Println("WARNING: SARVAM_API_KEY is not set. Voice calls will fail.")
	}

	// ── Resolve paths relative to project root ────────────────────────────────
	// The binary is run from the project root (z-b2b/)
	wd, _ := os.Getwd()
	if !filepath.IsAbs(dbPath) {
		dbPath = filepath.Join(wd, dbPath)
	}
	if !filepath.IsAbs(csvPath) {
		csvPath = filepath.Join(wd, csvPath)
	}
	if !filepath.IsAbs(agmarknetCSV) {
		agmarknetCSV = filepath.Join(wd, agmarknetCSV)
	}

	logger.Info("starting GramPulse API gateway",
		zap.String("port", port),
		zap.String("mlService", mlServiceURL),
		zap.String("db", dbPath),
	)

	// ── Synthetic store ───────────────────────────────────────────────────────
	store := grampulse.NewSyntheticStore()
	if err := store.Load(csvPath); err != nil {
		logger.Warn("synthetic CSV not found — enterprise list will be empty", zap.Error(err))
	} else {
		logger.Info("synthetic store loaded", zap.Int("entities", len(store.GetAllEntityIDs())))
	}

	// ── SQLite repo ───────────────────────────────────────────────────────────
	repo, err := grampulse.NewRepository(dbPath)
	if err != nil {
		log.Fatalf("cannot open SQLite: %v", err)
	}
	defer repo.Close()

	// ── Clients ───────────────────────────────────────────────────────────────
	mlClient := grampulse.NewMLClient(mlServiceURL)
	weatherClient := grampulse.NewWeatherClient(repo)
	marketClient := grampulse.NewMarketClient(repo, agmarknetCSV, agmarknetAPIKey)
	agmarknetClient := grampulse.NewAgmarknetClient(repo)

	// ── Service + Handler ─────────────────────────────────────────────────────
	svc := grampulse.NewService(store, repo, mlClient, weatherClient, marketClient, agmarknetClient, logger)
	batchScorer := grampulse.NewBatchScorer(store, repo, mlClient, marketClient, weatherClient, logger)
	handler := grampulse.NewHandler(svc, batchScorer, logger)

	// ── Chat / Copilot ────────────────────────────────────────────────────────
	chatRepo := grampulse.NewSQLiteChatRepository(repo.DB())
	aiService := grampulse.NewGroqAIService(groqAPIKey, sarvamAPIKey, chatRepo)
	chatHandler := grampulse.NewChatHandler(aiService, chatRepo)

	// ── HTTP mux ──────────────────────────────────────────────────────────────
	mux := http.NewServeMux()
	handler.RegisterRoutes(mux)

	// Register Chat Routes
	mux.HandleFunc("POST /api/v1/copilot/chat", chatHandler.HandleOfficerChat)
	mux.HandleFunc("POST /api/v1/chat/tts", chatHandler.HandleTTS)
	mux.HandleFunc("POST /api/v1/chat/stt", chatHandler.HandleSTT)
	mux.HandleFunc("GET /api/v1/chat/stt/stream", chatHandler.HandleSTTStream)
	mux.HandleFunc("GET /api/v1/chat/history", chatHandler.GetHistory)

	// Middlewares (executed bottom-to-top)
	var httpHandler http.Handler = mux
	httpHandler = grampulse.AuthMiddleware(jwtSecret)(httpHandler)
	httpHandler = corsMiddleware(allowedOrigins, httpHandler)
	httpHandler = grampulse.LoggerMiddleware(logger)(httpHandler)
	httpHandler = grampulse.RecoveryMiddleware(logger)(httpHandler)
	httpHandler = grampulse.RequestIDMiddleware(httpHandler)

	// ── Startup batch scoring (background, non-blocking) ─────────────────────
	// Only start if ML service is reachable
	ctx := context.Background()
	if mlHealth, err := mlClient.Health(ctx); err == nil && mlHealth.Ready {
		logger.Info("ML service ready — starting background batch scorer")
		batchScorer.Start(ctx)
	} else {
		logger.Warn("ML service not ready at startup — batch scorer deferred", zap.Error(err))
	}

	// ── Startup weather refresh (background, non-blocking) ────────────────────
	logger.Info("Starting background weather refresh job")
	grampulse.StartWeatherRefreshJob(ctx, weatherClient)

	// ── Startup AGMARKNET refresh (background, non-blocking) ──────────────────
	logger.Info("Starting background AGMARKNET refresh job")
	grampulse.StartAgmarknetRefreshJob(ctx, agmarknetClient, agmarknetAPIKey)

	// ── Listen ────────────────────────────────────────────────────────────────
	addr := ":" + port
	logger.Info("GramPulse API gateway listening", zap.String("addr", addr))
	if err := http.ListenAndServe(addr, httpHandler); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}

// corsMiddleware adds CORS headers for the allowlisted frontend origins.
func corsMiddleware(allowed []string, next http.Handler) http.Handler {
	allowedSet := make(map[string]bool, len(allowed))
	for _, o := range allowed {
		allowedSet[strings.TrimSpace(o)] = true
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if allowedSet[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func envOr(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func decrypt(key []byte, cryptoText string) string {
	ciphertext, _ := base64.StdEncoding.DecodeString(cryptoText)
	if len(ciphertext) < 12 {
		return ""
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return ""
	}
	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return ""
	}
	nonce := ciphertext[:12]
	ciphertext = ciphertext[12:]
	plaintext, err := aesgcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return ""
	}
	return string(plaintext)
}

// Silence unused import warning if uuid isn't used directly here
var _ = fmt.Sprintf
