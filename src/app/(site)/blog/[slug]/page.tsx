import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BLOG_POSTS, getPost } from "@/lib/blog";
import { ALL_PHOTOS } from "@/components/home/images";
import { SITE_URL as SITE } from "@/lib/site";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug);
  if (!post) return { title: "مقال غير موجود" };
  const url = `${SITE}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    keywords: [post.keyphrase, "سوار البحرية", "ثول", "البحر الأحمر", "رحلات بحرية"],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url,
      publishedTime: post.isoDate,
      locale: "ar_SA",
    },
  };
}

export default function BlogArticle({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();
  const idx = BLOG_POSTS.findIndex((p) => p.slug === post.slug);
  const image = ALL_PHOTOS[(idx * 5 + 12) % ALL_PHOTOS.length];
  const url = `${SITE}/blog/${post.slug}`;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    inLanguage: "ar",
    datePublished: post.isoDate,
    dateModified: post.isoDate,
    keywords: post.keyphrase,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: "سوار البحرية" },
    publisher: { "@type": "Organization", name: "سوار البحرية" },
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <article>
        {/* Hero */}
        <div className="relative flex h-[60vh] min-h-[440px] items-end overflow-hidden bg-navy-950">
          <Image src={image} alt={post.coverAlt} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/50 to-navy-950/40" />
          <div className="container-px relative z-10 pb-12">
            <span className="rounded-full bg-gold-400 px-4 py-1.5 text-xs font-bold text-navy-950">{post.category}</span>
            <h1 className="mt-4 max-w-3xl font-cairo text-3xl font-extrabold leading-tight text-white text-balance drop-shadow sm:text-5xl">{post.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/75">
              <time dateTime={post.isoDate}>{post.date}</time>
              <span>• {post.readMinutes} دقائق قراءة</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white py-16 sm:py-24">
          <div className="container-px mx-auto max-w-3xl">
            <p className="text-xl font-semibold leading-relaxed text-navy-900">{post.intro}</p>

            {post.sections.map((sec) => (
              <section key={sec.heading} className="mt-10">
                <h2 className="text-2xl font-extrabold text-navy-900 sm:text-3xl">{sec.heading}</h2>
                <div className="mt-4 space-y-4 text-lg leading-loose text-navy-900/75">
                  {sec.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                {sec.list && (
                  <ul className="mt-4 space-y-2">
                    {sec.list.map((li) => (
                      <li key={li} className="flex gap-3 text-lg leading-relaxed text-navy-900/80">
                        <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-turquoise-500" />
                        {li}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {/* FAQ */}
            <section className="mt-12">
              <h2 className="text-2xl font-extrabold text-navy-900 sm:text-3xl">أسئلة شائعة</h2>
              <div className="mt-5 space-y-4">
                {post.faq.map((f) => (
                  <details key={f.q} className="group rounded-2xl border border-navy-50 bg-navy-50/40 p-5">
                    <summary className="cursor-pointer list-none text-lg font-bold text-navy-900">{f.q}</summary>
                    <p className="mt-3 leading-loose text-navy-900/75">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>

            {/* Internal links */}
            <section className="mt-12 rounded-[24px] bg-navy-50/60 p-7">
              <h2 className="text-xl font-extrabold text-navy-900">اقرأ أيضاً وروابط مفيدة</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {post.related.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="inline-flex items-center gap-2 font-bold text-ocean-600 hover:text-turquoise-500">
                      <span className="text-turquoise-500">←</span> {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* Outbound references */}
            <section className="mt-8">
              <h2 className="text-lg font-bold text-navy-900">مصادر خارجية</h2>
              <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {post.references.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-ocean-600 underline hover:text-turquoise-500">
                      {l.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            {/* CTA */}
            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-gradient-to-l from-ocean-600 to-turquoise-500 p-7 text-white">
              <p className="text-lg font-bold">جاهز لخوض التجربة بنفسك؟ احجز رحلتك البحرية في ثول الآن.</p>
              <Link href="/booking" className="btn-gold text-sm">احجز الآن</Link>
            </div>

            <Link href="/blog" className="mt-10 inline-flex items-center gap-2 font-bold text-ocean-600 hover:text-turquoise-500">
              <span>→</span> العودة إلى جميع المقالات
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
