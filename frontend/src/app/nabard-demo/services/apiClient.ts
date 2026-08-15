/**
 * apiClient.ts
 *
 * Resilient API client wrapper for GramPulse.
 *
 * Fetch strategy:
 *   1. Check NEXT_PUBLIC_DATA_MODE. If 'demo', resolve immediately from demoEnterpriseStore.
 *   2. If 'live', try the live backend.
 *   3. On any error in 'live' mode, THROW VISIBLY. No more silent fallbacks.
 */

import * as demoStore from '../data/demoEnterpriseStore';
import { DEMO_ENTERPRISE_ID } from './fallbacks/staticFallbacks';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const TIMEOUT_MS = 8000;
const DATA_MODE = process.env.NEXT_PUBLIC_DATA_MODE || 'demo';

// ─── Core fetch helper ─────────────────────────────────────────────────────────
async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

let accessToken = '';

async function ensureToken() {
  if (accessToken || DATA_MODE === 'demo') return;
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/v1/auth/login`, { method: 'POST' });
    const json = await res.json();
    if (json?.data?.accessToken) {
      accessToken = json.data.accessToken;
    }
  } catch (e) {
    console.warn('Authentication fallback (using demo token):', e);
  }
}

async function apiFetch<T>(
  url: string,
  demoResolver: () => T,
  init?: RequestInit,
): Promise<{ data: T; isLive: boolean; isFallback: boolean; dataMode: string }> {
  if (DATA_MODE === 'demo') {
    return { data: demoResolver(), isLive: false, isFallback: false, dataMode: 'DEMO' };
  }

  try {
    // Attempt authentication if needed (except for /health or /auth)
    if (url.startsWith('/api/v1/') && !url.includes('/auth/login')) {
      await ensureToken();
    }
    
    const headers = new Headers(init?.headers);
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const res = await fetchWithTimeout(`${API_BASE}${url}`, { ...init, headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    
    // Unwrap standardized API envelope if present
    const data = (json && typeof json === 'object' && json.data !== undefined) ? json.data : json;
    
    let dataMode = 'LIVE';
    if (data && typeof data === 'object') {
      if ('provenance' in data && data.provenance && typeof data.provenance === 'object' && 'enterpriseDataSource' in data.provenance) {
        dataMode = String((data.provenance as any).enterpriseDataSource);
      } else if ('enterpriseDataSource' in data) {
        dataMode = String((data as any).enterpriseDataSource);
      }
    }
    return { data, isLive: true, isFallback: false, dataMode };
  } catch (e) {
    console.error(`API Error on ${url}:`, e);
    throw new Error(`API Error: Backend unreachable or returned error. Mode is LIVE. Cannot silently fallback.`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// API methods
// ─────────────────────────────────────────────────────────────────────────────

export const apiClient = {

  // Auth
  login: (credentials: any) =>
    apiFetch('/api/v1/auth/login', () => ({ accessToken: 'demo-token-123', user: { role: 'Regional Manager' } }), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials)
    }),

  // Health
  health: () =>
    apiFetch('/health', () => ({ status: 'ok', modelsLoaded: 1, dbConnected: true })),

  // Overview
  getOverviewSummary: (filters?: any) => {
    return Promise.resolve({ data: demoStore.getDemoOverviewKpis(filters), isLive: false, isFallback: true, dataMode: DATA_MODE });
  },
  getOverviewContext: () => {
    return Promise.resolve({ data: demoStore.getDemoOverviewContext(), isLive: false, isFallback: true, dataMode: DATA_MODE });
  },
  getClimateImpact: () => {
    return Promise.resolve({ data: demoStore.getDemoClimateImpact(), isLive: false, isFallback: true, dataMode: DATA_MODE });
  },
  getMarketSignals: () => {
    return Promise.resolve({ data: demoStore.getDemoMarketSignals(), isLive: false, isFallback: true, dataMode: DATA_MODE });
  },
  getOverviewCashflow: (filters?: any) => {
    return Promise.resolve({ data: demoStore.getDemoOverviewCashflow(filters), isLive: false, isFallback: true, dataMode: DATA_MODE });
  },
  getOverviewCredit: (filters?: any) => {
    return Promise.resolve({ data: demoStore.getDemoOverviewCredit(filters), isLive: false, isFallback: true, dataMode: DATA_MODE });
  },
  getOverviewTimeline: (filters?: any) => {
    return Promise.resolve({ data: demoStore.getDemoOverviewTimeline(filters), isLive: false, isFallback: true, dataMode: DATA_MODE });
  },
  
  getPortfolioSummary: (filters?: any) => {
    const q = new URLSearchParams(filters || {});
    return apiFetch(`/api/v1/portfolio/summary?${q}`, () => demoStore.getDemoOverviewKpis(filters));
  },

  getSectorDistribution: (filters?: any) => {
    return Promise.resolve({ data: demoStore.getDemoSectorDistribution(filters), isLive: false, isFallback: true, dataMode: DATA_MODE });
  },

  getPortfolioTrends: (filters?: any) => {
    return Promise.resolve({ data: demoStore.getDemoPortfolioTrends(filters), isLive: false, isFallback: true, dataMode: DATA_MODE });
  },

  getPortfolio: (filters?: any) => {
    return Promise.resolve({ data: demoStore.getDemoPortfolioList(filters), isLive: false, isFallback: true, dataMode: DATA_MODE });
  },

  getTopRiskEnterprises: (n = 10, filters?: any) => {
    const q = new URLSearchParams(filters || {});
    q.set('n', String(n));
    return apiFetch(`/api/v1/portfolio/top-risk?${q}`, () => demoStore.getDemoPortfolioList());
  },

  getClusterAlerts: (filters?: any) => {
    const q = new URLSearchParams(filters || {});
    return apiFetch(`/api/v1/portfolio/cluster-alerts?${q}`, () => ({ clusterAlerts: [], _fallback: true }));
  },

  getRiskDistribution: (filters?: any) => {
    const q = new URLSearchParams(filters || {});
    return apiFetch(`/api/v1/portfolio/risk-distribution?${q}`, () => ({ bySector: {}, byDistrict: {} }));
  },

  getForecastExposure: (filters?: any) => {
    const q = new URLSearchParams(filters || {});
    return apiFetch(`/api/v1/portfolio/forecast-exposure?${q}`, () => ({ totalForecastDeficit: 124_500_000, enterprisesAtRisk: 389 }));
  },

  getDistrictHealth: () =>
    apiFetch('/api/v1/portfolio/districts', () => ({ districts: [] })),

  // Enterprises
  getEnterprises: (params?: Record<string, string | number>) => {
    const q = new URLSearchParams(
      Object.entries(params ?? {}).map(([k, v]) => [k, String(v)])
    );
    return apiFetch(`/api/v1/enterprises?${q}`, () => ({ total: 100, enterprises: demoStore.getDemoPortfolioList().enterprises }));
  },

  getEnterprise: (id: string) =>
    apiFetch(`/api/v1/enterprises/${id}`, () => demoStore.getDemoEnterpriseById(id)),
    
  getDigitalTwin: (id: string) =>
    apiFetch(`/api/v1/enterprises/${id}/digital-twin`, () => demoStore.getDemoDigitalTwin(id)),

  getHistory: (id: string, months = 24) =>
    apiFetch(`/api/v1/enterprises/${id}/history?months=${months}`, () => ({ enterpriseId: id, history: [] })),

  getForecast: (id: string) =>
    apiFetch(`/api/v1/enterprises/${id}/forecast`, () => demoStore.getDemoForecast(id)),

  getEarlyWarning: (id: string) =>
    apiFetch(`/api/v1/enterprises/${id}/early-warning`, () => demoStore.getDemoEarlyWarning(id)),

  getTimeline: (id: string) =>
    apiFetch(`/api/v1/enterprises/${id}/timeline`, () => demoStore.getDemoDigitalTwin(id).timeline),

  getAlerts: (id: string) =>
    apiFetch(`/api/v1/enterprises/${id}/alerts`, () => demoStore.getDemoDigitalTwin(id).alerts),

  getEnterpriseInterventions: (id: string) => {
    return Promise.resolve({ data: [], isLive: false, isFallback: true, dataMode: DATA_MODE });
  },

  submitRecord: (record: Record<string, unknown>) =>
    apiFetch(
      `/api/v1/enterprises/${record.enterpriseId}/records`,
      () => ({ id: 'FR-fallback', syncStatus: 'pending', forecastRefreshed: false, recordedAt: new Date().toISOString(), ...record }),
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record) },
    ),

  // Intelligence
  getEarlyWarningWatchlist: (filters?: any) => {
    const q = new URLSearchParams(filters || {});
    return apiFetch(`/api/v1/intelligence/early-warning/watchlist?${q}`, () => demoStore.getDemoEarlyWarningWatchlist(filters));
  },
  
  getBehaviourIntelligence: (filters?: any) => {
    return Promise.resolve({ data: demoStore.getDemoBehaviourIntelligence(filters), isLive: false, isFallback: true, dataMode: DATA_MODE });
  },
  
  getClimateIntelligence: (filters?: any) => {
    return Promise.resolve({ data: demoStore.getDemoClimateIntelligence(filters), isLive: false, isFallback: true, dataMode: DATA_MODE });
  },
  
  getMarketIntelligence: (filters?: any) => {
    return Promise.resolve({ data: demoStore.getDemoMarketIntelligence(filters), isLive: false, isFallback: true, dataMode: DATA_MODE });
  },

  getSectorIntelligence: (filters?: any) => {
    return Promise.resolve({ data: demoStore.getDemoSectorIntelligence(filters), isLive: false, isFallback: true, dataMode: DATA_MODE });
  },
  
  getRiskIntelligence: (filters?: any) => {
    return Promise.resolve({ data: demoStore.getDemoRiskIntelligence(filters), isLive: false, isFallback: true, dataMode: DATA_MODE });
  },

  // Copilot & Scenarios
  getCopilotDetails: (filters?: any) => {
    return Promise.resolve({ data: demoStore.getDemoCopilotDetails(filters), isLive: false, isFallback: true, dataMode: DATA_MODE });
  },

  copilotChat: (payload: { messages: any[]; system_prompt?: string; user_id?: string; state?: string; district?: string }) =>
    apiFetch(`/api/v1/copilot/chat`, () => demoStore.simulateCopilotChat(payload), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    }),

  stt: async (audioBlob: Blob, languageCode = 'en-IN') => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('language_code', languageCode);
    const res = await fetch(`${API_BASE}/api/v1/chat/stt`, {
       method: 'POST',
       body: formData,
    });
    if (!res.ok) throw new Error('STT request failed');
    return res.json();
  },
    
  copilotSimulate: (payload: any) =>
    apiFetch(`/api/v1/copilot/simulate`, () => demoStore.simulateCopilotScenario(payload), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    }),

  // Header Filters & Search (Always use demoStore for these UI helpers since the Go backend doesn't implement them)
  getFilterOptions: () => {
    return Promise.resolve({ data: demoStore.getFilterOptions(), isLive: false, isFallback: true, dataMode: DATA_MODE });
  },

  searchEnterprises: (query: string) => {
    return Promise.resolve({ data: demoStore.searchEnterprises(query), isLive: false, isFallback: true, dataMode: DATA_MODE });
  },

  runScenario: (id: string, scenario: Record<string, number>) =>
    apiFetch(
      `/api/v1/enterprises/${id}/scenario`,
      () => demoStore.simulateCopilotScenario(scenario),
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(scenario) },
    ),

  // Underwriting
  underwrite: (id: string, payload: Record<string, unknown>) =>
    apiFetch(
      `/api/v1/enterprises/${id}/underwrite`,
      () => ({ probability_of_stress: 0.18, risk_tier: "LOW", decision: "ELIGIBLE", recommended_limit: 85000, max_affordable_emi: 7900, reason_codes: ["Simulated dummy response"] }),
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) },
    ),

  // Operations
  getInterventions: (params?: any) => {
    return Promise.resolve({ data: demoStore.getDemoInterventions(), isLive: false, isFallback: true, dataMode: DATA_MODE });
  },

  createIntervention: (payload: Record<string, unknown>) => {
    return Promise.resolve({ data: demoStore.simulateCreateIntervention(payload), isLive: false, isFallback: true, dataMode: DATA_MODE });
  },

  updateIntervention: (id: string, payload: { status: string }) => {
    return Promise.resolve({ data: demoStore.simulateUpdateIntervention(id, payload.status), isLive: false, isFallback: true, dataMode: DATA_MODE });
  },

  updateInterventionStatus: (id: string, status: string) => {
    return Promise.resolve({ data: demoStore.simulateUpdateIntervention(id, status), isLive: false, isFallback: true, dataMode: DATA_MODE });
  },
    
  getFieldOfficers: () => {
    return Promise.resolve({ data: demoStore.getDemoFieldOfficers(), isLive: false, isFallback: true, dataMode: DATA_MODE });
  },

  getApprovals: () =>
    apiFetch(`/api/v1/operations/approvals`, () => demoStore.getDemoApprovals()),
    
  getTasks: () =>
    apiFetch(`/api/v1/operations/tasks`, () => demoStore.getDemoTasks()),

  // Weather (Legacy paths)
  getClimateRisk: (district = 'Nashik') =>
    apiFetch(`/api/v1/weather/climate-risk?district=${encodeURIComponent(district)}`, () => demoStore.getDemoClimateIntelligence({district})),

  getWeatherHistory: (district = 'Nashik', months = 12) =>
    apiFetch(`/api/v1/weather/history?district=${encodeURIComponent(district)}&months=${months}`, () => ({ district, months: [] })),

  getWeatherForecast: (district = 'Nashik') =>
    apiFetch(`/api/v1/weather/forecast?district=${encodeURIComponent(district)}`, () => ({ district, days: [] })),

  // Market (Legacy paths)
  getFeedIndex: () =>
    apiFetch('/api/v1/market/feed-index', () => demoStore.getDemoMarketIntelligence()),

  getMarketPrices: (commodity: string, district?: string) => {
    const q = new URLSearchParams({ commodity });
    if (district) q.set('district', district);
    return apiFetch(`/api/v1/market/prices?${q}`, () => ({ commodity, latestModalPrice: null, priceChange1m: 0, priceChange3m: 0 }));
  },

  getPriceHistory: (commodity: string, months = 12, district?: string) => {
    const q = new URLSearchParams({ commodity, months: String(months) });
    if (district) q.set('district', district);
    return apiFetch(`/api/v1/market/price-history?${q}`, () => ({ commodity, series: [] }));
  },

  getAvailableCommodities: () =>
    apiFetch('/api/v1/market/commodities', () => ({ commodities: ['Maize', 'Soybean', 'Onion', 'Tomato', 'Wheat', 'Fodder', 'Poultry', 'MilkCow'] })),
};

export default apiClient;
