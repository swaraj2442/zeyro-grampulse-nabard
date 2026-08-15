export type EnterpriseAccountStatus = 'Standard' | 'Watchlist' | 'NPA';
export type RiskLevel = 'Very Low' | 'Low' | 'Medium' | 'Amber' | 'High' | 'Critical';
export type SyncStatus = 'synced' | 'pending' | 'failed';
export type InterventionStatus = 'Pending' | 'Active' | 'Closed' | 'Resolved';

export interface Enterprise {
  id: string;
  name: string;
  district: string;
  block: string;
  sector: string;
  enterpriseType: string;
  ownershipType: string;
  accountStatus: EnterpriseAccountStatus;
  currentDpd: number;
}

export interface FinancialRecord {
  id: string;
  enterpriseId: string;
  month: string;
  operatingInflow: number;
  operatingOutflow: number;
  savings: number;
  loanRepayment: number;
  inventoryCost: number;
  recordedAt: string;
  syncStatus?: SyncStatus;
}

export interface FinancialRecordInput extends Omit<FinancialRecord, 'id' | 'recordedAt' | 'syncStatus'> {}

export interface ForecastMonth {
  month: string;
  horizon: number;
  operatingInflow: number;
  operatingOutflow: number;
  closingCashBalance: number;
  cashAfterDebtService: number;
  lower: number;
  upper: number;
}

export interface EnterpriseForecast {
  enterpriseId: string;
  modelVersion: string;
  forecastGeneratedAt: string;
  forecast: ForecastMonth[];
}

export interface RiskDriver {
  feature: string;
  observedValue: number;
  unit: string;
  contributionPoints: number;
  explanation: string;
}

export interface EarlyWarning {
  enterpriseId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  forecastDeficit: number;
  debtServiceShortfall: number;
  stressMonth: string;
  warningLeadTimeDays: number;
  drivers: RiskDriver[];
}

export interface Alert {
  id: string;
  enterpriseId: string;
  riskLevel: RiskLevel;
  title: string;
  description: string;
  createdAt: string;
  status: 'Active' | 'Resolved';
}

export interface ScenarioInput {
  workingCapitalSupport?: number;
  inputCostIncrease?: number;
  outputPriceDecline?: number;
  rainfallShock?: boolean;
}

export interface ScenarioResult {
  enterpriseId: string;
  scenarioData: ScenarioInput;
  forecast: EnterpriseForecast;
  warning: EarlyWarning;
}

export interface InterventionCase {
  id: string;
  enterpriseId: string;
  scenarioId?: string; // If based on a scenario
  recommendedIntervention: string;
  illustrativeAmount?: number;
  assignedOfficer: string;
  visitDate?: string;
  followUpDate?: string;
  notes: string;
  status: InterventionStatus;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  enterpriseId: string;
  date: string;
  title: string;
  description: string;
}

export interface GramPulseState {
  enterprises: Record<string, Enterprise>;
  financialRecords: Record<string, FinancialRecord[]>;
  forecasts: Record<string, EnterpriseForecast>;
  earlyWarnings: Record<string, EarlyWarning>;
  alerts: Record<string, Alert>;
  interventions: Record<string, InterventionCase>;
  timelineEvents: Record<string, TimelineEvent[]>;
  lastUpdated: string;
}

export type GramPulseAction =
  | { type: 'FINANCIAL_RECORD_ADDED'; payload: FinancialRecord }
  | { type: 'FORECAST_REFRESHED'; payload: EnterpriseForecast }
  | { type: 'EARLY_WARNING_UPDATED'; payload: EarlyWarning }
  | { type: 'ALERT_CREATED'; payload: Alert }
  | { type: 'ALERT_RESOLVED'; payload: { alertId: string } }
  | { type: 'ALERT_UPDATED'; payload: Alert }
  | { type: 'SCENARIO_RUN'; payload: ScenarioResult }
  | { type: 'INTERVENTION_CREATED'; payload: InterventionCase }
  | { type: 'INTERVENTION_STATUS_UPDATED'; payload: { interventionId: string; status: InterventionStatus } }
  | { type: 'TIMELINE_EVENT_ADDED'; payload: TimelineEvent }
  | { type: 'OFFLINE_SYNC_STATUS_CHANGED'; payload: { recordId: string; status: SyncStatus } };
