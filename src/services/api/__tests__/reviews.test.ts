import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reviewsApi } from '../reviews';
import api from '../client';

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

describe('reviewsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getForSite', () => {
    it('fetches paginated reviews for a dive site', async () => {
      const mockResponse = {
        data: {
          items: [
            { id: 'r1', diveSiteId: 'ds1', rating: 5, comment: 'Great dive!' },
          ],
          totalCount: 1,
          page: 1,
          pageSize: 10,
        },
      };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await reviewsApi.getForSite('ds1', 1, 10);

      expect(mockApi.get).toHaveBeenCalledWith(
        '/DiveSite/ds1/reviews?page=1&pageSize=10'
      );
      expect(result).toEqual({ ok: true, data: mockResponse.data });
    });

    it('uses default pagination values', async () => {
      mockApi.get.mockResolvedValue({ data: { items: [], totalCount: 0, page: 1, pageSize: 10 } });

      await reviewsApi.getForSite('ds1');

      expect(mockApi.get).toHaveBeenCalledWith(
        '/DiveSite/ds1/reviews?page=1&pageSize=10'
      );
    });

    it('handles API errors gracefully', async () => {
      mockApi.get.mockRejectedValue({
        response: { data: { Error: 'Not found' }, status: 404 },
      });

      const result = await reviewsApi.getForSite('ds-nonexistent');

      expect(result).toEqual({ ok: false, error: 'Not found' });
    });
  });

  describe('getSummary', () => {
    it('fetches review summary for a dive site', async () => {
      const mockSummary = {
        averageRating: 4.2,
        totalReviews: 15,
        ratingDistribution: { 1: 0, 2: 1, 3: 2, 4: 5, 5: 7 },
      };
      mockApi.get.mockResolvedValue({ data: mockSummary });

      const result = await reviewsApi.getSummary('ds1');

      expect(mockApi.get).toHaveBeenCalledWith('/DiveSite/ds1/reviews/summary');
      expect(result).toEqual({ ok: true, data: mockSummary });
    });
  });

  describe('create', () => {
    it('creates a new review', async () => {
      const newReview = {
        rating: 4,
        comment: 'Nice reef dive',
        visibilityM: 15,
        diveDurationMin: 45,
        maxDepthM: 18,
        diveDate: '2026-05-20',
      };
      const createdReview = { id: 'r2', diveSiteId: 'ds1', ...newReview };
      mockApi.post.mockResolvedValue({ data: createdReview });

      const result = await reviewsApi.create('ds1', newReview);

      expect(mockApi.post).toHaveBeenCalledWith('/DiveSite/ds1/reviews', newReview);
      expect(result).toEqual({ ok: true, data: createdReview });
    });

    it('handles validation errors', async () => {
      mockApi.post.mockRejectedValue({
        response: { data: { message: 'Rating is required' }, status: 400 },
      });

      const result = await reviewsApi.create('ds1', { rating: 0, comment: '' });

      expect(result.ok).toBe(false);
    });
  });

  describe('update', () => {
    it('updates an existing review', async () => {
      const updateData = { rating: 5, comment: 'Updated review' };
      const updatedReview = { id: 'r1', diveSiteId: 'ds1', ...updateData };
      mockApi.put.mockResolvedValue({ data: updatedReview });

      const result = await reviewsApi.update('ds1', 'r1', updateData);

      expect(mockApi.put).toHaveBeenCalledWith(
        '/DiveSite/ds1/reviews/r1',
        updateData
      );
      expect(result).toEqual({ ok: true, data: updatedReview });
    });
  });

  describe('delete', () => {
    it('deletes a review', async () => {
      mockApi.delete.mockResolvedValue({ data: undefined });

      const result = await reviewsApi.delete('ds1', 'r1');

      expect(mockApi.delete).toHaveBeenCalledWith('/DiveSite/ds1/reviews/r1');
      expect(result).toEqual({ ok: true, data: undefined });
    });

    it('handles unauthorized deletion', async () => {
      mockApi.delete.mockRejectedValue({
        response: { data: { Error: 'Unauthorized' }, status: 403 },
      });

      const result = await reviewsApi.delete('ds1', 'r-other');

      expect(result).toEqual({ ok: false, error: 'Unauthorized' });
    });
  });
});
