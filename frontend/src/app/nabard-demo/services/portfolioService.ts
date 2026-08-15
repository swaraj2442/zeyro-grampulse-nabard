import apiClient from './apiClient';

export const getPortfolioSummary = async () => (await apiClient.getPortfolioSummary()).data;
export const getTopRiskEnterprises = async (n = 10) => (await apiClient.getTopRiskEnterprises(n)).data;
export const getClusterAlerts = async () => (await apiClient.getClusterAlerts()).data;
export const getRiskDistribution = async () => (await apiClient.getRiskDistribution()).data;
export const getForecastExposure = async () => (await apiClient.getForecastExposure()).data;
export const getDistrictHealth = async () => (await apiClient.getDistrictHealth()).data;
export const getEnterprises = async (params?: Record<string, string | number>) => (await apiClient.getEnterprises(params)).data;
