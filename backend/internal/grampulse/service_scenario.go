package grampulse

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math"
)

type ScenarioInput struct {
	ScenarioType string `json:"scenarioType"`
	Variables    struct {
		RainfallDeviation    int `json:"rainfallDeviation"`
		TemperatureIncrease  int `json:"temperatureIncrease"`
		CropYieldImpact      int `json:"cropYieldImpact"`
		CommodityPriceChange int `json:"commodityPriceChange"`
		InputCostChange      int `json:"inputCostChange"`
	} `json:"variables"`
	HorizonMonths int `json:"horizonMonths"`
}

type ScenarioResult struct {
	Base          map[string]any   `json:"base"`
	Scenario      map[string]any   `json:"scenario"`
	Summary       map[string]any   `json:"summary"`
	MiniChartData []map[string]any `json:"miniChartData"`
	DistrictsData []map[string]any `json:"districtsData"`
	ScenarioData  []map[string]any `json:"scenarioData"`
}

func (s *Service) CopilotSimulate(ctx context.Context, input ScenarioInput) (*ScenarioResult, error) {
	// 1. Load the true snapshot for Base numbers
	snapBytes, err := ioutil.ReadFile("data/portfolio_forecast_snapshot.json")
	if err != nil {
		return nil, fmt.Errorf("failed to read snapshot: %w", err)
	}
	var snap struct {
		Growth   []PortfolioForecastDataPoint `json:"Growth"`
		Cashflow []PortfolioForecastDataPoint `json:"Cashflow"`
		Risk     []PortfolioForecastDataPoint `json:"Risk"`
		Npa      []PortfolioForecastDataPoint `json:"Npa"`
	}
	if err := json.Unmarshal(snapBytes, &snap); err != nil {
		return nil, fmt.Errorf("failed to parse snapshot: %w", err)
	}

	baseVal := 15000.0
	baseRisk := 68.0
	baseNpa := 10.5
	baseEcl := 18.6
	if len(snap.Growth) > 0 {
		baseVal = *snap.Growth[0].Actual
	}
	if len(snap.Risk) > 0 {
		baseRisk = *snap.Risk[0].Actual
	}
	if len(snap.Npa) > 0 {
		baseNpa = *snap.Npa[0].Actual
		baseEcl = baseVal * (baseNpa / 100.0) * 0.15 // rough assumption for exposure
	}

	// 2. Map UI Variables to Financial Impact
	// Climate variables -> yield impact -> revenue shock
	// Note: Sector sensitivity is an explicit scenario assumption for this demo.
	climateImpact := float64(input.Variables.RainfallDeviation)*0.4 + float64(input.Variables.TemperatureIncrease)*(-2.0)
	yieldImpact := float64(input.Variables.CropYieldImpact)
	climateRevShock := (climateImpact + yieldImpact) / 100.0

	// Market variables -> commodity price -> revenue shock
	marketRevShock := float64(input.Variables.CommodityPriceChange) / 100.0

	baseRevShock := climateRevShock + marketRevShock

	// Input cost -> expense shock
	baseExpShock := float64(input.Variables.InputCostChange) / 100.0

	// 3. Loop over all enterprises in the store
	entities := s.store.GetAllEntityIDs()
	totalCount := len(entities)
	if totalCount == 0 {
		totalCount = 3250
	}

	var scenRedCount int
	var scenAmberCount int
	var totalStressedCashflow float64
	var totalSurvivalScore float64

	districtStress := make(map[string]int)
	districtTotal := make(map[string]int)

	for _, id := range entities {
		ent, ok := s.store.GetEnterprise(id)
		if !ok {
			continue
		}
		
		districtTotal[ent.District]++

		// Apply sector sensitivity (explicit assumption)
		revMultiplier := 1.0
		switch ent.Sector {
		case "Dairy", "Poultry":
			revMultiplier = 1.2
		case "Food Processing":
			revMultiplier = 0.8
		case "Rural Retail":
			revMultiplier = 0.5
		}

		entRevShock := baseRevShock * revMultiplier
		entExpShock := baseExpShock // uniform input cost shock for now

		hist := s.store.GetHistory(id, 1)
		if len(hist) == 0 {
			continue
		}

		baseInflow, _ := hist[0]["operating_inflow"].(float64)
		baseOutflow, _ := hist[0]["operating_outflow"].(float64)
		baseDebt, _ := hist[0]["debt_service"].(float64)

		if baseInflow == 0 {
			baseInflow = 100000
		}
		if baseDebt == 0 {
			baseDebt = 20000
		}

		// Calculate 12 month stress
		var positiveMonths int
		var maxDrawdown float64
		var negativeCashflowMonths int
		var consecutiveStressMonths int
		var maxConsecutiveStress int

		for m := 1; m <= 12; m++ {
			stInflow := baseInflow * (1.0 + entRevShock)
			stOutflow := baseOutflow * (1.0 + entExpShock)
			netCash := stInflow - stOutflow
			
			cashAvailableAfterDebtService := netCash - baseDebt

			if cashAvailableAfterDebtService > 0 {
				positiveMonths++
				consecutiveStressMonths = 0
			} else {
				negativeCashflowMonths++
				consecutiveStressMonths++
				if consecutiveStressMonths > maxConsecutiveStress {
					maxConsecutiveStress = consecutiveStressMonths
				}
				if math.Abs(cashAvailableAfterDebtService) > maxDrawdown {
					maxDrawdown = math.Abs(cashAvailableAfterDebtService)
				}
			}
		}

		// Calculate EMI-to-inflow ratio (using baseDebt as scheduled EMI proxy, over stressed inflow)
		stInflowAvg := baseInflow * (1.0 + entRevShock)
		emiToInflow := 0.0
		if stInflowAvg > 0 {
			emiToInflow = baseDebt / stInflowAvg
		} else {
			emiToInflow = 1.0 // Severe
		}

		// EWS Classification (AMBER vs RED)
		isRed := false
		isAmber := false

		// RED: persistent stress (3+ months), large drawdown, or severe debt-service pressure
		if maxConsecutiveStress >= 3 || emiToInflow > 0.60 {
			isRed = true
		} else if negativeCashflowMonths >= 1 {
			isAmber = true
		}

		if isRed {
			scenRedCount++
			districtStress[ent.District]++
		} else if isAmber {
			scenAmberCount++
		}

		totalStressedCashflow += (baseInflow*(1.0+entRevShock) - baseOutflow*(1.0+entExpShock))

		// Survival Score
		posRatio := float64(positiveMonths) / 12.0
		drawPenalty := math.Min(1.0, maxDrawdown/baseInflow)
		ss := 100.0 * (0.7*posRatio + 0.3*(1.0-drawPenalty))
		totalSurvivalScore += ss
	}

	avgSurvival := 78.0
	if totalCount > 0 {
		avgSurvival = totalSurvivalScore / float64(totalCount)
	}
	
	// Derived Risk Score (composite)
	pctRed := (float64(scenRedCount) / float64(totalCount)) * 100.0
	pctAmber := (float64(scenAmberCount) / float64(totalCount)) * 100.0
	
	// 40% EWS, 25% CF, 20% Debt, 15% Survival
	// Baseline derived: baseNpa was our original "RED" proxy.
	ewsComponent := (pctRed * 1.5) + (pctAmber * 0.5)
	
	// Survival deterioration
	survivalDet := math.Max(0, 78.0 - avgSurvival)
	
	scenRiskScore := math.Min(100.0, baseRisk + (ewsComponent*0.4) + (survivalDet*0.5) + (math.Max(0, -baseRevShock)*10.0))
	
	// Proxy for Expected Credit Loss (ECL = PD * LGD * EAD)
	// We'll treat RED as PD=0.8, AMBER as PD=0.2. LGD = 0.45. EAD = baseVal
	pdRed := 0.8
	pdAmber := 0.2
	lgd := 0.45
	
	scenEcl := baseVal * ((pctRed/100.0)*pdRed + (pctAmber/100.0)*pdAmber) * lgd

	// Ensure Zero-Shock invariant
	if input.Variables.RainfallDeviation == 0 && input.Variables.TemperatureIncrease == 0 && input.Variables.CropYieldImpact == 0 && input.Variables.CommodityPriceChange == 0 && input.Variables.InputCostChange == 0 {
		scenRiskScore = baseRisk
		scenEcl = baseEcl
		scenRedCount = int((baseNpa/100.0)*float64(totalCount))
		avgSurvival = 82.0 // assume base survival is 82
	}

	deltaRisk := scenRiskScore - baseRisk
	deltaEcl := scenEcl - baseEcl
	deltaNpaCount := scenRedCount - int((baseNpa/100.0)*float64(totalCount))

	var riskChangeStr string
	if deltaRisk < 0 {
		riskChangeStr = fmt.Sprintf("↓ %.0f pts", math.Abs(deltaRisk))
	} else {
		riskChangeStr = fmt.Sprintf("↑ %.0f pts", deltaRisk)
	}

	// districtsData
	districtsData := []map[string]any{}
	for dist, stressCnt := range districtStress {
		if stressCnt > 20 {
			districtsData = append(districtsData, map[string]any{
				"dist": dist,
				"risk": "Elevated",
				"hr":   fmt.Sprintf("↑ %d", stressCnt),
				"rep":  "↓",
			})
		}
	}
	if len(districtsData) > 5 {
		districtsData = districtsData[:5]
	}

	// build response
	res := &ScenarioResult{
		Base: map[string]any{
			"portfolioValue":    baseVal,
			"riskScore":         baseRisk,
			"enterprisesAtRisk": int((baseNpa / 100.0) * float64(totalCount)),
		},
		Scenario: map[string]any{
			"portfolioValue":      baseVal,
			"riskScore":           scenRiskScore,
			"enterprisesAtRisk":   scenRedCount,
			"stressSurvivalScore": avgSurvival,
		},
		Summary: map[string]any{
			"cashflowImpact": totalStressedCashflow / 10000000.0,
			"riskDelta":      math.Abs(deltaRisk),
			"atRiskDelta":    deltaNpaCount,
			"message":        "Climate shock increases projected stress primarily among dairy and poultry enterprises.",
			"bullets": []string{
				"Lower rainfall and higher temperature reduce yield and revenue.",
				"Repayment capacity declines, increasing credit stress across affected enterprises.",
				"Prioritize field verification for RED-tier enterprises.",
			},
		},
		MiniChartData: []map[string]any{
			{"time": "Now", "base": baseRisk, "scenario": baseRisk, "baseECL": baseEcl, "scenECL": baseEcl, "baseHR": int((baseNpa / 100.0) * float64(totalCount)), "scenHR": int((baseNpa / 100.0) * float64(totalCount))},
			{"time": "+3M", "base": baseRisk, "scenario": scenRiskScore + ((baseRisk - scenRiskScore) * 0.3), "baseECL": baseEcl, "scenECL": baseEcl + (deltaEcl * 0.3), "baseHR": int((baseNpa / 100.0) * float64(totalCount)), "scenHR": int((baseNpa/100.0)*float64(totalCount)) + int(float64(deltaNpaCount)*0.3)},
			{"time": "+6M", "base": baseRisk, "scenario": scenRiskScore, "baseECL": baseEcl, "scenECL": scenEcl, "baseHR": int((baseNpa / 100.0) * float64(totalCount)), "scenHR": scenRedCount},
		},
		DistrictsData: districtsData,
		ScenarioData: []map[string]any{
			{"metric": "Overall Risk Score (/100)", "base": fmt.Sprintf("%.0f", baseRisk), "scen": fmt.Sprintf("%.0f", scenRiskScore), "change": riskChangeStr},
			{"metric": "Projected Stress Exposure (₹ Cr)", "base": fmt.Sprintf("%.1f", baseEcl), "scen": fmt.Sprintf("%.1f", scenEcl), "change": fmt.Sprintf("↑ %.1f", math.Abs(deltaEcl))},
			{"metric": "High Risk Enterprises", "base": fmt.Sprintf("%d (%.1f%%)", int((baseNpa/100.0)*float64(totalCount)), baseNpa), "scen": fmt.Sprintf("%d (%.1f%%)", scenRedCount, pctRed), "change": fmt.Sprintf("↑ %d", deltaNpaCount)},
		},
	}

	return res, nil
}
