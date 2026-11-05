import { API_BASE_URL } from '../services/api/client';

export function resolveMediaUrl(url?: string | null, fallbackUrl: string = ''): string {
  if (!url) return fallbackUrl;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  // If it's a local public asset like /media/guest/... or /assets/...
  if (url.startsWith('/media/') || url.startsWith('/assets/') || url.startsWith('/favicon')) {
    return url;
  }
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE_URL}${cleanUrl}`;
}

