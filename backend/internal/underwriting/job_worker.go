package underwriting

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/arthazeyro/zeyro-b2b/internal/repository/postgres/gen"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"go.uber.org/zap"
)

type Worker struct {
	repo      *Repository
	logger    *zap.Logger
	workerID  string
	stopChan  chan struct{}
	sseBroker *SSEBroker
}

func NewWorker(repo *Repository, logger *zap.Logger, sseBroker *SSEBroker) *Worker {
	return &Worker{
		repo:      repo,
		logger:    logger,
		workerID:  fmt.Sprintf("worker-%s", uuid.New().String()[:8]),
		stopChan:  make(chan struct{}),
		sseBroker: sseBroker,
	}
}

func (w *Worker) Start(ctx context.Context) {
	w.logger.Info("starting processing job worker", zap.String("workerID", w.workerID))
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			w.logger.Info("stopping worker context done", zap.String("workerID", w.workerID))
			return
		case <-w.stopChan:
			w.logger.Info("stopping worker signal received", zap.String("workerID", w.workerID))
			return
		case <-ticker.C:
			w.processNextJob(ctx)
		}
	}
}

func (w *Worker) Stop() {
	close(w.stopChan)
}

func (w *Worker) processNextJob(ctx context.Context) {
	job, err := w.repo.Queries().ClaimProcessingJob(ctx, pgtype.Text{String: w.workerID, Valid: true})
	if err != nil {
		// No job available or error
		return
	}

	w.logger.Info("claimed job", zap.String("jobID", job.ID.String()), zap.String("jobType", job.JobType))

	// Execute job depending on type
	var jobErr error
	var result map[string]any

	switch job.JobType {
	case "aa_sync":
		result, jobErr = w.executeAASync(ctx, job)
	case "findoc_extraction":
		result, jobErr = w.executeFindocExtraction(ctx, job)
	default:
		result = map[string]any{"status": "completed"}
	}

	resultBytes, _ := json.Marshal(result)
	var status gen.JobStatus = gen.JobStatusCompleted
	var errStr pgtype.Text

	if jobErr != nil {
		status = gen.JobStatusFailed
		errStr = pgtype.Text{String: jobErr.Error(), Valid: true}
		w.logger.Error("job failed", zap.String("jobID", job.ID.String()), zap.Error(jobErr))
	}

	_, _ = w.repo.Queries().UpdateProcessingJobStatus(ctx, gen.UpdateProcessingJobStatusParams{
		ID:        job.ID,
		Status:    status,
		Result:    resultBytes,
		LastError: errStr,
	})

	// Publish Outbox Event for SSE stream
	eventPayload, _ := json.Marshal(map[string]any{
		"jobId":   job.ID,
		"jobType": job.JobType,
		"status":  status,
		"result":  result,
	})

	evt, err := w.repo.Queries().CreateOutboxEvent(ctx, gen.CreateOutboxEventParams{
		TenantID:      job.TenantID,
		ApplicationID: job.ApplicationID,
		AggregateType: "job",
		AggregateID:   job.ID.String(),
		EventType:     fmt.Sprintf("job.%s", status),
		Payload:       eventPayload,
	})

	if err == nil && w.sseBroker != nil {
		w.sseBroker.Broadcast(job.ApplicationID.Bytes, evt)
	}
}

func (w *Worker) executeAASync(ctx context.Context, job gen.ProcessingJob) (map[string]any, error) {
	// Simulate async Account Aggregator fetching
	time.Sleep(500 * time.Millisecond)
	return map[string]any{
		"averageMonthlyBalance": 215000.0,
		"nsfCount":              0,
		"monthsAnalyzed":        12,
		"status":                "synced",
	}, nil
}

func (w *Worker) executeFindocExtraction(ctx context.Context, job gen.ProcessingJob) (map[string]any, error) {
	time.Sleep(500 * time.Millisecond)
	return map[string]any{
		"extractedFieldsCount": 14,
		"confidenceScore":      97.5,
		"status":               "processed",
	}, nil
}

// SSEBroker handles SSE real-time streaming connections per application
type SSEBroker struct {
	mu          sync.RWMutex
	subscribers map[uuid.UUID][]chan *gen.OutboxEvent
}

func NewSSEBroker() *SSEBroker {
	return &SSEBroker{
		subscribers: make(map[uuid.UUID][]chan *gen.OutboxEvent),
	}
}

func (b *SSEBroker) Subscribe(appID uuid.UUID) chan *gen.OutboxEvent {
	b.mu.Lock()
	defer b.mu.Unlock()

	ch := make(chan *gen.OutboxEvent, 10)
	b.subscribers[appID] = append(b.subscribers[appID], ch)
	return ch
}

func (b *SSEBroker) Unsubscribe(appID uuid.UUID, ch chan *gen.OutboxEvent) {
	b.mu.Lock()
	defer b.mu.Unlock()

	subs := b.subscribers[appID]
	for i, sub := range subs {
		if sub == ch {
			b.subscribers[appID] = append(subs[:i], subs[i+1:]...)
			close(ch)
			break
		}
	}
}

func (b *SSEBroker) Broadcast(appID uuid.UUID, evt gen.OutboxEvent) {
	b.mu.RLock()
	defer b.mu.RUnlock()

	for _, ch := range b.subscribers[appID] {
		select {
		case ch <- &evt:
		default:
		}
	}
}

func (b *SSEBroker) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	appIDStr := r.URL.Query().Get("applicationId")
	appID, err := uuid.Parse(appIDStr)
	if err != nil {
		http.Error(w, "invalid applicationId", http.StatusBadRequest)
		return
	}

	ch := b.Subscribe(appID)
	defer b.Unsubscribe(appID, ch)

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming unsupported", http.StatusInternalServerError)
		return
	}

	// Send initial connection event
	fmt.Fprintf(w, "event: connected\ndata: {\"status\": \"connected\", \"applicationId\": \"%s\"}\n\n", appID)
	flusher.Flush()

	ticker := time.NewTicker(20 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-r.Context().Done():
			return
		case <-ticker.C:
			// 20s heartbeat
			fmt.Fprintf(w, ": heartbeat\n\n")
			flusher.Flush()
		case evt := <-ch:
			fmt.Fprintf(w, "id: %d\nevent: %s\ndata: %s\n\n", evt.SequenceNumber.Int64, evt.EventType, string(evt.Payload))
			flusher.Flush()
		}
	}
}
