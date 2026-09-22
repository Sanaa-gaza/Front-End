import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useLangDir from "../../hooks/useLangDir";
import { useTheme } from "../../context/ThemeContext";

const SERVICE_IMAGES = [
    "/images/Rectangle 39574.svg",
    "/images/Rectangle 39574 (1).svg",
    "/images/Rectangle 39574 (2).svg",
    "/images/Rectangle 39574 (3).svg",
    "/images/Rectangle 39574 (4).svg",
];

const CRAFTSMEN_AVATARS = [
    "/images/Ellipse 1594.svg",
    "/images/Ellipse 1595.svg",
    "/images/Ellipse 1596.svg",
    "/images/Ellipse 1597.svg",
    "/images/Ellipse 1595 (1).svg",
];

const HERO_AVATARS = [
    "/images/Ellipse 1595 (2).svg",
    "/images/Ellipse 1595 (3).svg",
    "/images/Ellipse 1595 (4).svg",
    "/images/Ellipse 1595 (5).svg",
];

export default function Home() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation("home");
    const { theme, toggleTheme } = useTheme();
    useLangDir();

    const [search, setSearch] = useState("");
    const carouselRef = useRef(null);

    const toggleLang = () => i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar");

    const scrollCarousel = (dir) => {
        carouselRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
    };

    const craftsmen = [
        { key: "c1", avatar: CRAFTSMEN_AVATARS[0], rating: "4.5" },
        { key: "c2", avatar: CRAFTSMEN_AVATARS[1], rating: "4.9" },
        { key: "c3", avatar: CRAFTSMEN_AVATARS[2], rating: "4.5" },
        { key: "c4", avatar: CRAFTSMEN_AVATARS[3], rating: "4.8" },
        { key: "c5", avatar: CRAFTSMEN_AVATARS[4], rating: "4.9" },
    ];

    const serviceKeys = ["cleaning", "painting", "carpentry", "electricity", "plumbing"];

    return (
        <div className="min-h-dvh bg-white dark:bg-slate-900">
            {/* ===== Header ثابت أعلى الصفحة ===== */}
            <header className="sticky top-0 z-40 flex items-center justify-between gap-4 px-4 sm:px-8 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm shadow-[#0000001A]">
                <button type="button" onClick={() => navigate("/")} className="cursor-pointer shrink-0">
                    <img src="/images/logo w 1.svg" alt="صنعة" className="w-[85px] sm:w-[100px]" />
                </button>

                <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#141415D1] dark:text-slate-100">
                    <a href="#home" className="hover:text-[#4B9AD2] transition-colors">{t("nav.home")}</a>
                    <a href="#services" className="hover:text-[#4B9AD2] transition-colors">{t("nav.services")}</a>
                    <a href="#craftsmen" className="hover:text-[#4B9AD2] transition-colors">{t("nav.craftsmen")}</a>
                    <a href="#about" className="hover:text-[#4B9AD2] transition-colors">{t("nav.about")}</a>
                    <a href="#contact" className="hover:text-[#4B9AD2] transition-colors">{t("nav.contact")}</a>
                </nav>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label={theme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#2563EB] text-[#2563EB] flex items-center justify-center cursor-pointer"
                    >
                        <i className={theme === "dark" ? "fa-solid fa-sun" : "fa-regular fa-moon"}></i>
                    </button>
                    <button
                        type="button"
                        onClick={toggleLang}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#2563EB] text-xs text-[#2563EB] flex items-center justify-center font-bold cursor-pointer"
                    >
                        {i18n.language === "ar" ? "EN" : "AR"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="hidden sm:inline-flex text-[#141415D1] dark:text-slate-100 bg-[#F5F6F8] dark:bg-slate-800 hover:bg-[#eceff2] transition-colors rounded-full py-2 px-4 text-sm font-medium cursor-pointer"
                    >
                        {t("login")}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/get-started")}
                        className="text-white bg-[#4B9AD2] hover:bg-[#3d82b3] transition-colors rounded-full py-2 px-4 text-sm font-medium cursor-pointer"
                    >
                        {t("createAccount")}
                    </button>
                </div>
            </header>

            {/* ===== Hero ===== */}
            <section id="home" className="relative overflow-hidden px-4 sm:px-8 py-10 sm:py-16 bg-gradient-to-b from-[#eaf3fb] dark:from-slate-950 to-white dark:to-slate-900">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-10">
                    <div className="text-center lg:text-start order-2 lg:order-1">
                        <h1 className="text-[#141415D1] dark:text-slate-100 text-3xl sm:text-4xl font-bold leading-tight mb-4">
                            {t("hero.title")}
                        </h1>
                        <p className="text-[#89949D] dark:text-slate-400 text-base sm:text-lg mb-6 max-w-lg mx-auto lg:mx-0">
                            {t("hero.desc")}
                        </p>

                        <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white dark:bg-slate-900 rounded-xl sm:rounded-full shadow-md shadow-[#0000001A] p-2 max-w-xl mx-auto lg:mx-0">
                            <select className="bg-[#F5F6F8] dark:bg-slate-800 rounded-full px-4 py-2 text-sm text-[#141415D1] dark:text-slate-100 outline-none">
                                <option>{t("hero.allCities")}</option>
                            </select>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t("hero.searchPlaceholder")}
                                className="flex-1 px-4 py-2 text-sm text-[#141415D1] dark:text-slate-100 placeholder-[#89949D] outline-none"
                            />
                            <button
                                type="button"
                                className="flex items-center justify-center gap-1.5 bg-[#4B9AD2] hover:bg-[#3d82b3] transition-colors text-white rounded-full px-5 py-2 text-sm font-medium cursor-pointer"
                            >
                                <i className="fa-solid fa-magnifying-glass text-xs"></i>
                                {t("hero.search")}
                            </button>
                        </div>

                        <div className="flex items-center justify-center lg:justify-start gap-6 mt-7 flex-wrap">
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2 rtl:space-x-reverse">
                                    {HERO_AVATARS.map((src, i) => (
                                        <img key={i} src={src} alt="" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                                    ))}
                                </div>
                                <p className="text-sm text-[#141415D1] dark:text-slate-100">
                                    <span className="font-bold">{t("hero.usersCount")}</span>{" "}
                                    <span className="text-[#89949D] dark:text-slate-400">{t("hero.usersLabel")}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <i className="fa-solid fa-star text-amber-400 text-sm"></i>
                                <p className="text-sm text-[#141415D1] dark:text-slate-100">
                                    <span className="font-bold">{t("hero.rating")}</span>{" "}
                                    <span className="text-[#89949D] dark:text-slate-400">{t("hero.ratingLabel")}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative order-1 lg:order-2">
                        <img
                            src="/images/WhatsApp Image 2026-09-07 at 23.50.41 1.svg"
                            alt={t("hero.title")}
                            className="w-full max-w-md mx-auto rounded-3xl object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* ===== خدمات متنوعة (كاروسيل) ===== */}
            <section id="services" className="px-4 sm:px-8 py-14">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-center text-[#141415D1] dark:text-slate-100 text-2xl sm:text-3xl font-bold mb-10">
                        {t("services.title")}
                    </h2>

                    <div className="relative flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => scrollCarousel(i18n.language === "ar" ? 1 : -1)}
                            className="hidden sm:flex w-9 h-9 shrink-0 rounded-full border border-[#0000001A] dark:border-white/10 items-center justify-center text-[#4B9AD2] hover:bg-[#F5F6F8] cursor-pointer"
                            aria-label="previous"
                        >
                            <i className="fa-solid fa-chevron-right rtl:rotate-180"></i>
                        </button>

                        <div ref={carouselRef} className="flex-1 flex gap-4 overflow-x-auto scroll-smooth pb-2 snap-x">
                            {serviceKeys.map((key, i) => (
                                <div
                                    key={key}
                                    className={`relative shrink-0 snap-center rounded-2xl overflow-hidden ${i === 1 ? "w-56 sm:w-64" : "w-40 sm:w-48"
                                        }`}
                                >
                                    <img
                                        src={SERVICE_IMAGES[i]}
                                        alt={t(`services.items.${key}`)}
                                        className="w-full h-56 sm:h-64 object-cover"
                                    />
                                    {i === 1 && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-4">
                                            <span className="self-start bg-[#4B9AD2] text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                                                {t("services.featuredTag")}
                                            </span>
                                            <p className="text-white text-sm mb-1">{t("services.featuredDesc")}</p>
                                            <a href="#services" className="text-white text-xs font-semibold underline">
                                                {t("services.more")}
                                            </a>
                                        </div>
                                    )}
                                    {i !== 1 && (
                                        <span className="absolute bottom-2 inset-x-0 text-center text-white text-xs font-bold drop-shadow">
                                            {t(`services.items.${key}`)}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => scrollCarousel(i18n.language === "ar" ? -1 : 1)}
                            className="hidden sm:flex w-9 h-9 shrink-0 rounded-full border border-[#0000001A] dark:border-white/10 items-center justify-center text-[#4B9AD2] hover:bg-[#F5F6F8] cursor-pointer"
                            aria-label="next"
                        >
                            <i className="fa-solid fa-chevron-left rtl:rotate-180"></i>
                        </button>
                    </div>
                </div>
            </section>

            {/* ===== حرفيو الشهر ===== */}
            <section id="craftsmen" className="px-4 sm:px-8 py-14 bg-[#F8FAFC]">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-[#141415D1] dark:text-slate-100 text-2xl sm:text-3xl font-bold mb-2">
                        {t("craftsmen.title")}{" "}
                        <span className="text-[#4B9AD2]">{t("craftsmen.titleHighlight")}</span>
                    </h2>
                    <p className="text-[#89949D] dark:text-slate-400 max-w-2xl mx-auto mb-10">{t("craftsmen.desc")}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                        {craftsmen.map((c) => (
                            <div
                                key={c.key}
                                className="bg-white dark:bg-slate-900 border border-[#0000001A] dark:border-white/10 rounded-2xl p-5 flex flex-col items-center text-center hover:shadow-md transition-shadow"
                            >
                                <div className="relative mb-3">
                                    <img src={c.avatar} alt={t(`craftsmen.list.${c.key}.name`)} className="w-16 h-16 rounded-full object-cover" />
                                    <span className="absolute -bottom-1 -end-1 bg-amber-400 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                        <i className="fa-solid fa-star text-[8px]"></i>
                                        {c.rating}
                                    </span>
                                </div>
                                <p className="text-[#141415D1] dark:text-slate-100 text-sm font-bold mb-1">{t(`craftsmen.list.${c.key}.name`)}</p>
                                <span className="bg-[#DEE8FC] dark:bg-[#4B9AD2]/15 text-[#4B9AD2] text-xs font-medium px-2.5 py-1 rounded-full">
                                    {t(`craftsmen.list.${c.key}.craft`)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== خدماتنا المميزة ===== */}
            <section id="about" className="px-4 sm:px-8 py-14">
                <div className="max-w-6xl mx-auto text-center">
                    <span className="inline-block text-[#4B9AD2] text-xs font-bold bg-[#DEE8FC] dark:bg-[#4B9AD2]/15 px-3 py-1 rounded-full mb-3">
                        {t("features.tag")}
                    </span>
                    <h2 className="text-[#141415D1] dark:text-slate-100 text-2xl sm:text-3xl font-bold mb-10">{t("features.title")}</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {["payment", "choice", "search"].map((key) => (
                            <div key={key} className="bg-white dark:bg-slate-900 border border-[#0000001A] dark:border-white/10 rounded-2xl p-6 text-start">
                                <div className="w-12 h-12 rounded-xl bg-[#4B9AD2] text-white flex items-center justify-center mb-4">
                                    <i
                                        className={`fa-solid ${key === "payment" ? "fa-shield-halved" : key === "choice" ? "fa-user-check" : "fa-magnifying-glass"
                                            } text-lg`}
                                    ></i>
                                </div>
                                <h3 className="text-[#141415D1] dark:text-slate-100 font-bold mb-2">{t(`features.${key}.title`)}</h3>
                                <p className="text-[#89949D] dark:text-slate-400 text-sm leading-relaxed">{t(`features.${key}.desc`)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== دليل الاستخدام ===== */}
            <section className="px-4 sm:px-8 py-14 bg-[#F8FAFC]">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                    <div className="bg-[#141415D1]/5 border border-[#0000001A] dark:border-white/10 rounded-2xl aspect-video flex items-center justify-center order-2 lg:order-1">
                        <button
                            type="button"
                            aria-label="play"
                            className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 shadow-md flex items-center justify-center text-[#4B9AD2] cursor-pointer hover:scale-105 transition-transform"
                        >
                            <i className="fa-solid fa-play text-xl ps-1"></i>
                        </button>
                    </div>

                    <div className="order-1 lg:order-2">
                        <h2 className="text-[#141415D1] dark:text-slate-100 text-2xl sm:text-3xl font-bold mb-6">
                            {t("guide.title")} <span className="text-[#4B9AD2]">{t("guide.titleHighlight")}</span>
                        </h2>

                        <div className="space-y-5">
                            {["trusted", "clear", "easy", "safe"].map((key) => (
                                <div key={key} className="flex items-start gap-3">
                                    <span className="w-8 h-8 shrink-0 rounded-full bg-[#DEE8FC] dark:bg-[#4B9AD2]/15 text-[#4B9AD2] flex items-center justify-center">
                                        <i className="fa-solid fa-check text-xs"></i>
                                    </span>
                                    <div>
                                        <p className="text-[#141415D1] dark:text-slate-100 font-bold text-sm mb-0.5">{t(`guide.${key}.title`)}</p>
                                        <p className="text-[#89949D] dark:text-slate-400 text-sm">{t(`guide.${key}.desc`)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section id="contact" className="px-4 sm:px-8 py-14">
                <div className="max-w-4xl mx-auto text-center bg-[#4B9AD2] rounded-3xl px-6 sm:px-14 py-12">
                    <h2 className="text-white text-2xl sm:text-3xl font-bold mb-4">{t("cta.title")}</h2>
                    <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-7">
                        {t("cta.desc")}
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/get-started")}
                        className="bg-white dark:bg-slate-900 text-[#4B9AD2] hover:bg-slate-100 transition-colors rounded-full px-7 py-3 font-bold cursor-pointer"
                    >
                        {t("cta.button")}
                    </button>
                </div>
            </section>

            {/* ===== Footer ===== */}
            <footer className="px-4 sm:px-8 py-6 border-t border-[#0000001A] dark:border-white/10">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-[#89949D] dark:text-slate-400">
                        <a href="#" aria-label="Instagram" className="hover:text-[#4B9AD2] transition-colors"><i className="fa-brands fa-instagram"></i></a>
                        <a href="#" aria-label="Facebook" className="hover:text-[#4B9AD2] transition-colors"><i className="fa-brands fa-facebook"></i></a>
                        <a href="#" aria-label="TikTok" className="hover:text-[#4B9AD2] transition-colors"><i className="fa-brands fa-tiktok"></i></a>
                    </div>
                    <p className="text-[#89949D] dark:text-slate-400 text-xs">{t("footer.copyright")}</p>
                </div>
            </footer>

            {/* ===== زر المساعد الذكي العائم (ثابت مكانه أثناء التمرير) ===== */}
            <button
                type="button"
                aria-label={t("assistant.label")}
                className="fixed bottom-6 end-6 z-50 w-14 h-14 rounded-full bg-[#4B9AD2] shadow-lg shadow-[#4B9AD2]/40 flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform"
            >
                <img src="/images/تنزيل (3)-Photoroom 1.svg" alt="" className="w-9 h-9" />
            </button>
        </div>
    );
}
