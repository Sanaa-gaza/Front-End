import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bookmark, Check, ChevronLeft, ChevronRight, MapPin, Star, Wrench } from "lucide-react";

// المقاسات: العادي (صفحة الحرفيين) والأصغر (لوحة المؤسسة)
const SIZES = {
    md: {
        card: "rounded-[28px] p-6",
        photo: "h-[88px] w-[88px] text-[24px]",
        badge: "h-7 w-7",
        badgeIcon: 14,
        name: "text-[18px]",
        craft: "text-[15px]",
        reviews: "text-[13px]",
        rating: "text-[15px]",
        star: 16,
        facts: "mt-5 text-[14px]",
        factIcon: 17,
        divider: "mx-4 h-6",
        actions: "pt-6",
        button: "h-14 rounded-2xl text-[17px]",
        save: "h-14 w-14 rounded-2xl",
        saveIcon: 20,
    },
    sm: {
        card: "rounded-[24px] p-5",
        photo: "h-[72px] w-[72px] text-[20px]",
        badge: "h-6 w-6",
        badgeIcon: 12,
        name: "text-[16px]",
        craft: "text-[13px]",
        reviews: "text-[11px]",
        rating: "text-[13px]",
        star: 14,
        facts: "mt-4 text-[12px]",
        factIcon: 15,
        divider: "mx-3 h-5",
        actions: "pt-5",
        button: "h-12 rounded-xl text-[15px]",
        save: "h-12 w-12 rounded-xl",
        saveIcon: 18,
    },
};

/** وسام "موثوق": دائرة مسنّنة بنجمة بالنص وشريطين تحت */
function VerifiedIcon({ size = 17, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
            <path d="M12 1.8l1.6 1.2 2-.2.8 1.8 1.8.8-.2 2 1.2 1.6-1.2 1.6.2 2-1.8.8-.8 1.8-2-.2-1.6 1.2-1.6-1.2-2 .2-.8-1.8-1.8-.8.2-2L4.6 9l1.2-1.6-.2-2 1.8-.8.8-1.8 2 .2z" />
            <path d="M12 6.4l1.1 2.2 2.4.35-1.75 1.7.42 2.4L12 11.9l-2.17 1.15.42-2.4-1.75-1.7 2.4-.35z" />
            <path d="M8.3 15.6L7 22l5-2.6 5 2.6-1.3-6.4" />
        </svg>
    );
}

/** صورة مزوّد الخدمة، ولو ما في صورة (أو ما انفتحت) بنعرض أول حرف من اسمه */
function Photo({ src, name, className }) {
    const [failed, setFailed] = useState(false);
    const base = `${className} rounded-full border-4 border-white shadow-[0_4px_14px_rgba(0,0,0,0.14)] transition-transform duration-300 group-hover:scale-105`;
    if (!src || failed) {
        return (
            <span className={`${base} flex items-center justify-center bg-[#EEF5FC] font-bold text-[#4B9AD2]`}>
                {name.trim().charAt(0)}
            </span>
        );
    }
    return <img src={src} alt={name} draggable="false" onError={() => setFailed(true)} className={`${base} object-cover`} />;
}

/**
 * بطاقة حرفي / مزوّد خدمة — نفس الشكل بصفحة الحرفيين العامة وبلوحة المؤسسة.
 * to + linkState: رابط "زيارة الملف المهني" (والـ state اللي بينبعت معه)
 * years / location / verified / available: كل وحدة بتظهر بس لو موجودة
 * size: "md" (افتراضي) | "sm" (أصغر)
 */
export default function ProviderCard({ name, craft, photo, rating = 0, reviews = 0, years, location, verified, available, to, linkState, size = "md" }) {
    const { t, i18n } = useTranslation("providerProfile");
    // ⚠️ الحفظ بالصفحة بس لحد ما يصير في endpoint للمحفوظات
    const [saved, setSaved] = useState(false);
    const Chevron = i18n.dir() === "rtl" ? ChevronLeft : ChevronRight;
    const z = SIZES[size] || SIZES.md;

    const facts = [
        years ? { key: "years", icon: Wrench, text: t("card.years", { count: years }) } : null,
        location ? { key: "location", icon: MapPin, text: location } : null,
        verified ? { key: "verified", icon: VerifiedIcon, text: t("card.verified") } : null,
    ].filter(Boolean);

    return (
        <article className={`group flex flex-col border border-[#0000001A] bg-white transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#8EC0E4] ${z.card}`}>
            <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                    <Photo src={photo} name={name} className={z.photo} />
                    {verified && (
                        <span
                            title={t("card.verified")}
                            className={`absolute bottom-0.5 end-0 flex items-center justify-center rounded-full border-2 border-white bg-[#4B9AD2] text-white ${z.badge}`}
                        >
                            <Check size={z.badgeIcon} strokeWidth={3} />
                        </span>
                    )}
                </div>

                <div className="min-w-0 flex-1 pt-2">
                    <h3 className={`truncate font-bold text-[#1E293B] ${z.name}`}>{name}</h3>
                    {craft && <p className={`mt-1 font-medium text-[#4B9AD2] ${z.craft}`}>{craft}</p>}
                    <p className={`mt-1.5 flex items-center gap-1.5 text-[#89949D] ${z.reviews}`}>
                        <Star size={z.star} className="fill-[#F6C90E] text-[#F6C90E]" />
                        <bdi dir="ltr" className={`font-bold text-[#1E293B] ${z.rating}`}>{Number(rating).toFixed(1)}</bdi>
                        {t("card.reviews", { count: reviews })}
                    </p>
                </div>

                {available && (
                    <span className="shrink-0 whitespace-nowrap rounded-full border border-[#BFEBCD] bg-[#EEFAF2] px-3 py-1 text-[11px] text-[#2EAF4E]">
                        {t("card.available")}
                    </span>
                )}
            </div>

            {facts.length > 0 && (
                <ul className={`flex flex-wrap items-center gap-y-2 font-medium text-[#1E293B] ${z.facts}`}>
                    {facts.map(({ key, icon: Icon, text }, i) => (
                        <li key={key} className="flex items-center">
                            {/* فاصل عمودي بين المعلومات */}
                            {i > 0 && <span aria-hidden="true" className={`w-px bg-[#0000001A] ${z.divider}`} />}
                            <span className="flex items-center gap-2">
                                <Icon size={z.factIcon} strokeWidth={1.8} className="text-[#4B9AD2]" />
                                {text}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            <div className={`mt-auto flex gap-3 ${z.actions}`}>
                <Link
                    to={to}
                    state={linkState}
                    // btn-wipe = نفس هوفر باقي الأزرار (لون غامق بيمسح الزر من جهة البداية)
                    className={`flex flex-1 items-center justify-center gap-3 bg-linear-to-l from-[#4B9AD2] to-[#64B0E6] font-semibold text-white shadow-[0_8px_18px_rgba(75,154,210,0.3)] btn-wipe ltr:bg-linear-to-r ${z.button}`}
                >
                    {t("card.visitProfile")}
                    <Chevron size={18} />
                </Link>
                <button
                    type="button"
                    onClick={() => setSaved((v) => !v)}
                    aria-pressed={saved}
                    aria-label={t(saved ? "card.unsave" : "card.save")}
                    title={t(saved ? "card.unsave" : "card.save")}
                    className={`flex shrink-0 cursor-pointer items-center justify-center border border-[#CFE3F3] bg-[#F7FAFD] text-[#4B9AD2] shadow-[0_4px_12px_rgba(75,154,210,0.12)] transition-all duration-300 hover:border-[#4B9AD2] hover:bg-[#4B9AD2] hover:text-white active:scale-95 ${z.save}`}
                >
                    <Bookmark size={z.saveIcon} strokeWidth={1.8} fill={saved ? "currentColor" : "none"} />
                </button>
            </div>
        </article>
    );
}
