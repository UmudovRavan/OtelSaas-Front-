import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';

interface GuestLangPillProps {
  variant?: 'overlay' | 'surface';
}

export const GuestLangPill: React.FC<GuestLangPillProps> = ({ variant = 'overlay' }) => {
  const { currentLang, setLanguage } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Dil / Language / Язык"
      className={`inline-flex items-center h-9 px-2 ${
        variant === 'overlay'
          ? 'bg-black/40 border border-white/35 backdrop-blur-sm text-white'
          : 'bg-transparent border border-[var(--fs-border)] text-[var(--fs-text)]'
      }`}
    >
      {(['az', 'en', 'ru'] as const).map((lang, idx) => {
        const isActive = currentLang === lang;
        return (
          <span key={lang} className="inline-flex items-center">
            {idx > 0 && (
              <span
                className={`w-[1px] h-3 mx-1.5 ${
                  variant === 'overlay' ? 'bg-white/25' : 'bg-[var(--fs-border)]'
                }`}
                aria-hidden="true"
              />
            )}
            <button
              type="button"
              onClick={() => setLanguage(lang)}
              className={`px-0.5 py-0.5 text-[10px] font-bold tracking-[0.18em] uppercase transition-all ${
                variant === 'overlay'
                  ? isActive
                    ? 'text-white border-b border-white'
                    : 'text-white/60 hover:text-white border-b border-transparent'
                  : isActive
                  ? 'text-[var(--fs-text)] border-b border-[var(--fs-border-strong)]'
                  : 'text-[var(--fs-text-muted)] hover:text-[var(--fs-text)] border-b border-transparent'
              }`}
            >
              {lang}
            </button>
          </span>
        );
      })}
    </div>
  );
};
