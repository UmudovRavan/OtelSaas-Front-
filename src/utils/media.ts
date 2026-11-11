import { API_BASE_URL } from '../services/api/client';
import altensorLogo from '../assets/images/altensor-logo.png';

const rawGuestModules = import.meta.glob('../assets/guest/*.{webp,png,jpg,jpeg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const guestMediaMap: Record<string, string> = {};
for (const [modulePath, resolvedUrl] of Object.entries(rawGuestModules)) {
  const fileName = modulePath.split('/').pop();
  if (fileName) {
    guestMediaMap[fileName.toLowerCase()] = resolvedUrl;
  }
}

const FILE_ALIASES: Record<string, string> = {
  'dish-placeholder.webp': 'plate.webp',
};

function lookupBundledGuestAsset(fileName: string): string | undefined {
  const lower = fileName.toLowerCase();
  if (lower === 'logo.svg' || lower === 'logo.png' || lower === 'logo.webp' || lower === 'altensor-logo.png') {
    return altensorLogo;
  }
  const target = FILE_ALIASES[lower] || lower;
  return guestMediaMap[target];
}

export function resolveMediaUrl(url?: string | null, fallbackUrl: string = ''): string {
  const raw = (url ?? '').trim();
  if (!raw) {
    return fallbackUrl && fallbackUrl.trim() ? resolveMediaUrl(fallbackUrl, '') : '';
  }

  // Rewrite legacy backend IP URLs to the active API domain
  let normalized = raw
    .replace(/^https?:\/\/31\.57\.77\.199:5055/i, API_BASE_URL)
    .replace(/^http:\/\/api-modi\.altensor\.com/i, 'https://api-modi.altensor.com');

  // Map local /media/guest/ or legacy /media/skyhill/ assets to Vite-bundled /assets/ URLs
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

  if (!normalized.includes('/') && guestMediaMap[normalized.toLowerCase()]) {
    return guestMediaMap[normalized.toLowerCase()];
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
