import api, { apiCall, type Result } from './client';
import type { MapConfiguration } from './types';

export const mapApi = {
  getConfig: (): Promise<Result<MapConfiguration>> =>
    apiCall(() => api.get<MapConfiguration>('/mapconfig')),
};
