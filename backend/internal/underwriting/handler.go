package underwriting

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/arthazeyro/zeyro-b2b/internal/domain"
	"github.com/arthazeyro/zeyro-b2b/internal/middleware"
	"github.com/arthazeyro/zeyro-b2b/internal/repository/postgres/gen"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"go.uber.org/zap"
)

type Handler struct {
	service    *Service
	docService *DocumentService
	bfsService *BFSService
	sseBroker  *SSEBroker
	logger     *zap.Logger
}

func NewHandler(service *Service, docService *DocumentService, bfsService *BFSService, sseBroker *SSEBroker, logger *zap.Logger) *Handler {
	return &Handler{
		service:    service,
		docService: docService,
		bfsService: bfsService,
		sseBroker:  sseBroker,
		logger:     logger,
	}
}

func (h *Handler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/v1/underwriting/applications", middleware.RequirePASETOAuth(h.handleApplications))
	mux.HandleFunc("/api/v1/underwriting/applications/", middleware.RequirePASETOAuth(h.handleApplicationByIDRouter))
	mux.HandleFunc("/api/v1/underwriting/documents/", middleware.RequirePASETOAuth(h.handleDocumentViewerRouter))
	mux.HandleFunc("/api/v1/underwriting/conditions/", middleware.RequirePASETOAuth(h.handleConditionRouter))
	mux.HandleFunc("/api/v1/underwriting/processing-jobs/", middleware.RequirePASETOAuth(h.handleProcessingJobRouter))
	mux.HandleFunc("/api/v1/tenant/production-access-requests", middleware.RequirePASETOAuth(h.handleProductionAccessRequests))
	mux.HandleFunc("/api/v1/underwriting/settings/bfs-policy", middleware.RequirePASETOAuth(h.handleBFSPolicy))
	mux.HandleFunc("/api/v1/underwriting/settings/bfs-policy/", middleware.RequirePASETOAuth(h.handleBFSPolicyRouter))
	if h.sseBroker != nil {
		mux.HandleFunc("/api/v1/underwriting/stream", middleware.RequirePASETOAuth(h.sseBroker.ServeHTTP))
	}
	// Extended routes: chat, credit-memo, decision, agent-logs, insights
	h.registerExtendedRoutes(mux)
}

func (h *Handler) getTenantID(r *http.Request) uuid.UUID {
	// First, check if PASETO auth payload exists (secure method)
	if payload := middleware.GetAuthPayload(r.Context()); payload != nil {
		if uid, err := uuid.Parse(payload.PartnerID); err == nil {
			return uid
		}
	}

	// Fallback to legacy Context Key if set internally
	if val := r.Context().Value(domain.TenantIDContextKey); val != nil {
		if uid, ok := val.(uuid.UUID); ok && uid != uuid.Nil {
			return uid
		}
	}

	// Legacy fallback to header for dev bypass (should be disabled in production)
	if tenantHeader := r.Header.Get("X-Tenant-ID"); tenantHeader != "" {
		if uid, err := uuid.Parse(tenantHeader); err == nil {
			return uid
		}
	}
	return uuid.Nil
}

func (h *Handler) getUserID(r *http.Request) uuid.UUID {
	if val := r.Context().Value(domain.UserIDContextKey); val != nil {
		if uid, ok := val.(uuid.UUID); ok && uid != uuid.Nil {
			return uid
		}
	}
	return uuid.MustParse("00000000-0000-0000-0000-000000000002")
}

func (h *Handler) handleApplications(w http.ResponseWriter, r *http.Request) {
	middleware.SetCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	switch r.Method {
	case http.MethodGet:
		h.listApplications(w, r)
	case http.MethodPost:
		h.createApplication(w, r)
	default:
		middleware.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
	}
}

func (h *Handler) listApplications(w http.ResponseWriter, r *http.Request) {
	tenantID := h.getTenantID(r)
	query := r.URL.Query()

	search := query.Get("search")
	stageStr := query.Get("status")
	entityStr := query.Get("entity_type")
	officerStr := query.Get("officer_id")

	page, _ := strconv.Atoi(query.Get("page"))
	limit, _ := strconv.Atoi(query.Get("limit"))

	var stage *gen.ApplicationStage
	if stageStr != "" {
		s := gen.ApplicationStage(stageStr)
		stage = &s
	}

	var entity *gen.EntityType
	if entityStr != "" {
		e := gen.EntityType(entityStr)
		entity = &e
	}

	var officerID *uuid.UUID
	if officerStr != "" {
		if uid, err := uuid.Parse(officerStr); err == nil {
			officerID = &uid
		}
	}

	archivedFilter := query.Get("archived")
	if archivedFilter == "" {
		archivedFilter = "false"
	}

	apps, total, err := h.service.ListApplications(r.Context(), tenantID, search, stage, nil, entity, officerID, archivedFilter, page, limit)
	if err != nil {
		h.logger.Error("failed to list applications", zap.Error(err))
		middleware.WriteError(w, http.StatusInternalServerError, "failed to list applications")
		return
	}

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}

	var appResponses []map[string]any
	for _, app := range apps {
		var riskTierStr string
		if app.RiskTier.Valid {
			riskTierStr = string(app.RiskTier.RiskTier)
		}
		var recStr string
		if app.Recommendation.Valid {
			recStr = string(app.Recommendation.RecommendationType)
		}
		appResponses = append(appResponses, map[string]any{
			"id":                 app.ID,
			"appNumber":          app.AppNumber,
			"applicantName":      app.ApplicantName,
			"entityType":         app.EntityType,
			"loanAmount":         numericToFloat(app.LoanAmount),
			"tenureMonths":       app.TenureMonths,
			"stage":              app.Stage,
			"progressPercentage": app.ProgressPercentage,
			"status":             app.Status,
			"bfsScore":           app.BfsScore,
			"riskTier":           riskTierStr,
			"recommendation":     recStr,
			"assignedOfficerId":  app.AssignedOfficerID,
			"createdAt":          app.CreatedAt.Time,
		})
	}

	middleware.WriteJSON(w, http.StatusOK, map[string]any{
		"total":        total,
		"page":         page,
		"limit":        limit,
		"applications": appResponses,
	})
}

func (h *Handler) createApplication(w http.ResponseWriter, r *http.Request) {
	tenantID := h.getTenantID(r)
	actorID := h.getUserID(r)

	var req domain.CreateApplicationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	if req.ApplicantName == "" || req.LoanAmount <= 0 {
		middleware.WriteError(w, http.StatusBadRequest, "applicantName and positive loanAmount are required")
		return
	}

	app, err := h.service.CreateApplication(r.Context(), tenantID, actorID, req)
	if err != nil {
		h.logger.Error("failed to create application", zap.Error(err))
		middleware.WriteError(w, http.StatusInternalServerError, "failed to create application")
		return
	}

	middleware.WriteJSON(w, http.StatusCreated, map[string]any{
		"id":            app.ID,
		"appNumber":     app.AppNumber,
		"applicantName": app.ApplicantName,
		"stage":         app.Stage,
		"status":        app.Status,
		"createdAt":     app.CreatedAt.Time,
	})
}

func (h *Handler) handleApplicationByIDRouter(w http.ResponseWriter, r *http.Request) {
	middleware.SetCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/v1/underwriting/applications/")
	parts := strings.Split(path, "/")
	if len(parts) == 0 || parts[0] == "" {
		middleware.WriteError(w, http.StatusNotFound, "not found")
		return
	}

	appID, err := uuid.Parse(parts[0])
	if err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid application id")
		return
	}

	if len(parts) == 1 {
		if r.Method == http.MethodGet {
			h.getApplication(w, r, appID)
			return
		}
	} else if len(parts) == 2 {
		subPath := parts[1]
		if subPath == "assign" && r.Method == http.MethodPost {
			h.assignOfficer(w, r, appID)
			return
		}
		if subPath == "stage" && r.Method == http.MethodPost {
			h.changeStage(w, r, appID)
			return
		}
		if subPath == "timeline" && r.Method == http.MethodGet {
			h.getTimeline(w, r, appID)
			return
		}
		if subPath == "documents" && r.Method == http.MethodGet {
			h.getDocumentsChecklist(w, r, appID)
			return
		}
		if subPath == "archive" && r.Method == http.MethodPost {
			h.archiveApplication(w, r, appID)
			return
		}
		if subPath == "restore" && r.Method == http.MethodPost {
			h.restoreApplication(w, r, appID)
			return
		}
		if subPath == "disburse" && r.Method == http.MethodPost {
			h.disburseApplication(w, r, appID)
			return
		}
		if subPath == "conditions" {
			if r.Method == http.MethodGet {
				h.listConditions(w, r, appID)
				return
			}
			if r.Method == http.MethodPost {
				h.createCondition(w, r, appID)
				return
			}
		}
		if subPath == "assessment" {
			if r.Method == http.MethodGet {
				h.getAssessment(w, r, appID)
				return
			}
			if r.Method == http.MethodPost {
				h.runAssessment(w, r, appID)
				return
			}
		}
		if subPath == "bfs-score" {
			if r.Method == http.MethodGet {
				h.getBFSScore(w, r, appID)
				return
			}
		}
	} else if len(parts) == 3 {
		if parts[1] == "documents" && parts[2] == "sync" && r.Method == http.MethodPost {
			h.syncDocuments(w, r, appID)
			return
		}
		if parts[1] == "bfs-score" && parts[2] == "recalculate" && r.Method == http.MethodPost {
			h.recalculateBFSScore(w, r, appID)
			return
		}
		if parts[1] == "bfs-score" && parts[2] == "history" && r.Method == http.MethodGet {
			h.getBFSHistory(w, r, appID)
			return
		}
		if parts[1] == "credit-memo" && parts[2] == "export" && r.Method == http.MethodPost {
			h.exportCreditMemo(w, r, appID)
			return
		}
	}

	// Delegate to extended handlers (chat, credit-memo GET, decision, etc.)
	// parts[0] is the appID segment; pass parts[1:] so extended handler sees sub-paths
	if len(parts) > 1 && h.routeExtendedAppPaths(w, r, appID, parts[1:]) {
		return
	}

	middleware.WriteError(w, http.StatusNotFound, "route not found")
}

func (h *Handler) getApplication(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	tenantID := h.getTenantID(r)

	app, err := h.service.GetApplication(r.Context(), tenantID, appID)
	if err != nil {
		middleware.WriteError(w, http.StatusNotFound, "application not found")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, map[string]any{
		"id":                 app.ID,
		"appNumber":          app.AppNumber,
		"applicantName":      app.ApplicantName,
		"entityType":         app.EntityType,
		"segment":            app.ApplicantSegment,
		"loanAmount":         numericToFloat(app.LoanAmount),
		"tenureMonths":       app.TenureMonths,
		"stage":              app.Stage,
		"status":             app.Status,
		"progressPercentage": app.ProgressPercentage,
		"bfsSummary": map[string]any{
			"score":          app.BfsScore,
			"riskTier":       app.RiskTier,
			"recommendation": app.Recommendation,
		},
		"assignedOfficerId": app.AssignedOfficerID,
		"createdAt":         app.CreatedAt.Time,
	})
}

func (h *Handler) assignOfficer(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	tenantID := h.getTenantID(r)
	actorID := h.getUserID(r)

	var req domain.AssignOfficerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	officerID, err := uuid.Parse(req.OfficerID)
	if err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid officer id format")
		return
	}

	app, err := h.service.AssignOfficer(r.Context(), tenantID, appID, officerID, actorID)
	if err != nil {
		h.logger.Error("failed to assign officer", zap.Error(err))
		middleware.WriteError(w, http.StatusInternalServerError, "failed to assign officer")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, map[string]any{
		"id":                app.ID,
		"assignedOfficerId": app.AssignedOfficerID,
		"status":            "success",
	})
}

func (h *Handler) changeStage(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	tenantID := h.getTenantID(r)
	actorID := h.getUserID(r)
	reqID := r.Header.Get("X-Request-ID")

	var req domain.ChangeStageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	targetStage := gen.ApplicationStage(req.NewStage)
	app, err := h.service.TransitionStage(r.Context(), tenantID, appID, targetStage, actorID, req.Reason, reqID)
	if err != nil {
		middleware.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	middleware.WriteJSON(w, http.StatusOK, map[string]any{
		"id":                 app.ID,
		"stage":              app.Stage,
		"status":             app.Status,
		"progressPercentage": app.ProgressPercentage,
	})
}

func (h *Handler) getTimeline(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	tenantID := h.getTenantID(r)

	events, err := h.service.ListTimelineEvents(r.Context(), tenantID, appID)
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to fetch timeline")
		return
	}

	var respEvents []map[string]any
	for _, e := range events {
		respEvents = append(respEvents, map[string]any{
			"id":            e.ID,
			"eventType":     e.EventType,
			"previousStage": e.PreviousStage,
			"newStage":      e.NewStage,
			"actorId":       e.ActorID,
			"reason":        e.Reason.String,
			"createdAt":     e.CreatedAt.Time,
		})
	}

	middleware.WriteJSON(w, http.StatusOK, map[string]any{
		"applicationId": appID,
		"timeline":      respEvents,
	})
}

func (h *Handler) getDocumentsChecklist(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	tenantID := h.getTenantID(r)

	docs, flags, err := h.docService.ListChecklistDocuments(r.Context(), tenantID, appID)
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to fetch documents")
		return
	}

	completedCount := 0
	var respDocs []map[string]any
	for _, d := range docs {
		if d.Status == gen.DocStatusVerified {
			completedCount++
		}
		docMap := map[string]any{
			"id":              d.ID,
			"docType":         d.DocType,
			"source":          d.Source,
			"status":          d.Status,
			"confidenceScore": numericToFloat(d.ConfidenceScore),
			"fileName":        d.FileName.String,
		}

		for _, f := range flags {
			if f.DocumentID.Valid && f.DocumentID.Bytes == d.ID.Bytes {
				var impactObj any
				if len(f.DownstreamImpact) > 0 {
					_ = json.Unmarshal(f.DownstreamImpact, &impactObj)
				}
				docMap["flag"] = map[string]any{
					"id":                     f.ID,
					"severity":               f.Severity,
					"title":                  f.Title,
					"consequenceDescription": f.ConsequenceDescription.String,
					"downstreamImpact":       impactObj,
				}
				break
			}
		}

		respDocs = append(respDocs, docMap)
	}

	middleware.WriteJSON(w, http.StatusOK, map[string]any{
		"applicationId":  appID,
		"completedCount": completedCount,
		"totalCount":     len(docs),
		"documents":      respDocs,
	})
}

func (h *Handler) syncDocuments(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	tenantID := h.getTenantID(r)

	job, err := h.docService.TriggerDocumentSync(r.Context(), tenantID, appID)
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to trigger sync job")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, map[string]any{
		"jobId":  job.ID,
		"status": job.Status,
	})
}

func (h *Handler) handleDocumentViewerRouter(w http.ResponseWriter, r *http.Request) {
	middleware.SetCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/v1/underwriting/documents/")
	parts := strings.Split(path, "/")
	if len(parts) >= 2 && parts[1] == "viewer" && r.Method == http.MethodGet {
		docID, err := uuid.Parse(parts[0])
		if err != nil {
			middleware.WriteError(w, http.StatusBadRequest, "invalid document id")
			return
		}

		tenantID := h.getTenantID(r)
		payload, err := h.docService.GetDocumentViewerPayload(r.Context(), tenantID, docID)
		if err != nil {
			middleware.WriteError(w, http.StatusNotFound, err.Error())
			return
		}

		middleware.WriteJSON(w, http.StatusOK, payload)
		return
	}

	middleware.WriteError(w, http.StatusNotFound, "route not found")
}

func (h *Handler) getBFSScore(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	tenantID := h.getTenantID(r)

	resp, err := h.bfsService.GetScoreResponse(r.Context(), tenantID, appID)
	if err != nil {
		h.logger.Error("failed to get BFS score", zap.Error(err))
		middleware.WriteError(w, http.StatusInternalServerError, "failed to get BFS score")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, resp)
}

func (h *Handler) recalculateBFSScore(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	tenantID := h.getTenantID(r)

	resp, err := h.bfsService.CalculateAndSaveBFS(r.Context(), tenantID, appID, "Manual recalculation requested")
	if err != nil {
		h.logger.Error("failed to recalculate BFS score", zap.Error(err))
		middleware.WriteError(w, http.StatusInternalServerError, "failed to recalculate BFS score")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, resp)
}

func (h *Handler) getBFSHistory(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	tenantID := h.getTenantID(r)

	history, err := h.bfsService.ListScoreHistory(r.Context(), tenantID, appID)
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to fetch score history")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, map[string]any{
		"applicationId": appID,
		"history":       history,
	})
}

func (h *Handler) handleBFSPolicy(w http.ResponseWriter, r *http.Request) {
	middleware.SetCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	tenantID := h.getTenantID(r)

	if r.Method == http.MethodGet {
		policy, err := h.bfsService.GetOrSeedActivePolicy(r.Context(), tenantID)
		if err != nil {
			middleware.WriteError(w, http.StatusInternalServerError, err.Error())
			return
		}
		middleware.WriteJSON(w, http.StatusOK, map[string]any{
			"id":                   policy.ID,
			"policyName":           policy.PolicyName,
			"policyVersion":        policy.PolicyVersion,
			"isActive":             policy.IsActive,
			"atpWeight":            numericToFloat(policy.AtpWeight),
			"rpsWeight":            numericToFloat(policy.RpsWeight),
			"bcsWeight":            numericToFloat(policy.BcsWeight),
			"fdsWeight":            numericToFloat(policy.FdsWeight),
			"minPassScore":         policy.MinPassScore,
			"autoApproveThreshold": policy.AutoApproveThreshold,
		})
		return
	}

	middleware.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
}

func (h *Handler) handleBFSPolicyRouter(w http.ResponseWriter, r *http.Request) {
	middleware.SetCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	tenantID := h.getTenantID(r)
	actorID := h.getUserID(r)

	path := strings.TrimPrefix(r.URL.Path, "/api/v1/underwriting/settings/bfs-policy/")
	parts := strings.Split(path, "/")

	if len(parts) == 1 && parts[0] == "versions" {
		if r.Method == http.MethodGet {
			versions, err := h.bfsService.ListPolicyVersions(r.Context(), tenantID)
			if err != nil {
				middleware.WriteError(w, http.StatusInternalServerError, "failed to fetch versions")
				return
			}
			middleware.WriteJSON(w, http.StatusOK, map[string]any{"versions": versions})
			return
		}
		if r.Method == http.MethodPost {
			var req domain.CreateBFSPolicyRequest
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				middleware.WriteError(w, http.StatusBadRequest, "invalid body")
				return
			}
			version, err := h.bfsService.CreatePolicyVersion(r.Context(), tenantID, actorID, req)
			if err != nil {
				middleware.WriteError(w, http.StatusInternalServerError, err.Error())
				return
			}
			middleware.WriteJSON(w, http.StatusCreated, version)
			return
		}
	} else if len(parts) == 3 && parts[0] == "versions" && parts[2] == "activate" && r.Method == http.MethodPost {
		versionID, err := uuid.Parse(parts[1])
		if err != nil {
			middleware.WriteError(w, http.StatusBadRequest, "invalid version id")
			return
		}
		activated, err := h.bfsService.ActivatePolicyVersion(r.Context(), tenantID, versionID, actorID, "MSME_UNSECURED")
		if err != nil {
			middleware.WriteError(w, http.StatusInternalServerError, err.Error())
			return
		}
		middleware.WriteJSON(w, http.StatusOK, activated)
		return
	}

	middleware.WriteError(w, http.StatusNotFound, "route not found")
}

func (h *Handler) archiveApplication(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	tenantID := h.getTenantID(r)
	actorID := h.getUserID(r)

	var req struct {
		Reason string `json:"reason"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)

	app, err := h.service.ArchiveApplication(r.Context(), tenantID, appID, actorID, req.Reason)
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to archive application")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, app)
}

func (h *Handler) restoreApplication(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	tenantID := h.getTenantID(r)
	actorID := h.getUserID(r)

	app, err := h.service.RestoreApplication(r.Context(), tenantID, appID, actorID)
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to restore application")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, app)
}

func (h *Handler) disburseApplication(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	tenantID := h.getTenantID(r)
	actorID := h.getUserID(r)

	var req struct {
		LoanAccountID   string  `json:"loanAccountId"`
		DisbursedAmount float64 `json:"disbursedAmount"`
		ReferenceNumber string  `json:"referenceNumber"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	app, err := h.service.DisburseApplication(r.Context(), tenantID, appID, actorID, req.LoanAccountID, req.DisbursedAmount, req.ReferenceNumber)
	if err != nil {
		middleware.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	middleware.WriteJSON(w, http.StatusOK, app)
}

func (h *Handler) listConditions(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	tenantID := h.getTenantID(r)
	pgTenant := pgtype.UUID{Bytes: tenantID, Valid: true}
	pgApp := pgtype.UUID{Bytes: appID, Valid: true}

	conds, err := h.service.repo.Queries().ListConditionsByApplication(r.Context(), gen.ListConditionsByApplicationParams{
		ApplicationID: pgApp,
		TenantID:      pgTenant,
	})
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to fetch conditions")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, map[string]any{"conditions": conds})
}

func (h *Handler) createCondition(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	tenantID := h.getTenantID(r)
	pgTenant := pgtype.UUID{Bytes: tenantID, Valid: true}
	pgApp := pgtype.UUID{Bytes: appID, Valid: true}

	var req struct {
		Type        string `json:"type"`
		Description string `json:"description"`
		DueDate     string `json:"dueDate"`
		Mandatory   bool   `json:"mandatory"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Description == "" {
		middleware.WriteError(w, http.StatusBadRequest, "description is required")
		return
	}

	cType := req.Type
	if cType == "" {
		cType = "document"
	}

	var pgDueDate pgtype.Date
	if req.DueDate != "" {
		_ = pgDueDate.Scan(req.DueDate)
	}

	cond, err := h.service.repo.Queries().CreateStructuredCondition(r.Context(), gen.CreateStructuredConditionParams{
		TenantID:      pgTenant,
		ApplicationID: pgApp,
		ConditionCode: pgtype.Text{String: fmt.Sprintf("COND-%d", time.Now().Unix()%10000), Valid: true},
		Description:   req.Description,
		ConditionType: cType,
		DueDate:       pgDueDate,
		IsMandatory:   req.Mandatory,
		Status:        gen.ConditionStatusPending,
	})
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to create condition")
		return
	}

	middleware.WriteJSON(w, http.StatusCreated, cond)
}

func (h *Handler) handleConditionRouter(w http.ResponseWriter, r *http.Request) {
	middleware.SetCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	tenantID := h.getTenantID(r)
	actorID := h.getUserID(r)
	pgTenant := pgtype.UUID{Bytes: tenantID, Valid: true}
	pgActor := pgtype.UUID{Bytes: actorID, Valid: true}

	path := strings.TrimPrefix(r.URL.Path, "/api/v1/underwriting/conditions/")
	parts := strings.Split(path, "/")
	if len(parts) == 0 || parts[0] == "" {
		middleware.WriteError(w, http.StatusNotFound, "not found")
		return
	}

	condID, err := uuid.Parse(parts[0])
	if err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid condition id")
		return
	}
	pgCondID := pgtype.UUID{Bytes: condID, Valid: true}

	if len(parts) == 1 && (r.Method == http.MethodPatch || r.Method == http.MethodPut) {
		var req struct {
			Status          string `json:"status"`
			ExpectedVersion int32  `json:"expectedVersion"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Status == "" {
			middleware.WriteError(w, http.StatusBadRequest, "status is required")
			return
		}

		updatedCond, err := h.service.repo.Queries().UpdateConditionOptimistic(r.Context(), gen.UpdateConditionOptimisticParams{
			ID:       pgCondID,
			TenantID: pgTenant,
			Status:   gen.ConditionStatus(req.Status),
			Version:  req.ExpectedVersion,
		})
		if err != nil {
			middleware.WriteError(w, http.StatusConflict, "concurrency mismatch: condition was modified by another officer (409 Conflict)")
			return
		}

		middleware.WriteJSON(w, http.StatusOK, updatedCond)
		return
	}

	if len(parts) == 2 && parts[1] == "reminders" && r.Method == http.MethodPost {
		var req struct {
			Channels        []string `json:"channels"`
			MessageTemplate string   `json:"messageTemplate"`
		}
		_ = json.NewDecoder(r.Body).Decode(&req)
		if len(req.Channels) == 0 {
			req.Channels = []string{"chat", "email"}
		}
		if req.MessageTemplate == "" {
			req.MessageTemplate = "condition_due_reminder"
		}

		rem, err := h.service.repo.Queries().CreateConditionReminder(r.Context(), gen.CreateConditionReminderParams{
			TenantID:        pgTenant,
			ConditionID:     pgCondID,
			MessageTemplate: req.MessageTemplate,
			RequestedBy:     pgActor,
		})
		if err != nil {
			middleware.WriteError(w, http.StatusInternalServerError, "failed to create reminder request")
			return
		}

		var deliveries []gen.ConditionReminderDelivery
		for _, ch := range req.Channels {
			del, _ := h.service.repo.Queries().CreateReminderDelivery(r.Context(), gen.CreateReminderDeliveryParams{
				TenantID:          pgTenant,
				ReminderID:        rem.ID,
				Channel:           ch,
				Status:            "sent",
				ProviderMessageID: pgtype.Text{String: fmt.Sprintf("msg_%d", time.Now().UnixNano()), Valid: true},
			})
			deliveries = append(deliveries, del)
		}

		middleware.WriteJSON(w, http.StatusOK, map[string]any{
			"reminder":   rem,
			"deliveries": deliveries,
		})
		return
	}

	middleware.WriteError(w, http.StatusNotFound, "route not found")
}

func (h *Handler) exportCreditMemo(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	tenantID := h.getTenantID(r)
	pgTenant := pgtype.UUID{Bytes: tenantID, Valid: true}
	pgApp := pgtype.UUID{Bytes: appID, Valid: true}

	job, err := h.service.repo.Queries().CreateProcessingJob(r.Context(), gen.CreateProcessingJobParams{
		TenantID:       pgTenant,
		ApplicationID:  pgApp,
		JobType:        "credit_memo_export",
		Status:         gen.JobStatusQueued,
		Payload:        []byte(fmt.Sprintf(`{"applicationId": "%s"}`, appID)),
		MaxAttempts:    3,
		IdempotencyKey: pgtype.Text{String: fmt.Sprintf("export_%s_%d", appID, time.Now().Unix()), Valid: true},
	})
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to queue export job")
		return
	}

	// Create export artifact metadata record
	_, _ = h.service.repo.Queries().CreateExportArtifact(r.Context(), gen.CreateExportArtifactParams{
		TenantID:        pgTenant,
		ApplicationID:   pgApp,
		JobID:           job.ID,
		ArtifactType:    "credit_memo_pdf",
		FileName:        fmt.Sprintf("credit-memo-%s.pdf", appID),
		StorageKey:      fmt.Sprintf("artifacts/memos/%s.pdf", appID),
		Sha256:          "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
		MimeType:        "application/pdf",
		SizeBytes:       284192,
		TemplateVersion: pgtype.Text{String: "v2.0", Valid: true},
		GeneratedBy:     pgtype.UUID{Bytes: h.getUserID(r), Valid: true},
		ExpiresAt:       pgtype.Timestamptz{Time: time.Now().Add(24 * time.Hour), Valid: true},
	})

	middleware.WriteJSON(w, http.StatusAccepted, map[string]any{
		"jobId":  job.ID,
		"status": "queued",
	})
}

func (h *Handler) handleProcessingJobRouter(w http.ResponseWriter, r *http.Request) {
	middleware.SetCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	tenantID := h.getTenantID(r)
	pgTenant := pgtype.UUID{Bytes: tenantID, Valid: true}

	path := strings.TrimPrefix(r.URL.Path, "/api/v1/underwriting/processing-jobs/")
	jobIDStr := strings.Trim(path, "/")
	jobID, err := uuid.Parse(jobIDStr)
	if err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid job id")
		return
	}

	job, err := h.service.repo.Queries().GetProcessingJobByID(r.Context(), gen.GetProcessingJobByIDParams{
		ID:       pgtype.UUID{Bytes: jobID, Valid: true},
		TenantID: pgTenant,
	})
	if err != nil {
		middleware.WriteError(w, http.StatusNotFound, "processing job not found")
		return
	}

	resp := map[string]any{
		"jobId":  job.ID,
		"status": job.Status,
	}

	artifact, err := h.service.repo.Queries().GetExportArtifactByJob(r.Context(), gen.GetExportArtifactByJobParams{
		JobID:    job.ID,
		TenantID: pgTenant,
	})
	if err == nil {
		resp["artifact"] = map[string]any{
			"id":          artifact.ID,
			"fileName":    artifact.FileName,
			"mimeType":    artifact.MimeType,
			"sizeBytes":   artifact.SizeBytes,
			"downloadUrl": fmt.Sprintf("https://cdn.zeyro.com/signed/%s?exp=%d", artifact.StorageKey, time.Now().Add(1*time.Hour).Unix()),
			"expiresAt":   artifact.ExpiresAt.Time,
		}
	}

	middleware.WriteJSON(w, http.StatusOK, resp)
}

func (h *Handler) handleProductionAccessRequests(w http.ResponseWriter, r *http.Request) {
	middleware.SetCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		middleware.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	tenantID := h.getTenantID(r)
	pgTenant := pgtype.UUID{Bytes: tenantID, Valid: true}

	var req struct {
		OrganizationName            string   `json:"organizationName"`
		OrganizationType            string   `json:"organizationType"`
		ExpectedMonthlyApplications int32    `json:"expectedMonthlyApplications"`
		RequestedCapabilities       []string `json:"requestedCapabilities"`
		ContactName                 string   `json:"contactName"`
		ContactEmail                string   `json:"contactEmail"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.OrganizationName == "" {
		middleware.WriteError(w, http.StatusBadRequest, "organizationName is required")
		return
	}

	capsBytes, _ := json.Marshal(req.RequestedCapabilities)
	par, err := h.service.repo.Queries().CreateProductionAccessRequest(r.Context(), gen.CreateProductionAccessRequestParams{
		TenantID:                    pgTenant,
		OrganizationName:            req.OrganizationName,
		OrganizationType:            req.OrganizationType,
		ExpectedMonthlyApplications: req.ExpectedMonthlyApplications,
		RequestedCapabilities:       capsBytes,
		ContactName:                 req.ContactName,
		ContactEmail:                req.ContactEmail,
	})
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to submit production access request")
		return
	}

	middleware.WriteJSON(w, http.StatusCreated, par)
}

func (h *Handler) getAssessment(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	scoreResp, err := h.bfsService.GetScoreResponse(r.Context(), h.getTenantID(r), appID)
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	middleware.WriteJSON(w, http.StatusOK, map[string]any{
		"applicationId": appID,
		"policyAssessment": map[string]any{
			"score":         scoreResp["compositeScore"],
			"status":        "eligible",
			"policyVersion": "msme-policy-v2.0",
			"components":    scoreResp["components"],
		},
		"riskAssessment": map[string]any{
			"probabilityOfDefault": 0.068,
			"riskScore":            792,
			"riskTier":             scoreResp["riskTier"],
			"modelVersion":        "zbue-msme-pd-v1.0",
		},
		"decision": map[string]any{
			"recommendation": "approve",
			"reasonCodes": []string{
				"CONSISTENT_REVENUE_12M",
				"LOW_EMI_OBLIGATION_RATIO",
			},
		},
	})
}

func (h *Handler) runAssessment(w http.ResponseWriter, r *http.Request, appID uuid.UUID) {
	_, err := h.bfsService.CalculateAndSaveBFS(r.Context(), h.getTenantID(r), appID, "Triggered manual risk assessment")
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}
	h.getAssessment(w, r, appID)
}

func numericToFloat(num pgtype.Numeric) float64 {
	if !num.Valid {
		return 0
	}
	f, _ := num.Value()
	if val, ok := f.(float64); ok {
		return val
	}
	return 0
}
