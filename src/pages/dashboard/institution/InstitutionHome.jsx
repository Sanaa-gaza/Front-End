import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarDays, ChevronLeft, CircleAlert, MapPin, Star } from "lucide-react";
import { getProfile } from "../../../api/endpoints";

const BASE = "/dashboard/institution";

// ===== بيانات تجريبية =====
// الباك إند لسا ما فيه endpoints للمناقصات والإحصائيات (سبرنت 1 بس للحسابات).
// لما تجهز، استبدلي هاي القيم بطلبات من src/api/endpoints.js

/** شنطة بخطين (نفس public/images/luggage-02.svg) بس بلون currentColor */
function LuggageIcon({ size = 14, strokeWidth = 2 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M7.84375 18.6154V8.09231M15.5625 18.6154V8.09231M8.4375 7.50769V5.16923C8.4375 4.52348 8.96916 4 9.625 4H13.7812C14.4371 4 14.9688 4.52348 14.9688 5.16923V7.50769M4.875 19.2H19.125C20.4367 19.2 21.5 18.153 21.5 16.8615V9.84615C21.5 8.55466 20.4367 7.50769 19.125 7.50769H4.875C3.56332 7.50769 2.5 8.55466 2.5 9.84615V16.8615C2.5 18.153 3.56332 19.2 4.875 19.2Z"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
            />
        </svg>
    );
}

// icon: أيقونة (lucide أو LuggageIcon)، أو symbol: رمز نصي (₪)
const STATS = [
    { key: "activeProjects", value: 13, symbol: "₪" },
    { key: "tenders", value: 8, icon: LuggageIcon },
    { key: "offers", value: 3, icon: LuggageIcon },
    { key: "completed", value: 4.5, icon: Star },
];

// ⚠️ بيانات تجريبية لحد ما يجهز endpoint المناقصات
// tenderId: رقمها بـ tendersData عشان الضغط يفتح صفحة تفاصيل المناقصة
// publishedAt → deadline: فترة التقديم؛ منها بنحسب نسبة الشريط والأيام الباقية
// newOffers: عروض لسا ما راجعتها المؤسسة
const TENDERS = [
    { key: "t1", tenderId: "r1", offers: 12, newOffers: 3, status: "open", publishedAt: "2026-10-01", deadline: "2026-11-25" },
    { key: "t2", tenderId: "r2", offers: 4, newOffers: 0, status: "open", publishedAt: "2026-11-10", deadline: "2026-12-20" },
    { key: "t3", tenderId: "r3", offers: 2, newOffers: 2, status: "open", publishedAt: "2026-11-15", deadline: "2027-01-10" },
];

const DAY = 24 * 60 * 60 * 1000;
// بنحسب على أساس التاريخ بس (من غير الساعة) عشان "باقي X أيام" يكون دقيق
const dayOf = (d) => {
    const x = new Date(d);
    return Date.UTC(x.getFullYear(), x.getMonth(), x.getDate());
};
function submissionPeriod({ publishedAt, deadline }) {
    const today = dayOf(new Date());
    const start = dayOf(publishedAt);
    const end = dayOf(deadline);
    const daysLeft = Math.round((end - today) / DAY);
    const progress = Math.min(100, Math.max(0, Math.round(((today - start) / Math.max(end - start, DAY)) * 100)));
    return { daysLeft, progress };
}

const ACTIONS = [
    { key: "unanswered", to: `${BASE}/messages` },
    { key: "unrated", to: `${BASE}/projects` },
    { key: "draft", to: `${BASE}/tenders` },
];

const STATUS_STYLES = {
    open: "bg-[#DDF6E3] text-[#2EAF4E]",
};

const card = "rounded-[20px] border border-[#DDDDDD] bg-white shadow-[0_4px_24px_rgba(35,74,100,0.08)]";

/**
 * حالة توثيق المؤسسة من GET /profile (pending | approved | rejected).
 * الأدمن بيغيرها من لوحته؛ شكل الرد للمؤسسة مش موثق، فبندوّر بأكثر من مكان.
 * ملاحظة: users.status (active/suspended) شي ثاني — هاد حالة الحساب مش التوثيق.
 */
function readVerification(d = {}) {
    const inst = d.institution || d.institution_profile || {};
    return {
        status: inst.status || d.verification_status || d.account_status || "pending",
        reason: inst.rejection_reason || d.rejection_reason || "",
    };
}

export default function InstitutionHome() {
    const { t, i18n } = useTranslation("institutionDashboard");
    const locale = `${i18n.language}-u-nu-latn`;
    // null = لسا عم نحمّل، عشان التنبيه ما يطلع ويختفي فجأة
    const [verification, setVerification] = useState(null);

    useEffect(() => {
        getProfile()
            .then((res) => setVerification(readVerification(res.data)))
            .catch(() => setVerification(readVerification()));
    }, []);

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
            {/* الإحصائيات */}
            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
                {STATS.map(({ key, value, icon: Icon, symbol }) => (
                    <div key={key} className="rounded-[28px] border border-[#DDDDDD] bg-white px-6 py-6">
                        <p className="flex items-center gap-2.5 text-[13px] text-[#747474]">
                            {t(`stats.${key}.title`)}
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAF3FB] text-[#4B9AD2]">
                                {Icon ? <Icon size={13} strokeWidth={1.8} /> : <span className="text-[13px] font-bold leading-none">{symbol}</span>}
                            </span>
                        </p>
                        <p className="mt-4 text-[26px] font-bold leading-none text-[#22455E] tabular-nums">{value}</p>
                        <p className="mt-4 text-[12px] text-[#747474]">{t(`stats.${key}.desc`)}</p>
                    </div>
                ))}
            </section>

            {/* تنبيه التوثيق — بيختفي لما الأدمن يعتمد حساب المؤسسة */}
            {verification && verification.status !== "approved" && (
                <section className={`${card} flex items-start gap-4 p-5 sm:p-6`}>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F9D6D9] text-[#A61B29]">
                        <CircleAlert size={24} strokeWidth={1.8} />
                    </span>
                    <div>
                        {verification.status === "rejected" ? (
                            <>
                                <h2 className="text-[16px] font-bold text-[#414141]">{t("kyc.rejectedTitle")}</h2>
                                <p className="mt-1.5 text-[12px] leading-[1.9] text-[#89949D]">
                                    {verification.reason || t("kyc.rejectedDesc")}
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-[16px] font-bold text-[#414141]">{t("kyc.title")}</h2>
                                <p className="mt-1.5 text-[12px] leading-[1.9] text-[#89949D]">{t("kyc.desc")}</p>
                            </>
                        )}
                    </div>
                </section>
            )}

            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                {/* المناقصات الجارية */}
                <section className={`${card} p-5`}>
                    <h2 className="mb-5 text-[17px] font-bold text-[#22455E]">{t("tenders.title")}</h2>
                    <ul className="flex flex-col gap-4">
                        {/* نفس شكل بطاقة المشاريع الجارية */}
                        {TENDERS.map((tender) => {
                            const { daysLeft, progress } = submissionPeriod(tender);
                            // آخر 7 أيام بنلوّنها أصفر عشان تلفت النظر
                            const urgent = daysLeft >= 0 && daysLeft <= 7;
                            return (
                            <li key={tender.key}>
                                {/* البطاقة كلها بتفتح تفاصيل المناقصة */}
                                <Link
                                    to={`${BASE}/tenders/${tender.tenderId}`}
                                    className="group block rounded-[20px] border border-[#DDDDDD] bg-white p-5 transition-colors hover:border-[#8EC0E4] hover:bg-[#FAFCFE] sm:p-6"
                                >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <h3 className="text-[19px] font-bold leading-[1.5] text-[#22455E]">{t(`sample.${tender.key}.title`)}</h3>
                                        <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#38749E]">
                                            <MapPin size={14} strokeWidth={1.8} />
                                            {t(`sample.${tender.key}.location`)}
                                        </p>
                                    </div>
                                    <span
                                        className={`mt-1 shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-[12px] font-semibold ${STATUS_STYLES[tender.status]}`}
                                    >
                                        {t(`tenders.status.${tender.status}`)}
                                    </span>
                                </div>

                                {/* مدة التقديم + الأيام الباقية جنب الخط — آخر موعد تحت الخط */}
                                <div className="mt-5">
                                    <div className="flex items-center gap-3">
                                        <span className="flex shrink-0 items-center gap-1.5 text-[13px]">
                                            <span className="text-[#286292]">{t("tenders.periodLabel")}</span>
                                            <span className={`font-bold tabular-nums ${urgent ? "text-[#9A7400]" : "text-[#4B9AD2]"}`}>
                                                {daysLeft < 0 ? t("tenders.ended") : t("tenders.daysLeft", { count: daysLeft })}
                                            </span>
                                        </span>
                                        <div
                                            className="h-2 flex-1 overflow-hidden rounded-full bg-[#E3E9EE]"
                                            role="progressbar"
                                            aria-valuenow={progress}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            aria-label={t("tenders.periodLabel")}
                                        >
                                            <div
                                                className={`h-full rounded-full ${urgent ? "bg-[#F2C200]" : "bg-[#4B9AD2]"}`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                    <p className="mt-6 flex items-center gap-1.5 text-[12px] text-[#38749E]">
                                        <CalendarDays size={15} strokeWidth={1.8} />
                                        {t("tenders.deadlineLabel")}:
                                        <span className="font-semibold text-[#22455E] tabular-nums">
                                            {new Date(tender.deadline).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}
                                        </span>
                                    </p>
                                </div>

                                {/* العروض المقدمة + الجديدة — وعلى الطرف الثاني إشارة إنو البطاقة بتنفتح (مهمة للموبايل لأنو ما في hover) */}
                                <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#DDDDDD] pt-4">
                                    <div>
                                        <p className="text-[12px] text-[#38749E]">{t("tenders.offersLabel")}</p>
                                        <p className="mt-2 flex items-center gap-2">
                                            <span className="text-[22px] font-bold leading-none text-[#22455E] tabular-nums">{tender.offers}</span>
                                            {tender.newOffers > 0 && (
                                                <span className="rounded-full bg-[#E3EFFA] px-2.5 py-1 text-[11px] font-semibold text-[#3D8BC9] tabular-nums">
                                                    {t("tenders.newOffers", { count: tender.newOffers })}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <span className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-[#4B9AD2] transition-transform group-hover:-translate-x-1 ltr:group-hover:translate-x-1">
                                        {t("tenders.viewDetails")}
                                        <ChevronLeft size={16} className="ltr:rotate-180" />
                                    </span>
                                </div>
                                </Link>
                            </li>
                            );
                        })}
                    </ul>
                </section>

                {/* مهام بانتظار إجراء */}
                <section className={`${card} self-start rounded-[24px] px-6 pb-3 pt-7`}>
                    <h2 className="text-[18px] font-bold text-[#22455E]">{t("actions.title")}</h2>
                    <p className="mt-1.5 text-[12px] text-[#38749E]">
                        {t("actions.subtitle", { count: ACTIONS.length })}
                    </p>
                    <ul className="mt-5 divide-y divide-[#DDDDDD] border-t border-[#DDDDDD]">
                        {ACTIONS.map((a) => (
                            <li key={a.key}>
                                <Link to={a.to} className="group flex items-center gap-4 py-6">
                                    <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-[#4B9AD2]" />
                                    <span>
                                        <span className="block text-[15px] font-medium text-[#414141] transition-colors group-hover:text-[#4B9AD2]">
                                            {t(`actions.${a.key}.title`)}
                                        </span>
                                        <span className="mt-2 block text-[11px] text-[#414141]">
                                            {t(`actions.${a.key}.sub`)}
                                        </span>
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}
