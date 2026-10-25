import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    BriefcaseBusiness,
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
    CircleCheck,
    Clock,
    Image as ImageIcon,
    MapPin,
    Shield,
    ShieldCheck,
    Star,
    Tag,
    UserRound,
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

/** إحصائية بالبطاقة الرئيسية: رقم + أيقونة + وصف */
function Stat({ icon: Icon, value, label, filled = false, divider = false }) {
    return (
        <div className="relative flex flex-col items-center gap-2 px-2 py-4 text-center">
            {/* فاصل عمودي قصير بين الأعمدة */}
            {divider && <span aria-hidden="true" className="absolute inset-y-4 start-0 w-px bg-[#0000001A]" />}
            <span className="flex items-center gap-2 text-[21px] font-bold text-[#1E293B] tabular-nums">
                {value}
                <Icon size={19} className="text-[#4B9AD2]" fill={filled ? "currentColor" : "none"} stroke={filled ? "white" : "currentColor"} strokeWidth={filled ? 1.5 : 2.2} />
            </span>
            <span className="text-[13px] text-[#475569]">{label}</span>
        </div>
    );
}

// عدد الصور المصغّرة تحت الصورة الكبيرة (آخر مربع بيعرض "+الباقي")
const THUMBS = 4;

/**
 * معرض صور العرض: صورة كبيرة بأسهم + عدّاد، وتحتها مصغّرات.
 * photos: روابط الصور — null = مكان فاضي لحد ما تتوفر صور حقيقية
 */
function Gallery({ photos }) {
    const { t, i18n } = useTranslation("institutionDashboard");
    const [index, setIndex] = useState(0);
    const isRtl = i18n.dir() === "rtl";
    const total = photos.length;
    const go = (step) => setIndex((i) => (i + step + total) % total);
    const rest = total - (THUMBS - 1);

    const Photo = ({ src, small = false }) =>
        src ? (
            <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
            <span className="flex h-full w-full items-center justify-center bg-[#DCDDF8] text-[#6E62E5]">
                <ImageIcon size={small ? 12 : 34} strokeWidth={small ? 1.8 : 1.6} />
            </span>
        );

    const arrow = "absolute top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#00000066] text-white transition-colors hover:bg-[#00000099]";

    return (
        <div className="flex flex-col gap-2.5">
            <div className="relative h-[240px] overflow-hidden rounded-xl">
                <Photo src={photos[index]} />
                {total > 1 && (
                    <>
                        {/* السهم اليمين = السابق بالعربي (والتالي بالإنجليزي) */}
                        <button type="button" onClick={() => go(isRtl ? -1 : 1)} aria-label={t(isRtl ? "offerDetails.prevPhoto" : "offerDetails.nextPhoto")} className={`${arrow} right-3`}>
                            <ChevronRight size={16} />
                        </button>
                        <button type="button" onClick={() => go(isRtl ? 1 : -1)} aria-label={t(isRtl ? "offerDetails.nextPhoto" : "offerDetails.prevPhoto")} className={`${arrow} left-3`}>
                            <ChevronLeft size={16} />
                        </button>
                        <span dir="ltr" className="absolute bottom-3 end-3 rounded-full bg-[#00000066] px-2.5 py-0.5 text-[10px] text-white tabular-nums">
                            {index + 1}/{total}
                        </span>
                    </>
                )}
            </div>
            {total > 1 && (
                <div className="grid grid-cols-4 gap-2.5">
                    {photos.slice(0, THUMBS).map((src, i) => {
                        const more = i === THUMBS - 1 && rest > 1;
                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setIndex(i)}
                                aria-label={more ? t("offerDetails.morePhotos", { count: rest }) : t("offerDetails.photo", { n: i + 1 })}
                                className={`relative h-12 cursor-pointer overflow-hidden rounded-lg ring-2 ${index === i ? "ring-[#4B9AD2]" : "ring-transparent"}`}
                            >
                                <Photo src={src} small />
                                {more && (
                                    <span className="absolute inset-0 flex items-center justify-center bg-[#5F6470] text-[12px] font-semibold text-white" dir="ltr">
                                        +{rest}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
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
                <p className="text-[15px] font-bold text-[#475569]">{t("offerDetails.notFound")}</p>
                <Link to={`${BASE}/offers`} className="mt-4 inline-block text-[13px] text-[#4B9AD2] hover:underline">
                    {t("offerDetails.back")}
                </Link>
            </div>
        );
    }

    const s = `offerDetails.sample.${offer.id}`;
    // ⚠️ ما في صور للعروض من السيرفر لسا — 5 أماكن فاضية لحد ما تتوفر
    const photos = offer.photos?.length ? offer.photos : Array(5).fill(null);
    const locale = `${i18n.language}-u-nu-latn`;
    const accepted = APPLICANTS.find((a) => a.id === acceptedId);

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
            {/* القسم الرئيسي (بدون بوكس أو ظل): المعلومات والوصف والإحصائيات + معرض الصور، وتحتها المميزات */}
            {/* sm:mx-6 = نفس هوامش بطاقات المتقدمين تحت */}
            <section className="sm:mx-6">
                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <div className="flex min-w-0 flex-col">
                        <h1 className="text-[30px] font-bold leading-[1.3] text-[#1E293B]">{t(`offersPage.sample.${offer.id}.tender`)}</h1>
                        <p className="mt-2 text-[14px] text-[#4B9AD2]">{t(`${s}.craft`)}</p>
                        <p className="mt-2 flex items-center gap-1 text-[14px] text-[#475569]">
                            <MapPin size={15} className="text-[#4B9AD2]" fill="currentColor" stroke="white" />
                            {t(`${s}.location`)}
                        </p>

                        <h2 className="mt-10 text-[17px] font-medium text-[#1E293B]">{t("offerDetails.descTitle")}</h2>
                        <p className="mt-3 text-[15px] leading-[1.85] text-[#475569]">{t(`${s}.desc`)}</p>

                        {/* lg:mt-auto بتنزّل الصندوق لمستوى أسفل الصور، وlg:pt-8 أقل مسافة عن الوصف */}
                        <div className="mt-8 lg:mt-auto lg:pt-8">
                            <div className="grid grid-cols-2 rounded-[20px] bg-[#F4F4F4]">
                                <Stat icon={BriefcaseBusiness} filled value={offer.duration} label={t("offerDetails.days")} />
                                <Stat icon={ApplicantsIcon} divider value={offer.applicants} label={t("offerDetails.applicantsCount")} />
                            </div>
                        </div>
                    </div>

                    <Gallery photos={photos} />
                </div>

                {/* المميزات */}
                <ul className="mt-12 grid grid-cols-2 gap-3 border-t border-[#0000000F] pt-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
                    {FEATURES.map(({ key, icon: Icon, filled }) => (
                        <li
                            key={key}
                            className="flex h-[31px] items-center justify-center gap-1.5 rounded-xl border border-[#0000000D] bg-[#F7F9FB] px-3 text-[11px] text-[#475569]"
                        >
                            <Icon size={12} className="shrink-0 text-[#448BBD]" fill={filled ? "currentColor" : "none"} stroke={filled ? "white" : "currentColor"} />
                            {t(`offerDetails.features.${key}`)}
                        </li>
                    ))}
                </ul>
            </section>

            {/* المتقدمين */}
            <section className="flex flex-col gap-4">
                <h2 className="flex items-center gap-2 self-end text-[16px] font-bold text-[#4B9AD2]">
                    <ApplicantsIcon />
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
                            className={`flex flex-col gap-5 rounded-[20px] border bg-white p-5 sm:mx-6 sm:p-6 lg:flex-row lg:justify-between ${isAccepted ? "border-[#BFEBCD]" : "border-[#0000000F]"}`}
                        >
                            {/* معلومات المتقدم */}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3">
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

                                <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-[#475569]">
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
                                    <span className="text-[#475569] tabular-nums">{t("offerDetails.price", { amount: a.price })}</span>
                                </p>
                            </div>

                            {/* التاريخ فوق والأزرار تحت (جهة اليسار) */}
                            <div className="flex shrink-0 flex-col justify-between gap-4 lg:items-end">
                                <time dateTime={a.date} className="flex items-center gap-1.5 text-[12px] text-[#475569] tabular-nums">
                                    <CalendarDays size={14} className="text-[#89949D]" />
                                    {new Date(a.date).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}
                                </time>
                                <div className="flex flex-wrap gap-2.5">
                                    {isAccepted ? (
                                        <span className="inline-flex h-11 min-w-[160px] items-center justify-center gap-2 rounded-xl bg-[#DDF6E3] px-5 text-[15px] font-semibold text-[#2EAF4E]">
                                            <CircleCheck size={16} />
                                            {t("offerDetails.accepted")}
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setAcceptedId(a.id)}
                                            disabled={Boolean(acceptedId)}
                                            className="inline-flex h-11 min-w-[160px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-l from-[#1A78BE] to-[#5BAEE4] px-5 text-[15px] font-semibold text-white btn-wipe disabled:cursor-not-allowed disabled:opacity-50 ltr:bg-linear-to-r"
                                        >
                                            <Check size={16} strokeWidth={2.5} />
                                            {t("offerDetails.accept")}
                                        </button>
                                    )}
                                    {/* الملف المهني بلوحة المؤسسة، ومعه بيانات المتقدم عشان يظهر نفس الاسم والتخصص */}
                                    <Link
                                        to={`${BASE}/providers/${a.provider}`}
                                        state={{
                                            provider: {
                                                name,
                                                craft: t(`${p}.specialty`),
                                                location: t(`${p}.location`),
                                                rating: a.rating,
                                                years: a.years,
                                                verified: a.verified,
                                            },
                                        }}
                                        className="inline-flex h-11 min-w-[160px] items-center justify-center rounded-xl border border-[#4B9AD2] px-5 text-[15px] font-semibold text-[#475569] btn-wipe btn-wipe-outline"
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
