export const DISCOUNT = {
  pct: 0,
  ar: "",
  en: "",
  subAr: "",
  subEn: "",
};

export const BANK = {
  bank: "مصرف الراجحي",
  name: "مؤسسة سوار البحر للتجارة",
  iban: "SA4180000993608016031469",
  // Direct payment link the customer is sent to for bank/online payment.
  // Set NEXT_PUBLIC_BANK_PAY_URL in the environment (e.g. an STC Pay / Sadad /
  // bank payment-request URL). When empty, the IBAN transfer details are shown.
  payUrl: process.env.NEXT_PUBLIC_BANK_PAY_URL || "",
};

export const YACHT_FEATURES =
  "يتسع لـ11 شخص · غرفة نوم خاصة · مطبخ تحضيري متكامل · دورة مياه · ماء حلو للغسيل والاستحمام";

export type Tier = { name: string; oldPrice: number; price: number; note: string; items: string[]; durationHours: number };
export type Row = { label: string; oldPrice?: number; price: number; note?: string; durationHours?: number };
// Optional add-on. `stepper` => quantity selectable up to `max`; otherwise a toggle.
export type Addon = { id: string; label: string; price: number; stepper?: boolean; max?: number };

export type Pkg = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  oldPrice: number;
  price: number;
  unit: string;
  capacity: string;
  featured?: boolean;
  accent: "turquoise" | "green" | "gold" | "pink" | "blue" | "purple";
  yacht: string;
  // calculator fields (prices below are the ORIGINAL pre-discount values; the
  // modal calculates the final total from the values below)
  baseDuration: string; // e.g. "4 ساعات"
  maxBase: number; // persons covered by the base price
  extraPerPerson: number; // cost per extra person above maxBase
  maxPersons: number; // capacity cap
  dayType?: number; // weekend surcharge (e.g. fishing +200)
  durationHours: number; // base trip duration (excluding buffer)
  rows?: Row[]; // selectable durations
  tiers?: Tier[]; // selectable party tiers
  addons?: Addon[]; // optional add-ons
  includes?: string[];
  note?: string;
};

export const PACKAGES: Pkg[] = [
  {
    id: "swim",
    emoji: "🛥️",
    title: "رحلة السباحة والاستجمام",
    subtitle: "جزيرة ثول الرملية · ميني يخت سوار البحر 31 قدم",
    oldPrice: 1181,
    price: 1181,
    unit: "ريال / رحلة",
    capacity: "6 أشخاص · 4 ساعات",
    accent: "turquoise",
    baseDuration: "4 ساعات",
    maxBase: 6,
    extraPerPerson: 131,
    maxPersons: 11,
    dayType: 263,
    durationHours: 4,
    yacht: YACHT_FEATURES,
    rows: [
      { label: "السعر الأساسي — 4 ساعات + مشروبات · لـ 6 أشخاص + أدوات سلامة", oldPrice: 1181, price: 1181, durationHours: 4 },
    ],
    addons: [
      { id: "extra_hour", label: "⏱️ ساعة إضافية", price: 131, stepper: true, max: 4 },
      { id: "snacks", label: "🍉 سناك وفواكه", price: 329 },
      { id: "fishing", label: "🎣 صيد + عدة صيد + طُعم", price: 329 },
      { id: "kayak", label: "🛶 كاياك + سرير تشميس شخصين وعوامة تشميس تتسع لـ 6 أشخاص", price: 374 },
      { id: "photo", label: "📸 تصوير احترافي", price: 656 },
    ],
    includes: ["🥤 مشروبات غازية وعصيرات مشكلة", "🥨 سناكات"],
  },
  {
    id: "fish",
    emoji: "🎣",
    title: "رحلات صيد الأسماك",
    subtitle: "تجربة صيد احترافية · حتى 6 أشخاص",
    oldPrice: 1379,
    price: 1379,
    unit: "ريال / رحلة",
    capacity: "لـ 6 أشخاص",
    accent: "green",
    baseDuration: "6 ساعات",
    maxBase: 6,
    extraPerPerson: 131,
    maxPersons: 11,
    dayType: 263,
    durationHours: 6,
    yacht: YACHT_FEATURES,
    rows: [
      { label: "🕕 6 ساعات — حتى 6 أشخاص", oldPrice: 1379, price: 1379, durationHours: 6 },
      { label: "🕗 8 ساعات — حتى 6 أشخاص", oldPrice: 1575, price: 1575, durationHours: 8 },
      { label: "🕙 10 ساعات — حتى 6 أشخاص", oldPrice: 1870, price: 1870, durationHours: 10 },
      { label: "🌅 12 ساعة — حتى 6 أشخاص", oldPrice: 2166, price: 2166, durationHours: 12 },
    ],
    addons: [
      { id: "gear_rent", label: "🎣 عدة صيد + طُعم (استئجار من عندنا)", price: 329 },
      { id: "extra_hour", label: "⏱️ ساعة إضافية", price: 263, stepper: true },
    ],
    includes: ["❄️ مياه شرب وثلج", "🥤 مشروبات غازية وعصيرات مشكلة", "🥨 سناكات"],
    note: "نوفر مياه الشرب والثلج والمشروبات الغازية والعصيرات المشكلة والسناكات ضمن جميع الباقات. عدة الصيد والطُعم إضافة اختيارية — أحضر عدتك الخاصة مجاناً، أو استأجرها منا بمقابل +329 ريال.",
  },
  {
    id: "hour",
    emoji: "🕐",
    title: "رحلات بالساعة",
    subtitle: "جولة بحرية مرنة · من المرسى مباشرةً",
    oldPrice: 374,
    price: 374,
    unit: "ريال",
    capacity: "لـ 6 أشخاص",
    accent: "gold",
    baseDuration: "حسب الاختيار",
    maxBase: 6,
    extraPerPerson: 63,
    maxPersons: 11,
    dayType: 124,
    durationHours: 1,
    yacht: YACHT_FEATURES,
    rows: [
      { label: "🕧 نصف ساعة — حتى 6 أشخاص", oldPrice: 249, price: 249, durationHours: 0.5 },
      { label: "🕐 ساعة كاملة — حتى 6 أشخاص", oldPrice: 374, price: 374, durationHours: 1 },
      { label: "🕑 ساعتان — حتى 6 أشخاص", oldPrice: 749, price: 749, durationHours: 2 },
    ],
    includes: ["🌊 جولة البحر المفتوح", "❄️ مياه شرب وثلج", "🥤 مشروبات غازية وعصيرات مشكلة", "🥨 سناكات", "🛟 أدوات السلامة كاملة"],
  },
  {
    id: "party",
    emoji: "🎉",
    title: "تنظيم الحفلات البحرية الخاصة",
    subtitle: "اجعل مناسبتك لا تُنسى فوق أمواج البحر الأحمر",
    oldPrice: 591,
    price: 591,
    unit: "ريال",
    capacity: "لـ 6 أشخاص",
    accent: "pink",
    baseDuration: "حسب الباقة",
    maxBase: 6,
    extraPerPerson: 131,
    maxPersons: 10,
    dayType: 263,
    durationHours: 1,
    yacht: YACHT_FEATURES,
    tiers: [
      {
        name: "🥉 البرونزية",
        oldPrice: 591,
        price: 591,
        note: "لـ 6 أشخاص",
        durationHours: 1,
        items: ["تجهيز القارب بالزينة", "جولة بحرية · ساعة"],
      },
      {
        name: "🥈 الفضية",
        oldPrice: 985,
        price: 985,
        note: "لـ 6 أشخاص",
        durationHours: 1.5,
        items: ["تجهيز القارب بالزينة", "جولة · ساعة ونصف", "كيكة 🎂", "باقة ورود 💐", "مشروبات"],
      },
      {
        name: "🥇 الذهبية",
        oldPrice: 1476,
        price: 1476,
        note: "لـ 6 أشخاص",
        durationHours: 2,
        items: ["تجهيز القارب بالزينة", "جولة · ساعتان", "كيكة 🎂", "باقة ورود 💐", "مشروبات", "عشاء لشخصين 🍽️"],
      },
    ],
    includes: ["🚤 قارب مجهز VIP", "🎵 مسجل وسماعات DJ", "🛋️ جلسات مريحة", "🥤 مشروبات غازية وعصيرات مشكلة", "🥨 سناكات", "🔒 خصوصية تامة"],
  },
  {
    id: "dolphin",
    emoji: "🐬",
    title: "رحلة مشاهدة الدلافين",
    subtitle: "تجربة لا تُنسى · شاهد الدلافين في البحر الأحمر · 3 ساعات صباحية",
    oldPrice: 1121,
    price: 1121,
    unit: "ريال / رحلة",
    capacity: "لـ 6 أشخاص",
    accent: "blue",
    baseDuration: "3 ساعات",
    maxBase: 6,
    extraPerPerson: 66,
    maxPersons: 10,
    dayType: 263,
    durationHours: 3,
    yacht: "يتسع لـ10 أشخاص · غرفة نوم خاصة · مطبخ تحضيري متكامل · دورة مياه · ماء حلو للغسيل والاستحمام",
    rows: [
      { label: "🌅 الرحلة الصباحية — 9:00 ص حتى 12:00 م", oldPrice: 1121, price: 1121, note: "حتى 6 أشخاص", durationHours: 3 },
    ],
    includes: [
      "🐬 مشاهدة الدلافين",
      "🕐 4 ساعات كاملة",
      "❄️ مياه شرب وثلج",
      "🥤 مشروبات غازية وعصيرات مشكلة",
      "🥨 سناكات",
      "🛟 أدوات السلامة كاملة",
      "📍 مرشد بحري متخصص",
    ],
  },
  {
    id: "vip",
    emoji: "👑",
    title: "رحلة الصيد الملكية — الباقة الشاملة VIP",
    subtitle: "صيد احترافي + طبخ مباشر + ضيافة فاخرة · 8 ساعات · بحر ثول",
    oldPrice: 3741,
    price: 3741,
    unit: "ريال",
    capacity: "لـ 6 أشخاص · 8 ساعات",
    featured: true,
    accent: "purple",
    baseDuration: "8 ساعات",
    maxBase: 6,
    extraPerPerson: 131,
    maxPersons: 11,
    dayType: 263,
    durationHours: 8,
    yacht: YACHT_FEATURES,
    includes: [
      "🕗 8 ساعات كاملة",
      "🎣 عدة الصيد كاملة",
      "🐟 طُعم للصيد",
      "📦 حافظة للسمك",
      "🍳 طبخ الصيد مباشرةً",
      "❄️ مياه شرب وثلج",
      "🥤 مشروبات غازية وعصيرات مشكلة",
      "🥨 سناكات",
      "☕ شاهي وقهوة فاخرة",
      "🛟 أدوات السلامة كاملة",
    ],
    note: "استمتع بتجربة بحرية فاخرة تجمع بين الصيد الاحترافي وتجربة الطهي المباشر في قلب بحر ثول. نأخذك إلى أفضل مواقع الصيد، ثم نحوّل صيدك إلى وجبة بحرية طازجة تُحضَّر أمامك. الشخص الإضافي (فوق 6): +131 ريال.",
  },
];

// English display strings for packages (keeps the Arabic source intact).
import type { Locale } from "./i18n-core";

type PkgI18nFields = {
  title: string;
  subtitle: string;
  unit: string;
  capacity: string;
  baseDuration: string;
};

export const PKG_I18N: Record<string, PkgI18nFields> = {
  swim: { title: "Swimming & Relaxation Trip", subtitle: "Thoul Sandy Island · Sewar Al-Bahr mini-yacht 31ft", unit: "SAR / trip", capacity: "5 persons · 4 hours", baseDuration: "4 hours" },
  fish: { title: "Fishing Trips", subtitle: "Professional fishing experience · up to 5 persons", unit: "SAR / trip", capacity: "for 5 persons", baseDuration: "6 hours" },
  hour: { title: "Hourly Trips", subtitle: "Flexible cruise · straight from the marina", unit: "SAR", capacity: "for 5 persons", baseDuration: "as chosen" },
  party: { title: "Private Sea Parties", subtitle: "Make your occasion unforgettable on the Red Sea waves", unit: "SAR", capacity: "for 5 persons", baseDuration: "by package" },
  dolphin: { title: "Dolphin Watching Trip", subtitle: "An unforgettable experience · watch dolphins in the Red Sea · 4 hours", unit: "SAR / trip", capacity: "for 5 persons", baseDuration: "4 hours" },
  vip: { title: "Royal Fishing Experience — VIP All-Inclusive", subtitle: "Pro fishing + live cooking + luxury hospitality · 8 hours · Thoul sea", unit: "SAR", capacity: "for 5 persons · 8 hours", baseDuration: "8 hours" },
};

export function pkgText(locale: Locale, pkg: Pkg, field: keyof PkgI18nFields): string {
  if (locale === "en") return PKG_I18N[pkg.id]?.[field] ?? (pkg[field] as string);
  return pkg[field] as string;
}

// Derive trip duration (hours) from packageId + selected option label.
// Used by the availability system to compute blocked time ranges.
export function deriveDuration(packageId: string, option: string): number {
  const pkg = PACKAGES.find((p) => p.id === packageId);
  if (!pkg) return 4;
  if (pkg.rows?.length) {
    const row = pkg.rows.find((r) => r.label === option);
    if (row?.durationHours != null) return row.durationHours;
  }
  if (pkg.tiers?.length) {
    const tier = pkg.tiers.find((t) => t.name === option);
    if (tier?.durationHours != null) return tier.durationHours;
  }
  return pkg.durationHours;
}
