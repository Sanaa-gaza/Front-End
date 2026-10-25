import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Check, ChevronDown, LayoutGrid, MapPin, Search, Star, Wrench } from "lucide-react";
import { useServices } from "../../../hooks/useReferenceData";
import { PROVIDERS } from "./providersData";
import ProviderCard from "../../../components/profile/ProviderCard";

const BASE = "/dashboard/institution";
const PAGE_SIZE = 6;

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

function ProviderItem({ provider: p }) {
    const { t } = useTranslation("institutionDashboard");
    const s = `providersPage.sample.${p.id}`;
    return (
        <ProviderCard
            name={t(`${s}.name`)}
            craft={t(`${s}.specialty`)}
            rating={p.rating}
            reviews={p.reviews}
            years={p.years}
            location={t(`${s}.location`)}
            verified={p.verified}
            available={p.available}
            to={`${BASE}/providers/${p.id}`}
            size="sm"
        />
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
                        <ProviderItem key={p.id} provider={p} />
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
