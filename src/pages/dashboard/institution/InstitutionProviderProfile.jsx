import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProviderProfile from "../../../components/profile/ProviderProfile";
import { PROVIDERS } from "./providersData";

const BASE = "/dashboard/institution";

// صور معرض الأعمال التجريبية — حطّيها بـ public/images/portfolio/ (لو مش موجودة بيظهر شكل افتراضي)
const PORTFOLIO = [1, 2, 3, 4].map((n) => `/images/portfolio/${n}.jpg`);

/** الملف المهني لمزوّد خدمة داخل لوحة المؤسسة (/dashboard/institution/providers/:providerId) */
export default function InstitutionProviderProfile() {
    const { t } = useTranslation("institutionDashboard");
    const { t: tp } = useTranslation("providerProfile");
    const { providerId } = useParams();
    // لو جاي من "الملف المهني" بكارد متقدم (تفاصيل العرض) بنعرض اسمه وتخصصه بدل بيانات العيّنة
    const from = useLocation().state?.provider;
    const p = PROVIDERS.find((x) => x.id === providerId);

    if (!p) {
        return (
            <div className="mx-auto max-w-[1100px] rounded-[20px] bg-white p-10 text-center shadow-[0_4px_24px_rgba(35,74,100,0.08)]">
                <p className="text-[15px] font-bold text-[#414141]">{tp("notFound")}</p>
                <Link to={`${BASE}/providers`} className="mt-4 inline-block text-[13px] text-[#4B9AD2] hover:underline">
                    {tp("backToProviders")}
                </Link>
            </div>
        );
    }

    // ⚠️ النبذة وساعات العمل ومناطق الخدمة نصوص افتراضية لحد ما تيجي من السيرفر
    const s = `providersPage.sample.${p.id}`;
    const craft = from?.craft || t(`${s}.specialty`);
    const location = from?.location || t(`${s}.location`);
    const name = from?.name || t(`${s}.name`);
    const years = from?.years ?? p.years;
    const profile = {
        id: p.id,
        name,
        craft,
        location,
        bio: tp("defaultBio", { craft, years }),
        about: tp("defaultAbout", { name, craft, years }),
        portfolio: PORTFOLIO,
        portfolioTotal: 16,
        reviews: tp("sampleReviews", { returnObjects: true }),
        rating: from?.rating ?? p.rating,
        verified: from?.verified ?? p.verified,
        hours: { days: tp("defaultDays"), time: tp("defaultTime") },
        areas: tp("nearby", { area: location }),
    };

    return (
        <ProviderProfile
            profile={profile}
            chatTo={`${BASE}/chats`}
            chatState={{ craftsman: { id: p.id, full_name: name } }}
            // الصفحة بدون قائمة جانبية، فرابط الرجوع هو طريق الخروج منها
            backTo={`${BASE}/providers`}
            backLabel={tp("backToProviders")}
        />
    );
}
