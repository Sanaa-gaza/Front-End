import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Bookmark,
    Building2,
    CalendarDays,
    Check,
    ChevronDown,
    ChevronLeft,
    CircleDollarSign,
    MapPin,
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react";
import { useServices } from "../../../hooks/useReferenceData";
import ApplyModal from "./ApplyModal";

// ===== بيانات تجريبية =====
// ما في endpoint للبحث بالمناقصات المتاحة للحرفي لسا. لما يجهز، استبدلي RESULTS بطلب من src/api/endpoints.js
// serviceId: رقم الحرفة من GET /services — rating: تقييم المؤسسة — number: رقم المناقصة — closeDate: تاريخ إغلاق التقديم
// distance: بالكيلومتر، budget: [أقل، أعلى] بالشيكل
const RESULTS = [
    { id: "s1", serviceId: 1, rating: 4.8, number: "302-2026-1", closeDate: "2026-10-16", distance: 1.2, budget: [1000, 1400] },
    { id: "s2", serviceId: 1, rating: 4.5, number: "305-2026-1", closeDate: "2026-10-20", distance: 3.5, budget: [2500, 3200] },
    { id: "s3", serviceId: 2, rating: 4.2, number: "311-2026-2", closeDate: "2026-10-22", distance: 8, budget: [1800, 2400] },
    { id: "s4", serviceId: 5, rating: 3.9, number: "318-2026-1", closeDate: "2026-10-28", distance: 5.4, budget: [4000, 5500] },
    { id: "s5", serviceId: 4, rating: 4.6, number: "320-2026-3", closeDate: "2026-11-02", distance: 14, budget: [6000, 7200] },
];

const box = "rounded-[20px] border border-[#0000000F] bg-white";
// فلتر التقييم: "top" = ترتيب من الأعلى تقييماً، والأرقام = "من X فما فوق"
const RATINGS = ["top", 4.5, 4, 3.5, 3];
const field =
    "h-11 w-full rounded-xl border border-[#8EC0E4] bg-white text-[12px] text-[#414141] outline-none transition-colors placeholder:text-[#A9B3BB] focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";

/** صفحة البحث عن مناقصة: خانة بحث + فلاتر (الموقع ونوع الخدمة) + بطاقات المناقصات */
export default function CraftsmanSearch() {
    const { t, i18n } = useTranslation("craftsmanDashboard");
    const services = useServices();
    const locale = `${i18n.language}-u-nu-latn`;

    // simple: خانة بحث + زر فلاتر، advanced: صف الفلاتر (بيظهر بعد البحث أو زر الفلاتر)
    const [advanced, setAdvanced] = useState(false);
    const [query, setQuery] = useState("");
    const [location, setLocation] = useState("");
    const [minRating, setMinRating] = useState("");
    // الفلاتر المطبّقة بصف الفلاتر (بتتطبق بزر "بحث")
    const [appliedFilters, setAppliedFilters] = useState({ query: "", location: "", minRating: "" });
    // المناقصة المفتوحة بنافذة "قدم عرضك"، والمناقصات اللي انقدّم عليها أو انحفظت
    const [applyTo, setApplyTo] = useState(null);
    const [applied, setApplied] = useState({});
    const [saved, setSaved] = useState([]);
    const [flash, setFlash] = useState("");

    // اسم الحرفة من قائمة الخدمات الحقيقية
    const serviceName = (id) => services.items.find((x) => x.id === id)?.name || "";

    // ⚠️ ما في endpoint للتقديم لسا، فالعرض بينحفظ بالصفحة بس
    const handleApply = (offer) => {
        setApplied((a) => ({ ...a, [applyTo.id]: offer }));
        setFlash(t("jobs.modal.sent", { org: t(`searchPage.sample.${applyTo.id}.company`) }));
        setApplyTo(null);
    };

    // ⚠️ المواقع من البيانات التجريبية لحد ما يصير في endpoint للمناقصات
    const places = useMemo(() => [...new Set(RESULTS.map((r) => t(`searchPage.sample.${r.id}.place`)))], [t]);

    const ratingLabel = (v) => (String(v) === "top" ? t("searchPage.topRated") : t("searchPage.ratingFrom", { n: v }));

    // البحث البسيط بيشتغل مع الكتابة، وصف الفلاتر بيتطبق بزر "بحث"
    const results = useMemo(() => {
        const f = advanced ? appliedFilters : { query, location: "", minRating: "" };
        const q = f.query.trim().toLowerCase();
        const list = RESULTS.filter((r) => {
            const s = `searchPage.sample.${r.id}`;
            if (f.location && t(`${s}.place`) !== f.location) return false;
            if (f.minRating && f.minRating !== "top" && r.rating < Number(f.minRating)) return false;
            if (!q) return true;
            const craft = services.items.find((x) => x.id === r.serviceId)?.name || "";
            return [t(`${s}.title`), t(`${s}.company`), r.number, craft].join(" ").toLowerCase().includes(q);
        });
        return f.minRating === "top" ? [...list].sort((a, b) => b.rating - a.rating) : list;
    }, [advanced, appliedFilters, query, t, services.items]);

    // الفلاتر المطبّقة كشرائح تحت صف البحث (× بتشيل الفلتر)
    const chips = advanced
        ? [
            appliedFilters.query.trim() && { key: "query", label: appliedFilters.query.trim() },
            appliedFilters.location && { key: "location", label: appliedFilters.location },
            appliedFilters.minRating && { key: "minRating", label: ratingLabel(appliedFilters.minRating) },
        ].filter(Boolean)
        : [];
    const removeChip = (key) => {
        setAppliedFilters((f) => ({ ...f, [key]: "" }));
        ({ query: setQuery, location: setLocation, minRating: setMinRating })[key]("");
    };
    // بعد ما تتطبق فلاتر، البطاقات بتصير بالشكل المختصر (زي التصميم)
    const compact = chips.length > 0;

    const openAdvanced = () => {
        setAppliedFilters({ query, location, minRating });
        setAdvanced(true);
    };

    return (
        <div className="mx-auto flex max-w-[1000px] flex-col gap-5">
            {advanced ? (
                /* بعد البحث: الحرفة / الموقع / التقييم + بحث */
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        setAppliedFilters({ query, location, minRating });
                    }}
                    className="flex flex-col gap-3 md:flex-row md:items-center"
                >
                    <div className="relative min-w-0 flex-1">
                        <Search size={15} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t("searchPage.craft")}
                            aria-label={t("searchPage.craft")}
                            className={`${field} pe-4 ps-10 [&::-webkit-search-cancel-button]:hidden`}
                        />
                    </div>
                    <div className="relative min-w-0 md:w-[180px]">
                        <select
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            aria-label={t("searchPage.place")}
                            className={`${field} cursor-pointer appearance-none pe-9 ps-4 ${location ? "" : "text-[#A9B3BB]"}`}
                        >
                            <option value="">{t("searchPage.place")}</option>
                            {places.map((pl) => (
                                <option key={pl} value={pl} className="text-[#414141]">
                                    {pl}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                    </div>
                    <div className="relative min-w-0 md:w-[180px]">
                        <select
                            value={minRating}
                            onChange={(e) => setMinRating(e.target.value)}
                            aria-label={t("searchPage.rating")}
                            className={`${field} cursor-pointer appearance-none pe-9 ps-4 ${minRating ? "" : "text-[#A9B3BB]"}`}
                        >
                            <option value="">{t("searchPage.rating")}</option>
                            {RATINGS.map((n) => (
                                <option key={n} value={n} className="text-[#414141]">
                                    {ratingLabel(n)}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                    </div>
                    <button
                        type="submit"
                        className="h-11 shrink-0 cursor-pointer rounded-xl bg-linear-to-l from-[#4B9AD2] to-[#5BAEE4] px-10 text-[15px] font-semibold text-white shadow-[0_3px_8px_rgba(75,154,210,0.25)] btn-wipe ltr:bg-linear-to-r md:w-[116px] md:px-0"
                    >
                        {t("searchPage.searchButton")}
                    </button>
                </form>
            ) : (
                /* قبل البحث: خانة بحث + زر الفلاتر (Enter أو الزر بيفتحوا صف الفلاتر) */
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        openAdvanced();
                    }}
                    className="flex items-center gap-3"
                >
                    <div className="relative min-w-0 flex-1">
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t("searchPage.search")}
                            aria-label={t("searchPage.search")}
                            className={`${field} pe-10 ps-4 [&::-webkit-search-cancel-button]:hidden`}
                        />
                        <Search size={15} className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-[#A9B3BB]" />
                    </div>
                    <button
                        type="button"
                        onClick={openAdvanced}
                        aria-label={t("searchPage.filters")}
                        title={t("searchPage.filters")}
                        className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#0000001A] bg-white text-[#475569] transition-colors hover:border-[#8EC0E4] hover:text-[#4B9AD2]"
                    >
                        <SlidersHorizontal size={17} />
                    </button>
                </form>
            )}

            {chips.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                    {chips.map((c) => (
                        <li key={c.key}>
                            <button
                                type="button"
                                onClick={() => removeChip(c.key)}
                                aria-label={t("searchPage.removeFilter", { name: c.label })}
                                className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-[#EEF5FC] px-3 text-[11px] font-semibold text-[#4B9AD2] transition-colors hover:bg-[#E0EDF9]"
                            >
                                {c.label}
                                <X size={12} strokeWidth={2.5} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {flash && (
                <p role="status" className="rounded-xl border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-3 text-[13px] text-[#2E9E5B]">
                    {flash}
                </p>
            )}

            {/* المناقصات */}
            {results.length ? (
                <ul className="flex flex-col gap-4">
                    {results.map((r) => {
                        const s = `searchPage.sample.${r.id}`;
                        const isSaved = saved.includes(r.id);
                        const infos = [
                            { key: "budget", icon: CircleDollarSign, value: t("searchPage.budgetRange", { min: r.budget[0], max: r.budget[1] }) },
                            { key: "closeDate", icon: CalendarDays, value: new Date(r.closeDate).toLocaleDateString(locale, { day: "numeric", month: "long" }) },
                            { key: "place", icon: MapPin, value: t(`${s}.place`) },
                        ];
                        return (
                            <li key={r.id} className={`${box} p-5 sm:p-6`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        {compact ? (
                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 border-[#EEF5FC] bg-white text-[13px] font-bold text-[#4B9AD2]">
                                                {t(`${s}.company`).trim().charAt(0)}
                                            </span>
                                        ) : (
                                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E4EFFA] text-[#4B9AD2]">
                                                <Building2 size={22} strokeWidth={1.8} />
                                            </span>
                                        )}
                                        <div className="min-w-0">
                                            <h2 className={`font-bold leading-[1.5] text-[#1E293B] ${compact ? "text-[16px]" : "text-[17px]"}`}>{t(`${s}.title`)}</h2>
                                            <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[#475569]">
                                                <span className="flex items-center gap-1">
                                                    {!compact && <Building2 size={12} className="text-[#89949D]" />}
                                                    {t(`${s}.company`)}
                                                </span>
                                                {compact ? <span aria-hidden="true">_</span> : <span aria-hidden="true" className="h-3 w-px bg-[#0000001A]" />}
                                                <bdi dir="ltr" className="tabular-nums">{r.number}</bdi>
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`shrink-0 rounded-full bg-[#EEF5FC] text-[#4B9AD2] ${compact ? "px-2.5 py-0.5 text-[10px]" : "px-3.5 py-1 text-[11px]"}`}>
                                        {t("searchPage.orgType")}
                                    </span>
                                </div>

                                {compact ? (
                                    /* شريط واحد بخلفية زرقاء فاتحة وفواصل بين الأعمدة */
                                    <dl className="mt-4 grid rounded-xl bg-[#EAF3FB] sm:grid-cols-3">
                                        {infos.map(({ key, value }, i) => (
                                            <div key={key} className={`px-3 py-3 text-center ${i > 0 ? "border-t border-white sm:border-s-2 sm:border-t-0" : ""}`}>
                                                <dt className="text-[12px] text-[#475569]">{t(`searchPage.${key === "closeDate" ? "lastDate" : key}`)}</dt>
                                                <dd className="mt-1.5 text-[15px] font-bold text-[#1E293B] tabular-nums">{value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                ) : (
                                <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                                    {infos.map(({ key, icon: Icon, value }) => (
                                        <div key={key} className="rounded-xl bg-[#F7FAFD] px-3 py-3 text-center">
                                            <dt className="flex items-center justify-center gap-1.5 text-[12px] text-[#475569]">
                                                <Icon size={15} strokeWidth={1.8} className="text-[#4B9AD2]" />
                                                {t(`searchPage.${key}`)}
                                            </dt>
                                            <dd className="mt-2 text-[14px] font-medium text-[#1E293B] tabular-nums">{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                                )}

                                <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#0000000F] pt-4">
                                    {applied[r.id] ? (
                                        <span className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#DDF6E3] px-6 text-[13px] font-semibold text-[#2EAF4E]">
                                            <Check size={15} />
                                            {t("jobs.applied")}
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFlash("");
                                                setApplyTo(r);
                                            }}
                                            className="inline-flex h-10 min-w-[128px] cursor-pointer items-center justify-center gap-3 rounded-xl bg-linear-to-l from-[#1383C6] to-[#4B9AD2] px-5 text-[13px] font-semibold text-white shadow-[0_3px_8px_rgba(19,131,198,0.25)] btn-wipe ltr:bg-linear-to-r"
                                        >
                                            {t("searchPage.details")}
                                            <ChevronLeft size={16} strokeWidth={2.5} className="ltr:rotate-180" />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setSaved((list) => (isSaved ? list.filter((x) => x !== r.id) : [...list, r.id]))}
                                        aria-pressed={isSaved}
                                        aria-label={isSaved ? t("jobs.unsave") : t("jobs.save")}
                                        className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-[#4B9AD2] transition-colors hover:bg-[#EEF5FC] ${compact ? "" : "border border-[#CFE3F3] bg-[#F7FAFD]"}`}
                                    >
                                        <Bookmark size={compact ? 20 : 18} strokeWidth={1.8} fill={isSaved ? "currentColor" : "none"} />
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className={`${box} px-5 py-12 text-center text-[13px] text-[#89949D]`}>{t("searchPage.empty")}</p>
            )}

            {applyTo && (
                <ApplyModal
                    key={applyTo.id}
                    job={{
                        id: applyTo.id,
                        title: serviceName(applyTo.serviceId) || t(`searchPage.sample.${applyTo.id}.title`),
                        org: t(`searchPage.sample.${applyTo.id}.company`),
                        desc: t(`searchPage.sample.${applyTo.id}.desc`),
                        location: t(`searchPage.sample.${applyTo.id}.place`),
                        time: new Date(applyTo.closeDate).toLocaleDateString(locale, { day: "numeric", month: "long" }),
                        distance: applyTo.distance,
                        budget: applyTo.budget,
                    }}
                    onClose={() => setApplyTo(null)}
                    onSend={handleApply}
                />
            )}
        </div>
    );
}
