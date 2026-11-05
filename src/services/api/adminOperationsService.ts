import { apiClient, ApiResponse } from './client';
import {
  GuestOrderDto,
  OrderStatus,
  UpdateOrderStatusDto,
  GuestReviewDto,
  DepartmentContactDto,
  CreateDepartmentContactDto,
  UpdateDepartmentContactDto,
  NotificationSettingsDto,
  UpdateNotificationSettingsDto,
  ConnectTelegramBotRequestDto,
  ConnectTelegramBotResponseDto,
  ConnectEmailRequestDto,
  ConnectEmailResponseDto,
} from '../../types/api';

export const adminOperationsService = {
  // ================= Orders =================
  async getOrders(status?: OrderStatus, tenantId?: string): Promise<ApiResponse<GuestOrderDto[]>> {
    const params: Record<string, string | number> = {};
    if (status !== undefined) params.status = status;
    if (tenantId) params.tenantId = tenantId;
    const response = await apiClient.get<ApiResponse<GuestOrderDto[]>>('/api/hotel-admin/orders', { params });
    return response.data;
  },

  async updateOrderStatus(id: string, request: UpdateOrderStatusDto, tenantId?: string): Promise<ApiResponse<GuestOrderDto>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.patch<ApiResponse<GuestOrderDto>>(`/api/hotel-admin/orders/${id}/status`, request, { params });
    return response.data;
  },

  // ================= Reviews =================
  async getReviews(isResolved?: boolean, tenantId?: string): Promise<ApiResponse<GuestReviewDto[]>> {
    const params: Record<string, string | boolean> = {};
    if (isResolved !== undefined) params.isResolved = isResolved;
    if (tenantId) params.tenantId = tenantId;
    const response = await apiClient.get<ApiResponse<GuestReviewDto[]>>('/api/hotel-admin/reviews', { params });
    return response.data;
  },

  async toggleReviewResolved(id: string, tenantId?: string): Promise<ApiResponse<boolean>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.patch<ApiResponse<boolean>>(`/api/hotel-admin/reviews/${id}/resolve`, {}, { params });
    return response.data;
  },

  // ================= Department Contacts =================
  async getDepartmentContacts(tenantId?: string): Promise<ApiResponse<DepartmentContactDto[]>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.get<ApiResponse<DepartmentContactDto[]>>('/api/hotel-admin/departments', { params });
    return response.data;
  },

  async createDepartmentContact(request: CreateDepartmentContactDto, tenantId?: string): Promise<ApiResponse<DepartmentContactDto>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.post<ApiResponse<DepartmentContactDto>>('/api/hotel-admin/departments', request, { params });
    return response.data;
  },

  async updateDepartmentContact(id: string, request: UpdateDepartmentContactDto, tenantId?: string): Promise<ApiResponse<DepartmentContactDto>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.put<ApiResponse<DepartmentContactDto>>(`/api/hotel-admin/departments/${id}`, request, { params });
    return response.data;
  },

  async deleteDepartmentContact(id: string, tenantId?: string): Promise<ApiResponse<boolean>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.delete<ApiResponse<boolean>>(`/api/hotel-admin/departments/${id}`, { params });
    return response.data;
  },

  // ================= Notification Settings =================
  async getNotificationSettings(tenantId?: string): Promise<ApiResponse<NotificationSettingsDto>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.get<ApiResponse<NotificationSettingsDto>>('/api/hotel-admin/notifications/settings', { params });
    return response.data;
  },

  async updateNotificationSettings(request: UpdateNotificationSettingsDto, tenantId?: string): Promise<ApiResponse<NotificationSettingsDto>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.put<ApiResponse<NotificationSettingsDto>>('/api/hotel-admin/notifications/settings', request, { params });
    return response.data;
  },

  async connectTelegramBot(request: ConnectTelegramBotRequestDto, tenantId?: string): Promise<ApiResponse<ConnectTelegramBotResponseDto>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.post<ApiResponse<ConnectTelegramBotResponseDto>>('/api/hotel-admin/notifications/telegram/connect', request, { params });
    return response.data;
  },

  async connectEmail(request: ConnectEmailRequestDto, tenantId?: string): Promise<ApiResponse<ConnectEmailResponseDto>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.post<ApiResponse<ConnectEmailResponseDto>>('/api/hotel-admin/notifications/email/connect', request, { params });
    return response.data;
  },

  async sendTestNotification(tenantId?: string): Promise<ApiResponse<boolean>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.post<ApiResponse<boolean>>('/api/hotel-admin/notifications/test', {}, { params });
    return response.data;
  },
};

export default adminOperationsService;

