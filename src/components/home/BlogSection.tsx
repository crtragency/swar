"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal, SectionHeading } from "./ui";
import { HOME_IMAGES } from "./homeImages";
import { BLOG_POSTS } from "@/lib/blog";

const POSTS = BLOG_POSTS.slice(0, 3).map((p, i) => ({
  ...p,
  image: HOME_IMAGES.blog[i],
}));

export default function BlogSection() {
  return (
    <section id="blog" className="relative bg-navy-50/40 py-24 sm:py-32">
      <div className="container-px">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="مدونة سوار"
            title="المدونة"
            description="مقالات ونصائح ملهمة من عالم السياحة البحرية الفاخرة."
            align="start"
          />
          <Reveal>
            <Link
              href="/blog"
              className="hidden items-center gap-2 font-bold text-ocean-600 transition-colors hover:text-turquoise-500 sm:inline-flex"
            >
              جميع المقالات
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 12H5M11 6l-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {POSTS.map((post, i) => (
            <Reveal key={post.title} delay={i * 0.1}>
              <motion.article
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 240, damping: 20 }}
                className="group flex h-full flex-col overflow-hidden rounded-[28px] bg-white shadow-luxe"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                  />
                  <span className="absolute right-4 top-4 rounded-full bg-navy-950/70 px-4 py-1.5 text-xs font-bold text-gold-400 backdrop-blur-md">
                    {post.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <time className="text-sm font-medium text-navy-900/50">
                    {post.date}
                  </time>
                  <h3 className="mt-3 text-xl font-extrabold leading-snug text-navy-900 transition-colors group-hover:text-ocean-600">
                    {post.title}
                  </h3>
                  <p className="mt-3 flex-1 leading-relaxed text-navy-900/65">
                    {post.excerpt}
                  </p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-5 inline-flex items-center gap-2 font-bold text-turquoise-600 transition-all group-hover:gap-3"
                  >
                    اقرأ المقال
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M19 12H5M11 6l-6 6 6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
