import { API_BASE_URL } from '../services/api/client';

export function resolveMediaUrl(url?: string | null, fallbackUrl: string = ''): string {
  if (!url) return fallbackUrl;

  // Map legacy Skyhill CDN or /media/skyhill/ paths to our local premium /media/guest/ assets
  if (url.includes('/media/skyhill/')) {
    const fileName = url.split('/media/skyhill/').pop()?.split('?')[0] || '';
    if (fileName === 'logo.svg' || fileName === 'logo.png' || fileName === 'logo.webp') {
      return '/altensor-logo.png';
    }
    if (fileName.endsWith('.mp4')) {
      return url;
    }
    if (fileName) {
      return `/media/guest/${fileName}`;
    }
  }

  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  // If it's a local public asset like /media/guest/... or /assets/...
  if (url.startsWith('/media/') || url.startsWith('/assets/') || url.startsWith('/favicon') || url.startsWith('/altensor-logo')) {
    return url;
  }
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE_URL}${cleanUrl}`;
}

