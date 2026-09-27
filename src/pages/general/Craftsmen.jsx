import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SiteLayout from "../../components/home/SiteLayout";
import CraftsmanCard from "../../components/craftsmen/CraftsmanCard";
import CraftsmanModal from "../../components/craftsmen/CraftsmanModal";
import {
    CATEGORY_KEYS,
    CITY_KEYS,
    CRAFTSMEN,
    SERVICE_TO_CATEGORY,
} from "../../data/craftsmen";

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
