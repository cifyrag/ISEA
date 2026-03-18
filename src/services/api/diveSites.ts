import api, { apiCall, type Result } from './client';
import type { DiveSite, DiveSiteMarker, DiveConditions, CreateDiveSiteRequest, UpdateDiveSiteRequest, ImportResult, DiveSiteFilterRequest, PaginatedDiveSiteResponse } from './types';

function canAccessUnverifiedConditions(): boolean {
  try {
    const stored = localStorage.getItem('user');
    if (!stored) return false;
    const user = JSON.parse(stored);
    const roles: string[] = user.roles ?? [];
    return roles.some((r) => ['Admin', 'Trainer', 'DiveCenter'].includes(r));
  } catch {
    return false;
  }
}

export const diveSiteApi = {
  getVerified: (lat: number, lon: number, radiusKm = 50): Promise<Result<DiveSite[]>> => {
    const params = new URLSearchParams({ lat: lat.toString(), lon: lon.toString(), radiusKm: radiusKm.toString() });
    return apiCall(() => api.get<DiveSite[]>(`/DiveSite?${params}`));
  },
  getById: (id: string): Promise<Result<DiveSite>> =>
    apiCall(() => api.get<DiveSite>(`/DiveSite/${id}`)),
  getAll: (lat: number, lon: number, radiusKm = 50): Promise<Result<DiveSite[]>> => {
    const params = new URLSearchParams({ lat: lat.toString(), lon: lon.toString(), radiusKm: radiusKm.toString() });
    return apiCall(() => api.get<DiveSite[]>(`/DiveSite/all?${params}`));
  },
  create: (data: CreateDiveSiteRequest): Promise<Result<DiveSite>> =>
    apiCall(() => api.post<DiveSite>('/DiveSite', data)),
  update: (id: string, data: UpdateDiveSiteRequest): Promise<Result<DiveSite>> =>
    apiCall(() => api.put<DiveSite>(`/DiveSite/${id}`, data)),
  delete: (id: string): Promise<Result<void>> =>
    apiCall(() => api.delete(`/DiveSite/${id}`)),
  verify: (id: string): Promise<Result<DiveSite>> =>
    apiCall(() => api.put<DiveSite>(`/DiveSite/${id}/verify`)),
  unverify: (id: string, site: DiveSite): Promise<Result<DiveSite>> =>
    apiCall(() => api.put<DiveSite>(`/DiveSite/${id}`, {
      name: site.name,
      latitude: site.latitude,
      longitude: site.longitude,
      description: site.description,
      country: site.country,
      region: site.region,
      maxDepthM: site.maxDepthM,
      website: site.website,
      phoneNumber: site.phoneNumber,
      siteType: site.siteType,
      isVerified: false,
    })),
  importFromOsm: (lat: number, lon: number, radiusKm = 10): Promise<Result<ImportResult>> => {
    const params = new URLSearchParams({ lat: lat.toString(), lon: lon.toString(), radiusKm: radiusKm.toString() });
    return apiCall(() => api.post<ImportResult>(`/DiveSite/import?${params}`));
  },
  suggest: (data: CreateDiveSiteRequest): Promise<Result<DiveSite>> =>
    apiCall(() => api.post<DiveSite>('/DiveSite/suggest', data)),
  checkConditions: async (id: string, date?: string): Promise<Result<DiveConditions>> => {
    const siteResult = await apiCall(() => api.get<DiveSite>(`/DiveSite/${id}`));
    if (!siteResult.ok) return siteResult;

    if (!siteResult.data.isVerified && !canAccessUnverifiedConditions()) {
      return { ok: false, error: 'ACCESS_DENIED: Dive conditions are only available for verified spots.' };
    }

    const params = date ? `?date=${encodeURIComponent(date)}` : '';
    return apiCall(() => api.get<DiveConditions>(`/DiveSite/${id}/conditions${params}`));
  },
  getMarkers: (): Promise<Result<DiveSiteMarker[]>> =>
    apiCall(() => api.get<DiveSiteMarker[]>('/DiveSite/markers')),
  getFiltered: (filters: DiveSiteFilterRequest): Promise<Result<PaginatedDiveSiteResponse>> => {
    const params = new URLSearchParams();
    if (filters.isVerified !== undefined) params.set('isVerified', String(filters.isVerified));
    if (filters.source) params.set('source', filters.source);
    if (filters.siteType) params.set('siteType', filters.siteType);
    if (filters.country) params.set('country', filters.country);
    if (filters.region) params.set('region', filters.region);
    if (filters.search) params.set('search', filters.search);
    if (filters.minDepthM !== undefined) params.set('minDepthM', String(filters.minDepthM));
    if (filters.maxDepthM !== undefined) params.set('maxDepthM', String(filters.maxDepthM));
    if (filters.latitude !== undefined) params.set('latitude', String(filters.latitude));
    if (filters.longitude !== undefined) params.set('longitude', String(filters.longitude));
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortDesc !== undefined) params.set('sortDesc', String(filters.sortDesc));
    if (filters.page !== undefined) params.set('page', String(filters.page));
    if (filters.pageSize !== undefined) params.set('pageSize', String(filters.pageSize));
    return apiCall(() => api.get<PaginatedDiveSiteResponse>(`/DiveSite/filter?${params}`));
  },
};
