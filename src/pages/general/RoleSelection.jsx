import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";

export default function RoleSelection() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation("roleSelection");
    const { theme, toggleTheme } = useTheme();

    const [flip, setFlip] = useState("in");
    useEffect(() => {
        setFlip("in");
    }, []);

    // مزامنة اتجاه الصفحة (RTL/LTR) مع اللغة الحالية
    useEffect(() => {
        document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    const goTo = (path) => {
        setFlip("out");
        setTimeout(() => navigate(path), 400);
    };

    const toggleLang = () => {
        i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar");
    };

    return (
        <div className="min-h-dvh bg-gradient-to-b from-white dark:from-slate-900 to-[#dbeaf5] dark:to-slate-950">
            <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 shadow-md shadow-[#0000001A]">
                <button type="button" onClick={() => goTo("/")} className="cursor-pointer">
                    <img src="/images/logo w 1.svg" alt="صنعة" className="w-[110px]" />
                </button>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label={theme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
                        className="w-9 h-9 rounded-full border border-[#2563EB] text-[#2563EB] flex items-center justify-center cursor-pointer"
                    >
                        <i className={theme === "dark" ? "fa-solid fa-sun" : "fa-regular fa-moon"}></i>
                    </button>
                    <button
                        type="button"
                        onClick={toggleLang}
                        className="w-9 h-9 rounded-full border border-[#2563EB] text-xs text-[#2563EB] flex items-center justify-center font-bold cursor-pointer"
                    >
                        {i18n.language === "ar" ? "EN" : "AR"}
                    </button>
                </div>
            </header>

            <main className={`px-4 py-10 ${flip === "in" ? "page-flip-in" : "page-flip-out"}`}>
                <section className="text-center max-w-6xl mx-auto">
                    <h1 className="text-[#141415D1] dark:text-slate-100 text-2xl font-bold mb-2">{t("title")}</h1>
                    <p className="text-[#89949D] dark:text-slate-400 text-xl mb-10">{t("subtitle")}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">

                        <RoleCard
                            icon="/images/العميل.svg"
                            iconAlt={t("client.title")}
                            title={t("client.title")}
                            description={t("client.desc")}
                            buttonLabel={t("client.btn")}
                            onClick={() => goTo("/signup")}
                        />

                        <RoleCard
                            icon="/images/الحرفي.svg"
                            iconAlt={t("craftsman.title")}
                            title={t("craftsman.title")}
                            description={t("craftsman.desc")}
                            buttonLabel={t("craftsman.btn")}
                            onClick={() => goTo("/craftsman-signup")}
                        />

                        <RoleCard
                            icon="/images/users-profiles-minus.svg"
                            iconAlt={t("contractor.title")}
                            title={t("contractor.title")}
                            description={t("contractor.desc")}
                            buttonLabel={t("contractor.btn")}
                            onClick={() => goTo("/contractor-signup")}
                        />

                        <RoleCard
                            icon="/images/luggage-02.svg"
                            iconAlt={t("institution.title")}
                            title={t("institution.title")}
                            description={t("institution.desc")}
                            buttonLabel={t("institution.btn")}
                            onClick={() => goTo("/institution-signup")}
                        />
                    </div>

                    <p className="text-[#89949D] dark:text-slate-400 text-sm mt-10">
                        {t("haveAccount")}{" "}
                        <button
                            type="button"
                            onClick={() => goTo("/login")}
                            className="text-[#4B9AD2] font-semibold hover:underline cursor-pointer"
                        >
                            {t("login")}
                        </button>
                    </p>
                </section>
            </main>
        </div>
    );
}

function RoleCard({ icon, iconAlt, title, description, buttonLabel, onClick }) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-[#0000001A] dark:border-white/10 rounded-2xl shadow-sm 
     text-center py-8 px-4 flex flex-col items-center transition-all hover:translate-y-[-5px] hover:shadow-md hover:shadow-blue-500">
            <div className="bg-[#DEE8FC] dark:bg-[#4B9AD2]/15 rounded-full flex items-center justify-center w-14 h-14 mb-4">
                <img src={icon} alt={iconAlt} className="w-6 h-6" />
            </div>
            <h2 className="text-[#141415D1] dark:text-slate-100 text-lg font-bold mb-2.5">{title}</h2>
            <p className="text-[#89949D] dark:text-slate-400 text-sm leading-6 mb-4">{description}</p>
            <button
                type="button"
                onClick={onClick}
                className="mt-auto text-[#141415D1] dark:text-slate-100 bg-[#DEE8FC] dark:bg-[#4B9AD2]/15 hover:bg-[#d9e9f4] transition-colors rounded-lg py-2.5 w-full font-medium cursor-pointer text-sm"
            >
                {buttonLabel}
            </button>
        </div>
    );
}