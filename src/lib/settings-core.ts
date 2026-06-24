// Server-safe site settings (no "use client") so both server components and
// the content store can import the type + defaults. Editable from the
// Developer Studio "Site Settings" tab and applied live across the site.
import { CONTACT, SOCIALS } from "./site";
import { DISCOUNT, BANK } from "./packages";

export type SocialLink = { key: string; label: string; href: string };

export type SiteSettings = {
  brand: string;
  brandEn: string;
  location: string;
  phone: string;
  email: string;
  whatsapp: string; // digits only, e.g. 966500045946
  socials: SocialLink[];
  discountPct: number;
  discountAr: string;
  discountEn: string;
  bankName: string;
  accName: string;
  iban: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  brand: CONTACT.brand,
  brandEn: CONTACT.brandEn,
  location: CONTACT.location,
  phone: CONTACT.phone,
  email: CONTACT.email,
  whatsapp: CONTACT.whatsapp,
  socials: SOCIALS.map((s) => ({ key: s.key, label: s.label, href: s.href })),
  discountPct: DISCOUNT.pct,
  discountAr: DISCOUNT.ar,
  discountEn: DISCOUNT.en,
  bankName: BANK.bank,
  accName: BANK.name,
  iban: BANK.iban,
};

export function mergeSettings(partial?: Partial<SiteSettings> | null): SiteSettings {
  if (!partial) return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...partial,
    socials: partial.socials && partial.socials.length ? partial.socials : DEFAULT_SETTINGS.socials,
  };
}

export const phoneHref = (phone: string) => `tel:${phone.replace(/\s+/g, "")}`;
export const waLinkFrom = (whatsapp: string, text = "مرحباً سوار البحرية 🌊، أود الاستفسار عن الحجز") =>
  `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
