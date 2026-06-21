import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import StatsSection from "@/components/home/StatsSection";
import { Reveal, SectionHeading } from "@/components/home/ui";
import { CABIN, HERO_SUNSET, MARINA_BOAT } from "@/components/home/images";

export const metadata: Metadata = {
  title: "من نحن",
  description:
    "سوار البحرية — رحلات بحرية فاخرة في ثول على ساحل البحر الأحمر. تعرف على قصتنا وقيمنا وأسطولنا البحري المجهز لأرقى التجارب.",
};

const VALUES = [
  { title: "خبرة بحرية", desc: "سنوات من الخبرة في تنظيم أرقى الرحلات البحرية على ساحل البحر الأحمر." },
  { title: "سلامة تامة", desc: "أدوات سلامة كاملة ومعتمدة في جميع رحلاتنا لراحة بالك التامة." },
  { title: "خدمة فاخرة", desc: "طاقم محترف وضيافة راقية تجعل كل لحظة في رحلتك استثنائية." },
  { title: "وجهات ساحرة", desc: "أجمل مواقع ثول والبحر الأحمر من جزر رملية ومواقع صيد ومشاهدة دلافين." },
];

const FEATURES = [
  "يتسع لـ11 شخص",
  "غرفة نوم خاصة",
  "مطبخ تحضيري متكامل",
  "دورة مياه",
  "ماء حلو للغسيل والاستحمام",
  "أدوات سلامة كاملة",
];

export default function AboutPage() {
  return (
    <main>
      <PageHero
        eyebrow="من نحن"
        title="سوار البحرية"
        subtitle="رحلات بحرية فاخرة في ثول على ساحل البحر الأحمر — عِش معنا متعة بحرية لا تُنسى."
        image={HERO_SUNSET}
      />

      {/* Story */}
      <section className="bg-white py-24 sm:py-32">
        <div className="container-px grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="relative h-[420px] overflow-hidden rounded-[32px] shadow-luxe">
              <Image src={MARINA_BOAT} alt="يخت سوار البحرية في مرسى ثول" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            </div>
          </Reveal>
          <div>
            <SectionHeading eyebrow="قصتنا" title="رحلتنا في عالم البحر" align="start" />
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-navy-900/70">
              <Reveal delay={0.1}><p>انطلقت سوار البحرية من حُب البحر وشغف تقديم تجارب بحرية لا تُنسى على ساحل البحر الأحمر في ثول. نؤمن أن كل رحلة هي قصة تستحق أن تُروى.</p></Reveal>
              <Reveal delay={0.2}><p>نوفر أسطولاً من اليخوت المجهزة بأعلى معايير الراحة والسلامة، مع طاقم محترف يحرص على أدق التفاصيل ليمنحك تجربة بحرية فاخرة بكل ما تحمله الكلمة من معنى.</p></Reveal>
              <Reveal delay={0.3}><p>من رحلات السباحة والاستجمام إلى الصيد ومشاهدة الدلافين والحفلات الخاصة، نصمم لك تجربة تناسب ذوقك ومناسبتك.</p></Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-navy-50/40 py-24 sm:py-32">
        <div className="container-px">
          <SectionHeading eyebrow="لماذا سوار؟" title="قيمنا التي نبحر بها" description="نلتزم بأعلى معايير الجودة والسلامة لنمنحك تجربة بحرية استثنائية." />
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className="group h-full rounded-[26px] border border-navy-50 bg-white p-7 shadow-luxe transition-transform hover:-translate-y-2">
                  <span className="block font-cairo text-3xl font-extrabold text-gold-500">
                    0{i + 1}
                  </span>
                  <span className="mt-3 block h-px w-10 bg-gold-400" />
                  <h3 className="mt-5 text-xl font-extrabold text-navy-900">{v.title}</h3>
                  <p className="mt-2 leading-relaxed text-navy-900/65">{v.desc}</p>
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
            <SectionHeading eyebrow="أسطولنا" title="يخوت مجهزة بالكامل لراحتك" align="start" />
            <p className="mt-5 text-lg leading-relaxed text-navy-900/70">
              تأتي يخوتنا مجهزة بكل ما تحتاجه لرحلة مريحة وآمنة، لتستمتع بوقتك دون أي قلق.
            </p>
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
            <Link href="/booking" className="btn-ocean mt-8 inline-flex text-sm">احجز رحلتك الآن</Link>
          </div>
          <Reveal>
            <div className="relative h-[460px] overflow-hidden rounded-[32px] shadow-luxe">
              <Image src={CABIN} alt="المقصورة الداخلية ليخت سوار البحرية" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      <StatsSection />
    </main>
  );
}
