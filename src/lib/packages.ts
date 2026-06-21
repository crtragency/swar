// Package data extracted from the Sewar booking system (data only).
// Prices reflect the active 25% summer-season discount.

export const DISCOUNT = {
  pct: 25,
  ar: "خصم 25% على جميع الرحلات بمناسبة بداية موسم الصيف",
  en: "25% Off All Trips — Summer Season Special",
  subAr: "العرض ساري لفترة محدودة — احجز الآن!",
  subEn: "Limited time offer — book now!",
};

export const BANK = {
  bank: "مصرف الراجحي",
  name: "مؤسسة سوار البحر للتجارة",
  iban: "SA4180000993608016031469",
};

export const YACHT_FEATURES =
  "يتسع لـ11 شخص · غرفة نوم خاصة · مطبخ تحضيري متكامل · دورة مياه · ماء حلو للغسيل والاستحمام";

export type Tier = { name: string; oldPrice: number; price: number; note: string; items: string[] };
export type Row = { label: string; oldPrice?: number; price: number; note?: string };

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
  // calculator fields
  maxBase: number; // persons covered by the base price
  extraPerPerson: number; // cost per extra person above maxBase
  maxPersons: number; // capacity cap
  rows?: Row[]; // selectable durations (price = base)
  tiers?: Tier[]; // selectable party tiers (price = base)
  addons?: Row[]; // optional add-ons
  includes?: string[];
  note?: string;
};

export const PACKAGES: Pkg[] = [
  {
    id: "swim",
    emoji: "🛥️",
    title: "رحلة السباحة والاستجمام",
    subtitle: "جزيرة ثول الرملية · ميني يخت سوار البحر 31 قدم",
    oldPrice: 1200,
    price: 900,
    unit: "ريال / رحلة",
    capacity: "5 أشخاص · 4 ساعات",
    accent: "turquoise",
    maxBase: 5,
    extraPerPerson: 100,
    maxPersons: 11,
    yacht: YACHT_FEATURES,
    rows: [
      { label: "السعر الأساسي — 4 ساعات + مشروبات · لـ 5 أشخاص + أدوات سلامة", oldPrice: 1200, price: 900 },
    ],
    addons: [
      { label: "⏱️ ساعة إضافية", price: 100 },
      { label: "🍉 سناك وفواكه", price: 250 },
      { label: "🎣 صيد + عدة صيد + طُعم", price: 250 },
      { label: "🛶 كاياك", price: 150 },
      { label: "📸 تصوير احترافي", price: 500 },
      { label: "🌙 نهاية الأسبوع", price: 200 },
    ],
  },
  {
    id: "fish",
    emoji: "🎣",
    title: "رحلات صيد الأسماك",
    subtitle: "تجربة صيد احترافية · حتى 5 أشخاص",
    oldPrice: 1400,
    price: 1050,
    unit: "ريال / رحلة",
    capacity: "لـ 5 أشخاص",
    accent: "green",
    maxBase: 5,
    extraPerPerson: 100,
    maxPersons: 11,
    yacht: YACHT_FEATURES,
    rows: [
      { label: "🕕 6 ساعات — حتى 5 أشخاص", oldPrice: 1400, price: 1050 },
      { label: "🕗 8 ساعات — حتى 5 أشخاص", oldPrice: 1600, price: 1200 },
      { label: "🕙 10 ساعات — حتى 5 أشخاص", oldPrice: 1900, price: 1425 },
    ],
    addons: [
      { label: "🌙 نهاية الأسبوع", price: 200 },
      { label: "🎣 عدة صيد + طُعم (من عندنا)", price: 250 },
    ],
    includes: ["❄️ مياه شرب وثلج"],
    note: "نوفر مياه الشرب والثلج فقط ضمن جميع الباقات. عدة الصيد والطُعم وحافظة السمك والضيافة إضافات اختيارية — أحضر عدتك الخاصة مجاناً، أو استأجرها منا بمقابل +250 ريال.",
  },
  {
    id: "hour",
    emoji: "🕐",
    title: "رحلات بالساعة",
    subtitle: "جولة بحرية مرنة · من المرسى مباشرةً",
    oldPrice: 250,
    price: 188,
    unit: "ريال",
    capacity: "لـ 5 أشخاص",
    accent: "gold",
    maxBase: 5,
    extraPerPerson: 100,
    maxPersons: 11,
    yacht: YACHT_FEATURES,
    rows: [
      { label: "⏱️ نصف ساعة — حتى 5 أشخاص", oldPrice: 250, price: 188 },
      { label: "🕐 ساعة كاملة — حتى 5 أشخاص", oldPrice: 350, price: 263 },
      { label: "🕑 ساعتان — حتى 5 أشخاص", oldPrice: 600, price: 450 },
    ],
    includes: ["🌊 جولة البحر المفتوح", "❄️ مياه شرب وثلج", "🛟 أدوات السلامة كاملة"],
  },
  {
    id: "party",
    emoji: "🎉",
    title: "تنظيم الحفلات البحرية الخاصة",
    subtitle: "اجعل مناسبتك لا تُنسى فوق أمواج البحر الأحمر",
    oldPrice: 600,
    price: 450,
    unit: "ريال",
    capacity: "لـ 5 أشخاص",
    accent: "pink",
    maxBase: 5,
    extraPerPerson: 100,
    maxPersons: 10,
    yacht: YACHT_FEATURES,
    tiers: [
      {
        name: "🥉 البرونزية",
        oldPrice: 600,
        price: 450,
        note: "لـ 5 أشخاص",
        items: ["تجهيز القارب بالزينة", "جولة بحرية · ساعة"],
      },
      {
        name: "🥈 الفضية",
        oldPrice: 1000,
        price: 750,
        note: "لـ 5 أشخاص",
        items: ["تجهيز القارب بالزينة", "جولة · ساعة ونصف", "كيكة 🎂", "باقة ورود 💐", "مشروبات"],
      },
      {
        name: "🥇 الذهبية",
        oldPrice: 1500,
        price: 1125,
        note: "لـ 5 أشخاص",
        items: ["تجهيز القارب بالزينة", "جولة · ساعتان", "كيكة 🎂", "باقة ورود 💐", "مشروبات", "عشاء لشخصين 🍽️"],
      },
    ],
    includes: ["🚤 قارب مجهز VIP", "🎵 مسجل وسماعات DJ", "🛋️ جلسات مريحة", "🔒 خصوصية تامة"],
  },
  {
    id: "dolphin",
    emoji: "🐬",
    title: "رحلة مشاهدة الدلافين",
    subtitle: "تجربة لا تُنسى · شاهد الدلافين في البحر الأحمر · 4 ساعات",
    oldPrice: 900,
    price: 675,
    unit: "ريال / رحلة",
    capacity: "لـ 5 أشخاص",
    accent: "blue",
    maxBase: 5,
    extraPerPerson: 50,
    maxPersons: 10,
    yacht: "يتسع لـ10 أشخاص · غرفة نوم خاصة · مطبخ تحضيري متكامل · دورة مياه · ماء حلو للغسيل والاستحمام",
    rows: [
      { label: "🌅 الرحلة الصباحية — 6:00 ص حتى 10:00 ص", oldPrice: 900, price: 675, note: "حتى 5 أشخاص" },
      { label: "🌇 رحلة وقت الغروب — 2:00 م حتى 6:00 م", oldPrice: 900, price: 675, note: "حتى 5 أشخاص" },
    ],
    includes: [
      "🐬 مشاهدة الدلافين",
      "🕐 4 ساعات كاملة",
      "❄️ مياه شرب وثلج",
      "🍹 مشروبات متنوعة",
      "🛟 أدوات السلامة كاملة",
      "📍 مرشد بحري متخصص",
    ],
  },
  {
    id: "vip",
    emoji: "👑",
    title: "رحلة الصيد الملكية — الباقة الشاملة VIP",
    subtitle: "صيد احترافي + طبخ مباشر + ضيافة فاخرة · 8 ساعات · بحر ثول",
    oldPrice: 3800,
    price: 2850,
    unit: "ريال",
    capacity: "لـ 5 أشخاص · 8 ساعات",
    featured: true,
    accent: "purple",
    maxBase: 5,
    extraPerPerson: 100,
    maxPersons: 11,
    yacht: YACHT_FEATURES,
    includes: [
      "🕗 8 ساعات كاملة",
      "🎣 عدة الصيد كاملة",
      "🐟 طُعم للصيد",
      "📦 حافظة للسمك",
      "🍳 طبخ الصيد مباشرةً",
      "❄️ مياه شرب وثلج",
      "☕ شاهي وقهوة فاخرة",
      "🛟 أدوات السلامة كاملة",
    ],
    note: "استمتع بتجربة بحرية فاخرة تجمع بين الصيد الاحترافي وتجربة الطهي المباشر في قلب بحر ثول. نأخذك إلى أفضل مواقع الصيد، ثم نحوّل صيدك إلى وجبة بحرية طازجة تُحضَّر أمامك. الشخص الإضافي (فوق 5): +100 ريال.",
  },
];
