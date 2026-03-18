import api, { apiCall, type Result } from './client';
import type { WeatherData, MarineData, DiveConditions } from './types';

export const weatherApi = {
  getWeather: (lat: number, lon: number, date?: string): Promise<Result<WeatherData>> => {
    const params = new URLSearchParams({ lat: lat.toString(), lon: lon.toString() });
    if (date) params.append('date', date);
    return apiCall(() => api.get<WeatherData>(`/weather?${params}`));
  },

  getMarine: (lat: number, lon: number, date?: string): Promise<Result<MarineData>> => {
    const params = new URLSearchParams({ lat: lat.toString(), lon: lon.toString() });
    if (date) params.append('date', date);
    return apiCall(() => api.get<MarineData>(`/weather/marine?${params}`));
  },

  getDiveConditions: (lat: number, lon: number, date?: string): Promise<Result<DiveConditions>> => {
    const params = new URLSearchParams({ lat: lat.toString(), lon: lon.toString() });
    if (date) params.append('date', date);
    return apiCall(() => api.get<DiveConditions>(`/weather/dive-conditions?${params}`));
  },
};
