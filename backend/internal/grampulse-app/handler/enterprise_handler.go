package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/arthazeyro/zeyro-b2b/internal/grampulse-app/service"
)

type EnterpriseHandler struct {
	service *service.EnterpriseService
}

func NewEnterpriseHandler(service *service.EnterpriseService) *EnterpriseHandler {
	return &EnterpriseHandler{service: service}
}

type APIResponse struct {
	Success bool   `json:"success"`
	Data    any    `json:"data,omitempty"`
	Error   string `json:"error,omitempty"`
}

func (h *EnterpriseHandler) respondJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func (h *EnterpriseHandler) ListEnterprises(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	filter := r.URL.Query().Get("status")
	search := r.URL.Query().Get("search")

	list, err := h.service.ListEnterprises(ctx, filter, search)
	if err != nil {
		h.respondJSON(w, http.StatusInternalServerError, APIResponse{Success: false, Error: err.Error()})
		return
	}

	h.respondJSON(w, http.StatusOK, APIResponse{Success: true, Data: list})
}

func (h *EnterpriseHandler) GetEnterprise(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := chi.URLParam(r, "id")

	enterprise, err := h.service.GetEnterprise(ctx, id)
	if err != nil {
		h.respondJSON(w, http.StatusInternalServerError, APIResponse{Success: false, Error: err.Error()})
		return
	}
	if enterprise == nil {
		h.respondJSON(w, http.StatusNotFound, APIResponse{Success: false, Error: "Enterprise not found"})
		return
	}

	h.respondJSON(w, http.StatusOK, APIResponse{Success: true, Data: enterprise})
}

func (h *EnterpriseHandler) GetSubScreen(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := chi.URLParam(r, "id")
	screenType := chi.URLParam(r, "screen")

	data, err := h.service.GetSubScreen(ctx, id, screenType)
	if err != nil {
		h.respondJSON(w, http.StatusInternalServerError, APIResponse{Success: false, Error: err.Error()})
		return
	}
	if data == nil {
		h.respondJSON(w, http.StatusNotFound, APIResponse{Success: false, Error: "Screen data not found"})
		return
	}

	h.respondJSON(w, http.StatusOK, APIResponse{Success: true, Data: data})
}

func (h *EnterpriseHandler) GetAllSubscreens(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := chi.URLParam(r, "id")

	data, err := h.service.GetAllSubscreens(ctx, id)
	if err != nil {
		h.respondJSON(w, http.StatusInternalServerError, APIResponse{Success: false, Error: err.Error()})
		return
	}

	h.respondJSON(w, http.StatusOK, APIResponse{Success: true, Data: data})
}

func (h *EnterpriseHandler) ListVisits(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	visits, err := h.service.ListVisits(ctx)
	if err != nil {
		h.respondJSON(w, http.StatusInternalServerError, APIResponse{Success: false, Error: err.Error()})
		return
	}
	h.respondJSON(w, http.StatusOK, APIResponse{Success: true, Data: visits})
}

func (h *EnterpriseHandler) ListInterventions(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	interventions, err := h.service.ListInterventions(ctx)
	if err != nil {
		h.respondJSON(w, http.StatusInternalServerError, APIResponse{Success: false, Error: err.Error()})
		return
	}
	h.respondJSON(w, http.StatusOK, APIResponse{Success: true, Data: interventions})
}

func (h *EnterpriseHandler) ListAlerts(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	alerts, err := h.service.ListAlerts(ctx)
	if err != nil {
		h.respondJSON(w, http.StatusInternalServerError, APIResponse{Success: false, Error: err.Error()})
		return
	}
	h.respondJSON(w, http.StatusOK, APIResponse{Success: true, Data: alerts})
}

func (h *EnterpriseHandler) GetOfficer(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	officer, err := h.service.GetOfficer(ctx)
	if err != nil {
		h.respondJSON(w, http.StatusInternalServerError, APIResponse{Success: false, Error: err.Error()})
		return
	}
	h.respondJSON(w, http.StatusOK, APIResponse{Success: true, Data: officer})
}

func (h *EnterpriseHandler) GetPortfolioSummary(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	summary, err := h.service.GetPortfolioSummary(ctx)
	if err != nil {
		h.respondJSON(w, http.StatusInternalServerError, APIResponse{Success: false, Error: err.Error()})
		return
	}
	h.respondJSON(w, http.StatusOK, APIResponse{Success: true, Data: summary})
}
