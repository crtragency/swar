import { getGoogleReviews, type ReviewsData } from "@/lib/reviews";
import { GOOGLE_REVIEWS_URL } from "@/lib/site";
import { getSiteSettings } from "@/lib/content-server";
import TestimonialsSlider from "./TestimonialsSlider";

export default async function TestimonialsSection() {
  const settings = await getSiteSettings();
  let data: ReviewsData;
  if (settings.reviewsMode === "manual" && settings.reviews.length) {
    // owner-curated reviews entered from the Developer Studio
    const reviews = settings.reviews;
    const rating = Math.round((reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length) * 10) / 10;
    data = { reviews, rating, total: reviews.length, source: "fallback" };
  } else {
    data = await getGoogleReviews();
  }
  return (
    <TestimonialsSlider
      reviews={data.reviews}
      rating={data.rating}
      total={data.total}
      source={data.source}
      reviewsUrl={GOOGLE_REVIEWS_URL}
    />
  );
}
