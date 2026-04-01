import api, { apiCall, type Result } from './client';
import type {
  DiveConditions,
  DiveSite,
  SubmitDiveConditionRequest,
  SubmitDiveConditionResponse,
} from './types';

type Role = 'Admin' | 'DiveCenter' | 'Diver' | 'Trainer';

function getUserRoles(): Role[] {
  try {
    const stored = localStorage.getItem('user');
    if (!stored) return [];
    const user = JSON.parse(stored);
    return (user.roles ?? []) as Role[];
  } catch {
    return [];
  }
}

function hasRole(...roles: Role[]): boolean {
  const userRoles = getUserRoles();
  return roles.some((r) => userRoles.includes(r));
}

function canAccessUnverifiedSpots(): boolean {
  return hasRole('Admin', 'Trainer', 'DiveCenter');
}

export const diveConditionsApi = {
  getForSite: async (
    site: DiveSite,
    date?: string,
  ): Promise<Result<DiveConditions>> => {
    if (!site.isVerified && !canAccessUnverifiedSpots()) {
      return {
        ok: false,
        error: 'ACCESS_DENIED: Dive conditions are only available for verified spots.',
      };
    }

    const params = date ? `?date=${encodeURIComponent(date)}` : '';
    return apiCall(() =>
      api.get<DiveConditions>(`/DiveSite/${site.id}/conditions${params}`),
    );
  },

  getForSiteById: async (
    siteId: string,
    date?: string,
  ): Promise<Result<DiveConditions>> => {
    const siteResult = await apiCall(() =>
      api.get<DiveSite>(`/DiveSite/${siteId}`),
    );

    if (!siteResult.ok) {
      return siteResult;
    }

    const site = siteResult.data;

    if (!site.isVerified && !canAccessUnverifiedSpots()) {
      return {
        ok: false,
        error: 'ACCESS_DENIED: Dive conditions are only available for verified spots.',
      };
    }

    const params = date ? `?date=${encodeURIComponent(date)}` : '';
    return apiCall(() =>
      api.get<DiveConditions>(`/DiveSite/${siteId}/conditions${params}`),
    );
  },

  submit: async (
    site: DiveSite,
    data: SubmitDiveConditionRequest,
  ): Promise<Result<SubmitDiveConditionResponse>> => {
    if (!site.isVerified && !canAccessUnverifiedSpots()) {
      return {
        ok: false,
        error: 'ACCESS_DENIED: Cannot submit dive conditions for unverified spots.',
      };
    }

    const payload: SubmitDiveConditionRequest & { status?: string } = { ...data };

    if (!site.isVerified && hasRole('Trainer', 'DiveCenter')) {
      payload.status = 'pending';
    }

    return apiCall(() =>
      api.post<SubmitDiveConditionResponse>(
        `/DiveSite/${site.id}/conditions`,
        payload,
      ),
    );
  },
};
