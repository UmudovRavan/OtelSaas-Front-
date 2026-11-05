import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLang } from '../utils/i18n';

interface LanguageContextType {
  selectedLang: SupportedLang;
  currentLang: SupportedLang;
  setLanguage: (lang: SupportedLang) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLang, setSelectedLang] = useState<SupportedLang>(() => {
    try {
      const saved = localStorage.getItem('qr_lang');
      if (saved === 'en' || saved === 'ru' || saved === 'az') return saved;
    } catch {
      // ignore
    }
    return 'az';
  });

  const setLanguage = (lang: SupportedLang) => {
    setSelectedLang(lang);
    try {
      localStorage.setItem('qr_lang', lang);
      document.documentElement.lang = lang;
      document.documentElement.setAttribute('data-lang', lang);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.lang = selectedLang;
    document.documentElement.setAttribute('data-lang', selectedLang);
  }, [selectedLang]);

  return (
    <LanguageContext.Provider value={{ selectedLang, currentLang: selectedLang, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

