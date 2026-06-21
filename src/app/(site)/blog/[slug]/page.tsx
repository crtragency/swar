import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BLOG_POSTS, getPost } from "@/lib/blog";
import { ALL_PHOTOS } from "@/components/home/images";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug);
  if (!post) return { title: "مقال غير موجود" };
  return { title: post.title, description: post.excerpt };
}

export default function BlogArticle({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();
  const idx = BLOG_POSTS.findIndex((p) => p.slug === post.slug);
  const image = ALL_PHOTOS[(idx * 5 + 12) % ALL_PHOTOS.length];

  return (
    <main>
      <article>
        {/* Hero */}
        <div className="relative flex h-[60vh] min-h-[440px] items-end overflow-hidden bg-navy-950">
          <Image src={image} alt={post.title} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/50 to-navy-950/40" />
          <div className="container-px relative z-10 pb-12">
            <span className="rounded-full bg-gold-400 px-4 py-1.5 text-xs font-bold text-navy-950">{post.category}</span>
            <h1 className="mt-4 max-w-3xl font-cairo text-3xl font-extrabold leading-tight text-white text-balance drop-shadow sm:text-5xl">{post.title}</h1>
            <time className="mt-3 block text-white/70">{post.date}</time>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white py-16 sm:py-24">
          <div className="container-px mx-auto max-w-3xl">
            <p className="text-xl font-semibold leading-relaxed text-navy-900">{post.excerpt}</p>
            <div className="mt-8 space-y-6 text-lg leading-loose text-navy-900/75">
              {post.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-navy-50/60 p-7">
              <p className="text-lg font-bold text-navy-900">جاهز لخوض التجربة بنفسك؟</p>
              <Link href="/booking" className="btn-ocean text-sm">احجز رحلتك الآن</Link>
            </div>

            <Link href="/blog" className="mt-10 inline-flex items-center gap-2 font-bold text-ocean-600 hover:text-turquoise-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              العودة إلى جميع المقالات
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
