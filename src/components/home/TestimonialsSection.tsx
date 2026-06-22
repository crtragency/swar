import { getGoogleReviews } from "@/lib/reviews";
import { GOOGLE_REVIEWS_URL } from "@/lib/site";
import TestimonialsSlider from "./TestimonialsSlider";

export default async function TestimonialsSection() {
  const data = await getGoogleReviews();
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
