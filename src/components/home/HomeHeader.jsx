import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";

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
    const [menuOpen, setMenuOpen] = useState(false);

    // يسكر قائمة الجوال بزر Escape
    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [menuOpen]);

    const toggleLang = () =>
        i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar");

    const goTo = (item) => {
        setMenuOpen(false);
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
            {menuOpen && (
                <div
                    className="modal-backdrop pointer-events-auto fixed inset-0 bg-[#141415]/20 lg:hidden"
                    onClick={() => setMenuOpen(false)}
                />
            )}
            <header className="relative mx-auto flex h-[68px] sm:h-[76px] max-w-[1320px] items-center justify-between gap-4 pointer-events-auto rounded-full border border-white/60 bg-white/60 px-5 sm:px-8 shadow-[0_8px_30px_rgba(35,74,100,0.12)] backdrop-blur-xl backdrop-saturate-150">
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

                    <button
                        type="button"
                        onClick={() => setMenuOpen((o) => !o)}
                        aria-label="Menu"
                        aria-expanded={menuOpen}
                        aria-controls="mobile-menu"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#4B9AD2] text-[#4B9AD2] cursor-pointer lg:hidden"
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                </div>

                {menuOpen && (
                    <nav
                        id="mobile-menu"
                        className="menu-drop absolute inset-x-0 top-full mt-3 flex flex-col gap-1 rounded-3xl border border-white/60 bg-white/90 p-4 shadow-[0_8px_30px_rgba(35,74,100,0.12)] backdrop-blur-xl lg:hidden"
                    >
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => goTo(item)}
                                className={`rounded-xl px-4 py-3 text-start text-[15px] font-medium cursor-pointer transition-colors ${
                                    isActive(item)
                                        ? "bg-[#4B9AD2]/10 text-[#4B9AD2] font-semibold"
                                        : "text-[#141415] hover:bg-[#4B9AD2]/5 hover:text-[#4B9AD2]"
                                }`}
                            >
                                {t(`nav.${item.key}`)}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={() => {
                                setMenuOpen(false);
                                navigate("/get-started");
                            }}
                            className="sm:hidden mt-2 inline-flex h-11 items-center justify-center rounded-lg border border-[#4B9AD2] px-5 text-sm font-medium text-[#4B9AD2] cursor-pointer btn-wipe btn-wipe-outline"
                        >
                            {t("createAccount")}
                        </button>
                    </nav>
                )}
            </header>
        </div>
    );
}
