import { apiClient, ApiResponse, API_BASE_URL } from './client';
import { resolveMediaUrl } from '../../utils/media';

export interface HotelAdminProfile {
  id: string;
  name: string;
  slug: string;
  bioAz?: string | null;
  bioEn?: string | null;
  bioRu?: string | null;
  defaultLanguage: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  primaryColor: string;
  themeMode: number;
  phone?: string | null;
  email?: string | null;
  whatsApp?: string | null;
  telegram?: string | null;
  address?: string | null;
  mapUrl?: string | null;
  isActive: boolean;
  subscriptionStatus: number;
  subscriptionEndDate?: string | null;
}

export interface UpdateHotelProfileDto {
  name: string;
  bioAz?: string | null;
  bioEn?: string | null;
  bioRu?: string | null;
  defaultLanguage: string;
  primaryColor: string;
  themeMode: number;
  phone?: string | null;
  email?: string | null;
  whatsApp?: string | null;
  telegram?: string | null;
  address?: string | null;
  mapUrl?: string | null;
}

export interface AdminLink {
  id: string;
  categoryId: string;
  titleAz: string;
  titleEn?: string | null;
  titleRu?: string | null;
  linkType: number;
  targetUrl: string;
  filePath?: string | null;
  iconKey?: string | null;
  isCustomIcon: boolean;
  openInNewTab: boolean;
  displayOrder: number;
  isActive: boolean;
  clickCount: number;
}

export interface CreateLinkDto {
  categoryId: string;
  titleAz: string;
  titleEn?: string | null;
  titleRu?: string | null;
  linkType: number;
  targetUrl: string;
  iconKey?: string | null;
  isCustomIcon: boolean;
  openInNewTab: boolean;
  displayOrder: number;
  isActive: boolean;
}

export interface AdminCategory {
  id: string;
  titleAz: string;
  titleEn?: string | null;
  titleRu?: string | null;
  layoutType: 'list' | 'icons';
  displayOrder: number;
  isActive: boolean;
  links?: AdminLink[];
}

export interface CreateCategoryDto {
  titleAz: string;
  titleEn?: string | null;
  titleRu?: string | null;
  layoutType: 'list' | 'icons';
  displayOrder: number;
  isActive: boolean;
}

export interface AdminActivity {
  id: string;
  titleAz: string;
  titleEn?: string | null;
  titleRu?: string | null;
  description?: string | null;
  location?: string | null;
  startTime: string;
  endTime?: string | null;
  date?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAtUtc?: string;
}

export interface CreateActivityDto {
  titleAz: string;
  titleEn?: string | null;
  titleRu?: string | null;
  description?: string | null;
  location?: string | null;
  startTime: string;
  endTime?: string | null;
  date?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  displayOrder: number;
}

export interface AnalyticsSummary {
  totalViewsLast30Days?: number;
  totalClicksLast30Days?: number;
  totalInquiriesLast30Days?: number;
  totalViews?: number;
  totalLinkClicks?: number;
  totalInquiries?: number;
  topLinks?: { linkId: string; title: string; clicks: number }[];
  dailyViews?: { date: string; views: number; clicks: number }[];
}

function getTenantQueryParam(overrideTenantId?: string | null): Record<string, string> | undefined {
  const tid = overrideTenantId || new URLSearchParams(window.location.search).get('tenantId');
  return tid ? { tenantId: tid } : undefined;
}

export function resolveBackendMediaUrl(url?: string | null): string {
  return resolveMediaUrl(url);
}

export const hotelAdminService = {
  async getProfile(tenantId?: string | null): Promise<HotelAdminProfile> {
    const response = await apiClient.get<ApiResponse<HotelAdminProfile>>('/api/hotel-admin/profile', {
      params: getTenantQueryParam(tenantId),
    });
    return response.data.data;
  },

  async updateProfile(profile: UpdateHotelProfileDto, tenantId?: string | null): Promise<HotelAdminProfile> {
    const response = await apiClient.put<ApiResponse<HotelAdminProfile>>('/api/hotel-admin/profile', profile, {
      params: getTenantQueryParam(tenantId),
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Profil yenilənərkən xəta baş verdi.');
    }
    return response.data.data;
  },

  async uploadLogo(file: File, tenantId?: string | null): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<string>>('/api/hotel-admin/profile/logo', formData, {
      params: getTenantQueryParam(tenantId),
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Loqo yüklənərkən xəta baş verdi.');
    }
    return response.data.data;
  },

  async uploadCover(file: File, tenantId?: string | null): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<string>>('/api/hotel-admin/profile/cover', formData, {
      params: getTenantQueryParam(tenantId),
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Qapaq şəkli yüklənərkən xəta baş verdi.');
    }
    return response.data.data;
  },

  async getCategories(tenantId?: string | null): Promise<AdminCategory[]> {
    const response = await apiClient.get<ApiResponse<AdminCategory[]>>('/api/hotel-admin/categories', {
      params: getTenantQueryParam(tenantId),
    });
    return response.data.data || [];
  },

  async createCategory(category: CreateCategoryDto, tenantId?: string | null): Promise<AdminCategory> {
    const response = await apiClient.post<ApiResponse<AdminCategory>>('/api/hotel-admin/categories', category, {
      params: getTenantQueryParam(tenantId),
    });
    return response.data.data;
  },

  async updateCategory(id: string, category: CreateCategoryDto, tenantId?: string | null): Promise<AdminCategory> {
    const response = await apiClient.put<ApiResponse<AdminCategory>>(`/api/hotel-admin/categories/${id}`, category, {
      params: getTenantQueryParam(tenantId),
    });
    return response.data.data;
  },

  async deleteCategory(id: string, tenantId?: string | null): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/api/hotel-admin/categories/${id}`, {
      params: getTenantQueryParam(tenantId),
    });
    return response.data.success;
  },

  async createLink(link: CreateLinkDto, tenantId?: string | null): Promise<AdminLink> {
    const response = await apiClient.post<ApiResponse<AdminLink>>('/api/hotel-admin/links', link, {
      params: getTenantQueryParam(tenantId),
    });
    return response.data.data;
  },

  async updateLink(id: string, link: Omit<CreateLinkDto, 'categoryId'>, tenantId?: string | null): Promise<AdminLink> {
    const response = await apiClient.put<ApiResponse<AdminLink>>(`/api/hotel-admin/links/${id}`, link, {
      params: getTenantQueryParam(tenantId),
    });
    return response.data.data;
  },

  async deleteLink(id: string, tenantId?: string | null): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/api/hotel-admin/links/${id}`, {
      params: getTenantQueryParam(tenantId),
    });
    return response.data.success;
  },

  async uploadLinkFile(id: string, file: File, tenantId?: string | null): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<string>>(`/api/hotel-admin/links/${id}/upload-file`, formData, {
      params: getTenantQueryParam(tenantId),
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async getActivities(tenantId?: string | null): Promise<AdminActivity[]> {
    const response = await apiClient.get<ApiResponse<AdminActivity[]>>('/api/hotel-admin/activities', {
      params: getTenantQueryParam(tenantId),
    });
    return response.data.data || [];
  },

  async createActivity(activity: CreateActivityDto, tenantId?: string | null): Promise<AdminActivity> {
    const response = await apiClient.post<ApiResponse<AdminActivity>>('/api/hotel-admin/activities', activity, {
      params: getTenantQueryParam(tenantId),
    });
    return response.data.data;
  },

  async updateActivity(
    id: string,
    activity: CreateActivityDto & { isActive: boolean },
    tenantId?: string | null
  ): Promise<AdminActivity> {
    const response = await apiClient.put<ApiResponse<AdminActivity>>(`/api/hotel-admin/activities/${id}`, activity, {
      params: getTenantQueryParam(tenantId),
    });
    return response.data.data;
  },

  async deleteActivity(id: string, tenantId?: string | null): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/api/hotel-admin/activities/${id}`, {
      params: getTenantQueryParam(tenantId),
    });
    return response.data.success;
  },

  async toggleActivity(id: string, tenantId?: string | null): Promise<boolean> {
    const response = await apiClient.patch<ApiResponse<boolean>>(
      `/api/hotel-admin/activities/${id}/toggle`,
      {},
      { params: getTenantQueryParam(tenantId) }
    );
    return response.data.success;
  },

  async getAnalyticsSummary(tenantId?: string | null): Promise<AnalyticsSummary> {
    const response = await apiClient.get<ApiResponse<AnalyticsSummary>>('/api/hotel-admin/analytics/summary', {
      params: getTenantQueryParam(tenantId),
    });
    return response.data.data;
  },

  async connectTelegram(
    data: { botToken: string; chatId: string; isEnabled: boolean },
    tenantId?: string | null
  ): Promise<boolean> {
    const response = await apiClient.post<ApiResponse<boolean>>(
      '/api/hotel-admin/notifications/telegram/connect',
      data,
      { params: getTenantQueryParam(tenantId) }
    );
    return response.data.success;
  },

  async connectEmail(
    data: { targetEmail: string; isEnabled: boolean },
    tenantId?: string | null
  ): Promise<boolean> {
    const response = await apiClient.post<ApiResponse<boolean>>(
      '/api/hotel-admin/notifications/email/connect',
      data,
      { params: getTenantQueryParam(tenantId) }
    );
    return response.data.success;
  },

  async sendTestNotification(tenantId?: string | null): Promise<boolean> {
    const response = await apiClient.post<ApiResponse<boolean>>(
      '/api/hotel-admin/notifications/test',
      {},
      { params: getTenantQueryParam(tenantId) }
    );
    return response.data.success;
  },

  getQrPngUrl(slug = 'altensor'): string {
    return `${API_BASE_URL}/api/public/${slug}/qr/png`;
  },

  getQrSvgUrl(slug = 'altensor'): string {
    return `${API_BASE_URL}/api/public/${slug}/qr/svg`;
  },
};
