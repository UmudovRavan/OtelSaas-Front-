import { apiClient, ApiResponse } from './client';
import {
  InquiryDto,
  InquiryStatus,
  GuestOrderDto,
  OrderStatus,
  GuestReviewDto,
} from '../../types/api';

export type InquiryItem = InquiryDto;

function getTenantQueryParam(overrideTenantId?: string | null): Record<string, string> | undefined {
  const tid = overrideTenantId || new URLSearchParams(window.location.search).get('tenantId');
  return tid ? { tenantId: tid } : undefined;
}

export const receptionService = {
  // ================= Inquiries =================
  async getInquiries(
    statusOrTenantId?: InquiryStatus | string | null,
    tenantId?: string | null
  ): Promise<InquiryDto[]> {
    let statusParam: InquiryStatus | undefined = undefined;
    let tenantParam: string | null | undefined = tenantId;

    if (typeof statusOrTenantId === 'number') {
      statusParam = statusOrTenantId;
    } else if (typeof statusOrTenantId === 'string') {
      tenantParam = statusOrTenantId;
    }

    const params: Record<string, string | number> = { ...getTenantQueryParam(tenantParam) };
    if (statusParam !== undefined) params.status = statusParam;
    const response = await apiClient.get<ApiResponse<InquiryDto[]>>('/api/hotel-admin/inquiries', { params });
    return response.data.data || [];
  },

  async updateInquiryStatus(
    id: string,
    status: InquiryStatus | number,
    tenantId?: string | null
  ): Promise<InquiryDto> {
    const response = await apiClient.patch<ApiResponse<InquiryDto>>(
      `/api/hotel-admin/inquiries/${id}/status`,
      { status },
      { params: getTenantQueryParam(tenantId) }
    );
    return response.data.data;
  },

  // ================= Cart Orders =================
  async getOrders(status?: OrderStatus, tenantId?: string | null): Promise<GuestOrderDto[]> {
    const params: Record<string, string | number> = { ...getTenantQueryParam(tenantId) };
    if (status !== undefined) params.status = status;
    const response = await apiClient.get<ApiResponse<GuestOrderDto[]>>('/api/hotel-admin/orders', { params });
    return response.data.data || [];
  },

  async updateOrderStatus(id: string, status: OrderStatus | number, tenantId?: string | null): Promise<GuestOrderDto> {
    const response = await apiClient.patch<ApiResponse<GuestOrderDto>>(
      `/api/hotel-admin/orders/${id}/status`,
      { status },
      { params: getTenantQueryParam(tenantId) }
    );
    return response.data.data;
  },

  // ================= Guest Reviews =================
  async getReviews(isResolved?: boolean, tenantId?: string | null): Promise<GuestReviewDto[]> {
    const params: Record<string, string | boolean> = { ...getTenantQueryParam(tenantId) };
    if (isResolved !== undefined) params.isResolved = isResolved;
    const response = await apiClient.get<ApiResponse<GuestReviewDto[]>>('/api/hotel-admin/reviews', { params });
    return response.data.data || [];
  },

  async toggleReviewResolved(id: string, tenantId?: string | null): Promise<boolean> {
    const response = await apiClient.patch<ApiResponse<boolean>>(
      `/api/hotel-admin/reviews/${id}/resolve`,
      {},
      { params: getTenantQueryParam(tenantId) }
    );
    return response.data.data;
  },
};

export default receptionService;
