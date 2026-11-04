import { apiClient, ApiResponse, API_BASE_URL } from './client';

export interface PublicLink {
  id: string;
  title: string;
  linkType: number; // 1=StandardUrl, 2=Phone, 3=Email, 4=WhatsApp, 5=Telegram, 6=PdfMenu, 7=Flipbook, 8=GoogleReview, 9=TripAdvisor, 10=Booking
  actionUrl: string;
  iconKey: string;
  isCustomIcon: boolean;
  openInNewTab: boolean;
  displayOrder: number;
}

export interface PublicCategory {
  id: string;
  title: string;
  layoutType: 'list' | 'icons';
  displayOrder: number;
  links: PublicLink[];
}

export interface PublicActivity {
  id: string;
  title: string;
  description?: string;
  location: string;
  startTime: string;
  endTime: string;
  date: string;
  category: string;
  imageUrl?: string | null;
}

export interface PublicHotelProfile {
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
  categories: PublicCategory[];
  activities: PublicActivity[];
}

export interface SubmitInquiryDto {
  fullName: string;
  phoneNumber: string;
  roomNumber: string;
  message: string;
  email?: string;
}

export const publicService = {
  async getHotelBySlug(slug: string): Promise<PublicHotelProfile> {
    const response = await apiClient.get<ApiResponse<PublicHotelProfile>>(`/api/public/${slug}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Otel məlumatları tapılmadı.');
    }
    return response.data.data;
  },

  async submitInquiry(slug: string, inquiry: SubmitInquiryDto): Promise<boolean> {
    const response = await apiClient.post<ApiResponse<boolean>>(`/api/public/${slug}/inquiries`, inquiry);
    return response.data.success;
  },

  async getActivities(slug: string): Promise<PublicActivity[]> {
    const response = await apiClient.get<ApiResponse<PublicActivity[]>>(`/api/public/${slug}/activities`);
    return response.data.data || [];
  },

  getQrPngUrl(slug: string): string {
    return `${API_BASE_URL}/api/public/${slug}/qr/png`;
  },

  getQrSvgUrl(slug: string): string {
    return `${API_BASE_URL}/api/public/${slug}/qr/svg`;
  },

  getVCardUrl(slug: string): string {
    return `${API_BASE_URL}/api/public/${slug}/vcard`;
  },
};

