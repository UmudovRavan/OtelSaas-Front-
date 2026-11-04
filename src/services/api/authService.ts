import { apiClient, ApiResponse } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  email: string;
  fullName: string;
  roles: string[];
  tenantId?: string | null;
  tenantSlug?: string | null;
  tenantName?: string | null;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponseData> {
    const response = await apiClient.post<ApiResponse<LoginResponseData>>('/api/auth/login', credentials);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Giriş uğursuz oldu.');
    }
    return response.data.data;
  },

  async refreshToken(refreshToken: string): Promise<LoginResponseData> {
    const response = await apiClient.post<ApiResponse<LoginResponseData>>('/api/auth/refresh-token', { refreshToken });
    return response.data.data;
  },

  async getMe(): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>('/api/auth/me');
    return response.data.data;
  },
};

