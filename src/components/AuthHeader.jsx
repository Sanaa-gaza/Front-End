import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";

export default function AuthHeader() {
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const toggleLang = () => i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar");

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 shadow-md shadow-[#0000001A]">
            <button type="button" onClick={() => navigate("/")} className="cursor-pointer">
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
    );
}