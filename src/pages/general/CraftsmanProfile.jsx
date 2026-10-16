import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserRoundSearch } from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import ProviderProfile from "../../components/profile/ProviderProfile";
import { fileUrl } from "../../api/client";
import useLangDir from "../../hooks/useLangDir";

/**
 * صفحة الملف المهني للحرفي (/craftsmen/:craftsmanKey).
 * ⚠️ ما في endpoint لحرفي واحد بالسيرفر لسا، فالبيانات بتيجي مع الرابط من صفحة الحرفيين (location.state).
 * لو انفتحت الصفحة مباشرة (بدون بيانات) بنطلب من المستخدم يفتحها من القائمة.
 */
export default function CraftsmanProfile() {
    const { t } = useTranslation("providerProfile");
    const { state } = useLocation();
    useLangDir();
    const c = state?.craftsman;

    let content;
    if (!c) {
        content = (
            <div className="flex flex-col items-center py-16 text-center">
                <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF3FB] text-[#4B9AD2]">
                    <UserRoundSearch size={28} />
                </span>
                <p className="max-w-md text-[14px] leading-[1.9] text-[#575757]">{t("openFromList")}</p>
                <Link to="/craftsmen" className="mt-8 rounded-lg bg-[#4B9AD2] px-6 py-2.5 text-sm font-medium text-white btn-wipe">
                    {t("backToCraftsmen")}
                </Link>
            </div>
        );
    } else {
        const craft = c.craft?.name || "";
        const location = state.location || "";
        const profile = {
            name: c.full_name,
            craft,
            location,
            bio: c.bio || c.description || (craft ? t("defaultBio", { craft, years: c.years_of_experience || 5 }) : ""),
            about: c.about || (craft ? t("defaultAbout", { name: c.full_name, craft, years: c.years_of_experience || 5 }) : ""),
            portfolio: (c.portfolio || []).map((w) => fileUrl(w.path || w)).filter(Boolean),
            // التقييمات لو السيرفر بعتها مع الحرفي
            reviews: (c.reviews || []).map((rv) => ({
                name: rv.customer?.full_name || rv.name || "",
                date: rv.created_at ? new Date(rv.created_at).toLocaleDateString() : "",
                rating: Number(rv.rating || 0),
                comment: rv.comment || "",
            })),
            rating: Number(c.avg_rating || 0),
            verified: Boolean(c.is_trusted),
            photo: fileUrl(c.personal_photo_path),
            hours: { days: t("defaultDays"), time: t("defaultTime") },
            areas: location ? t("nearby", { area: location }) : "",
        };
        // التواصل وطلب الخدمة بيحتاجوا تسجيل دخول
        content = <ProviderProfile profile={profile} chatTo="/login" requestTo="/login" />;
    }

    return (
        <div className="relative min-h-dvh overflow-x-hidden bg-white">
            <Header />
            <main className="mx-auto max-w-[1230px] px-5 pb-24 pt-32 sm:px-10 sm:pt-40">{content}</main>
            <Footer />
        </div>
    );
}
