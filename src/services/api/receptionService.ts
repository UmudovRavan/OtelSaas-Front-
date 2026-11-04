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

export const receptionService = {
  async getInquiries(): Promise<InquiryItem[]> {
    const response = await apiClient.get<ApiResponse<InquiryItem[]>>('/api/hotel-admin/inquiries');
    return response.data.data || [];
  },

  async updateInquiryStatus(id: string, status: 1 | 2 | 3): Promise<boolean> {
    const response = await apiClient.patch<ApiResponse<boolean>>(`/api/hotel-admin/inquiries/${id}/status`, {
      status,
    });
    return response.data.success;
  },
};

