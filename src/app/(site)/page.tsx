import Hero from "@/components/home/Hero";
import PricingSection from "@/components/home/PricingSection";
import GallerySection from "@/components/home/GallerySection";
import StatsSection from "@/components/home/StatsSection";
import BlogSection from "@/components/home/BlogSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <PricingSection />
      <GallerySection />
      <StatsSection />
      <BlogSection />
      <TestimonialsSection />
    </main>
  );
}
