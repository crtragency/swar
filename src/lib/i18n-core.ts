// Server-safe i18n helpers (no "use client"), importable from both
// Server and Client Components.

export type Locale = "ar" | "en";
export const DEFAULT_LOCALE: Locale = "ar";
export const dir = (l: Locale) => (l === "ar" ? "rtl" : "ltr");

/** Pick the right side of a bilingual value. */
export function pick<T>(locale: Locale, ar: T, en: T): T {
  return locale === "en" ? en : ar;
}
