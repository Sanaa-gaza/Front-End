import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Check, ChevronDown, LayoutGrid, MapPin, Search, Star, Wrench } from "lucide-react";
import { useServices } from "../../../hooks/useReferenceData";

const BASE = "/dashboard/institution";
const PAGE_SIZE = 6;

// ===== بيانات تجريبية =====
// الباك إند لسا ما فيه endpoint لقائمة مزودي الخدمة. لما يجهز، استبدلي PROVIDERS بطلب من src/api/endpoints.js
// serviceId: رقم الحرفة من GET /api/services (عشان فلتر "نوع الخدمة" يشتغل على القائمة الحقيقية)
const PROVIDERS = [
    { id: "p1", type: "team", serviceId: 1, rating: 4.9, reviews: 100, years: 8, verified: true, available: true },
    { id: "p2", type: "craftsman", serviceId: 2, rating: 4.7, reviews: 86, years: 6, verified: true, available: true },
    { id: "p3", type: "contractor", serviceId: 8, rating: 4.5, reviews: 54, years: 15, verified: true, available: false },
    { id: "p4", type: "craftsman", serviceId: 4, rating: 4.8, reviews: 120, years: 10, verified: true, available: true },
    { id: "p5", type: "team", serviceId: 5, rating: 4.2, reviews: 38, years: 5, verified: false, available: true },
    { id: "p6", type: "craftsman", serviceId: 10, rating: 4.6, reviews: 72, years: 9, verified: true, available: true },
    { id: "p7", type: "contractor", serviceId: 8, rating: 3.9, reviews: 21, years: 12, verified: true, available: true },
    { id: "p8", type: "craftsman", serviceId: 7, rating: 4.4, reviews: 47, years: 7, verified: false, available: false },
    { id: "p9", type: "team", serviceId: 2, rating: 4.8, reviews: 93, years: 6, verified: true, available: true },
    { id: "p10", type: "craftsman", serviceId: 6, rating: 3.6, reviews: 15, years: 4, verified: false, available: true },
    { id: "p11", type: "contractor", serviceId: 5, rating: 4.3, reviews: 40, years: 11, verified: true, available: true },
    { id: "p12", type: "craftsman", serviceId: 1, rating: 4.9, reviews: 132, years: 13, verified: true, available: true },
];

const TYPES = ["craftsman", "team", "contractor"];
const RATING_OPTIONS = [1, 2, 3, 4, 5];

const field =
    "h-11 w-full rounded-xl border border-[#8EC0E4] bg-white text-[12px] text-[#414141] outline-none transition-colors focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";

/** قائمة منسدلة بأيقونة مربعات بالبداية وسهم بالنهاية */
function FilterSelect({ value, onChange, label, children }) {
    return (
        <div className="relative min-w-0 flex-1">
            <LayoutGrid size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label={label}
                className={`${field} cursor-pointer appearance-none ps-9 pe-9 ${value === "all" ? "text-[#89949D]" : ""}`}
            >
                {children}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
        </div>
    );
}

function ProviderCard({ provider: p }) {
    const { t } = useTranslation("institutionDashboard");
    const s = `providersPage.sample.${p.id}`;
    const name = t(`${s}.name`);
    const tags = t(`${s}.tags`, { returnObjects: true });

    return (
        <article className="relative flex flex-col overflow-hidden rounded-[20px] border border-[#0000000F] bg-white p-4 shadow-[0_6px_20px_rgba(43,91,120,0.08)] transition-shadow hover:shadow-[0_12px_28px_rgba(75,154,210,0.18)]">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#4B9AD2]/40 via-[#4B9AD2]/80 to-[#4B9AD2]/40" />

            <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF3FB] text-[18px] font-bold text-[#414141]">
                        {name.charAt(0)}
                    </div>
                    {p.verified && (
                        <span
                            title={t("providersPage.verified")}
                            className="absolute -bottom-0.5 end-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#4B9AD2] text-white"
                        >
                            <Check size={12} strokeWidth={3} />
                        </span>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[15px] font-bold text-[#414141]">{name}</h3>
                    <p className="mt-0.5 text-[12px] text-[#4B9AD2]">{t(`${s}.specialty`)}</p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-[#89949D]">
                        <Star size={12} className="fill-[#F6C90E] text-[#F6C90E]" />
                        <bdi dir="ltr" className="font-bold text-[#414141]">{p.rating}</bdi>
                        {t("providersPage.reviews", { count: p.reviews })}
                    </p>
                </div>

                {p.available && (
                    <span className="flex shrink-0 items-center gap-1 self-start whitespace-nowrap rounded-full border border-[#BFEBCD] bg-[#E8F8EE] px-2 py-0.5 text-[9px] font-medium text-[#2EAF4E]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2EAF4E]" />
                        {t("providersPage.available")}
                    </span>
                )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-[#414141]">
                <span className="flex items-center gap-1.5">
                    <Wrench size={13} className="text-[#4B9AD2]" />
                    {t("providersPage.years", { count: p.years })}
                </span>
                <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#4B9AD2]" />
                    {t(`${s}.location`)}
                </span>
            </div>

            <ul className="mt-3 flex flex-wrap gap-2">
                {(Array.isArray(tags) ? tags : []).map((tag) => (
                    <li key={tag} className="rounded-full bg-[#EAF3FB] px-3 py-1 text-[10px] text-[#38749E]">
                        {tag}
                    </li>
                ))}
            </ul>

            <Link
                to={`${BASE}/providers/${p.id}`}
                className="mt-4 flex h-10 w-full items-center justify-center rounded-xl bg-[#4B9AD2] text-[14px] font-medium text-white btn-wipe"
            >
                {t("providersPage.profile")}
            </Link>
        </article>
    );
}

/** أرقام الصفحات + أسهم + شرطات (الشرطة الطويلة = الصفحة الحالية) */
function Pagination({ page, pages, onChange }) {
    const { t, i18n } = useTranslation("institutionDashboard");
    if (pages <= 1) return null;
    const pad = (n) => String(n).padStart(2, "0");
    const isRtl = i18n.language === "ar";
    // بالعربي "التالي" على اليسار، بالإنجليزي على اليمين
    const PrevIcon = isRtl ? ArrowRight : ArrowLeft;
    const NextIcon = isRtl ? ArrowLeft : ArrowRight;
    const arrow =
        "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#4B9AD2] text-white btn-wipe disabled:cursor-not-allowed disabled:opacity-40";

    return (
        <nav aria-label="pagination" className="flex flex-col items-center gap-2">
            <p className="text-[12px] text-[#575757] tabular-nums" dir="ltr">
                <span className="font-semibold text-[#4B9AD2]">{pad(page)}</span> / {pad(pages)}
            </p>
            <div className="flex items-center gap-4">
                <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1} aria-label={t("providersPage.prev")} className={arrow}>
                    <PrevIcon size={18} />
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
                <button type="button" onClick={() => onChange(page + 1)} disabled={page === pages} aria-label={t("providersPage.next")} className={arrow}>
                    <NextIcon size={18} />
                </button>
            </div>
        </nav>
    );
}

export default function InstitutionProviders() {
    const { t } = useTranslation("institutionDashboard");
    const services = useServices();

    const [query, setQuery] = useState("");
    const [submitted, setSubmitted] = useState("");
    const [type, setType] = useState("all");
    const [serviceId, setServiceId] = useState("all");
    const [rating, setRating] = useState("all");
    const [page, setPage] = useState(1);

    const results = useMemo(() => {
        const q = submitted.trim().toLowerCase();
        return PROVIDERS.filter((p) => {
            if (type !== "all" && p.type !== type) return false;
            if (serviceId !== "all" && String(p.serviceId) !== serviceId) return false;
            if (rating !== "all" && p.rating < Number(rating)) return false;
            if (!q) return true;
            return t(`providersPage.sample.${p.id}.name`).toLowerCase().includes(q);
        });
    }, [submitted, type, serviceId, rating, t]);

    const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
    const current = Math.min(page, pages);
    const visible = results.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

    // أي تغيير بالفلاتر بيرجّعنا للصفحة الأولى
    const filter = (setter) => (value) => {
        setter(value);
        setPage(1);
    };

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(query);
                    setPage(1);
                }}
                className="flex flex-col gap-3 rounded-[20px] border border-[#0000000D] bg-white p-4 shadow-[0_4px_24px_rgba(35,74,100,0.08)] md:flex-row md:items-center"
            >
                <div className="relative min-w-0 md:flex-[1.4]">
                    <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t("providersPage.search")}
                        aria-label={t("providersPage.search")}
                        className={`${field} ps-9 pe-4 placeholder:text-[#89949D]`}
                    />
                </div>

                <FilterSelect value={type} onChange={filter(setType)} label={t("providersPage.allTypes")}>
                    <option value="all">{t("providersPage.allTypes")}</option>
                    {TYPES.map((k) => (
                        <option key={k} value={k} className="font-bold">
                            {t(`providersPage.types.${k}`)}
                        </option>
                    ))}
                </FilterSelect>

                <FilterSelect value={serviceId} onChange={filter(setServiceId)} label={t("providersPage.serviceType")}>
                    <option value="all">{t("providersPage.serviceType")}</option>
                    {services.options.map((o) => (
                        <option key={o.value} value={o.value} className="font-bold">
                            {o.label}
                        </option>
                    ))}
                </FilterSelect>

                <FilterSelect value={rating} onChange={filter(setRating)} label={t("providersPage.rating")}>
                    <option value="all">{t("providersPage.rating")}</option>
                    {RATING_OPTIONS.map((r) => (
                        <option key={r} value={r} className="font-bold">
                            {t("providersPage.ratingAtLeast", { rating: r })}
                        </option>
                    ))}
                </FilterSelect>

                <button
                    type="submit"
                    className="h-11 shrink-0 cursor-pointer rounded-xl bg-[#4B9AD2] px-10 text-[14px] font-semibold text-white btn-wipe"
                >
                    {t("providersPage.searchButton")}
                </button>
            </form>

            {visible.length ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {visible.map((p) => (
                        <ProviderCard key={p.id} provider={p} />
                    ))}
                </div>
            ) : (
                <p className="rounded-[20px] bg-white px-5 py-12 text-center text-[13px] text-[#89949D]">
                    {t("providersPage.empty")}
                </p>
            )}

            <Pagination page={current} pages={pages} onChange={setPage} />
        </div>
    );
}
