import api, { apiCall, type Result } from './client';
import type { AdminUserListResponse, AdminUserDetail } from './types';

export const adminApi = {
  getUsers: (page = 1, pageSize = 20): Promise<Result<AdminUserListResponse>> =>
    apiCall(() => api.get<AdminUserListResponse>(`/admin/users?page=${page}&pageSize=${pageSize}`)),
  getUser: (id: string): Promise<Result<AdminUserDetail>> =>
    apiCall(() => api.get<AdminUserDetail>(`/admin/users/${id}`)),
  deactivateUser: (id: string): Promise<Result<void>> =>
    apiCall(() => api.put(`/admin/users/${id}/deactivate`)),
  activateUser: (id: string): Promise<Result<void>> =>
    apiCall(() => api.put(`/admin/users/${id}/activate`)),
  changeUserRole: (id: string, role: string): Promise<Result<void>> =>
    apiCall(() => api.put(`/admin/users/${id}/role`, { role })),
};
