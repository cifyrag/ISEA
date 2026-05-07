import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewForm from '../ReviewForm';
import { renderWithProviders } from '../../test/helpers';
import { reviewsApi } from '../../services/api';

vi.mock('../../services/api', () => ({
  reviewsApi: {
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', firstName: 'Test', lastName: 'User', roles: [] },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

const mockReviewsApi = vi.mocked(reviewsApi);

describe('ReviewForm', () => {
  const defaultProps = {
    diveSiteId: 'ds1',
    onReviewSubmitted: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with required fields', () => {
    renderWithProviders(<ReviewForm {...defaultProps} />);

    expect(screen.getByText('Write a Review')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/share your dive experience/i)).toBeInTheDocument();
    expect(screen.getByText('Submit Review')).toBeInTheDocument();
  });

  it('shows error when submitting without rating', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReviewForm {...defaultProps} />);

    await user.click(screen.getByText('Submit Review'));

    expect(screen.getByText('Please select a rating')).toBeInTheDocument();
    expect(mockReviewsApi.create).not.toHaveBeenCalled();
  });

  it('shows error when submitting without comment', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReviewForm {...defaultProps} />);

    const stars = screen.getAllByRole('button').filter(btn => {
      const svg = btn.querySelector('svg');
      return svg !== null;
    });
    await user.click(stars[3]);

    await user.click(screen.getByText('Submit Review'));

    expect(screen.getByText('Please write a comment')).toBeInTheDocument();
  });

  it('submits a review successfully', async () => {
    const user = userEvent.setup();
    const onSubmitted = vi.fn();
    const createdReview = {
      id: 'r1',
      diveSiteId: 'ds1',
      userId: 'u1',
      authorName: 'Test User',
      rating: 4,
      comment: 'Great dive site!',
      photoUrls: [],
      createdAt: '2026-05-25T10:00:00Z',
    };
    mockReviewsApi.create.mockResolvedValue({ ok: true, data: createdReview });

    renderWithProviders(
      <ReviewForm diveSiteId="ds1" onReviewSubmitted={onSubmitted} />
    );

    const stars = screen.getAllByRole('button').filter(btn => {
      const svg = btn.querySelector('svg');
      return svg !== null;
    });
    await user.click(stars[3]);

    await user.type(
      screen.getByPlaceholderText(/share your dive experience/i),
      'Great dive site!'
    );

    await user.click(screen.getByText('Submit Review'));

    await waitFor(() => {
      expect(mockReviewsApi.create).toHaveBeenCalledWith('ds1', expect.objectContaining({
        rating: 4,
        comment: 'Great dive site!',
      }));
      expect(onSubmitted).toHaveBeenCalledWith(createdReview);
    });
  });

  it('handles API errors on submission', async () => {
    const user = userEvent.setup();
    mockReviewsApi.create.mockResolvedValue({
      ok: false,
      error: 'Server error',
    });

    renderWithProviders(<ReviewForm {...defaultProps} />);

    const stars = screen.getAllByRole('button').filter(btn => btn.querySelector('svg'));
    await user.click(stars[4]);
    await user.type(
      screen.getByPlaceholderText(/share your dive experience/i),
      'Test comment'
    );
    await user.click(screen.getByText('Submit Review'));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('renders in edit mode with pre-filled values', () => {
    const existingReview = {
      id: 'r1',
      diveSiteId: 'ds1',
      userId: 'u1',
      authorName: 'Test',
      rating: 3,
      comment: 'Original comment',
      photoUrls: [],
      visibilityM: 12,
      diveDurationMin: 50,
      maxDepthM: 25,
      createdAt: '2026-05-25T10:00:00Z',
    };

    renderWithProviders(
      <ReviewForm
        {...defaultProps}
        existingReview={existingReview}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText('Edit Review')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Original comment')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    expect(screen.getByDisplayValue('25')).toBeInTheDocument();
  });

  it('calls update API when editing', async () => {
    const user = userEvent.setup();
    const existingReview = {
      id: 'r1',
      diveSiteId: 'ds1',
      userId: 'u1',
      authorName: 'Test',
      rating: 3,
      comment: 'Original',
      photoUrls: [],
      createdAt: '2026-05-25T10:00:00Z',
    };
    const updatedReview = { ...existingReview, comment: 'Updated' };
    mockReviewsApi.update.mockResolvedValue({ ok: true, data: updatedReview });

    renderWithProviders(
      <ReviewForm
        {...defaultProps}
        existingReview={existingReview}
        onCancel={vi.fn()}
      />
    );

    const textarea = screen.getByDisplayValue('Original');
    await user.clear(textarea);
    await user.type(textarea, 'Updated');

    await user.click(screen.getByText('Update Review'));

    await waitFor(() => {
      expect(mockReviewsApi.update).toHaveBeenCalledWith(
        'ds1',
        'r1',
        expect.objectContaining({ comment: 'Updated' })
      );
    });
  });

  it('shows cancel button in edit mode', () => {
    const existingReview = {
      id: 'r1',
      diveSiteId: 'ds1',
      userId: 'u1',
      authorName: 'Test',
      rating: 3,
      comment: 'Test',
      photoUrls: [],
      createdAt: '2026-05-25T10:00:00Z',
    };
    const onCancel = vi.fn();

    renderWithProviders(
      <ReviewForm {...defaultProps} existingReview={existingReview} onCancel={onCancel} />
    );

    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders dive detail fields', () => {
    renderWithProviders(<ReviewForm {...defaultProps} />);

    expect(screen.getByText('Dive Details (optional)')).toBeInTheDocument();
    expect(screen.getByText('Dive Date')).toBeInTheDocument();
    expect(screen.getByText('Visibility (m)')).toBeInTheDocument();
    expect(screen.getByText('Duration (min)')).toBeInTheDocument();
    expect(screen.getByText('Max Depth (m)')).toBeInTheDocument();
    expect(screen.getByText('Water Temp (°C)')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('rejects non-http photo URLs', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReviewForm {...defaultProps} />);

    const photoInput = screen.getByPlaceholderText('Enter photo URL...');

    await user.type(photoInput, 'javascript:alert(1)');
    await user.keyboard('{Enter}');

    expect(photoInput).toHaveValue('javascript:alert(1)');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('accepts valid https photo URLs', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReviewForm {...defaultProps} />);

    const photoInput = screen.getByPlaceholderText('Enter photo URL...');
    await user.type(photoInput, 'https://example.com/photo.jpg');
    await user.keyboard('{Enter}');

    expect(photoInput).toHaveValue('');
  });
});
