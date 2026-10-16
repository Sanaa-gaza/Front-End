import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Award,
    CalendarDays,
    Camera,
    Clock,
    ImageIcon,
    ImageUp,
    MapPin,
    Map as MapIcon,
    MessageSquare,
    ShieldCheck,
    Star,
    Tags,
    UserRound,
} from "lucide-react";

const TABS = ["profile", "reviews", "portfolio"];

// مميزات "نبذة عني" (الافتراضية لو ما وصلت من السيرفر)
const FEATURE_ICONS = { quality: ShieldCheck, prices: Tags, punctual: Clock };
const DEFAULT_FEATURES = ["quality", "prices", "punctual"];

// عدد الصور الظاهرة بمعاينة معرض الأعمال (الباقي بيظهر "+N صورة")
const PREVIEW_COUNT = 4;
// عدد التقييمات الظاهرة بتبويب "الملف الشخصي" (الكل بتبويب "التقييمات")
const REVIEWS_PREVIEW = 2;

const panel = "rounded-[20px] border border-[#0000000D] bg-white p-5 shadow-[0_2px_12px_rgba(35,74,100,0.05)] sm:p-6";

/** صورة من معرض الأعمال، ولو ما انفتحت بيظهر شكل افتراضي */
function WorkImage({ src, alt, className = "" }) {
    const [failed, setFailed] = useState(false);
    if (!src || failed) {
        return (
            <span className={`${className} flex items-center justify-center bg-[#E5ECF1] text-[#AAB6C0]`}>
                <ImageIcon size={28} strokeWidth={1.4} />
            </span>
        );
    }
    return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`${className} object-cover`} />;
}

/** تقييم عميل: صورة + اسم + تاريخ + نجوم + تعليق */
function ReviewCard({ review }) {
    const full = Math.round(review.rating);
    return (
        <li className="rounded-2xl border border-[#0000000A] bg-[#F9FBFD] px-4 pb-4 pt-6">
            <div className="flex items-center gap-2.5 border-t border-[#0000000F] pt-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E4EFFA] text-[#4B9AD2]">
                    <UserRound size={14} />
                </span>
                <div>
                    <p className="text-[11px] font-bold text-[#141415]">{review.name}</p>
                    <p className="text-[9px] text-[#89949D]">{review.date}</p>
                </div>
            </div>
            <span className="mt-2 flex gap-0.5" aria-label={`${review.rating}/5`}>
                {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={13} className={i < full ? "text-[#F5B400]" : "text-[#E1E5EA]"} fill="currentColor" aria-hidden="true" />
                ))}
            </span>
            <p className="mt-2 text-[12px] leading-[1.8] text-[#414141]">{review.comment}</p>
        </li>
    );
}

/** عنوان بطاقة داخل التبويب: أيقونة + نص */
function PanelTitle({ icon: Icon, children }) {
    return (
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#141415]">
            <Icon size={17} strokeWidth={1.8} className="text-[#4B9AD2]" />
            {children}
        </h2>
    );
}

/** صورة مزوّد الخدمة، ولو ما في صورة (أو ما انفتحت) بنعرض أول حرف من اسمه */
function Avatar({ src, name }) {
    const [failed, setFailed] = useState(false);
    const base = "h-24 w-24 rounded-full border-4 border-white shadow-[0_4px_14px_rgba(0,0,0,0.18)]";
    if (!src || failed) {
        return (
            <span className={`${base} flex items-center justify-center bg-[#EAF3FB] text-[30px] font-bold text-[#4B9AD2]`}>
                {name.trim().charAt(0)}
            </span>
        );
    }
    return <img src={src} alt={name} onError={() => setFailed(true)} className={`${base} object-cover`} />;
}

/** نجوم التقييم (مقرّبة لأقرب نجمة) + الرقم */
function Stars({ rating }) {
    const { t } = useTranslation("providerProfile");
    const full = Math.round(rating);
    return (
        <p className="flex items-center gap-1.5" aria-label={t("ratingLabel", { rating: rating.toFixed(1) })}>
            <span className="flex gap-0.5" aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={14} className={i < full ? "text-[#F5B400]" : "text-[#E1E5EA]"} fill="currentColor" />
                ))}
            </span>
            <span className="text-[12px] font-bold text-[#414141] tabular-nums">{rating.toFixed(1)}</span>
        </p>
    );
}

/** بطاقة جانبية صغيرة (ساعات العمل / مناطق الخدمة) */
function SideCard({ icon: Icon, title, children }) {
    return (
        <section className="rounded-[18px] border border-[#0000000D] bg-white p-4 shadow-[0_2px_12px_rgba(35,74,100,0.06)]">
            <h2 className="flex items-center gap-2 text-[13px] font-bold text-[#141415]">
                <Icon size={15} className="text-[#4B9AD2]" />
                {title}
            </h2>
            <div className="mt-3 text-[11px] leading-[2] text-[#414141]">{children}</div>
        </section>
    );
}

/**
 * الملف المهني لمزوّد الخدمة (حرفي / فريق / مقاول) — مشترك بين لوحة المؤسسة وصفحة الحرفيين العامة.
 * profile: { name, craft, location, bio, about, rating, verified, photo, cover, hours: { days, time }, areas,
 *            features: ["quality" | "prices" | "punctual"], portfolio: [روابط صور], portfolioTotal,
 *            reviews: [{ name, date, rating, comment }] }
 * chatTo / requestTo: روابط زرّي "بدء محادثة" و"طلب خدمة"
 */
export default function ProviderProfile({ profile, chatTo, requestTo }) {
    const { t } = useTranslation("providerProfile");
    const [tab, setTab] = useState("profile");
    const features = profile.features?.length ? profile.features : DEFAULT_FEATURES;
    const portfolio = profile.portfolio || [];
    const reviews = profile.reviews || [];
    // عدد الصور اللي ما بتظهر بالمعاينة (من العدد الكلي لو السيرفر بعته)
    const extra = Math.max(0, (profile.portfolioTotal || portfolio.length) - (PREVIEW_COUNT - 1));

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col">
            {/* الغلاف */}
            <div className="relative h-[140px] overflow-hidden rounded-[20px] bg-[#EFEFEF]">
                {profile.cover ? (
                    <img src={profile.cover} alt={t("cover")} className="h-full w-full object-cover" />
                ) : (
                    <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#4B9AD2] text-white" aria-hidden="true">
                        <Camera size={20} strokeWidth={1.8} />
                    </span>
                )}
            </div>

            <div className="grid gap-6 px-1 lg:grid-cols-[1fr_300px] lg:gap-12">
                {/* العمود الرئيسي */}
                <div className="min-w-0">
                    {/* relative + z-10 عشان الصورة تطلع فوق الغلاف مش تحته */}
                    <div className="relative z-10 -mt-12 ps-4">
                        <Avatar src={profile.photo} name={profile.name} />
                    </div>
                    <h1 className="mt-3 text-[24px] font-bold text-[#141415]">{profile.name}</h1>
                    <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[11px] text-[#89949D]">
                        {profile.craft && <span>{profile.craft}</span>}
                        {profile.craft && profile.location && <span aria-hidden="true">•</span>}
                        {profile.location && (
                            <span className="flex items-center gap-1">
                                <MapPin size={12} />
                                {profile.location}
                            </span>
                        )}
                    </p>
                    {profile.bio && <p className="mt-3 max-w-[340px] text-[12px] leading-[1.9] text-[#414141]">{profile.bio}</p>}
                    <div className="mt-3">
                        <Stars rating={profile.rating} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <span className="flex items-center gap-1 rounded-full border border-[#BFEBCD] bg-[#EEFAF2] px-3 py-1 text-[10px] text-[#2EAF4E]">
                            <Award size={12} />
                            {t("customerRated")}
                        </span>
                        {profile.verified && (
                            <span className="flex items-center gap-1 rounded-full border border-[#CFE3F3] bg-[#EEF5FC] px-3 py-1 text-[10px] text-[#38749E]">
                                <ShieldCheck size={12} />
                                {t("verified")}
                            </span>
                        )}
                    </div>

                    {/* التبويبات */}
                    <div role="tablist" className="mt-6 flex rounded-[18px] border border-[#0000000D] bg-white px-4 shadow-[0_2px_12px_rgba(35,74,100,0.05)]">
                        {TABS.map((key) => (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={tab === key}
                                onClick={() => setTab(key)}
                                className={`relative flex-1 cursor-pointer py-4 text-[12px] transition-colors ${tab === key ? "font-bold text-[#4B9AD2]" : "text-[#575757] hover:text-[#4B9AD2]"
                                    }`}
                            >
                                {t(`tabs.${key}`)}
                                {tab === key && (
                                    <span aria-hidden="true" className="absolute inset-x-[20%] bottom-2 h-[2px] rounded-full bg-[#4B9AD2]" />
                                )}
                            </button>
                        ))}
                    </div>
                    <div role="tabpanel" className="mt-4 flex flex-col gap-6 lg:me-12">
                        {tab === "profile" && (
                            <>
                                {/* نبذة عني */}
                                <section className={panel}>
                                    <PanelTitle icon={UserRound}>{t("about")}</PanelTitle>
                                    <p className="mt-4 text-[13px] leading-[1.9] text-[#414141]">{profile.about || profile.bio}</p>
                                    <ul className="mt-5 grid gap-3 border-t border-[#0000000F] pt-5 sm:grid-cols-3">
                                        {features.map((key) => {
                                            const Icon = FEATURE_ICONS[key] || ShieldCheck;
                                            return (
                                                <li
                                                    key={key}
                                                    className="flex h-9 items-center justify-center gap-2 rounded-xl bg-[#EEF5FC] text-[12px] font-bold text-[#448BBD]"
                                                >
                                                    <Icon size={14} />
                                                    {t(`features.${key}`)}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </section>

                                {/* معاينة معرض الأعمال */}
                                <section className={panel}>
                                    <PanelTitle icon={ImageUp}>{t("tabs.portfolio")}</PanelTitle>
                                    {portfolio.length ? (
                                        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                            {portfolio.slice(0, PREVIEW_COUNT).map((src, i) => {
                                                const isMore = i === PREVIEW_COUNT - 1 && extra > 0;
                                                return (
                                                    <li key={src + i} className="relative h-[92px] overflow-hidden rounded-xl">
                                                        <WorkImage src={src} alt={t("workAlt", { n: i + 1 })} className="h-full w-full" />
                                                        {isMore && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setTab("portfolio")}
                                                                className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/55 text-white"
                                                            >
                                                                <span className="text-[16px] font-bold" dir="ltr">+{extra}</span>
                                                                <span className="text-[10px]">{t("photos")}</span>
                                                            </button>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <p className="mt-4 text-[12px] text-[#89949D]">{t("tabEmpty.portfolio")}</p>
                                    )}
                                </section>

                                {/* معاينة تقييمات العملاء */}
                                <section className={panel}>
                                    <div className="flex items-center justify-between gap-3">
                                        <PanelTitle icon={Star}>{t("customerReviews")}</PanelTitle>
                                        {reviews.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setTab("reviews")}
                                                className="cursor-pointer text-[11px] text-[#4B9AD2] hover:underline"
                                            >
                                                {t("allReviews")}
                                            </button>
                                        )}
                                    </div>
                                    {reviews.length ? (
                                        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                                            {reviews.slice(0, REVIEWS_PREVIEW).map((rv, i) => (
                                                <ReviewCard key={rv.name + i} review={rv} />
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-4 text-[12px] text-[#89949D]">{t("tabEmpty.reviews")}</p>
                                    )}
                                </section>
                            </>
                        )}

                        {tab === "portfolio" && (
                            <section className={panel}>
                                <PanelTitle icon={ImageUp}>{t("tabs.portfolio")}</PanelTitle>
                                {portfolio.length ? (
                                    <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                        {portfolio.map((src, i) => (
                                            <li key={src + i} className="h-[120px] overflow-hidden rounded-xl">
                                                <WorkImage src={src} alt={t("workAlt", { n: i + 1 })} className="h-full w-full" />
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="mt-4 text-[12px] text-[#89949D]">{t("tabEmpty.portfolio")}</p>
                                )}
                            </section>
                        )}

                        {tab === "reviews" &&
                            (reviews.length ? (
                                <section className={panel}>
                                    <PanelTitle icon={Star}>{t("customerReviews")}</PanelTitle>
                                    <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                                        {reviews.map((rv, i) => (
                                            <ReviewCard key={rv.name + i} review={rv} />
                                        ))}
                                    </ul>
                                </section>
                            ) : (
                                <p className={`${panel} py-10 text-center text-[12px] text-[#89949D]`}>{t("tabEmpty.reviews")}</p>
                            ))}
                    </div>
                </div>

                {/* العمود الجانبي */}
                <aside className="flex flex-col gap-6 lg:pt-16">
                    <div className="flex gap-3">
                        <Link
                            to={chatTo}
                            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#4B87BE] text-[13px] font-semibold text-white btn-wipe"
                        >
                            <MessageSquare size={15} />
                            {t("startChat")}
                        </Link>
                        <Link
                            to={requestTo}
                            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[#9CC9EA] text-[13px] font-semibold text-[#4B87BE] btn-wipe btn-wipe-outline"
                        >
                            <CalendarDays size={15} />
                            {t("requestService")}
                        </Link>
                    </div>

                    {profile.hours && (
                        <SideCard icon={Clock} title={t("hours")}>
                            <p>{profile.hours.days}</p>
                            <p>{profile.hours.time}</p>
                        </SideCard>
                    )}

                    {profile.areas && (
                        <SideCard icon={MapPin} title={t("areas")}>
                            <p className="flex items-start gap-2">
                                <MapIcon size={13} className="mt-1 shrink-0 text-[#4B9AD2]" />
                                {profile.areas}
                            </p>
                        </SideCard>
                    )}
                </aside>
            </div>
        </div>
    );
}
