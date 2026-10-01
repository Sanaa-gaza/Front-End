import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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

function CraftsmanCard({ craftsman, onView }) {
    const { t } = useTranslation(["home", "craftsmen"]);
    const c = craftsman;

    return (
        <article className="group rounded-2xl bg-white p-4 shadow-[0_6px_20px_rgba(43,91,120,0.14)] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_16px_32px_rgba(75,154,210,0.28)]">
            <div className="flex items-start justify-between gap-3">
                <img
                    src={c.avatar}
                    alt={t(`home:craftsmen.list.${c.key}.name`)}
                    draggable="false"
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-[#1F4E70] transition-transform duration-300 group-hover:scale-105"
                />
                <div className="flex flex-col items-start gap-2">
                    {c.featured && (
                        <span className="rounded-full bg-[#FFF3C7] px-5 py-1 text-[11px] font-medium text-[#B58A00]">
                            {t("craftsmen:card.featured")}
                        </span>
                    )}
                    {c.verified && (
                        <span className="rounded-full bg-[#CFE2F2] px-5 py-1 text-[11px] font-medium text-[#38749E]">
                            {t("craftsmen:card.verified")}
                        </span>
                    )}
                </div>
            </div>

            <h3 className="mt-3 text-[15px] font-bold text-[#414141]">
                {t(`home:craftsmen.list.${c.key}.name`)}
            </h3>
            <p className="mt-0.5 text-[12px] text-[#575757]">
                {t(`home:craftsmen.list.${c.key}.craft`)} {t("craftsmen:card.certified")}
            </p>

            <div className="mt-2 flex items-center justify-between text-[11px] text-[#89949D]">
                <div className="flex items-center gap-1.5">
                    <span className="flex text-[12px] text-[#F6C90E]">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <i key={i} className="fa-solid fa-star"></i>
                        ))}
                    </span>
                    <bdi dir="ltr" className="font-semibold text-[#141415]">
                        {c.rating}
                    </bdi>
                    <bdi dir="ltr">({c.reviews})</bdi>
                </div>
                <span>
                    <bdi dir="ltr">({c.orders})</bdi> {t("craftsmen:card.orders")}
                </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[#38749E]">
                    <i className="fa-solid fa-location-dot text-[#4B9AD2]"></i>
                    {t(`craftsmen:cities.${c.city}`)}
                </span>
                <span className="text-[10.5px] text-[#89949D]">
                    <bdi dir="ltr">{c.years}</bdi> {t("craftsmen:card.years")}
                </span>
            </div>

            <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                    <p className="text-[10.5px] text-[#575757]">{t("craftsmen:card.startsFrom")}</p>
                    <bdi dir="ltr" className="text-[15px] font-bold text-[#38749E]">
                        {c.price[0]}$
                    </bdi>
                </div>
                <button
                    type="button"
                    onClick={() => onView(c)}
                    className="h-10 cursor-pointer rounded-xl border border-[#CFE2F2] bg-[#F1F7FC] px-6 text-[13px] font-medium text-[#38749E] shadow-[0_2px_6px_rgba(0,0,0,0.1)] btn-wipe btn-wipe-light"
                >
                    {t("craftsmen:card.view")}
                </button>
            </div>
        </article>
    );
}

// ==================== نافذة تفاصيل الحرفي ====================

function CraftsmanModal({ craftsman, onClose }) {
    const navigate = useNavigate();
    const { t } = useTranslation(["home", "craftsmen"]);
    const c = craftsman;

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [onClose]);

    const name = t(`home:craftsmen.list.${c.key}.name`);
    const craft = t(`home:craftsmen.list.${c.key}.craft`);
    const city = t(`craftsmen:cities.${c.city}`);
    const works = t("craftsmen:modal.works", { returnObjects: true });

    const stats = [
        { value: c.rating, label: t("craftsmen:modal.rating") },
        { value: c.reviews, label: t("craftsmen:modal.reviews") },
        { value: c.orders, label: t("craftsmen:modal.completed") },
        { value: c.years, label: t("craftsmen:modal.experience") },
    ];

    return (
        <div
            className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center bg-[#2B5B78]/35 p-4 backdrop-blur-sm"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={name}
                className="modal-panel relative max-h-[92vh] w-full max-w-[520px] overflow-y-auto rounded-3xl bg-white p-6 shadow-[0_20px_60px_rgba(15,50,80,0.3)] sm:p-8"
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={t("craftsmen:modal.close")}
                    className="absolute end-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#F1F7FC] text-[#38749E] transition-colors hover:bg-[#CFE2F2]"
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>

                <div className="flex items-center gap-4">
                    <img
                        src={c.avatar}
                        alt={name}
                        className="h-[72px] w-[72px] rounded-full object-cover ring-2 ring-[#1F4E70]"
                    />
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[19px] font-bold text-[#414141]">{name}</h3>
                            {c.verified && (
                                <span className="rounded-full bg-[#CFE2F2] px-3 py-0.5 text-[10px] font-medium text-[#38749E]">
                                    {t("craftsmen:card.verified")}
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-[12.5px] text-[#575757]">
                            {craft} {t("craftsmen:card.certified")}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-[#38749E]">
                            <i className="fa-solid fa-location-dot text-[#4B9AD2]"></i>
                            {city}
                        </p>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-3">
                    {stats.map((s) => (
                        <div
                            key={s.label}
                            className="rounded-xl border border-[#CFE2F2] bg-[#F8FBFE] px-1 py-3 text-center"
                        >
                            <bdi dir="ltr" className="block text-[16px] font-bold text-[#38749E]">
                                {s.value}
                            </bdi>
                            <span className="mt-1 block text-[10px] text-[#575757]">{s.label}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex items-center gap-2 text-[12px] text-[#89949D]">
                    <span className="flex text-[13px] text-[#F6C90E]">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <i key={i} className="fa-solid fa-star"></i>
                        ))}
                    </span>
                    <bdi dir="ltr" className="font-semibold text-[#141415]">
                        {c.rating}
                    </bdi>
                    <bdi dir="ltr">({c.reviews})</bdi>
                </div>

                <h4 className="mt-5 text-[14px] font-bold text-[#414141]">{t("craftsmen:modal.about")}</h4>
                <p className="mt-2 text-[12.5px] leading-[2] text-[#575757]">
                    {t("craftsmen:modal.bio", { craft, city })}
                </p>

                <h4 className="mt-5 text-[14px] font-bold text-[#414141]">{t("craftsmen:modal.gallery")}</h4>
                <div className="mt-3 grid grid-cols-4 gap-2">
                    {(Array.isArray(works) ? works : []).map((w) => (
                        <figure key={w} className="text-center">
                            <div className="flex aspect-square items-center justify-center rounded-xl border border-[#E3EBF2] bg-[#F5F9FC] text-[#B7CCDD]">
                                <i className="fa-regular fa-image text-[20px]"></i>
                            </div>
                            <figcaption className="mt-1.5 text-[9.5px] leading-[1.5] text-[#575757]">{w}</figcaption>
                        </figure>
                    ))}
                </div>

                <div className="mt-5 rounded-xl border border-[#CFE2F2] bg-[#EEF5FB] px-4 py-3">
                    <p className="text-[11px] text-[#575757]">{t("craftsmen:modal.priceRange")}</p>
                    <bdi dir="ltr" className="mt-0.5 block text-[18px] font-bold text-[#1F4E70]">
                        {c.price[0]}-{c.price[1]}$
                    </bdi>
                </div>

                <div className="mt-5 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/contact")}
                        className="h-11 flex-1 cursor-pointer rounded-xl bg-[#4B9AD2] text-[14px] font-semibold text-white btn-wipe"
                    >
                        {t("craftsmen:modal.order")}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/contact")}
                        aria-label={t("craftsmen:modal.chat")}
                        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[#4B9AD2] text-[#4B9AD2] btn-wipe btn-wipe-outline"
                    >
                        <i className="fa-regular fa-comment-dots text-[17px]"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ==================== الصفحة ====================

const selectClass =
    "h-10 cursor-pointer appearance-none rounded-lg border border-[#4B9AD2] bg-white text-[12px] text-[#38749E] outline-none transition-colors focus:ring-1 focus:ring-[#4B9AD2]";

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
    const [sort, setSort] = useState("top");
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [selected, setSelected] = useState(null);

    const results = useMemo(() => {
        const q = submitted.trim().toLowerCase();
        const list = CRAFTSMEN.filter((c) => {
            if (category !== "all" && c.category !== category) return false;
            if (city !== "all" && c.city !== city) return false;
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
        return [...list].sort((a, b) =>
            sort === "top"
                ? parseFloat(b.rating) - parseFloat(a.rating)
                : t(`home:craftsmen.list.${a.key}.name`).localeCompare(t(`home:craftsmen.list.${b.key}.name`)),
        );
    }, [submitted, category, city, sort, verifiedOnly, t]);

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
                    className="mx-auto mt-10 flex max-w-[820px] items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_6px_18px_rgba(0,0,0,0.13)] sm:px-6 sm:py-4"
                >
                    <i className="fa-solid fa-magnifying-glass text-[14px] text-[#4B9AD2]"></i>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t("search.placeholder")}
                        aria-label={t("search.placeholder")}
                        className="h-11 min-w-0 flex-1 bg-transparent text-[13px] text-[#141415] outline-none placeholder:text-[#89949D]"
                    />
                    <button
                        type="submit"
                        className="h-11 shrink-0 cursor-pointer rounded-lg bg-[#4B9AD2] px-8 text-[14px] font-semibold text-white btn-wipe"
                    >
                        {t("search.button")}
                    </button>
                </form>

                <div className="mx-auto mt-8 flex max-w-[900px] flex-wrap items-center justify-center gap-3">
                    {["all", ...CATEGORY_KEYS].map((key) => {
                        const active = category === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setCategory(key)}
                                aria-pressed={active}
                                className={`h-10 cursor-pointer rounded-xl px-5 text-[13px] font-medium transition-all duration-300 ${
                                    active
                                        ? "bg-[#4B9AD2] text-white shadow-[0_4px_10px_rgba(75,154,210,0.4)]"
                                        : "bg-white text-[#38749E] shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 hover:text-[#4B9AD2] hover:shadow-[0_6px_14px_rgba(75,154,210,0.25)]"
                                }`}
                            >
                                {t(`categories.${key}`)}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-[#DCEAF8] bg-white/80 px-5 py-4 shadow-[0_4px_14px_rgba(43,91,120,0.08)] sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <i className="fa-solid fa-location-dot pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[11px] text-[#4B9AD2]"></i>
                            <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                aria-label={t("filters.location")}
                                className={`${selectClass} ps-4 pe-9`}
                            >
                                <option value="all">{t("filters.location")}</option>
                                {CITY_KEYS.map((k) => (
                                    <option key={k} value={k}>
                                        {t(`cities.${k}`)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <i className="fa-solid fa-chevron-down pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[9px] text-[#4B9AD2]"></i>
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                aria-label={t("filters.sortTop")}
                                className={`${selectClass} pe-4 ps-8`}
                            >
                                <option value="top">{t("filters.sortTop")}</option>
                                <option value="name">{t("filters.sortName")}</option>
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={() => setVerifiedOnly((v) => !v)}
                            aria-pressed={verifiedOnly}
                            className={`h-10 cursor-pointer rounded-lg border px-5 text-[12px] font-medium transition-colors duration-300 ${
                                verifiedOnly
                                    ? "border-[#4B9AD2] bg-[#4B9AD2] text-white"
                                    : "border-[#9DB7CB] bg-white text-[#38749E] hover:border-[#4B9AD2]"
                            }`}
                        >
                            {t("filters.verified")}
                        </button>
                    </div>

                    <p className="text-[15px] font-bold text-[#4B9AD2]">
                        {t("filters.count")}{" "}
                        <bdi dir="ltr" className="text-[#38749E]">
                            {results.length}
                        </bdi>
                    </p>
                </div>

                {results.length ? (
                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                        {results.map((c) => (
                            <CraftsmanCard key={c.key} craftsman={c} onView={setSelected} />
                        ))}
                    </div>
                ) : (
                    <div className="mt-16 text-center">
                        <p className="text-[18px] font-bold text-[#38749E]">{t("empty.title")}</p>
                        <p className="mt-2 text-[13px] text-[#575757]">{t("empty.desc")}</p>
                    </div>
                )}
            </section>
            {selected && <CraftsmanModal craftsman={selected} onClose={() => setSelected(null)} />}
        </SiteLayout>
    );
}
