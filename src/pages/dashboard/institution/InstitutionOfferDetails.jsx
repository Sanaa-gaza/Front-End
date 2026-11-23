import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BriefcaseBusiness, Check, CircleHelp, MapPin, Star, UserRound, Wrench, X } from "lucide-react";
import { APPLICANTS, OFFERS } from "./offersData";

const BASE = "/dashboard/institution";

const card = "rounded-[20px] border border-[#DDDDDD] bg-white";

// المقارنة بين 2 لـ 3 عروض
const COMPARE_MIN = 2;
const COMPARE_MAX = 3;

/** ثلاث أشخاص بدوائر (فريق المتقدمين) — نفس props أيقونات lucide اللي بنستخدمها */
function ApplicantsIcon({ size = 20, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" className={className}>
            <circle cx="12" cy="5" r="3.2" />
            <circle cx="5.5" cy="16.5" r="3.2" />
            <circle cx="18.5" cy="16.5" r="3.2" />
            <path d="M9.2 11.2a3.6 3.6 0 0 1 5.6 0" />
            <path d="M2.7 22.7a3.6 3.6 0 0 1 5.6 0" />
            <path d="M15.7 22.7a3.6 3.6 0 0 1 5.6 0" />
        </svg>
    );
}

/** نافذة "مقارنة العروض": جدول جنب بعض للعروض المختارة */
function CompareModal({ applicants, onClose }) {
    const { t } = useTranslation("institutionDashboard");
    const c = "offerDetails.compare";

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const rows = [
        { key: "specialty", value: (a) => t(`offerDetails.applicantsSample.${a.id}.specialty`) },
        { key: "experience", value: (a) => t("offerDetails.yearsExp", { count: a.years }) },
        { key: "location", value: (a) => t(`offerDetails.applicantsSample.${a.id}.location`) },
        {
            key: "rating",
            value: (a) => (
                <span className="inline-flex items-center gap-1">
                    <Star size={13} className="fill-[#F2C200] text-[#F2C200]" />
                    {a.rating}
                </span>
            ),
        },
        { key: "verified", value: (a) => t(`${c}.${a.verified ? "yes" : "no"}`) },
        {
            key: "price",
            value: (a) => (
                <span className="font-bold text-[#1E293B]">
                    {t("offerDetails.price", { amount: a.price.toLocaleString("en-US") })}
                </span>
            ),
        },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div aria-hidden="true" onClick={onClose} className="dim-backdrop absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="compare-title"
                className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[760px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.25)]"
            >
                <div className="flex items-center gap-4 border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E3EFFA] text-[#3D8BC9]">
                        <ApplicantsIcon size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h2 id="compare-title" className="text-[18px] font-semibold text-[#1E293B]">
                            {t(`${c}.title`)}
                        </h2>
                        <p className="mt-0.5 text-[12px] text-[#64748B]">{t(`${c}.subtitle`, { count: applicants.length })}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t(`${c}.close`)}
                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#64748B] transition-colors hover:bg-[#F1F5F9]"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-auto p-6 [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent]">
                    <table className="w-full min-w-[520px] border-separate border-spacing-0 overflow-hidden rounded-xl border border-[#E2E8F0] text-[13px]">
                        <thead>
                            <tr className="bg-[#F8FAFC]">
                                <th scope="col" className="w-[140px] px-4 py-3 text-start text-[11px] font-medium text-[#94A3B8]" />
                                {applicants.map((a) => (
                                    <th key={a.id} scope="col" className="border-s border-[#E2E8F0] px-4 py-3 text-start">
                                        <span className="block text-[14px] font-bold text-[#1E293B]">{t(`offerDetails.applicantsSample.${a.id}.name`)}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.key}>
                                    <th scope="row" className="border-t border-[#E2E8F0] px-4 py-3 text-start text-[12px] font-medium text-[#64748B]">
                                        {t(`${c}.rows.${row.key}`)}
                                    </th>
                                    {applicants.map((a) => (
                                        <td key={a.id} className="border-s border-t border-[#E2E8F0] px-4 py-3 text-[#334155] tabular-nums">
                                            {row.value(a)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

/** صفحة تفاصيل العرض — بتفتح من "عرض التفاصيل" بجدول العروض */
export default function InstitutionOfferDetails() {
    const { t } = useTranslation("institutionDashboard");
    const { offerId } = useParams();
    const offer = OFFERS.find((o) => o.id === offerId);
    // ⚠️ الاختيار للمقارنة بالصفحة بس
    const [selected, setSelected] = useState([]);
    const [comparing, setComparing] = useState(false);

    if (!offer) {
        return (
            <div className={`${card} mx-auto max-w-[1100px] p-10 text-center`}>
                <p className="text-[15px] font-bold text-[#475569]">{t("offerDetails.notFound")}</p>
                <Link to={`${BASE}/offers`} className="mt-4 inline-block text-[13px] text-[#4B9AD2] hover:underline">
                    {t("offerDetails.back")}
                </Link>
            </div>
        );
    }

    const code = `TEN-2025-${String(41 + OFFERS.indexOf(offer)).padStart(3, "0")}`;
    const canCompare = selected.length >= COMPARE_MIN;
    const toggle = (id) =>
        setSelected((list) => (list.includes(id) ? list.filter((x) => x !== id) : list.length < COMPARE_MAX ? [...list, id] : list));

    const stats = [
        { key: "applicants", value: offer.applicants },
        { key: "budget", value: t("offerDetails.budgetValue", { value: offer.price.toLocaleString("en-US") }) },
        { key: "duration", value: t("offerDetails.durationValue", { count: offer.duration }) },
    ];

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-5">
            {/* رأس المناقصة: العنوان + أرقام سريعة + مقارنة العروض */}
            <section className={`${card} flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between sm:p-6`}>
                <div className="flex min-w-0 items-center gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[#3D8BC9]">
                        <BriefcaseBusiness size={24} strokeWidth={1.7} />
                    </span>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[#3D8BC9]">
                            <bdi dir="ltr">{code}</bdi>
                        </p>
                        <h1 className="mt-0.5 text-[22px] font-semibold leading-[1.4] text-[#1E293B]">{t(`offersPage.sample.${offer.id}.tender`)}</h1>
                        <p className="mt-0.5 text-[12px] text-[#64748B]">{t("offerDetails.subtitle")}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:flex-nowrap">
                    <dl className="flex items-center">
                        {stats.map(({ key, value }, i) => (
                            <div key={key} className={`px-5 ${i > 0 ? "border-s border-[#E2E8F0]" : "ps-0 lg:ps-5"}`}>
                                <dt className="text-[11px] text-[#94A3B8]">{t(`offerDetails.stats.${key}`)}</dt>
                                <dd className="mt-1 whitespace-nowrap text-[14px] font-bold text-[#1E293B] tabular-nums">{value}</dd>
                            </div>
                        ))}
                    </dl>
                    <button
                        type="button"
                        disabled={!canCompare}
                        onClick={() => setComparing(true)}
                        title={canCompare ? undefined : t("offerDetails.compare.hint", { min: COMPARE_MIN, max: COMPARE_MAX })}
                        className="h-11 shrink-0 cursor-pointer rounded-xl border border-[#4B9AD2] px-5 text-[13px] font-semibold text-[#3D8BC9] btn-wipe btn-wipe-outline disabled:cursor-not-allowed disabled:border-[#DDDDDD] disabled:text-[#94A3B8]"
                    >
                        {selected.length ? t("offerDetails.compare.buttonCount", { count: selected.length }) : t("offerDetails.compare.button")}
                    </button>
                </div>
            </section>

            {/* إرشاد */}
            <section className="flex items-start gap-3 rounded-2xl border border-[#C7E0F1] bg-[#F3F8FD] px-5 py-4">
                <CircleHelp size={18} className="mt-0.5 shrink-0 text-[#4B9AD2]" />
                <div>
                    <p className="text-[13px] font-bold text-[#1E293B]">{t("offerDetails.guide.title")}</p>
                    <p className="mt-1 text-[12px] leading-[1.8] text-[#475569]">
                        {t("offerDetails.guide.desc", { min: COMPARE_MIN, max: COMPARE_MAX })}
                    </p>
                </div>
            </section>

            {/* المتقدمين */}
            <section className="flex flex-col gap-4">
                <h2 className="flex items-center gap-2 text-[17px] font-bold text-[#3D8BC9]">
                    <ApplicantsIcon />
                    {t("offerDetails.applicants", { count: offer.applicants })}
                </h2>

                {APPLICANTS.map((a) => {
                    const p = `offerDetails.applicantsSample.${a.id}`;
                    const name = t(`${p}.name`);
                    const on = selected.includes(a.id);
                    const full = !on && selected.length >= COMPARE_MAX;
                    return (
                        <article
                            key={a.id}
                            className={`flex flex-col gap-5 rounded-[20px] border bg-white p-5 transition-colors sm:p-6 ${on ? "border-[#8EC0E4] bg-[#FBFDFF]" : "border-[#DDDDDD]"}`}
                        >
                            {/* الاسم + اختيار للمقارنة */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex min-w-0 items-center gap-3">
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E4EFFA] text-[#4B9AD2]">
                                        <UserRound size={24} strokeWidth={1.8} />
                                    </span>
                                    <div className="min-w-0">
                                        <h3 className="text-[16px] font-bold text-[#1E293B]">{name}</h3>
                                        <p className="mt-0.5 text-[11px] text-[#4B9AD2]">{t(`${p}.specialty`)}</p>
                                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#89949D]">
                                            <MapPin size={11} />
                                            {t(`${p}.address`)}
                                        </p>
                                    </div>
                                </div>
                                <label
                                    className={`flex shrink-0 items-center gap-2 text-[12px] ${full ? "cursor-not-allowed text-[#CBD5E1]" : "cursor-pointer text-[#475569]"}`}
                                    title={full ? t("offerDetails.compare.max", { max: COMPARE_MAX }) : undefined}
                                >
                                    <input
                                        type="checkbox"
                                        name="compare"
                                        value={a.id}
                                        checked={on}
                                        disabled={full}
                                        onChange={() => toggle(a.id)}
                                        className="peer sr-only"
                                    />
                                    <span
                                        aria-hidden="true"
                                        className={`flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#4B9AD2]/40 ${on ? "border-[#4B9AD2] bg-[#4B9AD2] text-white" : "border-[#94A3B8] bg-white"}`}
                                    >
                                        {on && <Check size={12} strokeWidth={3} />}
                                    </span>
                                    {t("offerDetails.compare.checkbox")}
                                </label>
                            </div>

                            {/* التفاصيل + عرض التفاصيل */}
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-[#475569]">
                                        <span className="flex items-center gap-1.5">
                                            <Wrench size={13} className="text-[#4B9AD2]" />
                                            {t("offerDetails.yearsExp", { count: a.years })}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <MapPin size={13} className="text-[#4B9AD2]" />
                                            {t(`${p}.location`)}
                                        </span>
                                    </p>
                                    <p className="mt-2 text-[12px] leading-[1.9] text-[#475569]">{t(`${p}.desc`)}</p>
                                    <p className="mt-3 flex items-baseline gap-3 text-[17px]">
                                        <span className="text-[#4B9AD2]">{t("offerDetails.offerValue")}</span>
                                        <span className="text-[#475569] tabular-nums">{t("offerDetails.price", { amount: a.price.toLocaleString("en-US") })}</span>
                                    </p>
                                </div>
                                {/* تفاصيل عرض هالمتقدم */}
                                <Link
                                    to={`${BASE}/offers/${offer.id}/applicants/${a.id}`}
                                    className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-xl border border-[#4B9AD2] px-8 text-[14px] font-semibold text-[#3D8BC9] btn-wipe btn-wipe-outline sm:w-auto sm:min-w-[170px]"
                                >
                                    {t("offerDetails.viewDetails")}
                                </Link>
                            </div>
                        </article>
                    );
                })}
            </section>

            {comparing && canCompare && (
                <CompareModal applicants={APPLICANTS.filter((a) => selected.includes(a.id))} onClose={() => setComparing(false)} />
            )}
        </div>
    );
}
