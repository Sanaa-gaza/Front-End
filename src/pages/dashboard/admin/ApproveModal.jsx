import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ShieldCheck, X } from "lucide-react";

const MAX = 500;

/**
 * نافذة "اعتماد التوثيق": ملخص الحساب والمستندات + ملاحظة داخلية اختيارية.
 * summary: [{ label, value }] — onConfirm(note)
 */
export default function ApproveModal({ name, summary, onConfirm, onClose }) {
    const { t } = useTranslation("adminDashboard");
    const a = "verificationPage.reviewPage.approveModal";
    const [note, setNote] = useState("");
    const confirmRef = useRef(null);
    const closeRef = useRef(onClose);
    useEffect(() => {
        closeRef.current = onClose;
    }, [onClose]);

    // مرة وحدة عند الفتح: Escape بيسكر النافذة، والصفحة اللي وراها ما بتتمرر
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && closeRef.current();
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        confirmRef.current?.focus();
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, []);

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#141415]/40 p-4 backdrop-blur-[2px]"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="approve-title"
                onSubmit={(e) => {
                    e.preventDefault();
                    onConfirm(note.trim());
                }}
                className="w-full max-w-[452px] rounded-[20px] bg-white p-6 shadow-[0_24px_60px_rgba(20,20,21,0.25)]"
            >
                <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E3F6EA] text-[#2EAF4E]">
                        <ShieldCheck size={22} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h2 id="approve-title" className="text-[18px] font-bold text-[#141415]">{t(`${a}.title`, { name })}</h2>
                        <p className="mt-1.5 text-[11px] leading-[1.9] text-[#575757]">{t(`${a}.desc`)}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t(`${a}.cancel`)}
                        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#575757] hover:bg-[#F2F4F6]"
                    >
                        <X size={17} />
                    </button>
                </div>

                {/* ملخص الحساب */}
                <dl className="mt-5 flex flex-col gap-3 rounded-xl bg-[#F3F4F6] px-4 py-3.5 text-[11px]">
                    {summary.map((row) => (
                        <div key={row.label} className="flex items-center justify-between gap-3">
                            <dt className="text-[#89949D]">{row.label}</dt>
                            <dd className="text-end font-medium text-[#141415]">{row.value}</dd>
                        </div>
                    ))}
                </dl>

                {/* ملاحظة داخلية (ما بتوصل للمستخدم) */}
                <div className="mt-4 rounded-xl border border-[#8EC0E4] px-4 pb-1.5 pt-3 focus-within:border-[#4B9AD2] focus-within:ring-1 focus-within:ring-[#4B9AD2]">
                    <textarea
                        rows={2}
                        maxLength={MAX}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        aria-label={t(`${a}.notePlaceholder`)}
                        placeholder={t(`${a}.notePlaceholder`)}
                        className="w-full resize-none bg-transparent text-[12px] leading-[1.8] text-[#414141] outline-none placeholder:text-[#89949D]"
                    />
                    <p className="text-end text-[9px] text-[#89949D] tabular-nums" dir="ltr">{note.length} / {MAX}</p>
                </div>

                <div className="mt-5 flex gap-3">
                    <button
                        ref={confirmRef}
                        type="submit"
                        className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#4B9AD2] text-[13px] font-semibold text-white btn-wipe"
                    >
                        <Check size={16} />
                        {t(`${a}.submit`)}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 flex-1 cursor-pointer rounded-xl bg-[#F2F4F6] text-[13px] font-semibold text-[#414141] hover:bg-[#E6E9EC]"
                    >
                        {t(`${a}.cancel`)}
                    </button>
                </div>
            </form>
        </div>
    );
}
