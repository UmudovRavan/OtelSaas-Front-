import { useEffect } from 'react';
import { resolveMediaUrl } from './media';
import altensorLogo from '../assets/images/altensor-logo.png';

/**
 * Updates browser tab title and favicon dynamically for Guest Portal pages.
 */
export function useGuestDocumentMeta(title?: string, logoUrl?: string | null) {
  useEffect(() => {
    if (title && title.trim()) {
      document.title = title.trim();
    }
  }, [title]);

  useEffect(() => {
    const resolvedLogo = logoUrl ? resolveMediaUrl(logoUrl, altensorLogo) : altensorLogo;
    if (!resolvedLogo) return;

    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = resolvedLogo;
  }, [logoUrl]);
}
