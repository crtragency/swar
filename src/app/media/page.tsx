import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import MediaGallery from "@/components/media/MediaGallery";
import { CABIN } from "@/components/home/images";

export const metadata: Metadata = {
  title: "الوسائط",
  description: "معرض صور سوار البحرية — لحظات من رحلاتنا البحرية الفاخرة في ثول والبحر الأحمر.",
};

export default function MediaPage() {
  return (
    <main>
      <PageHero
        eyebrow="الوسائط"
        title="معرض الصور"
        subtitle="لحظات حقيقية من رحلاتنا البحرية الفاخرة على متن يخوت سوار."
        image={CABIN}
      />
      <MediaGallery />
    </main>
  );
}
