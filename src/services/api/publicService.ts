import { apiClient, ApiResponse, API_BASE_URL } from './client';
import {
  PublicHotelPortalDto,
  PublicHubDetailDto,
  PublicCatalogCategoryDetailDto,
  PublicCatalogItemDto,
  PublicFullCatalogDto,
  PublicActivityDto,
  SubmitInquiryRequestDto,
  SubmitOrderRequestDto,
  GuestOrderDto,
  SubmitReviewRequestDto,
} from '../../types/api';

export type PublicHotelProfile = PublicHotelPortalDto;

export const publicService = {
  /**
   * Backward-compatible alias for getPortal returning data directly
   */
  async getHotelBySlug(slug: string, lang?: string): Promise<PublicHotelPortalDto> {
    const res = await this.getPortal(slug, lang);
    return res.data;
  },

  /**
   * Get dynamic hotel portal by slug (e.g. 'skyhill')
   * GET /api/public/{slug}?lang={lang}
   */
  async getPortal(slug: string, lang?: string): Promise<ApiResponse<PublicHotelPortalDto>> {
    const params = lang ? { lang } : undefined;
    const response = await apiClient.get<ApiResponse<PublicHotelPortalDto>>(`/api/public/${slug}`, { params });
    return response.data;
  },

  /**
   * Get Hub detail by code or ID (191..196, info, food, spa, entertainment, contacts, specials)
   * GET /api/public/{slug}/hubs/{hubCodeOrId}?lang={lang}
   */
  async getHub(slug: string, hubCodeOrId: string | number, lang?: string): Promise<ApiResponse<PublicHubDetailDto>> {
    const params = lang ? { lang } : undefined;
    const response = await apiClient.get<ApiResponse<PublicHubDetailDto>>(`/api/public/${slug}/hubs/${hubCodeOrId}`, { params });
    return response.data;
  },

  /**
   * Get Catalog Category detail (e.g. 4578 SHIRVAN, 4579 SAQI)
   * GET /api/public/{slug}/catalog/categories/{categoryCodeOrId}?lang={lang}
   */
  async getCategory(slug: string, categoryCodeOrId: string | number, lang?: string): Promise<ApiResponse<PublicCatalogCategoryDetailDto>> {
    const params = lang ? { lang } : undefined;
    const response = await apiClient.get<ApiResponse<PublicCatalogCategoryDetailDto>>(
      `/api/public/${slug}/catalog/categories/${categoryCodeOrId}`,
      { params }
    );
    return response.data;
  },

  /**
   * Get Catalog Item detail (e.g. 43107..43234)
   * GET /api/public/{slug}/catalog/items/{itemCodeOrId}?lang={lang}
   */
  async getItem(slug: string, itemCodeOrId: string | number, lang?: string): Promise<ApiResponse<PublicCatalogItemDto>> {
    const params = lang ? { lang } : undefined;
    const response = await apiClient.get<ApiResponse<PublicCatalogItemDto>>(
      `/api/public/${slug}/catalog/items/${itemCodeOrId}`,
      { params }
    );
    return response.data;
  },

  /**
   * Get full catalog with all hubs, categories and items for /cart and /favourites
   * GET /api/public/{slug}/catalog?lang={lang}
   */
  async getFullCatalog(slug: string, lang?: string): Promise<ApiResponse<PublicFullCatalogDto>> {
    const params = lang ? { lang } : undefined;
    const response = await apiClient.get<ApiResponse<PublicFullCatalogDto>>(`/api/public/${slug}/catalog`, { params });
    return response.data;
  },

  /**
   * Submit guest cart order (Room service, Table, Spa reservation)
   * POST /api/public/{slug}/orders
   */
  async submitOrder(slug: string, request: SubmitOrderRequestDto): Promise<ApiResponse<GuestOrderDto>> {
    const response = await apiClient.post<ApiResponse<GuestOrderDto>>(`/api/public/${slug}/orders`, request);
    return response.data;
  },

  /**
   * Submit guest review (1-5 stars + feedback)
   * POST /api/public/{slug}/reviews
   */
  async submitReview(slug: string, request: SubmitReviewRequestDto): Promise<ApiResponse<boolean>> {
    const response = await apiClient.post<ApiResponse<boolean>>(`/api/public/${slug}/reviews`, request);
    return response.data;
  },

  /**
   * Submit guest inquiry (Connection form)
   * POST /api/public/{slug}/inquiries
   */
  async submitInquiry(slug: string, request: SubmitInquiryRequestDto): Promise<ApiResponse<boolean>> {
    const response = await apiClient.post<ApiResponse<boolean>>(`/api/public/${slug}/inquiries`, request);
    return response.data;
  },

  /**
   * Get hotel activities schedule
   * GET /api/public/{slug}/activities?lang={lang}&date={date}
   */
  async getActivities(slug: string, lang?: string, date?: string): Promise<ApiResponse<PublicActivityDto[]>> {
    const params: Record<string, string> = {};
    if (lang) params.lang = lang;
    if (date) params.date = date;
    const response = await apiClient.get<ApiResponse<PublicActivityDto[]>>(`/api/public/${slug}/activities`, { params });
    return response.data;
  },

  /**
   * Helper URLs
   */
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
