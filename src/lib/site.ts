export const NAV = [
  { label: "الرئيسية", href: "/" },
  { label: "من نحن", href: "/about" },
  { label: "الحجوزات", href: "/booking" },
  { label: "المدونة", href: "/blog" },
  { label: "التواصل", href: "/contact" },
  { label: "الوسائط", href: "/media" },
];

export const CONTACT = {
  brand: "سوار البحرية",
  brandEn: "Sewar Marine",
  tagline: "رحلات بحرية فاخرة · ثول · البحر الأحمر",
  location: "ثول · المملكة العربية السعودية · البحر الأحمر",
  phone: "+966 50 000 0000",
  phoneHref: "tel:+966500000000",
  email: "info@sewar-marine.com",
  whatsapp: "966500000000",
};

export function waLink(text = "مرحباً سوار البحرية 🌊، أود الاستفسار عن الحجز") {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
}

export const BOOK_CTA = "احجز الآن";
