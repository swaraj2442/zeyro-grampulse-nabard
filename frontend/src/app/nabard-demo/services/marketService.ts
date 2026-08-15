import apiClient from './apiClient';

export const getFeedIndex = async () => (await apiClient.getFeedIndex()).data;
export const getMarketPrices = async (commodity: string, district?: string) => (await apiClient.getMarketPrices(commodity, district)).data;
export const getPriceHistory = async (commodity: string, district?: string, months = 12) => (await apiClient.getPriceHistory(commodity, months, district)).data;
export const getAvailableCommodities = async () => (await apiClient.getAvailableCommodities()).data;
