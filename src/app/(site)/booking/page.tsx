import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import BookingPackages from "@/components/booking/BookingPackages";
import { FISHING } from "@/components/home/images";
import { tt } from "@/lib/i18n-core";
import { getServerLocale } from "@/lib/locale-server";
import { getPackagesMerged } from "@/lib/content-server";

export const metadata: Metadata = {
  alternates: { canonical: "/booking" },
  title: "الحجوزات وأسعار الرحلات",
  description:
    "احجز رحلتك البحرية الفاخرة في ثول مع سوار البحرية. باقات السباحة والصيد والدلافين والحفلات والرحلات الملكية VIP.",
};

export default async function BookingPage() {
  const locale = getServerLocale();
  const packages = await getPackagesMerged();
  const offersLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "باقات رحلات سوار البحرية",
    itemListElement: packages.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: p.title,
        description: p.subtitle,
        offers: { "@type": "Offer", price: p.price, priceCurrency: "SAR" },
      },
    })),
  };
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offersLd) }} />
      <PageHero
        eyebrow={tt(locale, "booking.eyebrow")}
        title={tt(locale, "booking.title")}
        subtitle={tt(locale, "booking.subtitle")}
        image={FISHING}
      />
      <BookingPackages packages={packages} />
    </main>
  );
}
