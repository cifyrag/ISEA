import api, { apiCall, type Result } from './client';
import type { StatusResponse } from './types';

export const statusApi = {
  getStatus: (): Promise<Result<StatusResponse>> =>
    apiCall(() => api.get<StatusResponse>('/status')),
};
