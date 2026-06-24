"use client";

import { createContext, useContext } from "react";
import { DEFAULT_SETTINGS, type SiteSettings, phoneHref, waLinkFrom } from "./settings-core";

const SettingsContext = createContext<SiteSettings>(DEFAULT_SETTINGS);

export function SettingsProvider({ value, children }: { value: SiteSettings; children: React.ReactNode }) {
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}

export { phoneHref, waLinkFrom };
export type { SiteSettings };
