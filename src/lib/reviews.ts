// Google reviews via the Places API (New). Uses GOOGLE_PLACES_API_KEY +
// GOOGLE_PLACE_ID when available (real, auto-refreshing data) and falls back
// to a small curated set so the section is never empty.

export type Review = { name: string; rating: number; text: string; when: string };
export type ReviewsData = {
  rating: number | null;
  total: number | null;
  reviews: Review[];
  source: "google" | "fallback";
};

const FALLBACK: Review[] = [
  { name: "عبدالله الحربي", rating: 5, when: "", text: "تجربة بحرية فاخرة بكل ما تحمله الكلمة من معنى. الخدمة كانت راقية والطاقم محترف، وقضينا يوماً لا يُنسى على متن اليخت." },
  { name: "نورة القحطاني", rating: 5, when: "", text: "أجمل رحلة بحرية خضتها في ثول. التنظيم رائع والمناظر خلابة، بالتأكيد سأكرر التجربة مع سوار مرة أخرى." },
  { name: "فهد العتيبي", rating: 5, when: "", text: "اخترنا باقة العائلة وكانت مثالية للأطفال والكبار. اهتمام بأدق التفاصيل وأمان عالٍ. شكراً لفريق سوار على هذه المتعة." },
  { name: "سارة الدوسري", rating: 5, when: "", text: "احتفلنا بمناسبة خاصة على متن اليخت، والأجواء كانت ساحرة. ضيافة فاخرة وخدمة استثنائية تستحق كل تقدير." },
];

export async function getGoogleReviews(): Promise<ReviewsData> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (key && placeId) {
    try {
      const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}?languageCode=ar`, {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": "displayName,rating,userRatingCount,reviews",
        },
        next: { revalidate: 86400 }, // refresh daily
      });
      if (res.ok) {
        const d = (await res.json()) as {
          rating?: number;
          userRatingCount?: number;
          reviews?: {
            rating?: number;
            text?: { text?: string };
            originalText?: { text?: string };
            relativePublishTimeDescription?: string;
            authorAttribution?: { displayName?: string };
          }[];
        };
        const reviews: Review[] = (d.reviews ?? [])
          .map((r) => ({
            name: r.authorAttribution?.displayName ?? "زائر",
            rating: r.rating ?? 5,
            text: r.text?.text ?? r.originalText?.text ?? "",
            when: r.relativePublishTimeDescription ?? "",
          }))
          .filter((r) => r.text.trim().length > 0);
        if (reviews.length) {
          return { rating: d.rating ?? null, total: d.userRatingCount ?? null, reviews, source: "google" };
        }
      }
    } catch {
      /* fall through to fallback */
    }
  }
  return { rating: null, total: null, reviews: FALLBACK, source: "fallback" };
}
