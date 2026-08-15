/**
 * staticFallbacks.ts
 *
 * Pre-baked API responses for every endpoint.
 * Used automatically by apiClient.ts when the backend is unreachable.
 *
 * Values are pinned to the Shakti Poultry Farm demo scenario
 * as specified in GRAMPULSE_UI_NEXT_STEPS.md.
 */

export const DEMO_ENTERPRISE_ID = 'ENT-00124';

// ─── /api/v1/portfolio/summary ────────────────────────────────────────────────
export const FALLBACK_PORTFOLIO_SUMMARY = {
  total: 3250,
  healthy: 1820,
  watchlist: 940,
  high: 292,
  critical: 97,
  forecastDeficitExposure: 124_500_000,
  activeInterventions: 47,
  riskMovement: { improvedCount: 8, deterioratedToAmber: 12, deterioratedToHigh: 5 },
  computedAt: '2026-08-04T09:00:00Z',
  cacheTtlSeconds: 60,
  _fallback: true,
};

export const FALLBACK_PORTFOLIO_TIMELINE = [
  { id: '1', type: 'alert', title: 'Cash-flow stress alert generated for 12 enterprises', time: 'May 19, 09:30 AM', icon: 'Sparkles', iconColor: 'text-[#16a34a]', bgColor: 'bg-green-50', borderColor: 'border-green-100' },
  { id: '2', type: 'intervention', title: 'Intervention recommended for Shakti Poultry', time: 'May 19, 11:15 AM', icon: 'Users', iconColor: 'text-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-100' },
  { id: '3', type: 'visit', title: 'Field visit completed in Nashik district', time: 'May 20, 02:45 PM', icon: 'MapPin', iconColor: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-100' },
  { id: '4', type: 'payment', title: 'Repayment received from 23 enterprises today', time: 'May 21, 10:20 AM', icon: 'CheckCircle', iconColor: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-100' },
  { id: '5', type: 'system', title: 'AI model retrained with latest data', time: 'May 21, 01:10 PM', icon: 'Database', iconColor: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-100' },
];

export const FALLBACK_PORTFOLIO_CASHFLOW = [
  { month: 'Dec\'23', inflow: 42, outflow: 30, net: 12, isForecast: false },
  { month: 'Jan\'24', inflow: 48, outflow: 35, net: 13, isForecast: false },
  { month: 'Feb\'24', inflow: 40, outflow: 32, net: 8, isForecast: false },
  { month: 'Mar\'24', inflow: 49, outflow: 36, net: 13, isForecast: false },
  { month: 'Apr\'24', inflow: 42, outflow: 30, net: 12, isForecast: false },
  { month: 'May\'24', inflow: 51, outflow: 38, net: 13, isForecast: false },
  { month: 'Jun\'24', inflow: 40, outflow: 42, net: -2, isForecast: true },
  { month: 'Jul\'24', inflow: 32, outflow: 40, net: -8, isForecast: true },
  { month: 'Aug\'24', inflow: 28, outflow: 40, net: -12, isForecast: true },
];

export const FALLBACK_SECTOR_DISTRIBUTION = [
  { name: 'Dairy', count: '1,138', value: 35, color: '#3b82f6' },
  { name: 'Poultry', count: '910', value: 28, color: '#f97316' },
  { name: 'Food Processing', count: '650', value: 20, color: '#10b981' },
  { name: 'Rural Retail', count: '552', value: 17, color: '#8b5cf6' },
];

export const FALLBACK_PORTFOLIO_TRENDS = [
  { label: 'Enterprises Added', count: '↑ 120', delta: '+4%', isUp: true, color: '#10b981', spark: [{v:10},{v:12},{v:15},{v:18},{v:20}] },
  { label: 'Enterprises At Risk', count: '↓ 5', delta: '-2%', isUp: false, isGoodDown: true, color: '#ef4444', spark: [{v:20},{v:18},{v:16},{v:15},{v:14}] },
  { label: 'Cash-flow Deficit', count: '↑ ₹18 L', delta: '+8%', isUp: true, isBadUp: true, color: '#ef4444', spark: [{v:12},{v:14},{v:16},{v:17},{v:19}] },
  { label: 'Interventions Completed', count: '↑ 15', delta: '+6%', isUp: true, color: '#10b981', spark: [{v:10},{v:11},{v:13},{v:14},{v:15}] },
];
export const FALLBACK_PORTFOLIO_CREDIT = [
  { name: 'Current', value: 92, color: '#16a34a' },
  { name: '1-15 Days', value: 4.6, color: '#f59e0b' },
  { name: '16-30 Days', value: 2.1, color: '#f97316' },
  { name: '>30 Days', value: 1.5, color: '#ef4444' },
];

// ─── /api/v1/portfolio/top-risk ──────────────────────────────────────────────
export const FALLBACK_TOP_RISK = {
  enterprises: [
    { entity_id: 'ENT-00124', name: 'Shakti Poultry Farm', state: 'Maharashtra', district: 'Nashik', block: 'Surgana', sector: 'Poultry', riskLevel: 'High', healthScore: 54, outstandingBalance: 384000, riskScore: 74, forecastDeficit: 38400, warningLeadTimeDays: 61, intervention: 'Recommended', officer: null },
    { entity_id: 'ENT-00125', name: 'Annapurna Dairy Cooperative', state: 'Maharashtra', district: 'Nashik', block: 'Pimpalgaon', sector: 'Dairy', riskLevel: 'Amber', healthScore: 72, outstandingBalance: 520000, riskScore: 92, forecastDeficit: 52000, warningLeadTimeDays: 18, intervention: null, officer: null },
    { entity_id: 'ENT-00126', name: 'Sahyadri Agro Processing', state: 'Maharashtra', district: 'Pune', block: 'Deola', sector: 'Food Processing', riskLevel: 'Low', healthScore: 91, outstandingBalance: 291000, riskScore: 28, forecastDeficit: 0, warningLeadTimeDays: null, intervention: null, officer: null },
    { entity_id: 'ENT-00212', name: 'Green Valley Produce', state: 'Maharashtra', district: 'Ahmednagar', block: 'Nandgaon', sector: 'Food Processing', riskLevel: 'Amber', healthScore: 65, outstandingBalance: 142000, riskScore: 65, forecastDeficit: 14200, warningLeadTimeDays: 72, intervention: null, officer: null },
    { entity_id: 'ENT-00305', name: 'Om Sai Agri Equipments', state: 'Maharashtra', district: 'Jalgaon', block: 'Dindori', sector: 'Rural Retail', riskLevel: 'Amber', healthScore: 58, outstandingBalance: 89000, riskScore: 58, forecastDeficit: 8900, warningLeadTimeDays: 88, intervention: null, officer: null },
  ],
  _fallback: true,
};

// ─── /api/v1/portfolio/cluster-alerts ────────────────────────────────────────
export const FALLBACK_CLUSTER_ALERTS = {
  clusterAlerts: [
    { sector: 'Poultry', district: 'Nashik', affectedCount: 84, signal: 'Feed-cost inflation affecting 84 poultry enterprises across Surgana and Dindori.', riskLevel: 'High' },
    { sector: 'Dairy', district: 'Ahmednagar', affectedCount: 56, signal: 'Dry weather reducing fodder availability. Milk procurement down 12%.', riskLevel: 'Amber' },
  ],
  _fallback: true,
};

// ─── /api/v1/enterprises/ENT-00124 ────────────────────────────────────────────
export const FALLBACK_ENTERPRISE = {
  id: DEMO_ENTERPRISE_ID,
  enterpriseId: DEMO_ENTERPRISE_ID,
  name: 'Shakti Poultry Farm',
  district: 'Nashik',
  block: 'Surgana',
  village: 'Surgana',
  state: 'Maharashtra',
  sector: 'Poultry',
  enterpriseType: 'Micro',
  ownershipType: 'Individual',
  accountStatus: 'Standard',
  currentDpd: 0,
  riskLevel: 'High',
  riskScore: 74,
  healthScore: 54,
  outstandingBalance: 384000,
  forecastDeficit: 38400,
  warningLeadTimeDays: 61,
  intervention: 'Recommended',
  officer: null,
  _fallback: true,
};

// ─── /api/v1/enterprises/RE-00001/forecast ───────────────────────────────────
export const FALLBACK_FORECAST = {
  enterpriseId: DEMO_ENTERPRISE_ID,
  modelVersion: 'grampulse-cf-v1.1',
  forecastGeneratedAt: '2026-08-04T09:00:00Z',
  forecast: [
    { month: '2026-08', horizon: 1, operatingInflow: 142500, operatingOutflow: 128200, closingCashBalance: 47600, cashAfterDebtService: 7300, lower: 35200, upper: 60000 },
    { month: '2026-09', horizon: 2, operatingInflow: 138000, operatingOutflow: 131500, closingCashBalance: 43800, cashAfterDebtService: 3200, lower: 29000, upper: 58600 },
    { month: '2026-10', horizon: 3, operatingInflow: 129000, operatingOutflow: 141200, closingCashBalance: 25200, cashAfterDebtService: -38400, lower: -52000, upper: -20000 },
    { month: '2026-11', horizon: 4, operatingInflow: 131000, operatingOutflow: 138000, closingCashBalance: 18400, cashAfterDebtService: -14200, lower: -28000, upper: 0 },
    { month: '2026-12', horizon: 5, operatingInflow: 145000, operatingOutflow: 133000, closingCashBalance: 30400, cashAfterDebtService: 4800, lower: -8000, upper: 18000 },
    { month: '2027-01', horizon: 6, operatingInflow: 148000, operatingOutflow: 128500, closingCashBalance: 49900, cashAfterDebtService: 12100, lower: 0, upper: 26000 },
  ],
  _fallback: true,
};

// ─── /api/v1/enterprises/RE-00001/early-warning ──────────────────────────────
export const FALLBACK_EARLY_WARNING = {
  enterpriseId: DEMO_ENTERPRISE_ID,
  riskScore: 74,
  riskLevel: 'High',
  forecastDeficit: 38400,
  debtServiceShortfall: 7200,
  stressMonth: '2026-10',
  warningLeadTimeDays: 61,
  drivers: [
    { feature: 'Input-cost increase', observedValue: 12, unit: 'percent', contributionPoints: 14, explanation: 'Feed costs increased by 12%, reducing projected operating surplus.' },
    { feature: 'UPI inflows', observedValue: -9, unit: 'percent', contributionPoints: 11, explanation: 'UPI inflows declined by 9%, signalling reduced collection activity.' },
    { feature: 'Local demand', observedValue: -6, unit: 'percent', contributionPoints: 8, explanation: 'Local demand softened by 6% in the district.' },
    { feature: 'DSCR', observedValue: 0.74, unit: 'ratio', contributionPoints: 12, explanation: 'Projected DSCR falls to 0.74, below the 1.0 threshold.' },
  ],
  _fallback: true,
};

// ─── /api/v1/enterprises/RE-00001/timeline ───────────────────────────────────
export const FALLBACK_TIMELINE = {
  enterpriseId: DEMO_ENTERPRISE_ID,
  events: [
    { id: 'EV-demo-001', enterpriseId: DEMO_ENTERPRISE_ID, date: '2026-08-04T09:00:00Z', title: 'Forecast recalculated', description: 'Risk level: High. ₹38,400 deficit forecast for October 2026.' },
    { id: 'EV-demo-002', enterpriseId: DEMO_ENTERPRISE_ID, date: '2026-08-02T08:00:00Z', title: 'Monthly financial records submitted', description: 'Operating inflow ₹1,42,000 · Expenses ₹1,31,500' },
    { id: 'EV-demo-003', enterpriseId: DEMO_ENTERPRISE_ID, date: '2026-07-15T10:00:00Z', title: 'Field visit completed', description: 'Officer noted increased feed cost. No payment delays observed.' },
    { id: 'EV-demo-004', enterpriseId: DEMO_ENTERPRISE_ID, date: '2026-07-01T09:00:00Z', title: 'Monthly financial records submitted', description: 'Operating inflow ₹1,51,200 · Expenses ₹1,28,900' },
  ],
  _fallback: true,
};

// ─── /api/v1/enterprises/RE-00001/alerts ─────────────────────────────────────
export const FALLBACK_ALERTS = [
  { id: 'ALT-demo-001', enterpriseId: DEMO_ENTERPRISE_ID, riskLevel: 'High', title: 'High Risk — Shakti Poultry Farm', description: 'Forecast deficit of ₹38,400 detected for October 2026.', createdAt: '2026-08-04T09:00:00Z', status: 'Active', _fallback: true },
];

// ─── /api/v1/weather/climate-risk?district=Nashik ────────────────────────────
export const FALLBACK_CLIMATE_RISK = {
  district: 'Nashik',
  climateRiskScore: 55,
  rainfallAnomaly: -12.3,
  temperatureMean: 30.8,
  droughtRisk: 'Moderate',
  consecutiveDryDays: 11,
  extremeHeatDays: 5,
  forecastRainfall: 48.0,
  source: 'synthetic',
  isStale: false,
  fallbackUsed: true,
  _fallback: true,
};

// ─── /api/v1/market/feed-index ───────────────────────────────────────────────
export const FALLBACK_FEED_INDEX = {
  feedIndex: 112.4,
  maizePrice: 2280,
  soybeanPrice: 4750,
  change1m: 2.1,
  change3m: 6.8,
  series: [
    { month: '2025-08', feedIndex: 100.0, maizePrice: 2150, soybeanPrice: 4600 },
    { month: '2025-09', feedIndex: 102.3, maizePrice: 2180, soybeanPrice: 4650 },
    { month: '2025-10', feedIndex: 104.1, maizePrice: 2200, soybeanPrice: 4700 },
    { month: '2025-11', feedIndex: 106.8, maizePrice: 2220, soybeanPrice: 4720 },
    { month: '2025-12', feedIndex: 108.2, maizePrice: 2235, soybeanPrice: 4730 },
    { month: '2026-01', feedIndex: 109.4, maizePrice: 2245, soybeanPrice: 4740 },
    { month: '2026-02', feedIndex: 110.1, maizePrice: 2250, soybeanPrice: 4742 },
    { month: '2026-03', feedIndex: 110.8, maizePrice: 2258, soybeanPrice: 4745 },
    { month: '2026-04', feedIndex: 111.3, maizePrice: 2265, soybeanPrice: 4748 },
    { month: '2026-05', feedIndex: 111.9, maizePrice: 2270, soybeanPrice: 4750 },
    { month: '2026-06', feedIndex: 112.0, maizePrice: 2274, soybeanPrice: 4750 },
    { month: '2026-07', feedIndex: 112.4, maizePrice: 2280, soybeanPrice: 4750 },
  ],
  source: 'synthetic',
  fallbackUsed: true,
  _fallback: true,
};

// ─── Scenario result (₹50k working capital injection) ────────────────────────
export const FALLBACK_SCENARIO = {
  enterpriseId: DEMO_ENTERPRISE_ID,
  scenarioInputs: { workingCapitalSupport: 50000 },
  baseline: {
    forecast: FALLBACK_FORECAST.forecast,
    earlyWarning: { ...FALLBACK_EARLY_WARNING },
  },
  scenario: {
    forecast: FALLBACK_FORECAST.forecast.map((m, i) => ({
      ...m,
      closingCashBalance: m.closingCashBalance + 50000 * [1.0, 0.70, 0.49, 0.34, 0.24, 0.17][i],
      cashAfterDebtService: m.cashAfterDebtService + 50000 * [1.0, 0.70, 0.49, 0.34, 0.24, 0.17][i],
    })),
    earlyWarning: { ...FALLBACK_EARLY_WARNING, riskLevel: 'Amber', riskScore: 48, forecastDeficit: 0, debtServiceShortfall: 0 },
  },
  delta: { riskScoreChange: -26, forecastDeficitChange: -38400, previousRiskLevel: 'High', newRiskLevel: 'Amber', riskLevelChanged: true },
  _fallback: true,
};

// ─── /api/v1/intelligence/behaviour ───────────────────────────────────────────
export const FALLBACK_BEHAVIOUR_INTELLIGENCE = {
  sparks: {
    repayment: [{ val: 70 }, { val: 72 }, { val: 74 }, { val: 73 }, { val: 76 }, { val: 78 }],
    cashflow: [{ val: 75 }, { val: 78 }, { val: 80 }, { val: 79 }, { val: 81 }, { val: 83 }],
    savings: [{ val: 20 }, { val: 21 }, { val: 22 }, { val: 23 }, { val: 23 }, { val: 24 }],
    stability: [{ val: 0.65 }, { val: 0.67 }, { val: 0.68 }, { val: 0.70 }, { val: 0.71 }, { val: 0.72 }],
    risk: [{ val: 78 }, { val: 76 }, { val: 75 }, { val: 74 }, { val: 73 }, { val: 72 }],
    highRisk: [{ val: 14 }, { val: 15 }, { val: 16 }, { val: 17 }, { val: 17 }, { val: 18 }]
  },
  repaymentTimeData: [
    { month: "Dec '23", onTime: 76, late: 18, default: 6 },
    { month: "Jan '24", onTime: 77, late: 17, default: 6 },
    { month: "Feb '24", onTime: 76, late: 18, default: 6 },
    { month: "Mar '24", onTime: 78, late: 17, default: 5 },
    { month: "Apr '24", onTime: 77, late: 18, default: 5 },
    { month: "May '24", onTime: 78, late: 17, default: 5 }
  ],
  cashflowBehaviourData: [
    { month: "Dec '23", regular: 75, irregular: 25 },
    { month: "Jan '24", regular: 78, irregular: 22 },
    { month: "Feb '24", regular: 79, irregular: 21 },
    { month: "Mar '24", regular: 81, irregular: 19 },
    { month: "Apr '24", regular: 82, irregular: 18 },
    { month: "May '24", regular: 83, irregular: 17 }
  ],
  savingsDistributionData: [
    { name: 'High Savers (>20%)', value: 28, color: '#16a34a' },
    { name: 'Medium Savers (10-20%)', value: 42, color: '#0284c7' },
    { name: 'Low Savers (<10%)', value: 20, color: '#f97316' },
    { name: 'No Savings', value: 10, color: '#ef4444' }
  ],
  incomeStabilityData: [
    { month: "Dec '23", index: 0.65 },
    { month: "Jan '24", index: 0.68 },
    { month: "Feb '24", index: 0.72 },
    { month: "Mar '24", index: 0.70 },
    { month: "Apr '24", index: 0.69 },
    { month: "May '24", index: 0.72 }
  ],
  aiInsights: [
    { text: 'Repayment discipline is strong in dairy and crop loan segments.' },
    { text: 'Cashflow irregularity is higher in Kharif dependent enterprises.' },
    { text: 'Savings behaviour is improving among women-led enterprises.' },
    { text: 'Income stability is highest in enterprises with diversified income.' }
  ],
  aiRecommendedActions: [
    { text: 'Encourage digital repayment reminders for high risk cases', level: 'High', color: 'bg-red-100 text-red-600' },
    { text: 'Promote cashflow planning workshops before sowing season', level: 'Medium', color: 'bg-orange-100 text-orange-600' },
    { text: 'Incentivize savings through recurring deposit products', level: 'Medium', color: 'bg-orange-100 text-orange-600' },
    { text: 'Monitor irregular cashflow enterprises closely', level: 'Low', color: 'bg-green-100 text-green-600' }
  ],
  watchlistData: [
    { enterprise: 'Shivam Milk Producer Co.', district: 'Satara', risk: 82, riskTrend: 'down', cashflow: 'Low', alert: true },
    { enterprise: 'Patil Dairy Farm', district: 'Pune', risk: 78, riskTrend: 'down', cashflow: 'Low', alert: true },
    { enterprise: 'Gokul Dairy', district: 'Kolhapur', risk: 76, riskTrend: 'neutral', cashflow: 'Medium', alert: true },
    { enterprise: 'Krishna Agro Producer Co.', district: 'Solapur', risk: 74, riskTrend: 'up', cashflow: 'High', alert: true },
    { enterprise: 'Warana Dairy', district: 'Kolhapur', risk: 70, riskTrend: 'up', cashflow: 'High', alert: true }
  ],
  districtMetrics: [
    { district: 'Pune', enterprises: 256, onTime: '81%', cashflow: '86%', savings: '26%', stability: '0.75', riskScore: 68, trend: '↓ 5 pts', isGoodTrend: true },
    { district: 'Kolhapur', enterprises: 198, onTime: '76%', cashflow: '82%', savings: '24%', stability: '0.71', riskScore: 72, trend: '↑ 6 pts', isGoodTrend: false },
    { district: 'Satara', enterprises: 184, onTime: '74%', cashflow: '79%', savings: '21%', stability: '0.69', riskScore: 75, trend: '↓ 4 pts', isGoodTrend: true },
    { district: 'Solapur', enterprises: 162, onTime: '73%', cashflow: '81%', savings: '23%', stability: '0.73', riskScore: 73, trend: '↓ 7 pts', isGoodTrend: true },
    { district: 'Sangli', enterprises: 148, onTime: '79%', cashflow: '84%', savings: '25%', stability: '0.77', riskScore: 67, trend: '↓ 3 pts', isGoodTrend: true }
  ]
};

// ─── /api/v1/intelligence/climate ───────────────────────────────────────────
export const FALLBACK_CLIMATE_INTELLIGENCE = {
  miniChartData: [
    { val: 12 }, { val: 18 }, { val: 15 }, { val: 25 }, { val: 20 }, { val: 30 }
  ],
  rainfallTrendData: [
    { day: 'May 13', actual: 80, normal: 100, forecast: 90 },
    { day: 'May 14', actual: 120, normal: 95, forecast: 110 },
    { day: 'May 15', actual: 95, normal: 105, forecast: 100 },
    { day: 'May 16', actual: 140, normal: 100, forecast: 130 },
    { day: 'May 17', actual: 85, normal: 110, forecast: 95 },
    { day: 'May 18', actual: 0, normal: 105, forecast: 115 }
  ],
  ndviTrendData: [
    { date: 'Mar 4', val: 0.42 }, { date: 'Mar 18', val: 0.48 }, { date: 'Apr 1', val: 0.55 },
    { date: 'Apr 15', val: 0.62 }, { date: 'Apr 29', val: 0.68 }, { date: 'May 13', val: 0.61 },
    { date: 'May 27', val: 0.64 }
  ],
  factors: [
    { name: 'Rainfall Variability', iconType: 'CloudRain', sev: 'Moderate', sColor: 'text-orange-500', imp: 'Medium' },
    { name: 'Temperature Stress', iconType: 'ThermometerSun', sev: 'Low', sColor: 'text-green-500', imp: 'Low' },
    { name: 'Drought Risk', iconType: 'Zap', sev: 'Moderate', sColor: 'text-orange-500', imp: 'Medium' },
    { name: 'Flood Risk', iconType: 'Droplets', sev: 'Low', sColor: 'text-green-500', imp: 'Low' },
    { name: 'Water Stress', iconType: 'Droplets', sev: 'High', sColor: 'text-red-500', imp: 'High' }
  ],
  recommendations: [
    { text: 'Monitor 12 water stress blocks closely', prio: 'High', pColor: 'text-red-600' },
    { text: 'Promote drought resilient crop varieties', prio: 'Medium', pColor: 'text-orange-600' },
    { text: 'Strengthen irrigation support in Marathwada', prio: 'Medium', pColor: 'text-orange-600' },
    { text: 'Plan contingency for potential dry spells', prio: 'Low', pColor: 'text-green-600' },
    { text: 'Share weather advisory with field officers', prio: 'Low', pColor: 'text-green-600' }
  ],
  tableData: [
    { dist: 'Beed', block: 'Ashti', score: 78, rain: '-28%', ndvi: '0.42', ws: 'High', wColor: 'text-red-500', trend: 'down' },
    { dist: 'Latur', block: 'Ausa', score: 74, rain: '-22%', ndvi: '0.45', ws: 'High', wColor: 'text-red-500', trend: 'down' },
    { dist: 'Solapur', block: 'Mohol', score: 72, rain: '-18%', ndvi: '0.48', ws: 'Moderate', wColor: 'text-orange-500', trend: 'up' },
    { dist: 'Parbhani', block: 'Gangakhed', score: 68, rain: '-16%', ndvi: '0.50', ws: 'Moderate', wColor: 'text-orange-500', trend: 'up' },
    { dist: 'Nanded', block: 'Mukhed', score: 64, rain: '-10%', ndvi: '0.52', ws: 'Moderate', wColor: 'text-orange-500', trend: 'up' }
  ]
};

// ─── /api/v1/copilot/simulate (Portfolio) ──────────────────────────────────
export const FALLBACK_PORTFOLIO_SCENARIO = {
  miniChartData: [
    { time: 'Now', base: 50, scenario: 50, baseECL: 18.6, scenECL: 18.6, baseHR: 475, scenHR: 475, baseCS: 758, scenCS: 758 },
    { time: '+3M', base: 49, scenario: 40, baseECL: 18.6, scenECL: 22.0, baseHR: 475, scenHR: 580, baseCS: 758, scenCS: 900 },
    { time: '+6M', base: 48, scenario: 30, baseECL: 18.6, scenECL: 24.7, baseHR: 475, scenHR: 685, baseCS: 758, scenCS: 1126 },
  ],
  districtsData: [
    { dist: 'Solapur', risk: '↑ 14 pts', rep: '↓ 9 pts', hr: '↑ 124' },
    { dist: 'Kolhapur', risk: '↑ 12 pts', rep: '↓ 8 pts', hr: '↑ 98' },
    { dist: 'Beed', risk: '↑ 11 pts', rep: '↓ 7 pts', hr: '↑ 86' },
    { dist: 'Ahmednagar', risk: '↑ 10 pts', rep: '↓ 6 pts', hr: '↑ 72' },
    { dist: 'Latur', risk: '↑ 9 pts', rep: '↓ 5 pts', hr: '↑ 61' },
  ],
  scenarioData: [
    { metric: 'Overall Risk Score (/100)', base: '68', scen: '78', change: '↑ 10 pts' },
    { metric: 'Avg. Repayment Rate (%)', base: '91%', scen: '84%', change: '↓ 7 pts' },
    { metric: 'Expected Credit Loss (₹ Cr)', base: '18.6', scen: '24.7', change: '↑ 32.8%' },
    { metric: 'High Risk Enterprises', base: '475 (19.3%)', scen: '685 (27.9%)', change: '↑ 210' },
    { metric: 'Cashflow Stressed Enterprises', base: '758 (30.8%)', scen: '1,126 (45.8%)', change: '↑ 368' },
    { metric: 'Default Probability (%)', base: '9.4%', scen: '12.6%', change: '↑ 3.2 pts' },
  ],
  summary: {
    message: "This climate shock scenario indicates a material increase in portfolio risk.",
    bullets: [
      "Lower rainfall and higher temperature are expected to reduce crop yield by 15%.",
      "Repayment capacity will decline, increasing credit stress across 45.8% of enterprises.",
      "Districts like Solapur, Kolhapur and Beed will require proactive monitoring and interventions."
    ]
  },
  _fallback: true,
};

// ─── /api/v1/intelligence/market ───────────────────────────────────────────
export const FALLBACK_MARKET_INTELLIGENCE = {
  miniCharts: {
    chart1: [{val: 20}, {val: 25}, {val: 22}, {val: 30}, {val: 28}, {val: 35}],
    chart2: [{val: 40}, {val: 35}, {val: 50}, {val: 45}, {val: 60}, {val: 55}],
    chart3: [{val: 50}, {val: 45}, {val: 40}, {val: 30}, {val: 25}, {val: 20}]
  },
  commodityPriceData: [
    { name: 'Milk', current: 38.6, last: 36.5 },
    { name: 'Paneer', current: 312, last: 295 },
    { name: 'Ghee', current: 540, last: 520 },
    { name: 'Butter', current: 275, last: 265 },
    { name: 'Whey', current: 52, last: 48 },
  ],
  demandSupplyData: [
    { date: 'May 13', demand: 2800, supply: 2600, gap: 200 },
    { date: 'May 14', demand: 2900, supply: 2700, gap: 200 },
    { date: 'May 15', demand: 3100, supply: 2750, gap: 350 },
    { date: 'May 16', demand: 3000, supply: 2800, gap: 200 },
    { date: 'May 17', demand: 3200, supply: 2800, gap: 400 },
    { date: 'May 18', demand: 3100, supply: 2900, gap: 200 },
  ],
  forecastData: [
    { week: 'Week 1', price: 38.6, demand: 120, bg: 150 },
    { week: 'Week 2', price: 39.2, demand: 125, bg: 150 },
    { week: 'Week 3', price: 39.8, demand: 132, bg: 150 },
    { week: 'Week 4', price: 40.5, demand: 138, bg: 150 },
  ],
  pieData: [
    { name: 'Cooperative Societies', value: 42, color: '#10b981' },
    { name: 'Private Dairies', value: 28, color: '#3b82f6' },
    { name: 'Milk Processors', value: 18, color: '#6366f1' },
    { name: 'Retail Chains', value: 8, color: '#f97316' },
    { name: 'Others', value: 4, color: '#f59e0b' },
  ],
  signals: [
    { text: 'Milk prices likely to remain firm in next 2 weeks', iconType: 'CloudRain', color: 'text-blue-500', badge: 'Positive', bColor: 'text-green-600 bg-green-50' },
    { text: 'Demand expected to increase by 8% in June', iconType: 'TrendingUp', color: 'text-green-500', badge: 'Positive', bColor: 'text-green-600 bg-green-50' },
    { text: 'Feed prices stable due to good grain availability', iconType: 'ShieldCheck', color: 'text-gray-500', badge: 'Neutral', bColor: 'text-gray-600 bg-gray-50' },
    { text: 'Festive season may boost dairy product demand', iconType: 'Zap', color: 'text-purple-500', badge: 'Positive', bColor: 'text-green-600 bg-green-50' },
  ],
  actions: [
    { text: 'Advise producers to maintain milk quality for premium prices', prio: 'High', pColor: 'text-red-500 bg-red-50' },
    { text: 'Encourage value-added products to improve margins', prio: 'Medium', pColor: 'text-orange-500 bg-orange-50' },
    { text: 'Monitor feed cost and optimize ration formulation', prio: 'Medium', pColor: 'text-orange-500 bg-orange-50' },
    { text: 'Plan for increased collection capacity in June', prio: 'Low', pColor: 'text-green-500 bg-green-50' },
  ],
  watchlistData: [
    { comm: 'Milk (Cow)', price: 38.6, trend: 'up', tColor: 'text-green-500', change: '+4.8%' },
    { comm: 'Milk (Buffalo)', price: 52.4, trend: 'up', tColor: 'text-green-500', change: '+3.9%' },
    { comm: 'Paneer', price: 312, trend: 'up', tColor: 'text-green-500', change: '+2.6%' },
    { comm: 'Ghee', price: 540, trend: 'up', tColor: 'text-green-500', change: '+1.2%' },
    { comm: 'Feed (Concentrate)', price: 28.5, trend: 'neutral', tColor: 'text-gray-500', change: '+0.3%' },
  ],
  marketsData: [
    { market: 'Pune', state: 'Maharashtra', pCur: 39.2, pLast: 37.5, pChg: '+ 4.5%', pChgD: 'up', dCur: 128, dChg: '+ 6.7%', dChgD: 'up', sCur: 820, sChg: '+ 5.2%', sChgD: 'up', sent: 'Positive', sColor: 'text-green-600 bg-green-50 border-green-100' },
    { market: 'Kolhapur', state: 'Maharashtra', pCur: 37.8, pLast: 36.1, pChg: '+ 4.7%', pChgD: 'up', dCur: 121, dChg: '+ 5.1%', dChgD: 'up', sCur: 610, sChg: '+ 4.3%', sChgD: 'up', sent: 'Positive', sColor: 'text-green-600 bg-green-50 border-green-100' },
    { market: 'Nagpur', state: 'Maharashtra', pCur: 36.4, pLast: 34.8, pChg: '+ 4.6%', pChgD: 'up', dCur: 116, dChg: '+ 4.8%', dChgD: 'up', sCur: 540, sChg: '+ 3.9%', sChgD: 'up', sent: 'Neutral', sColor: 'text-orange-600 bg-orange-50 border-orange-100' },
    { market: 'Aurangabad', state: 'Maharashtra', pCur: 35.9, pLast: 34.2, pChg: '+ 5.0%', pChgD: 'up', dCur: 112, dChg: '+ 5.6%', dChgD: 'up', sCur: 480, sChg: '+ 4.7%', sChgD: 'up', sent: 'Positive', sColor: 'text-green-600 bg-green-50 border-green-100' },
  ]
};

export const FALLBACK_TWIN_DETAILS = {
  RISK_TREND_DATA: [

  { month: "Dec '23", riskScore: 32, pd: 4.5 },
  { month: "Jan '24", riskScore: 30, pd: 4.2 },
  { month: "Feb '24", riskScore: 31, pd: 4.3 },
  { month: "Mar '24", riskScore: 29, pd: 4.1 },
  { month: "Apr '24", riskScore: 33, pd: 4.6 },
  { month: "May '24", riskScore: 28, pd: 4.0 },

  ],
  CASHFLOW_DATA: [

  { month: "May '24", inflow: 1.2, outflow: -0.8, net: 0.4 },
  { month: "Jun '24", inflow: 1.1, outflow: -0.7, net: 0.4 },
  { month: "Jul '24", inflow: 1.3, outflow: -0.9, net: 0.4 },
  { month: "Aug '24", inflow: 1.2, outflow: -0.8, net: null, forecast: 0.4, isForecast: true },
  { month: "Sep '24", inflow: 1.4, outflow: -0.9, net: null, forecast: 0.5, isForecast: true },
  { month: "Oct '24", inflow: 1.1, outflow: -0.8, net: null, forecast: 0.3, isForecast: true },

  ],
  DONUT_DATA: [

  { name: 'Current', value: 92, color: '#16a34a' },
  { name: '1-15 Days', value: 4.6, color: '#f59e0b' },
  { name: '16-30 Days', value: 2.1, color: '#f97316' },
  { name: '>30 Days', value: 1.5, color: '#ef4444' },

  ],
  FINANCIAL_CASHFLOW_DATA: [

  { month: "May '24", inflow: 2.92, outflow: 2.44, net: 0.48 },
  { month: "Jun '24", inflow: 2.85, outflow: 2.36, net: 0.49 },
  { month: "Jul '24", inflow: 2.88, outflow: 2.40, net: 0.48 },
  { month: "Aug '24", inflow: 2.90, outflow: 2.42, net: null, forecast: 0.48, isForecast: true },
  { month: "Sep '24", inflow: 2.95, outflow: 2.45, net: null, forecast: 0.50, isForecast: true },
  { month: "Oct '24", inflow: 2.92, outflow: 2.44, net: null, forecast: 0.48, isForecast: true },

  ],
  INFLOW_BREAKDOWN: [

  { name: 'Milk Sales', value: 75, amount: '₹6.26 L', color: '#16a34a' },
  { name: 'Calf Sales', value: 10, amount: '₹0.86 L', color: '#f59e0b' },
  { name: 'Govt. Subsidy', value: 7, amount: '₹0.60 L', color: '#3b82f6' },
  { name: 'Other Income', value: 8, amount: '₹0.86 L', color: '#14b8a6' },

  ],
  OUTFLOW_BREAKDOWN: [

  { name: 'Feed Cost', value: 62, amount: '₹4.43 L', color: '#f97316' },
  { name: 'Labour Cost', value: 13, amount: '₹0.93 L', color: '#3b82f6' },
  { name: 'Vet & Medicine', value: 8, amount: '₹0.57 L', color: '#14b8a6' },
  { name: 'Other Expenses', value: 17, amount: '₹1.21 L', color: '#64748b' },

  ],
  RECENT_TRANSACTIONS: [

  { date: 'May 18, 2024', particular: 'Milk Sale - Gokul Dairy', type: 'Inflow', amount: '+₹85,600', category: 'Milk Sales' },
  { date: 'May 17, 2024', particular: 'Feed Purchase - Shree Feeds', type: 'Outflow', amount: '-₹26,400', category: 'Feed Cost' },
  { date: 'May 16, 2024', particular: 'Vet Medicine - Satara Vet Clinic', type: 'Outflow', amount: '-₹4,850', category: 'Vet & Medicine' },
  { date: 'May 15, 2024', particular: 'Subsidy Received - Dairy Dev. Scheme', type: 'Inflow', amount: '+₹6,000', category: 'Govt. Subsidy' },

  ],
  ACTIVE_LOANS: [

  { acc: 'LN-2022-00124', product: 'Term Loan', sanction: '₹8.00 L', out: '₹2.84 L', roi: '10.75%', tenure: '36 Months', status: 'Active' },
  { acc: 'WC-2023-00077', product: 'Working Capital', sanction: '₹2.00 L', out: '₹0.48 L', roi: '11.50%', tenure: '12 Months', status: 'Active' },
  { acc: 'OD-2023-00015', product: 'Overdraft', sanction: '₹1.50 L', out: '₹0.35 L', roi: '11.25%', tenure: '12 Months', status: 'Active' },

  ],
  REPAYMENT_DATA: [

  { month: "Jun '23", onTime: 100, late1: 0, late2: 0 },
  { month: "Jul '23", onTime: 100, late1: 0, late2: 0 },
  { month: "Aug '23", onTime: 100, late1: 0, late2: 0 },
  { month: "Sep '23", onTime: 80, late1: 20, late2: 0 },
  { month: "Oct '23", onTime: 100, late1: 0, late2: 0 },
  { month: "Nov '23", onTime: 100, late1: 0, late2: 0 },
  { month: "Dec '23", onTime: 100, late1: 0, late2: 0 },
  { month: "Jan '24", onTime: 100, late1: 0, late2: 0 },
  { month: "Feb '24", onTime: 90, late1: 10, late2: 0 },
  { month: "Mar '24", onTime: 100, late1: 0, late2: 0 },
  { month: "Apr '24", onTime: 100, late1: 0, late2: 0 },
  { month: "May '24", onTime: 100, late1: 0, late2: 0 },

  ],
  CREDIT_UTILIZATION: [

  { name: 'Utilized', value: 82, color: '#16a34a' },
  { name: 'Unutilized', value: 18, color: '#e5e7eb' },

  ],
  PRODUCTION_DATA: [

  { date: 'May 19', prod: 1150, fat: 4.1 },
  { date: 'May 20', prod: 1180, fat: 4.1 },
  { date: 'May 21', prod: 1200, fat: 4.2 },
  { date: 'May 22', prod: 1190, fat: 4.1 },
  { date: 'May 23', prod: 1220, fat: 4.2 },
  { date: 'May 24', prod: 1250, fat: 4.2 },
  { date: 'May 25', prod: 1245, fat: 4.3 },

  ],
  HERD_DATA: [

  { name: 'Milch Animals', val: 38, pct: '56%', col: '#16a34a' },
  { name: 'Dry Animals', val: 12, pct: '18%', col: '#f59e0b' },
  { name: 'Heifers', val: 10, pct: '15%', col: '#8b5cf6' },
  { name: 'Calves', val: 8, pct: '12%', col: '#3b82f6' },

  ],
  FEED_DATA: [

  { name: 'Concentrate', val: 1.54, pct: '47%', col: '#16a34a' },
  { name: 'Fodder', val: 1.12, pct: '35%', col: '#f59e0b' },
  { name: 'Silage', val: 0.38, pct: '12%', col: '#8b5cf6' },
  { name: 'Other', val: 0.20, pct: '6%', col: '#3b82f6' },

  ],
  RAINFALL_DATA: [

  { month: "Dec '23", actual: 85, normal: 120 },
  { month: "Jan '24", actual: 160, normal: 110 },
  { month: "Feb '24", actual: 105, normal: 90 },
  { month: "Mar '24", actual: 80, normal: 95 },
  { month: "Apr '24", actual: 40, normal: 60 },
  { month: "May '24", actual: 30, normal: 75 },
  { month: "Jun '24", actual: null, normal: 150, forecast: 110 },
  { month: "Jul '24", actual: null, normal: 180, forecast: 130 },

  ],
  MILK_PRICE_DATA: [

  { month: "Dec '23", satara: 35.5, pune: 37, mumbai: 38 },
  { month: "Jan '24", satara: 36, pune: 37.5, mumbai: 39 },
  { month: "Feb '24", satara: 36.5, pune: 38, mumbai: 39.5 },
  { month: "Mar '24", satara: 36.2, pune: 37.8, mumbai: 39.5 },
  { month: "Apr '24", satara: 37, pune: 38.5, mumbai: 40 },
  { month: "May '24", satara: 37.5, pune: 39.2, mumbai: 40.5 },
  { month: "Jun '24", satara: 38.2, pune: 40.0, mumbai: 41.5 },
  { month: "Jul '24", satara: 38.5, pune: 40.5, mumbai: 42.0 },

  ],
  FEED_PRICE_DATA: [

  { month: "Dec '23", concentrate: 1550, fodder: 800, oilcake: 1100 },
  { month: "Jan '24", concentrate: 1580, fodder: 780, oilcake: 1150 },
  { month: "Feb '24", concentrate: 1600, fodder: 750, oilcake: 1120 },
  { month: "Mar '24", concentrate: 1550, fodder: 700, oilcake: 1100 },
  { month: "Apr '24", concentrate: 1500, fodder: 680, oilcake: 1080 },
  { month: "May '24", concentrate: 1520, fodder: 700, oilcake: 1090 },
  { month: "Jun '24", concentrate: 1530, fodder: 710, oilcake: 1100 },
  { month: "Jul '24", concentrate: 1540, fodder: 720, oilcake: 1110 },

  ],
  DEMAND_DATA: [

  { name: 'Pune', value: 42.6, col: '#16a34a' },
  { name: 'Mumbai', value: 29.8, col: '#a855f7' },
  { name: 'Satara Local', value: 17.5, col: '#f97316' },
  { name: 'Other Districts', value: 10.1, col: '#3b82f6' },

  ],
  TIMELINE_EVENTS: [

  { 
    date: 'May 20\n2024', 
    icon: 'CheckCircle2', 
    iconCol: 'bg-[#16a34a]',
    lineCol: 'bg-[#16a34a]', 
    title: 'Repayment Received', 
    cat: 'Credit', 
    catCol: 'text-green-700 bg-green-50 border-green-100',
    desc: 'EMI of ₹35,000 received for Term Loan (LN-2022-00124)',
    val: '₹35,000',
    status: 'Completed',
    statusCol: 'text-green-700 bg-green-50 border-green-100'
  },
  { 
    date: 'May 18\n2024', 
    icon: 'CheckCircle2', 
    iconCol: 'bg-[#16a34a]',
    lineCol: 'bg-[#16a34a]',
    title: 'Milk Production Increase', 
    cat: 'Operations', 
    catCol: 'text-blue-700 bg-blue-50 border-blue-100',
    desc: 'Daily milk production increased to 1,245 L (+4.6% vs last month)',
    val: '1,245 L/day',
    status: 'Completed',
    statusCol: 'text-green-700 bg-green-50 border-green-100'
  },
  { 
    date: 'May 16\n2024', 
    icon: 'CheckCircle2', 
    iconCol: 'bg-[#16a34a]',
    lineCol: 'bg-[#16a34a]',
    title: 'Feed Purchase', 
    cat: 'Operations', 
    catCol: 'text-blue-700 bg-blue-50 border-blue-100',
    desc: 'Feed purchased from Shree Feeds',
    val: '₹26,400',
    status: 'Completed',
    statusCol: 'text-green-700 bg-green-50 border-green-100'
  },
  { 
    date: 'May 14\n2024', 
    icon: 'CheckCircle2', 
    iconCol: 'bg-[#16a34a]',
    lineCol: 'bg-gray-200',
    title: 'Market Price Update', 
    cat: 'Market', 
    catCol: 'text-orange-700 bg-orange-50 border-orange-100',
    desc: 'Average milk price increased to ₹38.6 / L in Satara',
    val: '₹38.6 / L',
    status: 'Completed',
    statusCol: 'text-green-700 bg-green-50 border-green-100'
  },
  { 
    date: 'May 12\n2024', 
    icon: 'Info', 
    iconCol: 'bg-[#3b82f6]',
    lineCol: 'bg-gray-200',
    title: 'Veterinary Check-up', 
    cat: 'Operations', 
    catCol: 'text-blue-700 bg-blue-50 border-blue-100',
    desc: 'Routine veterinary check-up completed for 28 animals',
    val: '28 Animals',
    status: 'Info',
    statusCol: 'text-blue-700 bg-blue-50 border-blue-100'
  },
  { 
    date: 'May 10\n2024', 
    icon: 'AlertTriangle', 
    iconCol: 'bg-orange-500',
    lineCol: 'bg-gray-200',
    title: 'Heat Stress Alert', 
    cat: 'Climate', 
    catCol: 'text-green-700 bg-green-50 border-green-100',
    desc: 'Heat stress conditions expected for next 2 days',
    val: '',
    status: 'High Risk',
    statusCol: 'text-orange-700 bg-orange-50 border-orange-100'
  },
  { 
    date: 'May 28\n2024', 
    icon: 'CalendarDays', 
    iconCol: 'bg-purple-500',
    lineCol: 'bg-transparent',
    title: 'Next EMI Due', 
    cat: 'Credit', 
    catCol: 'text-green-700 bg-green-50 border-green-100',
    desc: 'Next EMI due for Term Loan (LN-2022-00124)',
    val: '₹35,000',
    status: 'Upcoming',
    statusCol: 'text-purple-700 bg-purple-50 border-purple-100'
  }

  ],
  AI_CASHFLOW_DATA: [

  { month: "May '24", inflows: 2.5, outflows: 1.2, net: 1.3 },
  { month: "Jun '24", inflows: 3.2, outflows: 1.4, net: 1.8 },
  { month: "Jul '24", inflows: 3.1, outflows: 1.5, net: 1.6 },

  ],
  AI_CREDIT_HEALTH_DATA: [

  { name: 'Score', value: 96, fill: '#16a34a' },
  { name: 'Remaining', value: 4, fill: '#f3f4f6' }

  ],
};

export const FALLBACK_COPILOT_DETAILS = {
  DONUT_DATA: [

  { name: 'High Risk (87)', value: 3.5, color: '#ef4444' },
  { name: 'Medium Risk (412)', value: 16.8, color: '#f59e0b' },
  { name: 'Low Risk (1,959)', value: 79.7, color: '#10b981' },

  ],
  BAR_DATA: [

  { name: 'Repayment Stress', value: 62, color: '#ef4444' },
  { name: 'Cashflow Decline', value: 48, color: '#f59e0b' },
  { name: 'Income Volatility', value: 34, color: '#fcd34d' },
  { name: 'Overdraft Usage', value: 26, color: '#a855f7' },
  { name: 'Climate Stress', value: 22, color: '#3b82f6' },

  ],
  SUGGESTED_QUESTIONS: [

  "Why are repayment rates falling?",
  "Show enterprises needing intervention.",
  "Which districts have the highest climate exposure?",
  "Which enterprises are suitable for new lending?",
  "Explain today's risk changes.",
  "Generate executive portfolio summary.",
  "What changed since last week?",
  "Which borrowers require field visits?"

  ],
  REASONING_DATA: [

  { label: 'Reasoning Steps', value: '5 steps', isValue: false },
  { label: 'Evidence Used', value: '12 data points', isValue: false },
  { label: 'Confidence Score', value: '86%', isValue: true, isProgress: true, progressVal: 86 },
  { label: 'Data Sources', value: '8 sources', isValue: false },
  { label: 'Affected Enterprises', value: '87 enterprises', isValue: false },
  { label: 'Model Version', value: 'v3.2.1 (Latest)', isValue: false },
  { label: 'Explain Prediction', value: 'View explanation', isValue: true, isLink: true },
  { label: 'Risk Drivers', value: '5 key drivers', isValue: false },

  ],
  RECOMMENDED_ACTIONS: [

  { label: 'Approve Lending', icon: 'CheckCircle2', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  { label: 'Assign Field Visit', icon: 'UserPlus', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { label: 'Monitor Enterprise', icon: 'Eye', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
  { label: 'Escalate Risk', icon: 'AlertTriangle', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
  { label: 'Generate Report', icon: 'FileText', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  { label: 'Share Analysis', icon: 'Share2', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { label: 'Export Decision', icon: 'Download', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },

  ],
  SOURCE_EVIDENCE: [

  { label: 'Account Aggregator', val: '2,458' },
  { label: 'Credit History', val: '2,458' },
  { label: 'Climate Data', val: '2,458' },
  { label: 'Market Data', val: '1,842' },
  { label: 'Behaviour Signals', val: '2,458' },
  { label: 'Cashflow', val: '2,458' },
  { label: 'Operations', val: '1,975' },
  { label: 'Timeline Events', val: '2,102' },

  ],
};

export const FALLBACK_BEHAVIOUR_INTELLIGENCE_DETAILS = {
};

export const FALLBACK_CLIMATE_INTELLIGENCE_DETAILS = {
};

export const FALLBACK_MARKET_INTELLIGENCE_DETAILS = {
};

export const FALLBACK_SECTOR_INTELLIGENCE_DETAILS = {
  PERFORMANCE_DATA: [

  { name: 'Dairy & Allied', score: 82, change: '+ 8', chgDir: 'up', width: '90%' },
  { name: 'Crop Production', score: 68, change: '+ 4', chgDir: 'up', width: '75%' },
  { name: 'Agri Services', score: 62, change: '- 2', chgDir: 'down', width: '68%' },
  { name: 'Food Processing', score: 58, change: '+ 3', chgDir: 'up', width: '64%' },
  { name: 'Handloom & Textiles', score: 55, change: '+ 1', chgDir: 'up', width: '60%' },
  { name: 'Rural Services', score: 64, change: '+ 5', chgDir: 'up', width: '70%' },
  { name: 'Others', score: 48, change: '- 3', chgDir: 'down', width: '50%' },

  ],
  GROWTH_TREND_DATA: [

  { month: 'Dec \'23', dairy: 12, crop: 8, rural: 5 },
  { month: 'Jan \'24', dairy: 14, crop: 9, rural: 6 },
  { month: 'Feb \'24', dairy: 15, crop: 8, rural: 7 },
  { month: 'Mar \'24', dairy: 16, crop: 10, rural: 8 },
  { month: 'Apr \'24', dairy: 18, crop: 11, rural: 9 },
  { month: 'May \'24', dairy: 17, crop: 10, rural: 8 },

  ],
  PIE_DATA: [

  { name: 'Dairy & Allied', value: 32, color: '#10b981' },
  { name: 'Crop Production', value: 24, color: '#3b82f6' },
  { name: 'Agri Services', value: 16, color: '#a855f7' },
  { name: 'Food Processing', value: 12, color: '#f97316' },
  { name: 'Rural Services', value: 9, color: '#eab308' },
  { name: 'Others', value: 7, color: '#9ca3af' },

  ],
  SIGNALS: [

  { text: 'Dairy sector margins likely to remain stable in next 4 weeks.', icon: 'CloudRain', color: 'text-blue-500' },
  { text: 'Kharif sowing progress is at 78% of normal across Maharashtra.', icon: 'TrendingUp', color: 'text-green-500' },
  { text: 'Input cost inflation is easing, supporting farm profitability.', icon: 'ShieldCheck', color: 'text-gray-500' },
  { text: 'Rural services demand rising with digital & financial inclusion.', icon: 'Zap', color: 'text-purple-500' },

  ],
  ACTIONS: [

  { text: 'Increase credit support for dairy and allied enterprises', prio: 'High', pColor: 'text-red-500 bg-red-50' },
  { text: 'Promote value addition units in food processing', prio: 'Medium', pColor: 'text-orange-500 bg-orange-50' },
  { text: 'Encourage farmer producer organizations in crop sector', prio: 'Medium', pColor: 'text-orange-500 bg-orange-50' },
  { text: 'Strengthen market linkages for agri input suppliers', prio: 'Low', pColor: 'text-green-500 bg-green-50' },

  ],
  WATCHLIST_DATA: [

  { sector: 'Cotton', risk: 68, trend: 'up', tColor: 'text-red-500', reason: 'Price Volatility' },
  { sector: 'Sugarcane', risk: 62, trend: 'up', tColor: 'text-red-500', reason: 'Payment Delays' },
  { sector: 'Pulses', risk: 58, trend: 'down', tColor: 'text-green-500', reason: 'Demand Weakness' },

  ],
  SECTORS_DATA: [

  { sector: 'Dairy & Allied', ent: '4,256', growth: '14.8%', credit: '5,920', repRate: '94%', risk: '36', rTrend: 'down', rColor: 'text-green-500', opp: '82', oColor: 'text-green-600' },
  { sector: 'Crop Production', ent: '12,845', growth: '9.6%', credit: '4,480', repRate: '90%', risk: '44', rTrend: 'down', rColor: 'text-green-500', opp: '68', oColor: 'text-green-600' },
  { sector: 'Agri Services', ent: '6,134', growth: '8.2%', credit: '2,960', repRate: '88%', risk: '46', rTrend: 'up', rColor: 'text-red-500', opp: '62', oColor: 'text-green-600' },
  { sector: 'Food Processing', ent: '1,842', growth: '11.3%', credit: '2,280', repRate: '89%', risk: '48', rTrend: 'up', rColor: 'text-red-500', opp: '58', oColor: 'text-green-600' },
  { sector: 'Handloom & Textiles', ent: '2,015', growth: '6.1%', credit: '1,480', repRate: '86%', risk: '50', rTrend: 'up', rColor: 'text-red-500', opp: '55', oColor: 'text-orange-600' },
  { sector: 'Rural Services', ent: '3,987', growth: '12.7%', credit: '1,670', repRate: '91%', risk: '40', rTrend: 'down', rColor: 'text-green-500', opp: '64', oColor: 'text-green-600' },
  { sector: 'Others', ent: '2,356', growth: '5.3%', credit: '1,770', repRate: '84%', risk: '52', rTrend: 'up', rColor: 'text-red-500', opp: '48', oColor: 'text-orange-600' },

  ],
};


export const FALLBACK_OVERVIEW_CONTEXT = {
  userName: "Rohit",
  lastUpdated: "May 21, 2024 01:15 PM",
  aiSummary: "The portfolio is showing increased stress due to prolonged dry spells in Maharashtra, driving up feed costs. Dairy and poultry segments require immediate attention, while staple crops remain stable.",
  aiConfidence: 92,
  topRecommendation: "Approve ₹4.2Cr working capital for 45 high-risk dairy units in Latur."
};

export const FALLBACK_OVERVIEW_CLIMATE_IMPACT = {
  rainfallDeficit: "-24%",
  districtsAffected: "12/36",
  heatwaveAlerts: 5
};

export const FALLBACK_OVERVIEW_MARKET_SIGNALS = {
  milk: "₹42/L",
  feedIndex: "145",
  maize: "+12%",
  soybean: "+8%"
};
