import api, { apiCall, type Result } from './client';
import type {
  DiveSiteReview,
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewSummary,
} from './types';

export const reviewsApi = {
  getForSite: (diveSiteId: string): Promise<Result<DiveSiteReview[]>> =>
    apiCall(() => api.get<DiveSiteReview[]>(`/Reviews/divesite/${diveSiteId}`)),

  getSummary: (diveSiteId: string): Promise<Result<ReviewSummary>> =>
    apiCall(() => api.get<ReviewSummary>(`/Reviews/divesite/${diveSiteId}/summary`)),

  create: (data: CreateReviewRequest): Promise<Result<DiveSiteReview>> =>
    apiCall(() => api.post<DiveSiteReview>('/Reviews', data)),

  update: (reviewId: string, data: UpdateReviewRequest): Promise<Result<DiveSiteReview>> =>
    apiCall(() => api.put<DiveSiteReview>(`/Reviews/${reviewId}`, data)),

  delete: (reviewId: string): Promise<Result<void>> =>
    apiCall(() => api.delete(`/Reviews/${reviewId}`)),

  uploadPhoto: (reviewId: string, file: File): Promise<Result<DiveSiteReview>> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiCall(() =>
      api.post<DiveSiteReview>(`/Reviews/${reviewId}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    );
  },

  removePhoto: (reviewId: string, photoUrl: string): Promise<Result<DiveSiteReview>> =>
    apiCall(() =>
      api.delete<DiveSiteReview>(`/Reviews/${reviewId}/photos`, {
        params: { photoUrl },
      })
    ),
};
