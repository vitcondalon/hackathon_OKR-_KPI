import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const LOCALE_KEY = 'okr_locale';
const SUPPORTED_LOCALES = ['vi', 'en'];

const LocaleContext = createContext(null);

function getInitialLocale() {
  if (typeof window === 'undefined') {
    return 'vi';
  }
  const saved = String(window.localStorage.getItem(LOCALE_KEY) || '').toLowerCase();
  if (SUPPORTED_LOCALES.includes(saved)) {
    return saved;
  }
  return 'vi';
}

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(getInitialLocale);

  useEffect(() => {
    document.documentElement.setAttribute('lang', locale);
    window.localStorage.setItem(LOCALE_KEY, locale);
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      isVietnamese: locale === 'vi',
      isEnglish: locale === 'en'
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used inside LocaleProvider');
  }
  return context;
}

