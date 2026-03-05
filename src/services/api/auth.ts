import api, { apiCall, type Result } from './client';
import type { LoginRequest, RegisterRequest, AuthResponse } from './types';

export const authApi = {
  login: (data: LoginRequest): Promise<Result<AuthResponse>> =>
    apiCall(() => api.post<AuthResponse>('/auth/login', data)),

  register: (data: RegisterRequest): Promise<Result<AuthResponse>> =>
    apiCall(() => api.post<AuthResponse>('/auth/register', data)),
};
