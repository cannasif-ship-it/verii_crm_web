import { api } from '@/lib/axios';
import type { LoginRequest, LoginResponse, ActiveUsersResponse } from '../types/auth';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/login', {
      email: data.email,
      password: data.password,
    });
    return response;
  },
  register: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/register', {
      email: data.email,
      password: data.password,
    });
    return response;
  },
  getActiveUsers: async (): Promise<ActiveUsersResponse> => {
    const response = await api.get<ActiveUsersResponse>('/api/auth/users/active');
    return response;
  },
};