"use client";

import Image, { type StaticImageData } from "next/image";
import { motion } from "framer-motion";
import { Reveal, SectionHeading } from "./ui";
import { HERO_1, HERO_2, HERO_3 } from "./images";

const PHOTOS = [
  { src: HERO_3, alt: "أحدث صور رحلاتنا البحرية في ثول" },
  { src: HERO_1, alt: "لقطة من رحلة يخت سوار" },
  { src: HERO_2, alt: "مشهد بحري ساحر من البحر الأحمر" },
  { src: HERO_1, alt: "أجواء الإبحار مع سوار" },
  { src: HERO_3, alt: "غروب على متن الرحلة البحرية" },
];

export default function LatestPhotosSection() {
  return (
    <section id="gallery" className="relative overflow-hidden bg-navy-950 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(33,192,192,0.12),transparent_60%)]" />
      <div className="container-px relative">
        <SectionHeading
          eyebrow="الوسائط"
          title="أحدث الصور"
          description="تابع آخر لحظاتنا البحرية الملتقطة من قلب البحر الأحمر."
          light
        />

        <div className="mt-16 grid gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-6">
          <Reveal className="md:col-span-2 lg:col-span-3">
            <PhotoCard photo={PHOTOS[0]} tall />
          </Reveal>
          <Reveal delay={0.08} className="md:col-span-1 lg:col-span-3">
            <PhotoCard photo={PHOTOS[1]} />
          </Reveal>
          <Reveal delay={0.12} className="lg:col-span-2">
            <PhotoCard photo={PHOTOS[2]} />
          </Reveal>
          <Reveal delay={0.16} className="lg:col-span-2">
            <PhotoCard photo={PHOTOS[3]} />
          </Reveal>
          <Reveal delay={0.2} className="lg:col-span-2">
            <PhotoCard photo={PHOTOS[4]} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function PhotoCard({
  photo,
  tall = false,
}: {
  photo: { src: StaticImageData; alt: string };
  tall?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      className={`group relative w-full overflow-hidden rounded-3xl ${
        tall ? "h-72 lg:h-full lg:min-h-[280px]" : "h-56 lg:h-full lg:min-h-[280px]"
      }`}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent opacity-70 transition-opacity group-hover:opacity-90" />
    </motion.div>
  );
}
