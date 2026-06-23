"use client";

import { createContext, useContext, useCallback } from "react";
import { type Locale, DEFAULT_LOCALE, dir, pick } from "./i18n-core";

export { type Locale, DEFAULT_LOCALE, dir, pick };

// Central UI dictionary. Keys are dotted; values are { ar, en }.
export const STRINGS: Record<string, { ar: string; en: string }> = {
  "nav.home": { ar: "الرئيسية", en: "Home" },
  "nav.about": { ar: "من نحن", en: "About" },
  "nav.booking": { ar: "الحجوزات", en: "Booking" },
  "nav.blog": { ar: "المدونة", en: "Blog" },
  "nav.contact": { ar: "التواصل", en: "Contact" },
  "nav.media": { ar: "الوسائط", en: "Media" },
  "cta.book": { ar: "احجز الآن", en: "Book Now" },
  "cta.bookWa": { ar: "احجز عبر واتساب", en: "Book via WhatsApp" },
  "common.more": { ar: "المزيد", en: "Explore" },
  "common.viewAll": { ar: "عرض الكل", en: "View all" },
  "common.readMore": { ar: "اقرأ المزيد", en: "Read more" },

  "hero.badge": { ar: "سوار · رحلات بحرية فاخرة في ثول", en: "Sewar · Luxury sea trips in Thoul" },
  "hero.title": { ar: "عِش معنا متعة بحرية لا تُنسى", en: "Live an unforgettable sea adventure with us" },
  "hero.subtitle": { ar: "خُض تجربة بحرية لا مثيل لها", en: "Experience a sea journey like no other" },
  "hero.bookings": { ar: "الحجوزات", en: "Bookings" },

  "pricing.eyebrow": { ar: "باقات الحجز", en: "Booking Packages" },
  "pricing.title": { ar: "أسعار رحلات بحرية في ثول", en: "Sea trip prices in Thoul" },
  "pricing.desc": { ar: "اختر الباقة التي تناسبك واحجز تجربتك البحرية الفاخرة بأفضل الأسعار وأرقى الخدمات.", en: "Choose the package that suits you and book your luxury sea experience at the best prices." },
  "pricing.discount": { ar: "على جميع الرحلات بمناسبة بداية موسم الصيف", en: "on all trips for the start of the summer season" },
  "pricing.from": { ar: "يبدأ من", en: "From" },
  "pricing.save": { ar: "وفّر", en: "Save" },
  "pricing.viewAll": { ar: "عرض كل الباقات والتفاصيل", en: "View all packages and details" },

  "gallery.eyebrow": { ar: "معرض الصور", en: "Gallery" },
  "gallery.title": { ar: "أجمل لحظاتنا في البحر", en: "Our finest moments at sea" },
  "gallery.desc": { ar: "لمحات من رحلاتنا البحرية الفاخرة، حيث تتحول كل لحظة إلى ذكرى لا تُنسى.", en: "Glimpses of our luxury sea trips, where every moment becomes an unforgettable memory." },

  "stats.years": { ar: "سنة خبرة", en: "Years of experience" },
  "stats.satisfaction": { ar: "رضا العملاء", en: "Customer satisfaction" },
  "stats.trips": { ar: "رحلات مكتملة", en: "Completed trips" },
  "stats.travelers": { ar: "مسافرون سعداء", en: "Happy travelers" },

  "blog.eyebrow": { ar: "مدونة سوار", en: "Sewar Blog" },
  "blog.title": { ar: "المدونة", en: "Blog" },
  "blog.desc": { ar: "مقالات ونصائح ملهمة من عالم السياحة البحرية الفاخرة.", en: "Inspiring articles and tips from the world of luxury marine tourism." },
  "blog.all": { ar: "جميع المقالات", en: "All articles" },
  "blog.read": { ar: "اقرأ المقال", en: "Read article" },
  "blog.minRead": { ar: "دقائق قراءة", en: "min read" },
  "blog.faq": { ar: "أسئلة شائعة", en: "FAQ" },
  "blog.related": { ar: "اقرأ أيضاً وروابط مفيدة", en: "Read also & useful links" },
  "blog.refs": { ar: "مصادر خارجية", en: "External references" },
  "blog.backAll": { ar: "العودة إلى جميع المقالات", en: "Back to all articles" },
  "blog.ctaTitle": { ar: "جاهز لخوض التجربة بنفسك؟ احجز رحلتك البحرية في ثول الآن.", en: "Ready to live the experience? Book your sea trip in Thoul now." },

  "reviews.eyebrow": { ar: "آراء العملاء", en: "Reviews" },
  "reviews.title": { ar: "آراء العملاء", en: "Customer Reviews" },
  "reviews.desc": { ar: "ثقة عملائنا هي بوصلتنا نحو التميز. تقييمات حقيقية من عملائنا على خرائط Google.", en: "Our customers' trust is our compass. Real reviews from our customers on Google Maps." },
  "reviews.googleBadge": { ar: "تقييمات Google", en: "Google reviews" },
  "reviews.count": { ar: "تقييم", en: "reviews" },
  "reviews.readAll": { ar: "اقرأ كل التقييمات على Google", en: "Read all reviews on Google" },
  "reviews.customer": { ar: "عميل سوار البحرية", en: "Sewar Marine customer" },

  "footer.ctaTitle": { ar: "جاهز لتجربة بحرية لا تُنسى؟", en: "Ready for an unforgettable sea experience?" },
  "footer.ctaDesc": { ar: "احجز رحلتك الآن واستمتع بخصم 25% على جميع الرحلات بمناسبة بداية موسم الصيف.", en: "Book now and enjoy 25% off all trips for the start of the summer season." },
  "footer.brandDesc": { ar: "رحلات بحرية فاخرة في ثول على ساحل البحر الأحمر. عِش معنا متعة بحرية لا تُنسى وخُض تجربة بحرية لا مثيل لها.", en: "Luxury sea trips in Thoul on the Red Sea coast. Live an unforgettable sea adventure with us." },
  "footer.quickLinks": { ar: "روابط سريعة", en: "Quick links" },
  "footer.contactUs": { ar: "تواصل معنا", en: "Contact us" },
  "footer.location": { ar: "ثول · المملكة العربية السعودية · البحر الأحمر", en: "Thoul · Saudi Arabia · Red Sea" },
  "footer.rights": { ar: "جميع الحقوق محفوظة.", en: "All rights reserved." },
  "footer.privacy": { ar: "سياسة الخصوصية", en: "Privacy Policy" },
  "footer.terms": { ar: "الشروط والأحكام", en: "Terms & Conditions" },
};

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
