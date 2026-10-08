import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown, LayoutGrid, MapPin, Search } from "lucide-react";
import { useServices } from "../../../hooks/useReferenceData";
import ApplyModal from "./ApplyModal";

// ===== بيانات تجريبية =====
// ما في endpoint للبحث بالأعمال المتاحة للحرفي لسا. لما يجهز، استبدلي RESULTS بطلب من src/api/endpoints.js
// serviceId: رقم الحرفة من GET /services — value: القيمة بالشيكل
// distance: بالكيلومتر، budget: [أقل، أعلى] بالشيكل (بيظهروا بنافذة "قدم عرضك")
const RESULTS = [
    { id: "s1", serviceId: 1, value: 250, status: "inProgress", distance: 1.2, budget: [200, 300] },
    { id: "s2", serviceId: 1, value: 400, status: "open", distance: 3.5, budget: [350, 450] },
    { id: "s3", serviceId: 2, value: 300, status: "open", distance: 8, budget: [250, 350] },
    { id: "s4", serviceId: 5, value: 900, status: "open", distance: 5.4, budget: [800, 1000] },
    { id: "s5", serviceId: 4, value: 1200, status: "inProgress", distance: 14, budget: [1000, 1400] },
];

const STATUS_STYLES = {
    open: "bg-[#DCEBFA] text-[#4B9AD2]",
    inProgress: "bg-[#DDF6E3] text-[#2EAF4E]",
};

const field =
    "h-11 w-full rounded-xl border border-[#8EC0E4] bg-white text-[12px] text-[#414141] outline-none transition-colors placeholder:text-[#89949D] focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";

export default function CraftsmanSearch() {
    const { t } = useTranslation("craftsmanDashboard");
    const services = useServices();

    const [query, setQuery] = useState("");
    const [location, setLocation] = useState("");
    const [serviceId, setServiceId] = useState("all");
    const [filters, setFilters] = useState({ query: "", location: "", serviceId: "all" });
    // العمل المفتوح بنافذة "قدم عرضك"، والأعمال اللي انقدّم عليها
    const [applyTo, setApplyTo] = useState(null);
    const [applied, setApplied] = useState({});
    const [flash, setFlash] = useState("");

    // اسم الحرفة من قائمة الخدمات الحقيقية
    const serviceName = (id) => services.items.find((x) => x.id === id)?.name || "";

    // ⚠️ ما في endpoint للتقديم لسا، فالعرض بينحفظ بالصفحة بس
    const handleApply = (offer) => {
        setApplied((a) => ({ ...a, [applyTo.id]: offer }));
        setFlash(t("jobs.modal.sent", { org: t(`searchPage.sample.${applyTo.id}.company`) }));
        setApplyTo(null);
    };

    const results = useMemo(() => {
        const q = filters.query.trim().toLowerCase();
        const loc = filters.location.trim().toLowerCase();
        return RESULTS.filter((r) => {
            const s = `searchPage.sample.${r.id}`;
            if (filters.serviceId !== "all" && String(r.serviceId) !== filters.serviceId) return false;
            if (loc && !t(`${s}.place`).toLowerCase().includes(loc)) return false;
            if (!q) return true;
            return [t(`${s}.title`), t(`${s}.desc`), t(`${s}.company`)].join(" ").toLowerCase().includes(q);
        });
    }, [filters, t]);

    return (
        <div className="mx-auto flex max-w-[1000px] flex-col gap-6">
            {/* البحث والفلاتر */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setFilters({ query, location, serviceId });
                }}
                className="flex flex-col gap-3 rounded-[20px] border border-[#0000000D] bg-white p-4 shadow-[0_4px_24px_rgba(35,74,100,0.08)] md:flex-row md:items-center"
            >
                <div className="relative min-w-0 flex-1">
                    <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t("searchPage.search")}
                        aria-label={t("searchPage.search")}
                        className={`${field} ps-9 pe-4`}
                    />
                </div>
                <div className="relative min-w-0 flex-1">
                    <MapPin size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                    <input
                        type="search"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={t("searchPage.location")}
                        aria-label={t("searchPage.location")}
                        className={`${field} ps-9 pe-4`}
                    />
                </div>
                <div className="relative min-w-0 md:w-[180px]">
                    <LayoutGrid size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                    <select
                        value={serviceId}
                        onChange={(e) => setServiceId(e.target.value)}
                        aria-label={t("searchPage.serviceType")}
                        className={`${field} cursor-pointer appearance-none ps-9 pe-9 ${serviceId === "all" ? "text-[#89949D]" : ""}`}
                    >
                        <option value="all">{t("searchPage.serviceType")}</option>
                        {services.options.map((o) => (
                            <option key={o.value} value={o.value} className="font-bold">
                                {o.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                </div>
                <button
                    type="submit"
                    className="h-11 shrink-0 cursor-pointer rounded-xl bg-[#4B9AD2] px-10 text-[14px] font-semibold text-white btn-wipe"
                >
                    {t("searchPage.searchButton")}
                </button>
            </form>

            {flash && (
                <p role="status" className="rounded-lg border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-3 text-[13px] text-[#2E9E5B]">
                    {flash}
                </p>
            )}

            {/* النتائج */}
            {results.length ? (
                <ul className="flex flex-col gap-5">
                    {results.map((r) => {
                        const s = `searchPage.sample.${r.id}`;
                        const infos = [
                            { key: "value", value: t("searchPage.valueAmount", { amount: r.value.toLocaleString("en-US") }) },
                            { key: "delivery", value: t(`${s}.delivery`) },
                            { key: "place", value: t(`${s}.place`) },
                        ];
                        return (
                            <li
                                key={r.id}
                                className="rounded-[20px] border border-[#0000000D] bg-white p-5 shadow-[0_4px_24px_rgba(35,74,100,0.08)] sm:p-6"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <h2 className="text-[17px] font-bold leading-[1.6] text-[#414141]">{t(`${s}.title`)}</h2>
                                    <span
                                        className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[r.status]}`}
                                    >
                                        {t(`searchPage.statuses.${r.status}`)}
                                    </span>
                                </div>
                                <p className="mt-2 flex items-center gap-2 text-[12px] text-[#575757]">
                                    <span className="h-5 w-5 shrink-0 rounded-full bg-[#D9DDE1]" aria-hidden="true" />
                                    {t(`${s}.company`)}
                                </p>
                                <p className="mt-4 text-[14px] leading-[1.9] text-[#575757]">{t(`${s}.desc`)}</p>

                                <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                                    {infos.map((info) => (
                                        <div key={info.key} className="rounded-xl border border-[#DCEAF8] bg-[#F4F8FC] px-3 py-3 text-center">
                                            <dt className="text-[11px] text-[#89949D]">{t(`searchPage.${info.key}`)}</dt>
                                            <dd className="mt-1.5 text-[12px] font-semibold text-[#414141]">{info.value}</dd>
                                        </div>
                                    ))}
                                </dl>

                                {applied[r.id] ? (
                                    <span className="mt-5 inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#DDF6E3] px-8 text-[14px] font-semibold text-[#2EAF4E]">
                                        <Check size={16} />
                                        {t("jobs.applied")}
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFlash("");
                                            setApplyTo(r);
                                        }}
                                        className="mt-5 inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-[#4B9AD2] px-10 text-[15px] font-semibold text-white btn-wipe"
                                    >
                                        {t("searchPage.details")}
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="rounded-[20px] bg-white px-5 py-12 text-center text-[13px] text-[#89949D]">
                    {t("searchPage.empty")}
                </p>
            )}

            {applyTo && (
                <ApplyModal
                    key={applyTo.id}
                    job={{
                        id: applyTo.id,
                        title: serviceName(applyTo.serviceId),
                        org: t(`searchPage.sample.${applyTo.id}.company`),
                        desc: t(`searchPage.sample.${applyTo.id}.title`),
                        location: t(`searchPage.sample.${applyTo.id}.place`),
                        time: t(`searchPage.sample.${applyTo.id}.delivery`),
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
