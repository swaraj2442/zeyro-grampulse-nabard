import { GramPulseState, Enterprise, FinancialRecord, EnterpriseForecast, EarlyWarning, Alert, InterventionCase, TimelineEvent } from './gramPulseTypes';

export const selectEnterpriseProfile = (state: GramPulseState, enterpriseId: string): Enterprise | undefined => {
  return state.enterprises[enterpriseId];
};

export const selectEnterpriseHistory = (state: GramPulseState, enterpriseId: string): FinancialRecord[] => {
  return state.financialRecords[enterpriseId] || [];
};

export const selectEnterpriseForecast = (state: GramPulseState, enterpriseId: string): EnterpriseForecast | undefined => {
  return state.forecasts[enterpriseId];
};

export const selectEnterpriseWarning = (state: GramPulseState, enterpriseId: string): EarlyWarning | undefined => {
  return state.earlyWarnings[enterpriseId];
};

export const selectEnterpriseAlerts = (state: GramPulseState, enterpriseId: string): Alert[] => {
  return Object.values(state.alerts).filter(alert => alert.enterpriseId === enterpriseId);
};

export const selectEnterpriseActiveAlert = (state: GramPulseState, enterpriseId: string): Alert | undefined => {
  return Object.values(state.alerts).find(alert => alert.enterpriseId === enterpriseId && alert.status === 'Active');
};

export const selectEnterpriseInterventions = (state: GramPulseState, enterpriseId: string): InterventionCase[] => {
  return Object.values(state.interventions).filter(inv => inv.enterpriseId === enterpriseId);
};

export const selectEnterpriseTimeline = (state: GramPulseState, enterpriseId: string): TimelineEvent[] => {
  return state.timelineEvents[enterpriseId] || [];
};

export const selectAllEnterprises = (state: GramPulseState): Enterprise[] => {
  return Object.values(state.enterprises);
};

export const selectAllActiveAlerts = (state: GramPulseState): Alert[] => {
  return Object.values(state.alerts).filter(alert => alert.status === 'Active');
};

export const selectAllInterventions = (state: GramPulseState): InterventionCase[] => {
  return Object.values(state.interventions);
};

export const selectPortfolioSummary = (state: GramPulseState) => {
  const enterprises = selectAllEnterprises(state);
  const activeAlerts = selectAllActiveAlerts(state);
  const activeInterventions = selectAllInterventions(state).filter(inv => inv.status !== 'Closed' && inv.status !== 'Resolved');
  
  let healthy = 0;
  let watchlist = 0;
  let highCritical = 0;
  let totalDeficitExposure = 0;

  enterprises.forEach(ent => {
    const warning = selectEnterpriseWarning(state, ent.id);
    if (!warning) {
      healthy++;
      return;
    }
    
    if (warning.riskLevel === 'High' || warning.riskLevel === 'Critical') {
      highCritical++;
      totalDeficitExposure += warning.forecastDeficit;
    } else if (warning.riskLevel === 'Amber' || warning.riskLevel === 'Medium') {
      watchlist++;
      totalDeficitExposure += warning.forecastDeficit; // or only include high/critical in exposure?
    } else {
      healthy++;
    }
  });

  return {
    totalEnterprises: enterprises.length,
    healthy,
    watchlist,
    highCritical,
    totalDeficitExposure,
    activeInterventionsCount: activeInterventions.length,
    activeAlertsCount: activeAlerts.length
  };
};
