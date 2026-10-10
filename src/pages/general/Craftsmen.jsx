import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, LayoutGrid, Search } from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { getCraftsmen } from "../../api/endpoints";
import { fileUrl } from "../../api/client";
import { parseApiError } from "../../api/errors";
import { useAreas, useGovernorates, useServices } from "../../hooks/useReferenceData";

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

// الرسالة بالفقاعة بتتبدل كل 5 ثواني
const ASSISTANT_INTERVAL = 5000;

function AssistantButton() {
    const { t } = useTranslation("home");
    const messages = t("assistant.messages", { returnObjects: true });
    const list = Array.isArray(messages) && messages.length ? messages : [t("assistant.label")];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setIndex((i) => i + 1), ASSISTANT_INTERVAL);
        return () => clearInterval(id);
    }, []);

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
                    className="assistant-wiggle absolute inset-0 m-auto h-[62px] w-auto object-contain sm:h-[74px]"
                />

                {/* key بيتغير مع كل رسالة عشان حركة الظهور تنعاد */}
                <span
                    key={index}
                    aria-hidden="true"
                    className="assistant-bubble absolute right-[58px] top-1 z-10 whitespace-nowrap rounded-2xl bg-[#4B9AD2] px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-[0_6px_18px_rgba(75,154,210,0.3)] sm:right-[68px] sm:top-2 sm:text-[12px]"
                >
                    {list[index % list.length]}
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

// ==================== صورة الحرفي ====================

/**
 * صورة الحرفي من السيرفر، ولو ما انفتحت (أو ما في صورة) بنعرض أول حرف من اسمه.
 */
function CraftsmanPhoto({ path, name, className = "" }) {
    const [failed, setFailed] = useState(false);
    const src = fileUrl(path);

    if (!src || failed) {
        return (
            <div className={`${className} flex items-center justify-center bg-[#EAF3FB] text-[24px] font-bold text-[#4B9AD2]`}>
                {name.charAt(0)}
            </div>
        );
    }
    return (
        <img
            src={src}
            alt={name}
            draggable="false"
            onError={() => setFailed(true)}
            className={`${className} object-cover`}
        />
    );
}

/** اسم المنطقة والمحافظة من القوائم المرجعية (محفوظة بالكاش، فما بتنطلب أكثر من مرة) */
function useLocationName(governorateId, areaId) {
    const governorates = useGovernorates();
    const areas = useAreas(governorateId ? String(governorateId) : "");
    const area = areas.items.find((a) => a.id === areaId)?.name;
    const governorate = governorates.items.find((g) => g.id === governorateId)?.name;
    return [area, governorate].filter(Boolean).join("، ");
}

// ==================== بطاقة الحرفي ====================

function CraftsmanCard({ craftsman: c }) {
    const { t } = useTranslation("craftsmen");
    const location = useLocationName(c.governorate_id, c.area_id);
    const rating = Number(c.avg_rating || 0);

    return (
        <article className="group relative overflow-hidden rounded-[24px] border border-[#0000000F] bg-white p-5 shadow-[0_6px_20px_rgba(43,91,120,0.08)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgba(75,154,210,0.22)]">
            {/* خط أزرق متدرج أعلى البطاقة */}
            <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#4B9AD2]/40 via-[#4B9AD2]/80 to-[#4B9AD2]/40"
            />

            <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                    <CraftsmanPhoto
                        path={c.personal_photo_path}
                        name={c.full_name}
                        className="h-20 w-20 rounded-full ring-4 ring-[#E4EFFA] transition-transform duration-300 group-hover:scale-105"
                    />
                    {c.is_trusted && (
                        <span
                            title={t("card.verified")}
                            className="absolute -bottom-1 end-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#4B9AD2] text-white"
                        >
                            <i className="fa-solid fa-check text-[11px]"></i>
                        </span>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[17px] font-bold text-[#414141]">{c.full_name}</h3>
                    <p className="mt-0.5 text-[13px] text-[#4B9AD2]">{c.craft?.name}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[#89949D]">
                        <i className="fa-solid fa-star text-[12px] text-[#F6C90E]"></i>
                        <bdi dir="ltr" className="font-bold text-[#414141]">
                            {rating.toFixed(1)}
                        </bdi>
                        <span>{t("card.reviews", { count: c.reviews_count || 0 })}</span>
                    </p>
                </div>

                {c.is_available && (
                    <span className="shrink-0 self-start whitespace-nowrap rounded-full border border-[#BFEBCD] bg-[#E8F8EE] px-3 py-0.5 text-[10px] font-medium text-[#2EAF4E]">
                        {t("card.available")}
                    </span>
                )}
            </div>

            {location && (
                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-[#414141]">
                    <span className="flex items-center gap-1.5">
                        <i className="fa-solid fa-location-dot text-[12px] text-[#4B9AD2]"></i>
                        {location}
                    </span>
                </div>
            )}

            {/* صفحة الملف المهني لسا مؤجلة من الباك إند (سبرنت لاحق) — حالياً بتعرض "قيد الإنشاء" */}
            <Link
                to={`/craftsmen/${c.id}`}
                className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-[#4B9AD2] text-[16px] font-medium text-white btn-wipe"
            >
                {t("card.professionalProfile")}
            </Link>
        </article>
    );
}

// ==================== التنقل بين الصفحات ====================

function Pagination({ page, pages, onChange }) {
    const { t, i18n } = useTranslation("craftsmen");
    if (pages <= 1) return null;
    const isRtl = i18n.language === "ar";
    const pad = (n) => String(n).padStart(2, "0");
    const arrow =
        "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#4B9AD2] text-white btn-wipe disabled:cursor-not-allowed disabled:opacity-40";

    return (
        <nav aria-label="pagination" className="mt-10 flex flex-col items-center gap-2">
            <p className="text-[12px] text-[#575757] tabular-nums" dir="ltr">
                <span className="font-semibold text-[#4B9AD2]">{pad(page)}</span> / {pad(pages)}
            </p>
            <div className="flex items-center gap-4">
                <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1} aria-label={t("pagination.prev")} className={arrow}>
                    <i className={`fa-solid ${isRtl ? "fa-arrow-right" : "fa-arrow-left"} text-sm`}></i>
                </button>
                <div className="flex items-center gap-1.5">
                    {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => onChange(n)}
                            aria-label={String(n)}
                            aria-current={n === page ? "page" : undefined}
                            className={`h-[3px] cursor-pointer rounded-full transition-all ${n === page ? "w-8 bg-[#4B9AD2]" : "w-4 bg-[#BFD9EC] hover:bg-[#8EC0E4]"}`}
                        />
                    ))}
                </div>
                <button type="button" onClick={() => onChange(page + 1)} disabled={page === pages} aria-label={t("pagination.next")} className={arrow}>
                    <i className={`fa-solid ${isRtl ? "fa-arrow-left" : "fa-arrow-right"} text-sm`}></i>
                </button>
            </div>
        </nav>
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
    const { t } = useTranslation(["craftsmen", "signupCommon"]);
    const [params] = useSearchParams();
    const services = useServices();
    const governorates = useGovernorates();

    // ?q= و ?service_id= بيجوا من بحث الصفحة الرئيسية وقسم الخدمات
    const initialQuery = params.get("q") || "";
    const [query, setQuery] = useState(initialQuery);
    const [submitted, setSubmitted] = useState(initialQuery);
    const [serviceId, setServiceId] = useState(params.get("service_id") || "all");
    const [governorateId, setGovernorateId] = useState("all");
    const [rating, setRating] = useState("all");
    const [trustedOnly, setTrustedOnly] = useState(false);
    const [page, setPage] = useState(1);
    const [retry, setRetry] = useState(0);

    // كل الفلترة بتصير بالسيرفر (GET /craftsmen)
    const request = {
        search: submitted.trim(),
        service_id: serviceId === "all" ? "" : serviceId,
        governorate_id: governorateId === "all" ? "" : governorateId,
        min_rating: rating === "all" ? "" : rating,
        trusted: trustedOnly ? 1 : "",
        page,
    };
    const key = JSON.stringify({ ...request, retry });
    const [result, setResult] = useState({ key: null, craftsmen: [], meta: null, error: "" });

    useEffect(() => {
        let active = true;
        getCraftsmen(JSON.parse(key))
            .then((data) => active && setResult({ key, craftsmen: data?.craftsmen || [], meta: data?.meta || null, error: "" }))
            .catch((err) =>
                active &&
                setResult({ key, craftsmen: [], meta: null, error: parseApiError(err).message || t("signupCommon:networkError") })
            );
        return () => {
            active = false;
        };
    }, [key, t]);

    const loading = result.key !== key;
    const craftsmen = result.craftsmen;
    const total = result.meta?.total ?? craftsmen.length;

    // أي تغيير بالفلاتر بيرجّعنا للصفحة الأولى
    const filter = (setter) => (value) => {
        setter(value);
        setPage(1);
    };

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
                        setPage(1);
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

                    <FilterSelect
                        value={governorateId}
                        onChange={(e) => filter(setGovernorateId)(e.target.value)}
                        label={t("filters.location")}
                    >
                        <option value="all">{t("filters.location")}</option>
                        {governorates.options.map((o) => (
                            <option key={o.value} value={o.value} className="font-bold">
                                {o.label}
                            </option>
                        ))}
                    </FilterSelect>

                    <FilterSelect value={rating} onChange={(e) => filter(setRating)(e.target.value)} label={t("filters.rating")}>
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

                {/* أزرار الحرف من GET /services */}
                <div className="mx-auto mt-8 flex max-w-[1000px] flex-wrap items-center justify-center gap-3">
                    {[{ value: "all", label: t("categories.all") }, ...services.options].map((o) => {
                        const active = serviceId === o.value;
                        return (
                            <button
                                key={o.value}
                                type="button"
                                onClick={() => filter(setServiceId)(o.value)}
                                aria-pressed={active}
                                className={`h-12 cursor-pointer rounded-xl border px-5 text-[15px] font-semibold transition-all duration-300 ${
                                    active
                                        ? "border-[#4B9AD2] bg-[#4B9AD2] text-white shadow-[0_4px_12px_rgba(75,154,210,0.35)]"
                                        : "border-[#BFD9EC] bg-white text-[#38749E] hover:-translate-y-0.5 hover:border-[#4B9AD2] hover:text-[#4B9AD2]"
                                }`}
                            >
                                {o.label}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={() => filter(setTrustedOnly)(!trustedOnly)}
                        aria-pressed={trustedOnly}
                        className={`h-10 cursor-pointer rounded-lg border px-5 text-[12px] font-medium transition-colors duration-300 ${
                            trustedOnly
                                ? "border-[#4B9AD2] bg-[#4B9AD2] text-white"
                                : "border-[#BFD9EC] bg-white text-[#38749E] hover:border-[#4B9AD2]"
                        }`}
                    >
                        {t("filters.verified")}
                    </button>

                    <p className="text-[15px] font-bold text-[#4B9AD2]">
                        {t("filters.count")}{" "}
                        <bdi dir="ltr" className="text-[#38749E]">
                            {loading ? "…" : total}
                        </bdi>
                    </p>
                </div>

                {loading ? (
                    <p role="status" className="mt-16 text-center text-[14px] text-[#89949D]">
                        {t("loading")}
                    </p>
                ) : result.error ? (
                    <div className="mt-16 text-center">
                        <p className="text-[14px] text-red-500">{result.error}</p>
                        <button
                            type="button"
                            onClick={() => setRetry((r) => r + 1)}
                            className="mt-4 h-10 cursor-pointer rounded-lg bg-[#4B9AD2] px-6 text-[13px] font-medium text-white btn-wipe"
                        >
                            {t("retry")}
                        </button>
                    </div>
                ) : craftsmen.length ? (
                    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {craftsmen.map((c) => (
                            <CraftsmanCard key={c.id} craftsman={c} />
                        ))}
                    </div>
                ) : (
                    <div className="mt-16 text-center">
                        <p className="text-[18px] font-bold text-[#38749E]">{t("empty.title")}</p>
                        <p className="mt-2 text-[13px] text-[#575757]">{t("empty.desc")}</p>
                    </div>
                )}

                {!loading && !result.error && (
                    <Pagination page={result.meta?.current_page || page} pages={result.meta?.last_page || 1} onChange={setPage} />
                )}
            </section>
        </SiteLayout>
    );
}
