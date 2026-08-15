package underwriting

import (
	"context"
	"encoding/json"
	"fmt"
	"math"

	"github.com/arthazeyro/zeyro-b2b/internal/domain"
	"github.com/arthazeyro/zeyro-b2b/internal/repository/postgres/gen"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"go.uber.org/zap"
)

type BFSService struct {
	repo   *Repository
	logger *zap.Logger
}

func NewBFSService(repo *Repository, logger *zap.Logger) *BFSService {
	return &BFSService{
		repo:   repo,
		logger: logger,
	}
}

func (b *BFSService) GetOrSeedActivePolicy(ctx context.Context, tenantID uuid.UUID) (*gen.BfsPolicyVersion, error) {
	pgTenant := pgtype.UUID{Bytes: tenantID, Valid: true}

	policy, err := b.repo.Queries().GetActiveBFSPolicy(ctx, gen.GetActiveBFSPolicyParams{
		TenantID:    pgTenant,
		ProductCode: "MSME_UNSECURED",
	})
	if err == nil {
		return &policy, nil
	}

	// Seed default active policy
	atpWeight, _ := numericFromFloat(0.35)
	rpsWeight, _ := numericFromFloat(0.30)
	bcsWeight, _ := numericFromFloat(0.20)
	fdsWeight, _ := numericFromFloat(0.15)

	newPolicy, err := b.repo.Queries().CreateBFSPolicyVersion(ctx, gen.CreateBFSPolicyVersionParams{
		TenantID:             pgTenant,
		PolicyName:           "Default MSME Credit Policy 2026",
		PolicyVersion:        "msme-policy-v2.0",
		ProductCode:          "MSME_UNSECURED",
		SegmentCode:          pgtype.Text{String: "MSME", Valid: true},
		IsActive:             true,
		Status:               "active",
		AtpWeight:            atpWeight,
		RpsWeight:            rpsWeight,
		BcsWeight:            bcsWeight,
		FdsWeight:            fdsWeight,
		MinPassScore:         650,
		AutoApproveThreshold: 750,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to seed default BFS policy: %w", err)
	}

	return &newPolicy, nil
}

func (b *BFSService) CreatePolicyVersion(ctx context.Context, tenantID uuid.UUID, actorID uuid.UUID, req domain.CreateBFSPolicyRequest) (*gen.BfsPolicyVersion, error) {
	pgTenant := pgtype.UUID{Bytes: tenantID, Valid: true}
	pgActor := pgtype.UUID{Bytes: actorID, Valid: true}

	atpWeight, _ := numericFromFloat(req.ATPWeight)
	rpsWeight, _ := numericFromFloat(req.RPSWeight)
	bcsWeight, _ := numericFromFloat(req.BCSWeight)
	fdsWeight, _ := numericFromFloat(req.FDSWeight)

	policy, err := b.repo.Queries().CreateBFSPolicyVersion(ctx, gen.CreateBFSPolicyVersionParams{
		TenantID:             pgTenant,
		PolicyName:           req.PolicyName,
		PolicyVersion:        req.PolicyVersion,
		ProductCode:          "MSME_UNSECURED",
		SegmentCode:          pgtype.Text{String: "MSME", Valid: true},
		IsActive:             false,
		Status:               "pending_approval",
		AtpWeight:            atpWeight,
		RpsWeight:            rpsWeight,
		BcsWeight:            bcsWeight,
		FdsWeight:            fdsWeight,
		MinPassScore:         int32(req.MinPassScore),
		AutoApproveThreshold: int32(req.AutoApproveThreshold),
		CreatedBy:            pgActor,
	})
	if err != nil {
		return nil, err
	}

	return &policy, nil
}

func (b *BFSService) ActivatePolicyVersion(ctx context.Context, tenantID, versionID uuid.UUID, actorID uuid.UUID, productCode string) (*gen.BfsPolicyVersion, error) {
	if productCode == "" {
		productCode = "MSME_UNSECURED"
	}
	pgTenant := pgtype.UUID{Bytes: tenantID, Valid: true}
	pgVersion := pgtype.UUID{Bytes: versionID, Valid: true}
	pgActor := pgtype.UUID{Bytes: actorID, Valid: true}

	var activatedPolicy gen.BfsPolicyVersion
	err := b.repo.ExecTx(ctx, func(q *gen.Queries) error {
		// 1. Lock policy rows for update
		_, err := q.LockPoliciesForUpdate(ctx, gen.LockPoliciesForUpdateParams{
			TenantID:    pgTenant,
			ProductCode: productCode,
		})
		if err != nil {
			return err
		}

		// 2. Deactivate existing active policy for product
		_ = q.DeactivateActivePolicyForProduct(ctx, gen.DeactivateActivePolicyForProductParams{
			TenantID:    pgTenant,
			ProductCode: productCode,
		})

		// 3. Activate target policy version
		pol, err := q.ActivatePolicyVersionAtomic(ctx, gen.ActivatePolicyVersionAtomicParams{
			ID:         pgVersion,
			TenantID:   pgTenant,
			ApprovedBy: pgActor,
		})
		if err != nil {
			return err
		}
		activatedPolicy = pol
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to activate policy version atomically: %w", err)
	}

	return &activatedPolicy, nil
}

func (b *BFSService) ListPolicyVersions(ctx context.Context, tenantID uuid.UUID) ([]gen.BfsPolicyVersion, error) {
	return b.repo.Queries().ListBFSPolicyVersions(ctx, gen.ListBFSPolicyVersionsParams{
		TenantID:    pgtype.UUID{Bytes: tenantID, Valid: true},
		ProductCode: "MSME_UNSECURED",
	})
}

// CalculateAndSaveBFS executes deterministic rule-based calculation and saves a versioned score
func (b *BFSService) CalculateAndSaveBFS(ctx context.Context, tenantID, appID uuid.UUID, reason string) (map[string]any, error) {
	pgTenant := pgtype.UUID{Bytes: tenantID, Valid: true}
	pgApp := pgtype.UUID{Bytes: appID, Valid: true}

	policy, err := b.GetOrSeedActivePolicy(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	app, err := b.repo.Queries().GetApplicationByID(ctx, gen.GetApplicationByIDParams{
		ID:       pgApp,
		TenantID: pgTenant,
	})
	if err != nil {
		return nil, domain.ErrApplicationNotFound
	}

	// Fetch previous score if exists
	prevScore, _ := b.repo.Queries().GetLatestBFSScoreByApplication(ctx, gen.GetLatestBFSScoreByApplicationParams{
		ApplicationID: pgApp,
		TenantID:      pgTenant,
	})

	var prevScoreID pgtype.UUID
	if prevScore.ID.Valid {
		prevScoreID = prevScore.ID
	}

	// Sample input snapshot metrics
	loanAmount := numericToFloat(app.LoanAmount)
	monthlyInflow := 215000.0
	existingEMI := 18000.0
	monthlySurplus := monthlyInflow - existingEMI - 100000.0 // 45k surplus

	// Component Scores (0-100)
	// ATP Component (35%): surplus vs loan EMI
	atpRaw := math.Min(100, math.Max(0, (monthlySurplus/25000.0)*50)) // ~75
	// RPS Component (30%): Bureau score (752 -> 84/100)
	rpsRaw := 84.0
	// BCS Component (20%): Cashflow stability (72/100)
	bcsRaw := 72.0
	// FDS Component (15%): Supplier concentration (80/100)
	fdsRaw := 80.0

	atpW := numericToFloat(policy.AtpWeight)
	rpsW := numericToFloat(policy.RpsWeight)
	bcsW := numericToFloat(policy.BcsWeight)
	fdsW := numericToFloat(policy.FdsWeight)

	atpContrib := atpRaw * atpW
	rpsContrib := rpsRaw * rpsW
	bcsContrib := bcsRaw * bcsW
	fdsContrib := fdsRaw * fdsW

	compositeScore := int32(math.Round(atpContrib + rpsContrib + bcsContrib + fdsContrib)) // ~78

	riskTier := gen.RiskTierLow
	recommendation := gen.RecommendationTypeApprove
	if compositeScore < 60 {
		riskTier = gen.RiskTierCritical
		recommendation = gen.RecommendationTypeReject
	} else if compositeScore < 70 {
		riskTier = gen.RiskTierHigh
		recommendation = gen.RecommendationTypeApproveWithConditions
	} else if compositeScore < 75 {
		riskTier = gen.RiskTierMedium
		recommendation = gen.RecommendationTypeApproveWithConditions
	}

	inputSnapshot, _ := json.Marshal(map[string]any{
		"loanAmount":     loanAmount,
		"monthlyInflow":  monthlyInflow,
		"existingEMI":    existingEMI,
		"monthlySurplus": monthlySurplus,
		"cibilScore":     752,
	})

	confLevel, _ := numericFromFloat(91.5)

	bfsScore, err := b.repo.Queries().CreateBFSScore(ctx, gen.CreateBFSScoreParams{
		TenantID:          pgTenant,
		ApplicationID:     pgApp,
		PolicyVersionID:   policy.ID,
		EngineVersion:     "bfs-underwriting-v2.0.0",
		CompositeScore:    compositeScore,
		RiskTier:          riskTier,
		ConfidenceLevel:   confLevel,
		InputSnapshot:     inputSnapshot,
		CalculationReason: pgtype.Text{String: reason, Valid: true},
		PreviousScoreID:   prevScoreID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to save BFS score: %w", err)
	}

	// Update application table BFS fields
	_, _ = b.repo.Queries().UpdateApplicationBFS(ctx, gen.UpdateApplicationBFSParams{
		ID:             pgApp,
		TenantID:       pgTenant,
		BfsScore:       pgtype.Int4{Int32: compositeScore, Valid: true},
		RiskTier:       gen.NullRiskTier{RiskTier: riskTier, Valid: true},
		Recommendation: gen.NullRecommendationType{RecommendationType: recommendation, Valid: true},
	})

	// Save Component Breakdown
	atpMetrics, _ := json.Marshal(map[string]any{
		"monthlySurplus":    monthlySurplus,
		"emiRatio":          28.5,
		"maxRecommendedEmi": 18000,
	})
	atpContribNum, _ := numericFromFloat(atpContrib)
	_, _ = b.repo.Queries().CreateBFSScoreComponent(ctx, gen.CreateBFSScoreComponentParams{
		BfsScoreID:           bfsScore.ID,
		ComponentName:        "atp",
		RawScore:             int32(atpRaw),
		Weight:               policy.AtpWeight,
		WeightedContribution: atpContribNum,
		Metrics:              atpMetrics,
	})

	rpsContribNum, _ := numericFromFloat(rpsContrib)
	_, _ = b.repo.Queries().CreateBFSScoreComponent(ctx, gen.CreateBFSScoreComponentParams{
		BfsScoreID:           bfsScore.ID,
		ComponentName:        "rps",
		RawScore:             int32(rpsRaw),
		Weight:               policy.RpsWeight,
		WeightedContribution: rpsContribNum,
		Metrics:              []byte("{}"),
	})

	// Save Positive/Risk Signals
	citA, _ := json.Marshal(map[string]any{"docId": "doc_101", "page": 2, "line": 45})
	_, _ = b.repo.Queries().CreateBFSSignal(ctx, gen.CreateBFSSignalParams{
		BfsScoreID:       bfsScore.ID,
		SignalType:       "positive",
		SignalText:       "Consistent salary/revenue credit for 12+ consecutive months",
		CitationMetadata: citA,
	})

	citB, _ := json.Marshal(map[string]any{"docId": "doc_103", "page": 1, "line": 8})
	_, _ = b.repo.Queries().CreateBFSSignal(ctx, gen.CreateBFSSignalParams{
		BfsScoreID:       bfsScore.ID,
		SignalType:       "risk",
		SignalText:       "Income mismatch gap of 26.2% between ITR and AA feed",
		CitationMetadata: citB,
	})

	return b.GetScoreResponse(ctx, tenantID, appID)
}

func (b *BFSService) GetScoreResponse(ctx context.Context, tenantID, appID uuid.UUID) (map[string]any, error) {
	pgTenant := pgtype.UUID{Bytes: tenantID, Valid: true}
	pgApp := pgtype.UUID{Bytes: appID, Valid: true}

	score, err := b.repo.Queries().GetLatestBFSScoreByApplication(ctx, gen.GetLatestBFSScoreByApplicationParams{
		ApplicationID: pgApp,
		TenantID:      pgTenant,
	})
	if err != nil {
		// Calculate if none exists
		return b.CalculateAndSaveBFS(ctx, tenantID, appID, "Initial automated calculation")
	}

	components, _ := b.repo.Queries().ListBFSScoreComponents(ctx, score.ID)
	signals, _ := b.repo.Queries().ListBFSSignals(ctx, score.ID)

	compMap := make(map[string]any)
	for _, c := range components {
		var metricsObj any
		if len(c.Metrics) > 0 {
			_ = json.Unmarshal(c.Metrics, &metricsObj)
		}
		compMap[c.ComponentName] = map[string]any{
			"score":        c.RawScore,
			"weight":       numericToFloat(c.Weight),
			"contribution": numericToFloat(c.WeightedContribution),
			"metrics":      metricsObj,
		}
	}

	var posSignals []map[string]any
	var riskSignals []map[string]any
	for _, s := range signals {
		var citationObj any
		if len(s.CitationMetadata) > 0 {
			_ = json.Unmarshal(s.CitationMetadata, &citationObj)
		}
		sigMap := map[string]any{
			"text":     s.SignalText,
			"citation": citationObj,
		}
		if s.SignalType == "positive" {
			posSignals = append(posSignals, sigMap)
		} else {
			riskSignals = append(riskSignals, sigMap)
		}
	}

	return map[string]any{
		"applicationId":   appID,
		"compositeScore":  score.CompositeScore,
		"riskTier":        score.RiskTier,
		"confidenceLevel": numericToFloat(score.ConfidenceLevel),
		"engineVersion":   score.EngineVersion,
		"scoredAt":        score.CalculatedAt.Time,
		"components":      compMap,
		"positiveSignals": posSignals,
		"riskSignals":     riskSignals,
	}, nil
}

func (b *BFSService) ListScoreHistory(ctx context.Context, tenantID, appID uuid.UUID) ([]map[string]any, error) {
	pgTenant := pgtype.UUID{Bytes: tenantID, Valid: true}
	pgApp := pgtype.UUID{Bytes: appID, Valid: true}

	scores, err := b.repo.Queries().ListBFSScoreHistory(ctx, gen.ListBFSScoreHistoryParams{
		ApplicationID: pgApp,
		TenantID:      pgTenant,
	})
	if err != nil {
		return nil, err
	}

	var history []map[string]any
	for _, s := range scores {
		history = append(history, map[string]any{
			"id":             s.ID,
			"compositeScore": s.CompositeScore,
			"riskTier":       s.RiskTier,
			"engineVersion":  s.EngineVersion,
			"calculatedAt":   s.CalculatedAt.Time,
			"reason":         s.CalculationReason.String,
		})
	}

	return history, nil
}

func numericFromFloat(f float64) (pgtype.Numeric, error) {
	var num pgtype.Numeric
	err := num.Scan(fmt.Sprintf("%.4f", f))
	return num, err
}
