import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// scroll: يمرر لقسم بالصفحة الرئيسية، path: يفتح صفحة ثانية
const NAV_ITEMS = [
    { key: "home", scroll: "home" },
    { key: "services", scroll: "services" },
    { key: "craftsmen", path: "/craftsmen" },
    { key: "about", path: "/about" },
    { key: "contact", path: "/contact" },
];

export default function HomeHeader() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { t, i18n } = useTranslation("home");

    const toggleLang = () =>
        i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar");

    const goTo = (item) => {
        if (item.path) {
            navigate(item.path);
            window.scrollTo({ top: 0 });
            return;
        }
        if (pathname === "/") {
            if (item.scroll === "home") {
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                document.getElementById(item.scroll)?.scrollIntoView({ behavior: "smooth" });
            }
        } else {
            navigate("/", { state: { scrollTo: item.scroll } });
        }
    };

    const isActive = (item) =>
        item.path ? pathname === item.path : item.key === "home" && pathname === "/";

    return (
        <div className="pointer-events-none fixed top-3 sm:top-5 inset-x-0 z-50 px-4 sm:px-10 lg:px-[6%]">
            <header className="mx-auto flex h-[68px] sm:h-[76px] max-w-[1320px] items-center justify-between gap-4 pointer-events-auto rounded-full border border-white/60 bg-white/60 px-5 sm:px-8 shadow-[0_8px_30px_rgba(35,74,100,0.12)] backdrop-blur-xl backdrop-saturate-150">
                <button
                    type="button"
                    onClick={() => goTo({ scroll: "home", key: "home" })}
                    className="shrink-0 cursor-pointer"
                >
                    <img
                        src="/images/logo w 1.svg"
                        alt="صنعة"
                        className="w-[84px] sm:w-[100px]"
                    />
                </button>

                <nav className="hidden lg:flex items-center gap-9 text-[15px] font-medium text-[#141415]">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => goTo(item)}
                            className={`nav-link cursor-pointer transition-colors ${
                                isActive(item)
                                    ? "nav-link-active text-[#4B9AD2] font-semibold"
                                    : "hover:text-[#4B9AD2]"
                            }`}
                        >
                            {t(`nav.${item.key}`)}
                        </button>
                    ))}
                </nav>

                <div className="flex shrink-0 items-center gap-2 sm:gap-3">

                    <button
                        type="button"
                        onClick={toggleLang}
                        aria-label="Language"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#4B9AD2] text-[11px] font-bold text-[#4B9AD2] cursor-pointer btn-wipe btn-wipe-outline"
                    >
                        {i18n.language === "ar" ? "EN" : "AR"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="inline-flex h-10 items-center rounded-lg bg-[#4B9AD2] px-5 text-sm font-medium text-white cursor-pointer btn-wipe"
                    >
                        {t("login")}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/get-started")}
                        className="hidden sm:inline-flex h-10 items-center rounded-lg border border-[#4B9AD2] px-5 text-sm font-medium text-[#4B9AD2] cursor-pointer btn-wipe btn-wipe-outline"
                    >
                        {t("createAccount")}
                    </button>

                </div>
            </header>
        </div>
    );
}
