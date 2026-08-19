package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/httprate"

	"github.com/arthazeyro/zeyro-b2b/internal/grampulse-app/config"
	"github.com/arthazeyro/zeyro-b2b/internal/grampulse-app/database"
	"github.com/arthazeyro/zeyro-b2b/internal/grampulse-app/handler"
	"github.com/arthazeyro/zeyro-b2b/internal/grampulse-app/repository"
	"github.com/arthazeyro/zeyro-b2b/internal/grampulse-app/service"
)

func main() {
	ctx := context.Background()

	cfg := config.Load()

	// Initialize SQLite Database
	sqliteDB, err := database.NewSQLiteDB("data/grampulse.db")
	if err != nil {
		log.Fatalf("[FATAL] Failed to initialize SQLite database: %v", err)
	}
	defer sqliteDB.Close()
	log.Println("[STARTUP] SQLite Database initialized successfully with WAL mode.")

	// Postgres for chat if configured
	db, err := database.NewDatabase(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Printf("WARNING: PostgreSQL not connected, using in-memory/sqlite fallback for chat. Error: %v", err)
	} else {
		defer db.Close()
	}

	chatRepo := repository.NewPostgresChatRepository(db)
	aiService := service.NewGroqAIService(cfg.GroqAPIKey, cfg.SarvamAPIKey, chatRepo)
	chatHandler := handler.NewChatHandler(aiService, chatRepo)

	// Enterprise Repository & Service
	enterpriseRepo := repository.NewSQLiteEnterpriseRepository(sqliteDB)
	enterpriseService := service.NewEnterpriseService(enterpriseRepo)
	enterpriseHandler := handler.NewEnterpriseHandler(enterpriseService)

	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))
	r.Use(middleware.RequestSize(1 << 20)) // 1 MB limit

	// Relax rate limiting for read APIs (120 req/min), strict for AI
	r.Use(httprate.LimitByIP(120, 1*time.Minute))

	// CORS Setup
	allowedOrigins := []string{
		"https://officergrampulse.netlify.app",
		"https://officergramwebapp.netlify.app",
		"https://grampulsewebapp.netlify.app",
		"https://grampulseenteprisewebapp.netlify.app",
		"https://enterpisegrampulsewebapp.netlify.app",
		"https://officergrampulsewebapp.netlify.app",
		"http://localhost:*",
		"http://127.0.0.1:*",
	}

	allowedOriginsStr := os.Getenv("FRONTEND_URL")
	if allowedOriginsStr != "" {
		for _, origin := range strings.Split(allowedOriginsStr, ",") {
			allowedOrigins = append(allowedOrigins, strings.TrimSpace(origin))
		}
	}

	log.Printf("[STARTUP] CORS allowed origins configured: %v", allowedOrigins)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"online","service":"GramPulse Backend","database":"SQLite active"}`))
	})

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"healthy","timestamp":"` + time.Now().UTC().Format(time.RFC3339) + `"}`))
	})

	// ─── Chat & Voice AI APIs ───────────────────────────────────────────────────
	r.Post("/api/chat", chatHandler.HandleChat)
	r.Post("/api/officer-chat", chatHandler.HandleOfficerChat)
	r.Get("/api/chat/history", chatHandler.GetHistory)
	r.Post("/api/tts", chatHandler.HandleTTS)
	r.Post("/api/stt", chatHandler.HandleSTT)
	r.Get("/api/stt/stream", chatHandler.HandleSTTStream)

	// ─── Enterprise & Intelligence REST APIs ────────────────────────────────────
	r.Route("/api", func(api chi.Router) {
		api.Get("/enterprises", enterpriseHandler.ListEnterprises)
		api.Get("/enterprises/{id}", enterpriseHandler.GetEnterprise)
		api.Get("/enterprises/{id}/all-screens", enterpriseHandler.GetAllSubscreens)
		api.Get("/enterprises/{id}/{screen}", enterpriseHandler.GetSubScreen)

		api.Get("/portfolio/summary", enterpriseHandler.GetPortfolioSummary)
		api.Get("/visits", enterpriseHandler.ListVisits)
		api.Get("/interventions", enterpriseHandler.ListInterventions)
		api.Get("/alerts", enterpriseHandler.ListAlerts)
		api.Get("/officer", enterpriseHandler.GetOfficer)
	})

	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		log.Printf("Starting GramPulse server with SQLite on port %s", cfg.Port)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("Server startup failed: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited properly")
}
