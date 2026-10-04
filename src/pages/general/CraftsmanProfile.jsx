import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Construction } from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import useLangDir from "../../hooks/useLangDir";

/**
 * صفحة الملف المهني للحرفي (/craftsmen/:craftsmanKey).
 * مؤقتاً بتعرض "قيد الإنشاء" لحد ما يجهز التصميم.
 */
export default function CraftsmanProfile() {
    const { t } = useTranslation("craftsmen");
    useLangDir();

    return (
        <div className="relative min-h-dvh overflow-x-hidden bg-white">
            <Header />
            <main className="mx-auto flex max-w-[1230px] flex-col items-center px-5 pb-24 pt-36 text-center sm:px-10 sm:pt-44">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF3FB] text-[#4B9AD2]">
                    <Construction size={28} />
                </div>
                <h1 className="text-[26px] font-bold text-[#22455E] sm:text-[32px]">{t("profilePage.title")}</h1>
                <p className="mt-3 max-w-md text-[14px] leading-[1.9] text-[#575757]">{t("profilePage.desc")}</p>
                <Link
                    to="/craftsmen"
                    className="mt-8 rounded-lg bg-[#4B9AD2] px-6 py-2.5 text-sm font-medium text-white btn-wipe"
                >
                    {t("profilePage.back")}
                </Link>
            </main>
            <Footer />
        </div>
    );
}
