import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import { Reveal } from "@/components/home/ui";
import { MARINA_BOAT } from "@/components/home/images";
import { tt } from "@/lib/i18n-core";
import { getServerLocale } from "@/lib/locale-server";
import { getSiteSettings } from "@/lib/content-server";
import { phoneHref, waLinkFrom } from "@/lib/settings-core";

export const metadata: Metadata = {
  title: "التواصل",
  description: "تواصل مع سوار البحرية لحجز رحلتك البحرية الفاخرة في ثول — واتساب، هاتف، وبريد إلكتروني.",
};

export default async function ContactPage() {
  const locale = getServerLocale();
  const s = await getSiteSettings();
  const INFO = [
    { icon: "📍", label: tt(locale, "contact.location"), value: tt(locale, "contact.locationVal") },
    { icon: "📞", label: tt(locale, "contact.phone"), value: s.phone, href: phoneHref(s.phone), ltr: true },
    { icon: "✉️", label: tt(locale, "contact.email"), value: s.email, href: `mailto:${s.email}` },
  ];
  return (
    <main>
      <PageHero
        eyebrow={tt(locale, "contact.eyebrow")}
        title={tt(locale, "contact.title")}
        subtitle={tt(locale, "contact.subtitle")}
        image={MARINA_BOAT}
      />

      <section className="bg-white py-20 sm:py-28">
        <div className="container-px grid gap-12 lg:grid-cols-2">
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              {INFO.map((it, i) => (
                <Reveal key={it.label} delay={i * 0.08}>
                  <div className="h-full rounded-[24px] border border-navy-50 bg-navy-50/40 p-6">
                    <span className="text-3xl">{it.icon}</span>
                    <h3 className="mt-3 text-sm font-bold text-turquoise-600">{it.label}</h3>
                    {it.href ? (
                      <a href={it.href} dir={it.ltr ? "ltr" : undefined} className="mt-1 block font-semibold text-navy-900 hover:text-ocean-600">
                        {it.value}
                      </a>
                    ) : (
                      <p className="mt-1 font-semibold text-navy-900">{it.value}</p>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.1}>
              <a
                href={waLinkFrom(s.whatsapp)}
                target="_blank"
                rel="noopener"
                className="mt-6 flex items-center justify-between gap-4 rounded-[24px] bg-gradient-to-l from-emerald-500 to-teal-500 p-6 text-white shadow-luxe transition-transform hover:scale-[1.01]"
              >
                <div>
                  <h3 className="text-lg font-extrabold">{tt(locale, "contact.waTitle")}</h3>
                  <p className="text-sm text-white/85">{tt(locale, "contact.waDesc")}</p>
                </div>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="shrink-0"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2z" /></svg>
              </a>
            </Reveal>

            <Reveal delay={0.15}>
              <p className="mt-6 text-navy-900/60">
                {tt(locale, "contact.browseFirst")}{" "}
                <Link href="/booking" className="font-bold text-ocean-600 hover:text-turquoise-500">{tt(locale, "contact.packagesPrices")}</Link>.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
