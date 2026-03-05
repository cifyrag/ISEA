import api, { apiCall, type Result } from './client';
import type { UserProfile, UpdateProfileRequest } from './types';

export const userApi = {
  getProfile: (): Promise<Result<UserProfile>> =>
    apiCall(() => api.get<UserProfile>('/user/profile')),
  updateProfile: (data: UpdateProfileRequest): Promise<Result<UserProfile>> =>
    apiCall(() => api.put<UserProfile>('/user/profile', data)),
  changePassword: (data: { currentPassword: string; newPassword: string }): Promise<Result<void>> =>
    apiCall(() => api.put('/user/password', data)),
};
