"use client";

import { createContext, useContext, useCallback } from "react";
import { type Locale, DEFAULT_LOCALE, dir, pick, STRINGS, tt } from "./i18n-core";

export { type Locale, DEFAULT_LOCALE, dir, pick, STRINGS, tt };

type Ctx = { locale: Locale; setLocale: (l: Locale) => void };
const LocaleCtx = createContext<Ctx>({ locale: DEFAULT_LOCALE, setLocale: () => {} });

export function LocaleProvider({ initial, children }: { initial: Locale; children: React.ReactNode }) {
  const setLocale = useCallback((l: Locale) => {
    document.cookie = `locale=${l}; path=/; max-age=31536000`;
    // reload so server components re-render with the new locale
    window.location.reload();
  }, []);
  return <LocaleCtx.Provider value={{ locale: initial, setLocale }}>{children}</LocaleCtx.Provider>;
}

export function useI18n() {
  const { locale, setLocale } = useContext(LocaleCtx);
  const t = useCallback((key: string) => STRINGS[key]?.[locale] ?? STRINGS[key]?.ar ?? key, [locale]);
  return { locale, setLocale, t, dir: dir(locale), toggle: () => setLocale(locale === "ar" ? "en" : "ar") };
}
