import apiClient from './apiClient';

export const runScenario = async (
  enterpriseId: string,
  scenario: Record<string, number>,
) => (await apiClient.runScenario(enterpriseId, scenario)).data;
