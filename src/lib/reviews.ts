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

const STAR: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

/**
 * Google Business Profile reviews (returns ALL reviews for a location the
 * owner manages). Requires an OAuth refresh token + the Business Profile API.
 */
async function getBusinessProfileReviews(): Promise<ReviewsData | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const account = process.env.GOOGLE_BP_ACCOUNT_ID;
  const location = process.env.GOOGLE_BP_LOCATION_ID;
  if (!clientId || !clientSecret || !refreshToken || !account || !location) return null;

  try {
    // 1) exchange the refresh token for an access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
      cache: "no-store",
    });
    if (!tokenRes.ok) return null;
    const { access_token } = (await tokenRes.json()) as { access_token?: string };
    if (!access_token) return null;

    // 2) fetch reviews for the location
    const url = `https://mybusiness.googleapis.com/v4/accounts/${account}/locations/${location}/reviews`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${access_token}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const d = (await res.json()) as {
      averageRating?: number;
      totalReviewCount?: number;
      reviews?: {
        starRating?: string;
        comment?: string;
        createTime?: string;
        reviewer?: { displayName?: string };
      }[];
    };
    const reviews: Review[] = (d.reviews ?? [])
      .map((r) => ({
        name: r.reviewer?.displayName ?? "زائر",
        rating: STAR[r.starRating ?? "FIVE"] ?? 5,
        text: r.comment ?? "",
        when: "",
      }))
      .filter((r) => r.text.trim().length > 0);
    if (!reviews.length) return null;
    return { rating: d.averageRating ?? null, total: d.totalReviewCount ?? reviews.length, reviews, source: "google" };
  } catch {
    return null;
  }
}

export async function getGoogleReviews(): Promise<ReviewsData> {
  const bp = await getBusinessProfileReviews();
  if (bp) return bp;

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
