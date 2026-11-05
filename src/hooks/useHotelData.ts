import { useQuery } from '@tanstack/react-query';
import { publicService } from '../services/api/publicService';
import { useLanguage } from '../context/LanguageContext';
import {
  PublicHotelPortalDto,
  PublicHubDetailDto,
  PublicCatalogCategoryDetailDto,
  PublicCatalogItemDto,
  PublicFullCatalogDto,
} from '../types/api';

/**
 * Fetch dynamic hotel portal data (stories, hubs, daily specials, departments, branding)
 */
export function useHotelPortal(slug: string = 'skyhill') {
  const { currentLang } = useLanguage();

  return useQuery<PublicHotelPortalDto>({
    queryKey: ['hotelPortal', slug, currentLang],
    queryFn: async () => {
      const response = await publicService.getPortal(slug, currentLang);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Otelin məlumatları yüklənə bilmədi.');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });
}

/**
 * Fetch dynamic hub data (e.g. 191..196)
 */
export function useHub(slug: string = 'skyhill', hubCodeOrId?: string | number) {
  const { currentLang } = useLanguage();

  return useQuery<PublicHubDetailDto>({
    queryKey: ['hub', slug, hubCodeOrId, currentLang],
    queryFn: async () => {
      if (!hubCodeOrId) throw new Error('Hub identifikatoru təyin edilməyib.');
      const response = await publicService.getHub(slug, hubCodeOrId, currentLang);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Hub məlumatları tapılmadı.');
      }
      return response.data;
    },
    enabled: !!hubCodeOrId,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}

/**
 * Fetch catalog category / venue detail (e.g. 4578 SHIRVAN)
 */
export function useCatalogCategory(slug: string = 'skyhill', categoryCodeOrId?: string | number) {
  const { currentLang } = useLanguage();

  return useQuery<PublicCatalogCategoryDetailDto>({
    queryKey: ['catalogCategory', slug, categoryCodeOrId, currentLang],
    queryFn: async () => {
      if (!categoryCodeOrId) throw new Error('Kateqoriya identifikatoru təyin edilməyib.');
      const response = await publicService.getCategory(slug, categoryCodeOrId, currentLang);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Kateqoriya məlumatları tapılmadı.');
      }
      return response.data;
    },
    enabled: !!categoryCodeOrId,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}

/**
 * Fetch catalog item detail (e.g. 43107..43234)
 */
export function useCatalogItem(slug: string = 'skyhill', itemCodeOrId?: string | number) {
  const { currentLang } = useLanguage();

  return useQuery<PublicCatalogItemDto>({
    queryKey: ['catalogItem', slug, itemCodeOrId, currentLang],
    queryFn: async () => {
      if (!itemCodeOrId) throw new Error('Məhsul identifikatoru təyin edilməyib.');
      const response = await publicService.getItem(slug, itemCodeOrId, currentLang);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Məhsul məlumatları tapılmadı.');
      }
      return response.data;
    },
    enabled: !!itemCodeOrId,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}

/**
 * Fetch complete catalog for /cart and /favourites
 */
export function useFullCatalog(slug: string = 'skyhill') {
  const { currentLang } = useLanguage();

  return useQuery<PublicFullCatalogDto>({
    queryKey: ['fullCatalog', slug, currentLang],
    queryFn: async () => {
      const response = await publicService.getFullCatalog(slug, currentLang);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Kataloq yüklənə bilmədi.');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 3,
    retry: 1,
  });
}

