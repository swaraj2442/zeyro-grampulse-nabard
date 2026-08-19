package database

import (
	"fmt"
	"time"

	"github.com/arthazeyro/zeyro-b2b/internal/grampulse-app/models"
)

func getSeedEnterprises() []models.Enterprise {
	return []models.Enterprise{
		// 1. Ramesh Patil - Dairy Business (Critical)
		{
			ID:                     "ent_ramesh",
			Name:                   "Ramesh Patil",
			Location:               "Borgaon, Nashik",
			Sector:                 "Dairy Business",
			Since:                  "2019",
			Revenue:                45000,
			Status:                 "Critical",
			BankBalance:            "₹42,000",
			AccountFlow30Day:       "-₹5,000",
			LiquidityCoverage:      "15 days",
			LowestProjectedBalance: "₹12,000 · Next week",
			OutlookString:          "Tight cash flow expected",
			NextEventString:        "Projected stress window: 1-5 Sep",
			CashDeficitProjected:   true,
			ShortfallAmount:        8000,
			KeyDrivers:             []string{"↑ Feed costs +8.7%", "↓ Income -4%", "Delay in cooperative payout"},
			CashFlowStatus:         "Stressed",
			ObligationCoverage:     "At Risk",
			MarketSignal:           "Input costs rising (Feed +8.7%)",
			ClimateAlert:           "None",
			IntelligenceFacts:      []string{"Operating cash declined 12%", "Upcoming repayment at risk for Sep 15"},
			SuggestedAttention:     "Discuss cash buffer for upcoming repayment and explore fodder substitution.",
			CompositeIndicators: []models.CompositeIndicator{
				{Name: "Financial", Score: 58, Label: "Weak", Evidence: "Negative 30-day net cash flow and rising feed inflation"},
				{Name: "Credit", Score: 55, Label: "At Risk", Evidence: "Upcoming Kisan Credit Card EMI at risk of shortfall"},
			},
			FinancialIntelligence: models.FinancialIntelligence{
				CurrentCash:         "₹12K",
				CashStatusBadge:     "Tight cash position",
				CashStatusSubtitle:  "High probability of deficit during 1-5 Sep window.",
				ExpectedInflow:      "₹28K",
				ExpectedOutflow:     "₹35K",
				UpcomingRepayment:   "₹8K",
				NextReviewDate:      "28 Aug",
				CashOutlookStatus:   "Stressed",
				CashOutlookSubtitle: "Deficit expected.",
				IncomeAmount:        "₹1.4L",
				ExpensesAmount:      "₹1.5L",
			},
			IncomeData: models.IncomeData{
				SourceName:     "Main milk sales",
				ExpectedAmount: "₹28K",
				Period:         "This month",
				TrendBadge:     "Declining (-4%)",
				TrendData:      []float64{35000, 32000, 28000, 25000},
				LatestAmount:   "₹5,000",
				LatestDate:     "28 Aug 2025",
				History: []models.RecentCollection{
					{Date: "28 Aug 2025", Amount: "₹5,000"},
					{Date: "21 Aug 2025", Amount: "₹7,500"},
					{Date: "14 Aug 2025", Amount: "₹8,200"},
					{Date: "07 Aug 2025", Amount: "₹7,300"},
				},
				AIExplanation: "Income is trending downward due to late monsoon cooperative collection payout delays.",
			},
			ExpensesData: models.ExpensesData{
				TotalExpenses: "₹35,000",
				Period:        "This month",
				KeyInsight:    "Rising feed costs (+8.7%) dominate outflows.",
				Categories: []models.ExpenseCategory{
					{Title: "Cattle Feed & Silage", Subtitle: "Commercial feed mix & concentrates", BadgeText: "Rising (+8.7%)", IsRising: true, Amount: "₹18,500", Percentage: "53%", PercentageSubtitle: "of monthly outflow"},
					{Title: "Loan EMI Repayment", Subtitle: "Kisan Credit Card EMI", BadgeText: "Fixed", IsRising: false, Amount: "₹8,000", Percentage: "23%", PercentageSubtitle: "of monthly outflow"},
					{Title: "Veterinary & Medicine", Subtitle: "Routine upkeep", BadgeText: "Stable", IsRising: false, Amount: "₹5,000", Percentage: "14%", PercentageSubtitle: "of monthly outflow"},
					{Title: "Utilities & Fuel", Subtitle: "Shed power & transport", BadgeText: "Stable", IsRising: false, Amount: "₹3,500", Percentage: "10%", PercentageSubtitle: "of monthly outflow"},
				},
			},
			CashFlowData: models.CashFlowData{
				AvgInflow:  "₹48K",
				AvgOutflow: "₹31K",
				AIInsight:  "Cash buffer is tight; expenses exceed projected inflows in September.",
				ChartData: []models.CashFlowDataPoint{
					{Month: "May", Inflow: 45000, Outflow: 30000},
					{Month: "Jun", Inflow: 48000, Outflow: 32000},
					{Month: "Jul", Inflow: 42000, Outflow: 29000},
					{Month: "Aug", Inflow: 51000, Outflow: 34000},
					{Month: "Sep", Inflow: 28000, Outflow: 42000, IsTighterMonth: true, TighterMonthLabel: "Deficit Window"},
					{Month: "Oct", Inflow: 38000, Outflow: 32000},
				},
				Summary: models.CashFlowSummary{
					LowestBalance:          "₹12,000",
					LowestBalanceSubtitle:  "Expected in September due to feed purchase and loan EMI.",
					HighestBalance:         "₹45,000",
					HighestBalanceSubtitle: "Achieved in August during peak dispatch.",
					AverageMonthly:         "₹14,000",
				},
			},
			CashForecastData: models.CashForecastData{
				AIInsight: "September is a high-risk month with closing cash dropping to ₹12,000 due to feed bulk purchase (₹18.5K) and quarterly loan EMI (₹8K).",
				Data: []models.CashForecastDataPoint{
					{Month: "Aug", InflowStr: "₹45,000", OutflowStr: "₹35,000", ClosingStr: "₹42,000", Inflow: 45000, Outflow: 35000, Closing: 42000},
					{Month: "Sep", InflowStr: "₹28,000", OutflowStr: "₹42,000", ClosingStr: "₹12,000", Inflow: 28000, Outflow: 42000, Closing: 12000, IsDangerMonth: true},
					{Month: "Oct", InflowStr: "₹38,000", OutflowStr: "₹32,000", ClosingStr: "₹18,000", Inflow: 38000, Outflow: 32000, Closing: 18000},
					{Month: "Nov", InflowStr: "₹44,000", OutflowStr: "₹31,000", ClosingStr: "₹31,000", Inflow: 44000, Outflow: 31000, Closing: 31000},
					{Month: "Dec", InflowStr: "₹46,000", OutflowStr: "₹33,000", ClosingStr: "₹44,000", Inflow: 46000, Outflow: 33000, Closing: 44000},
					{Month: "Jan", InflowStr: "₹48,000", OutflowStr: "₹32,000", ClosingStr: "₹60,000", Inflow: 48000, Outflow: 32000, Closing: 60000},
				},
			},
			ObligationsData: models.ObligationsData{
				Summary: models.ObligationsSummary{
					NextDueAmountStr: "₹8,000",
					NextDueDateStr:   "15 Sep 2025",
					Total3MonthsStr:  "₹24,000",
				},
				Obligations: []models.Obligation{
					{Title: "Monthly EMI – Kisan Credit", AmountStr: "₹8,000", DateStr: "15 Sep 2025", IsRepayment: true, Status: "watch"},
					{Title: "Monthly EMI – Kisan Credit", AmountStr: "₹8,000", DateStr: "15 Oct 2025", IsRepayment: true, Status: "onTrack"},
					{Title: "Monthly EMI – Kisan Credit", AmountStr: "₹8,000", DateStr: "15 Nov 2025", IsRepayment: true, Status: "onTrack"},
				},
			},
			ForecastExplanationData: models.ForecastExplanationData{
				TargetMonth:   "September",
				SummaryText:   "September cash buffer is projected to drop below ₹15K due to simultaneous feed bulk procurement and loan repayment.",
				AIExplanation: "Historical inflow drops by 18% in late monsoon while feed costs peak. Advance planning for working capital buffer recommended.",
				Factors: []models.ExplanationFactor{
					{Title: "Concentrated cattle feed procurement", Subtitle: "Seasonal bulk purchase at higher spot rates", StatValue: "₹18,500", StatSubtitle: "Expected on Sep 5", IconType: "feed", StatusText: "High outflow", StatusType: "warning"},
					{Title: "Kisan Credit Card EMI repayment", Subtitle: "Quarterly obligation due", StatValue: "₹8,000", StatSubtitle: "Due on Sep 15", IconType: "repayment", StatusText: "Fixed liability", StatusType: "warning"},
					{Title: "Milk collection center delay", Subtitle: "Cooperative payout cycle shifts by 7 days", StatValue: "₹12,000", StatSubtitle: "Delayed to Sep 22", IconType: "sales", StatusText: "Timing mismatch", StatusType: "warning"},
				},
			},
			LoanAmount:    100000,
			NextEmiAmount: 8000,
			NextEmiDays:   15,
			UpdatedAt:     time.Now(),
		},

		// 2. Suresh Jadhav - Dairy Business (Stable)
		{
			ID:                     "ent_suresh",
			Name:                   "Suresh Jadhav",
			Location:               "Niphad, Nashik",
			Sector:                 "Dairy Business",
			Since:                  "2019",
			Revenue:                52000,
			Status:                 "Stable",
			BankBalance:            "₹58,000",
			AccountFlow30Day:       "+₹8,000",
			LiquidityCoverage:      "45 days",
			LowestProjectedBalance: "₹38,000 · Late Sep",
			OutlookString:          "Positive surplus trend",
			NextEventString:        "Cooperative bonus payout: 10 Oct",
			CashDeficitProjected:   false,
			ShortfallAmount:        0,
			KeyDrivers:             []string{"↑ Milk yield +6%", "→ Stable annual feed contract"},
			CashFlowStatus:         "Healthy",
			ObligationCoverage:     "Strong",
			MarketSignal:           "Stable milk prices (Contracted)",
			ClimateAlert:           "None",
			IntelligenceFacts:      []string{"Operating cash growing +15%", "All repayments 100% on track"},
			SuggestedAttention:     "Opportunity for yield expansion and herd addition financing.",
			CompositeIndicators: []models.CompositeIndicator{
				{Name: "Financial", Score: 85, Label: "Strong", Evidence: "Consistent positive net cash flow"},
				{Name: "Credit", Score: 90, Label: "Low Risk", Evidence: "Zero repayment defaults in 24 months"},
			},
			FinancialIntelligence: models.FinancialIntelligence{
				CurrentCash:         "₹58K",
				CashStatusBadge:     "Adequate cash buffer",
				CashStatusSubtitle:  "Well positioned for regular operations.",
				ExpectedInflow:      "₹52K",
				ExpectedOutflow:     "₹36K",
				UpcomingRepayment:   "₹6K",
				NextReviewDate:      "15 Sep",
				CashOutlookStatus:   "Positive",
				CashOutlookSubtitle: "Surplus expected.",
				IncomeAmount:        "₹2.1L",
				ExpensesAmount:      "₹1.4L",
			},
			IncomeData: models.IncomeData{
				SourceName:     "Daily milk dispatch",
				ExpectedAmount: "₹52K",
				Period:         "This month",
				TrendBadge:     "Growing (+6%)",
				TrendData:      []float64{45000, 48000, 50000, 52000},
				LatestAmount:   "₹12,500",
				LatestDate:     "28 Aug 2025",
				History: []models.RecentCollection{
					{Date: "28 Aug 2025", Amount: "₹12,500"},
					{Date: "21 Aug 2025", Amount: "₹13,000"},
					{Date: "14 Aug 2025", Amount: "₹13,200"},
					{Date: "07 Aug 2025", Amount: "₹13,300"},
				},
				AIExplanation: "Consistent daily supply to Amul collection hub maintains steady revenue flow.",
			},
			ExpensesData: models.ExpensesData{
				TotalExpenses: "₹36,000",
				Period:        "This month",
				KeyInsight:    "Feed costs locked under annual supplier contract (₹26/kg).",
				Categories: []models.ExpenseCategory{
					{Title: "Direct Fodder Contract", Subtitle: "Annual rate contract fodder", BadgeText: "Contracted", IsRising: false, Amount: "₹17,000", Percentage: "47%", PercentageSubtitle: "of monthly outflow"},
					{Title: "Dairy Equipment EMI", Subtitle: "Milking machine loan installment", BadgeText: "Fixed", IsRising: false, Amount: "₹6,000", Percentage: "17%", PercentageSubtitle: "of monthly outflow"},
					{Title: "Veterinary Care", Subtitle: "Routine preventive checkups", BadgeText: "Stable", IsRising: false, Amount: "₹5,000", Percentage: "14%", PercentageSubtitle: "of monthly outflow"},
					{Title: "Labor & Logistics", Subtitle: "Helper wages and van diesel", BadgeText: "Stable", IsRising: false, Amount: "₹8,000", Percentage: "22%", PercentageSubtitle: "of monthly outflow"},
				},
			},
			CashFlowData: models.CashFlowData{
				AvgInflow:  "₹55K",
				AvgOutflow: "₹38K",
				AIInsight:  "Strong operational cash flow backed by prompt cooperative settlements.",
				ChartData: []models.CashFlowDataPoint{
					{Month: "May", Inflow: 50000, Outflow: 34000},
					{Month: "Jun", Inflow: 52000, Outflow: 35000},
					{Month: "Jul", Inflow: 54000, Outflow: 36000},
					{Month: "Aug", Inflow: 52000, Outflow: 36000},
					{Month: "Sep", Inflow: 48000, Outflow: 38000},
					{Month: "Oct", Inflow: 54000, Outflow: 37000},
				},
				Summary: models.CashFlowSummary{
					LowestBalance:          "₹38,000",
					LowestBalanceSubtitle:  "Expected in September during routine maintenance.",
					HighestBalance:         "₹85,000",
					HighestBalanceSubtitle: "Projected in October with cooperative bonus.",
					AverageMonthly:         "₹17,000",
				},
			},
			CashForecastData: models.CashForecastData{
				AIInsight: "Cash position remains steady with surplus accumulation. Consistent collection cycles cushion any seasonal cattle medical expenses.",
				Data: []models.CashForecastDataPoint{
					{Month: "Aug", InflowStr: "₹52,000", OutflowStr: "₹36,000", ClosingStr: "₹58,000", Inflow: 52000, Outflow: 36000, Closing: 58000},
					{Month: "Sep", InflowStr: "₹48,000", OutflowStr: "₹38,000", ClosingStr: "₹68,000", Inflow: 48000, Outflow: 38000, Closing: 68000},
					{Month: "Oct", InflowStr: "₹54,000", OutflowStr: "₹37,000", ClosingStr: "₹85,000", Inflow: 54000, Outflow: 37000, Closing: 85000},
					{Month: "Nov", InflowStr: "₹56,000", OutflowStr: "₹39,000", ClosingStr: "₹1,02,000", Inflow: 56000, Outflow: 39000, Closing: 102000},
					{Month: "Dec", InflowStr: "₹60,000", OutflowStr: "₹40,000", ClosingStr: "₹1,22,000", Inflow: 60000, Outflow: 40000, Closing: 122000},
					{Month: "Jan", InflowStr: "₹62,000", OutflowStr: "₹41,000", ClosingStr: "₹1,43,000", Inflow: 62000, Outflow: 41000, Closing: 143000},
				},
			},
			ObligationsData: models.ObligationsData{
				Summary: models.ObligationsSummary{
					NextDueAmountStr: "₹6,000",
					NextDueDateStr:   "10 Sep 2025",
					Total3MonthsStr:  "₹18,000",
				},
				Obligations: []models.Obligation{
					{Title: "Equipment Loan EMI", AmountStr: "₹6,000", DateStr: "10 Sep 2025", IsRepayment: true, Status: "onTrack"},
					{Title: "Equipment Loan EMI", AmountStr: "₹6,000", DateStr: "10 Oct 2025", IsRepayment: true, Status: "onTrack"},
					{Title: "Equipment Loan EMI", AmountStr: "₹6,000", DateStr: "10 Nov 2025", IsRepayment: true, Status: "onTrack"},
				},
			},
			ForecastExplanationData: models.ForecastExplanationData{
				TargetMonth:   "September",
				SummaryText:   "Cash position remains healthy with an expected closing surplus above ₹68K across all quarters.",
				AIExplanation: "Stable milk procurement contracts with Amul cooperative maintain dependable weekly receivables.",
				Factors: []models.ExplanationFactor{
					{Title: "Feed Stock Replenishment", Subtitle: "Scheduled monthly concentrate delivery under contract", StatValue: "₹17,000", StatSubtitle: "Expected Sep 8", IconType: "feed", StatusText: "On track", StatusType: "info"},
					{Title: "Cooperative Milk Realization", Subtitle: "Regular weekly settlement batches", StatValue: "₹48,000", StatSubtitle: "Expected Sep 28", IconType: "sales", StatusText: "Reliable inflow", StatusType: "success"},
				},
			},
			LoanAmount:    80000,
			NextEmiAmount: 6000,
			NextEmiDays:   22,
			UpdatedAt:     time.Now(),
		},

		// 3. Kisan Agro - Tractor Services (Stable)
		{
			ID:                     "ent_kisan",
			Name:                   "Kisan Agro",
			Location:               "Chandwad, Nashik",
			Sector:                 "Tractor Services",
			Since:                  "2019",
			Revenue:                60000,
			Status:                 "Stable",
			BankBalance:            "₹50,000",
			AccountFlow30Day:       "+₹12,000",
			LiquidityCoverage:      "30 days",
			LowestProjectedBalance: "₹22,000 · Oct mid",
			OutlookString:          "Seasonal demand ramp up",
			NextEventString:        "Rabi season tilling rush: Oct-Nov",
			CashDeficitProjected:   false,
			ShortfallAmount:        0,
			KeyDrivers:             []string{"↑ Advance bookings +15%", "Seasonal overhaul in Oct"},
			CashFlowStatus:         "Healthy",
			ObligationCoverage:     "Good",
			MarketSignal:           "Heavy Rabi tilling demand",
			ClimateAlert:           "None",
			IntelligenceFacts:      []string{"Bookings up 15%", "Pre-season maintenance scheduled for Oct"},
			SuggestedAttention:     "Ensure fuel credit line before peak tilling week.",
			CompositeIndicators: []models.CompositeIndicator{
				{Name: "Financial", Score: 78, Label: "Good", Evidence: "High seasonal revenue realization"},
				{Name: "Credit", Score: 80, Label: "Low Risk", Evidence: "Timely machinery loan repayments"},
			},
			FinancialIntelligence: models.FinancialIntelligence{
				CurrentCash:         "₹50K",
				CashStatusBadge:     "Solid liquidity",
				CashStatusSubtitle:  "Sufficient buffer for October fleet overhaul.",
				ExpectedInflow:      "₹60K",
				ExpectedOutflow:     "₹42K",
				UpcomingRepayment:   "₹10K",
				NextReviewDate:      "20 Sep",
				CashOutlookStatus:   "Positive",
				CashOutlookSubtitle: "Strong season ahead.",
				IncomeAmount:        "₹2.8L",
				ExpensesAmount:      "₹1.9L",
			},
			IncomeData: models.IncomeData{
				SourceName:     "Tractor rental & tilling",
				ExpectedAmount: "₹60K",
				Period:         "This month",
				TrendBadge:     "Growing (+15%)",
				TrendData:      []float64{45000, 50000, 55000, 60000},
				LatestAmount:   "₹18,000",
				LatestDate:     "28 Aug 2025",
				History: []models.RecentCollection{
					{Date: "28 Aug 2025", Amount: "₹18,000"},
					{Date: "20 Aug 2025", Amount: "₹14,000"},
					{Date: "12 Aug 2025", Amount: "₹15,000"},
					{Date: "05 Aug 2025", Amount: "₹13,000"},
				},
				AIExplanation: "Farm tilling advance deposits ramping up rapidly in Chandwad taluka.",
			},
			ExpensesData: models.ExpensesData{
				TotalExpenses: "₹42,000",
				Period:        "This month",
				KeyInsight:    "Maintenance and overhaul expenses prioritized ahead of sowing season.",
				Categories: []models.ExpenseCategory{
					{Title: "Machinery Spares & Overhaul", Subtitle: "Hydraulics & rotary tiller blades", BadgeText: "Seasonal High", IsRising: true, Amount: "₹18,000", Percentage: "43%", PercentageSubtitle: "of monthly outflow"},
					{Title: "Commercial Diesel", Subtitle: "Bulk fuel for 3 tractor units", BadgeText: "Operational", IsRising: false, Amount: "₹14,000", Percentage: "33%", PercentageSubtitle: "of monthly outflow"},
					{Title: "Tractor Loan EMI", Subtitle: "Commercial vehicle loan", BadgeText: "Fixed", IsRising: false, Amount: "₹10,000", Percentage: "24%", PercentageSubtitle: "of monthly outflow"},
				},
			},
			CashFlowData: models.CashFlowData{
				AvgInflow:  "₹65K",
				AvgOutflow: "₹45K",
				AIInsight:  "Seasonal spike in October expenses prepares the fleet for massive November earnings.",
				ChartData: []models.CashFlowDataPoint{
					{Month: "May", Inflow: 45000, Outflow: 30000},
					{Month: "Jun", Inflow: 48000, Outflow: 32000},
					{Month: "Jul", Inflow: 42000, Outflow: 29000},
					{Month: "Aug", Inflow: 60000, Outflow: 42000},
					{Month: "Sep", Inflow: 40000, Outflow: 48000},
					{Month: "Oct", Inflow: 35000, Outflow: 55000, IsTighterMonth: true, TighterMonthLabel: "Overhaul"},
				},
				Summary: models.CashFlowSummary{
					LowestBalance:          "₹22,000",
					LowestBalanceSubtitle:  "Expected in October during heavy engine overhaul.",
					HighestBalance:         "₹1,18,000",
					HighestBalanceSubtitle: "Expected in January after full Rabi collection.",
					AverageMonthly:         "₹20,000",
				},
			},
			CashForecastData: models.CashForecastData{
				AIInsight: "October experiences high service expenditure for tractor overhaul before the Rabi sowing surge, recovering strongly to ₹1.18L by January.",
				Data: []models.CashForecastDataPoint{
					{Month: "Aug", InflowStr: "₹60,000", OutflowStr: "₹42,000", ClosingStr: "₹50,000", Inflow: 60000, Outflow: 42000, Closing: 50000},
					{Month: "Sep", InflowStr: "₹40,000", OutflowStr: "₹48,000", ClosingStr: "₹42,000", Inflow: 40000, Outflow: 48000, Closing: 42000},
					{Month: "Oct", InflowStr: "₹35,000", OutflowStr: "₹55,000", ClosingStr: "₹22,000", Inflow: 35000, Outflow: 55000, Closing: 22000, IsDangerMonth: true},
					{Month: "Nov", InflowStr: "₹75,000", OutflowStr: "₹44,000", ClosingStr: "₹53,000", Inflow: 75000, Outflow: 44000, Closing: 53000},
					{Month: "Dec", InflowStr: "₹80,000", OutflowStr: "₹45,000", ClosingStr: "₹88,000", Inflow: 80000, Outflow: 45000, Closing: 88000},
					{Month: "Jan", InflowStr: "₹70,000", OutflowStr: "₹40,000", ClosingStr: "₹1,18,000", Inflow: 70000, Outflow: 40000, Closing: 118000},
				},
			},
			ObligationsData: models.ObligationsData{
				Summary: models.ObligationsSummary{
					NextDueAmountStr: "₹10,000",
					NextDueDateStr:   "20 Sep 2025",
					Total3MonthsStr:  "₹30,000",
				},
				Obligations: []models.Obligation{
					{Title: "Tractor Hypothecation Loan", AmountStr: "₹10,000", DateStr: "20 Sep 2025", IsRepayment: true, Status: "onTrack"},
					{Title: "Tractor Hypothecation Loan", AmountStr: "₹10,000", DateStr: "20 Oct 2025", IsRepayment: true, Status: "onTrack"},
					{Title: "Tractor Hypothecation Loan", AmountStr: "₹10,000", DateStr: "20 Nov 2025", IsRepayment: true, Status: "onTrack"},
				},
			},
			ForecastExplanationData: models.ForecastExplanationData{
				TargetMonth:   "October",
				SummaryText:   "October maintenance and parts replacement will temporarily tighten working capital ahead of high November billings.",
				AIExplanation: "Heavy machinery overhaul scheduled in October precedes high seasonal demand during Rabi tilling.",
				Factors: []models.ExplanationFactor{
					{Title: "Engine Overhaul & Spares", Subtitle: "Annual preventive maintenance on 3 units", StatValue: "₹24,000", StatSubtitle: "Expected on Oct 10", IconType: "warning", StatusText: "Maintenance outlay", StatusType: "warning"},
					{Title: "Commercial Fuel Bulk Order", Subtitle: "Diesel barrel advance for seasonal run", StatValue: "₹16,000", StatSubtitle: "Expected on Oct 18", IconType: "sales", StatusText: "Inventory prep", StatusType: "info"},
				},
			},
			LoanAmount:    180000,
			NextEmiAmount: 10000,
			NextEmiDays:   25,
			UpdatedAt:     time.Now(),
		},

		// 4. Anil Pawar - Poultry (Watchlist)
		{
			ID:                     "ent_anil",
			Name:                   "Anil Pawar",
			Location:               "Malegaon, Nashik",
			Sector:                 "Poultry",
			Since:                  "2019",
			Revenue:                48000,
			Status:                 "Watchlist",
			BankBalance:            "₹32,000",
			AccountFlow30Day:       "-₹6,000",
			LiquidityCoverage:      "18 days",
			LowestProjectedBalance: "₹20,000 · Sep end",
			OutlookString:          "Feed price pressure",
			NextEventString:        "Broiler batch harvest: 20 Oct",
			CashDeficitProjected:   true,
			ShortfallAmount:        5000,
			KeyDrivers:             []string{"↑ Soybean meal +12%", "→ Bird weight on track"},
			CashFlowStatus:         "Stressed",
			ObligationCoverage:     "Watch",
			MarketSignal:           "Soybean meal price surge (+12%)",
			ClimateAlert:           "High humidity alert",
			IntelligenceFacts:      []string{"Input costs elevated by 12%", "Batch harvest scheduled for late Oct"},
			SuggestedAttention:     "Monitor feed payment terms and merchant credit timeline.",
			CompositeIndicators: []models.CompositeIndicator{
				{Name: "Financial", Score: 62, Label: "Moderate", Evidence: "High feed expense compression"},
				{Name: "Credit", Score: 68, Label: "Watch", Evidence: "Tight repayment window in late Sep"},
			},
			FinancialIntelligence: models.FinancialIntelligence{
				CurrentCash:         "₹32K",
				CashStatusBadge:     "Tight working cash",
				CashStatusSubtitle:  "High feed outlays pending before harvest.",
				ExpectedInflow:      "₹38K",
				ExpectedOutflow:     "₹50K",
				UpcomingRepayment:   "₹8K",
				NextReviewDate:      "05 Sep",
				CashOutlookStatus:   "Stressed",
				CashOutlookSubtitle: "Deficit expected in Sep.",
				IncomeAmount:        "₹1.8L",
				ExpensesAmount:      "₹1.9L",
			},
			IncomeData: models.IncomeData{
				SourceName:     "Broiler bird wholesale",
				ExpectedAmount: "₹38K",
				Period:         "This month",
				TrendBadge:     "Cyclical",
				TrendData:      []float64{42000, 40000, 36000, 38000},
				LatestAmount:   "₹9,500",
				LatestDate:     "26 Aug 2025",
				History: []models.RecentCollection{
					{Date: "26 Aug 2025", Amount: "₹9,500"},
					{Date: "19 Aug 2025", Amount: "₹8,500"},
					{Date: "12 Aug 2025", Amount: "₹10,000"},
				},
				AIExplanation: "Interim culled bird sales maintain baseline cash while main batch finishes growth cycle.",
			},
			ExpensesData: models.ExpensesData{
				TotalExpenses: "₹50,000",
				Period:        "This month",
				KeyInsight:    "Soybean meal and maize feed spikes dominate monthly expenses.",
				Categories: []models.ExpenseCategory{
					{Title: "Poultry Feed & Concentrates", Subtitle: "Soybean meal & pre-mix", BadgeText: "Spiking (+12%)", IsRising: true, Amount: "₹28,000", Percentage: "56%", PercentageSubtitle: "of monthly outflow"},
					{Title: "Day-old Chicks Advance", Subtitle: "Next flock booking deposit", BadgeText: "Advance", IsRising: false, Amount: "₹14,000", Percentage: "28%", PercentageSubtitle: "of monthly outflow"},
					{Title: "Microfinance EMI", Subtitle: "Shed expansion loan payment", BadgeText: "Fixed", IsRising: false, Amount: "₹8,000", Percentage: "16%", PercentageSubtitle: "of monthly outflow"},
				},
			},
			CashFlowData: models.CashFlowData{
				AvgInflow:  "₹52K",
				AvgOutflow: "₹44K",
				AIInsight:  "Feed inflation elevates September costs, with rapid recovery in November from full batch harvest.",
				ChartData: []models.CashFlowDataPoint{
					{Month: "May", Inflow: 45000, Outflow: 30000},
					{Month: "Jun", Inflow: 48000, Outflow: 32000},
					{Month: "Jul", Inflow: 42000, Outflow: 29000},
					{Month: "Aug", Inflow: 48000, Outflow: 42000},
					{Month: "Sep", Inflow: 38000, Outflow: 50000, IsTighterMonth: true, TighterMonthLabel: "Feed Surge"},
					{Month: "Oct", Inflow: 52000, Outflow: 44000},
				},
				Summary: models.CashFlowSummary{
					LowestBalance:          "₹20,000",
					LowestBalanceSubtitle:  "Expected in September due to feed spot price spike.",
					HighestBalance:         "₹72,000",
					HighestBalanceSubtitle: "Projected in January upon festive broiler dispatch.",
					AverageMonthly:         "₹15,000",
				},
			},
			CashForecastData: models.CashForecastData{
				AIInsight: "Elevated soybean meal costs reduce profit margin in September. Liquidity recovers as broiler batch reaches maturity in November.",
				Data: []models.CashForecastDataPoint{
					{Month: "Aug", InflowStr: "₹48,000", OutflowStr: "₹42,000", ClosingStr: "₹32,000", Inflow: 48000, Outflow: 42000, Closing: 32000},
					{Month: "Sep", InflowStr: "₹38,000", OutflowStr: "₹50,000", ClosingStr: "₹20,000", Inflow: 38000, Outflow: 50000, Closing: 20000, IsDangerMonth: true},
					{Month: "Oct", InflowStr: "₹52,000", OutflowStr: "₹44,000", ClosingStr: "₹28,000", Inflow: 52000, Outflow: 44000, Closing: 28000},
					{Month: "Nov", InflowStr: "₹58,000", OutflowStr: "₹46,000", ClosingStr: "₹40,000", Inflow: 58000, Outflow: 46000, Closing: 40000},
					{Month: "Dec", InflowStr: "₹65,000", OutflowStr: "₹48,000", ClosingStr: "₹57,000", Inflow: 65000, Outflow: 48000, Closing: 57000},
					{Month: "Jan", InflowStr: "₹60,000", OutflowStr: "₹45,000", ClosingStr: "₹72,000", Inflow: 60000, Outflow: 45000, Closing: 72000},
				},
			},
			ObligationsData: models.ObligationsData{
				Summary: models.ObligationsSummary{
					NextDueAmountStr: "₹8,000",
					NextDueDateStr:   "26 Sep 2025",
					Total3MonthsStr:  "₹24,000",
				},
				Obligations: []models.Obligation{
					{Title: "Shed Infrastructure Loan", AmountStr: "₹8,000", DateStr: "26 Sep 2025", IsRepayment: true, Status: "watch"},
					{Title: "Shed Infrastructure Loan", AmountStr: "₹8,000", DateStr: "26 Oct 2025", IsRepayment: true, Status: "onTrack"},
					{Title: "Feed Merchant Credit", AmountStr: "₹12,000", DateStr: "15 Sep 2025", IsRepayment: false, Status: "watch"},
				},
			},
			ForecastExplanationData: models.ForecastExplanationData{
				TargetMonth:   "September",
				SummaryText:   "Feed raw material price volatility elevates September outflows by 19% relative to recent averages.",
				AIExplanation: "Broiler lifecycle harvest in late October will offset the temporary cash compression.",
				Factors: []models.ExplanationFactor{
					{Title: "Soybean & Maize Feed Consignment", Subtitle: "Spot market prices surged 12% across Nashik", StatValue: "₹28,000", StatSubtitle: "Due on Sep 12", IconType: "feed", StatusText: "Inflated cost", StatusType: "warning"},
					{Title: "Microfinance Monthly Installment", Subtitle: "Shed modernization loan EMI", StatValue: "₹8,000", StatSubtitle: "Due on Sep 26", IconType: "repayment", StatusText: "Fixed due", StatusType: "warning"},
				},
			},
			LoanAmount:    90000,
			NextEmiAmount: 8000,
			NextEmiDays:   19,
			UpdatedAt:     time.Now(),
		},

		// 5. Sunil Wagh - Goat Rearing (Watchlist)
		{
			ID:                     "ent_sunil",
			Name:                   "Sunil Wagh",
			Location:               "Yeola, Nashik",
			Sector:                 "Goat Rearing",
			Since:                  "2020",
			Revenue:                34000,
			Status:                 "Watchlist",
			BankBalance:            "₹26,000",
			AccountFlow30Day:       "-₹4,000",
			LiquidityCoverage:      "20 days",
			LowestProjectedBalance: "₹16,000 · Sep end",
			OutlookString:          "Veterinary vaccination cycle pending",
			NextEventString:        "Livestock market sale: 18 Sep",
			CashDeficitProjected:   true,
			ShortfallAmount:        4000,
			KeyDrivers:             []string{"↑ Vaccine costs +10%", "Seasonal herd sales in Oct"},
			CashFlowStatus:         "Stressed",
			ObligationCoverage:     "Watch",
			MarketSignal:           "Stable meat wholesale demand",
			ClimateAlert:           "None",
			IntelligenceFacts:      []string{"Vaccination cycle due in Sep", "Livestock market auctions planned for Oct"},
			SuggestedAttention:     "Coordinate with district veterinary clinic for subsidized vaccination.",
			CompositeIndicators: []models.CompositeIndicator{
				{Name: "Financial", Score: 64, Label: "Moderate", Evidence: "Tight pre-sale working cash"},
				{Name: "Credit", Score: 70, Label: "Watch", Evidence: "Next repayment due mid Sep"},
			},
			FinancialIntelligence: models.FinancialIntelligence{
				CurrentCash:         "₹26K",
				CashStatusBadge:     "Tight working buffer",
				CashStatusSubtitle:  "Pre-sale livestock care underway.",
				ExpectedInflow:      "₹30K",
				ExpectedOutflow:     "₹34K",
				UpcomingRepayment:   "₹5K",
				NextReviewDate:      "18 Sep",
				CashOutlookStatus:   "Stressed",
				CashOutlookSubtitle: "Deficit expected before auction.",
				IncomeAmount:        "₹1.2L",
				ExpensesAmount:      "₹1.35L",
			},
			IncomeData: models.IncomeData{
				SourceName:     "Livestock wholesale auction",
				ExpectedAmount: "₹30K",
				Period:         "This month",
				TrendBadge:     "Cyclical",
				TrendData:      []float64{28000, 30000, 32000, 30000},
				LatestAmount:   "₹8,000",
				LatestDate:     "25 Aug 2025",
				History: []models.RecentCollection{
					{Date: "25 Aug 2025", Amount: "₹8,000"},
					{Date: "15 Aug 2025", Amount: "₹7,500"},
				},
				AIExplanation: "Periodic livestock market sales provide lump-sum cash inflows.",
			},
			ExpensesData: models.ExpensesData{
				TotalExpenses: "₹34,000",
				Period:        "This month",
				KeyInsight:    "Veterinary medicine and green fodder procurement dominate outlays.",
				Categories: []models.ExpenseCategory{
					{Title: "Veterinary Care & Vaccines", Subtitle: "PPR and Enterotoxemia vaccination", BadgeText: "Medical", IsRising: true, Amount: "₹12,000", Percentage: "35%", PercentageSubtitle: "of monthly outflow"},
					{Title: "Fodder & Mineral Mix", Subtitle: "Dry fodder and mineral blocks", BadgeText: "Essential", IsRising: false, Amount: "₹14,000", Percentage: "41%", PercentageSubtitle: "of monthly outflow"},
					{Title: "Livestock Loan EMI", Subtitle: "NABARD refinanced scheme", BadgeText: "Fixed", IsRising: false, Amount: "₹5,000", Percentage: "15%", PercentageSubtitle: "of monthly outflow"},
					{Title: "Shed Upkeep & Salt", Subtitle: "Sanitation and shed repairs", BadgeText: "Stable", IsRising: false, Amount: "₹3,000", Percentage: "9%", PercentageSubtitle: "of monthly outflow"},
				},
			},
			CashFlowData: models.CashFlowData{
				AvgInflow:  "₹38K",
				AvgOutflow: "₹32K",
				AIInsight:  "Pre-auction outlays temporarily compress liquidity, recovering rapidly post October market days.",
				ChartData: []models.CashFlowDataPoint{
					{Month: "May", Inflow: 35000, Outflow: 28000},
					{Month: "Jun", Inflow: 36000, Outflow: 29000},
					{Month: "Jul", Inflow: 34000, Outflow: 30000},
					{Month: "Aug", Inflow: 36000, Outflow: 32000},
					{Month: "Sep", Inflow: 30000, Outflow: 34000, IsTighterMonth: true, TighterMonthLabel: "Vaccines"},
					{Month: "Oct", Inflow: 48000, Outflow: 30000},
				},
				Summary: models.CashFlowSummary{
					LowestBalance:          "₹16,000",
					LowestBalanceSubtitle:  "Expected in September during vaccination run.",
					HighestBalance:         "₹64,000",
					HighestBalanceSubtitle: "Projected in November post livestock fairs.",
					AverageMonthly:         "₹12,000",
				},
			},
			CashForecastData: models.CashForecastData{
				AIInsight: "Pre-sale vaccination expenses reduce September closing cash to ₹16,000, rebounding strongly to ₹64,000 in November.",
				Data: []models.CashForecastDataPoint{
					{Month: "Aug", InflowStr: "₹36,000", OutflowStr: "₹32,000", ClosingStr: "₹26,000", Inflow: 36000, Outflow: 32000, Closing: 26000},
					{Month: "Sep", InflowStr: "₹30,000", OutflowStr: "₹34,000", ClosingStr: "₹16,000", Inflow: 30000, Outflow: 34000, Closing: 16000, IsDangerMonth: true},
					{Month: "Oct", InflowStr: "₹48,000", OutflowStr: "₹30,000", ClosingStr: "₹34,000", Inflow: 48000, Outflow: 30000, Closing: 34000},
					{Month: "Nov", InflowStr: "₹52,000", OutflowStr: "₹32,000", ClosingStr: "₹54,000", Inflow: 52000, Outflow: 32000, Closing: 54000},
					{Month: "Dec", InflowStr: "₹45,000", OutflowStr: "₹30,000", ClosingStr: "₹64,000", Inflow: 45000, Outflow: 30000, Closing: 64000},
					{Month: "Jan", InflowStr: "₹40,000", OutflowStr: "₹28,000", ClosingStr: "₹76,000", Inflow: 40000, Outflow: 28000, Closing: 76000},
				},
			},
			ObligationsData: models.ObligationsData{
				Summary: models.ObligationsSummary{
					NextDueAmountStr: "₹5,000",
					NextDueDateStr:   "18 Sep 2025",
					Total3MonthsStr:  "₹15,000",
				},
				Obligations: []models.Obligation{
					{Title: "Livestock Scheme Loan", AmountStr: "₹5,000", DateStr: "18 Sep 2025", IsRepayment: true, Status: "watch"},
					{Title: "Livestock Scheme Loan", AmountStr: "₹5,000", DateStr: "18 Oct 2025", IsRepayment: true, Status: "onTrack"},
				},
			},
			ForecastExplanationData: models.ForecastExplanationData{
				TargetMonth:   "September",
				SummaryText:   "Annual booster vaccination costs temporarily depress September closing liquidity.",
				AIExplanation: "Preventive health protocol before winter festival sales protects herd valuation.",
				Factors: []models.ExplanationFactor{
					{Title: "Herd Vaccination Protocol", Subtitle: "Comprehensive immunity booster shots", StatValue: "₹12,000", StatSubtitle: "Due on Sep 10", IconType: "warning", StatusText: "Medical due", StatusType: "warning"},
				},
			},
			LoanAmount:    60000,
			NextEmiAmount: 5000,
			NextEmiDays:   18,
			UpdatedAt:     time.Now(),
		},

		// 6. Vijay Kamble - Inland Fisheries (Watchlist)
		{
			ID:                     "ent_vijay",
			Name:                   "Vijay Kamble",
			Location:               "Dindori, Nashik",
			Sector:                 "Inland Fisheries",
			Since:                  "2020",
			Revenue:                52000,
			Status:                 "Watchlist",
			BankBalance:            "₹28,000",
			AccountFlow30Day:       "-₹5,000",
			LiquidityCoverage:      "20 days",
			LowestProjectedBalance: "₹6,000 · Oct mid",
			OutlookString:          "Pond restocking outlays approaching",
			NextEventString:        "Solar aerator loan EMI: 16 Oct",
			CashDeficitProjected:   true,
			ShortfallAmount:        6000,
			KeyDrivers:             []string{"↑ Fingerling seed cost +10%", "↑ Aeration equipment EMI"},
			CashFlowStatus:         "Stressed",
			ObligationCoverage:     "Watch",
			MarketSignal:           "Fishery wholesale rates favorable in winter",
			ClimateAlert:           "Water temperature variation",
			IntelligenceFacts:      []string{"Pond stocking in October", "Harvest sales commence November"},
			SuggestedAttention:     "Provide temporary credit line for fingerling stocking.",
			CompositeIndicators: []models.CompositeIndicator{
				{Name: "Financial", Score: 65, Label: "Moderate", Evidence: "Pre-harvest cash dip in October"},
				{Name: "Credit", Score: 70, Label: "Watch", Evidence: "High seasonal capital deployment"},
			},
			FinancialIntelligence: models.FinancialIntelligence{
				CurrentCash:         "₹28K",
				CashStatusBadge:     "Seasonal cash dip",
				CashStatusSubtitle:  "Stocking outlays approaching.",
				ExpectedInflow:      "₹35K",
				ExpectedOutflow:     "₹45K",
				UpcomingRepayment:   "₹14K",
				NextReviewDate:      "10 Sep",
				CashOutlookStatus:   "Stressed",
				CashOutlookSubtitle: "October cash constriction.",
				IncomeAmount:        "₹1.6L",
				ExpensesAmount:      "₹1.75L",
			},
			IncomeData: models.IncomeData{
				SourceName:     "Fish pond harvest off-take",
				ExpectedAmount: "₹35K",
				Period:         "This month",
				TrendBadge:     "Cyclical",
				TrendData:      []float64{40000, 38000, 32000, 35000},
				LatestAmount:   "₹8,500",
				LatestDate:     "26 Aug 2025",
				History: []models.RecentCollection{
					{Date: "26 Aug 2025", Amount: "₹8,500"},
					{Date: "18 Aug 2025", Amount: "₹9,000"},
				},
				AIExplanation: "Early partial netting provides base revenue before peak winter harvest.",
			},
			ExpensesData: models.ExpensesData{
				TotalExpenses: "₹45,000",
				Period:        "This month",
				KeyInsight:    "Fingerling purchase and pond aeration equipment payments due.",
				Categories: []models.ExpenseCategory{
					{Title: "Fingerling Seed Stock", Subtitle: "Freshwater Rohu & Catla seed", BadgeText: "Seasonal", IsRising: true, Amount: "₹18,000", Percentage: "40%", PercentageSubtitle: "of monthly outflow"},
					{Title: "Equipment Financing EMI", Subtitle: "Solar aerator machine EMI", BadgeText: "Fixed", IsRising: false, Amount: "₹14,000", Percentage: "31%", PercentageSubtitle: "of monthly outflow"},
					{Title: "Fish Feed & Water Treatment", Subtitle: "Floating pellets & probiotics", BadgeText: "Stable", IsRising: false, Amount: "₹13,000", Percentage: "29%", PercentageSubtitle: "of monthly outflow"},
				},
			},
			CashFlowData: models.CashFlowData{
				AvgInflow:  "₹48K",
				AvgOutflow: "₹38K",
				AIInsight:  "Pond restocking in October creates a tight liquidity window before harvest.",
				ChartData: []models.CashFlowDataPoint{
					{Month: "May", Inflow: 42000, Outflow: 30000},
					{Month: "Jun", Inflow: 44000, Outflow: 32000},
					{Month: "Jul", Inflow: 40000, Outflow: 31000},
					{Month: "Aug", Inflow: 42000, Outflow: 38000},
					{Month: "Sep", Inflow: 35000, Outflow: 45000},
					{Month: "Oct", Inflow: 30000, Outflow: 42000, IsTighterMonth: true, TighterMonthLabel: "Stocking"},
				},
				Summary: models.CashFlowSummary{
					LowestBalance:          "₹6,000",
					LowestBalanceSubtitle:  "Expected in October during peak fingerling stocking.",
					HighestBalance:         "₹97,000",
					HighestBalanceSubtitle: "Expected in January post winter harvest.",
					AverageMonthly:         "₹16,000",
				},
			},
			CashForecastData: models.CashForecastData{
				AIInsight: "Pond restocking in October creates a tight liquidity window (₹6K closing) before strong harvest revenue in winter.",
				Data: []models.CashForecastDataPoint{
					{Month: "Aug", InflowStr: "₹42,000", OutflowStr: "₹38,000", ClosingStr: "₹28,000", Inflow: 42000, Outflow: 38000, Closing: 28000},
					{Month: "Sep", InflowStr: "₹35,000", OutflowStr: "₹45,000", ClosingStr: "₹18,000", Inflow: 35000, Outflow: 45000, Closing: 18000},
					{Month: "Oct", InflowStr: "₹30,000", OutflowStr: "₹42,000", ClosingStr: "₹6,000", Inflow: 30000, Outflow: 42000, Closing: 6000, IsDangerMonth: true},
					{Month: "Nov", InflowStr: "₹60,000", OutflowStr: "₹36,000", ClosingStr: "₹30,000", Inflow: 60000, Outflow: 36000, Closing: 30000},
					{Month: "Dec", InflowStr: "₹72,000", OutflowStr: "₹38,000", ClosingStr: "₹64,000", Inflow: 72000, Outflow: 38000, Closing: 64000},
					{Month: "Jan", InflowStr: "₹68,000", OutflowStr: "₹35,000", ClosingStr: "₹97,000", Inflow: 68000, Outflow: 35000, Closing: 97000},
				},
			},
			ObligationsData: models.ObligationsData{
				Summary: models.ObligationsSummary{
					NextDueAmountStr: "₹14,000",
					NextDueDateStr:   "16 Oct 2025",
					Total3MonthsStr:  "₹42,000",
				},
				Obligations: []models.Obligation{
					{Title: "Solar Aerator Machinery Loan", AmountStr: "₹14,000", DateStr: "16 Oct 2025", IsRepayment: true, Status: "upcoming"},
				},
			},
			ForecastExplanationData: models.ForecastExplanationData{
				TargetMonth:   "October",
				SummaryText:   "Fingerling stocking and pond aeration energy expenses depress closing cash to ₹6K.",
				AIExplanation: "High capital outlay for seedling stock yields strong harvest revenue starting November.",
				Factors: []models.ExplanationFactor{
					{Title: "Fingerling Seed Stock Purchase", Subtitle: "Spawn consignment from local hatchery", StatValue: "₹18,000", StatSubtitle: "Oct 8", IconType: "sales", StatusText: "Stocking cost", StatusType: "warning"},
				},
			},
			LoanAmount:    140000,
			NextEmiAmount: 14000,
			NextEmiDays:   16,
			UpdatedAt:     time.Now(),
		},

		// 7. Sanjay Gite - Dairy Business (Critical)
		{
			ID:                     "ent_sanjay",
			Name:                   "Sanjay Gite",
			Location:               "Trimbak, Nashik",
			Sector:                 "Dairy Business",
			Since:                  "2019",
			Revenue:                38000,
			Status:                 "Critical",
			BankBalance:            "₹25,000",
			AccountFlow30Day:       "-₹8,000",
			LiquidityCoverage:      "10 days",
			LowestProjectedBalance: "₹8,000 · Oct",
			OutlookString:          "Prolonged cash stress from fodder costs",
			NextEventString:        "Term loan repayment due: 28 Sep",
			CashDeficitProjected:   true,
			ShortfallAmount:        12000,
			KeyDrivers:             []string{"↑ Dry fodder costs +15%", "↓ Dairy yield -6%"},
			CashFlowStatus:         "Stressed",
			ObligationCoverage:     "At Risk",
			MarketSignal:           "Fodder inflation in sub-district",
			ClimateAlert:           "Heavy rainfall disruption",
			IntelligenceFacts:      []string{"Dry fodder shortages reported in Trimbak", "Term loan repayment at imminent risk"},
			SuggestedAttention:     "Immediate debt restructuring or liquidity support intervention.",
			CompositeIndicators: []models.CompositeIndicator{
				{Name: "Financial", Score: 48, Label: "Critical", Evidence: "Negative net margins for 3 consecutive months"},
				{Name: "Credit", Score: 50, Label: "High Risk", Evidence: "Impaired debt service coverage"},
			},
			FinancialIntelligence: models.FinancialIntelligence{
				CurrentCash:         "₹25K",
				CashStatusBadge:     "High financial stress",
				CashStatusSubtitle:  "Urgent intervention needed.",
				ExpectedInflow:      "₹26K",
				ExpectedOutflow:     "₹41K",
				UpcomingRepayment:   "₹10K",
				NextReviewDate:      "01 Sep",
				CashOutlookStatus:   "Stressed",
				CashOutlookSubtitle: "Deficit projected in Sep and Oct.",
				IncomeAmount:        "₹1.3L",
				ExpensesAmount:      "₹1.65L",
			},
			IncomeData: models.IncomeData{
				SourceName:     "Trimbak Dairy Cooperative",
				ExpectedAmount: "₹26K",
				Period:         "This month",
				TrendBadge:     "Declining",
				TrendData:      []float64{38000, 34000, 30000, 26000},
				LatestAmount:   "₹4,500",
				LatestDate:     "27 Aug 2025",
				History: []models.RecentCollection{
					{Date: "27 Aug 2025", Amount: "₹4,500"},
					{Date: "20 Aug 2025", Amount: "₹6,000"},
				},
				AIExplanation: "Livestock lactation slowdown compounded by high moisture feed has lowered daily output.",
			},
			ExpensesData: models.ExpensesData{
				TotalExpenses: "₹41,000",
				Period:        "This month",
				KeyInsight:    "Dry fodder inflation and livestock insurance renewals inflate costs.",
				Categories: []models.ExpenseCategory{
					{Title: "Dry Fodder & Silage", Subtitle: "Purchased from outside taluka", BadgeText: "Severe Spike", IsRising: true, Amount: "₹15,000", Percentage: "37%", PercentageSubtitle: "of monthly outflow"},
					{Title: "Cattle Insurance Renewal", Subtitle: "Annual comprehensive insurance", BadgeText: "Annual", IsRising: true, Amount: "₹16,000", Percentage: "39%", PercentageSubtitle: "of monthly outflow"},
					{Title: "Bank Term Loan EMI", Subtitle: "Commercial dairy term loan", BadgeText: "Fixed", IsRising: false, Amount: "₹10,000", Percentage: "24%", PercentageSubtitle: "of monthly outflow"},
				},
			},
			CashFlowData: models.CashFlowData{
				AvgInflow:  "₹38K",
				AvgOutflow: "₹36K",
				AIInsight:  "September and October present severe cash deficit requiring close monitoring of loan servicing.",
				ChartData: []models.CashFlowDataPoint{
					{Month: "May", Inflow: 38000, Outflow: 30000},
					{Month: "Jun", Inflow: 36000, Outflow: 32000},
					{Month: "Jul", Inflow: 34000, Outflow: 33000},
					{Month: "Aug", Inflow: 38000, Outflow: 36000},
					{Month: "Sep", Inflow: 26000, Outflow: 41000, IsTighterMonth: true, TighterMonthLabel: "Critical"},
					{Month: "Oct", Inflow: 32000, Outflow: 34000},
				},
				Summary: models.CashFlowSummary{
					LowestBalance:          "₹8,000",
					LowestBalanceSubtitle:  "Expected in October if feed prices remain unchecked.",
					HighestBalance:         "₹42,000",
					HighestBalanceSubtitle: "Expected in January upon new lactation cycle.",
					AverageMonthly:         "₹10,000",
				},
			},
			CashForecastData: models.CashForecastData{
				AIInsight: "September and October present prolonged cash stress with reserves dropping to ₹8K–₹10K, requiring close debt service monitoring.",
				Data: []models.CashForecastDataPoint{
					{Month: "Aug", InflowStr: "₹38,000", OutflowStr: "₹36,000", ClosingStr: "₹25,000", Inflow: 38000, Outflow: 36000, Closing: 25000},
					{Month: "Sep", InflowStr: "₹26,000", OutflowStr: "₹41,000", ClosingStr: "₹10,000", Inflow: 26000, Outflow: 41000, Closing: 10000, IsDangerMonth: true},
					{Month: "Oct", InflowStr: "₹32,000", OutflowStr: "₹34,000", ClosingStr: "₹8,000", Inflow: 32000, Outflow: 34000, Closing: 8000, IsDangerMonth: true},
					{Month: "Nov", InflowStr: "₹40,000", OutflowStr: "₹32,000", ClosingStr: "₹16,000", Inflow: 40000, Outflow: 32000, Closing: 16000},
					{Month: "Dec", InflowStr: "₹45,000", OutflowStr: "₹33,000", ClosingStr: "₹28,000", Inflow: 45000, Outflow: 33000, Closing: 28000},
					{Month: "Jan", InflowStr: "₹48,000", OutflowStr: "₹34,000", ClosingStr: "₹42,000", Inflow: 48000, Outflow: 34000, Closing: 42000},
				},
			},
			ObligationsData: models.ObligationsData{
				Summary: models.ObligationsSummary{
					NextDueAmountStr: "₹10,000",
					NextDueDateStr:   "28 Sep 2025",
					Total3MonthsStr:  "₹30,000",
				},
				Obligations: []models.Obligation{
					{Title: "Bank Term Loan Repayment", AmountStr: "₹10,000", DateStr: "28 Sep 2025", IsRepayment: true, Status: "watch"},
				},
			},
			ForecastExplanationData: models.ForecastExplanationData{
				TargetMonth:   "September",
				SummaryText:   "Fodder inflation and cattle insurance premiums compress available cash reserves to ₹10K.",
				AIExplanation: "Dry fodder shortages in the sub-district have driven up local spot prices by 15%.",
				Factors: []models.ExplanationFactor{
					{Title: "Premium Cattle Insurance Renewal", Subtitle: "Annual policy renewal for herd", StatValue: "₹16,000", StatSubtitle: "Sep 9", IconType: "warning", StatusText: "Annual liability", StatusType: "warning"},
				},
			},
			LoanAmount:    120000,
			NextEmiAmount: 10000,
			NextEmiDays:   12,
			UpdatedAt:     time.Now(),
		},

		// 8. Rahul Bhamre - Poultry (Stable)
		{
			ID:                     "ent_rahul",
			Name:                   "Rahul Bhamre",
			Location:               "Kalwan, Nashik",
			Sector:                 "Poultry",
			Since:                  "2019",
			Revenue:                58000,
			Status:                 "Stable",
			BankBalance:            "₹52,000",
			AccountFlow30Day:       "+₹10,000",
			LiquidityCoverage:      "42 days",
			LowestProjectedBalance: "₹52,000 · Stable",
			OutlookString:          "Contract integration insulated from feed shocks",
			NextEventString:        "Integrator off-take payment: 15 Sep",
			CashDeficitProjected:   false,
			ShortfallAmount:        0,
			KeyDrivers:             []string{"↑ Bird survival rate 97%", "→ Contract farming feed support"},
			CashFlowStatus:         "Healthy",
			ObligationCoverage:     "Strong",
			MarketSignal:           "Contract integration stable",
			ClimateAlert:           "None",
			IntelligenceFacts:      []string{"Contract farming off-take active", "Feed delivered on credit by company"},
			SuggestedAttention:     "Exemplary enterprise with steady operating model.",
			CompositeIndicators: []models.CompositeIndicator{
				{Name: "Financial", Score: 86, Label: "Strong", Evidence: "High operating predictability and contract backed margins"},
				{Name: "Credit", Score: 92, Label: "Low Risk", Evidence: "Clean repayment history without delay"},
			},
			FinancialIntelligence: models.FinancialIntelligence{
				CurrentCash:         "₹52K",
				CashStatusBadge:     "Strong financial health",
				CashStatusSubtitle:  "Guaranteed off-take payments.",
				ExpectedInflow:      "₹55K",
				ExpectedOutflow:     "₹42K",
				UpcomingRepayment:   "₹6K",
				NextReviewDate:      "22 Sep",
				CashOutlookStatus:   "Positive",
				CashOutlookSubtitle: "Consistent surplus.",
				IncomeAmount:        "₹2.3L",
				ExpensesAmount:      "₹1.55L",
			},
			IncomeData: models.IncomeData{
				SourceName:     "Integrator Company Contract Cheque",
				ExpectedAmount: "₹55K",
				Period:         "This month",
				TrendBadge:     "Growing",
				TrendData:      []float64{50000, 52000, 54000, 55000},
				LatestAmount:   "₹14,000",
				LatestDate:     "28 Aug 2025",
				History: []models.RecentCollection{
					{Date: "28 Aug 2025", Amount: "₹14,000"},
					{Date: "21 Aug 2025", Amount: "₹13,500"},
				},
				AIExplanation: "Predictable contract rearing charges paid every fortnight directly into bank account.",
			},
			ExpensesData: models.ExpensesData{
				TotalExpenses: "₹42,000",
				Period:        "This month",
				KeyInsight:    "Feed provided by integrator; expenses limited to shed utilities, labor, and bio-security.",
				Categories: []models.ExpenseCategory{
					{Title: "Labor & Farm Staff", Subtitle: "2 full-time shed attendants", BadgeText: "Fixed", IsRising: false, Amount: "₹18,000", Percentage: "43%", PercentageSubtitle: "of monthly outflow"},
					{Title: "Electricity & Disinfection", Subtitle: "Shed temperature controls", BadgeText: "Utility", IsRising: false, Amount: "₹12,000", Percentage: "29%", PercentageSubtitle: "of monthly outflow"},
					{Title: "Working Capital Loan EMI", Subtitle: "Bank CC limit interest", BadgeText: "Fixed", IsRising: false, Amount: "₹6,000", Percentage: "14%", PercentageSubtitle: "of monthly outflow"},
				},
			},
			CashFlowData: models.CashFlowData{
				AvgInflow:  "₹62K",
				AvgOutflow: "₹44K",
				AIInsight:  "Consistent bird weight gain ensures robust cash inflows across all 6 forecast months.",
				ChartData: []models.CashFlowDataPoint{
					{Month: "May", Inflow: 52000, Outflow: 38000},
					{Month: "Jun", Inflow: 55000, Outflow: 39000},
					{Month: "Jul", Inflow: 56000, Outflow: 40000},
					{Month: "Aug", Inflow: 58000, Outflow: 40000},
					{Month: "Sep", Inflow: 55000, Outflow: 42000},
					{Month: "Oct", Inflow: 62000, Outflow: 44000},
				},
				Summary: models.CashFlowSummary{
					LowestBalance:          "₹52,000",
					LowestBalanceSubtitle:  "Recorded in August before contract settlement.",
					HighestBalance:         "₹1,57,000",
					HighestBalanceSubtitle: "Projected in January with bonus rearing payouts.",
					AverageMonthly:         "₹22,000",
				},
			},
			CashForecastData: models.CashForecastData{
				AIInsight: "Consistent bird weight gain and long-term buyer agreements ensure robust cash inflows with closing cash reaching ₹1.57L.",
				Data: []models.CashForecastDataPoint{
					{Month: "Aug", InflowStr: "₹58,000", OutflowStr: "₹40,000", ClosingStr: "₹52,000", Inflow: 58000, Outflow: 40000, Closing: 52000},
					{Month: "Sep", InflowStr: "₹55,000", OutflowStr: "₹42,000", ClosingStr: "₹65,000", Inflow: 55000, Outflow: 42000, Closing: 65000},
					{Month: "Oct", InflowStr: "₹62,000", OutflowStr: "₹44,000", ClosingStr: "₹83,000", Inflow: 62000, Outflow: 44000, Closing: 83000},
					{Month: "Nov", InflowStr: "₹68,000", OutflowStr: "₹46,000", ClosingStr: "₹1,05,000", Inflow: 68000, Outflow: 46000, Closing: 105000},
					{Month: "Dec", InflowStr: "₹75,000", OutflowStr: "₹48,000", ClosingStr: "₹1,32,000", Inflow: 75000, Outflow: 48000, Closing: 132000},
					{Month: "Jan", InflowStr: "₹70,000", OutflowStr: "₹45,000", ClosingStr: "₹1,57,000", Inflow: 70000, Outflow: 45000, Closing: 157000},
				},
			},
			ObligationsData: models.ObligationsData{
				Summary: models.ObligationsSummary{
					NextDueAmountStr: "₹6,000",
					NextDueDateStr:   "30 Sep 2025",
					Total3MonthsStr:  "₹18,000",
				},
				Obligations: []models.Obligation{
					{Title: "Working Capital Term Loan", AmountStr: "₹6,000", DateStr: "30 Sep 2025", IsRepayment: true, Status: "onTrack"},
				},
			},
			ForecastExplanationData: models.ForecastExplanationData{
				TargetMonth:   "September",
				SummaryText:   "Predictable contract farming off-take arrangements ensure sound liquidity buffer throughout Q3.",
				AIExplanation: "Integrator company supplies subsidized feed, insulating business from open-market price fluctuations.",
				Factors: []models.ExplanationFactor{
					{Title: "Contract Off-take Billing", Subtitle: "Direct wire from integrator company for finished batch", StatValue: "₹55,000", StatSubtitle: "Sep 15", IconType: "sales", StatusText: "Assured receipt", StatusType: "success"},
				},
			},
			LoanAmount:    85000,
			NextEmiAmount: 6000,
			NextEmiDays:   24,
			UpdatedAt:     time.Now(),
		},

		// 9. Mahesh Shinde - Milk Collection (Watchlist)
		{
			ID:                     "ent_mahesh",
			Name:                   "Mahesh Shinde",
			Location:               "Dindori, Nashik",
			Sector:                 "Milk Collection",
			Since:                  "2019",
			Revenue:                46000,
			Status:                 "Watchlist",
			BankBalance:            "₹34,000",
			AccountFlow30Day:       "-₹3,000",
			LiquidityCoverage:      "22 days",
			LowestProjectedBalance: "₹14,000 · Oct mid",
			OutlookString:          "Working capital needed for chiller upgrade",
			NextEventString:        "Chilling bulk tank maintenance: 11 Oct",
			CashDeficitProjected:   true,
			ShortfallAmount:        7000,
			KeyDrivers:             []string{"↑ Chiller diesel generator cost", "→ Farmer payout cycle tight"},
			CashFlowStatus:         "Stressed",
			ObligationCoverage:     "Watch",
			MarketSignal:           "Grape season approaching with agro demand",
			ClimateAlert:           "Grid power fluctuations",
			IntelligenceFacts:      []string{"Chiller upgrade required for Dindori cluster", "Farmer payout timing tight"},
			SuggestedAttention:     "Provide seasonal solar power financing support.",
			CompositeIndicators: []models.CompositeIndicator{
				{Name: "Financial", Score: 68, Label: "Moderate", Evidence: "Working capital strain from farmer advances"},
				{Name: "Credit", Score: 72, Label: "Watch", Evidence: "October cash dip from machinery maintenance"},
			},
			FinancialIntelligence: models.FinancialIntelligence{
				CurrentCash:         "₹34K",
				CashStatusBadge:     "Tight working cash",
				CashStatusSubtitle:  "Generator diesel costs rising.",
				ExpectedInflow:      "₹42K",
				ExpectedOutflow:     "₹46K",
				UpcomingRepayment:   "₹8K",
				NextReviewDate:      "11 Sep",
				CashOutlookStatus:   "Stressed",
				CashOutlookSubtitle: "October liquidity tightening.",
				IncomeAmount:        "₹1.8L",
				ExpensesAmount:      "₹1.85L",
			},
			IncomeData: models.IncomeData{
				SourceName:     "Bulk milk delivery to private dairies",
				ExpectedAmount: "₹42K",
				Period:         "This month",
				TrendBadge:     "Stable",
				TrendData:      []float64{40000, 42000, 41000, 42000},
				LatestAmount:   "₹10,500",
				LatestDate:     "27 Aug 2025",
				History: []models.RecentCollection{
					{Date: "27 Aug 2025", Amount: "₹10,500"},
					{Date: "20 Aug 2025", Amount: "₹10,000"},
				},
				AIExplanation: "Private dairy bulk tankers collect refrigerated milk on bi-weekly contract.",
			},
			ExpensesData: models.ExpensesData{
				TotalExpenses: "₹46,000",
				Period:        "This month",
				KeyInsight:    "Bulk chiller diesel backup and testing chemical consumables drive expenses.",
				Categories: []models.ExpenseCategory{
					{Title: "Farmer Procurement Advances", Subtitle: "Advances to 22 dairy farmers", BadgeText: "Working Cap", IsRising: false, Amount: "₹24,000", Percentage: "52%", PercentageSubtitle: "of monthly outflow"},
					{Title: "Diesel Generator Fuel", Subtitle: "Backup power for 2000L milk chilling tank", BadgeText: "Utility High", IsRising: true, Amount: "₹14,000", Percentage: "30%", PercentageSubtitle: "of monthly outflow"},
					{Title: "Chiller Equipment Loan EMI", Subtitle: "Cold chain financing EMI", BadgeText: "Fixed", IsRising: false, Amount: "₹8,000", Percentage: "18%", PercentageSubtitle: "of monthly outflow"},
				},
			},
			CashFlowData: models.CashFlowData{
				AvgInflow:  "₹50K",
				AvgOutflow: "₹44K",
				AIInsight:  "Chilling tank repairs and generator fuel peak in October before the winter flush season.",
				ChartData: []models.CashFlowDataPoint{
					{Month: "May", Inflow: 44000, Outflow: 38000},
					{Month: "Jun", Inflow: 46000, Outflow: 39000},
					{Month: "Jul", Inflow: 45000, Outflow: 40000},
					{Month: "Aug", Inflow: 46000, Outflow: 42000},
					{Month: "Sep", Inflow: 42000, Outflow: 46000},
					{Month: "Oct", Inflow: 38000, Outflow: 48000, IsTighterMonth: true, TighterMonthLabel: "Repairs"},
				},
				Summary: models.CashFlowSummary{
					LowestBalance:          "₹14,000",
					LowestBalanceSubtitle:  "Expected in October during chiller overhaul.",
					HighestBalance:         "₹88,000",
					HighestBalanceSubtitle: "Projected in January during peak winter milk flush.",
					AverageMonthly:         "₹18,000",
				},
			},
			CashForecastData: models.CashForecastData{
				AIInsight: "Chilling tank repairs and diesel generator expenses reduce closing cash to ₹14K in October before surging during winter.",
				Data: []models.CashForecastDataPoint{
					{Month: "Aug", InflowStr: "₹46,000", OutflowStr: "₹42,000", ClosingStr: "₹34,000", Inflow: 46000, Outflow: 42000, Closing: 34000},
					{Month: "Sep", InflowStr: "₹42,000", OutflowStr: "₹46,000", ClosingStr: "₹24,000", Inflow: 42000, Outflow: 46000, Closing: 24000},
					{Month: "Oct", InflowStr: "₹38,000", OutflowStr: "₹48,000", ClosingStr: "₹14,000", Inflow: 38000, Outflow: 48000, Closing: 14000, IsDangerMonth: true},
					{Month: "Nov", InflowStr: "₹56,000", OutflowStr: "₹42,000", ClosingStr: "₹32,000", Inflow: 56000, Outflow: 42000, Closing: 32000},
					{Month: "Dec", InflowStr: "₹64,000", OutflowStr: "₹44,000", ClosingStr: "₹58,000", Inflow: 64000, Outflow: 44000, Closing: 58000},
					{Month: "Jan", InflowStr: "₹68,000", OutflowStr: "₹45,000", ClosingStr: "₹88,000", Inflow: 68000, Outflow: 45000, Closing: 88000},
				},
			},
			ObligationsData: models.ObligationsData{
				Summary: models.ObligationsSummary{
					NextDueAmountStr: "₹8,000",
					NextDueDateStr:   "11 Oct 2025",
					Total3MonthsStr:  "₹24,000",
				},
				Obligations: []models.Obligation{
					{Title: "Bulk Milk Chiller Loan", AmountStr: "₹8,000", DateStr: "11 Oct 2025", IsRepayment: true, Status: "watch"},
				},
			},
			ForecastExplanationData: models.ForecastExplanationData{
				TargetMonth:   "October",
				SummaryText:   "Diesel generator running costs and pre-winter compressor overhaul compress October liquidity.",
				AIExplanation: "Compressor servicing ensures 100% cooling uptime for the heavy November milk intake.",
				Factors: []models.ExplanationFactor{
					{Title: "Chiller Compressor Overhaul", Subtitle: "Gas refill and seal replacement", StatValue: "₹16,000", StatSubtitle: "Oct 5", IconType: "warning", StatusText: "Capital maintenance", StatusType: "warning"},
				},
			},
			LoanAmount:    110000,
			NextEmiAmount: 8000,
			NextEmiDays:   11,
			UpdatedAt:     time.Now(),
		},

		// 10. Prakash More - Agro Processing (Stable)
		{
			ID:                     "ent_prakash",
			Name:                   "Prakash More",
			Location:               "Sinnar, Nashik",
			Sector:                 "Agro Processing",
			Since:                  "2018",
			Revenue:                72000,
			Status:                 "Stable",
			BankBalance:            "₹68,000",
			AccountFlow30Day:       "+₹14,000",
			LiquidityCoverage:      "50 days",
			LowestProjectedBalance: "₹48,000 · Late Sep",
			OutlookString:          "Robust onion and grain dehydration export pipeline",
			NextEventString:        "Export packing line commission: 25 Sep",
			CashDeficitProjected:   false,
			ShortfallAmount:        0,
			KeyDrivers:             []string{"↑ Commercial processing volume +22%", "→ Long-term institutional buyers"},
			CashFlowStatus:         "Healthy",
			ObligationCoverage:     "Strong",
			MarketSignal:           "Dehydrated flakes export demand high",
			ClimateAlert:           "None",
			IntelligenceFacts:      []string{"Processing capacity expanded by 25%", "Zero defaults over 36 months"},
			SuggestedAttention:     "Candidate for working capital limit expansion to ₹5L.",
			CompositeIndicators: []models.CompositeIndicator{
				{Name: "Financial", Score: 90, Label: "Strong", Evidence: "High operational profit margin of 28%"},
				{Name: "Credit", Score: 94, Label: "Low Risk", Evidence: "Impeccable debt servicing track record"},
			},
			FinancialIntelligence: models.FinancialIntelligence{
				CurrentCash:         "₹68K",
				CashStatusBadge:     "Strong cash position",
				CashStatusSubtitle:  "Substantial operational liquidity buffer.",
				ExpectedInflow:      "₹75K",
				ExpectedOutflow:     "₹48K",
				UpcomingRepayment:   "₹12K",
				NextReviewDate:      "25 Sep",
				CashOutlookStatus:   "Positive",
				CashOutlookSubtitle: "Strong ongoing surplus.",
				IncomeAmount:        "₹3.2L",
				ExpensesAmount:      "₹2.1L",
			},
			IncomeData: models.IncomeData{
				SourceName:     "Processed agro commodity exports",
				ExpectedAmount: "₹75K",
				Period:         "This month",
				TrendBadge:     "Growing (+22%)",
				TrendData:      []float64{58000, 64000, 68000, 75000},
				LatestAmount:   "₹22,000",
				LatestDate:     "28 Aug 2025",
				History: []models.RecentCollection{
					{Date: "28 Aug 2025", Amount: "₹22,000"},
					{Date: "20 Aug 2025", Amount: "₹18,000"},
				},
				AIExplanation: "Institutional off-take contracts with food processing conglomerates in Mumbai.",
			},
			ExpensesData: models.ExpensesData{
				TotalExpenses: "₹48,000",
				Period:        "This month",
				KeyInsight:    "Raw onion & grain procurement from local APMCs form largest operational expense.",
				Categories: []models.ExpenseCategory{
					{Title: "Raw Produce Procurement", Subtitle: "Grade-A white onions & maize", BadgeText: "Procurement", IsRising: false, Amount: "₹24,000", Percentage: "50%", PercentageSubtitle: "of monthly outflow"},
					{Title: "Processing Machinery EMI", Subtitle: "Dehydration tunnel loan EMI", BadgeText: "Fixed", IsRising: false, Amount: "₹12,000", Percentage: "25%", PercentageSubtitle: "of monthly outflow"},
					{Title: "Skilled Plant Labor", Subtitle: "Packaging and grading operators", BadgeText: "Fixed", IsRising: false, Amount: "₹12,000", Percentage: "25%", PercentageSubtitle: "of monthly outflow"},
				},
			},
			CashFlowData: models.CashFlowData{
				AvgInflow:  "₹82K",
				AvgOutflow: "₹52K",
				AIInsight:  "Heavy export shipments generate steady cash surpluses across all quarters.",
				ChartData: []models.CashFlowDataPoint{
					{Month: "May", Inflow: 65000, Outflow: 44000},
					{Month: "Jun", Inflow: 68000, Outflow: 46000},
					{Month: "Jul", Inflow: 70000, Outflow: 48000},
					{Month: "Aug", Inflow: 72000, Outflow: 48000},
					{Month: "Sep", Inflow: 75000, Outflow: 50000},
					{Month: "Oct", Inflow: 85000, Outflow: 54000},
				},
				Summary: models.CashFlowSummary{
					LowestBalance:          "₹48,000",
					LowestBalanceSubtitle:  "Recorded in August before institutional wire settlement.",
					HighestBalance:         "₹2,10,000",
					HighestBalanceSubtitle: "Projected in January with festival export batches.",
					AverageMonthly:         "₹30,000",
				},
			},
			CashForecastData: models.CashForecastData{
				AIInsight: "Robust export orders and prompt corporate wire payments ensure sustained cash accumulation reaching ₹2.10L in January.",
				Data: []models.CashForecastDataPoint{
					{Month: "Aug", InflowStr: "₹72,000", OutflowStr: "₹48,000", ClosingStr: "₹68,000", Inflow: 72000, Outflow: 48000, Closing: 68000},
					{Month: "Sep", InflowStr: "₹75,000", OutflowStr: "₹50,000", ClosingStr: "₹92,000", Inflow: 75000, Outflow: 50000, Closing: 92000},
					{Month: "Oct", InflowStr: "₹85,000", OutflowStr: "₹54,000", ClosingStr: "₹1,24,000", Inflow: 85000, Outflow: 54000, Closing: 124000},
					{Month: "Nov", InflowStr: "₹90,000", OutflowStr: "₹56,000", ClosingStr: "₹1,56,000", Inflow: 90000, Outflow: 56000, Closing: 156000},
					{Month: "Dec", InflowStr: "₹95,000", OutflowStr: "₹58,000", ClosingStr: "₹1,85,000", Inflow: 95000, Outflow: 58000, Closing: 185000},
					{Month: "Jan", InflowStr: "₹92,000", OutflowStr: "₹55,000", ClosingStr: "₹2,10,000", Inflow: 92000, Outflow: 55000, Closing: 210000},
				},
			},
			ObligationsData: models.ObligationsData{
				Summary: models.ObligationsSummary{
					NextDueAmountStr: "₹12,000",
					NextDueDateStr:   "25 Sep 2025",
					Total3MonthsStr:  "₹36,000",
				},
				Obligations: []models.Obligation{
					{Title: "Agro Dehydration Machinery Loan", AmountStr: "₹12,000", DateStr: "25 Sep 2025", IsRepayment: true, Status: "onTrack"},
				},
			},
			ForecastExplanationData: models.ForecastExplanationData{
				TargetMonth:   "September",
				SummaryText:   "Commercial export off-take contracts ensure strong revenue visibility and robust debt service coverage.",
				AIExplanation: "Plant operates at 88% capacity utilization with contracted margins.",
				Factors: []models.ExplanationFactor{
					{Title: "Institutional Export Consignment", Subtitle: "Pre-cleared letter of credit wire transfer", StatValue: "₹75,000", StatSubtitle: "Sep 20", IconType: "sales", StatusText: "Contract wire", StatusType: "success"},
				},
			},
			LoanAmount:    150000,
			NextEmiAmount: 12000,
			NextEmiDays:   20,
			UpdatedAt:     time.Now(),
		},
	}
}

func getSeedSubscreensForEnterprise(e models.Enterprise) map[string]any {
	subscreens := make(map[string]any)

	// 1. Business Activity Subscreen
	var activity models.BusinessActivityData
	if e.Status == "Critical" {
		activity = models.BusinessActivityData{
			EnterpriseID:   e.ID,
			Title:          "Business activity",
			Subtitle:       "Understand patterns in sales, collections and operational activity.",
			CurrentStatus:  "Declining",
			AverageValue:   88,
			Trend:          "Declining (-4%)",
			HighestValue:   "115",
			HighestDate:    "On Jun 1",
			LowestValue:    "82",
			LowestDate:     "On Aug 28",
			InsightText:    "Activity level shows sustained 4% decline due to input cost pressure and delayed settlement cycles.",
			AIInsightTitle: "Significant decline detected in daily collection volume and working liquidity.",
			DataPoints: []map[string]any{
				{"label": "Jun 1", "value1": 115},
				{"label": "Jun 15", "value1": 108},
				{"label": "Jul 1", "value1": 100},
				{"label": "Jul 15", "value1": 94},
				{"label": "Aug 1", "value1": 88},
				{"label": "Aug 28", "value1": 82},
			},
			Breakdown: []map[string]any{
				{"title": "Sales activity", "subtitle": "Dispatch volume down -4%", "status": "Declining", "icon": "shopping_cart_outlined"},
				{"title": "Collections activity", "subtitle": "Delayed settlement cycles (+7 days)", "status": "Delayed", "icon": "currency_rupee"},
				{"title": "Operational activity", "subtitle": "Input ration constrained by inflation", "status": "Strained", "icon": "storefront_outlined"},
			},
		}
	} else if e.Status == "Watchlist" {
		activity = models.BusinessActivityData{
			EnterpriseID:   e.ID,
			Title:          "Business activity",
			Subtitle:       "Understand patterns in sales, collections and operational activity.",
			CurrentStatus:  "Cyclical",
			AverageValue:   98,
			Trend:          "Batch Cycle",
			HighestValue:   "122",
			HighestDate:    "On Jul 1",
			LowestValue:    "90",
			LowestDate:     "On Jul 25",
			InsightText:    "Interim sales maintain baseline cash while main batch approaches peak realization.",
			AIInsightTitle: "Cycle on schedule; raw material inflation compressing interim margins.",
			DataPoints: []map[string]any{
				{"label": "Jun 1", "value1": 105},
				{"label": "Jun 15", "value1": 118},
				{"label": "Jul 1", "value1": 122},
				{"label": "Jul 15", "value1": 92},
				{"label": "Aug 1", "value1": 92},
				{"label": "Aug 28", "value1": 95},
			},
			Breakdown: []map[string]any{
				{"title": "Sales activity", "subtitle": "Interim batch sales", "status": "Cyclical", "icon": "shopping_cart_outlined"},
				{"title": "Collections activity", "subtitle": "Merchant wholesale receipts", "status": "On Track", "icon": "currency_rupee"},
				{"title": "Operational activity", "subtitle": "Raw inventory buffer under cost pressure", "status": "Watch", "icon": "storefront_outlined"},
			},
		}
	} else {
		activity = models.BusinessActivityData{
			EnterpriseID:   e.ID,
			Title:          "Business activity",
			Subtitle:       "Understand patterns in sales, collections and operational activity.",
			CurrentStatus:  "Growing",
			AverageValue:   118,
			Trend:          "Growing (+6%)",
			HighestValue:   "126",
			HighestDate:    "On Aug 28",
			LowestValue:    "108",
			LowestDate:     "On Jun 1",
			InsightText:    "Consistent daily commercial delivery with 100% on-time settlement.",
			AIInsightTitle: "Healthy expansion in volume and positive operational cash conversion.",
			DataPoints: []map[string]any{
				{"label": "Jun 1", "value1": 108},
				{"label": "Jun 15", "value1": 112},
				{"label": "Jul 1", "value1": 115},
				{"label": "Jul 15", "value1": 120},
				{"label": "Aug 1", "value1": 122},
				{"label": "Aug 28", "value1": 126},
			},
			Breakdown: []map[string]any{
				{"title": "Sales activity", "subtitle": "Daily commercial dispatch steady", "status": "Growing", "icon": "shopping_cart_outlined"},
				{"title": "Collections activity", "subtitle": "Institutional settlement on-time weekly", "status": "On Track", "icon": "currency_rupee"},
				{"title": "Operational activity", "subtitle": "Optimal input efficiency under contract", "status": "Healthy", "icon": "storefront_outlined"},
			},
		}
	}
	subscreens["business_activity"] = activity

	// 2. Input Costs Subscreen
	var inputCosts models.InputCostsData
	if e.ID == "ent_ramesh" {
		inputCosts = models.InputCostsData{
			EnterpriseID:  e.ID,
			GramPulseText: "Feed is currently the largest source of cost pressure (+8.7%).",
			InfoText:      "Prices are based on recent transactions and local Nashik Mandi spot feeds.",
			Metrics: []map[string]any{
				{"title": "Feed", "valueText": "₹29/kg", "valueSubtitle": "Spot market price", "pillText": "↑ 8.7%", "pillLevel": "warning", "pillSubtitle": "vs last 30 days", "icon": "science_outlined"},
				{"title": "Veterinary", "valueText": "Stable", "valueSubtitle": "Routine vaccination", "pillText": "Stable", "pillLevel": "success", "icon": "medical_services_outlined"},
				{"title": "Transport", "valueText": "Stable", "valueSubtitle": "Milk delivery van fuel", "pillText": "Stable", "pillLevel": "success", "icon": "local_shipping_outlined"},
			},
		}
	} else if e.ID == "ent_anil" {
		inputCosts = models.InputCostsData{
			EnterpriseID:  e.ID,
			GramPulseText: "Soybean meal surge (+12%) is creating severe margin compression.",
			InfoText:      "Prices reflect regional poultry feed index in Malegaon wholesale market.",
			Metrics: []map[string]any{
				{"title": "Soybean Meal", "valueText": "₹42/kg", "valueSubtitle": "Spot market price", "pillText": "↑ 12.0%", "pillLevel": "warning", "pillSubtitle": "vs last 30 days", "icon": "science_outlined"},
				{"title": "Day-Old Chicks", "valueText": "₹35/chick", "valueSubtitle": "Hatchery booking deposit", "pillText": "Stable", "pillLevel": "success", "icon": "egg_outlined"},
				{"title": "Medicines & Care", "valueText": "Moderate", "valueSubtitle": "Monsoon humidity care", "pillText": "↑ 5%", "pillLevel": "info", "icon": "medical_services_outlined"},
			},
		}
	} else if e.ID == "ent_sanjay" {
		inputCosts = models.InputCostsData{
			EnterpriseID:  e.ID,
			GramPulseText: "Emergency veterinary treatments have spiked outlays by +25%.",
			InfoText:      "Outlays reflect intensive medical intervention for cattle disease recovery.",
			Metrics: []map[string]any{
				{"title": "Veterinary & Medicine", "valueText": "₹16,000", "valueSubtitle": "Emergency antibiotic care", "pillText": "↑ 25.0%", "pillLevel": "warning", "pillSubtitle": "Surge", "icon": "medical_services_outlined"},
				{"title": "Fodder & Feed", "valueText": "₹28/kg", "valueSubtitle": "Base silage", "pillText": "Stable", "pillLevel": "success", "icon": "science_outlined"},
				{"title": "Transport", "valueText": "Stable", "valueSubtitle": "Milk collection logistics", "pillText": "Stable", "pillLevel": "success", "icon": "local_shipping_outlined"},
			},
		}
	} else if e.ID == "ent_kisan" {
		inputCosts = models.InputCostsData{
			EnterpriseID:  e.ID,
			GramPulseText: "Machinery overhaul expenses are elevated for seasonal preparation before Rabi surge.",
			InfoText:      "Costs reflect scheduled annual preventive maintenance on tractor fleet.",
			Metrics: []map[string]any{
				{"title": "Commercial Diesel", "valueText": "₹94/L", "valueSubtitle": "Bulk fuel rate", "pillText": "Stable", "pillLevel": "success", "pillSubtitle": "Slight +3%", "icon": "local_gas_station_outlined"},
				{"title": "Machinery Spares", "valueText": "₹18,000", "valueSubtitle": "Overhaul blades & hydraulic fluid", "pillText": "Seasonal", "pillLevel": "warning", "pillSubtitle": "Oct outlay", "icon": "build_outlined"},
				{"title": "Operator Wages", "valueText": "₹12,000", "valueSubtitle": "2 driver operators", "pillText": "Fixed", "pillLevel": "success", "icon": "person_outline"},
			},
		}
	} else if e.ID == "ent_suresh" {
		// Suresh Jadhav - Dairy (Stable, contracted feed)
		inputCosts = models.InputCostsData{
			EnterpriseID:  e.ID,
			GramPulseText: "Feed costs are fully locked under a 12-month cooperative supply contract — insulated from spot price surges.",
			InfoText:      "Suresh benefits from district cooperative bulk pricing. No open-market exposure this cycle.",
			Metrics: []map[string]any{
				{"title": "Compound Feed", "valueText": "₹24/kg", "valueSubtitle": "Cooperative contract rate", "pillText": "Contracted", "pillLevel": "success", "pillSubtitle": "Fixed through Mar", "icon": "science_outlined"},
				{"title": "Veterinary", "valueText": "₹1,800", "valueSubtitle": "Routine preventive dose", "pillText": "Stable", "pillLevel": "success", "icon": "medical_services_outlined"},
				{"title": "Milk Transport", "valueText": "₹2,500", "valueSubtitle": "Cooperative chiller route", "pillText": "Stable", "pillLevel": "success", "icon": "local_shipping_outlined"},
			},
		}
	} else if e.ID == "ent_sunil" {
		// Sunil Wagh - Goat Rearing (Watchlist)
		inputCosts = models.InputCostsData{
			EnterpriseID:  e.ID,
			GramPulseText: "Green fodder sourcing costs are rising (+6%) with late monsoon grazing pressure on common land.",
			InfoText:      "Local fodder market pricing from Chandwad Mandi, Nashik district.",
			Metrics: []map[string]any{
				{"title": "Green Fodder", "valueText": "₹8/kg", "valueSubtitle": "Chandwad spot rate", "pillText": "↑ 6.0%", "pillLevel": "warning", "pillSubtitle": "vs last 30 days", "icon": "eco_outlined"},
				{"title": "Veterinary Care", "valueText": "₹3,200", "valueSubtitle": "Vaccination round", "pillText": "Seasonal", "pillLevel": "info", "icon": "medical_services_outlined"},
				{"title": "Mineral Supplements", "valueText": "₹1,400", "valueSubtitle": "Monthly dosage", "pillText": "Stable", "pillLevel": "success", "icon": "science_outlined"},
			},
		}
	} else if e.ID == "ent_vijay" {
		// Vijay Kamble - Inland Fisheries (Watchlist)
		inputCosts = models.InputCostsData{
			EnterpriseID:  e.ID,
			GramPulseText: "Fingerling procurement cost has risen +9% this season. Feed pellet rates are steady under cooperative supply.",
			InfoText:      "Pricing sourced from Nashik District Fisheries Cooperative and Ozar wholesale.",
			Metrics: []map[string]any{
				{"title": "Fingerlings (Catla/Rohu)", "valueText": "₹185/100", "valueSubtitle": "Hatchery supply rate", "pillText": "↑ 9.0%", "pillLevel": "warning", "pillSubtitle": "Seasonal shortage", "icon": "water_outlined"},
				{"title": "Fish Feed Pellets", "valueText": "₹38/kg", "valueSubtitle": "Cooperative bulk rate", "pillText": "Stable", "pillLevel": "success", "icon": "science_outlined"},
				{"title": "Pond Maintenance", "valueText": "₹4,500", "valueSubtitle": "Aerator power + lime dosing", "pillText": "Stable", "pillLevel": "success", "icon": "construction_outlined"},
			},
		}
	} else if e.ID == "ent_rahul" {
		// Rahul Bhamre - Poultry (Stable, integrated contract)
		inputCosts = models.InputCostsData{
			EnterpriseID:  e.ID,
			GramPulseText: "Feed costs are fully absorbed under integrator contract. Input exposure is minimal and margins are protected.",
			InfoText:      "Rahul operates under a full-cycle integrator model — feed, chicks, and offtake contracted.",
			Metrics: []map[string]any{
				{"title": "Compound Feed", "valueText": "₹26/kg", "valueSubtitle": "Integrator contract rate", "pillText": "Contracted", "pillLevel": "success", "pillSubtitle": "No spot exposure", "icon": "science_outlined"},
				{"title": "Day-Old Chicks", "valueText": "₹30/chick", "valueSubtitle": "Integrator supply", "pillText": "Fixed", "pillLevel": "success", "icon": "egg_outlined"},
				{"title": "Shed Power & Water", "valueText": "₹3,800", "valueSubtitle": "Monthly utility cost", "pillText": "Stable", "pillLevel": "success", "icon": "bolt_outlined"},
			},
		}
	} else if e.ID == "ent_mahesh" {
		// Mahesh Shinde - Milk Collection Centre (Watchlist)
		inputCosts = models.InputCostsData{
			EnterpriseID:  e.ID,
			GramPulseText: "Grid power disruptions are forcing generator use — diesel cost surged +18% this month above budgeted levels.",
			InfoText:      "Milk chilling centre power reliance creates operating cost vulnerability during grid outages.",
			Metrics: []map[string]any{
				{"title": "Generator Diesel", "valueText": "₹96/L", "valueSubtitle": "Monthly backup use", "pillText": "↑ 18.0%", "pillLevel": "warning", "pillSubtitle": "Grid disruptions", "icon": "local_gas_station_outlined"},
				{"title": "Chiller Maintenance", "valueText": "₹6,500", "valueSubtitle": "Annual service cycle", "pillText": "Seasonal", "pillLevel": "info", "icon": "ac_unit_outlined"},
				{"title": "Collection Staff", "valueText": "₹14,000", "valueSubtitle": "2 operators monthly", "pillText": "Fixed", "pillLevel": "success", "icon": "person_outline"},
			},
		}
	} else if e.ID == "ent_prakash" {
		// Prakash More - Agro Processing (Stable)
		inputCosts = models.InputCostsData{
			EnterpriseID:  e.ID,
			GramPulseText: "Raw onion procurement is fully locked at pre-harvest rates. Processing margins at peak season high.",
			InfoText:      "Prakash secures pre-season purchase agreements with 12 farmer clusters in Lasalgaon area.",
			Metrics: []map[string]any{
				{"title": "Raw Onion", "valueText": "₹14/kg", "valueSubtitle": "Farmer cluster advance rate", "pillText": "Contracted", "pillLevel": "success", "pillSubtitle": "Pre-harvest lock", "icon": "agriculture_outlined"},
				{"title": "Processing Power", "valueText": "₹8,200", "valueSubtitle": "Dryer + slicer electricity", "pillText": "Stable", "pillLevel": "success", "icon": "bolt_outlined"},
				{"title": "Packaging Material", "valueText": "₹5,500", "valueSubtitle": "Export-grade moisture bags", "pillText": "Stable", "pillLevel": "success", "icon": "inventory_2_outlined"},
			},
		}
	} else {
		inputCosts = models.InputCostsData{
			EnterpriseID:  e.ID,
			GramPulseText: "Input costs are within expected bounds for current operating cycle.",
			InfoText:      "No significant cost pressure identified this month.",
			Metrics: []map[string]any{
				{"title": "Primary Input", "valueText": "Controlled", "valueSubtitle": "Current cycle", "pillText": "Stable", "pillLevel": "success", "icon": "science_outlined"},
				{"title": "Maintenance", "valueText": "Stable", "valueSubtitle": "Routine care", "pillText": "Stable", "pillLevel": "success", "icon": "build_outlined"},
				{"title": "Logistics", "valueText": "Stable", "valueSubtitle": "Transport route", "pillText": "Stable", "pillLevel": "success", "icon": "local_shipping_outlined"},
			},
		}
	}
	subscreens["input_costs"] = inputCosts

	// 3. Sales & Collections Subscreen
	sales := models.SalesCollectionsData{
		EnterpriseID:   e.ID,
		OverviewTitle:  e.IncomeData.SourceName,
		VolumeTrend:    e.IncomeData.TrendBadge,
		AvgCollection:  e.IncomeData.ExpectedAmount,
		DelayDays:      0,
		CollectionRate: "95%",
		GramPulseText:  e.IncomeData.AIExplanation,
		KeyPatterns: []map[string]any{
			{"period": "Last 7 Days", "amount": e.IncomeData.LatestAmount, "status": "Settled"},
			{"period": "Last 30 Days", "amount": e.IncomeData.ExpectedAmount, "status": "On Track"},
		},
	}
	if e.Status == "Critical" {
		sales.DelayDays = 7
		sales.CollectionRate = "80%"
	}
	subscreens["sales_collections"] = sales

	// 4. Sector Intelligence Subscreen — per-enterprise sector-specific benchmarks
	var sectorIntel models.SectorIntelligenceData
	switch e.ID {
	case "ent_ramesh", "ent_sanjay":
		// Dairy Business — Critical stress cases
		sectorIntel = models.SectorIntelligenceData{
			EnterpriseID: e.ID, SectorName: "Dairy Business", SectorStatus: e.Status,
			BenchmarkScore: 62, EnterprisePosition: "Below-average",
			MarginTrend: "Contracting — feed inflation eroding margins",
			InputCostTrend: "+8.5% on compound feed across Nashik",
			DemandOutlook: "Cooperative offtake stable but delayed payout window",
			KeyDrivers: []string{"Feed inflation (+8.5%)", "Cooperative payout delay (7-10 days)", "Rising veterinary cost"},
			PeerComparisons: []map[string]any{
				{"metric": "Operating Margin", "enterprise": "14%", "sectorAvg": "22%"},
				{"metric": "Input Cost Ratio", "enterprise": "58%", "sectorAvg": "45%"},
				{"metric": "On-Time Repayment", "enterprise": "72%", "sectorAvg": "91%"},
			},
		}
	case "ent_suresh", "ent_mahesh":
		// Dairy / Milk Collection — Stable/Watchlist
		sectorIntel = models.SectorIntelligenceData{
			EnterpriseID: e.ID, SectorName: e.Sector, SectorStatus: e.Status,
			BenchmarkScore: 81, EnterprisePosition: "Top-tier",
			MarginTrend: "Margins holding — cooperative contract insulating input costs",
			InputCostTrend: "+2.1% (contracted, below open-market surge)",
			DemandOutlook: "Milk demand high; cooperative settlement weekly",
			KeyDrivers: []string{"Contracted feed rates", "Weekly settlement cycle", "Power reliability (Mahesh: grid risk)"},
			PeerComparisons: []map[string]any{
				{"metric": "Operating Margin", "enterprise": "26%", "sectorAvg": "22%"},
				{"metric": "Input Cost Ratio", "enterprise": "38%", "sectorAvg": "45%"},
				{"metric": "On-Time Repayment", "enterprise": "97%", "sectorAvg": "91%"},
			},
		}
	case "ent_kisan":
		// Tractor Services
		sectorIntel = models.SectorIntelligenceData{
			EnterpriseID: e.ID, SectorName: "Tractor Services", SectorStatus: e.Status,
			BenchmarkScore: 85, EnterprisePosition: "Top-tier",
			MarginTrend: "Expanding — peak Rabi tilling demand incoming",
			InputCostTrend: "Diesel +3% (stable, well below agri-input average)",
			DemandOutlook: "High pre-Rabi demand; 100% booking for next 6 weeks",
			KeyDrivers: []string{"Seasonal tilling surge (Oct-Nov)", "Stable diesel cost", "Mechanisation subsidy uptake rising"},
			PeerComparisons: []map[string]any{
				{"metric": "Operating Margin", "enterprise": "34%", "sectorAvg": "28%"},
				{"metric": "Fuel Cost Ratio", "enterprise": "22%", "sectorAvg": "25%"},
				{"metric": "On-Time Repayment", "enterprise": "98%", "sectorAvg": "93%"},
			},
		}
	case "ent_anil", "ent_rahul":
		// Poultry
		benchScore := 72
		pos := "Mid-tier"
		marginNote := "Contracting — soybean meal surge (+12%) compressing margins"
		if e.ID == "ent_rahul" {
			benchScore = 88
			pos = "Top-tier"
			marginNote = "Stable — integrator contract absorbs input cost risk"
		}
		sectorIntel = models.SectorIntelligenceData{
			EnterpriseID: e.ID, SectorName: "Poultry", SectorStatus: e.Status,
			BenchmarkScore: benchScore, EnterprisePosition: pos,
			MarginTrend: marginNote,
			InputCostTrend: "Soybean meal +12% across Malegaon wholesale",
			DemandOutlook: "Broiler offtake steady; festival season uplift expected",
			KeyDrivers: []string{"Soybean meal surge (+12%)", "High humidity disease pressure", "Festival season demand uplift"},
			PeerComparisons: []map[string]any{
				{"metric": "Operating Margin", "enterprise": fmt.Sprintf("%d%%", benchScore-50), "sectorAvg": "24%"},
				{"metric": "Feed Cost Ratio", "enterprise": fmt.Sprintf("%d%%", 75-benchScore/5), "sectorAvg": "58%"},
				{"metric": "On-Time Repayment", "enterprise": fmt.Sprintf("%d%%", benchScore+5), "sectorAvg": "90%"},
			},
		}
	case "ent_sunil":
		// Goat Rearing
		sectorIntel = models.SectorIntelligenceData{
			EnterpriseID: e.ID, SectorName: "Goat Rearing", SectorStatus: e.Status,
			BenchmarkScore: 74, EnterprisePosition: "Mid-tier",
			MarginTrend: "Stable with slight fodder cost pressure due to monsoon grazing shortage",
			InputCostTrend: "Green fodder +6% in Chandwad area",
			DemandOutlook: "Meat wholesale demand steady; Eid premium season upcoming",
			KeyDrivers: []string{"Fodder cost rise (+6%)", "Vaccination round impact", "Eid demand premium (Oct)"},
			PeerComparisons: []map[string]any{
				{"metric": "Operating Margin", "enterprise": "21%", "sectorAvg": "23%"},
				{"metric": "Feed Cost Ratio", "enterprise": "44%", "sectorAvg": "42%"},
				{"metric": "On-Time Repayment", "enterprise": "88%", "sectorAvg": "90%"},
			},
		}
	case "ent_vijay":
		// Inland Fisheries
		sectorIntel = models.SectorIntelligenceData{
			EnterpriseID: e.ID, SectorName: "Inland Fisheries", SectorStatus: e.Status,
			BenchmarkScore: 70, EnterprisePosition: "Mid-tier",
			MarginTrend: "Seasonal — winter harvest premium expected to restore margins",
			InputCostTrend: "Fingerling cost +9%; feed pellets stable",
			DemandOutlook: "Winter wholesale rates favorable; restaurant demand rising",
			KeyDrivers: []string{"Fingerling cost rise (+9%)", "Water temperature variation", "Winter harvest premium"},
			PeerComparisons: []map[string]any{
				{"metric": "Operating Margin", "enterprise": "19%", "sectorAvg": "21%"},
				{"metric": "Feed Cost Ratio", "enterprise": "46%", "sectorAvg": "44%"},
				{"metric": "On-Time Repayment", "enterprise": "86%", "sectorAvg": "89%"},
			},
		}
	case "ent_prakash":
		// Agro Processing
		sectorIntel = models.SectorIntelligenceData{
			EnterpriseID: e.ID, SectorName: "Agro Processing", SectorStatus: e.Status,
			BenchmarkScore: 91, EnterprisePosition: "Top-tier",
			MarginTrend: "Expanding — export demand for dehydrated onion flakes at 5-year high",
			InputCostTrend: "Raw onion pre-locked; no open-market exposure",
			DemandOutlook: "Middle-East and Gulf export orders at peak; domestic demand also strong",
			KeyDrivers: []string{"Export demand surge", "Pre-harvest price lock advantage", "Domestic festival season demand"},
			PeerComparisons: []map[string]any{
				{"metric": "Operating Margin", "enterprise": "38%", "sectorAvg": "28%"},
				{"metric": "Input Cost Ratio", "enterprise": "28%", "sectorAvg": "38%"},
				{"metric": "On-Time Repayment", "enterprise": "100%", "sectorAvg": "93%"},
			},
		}
	default:
		sectorIntel = models.SectorIntelligenceData{
			EnterpriseID: e.ID, SectorName: e.Sector, SectorStatus: e.Status,
			BenchmarkScore: 75, EnterprisePosition: "Mid-tier",
			MarginTrend: "Stable operating conditions",
			InputCostTrend: "Within district average",
			DemandOutlook: "Demand stable for current season",
			KeyDrivers: []string{"Seasonal demand patterns", "Input cost stability"},
			PeerComparisons: []map[string]any{
				{"metric": "Operating Margin", "enterprise": "22%", "sectorAvg": "22%"},
				{"metric": "Input Cost Ratio", "enterprise": "45%", "sectorAvg": "45%"},
				{"metric": "On-Time Repayment", "enterprise": "90%", "sectorAvg": "90%"},
			},
		}
	}
	subscreens["sector_intelligence"] = sectorIntel

	// 5. Market Intelligence Subscreen — per-sector commodity prices
	var marketIntel models.MarketIntelligenceData
	switch e.ID {
	case "ent_ramesh", "ent_sanjay":
		marketIntel = models.MarketIntelligenceData{
			EnterpriseID: e.ID, PrimaryMarket: "Nashik Cooperative Dairy",
			CommodityName: "Compound Cattle Feed", CurrentPrice: "₹29/kg",
			PriceChange30d: "+8.7%", PriceTrend: "Upward Pressure",
			SupplyStatus: "Constrained", DemandStatus: "High",
			GramPulseAdvice: "Lock in bulk feed procurement before Sep monsoon peak. Cooperative advance purchase scheme available.",
			RecentPrices: []map[string]any{
				{"date": "Aug 28", "price": "₹29.00"}, {"date": "Aug 15", "price": "₹28.20"}, {"date": "Aug 01", "price": "₹26.70"},
			},
		}
	case "ent_suresh":
		marketIntel = models.MarketIntelligenceData{
			EnterpriseID: e.ID, PrimaryMarket: "Nashik District Cooperative",
			CommodityName: "Compound Cattle Feed (Contracted)", CurrentPrice: "₹24/kg",
			PriceChange30d: "0%", PriceTrend: "Stable (contracted)",
			SupplyStatus: "Secure", DemandStatus: "High",
			GramPulseAdvice: "Contract protects against open-market surges through March. Renewal negotiation recommended in Jan.",
			RecentPrices: []map[string]any{
				{"date": "Aug 28", "price": "₹24.00"}, {"date": "Aug 15", "price": "₹24.00"}, {"date": "Aug 01", "price": "₹24.00"},
			},
		}
	case "ent_kisan":
		marketIntel = models.MarketIntelligenceData{
			EnterpriseID: e.ID, PrimaryMarket: "Nashik District Transport Pool",
			CommodityName: "HSD Commercial Diesel", CurrentPrice: "₹94/L",
			PriceChange30d: "+3.1%", PriceTrend: "Marginal increase",
			SupplyStatus: "Adequate", DemandStatus: "Stable",
			GramPulseAdvice: "Bulk diesel procurement before Oct tilling surge. Monitor IOCL depot pricing weekly.",
			RecentPrices: []map[string]any{
				{"date": "Aug 28", "price": "₹94.20"}, {"date": "Aug 15", "price": "₹93.50"}, {"date": "Aug 01", "price": "₹91.40"},
			},
		}
	case "ent_anil", "ent_rahul":
		contractNote := "Open Malegaon Wholesale"
		price := "₹42/kg"
		change := "+12.0%"
		trend := "Upward — soybean crush season shortage"
		advice := "Consider forward booking from regional feed mill to hedge Aug-Oct soybean meal surge."
		if e.ID == "ent_rahul" {
			contractNote = "Integrator Contract Supply"
			price = "₹26/kg"
			change = "0%"
			trend = "Stable (integrator contract)"
			advice = "Contract renewal in Jan. Maintain compliance with integrator standards to protect rate."
		}
		marketIntel = models.MarketIntelligenceData{
			EnterpriseID: e.ID, PrimaryMarket: contractNote,
			CommodityName: "Poultry Compound Feed (Soybean-based)", CurrentPrice: price,
			PriceChange30d: change, PriceTrend: trend,
			SupplyStatus: "Tight", DemandStatus: "High",
			GramPulseAdvice: advice,
			RecentPrices: []map[string]any{
				{"date": "Aug 28", "price": price}, {"date": "Aug 15", "price": "₹38.50"}, {"date": "Aug 01", "price": "₹36.20"},
			},
		}
	case "ent_sunil":
		marketIntel = models.MarketIntelligenceData{
			EnterpriseID: e.ID, PrimaryMarket: "Chandwad Livestock Mandi",
			CommodityName: "Goat Meat (Live Weight)", CurrentPrice: "₹480/kg",
			PriceChange30d: "+4.2%", PriceTrend: "Upward pre-Eid",
			SupplyStatus: "Adequate", DemandStatus: "Rising",
			GramPulseAdvice: "Hold stock through Oct for Eid premium. Expect ₹520-540/kg offtake rate.",
			RecentPrices: []map[string]any{
				{"date": "Aug 28", "price": "₹480"}, {"date": "Aug 15", "price": "₹465"}, {"date": "Aug 01", "price": "₹460"},
			},
		}
	case "ent_vijay":
		marketIntel = models.MarketIntelligenceData{
			EnterpriseID: e.ID, PrimaryMarket: "Ozar Fish Wholesale Market",
			CommodityName: "Catla / Rohu (Fresh)", CurrentPrice: "₹180/kg",
			PriceChange30d: "+5.9%", PriceTrend: "Seasonal upward (winter demand)",
			SupplyStatus: "Adequate", DemandStatus: "Rising",
			GramPulseAdvice: "Harvest timing critical — target Nov-Dec for peak restaurant demand window.",
			RecentPrices: []map[string]any{
				{"date": "Aug 28", "price": "₹180"}, {"date": "Aug 15", "price": "₹172"}, {"date": "Aug 01", "price": "₹170"},
			},
		}
	case "ent_mahesh":
		marketIntel = models.MarketIntelligenceData{
			EnterpriseID: e.ID, PrimaryMarket: "Nashik Cooperative Dairy",
			CommodityName: "Pasteurised Milk (Procurement Rate)", CurrentPrice: "₹32/L",
			PriceChange30d: "+1.5%", PriceTrend: "Stable with minor cooperative rate hike",
			SupplyStatus: "Adequate", DemandStatus: "High",
			GramPulseAdvice: "Solar power investment proposal to reduce generator diesel dependency — ROI ~18 months.",
			RecentPrices: []map[string]any{
				{"date": "Aug 28", "price": "₹32.00"}, {"date": "Aug 15", "price": "₹31.80"}, {"date": "Aug 01", "price": "₹31.50"},
			},
		}
	case "ent_prakash":
		marketIntel = models.MarketIntelligenceData{
			EnterpriseID: e.ID, PrimaryMarket: "Lasalgaon Onion Mandi + Export",
			CommodityName: "Dehydrated Onion Flakes", CurrentPrice: "₹95/kg",
			PriceChange30d: "+14.2%", PriceTrend: "Strong upward (export demand peak)",
			SupplyStatus: "Controlled", DemandStatus: "Very High",
			GramPulseAdvice: "Increase processing capacity utilisation to 85%+ immediately. Export orders at 5-year high.",
			RecentPrices: []map[string]any{
				{"date": "Aug 28", "price": "₹95.00"}, {"date": "Aug 15", "price": "₹89.50"}, {"date": "Aug 01", "price": "₹83.00"},
			},
		}
	default:
		marketIntel = models.MarketIntelligenceData{
			EnterpriseID: e.ID, PrimaryMarket: "Local District Market",
			CommodityName: fmt.Sprintf("%s Primary Input", e.Sector), CurrentPrice: "Market rate",
			PriceChange30d: "Stable", PriceTrend: "Stable",
			SupplyStatus: "Adequate", DemandStatus: "Stable",
			GramPulseAdvice: "Monitor local mandi rates weekly.",
			RecentPrices: []map[string]any{{"date": "Aug 28", "price": "Market rate"}},
		}
	}
	subscreens["market_intelligence"] = marketIntel

	// 6. Climate Intelligence Subscreen — location and sector-specific
	var climateIntel models.ClimateIntelligenceData
	switch e.ID {
	case "ent_ramesh", "ent_suresh":
		climateIntel = models.ClimateIntelligenceData{
			EnterpriseID: e.ID, Location: e.Location,
			CurrentWeather: "Moderate Humidity · 28°C", Temperature: "28°C",
			RainfallOutlook: "Scattered monsoon showers (12-18mm)",
			AlertLevel: e.ClimateAlert,
			AlertSummary: "Humidity levels adequate for dairy operations. No acute weather risk. Ensure adequate shed ventilation.",
			Forecast7Day: []map[string]any{
				{"day": "Thu", "condition": "Partly Cloudy", "temp": "29°C"},
				{"day": "Fri", "condition": "Light Rain", "temp": "27°C"},
				{"day": "Sat", "condition": "Overcast", "temp": "28°C"},
				{"day": "Sun", "condition": "Sunny", "temp": "30°C"},
				{"day": "Mon", "condition": "Partly Cloudy", "temp": "29°C"},
			},
		}
	case "ent_sanjay":
		climateIntel = models.ClimateIntelligenceData{
			EnterpriseID: e.ID, Location: e.Location,
			CurrentWeather: "Heavy Rainfall · 26°C", Temperature: "26°C",
			RainfallOutlook: "Heavy rainfall forecast (55mm over 3 days)",
			AlertLevel: "Heavy rainfall disruption",
			AlertSummary: "Heavy rainfall warning for Trimbak. Risk of waterlogging in cattle shed. Recommend drainage clearance and emergency feed stocking.",
			Forecast7Day: []map[string]any{
				{"day": "Thu", "condition": "Heavy Rain", "temp": "25°C"},
				{"day": "Fri", "condition": "Heavy Rain", "temp": "24°C"},
				{"day": "Sat", "condition": "Moderate Rain", "temp": "26°C"},
				{"day": "Sun", "condition": "Overcast", "temp": "27°C"},
				{"day": "Mon", "condition": "Partly Cloudy", "temp": "28°C"},
			},
		}
	case "ent_kisan":
		climateIntel = models.ClimateIntelligenceData{
			EnterpriseID: e.ID, Location: e.Location,
			CurrentWeather: "Dry & Sunny · 31°C", Temperature: "31°C",
			RainfallOutlook: "No significant rain next 10 days — ideal field conditions",
			AlertLevel: "None",
			AlertSummary: "Excellent field conditions for tractor operations. Dry weather forecast for next 10 days supports Kharif harvest and land prep activity.",
			Forecast7Day: []map[string]any{
				{"day": "Thu", "condition": "Sunny", "temp": "32°C"},
				{"day": "Fri", "condition": "Sunny", "temp": "31°C"},
				{"day": "Sat", "condition": "Partly Cloudy", "temp": "30°C"},
				{"day": "Sun", "condition": "Sunny", "temp": "32°C"},
				{"day": "Mon", "condition": "Sunny", "temp": "33°C"},
			},
		}
	case "ent_anil":
		climateIntel = models.ClimateIntelligenceData{
			EnterpriseID: e.ID, Location: e.Location,
			CurrentWeather: "High Humidity · 30°C", Temperature: "30°C",
			RainfallOutlook: "Intermittent showers, humidity 80-85%",
			AlertLevel: "High humidity alert",
			AlertSummary: "High humidity (85%) increases respiratory disease risk in poultry. Ensure proper litter management and shed ventilation. Monitor flock closely.",
			Forecast7Day: []map[string]any{
				{"day": "Thu", "condition": "Humid & Cloudy", "temp": "30°C"},
				{"day": "Fri", "condition": "Light Rain", "temp": "29°C"},
				{"day": "Sat", "condition": "Humid", "temp": "31°C"},
				{"day": "Sun", "condition": "Partly Cloudy", "temp": "30°C"},
				{"day": "Mon", "condition": "Humid", "temp": "31°C"},
			},
		}
	case "ent_sunil":
		climateIntel = models.ClimateIntelligenceData{
			EnterpriseID: e.ID, Location: e.Location,
			CurrentWeather: "Breezy & Partly Cloudy · 27°C", Temperature: "27°C",
			RainfallOutlook: "Light showers expected (8mm)",
			AlertLevel: "None",
			AlertSummary: "Favourable weather for goat rearing. Ensure adequate grazing access during daylight hours before post-monsoon fodder scarcity.",
			Forecast7Day: []map[string]any{
				{"day": "Thu", "condition": "Partly Cloudy", "temp": "27°C"},
				{"day": "Fri", "condition": "Light Rain", "temp": "26°C"},
				{"day": "Sat", "condition": "Sunny", "temp": "29°C"},
				{"day": "Sun", "condition": "Sunny", "temp": "30°C"},
				{"day": "Mon", "condition": "Partly Cloudy", "temp": "28°C"},
			},
		}
	case "ent_vijay":
		climateIntel = models.ClimateIntelligenceData{
			EnterpriseID: e.ID, Location: e.Location,
			CurrentWeather: "Overcast · 25°C", Temperature: "25°C",
			RainfallOutlook: "Steady rain from Nandur barrage discharge zone",
			AlertLevel: "Water temperature variation",
			AlertSummary: "Water temperature variation detected (22-28°C). Monitor dissolved oxygen levels daily. Reduce feeding intensity during peak heat.",
			Forecast7Day: []map[string]any{
				{"day": "Thu", "condition": "Overcast", "temp": "25°C"},
				{"day": "Fri", "condition": "Light Rain", "temp": "24°C"},
				{"day": "Sat", "condition": "Overcast", "temp": "25°C"},
				{"day": "Sun", "condition": "Partly Cloudy", "temp": "26°C"},
				{"day": "Mon", "condition": "Sunny", "temp": "27°C"},
			},
		}
	case "ent_rahul":
		climateIntel = models.ClimateIntelligenceData{
			EnterpriseID: e.ID, Location: e.Location,
			CurrentWeather: "Partly Cloudy · 29°C", Temperature: "29°C",
			RainfallOutlook: "Moderate showers (10mm, manageable)",
			AlertLevel: "None",
			AlertSummary: "Weather conditions safe for poultry operations. Maintain litter dryness. Humidity stable at 72% — within acceptable range.",
			Forecast7Day: []map[string]any{
				{"day": "Thu", "condition": "Partly Cloudy", "temp": "29°C"},
				{"day": "Fri", "condition": "Light Rain", "temp": "28°C"},
				{"day": "Sat", "condition": "Overcast", "temp": "29°C"},
				{"day": "Sun", "condition": "Sunny", "temp": "31°C"},
				{"day": "Mon", "condition": "Partly Cloudy", "temp": "30°C"},
			},
		}
	case "ent_mahesh":
		climateIntel = models.ClimateIntelligenceData{
			EnterpriseID: e.ID, Location: e.Location,
			CurrentWeather: "Overcast · 26°C", Temperature: "26°C",
			RainfallOutlook: "Heavy monsoon — grid power fluctuations likely",
			AlertLevel: "Grid power fluctuations",
			AlertSummary: "Heavy monsoon rainfall correlates with local grid instability in Sinnar. Generator standby mandatory for milk chilling continuity. Risk of spoilage if downtime exceeds 2 hours.",
			Forecast7Day: []map[string]any{
				{"day": "Thu", "condition": "Heavy Rain", "temp": "25°C"},
				{"day": "Fri", "condition": "Moderate Rain", "temp": "26°C"},
				{"day": "Sat", "condition": "Overcast", "temp": "27°C"},
				{"day": "Sun", "condition": "Light Rain", "temp": "27°C"},
				{"day": "Mon", "condition": "Partly Cloudy", "temp": "28°C"},
			},
		}
	case "ent_prakash":
		climateIntel = models.ClimateIntelligenceData{
			EnterpriseID: e.ID, Location: e.Location,
			CurrentWeather: "Hot & Dry · 33°C", Temperature: "33°C",
			RainfallOutlook: "No rain forecast — ideal for onion dehydration",
			AlertLevel: "None",
			AlertSummary: "Dry conditions and low humidity are optimal for dehydration processing. Solar dryer efficiency at seasonal peak. No weather disruption risk.",
			Forecast7Day: []map[string]any{
				{"day": "Thu", "condition": "Hot & Sunny", "temp": "34°C"},
				{"day": "Fri", "condition": "Sunny", "temp": "33°C"},
				{"day": "Sat", "condition": "Sunny", "temp": "34°C"},
				{"day": "Sun", "condition": "Partly Cloudy", "temp": "32°C"},
				{"day": "Mon", "condition": "Sunny", "temp": "33°C"},
			},
		}
	default:
		climateIntel = models.ClimateIntelligenceData{
			EnterpriseID: e.ID, Location: e.Location,
			CurrentWeather: "Moderate Humidity · 28°C", Temperature: "28°C",
			RainfallOutlook: "Scattered showers (15mm)",
			AlertLevel: e.ClimateAlert,
			AlertSummary: "Weather conditions within safe operating thresholds.",
			Forecast7Day: []map[string]any{
				{"day": "Thu", "condition": "Partly Cloudy", "temp": "29°C"},
				{"day": "Fri", "condition": "Light Rain", "temp": "27°C"},
				{"day": "Sat", "condition": "Overcast", "temp": "28°C"},
			},
		}
	}
	subscreens["climate_intelligence"] = climateIntel

	// 7. GramPulse View Subscreen
	subscreens["grampulse_view"] = models.GramPulseIntelligenceData{
		EnterpriseID:    e.ID,
		OverallVerdict:  e.SuggestedAttention,
		RiskGrade:       e.Status,
		ConfidenceScore: 92,
		Signals: []map[string]any{
			{"signal": e.MarketSignal, "severity": e.Status},
			{"signal": e.OutlookString, "severity": "info"},
		},
		WhyItMatters: []map[string]any{
			{"title": "Cash Flow Buffer", "description": e.FinancialIntelligence.CashStatusSubtitle},
			{"title": "Obligation Security", "description": e.ForecastExplanationData.SummaryText},
		},
		RecommendedAction: map[string]any{
			"action":   e.SuggestedAttention,
			"priority": "High",
		},
	}

	return subscreens
}

func getSeedVisits() []models.Visit {
	return []models.Visit{
		{
			ID:                   "v1",
			EnterpriseID:         "ent_ramesh",
			EnterpriseName:       "Ramesh Patil (Dairy)",
			Location:             "Borgaon, Nashik",
			Time:                 "09:00 AM",
			RiskLevel:            "Critical",
			AddedRecommendations: []string{"Discuss fodder substitution", "Check cash buffer"},
			Observations:         []string{"Feed stock low (3 days)", "Milk yields -4%"},
			OverallRating:        "Pending",
			CreatedAt:            time.Now(),
		},
		{
			ID:                   "v2",
			EnterpriseID:         "ent_sanjay",
			EnterpriseName:       "Sanjay Gite (Dairy)",
			Location:             "Trimbak, Nashik",
			Time:                 "11:30 AM",
			RiskLevel:            "Critical",
			AddedRecommendations: []string{"Evaluate loan restructuring", "Review vet treatment plan"},
			Observations:         []string{"2 cattle recovering from infection", "Negative monthly cash flow"},
			OverallRating:        "Pending",
			CreatedAt:            time.Now(),
		},
		{
			ID:                   "v3",
			EnterpriseID:         "ent_anil",
			EnterpriseName:       "Anil Pawar (Poultry)",
			Location:             "Malegaon, Nashik",
			Time:                 "02:00 PM",
			RiskLevel:            "Watchlist",
			AddedRecommendations: []string{"Verify feed merchant credit", "Inspect flock ventilation"},
			Observations:         []string{"Broiler batch at 32 days", "Soybean meal price high"},
			OverallRating:        "Pending",
			CreatedAt:            time.Now(),
		},
		{
			ID:                   "v4",
			EnterpriseID:         "ent_suresh",
			EnterpriseName:       "Suresh Jadhav (Dairy)",
			Location:             "Niphad, Nashik",
			Time:                 "04:00 PM",
			RiskLevel:            "Stable",
			AddedRecommendations: []string{"Discuss herd expansion facility", "Review silage contract"},
			Observations:         []string{"Healthy herd", "100% on-time Amul collection"},
			OverallRating:        "Pending",
			CreatedAt:            time.Now(),
		},
	}
}

func getSeedInterventions() []models.Intervention {
	return []models.Intervention{
		{
			ID:                  "iv_1",
			EnterpriseID:        "ent_ramesh",
			EnterpriseName:      "Ramesh Patil",
			Title:               "Feed Fodder Restructuring & Cash Buffer Support",
			Description:         "Assist entrepreneur with connecting to local subsidized fodder cooperative and restructuring working capital buffer.",
			Severity:            "Critical",
			Status:              "Pending Review",
			AssignedOfficerID:   "off_priya",
			AssignedOfficerName: "Priya Sharma",
			CreatedAt:           time.Now(),
		},
		{
			ID:                  "iv_2",
			EnterpriseID:        "ent_sanjay",
			EnterpriseName:      "Sanjay Gite",
			Title:               "Emergency Veterinary & Loan Moratorium Support",
			Description:         "Evaluate 60-day interest moratorium and coordinate with district animal husbandry officer for subsidized medical care.",
			Severity:            "Critical",
			Status:              "In Progress",
			AssignedOfficerID:   "off_priya",
			AssignedOfficerName: "Priya Sharma",
			CreatedAt:           time.Now(),
		},
		{
			ID:                  "iv_3",
			EnterpriseID:        "ent_anil",
			EnterpriseName:      "Anil Pawar",
			Title:               "Cooperative Bulk Feed Procurement Review",
			Description:         "Facilitate poultry group buying contract to lower per-bag soybean meal acquisition cost.",
			Severity:            "High",
			Status:              "Scheduled",
			AssignedOfficerID:   "off_priya",
			AssignedOfficerName: "Priya Sharma",
			CreatedAt:           time.Now(),
		},
	}
}

func getSeedAlerts() []models.Alert {
	return []models.Alert{
		{
			ID:        "a1",
			Title:     "Cash Deficit Expected (₹8,000)",
			Subtitle:  "Ramesh Patil (Dairy Business)",
			Severity:  "Critical",
			Time:      "Today",
			Location:  "Borgaon, Nashik",
			CreatedAt: time.Now(),
		},
		{
			ID:        "a2",
			Title:     "Operating Margin Compression (-15%)",
			Subtitle:  "Sanjay Gite (Dairy Business)",
			Severity:  "Critical",
			Time:      "Today",
			Location:  "Trimbak, Nashik",
			CreatedAt: time.Now(),
		},
		{
			ID:        "a3",
			Title:     "Feed Price Surge Alert (+12%)",
			Subtitle:  "Anil Pawar (Poultry)",
			Severity:  "High",
			Time:      "1d",
			Location:  "Malegaon, Nashik",
			CreatedAt: time.Now(),
		},
		{
			ID:        "a4",
			Title:     "Rabi Season Tilling Demand Surge (+15%)",
			Subtitle:  "Kisan Agro (Tractor Services)",
			Severity:  "Low",
			Time:      "2h",
			Location:  "Chandwad, Nashik",
			CreatedAt: time.Now(),
		},
	}
}
