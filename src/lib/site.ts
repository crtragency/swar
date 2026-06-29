export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://swar-wine.vercel.app";

export const NAV = [
  { key: "nav.home", href: "/" },
  { key: "nav.about", href: "/about" },
  { key: "nav.booking", href: "/booking" },
  { key: "nav.blog", href: "/blog" },
  { key: "nav.contact", href: "/contact" },
  { key: "nav.media", href: "/media" },
];

export const CONTACT = {
  brand: "سوار البحرية",
  brandEn: "Sewar Marine",
  tagline: "رحلات بحرية فاخرة · ثول · البحر الأحمر",
  location: "ثول · المملكة العربية السعودية · البحر الأحمر",
  phone: "+966 50 004 5946",
  phoneHref: "tel:+966500045946",
  email: "sewarmarine@gmail.com",
  whatsapp: "966500045946",
};

export type SocialKey = "whatsapp" | "instagram" | "snapchat" | "tiktok" | "telegram" | "facebook" | "youtube";

export const SOCIALS: { key: SocialKey; label: string; href: string }[] = [
  { key: "whatsapp", label: "واتساب", href: "https://wa.me/966500045946" },
  { key: "instagram", label: "انستغرام", href: "https://www.instagram.com/sewarmarine/" },
  { key: "snapchat", label: "سناب شات", href: "https://www.snapchat.com/add/sewarmarine" },
  { key: "tiktok", label: "تيك توك", href: "https://www.tiktok.com/@sewarmarine" },
  { key: "telegram", label: "تيليجرام", href: "https://t.me/sewarmarine" },
  { key: "facebook", label: "فيسبوك", href: "https://www.facebook.com/sewarmarine" },
  { key: "youtube", label: "يوتيوب", href: "https://www.youtube.com/channel/UChaJgm8jFYUNGrtm7L2jP3Q" },
];

export function waLink(text = "مرحباً سوار البحرية 🌊، أود الاستفسار عن الحجز") {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
}

export const BOOK_CTA = "احجز الآن";

// Google Business listing (for the "read all reviews on Google" link).
export const GOOGLE_REVIEWS_URL =
  "https://www.google.com/maps/place/%D8%B1%D8%AD%D9%84%D8%A7%D8%AA+%D8%B3%D9%88%D8%A7%D8%B1+%D8%A7%D9%84%D8%A8%D8%AD%D8%B1%D9%8A%D8%A9%D8%8C+%D8%AF%D8%B1%D8%A9+%D8%A7%D9%84%D8%B9%D8%B1%D9%88%D8%B3+23851/data=!4m2!3m1!1s0x15c143af681ee96d:0xeb53eed4ef4c1fd?utm_source=mstt_1&entry=gps";
