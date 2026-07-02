import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import BookingPackages from "@/components/booking/BookingPackages";
import { FISHING } from "@/components/home/images";
import { tt } from "@/lib/i18n-core";
import { getServerLocale } from "@/lib/locale-server";
import { getPackagesMerged } from "@/lib/content-server";

export const metadata: Metadata = {
  title: "الحجوزات وأسعار الرحلات",
  description:
    "احجز رحلتك البحرية الفاخرة في ثول مع سوار البحرية. باقات السباحة والصيد والدلافين والحفلات والرحلات الملكية VIP.",
};

export default async function BookingPage() {
  const locale = getServerLocale();
  const packages = await getPackagesMerged();
  return (
    <main>
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
