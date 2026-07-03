"use client";

import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Booking } from "@/lib/store";
import TripSchedule, { fmt12h } from "@/components/dashboard/TripSchedule";

function thisMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function lastMonth() {
  const d = new Date(); d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function today() { return new Date().toISOString().slice(0, 10); }
function fmt(n: number) { return n.toLocaleString("ar-SA"); }
function toH(t: string) { const [h, m] = t.split(":").map(Number); return h + (m || 0) / 60; }

const STATUS_LABEL: Record<Booking["status"], string> = { pending: "قيد الانتظار", confirmed: "مؤكد", cancelled: "ملغي" };
const STATUS_CLASS: Record<Booking["status"], string> = { pending: "bg-amber-100 text-amber-700", confirmed: "bg-emerald-100 text-emerald-700", cancelled: "bg-red-100 text-red-700" };

const EXPENSE_CATS = ["وقود", "صيانة", "رواتب", "تسويق", "تموينات", "رسوم", "أخرى"];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
};

type DashUser = "owner" | "captain";
type ExpenseItem = { id: string; createdAt: string; date: string; category: string; description: string; amount: number };
type EditState = { id: string; status: Booking["status"]; name: string; phone: string; date: string; departTime: string; persons: number; total: number; paid: number; notes: string; payMethod: Booking["payMethod"] };

// ─── Quick Booking Form ────────────────────────────────────────────────────
const TIMES = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
function timeLabel(t: string) { const h = parseInt(t, 10); const am = h < 12; return `${h % 12 === 0 ? 12 : h % 12}:00 ${am ? "ص" : "م"}`; }

function QuickBookingForm({ password, onDone, user = "owner" }: { password: string; onDone: () => void; user?: DashUser }) {
  const [pkgTitle, setPkgTitle] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("13:00");
  const [price, setPrice] = useState("");
  const [paid, setPaid] = useState("");
  const [payMethod, setPayMethod] = useState<"bank" | "online" | "pos" | "cash">("bank");
  const [persons, setPersons] = useState(2);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Booking["status"]>("confirmed");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const durationHours = Math.max(0.5, toH(endTime) - toH(startTime));

  async function submit() {
    setError("");
    if (!pkgTitle.trim()) return setError("يرجى إدخال اسم الباقة / النشاط");
    if (!name.trim()) return setError("يرجى إدخال اسم العميل");
    if (!date) return setError("يرجى اختيار تاريخ الرحلة");
    if (!price || Number(price) <= 0) return setError("يرجى إدخال السعر");
    if (toH(endTime) <= toH(startTime)) return setError("وقت الانتهاء يجب أن يكون بعد وقت البدء");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bookings?user=${user}&password=${encodeURIComponent(password)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: "custom", packageTitle: pkgTitle.trim(), option: "",
          persons, addons: [], date, departTime: startTime,
          durationHours,
          name: name.trim(), phone: phone.trim(), notes: notes.trim(),
          payMethod, payType: "full", deposit: 0,
          total: Number(price), amountDue: Number(price),
          paid: Number(paid) || 0, promo: "",
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحجز");
      setDone(true);
      setTimeout(onDone, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) return (
    <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">✓</div>
      <p className="font-extrabold text-slate-800">تم تسجيل الرحلة وحجب الوقت</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white p-6 shadow-sm" dir="rtl">
      <h3 className="mb-5 text-lg font-extrabold text-slate-800">🚤 حجز سريع — بسعر مخصص</h3>

      <label className="ow-block"><span className="ow-label">اسم الباقة / النشاط</span>
        <input value={pkgTitle} onChange={(e) => setPkgTitle(e.target.value)} placeholder="مثال: رحلة خاصة VIP" className="ow-in" />
      </label>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="ow-block"><span className="ow-label">اسم العميل</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم الكامل" className="ow-in" />
        </label>
        <label className="ow-block"><span className="ow-label">رقم الجوال</span>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XXXXXXXX" className="ow-in" dir="ltr" />
        </label>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <label className="ow-block"><span className="ow-label">تاريخ الرحلة</span>
          <input type="date" value={date} min={today()} onChange={(e) => setDate(e.target.value)} className="ow-in" />
        </label>
        <label className="ow-block"><span className="ow-label">وقت البدء</span>
          <select value={startTime} onChange={(e) => setStartTime(e.target.value)} className="ow-in">
            {TIMES.map((t) => <option key={t} value={t}>{timeLabel(t)}</option>)}
          </select>
        </label>
        <label className="ow-block"><span className="ow-label">وقت الانتهاء</span>
          <select value={endTime} onChange={(e) => setEndTime(e.target.value)} className="ow-in">
            {TIMES.map((t) => <option key={t} value={t}>{timeLabel(t)}</option>)}
          </select>
        </label>
      </div>

      {durationHours > 0 && (
        <p className="mt-1.5 text-xs text-teal-600 font-semibold">
          ⏱️ مدة الرحلة: {durationHours} ساعة — سيُحجب الوقت من {timeLabel(startTime)} حتى {timeLabel(endTime)} + ساعة تنظيف
        </p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="ow-block"><span className="ow-label">السعر الإجمالي (ريال)</span>
          <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className="ow-in" />
        </label>
        <label className="ow-block"><span className="ow-label">المبلغ المدفوع (ريال)</span>
          <input type="number" min={0} value={paid} onChange={(e) => setPaid(e.target.value)} placeholder="0" className="ow-in" />
        </label>
        <label className="ow-block"><span className="ow-label">المبلغ المتبقي (ريال)</span>
          <input
            type="text"
            readOnly
            tabIndex={-1}
            value={`${Math.max(0, (Number(price) || 0) - (Number(paid) || 0)).toLocaleString("ar-SA")} ريال`}
            className={`ow-in cursor-default font-extrabold ${Math.max(0, (Number(price) || 0) - (Number(paid) || 0)) > 0 ? "ow-remaining-due" : "ow-remaining-paid"}`}
          />
        </label>
        <label className="ow-block"><span className="ow-label">عدد الأشخاص</span>
          <input type="number" min={1} max={20} value={persons} onChange={(e) => setPersons(+e.target.value)} className="ow-in" />
        </label>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="ow-block"><span className="ow-label">طريقة الدفع</span>
          <select value={payMethod} onChange={(e) => setPayMethod(e.target.value as "bank" | "online" | "pos" | "cash")} className="ow-in">
            <option value="bank">💳 تحويل بنكي</option>
            <option value="cash">💵 نقدي</option>
            <option value="online">🌐 عبر الموقع</option>
            <option value="pos">🖥️ نقطة بيع</option>
          </select>
        </label>
        <label className="ow-block"><span className="ow-label">حالة الحجز</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as Booking["status"])} className="ow-in">
            <option value="confirmed">✅ مؤكد</option>
            <option value="pending">⏳ قيد الانتظار</option>
          </select>
        </label>
      </div>

      <label className="ow-block mt-3"><span className="ow-label">ملاحظات</span>
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أي طلبات خاصة..." className="ow-in resize-none" />
      </label>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-800 px-5 py-4 text-white">
        <span className="text-xs text-white/60">إجمالي الرحلة</span>
        <span className="text-2xl font-extrabold text-amber-400">{price ? Number(price).toLocaleString() : "—"} <span className="text-sm font-normal text-white/60">ريال</span></span>
      </div>

      {error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}
      <button onClick={submit} disabled={submitting} className="mt-4 w-full rounded-xl bg-slate-800 py-3.5 font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-50">
        {submitting ? "جاري التسجيل..." : "تسجيل الرحلة وحجب الوقت"}
      </button>

      <style>{`.ow-block{display:block}.ow-label{display:block;font-size:.75rem;font-weight:600;color:#64748b;margin-bottom:4px}.ow-in{width:100%;padding:9px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;font-family:inherit;font-size:.875rem;color:#1e293b;outline:none;transition:border-color .15s}.ow-in:focus{border-color:#0d9488;background:#f0fdfa}.ow-remaining-due{background:#fffbeb;border-color:#fde68a;color:#b45309}.ow-remaining-paid{background:#ecfdf5;border-color:#a7f3d0;color:#047857}`}</style>
    </motion.div>
  );
}

// ─── Expenses Panel ────────────────────────────────────────────────────────
function ExpensesPanel({ password, bookings, user = "owner" }: { password: string; bookings: Booking[]; user?: DashUser }) {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(thisMonth());
  const [monthOpen, setMonthOpen] = useState(false);
  const [form, setForm] = useState({ date: today(), category: "أخرى", description: "", amount: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadExpenses() {
    setLoading(true);
    try {
      const res = await fetch(`/api/expenses?user=${user}&password=${encodeURIComponent(password)}`, { cache: "no-store" });
      const data = await res.json();
      setExpenses(data.expenses ?? []);
    } catch { /* silent */ } finally { setLoading(false); }
  }

  useEffect(() => { loadExpenses(); }, []);

  async function addExp() {
    setError("");
    if (!form.amount || Number(form.amount) <= 0) return setError("يرجى إدخال المبلغ");
    if (!form.date) return setError("يرجى إدخال التاريخ");
    setSaving(true);
    try {
      const res = await fetch(`/api/expenses?user=${user}&password=${encodeURIComponent(password)}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      if (!res.ok) throw new Error("فشل الحفظ");
      const data = await res.json();
      setExpenses((prev) => [{ ...form, amount: Number(form.amount), id: data.id, createdAt: new Date().toISOString() }, ...prev]);
      setForm({ date: today(), category: "أخرى", description: "", amount: "" });
    } catch (e) { setError(e instanceof Error ? e.message : "خطأ"); } finally { setSaving(false); }
  }

  async function delExp(id: string) {
    if (!confirm("حذف هذا المصروف؟")) return;
    await fetch(`/api/expenses?user=${user}&password=${encodeURIComponent(password)}&id=${id}`, { method: "DELETE" });
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  const filtered = expenses.filter((e) => e.date.startsWith(month));
  const totalExp = filtered.reduce((s, e) => s + e.amount, 0);
  const totalRev = bookings.filter((b) => b.status === "confirmed" && b.date.startsWith(month)).reduce((s, b) => s + b.total, 0);
  const profit = totalRev - totalExp;

  const months: string[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  return (
    <motion.div key="expenses" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }}>
      {/* Month selector (dropdown) */}
      <div className="mb-4" dir="rtl">
        <div className="relative inline-block">
          <button
            type="button"
            onClick={() => setMonthOpen((o) => !o)}
            className="flex min-w-[180px] items-center justify-between gap-3 rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            <span className="whitespace-nowrap">
              {new Date(month + "-15").toLocaleString("ar-SA", { month: "long", year: "numeric" })}
            </span>
            <svg
              className={`h-4 w-4 shrink-0 transition-transform ${monthOpen ? "rotate-180" : ""}`}
              viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
          {monthOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMonthOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 max-h-64 w-full min-w-[180px] overflow-y-auto rounded-xl border border-slate-100 bg-white py-1 shadow-lg">
                {months.map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMonth(m); setMonthOpen(false); }}
                    className={`block w-full whitespace-nowrap px-4 py-2 text-right text-sm font-bold transition-colors ${month === m ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                  >
                    {new Date(m + "-15").toLocaleString("ar-SA", { month: "long", year: "numeric" })}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* P&L Summary */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-lg">
          <div className="text-xs text-white/70">الإيرادات (مؤكدة)</div>
          <div className="mt-1 text-xl font-extrabold">{fmt(totalRev)} ريال</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-4 text-white shadow-lg">
          <div className="text-xs text-white/70">إجمالي المصاريف</div>
          <div className="mt-1 text-xl font-extrabold">{fmt(totalExp)} ريال</div>
        </div>
        <div className={`rounded-2xl p-4 text-white shadow-lg ${profit >= 0 ? "bg-gradient-to-br from-blue-600 to-indigo-700" : "bg-gradient-to-br from-orange-500 to-red-600"}`}>
          <div className="text-xs text-white/70">صافي الربح</div>
          <div className="mt-1 text-xl font-extrabold">{profit >= 0 ? "+" : ""}{fmt(profit)} ريال</div>
        </div>
      </div>

      {/* Add Expense Form */}
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm" dir="rtl">
        <h4 className="mb-3 font-extrabold text-slate-800">➕ إضافة مصروف</h4>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className="ow-block"><span className="ow-label">التاريخ</span>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="ow-in" />
          </label>
          <label className="ow-block"><span className="ow-label">التصنيف</span>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="ow-in">
              {EXPENSE_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="ow-block"><span className="ow-label">البيان</span>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="وصف المصروف" className="ow-in" />
          </label>
          <label className="ow-block"><span className="ow-label">المبلغ (ريال)</span>
            <input type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" className="ow-in" />
          </label>
        </div>
        {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
        <button onClick={addExp} disabled={saving} className="mt-3 rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-50">
          {saving ? "جاري الحفظ..." : "حفظ المصروف"}
        </button>
        <style>{`.ow-block{display:block}.ow-label{display:block;font-size:.75rem;font-weight:600;color:#64748b;margin-bottom:4px}.ow-in{width:100%;padding:9px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;font-family:inherit;font-size:.875rem;color:#1e293b;outline:none}.ow-in:focus{border-color:#0d9488;background:#f0fdfa}`}</style>
      </div>

      {/* Expenses List */}
      {loading ? (
        <p className="text-center text-slate-400">جاري التحميل...</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-center text-slate-400 shadow-sm">لا توجد مصاريف لهذا الشهر</p>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm" dir="rtl">
          {filtered.map((e, i) => (
            <div key={e.id} className={`flex items-center gap-3 px-5 py-3 ${i < filtered.length - 1 ? "border-b border-slate-100" : ""}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{e.category}</span>
                  {e.description && <span className="truncate text-sm text-slate-700">{e.description}</span>}
                </div>
                <div className="mt-0.5 text-xs text-slate-400">{e.date}</div>
              </div>
              <div className="text-right">
                <div className="font-extrabold text-red-600">−{fmt(e.amount)} ريال</div>
              </div>
              <button onClick={() => delExp(e.id)} className="rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors">🗑️</button>
            </div>
          ))}
          <div className="flex items-center justify-between border-t-2 border-slate-200 px-5 py-3">
            <span className="font-bold text-slate-600">الإجمالي</span>
            <span className="text-lg font-extrabold text-red-600">{fmt(totalExp)} ريال</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────
export default function OwnerDashboard({
  user = "owner",
  title = "لوحة المالك",
  subtitle = "سوار البحرية — الإيرادات والتقارير",
}: {
  user?: DashUser;
  title?: string;
  subtitle?: string;
} = {}) {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "bookings" | "schedule" | "new" | "expenses">("overview");
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "pending" | "cancelled">("all");
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  async function load(pass = password) {
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/bookings?user=${user}&password=${encodeURIComponent(pass)}`, { cache: "no-store" });
      if (res.status === 401) throw new Error("كلمة المرور غير صحيحة");
      if (!res.ok) throw new Error("تعذّر تحميل البيانات");
      const data = await res.json();
      setBookings(data.bookings ?? []);
      setAuthed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ");
    } finally { setLoading(false); }
  }

  const stats = useMemo(() => {
    const cm = thisMonth(); const lm = lastMonth(); const td = today();
    const confirmed = bookings.filter((b) => b.status === "confirmed");
    const pending = bookings.filter((b) => b.status === "pending");
    const cancelled = bookings.filter((b) => b.status === "cancelled");
    const totalRevenue = confirmed.reduce((s, b) => s + b.total, 0);
    const thisMonthRevenue = confirmed.filter((b) => b.date.startsWith(cm)).reduce((s, b) => s + b.total, 0);
    const lastMonthRevenue = confirmed.filter((b) => b.date.startsWith(lm)).reduce((s, b) => s + b.total, 0);
    const todayRevenue = confirmed.filter((b) => b.date === td).reduce((s, b) => s + b.total, 0);
    const bank = confirmed.filter((b) => b.payMethod === "bank").reduce((s, b) => s + b.total, 0);
    const cash = confirmed.filter((b) => b.payMethod === "cash").reduce((s, b) => s + b.total, 0);
    const online = confirmed.filter((b) => b.payMethod === "online").reduce((s, b) => s + b.total, 0);
    const pos = confirmed.filter((b) => b.payMethod === "pos").reduce((s, b) => s + b.total, 0);
    const pendingRevenue = pending.reduce((s, b) => s + b.total, 0);
    const byPkg: Record<string, number> = {};
    confirmed.forEach((b) => { byPkg[b.packageTitle] = (byPkg[b.packageTitle] ?? 0) + b.total; });
    const pkgList = Object.entries(byPkg).sort((a, b) => b[1] - a[1]);
    return { total: bookings.length, confirmed: confirmed.length, pending: pending.length, cancelled: cancelled.length, totalRevenue, thisMonthRevenue, lastMonthRevenue, todayRevenue, bank, cash, online, pos, pendingRevenue, pkgList };
  }, [bookings]);

  async function saveEdit() {
    if (!editing) return;
    setSaving(true); setEditError("");
    try {
      const res = await fetch(`/api/bookings?user=${user}&password=${encodeURIComponent(password)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      setBookings((prev) => prev.map((b) => b.id === editing.id ? { ...b, ...editing } : b));
      setEditing(null);
    } catch (e) { setEditError(e instanceof Error ? e.message : "خطأ"); } finally { setSaving(false); }
  }

  async function deleteB(id: string) {
    if (!confirm("هل أنت متأكد من الحذف النهائي؟")) return;
    try {
      const res = await fetch(`/api/bookings?user=${user}&password=${encodeURIComponent(password)}&id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("فشل الحذف");
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (e) { alert(e instanceof Error ? e.message : "خطأ في الحذف"); }
  }

  if (!authed) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5" style={{ background: "linear-gradient(160deg,#020d18 0%,#051e30 45%,#082840 100%)" }}>
        <motion.div className="pointer-events-none absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
          <motion.div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 70%, rgba(13,148,136,0.18) 0%, transparent 70%)" }} animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 40% at 85% 15%, rgba(202,153,60,0.10) 0%, transparent 60%)" }} animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
          {[...Array(7)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full bg-teal-300/20" style={{ width: 3 + (i % 3), height: 3 + (i % 3), left: `${10 + i * 12}%`, top: `${15 + (i % 4) * 18}%` }} animate={{ y: [-16, 16, -16], opacity: [0.15, 0.5, 0.15] }} transition={{ duration: 5 + i * 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }} />
          ))}
          <motion.div className="absolute left-0 right-0 h-px" style={{ top: "55%", background: "linear-gradient(90deg, transparent, rgba(13,148,136,0.25), transparent)" }} animate={{ scaleX: [0.6, 1.2, 0.6], opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
        </motion.div>
        <motion.form onSubmit={(e) => { e.preventDefault(); load(); }} initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-sm rounded-[28px] bg-white p-8 shadow-[0_32px_80px_rgba(0,0,0,.6),0_0_0_1px_rgba(13,148,136,0.15)] backdrop-blur">
          <div className="mb-5 flex justify-center"><img src="/icon.webp" alt="سوار البحرية" className="h-16 w-auto object-contain" /></div>
          <h1 className="text-center text-2xl font-extrabold text-[#1a0a2e]">{title}</h1>
          <p className="mt-1 text-center text-sm text-[#1a0a2e]/50">{subtitle}</p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" className="own-in mt-6" autoComplete="current-password" />
          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm font-semibold text-red-600">{error}</motion.p>}
          <button type="submit" disabled={loading} className="mt-5 w-full rounded-xl bg-[#1a0a2e] py-3 font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-50">
            {loading ? <span className="flex items-center justify-center gap-2"><motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="inline-block">👑</motion.span>جاري الدخول...</span> : "دخول"}
          </button>
          <style>{`.own-in{width:100%;padding:12px 14px;background:#f5f0ff;border:1px solid #c4b5fd;border-radius:12px;outline:none;font-family:inherit;direction:ltr;text-align:center}.own-in:focus{border-color:#7c3aed;background:#ede9fe}`}</style>
        </motion.form>
      </div>
    );
  }

  const TABS = [
    { key: "overview", label: "نظرة عامة" },
    { key: "bookings", label: `الحجوزات (${bookings.length})` },
    { key: "schedule", label: "📅 الجدول" },
    { key: "new", label: "🚤 حجز سريع" },
    { key: "expenses", label: "📊 المصاريف" },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <motion.header initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-10 text-white shadow-[0_4px_32px_rgba(0,0,0,.5)]" style={{ background: "linear-gradient(135deg,#020d18,#051e30)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <img src="/icon.webp" alt="سوار البحرية" className="h-10 w-auto object-contain" />
            <div>
              <h1 className="text-base font-extrabold leading-none">{title}</h1>
              <p className="mt-0.5 text-xs text-white/40">{subtitle}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => load()} disabled={loading} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold transition-colors hover:bg-white/20 disabled:opacity-50">
              {loading ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="inline-block">⟳</motion.span> : "تحديث"}
            </button>
            <button onClick={() => { setAuthed(false); setPassword(""); setBookings([]); }} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold transition-colors hover:bg-white/20">خروج</button>
          </div>
        </div>
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-5 pb-3">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`relative whitespace-nowrap rounded-t-lg px-5 py-1.5 text-sm font-bold transition-colors ${tab === t.key ? "text-[#1a0a2e]" : "text-white/50 hover:text-white"}`}>
              {tab === t.key && <motion.span layoutId="owner-tab-bg" className="absolute inset-0 rounded-t-lg bg-white" style={{ zIndex: -1 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
              {t.label}
            </button>
          ))}
        </div>
      </motion.header>

      <div className="mx-auto max-w-5xl px-5 py-8">
        <AnimatePresence mode="wait">

          {tab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }}>
              <Label>الإيرادات (مؤكدة فقط)</Label>
              <motion.div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
                {[
                  { label: "إجمالي الإيرادات", value: `${fmt(stats.totalRevenue)} ريال`, sub: `${stats.confirmed} حجز مؤكد`, grad: "from-purple-600 to-violet-700" },
                  { label: "هذا الشهر", value: `${fmt(stats.thisMonthRevenue)} ريال`, grad: "from-violet-500 to-purple-600" },
                  { label: "الشهر الماضي", value: `${fmt(stats.lastMonthRevenue)} ريال`, grad: "from-indigo-500 to-violet-600" },
                  { label: "اليوم", value: `${fmt(stats.todayRevenue)} ريال`, grad: "from-blue-500 to-indigo-600" },
                ].map((c, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i} whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`rounded-2xl bg-gradient-to-br ${c.grad} p-5 text-white shadow-lg`}>
                    <div className="text-xs text-white/70">{c.label}</div>
                    <div className="mt-1 text-xl font-extrabold leading-tight">{c.value}</div>
                    {c.sub && <div className="mt-1 text-xs text-white/60">{c.sub}</div>}
                  </motion.div>
                ))}
              </motion.div>

              <Label>إحصاءات الحجوزات</Label>
              <motion.div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
                {[
                  { label: "إجمالي الحجوزات", value: stats.total, color: "text-slate-800" },
                  { label: "مؤكدة", value: stats.confirmed, color: "text-emerald-600" },
                  { label: "قيد الانتظار", value: stats.pending, color: "text-amber-600", sub: `${fmt(stats.pendingRevenue)} ريال` },
                  { label: "ملغية", value: stats.cancelled, color: "text-red-500" },
                ].map((c, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i + 4} whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="text-xs text-slate-400">{c.label}</div>
                    <div className={`mt-1 text-3xl font-extrabold ${c.color}`}>{c.value}</div>
                    {c.sub && <div className="mt-0.5 text-xs text-slate-400">{c.sub}</div>}
                  </motion.div>
                ))}
              </motion.div>

              <Label>طرق الدفع (مؤكدة)</Label>
              <motion.div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
                {[
                  { icon: "💳", label: "تحويل بنكي", value: stats.bank },
                  { icon: "💵", label: "نقدي", value: stats.cash },
                  { icon: "🌐", label: "دفع عبر الموقع", value: stats.online },
                  { icon: "🖥️", label: "نقطة بيع (POS)", value: stats.pos },
                ].map((p, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i + 8} whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="text-xs text-slate-400">{p.icon} {p.label}</div>
                    <div className="mt-1 text-2xl font-extrabold text-slate-800">{fmt(p.value)} ريال</div>
                  </motion.div>
                ))}
              </motion.div>

              {stats.pkgList.length > 0 && (
                <>
                  <Label>الإيرادات حسب الباقة</Label>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    {stats.pkgList.map(([pkg, rev], i) => {
                      const pct = stats.totalRevenue ? Math.round((rev / stats.totalRevenue) * 100) : 0;
                      return (
                        <motion.div key={pkg} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.07 }}
                          className={`flex items-center gap-4 px-5 py-4 ${i < stats.pkgList.length - 1 ? "border-b border-slate-100" : ""}`}>
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-semibold text-slate-800">{pkg}</div>
                            <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100">
                              <motion.div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-violet-400" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.4 + i * 0.07, ease: [0.22, 1, 0.36, 1] }} />
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-extrabold text-slate-800">{fmt(rev)} ريال</div>
                            <div className="text-xs text-slate-400">{pct}%</div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </motion.div>
          )}

          {tab === "bookings" && (
            <motion.div key="bookings" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }}>
              {/* status filter */}
              <div className="mb-4 flex gap-2 flex-wrap">
                {([["all", "الكل"], ["confirmed", "مؤكد"], ["pending", "قيد الانتظار"], ["cancelled", "ملغي"]] as const).map(([val, label]) => {
                  const count = val === "all" ? bookings.length : bookings.filter((b) => b.status === val).length;
                  return (
                    <button key={val} onClick={() => setStatusFilter(val)}
                      className={`rounded-full px-4 py-1.5 text-sm font-bold transition-all ${statusFilter === val ? "bg-slate-800 text-white" : "bg-white text-slate-500 shadow-sm hover:bg-slate-50"}`}>
                      {label} <span className="opacity-60">({count})</span>
                    </button>
                  );
                })}
              </div>
              {bookings.filter((b) => statusFilter === "all" || b.status === statusFilter).length === 0 ? (
                <p className="rounded-2xl bg-white p-8 text-center text-slate-400 shadow-sm">لا توجد حجوزات</p>
              ) : (
                <motion.div className="grid gap-4 lg:grid-cols-2" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
                  {bookings.filter((b) => statusFilter === "all" || b.status === statusFilter).map((b, i) => (
                    <motion.div key={b.id} variants={fadeUp} custom={i} whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(0,0,0,.09)" }} transition={{ type: "spring", stiffness: 300, damping: 24 }}
                      className="rounded-2xl bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-extrabold text-slate-800">{b.packageTitle}</p>
                          {b.option && <p className="text-xs font-semibold text-teal-600">{b.option}</p>}
                          <p className="font-mono text-xs text-slate-400">{b.id}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_CLASS[b.status]}`}>{STATUS_LABEL[b.status]}</span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <BInfo label="العميل" value={b.name} />
                        <BInfo label="الجوال" value={b.phone} ltr />
                        <BInfo label="التاريخ" value={b.date} ltr />
                        <BInfo label="الانطلاق" value={fmt12h(b.departTime) || "—"} />
                        <BInfo label="الأشخاص" value={String(b.persons)} />
                        <BInfo label="الإجمالي" value={`${fmt(b.total)} ريال`} />
                        <BInfo label="المدفوع" value={`${fmt(b.paid)} ريال`} />
                        <BInfo label="المتبقي" value={`${fmt(Math.max(0, b.total - b.paid))} ريال`} />
                        <BInfo label="الدفع" value={b.payMethod === "online" ? "دفع إلكتروني" : b.payMethod === "pos" ? "نقطة بيع" : b.payMethod === "cash" ? "نقدي" : "تحويل بنكي"} />
                      </div>
                      {b.addons.length > 0 && (
                        <div className="mt-3 rounded-xl bg-teal-50 px-3 py-2">
                          <span className="text-xs font-bold text-teal-600">➕ الإضافات: </span>
                          <span className="text-sm text-slate-700">{b.addons.join("، ")}</span>
                        </div>
                      )}
                      {b.notes && <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">📝 {b.notes}</p>}
                      <p className="mt-3 text-xs text-slate-400">{new Date(b.createdAt).toLocaleString("ar-SA")}</p>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => setEditing({ id: b.id, status: b.status, name: b.name, phone: b.phone, date: b.date, departTime: b.departTime, persons: b.persons, total: b.total, paid: b.paid, notes: b.notes, payMethod: b.payMethod })}
                          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100">✏️ تعديل</button>
                        {user !== "captain" && (
                          <button onClick={() => deleteB(b.id)}
                            className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-100">🗑️ حذف</button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {tab === "schedule" && (
            <motion.div key="schedule" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }}>
              <TripSchedule trips={bookings.map((b) => ({
                id: b.id, date: b.date, departTime: b.departTime,
                packageTitle: b.packageTitle, name: b.name, phone: b.phone,
                persons: b.persons, status: b.status,
                option: b.option, addons: b.addons, notes: b.notes,
                total: b.total, paid: b.paid, payMethod: b.payMethod,
                payType: b.payType, deposit: b.deposit, promo: b.promo,
                createdAt: b.createdAt,
              }))} />
            </motion.div>
          )}

          {tab === "new" && (
            <motion.div key="new" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }}>
              <QuickBookingForm password={password} user={user} onDone={() => { load(); setTab("bookings"); }} />
            </motion.div>
          )}

          {tab === "expenses" && (
            <ExpensesPanel key="expenses" password={password} bookings={bookings} user={user} />
          )}

        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }}>
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" dir="rtl">
              <h3 className="mb-4 text-lg font-extrabold text-slate-800">✏️ تعديل الحجز</h3>
              <div className="space-y-3">
                <div>
                  <label className="ow-label">الحالة</label>
                  <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as Booking["status"] })} className="ow-in">
                    <option value="pending">قيد الانتظار</option>
                    <option value="confirmed">مؤكد</option>
                    {/* الإلغاء متاح للمالك فقط */}
                    {(user !== "captain" || editing.status === "cancelled") && <option value="cancelled">ملغي</option>}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="ow-label">اسم العميل</label><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="ow-in" /></div>
                  <div><label className="ow-label">الجوال</label><input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} className="ow-in" dir="ltr" /></div>
                  <div><label className="ow-label">التاريخ</label><input type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} className="ow-in" /></div>
                  <div><label className="ow-label">وقت الانطلاق</label><select value={editing.departTime} onChange={(e) => setEditing({ ...editing, departTime: e.target.value })} className="ow-in">{Array.from({ length: 24 }, (_, i) => { const v = `${String(i).padStart(2,"0")}:00`; const h12 = i % 12 === 0 ? 12 : i % 12; const p = i < 12 ? "ص" : "م"; return <option key={v} value={v}>{h12}:00 {p}</option>; })}</select></div>
                  <div><label className="ow-label">عدد الأشخاص</label><input type="number" min={1} max={20} value={editing.persons} onChange={(e) => setEditing({ ...editing, persons: +e.target.value })} className="ow-in" /></div>
                  <div><label className="ow-label">الإجمالي (ريال)</label><input type="number" value={editing.total} onChange={(e) => setEditing({ ...editing, total: +e.target.value })} className="ow-in" /></div>
                  <div><label className="ow-label">المبلغ المدفوع (ريال)</label><input type="number" min={0} value={editing.paid} onChange={(e) => setEditing({ ...editing, paid: +e.target.value })} className="ow-in" /></div>
                </div>
                <p className="text-sm font-semibold text-slate-500">
                  💰 المتبقي: <span className={`font-extrabold ${Math.max(0, editing.total - editing.paid) > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                    {fmt(Math.max(0, editing.total - editing.paid))} ريال
                  </span>
                </p>
                <div>
                  <label className="ow-label">طريقة الدفع</label>
                  <select value={editing.payMethod} onChange={(e) => setEditing({ ...editing, payMethod: e.target.value as Booking["payMethod"] })} className="ow-in">
                    <option value="bank">تحويل بنكي</option>
                    <option value="cash">نقدي</option>
                    <option value="online">دفع عبر الموقع</option>
                    <option value="pos">نقطة بيع (POS)</option>
                  </select>
                </div>
                <div><label className="ow-label">ملاحظات</label><textarea rows={2} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} className="ow-in resize-none" /></div>
              </div>
              {editError && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{editError}</p>}
              <div className="mt-5 flex gap-3">
                <button onClick={saveEdit} disabled={saving} className="flex-1 rounded-xl bg-slate-800 py-3 font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-50">
                  {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
                <button onClick={() => setEditing(null)} className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600 hover:bg-slate-50">إلغاء</button>
              </div>
              <style>{`.ow-label{display:block;font-size:.75rem;font-weight:600;color:#64748b;margin-bottom:4px}.ow-in{width:100%;padding:9px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;font-family:inherit;font-size:.875rem;color:#1e293b;outline:none}.ow-in:focus{border-color:#0d9488}`}</style>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">{children}</p>;
}
function BInfo({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="font-semibold text-slate-800" dir={ltr ? "ltr" : undefined}>{value}</div>
    </div>
  );
}
