import "server-only";
import type { BlogPost } from "./blog";

const PROMPT = (title: string, keyphrase: string) => `أنت كاتب محتوى عربي محترف متخصص في تحسين محركات البحث (SEO) لشركة "سوار البحرية" التي تقدم رحلات بحرية فاخرة وتأجير يخوت في ثول على ساحل البحر الأحمر (سباحة، صيد، مشاهدة دلافين، حفلات بحرية، وكريستال ريف).

اكتب مقالاً طويلاً (700 كلمة أو أكثر) محسّناً للسيو حول العنوان التالي:
العنوان المقترح: "${title}"
الكلمة المفتاحية: "${keyphrase || title}"

أعد فقط كائن JSON صالحاً (بدون أي نص قبله أو بعده) بهذا الشكل تماماً:
{
  "slug": "english-hyphenated-slug-from-keyphrase",
  "keyphrase": "${keyphrase || title}",
  "title": "عنوان جذّاب يبدأ بالكلمة المفتاحية",
  "excerpt": "وصف ميتا قصير (حتى 160 حرف) يحتوي الكلمة المفتاحية",
  "category": "تصنيف قصير مناسب",
  "intro": "فقرة مقدمة تحتوي الكلمة المفتاحية",
  "sections": [
    { "heading": "عنوان فرعي يحتوي الكلمة المفتاحية", "paragraphs": ["فقرة", "فقرة"], "list": ["نقطة","نقطة"] },
    { "heading": "عنوان فرعي آخر", "paragraphs": ["فقرة", "فقرة"] }
  ],
  "faq": [ {"q":"سؤال","a":"إجابة"}, {"q":"سؤال","a":"إجابة"} ]
}
اكتب 3 إلى 5 أقسام. استخدم الكلمة المفتاحية في العنوان والمقدمة وبعض العناوين الفرعية بشكل طبيعي. الحقل "list" اختياري.`;

type Draft = {
  slug: string;
  keyphrase: string;
  title: string;
  excerpt: string;
  category: string;
  intro: string;
  sections: { heading: string; paragraphs: string[]; list?: string[] }[];
  faq: { q: string; a: string }[];
};

function extractJson(text: string): Draft {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("no JSON in model output");
  return JSON.parse(text.slice(start, end + 1)) as Draft;
}

async function callAnthropic(prompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const d = (await res.json()) as { content?: { text?: string }[] };
  return d.content?.[0]?.text ?? "";
}

async function callGemini(prompt: string): Promise<string> {
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const d = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return d.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export function aiProvider(): "anthropic" | "gemini" | null {
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return null;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9؀-ۿ]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) ||
  `post-${Date.now().toString(36)}`;

/** Generate a full, ready-to-publish blog post draft from a title. */
export async function generateBlogDraft(title: string, keyphrase = ""): Promise<BlogPost> {
  const provider = aiProvider();
  if (!provider) throw new Error("AI key not configured");
  const prompt = PROMPT(title, keyphrase);
  const raw = provider === "anthropic" ? await callAnthropic(prompt) : await callGemini(prompt);
  const d = extractJson(raw);

  const wordCount = (d.intro + " " + d.sections.map((s) => s.paragraphs.join(" ")).join(" ")).split(/\s+/).length;
  const now = new Date();
  return {
    slug: slugify(d.slug || d.keyphrase || title),
    keyphrase: d.keyphrase || keyphrase || title,
    title: d.title || title,
    excerpt: d.excerpt || "",
    category: d.category || "المدونة",
    date: now.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }),
    isoDate: now.toISOString().slice(0, 10),
    readMinutes: Math.max(3, Math.round(wordCount / 200)),
    coverAlt: `${d.title || title} — سوار البحرية`,
    intro: d.intro || "",
    sections: (d.sections || []).map((s) => ({ heading: s.heading, paragraphs: s.paragraphs || [], list: s.list })),
    faq: d.faq || [],
    related: [
      { label: "تصفّح الباقات والأسعار", href: "/booking" },
      { label: "تعرّف على سوار البحرية", href: "/about" },
      { label: "معرض الصور", href: "/media" },
    ],
    references: [
      { label: "هيئة السياحة السعودية", href: "https://www.visitsaudi.com/ar", external: true },
      { label: "البحر الأحمر على ويكيبيديا", href: "https://ar.wikipedia.org/wiki/البحر_الأحمر", external: true },
    ],
  };
}
