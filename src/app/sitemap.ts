import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/about", "/booking", "/blog", "/contact", "/media"].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  const posts = BLOG_POSTS.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.isoDate),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [...pages, ...posts];
}
