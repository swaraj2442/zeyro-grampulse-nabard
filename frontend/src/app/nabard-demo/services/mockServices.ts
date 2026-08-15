import apiClient from './apiClient';
import { FinancialRecordInput, InterventionStatus, FinancialRecord } from '../store/gramPulseTypes';

export const persistFinancialRecord = async (record: FinancialRecordInput): Promise<FinancialRecord> =>
  (await apiClient.submitRecord(record as Record<string, unknown>)).data as unknown as FinancialRecord;

export const refreshForecastData = async (enterpriseId: string, _history: unknown[]) =>
  (await apiClient.getForecast(enterpriseId)).data;

export const evaluateRisk = async (enterpriseId: string) =>
  (await apiClient.getEarlyWarning(enterpriseId)).data;

export const getTimeline = async (enterpriseId: string) =>
  (await apiClient.getTimeline(enterpriseId)).data;

export const getAlerts = async (enterpriseId: string) =>
  (await apiClient.getAlerts(enterpriseId)).data;

export const createIntervention = async (payload: {
  enterpriseId: string;
  recommendedIntervention: string;
  illustrativeAmount?: number;
  assignedOfficer: string;
  visitDate?: string;
  followUpDate?: string;
  notes?: string;
}) => (await apiClient.createIntervention(payload as Record<string, unknown>)).data;

export const updateInterventionStatus = async (
  interventionId: string,
  status: InterventionStatus,
) => (await apiClient.updateInterventionStatus(interventionId, status)).data;
