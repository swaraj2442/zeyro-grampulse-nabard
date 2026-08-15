import apiClient from './apiClient';

export const getClimateRisk = async (district: string) => (await apiClient.getClimateRisk(district)).data;
export const getWeatherHistory = async (district: string, months = 12) => (await apiClient.getWeatherHistory(district, months)).data;
export const getWeatherForecast = async (district: string) => (await apiClient.getWeatherForecast(district)).data;
