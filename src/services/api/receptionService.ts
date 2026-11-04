import { apiClient, ApiResponse } from './client';

export interface InquiryItem {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  roomNumber: string;
  message: string;
  status: 1 | 2 | 3; // 1=Pending, 2=Contacted, 3=Cancelled
  isEmailSent?: boolean;
  isTelegramSent?: boolean;
  createdAtUtc: string;
}

function getTenantQueryParam(overrideTenantId?: string | null): Record<string, string> | undefined {
  const tid = overrideTenantId || new URLSearchParams(window.location.search).get('tenantId');
  return tid ? { tenantId: tid } : undefined;
}

export const receptionService = {
  async getInquiries(tenantId?: string | null): Promise<InquiryItem[]> {
    const response = await apiClient.get<ApiResponse<InquiryItem[]>>('/api/hotel-admin/inquiries', {
      params: getTenantQueryParam(tenantId),
    });
    return response.data.data || [];
  },

  async updateInquiryStatus(id: string, status: 1 | 2 | 3, tenantId?: string | null): Promise<boolean> {
    const response = await apiClient.patch<ApiResponse<boolean>>(
      `/api/hotel-admin/inquiries/${id}/status`,
      { status },
      { params: getTenantQueryParam(tenantId) }
    );
    return response.data.success;
  },
};
