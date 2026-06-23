import { cookies } from "next/headers";
import type { Locale } from "./i18n-core";

/** Read the active locale from the cookie in Server Components / metadata. */
export function getServerLocale(): Locale {
  return cookies().get("locale")?.value === "en" ? "en" : "ar";
}
