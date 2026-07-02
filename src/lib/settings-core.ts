// Server-safe site settings (no "use client") so both server components and
// the content store can import the type + defaults. Editable from the
// Developer Studio "Site Settings" tab and applied live across the site.
import { CONTACT, SOCIALS } from "./site";
import { DISCOUNT, BANK } from "./packages";
import { tt } from "./i18n-core";

export type SocialLink = { key: string; label: string; href: string };
export type HeroContent = {
  badgeAr: string; badgeEn: string;
  titleAr: string; titleEn: string;
  subtitleAr: string; subtitleEn: string;
};
export type Stat = { value: number; suffix: string; labelAr: string; labelEn: string };
export type ReviewItem = { name: string; rating: number; text: string; when: string };

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
  hero: HeroContent;
  stats: Stat[];
  reviewsMode: "auto" | "manual";
  reviews: ReviewItem[];
  heroImages: string[]; // image URLs; empty = use the built-in photos
  galleryImages: string[]; // image URLs; empty = use the built-in photos
  partners: string[]; // partner logo URLs; empty = hide the section
};

const DEFAULT_HERO: HeroContent = {
  badgeAr: tt("ar", "hero.badge"), badgeEn: tt("en", "hero.badge"),
  titleAr: tt("ar", "hero.title"), titleEn: tt("en", "hero.title"),
  subtitleAr: tt("ar", "hero.subtitle"), subtitleEn: tt("en", "hero.subtitle"),
};
const DEFAULT_STATS: Stat[] = [
  { value: 12, suffix: "", labelAr: tt("ar", "stats.years"), labelEn: tt("en", "stats.years") },
  { value: 97, suffix: "%", labelAr: tt("ar", "stats.satisfaction"), labelEn: tt("en", "stats.satisfaction") },
  { value: 8, suffix: "k", labelAr: tt("ar", "stats.trips"), labelEn: tt("en", "stats.trips") },
  { value: 19, suffix: "k", labelAr: tt("ar", "stats.travelers"), labelEn: tt("en", "stats.travelers") },
];
const DEFAULT_REVIEWS: ReviewItem[] = [
  { name: "عبدالله الحربي", rating: 5, when: "", text: "تجربة بحرية فاخرة بكل ما تحمله الكلمة من معنى. الخدمة كانت راقية والطاقم محترف، وقضينا يوماً لا يُنسى على متن اليخت." },
  { name: "نورة القحطاني", rating: 5, when: "", text: "أجمل رحلة بحرية خضتها في ثول. التنظيم رائع والمناظر خلابة، بالتأكيد سأكرر التجربة مع سوار مرة أخرى." },
  { name: "فهد العتيبي", rating: 5, when: "", text: "اخترنا باقة العائلة وكانت مثالية للأطفال والكبار. اهتمام بأدق التفاصيل وأمان عالٍ. شكراً لفريق سوار على هذه المتعة." },
  { name: "سارة الدوسري", rating: 5, when: "", text: "احتفلنا بمناسبة خاصة على متن اليخت، والأجواء كانت ساحرة. ضيافة فاخرة وخدمة استثنائية تستحق كل تقدير." },
];

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
  hero: DEFAULT_HERO,
  stats: DEFAULT_STATS,
  reviewsMode: "auto",
  reviews: DEFAULT_REVIEWS,
  heroImages: [],
  galleryImages: [],
  partners: [
    "/partners/partner-1.jpg",
    "/partners/partner-2.jpg",
    "/partners/partner-3.png",
    "/partners/partner-4.png",
  ],
};

export function mergeSettings(partial?: Partial<SiteSettings> | null): SiteSettings {
  if (!partial) return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...partial,
    // قيم الخصم دايمًا من الكود مش من قاعدة البيانات
    discountPct: DEFAULT_SETTINGS.discountPct,
    discountAr: DEFAULT_SETTINGS.discountAr,
    discountEn: DEFAULT_SETTINGS.discountEn,
    // إيميل التواصل ثابت من الكود ولا يُتجاوز بأي قيمة قديمة محفوظة
    email: DEFAULT_SETTINGS.email,
    socials: partial.socials && partial.socials.length ? partial.socials : DEFAULT_SETTINGS.socials,
    hero: { ...DEFAULT_HERO, ...(partial.hero ?? {}) },
    stats: partial.stats && partial.stats.length ? partial.stats : DEFAULT_SETTINGS.stats,
    reviews: partial.reviews && partial.reviews.length ? partial.reviews : DEFAULT_SETTINGS.reviews,
    heroImages: partial.heroImages ?? [],
    galleryImages: partial.galleryImages ?? [],
    partners: partial.partners ?? DEFAULT_SETTINGS.partners,
  };
}

export const phoneHref = (phone: string) => `tel:${phone.replace(/\s+/g, "")}`;
export const waLinkFrom = (whatsapp: string, text = "مرحباً سوار البحرية 🌊، أود الاستفسار عن الحجز") =>
  `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
