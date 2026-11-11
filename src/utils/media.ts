import { API_BASE_URL } from '../services/api/client';
import altensorLogo from '../assets/images/altensor-logo.png';

const rawGuestModules = import.meta.glob('../assets/guest/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const guestMediaByName: Record<string, string> = {};
const guestMediaByStem: Record<string, string> = {};

for (const [modulePath, resolvedUrl] of Object.entries(rawGuestModules)) {
  const fileName = modulePath.split('/').pop();
  if (fileName) {
    const lower = fileName.toLowerCase();
    const stem = lower.replace(/\.[^.]+$/, '');
    guestMediaByName[lower] = resolvedUrl;
    guestMediaByStem[stem] = resolvedUrl;
  }
}

const STEM_ALIASES: Record<string, string> = {
  'dish-placeholder': 'plate',
};

function lookupBundledGuestAsset(fileName: string): string | undefined {
  const lower = fileName.toLowerCase();
  const stem = lower.replace(/\.[^.]+$/, '');
  if (stem === 'logo' || stem === 'altensor-logo') {
    return altensorLogo;
  }
  const targetStem = STEM_ALIASES[stem] || stem;
  return guestMediaByName[lower] || guestMediaByStem[targetStem];
}

export function resolveMediaUrl(url?: string | null, fallbackUrl: string = ''): string {
  const raw = (url ?? '').trim();
  if (!raw) {
    return fallbackUrl && fallbackUrl.trim() ? resolveMediaUrl(fallbackUrl, '') : '';
  }

  // Rewrite legacy backend IP URLs to the active API domain
  const normalized = raw
    .replace(/^https?:\/\/31\.57\.77\.199:5055/i, API_BASE_URL)
    .replace(/^http:\/\/api-modi\.altensor\.com/i, 'https://api-modi.altensor.com');

  // Map local /media/guest/ or legacy /media/skyhill/ assets to Vite-bundled /assets/*.jpg URLs
  if (normalized.includes('/media/guest/') || normalized.includes('/media/skyhill/')) {
    const marker = normalized.includes('/media/guest/') ? '/media/guest/' : '/media/skyhill/';
    const fileName = normalized.split(marker).pop()?.split('?')[0] || '';
    if (fileName.toLowerCase().endsWith('.mp4')) {
      return normalized.startsWith('http')
        ? normalized
        : `${API_BASE_URL}${normalized.startsWith('/') ? '' : '/'}${normalized}`;
    }
    const bundled = lookupBundledGuestAsset(fileName);
    if (bundled) {
      return bundled;
    }
  }

  if (normalized === '/altensor-logo.png' || normalized === 'altensor-logo.png') {
    return altensorLogo;
  }

  if (!normalized.includes('/')) {
    const bundled = lookupBundledGuestAsset(normalized);
    if (bundled) {
      return bundled;
    }
  }

  if (
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('data:') ||
    normalized.startsWith('blob:')
  ) {
    return normalized;
  }

  if (normalized.startsWith('/assets/') || normalized.startsWith('/favicon')) {
    return normalized;
  }

  const cleanUrl = normalized.startsWith('/') ? normalized : `/${normalized}`;
  return `${API_BASE_URL}${cleanUrl}`;
}
