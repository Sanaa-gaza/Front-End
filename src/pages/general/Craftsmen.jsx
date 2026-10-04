import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, LayoutGrid, Search } from "lucide-react";
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
const CITY_KEYS = ["nuseirat", "khanyounis", "gaza", "rafah", "jabalia", "deirbalah"];

// مفاتيح الخدمات بالصفحة الرئيسية -> تصنيف الحرفيين
const SERVICE_TO_CATEGORY = {
    painting: "painting",
    cleaning: "cleaning",
    carpentry: "carpentry",
    electricity: "electricity",
    plumbing: "plumbing",
    acMaintenance: "ac",
};

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

// ==================== بطاقة الحرفي ====================

function CraftsmanCard({ craftsman }) {
    const { t } = useTranslation(["home", "craftsmen"]);
    const c = craftsman;
    const name = t(`home:craftsmen.list.${c.key}.name`);

    return (
        <article className="group relative overflow-hidden rounded-[24px] border border-[#0000000F] bg-white p-5 shadow-[0_6px_20px_rgba(43,91,120,0.08)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgba(75,154,210,0.22)]">
            {/* خط أزرق متدرج أعلى البطاقة */}
            <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#4B9AD2]/40 via-[#4B9AD2]/80 to-[#4B9AD2]/40"
            />

            <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                    <img
                        src={c.avatar}
                        alt={name}
                        draggable="false"
                        className="h-20 w-20 rounded-full object-cover ring-4 ring-[#E4EFFA] transition-transform duration-300 group-hover:scale-105"
                    />
                    {c.verified && (
                        <span
                            title={t("craftsmen:card.verified")}
                            className="absolute -bottom-1 end-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#4B9AD2] text-white"
                        >
                            <i className="fa-solid fa-check text-[11px]"></i>
                        </span>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[17px] font-bold text-[#414141]">{name}</h3>
                    <p className="mt-0.5 text-[13px] text-[#4B9AD2]">{t(`home:craftsmen.list.${c.key}.craft`)}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[#89949D]">
                        <i className="fa-solid fa-star text-[12px] text-[#F6C90E]"></i>
                        <bdi dir="ltr" className="font-bold text-[#414141]">
                            {c.rating}
                        </bdi>
                        <span>{t("craftsmen:card.reviews", { count: c.reviews })}</span>
                    </p>
                </div>

                {/* حالة التوفر لسا مش من الباك إند، فكل الحرفيين متاحين مؤقتاً */}
                {c.available !== false && (
                    <span className="shrink-0 self-start whitespace-nowrap rounded-full border border-[#BFEBCD] bg-[#E8F8EE] px-3 py-0.5 text-[10px] font-medium text-[#2EAF4E]">
                        {t("craftsmen:card.available")}
                    </span>
                )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-[#414141]">
                <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-wrench text-[12px] text-[#4B9AD2]"></i>
                    <bdi dir="ltr">{c.years}</bdi> {t("craftsmen:card.years")}
                </span>
                <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-location-dot text-[12px] text-[#4B9AD2]"></i>
                    {t(`craftsmen:cities.${c.city}`)}
                </span>
            </div>

            <Link
                to={`/craftsmen/${c.key}`}
                className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-[#4B9AD2] text-[16px] font-medium text-white btn-wipe"
            >
                {t("craftsmen:card.professionalProfile")}
            </Link>
        </article>
    );
}

// ==================== الصفحة ====================

// خيارات فلتر "التقييم": اختيار 3 بيعرض الحرفيين اللي تقييمهم 3 فأعلى
const RATING_OPTIONS = ["1", "2", "3", "4", "5"];

const fieldClass =
    "h-11 w-full rounded-lg border border-[#8EC0E4] bg-white text-[12px] text-[#414141] outline-none transition-colors focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";

/** قائمة منسدلة بأيقونة شبكة بالبداية وسهم بالنهاية زي التصميم */
function FilterSelect({ value, onChange, label, children }) {
    return (
        <div className="relative md:w-[180px]">
            <LayoutGrid size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
            <select
                value={value}
                onChange={onChange}
                aria-label={label}
                className={`${fieldClass} cursor-pointer appearance-none ps-9 pe-9 ${value === "all" ? "text-[#89949D]" : ""}`}
            >
                {children}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
        </div>
    );
}

export default function Craftsmen() {
    const { t } = useTranslation(["craftsmen", "home"]);
    const [params] = useSearchParams();

    const initialQuery = params.get("q") || "";
    const paramCategory = params.get("category");
    const [query, setQuery] = useState(initialQuery);
    const [submitted, setSubmitted] = useState(initialQuery);
    const [category, setCategory] = useState(
        CATEGORY_KEYS.includes(paramCategory) ? paramCategory : SERVICE_TO_CATEGORY[params.get("service")] || "all",
    );
    const [city, setCity] = useState("all");
    const [rating, setRating] = useState("all");
    const [verifiedOnly, setVerifiedOnly] = useState(false);

    const results = useMemo(() => {
        const q = submitted.trim().toLowerCase();
        const list = CRAFTSMEN.filter((c) => {
            if (category !== "all" && c.category !== category) return false;
            if (city !== "all" && c.city !== city) return false;
            if (rating !== "all" && parseFloat(c.rating) < Number(rating)) return false;
            if (verifiedOnly && !c.verified) return false;
            if (!q) return true;
            const haystack = [
                t(`home:craftsmen.list.${c.key}.name`),
                t(`home:craftsmen.list.${c.key}.craft`),
                t(`craftsmen:categories.${c.category}`),
                t(`craftsmen:cities.${c.city}`),
            ]
                .join(" ")
                .toLowerCase();
            return haystack.includes(q);
        });
        // الأعلى تقييماً أولاً
        return [...list].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    }, [submitted, category, city, rating, verifiedOnly, t]);

    return (
        <SiteLayout>
            <section className="mx-auto max-w-[1230px] px-5 pb-24 pt-28 sm:px-10 sm:pt-32">
                <nav aria-label="breadcrumb" className="flex items-center gap-2 text-[11px]">
                    <Link to="/" className="font-medium text-[#141415] hover:text-[#4B9AD2]">
                        {t("breadcrumb.home")}
                    </Link>
                    <i className="fa-solid fa-chevron-left text-[8px] text-[#89949D] ltr:rotate-180"></i>
                    <span className="text-[#4B9AD2]">{t("breadcrumb.craftsmen")}</span>
                </nav>

                <div className="mx-auto mt-10 max-w-[560px] text-center">
                    <h1 className="text-[28px] font-bold leading-[1.5] text-[#3A78A3] sm:text-[38px]">
                        {t("title")}
                    </h1>
                    <p className="mx-auto mt-4 max-w-[380px] text-[13px] leading-[2] text-[#575757] sm:text-[14px]">
                        {t("subtitle")}
                    </p>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        setSubmitted(query);
                    }}
                    className="mx-auto mt-10 flex max-w-[820px] flex-col gap-3 rounded-2xl border border-[#0000000D] bg-white p-4 shadow-[0_6px_24px_rgba(35,74,100,0.08)] md:flex-row md:items-center md:px-5"
                >
                    <div className="relative min-w-0 flex-1">
                        <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t("search.placeholder")}
                            aria-label={t("search.placeholder")}
                            className={`${fieldClass} ps-9 pe-4 placeholder:text-[#89949D]`}
                        />
                    </div>

                    <FilterSelect value={city} onChange={(e) => setCity(e.target.value)} label={t("filters.location")}>
                        <option value="all">{t("filters.location")}</option>
                        {CITY_KEYS.map((k) => (
                            <option key={k} value={k} className="font-bold">
                                {t(`cities.${k}`)}
                            </option>
                        ))}
                    </FilterSelect>

                    <FilterSelect value={rating} onChange={(e) => setRating(e.target.value)} label={t("filters.rating")}>
                        <option value="all">{t("filters.rating")}</option>
                        {RATING_OPTIONS.map((r) => (
                            <option key={r} value={r} className="font-bold">
                                {t("filters.ratingAtLeast", { rating: r })}
                            </option>
                        ))}
                    </FilterSelect>

                    <button
                        type="submit"
                        className="h-11 shrink-0 cursor-pointer rounded-lg bg-[#4B9AD2] px-10 text-[14px] font-semibold text-white btn-wipe"
                    >
                        {t("search.button")}
                    </button>
                </form>

                <div className="mx-auto mt-8 flex max-w-[1000px] flex-wrap items-center justify-center gap-3">
                    {["all", ...CATEGORY_KEYS].map((key) => {
                        const active = category === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setCategory(key)}
                                aria-pressed={active}
                                className={`h-12 cursor-pointer rounded-xl border px-5 text-[15px] font-semibold transition-all duration-300 ${
                                    active
                                        ? "border-[#4B9AD2] bg-[#4B9AD2] text-white shadow-[0_4px_12px_rgba(75,154,210,0.35)]"
                                        : "border-[#BFD9EC] bg-white text-[#38749E] hover:-translate-y-0.5 hover:border-[#4B9AD2] hover:text-[#4B9AD2]"
                                }`}
                            >
                                {t(`categories.${key}`)}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={() => setVerifiedOnly((v) => !v)}
                        aria-pressed={verifiedOnly}
                        className={`h-10 cursor-pointer rounded-lg border px-5 text-[12px] font-medium transition-colors duration-300 ${
                            verifiedOnly
                                ? "border-[#4B9AD2] bg-[#4B9AD2] text-white"
                                : "border-[#BFD9EC] bg-white text-[#38749E] hover:border-[#4B9AD2]"
                        }`}
                    >
                        {t("filters.verified")}
                    </button>

                    <p className="text-[15px] font-bold text-[#4B9AD2]">
                        {t("filters.count")}{" "}
                        <bdi dir="ltr" className="text-[#38749E]">
                            {results.length}
                        </bdi>
                    </p>
                </div>

                {results.length ? (
                    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {results.map((c) => (
                            <CraftsmanCard key={c.key} craftsman={c} />
                        ))}
                    </div>
                ) : (
                    <div className="mt-16 text-center">
                        <p className="text-[18px] font-bold text-[#38749E]">{t("empty.title")}</p>
                        <p className="mt-2 text-[13px] text-[#575757]">{t("empty.desc")}</p>
                    </div>
                )}
            </section>
        </SiteLayout>
    );
}
