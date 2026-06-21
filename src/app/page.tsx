import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import AdventureSection from "@/components/home/AdventureSection";
import PricingSection from "@/components/home/PricingSection";
import GallerySection from "@/components/home/GallerySection";
import PackagesSection from "@/components/home/PackagesSection";
import LatestPhotosSection from "@/components/home/LatestPhotosSection";
import StatsSection from "@/components/home/StatsSection";
import BlogSection from "@/components/home/BlogSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import Footer from "@/components/home/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <AdventureSection />
        <PricingSection />
        <GallerySection />
        <PackagesSection />
        <LatestPhotosSection />
        <StatsSection />
        <BlogSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </>
  );
}
