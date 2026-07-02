import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import BlogGrid from "@/components/blog/BlogGrid";
import { HERO_SUNSET } from "@/components/home/images";
import { tt } from "@/lib/i18n-core";
import { getServerLocale } from "@/lib/locale-server";
import { getAllPosts } from "@/lib/content-server";

export const metadata: Metadata = {
  alternates: { canonical: "/blog" },
  title: "المدونة",
  description: "مقالات ونصائح ملهمة من عالم السياحة البحرية الفاخرة في ثول والبحر الأحمر مع سوار البحرية.",
};

export default async function BlogPage() {
  const locale = getServerLocale();
  const posts = await getAllPosts();
  return (
    <main>
      <PageHero
        eyebrow={tt(locale, "blog.eyebrow")}
        title={tt(locale, "blog.title")}
        subtitle={tt(locale, "blog.desc")}
        image={HERO_SUNSET}
      />
      <BlogGrid posts={posts} />
    </main>
  );
}
