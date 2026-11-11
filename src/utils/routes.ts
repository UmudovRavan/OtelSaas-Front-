export function mapActionUrlToRoute(actionUrl?: string | null, slug: string = 'altensor'): string {
  if (!actionUrl) return '#';
  if (actionUrl.startsWith('http://') || actionUrl.startsWith('https://') || actionUrl.startsWith('tel:') || actionUrl.startsWith('mailto:')) {
    return actionUrl;
  }

  // Handle Skyhill paths: /skyhill/hotel/g/191 -> /hotel/:slug/g/191
  const clean = actionUrl.replace(/^\/(?:[a-zA-Z0-9_\-]+)\/hotel\//, '/hotel/');
  if (clean.startsWith('/hotel/g/')) {
    return `/hotel/${slug}/g/${clean.replace('/hotel/g/', '')}`;
  }
  if (clean.startsWith('/hotel/c/')) {
    return `/hotel/${slug}/c/${clean.replace('/hotel/c/', '')}`;
  }
  if (clean.startsWith('/hotel/p/')) {
    return `/hotel/${slug}/p/${clean.replace('/hotel/p/', '')}`;
  }
  if (clean.startsWith('/hotel/')) {
    return clean;
  }
  if (clean.startsWith('/g/')) {
    return `/hotel/${slug}${clean}`;
  }
  if (clean.startsWith('/c/')) {
    return `/hotel/${slug}${clean}`;
  }
  if (clean.startsWith('/p/')) {
    return `/hotel/${slug}${clean}`;
  }

  // Simple codes like 'spa', 'food', 'info'
  if (['info', 'food', 'spa', 'entertainment', 'contacts', 'specials'].includes(actionUrl)) {
    return `/hotel/${slug}/g/${actionUrl}`;
  }

  return actionUrl.startsWith('/') ? actionUrl : `/${actionUrl}`;
}

