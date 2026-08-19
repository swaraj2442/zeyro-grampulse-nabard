package service

import (
	"context"

	"github.com/arthazeyro/zeyro-b2b/internal/grampulse-app/models"
	"github.com/arthazeyro/zeyro-b2b/internal/grampulse-app/repository"
)

type EnterpriseService struct {
	repo repository.EnterpriseRepository
}

func NewEnterpriseService(repo repository.EnterpriseRepository) *EnterpriseService {
	return &EnterpriseService{repo: repo}
}

func (s *EnterpriseService) ListEnterprises(ctx context.Context, filter string, search string) ([]models.Enterprise, error) {
	return s.repo.GetAll(ctx, filter, search)
}

func (s *EnterpriseService) GetEnterprise(ctx context.Context, id string) (*models.Enterprise, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *EnterpriseService) GetSubScreen(ctx context.Context, enterpriseID string, screenType string) (any, error) {
	return s.repo.GetSubScreenData(ctx, enterpriseID, screenType)
}

func (s *EnterpriseService) GetAllSubscreens(ctx context.Context, enterpriseID string) (map[string]any, error) {
	return s.repo.GetAllSubscreens(ctx, enterpriseID)
}

func (s *EnterpriseService) ListVisits(ctx context.Context) ([]models.Visit, error) {
	return s.repo.GetVisits(ctx)
}

func (s *EnterpriseService) ListInterventions(ctx context.Context) ([]models.Intervention, error) {
	return s.repo.GetInterventions(ctx)
}

func (s *EnterpriseService) ListAlerts(ctx context.Context) ([]models.Alert, error) {
	return s.repo.GetAlerts(ctx)
}

func (s *EnterpriseService) GetOfficer(ctx context.Context) (*models.OfficerProfile, error) {
	return s.repo.GetOfficerProfile(ctx)
}

func (s *EnterpriseService) GetPortfolioSummary(ctx context.Context) (*models.PortfolioSummary, error) {
	return s.repo.GetPortfolioSummary(ctx)
}
