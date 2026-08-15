import { Enterprise, EarlyWarning, GramPulseState, FinancialRecord, EnterpriseForecast, Alert, InterventionCase, TimelineEvent } from '../store/gramPulseTypes';

export const shaktiPoultryFarm: Enterprise = {
  id: "RE-00124",
  name: "Shakti Poultry Farm",
  district: "Nashik",
  block: "Surgana",
  sector: "Poultry",
  enterpriseType: "Micro Enterprise",
  ownershipType: "Women-led",
  accountStatus: "Standard",
  currentDpd: 0,
};

export const shaktiFinancialRecords: FinancialRecord[] = [
  {
    id: "FR-001",
    enterpriseId: "RE-00124",
    month: "2026-06",
    operatingInflow: 135000,
    operatingOutflow: 110000,
    savings: 5000,
    loanRepayment: 7200,
    inventoryCost: 45000,
    recordedAt: "2026-07-02T10:00:00Z",
    syncStatus: "synced"
  },
  {
    id: "FR-002",
    enterpriseId: "RE-00124",
    month: "2026-07",
    operatingInflow: 142500,
    operatingOutflow: 128200, // higher outflow due to feed costs
    savings: 2000,
    loanRepayment: 7200,
    inventoryCost: 55000,
    recordedAt: "2026-08-02T09:30:00Z",
    syncStatus: "synced"
  }
];

export const shaktiForecast: EnterpriseForecast = {
  enterpriseId: "RE-00124",
  modelVersion: "grampulse-cf-v1.1",
  forecastGeneratedAt: "2026-08-04T09:00:00Z",
  forecast: [
    { month: "2026-08", horizon: 1, operatingInflow: 140000, operatingOutflow: 130000, closingCashBalance: 47600, cashAfterDebtService: 7300, lower: 35200, upper: 60000 },
    { month: "2026-09", horizon: 2, operatingInflow: 138000, operatingOutflow: 132000, closingCashBalance: 40400, cashAfterDebtService: 4000, lower: 28000, upper: 55000 },
    { month: "2026-10", horizon: 3, operatingInflow: 135000, operatingOutflow: 135000, closingCashBalance: 33200, cashAfterDebtService: -7200, lower: 20000, upper: 45000 }, // Stress month
    { month: "2026-11", horizon: 4, operatingInflow: 130000, operatingOutflow: 138000, closingCashBalance: 18000, cashAfterDebtService: -15200, lower: 5000, upper: 32000 },
    { month: "2026-12", horizon: 5, operatingInflow: 125000, operatingOutflow: 140000, closingCashBalance: -4200, cashAfterDebtService: -22200, lower: -18000, upper: 10000 },
    { month: "2027-01", horizon: 6, operatingInflow: 120000, operatingOutflow: 142000, closingCashBalance: -33400, cashAfterDebtService: -29200, lower: -45000, upper: -10000 }
  ]
};

export const shaktiWarning: EarlyWarning = {
  enterpriseId: "RE-00124",
  riskScore: 74,
  riskLevel: "High",
  forecastDeficit: 38400, // cumulative deficit or peak deficit
  debtServiceShortfall: 7200, // shortfall in Oct
  stressMonth: "October 2026",
  warningLeadTimeDays: 61,
  drivers: [
    {
      feature: "Feed-cost increase",
      observedValue: 12,
      unit: "percent",
      contributionPoints: 14,
      explanation: "Feed costs increased by 12%, reducing projected operating surplus.",
    },
    {
      feature: "UPI inflow decline",
      observedValue: -9,
      unit: "percent",
      contributionPoints: 11,
      explanation: "Aggregate UPI collections declined by 9% over the recent period.",
    },
    {
      feature: "Projected DSCR",
      observedValue: 0.74,
      unit: "ratio",
      contributionPoints: 18,
      explanation: "Forecast operating surplus covers only 74% of scheduled debt service.",
    },
  ],
};

export const shaktiAlert: Alert = {
  id: "ALT-1001",
  enterpriseId: "RE-00124",
  riskLevel: "High",
  title: "Cash Deficit Warning",
  description: "Shakti Poultry Farm may face a ₹38,400 cash deficit within the next 61 days due to feed cost increase.",
  createdAt: "2026-08-04T09:15:00Z",
  status: "Active"
};

export const shaktiTimelineEvents: TimelineEvent[] = [
  {
    id: "EV-001",
    enterpriseId: "RE-00124",
    date: "2026-08-02T09:30:00Z",
    title: "Financial records submitted",
    description: "Monthly financial records for July 2026 were submitted."
  },
  {
    id: "EV-002",
    enterpriseId: "RE-00124",
    date: "2026-08-04T09:00:00Z",
    title: "Forecast recalculated",
    description: "System automatically refreshed the 6-month forecast."
  },
  {
    id: "EV-003",
    enterpriseId: "RE-00124",
    date: "2026-08-04T09:15:00Z",
    title: "Risk moved from Amber to High",
    description: "Risk score increased to 74 due to projected DSCR and feed costs."
  }
];

export const initialDemoState: GramPulseState = {
  enterprises: {
    "RE-00124": shaktiPoultryFarm
  },
  financialRecords: {
    "RE-00124": shaktiFinancialRecords
  },
  forecasts: {
    "RE-00124": shaktiForecast
  },
  earlyWarnings: {
    "RE-00124": shaktiWarning
  },
  alerts: {
    "ALT-1001": shaktiAlert
  },
  interventions: {},
  timelineEvents: {
    "RE-00124": shaktiTimelineEvents
  },
  lastUpdated: new Date().toISOString()
};
