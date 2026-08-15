import {
  FALLBACK_PORTFOLIO_SUMMARY,
  FALLBACK_PORTFOLIO_TIMELINE,
  FALLBACK_PORTFOLIO_CASHFLOW,
  FALLBACK_PORTFOLIO_CREDIT,
  FALLBACK_SECTOR_DISTRIBUTION,
  FALLBACK_PORTFOLIO_TRENDS,
  FALLBACK_TWIN_DETAILS,
  FALLBACK_COPILOT_DETAILS,
  FALLBACK_BEHAVIOUR_INTELLIGENCE_DETAILS,
  FALLBACK_CLIMATE_INTELLIGENCE_DETAILS,
  FALLBACK_MARKET_INTELLIGENCE_DETAILS,
  FALLBACK_SECTOR_INTELLIGENCE_DETAILS,
  FALLBACK_OVERVIEW_CONTEXT,
  FALLBACK_OVERVIEW_CLIMATE_IMPACT,
  FALLBACK_OVERVIEW_MARKET_SIGNALS,
  FALLBACK_TOP_RISK,

  FALLBACK_CLUSTER_ALERTS,
  FALLBACK_ENTERPRISE,
  FALLBACK_FORECAST,
  FALLBACK_EARLY_WARNING,
  FALLBACK_TIMELINE,
  FALLBACK_ALERTS,
  FALLBACK_CLIMATE_RISK,
  FALLBACK_FEED_INDEX,
  FALLBACK_SCENARIO,
  DEMO_ENTERPRISE_ID,
  FALLBACK_BEHAVIOUR_INTELLIGENCE,
  FALLBACK_CLIMATE_INTELLIGENCE,
  FALLBACK_MARKET_INTELLIGENCE,
  FALLBACK_PORTFOLIO_SCENARIO,
} from '../services/fallbacks/staticFallbacks';

export const DEMO_METADATA = {
  snapshotVersion: "1.0.0",
  generatedAt: new Date().toISOString(),
  dataMode: "DEMO"
};

// ─── SESSION STATE MANAGEMENT ───────────────────────────────────────────────

const STATE_KEY = 'grampulse_demo_state_v2';

function deepClone(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

function validateDemoIntegrity(state: any) {
  const ents = state.enterprises;
  const errors = [];
  
  if (!ents.find((e: any) => e.entity_id === 'ENT-00124')) errors.push("Missing ENT-00124 (High Risk)");
  if (!ents.find((e: any) => e.entity_id === 'ENT-00125')) errors.push("Missing ENT-00125 (Medium Risk)");
  if (!ents.find((e: any) => e.entity_id === 'ENT-00126')) errors.push("Missing ENT-00126 (Healthy)");
  
  const ids = ents.map((e: any) => e.entity_id);
  if (new Set(ids).size !== ids.length) errors.push("Duplicate enterprise IDs found");
  
  if (ents.some((e: any) => e.outstandingBalance < 0)) errors.push("Negative outstandingBalance found");
  if (ents.some((e: any) => e.healthScore < 0 || e.healthScore > 100)) errors.push("Invalid healthScore");
  
  // No RE-00001 references should remain
  const jsonStr = JSON.stringify(state);
  if (jsonStr.includes('RE-00001')) errors.push("Found leftover RE-00001 references");

  if (errors.length > 0) {
    console.error("❌ Demo Integrity Validation Failed:\n" + errors.map(e => "  - " + e).join("\n"));
  } else {
    console.log("✅ Demo Integrity Validation Passed");
  }
}

function loadInitialState() {
  if (typeof window !== 'undefined') {
    const saved = sessionStorage.getItem(STATE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse demo state from sessionStorage", e);
      }
    }
  }

  // Generate initial state from fallbacks
  const enterprises = deepClone(FALLBACK_TOP_RISK.enterprises);
  
  // Merge detailed FALLBACK_ENTERPRISE properties into the hero (ENT-00124)
  const heroIndex = enterprises.findIndex((e: any) => e.entity_id === DEMO_ENTERPRISE_ID);
  if (heroIndex >= 0) {
    enterprises[heroIndex] = { ...deepClone(FALLBACK_ENTERPRISE), ...enterprises[heroIndex] };
  }

  const initialState = {
    enterprises,
    interventions: [], // Store interventions explicitly
    portfolioSummary: deepClone(FALLBACK_PORTFOLIO_SUMMARY),
  };
  
  validateDemoIntegrity(initialState);
  return initialState;
}

let demoState = loadInitialState();

function persistState() {
  // mathematical consistency check before save
  recomputeAggregates();
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STATE_KEY, JSON.stringify(demoState));
  }
}

// Ensure Overview aggregates are mathematically derived from the demoState enterprises
function recomputeAggregates() {
  let totalOutstanding = 0;
  let healthy = 0;
  let watchlist = 0;
  let high = 0;
  let critical = 0;
  let totalHealthScore = 0;
  
  demoState.enterprises.forEach((ent: any) => {
    totalOutstanding += ent.outstandingBalance || 0;
    totalHealthScore += ent.healthScore || 0;
    if (ent.riskLevel === 'High') high++;
    else if (ent.riskLevel === 'Critical') critical++;
    else if (ent.riskLevel === 'Amber') watchlist++;
    else healthy++;
  });
  
  // Since we only have 5 enterprises in demo mode, but want the demo to feel like a full portfolio of 3250:
  // We'll compute the "base" numbers (3250 total, etc) from the static fallbacks, and just append our mutations to it.
  // Wait, the user said: "Every aggregate displayed in Overview must be derivable from the current demoState... For example: Total Outstanding = Σ enterprise.outstandingBalance".
  // So we will STRICTLY compute them based on the 5 enterprises we have in the demo state.
  // The demo will show 5 total enterprises instead of 3250. This is the only way to ensure perfect mathematical consistency without complex mock extrapolation.
  
  demoState.portfolioSummary = {
    ...demoState.portfolioSummary,
    total: demoState.enterprises.length,
    healthy,
    watchlist,
    high,
    critical,
    forecastDeficitExposure: totalOutstanding,
    // count active interventions
    activeInterventions: demoState.interventions.length,
    computedAt: new Date().toISOString(),
  };
}

export function resetDemoState() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STATE_KEY);
  }
  demoState = loadInitialState();
}

// Helper to filter enterprises based on dropdown selections
function getFilteredEnterprises(filters?: any) {
  if (!filters) return demoState.enterprises;
  
  return demoState.enterprises.filter((ent: any) => {
    let match = true;
    if (filters.state && filters.state !== 'All States' && ent.state !== filters.state) match = false;
    if (filters.district && filters.district !== 'All Districts' && ent.district !== filters.district) match = false;
    if (filters.sector && filters.sector !== 'All Sectors' && ent.sector !== filters.sector) match = false;
    return match;
  });
}

// ─── DATA GETTERS ────────────────────────────────────────────────────────────

export function getDemoOverviewKpis(filters?: any) {
  const filtered = getFilteredEnterprises(filters);
  
  let totalOutstanding = 0;
  let healthy = 0, watchlist = 0, high = 0, critical = 0;
  
  filtered.forEach((ent: any) => {
    totalOutstanding += ent.outstandingBalance || 0;
    if (ent.riskLevel === 'High') high++;
    else if (ent.riskLevel === 'Critical') critical++;
    else if (ent.riskLevel === 'Amber') watchlist++;
    else healthy++;
  });

  return {
    ...demoState.portfolioSummary,
    total: filtered.length,
    healthy,
    watchlist,
    high,
    critical,
    forecastDeficitExposure: totalOutstanding,
    fieldVisitsToday: Math.min(5, filtered.length)
  };
}

export function getDemoOverviewContext() {
  return deepClone(FALLBACK_OVERVIEW_CONTEXT);
}

export function getDemoClimateImpact() {
  return deepClone(FALLBACK_OVERVIEW_CLIMATE_IMPACT);
}

export function getDemoMarketSignals() {
  return deepClone(FALLBACK_OVERVIEW_MARKET_SIGNALS);
}

export function getDemoOverviewTimeline(filters?: any) {
  return deepClone(FALLBACK_PORTFOLIO_TIMELINE);
}

export function getDemoOverviewCashflow(filters?: any) {
  return deepClone(FALLBACK_PORTFOLIO_CASHFLOW);
}

export function getDemoOverviewCredit(filters?: any) {
  return deepClone(FALLBACK_PORTFOLIO_CREDIT);
}

export function getDemoPortfolioList(filters?: any) {
  return { enterprises: getFilteredEnterprises(filters) };
}

export function getDemoSectorDistribution(filters?: any) {
  return deepClone(FALLBACK_SECTOR_DISTRIBUTION);
}

export function getDemoPortfolioTrends(filters?: any) {
  return deepClone(FALLBACK_PORTFOLIO_TRENDS);
}

export function getDemoEnterpriseById(id: string) {
  const ent = demoState.enterprises.find((e: any) => e.entity_id === id);
  if (ent) return ent;
  // If requested enterprise isn't in our top 5 list, just return the hero as a fallback fallback
  return demoState.enterprises[0];
}

export function getDemoForecast(id: string) {
  return deepClone(FALLBACK_FORECAST);
}

export function getDemoEarlyWarning(id: string) {
  const ews = deepClone(FALLBACK_EARLY_WARNING);
  ews.enterpriseId = id;
  return ews;
}

export function getDemoDigitalTwin(id: string) {
  return {
    identity: getDemoEnterpriseById(id),
    forecast: getDemoForecast(id),
    earlyWarning: getDemoEarlyWarning(id),
    timeline: deepClone(FALLBACK_TIMELINE),
    alerts: deepClone(FALLBACK_ALERTS),
    twinDetails: deepClone(FALLBACK_TWIN_DETAILS),
  };
}

export function getDemoEarlyWarningWatchlist(filters?: any) {
  return { enterprises: demoState.enterprises };
}

export function getDemoBehaviourIntelligence(filters?: any) {
  return deepClone({ ...FALLBACK_BEHAVIOUR_INTELLIGENCE, details: FALLBACK_BEHAVIOUR_INTELLIGENCE_DETAILS });
}

export function getDemoClimateIntelligence(filters?: any) {
  return deepClone({ ...FALLBACK_CLIMATE_INTELLIGENCE, details: FALLBACK_CLIMATE_INTELLIGENCE_DETAILS });
}

export function getDemoMarketIntelligence(filters?: any) {
  return deepClone({ ...FALLBACK_MARKET_INTELLIGENCE, details: FALLBACK_MARKET_INTELLIGENCE_DETAILS });
}

export function getDemoSectorIntelligence(filters?: any) {
  return deepClone({ details: FALLBACK_SECTOR_INTELLIGENCE_DETAILS });
}

export function getDemoRiskIntelligence(filters?: any) {
  return demoState.portfolioSummary; 
}

export function getDemoCopilotDetails(filters?: any) {
  return deepClone(FALLBACK_COPILOT_DETAILS);
}

// ─── MUTATIONS ───────────────────────────────────────────────────────────────

export function simulateCopilotChat(payload: any) {
  return {
    answer: "Based on the latest analysis, the enterprise is facing cashflow constraints due to increased feed costs. I recommend an immediate working capital intervention.",
    reasoning: "Feed costs increased by 18%, pushing DSCR below 1.0.",
    sources: ["Market Data", "Financial Records"],
    suggestedAction: "Working Capital Relief"
  };
}

export function simulateCopilotScenario(payload: any) {
  if (payload?.type === 'portfolio') {
    return deepClone(FALLBACK_PORTFOLIO_SCENARIO);
  }
  return deepClone(FALLBACK_SCENARIO);
}

export function simulateCreateIntervention(payload: any) {
  const entId = payload.enterpriseId || DEMO_ENTERPRISE_ID;
  const newIntervention = { 
    id: `INT-${Math.floor(Math.random()*1000)}`, 
    status: 'Assigned', 
    officer: payload.officer || 'Rajesh Sharma',
    ...payload 
  };
  
  demoState.interventions.push(newIntervention);
  
  // Mutate the enterprise state
  const idx = demoState.enterprises.findIndex((e: any) => e.entity_id === entId);
  if (idx >= 0) {
    demoState.enterprises[idx].intervention = 'Assigned';
    demoState.enterprises[idx].officer = newIntervention.officer;
  }
  
  persistState();
  return newIntervention;
}

export function simulateUpdateIntervention(id: string, status: string) {
  const intervention = demoState.interventions.find((i: any) => i.id === id);
  if (intervention) {
    intervention.status = status;
    
    // update enterprise
    const ent = demoState.enterprises.find((e: any) => e.entity_id === intervention.enterpriseId);
    if (ent) {
      ent.intervention = status;
    }
  }
  persistState();
  return { id, status };
}

export function getDemoInterventions() {
  return demoState.interventions;
}

export function getDemoFieldOfficers() {
  return [
    { id: 'FO-007', name: 'Rajesh Sharma', region: 'Nashik', activeCases: 12 },
    { id: 'FO-008', name: 'Sunita Patil', region: 'Pune', activeCases: 8 }
  ];
}

export function getDemoApprovals() {
  return [];
}

export function getDemoTasks() {
  return [];
}

export function getFilterOptions() {
  const states = new Set<string>();
  const districtsByState: Record<string, Set<string>> = {};
  const sectors = new Set<string>();

  demoState.enterprises.forEach((ent: any) => {
    if (ent.state) {
      states.add(ent.state);
      if (!districtsByState[ent.state]) districtsByState[ent.state] = new Set();
      if (ent.district) districtsByState[ent.state].add(ent.district);
    }
    if (ent.sector) sectors.add(ent.sector);
  });

  // Convert Sets to Arrays and structure
  const result: any = {
    states: Array.from(states).sort(),
    districts: {},
    sectors: Array.from(sectors).sort()
  };

  for (const state in districtsByState) {
    result.districts[state] = Array.from(districtsByState[state]).sort();
  }

  return result;
}

export function searchEnterprises(query: string) {
  if (!query || query.trim() === '') return [];
  const q = query.toLowerCase();
  
  return demoState.enterprises.filter((ent: any) => {
    return (
      (ent.name && ent.name.toLowerCase().includes(q)) ||
      (ent.entity_id && ent.entity_id.toLowerCase().includes(q)) ||
      (ent.district && ent.district.toLowerCase().includes(q)) ||
      (ent.sector && ent.sector.toLowerCase().includes(q))
    );
  }).slice(0, 5); // Limit to top 5 results
}
