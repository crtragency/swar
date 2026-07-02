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

/* ─────────────── Local generator (no API key required) ───────────────
   Composes a complete, SEO-optimised Arabic article from a title alone,
   weaving the focus keyphrase through the H1, intro, headings, body and
   FAQ. Phrasing is selected by a hash of the keyphrase so different
   keyphrases yield different wording (reduces duplicate-content risk). */

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
const pickN = <T,>(arr: T[], seed: number) => arr[seed % arr.length];

/** Turn a free title into a clean focus keyphrase if none is given. */
function deriveKeyphrase(title: string): string {
  return title
    .replace(/[:：،,.\-–—|].*$/, "") // cut at first separator/subtitle
    .replace(/\b(دليل|دليلك|الكامل|أفضل|كل ما تحتاج|2026|2025|لعام)\b/g, "")
    .replace(/\s+/g, " ")
    .trim() || title.trim();
}

const META_LEAD = ["دليل شامل عن", "كل ما تحتاج معرفته عن", "تعرّف على", "اكتشف"];
const INTRO_OPEN = [
  "تُعد",
  "تحتل",
  "تمثّل",
  "تجمع",
];

export function localGenerateDraft(rawTitle: string, rawKeyphrase = ""): BlogPost {
  const title = rawTitle.trim();
  const kp = (rawKeyphrase.trim() || deriveKeyphrase(title));
  const seed = hash(kp);
  const now = new Date();

  const intro =
    `${pickN(INTRO_OPEN, seed)} ${kp} من أبرز ما يبحث عنه محبّو البحر في المملكة، لما تجمعه من متعة واسترخاء على ساحل البحر الأحمر الساحر. ` +
    `في هذا الدليل من سوار البحرية نأخذك خطوة بخطوة لتتعرّف على كل ما يخص ${kp}: المميزات، الأنواع، الأسعار، أفضل الأوقات، وأهم النصائح لتجربة فاخرة لا تُنسى على متن يخوتنا المجهّزة بالكامل في ثول على البحر الأحمر.`;

  const sections = [
    {
      heading: `لماذا تختار ${kp}؟`,
      paragraphs: [
        `يبحث الكثيرون عن ${kp} لأنها تجمع بين سهولة الوصول وروعة الطبيعة؛ فالبحر الأحمر يتميّز بمياهه الفيروزية الصافية وشعابه المرجانية النابضة بالحياة ومناخه المعتدل طوال معظم أيام السنة، ما يجعل التجربة مناسبة للعائلات والأصدقاء وعشّاق المغامرة.`,
        `ومع سوار البحرية تنطلق رحلتك من مرسى ثول القريب من جدة، حيث المياه الهادئة والجزر الرملية والمواقع الشهيرة مثل كريستال ريف، لتستمتع بخصوصية وراحة بعيداً عن الزحام.`,
      ],
    },
    {
      heading: `ما الذي يميّز ${kp} مع سوار البحرية؟`,
      paragraphs: [`عند حجز ${kp} مع سوار البحرية تحصل على تجربة متكاملة تشمل:`],
      list: [
        "يخوت فاخرة مجهّزة بالكامل بوسائل السلامة المعتمدة والراحة.",
        "انطلاق من مرسى ثول القريب من جدة بمياه هادئة وصافية.",
        "طاقم محترف يهتم بأدق التفاصيل طوال الرحلة.",
        "مرونة في تخصيص الرحلة حسب مناسبتك وعدد الأشخاص.",
        "أسعار تنافسية مع باقات متنوعة تناسب جميع الميزانيات.",
      ],
    },
    {
      heading: `أنواع الرحلات المتاحة ضمن ${kp}`,
      paragraphs: [
        `تتنوّع خيارات ${kp} لتناسب كل ذوق وميزانية ومناسبة. وفيما يلي أبرز الباقات التي نقدّمها على متن يخوتنا:`,
      ],
      list: [
        "رحلة السباحة والاستجمام على جزيرة رملية مع مشروبات وأدوات سلامة.",
        "رحلات صيد الأسماك الاحترافية في أفضل مواقع البحر الأحمر.",
        "رحلة مشاهدة الدلافين في الصباح الباكر أو وقت الغروب.",
        "تنظيم الحفلات وأعياد الميلاد والمناسبات الخاصة فوق سطح اليخت.",
        "الرحلات المرنة بالساعة التي تنطلق من المرسى مباشرة.",
        "رحلة الصيد الملكية VIP الشاملة مع طهي الصيد وضيافة فاخرة.",
      ],
    },
    {
      heading: `أسعار ${kp} وما الذي تشمله`,
      paragraphs: [
        `تختلف أسعار ${kp} حسب نوع الرحلة ومدتها وعدد الأشخاص ونوع اليخت، وتبدأ من باقات اقتصادية بالساعة وصولاً إلى الرحلات الملكية الفاخرة. يغطي السعر الأساسي حتى 5 أشخاص مع رسوم بسيطة لكل شخص إضافي.`,
        `تشمل معظم الباقات وسائل السلامة المعتمدة ومياه الشرب والثلج، مع إضافات اختيارية مثل الصيد والتصوير الاحترافي والكاياك والوجبات. يمكنك الاطلاع على التفاصيل الكاملة وحجز باقتك مباشرةً من صفحة الحجوزات.`,
      ],
    },
    {
      heading: `أفضل وقت لـ ${kp}`,
      paragraphs: [
        `يمكن الاستمتاع بـ ${kp} على مدار العام تقريباً بفضل مناخ البحر الأحمر المعتدل، لكن أجمل الأوقات هي ساعات الصباح الباكر ووقت الغروب، حيث تهدأ الرياح وتعتدل الحرارة وتكتسب السماء ألواناً ساحرة مثالية للتصوير والاسترخاء.`,
        `أما لمحبّي الصيد ومشاهدة الدلافين فإن الانطلاق المبكر يرفع فرص نجاح التجربة، إذ تكون الكائنات البحرية أكثر نشاطاً في تلك الأوقات.`,
      ],
    },
    {
      heading: `نصائح قبل حجز ${kp}`,
      paragraphs: [
        `حتى تخرج بأفضل تجربة من ${kp}، احرص على إحضار واقٍ من الشمس وقبعة وملابس مريحة وكاميرا لتوثيق اللحظات، وإذا كنت تخطّط للسباحة فاصطحب ملابس البحر ومنشفة.`,
        `حدّد عدد الأشخاص بدقة عند الحجز، وتواصل معنا مسبقاً لتخصيص الرحلة حسب مناسبتك، واحرص على الوصول قبل موعد الانطلاق بوقتٍ كافٍ للاستمتاع بكامل مدة الرحلة.`,
      ],
    },
  ];

  const faq = [
    { q: `من أين تنطلق ${kp} مع سوار البحرية؟`, a: "تنطلق رحلاتنا من مرسى ثول القريب من جدة، ويتميّز بمياه هادئة وصافية وقرب من جزر رملية وكريستال ريف." },
    { q: `كم تبلغ أسعار ${kp}؟`, a: "تختلف الأسعار حسب نوع الرحلة ومدتها وعدد الأشخاص، وتبدأ من باقات اقتصادية بالساعة وصولاً إلى الرحلات الملكية الشاملة." },
    { q: `هل ${kp} مناسبة للعائلات والأطفال؟`, a: "نعم، يخوتنا مجهّزة بأدوات سلامة كاملة ومساحات مريحة وغرفة ودورة مياه، ما يجعلها مناسبة تماماً للعائلات والأطفال." },
    { q: `كيف أحجز ${kp}؟`, a: "يمكنك الحجز مباشرةً من صفحة الحجوزات واختيار الباقة والإضافات وطريقة الدفع، وسيؤكد لك فريقنا الموعد فوراً." },
  ];

  const words = (intro + " " + sections.map((s) => s.paragraphs.join(" ")).join(" ")).split(/\s+/).filter(Boolean).length;

  return {
    slug: slugify(kp),
    keyphrase: kp,
    title: title || kp,
    excerpt: `${pickN(META_LEAD, seed)} ${kp} مع سوار البحرية في ثول على البحر الأحمر: الأنواع والأسعار وأفضل الأوقات ونصائح الحجز لتجربة فاخرة لا تُنسى.`.slice(0, 158),
    category: pickN(["أدلة بحرية", "تجارب بحرية", "وجهات بحرية", "نصائح بحرية"], seed),
    date: now.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }),
    isoDate: now.toISOString().slice(0, 10),
    readMinutes: Math.max(4, Math.round(words / 200)),
    coverAlt: `${kp} — يخت سوار في ثول على ساحل البحر الأحمر`,
    intro,
    sections,
    faq,
    related: [
      { label: "تصفّح الباقات والأسعار", href: "/booking" },
      { label: "دليل رحلات بحرية في ثول", href: "/blog/rehlat-bahriya-fi-thol" },
      { label: "اكتشف كريستال ريف", href: "/blog/crystal-reef-thol" },
      { label: "معرض الصور", href: "/media" },
    ],
    references: [
      { label: "هيئة السياحة السعودية – Visit Saudi", href: "https://www.visitsaudi.com/ar", external: true },
      { label: "البحر الأحمر على ويكيبيديا", href: "https://ar.wikipedia.org/wiki/البحر_الأحمر", external: true },
    ],
  };
}

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
