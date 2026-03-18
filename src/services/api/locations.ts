import api, { apiCall, type Result } from './client';
import type {
  SavedLocation,
  CreateLocationRequest,
  UpdateLocationRequest,
  WeatherRefreshResponse,
  BulkWeatherResponse,
} from './types';

export const locationsApi = {
  getAll: (): Promise<Result<SavedLocation[]>> =>
    apiCall(() => api.get<SavedLocation[]>('/locations')),
  getById: (id: string): Promise<Result<SavedLocation>> =>
    apiCall(() => api.get<SavedLocation>(`/locations/${id}`)),
  create: (data: CreateLocationRequest): Promise<Result<SavedLocation>> =>
    apiCall(() => api.post<SavedLocation>('/locations', data)),
  update: (id: string, data: UpdateLocationRequest): Promise<Result<SavedLocation>> =>
    apiCall(() => api.put<SavedLocation>(`/locations/${id}`, data)),
  delete: (id: string): Promise<Result<void>> =>
    apiCall(() => api.delete(`/locations/${id}`)),
  refreshWeather: (id: string): Promise<Result<WeatherRefreshResponse>> =>
    apiCall(() => api.post<WeatherRefreshResponse>(`/locations/${id}/weather`)),
  refreshAllWeather: (): Promise<Result<BulkWeatherResponse>> =>
    apiCall(() => api.post<BulkWeatherResponse>('/locations/bulk-weather')),
};
