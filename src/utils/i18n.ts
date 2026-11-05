import { LocalizedText } from '../types/api';

export type SupportedLang = 'az' | 'en' | 'ru';

export function tr(
  localized?: LocalizedText | null,
  langOrFallback?: SupportedLang | string,
  fallbackOrLang?: string | SupportedLang
): string {
  let lang: SupportedLang = 'az';
  let fallback: string = '';

  if (langOrFallback === 'az' || langOrFallback === 'en' || langOrFallback === 'ru') {
    lang = langOrFallback as SupportedLang;
    fallback = (fallbackOrLang as string) || '';
  } else {
    fallback = (langOrFallback as string) || '';
    if (fallbackOrLang === 'az' || fallbackOrLang === 'en' || fallbackOrLang === 'ru') {
      lang = fallbackOrLang as SupportedLang;
    }
  }

  if (!localized) return fallback;

  const val = localized[lang];
  if (val && val.trim().length > 0) return val;
  return localized.az || localized.en || localized.ru || fallback;
}

