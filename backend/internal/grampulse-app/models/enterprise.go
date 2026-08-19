package models

import "time"

type CompositeIndicator struct {
	Name     string `json:"name"`
	Score    int    `json:"score"`
	Label    string `json:"label"`
	Evidence string `json:"evidence"`
}

type FinancialIntelligence struct {
	CurrentCash         string `json:"currentCash"`
	CashStatusBadge     string `json:"cashStatusBadge"`
	CashStatusSubtitle  string `json:"cashStatusSubtitle"`
	ExpectedInflow      string `json:"expectedInflow"`
	ExpectedOutflow     string `json:"expectedOutflow"`
	UpcomingRepayment   string `json:"upcomingRepayment"`
	NextReviewDate      string `json:"nextReviewDate"`
	CashOutlookStatus   string `json:"cashOutlookStatus"`
	CashOutlookSubtitle string `json:"cashOutlookSubtitle"`
	IncomeAmount        string `json:"incomeAmount"`
	ExpensesAmount      string `json:"expensesAmount"`
}

type RecentCollection struct {
	Date   string `json:"date"`
	Amount string `json:"amount"`
}

type IncomeData struct {
	SourceName     string             `json:"sourceName"`
	ExpectedAmount string             `json:"expectedAmount"`
	Period         string             `json:"period"`
	TrendBadge     string             `json:"trendBadge"`
	TrendData      []float64          `json:"trendData"`
	LatestAmount   string             `json:"latestAmount"`
	LatestDate     string             `json:"latestDate"`
	History        []RecentCollection `json:"history"`
	AIExplanation  string             `json:"aiExplanation"`
}

type ExpenseCategory struct {
	Title              string `json:"title"`
	Subtitle           string `json:"subtitle"`
	BadgeText          string `json:"badgeText"`
	IsRising           bool   `json:"isRising"`
	Amount             string `json:"amount"`
	Percentage         string `json:"percentage"`
	PercentageSubtitle string `json:"percentageSubtitle"`
}

type ExpensesData struct {
	TotalExpenses string            `json:"totalExpenses"`
	Period        string            `json:"period"`
	Categories    []ExpenseCategory `json:"categories"`
	KeyInsight    string            `json:"keyInsight"`
}

type CashFlowDataPoint struct {
	Month             string  `json:"month"`
	Inflow            float64 `json:"inflow"`
	Outflow           float64 `json:"outflow"`
	IsTighterMonth    bool    `json:"isTighterMonth"`
	TighterMonthLabel string  `json:"tighterMonthLabel,omitempty"`
}

type CashFlowSummary struct {
	LowestBalance          string `json:"lowestBalance"`
	LowestBalanceSubtitle  string `json:"lowestBalanceSubtitle"`
	HighestBalance         string `json:"highestBalance"`
	HighestBalanceSubtitle string `json:"highestBalanceSubtitle"`
	AverageMonthly         string `json:"averageMonthly"`
}

type CashFlowData struct {
	AvgInflow  string              `json:"avgInflow"`
	AvgOutflow string              `json:"avgOutflow"`
	ChartData  []CashFlowDataPoint `json:"chartData"`
	AIInsight  string              `json:"aiInsight"`
	Summary    CashFlowSummary     `json:"summary"`
}

type CashForecastDataPoint struct {
	Month         string  `json:"month"`
	InflowStr     string  `json:"inflowStr"`
	OutflowStr    string  `json:"outflowStr"`
	ClosingStr    string  `json:"closingStr"`
	Inflow        float64 `json:"inflow"`
	Outflow       float64 `json:"outflow"`
	Closing       float64 `json:"closing"`
	IsDangerMonth bool    `json:"isDangerMonth"`
}

type CashForecastData struct {
	AIInsight string                  `json:"aiInsight"`
	Data      []CashForecastDataPoint `json:"data"`
}

type Obligation struct {
	Title       string `json:"title"`
	AmountStr   string `json:"amountStr"`
	DateStr     string `json:"dateStr"`
	IsRepayment bool   `json:"isRepayment"`
	Status      string `json:"status"`
}

type ObligationsSummary struct {
	NextDueAmountStr string `json:"nextDueAmountStr"`
	NextDueDateStr   string `json:"nextDueDateStr"`
	Total3MonthsStr  string `json:"total3MonthsStr"`
}

type ObligationsData struct {
	Summary     ObligationsSummary `json:"summary"`
	Obligations []Obligation       `json:"obligations"`
}

type ExplanationFactor struct {
	Title        string `json:"title"`
	Subtitle     string `json:"subtitle"`
	StatValue    string `json:"statValue"`
	StatSubtitle string `json:"statSubtitle"`
	IconType     string `json:"iconType"`
	StatusText   string `json:"statusText"`
	StatusType   string `json:"statusType"`
}

type ForecastExplanationData struct {
	TargetMonth   string              `json:"targetMonth"`
	SummaryText   string              `json:"summaryText"`
	AIExplanation string              `json:"aiExplanation"`
	Factors       []ExplanationFactor `json:"factors"`
}

type Enterprise struct {
	ID                      string                  `json:"id"`
	Name                    string                  `json:"name"`
	Location                string                  `json:"location"`
	Sector                  string                  `json:"sector"`
	Since                   string                  `json:"since"`
	Revenue                 float64                 `json:"revenue"`
	Status                  string                  `json:"status"` // Critical, Watchlist, Stable
	BankBalance             string                  `json:"bankBalance"`
	AccountFlow30Day        string                  `json:"accountFlow30Day"`
	LiquidityCoverage       string                  `json:"liquidityCoverage"`
	LowestProjectedBalance  string                  `json:"lowestProjectedBalance"`
	OutlookString           string                  `json:"outlookString"`
	NextEventString         string                  `json:"nextEventString"`
	CashDeficitProjected    bool                    `json:"cashDeficitProjected"`
	ShortfallAmount         float64                 `json:"shortfallAmount"`
	KeyDrivers              []string                `json:"keyDrivers"`
	CashFlowStatus          string                  `json:"cashFlowStatus"`
	ObligationCoverage      string                  `json:"obligationCoverage"`
	MarketSignal            string                  `json:"marketSignal"`
	ClimateAlert            string                  `json:"climateAlert"`
	IntelligenceFacts       []string                `json:"intelligenceFacts"`
	SuggestedAttention      string                  `json:"suggestedAttention"`
	CompositeIndicators     []CompositeIndicator    `json:"compositeIndicators"`
	FinancialIntelligence   FinancialIntelligence   `json:"financialIntelligence"`
	IncomeData              IncomeData              `json:"incomeData"`
	ExpensesData            ExpensesData            `json:"expensesData"`
	CashFlowData            CashFlowData            `json:"cashFlowData"`
	CashForecastData        CashForecastData        `json:"cashForecastData"`
	ObligationsData         ObligationsData         `json:"obligationsData"`
	ForecastExplanationData ForecastExplanationData `json:"forecastExplanationData"`
	LoanAmount              float64                 `json:"loanAmount"`
	NextEmiAmount           float64                 `json:"nextEmiAmount"`
	NextEmiDays             int                     `json:"nextEmiDays"`
	UpdatedAt               time.Time               `json:"updatedAt"`
}

// BusinessActivityData represents business activity subscreen
type BusinessActivityData struct {
	EnterpriseID   string           `json:"enterpriseId"`
	Title          string           `json:"title"`
	Subtitle       string           `json:"subtitle"`
	CurrentStatus  string           `json:"currentStatus"`
	AverageValue   float64          `json:"averageValue"`
	Trend          string           `json:"trend"`
	HighestValue   string           `json:"highestValue"`
	HighestDate    string           `json:"highestDate"`
	LowestValue    string           `json:"lowestValue"`
	LowestDate     string           `json:"lowestDate"`
	InsightText    string           `json:"insightText"`
	AIInsightTitle string           `json:"aiInsightTitle"`
	DataPoints     []map[string]any `json:"dataPoints"`
	Breakdown      []map[string]any `json:"breakdown"`
}

// InputCostsData represents input cost subscreen
type InputCostsData struct {
	EnterpriseID  string           `json:"enterpriseId"`
	Metrics       []map[string]any `json:"metrics"`
	GramPulseText string           `json:"gramPulseText"`
	InfoText      string           `json:"infoText"`
}

// SalesCollectionsData represents sales & collection subscreen
type SalesCollectionsData struct {
	EnterpriseID   string           `json:"enterpriseId"`
	OverviewTitle  string           `json:"overviewTitle"`
	VolumeTrend    string           `json:"volumeTrend"`
	AvgCollection  string           `json:"avgCollection"`
	DelayDays      int              `json:"delayDays"`
	CollectionRate string           `json:"collectionRate"`
	GramPulseText  string           `json:"gramPulseText"`
	KeyPatterns    []map[string]any `json:"keyPatterns"`
}

// RepaymentData represents repayment behaviour subscreen
type RepaymentData struct {
	EnterpriseID  string           `json:"enterpriseId"`
	Score         int              `json:"score"`
	Status        string           `json:"status"`
	NextDueDate   string           `json:"nextDueDate"`
	NextDueAmount string           `json:"nextDueAmount"`
	GramPulseText string           `json:"gramPulseText"`
	RiskFactors   []map[string]any `json:"riskFactors"`
	History       []map[string]any `json:"history"`
}

// SectorIntelligenceData represents sector benchmarks and trends
type SectorIntelligenceData struct {
	EnterpriseID       string           `json:"enterpriseId"`
	SectorName         string           `json:"sectorName"`
	SectorStatus       string           `json:"sectorStatus"`
	BenchmarkScore     int              `json:"benchmarkScore"`
	EnterprisePosition string           `json:"enterprisePosition"`
	MarginTrend        string           `json:"marginTrend"`
	InputCostTrend     string           `json:"inputCostTrend"`
	DemandOutlook      string           `json:"demandOutlook"`
	KeyDrivers         []string         `json:"keyDrivers"`
	PeerComparisons    []map[string]any `json:"peerComparisons"`
}

// MarketIntelligenceData represents commodity prices and Mandi trends
type MarketIntelligenceData struct {
	EnterpriseID    string           `json:"enterpriseId"`
	PrimaryMarket   string           `json:"primaryMarket"`
	CommodityName   string           `json:"commodityName"`
	CurrentPrice    string           `json:"currentPrice"`
	PriceChange30d  string           `json:"priceChange30d"`
	PriceTrend      string           `json:"priceTrend"`
	SupplyStatus    string           `json:"supplyStatus"`
	DemandStatus    string           `json:"demandStatus"`
	GramPulseAdvice string           `json:"gramPulseAdvice"`
	RecentPrices    []map[string]any `json:"recentPrices"`
}

// ClimateIntelligenceData represents weather forecasts and climate alerts
type ClimateIntelligenceData struct {
	EnterpriseID    string           `json:"enterpriseId"`
	Location        string           `json:"location"`
	CurrentWeather  string           `json:"currentWeather"`
	Temperature     string           `json:"temperature"`
	RainfallOutlook string           `json:"rainfallOutlook"`
	AlertLevel      string           `json:"alertLevel"`
	AlertSummary    string           `json:"alertSummary"`
	Forecast7Day    []map[string]any `json:"forecast7Day"`
}

// GramPulseIntelligenceData represents AI analysis dimensions
type GramPulseIntelligenceData struct {
	EnterpriseID      string           `json:"enterpriseId"`
	OverallVerdict    string           `json:"overallVerdict"`
	RiskGrade         string           `json:"riskGrade"`
	ConfidenceScore   int              `json:"confidenceScore"`
	Signals           []map[string]any `json:"signals"`
	WhyItMatters      []map[string]any `json:"whyItMatters"`
	RecommendedAction map[string]any   `json:"recommendedAction"`
}

type Visit struct {
	ID                   string    `json:"id"`
	EnterpriseID         string    `json:"enterpriseId"`
	EnterpriseName       string    `json:"enterpriseName"`
	Location             string    `json:"location"`
	Time                 string    `json:"time"`
	RiskLevel            string    `json:"riskLevel"`
	AddedRecommendations []string  `json:"addedRecommendations"`
	Observations         []string  `json:"observations"`
	OverallRating        string    `json:"overallRating"`
	CreatedAt            time.Time `json:"createdAt"`
}

type Intervention struct {
	ID                  string    `json:"id"`
	EnterpriseID        string    `json:"enterpriseId"`
	EnterpriseName      string    `json:"enterpriseName"`
	Title               string    `json:"title"`
	Description         string    `json:"description"`
	Severity            string    `json:"severity"`
	Status              string    `json:"status"`
	AssignedOfficerID   string    `json:"assignedOfficerId"`
	AssignedOfficerName string    `json:"assignedOfficerName"`
	CreatedAt           time.Time `json:"createdAt"`
}

type Alert struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Subtitle  string    `json:"subtitle"`
	Severity  string    `json:"severity"`
	Time      string    `json:"time"`
	Location  string    `json:"location"`
	CreatedAt time.Time `json:"createdAt"`
}

type OfficerProfile struct {
	Name             string `json:"name"`
	Role             string `json:"role"`
	Region           string `json:"region"`
	AvatarInitials   string `json:"avatarInitials"`
	EnterprisesCount int    `json:"enterprisesCount"`
	VisitsPerMonth   int    `json:"visitsPerMonth"`
	RecoveryRate     string `json:"recoveryRate"`
}

type PortfolioSummary struct {
	TotalEnterprises   int            `json:"totalEnterprises"`
	CriticalCount      int            `json:"criticalCount"`
	WatchlistCount     int            `json:"watchlistCount"`
	StableCount        int            `json:"stableCount"`
	AvgHealthScore     int            `json:"avgHealthScore"`
	TotalOutflowAtRisk string         `json:"totalOutflowAtRisk"`
	Officer            OfficerProfile `json:"officer"`
}
