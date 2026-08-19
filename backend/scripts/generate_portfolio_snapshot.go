package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"

	_ "modernc.org/sqlite"

	"github.com/arthazeyro/zeyro-b2b/internal/grampulse"
)

func main() {
	dbPath := "api/grampulse.db"
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	// 1. Get total enterprises
	var count int
	if err := db.QueryRow("SELECT COUNT(*) FROM risk_assessments").Scan(&count); err != nil {
		log.Fatalf("Failed to count risk_assessments: %v", err)
	}

	// 2. Get risk assessments to calculate baseline
	rows, err := db.Query("SELECT risk_level FROM risk_assessments")
	if err != nil {
		log.Fatalf("Failed to fetch risk assessments: %v", err)
	}
	defer rows.Close()

	var healthy, amber, red int
	for rows.Next() {
		var level string
		if err := rows.Scan(&level); err == nil {
			if level == "High" {
				amber++
			} else if level == "Critical" {
				red++
			} else {
				healthy++
			}
		}
	}

	totalValueCr := 15000.0 // Starting 15,000 Cr

	// 3. Generate snapshot
	// Horizons: Now, 30D, 90D, 180D, 365D
	// We'll generate realistic, slightly degraded future scenarios.
	resp := grampulse.PortfolioForecastTimeseriesResponse{
		Growth:   []grampulse.PortfolioForecastDataPoint{}, // Used for Projected Portfolio Cashflow
		Cashflow: []grampulse.PortfolioForecastDataPoint{}, // Used for Net Cash Inflow
		Risk:     []grampulse.PortfolioForecastDataPoint{}, // Used for Credit Risk Score
		Npa:      []grampulse.PortfolioForecastDataPoint{}, // Used for Projected Credit Stress (% at risk)
	}

	// Helper to float pointer
	ptr := func(v float64) *float64 { return &v }

	horizons := []struct {
		Label string
		T     int // months
	}{
		{"Now", 0},
		{"30D", 1},
		{"90D", 3},
		{"180D", 6},
		{"365D", 12},
	}

	for _, h := range horizons {
		// Mock Net Cashflow (starts around 180 Cr/month, declines slightly over time)
		netCash := 180.0 - (float64(h.T) * 4.5) + (rand.Float64() * 5.0)
		dpCash := grampulse.PortfolioForecastDataPoint{Day: h.Label}
		if h.Label == "Now" || h.Label == "30D" {
			dpCash.Actual = ptr(netCash)
		}
		if h.Label != "Now" {
			dpCash.Forecast = ptr(netCash)
			if h.Label == "30D" {
				dpCash.Lower = ptr(netCash)
				dpCash.Upper = ptr(netCash)
			} else {
				dpCash.Lower = ptr(netCash * 0.85)
				dpCash.Upper = ptr(netCash * 1.15)
			}
		}
		resp.Cashflow = append(resp.Cashflow, dpCash)

		// Mock Portfolio Outstanding
		growth := totalValueCr + (float64(h.T) * 125.0)
		dpGrowth := grampulse.PortfolioForecastDataPoint{Day: h.Label}
		if h.Label == "Now" || h.Label == "30D" {
			dpGrowth.Actual = ptr(growth)
		}
		if h.Label != "Now" {
			dpGrowth.Forecast = ptr(growth)
			if h.Label == "30D" {
				dpGrowth.Lower = ptr(growth)
				dpGrowth.Upper = ptr(growth)
			} else {
				dpGrowth.Lower = ptr(growth * 0.96)
				dpGrowth.Upper = ptr(growth * 1.04)
			}
		}
		resp.Growth = append(resp.Growth, dpGrowth)

		// Mock Enterprises at Risk
		baseRiskPct := (float64(amber+red) / float64(count)) * 100.0
		if count == 0 {
			baseRiskPct = 10.5
		}
		riskPct := baseRiskPct + (float64(h.T) * 0.4)
		dpNpa := grampulse.PortfolioForecastDataPoint{Day: h.Label}
		if h.Label == "Now" || h.Label == "30D" {
			dpNpa.Actual = ptr(riskPct)
		}
		if h.Label != "Now" {
			dpNpa.Forecast = ptr(riskPct)
			if h.Label == "30D" {
				dpNpa.Lower = ptr(riskPct)
				dpNpa.Upper = ptr(riskPct)
			} else {
				dpNpa.Lower = ptr(riskPct * 0.9)
				dpNpa.Upper = ptr(riskPct * 1.1)
			}
		}
		resp.Npa = append(resp.Npa, dpNpa)

		// Mock Risk Score
		score := 85.0 - (riskPct * 1.2)
		dpRisk := grampulse.PortfolioForecastDataPoint{Day: h.Label}
		if h.Label == "Now" || h.Label == "30D" {
			dpRisk.Actual = ptr(score)
		}
		if h.Label != "Now" {
			dpRisk.Forecast = ptr(score)
			if h.Label == "30D" {
				dpRisk.Lower = ptr(score)
				dpRisk.Upper = ptr(score)
			} else {
				dpRisk.Lower = ptr(score - 2)
				dpRisk.Upper = ptr(score + 2)
			}
		}
		resp.Risk = append(resp.Risk, dpRisk)
	}

	b, _ := json.MarshalIndent(resp, "", "  ")
	if err := ioutil.WriteFile("data/portfolio_forecast_snapshot.json", b, 0644); err != nil {
		log.Fatalf("WriteFile: %v", err)
	}
	fmt.Println("Wrote data/portfolio_forecast_snapshot.json")
}
