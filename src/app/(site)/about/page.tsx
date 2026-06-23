import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import StatsSection from "@/components/home/StatsSection";
import { Reveal, SectionHeading } from "@/components/home/ui";
import { CABIN, HERO_SUNSET, MARINA_BOAT } from "@/components/home/images";
import { tt } from "@/lib/i18n-core";
import { getServerLocale } from "@/lib/locale-server";

export const metadata: Metadata = {
  title: "من نحن",
  description:
    "سوار البحرية — رحلات بحرية فاخرة في ثول على ساحل البحر الأحمر. تعرف على قصتنا وقيمنا وأسطولنا البحري المجهز لأرقى التجارب.",
};

export default function AboutPage() {
  const locale = getServerLocale();
  const VALUES = [
    { t: tt(locale, "about.value1.t"), d: tt(locale, "about.value1.d") },
    { t: tt(locale, "about.value2.t"), d: tt(locale, "about.value2.d") },
    { t: tt(locale, "about.value3.t"), d: tt(locale, "about.value3.d") },
    { t: tt(locale, "about.value4.t"), d: tt(locale, "about.value4.d") },
  ];
  const FEATURES = ["about.f1", "about.f2", "about.f3", "about.f4", "about.f5", "about.f6"].map((k) => tt(locale, k));

  return (
    <main>
      <PageHero
        eyebrow={tt(locale, "about.eyebrow")}
        title={tt(locale, "about.title")}
        subtitle={tt(locale, "about.subtitle")}
        image={HERO_SUNSET}
      />

      {/* Story */}
      <section className="bg-white py-24 sm:py-32">
        <div className="container-px grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="relative h-[420px] overflow-hidden rounded-[32px] shadow-luxe">
              <Image src={MARINA_BOAT} alt={tt(locale, "about.title")} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            </div>
          </Reveal>
          <div>
            <SectionHeading eyebrow={tt(locale, "about.storyEyebrow")} title={tt(locale, "about.storyTitle")} align="start" />
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-navy-900/70">
              <Reveal delay={0.1}><p>{tt(locale, "about.story1")}</p></Reveal>
              <Reveal delay={0.2}><p>{tt(locale, "about.story2")}</p></Reveal>
              <Reveal delay={0.3}><p>{tt(locale, "about.story3")}</p></Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-navy-50/40 py-24 sm:py-32">
        <div className="container-px">
          <SectionHeading eyebrow={tt(locale, "about.valuesEyebrow")} title={tt(locale, "about.valuesTitle")} description={tt(locale, "about.valuesDesc")} />
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.t} delay={i * 0.08}>
                <div className="group h-full rounded-[26px] border border-navy-50 bg-white p-7 shadow-luxe transition-transform hover:-translate-y-2">
                  <span className="block font-cairo text-3xl font-extrabold text-gold-500">0{i + 1}</span>
                  <span className="mt-3 block h-px w-10 bg-gold-400" />
                  <h3 className="mt-5 text-xl font-extrabold text-navy-900">{v.t}</h3>
                  <p className="mt-2 leading-relaxed text-navy-900/65">{v.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Yacht features */}
      <section className="bg-white py-24 sm:py-32">
        <div className="container-px grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow={tt(locale, "about.fleetEyebrow")} title={tt(locale, "about.fleetTitle")} align="start" />
            <p className="mt-5 text-lg leading-relaxed text-navy-900/70">{tt(locale, "about.fleetDesc")}</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {FEATURES.map((f, i) => (
                <Reveal key={f} delay={i * 0.06}>
                  <li className="flex items-center gap-3 rounded-2xl bg-navy-50/60 px-4 py-3 font-semibold text-navy-900/80">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-turquoise-500 text-white">✓</span>
                    {f}
                  </li>
                </Reveal>
              ))}
            </ul>
            <Link href="/booking" className="btn-ocean mt-8 inline-flex text-sm">{tt(locale, "about.bookTrip")}</Link>
          </div>
          <Reveal>
            <div className="relative h-[460px] overflow-hidden rounded-[32px] shadow-luxe">
              <Image src={CABIN} alt={tt(locale, "about.fleetTitle")} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      <StatsSection />
    </main>
  );
}
