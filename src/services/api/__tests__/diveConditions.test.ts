import { describe, it, expect, vi, beforeEach } from 'vitest';
import { diveConditionsApi } from '../diveConditions';
import api from '../client';
import type { DiveSite } from '../types';

vi.mock('../client', async () => {
  const actual = await vi.importActual('../client');
  return {
    ...actual,
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

const mockApi = vi.mocked(api);

const verifiedSite: DiveSite = {
  id: 'site-1',
  name: 'Blue Hole',
  latitude: 31.5,
  longitude: 34.9,
  source: 'Manual',
  isVerified: true,
  createdAt: '2026-01-01T00:00:00Z',
};

const unverifiedSite: DiveSite = {
  id: 'site-2',
  name: 'New Reef',
  latitude: 28.5,
  longitude: 34.3,
  source: 'Manual',
  isVerified: false,
  createdAt: '2026-01-01T00:00:00Z',
};

const mockConditions = {
  location: 'Blue Hole',
  latitude: 31.5,
  longitude: 34.9,
  requestTime: '2026-05-25T10:00:00Z',
  status: 'ok',
  safetyScore: 85,
};

function setUserRoles(roles: string[]) {
  localStorage.setItem('user', JSON.stringify({ roles }));
}

function clearUser() {
  localStorage.removeItem('user');
}

describe('diveConditionsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearUser();
  });

  describe('getForSite', () => {
    describe('Diver role', () => {
      beforeEach(() => setUserRoles(['Diver']));

      it('allows access to verified spots', async () => {
        mockApi.get.mockResolvedValue({ data: mockConditions });

        const result = await diveConditionsApi.getForSite(verifiedSite);

        expect(result.ok).toBe(true);
        expect(mockApi.get).toHaveBeenCalledWith('/DiveSite/site-1/conditions');
      });

      it('denies access to unverified spots', async () => {
        const result = await diveConditionsApi.getForSite(unverifiedSite);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error).toContain('ACCESS_DENIED');
        }
        expect(mockApi.get).not.toHaveBeenCalled();
      });
    });

    describe('Admin role', () => {
      beforeEach(() => setUserRoles(['Admin']));

      it('allows access to verified spots', async () => {
        mockApi.get.mockResolvedValue({ data: mockConditions });

        const result = await diveConditionsApi.getForSite(verifiedSite);

        expect(result.ok).toBe(true);
        expect(mockApi.get).toHaveBeenCalled();
      });

      it('allows access to unverified spots', async () => {
        mockApi.get.mockResolvedValue({ data: mockConditions });

        const result = await diveConditionsApi.getForSite(unverifiedSite);

        expect(result.ok).toBe(true);
        expect(mockApi.get).toHaveBeenCalledWith('/DiveSite/site-2/conditions');
      });
    });

    describe('Trainer role', () => {
      beforeEach(() => setUserRoles(['Trainer']));

      it('allows access to verified spots', async () => {
        mockApi.get.mockResolvedValue({ data: mockConditions });

        const result = await diveConditionsApi.getForSite(verifiedSite);

        expect(result.ok).toBe(true);
      });

      it('allows access to unverified spots', async () => {
        mockApi.get.mockResolvedValue({ data: mockConditions });

        const result = await diveConditionsApi.getForSite(unverifiedSite);

        expect(result.ok).toBe(true);
        expect(mockApi.get).toHaveBeenCalledWith('/DiveSite/site-2/conditions');
      });
    });

    describe('DiveCenter role', () => {
      beforeEach(() => setUserRoles(['DiveCenter']));

      it('allows access to verified spots', async () => {
        mockApi.get.mockResolvedValue({ data: mockConditions });

        const result = await diveConditionsApi.getForSite(verifiedSite);

        expect(result.ok).toBe(true);
      });

      it('allows access to unverified spots', async () => {
        mockApi.get.mockResolvedValue({ data: mockConditions });

        const result = await diveConditionsApi.getForSite(unverifiedSite);

        expect(result.ok).toBe(true);
        expect(mockApi.get).toHaveBeenCalledWith('/DiveSite/site-2/conditions');
      });
    });

    describe('unauthenticated user', () => {
      it('denies access to unverified spots when no user stored', async () => {
        const result = await diveConditionsApi.getForSite(unverifiedSite);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error).toContain('ACCESS_DENIED');
        }
      });

      it('denies access when localStorage has invalid JSON', async () => {
        localStorage.setItem('user', '{invalid}');

        const result = await diveConditionsApi.getForSite(unverifiedSite);

        expect(result.ok).toBe(false);
      });
    });

    it('passes date parameter when provided', async () => {
      setUserRoles(['Diver']);
      mockApi.get.mockResolvedValue({ data: mockConditions });

      await diveConditionsApi.getForSite(verifiedSite, '2026-05-25');

      expect(mockApi.get).toHaveBeenCalledWith(
        '/DiveSite/site-1/conditions?date=2026-05-25'
      );
    });
  });

  describe('getForSiteById', () => {
    describe('Diver role', () => {
      beforeEach(() => setUserRoles(['Diver']));

      it('allows access when site is verified', async () => {
        mockApi.get
          .mockResolvedValueOnce({ data: verifiedSite })
          .mockResolvedValueOnce({ data: mockConditions });

        const result = await diveConditionsApi.getForSiteById('site-1');

        expect(result.ok).toBe(true);
        expect(mockApi.get).toHaveBeenCalledTimes(2);
      });

      it('denies access when site is unverified', async () => {
        mockApi.get.mockResolvedValueOnce({ data: unverifiedSite });

        const result = await diveConditionsApi.getForSiteById('site-2');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error).toContain('ACCESS_DENIED');
        }
        expect(mockApi.get).toHaveBeenCalledTimes(1);
      });
    });

    describe('Admin role', () => {
      beforeEach(() => setUserRoles(['Admin']));

      it('allows access to unverified spots', async () => {
        mockApi.get
          .mockResolvedValueOnce({ data: unverifiedSite })
          .mockResolvedValueOnce({ data: mockConditions });

        const result = await diveConditionsApi.getForSiteById('site-2');

        expect(result.ok).toBe(true);
        expect(mockApi.get).toHaveBeenCalledTimes(2);
      });
    });

    describe('Trainer role', () => {
      beforeEach(() => setUserRoles(['Trainer']));

      it('allows access to unverified spots', async () => {
        mockApi.get
          .mockResolvedValueOnce({ data: unverifiedSite })
          .mockResolvedValueOnce({ data: mockConditions });

        const result = await diveConditionsApi.getForSiteById('site-2');

        expect(result.ok).toBe(true);
      });
    });

    describe('DiveCenter role', () => {
      beforeEach(() => setUserRoles(['DiveCenter']));

      it('allows access to unverified spots', async () => {
        mockApi.get
          .mockResolvedValueOnce({ data: unverifiedSite })
          .mockResolvedValueOnce({ data: mockConditions });

        const result = await diveConditionsApi.getForSiteById('site-2');

        expect(result.ok).toBe(true);
      });
    });

    it('propagates error when site fetch fails', async () => {
      setUserRoles(['Diver']);
      mockApi.get.mockRejectedValueOnce({
        response: { data: { Error: 'Not found' }, status: 404 },
      });

      const result = await diveConditionsApi.getForSiteById('nonexistent');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('Not found');
      }
    });

    it('passes date parameter when provided', async () => {
      setUserRoles(['Admin']);
      mockApi.get
        .mockResolvedValueOnce({ data: verifiedSite })
        .mockResolvedValueOnce({ data: mockConditions });

      await diveConditionsApi.getForSiteById('site-1', '2026-06-01');

      expect(mockApi.get).toHaveBeenCalledWith(
        '/DiveSite/site-1/conditions?date=2026-06-01'
      );
    });
  });

  describe('submit', () => {
    const submitData = { diveSiteId: 'site-1', notes: 'Clear water today' };
    const mockSubmitResponse = {
      id: 'cond-1',
      diveSiteId: 'site-1',
      status: 'approved',
      conditions: mockConditions,
      createdAt: '2026-05-25T10:00:00Z',
    };

    describe('Diver role', () => {
      beforeEach(() => setUserRoles(['Diver']));

      it('allows submission for verified spots', async () => {
        mockApi.post.mockResolvedValue({ data: mockSubmitResponse });

        const result = await diveConditionsApi.submit(verifiedSite, submitData);

        expect(result.ok).toBe(true);
        expect(mockApi.post).toHaveBeenCalledWith(
          '/DiveSite/site-1/conditions',
          submitData
        );
      });

      it('denies submission for unverified spots', async () => {
        const result = await diveConditionsApi.submit(unverifiedSite, submitData);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error).toContain('ACCESS_DENIED');
        }
        expect(mockApi.post).not.toHaveBeenCalled();
      });
    });

    describe('Admin role', () => {
      beforeEach(() => setUserRoles(['Admin']));

      it('allows submission for verified spots', async () => {
        mockApi.post.mockResolvedValue({ data: mockSubmitResponse });

        const result = await diveConditionsApi.submit(verifiedSite, submitData);

        expect(result.ok).toBe(true);
      });

      it('allows submission for unverified spots without pending status', async () => {
        mockApi.post.mockResolvedValue({ data: mockSubmitResponse });

        const result = await diveConditionsApi.submit(unverifiedSite, submitData);

        expect(result.ok).toBe(true);
        expect(mockApi.post).toHaveBeenCalledWith(
          '/DiveSite/site-2/conditions',
          expect.not.objectContaining({ status: 'pending' })
        );
      });
    });

    describe('Trainer role', () => {
      beforeEach(() => setUserRoles(['Trainer']));

      it('allows submission for verified spots without pending status', async () => {
        mockApi.post.mockResolvedValue({ data: mockSubmitResponse });

        const result = await diveConditionsApi.submit(verifiedSite, submitData);

        expect(result.ok).toBe(true);
        expect(mockApi.post).toHaveBeenCalledWith(
          '/DiveSite/site-1/conditions',
          expect.not.objectContaining({ status: 'pending' })
        );
      });

      it('sets pending status when submitting for unverified spots', async () => {
        mockApi.post.mockResolvedValue({
          data: { ...mockSubmitResponse, status: 'pending' },
        });

        const result = await diveConditionsApi.submit(unverifiedSite, submitData);

        expect(result.ok).toBe(true);
        expect(mockApi.post).toHaveBeenCalledWith(
          '/DiveSite/site-2/conditions',
          expect.objectContaining({ status: 'pending' })
        );
      });
    });

    describe('DiveCenter role', () => {
      beforeEach(() => setUserRoles(['DiveCenter']));

      it('allows submission for verified spots without pending status', async () => {
        mockApi.post.mockResolvedValue({ data: mockSubmitResponse });

        const result = await diveConditionsApi.submit(verifiedSite, submitData);

        expect(result.ok).toBe(true);
        expect(mockApi.post).toHaveBeenCalledWith(
          '/DiveSite/site-1/conditions',
          expect.not.objectContaining({ status: 'pending' })
        );
      });

      it('sets pending status when submitting for unverified spots', async () => {
        mockApi.post.mockResolvedValue({
          data: { ...mockSubmitResponse, status: 'pending' },
        });

        const result = await diveConditionsApi.submit(unverifiedSite, submitData);

        expect(result.ok).toBe(true);
        expect(mockApi.post).toHaveBeenCalledWith(
          '/DiveSite/site-2/conditions',
          expect.objectContaining({ status: 'pending' })
        );
      });
    });

    it('handles API errors on submission', async () => {
      setUserRoles(['Diver']);
      mockApi.post.mockRejectedValue({
        response: { data: { Error: 'Server error' }, status: 500 },
      });

      const result = await diveConditionsApi.submit(verifiedSite, submitData);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('Server error');
      }
    });
  });
});
