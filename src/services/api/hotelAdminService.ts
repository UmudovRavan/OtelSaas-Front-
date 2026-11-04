import { apiClient, ApiResponse, API_BASE_URL } from './client';

export interface HotelAdminProfile {
  name: string;
  slug: string;
  bio: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  primaryColor: string;
  themeMode: number;
  phone: string;
  email: string;
  whatsApp: string;
  telegram: string;
  address: string;
  mapUrl: string;
}

export interface AdminCategory {
  id: string;
  title: string;
  layoutType: 'list' | 'icons';
  displayOrder: number;
  linksCount?: number;
}

export interface AdminLink {
  id: string;
  categoryId: string;
  title: string;
  subtitle?: string;
  linkType: number;
  targetUrl: string;
  iconKey: string;
  badge?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface AdminActivity {
  id: string;
  title: string;
  description?: string;
  location: string;
  startTime: string;
  endTime: string;
  date: string;
  category: string;
  isActive?: boolean;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalLinkClicks: number;
  totalInquiries: number;
  deviceBreakdown?: {
    mobilePercentage: number;
    desktopPercentage: number;
  };
}

export const hotelAdminService = {
  async getProfile(): Promise<HotelAdminProfile> {
    const response = await apiClient.get<ApiResponse<HotelAdminProfile>>('/api/hotel-admin/profile');
    return response.data.data;
  },

  async updateProfile(profile: Partial<HotelAdminProfile>): Promise<HotelAdminProfile> {
    const response = await apiClient.put<ApiResponse<HotelAdminProfile>>('/api/hotel-admin/profile', profile);
    return response.data.data;
  },

  async uploadLogo(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<string>>('/api/hotel-admin/profile/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async uploadCover(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<string>>('/api/hotel-admin/profile/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async getCategories(): Promise<AdminCategory[]> {
    const response = await apiClient.get<ApiResponse<AdminCategory[]>>('/api/hotel-admin/categories');
    return response.data.data || [];
  },

  async createCategory(category: { title: string; layoutType: 'list' | 'icons'; displayOrder?: number }): Promise<AdminCategory> {
    const response = await apiClient.post<ApiResponse<AdminCategory>>('/api/hotel-admin/categories', category);
    return response.data.data;
  },

  async updateCategory(id: string, category: { title: string; layoutType: 'list' | 'icons'; displayOrder?: number }): Promise<AdminCategory> {
    const response = await apiClient.put<ApiResponse<AdminCategory>>(`/api/hotel-admin/categories/${id}`, category);
    return response.data.data;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/api/hotel-admin/categories/${id}`);
    return response.data.success;
  },

  async getLinks(): Promise<AdminLink[]> {
    const response = await apiClient.get<ApiResponse<AdminLink[]>>('/api/hotel-admin/links');
    return response.data.data || [];
  },

  async createLink(link: Partial<AdminLink>): Promise<AdminLink> {
    const response = await apiClient.post<ApiResponse<AdminLink>>('/api/hotel-admin/links', link);
    return response.data.data;
  },

  async updateLink(id: string, link: Partial<AdminLink>): Promise<AdminLink> {
    const response = await apiClient.put<ApiResponse<AdminLink>>(`/api/hotel-admin/links/${id}`, link);
    return response.data.data;
  },

  async deleteLink(id: string): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/api/hotel-admin/links/${id}`);
    return response.data.success;
  },

  async uploadLinkFile(id: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<string>>(`/api/hotel-admin/links/${id}/upload-file`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async getActivities(): Promise<AdminActivity[]> {
    const response = await apiClient.get<ApiResponse<AdminActivity[]>>('/api/hotel-admin/activities');
    return response.data.data || [];
  },

  async createActivity(activity: Partial<AdminActivity>): Promise<AdminActivity> {
    const response = await apiClient.post<ApiResponse<AdminActivity>>('/api/hotel-admin/activities', activity);
    return response.data.data;
  },

  async deleteActivity(id: string): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/api/hotel-admin/activities/${id}`);
    return response.data.success;
  },

  async toggleActivity(id: string): Promise<boolean> {
    const response = await apiClient.patch<ApiResponse<boolean>>(`/api/hotel-admin/activities/${id}/toggle`);
    return response.data.success;
  },

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const response = await apiClient.get<ApiResponse<AnalyticsSummary>>('/api/hotel-admin/analytics/summary');
    return response.data.data;
  },

  getQrPngUrl(slug = 'hotel-resort'): string {
    return `${API_BASE_URL}/api/public/${slug}/qr/png`;
  },

  getQrSvgUrl(slug = 'hotel-resort'): string {
    return `${API_BASE_URL}/api/public/${slug}/qr/svg`;
  },
};

