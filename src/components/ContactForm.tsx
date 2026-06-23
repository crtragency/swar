"use client";

import { useState } from "react";
import { CONTACT, waLink } from "@/lib/site";
import { PACKAGES, pkgText } from "@/lib/packages";
import { useI18n } from "@/lib/i18n";

export default function ContactForm() {
  const { t, locale } = useI18n();
  const [form, setForm] = useState({ name: "", phone: "", date: "", persons: "2", pkg: PACKAGES[0].title, notes: "" });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const message =
    `مرحباً سوار البحرية 🌊\n` +
    `طلب حجز / استفسار:\n` +
    `الاسم: ${form.name || "—"}\n` +
    `الجوال: ${form.phone || "—"}\n` +
    `التاريخ: ${form.date || "—"}\n` +
    `عدد الأشخاص: ${form.persons}\n` +
    `الباقة: ${form.pkg}\n` +
    (form.notes ? `ملاحظات: ${form.notes}\n` : "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        window.open(waLink(message), "_blank", "noopener");
      }}
      className="rounded-[28px] border border-navy-50 bg-white p-7 shadow-luxe sm:p-9"
    >
      <h3 className="text-2xl font-extrabold text-navy-900">{t("contact.formTitle")}</h3>
      <p className="mt-1 text-sm text-navy-900/60">{t("contact.formDesc")}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label={t("contact.fName")}>
          <input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder={t("contact.fNamePh")} className="sw-input" />
        </Field>
        <Field label={t("contact.fPhone")}>
          <input required type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="05XXXXXXXX" className="sw-input" />
        </Field>
        <Field label={t("contact.fDate")}>
          <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className="sw-input" />
        </Field>
        <Field label={t("contact.fPersons")}>
          <select value={form.persons} onChange={(e) => update("persons", e.target.value)} className="sw-input">
            {Array.from({ length: 11 }).map((_, i) => (
              <option key={i} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </Field>
        <Field label={t("contact.fPackage")} full>
          <select value={form.pkg} onChange={(e) => update("pkg", e.target.value)} className="sw-input">
            {PACKAGES.map((p) => (
              <option key={p.id} value={pkgText(locale, p, "title")}>{p.emoji} {pkgText(locale, p, "title")}</option>
            ))}
          </select>
        </Field>
        <Field label={t("contact.fNotes")} full>
          <textarea rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder={t("contact.fNotesPh")} className="sw-input resize-none" />
        </Field>
      </div>

      <button type="submit" className="btn-ocean mt-6 w-full">
        {t("contact.send")}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2z" /></svg>
      </button>
      <p className="mt-3 text-center text-xs text-navy-900/50">{t("contact.callUs")} {CONTACT.phone}</p>

      <style>{`.sw-input{width:100%;padding:12px 14px;background:#f0f8fb;border:1px solid rgba(11,92,140,.18);border-radius:12px;color:#0a1a2f;font-family:inherit;font-size:.95rem;outline:none;transition:border-color .2s,background .2s}.sw-input:focus{border-color:#21c0c0;background:#e8f6f8}`}</style>
    </form>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`flex flex-col gap-2 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-sm font-semibold text-navy-900/70">{label}</span>
      {children}
    </label>
  );
}
