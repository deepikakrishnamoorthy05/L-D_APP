import { apiClient } from './apiClient';

export interface HealthApiResponse {
  status: string;
  service: string;
}

export async function getHealthStatus(): Promise<HealthApiResponse> {
  return apiClient.get<HealthApiResponse>('/health');
}
