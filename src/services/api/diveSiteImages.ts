import api, { apiCall, type Result } from './client';
import type { DiveSiteImage } from './types';

export const diveSiteImagesApi = {
  upload: (diveSiteId: string, file: File): Promise<Result<DiveSiteImage>> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiCall(() =>
      api.post<DiveSiteImage>(`/DiveSite/${diveSiteId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    );
  },

  delete: (diveSiteId: string, imageId: string): Promise<Result<void>> =>
    apiCall(() => api.delete(`/DiveSite/${diveSiteId}/images/${imageId}`)),
};
