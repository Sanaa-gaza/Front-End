import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

// ==================== بيانات الحرفيين ====================

// صور الحرفيين اللي بخوذة متوفرة 5 بس، فبتتكرر لحد ما تنضاف صور جديدة
const HELMET_AVATARS = [
    "/images/Ellipse 1595 (1).svg",
    "/images/Ellipse 1595 (2).svg",
    "/images/Ellipse 1595 (3).svg",
    "/images/Ellipse 1595 (4).svg",
    "/images/Ellipse 1595 (5).svg",
];

// category: تصنيف الصفحة، city: مفتاح المدينة، verified: موثوق
const DATA = [
    { rating: "4.5", category: "ac", city: "nuseirat", verified: true, reviews: 120, orders: 200, years: 12, price: [100, 500], featured: true },
    { rating: "4.5", category: "electricity", city: "khanyounis", verified: true, reviews: 86, orders: 140, years: 8, price: [80, 400], featured: false },
    { rating: "4.9", category: "electricity", city: "gaza", verified: true, reviews: 210, orders: 320, years: 15, price: [120, 600], featured: true },
    { rating: "4.8", category: "painting", city: "rafah", verified: false, reviews: 64, orders: 95, years: 6, price: [60, 300], featured: false },
    { rating: "4.7", category: "carpentry", city: "jabalia", verified: true, reviews: 98, orders: 150, years: 10, price: [90, 450], featured: false },
    { rating: "4.5", category: "carpentry", city: "deirbalah", verified: true, reviews: 55, orders: 80, years: 5, price: [70, 350], featured: false },
    { rating: "4.6", category: "painting", city: "khanyounis", verified: false, reviews: 73, orders: 110, years: 7, price: [60, 320], featured: false },
    { rating: "4.9", category: "blacksmith", city: "gaza", verified: true, reviews: 180, orders: 260, years: 14, price: [110, 550], featured: true },
    { rating: "4.7", category: "plumbing", city: "rafah", verified: true, reviews: 92, orders: 130, years: 9, price: [50, 280], featured: false },
    { rating: "4.8", category: "cleaning", city: "nuseirat", verified: true, reviews: 140, orders: 210, years: 11, price: [40, 200], featured: false },
];

const CRAFTSMEN = DATA.map((d, i) => ({
    key: `c${i + 1}`,
    avatar: HELMET_AVATARS[i % HELMET_AVATARS.length],
    ...d,
}));

const CATEGORY_KEYS = ["electricity", "plumbing", "carpentry", "painting", "cleaning", "solar", "blacksmith", "ac"];

// ==================== بيانات الخدمات ====================

// الصور المتوفرة حاليًا 4 فقط، فبتتكرر على الخدمات الباقية لحد ما تنضاف صور جديدة
const IMG = {
    painting: "/images/Rectangle 39574.svg",
    building: "/images/Rectangle 39574 (1).svg",
    carpentry: "/images/Rectangle 39574 (2).svg",
    cleaning: "/images/Rectangle 39574 (3).svg",
};

const SERVICES = [
    { key: "painting", image: IMG.painting },
    { key: "cleaning", image: IMG.cleaning },
    { key: "building", image: IMG.building },
    { key: "carpentry", image: IMG.carpentry },
    { key: "electricity", image: IMG.building },
    { key: "plumbing", image: IMG.cleaning },
    { key: "acMaintenance", image: IMG.carpentry },
    { key: "tiling", image: IMG.painting },
    { key: "gardening", image: IMG.building },
    { key: "moving", image: IMG.cleaning },
];

// ==================== اتجاه الصفحة حسب اللغة ====================

function useLangDir() {
    const { i18n } = useTranslation();
    useEffect(() => {
        document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);
    return i18n;
}

// ==================== ظهور الأقسام أثناء التمرير ====================

const STAGGER_MS = 110;
const DURATION_MS = 900;
const SPLASH_END_MS = 2100;

const isDecor = (el) =>
    el.tagName === "svg" || el.classList.contains("absolute") || el.hasAttribute("aria-hidden");

const contentChildren = (el) => Array.from(el.children).filter((c) => !isDecor(c));

// بيجمع عناصر القسم اللي رح تظهر بالتتابع (العناوين، الكروت، الصور...)
function collectBlocks(root) {
    if (root.className && String(root.className).includes("shadow-[")) return [[root]];

    let container = root;
    let kids = contentChildren(container);
    while (kids.length === 1 && kids[0].tagName === "DIV") {
        if (String(kids[0].className).includes("shadow-[")) return [[kids[0]]];
        container = kids[0];
        kids = contentChildren(container);
    }

    const groups = [];
    const loose = [];
    kids.forEach((kid) => {
        if (kid.classList.contains("grid") && kid.children.length > 1) {
            groups.push(contentChildren(kid));
        } else {
            loose.push(kid);
        }
    });
    return [loose, ...groups].filter((g) => g.length);
}

function useScrollReveal(rootRef) {
    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return undefined;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
        if (!("IntersectionObserver" in window)) return undefined;

        const targets = root.querySelectorAll("main section, footer");
        const items = [];
        targets.forEach((section) => {
            collectBlocks(section).forEach((group) => {
                group.forEach((el, i) => items.push({ el, delay: i * STAGGER_MS }));
            });
        });

        const timers = [];
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const item = items.find((it) => it.el === entry.target);
                    observer.unobserve(entry.target);
                    const boot = Math.max(0, SPLASH_END_MS - performance.now());
                    const delay = item.delay + boot;
                    entry.target.style.setProperty("--rv-delay", `${delay}ms`);
                    requestAnimationFrame(() => entry.target.classList.add("rv-in"));
                    // بعد ما تخلص الحركة بنرجع العنصر لحالته الطبيعية عشان الهوفر يشتغل
                    timers.push(
                        setTimeout(() => {
                            entry.target.classList.remove("rv", "rv-in");
                            entry.target.style.removeProperty("--rv-delay");
                        }, delay + DURATION_MS + 100),
                    );
                });
            },
            { threshold: 0, rootMargin: "0px 0px 12% 0px" },
        );

        items.forEach(({ el }) => {
            el.classList.add("rv");
            observer.observe(el);
        });

        return () => {
            observer.disconnect();
            timers.forEach(clearTimeout);
            items.forEach(({ el }) => {
                el.classList.remove("rv", "rv-in");
                el.style.removeProperty("--rv-delay");
            });
        };
    }, [rootRef]);
}

// ==================== زر المساعد ====================

function AssistantButton() {
    const { t } = useTranslation("home");

    return (
        <div className="fixed bottom-5 right-4 z-50 sm:bottom-6 sm:right-8">
            <button
                type="button"
                aria-label={t("assistant.label")}
                className="group relative block h-[76px] w-[76px] cursor-pointer sm:h-[88px] sm:w-[88px]"
            >
                <span className="absolute inset-0 rounded-full bg-white assistant-pulse transition-transform group-hover:scale-105"></span>
                <img
                    src="/images/تنزيل (3)-Photoroom 1.svg"
                    alt=""
                    className="absolute bottom-[8px] left-1/2 h-[62px] w-auto -translate-x-1/2 object-contain transition-transform group-hover:scale-105 sm:h-[74px]"
                />

                <span className="absolute right-[58px] top-1 z-10 whitespace-nowrap rounded-2xl bg-[#4B9AD2] px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-[0_6px_18px_rgba(75,154,210,0.3)] sm:right-[68px] sm:top-2 sm:text-[12px]">
                    {t("assistant.label")}
                    <span className="absolute -bottom-[5px] right-3 h-0 w-0 border-l-[6px] border-r-[2px] border-t-[7px] border-l-transparent border-r-transparent border-t-[#4B9AD2]"></span>
                </span>
            </button>
        </div>
    );
}

// ==================== هيكل الصفحة (هيدر + محتوى + فوتر) ====================

function SiteLayout({ children }) {
    useLangDir();
    const rootRef = useRef(null);
    useScrollReveal(rootRef);

    return (
        <div ref={rootRef} className="relative min-h-dvh overflow-x-hidden bg-white">
            <Header />
            <main>{children}</main>
            <Footer />
            <AssistantButton />
        </div>
    );
}

// ==================== قسم الواجهة (Hero) ====================

const AVATARS = [
    "/images/Ellipse 1595 (2).svg",
    "/images/Ellipse 1595 (3).svg",
    "/images/Ellipse 1595 (4).svg",
    "/images/Ellipse 1595 (5).svg",
];

function HeroSection() {
    const navigate = useNavigate();
    const { t } = useTranslation(["home", "craftsmen"]);
    const [query, setQuery] = useState("");
    const [service, setService] = useState("");

    return (
        <section
            id="home"
            className="relative overflow-hidden bg-linear-to-br from-[#E4EFFA] via-[#F2F8FD] to-white"
        >
            <div className="relative mx-auto flex min-h-[640px] max-w-[1440px] flex-col justify-start px-5 pb-28 pt-36 sm:pt-40 lg:pt-44 sm:px-10 lg:min-h-[100svh] lg:px-[6%] lg:pb-40">
                <div className="relative z-30 max-w-[760px]">
                    <h1 className="text-[32px] font-bold leading-[1.4] text-[#38749E] sm:text-[40px] xl:text-[42px]">
                        {t("hero.title")}
                    </h1>

                    <p className="mt-3 max-w-[560px] text-[16px] leading-[1.9] text-[#575757] sm:text-[19px]">
                        {t("hero.desc")}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-[#575757]">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2 rtl:space-x-reverse">
                                {AVATARS.map((src, i) => (
                                    <img
                                        key={i}
                                        src={src}
                                        alt=""
                                        className="h-6 w-6 rounded-full border border-white object-cover"
                                    />
                                ))}
                            </div>
                            <span>
                                <bdi dir="ltr" className="inline-block font-medium">{t("hero.usersCount")}</bdi>{" "}
                                {t("hero.usersLabel")}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <i className="fa-solid fa-star text-[11px] text-[#F6C343]"></i>
                            <span>
                                <bdi dir="ltr" className="inline-block font-medium">{t("hero.rating")}</bdi>{" "}
                                {t("hero.ratingLabel")}
                            </span>
                        </div>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const params = new URLSearchParams();
                            if (query.trim()) params.set("q", query.trim());
                            if (service) params.set("category", service);
                            const qs = params.toString();
                            navigate(qs ? `/craftsmen?${qs}` : "/craftsmen");
                        }}
                        className="mt-9 flex w-full max-w-[600px] flex-wrap items-center gap-2.5 rounded-2xl bg-white p-3 shadow-[0_10px_35px_rgba(43,91,120,0.12)] sm:flex-nowrap"
                    >
                        <div className="relative min-w-0 flex-1 basis-full sm:basis-auto">
                            <i className="fa-solid fa-magnifying-glass pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[13px] text-[#4B9AD2]"></i>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={t("hero.searchPlaceholder")}
                                className="h-11 w-full rounded-full border border-[#4B9AD2]/40 bg-white ps-10 pe-4 text-[13px] text-[#141415] outline-none placeholder:text-[#89949D] focus:border-[#4B9AD2]"
                            />
                        </div>

                        <div className="relative w-[46%] shrink-0 sm:w-[170px]">
                            <i className="fa-solid fa-table-cells-large pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[13px] text-[#4B9AD2]"></i>
                            <select
                                value={service}
                                onChange={(e) => setService(e.target.value)}
                                className={`h-11 w-full cursor-pointer appearance-none rounded-full border border-[#4B9AD2]/40 bg-white ps-10 pe-8 text-[13px] outline-none focus:border-[#4B9AD2] ${service ? "text-[#141415]" : "text-[#89949D]"
                                    }`}
                            >
                                <option value="">{t("hero.serviceType")}</option>
                                {CATEGORY_KEYS.map((key) => (
                                    <option key={key} value={key}>
                                        {t(`craftsmen:categories.${key}`)}
                                    </option>
                                ))}
                            </select>
                            <i className="fa-solid fa-chevron-down pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[10px] text-[#89949D]"></i>
                        </div>

                        <button
                            type="submit"
                            className="h-11 flex-1 shrink-0 rounded-xl bg-[#4B9AD2] px-7 text-[14px] font-semibold text-white cursor-pointer sm:flex-none btn-wipe"
                        >
                            {t("hero.search")}
                        </button>
                    </form>
                </div>

                <img
                    src="/images/Hero.svg"
                    alt=""
                    className="pointer-events-none relative z-10 mt-10 w-full select-none lg:absolute lg:bottom-0 lg:end-0 lg:mt-0 lg:w-[54%] lg:max-w-[820px]"
                />
            </div>

            <svg
                viewBox="0 0 1440 120"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-[-1px] z-20 ltr:-scale-x-100 h-[80px] w-full sm:h-[120px]"
            >
                <path
                    d="M0,96 C220,100 520,92 760,68 C940,48 1040,14 1160,14 C1300,14 1380,32 1440,46 L1440,120 L0,120 Z"
                    fill="#ffffff"
                />
            </svg>
        </section>
    );
}

// ==================== قسم الخدمات ====================

const MAX_VISIBLE_OFFSET = 2;
const SCALES = [1, 0.82, 0.68];
const OPACITIES = [1, 0.7, 0.4];
const POSITIONS = [0, 1, 1.78];

function ServicesSection() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation("home");
    const isRtl = i18n.language === "ar";
    const [active, setActive] = useState(2);
    const touchStartX = useRef(null);

    const total = SERVICES.length;
    const canPrev = active > 0;
    const canNext = active < total - 1;
    const goPrev = () => canPrev && setActive((a) => a - 1);
    const goNext = () => canNext && setActive((a) => a + 1);

    // اتجاه ظهور الكروت اللي بعد الكرت الحالي: يسار في العربي، يمين في الإنجليزي
    const side = isRtl ? -1 : 1;

    const onTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(delta) < 40) return;
        const towardNext = isRtl ? delta > 0 : delta < 0;
        if (towardNext) goNext();
        else goPrev();
    };

    const pad = (n) => String(n).padStart(2, "0");

    const dashes = SERVICES.map((s, i) => (
        <button
            key={s.key}
            type="button"
            onClick={() => setActive(i)}
            aria-label={t(`services.items.${s.key}`)}
            className="group flex h-4 items-center cursor-pointer"
        >
            <span
                className={`block h-[2px] rounded-full transition-all ${
                    i === active
                        ? "w-7 bg-[#4B9AD2]"
                        : "w-5 bg-[#D5DEE6] group-hover:bg-[#9DB7CB]"
                }`}
            ></span>
        </button>
    ));

    return (
        <section id="services" className="overflow-hidden bg-white pb-20 pt-10 sm:pt-14">
            <div className="mx-auto max-w-[1440px] px-5 sm:px-10">
                <h2 className="text-center text-[22px] font-bold text-[#1F4E70] sm:text-[28px]">
                    {t("services.title")}
                </h2>
                <div className="mx-auto mt-3 h-px w-28 bg-[#1F4E70]/70 sm:w-36"></div>
            </div>

            <div
                className="relative mt-8 h-[310px] [--step:170px] [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)] sm:h-[350px] sm:[--step:265px]"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                {SERVICES.map((service, i) => {
                    const offset = i - active;
                    const abs = Math.abs(offset);
                    const visible = abs <= MAX_VISIBLE_OFFSET;
                    const isActive = offset === 0;

                    return (
                        <article
                            key={service.key}
                            onClick={() => !isActive && setActive(i)}
                            aria-hidden={!isActive}
                            className={`absolute top-4 left-1/2 w-[210px] rounded-2xl bg-white p-2.5 shadow-[0_10px_35px_rgba(43,91,120,0.16)] transition-all duration-500 ease-out sm:w-[270px] sm:p-3 ${
                                isActive ? "" : "cursor-pointer"
                            }`}
                            style={{
                                transform: `translateX(calc(-50% + ${Math.sign(offset) * side * POSITIONS[Math.min(abs, 2)]} * var(--step))) scale(${SCALES[Math.min(abs, 2)]})`,
                                opacity: visible ? OPACITIES[abs] : 0,
                                filter: abs ? `blur(${abs * 1.5}px)` : "none",
                                zIndex: 10 - abs,
                                pointerEvents: visible ? "auto" : "none",
                            }}
                        >
                            <div className="relative overflow-hidden rounded-xl">
                                <img
                                    src={service.image}
                                    alt={t(`services.items.${service.key}`)}
                                    className="aspect-[16/10] w-full object-cover"
                                    draggable="false"
                                />
                                <span
                                    aria-hidden="true"
                                    className="absolute start-0 bottom-[38px] h-2 w-2.5 bg-[#2F6F9F] sm:bottom-[46px] sm:h-2.5 sm:w-3"
                                    style={{
                                        clipPath: isRtl
                                            ? "polygon(0 100%, 100% 100%, 100% 0)"
                                            : "polygon(0 0, 0 100%, 100% 100%)",
                                    }}
                                ></span>
                                <span
                                    className="absolute start-0 bottom-2.5 flex h-[28px] min-w-[84px] items-center justify-center bg-[#4B9AD2] text-[13px] font-bold text-white sm:bottom-3 sm:h-[34px] sm:min-w-[112px] sm:text-[15px]"
                                    style={{
                                        paddingInlineStart: "14px",
                                        paddingInlineEnd: "26px",
                                        clipPath: isRtl
                                            ? "polygon(0 50%, 16px 0, 100% 0, 100% 100%, 16px 100%)"
                                            : "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)",
                                    }}
                                >
                                    {t(`services.items.${service.key}`)}
                                </span>
                            </div>

                            <div className="px-1.5 pb-1 pt-4">
                                <p className="min-h-[3.2em] text-[14px] font-bold leading-[1.6] text-[#141415] sm:text-[16px]">
                                    {t(`services.descs.${service.key}`)}
                                </p>
                                <button
                                    type="button"
                                    tabIndex={isActive ? 0 : -1}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (isActive) navigate(`/craftsmen?service=${service.key}`);
                                    }}
                                    className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-[#4B9AD2] cursor-pointer hover:underline"
                                >
                                    {t("services.more")}
                                    <i className="fa-solid fa-chevron-left text-[9px] ltr:rotate-180"></i>
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>

            <div className="mt-2 flex flex-col items-center gap-3">
                <span className="text-[12px] text-[#575757]" dir="ltr">
                    <span className="text-[#4B9AD2]">{pad(active + 1)}</span> / {pad(total)}
                </span>

                <div className="flex items-center gap-4" dir="ltr">
                    <button
                        type="button"
                        onClick={isRtl ? goNext : goPrev}
                        disabled={isRtl ? !canNext : !canPrev}
                        aria-label={isRtl ? t("services.next") : t("services.prev")}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4B9AD2] text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer btn-wipe"
                    >
                        <i className="fa-solid fa-arrow-left text-sm"></i>
                    </button>

                    <div className="flex items-center gap-1">
                        {isRtl ? [...dashes].reverse() : dashes}
                    </div>

                    <button
                        type="button"
                        onClick={isRtl ? goPrev : goNext}
                        disabled={isRtl ? !canPrev : !canNext}
                        aria-label={isRtl ? t("services.prev") : t("services.next")}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4B9AD2] text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer btn-wipe"
                    >
                        <i className="fa-solid fa-arrow-right text-sm"></i>
                    </button>
                </div>
            </div>
        </section>
    );
}

// ==================== قسم الحرفيين ====================

function CraftsmenSection() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation("home");
    const isRtl = i18n.language === "ar";
    const trackRef = useRef(null);
    const [progress, setProgress] = useState(0);

    const total = CRAFTSMEN.length;
    const active = Math.round(progress * (total - 1));
    const atStart = progress <= 0.01;
    const atEnd = progress >= 0.99;

    const updateProgress = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        setProgress(max > 0 ? Math.min(Math.abs(el.scrollLeft) / max, 1) : 0);
    }, []);

    useEffect(() => {
        updateProgress();
        window.addEventListener("resize", updateProgress);
        return () => window.removeEventListener("resize", updateProgress);
    }, [updateProgress, isRtl]);

    const scrollStep = (direction) => {
        const el = trackRef.current;
        const card = el?.children[0];
        if (!el || !card) return;
        const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
        el.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: "smooth" });
    };

    const scrollToIndex = (i) => {
        const el = trackRef.current;
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        const target = (i / (total - 1)) * max;
        el.scrollTo({ left: isRtl ? -target : target, behavior: "smooth" });
    };

    const pad = (n) => String(n).padStart(2, "0");

    const dashes = CRAFTSMEN.map((c, i) => (
        <button
            key={c.key}
            type="button"
            onClick={() => scrollToIndex(i)}
            aria-label={t(`craftsmen.list.${c.key}.name`)}
            className="group flex h-4 items-center cursor-pointer"
        >
            <span
                className={`block h-[2px] rounded-full transition-all ${
                    i === active
                        ? "w-7 bg-[#4B9AD2]"
                        : "w-5 bg-[#D5DEE6] group-hover:bg-[#9DB7CB]"
                }`}
            ></span>
        </button>
    ));

    return (
        <section id="craftsmen" className="overflow-hidden bg-white pb-20 pt-6 sm:pt-10">
            <div className="mx-auto max-w-[1440px] px-5 text-center sm:px-10">
                <h2 className="text-[22px] font-bold text-[#1F4E70] sm:text-[28px]">
                    <span className="text-[#4B9AD2]">{t("craftsmen.titleHighlight")}</span>{" "}
                    {t("craftsmen.title")}
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-[13px] text-[#575757] sm:text-[15px]">
                    {t("craftsmen.desc")}
                </p>
            </div>

            <div
                ref={trackRef}
                onScroll={updateProgress}
                className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[9%] [scroll-padding-inline:9%] py-6 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] [scrollbar-width:none] sm:gap-6 [&::-webkit-scrollbar]:hidden"
            >
                {CRAFTSMEN.map((c) => (
                    <article
                        key={c.key}
                        className="group relative w-[210px] shrink-0 snap-start transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_16px_32px_rgba(75,154,210,0.28)] rounded-2xl bg-white px-5 pb-5 pt-10 text-center shadow-[0_8px_28px_rgba(43,91,120,0.13)] sm:w-[250px]"
                    >
                        <span className="absolute start-4 top-3 text-[10px] font-medium text-[#4B9AD2]">
                            {t(`craftsmen.list.${c.key}.craft`)}
                        </span>

                        <div className="relative mx-auto h-[112px] w-[112px] sm:h-[120px] sm:w-[120px]">
                            <img
                                src={c.avatar}
                                alt={t(`craftsmen.list.${c.key}.name`)}
                                draggable="false"
                                className="h-full w-full rounded-full object-cover ring-4 ring-[#EAF3FB] transition-all duration-300 group-hover:scale-105 group-hover:ring-[#CFE2F2]"
                            />
                            <span className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-md bg-[#F6C90E] px-2.5 py-0.5 text-[11px] font-bold text-[#141415] shadow-sm">
                                <i className="fa-regular fa-star text-[10px]"></i>
                                <bdi dir="ltr">{c.rating}</bdi>
                            </span>
                        </div>

                        <h3 className="mt-6 text-[15px] font-bold text-[#414141]">
                            {t(`craftsmen.list.${c.key}.name`)}
                        </h3>
                        <p className="mt-1 text-[11px] text-[#575757]">
                            {t(`craftsmen.list.${c.key}.city`)}
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate(`/craftsmen/${c.key}`)}
                            className="mt-4 h-9 w-full rounded-lg bg-[#CFE2F2] text-[12px] font-semibold text-[#1F4E70] cursor-pointer btn-wipe btn-wipe-light"
                        >
                            {t("craftsmen.profile")}
                        </button>
                    </article>
                ))}
            </div>

            <div className="mt-2 flex flex-col items-center gap-3">
                <span className="text-[12px] text-[#575757]" dir="ltr">
                    <span className="text-[#4B9AD2]">{pad(active + 1)}</span> / {pad(total)}
                </span>

                <div className="flex items-center gap-4" dir="ltr">
                    <button
                        type="button"
                        onClick={() => scrollStep(-1)}
                        disabled={isRtl ? atEnd : atStart}
                        aria-label={isRtl ? t("craftsmen.next") : t("craftsmen.prev")}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4B9AD2] text-white disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer btn-wipe"
                    >
                        <i className="fa-solid fa-arrow-left text-sm"></i>
                    </button>

                    <div className="flex items-center gap-1">
                        {isRtl ? [...dashes].reverse() : dashes}
                    </div>

                    <button
                        type="button"
                        onClick={() => scrollStep(1)}
                        disabled={isRtl ? atStart : atEnd}
                        aria-label={isRtl ? t("craftsmen.prev") : t("craftsmen.next")}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4B9AD2] text-white disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer btn-wipe"
                    >
                        <i className="fa-solid fa-arrow-right text-sm"></i>
                    </button>
                </div>
            </div>
        </section>
    );
}

// ==================== قسم المميزات ====================

// الترتيب: أول عنصر بيظهر عند بداية السطر (يمين بالعربي)
const FEATURES = [
    { key: "search", icon: "fa-solid fa-magnifying-glass", iconColor: "text-white" },
    { key: "choice", icon: "fa-solid fa-screwdriver-wrench", iconColor: "text-[#F6C90E]" },
    { key: "payment", icon: "fa-solid fa-award", iconColor: "text-white" },
];

function FeaturesSection() {
    const { t } = useTranslation("home");

    return (
        <section
            id="about"
            className="bg-linear-to-br from-[#E9F2FC] via-[#F5F9FE] to-white px-5 py-16 sm:px-10 sm:py-20"
        >
            <div className="mx-auto max-w-[980px] text-center">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#DCEAF8] px-3 py-1 text-[11px] font-medium text-[#38749E]">
                    {t("features.tag")}
                    <i className="fa-solid fa-chevron-left text-[8px] ltr:rotate-180"></i>
                </span>

                <h2 className="mt-4 text-[26px] font-bold text-[#22455E] sm:text-[32px]">
                    {t("features.title")}{" "}
                    <span>{t("features.titleHighlight")}</span>
                </h2>
                <p className="mt-3 text-[12px] text-[#575757] sm:text-[13px]">
                    {t("features.subtitle")}
                </p>

                <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-7">
                    {FEATURES.map((f) => (
                        <article
                            key={f.key}
                            className="group rounded-3xl bg-white px-6 pb-11 pt-8 text-center shadow-[0_10px_35px_rgba(43,91,120,0.12)] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_16px_32px_rgba(75,154,210,0.28)]"
                        >
                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-[#4B9AD2] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                                <i className={`${f.icon} ${f.iconColor} text-[18px]`}></i>
                            </div>
                            <h3 className="mt-5 text-[16px] font-bold text-[#414141]">
                                {t(`features.${f.key}.title`)}
                            </h3>
                            <p className="mt-4 text-[13px] leading-[2] text-[#575757]">
                                {t(`features.${f.key}.desc`)}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ==================== قسم الدليل ====================

// لما يتوفر الفيديو الحقيقي: حط الملف في public/videos/ وحط مساره هون، مثال "/videos/guide.mp4"
// وإذا بدك صورة تظهر قبل التشغيل حط مسارها في GUIDE_VIDEO_POSTER
const GUIDE_VIDEO_SRC = "";
const GUIDE_VIDEO_POSTER = "";

const STEPS = ["trusted", "clear", "easy", "safe"];

function GuideSection() {
    const { t } = useTranslation("home");
    const videoRef = useRef(null);
    const [playing, setPlaying] = useState(false);

    const handlePlay = () => {
        if (!GUIDE_VIDEO_SRC) return;
        setPlaying(true);
        requestAnimationFrame(() => videoRef.current?.play());
    };

    return (
        <section id="guide" className="bg-white px-5 py-16 sm:px-10 sm:py-24">
            <div className="mx-auto grid max-w-[1100px] items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
                <div>
                    <h2 className="text-[24px] font-bold text-[#414141] sm:text-[28px]">
                        {t("guide.title")}{" "}
                        <span className="text-[#4B9AD2]">{t("guide.titleHighlight")}</span>
                    </h2>
                    <p className="mt-2 text-[12px] text-[#575757] sm:text-[13px]">
                        {t("guide.subtitle")}
                    </p>

                    <ul className="mt-7 space-y-6">
                        {STEPS.map((key) => (
                            <li key={key} className="flex items-start gap-3">
                                <i className="fa-solid fa-award mt-0.5 text-[18px] text-[#4B9AD2]"></i>
                                <div>
                                    <h3 className="text-[16px] font-bold text-[#414141]">
                                        {t(`guide.${key}.title`)}
                                    </h3>
                                    <p className="mt-1.5 text-[13px] text-[#2B2B2B]">
                                        {t(`guide.${key}.desc`)}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative mx-auto aspect-[8/7] w-full max-w-[520px] overflow-hidden rounded-3xl bg-white shadow-[0_10px_40px_rgba(43,91,120,0.16)]">
                    {GUIDE_VIDEO_SRC && (
                        <video
                            ref={videoRef}
                            src={GUIDE_VIDEO_SRC}
                            poster={GUIDE_VIDEO_POSTER || undefined}
                            controls={playing}
                            playsInline
                            preload="metadata"
                            className="h-full w-full object-cover"
                        />
                    )}

                    {!playing && (
                        <button
                            type="button"
                            onClick={handlePlay}
                            aria-label={t("guide.playVideo")}
                            className="absolute inset-0 flex items-center justify-center cursor-pointer"
                        >
                            <svg
                                viewBox="0 0 48 56"
                                className="h-[72px] w-[62px] transition-transform hover:scale-110"
                                fill="none"
                                stroke="#4B9AD2"
                                strokeWidth="2.5"
                                strokeLinejoin="round"
                            >
                                <path d="M6 5 L42 28 L6 51 Z" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}

// ==================== قسم الدعوة للتسجيل ====================

function CtaSection() {
    const navigate = useNavigate();
    const { t } = useTranslation("home");

    return (
        <section id="contact" className="bg-white px-5 py-14 sm:px-10 sm:py-20">
            <div className="mx-auto flex max-w-[1230px] flex-col items-start gap-6 rounded-3xl bg-white px-6 py-8 shadow-[0_10px_40px_rgba(43,91,120,0.16)] sm:px-10 sm:py-10 md:flex-row md:items-center md:justify-between md:gap-8">
                <div className="flex items-center gap-4 sm:gap-5">
                    <span className="relative hidden h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-linear-to-br from-[#EAF3FC] to-white sm:block">
                        <img
                            src="/images/logo w 1.svg"
                            alt=""
                            aria-hidden="true"
                            className="absolute right-[11px] top-1/2 h-[34px] w-auto max-w-none -translate-y-1/2"
                            style={{ clipPath: "inset(0 0 0 64%)" }}
                        />
                    </span>
                    <div className="max-w-[640px]">
                        <h2 className="text-[20px] font-bold text-[#414141] sm:text-[24px]">
                            {t("cta.title")}
                        </h2>
                        <p className="mt-2 text-[12px] leading-[1.9] text-[#575757] sm:text-[13px]">
                            {t("cta.desc")}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/get-started")}
                    className="h-11 shrink-0 rounded-lg bg-[#4B9AD2] px-7 text-[14px] font-semibold text-white cursor-pointer btn-wipe"
                >
                    {t("cta.button")}
                </button>
            </div>
        </section>
    );
}

// ==================== الصفحة ====================

export default function Home() {
    const location = useLocation();
    const navigate = useNavigate();

    // لما المستخدم يجي من صفحة ثانية (مثل "عن صنعة") ويضغط رابط قسم بالهيدر
    useEffect(() => {
        const target = location.state?.scrollTo;
        if (!target) return;
        const timer = setTimeout(() => {
            if (target === "home") window.scrollTo({ top: 0 });
            else document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
            navigate(location.pathname, { replace: true, state: null });
        }, 80);
        return () => clearTimeout(timer);
    }, [location, navigate]);

    return (
        <SiteLayout>
            <HeroSection />
            <ServicesSection />
            <CraftsmenSection />
            <FeaturesSection />
            <GuideSection />
            <CtaSection />
        </SiteLayout>
    );
}
