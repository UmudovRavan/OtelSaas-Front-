import { apiClient, ApiResponse } from './client';
import {
  HotelStoryDto,
  CreateHotelStoryDto,
  UpdateHotelStoryDto,
  HotelHubDto,
  CreateHotelHubDto,
  UpdateHotelHubDto,
  CatalogCategoryDto,
  CreateCatalogCategoryDto,
  UpdateCatalogCategoryDto,
  CatalogItemDto,
  CreateCatalogItemDto,
  UpdateCatalogItemDto,
} from '../../types/api';

export const adminCatalogService = {
  // ================= Stories =================
  async getStories(tenantId?: string): Promise<ApiResponse<HotelStoryDto[]>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.get<ApiResponse<HotelStoryDto[]>>('/api/hotel-admin/stories', { params });
    return response.data;
  },

  async createStory(request: CreateHotelStoryDto, tenantId?: string): Promise<ApiResponse<HotelStoryDto>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.post<ApiResponse<HotelStoryDto>>('/api/hotel-admin/stories', request, { params });
    return response.data;
  },

  async updateStory(id: string, request: UpdateHotelStoryDto, tenantId?: string): Promise<ApiResponse<HotelStoryDto>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.put<ApiResponse<HotelStoryDto>>(`/api/hotel-admin/stories/${id}`, request, { params });
    return response.data;
  },

  async uploadStoryImage(id: string, file: File, tenantId?: string): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.post<ApiResponse<string>>(`/api/hotel-admin/stories/${id}/image`, formData, {
      params,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteStory(id: string, tenantId?: string): Promise<ApiResponse<boolean>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.delete<ApiResponse<boolean>>(`/api/hotel-admin/stories/${id}`, { params });
    return response.data;
  },

  // ================= Hubs =================
  async getHubs(tenantId?: string): Promise<ApiResponse<HotelHubDto[]>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.get<ApiResponse<HotelHubDto[]>>('/api/hotel-admin/hubs', { params });
    return response.data;
  },

  async createHub(request: CreateHotelHubDto, tenantId?: string): Promise<ApiResponse<HotelHubDto>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.post<ApiResponse<HotelHubDto>>('/api/hotel-admin/hubs', request, { params });
    return response.data;
  },

  async updateHub(id: string, request: UpdateHotelHubDto, tenantId?: string): Promise<ApiResponse<HotelHubDto>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.put<ApiResponse<HotelHubDto>>(`/api/hotel-admin/hubs/${id}`, request, { params });
    return response.data;
  },

  async uploadHubCover(id: string, file: File, tenantId?: string): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.post<ApiResponse<string>>(`/api/hotel-admin/hubs/${id}/cover`, formData, {
      params,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteHub(id: string, tenantId?: string): Promise<ApiResponse<boolean>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.delete<ApiResponse<boolean>>(`/api/hotel-admin/hubs/${id}`, { params });
    return response.data;
  },

  // ================= Catalog Categories =================
  async getCatalogCategories(hubId?: string, tenantId?: string): Promise<ApiResponse<CatalogCategoryDto[]>> {
    const params: Record<string, string> = {};
    if (hubId) params.hubId = hubId;
    if (tenantId) params.tenantId = tenantId;
    const response = await apiClient.get<ApiResponse<CatalogCategoryDto[]>>('/api/hotel-admin/catalog/categories', { params });
    return response.data;
  },

  async createCatalogCategory(request: CreateCatalogCategoryDto, tenantId?: string): Promise<ApiResponse<CatalogCategoryDto>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.post<ApiResponse<CatalogCategoryDto>>('/api/hotel-admin/catalog/categories', request, { params });
    return response.data;
  },

  async updateCatalogCategory(id: string, request: UpdateCatalogCategoryDto, tenantId?: string): Promise<ApiResponse<CatalogCategoryDto>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.put<ApiResponse<CatalogCategoryDto>>(`/api/hotel-admin/catalog/categories/${id}`, request, { params });
    return response.data;
  },

  async uploadCatalogCategoryImage(id: string, file: File, tenantId?: string): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.post<ApiResponse<string>>(`/api/hotel-admin/catalog/categories/${id}/image`, formData, {
      params,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteCatalogCategory(id: string, tenantId?: string): Promise<ApiResponse<boolean>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.delete<ApiResponse<boolean>>(`/api/hotel-admin/catalog/categories/${id}`, { params });
    return response.data;
  },

  // ================= Catalog Items =================
  async getCatalogItems(hubId?: string, categoryId?: string, tenantId?: string): Promise<ApiResponse<CatalogItemDto[]>> {
    const params: Record<string, string> = {};
    if (hubId) params.hubId = hubId;
    if (categoryId) params.categoryId = categoryId;
    if (tenantId) params.tenantId = tenantId;
    const response = await apiClient.get<ApiResponse<CatalogItemDto[]>>('/api/hotel-admin/catalog/items', { params });
    return response.data;
  },

  async createCatalogItem(request: CreateCatalogItemDto, tenantId?: string): Promise<ApiResponse<CatalogItemDto>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.post<ApiResponse<CatalogItemDto>>('/api/hotel-admin/catalog/items', request, { params });
    return response.data;
  },

  async updateCatalogItem(id: string, request: UpdateCatalogItemDto, tenantId?: string): Promise<ApiResponse<CatalogItemDto>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.put<ApiResponse<CatalogItemDto>>(`/api/hotel-admin/catalog/items/${id}`, request, { params });
    return response.data;
  },

  async uploadCatalogItemImage(id: string, file: File, tenantId?: string): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.post<ApiResponse<string>>(`/api/hotel-admin/catalog/items/${id}/image`, formData, {
      params,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteCatalogItem(id: string, tenantId?: string): Promise<ApiResponse<boolean>> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.delete<ApiResponse<boolean>>(`/api/hotel-admin/catalog/items/${id}`, { params });
    return response.data;
  },
};

export default adminCatalogService;

