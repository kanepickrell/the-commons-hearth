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
  // Read the remembered preference synchronously so the first paint is
  // already in the right language (no 'en' flash for Spanish readers).
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'es') return saved;
    } catch {
      /* ignore — private mode / storage blocked */
    }
    return 'en';
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
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
