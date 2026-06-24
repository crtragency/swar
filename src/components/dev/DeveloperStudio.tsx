"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { BlogPost } from "@/lib/blog";
import type { Pkg } from "@/lib/packages";
import type { SiteSettings, SocialLink } from "@/lib/settings-core";

type Tab = "posts" | "packages" | "settings";
const TAB_LABEL: Record<Tab, string> = { posts: "المقالات", packages: "الباقات", settings: "إعدادات الموقع" };

export default function DeveloperStudio() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<Tab>("posts");

  const headers = useCallback(
    () => ({ "Content-Type": "application/json", "x-dev-password": pw }),
    [pw]
  );

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch(`/api/dev/posts?password=${encodeURIComponent(pw)}`, { cache: "no-store" });
    if (res.ok) setAuthed(true);
    else setErr("كلمة المرور غير صحيحة");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b16] text-white">
      <Aurora />
      <div className="relative z-10">
        {!authed ? (
          <div className="flex min-h-screen items-center justify-center px-5">
            <motion.form
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
              onSubmit={login}
              className="w-full max-w-sm rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl"
            >
              <div className="mb-2 text-center text-4xl">⚓</div>
              <h1 className="text-center text-2xl font-extrabold">Sewar Developer Studio</h1>
              <p className="mt-1 text-center text-sm text-white/50">منطقة المطوّر — توليد ونشر المحتوى</p>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="كلمة مرور المطوّر"
                className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-turquoise-400"
              />
              {err && <p className="mt-3 text-sm font-semibold text-rose-400">{err}</p>}
              <button className="mt-5 w-full rounded-2xl bg-gradient-to-l from-violet-600 via-turquoise-500 to-gold-500 py-3 font-bold text-navy-950 transition hover:brightness-110">
                دخول
              </button>
            </motion.form>
          </div>
        ) : (
          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="bg-gradient-to-l from-turquoise-300 via-white to-gold-300 bg-clip-text text-3xl font-black text-transparent sm:text-4xl">
                  Developer Studio
                </h1>
                <p className="text-sm text-white/50">سوار البحرية · إدارة المحتوى بالذكاء الاصطناعي</p>
              </div>
              <div className="flex gap-2 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur">
                {(["posts", "packages", "settings"] as Tab[]).map((tk) => (
                  <button
                    key={tk}
                    onClick={() => setTab(tk)}
                    className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                      tab === tk ? "bg-white text-navy-950" : "text-white/70 hover:text-white"
                    }`}
                  >
                    {TAB_LABEL[tk]}
                  </button>
                ))}
              </div>
            </header>

            <div className="mt-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35 }}
                >
                  {tab === "posts" ? <PostsTab headers={headers} pw={pw} /> : tab === "packages" ? <PackagesTab headers={headers} pw={pw} /> : <SettingsTab headers={headers} pw={pw} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────── Posts ───────────────────────────── */
type PMode = "ai" | "manual";
type MSection = { heading: string; body: string };
type MFaq = { q: string; a: string };

const slugifyClient = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9؀-ۿ]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) ||
  `post-${Date.now().toString(36)}`;

function PostsTab({ headers, pw }: { headers: () => Record<string, string>; pw: string }) {
  const [mode, setMode] = useState<PMode>("ai");
  const [title, setTitle] = useState("");
  const [keyphrase, setKeyphrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<BlogPost | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [msg, setMsg] = useState("");
  const [publishing, setPublishing] = useState(false);

  // manual composer fields
  const [mCategory, setMCategory] = useState("أدلة بحرية");
  const [mExcerpt, setMExcerpt] = useState("");
  const [mIntro, setMIntro] = useState("");
  const [mSections, setMSections] = useState<MSection[]>([{ heading: "", body: "" }]);
  const [mFaq, setMFaq] = useState<MFaq[]>([{ q: "", a: "" }]);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    const res = await fetch(`/api/dev/posts?password=${encodeURIComponent(pw)}`, { cache: "no-store" });
    if (res.ok) setPosts((await res.json()).posts ?? []);
  }, [pw]);
  useEffect(() => { loadPosts(); }, [loadPosts]);

  function resetForm() {
    setTitle(""); setKeyphrase(""); setMExcerpt(""); setMIntro("");
    setMSections([{ heading: "", body: "" }]); setMFaq([{ q: "", a: "" }]);
    setMCategory("أدلة بحرية"); setEditingSlug(null);
  }

  // load an existing article into the manual composer for editing
  function loadForEdit(p: BlogPost) {
    setMode("manual");
    setEditingSlug(p.slug);
    setTitle(p.title);
    setKeyphrase(p.keyphrase);
    setMCategory(p.category);
    setMExcerpt(p.excerpt);
    setMIntro(p.intro);
    setMSections(
      (p.sections.length ? p.sections : [{ heading: "", paragraphs: [], list: [] }]).map((s) => ({
        heading: s.heading,
        body: [...s.paragraphs, ...((s.list ?? []).map((li) => `- ${li}`))].join("\n"),
      }))
    );
    setMFaq(p.faq.length ? p.faq.map((f) => ({ q: f.q, a: f.a })) : [{ q: "", a: "" }]);
    setDraft(null);
    setMsg(`✏️ تم تحميل المقال للتعديل — عدّل ثم اضغط معاينة فالنشر.`);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function generate() {
    setMsg("");
    if (!title.trim()) return setMsg("✍️ اكتب عنوان المقال أولاً");
    setLoading(true);
    setDraft(null);
    try {
      const res = await fetch("/api/dev/generate", { method: "POST", headers: headers(), body: JSON.stringify({ title, keyphrase }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذّر التوليد");
      setDraft(data.draft);
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "خطأ"));
    } finally {
      setLoading(false);
    }
  }

  // build a complete BlogPost from the manual fields (no AI needed)
  function buildManual() {
    setMsg("");
    if (!title.trim()) return setMsg("✍️ اكتب عنوان المقال أولاً");
    const kp = keyphrase.trim() || title.trim();
    const sections = mSections
      .filter((s) => s.heading.trim() || s.body.trim())
      .map((s) => {
        const lines = s.body.split("\n").map((l) => l.trim()).filter(Boolean);
        const list = lines.filter((l) => l.startsWith("- ")).map((l) => l.slice(2).trim());
        const paragraphs = lines.filter((l) => !l.startsWith("- "));
        return { heading: s.heading.trim(), paragraphs, ...(list.length ? { list } : {}) };
      });
    const faq = mFaq.filter((f) => f.q.trim() && f.a.trim()).map((f) => ({ q: f.q.trim(), a: f.a.trim() }));
    const words = (mIntro + " " + sections.map((s) => s.paragraphs.join(" ")).join(" ")).split(/\s+/).filter(Boolean).length;
    const now = new Date();
    const post: BlogPost = {
      slug: editingSlug || slugifyClient(kp),
      keyphrase: kp,
      title: title.trim(),
      excerpt: mExcerpt.trim() || mIntro.trim().slice(0, 155),
      category: mCategory.trim() || "المدونة",
      date: now.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }),
      isoDate: now.toISOString().slice(0, 10),
      readMinutes: Math.max(3, Math.round(words / 200)),
      coverAlt: `${title.trim()} — سوار البحرية`,
      intro: mIntro.trim(),
      sections,
      faq,
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
    setDraft(post);
    setMsg("👁️ تمت المعاينة — راجع المقال على اليمين ثم انشره.");
  }

  async function publish() {
    if (!draft) return;
    setPublishing(true);
    try {
      const res = await fetch("/api/dev/posts", { method: "POST", headers: headers(), body: JSON.stringify({ post: draft }) });
      if (!res.ok) throw new Error("تعذّر النشر");
      setMsg("✅ تم نشر المقال على الموقع!");
      setDraft(null); resetForm();
      loadPosts();
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "خطأ"));
    } finally {
      setPublishing(false);
    }
  }

  async function remove(slug: string) {
    await fetch(`/api/dev/posts?slug=${encodeURIComponent(slug)}`, { method: "DELETE", headers: headers() });
    loadPosts();
  }

  const setSection = (i: number, patch: Partial<MSection>) => setMSections((l) => l.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const setFaq = (i: number, patch: Partial<MFaq>) => setMFaq((l) => l.map((f, j) => (j === i ? { ...f, ...patch } : f)));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* composer */}
      <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
        {/* mode switch */}
        <div className="mb-5 flex gap-2 rounded-full border border-white/10 bg-white/5 p-1">
          {(["ai", "manual"] as PMode[]).map((m) => (
            <button key={m} onClick={() => { setMode(m); setDraft(null); setMsg(""); }}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-bold transition ${mode === m ? "bg-white text-navy-950" : "text-white/70 hover:text-white"}`}>
              {m === "ai" ? "⚡ توليد تلقائي" : "✍️ كتابة يدوية"}
            </button>
          ))}
        </div>

        {mode === "ai" ? (
          <>
            <h2 className="flex items-center gap-2 text-xl font-extrabold">⚡ اكتب العنوان وسيتولّد المقال</h2>
            <p className="mt-1 text-sm text-white/50">اكتب العنوان اللي بتفكر فيه فقط، ويتم توليد مقال كامل محسّن للسيو فورًا — بدون أي مفتاح أو إعدادات.</p>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: رحلات بحرية عائلية في جدة..." className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-turquoise-400" />
            <input value={keyphrase} onChange={(e) => setKeyphrase(e.target.value)} placeholder="الكلمة المفتاحية (اختياري — تُستخرج من العنوان تلقائيًا)" className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-turquoise-400" />
            <button onClick={generate} disabled={loading} className="group relative mt-5 w-full overflow-hidden rounded-2xl bg-gradient-to-l from-violet-600 via-turquoise-500 to-gold-500 py-3.5 font-bold text-navy-950 transition hover:brightness-110 disabled:opacity-60">
              {loading ? "⏳ جاري التوليد..." : "⚡ توليد المقال"}
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-xl font-extrabold">{editingSlug ? "✏️ تعديل مقال" : "✍️ كتابة مقال يدويًا"}</h2>
              {editingSlug && <button onClick={resetForm} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20">إلغاء التعديل</button>}
            </div>
            <p className="mt-1 text-sm text-white/50">{editingSlug ? `تعديل /blog/${editingSlug} — سيُحدّث المقال على الموقع عند النشر.` : "اكتب المقال بنفسك — بدون أي مفتاح AI. كل حقل اختياري عدا العنوان."}</p>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان المقال (يبدأ بالكلمة المفتاحية) *" className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-turquoise-400" />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <input value={keyphrase} onChange={(e) => setKeyphrase(e.target.value)} placeholder="الكلمة المفتاحية" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-turquoise-400" />
              <input value={mCategory} onChange={(e) => setMCategory(e.target.value)} placeholder="التصنيف" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-turquoise-400" />
            </div>
            <textarea value={mExcerpt} onChange={(e) => setMExcerpt(e.target.value)} placeholder="وصف الميتا (~155 حرف، يحتوي الكلمة المفتاحية)" rows={2} className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-turquoise-400" />
            <textarea value={mIntro} onChange={(e) => setMIntro(e.target.value)} placeholder="فقرة المقدمة..." rows={3} className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-turquoise-400" />

            {/* sections */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-bold text-white/80">الأقسام</span>
              <button onClick={() => setMSections((l) => [...l, { heading: "", body: "" }])} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20">+ قسم</button>
            </div>
            {mSections.map((s, i) => (
              <div key={i} className="mt-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex gap-2">
                  <input value={s.heading} onChange={(e) => setSection(i, { heading: e.target.value })} placeholder={`عنوان القسم ${i + 1}`} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-turquoise-400" />
                  {mSections.length > 1 && <button onClick={() => setMSections((l) => l.filter((_, j) => j !== i))} className="rounded-lg bg-rose-500/70 px-2.5 text-xs font-bold">✕</button>}
                </div>
                <textarea value={s.body} onChange={(e) => setSection(i, { body: e.target.value })} placeholder="فقرات القسم — كل سطر فقرة. ابدأ السطر بـ - لعمل نقطة قائمة." rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-turquoise-400" />
              </div>
            ))}

            {/* faq */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-bold text-white/80">الأسئلة الشائعة</span>
              <button onClick={() => setMFaq((l) => [...l, { q: "", a: "" }])} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20">+ سؤال</button>
            </div>
            {mFaq.map((f, i) => (
              <div key={i} className="mt-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex gap-2">
                  <input value={f.q} onChange={(e) => setFaq(i, { q: e.target.value })} placeholder={`سؤال ${i + 1}`} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-turquoise-400" />
                  {mFaq.length > 1 && <button onClick={() => setMFaq((l) => l.filter((_, j) => j !== i))} className="rounded-lg bg-rose-500/70 px-2.5 text-xs font-bold">✕</button>}
                </div>
                <textarea value={f.a} onChange={(e) => setFaq(i, { a: e.target.value })} placeholder="الإجابة" rows={2} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-turquoise-400" />
              </div>
            ))}

            <button onClick={buildManual} className="mt-5 w-full rounded-2xl bg-gradient-to-l from-violet-600 via-turquoise-500 to-gold-500 py-3.5 font-bold text-navy-950 transition hover:brightness-110">
              👁️ معاينة المقال
            </button>
          </>
        )}
        {msg && <p className="mt-3 text-sm font-semibold text-white/80">{msg}</p>}
      </div>

      {/* draft preview */}
      <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
        <h2 className="text-xl font-extrabold">معاينة المقال</h2>
        {!draft ? (
          <div className="mt-10 flex h-48 items-center justify-center rounded-2xl border border-dashed border-white/10 text-center text-white/40">
            المقال المولّد سيظهر هنا قبل النشر
          </div>
        ) : (
          <div className="mt-4">
            <span className="rounded-full bg-gold-500/20 px-3 py-1 text-xs font-bold text-gold-300">{draft.category}</span>
            <h3 className="mt-3 text-lg font-extrabold leading-snug">{draft.title}</h3>
            <p className="mt-2 text-sm text-white/60">{draft.excerpt}</p>
            <div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1 text-sm text-white/70">
              <p>{draft.intro}</p>
              {draft.sections.map((s) => (
                <p key={s.heading} className="font-semibold text-turquoise-300">• {s.heading}</p>
              ))}
              <p className="text-xs text-white/40">{draft.sections.length} أقسام · {draft.faq.length} أسئلة · /blog/{draft.slug}</p>
            </div>
            <button onClick={publish} disabled={publishing} className="mt-5 w-full rounded-2xl bg-emerald-500 py-3 font-bold text-navy-950 transition hover:brightness-110 disabled:opacity-60">
              {publishing ? "⏳ جاري النشر..." : "🚀 نشر على الموقع"}
            </button>
          </div>
        )}
      </div>

      {/* all articles */}
      <div className="lg:col-span-2 rounded-[26px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
        <h2 className="text-xl font-extrabold">كل المقالات على الموقع ({posts.length})</h2>
        <p className="mt-1 text-sm text-white/45">اضغط «تعديل» على أي مقال لتحريره ثم إعادة نشره، أو «حذف» لإزالته من الموقع.</p>
        {posts.length === 0 ? (
          <p className="mt-4 text-sm text-white/40">لا توجد مقالات بعد.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {posts.map((p) => (
              <div key={p.slug} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-bold">{p.title}</p>
                  <p className="truncate text-xs text-white/40">{p.date} · /blog/{p.slug}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => loadForEdit(p)} className="rounded-lg bg-turquoise-500/80 px-3 py-1.5 text-xs font-bold text-navy-950 hover:bg-turquoise-400">تعديل</button>
                  <a href={`/blog/${p.slug}`} target="_blank" rel="noopener" className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20">عرض</a>
                  <button onClick={() => remove(p.slug)} className="rounded-lg bg-rose-500/80 px-3 py-1.5 text-xs font-bold hover:bg-rose-500">حذف</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────── Packages ───────────────────────────── */
function PackagesTab({ headers, pw }: { headers: () => Record<string, string>; pw: string }) {
  const [list, setList] = useState<Pkg[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/dev/packages?password=${encodeURIComponent(pw)}`, { cache: "no-store" });
    if (res.ok) setList((await res.json()).packages ?? []);
  }, [pw]);
  useEffect(() => { load(); }, [load]);

  const edit = (i: number, patch: Partial<Pkg>) => setList((l) => l.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const removeAt = (i: number) => setList((l) => l.filter((_, j) => j !== i));
  // includes[] helpers
  const setInclude = (i: number, k: number, v: string) => edit(i, { includes: (list[i].includes ?? []).map((x, j) => (j === k ? v : x)) });
  const addInclude = (i: number) => edit(i, { includes: [...(list[i].includes ?? []), "عنصر جديد"] });
  const delInclude = (i: number, k: number) => edit(i, { includes: (list[i].includes ?? []).filter((_, j) => j !== k) });
  // addons[] helpers
  const setAddon = (i: number, k: number, patch: Partial<{ label: string; price: number }>) =>
    edit(i, { addons: (list[i].addons ?? []).map((a, j) => (j === k ? { ...a, ...patch } : a)) });
  const addAddon = (i: number) =>
    edit(i, { addons: [...(list[i].addons ?? []), { id: "ad-" + Date.now().toString(36), label: "إضافة جديدة", price: 100 }] });
  const delAddon = (i: number, k: number) => edit(i, { addons: (list[i].addons ?? []).filter((_, j) => j !== k) });
  const add = () =>
    setList((l) => [
      ...l,
      { id: "pkg-" + Date.now().toString(36), emoji: "🛥️", title: "باقة جديدة", subtitle: "وصف الباقة", oldPrice: 1000, price: 800, unit: "ريال / رحلة", capacity: "لـ 5 أشخاص", accent: "turquoise", baseDuration: "4 ساعات", maxBase: 5, extraPerPerson: 100, maxPersons: 11, yacht: "يتسع لـ11 شخص · غرفة نوم · مطبخ · دورة مياه" },
    ]);

  async function save() {
    setSaving(true); setMsg("");
    try {
      const res = await fetch("/api/dev/packages", { method: "PUT", headers: headers(), body: JSON.stringify({ packages: list }) });
      if (!res.ok) throw new Error("تعذّر الحفظ");
      setMsg("✅ تم حفظ الباقات ونشرها على الموقع!");
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "خطأ"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/50">عدّل الباقات الحالية أو أضف باقات جديدة، ثم احفظ لتظهر على الموقع.</p>
        <div className="flex gap-2">
          <button onClick={add} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20">+ باقة</button>
          <button onClick={save} disabled={saving} className="rounded-xl bg-gradient-to-l from-turquoise-500 to-gold-500 px-5 py-2 text-sm font-bold text-navy-950 disabled:opacity-60">{saving ? "..." : "حفظ ونشر"}</button>
        </div>
      </div>
      {msg && <p className="mt-3 text-sm font-semibold text-white/80">{msg}</p>}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {list.map((p, i) => (
          <div key={p.id} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <input value={p.emoji} onChange={(e) => edit(i, { emoji: e.target.value })} className="w-14 rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-center text-2xl" />
              <input value={p.title} onChange={(e) => edit(i, { title: e.target.value })} className="dv-in flex-1 font-bold" />
              <button onClick={() => removeAt(i)} className="rounded-lg bg-rose-500/70 px-3 py-1.5 text-xs font-bold">حذف</button>
            </div>
            <input value={p.subtitle} onChange={(e) => edit(i, { subtitle: e.target.value })} className="dv-in mt-3 w-full text-sm" />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <L label="السعر"><input type="number" value={p.price} onChange={(e) => edit(i, { price: +e.target.value })} className="dv-in w-full" /></L>
              <L label="قبل الخصم"><input type="number" value={p.oldPrice} onChange={(e) => edit(i, { oldPrice: +e.target.value })} className="dv-in w-full" /></L>
              <L label="الوحدة"><input value={p.unit} onChange={(e) => edit(i, { unit: e.target.value })} className="dv-in w-full" /></L>
              <L label="السعة"><input value={p.capacity} onChange={(e) => edit(i, { capacity: e.target.value })} className="dv-in w-full" /></L>
              <L label="المدة الأساسية"><input value={p.baseDuration} onChange={(e) => edit(i, { baseDuration: e.target.value })} className="dv-in w-full" /></L>
              <L label="السعر الأساسي يغطي"><input type="number" value={p.maxBase} onChange={(e) => edit(i, { maxBase: +e.target.value })} className="dv-in w-full" /></L>
              <L label="سعر الشخص الإضافي"><input type="number" value={p.extraPerPerson} onChange={(e) => edit(i, { extraPerPerson: +e.target.value })} className="dv-in w-full" /></L>
              <L label="الحد الأقصى للأشخاص"><input type="number" value={p.maxPersons} onChange={(e) => edit(i, { maxPersons: +e.target.value })} className="dv-in w-full" /></L>
            </div>

            <L label="وصف اليخت"><textarea value={p.yacht} onChange={(e) => edit(i, { yacht: e.target.value })} rows={2} className="dv-in mt-3 w-full" /></L>
            <L label="ملاحظة (اختياري)"><textarea value={p.note ?? ""} onChange={(e) => edit(i, { note: e.target.value })} rows={2} className="dv-in mt-3 w-full" /></L>

            {/* includes */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-white/40">يشمل الباقة</span>
              <button onClick={() => addInclude(i)} className="rounded-md bg-white/10 px-2 py-1 text-[11px] font-bold hover:bg-white/20">+ عنصر</button>
            </div>
            <div className="mt-1 flex flex-col gap-1">
              {(p.includes ?? []).map((inc, k) => (
                <div key={k} className="flex gap-1">
                  <input value={inc} onChange={(e) => setInclude(i, k, e.target.value)} className="dv-in w-full text-sm" />
                  <button onClick={() => delInclude(i, k)} className="rounded-md bg-rose-500/60 px-2 text-xs font-bold">✕</button>
                </div>
              ))}
            </div>

            {/* addons */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-white/40">الإضافات الاختيارية (السعر بالريال)</span>
              <button onClick={() => addAddon(i)} className="rounded-md bg-white/10 px-2 py-1 text-[11px] font-bold hover:bg-white/20">+ إضافة</button>
            </div>
            <div className="mt-1 flex flex-col gap-1">
              {(p.addons ?? []).map((ad, k) => (
                <div key={ad.id} className="flex gap-1">
                  <input value={ad.label} onChange={(e) => setAddon(i, k, { label: e.target.value })} className="dv-in w-full text-sm" />
                  <input type="number" value={ad.price} onChange={(e) => setAddon(i, k, { price: +e.target.value })} className="dv-in w-20 text-sm" />
                  <button onClick={() => delAddon(i, k)} className="rounded-md bg-rose-500/60 px-2 text-xs font-bold">✕</button>
                </div>
              ))}
            </div>

            <label className="mt-3 flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" checked={!!p.featured} onChange={(e) => edit(i, { featured: e.target.checked })} className="h-4 w-4 accent-gold-500" />
              باقة مميزة
            </label>
          </div>
        ))}
      </div>
      <style>{`.dv-in{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:9px 12px;color:#fff;outline:none}.dv-in:focus{border-color:#21c0c0}`}</style>
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-white/40">{label}</span>
      {children}
    </label>
  );
}

/* ───────────────────────────── Site Settings ───────────────────────────── */
function SettingsTab({ headers, pw }: { headers: () => Record<string, string>; pw: string }) {
  const [s, setS] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/dev/settings?password=${encodeURIComponent(pw)}`, { cache: "no-store" });
    if (res.ok) setS((await res.json()).settings);
  }, [pw]);
  useEffect(() => { load(); }, [load]);

  if (!s) return <p className="text-sm text-white/50">جاري التحميل...</p>;
  const set = (patch: Partial<SiteSettings>) => setS((cur) => (cur ? { ...cur, ...patch } : cur));
  const setSoc = (k: number, patch: Partial<SocialLink>) => set({ socials: s.socials.map((x, j) => (j === k ? { ...x, ...patch } : x)) });
  const addSoc = () => set({ socials: [...s.socials, { key: "whatsapp", label: "رابط جديد", href: "https://" }] });
  const delSoc = (k: number) => set({ socials: s.socials.filter((_, j) => j !== k) });
  const setHero = (patch: Partial<SiteSettings["hero"]>) => set({ hero: { ...s.hero, ...patch } });
  const setStat = (k: number, patch: Partial<SiteSettings["stats"][number]>) => set({ stats: s.stats.map((x, j) => (j === k ? { ...x, ...patch } : x)) });
  const setReview = (k: number, patch: Partial<SiteSettings["reviews"][number]>) => set({ reviews: s.reviews.map((x, j) => (j === k ? { ...x, ...patch } : x)) });
  const addReview = () => set({ reviews: [...s.reviews, { name: "اسم العميل", rating: 5, when: "", text: "نص التقييم" }] });
  const delReview = (k: number) => set({ reviews: s.reviews.filter((_, j) => j !== k) });

  async function save() {
    setSaving(true); setMsg("");
    try {
      const res = await fetch("/api/dev/settings", { method: "PUT", headers: headers(), body: JSON.stringify({ settings: s }) });
      if (!res.ok) throw new Error("تعذّر الحفظ");
      setMsg("✅ تم حفظ الإعدادات ونشرها على الموقع!");
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "خطأ"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/50">عدّل بيانات التواصل والسوشيال والخصم والحساب البنكي — تنطبق على الموقع كله فورًا بعد الحفظ.</p>
        <button onClick={save} disabled={saving} className="rounded-xl bg-gradient-to-l from-turquoise-500 to-gold-500 px-5 py-2 text-sm font-bold text-navy-950 disabled:opacity-60">{saving ? "..." : "حفظ ونشر"}</button>
      </div>
      {msg && <p className="mt-3 text-sm font-semibold text-white/80">{msg}</p>}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* contact */}
        <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
          <h3 className="text-lg font-extrabold">📞 بيانات التواصل</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <L label="اسم العلامة (عربي)"><input value={s.brand} onChange={(e) => set({ brand: e.target.value })} className="dv-in w-full" /></L>
            <L label="اسم العلامة (إنجليزي)"><input value={s.brandEn} onChange={(e) => set({ brandEn: e.target.value })} className="dv-in w-full" /></L>
            <L label="رقم الهاتف"><input value={s.phone} onChange={(e) => set({ phone: e.target.value })} dir="ltr" className="dv-in w-full" /></L>
            <L label="واتساب (أرقام فقط)"><input value={s.whatsapp} onChange={(e) => set({ whatsapp: e.target.value.replace(/\D/g, "") })} dir="ltr" className="dv-in w-full" /></L>
            <L label="البريد الإلكتروني"><input value={s.email} onChange={(e) => set({ email: e.target.value })} dir="ltr" className="dv-in w-full" /></L>
            <L label="الموقع/المدينة"><input value={s.location} onChange={(e) => set({ location: e.target.value })} className="dv-in w-full" /></L>
          </div>
        </div>

        {/* discount + bank */}
        <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
          <h3 className="text-lg font-extrabold">💳 الخصم والحساب البنكي</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <L label="نسبة الخصم %"><input type="number" value={s.discountPct} onChange={(e) => set({ discountPct: +e.target.value })} className="dv-in w-full" /></L>
            <L label="البنك"><input value={s.bankName} onChange={(e) => set({ bankName: e.target.value })} className="dv-in w-full" /></L>
            <L label="اسم الحساب"><input value={s.accName} onChange={(e) => set({ accName: e.target.value })} className="dv-in w-full" /></L>
            <L label="الآيبان IBAN"><input value={s.iban} onChange={(e) => set({ iban: e.target.value })} dir="ltr" className="dv-in w-full font-mono" /></L>
          </div>
          <L label="نص الخصم (عربي)"><input value={s.discountAr} onChange={(e) => set({ discountAr: e.target.value })} className="dv-in mt-3 w-full" /></L>
          <L label="نص الخصم (إنجليزي)"><input value={s.discountEn} onChange={(e) => set({ discountEn: e.target.value })} dir="ltr" className="dv-in mt-3 w-full" /></L>
        </div>

        {/* socials */}
        <div className="lg:col-span-2 rounded-[22px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold">🔗 روابط السوشيال ميديا</h3>
            <button onClick={addSoc} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20">+ رابط</button>
          </div>
          <p className="mt-1 text-[11px] text-white/40">المفتاح يحدّد الأيقونة: whatsapp · instagram · snapchat · tiktok · telegram · facebook · youtube</p>
          <div className="mt-4 grid gap-2">
            {s.socials.map((soc, k) => (
              <div key={k} className="grid grid-cols-[8rem_8rem_1fr_auto] gap-2">
                <input value={soc.key} onChange={(e) => setSoc(k, { key: e.target.value })} placeholder="المفتاح" className="dv-in text-sm" dir="ltr" />
                <input value={soc.label} onChange={(e) => setSoc(k, { label: e.target.value })} placeholder="الاسم" className="dv-in text-sm" />
                <input value={soc.href} onChange={(e) => setSoc(k, { href: e.target.value })} placeholder="https://" className="dv-in text-sm" dir="ltr" />
                <button onClick={() => delSoc(k)} className="rounded-md bg-rose-500/60 px-3 text-xs font-bold">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* homepage hero */}
        <div className="lg:col-span-2 rounded-[22px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
          <h3 className="text-lg font-extrabold">🏠 الصفحة الرئيسية — الواجهة (الهيرو)</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <L label="الشريط العلوي (عربي)"><input value={s.hero.badgeAr} onChange={(e) => setHero({ badgeAr: e.target.value })} className="dv-in w-full" /></L>
            <L label="الشريط العلوي (إنجليزي)"><input value={s.hero.badgeEn} onChange={(e) => setHero({ badgeEn: e.target.value })} dir="ltr" className="dv-in w-full" /></L>
            <L label="العنوان الرئيسي (عربي)"><input value={s.hero.titleAr} onChange={(e) => setHero({ titleAr: e.target.value })} className="dv-in w-full" /></L>
            <L label="العنوان الرئيسي (إنجليزي)"><input value={s.hero.titleEn} onChange={(e) => setHero({ titleEn: e.target.value })} dir="ltr" className="dv-in w-full" /></L>
            <L label="العنوان الفرعي (عربي)"><input value={s.hero.subtitleAr} onChange={(e) => setHero({ subtitleAr: e.target.value })} className="dv-in w-full" /></L>
            <L label="العنوان الفرعي (إنجليزي)"><input value={s.hero.subtitleEn} onChange={(e) => setHero({ subtitleEn: e.target.value })} dir="ltr" className="dv-in w-full" /></L>
          </div>
        </div>

        {/* stats */}
        <div className="lg:col-span-2 rounded-[22px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
          <h3 className="text-lg font-extrabold">📊 الإحصائيات</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {s.stats.map((st, k) => (
              <div key={k} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="grid grid-cols-2 gap-2">
                  <L label="الرقم"><input type="number" value={st.value} onChange={(e) => setStat(k, { value: +e.target.value })} className="dv-in w-full" /></L>
                  <L label="اللاحقة (% / k)"><input value={st.suffix} onChange={(e) => setStat(k, { suffix: e.target.value })} dir="ltr" className="dv-in w-full" /></L>
                  <L label="الوصف (عربي)"><input value={st.labelAr} onChange={(e) => setStat(k, { labelAr: e.target.value })} className="dv-in w-full" /></L>
                  <L label="الوصف (إنجليزي)"><input value={st.labelEn} onChange={(e) => setStat(k, { labelEn: e.target.value })} dir="ltr" className="dv-in w-full" /></L>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* reviews */}
        <div className="lg:col-span-2 rounded-[22px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-extrabold">⭐ آراء العملاء</h3>
            <div className="flex gap-2 rounded-full border border-white/10 bg-white/5 p-1">
              {(["auto", "manual"] as const).map((m) => (
                <button key={m} onClick={() => set({ reviewsMode: m })}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${s.reviewsMode === m ? "bg-white text-navy-950" : "text-white/70 hover:text-white"}`}>
                  {m === "auto" ? "تلقائي (Google)" : "يدوي (المحدّدة بالأسفل)"}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-1 text-[11px] text-white/40">«تلقائي» يعرض تقييمات Google عند توفّر المفتاح (وإلا تقييمات افتراضية). «يدوي» يعرض التقييمات التي تكتبها هنا فقط.</p>
          <div className="mt-3 flex items-center justify-end">
            <button onClick={addReview} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20">+ تقييم</button>
          </div>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            {s.reviews.map((rv, k) => (
              <div key={k} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex gap-2">
                  <input value={rv.name} onChange={(e) => setReview(k, { name: e.target.value })} placeholder="اسم العميل" className="dv-in flex-1 text-sm font-bold" />
                  <select value={rv.rating} onChange={(e) => setReview(k, { rating: +e.target.value })} className="dv-in text-sm">
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n} className="text-navy-950">{n} ★</option>)}
                  </select>
                  <button onClick={() => delReview(k)} className="rounded-md bg-rose-500/60 px-2.5 text-xs font-bold">✕</button>
                </div>
                <textarea value={rv.text} onChange={(e) => setReview(k, { text: e.target.value })} placeholder="نص التقييم" rows={2} className="dv-in mt-2 w-full text-sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`.dv-in{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:9px 12px;color:#fff;outline:none}.dv-in:focus{border-color:#21c0c0}`}</style>
    </div>
  );
}

function Aurora() {
  return (
    <div className="pointer-events-none fixed inset-0">
      <motion.div
        className="absolute -left-40 -top-40 h-[40rem] w-[40rem] rounded-full bg-violet-600/20 blur-[120px]"
        animate={{ x: [0, 80, 0], y: [0, 60, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-40 top-20 h-[36rem] w-[36rem] rounded-full bg-turquoise-500/20 blur-[120px]"
        animate={{ x: [0, -70, 0], y: [0, 80, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-[32rem] w-[32rem] rounded-full bg-gold-500/15 blur-[120px]"
        animate={{ x: [0, 60, 0], y: [0, -50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
