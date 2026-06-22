import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { SITE_URL, CONTACT } from "@/lib/site";

const businessLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "سوار البحرية",
  alternateName: "Sewar Marine",
  description:
    "رحلات بحرية فاخرة وتأجير يخوت في ثول على ساحل البحر الأحمر: سباحة، صيد، مشاهدة دلافين، وحفلات خاصة.",
  url: SITE_URL,
  telephone: CONTACT.phone,
  email: CONTACT.email,
  areaServed: "ثول، المملكة العربية السعودية",
  address: {
    "@type": "PostalAddress",
    addressLocality: "ثول",
    addressRegion: "مكة المكرمة",
    addressCountry: "SA",
  },
  priceRange: "﷼﷼",
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessLd) }} />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
