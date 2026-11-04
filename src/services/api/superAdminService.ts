import { apiClient, ApiResponse } from './client';

export interface TenantItem {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  isActive: boolean;
  subscriptionStatus: number;
  subscriptionEndDate?: string | null;
  suspensionReason?: string | null;
  linksCount: number;
  totalClicks: number;
  createdAtUtc: string;
}

export interface CreateTenantDto {
  name: string;
  slug: string;
  adminEmail: string;
  adminPassword?: string;
  adminFullName?: string;
  phone?: string;
  subscriptionEndDate?: string;
}

export interface UpdateSubscriptionDto {
  isActive?: boolean;
  subscriptionStatus?: number;
  subscriptionEndDate?: string;
  suspensionReason?: string | null;
}

export interface SuperAdminDashboardData {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  totalInquiries: number;
  totalSystemClicks: number;
}

export const superAdminService = {
  async getTenants(): Promise<TenantItem[]> {
    const response = await apiClient.get<ApiResponse<TenantItem[]>>('/api/super-admin/tenants');
    return response.data.data || [];
  },

  async createTenant(data: CreateTenantDto): Promise<TenantItem> {
    const response = await apiClient.post<ApiResponse<TenantItem>>('/api/super-admin/tenants', data);
    return response.data.data;
  },

  async updateSubscription(id: string, data: UpdateSubscriptionDto): Promise<boolean> {
    const response = await apiClient.patch<ApiResponse<boolean>>(`/api/super-admin/tenants/${id}/subscription`, data);
    return response.data.success;
  },

  async deleteTenant(id: string): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/api/super-admin/tenants/${id}`);
    return response.data.success;
  },

  async getDashboard(): Promise<SuperAdminDashboardData> {
    const response = await apiClient.get<ApiResponse<SuperAdminDashboardData>>('/api/super-admin/dashboard');
    return response.data.data;
  },
};

