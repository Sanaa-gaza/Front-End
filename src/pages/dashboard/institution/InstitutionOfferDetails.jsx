import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    BadgeCheck,
    BriefcaseBusiness,
    ChevronLeft,
    CircleCheck,
    Clock,
    Hammer,
    MapPin,
    ShieldCheck,
    Shield,
    Star,
    Tag,
    Wrench,
} from "lucide-react";
import { APPLICANTS, OFFERS } from "./offersData";

const BASE = "/dashboard/institution";

const card = "rounded-[20px] border border-[#0000000D] bg-white shadow-[0_4px_24px_rgba(35,74,100,0.08)]";

// مميزات صاحب العرض (الشرائح تحت البطاقة الرئيسية)
const FEATURES = [
    { key: "experience", icon: Star },
    { key: "quality", icon: Shield, filled: true },
    { key: "punctual", icon: Clock },
    { key: "prices", icon: Tag, filled: true },
    { key: "support", icon: ShieldCheck, filled: true },
];

/** إحصائية بالبطاقة الرئيسية: رقم + أيقونة + وصف */
function Stat({ icon: Icon, value, label, iconClass = "text-[#4B9AD2]", filled = false, divider = false }) {
    return (
        <div className="relative flex flex-col items-center gap-1 px-2 py-3 text-center">
            {/* فاصل عمودي قصير بين الأعمدة */}
            {divider && <span aria-hidden="true" className="absolute inset-y-3 start-0 w-px bg-[#0000001A]" />}
            <span className="flex items-center gap-1.5 text-[14px] font-bold text-[#1F2A37] tabular-nums">
                <Icon size={13} className={iconClass} fill={filled ? "currentColor" : "none"} stroke={filled && Icon !== Star ? "white" : "currentColor"} />
                {value}
            </span>
            <span className="text-[10px] text-[#575757]">{label}</span>
        </div>
    );
}

/** صفحة تفاصيل العرض — بتفتح من "عرض التفاصيل" بجدول العروض */
export default function InstitutionOfferDetails() {
    const { t, i18n } = useTranslation("institutionDashboard");
    const { offerId } = useParams();
    const offer = OFFERS.find((o) => o.id === offerId);
    // ⚠️ القبول بالصفحة بس لحد ما يصير في endpoint
    const [acceptedId, setAcceptedId] = useState("");

    if (!offer) {
        return (
            <div className={`${card} mx-auto max-w-[1100px] p-10 text-center`}>
                <p className="text-[15px] font-bold text-[#414141]">{t("offerDetails.notFound")}</p>
                <Link to={`${BASE}/offers`} className="mt-4 inline-block text-[13px] text-[#4B9AD2] hover:underline">
                    {t("offerDetails.back")}
                </Link>
            </div>
        );
    }

    const s = `offerDetails.sample.${offer.id}`;
    const locale = `${i18n.language}-u-nu-latn`;
    const accepted = APPLICANTS.find((a) => a.id === acceptedId);

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
            <Link
                to={`${BASE}/offers`}
                className="inline-flex w-fit items-center gap-1 text-[12px] font-medium text-[#4B9AD2] hover:underline"
            >
                <ChevronLeft size={14} className="rtl:rotate-180" />
                {t("offerDetails.back")}
            </Link>

            {/* البطاقة الرئيسية */}
            <section className="rounded-[28px] border border-[#0000000D] bg-white px-5 pb-12 pt-5 shadow-[0_6px_12px_rgba(0,0,0,0.14)] sm:px-[34px]">
                <div className="flex items-center gap-4">
                    <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[#ECE9FB] text-[#7C6FD6] shadow-[0_2px_6px_rgba(0,0,0,0.1)] ring-4 ring-white">
                        <Hammer size={22} strokeWidth={1.7} />
                    </span>
                    <div className="min-w-0">
                        <h1 className="text-[24px] font-bold leading-[1.3] text-[#1F2A37]">{t(`offersPage.sample.${offer.id}.tender`)}</h1>
                        <p className="mt-1 text-[12px] text-[#4B9AD2]">{t(`${s}.craft`)}</p>
                        <p className="mt-1.5 flex items-center gap-1 text-[12px] text-[#575757]">
                            <MapPin size={13} className="text-[#4B9AD2]" fill="currentColor" stroke="white" />
                            {t(`${s}.location`)}
                        </p>
                    </div>
                </div>

                <div className="mt-5 grid max-w-[460px] grid-cols-3 border-y border-[#0000000F] sm:ms-5">
                    <Stat icon={BriefcaseBusiness} filled value={offer.duration} label={t("offerDetails.days")} />
                    <Stat icon={Clock} divider value={offer.years} label={t("offerDetails.years")} />
                    <Stat
                        icon={Star}
                        filled
                        divider
                        value={offer.rating}
                        label={t("offerDetails.reviews", { count: offer.reviews })}
                        iconClass="text-[#F5B400]"
                    />
                </div>

                <p className="mt-5 max-w-[460px] text-[12px] leading-[1.9] text-[#414141] sm:ms-5">
                    {t("offerDetails.desc", { years: offer.years })}
                </p>
            </section>

            {/* المميزات */}
            <ul className="grid grid-cols-2 gap-3 border-t border-[#0000000F] pt-5 sm:mx-6 sm:grid-cols-3 lg:grid-cols-5">
                {FEATURES.map(({ key, icon: Icon, filled }) => (
                    <li
                        key={key}
                        className="flex h-[31px] items-center justify-center gap-1.5 rounded-xl border border-[#0000000D] bg-[#F7F9FB] px-3 text-[11px] text-[#414141]"
                    >
                        <Icon size={12} className="shrink-0 text-[#448BBD]" fill={filled ? "currentColor" : "none"} stroke={filled ? "white" : "currentColor"} />
                        {t(`offerDetails.features.${key}`)}
                    </li>
                ))}
            </ul>

            {/* المتقدمين */}
            <section className="flex flex-col gap-4">
                <h2 className="flex items-center gap-2 self-end text-[16px] font-bold text-[#4B9AD2]">
                    {/* ثلاث أشخاص بدوائر (فريق المتقدمين) */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                        <circle cx="12" cy="5" r="3.2" />
                        <circle cx="5.5" cy="16.5" r="3.2" />
                        <circle cx="18.5" cy="16.5" r="3.2" />
                        <path d="M9.2 11.2a3.6 3.6 0 0 1 5.6 0" />
                        <path d="M2.7 22.7a3.6 3.6 0 0 1 5.6 0" />
                        <path d="M15.7 22.7a3.6 3.6 0 0 1 5.6 0" />
                    </svg>
                    {t("offerDetails.applicants", { count: offer.applicants })}
                </h2>

                {accepted && (
                    <div
                        role="status"
                        className="flex flex-col gap-2 rounded-lg border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-3 text-[13px] text-[#2E9E5B] sm:flex-row sm:items-center sm:justify-between"
                    >
                        <p>{t("offerDetails.acceptedMsg", { name: t(`offerDetails.applicantsSample.${accepted.id}.name`) })}</p>
                        <button
                            type="button"
                            onClick={() => setAcceptedId("")}
                            className="w-fit cursor-pointer text-[12px] font-semibold text-[#286292] hover:underline"
                        >
                            {t("offerDetails.undo")}
                        </button>
                    </div>
                )}

                {APPLICANTS.map((a) => {
                    const p = `offerDetails.applicantsSample.${a.id}`;
                    const name = t(`${p}.name`);
                    const isAccepted = acceptedId === a.id;
                    return (
                        <article
                            key={a.id}
                            className={`${card} border-t-2 px-5 pb-8 pt-4 sm:mx-6 sm:pe-5 sm:ps-7 ${isAccepted ? "border-t-[#2EAF4E]" : "border-t-[#9CC9EA]"}`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 sm:-ms-3">
                                    <span className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[#EAF3FB] text-[18px] font-bold text-[#38749E]">
                                        {name.trim().charAt(0)}
                                        {a.verified && (
                                            <BadgeCheck
                                                size={18}
                                                aria-label={t("offerDetails.verified")}
                                                className="absolute bottom-0 end-0 rounded-full bg-white text-white"
                                                fill="#4B9AD2"
                                            />
                                        )}
                                    </span>
                                    <div className="pt-3">
                                        <h3 className="text-[14px] font-bold text-[#141415]">{name}</h3>
                                        <p className="mt-1.5 flex items-center gap-1 text-[10px] text-[#89949D]">
                                            <Star size={11} className="text-[#F5B400]" fill="currentColor" />
                                            <span className="font-semibold text-[#414141] tabular-nums">{a.rating}</span>
                                            {t("offerDetails.reviews", { count: a.reviews })}
                                        </p>
                                        <span className="mt-2.5 inline-block rounded-full bg-[#EAF3FB] px-3 py-0.5 text-[10px] text-[#4B9AD2]">
                                            {t(`${p}.specialty`)}
                                        </span>
                                    </div>
                                </div>
                                <time dateTime={a.date} className="shrink-0 pt-3 text-[14px] text-[#575757] tabular-nums">
                                    {new Date(a.date).toLocaleDateString(locale, { day: "numeric", month: "numeric", year: "numeric" })}
                                </time>
                            </div>

                            <p className="mt-3.5 flex items-baseline gap-3 text-[15px]">
                                <span className="text-[#4B9AD2]">{t("offerDetails.offerValue")}</span>
                                <span className="text-[#414141] tabular-nums">
                                    {t("offerDetails.price", { amount: a.price.toLocaleString("en-US") })}
                                </span>
                            </p>

                            <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-[#414141]">
                                <span className="flex items-center gap-1">
                                    <Wrench size={12} className="text-[#4B9AD2]" />
                                    {t("offerDetails.yearsExp", { count: a.years })}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin size={12} className="text-[#4B9AD2]" />
                                    {t(`${p}.location`)}
                                </span>
                            </p>

                            <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <p className="max-w-[460px] text-[11px] leading-[1.75] text-[#414141]">{t(`${p}.desc`)}</p>
                                <div className="flex shrink-0 gap-4">
                                    {isAccepted ? (
                                        <span className="inline-flex h-9 min-w-[179px] items-center justify-center gap-1.5 rounded-lg bg-[#DDF6E3] px-4 text-[15px] text-[#2EAF4E]">
                                            <CircleCheck size={15} />
                                            {t("offerDetails.accepted")}
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setAcceptedId(a.id)}
                                            disabled={Boolean(acceptedId)}
                                            className="inline-flex h-9 min-w-[179px] cursor-pointer items-center justify-center rounded-lg bg-[#4B9AD2] px-4 text-[15px] text-white btn-wipe disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {t("offerDetails.accept")}
                                        </button>
                                    )}
                                    <Link
                                        to={`/craftsmen/${a.craftsman}`}
                                        className="inline-flex h-9 min-w-[166px] items-center justify-center rounded-lg border border-[#4B9AD2] px-4 text-[15px] text-[#414141] btn-wipe btn-wipe-outline"
                                    >
                                        {t("offerDetails.profile")}
                                    </Link>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </section>
        </div>
    );
}
