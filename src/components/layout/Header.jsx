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

export default function Header() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { t, i18n } = useTranslation("home");
    const [menuOpen, setMenuOpen] = useState(false);
    // القسم الظاهر حالياً بالصفحة الرئيسية (home أو services) عشان نعلّم رابطه active
    const [activeSection, setActiveSection] = useState("home");

    // بنراقب خط وهمي على 40% من ارتفاع الشاشة: لما قسم الخدمات يقطعه بيصير active،
    // ولما نطلع فوقه أو ننزل تحته بيرجع active للرئيسية
    useEffect(() => {
        if (pathname !== "/") return;
        const services = document.getElementById("services");
        if (!services) return;

        const observer = new IntersectionObserver(
            ([entry]) => setActiveSection(entry.isIntersecting ? "services" : "home"),
            { rootMargin: "-40% 0px -60% 0px" }
        );
        observer.observe(services);
        return () => observer.disconnect();
    }, [pathname]);

    // يسكر قائمة الجوال بزر Escape، ويوقف تمرير الصفحة وهي مفتوحة
    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    const goToPage = (path) => {
        setMenuOpen(false);
        navigate(path);
    };

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
        item.path ? pathname === item.path : pathname === "/" && activeSection === item.scroll;

    return (
        <div className="pointer-events-none fixed top-3 sm:top-5 inset-x-0 z-50 px-4 sm:px-10 lg:px-[6%]">
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

                <nav className="hidden lg:flex items-center gap-9 text-[15px] font-medium text-[#22455E]">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => goTo(item)}
                            className={`nav-link cursor-pointer transition-colors ${isActive(item)
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
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2563EB] text-[11px] font-bold text-[#2563EB] cursor-pointer btn-wipe btn-wipe-outline"
                    >
                        {i18n.language === "ar" ? "EN" : "AR"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="hidden sm:inline-flex h-10 items-center rounded-lg bg-[#4B9AD2] px-5 text-sm font-medium text-white cursor-pointer btn-wipe"
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
                        <Menu size={20} />
                    </button>

                </div>
            </header>

            {/* قائمة الجوال: خلفية معتمة + لوحة جانبية بتنزلق من جهة البداية (يمين بالعربي) */}
            <div
                aria-hidden="true"
                onClick={() => setMenuOpen(false)}
                className={`fixed inset-0 bg-[#141415]/40 transition-opacity duration-300 lg:hidden ${menuOpen ? "pointer-events-auto opacity-100" : "opacity-0"
                    }`}
            />

            <aside
                id="mobile-menu"
                inert={!menuOpen}
                className={`fixed inset-y-0 start-0 flex w-[82%] max-w-[320px] flex-col bg-white shadow-[0_0_40px_rgba(20,20,21,0.18)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${menuOpen ? "pointer-events-auto translate-x-0" : "ltr:-translate-x-full rtl:translate-x-full"
                    }`}
            >
                <div className="flex items-center justify-between border-b border-[#0000000F] px-5 py-4">
                    <img src="/images/logo w 1.svg" alt="صنعة" className="w-[84px]" />
                    <button
                        type="button"
                        onClick={() => setMenuOpen(false)}
                        aria-label="Close menu"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#4B9AD2] text-[#4B9AD2] cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
                    {NAV_ITEMS.map((item, i) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => goTo(item)}
                            style={{ transitionDelay: menuOpen ? `${120 + i * 50}ms` : "0ms" }}
                            className={`rounded-xl px-4 py-3 text-start text-[15px] font-medium cursor-pointer transition-all duration-500 ${menuOpen ? "translate-x-0 opacity-100" : "ltr:-translate-x-4 rtl:translate-x-4 opacity-0"
                                } ${isActive(item)
                                    ? "bg-[#4B9AD2]/10 text-[#4B9AD2] font-semibold"
                                    : "text-[#22455E] hover:bg-[#4B9AD2]/5 hover:text-[#4B9AD2]"
                                }`}
                        >
                            {t(`nav.${item.key}`)}
                        </button>
                    ))}
                </nav>

                <div className="flex flex-col gap-3 border-t border-[#0000000F] p-4">
                    <button
                        type="button"
                        onClick={() => goToPage("/login")}
                        className="inline-flex h-11 items-center justify-center rounded-lg bg-[#4B9AD2] px-5 text-sm font-medium text-white cursor-pointer btn-wipe"
                    >
                        {t("login")}
                    </button>
                    <button
                        type="button"
                        onClick={() => goToPage("/get-started")}
                        className="inline-flex h-11 items-center justify-center rounded-lg border border-[#4B9AD2] px-5 text-sm font-medium text-[#4B9AD2] cursor-pointer btn-wipe btn-wipe-outline"
                    >
                        {t("createAccount")}
                    </button>
                </div>
            </aside>
        </div>
    );
}
