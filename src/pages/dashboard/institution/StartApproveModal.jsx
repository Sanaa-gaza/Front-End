import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, Building2, ChartNoAxesColumnIncreasing, Check, TriangleAlert, X } from "lucide-react";

/**
 * نافذة "اعتماد بدء التنفيذ" — مشتركة بين صفحة تفاصيل المشروع وصفحة مراجعة طلب بدء التنفيذ.
 * remaining: عدد بنود قائمة التحقق اللي لسا ما اكتملت (التأكيد معطّل لحد ما تصير 0).
 */
// ماذا سيحدث بعد الاعتماد
const APPROVE_EFFECTS = [
    { id: "start", icon: Check },
    { id: "notify", icon: Bell },
    { id: "tracking", icon: ChartNoAxesColumnIncreasing },
];

/** نافذة "اعتماد بدء التنفيذ": أثر القرار + ملاحظة + تأكيد */
export default function StartApproveModal({ code, title, provider, startDate, remaining, onClose, onApprove }) {
    const { t } = useTranslation("institutionDashboard");
    const a = "startRequest.approveModal";
    const [note, setNote] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const complete = remaining === 0;
    const valid = complete && confirmed;

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div aria-hidden="true" onClick={onClose} className="dim-backdrop absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" />
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="approve-title"
                onSubmit={(e) => {
                    e.preventDefault();
                    // ⚠️ محلي لحد ما يصير في endpoint
                    if (valid) onApprove(note.trim());
                }}
                className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[640px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.25)]"
            >
                {/* الرأس */}
                <div className="flex items-center gap-4 border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#16A34A]">
                        <Check size={21} strokeWidth={2.5} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-bold text-[#3D8BC9]">
                            {t(`${a}.label`)} · <bdi dir="ltr">{code}</bdi>
                        </p>
                        <h2 id="approve-title" className="mt-0.5 text-[18px] font-semibold text-[#1E293B]">
                            {t(`${a}.title`)}
                        </h2>
                        <p className="mt-0.5 text-[12px] text-[#64748B]">{t(`${a}.subtitle`)}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t(`${a}.close`)}
                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#64748B] transition-colors hover:bg-[#F1F5F9]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* المحتوى */}
                <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5 [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent]">
                    {/* المشروع */}
                    <div className="flex items-center gap-3 rounded-xl border border-[#D6E6F5] bg-[#F3F8FD] p-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E3EFFA] text-[#3D8BC9]">
                            <Building2 size={20} strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] text-[#94A3B8]">{t(`${a}.project`)}</p>
                            <p className="mt-0.5 truncate text-[13px] font-bold text-[#1E293B]">{title}</p>
                            <p className="mt-0.5 text-[12px] text-[#64748B]">{t(`${a}.projectMeta`, { provider, date: startDate })}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-[#FFF7D6] px-3 py-1 text-[11px] font-semibold text-[#9A7400]">
                            {t(`${a}.pending`)}
                        </span>
                    </div>

                    {/* تنبيه: المراجعة ما كملت */}
                    {!complete && (
                        <div role="alert" className="flex items-start gap-3 rounded-xl border border-[#F6D58E] bg-[#FFF9E8] px-4 py-3.5">
                            <TriangleAlert size={18} className="mt-0.5 shrink-0 text-[#D97706]" />
                            <div>
                                <p className="text-[13px] font-bold text-[#B45309]">{t(`${a}.incompleteTitle`)}</p>
                                <p className="mt-0.5 text-[12px] text-[#B7791F]">{t(`${a}.incompleteDesc`, { count: remaining })}</p>
                            </div>
                        </div>
                    )}

                    {/* ماذا سيحدث بعد الاعتماد */}
                    <div className="rounded-xl border border-[#DCFCE7] bg-[#F7FEF9] px-4 py-3.5">
                        <p className="text-[13px] font-bold text-[#1E293B]">{t(`${a}.effectsTitle`)}</p>
                        <ul className="mt-2 divide-y divide-[#DCFCE7]">
                            {APPROVE_EFFECTS.map(({ id, icon: Icon }) => (
                                <li key={id} className="flex items-start gap-3 py-3">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#DCFCE7] text-[#16A34A]">
                                        <Icon size={15} strokeWidth={2} />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-[13px] font-bold text-[#1E293B]">{t(`${a}.effects.${id}.title`)}</span>
                                        <span className="mt-0.5 block text-[11px] text-[#64748B]">
                                            {t(`${a}.effects.${id}.desc`, { date: startDate })}
                                        </span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <label className="block">
                        <span className="mb-2 block text-[13px] font-medium text-[#1E293B]">
                            {t(`${a}.note`)} <span className="font-normal text-[#94A3B8]">{t(`${a}.optional`)}</span>
                        </span>
                        <textarea
                            name="approval_note"
                            rows={3}
                            maxLength={1000}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={t(`${a}.notePlaceholder`)}
                            className="w-full resize-none rounded-xl border border-[#DDDDDD] bg-white px-4 py-3 text-[13px] leading-[1.8] text-[#1E293B] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#4B9AD2]"
                        />
                    </label>

                    {/* تأكيد القرار */}
                    <label
                        className={`flex items-start gap-3 rounded-xl border p-3.5 transition-colors ${complete ? "cursor-pointer" : "cursor-not-allowed opacity-60"} ${confirmed ? "border-[#8EC0E4] bg-[#F3F8FD]" : "border-[#DDDDDD] hover:bg-[#F8FAFC]"}`}
                    >
                        <input
                            type="checkbox"
                            name="confirm_approval"
                            checked={confirmed}
                            disabled={!complete}
                            onChange={(e) => setConfirmed(e.target.checked)}
                            className="peer sr-only"
                        />
                        <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#4B9AD2]/40 ${confirmed ? "border-[#4B9AD2] bg-[#4B9AD2] text-white" : "border-[#CBD5E1] bg-white"}`}
                        >
                            {confirmed && <Check size={13} strokeWidth={3} />}
                        </span>
                        <span className="min-w-0">
                            <span className="block text-[13px] font-bold text-[#1E293B]">{t(`${a}.confirm`)}</span>
                            <span className="mt-1 block text-[11px] text-[#64748B]">{t(`${a}.confirmDesc`)}</span>
                        </span>
                    </label>
                </div>

                {/* الأزرار */}
                <div className="flex justify-end gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 min-w-[100px] cursor-pointer rounded-xl border border-[#DDDDDD] bg-white px-6 text-[14px] font-medium text-[#334155] transition-colors hover:bg-[#F1F5F9]"
                    >
                        {t(`${a}.cancel`)}
                    </button>
                    <button
                        type="submit"
                        disabled={!valid}
                        className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#4B9AD2] px-5 text-[14px] font-semibold text-white btn-wipe disabled:cursor-not-allowed disabled:bg-[#DCE6EF] disabled:text-[#94A3B8]"
                    >
                        <Check size={16} strokeWidth={2.5} />
                        {t(`${a}.submit`)}
                    </button>
                </div>
            </form>
        </div>
    );
}
