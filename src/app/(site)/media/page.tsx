import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import MediaGallery from "@/components/media/MediaGallery";
import { CABIN } from "@/components/home/images";
import { tt } from "@/lib/i18n-core";
import { getServerLocale } from "@/lib/locale-server";

export const metadata: Metadata = {
  alternates: { canonical: "/media" },
  title: "الوسائط",
  description: "معرض صور سوار البحرية — لحظات من رحلاتنا البحرية الفاخرة في ثول والبحر الأحمر.",
};

export default function MediaPage() {
  const locale = getServerLocale();
  return (
    <main>
      <PageHero
        eyebrow={tt(locale, "media.eyebrow")}
        title={tt(locale, "media.title")}
        subtitle={tt(locale, "media.subtitle")}
        image={CABIN}
      />
      <MediaGallery />
    </main>
  );
}
