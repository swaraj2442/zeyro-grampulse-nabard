package grampulse

import (
	"context"
	"fmt"
)

// UnderwritingPolicyResult represents the final decision from the Go business logic.
type UnderwritingPolicyResult struct {
	Decision               string   `json:"decision"`
	RepaymentCapacityScore float64  `json:"repaymentCapacityScore"`
	RecommendedLimit       float64  `json:"recommendedLimit"`
	MaximumAffordableEmi   float64  `json:"maximumAffordableEmi"`
	RiskBand               string   `json:"riskBand"`
	ReasonCodes            []string `json:"reasonCodes"`
	ProbabilityOfStress    float64  `json:"probabilityOfStress"`
}

// UnderwriteEnterprise evaluates an enterprise for credit.
// It calls the ML service for the raw stress probability, then applies deterministic rules.
func (s *Service) UnderwriteEnterprise(ctx context.Context, req mlUnderwriteRequest) (*UnderwritingPolicyResult, error) {
	// 1. Call ML Service as a pure Risk Oracle
	// In a real system, we might have a specific /ml/stress-probability endpoint.
	// For now, we simulate the ML output or parse the returned map.

	mlResp, err := s.ml.Underwrite(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("ml risk oracle failed: %w", err)
	}

	// Extract the raw probability of stress from the ML response.
	// If the ML service is not fully updated yet, default to a simulated safe score.
	var probStress float64 = 0.15
	if val, ok := mlResp["probability_of_stress"].(float64); ok {
		probStress = val
	}

	result := &UnderwritingPolicyResult{
		ReasonCodes:         []string{},
		ProbabilityOfStress: probStress,
	}

	// 2. Deterministic Business Policies
	// A. Cash Flow Constraints (Debt-to-Inflow)
	var maxDTI float64 = 0.50

	// Assume operating inflow is roughly annual turnover / 12 for simplistic calculation
	monthlyInflow := req.AnnualTurnover / 12.0

	// Calculate requested EMI (simplified amortization assuming 12% flat for demo)
	requestedEmi := (req.RequestedAmount + (req.RequestedAmount * 0.12)) / float64(req.RequestedTenureMonths)

	totalEmi := req.ScheduledEmiMonthly + requestedEmi
	currentDTI := totalEmi / monthlyInflow

	result.MaximumAffordableEmi = (monthlyInflow * maxDTI) - req.ScheduledEmiMonthly
	if result.MaximumAffordableEmi < 0 {
		result.MaximumAffordableEmi = 0
	}

	// Recommended limit back-calculated from max affordable EMI
	result.RecommendedLimit = result.MaximumAffordableEmi * float64(req.RequestedTenureMonths) / 1.12

	// 3. Rule Evaluation
	approved := true

	if currentDTI > maxDTI {
		result.ReasonCodes = append(result.ReasonCodes, fmt.Sprintf("DTI_EXCEEDS_POLICY: %.2f > %.2f", currentDTI, maxDTI))
		approved = false
	}

	if req.CurrentDPD > 30 {
		result.ReasonCodes = append(result.ReasonCodes, "EXISTING_DELINQUENCY")
		approved = false
	}

	if probStress > 0.70 {
		result.ReasonCodes = append(result.ReasonCodes, "HIGH_PREDICTED_STRESS")
		approved = false
	}

	if req.BusinessVintage < 2 {
		result.ReasonCodes = append(result.ReasonCodes, "VINTAGE_REQUIRES_REVIEW")
	}

	// 4. Final Decision Generation and Risk Tiering
	if probStress < 0.20 {
		result.RiskBand = "Low"
	} else if probStress < 0.45 {
		result.RiskBand = "Medium"
	} else if probStress < 0.70 {
		result.RiskBand = "High"
	} else {
		result.RiskBand = "Very High"
	}

	if !approved {
		result.Decision = "NOT_ELIGIBLE"
		result.RecommendedLimit = 0
		result.RepaymentCapacityScore = 0
	} else {
		if result.RiskBand == "Low" {
			result.Decision = "ELIGIBLE"
		} else if result.RiskBand == "Medium" {
			result.Decision = "CONDITIONALLY_ELIGIBLE"
			// Adjust limit down for medium risk
			result.RecommendedLimit = result.RecommendedLimit * 0.8
		} else {
			result.Decision = "MANUAL_REVIEW"
			result.RecommendedLimit = result.RecommendedLimit * 0.5
		}

		// Cap recommended limit to requested amount
		if result.RecommendedLimit > req.RequestedAmount {
			result.RecommendedLimit = req.RequestedAmount
		}

		result.RepaymentCapacityScore = (1.0 - probStress) * 100
		
		if len(result.ReasonCodes) == 0 {
			result.ReasonCodes = append(result.ReasonCodes, "SATISFACTORY_CASHFLOW_PROJECTION")
		}
	}

	return result, nil
}
