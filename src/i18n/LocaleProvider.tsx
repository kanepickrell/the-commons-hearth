import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Bilingual, Locale } from '@/lib/types';

type LocaleCtx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (b: Bilingual) => string;
};

const Ctx = createContext<LocaleCtx | null>(null);

const STORAGE_KEY = 'clm-ctx-locale';

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>('en');

  // Load remembered preference once.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'es') setLocaleState(saved);
    } catch {
      /* ignore — SSR / private mode */
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
      document.documentElement.lang = l;
    } catch {
      /* ignore */
    }
  }, []);

  // Keep <html lang> in sync for accessibility / SEO.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LocaleCtx>(
    () => ({
      locale,
      setLocale,
      t: (b) => b[locale],
    }),
    [locale, setLocale]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useLocale = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>');
  return ctx;
};
