"use client";

import { Reveal, SectionHeading } from "./ui";
import SmartImage from "./SmartImage";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";

export default function PartnersSection() {
  const { t } = useI18n();
  const { partners } = useSettings();

  if (!partners || partners.length === 0) return null;

  return (
    <section className="relative bg-white py-24 sm:py-32">
      <div className="container-px">
        <SectionHeading
          eyebrow={t("partners.eyebrow")}
          title={t("partners.title")}
          description={t("partners.desc")}
        />

        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-8">
          {partners.map((src, i) => (
            <Reveal key={i} delay={(i % 4) * 0.08}>
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border border-navy-100 bg-white p-4 shadow-luxe transition-transform duration-500 hover:-translate-y-1 sm:h-40 sm:w-40">
                <div className="relative h-full w-full">
                  <SmartImage
                    src={src}
                    alt={`شريك النجاح ${i + 1} — سوار البحرية`}
                    fill
                    sizes="160px"
                    className="object-contain"
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
