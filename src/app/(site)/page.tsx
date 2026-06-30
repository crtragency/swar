import Hero from "@/components/home/Hero";
import PricingSection from "@/components/home/PricingSection";
import GallerySection from "@/components/home/GallerySection";
import StatsSection from "@/components/home/StatsSection";
import BlogSection from "@/components/home/BlogSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import PartnersSection from "@/components/home/PartnersSection";
import { getPackagesMerged } from "@/lib/content-server";

export default async function HomePage() {
  const packages = await getPackagesMerged();
  return (
    <main>
      <Hero />
      <PricingSection packages={packages} />
      <GallerySection />
      <StatsSection />
      <BlogSection />
      <TestimonialsSection />
      <PartnersSection />
    </main>
  );
}
