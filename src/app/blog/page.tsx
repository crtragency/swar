import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import BlogGrid from "@/components/blog/BlogGrid";
import { HERO_SUNSET } from "@/components/home/images";

export const metadata: Metadata = {
  title: "المدونة",
  description: "مقالات ونصائح ملهمة من عالم السياحة البحرية الفاخرة في ثول والبحر الأحمر مع سوار البحرية.",
};

export default function BlogPage() {
  return (
    <main>
      <PageHero
        eyebrow="مدونة سوار"
        title="المدونة"
        subtitle="مقالات ونصائح ملهمة من عالم السياحة البحرية الفاخرة."
        image={HERO_SUNSET}
      />
      <BlogGrid />
    </main>
  );
}
