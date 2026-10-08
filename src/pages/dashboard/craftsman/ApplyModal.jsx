import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

/**
 * نافذة "قدم عرضك" على فرصة عمل — مشتركة بين الصفحة الرئيسية وصفحة البحث.
 * job: { id, title, org, desc, location, time, distance, budget: [أقل، أعلى] }
 */
export default function ApplyModal({ job, onClose, onSend }) {
    const { t } = useTranslation("craftsmanDashboard");
    const [form, setForm] = useState({ price: "", duration: "", notes: "" });
    const [errors, setErrors] = useState({});
    const priceRef = useRef(null);
    const closeRef = useRef(onClose);
    useEffect(() => {
        closeRef.current = onClose;
    }, [onClose]);

    // مرة وحدة عند الفتح: Escape بيسكر النافذة، والصفحة اللي وراها ما بتتمرر
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && closeRef.current();
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        priceRef.current?.focus();
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, []);

    const update = (key) => (e) => {
        setForm((f) => ({ ...f, [key]: e.target.value }));
        setErrors((er) => ({ ...er, [key]: "" }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const price = Number(form.price);
        const next = {
            price: !form.price.trim()
                ? t("jobs.modal.priceRequired")
                : !Number.isFinite(price) || price <= 0
                    ? t("jobs.modal.priceInvalid")
                    : "",
            duration: form.duration.trim() ? "" : t("jobs.modal.durationRequired"),
        };
        setErrors(next);
        if (Object.values(next).some(Boolean)) return;
        onSend({ price, duration: form.duration.trim(), notes: form.notes.trim() });
    };

    const infos = [
        { key: "location", value: job.location },
        { key: "time", value: job.time },
        { key: "distance", value: t("jobs.modal.distanceValue", { km: job.distance }) },
        { key: "budget", value: `${job.budget[0]} – ${job.budget[1]}`, ltr: true },
    ];
    const input =
        "w-full rounded-xl border bg-white px-4 text-[13px] text-[#414141] outline-none transition-colors placeholder:text-[#89949D] focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";
    const error = (key) => errors[key] && <p className="mt-1 text-[11px] text-red-500">{errors[key]}</p>;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#141415]/40 p-4 backdrop-blur-[2px]"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="apply-title"
                onSubmit={handleSubmit}
                noValidate
                className="relative flex max-h-[92vh] w-full max-w-[600px] flex-col overflow-y-auto rounded-[24px] bg-white p-5 sm:p-6 shadow-[0_24px_60px_rgba(20,20,21,0.25)]"
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={t("jobs.modal.close")}
                    className="absolute end-3 top-3 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#89949D] hover:bg-[#F5F6F8] hover:text-[#414141]"
                >
                    <X size={16} />
                </button>

                {/* ملخص الفرصة */}
                <div className="rounded-2xl bg-[#EEF5FC] px-4 py-3 shadow-[0_2px_10px_rgba(35,74,100,0.08)]">
                    <h2 className="text-[15px] font-bold text-[#414141]">{job.title}</h2>
                    <p className="mt-1 flex items-center gap-2 text-[12px] font-bold text-[#414141]">
                        <span className="h-5 w-5 shrink-0 rounded-full bg-[#D9DDE1]" aria-hidden="true" />
                        {job.org}
                    </p>
                    <p className="mt-1 text-[11px] text-[#575757]">{job.desc}</p>
                </div>

                {/* الموقع، الموعد، المسافة، الميزانية */}
                <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {infos.map((info) => (
                        <div key={info.key} className="rounded-xl border border-[#8EC0E4] px-2 py-2.5 text-center">
                            <dt className="text-[12px] font-bold text-[#4B9AD2]">{t(`jobs.modal.${info.key}`)}</dt>
                            <dd className="mt-1 text-[10px] text-[#414141]" dir={info.ltr ? "ltr" : undefined}>
                                {info.value}
                            </dd>
                        </div>
                    ))}
                </dl>

                <h3 id="apply-title" className="mt-5 text-[15px] font-bold text-[#22455E]">
                    {t("jobs.modal.title")}
                </h3>

                <label htmlFor="apply-price" className="mb-1.5 mt-3 block text-[11px] text-[#575757]">
                    {t("jobs.modal.price")}
                </label>
                <input
                    id="apply-price"
                    ref={priceRef}
                    type="number"
                    min="1"
                    inputMode="decimal"
                    value={form.price}
                    onChange={update("price")}
                    placeholder={t("jobs.modal.pricePlaceholder")}
                    className={`${input} h-11 ${errors.price ? "border-red-400" : "border-[#8EC0E4]"}`}
                />
                {error("price")}

                <label htmlFor="apply-duration" className="mb-1.5 mt-4 block text-[11px] text-[#575757]">
                    {t("jobs.modal.duration")}
                </label>
                <input
                    id="apply-duration"
                    value={form.duration}
                    onChange={update("duration")}
                    placeholder={t("jobs.modal.durationPlaceholder")}
                    className={`${input} h-11 ${errors.duration ? "border-red-400" : "border-[#8EC0E4]"}`}
                />
                {error("duration")}

                <label htmlFor="apply-notes" className="mb-1.5 mt-4 block text-[11px] text-[#575757]">
                    {t("jobs.modal.notes")}
                </label>
                <textarea
                    id="apply-notes"
                    rows={4}
                    value={form.notes}
                    onChange={update("notes")}
                    placeholder={t("jobs.modal.notesPlaceholder")}
                    className={`${input} resize-none border-[#8EC0E4] py-3`}
                />

                <button
                    type="submit"
                    className="mx-auto mt-6 h-11 w-full max-w-[360px] shrink-0 cursor-pointer rounded-xl bg-[#4B9AD2] text-[15px] font-semibold text-white btn-wipe"
                >
                    {t("jobs.modal.send")}
                </button>
            </form>
        </div>
    );
}
