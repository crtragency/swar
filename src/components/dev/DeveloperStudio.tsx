"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { BlogPost } from "@/lib/blog";
import type { Pkg } from "@/lib/packages";

type Tab = "posts" | "packages";

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
                {(["posts", "packages"] as Tab[]).map((tk) => (
                  <button
                    key={tk}
                    onClick={() => setTab(tk)}
                    className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                      tab === tk ? "bg-white text-navy-950" : "text-white/70 hover:text-white"
                    }`}
                  >
                    {tk === "posts" ? "المقالات" : "الباقات"}
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
                  {tab === "posts" ? <PostsTab headers={headers} pw={pw} /> : <PackagesTab headers={headers} pw={pw} />}
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
function PostsTab({ headers, pw }: { headers: () => Record<string, string>; pw: string }) {
  const [title, setTitle] = useState("");
  const [keyphrase, setKeyphrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<BlogPost | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [msg, setMsg] = useState("");
  const [publishing, setPublishing] = useState(false);

  const loadPosts = useCallback(async () => {
    const res = await fetch(`/api/dev/posts?password=${encodeURIComponent(pw)}`, { cache: "no-store" });
    if (res.ok) setPosts((await res.json()).posts ?? []);
  }, [pw]);
  useEffect(() => { loadPosts(); }, [loadPosts]);

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

  async function publish() {
    if (!draft) return;
    setPublishing(true);
    try {
      const res = await fetch("/api/dev/posts", { method: "POST", headers: headers(), body: JSON.stringify({ post: draft }) });
      if (!res.ok) throw new Error("تعذّر النشر");
      setMsg("✅ تم نشر المقال على الموقع!");
      setDraft(null); setTitle(""); setKeyphrase("");
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

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* generator */}
      <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
        <h2 className="flex items-center gap-2 text-xl font-extrabold">✨ توليد مقال جديد</h2>
        <p className="mt-1 text-sm text-white/50">اكتب العنوان، ويقوم الذكاء الاصطناعي بكتابة المقال كاملاً ومحسّناً للسيو.</p>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان المقال المقترح..." className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-turquoise-400" />
        <input value={keyphrase} onChange={(e) => setKeyphrase(e.target.value)} placeholder="الكلمة المفتاحية (اختياري)" className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-turquoise-400" />
        <button onClick={generate} disabled={loading} className="group relative mt-5 w-full overflow-hidden rounded-2xl bg-gradient-to-l from-violet-600 via-turquoise-500 to-gold-500 py-3.5 font-bold text-navy-950 transition hover:brightness-110 disabled:opacity-60">
          {loading ? "⏳ جاري التوليد..." : "✨ توليد بالذكاء الاصطناعي"}
        </button>
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

      {/* published list */}
      <div className="lg:col-span-2 rounded-[26px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
        <h2 className="text-xl font-extrabold">المقالات المنشورة ({posts.length})</h2>
        {posts.length === 0 ? (
          <p className="mt-4 text-sm text-white/40">لا توجد مقالات منشورة من الاستوديو بعد.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {posts.map((p) => (
              <div key={p.slug} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-bold">{p.title}</p>
                  <p className="truncate text-xs text-white/40">{p.date} · /blog/{p.slug}</p>
                </div>
                <div className="flex shrink-0 gap-2">
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
