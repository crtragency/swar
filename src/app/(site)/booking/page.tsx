import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import BookingPackages from "@/components/booking/BookingPackages";
import { FISHING } from "@/components/home/images";

export const metadata: Metadata = {
  title: "الحجوزات وأسعار الرحلات",
  description:
    "احجز رحلتك البحرية الفاخرة في ثول مع سوار البحرية. باقات السباحة والصيد والدلافين والحفلات والرحلات الملكية VIP بخصم 25% على جميع الرحلات.",
};

export default function BookingPage() {
  return (
    <main>
      <PageHero
        eyebrow="الحجوزات"
        title="أسعار وباقات رحلات سوار البحرية"
        subtitle="اختر باقتك المثالية واحجز تجربتك البحرية الفاخرة في ثول — خصم 25% على جميع الرحلات."
        image={FISHING}
      />
      <BookingPackages />
    </main>
  );
}
