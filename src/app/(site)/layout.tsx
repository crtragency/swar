import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import ScrollEffects from "@/components/ScrollEffects";
import { SITE_URL } from "@/lib/site";
import { SettingsProvider } from "@/lib/settings";
import { getSiteSettings } from "@/lib/content-server";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const businessLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: settings.brand,
    alternateName: settings.brandEn,
    description:
      "رحلات بحرية فاخرة وتأجير يخوت في ثول على ساحل البحر الأحمر: سباحة، صيد، مشاهدة دلافين، وحفلات خاصة.",
    url: SITE_URL,
    telephone: settings.phone,
    email: settings.email,
    areaServed: "ثول، المملكة العربية السعودية",
    address: {
      "@type": "PostalAddress",
      addressLocality: "ثول",
      addressRegion: "مكة المكرمة",
      addressCountry: "SA",
    },
    geo: { "@type": "GeoCoordinates", latitude: 22.2831, longitude: 39.1035 },
    image: `${SITE_URL}/icon.webp`,
    sameAs: settings.socials.map((s) => s.href).filter(Boolean),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: String(Math.max(settings.reviews.length, 4)),
      bestRating: "5",
    },
    priceRange: "﷼﷼",
  };
  return (
    <SettingsProvider value={settings}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessLd) }} />
      <Navbar />
      {children}
      <Footer />
      <FloatingWhatsApp />
      <ScrollEffects />
    </SettingsProvider>
  );
}
