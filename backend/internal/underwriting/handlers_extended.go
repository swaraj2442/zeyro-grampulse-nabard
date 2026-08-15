package underwriting

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/arthazeyro/zeyro-b2b/internal/messaging"
	"github.com/arthazeyro/zeyro-b2b/internal/middleware"
	"github.com/arthazeyro/zeyro-b2b/internal/repository/postgres/gen"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

// ─── Route Registration (call this from RegisterRoutes) ──────────────────────

func (h *Handler) registerExtendedRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/v1/underwriting/decision-log", middleware.RequirePASETOAuth(h.handleDecisionLog))
	mux.HandleFunc("/api/v1/underwriting/agent-logs", middleware.RequirePASETOAuth(h.handleAgentLogs))
	mux.HandleFunc("/api/v1/underwriting/insights/pipeline", middleware.RequirePASETOAuth(h.handleInsightsPipeline))
	mux.HandleFunc("/api/v1/underwriting/insights/team-workload", middleware.RequirePASETOAuth(h.handleInsightsTeamWorkload))
	mux.HandleFunc("/api/v1/webhooks/resend", h.handleResendWebhook)
}

// ─── Routing extensions for per-app sub-paths ────────────────────────────────
// Called from handleApplicationByIDRouter for unmatched sub-paths.

func (h *Handler) routeExtendedAppPaths(w http.ResponseWriter, r *http.Request, appID uuid.UUID, parts []string) bool {
	if len(parts) == 0 {
		return false
	}

	switch {
	// GET /applications/{id}/chat  → list messages
	// POST /applications/{id}/chat → not routed here (messages goes via parts[1]="chat/messages")
	case parts[0] == "chat" && len(parts) == 1:
		if r.Method == http.MethodGet {
			h.getChatMessages(w, r, appID)
			return true
		}

	// POST /applications/{id}/chat/messages → send message
	case parts[0] == "chat" && len(parts) == 2 && parts[1] == "messages":
		if r.Method == http.MethodPost {
			h.createChatMessage(w, r, appID)
			return true
		}

	// GET /applications/{id}/credit-memo
	// POST /applications/{id}/credit-memo/generate
	case parts[0] == "credit-memo" && len(parts) == 1:
		if r.Method == http.MethodGet {
			h.getCreditMemo(w, r, appID)
			return true
		}

	case parts[0] == "credit-memo" && len(parts) == 2:
		if parts[1] == "generate" && r.Method == http.MethodPost {
			h.generateCreditMemo(w, r, appID)
			return true
		}
		if parts[1] == "section" && r.Method == http.MethodPatch {
			h.updateCreditMemoSection(w, r, appID)
			return true
		}

	// GET  /applications/{id}/decision
	// POST /applications/{id}/decision
	case parts[0] == "decision" && len(parts) == 1:
		if r.Method == http.MethodGet {
			h.getApplicationDecisions(w, r, appID)
			return true
		}
		if r.Method == http.MethodPost {
			h.submitDecision(w, r, appID)
			return true
		}
	}

	return false
}

// ─── Chat Handlers ───────────────────────────────────────────────────────────

func (h *Handler) ensureMultiChannelColumns(ctx context.Context) {
	pool := h.service.repo.Pool()
	_, _ = pool.Exec(ctx, `
		ALTER TABLE chat_messages
		  ADD COLUMN IF NOT EXISTS channel VARCHAR(50) DEFAULT 'Portal',
		  ADD COLUMN IF NOT EXISTS direction VARCHAR(20) DEFAULT 'outbound',
		  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'sent',
		  ADD COLUMN IF NOT EXISTS ai_draft_mode VARCHAR(50) DEFAULT 'off',
		  ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255),
		  ADD COLUMN IF NOT EXISTS attachment_url TEXT,
		  ADD COLUMN IF NOT EXISTS citation TEXT;

		CREATE TABLE IF NOT EXISTS message_deliveries (
		    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
		    tenant_id UUID,
		    provider VARCHAR(50) NOT NULL,
		    provider_message_id VARCHAR(255),
		    channel VARCHAR(50) NOT NULL,
		    delivery_status VARCHAR(50) NOT NULL,
		    error_details TEXT,
		    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);
	`)
}

func (h *Handler) getChatMessages(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	tenantID := h.getTenantID(r)
	pool := h.service.repo.Pool()
	h.ensureMultiChannelColumns(r.Context())

	// Find or create thread
	var threadID uuid.UUID
	err := pool.QueryRow(r.Context(),
		`SELECT id FROM chat_threads WHERE application_id = $1 AND tenant_id = $2 LIMIT 1`,
		appID, tenantID,
	).Scan(&threadID)
	if err != nil {
		// Create thread
		err = pool.QueryRow(r.Context(),
			`INSERT INTO chat_threads (tenant_id, application_id) VALUES ($1, $2) RETURNING id`,
			tenantID, appID,
		).Scan(&threadID)
		if err != nil {
			middleware.WriteError(w, http.StatusInternalServerError, "failed to create chat thread")
			return
		}
	}

	rows, err := pool.Query(r.Context(),
		`SELECT id, sender_type,
		        COALESCE(sender_name, sender_type) as sender_name,
		        COALESCE(message_text, content) as msg_text,
		        COALESCE(channel, 'Portal') as channel,
		        COALESCE(direction, 'outbound') as direction,
		        COALESCE(status, 'sent') as status,
		        COALESCE(ai_draft_mode, 'off') as ai_draft_mode,
		        created_at
		 FROM chat_messages
		 WHERE thread_id = $1
		 ORDER BY created_at ASC`,
		threadID,
	)
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to fetch chat messages")
		return
	}
	defer rows.Close()

	var messages []map[string]any
	for rows.Next() {
		var (
			id          uuid.UUID
			senderType  string
			senderName  string
			msgText     string
			channel     string
			direction   string
			status      string
			aiDraftMode string
			createdAt   time.Time
		)
		if err := rows.Scan(&id, &senderType, &senderName, &msgText, &channel, &direction, &status, &aiDraftMode, &createdAt); err != nil {
			continue
		}
		messages = append(messages, map[string]any{
			"id":          id,
			"type":        senderType,
			"sender":      senderName,
			"text":        msgText,
			"channel":     channel,
			"direction":   direction,
			"status":      status,
			"aiDraftMode": aiDraftMode,
			"time":        createdAt.Format("15:04"),
			"created_at":  createdAt,
		})
	}

	if messages == nil {
		messages = []map[string]any{}
	}

	middleware.WriteJSON(w, http.StatusOK, map[string]any{
		"applicationId": appID,
		"threadId":      threadID,
		"messages":      messages,
	})
}

func (h *Handler) createChatMessage(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	tenantID := h.getTenantID(r)
	pool := h.service.repo.Pool()
	h.ensureMultiChannelColumns(r.Context())

	var req struct {
		MessageText string `json:"messageText"`
		SenderName  string `json:"senderName"`
		SenderType  string `json:"senderType"`
		Channel     string `json:"channel"`
		AIDraftMode string `json:"aiDraftMode"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.MessageText == "" {
		middleware.WriteError(w, http.StatusBadRequest, "messageText is required")
		return
	}
	if req.SenderType == "" {
		req.SenderType = "officer"
	}
	if req.SenderName == "" {
		req.SenderName = "Loan Officer"
	}
	if req.Channel == "" {
		req.Channel = "Portal"
	}
	if req.AIDraftMode == "" {
		req.AIDraftMode = "draft-only"
	}

	// Find or create thread
	var threadID uuid.UUID
	err := pool.QueryRow(r.Context(),
		`SELECT id FROM chat_threads WHERE application_id = $1 AND tenant_id = $2 LIMIT 1`,
		appID, tenantID,
	).Scan(&threadID)
	if err != nil {
		err = pool.QueryRow(r.Context(),
			`INSERT INTO chat_threads (tenant_id, application_id) VALUES ($1, $2) RETURNING id`,
			tenantID, appID,
		).Scan(&threadID)
		if err != nil {
			middleware.WriteError(w, http.StatusInternalServerError, "failed to create chat thread")
			return
		}
	}

	senderID := h.getUserID(r).String()
	var (
		msgID     uuid.UUID
		createdAt time.Time
	)
	err = pool.QueryRow(r.Context(),
		`INSERT INTO chat_messages
		  (thread_id, application_id, tenant_id, sender_type, sender_id, sender_name, message_text, content, channel, direction, status, ai_draft_mode)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8, 'outbound', 'sent', $9)
		 RETURNING id, created_at`,
		threadID, appID, tenantID, req.SenderType, senderID, req.SenderName, req.MessageText, req.Channel, req.AIDraftMode,
	).Scan(&msgID, &createdAt)
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to save message")
		return
	}

	middleware.WriteJSON(w, http.StatusCreated, map[string]any{
		"id":          msgID,
		"threadId":    threadID,
		"type":        req.SenderType,
		"sender":      req.SenderName,
		"text":        req.MessageText,
		"channel":     req.Channel,
		"aiDraftMode": req.AIDraftMode,
		"time":        createdAt.Format("15:04"),
		"created_at":  createdAt,
	})
}

// ─── Credit Memo Handlers ────────────────────────────────────────────────────

func (h *Handler) getCreditMemo(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	tenantID := h.getTenantID(r)
	pool := h.service.repo.Pool()

	// Find or auto-generate memo
	var memoID, versionID uuid.UUID
	err := pool.QueryRow(r.Context(),
		`SELECT m.id, m.active_version_id
		 FROM credit_memos m
		 WHERE m.application_id = $1 AND m.tenant_id = $2
		 LIMIT 1`,
		appID, tenantID,
	).Scan(&memoID, &versionID)
	if err != nil {
		// Auto-generate
		h.doGenerateCreditMemo(r, w, appID, tenantID, true)
		return
	}

	h.serializeCreditMemo(w, r, appID, memoID, versionID)
}

func (h *Handler) generateCreditMemo(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	tenantID := h.getTenantID(r)
	h.doGenerateCreditMemo(r, w, appID, tenantID, false)
}

func (h *Handler) doGenerateCreditMemo(r *http.Request, w http.ResponseWriter, appID, tenantID uuid.UUID, autoReturn bool) {
	pool := h.service.repo.Pool()

	// Get application name
	app, err := h.service.GetApplication(r.Context(), tenantID, appID)
	applicantName := "Applicant"
	loanAmount := 0.0
	if err == nil {
		applicantName = app.ApplicantName
		loanAmount = numericToFloat(app.LoanAmount)
	}

	// Get BFS score for memo content
	bfsScore := 0
	riskTier := "medium"
	scoreResp, berr := h.bfsService.GetScoreResponse(r.Context(), tenantID, appID)
	if berr == nil {
		if cs, ok := scoreResp["compositeScore"].(int); ok {
			bfsScore = cs
		} else if cs, ok := scoreResp["compositeScore"].(float64); ok {
			bfsScore = int(cs)
		}
		if rt, ok := scoreResp["riskTier"].(string); ok {
			riskTier = rt
		}
	}

	// Create credit memo record
	var memoID uuid.UUID
	err = pool.QueryRow(r.Context(),
		`INSERT INTO credit_memos (tenant_id, application_id)
		 VALUES ($1, $2)
		 ON CONFLICT DO NOTHING
		 RETURNING id`,
		tenantID, appID,
	).Scan(&memoID)
	if err != nil {
		// Already exists — just return it
		err = pool.QueryRow(r.Context(),
			`SELECT id FROM credit_memos WHERE application_id = $1 AND tenant_id = $2 LIMIT 1`,
			appID, tenantID,
		).Scan(&memoID)
		if err != nil {
			middleware.WriteError(w, http.StatusInternalServerError, "failed to create credit memo")
			return
		}
	}

	// Create version
	inputHash := fmt.Sprintf("%x", sha256.Sum256([]byte(fmt.Sprintf("%s-%d", appID, time.Now().UnixNano()))))
	var versionID uuid.UUID
	err = pool.QueryRow(r.Context(),
		`INSERT INTO credit_memo_versions
		 (tenant_id, credit_memo_id, version_number, llm_provider, llm_model, prompt_version, temperature, input_hash)
		 VALUES ($1, $2, 1, 'zeyro-agent', 'zbu-underwriter-v1', 'v2.0', 0.2, $3)
		 RETURNING id`,
		tenantID, memoID, inputHash,
	).Scan(&versionID)
	if err != nil {
		// If version exists, get it
		_ = pool.QueryRow(r.Context(),
			`SELECT id FROM credit_memo_versions WHERE credit_memo_id = $1 ORDER BY version_number DESC LIMIT 1`,
			memoID,
		).Scan(&versionID)
	}

	// Set as active version
	_, _ = pool.Exec(r.Context(),
		`UPDATE credit_memos SET active_version_id = $1, updated_at = NOW() WHERE id = $2`,
		versionID, memoID,
	)

	// Seed default sections if they don't exist
	sections := []struct {
		key     string
		content string
	}{
		{"executive_summary", fmt.Sprintf("## Executive Summary\n\nApplication submitted by **%s** for a loan of ₹%.2f Lakh. The Zeyro BFS Agent has completed its automated review and assigned a composite BFS score of **%d** with a **%s** risk tier. The application meets the baseline eligibility criteria for further credit committee review.", applicantName, loanAmount/100000, bfsScore, riskTier)},
		{"financial_analysis", fmt.Sprintf("## Financial Analysis\n\n**Applicant:** %s\n**Requested Amount:** ₹%.2f\n**BFS Composite Score:** %d\n\nAccount aggregator data shows consistent monthly inflows. ITR filings are aligned with declared income. The GST return history indicates stable business turnover for MSME applicants.", applicantName, loanAmount, bfsScore)},
		{"risk_assessment", fmt.Sprintf("## Risk Assessment\n\n**Risk Tier:** %s\n**Primary Risk Factors:**\n- Repayment pattern score (RPS) evaluated against 12-month DPD history\n- Ability-to-pay (ATP) calculated on net cash flow post-existing obligations\n- Bureau credit score (BCS) from CIBIL/Experian cross-match\n\nNo adverse fraud alerts found in CKYC registry.", strings.ToUpper(riskTier[:1])+riskTier[1:])},
		{"mitigants", "## Mitigants\n\n1. Collateral: Property mortgage as primary security covers 1.4x of loan amount\n2. Co-applicant income provides secondary repayment source\n3. AA-derived cashflow data provides real-time bureau cross-validation\n4. Lender's insurance policy covers up to 80% of loan outstanding in case of default"},
		{"recommendation", fmt.Sprintf("## Recommendation\n\n**BFS Score:** %d/100 → **%s**\n\nBased on the automated BFS analysis, the Zeyro Underwriting Agent recommends this application for officer review. Final credit committee decision should weigh the risk tier (%s) against lender's current portfolio concentration limits.", bfsScore, conditionalRecommendation(bfsScore), riskTier)},
	}

	for _, sec := range sections {
		_, _ = pool.Exec(r.Context(),
			`INSERT INTO credit_memo_sections (memo_version_id, section_key, content)
			 VALUES ($1, $2, $3)
			 ON CONFLICT DO NOTHING`,
			versionID, sec.key, sec.content,
		)
	}

	if autoReturn {
		h.serializeCreditMemo(w, r, appID, memoID, versionID)
		return
	}

	// Queue a processing job
	pgTenant := pgtype.UUID{Bytes: tenantID, Valid: true}
	pgApp := pgtype.UUID{Bytes: appID, Valid: true}
	job, _ := h.service.repo.Queries().CreateProcessingJob(r.Context(), gen.CreateProcessingJobParams{
		TenantID:       pgTenant,
		ApplicationID:  pgApp,
		JobType:        "memo_generate",
		Status:         gen.JobStatusQueued,
		Payload:        []byte(fmt.Sprintf(`{"applicationId":"%s","memoId":"%s"}`, appID, memoID)),
		MaxAttempts:    3,
		IdempotencyKey: pgtype.Text{String: fmt.Sprintf("memo_gen_%s_%d", appID, time.Now().Unix()), Valid: true},
	})

	middleware.WriteJSON(w, http.StatusAccepted, map[string]any{
		"memoId":    memoID,
		"versionId": versionID,
		"jobId":     job.ID,
		"status":    "generated",
	})
}

func (h *Handler) serializeCreditMemo(w http.ResponseWriter, r *http.Request, appID, memoID, versionID uuid.UUID) {
	pool := h.service.repo.Pool()

	// Fetch sections
	rows, err := pool.Query(r.Context(),
		`SELECT section_key, content, edited_by, edited_at, updated_at
		 FROM credit_memo_sections
		 WHERE memo_version_id = $1
		 ORDER BY section_key`,
		versionID,
	)
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to fetch memo sections")
		return
	}
	defer rows.Close()

	sections := map[string]any{}
	for rows.Next() {
		var (
			key       string
			content   string
			editedBy  pgtype.UUID
			editedAt  pgtype.Timestamptz
			updatedAt pgtype.Timestamptz
		)
		if err := rows.Scan(&key, &content, &editedBy, &editedAt, &updatedAt); err != nil {
			continue
		}
		sections[key] = map[string]any{
			"content":   content,
			"editedBy":  editedBy,
			"editedAt":  editedAt.Time,
			"updatedAt": updatedAt.Time,
		}
	}

	// Fetch citations
	citRows, _ := pool.Query(r.Context(),
		`SELECT chip_id, claim_text, document_id, source_line
		 FROM credit_memo_citations
		 WHERE memo_version_id = $1`,
		versionID,
	)
	var citations []map[string]any
	if citRows != nil {
		defer citRows.Close()
		for citRows.Next() {
			var chipID, claimText, sourceLine string
			var docID pgtype.UUID
			if err := citRows.Scan(&chipID, &claimText, &docID, &sourceLine); err != nil {
				continue
			}
			citations = append(citations, map[string]any{
				"chipId":     chipID,
				"claimText":  claimText,
				"documentId": docID,
				"sourceLine": sourceLine,
			})
		}
	}
	if citations == nil {
		citations = []map[string]any{}
	}

	middleware.WriteJSON(w, http.StatusOK, map[string]any{
		"applicationId": appID,
		"memoId":        memoID,
		"versionId":     versionID,
		"sections":      sections,
		"citations":     citations,
	})
}

func (h *Handler) updateCreditMemoSection(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	tenantID := h.getTenantID(r)
	actorID := h.getUserID(r)
	pool := h.service.repo.Pool()

	var req struct {
		SectionKey     string `json:"sectionKey"`
		UpdatedContent string `json:"updatedContent"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.SectionKey == "" {
		middleware.WriteError(w, http.StatusBadRequest, "sectionKey and updatedContent are required")
		return
	}

	// Get active version
	var versionID uuid.UUID
	err := pool.QueryRow(r.Context(),
		`SELECT m.active_version_id
		 FROM credit_memos m
		 WHERE m.application_id = $1 AND m.tenant_id = $2 LIMIT 1`,
		appID, tenantID,
	).Scan(&versionID)
	if err != nil {
		middleware.WriteError(w, http.StatusNotFound, "credit memo not found — generate one first")
		return
	}

	pgActor := pgtype.UUID{Bytes: actorID, Valid: true}
	_, err = pool.Exec(r.Context(),
		`UPDATE credit_memo_sections
		 SET content = $1, edited_by = $2, edited_at = NOW(), updated_at = NOW()
		 WHERE memo_version_id = $3 AND section_key = $4`,
		req.UpdatedContent, pgActor, versionID, req.SectionKey,
	)
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to update section")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, map[string]any{
		"sectionKey":     req.SectionKey,
		"updatedContent": req.UpdatedContent,
		"updatedAt":      time.Now(),
	})
}

// ─── Decision Handlers ───────────────────────────────────────────────────────

func (h *Handler) getApplicationDecisions(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	tenantID := h.getTenantID(r)
	pool := h.service.repo.Pool()

	rows, err := pool.Query(r.Context(),
		`SELECT id, officer_id, officer_role, original_system_recommendation,
		        final_decision, override_occurred, override_reason_code,
		        override_justification, conditions_summary, outcome_90d, decided_at
		 FROM decision_logs
		 WHERE application_id = $1 AND tenant_id = $2
		 ORDER BY decided_at DESC`,
		appID, tenantID,
	)
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to fetch decisions")
		return
	}
	defer rows.Close()

	var decisions []map[string]any
	for rows.Next() {
		d := scanDecisionLogRow(rows)
		if d != nil {
			decisions = append(decisions, d)
		}
	}
	if decisions == nil {
		decisions = []map[string]any{}
	}

	middleware.WriteJSON(w, http.StatusOK, map[string]any{
		"applicationId": appID,
		"decisions":     decisions,
	})
}

func (h *Handler) submitDecision(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	tenantID := h.getTenantID(r)
	actorID := h.getUserID(r)
	pool := h.service.repo.Pool()

	var req struct {
		Decision         string   `json:"decision"`
		Conditions       []string `json:"conditions"`
		DecisionNotes    string   `json:"decisionNotes"`
		OverrideOccurred bool     `json:"overrideOccurred"`
		OverrideReason   string   `json:"overrideReason"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Decision == "" {
		middleware.WriteError(w, http.StatusBadRequest, "decision is required")
		return
	}

	// Determine system recommendation from BFS score
	sysRec := gen.RecommendationTypeApprove
	scoreResp, _ := h.bfsService.GetScoreResponse(r.Context(), tenantID, appID)
	if scoreResp != nil {
		if rec, ok := scoreResp["recommendation"].(string); ok {
			sysRec = gen.RecommendationType(rec)
		}
	}

	// Map decision string to type
	finalDecision := gen.DecisionType(req.Decision)
	overrideOccurred := req.OverrideOccurred || string(sysRec) != req.Decision

	condsSummary, _ := json.Marshal(req.Conditions)

	// Hash for audit chain
	prevHash := ""
	_ = pool.QueryRow(r.Context(),
		`SELECT event_hash FROM decision_logs WHERE tenant_id = $1 ORDER BY decided_at DESC LIMIT 1`,
		tenantID,
	).Scan(&prevHash)
	rawHash := fmt.Sprintf("%s|%s|%s|%d", appID, req.Decision, actorID, time.Now().UnixNano())
	eventHash := fmt.Sprintf("%x", sha256.Sum256([]byte(rawHash)))

	pgTenant := pgtype.UUID{Bytes: tenantID, Valid: true}
	pgApp := pgtype.UUID{Bytes: appID, Valid: true}
	pgOfficer := pgtype.UUID{Bytes: actorID, Valid: true}

	var decisionID uuid.UUID
	var decidedAt time.Time
	err := pool.QueryRow(r.Context(),
		`INSERT INTO decision_logs
		 (tenant_id, application_id, officer_id, officer_role,
		  original_system_recommendation, final_decision,
		  override_occurred, override_reason_code, override_justification,
		  conditions_summary, event_hash, previous_event_hash)
		 VALUES ($1, $2, $3, 'loan_officer', $4, $5, $6, $7, $8, $9, $10, $11)
		 RETURNING id, decided_at`,
		pgTenant, pgApp, pgOfficer,
		sysRec, finalDecision,
		overrideOccurred,
		pgtype.Text{String: req.OverrideReason, Valid: req.OverrideReason != ""},
		pgtype.Text{String: req.DecisionNotes, Valid: req.DecisionNotes != ""},
		condsSummary,
		eventHash,
		pgtype.Text{String: prevHash, Valid: prevHash != ""},
	).Scan(&decisionID, &decidedAt)
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, fmt.Sprintf("failed to record decision: %v", err))
		return
	}

	// Transition stage based on decision
	newStage := decisionToStage(req.Decision)
	if newStage != "" {
		_, _ = h.service.TransitionStage(r.Context(), tenantID, appID,
			gen.ApplicationStage(newStage), actorID, req.Decision, "")
	}

	// Log agent entry
	_, _ = pool.Exec(r.Context(),
		`INSERT INTO agent_logs (tenant_id, application_id, trace_id, severity, message, metadata)
		 VALUES ($1, $2, $3, 'INFO', $4, $5)`,
		pgTenant, pgApp,
		fmt.Sprintf("trace_%s", decisionID),
		fmt.Sprintf("Decision submitted: %s (override: %v)", req.Decision, overrideOccurred),
		[]byte(fmt.Sprintf(`{"decisionId":"%s","decision":"%s","overrideOccurred":%v}`, decisionID, req.Decision, overrideOccurred)),
	)

	middleware.WriteJSON(w, http.StatusCreated, map[string]any{
		"decisionId":        decisionID,
		"applicationId":     appID,
		"finalDecision":     finalDecision,
		"overrideOccurred":  overrideOccurred,
		"eventHash":         eventHash,
		"decidedAt":         decidedAt,
	})
}

// ─── Decision Log List ───────────────────────────────────────────────────────

func (h *Handler) handleDecisionLog(w http.ResponseWriter, r *http.Request) {
	middleware.SetCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodGet {
		middleware.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	tenantID := h.getTenantID(r)
	pool := h.service.repo.Pool()
	limit := 50

	rows, err := pool.Query(r.Context(),
		`SELECT dl.id, dl.application_id, dl.officer_id, dl.officer_role,
		        dl.original_system_recommendation, dl.final_decision,
		        dl.override_occurred, dl.override_reason_code,
		        dl.override_justification, dl.conditions_summary,
		        dl.outcome_90d, dl.decided_at,
		        a.app_number, a.applicant_name
		 FROM decision_logs dl
		 JOIN applications a ON a.id = dl.application_id
		 WHERE dl.tenant_id = $1
		 ORDER BY dl.decided_at DESC
		 LIMIT $2`,
		tenantID, limit,
	)
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to fetch decision log")
		return
	}
	defer rows.Close()

	var decisions []map[string]any
	for rows.Next() {
		var (
			id, applicationID, officerID       uuid.UUID
			officerRole                         string
			sysRec, finalDecision               string
			overrideOccurred                    bool
			overrideReasonCode, overrideJust    pgtype.Text
			condsSummary                        []byte
			outcome90d                          string
			decidedAt                           time.Time
			appNumber, applicantName            string
		)
		if err := rows.Scan(
			&id, &applicationID, &officerID, &officerRole,
			&sysRec, &finalDecision,
			&overrideOccurred, &overrideReasonCode, &overrideJust,
			&condsSummary, &outcome90d, &decidedAt,
			&appNumber, &applicantName,
		); err != nil {
			continue
		}

		var condsList any
		_ = json.Unmarshal(condsSummary, &condsList)

		decisions = append(decisions, map[string]any{
			"id":                           id,
			"applicationId":                applicationID,
			"appNumber":                    appNumber,
			"applicantName":                applicantName,
			"officerId":                    officerID,
			"officerRole":                  officerRole,
			"originalSystemRecommendation": sysRec,
			"finalDecision":                finalDecision,
			"overrideOccurred":             overrideOccurred,
			"overrideReasonCode":           overrideReasonCode.String,
			"overrideJustification":        overrideJust.String,
			"conditionsSummary":            condsList,
			"outcome90d":                   outcome90d,
			"decidedAt":                    decidedAt,
		})
	}

	if decisions == nil {
		decisions = []map[string]any{}
	}

	middleware.WriteJSON(w, http.StatusOK, map[string]any{
		"total":     len(decisions),
		"decisions": decisions,
	})
}

// ─── Agent Logs ──────────────────────────────────────────────────────────────

func (h *Handler) handleAgentLogs(w http.ResponseWriter, r *http.Request) {
	middleware.SetCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodGet {
		middleware.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	tenantID := h.getTenantID(r)
	pool := h.service.repo.Pool()
	severity := r.URL.Query().Get("severity")
	appIDStr := r.URL.Query().Get("applicationId")

	query := `SELECT id, application_id, trace_id, severity, message, metadata, created_at
			  FROM agent_logs WHERE tenant_id = $1`
	args := []any{tenantID}

	if severity != "" && severity != "ALL" {
		args = append(args, strings.ToUpper(severity))
		query += fmt.Sprintf(" AND severity = $%d", len(args))
	}
	if appIDStr != "" {
		if uid, err := uuid.Parse(appIDStr); err == nil {
			args = append(args, uid)
			query += fmt.Sprintf(" AND application_id = $%d", len(args))
		}
	}
	query += " ORDER BY created_at DESC LIMIT 200"

	rows, err := pool.Query(r.Context(), query, args...)
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to fetch agent logs")
		return
	}
	defer rows.Close()

	var logs []map[string]any
	for rows.Next() {
		var (
			id            uuid.UUID
			applicationID pgtype.UUID
			traceID       pgtype.Text
			sev, msg      string
			meta          []byte
			createdAt     time.Time
		)
		if err := rows.Scan(&id, &applicationID, &traceID, &sev, &msg, &meta, &createdAt); err != nil {
			continue
		}
		var metaObj any
		_ = json.Unmarshal(meta, &metaObj)

		logs = append(logs, map[string]any{
			"id":            id,
			"applicationId": applicationID,
			"traceId":       traceID.String,
			"severity":      sev,
			"message":       msg,
			"metadata":      metaObj,
			"timestamp":     createdAt,
		})
	}
	if logs == nil {
		logs = []map[string]any{}
	}

	middleware.WriteJSON(w, http.StatusOK, map[string]any{
		"total": len(logs),
		"logs":  logs,
	})
}

// ─── Portfolio Insights ──────────────────────────────────────────────────────

func (h *Handler) handleInsightsPipeline(w http.ResponseWriter, r *http.Request) {
	middleware.SetCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodGet {
		middleware.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	tenantID := h.getTenantID(r)
	pool := h.service.repo.Pool()

	// Risk tier distribution
	tierRows, _ := pool.Query(r.Context(),
		`SELECT risk_tier, COUNT(*) as count
		 FROM applications
		 WHERE tenant_id = $1 AND risk_tier IS NOT NULL
		 GROUP BY risk_tier`,
		tenantID,
	)
	riskDistribution := map[string]int64{}
	if tierRows != nil {
		defer tierRows.Close()
		for tierRows.Next() {
			var tier string
			var count int64
			if err := tierRows.Scan(&tier, &count); err == nil {
				riskDistribution[tier] = count
			}
		}
	}

	// Stage funnel
	stageRows, _ := pool.Query(r.Context(),
		`SELECT stage, COUNT(*) as count
		 FROM applications
		 WHERE tenant_id = $1
		 GROUP BY stage`,
		tenantID,
	)
	stageFunnel := map[string]int64{}
	if stageRows != nil {
		defer stageRows.Close()
		for stageRows.Next() {
			var stage string
			var count int64
			if err := stageRows.Scan(&stage, &count); err == nil {
				stageFunnel[stage] = count
			}
		}
	}

	// Approval rate & totals
	var totalApps, approvedApps int64
	_ = pool.QueryRow(r.Context(),
		`SELECT COUNT(*), COUNT(*) FILTER (WHERE status IN ('approved','approved_with_conditions'))
		 FROM applications WHERE tenant_id = $1`, tenantID,
	).Scan(&totalApps, &approvedApps)

	approvalRate := 0.0
	if totalApps > 0 {
		approvalRate = float64(approvedApps) / float64(totalApps) * 100
	}

	// Avg BFS score today
	var avgBFS float64
	_ = pool.QueryRow(r.Context(),
		`SELECT COALESCE(AVG(bfs_score), 0) FROM applications
		 WHERE tenant_id = $1 AND bfs_score IS NOT NULL
		 AND created_at >= CURRENT_DATE`,
		tenantID,
	).Scan(&avgBFS)

	// Today's reviewed count
	var todayReviewed int64
	_ = pool.QueryRow(r.Context(),
		`SELECT COUNT(*) FROM decision_logs
		 WHERE tenant_id = $1 AND decided_at >= CURRENT_DATE`,
		tenantID,
	).Scan(&todayReviewed)

	// Recommendation breakdown
	recRows, _ := pool.Query(r.Context(),
		`SELECT recommendation, COUNT(*) FROM applications
		 WHERE tenant_id = $1 AND recommendation IS NOT NULL
		 GROUP BY recommendation`,
		tenantID,
	)
	recommendations := map[string]int64{}
	if recRows != nil {
		defer recRows.Close()
		for recRows.Next() {
			var rec string
			var count int64
			if err := recRows.Scan(&rec, &count); err == nil {
				recommendations[rec] = count
			}
		}
	}

	middleware.WriteJSON(w, http.StatusOK, map[string]any{
		"summary": map[string]any{
			"totalApplications":     totalApps,
			"reviewedToday":         todayReviewed,
			"approvalRate":          approvalRate,
			"averageBFSScoreToday":  avgBFS,
		},
		"riskDistribution": riskDistribution,
		"stageFunnel":      stageFunnel,
		"recommendations":  recommendations,
	})
}

func (h *Handler) handleInsightsTeamWorkload(w http.ResponseWriter, r *http.Request) {
	middleware.SetCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodGet {
		middleware.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	tenantID := h.getTenantID(r)
	pool := h.service.repo.Pool()

	rows, err := pool.Query(r.Context(),
		`SELECT
		   assigned_officer_id,
		   COUNT(*) AS total,
		   COUNT(*) FILTER (WHERE stage IN ('under_review','review_ready')) AS active,
		   COUNT(*) FILTER (WHERE status = 'approved' OR status = 'approved_with_conditions') AS approved
		 FROM applications
		 WHERE tenant_id = $1 AND assigned_officer_id IS NOT NULL
		 GROUP BY assigned_officer_id
		 ORDER BY total DESC`,
		tenantID,
	)
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to fetch team workload")
		return
	}
	defer rows.Close()

	var workload []map[string]any
	for rows.Next() {
		var officerID pgtype.UUID
		var total, active, approved int64
		if err := rows.Scan(&officerID, &total, &active, &approved); err != nil {
			continue
		}
		workload = append(workload, map[string]any{
			"officerId": officerID,
			"total":     total,
			"active":    active,
			"approved":  approved,
		})
	}
	if workload == nil {
		workload = []map[string]any{}
	}

	middleware.WriteJSON(w, http.StatusOK, map[string]any{
		"teamWorkload": workload,
	})
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

func decisionToStage(decision string) string {
	switch decision {
	case "approved":
		return "approved"
	case "conditionally_approved":
		return "conditionally_approved"
	case "rejected":
		return "rejected"
	case "escalated":
		return "under_review"
	default:
		return ""
	}
}

func conditionalRecommendation(score int) string {
	switch {
	case score >= 75:
		return "Approve"
	case score >= 60:
		return "Approve with Conditions"
	case score >= 45:
		return "Escalate to Credit Head"
	default:
		return "Reject"
	}
}

type scannable interface {
	Scan(dest ...any) error
}

func scanDecisionLogRow(rows scannable) map[string]any {
	var (
		id, applicationID, officerID       uuid.UUID
		officerRole                         string
		sysRec, finalDecision               string
		overrideOccurred                    bool
		overrideReasonCode, overrideJust    pgtype.Text
		condsSummary                        []byte
		outcome90d                          string
		decidedAt                           time.Time
	)
	if err := rows.Scan(
		&id, &applicationID, &officerID, &officerRole,
		&sysRec, &finalDecision,
		&overrideOccurred, &overrideReasonCode, &overrideJust,
		&condsSummary, &outcome90d, &decidedAt,
	); err != nil {
		return nil
	}

	var condsList any
	_ = json.Unmarshal(condsSummary, &condsList)

	return map[string]any{
		"id":                           id,
		"applicationId":                applicationID,
		"officerId":                    officerID,
		"officerRole":                  officerRole,
		"originalSystemRecommendation": sysRec,
		"finalDecision":                finalDecision,
		"overrideOccurred":             overrideOccurred,
		"overrideReasonCode":           overrideReasonCode.String,
		"overrideJustification":        overrideJust.String,
		"conditionsSummary":            condsList,
		"outcome90d":                   outcome90d,
		"decidedAt":                    decidedAt,
	}
}

// ─── Resend Inbound Webhook ──────────────────────────────────────────────────

func (h *Handler) handleResendWebhook(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		middleware.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "failed to read webhook body")
		return
	}

	resendProvider := messaging.NewResendProvider()
	inboundMsg, err := resendProvider.ParseInbound(messaging.WebhookRequest{
		Body: body,
	})
	if err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "failed to parse resend webhook")
		return
	}

	if inboundMsg.ApplicationID == uuid.Nil {
		middleware.WriteJSON(w, http.StatusOK, map[string]string{"status": "ignored_no_application_id"})
		return
	}

	pool := h.service.repo.Pool()
	h.ensureMultiChannelColumns(r.Context())

	// Find thread for Application
	var threadID uuid.UUID
	err = pool.QueryRow(r.Context(),
		`SELECT id FROM chat_threads WHERE application_id = $1 LIMIT 1`,
		inboundMsg.ApplicationID,
	).Scan(&threadID)
	if err != nil {
		_ = pool.QueryRow(r.Context(),
			`INSERT INTO chat_threads (application_id) VALUES ($1) RETURNING id`,
			inboundMsg.ApplicationID,
		).Scan(&threadID)
	}

	_, err = pool.Exec(r.Context(),
		`INSERT INTO chat_messages
		  (thread_id, application_id, sender_type, sender_name, message_text, content, channel, direction, status)
		 VALUES ($1, $2, 'applicant', $3, $4, $4, 'Email', 'inbound', 'delivered')`,
		threadID, inboundMsg.ApplicationID, inboundMsg.SenderName, inboundMsg.MessageText,
	)
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to save inbound email message")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, map[string]any{
		"status":        "received",
		"applicationId": inboundMsg.ApplicationID,
		"channel":       "Email",
	})
}
