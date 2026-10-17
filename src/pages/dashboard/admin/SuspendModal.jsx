import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Ban, ChevronDown, CircleAlert, X } from "lucide-react";

const DETAILS_MAX = 500;
const REASONS = ["complaints", "terms", "documents", "suspicious", "userRequest", "other"];

/**
 * نافذة "إيقاف حساب": سبب الإيقاف + تفاصيله + إشعار المستخدم.
 * onConfirm({ reason, details, notify }) — reason: مفتاح السبب
 */
export default function SuspendModal({ name, onConfirm, onClose }) {
    const { t } = useTranslation("adminDashboard");
    const m = "usersPage.suspendModal";
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [notify, setNotify] = useState(true);
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
            details: details.trim() ? "" : t(`${m}.detailsRequired`),
        };
        setErrors(next);
        if (next.reason || next.details) return;
        onConfirm({ reason, details: details.trim(), notify });
    };

    const box = "w-full rounded-xl border bg-white text-[13px] text-[#414141] outline-none transition-colors focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#141415]/40 p-4 backdrop-blur-[2px]"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="suspend-title"
                onSubmit={submit}
                noValidate
                className="flex max-h-[92vh] w-full max-w-[430px] flex-col overflow-y-auto rounded-[20px] bg-white p-6 shadow-[0_24px_60px_rgba(20,20,21,0.25)]"
            >
                <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FDE4E4] text-[#D64545]">
                        <Ban size={22} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h2 id="suspend-title" className="text-[17px] font-bold text-[#141415]">{t(`${m}.title`, { name })}</h2>
                        <p className="mt-1.5 text-[11px] leading-[1.9] text-[#575757]">{t(`${m}.desc`)}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t(`${m}.close`)}
                        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#575757] hover:bg-[#F2F4F6]"
                    >
                        <X size={17} />
                    </button>
                </div>

                <label htmlFor="suspend-reason" className="mb-2 mt-6 block text-[12px] text-[#414141]">
                    {t(`${m}.reason`)} <span className="text-[#D64545]">*</span>
                </label>
                <div className="relative">
                    <select
                        id="suspend-reason"
                        ref={selectRef}
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value);
                            setErrors((er) => ({ ...er, reason: "" }));
                        }}
                        aria-invalid={!!errors.reason}
                        className={`${box} h-11 cursor-pointer appearance-none pe-10 ps-4 ${reason ? "" : "text-[#89949D]"} ${errors.reason ? "border-red-400" : "border-[#8EC0E4]"}`}
                    >
                        <option value="" disabled>{t(`${m}.reasonPlaceholder`)}</option>
                        {REASONS.map((key) => (
                            <option key={key} value={key} className="text-[#414141]">
                                {t(`${m}.reasons.${key}`)}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={17} className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                </div>
                {errors.reason && <p className="mt-1 text-[11px] text-red-500">{errors.reason}</p>}

                <label htmlFor="suspend-details" className="mb-2 mt-5 block text-[12px] text-[#414141]">
                    {t(`${m}.details`)} <span className="text-[#D64545]">*</span>
                </label>
                <div className={`${box} px-4 pb-1.5 pt-3 focus-within:border-[#4B9AD2] focus-within:ring-1 focus-within:ring-[#4B9AD2] ${errors.details ? "border-red-400" : "border-[#8EC0E4]"}`}>
                    <textarea
                        id="suspend-details"
                        rows={2}
                        maxLength={DETAILS_MAX}
                        value={details}
                        onChange={(e) => {
                            setDetails(e.target.value);
                            setErrors((er) => ({ ...er, details: "" }));
                        }}
                        aria-invalid={!!errors.details}
                        placeholder={t(`${m}.detailsPlaceholder`)}
                        className="w-full resize-none bg-transparent leading-[1.8] outline-none placeholder:text-[#89949D]"
                    />
                    <p className="text-end text-[9px] text-[#89949D] tabular-nums" dir="ltr">
                        {details.length} / {DETAILS_MAX}
                    </p>
                </div>
                {errors.details && <p className="mt-1 text-[11px] text-red-500">{errors.details}</p>}

                <label className="mt-5 flex cursor-pointer items-center gap-2 text-[12px] text-[#414141]">
                    <input
                        type="checkbox"
                        checked={notify}
                        onChange={(e) => setNotify(e.target.checked)}
                        className="h-4 w-4 cursor-pointer accent-[#4B9AD2]"
                    />
                    {t(`${m}.notify`)}
                </label>

                <p className="mt-5 flex items-center gap-2 rounded-lg bg-[#FDECEC] px-4 py-3 text-[11px] text-[#D64545]">
                    <CircleAlert size={15} className="shrink-0" />
                    {t(`${m}.warning`)}
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
                        className="h-11 flex-1 cursor-pointer rounded-xl bg-[#F2F4F6] text-[13px] font-semibold text-[#414141] transition-colors hover:bg-[#E6E9EC]"
                    >
                        {t(`${m}.cancel`)}
                    </button>
                </div>
            </form>
        </div>
    );
}
