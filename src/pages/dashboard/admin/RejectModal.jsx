import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Info, X } from "lucide-react";

const MAX = 500;
const MIN = 10;
const REASONS = ["mismatch", "unclear", "expired", "incomplete", "duplicate", "other"];

/**
 * نافذة "رفض توثيق الحساب": سبب الرفض + تفاصيله (10 أحرف على الأقل).
 * onConfirm({ reason, details }) — reason: مفتاح السبب
 */
export default function RejectModal({ onConfirm, onClose }) {
    const { t } = useTranslation("adminDashboard");
    const m = "verificationPage.reviewPage.rejectModal";
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [errors, setErrors] = useState({});
    const selectRef = useRef(null);
    const closeRef = useRef(onClose);
    useEffect(() => {
        closeRef.current = onClose;
    }, [onClose]);

    // مرة وحدة عند الفتح: Escape بيسكر النافذة، والصفحة اللي وراها ما بتتمرر
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && closeRef.current();
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        selectRef.current?.focus();
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        const next = {
            reason: reason ? "" : t(`${m}.reasonRequired`),
            details: details.trim().length >= MIN ? "" : t(`${m}.detailsMin`, { count: MIN }),
        };
        setErrors(next);
        if (next.reason || next.details) return;
        onConfirm({ reason, details: details.trim() });
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#141415]/40 p-4 backdrop-blur-[2px]"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="reject-title"
                noValidate
                onSubmit={submit}
                className="max-h-[92vh] w-full max-w-[440px] overflow-y-auto rounded-[20px] bg-white p-6 shadow-[0_24px_60px_rgba(20,20,21,0.25)]"
            >
                <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FDE4E4] text-[#D64545]">
                        <X size={22} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h2 id="reject-title" className="text-[18px] font-bold text-[#141415]">{t(`${m}.title`)}</h2>
                        <p className="mt-1.5 text-[11px] leading-[1.9] text-[#575757]">{t(`${m}.desc`)}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t(`${m}.cancel`)}
                        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#575757] hover:bg-[#F2F4F6]"
                    >
                        <X size={17} />
                    </button>
                </div>

                <label htmlFor="reject-reason" className="mb-2 mt-6 block text-[12px] text-[#141415]">
                    {t(`${m}.reason`)} *
                </label>
                <div className="relative">
                    <select
                        id="reject-reason"
                        ref={selectRef}
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value);
                            setErrors((er) => ({ ...er, reason: "" }));
                        }}
                        aria-invalid={!!errors.reason}
                        className={`h-11 w-full cursor-pointer appearance-none rounded-xl border bg-white pe-10 ps-4 text-[12px] outline-none focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2] ${reason ? "text-[#414141]" : "text-[#89949D]"
                            } ${errors.reason ? "border-red-400" : "border-[#8EC0E4]"}`}
                    >
                        <option value="" disabled>{t(`${m}.reasonPlaceholder`)}</option>
                        {REASONS.map((key) => (
                            <option key={key} value={key} className="text-[#414141]">{t(`${m}.reasons.${key}`)}</option>
                        ))}
                    </select>
                    <ChevronDown size={17} className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                </div>
                {errors.reason && <p className="mt-1 text-[11px] text-[#C62828]">{errors.reason}</p>}

                <label htmlFor="reject-details" className="mb-2 mt-5 block text-[12px] text-[#141415]">
                    {t(`${m}.details`)} *
                </label>
                <div
                    className={`rounded-xl border px-4 pb-1.5 pt-3 ${errors.details
                        ? "border-[#C62828] ring-1 ring-[#C62828]/20"
                        : "border-[#8EC0E4] focus-within:border-[#4B9AD2] focus-within:ring-1 focus-within:ring-[#4B9AD2]"
                        }`}
                >
                    <textarea
                        id="reject-details"
                        rows={2}
                        maxLength={MAX}
                        value={details}
                        onChange={(e) => {
                            setDetails(e.target.value);
                            if (errors.details && e.target.value.trim().length >= MIN) setErrors((er) => ({ ...er, details: "" }));
                        }}
                        aria-invalid={!!errors.details}
                        aria-describedby={errors.details ? "reject-details-error" : undefined}
                        placeholder={t(`${m}.detailsPlaceholder`)}
                        className="w-full resize-none bg-transparent text-[12px] leading-[1.8] text-[#414141] outline-none placeholder:text-[#89949D]"
                    />
                    <p className="text-end text-[9px] text-[#89949D] tabular-nums" dir="ltr">{details.length} / {MAX}</p>
                </div>
                {errors.details && <p id="reject-details-error" className="mt-2 text-[11px] text-[#C62828]">{errors.details}</p>}

                <p className="mt-5 flex items-center gap-2 rounded-lg bg-[#EEF5FC] px-4 py-3 text-[11px] text-[#38749E]">
                    <Info size={15} className="shrink-0 text-[#4B9AD2]" />
                    {t(`${m}.appealNote`)}
                </p>

                <div className="mt-5 flex gap-3">
                    <button
                        type="submit"
                        className="h-11 flex-1 cursor-pointer rounded-xl bg-[#C62828] text-[13px] font-semibold text-white transition-colors hover:bg-[#A82020]"
                    >
                        {t(`${m}.submit`)}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 flex-1 cursor-pointer rounded-xl bg-[#F2F4F6] text-[13px] font-semibold text-[#414141] hover:bg-[#E6E9EC]"
                    >
                        {t(`${m}.cancel`)}
                    </button>
                </div>
            </form>
        </div>
    );
}
