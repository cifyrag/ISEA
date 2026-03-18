import api, { apiCall, type Result } from './client';

interface UploadResult {
  url: string;
}

export const uploadApi = {
  image: (file: File): Promise<Result<UploadResult>> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiCall(() =>
      api.post<UploadResult>('/Upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    );
  },
};
