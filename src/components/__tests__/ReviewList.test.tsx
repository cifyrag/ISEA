import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewList from '../ReviewList';
import { renderWithProviders } from '../../test/helpers';
import { reviewsApi } from '../../services/api';
import type { DiveSiteReview, ReviewSummary, PaginatedReviewResponse } from '../../services/api/types';

vi.mock('../../services/api', () => ({
  reviewsApi: {
    getForSite: vi.fn(),
    getSummary: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'user@test.com', firstName: 'Test', lastName: 'User', roles: [] },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

const mockReviewsApi = vi.mocked(reviewsApi);

const mockReview: DiveSiteReview = {
  id: 'r1',
  diveSiteId: 'ds1',
  userId: 'user@test.com',
  authorName: 'Test User',
  rating: 4,
  comment: 'Amazing reef dive with great visibility',
  photoUrls: ['https://example.com/photo1.jpg'],
  visibilityM: 20,
  diveDurationMin: 55,
  maxDepthM: 22,
  diveDate: '2026-05-20',
  waterTempC: 24,
  currentStrength: 'Weak',
  createdAt: '2026-05-20T15:00:00Z',
};

const mockSummary: ReviewSummary = {
  averageRating: 4.2,
  totalReviews: 3,
  ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 1 },
};

const mockPaginatedResponse: PaginatedReviewResponse = {
  items: [mockReview],
  totalCount: 1,
  page: 1,
  pageSize: 10,
};

describe('ReviewList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReviewsApi.getForSite.mockResolvedValue({ ok: true, data: mockPaginatedResponse });
    mockReviewsApi.getSummary.mockResolvedValue({ ok: true, data: mockSummary });
  });

  it('renders the reviews title', async () => {
    renderWithProviders(<ReviewList diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText('Reviews')).toBeInTheDocument();
    });
  });

  it('displays review summary with average rating', async () => {
    renderWithProviders(<ReviewList diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText('4.2')).toBeInTheDocument();
      expect(screen.getByText('(3)')).toBeInTheDocument();
      expect(screen.getByText('Based on 3 reviews')).toBeInTheDocument();
    });
  });

  it('displays rating distribution bars', async () => {
    renderWithProviders(<ReviewList diveSiteId="ds1" />);

    await waitFor(() => {
      const labels = screen.getAllByText(/^[1-5]$/);
      expect(labels.length).toBeGreaterThanOrEqual(5);
    });
  });

  it('displays individual review cards', async () => {
    renderWithProviders(<ReviewList diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Amazing reef dive with great visibility')).toBeInTheDocument();
    });
  });

  it('shows dive detail chips on review cards', async () => {
    renderWithProviders(<ReviewList diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText(/20m vis/)).toBeInTheDocument();
      expect(screen.getByText(/55 min/)).toBeInTheDocument();
      expect(screen.getByText(/24°C/)).toBeInTheDocument();
      const weakElements = screen.getAllByText('Weak');
      expect(weakElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows photo toggle button when photos exist', async () => {
    renderWithProviders(<ReviewList diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText('Show photos (1)')).toBeInTheDocument();
    });
  });

  it('toggles photo visibility', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReviewList diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText('Show photos (1)')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Show photos (1)'));
    expect(screen.getByText('Hide photos')).toBeInTheDocument();
    expect(screen.getByAltText('Photo 1')).toBeInTheDocument();
  });

  it('shows no reviews message when empty', async () => {
    mockReviewsApi.getForSite.mockResolvedValue({
      ok: true,
      data: { items: [], totalCount: 0, page: 1, pageSize: 10 },
    });
    mockReviewsApi.getSummary.mockResolvedValue({
      ok: true,
      data: { averageRating: 0, totalReviews: 0, ratingDistribution: {} },
    });

    renderWithProviders(<ReviewList diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument();
    });
  });

  it('shows edit and delete buttons for own reviews', async () => {
    renderWithProviders(<ReviewList diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByTitle('Edit Review')).toBeInTheDocument();
      expect(screen.getByTitle('Delete Review')).toBeInTheDocument();
    });
  });

  it('hides edit/delete for other users reviews', async () => {
    const otherUserReview = {
      ...mockReview,
      userId: 'other@test.com',
      authorName: 'Other User',
    };
    mockReviewsApi.getForSite.mockResolvedValue({
      ok: true,
      data: { items: [otherUserReview], totalCount: 1, page: 1, pageSize: 10 },
    });

    renderWithProviders(<ReviewList diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText('Other User')).toBeInTheDocument();
    });
    expect(screen.queryByTitle('Edit Review')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Delete Review')).not.toBeInTheDocument();
  });

  it('includes the review form for authenticated users', async () => {
    renderWithProviders(<ReviewList diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText('Write a Review')).toBeInTheDocument();
    });
  });

  it('shows pagination when there are multiple pages', async () => {
    mockReviewsApi.getForSite.mockResolvedValue({
      ok: true,
      data: {
        items: [mockReview],
        totalCount: 25,
        page: 1,
        pageSize: 10,
      },
    });

    renderWithProviders(<ReviewList diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });
  });

  it('handles delete confirmation and re-fetches summary', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => true);
    mockReviewsApi.delete.mockResolvedValue({ ok: true, data: undefined });

    renderWithProviders(<ReviewList diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByTitle('Delete Review')).toBeInTheDocument();
    });

    mockReviewsApi.getSummary.mockClear();
    mockReviewsApi.getForSite.mockClear();

    await user.click(screen.getByTitle('Delete Review'));

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this review?'
    );
    expect(mockReviewsApi.delete).toHaveBeenCalledWith('ds1', 'r1');

    await waitFor(() => {
      expect(mockReviewsApi.getSummary).toHaveBeenCalled();
      expect(mockReviewsApi.getForSite).toHaveBeenCalled();
    });
  });

  it('does not delete when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => false);

    renderWithProviders(<ReviewList diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByTitle('Delete Review')).toBeInTheDocument();
    });

    await user.click(screen.getByTitle('Delete Review'));

    expect(window.confirm).toHaveBeenCalled();
    expect(mockReviewsApi.delete).not.toHaveBeenCalled();
  });

  it('filters out unsafe photo URLs', async () => {
    const reviewWithBadUrl = {
      ...mockReview,
      photoUrls: ['https://example.com/good.jpg', 'javascript:alert(1)', 'data:text/html,bad'],
    };
    mockReviewsApi.getForSite.mockResolvedValue({
      ok: true,
      data: { items: [reviewWithBadUrl], totalCount: 1, page: 1, pageSize: 10 },
    });

    const user = userEvent.setup();
    renderWithProviders(<ReviewList diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText('Show photos (1)')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Show photos (1)'));
    const images = screen.getAllByRole('img');
    const photoImages = images.filter(img => img.getAttribute('alt')?.startsWith('Photo'));
    expect(photoImages).toHaveLength(1);
  });
});
