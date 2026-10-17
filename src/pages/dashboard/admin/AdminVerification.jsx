import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, FileText, Search, X } from "lucide-react";

const BASE = "/dashboard/admin";

// ===== بيانات تجريبية =====
// الباك إند لسا ما فيه endpoint لطلبات التوثيق. لما يجهز، استبدلي VERIFICATIONS بطلب من src/api/endpoints.js
// النصوص (الاسم، التخصص، المنطقة) بملف الترجمة: verificationPage.sample.<id>
// status: pending | resubmitted (بتظهر بتبويب "بانتظار المراجعة") | info | verified | rejected
// concurrent: محاكاة مشرف ثاني اتخذ قرار بنفس الوقت (لما يصير في API، السيرفر بيرجع هالحالة لما يتعارض القرار)
export const VERIFICATIONS = [
    { id: "v1", code: "A-517", type: "craftsman", documents: 3, submitted: "2026-10-04", status: "pending", concurrent: { by: "s1", decision: "verified" } },
    { id: "v2", code: "I-312", type: "institution", documents: 4, submitted: "2026-10-04", status: "pending" },
    { id: "v3", code: "K-208", type: "contractor", documents: 5, submitted: "2026-10-02", status: "resubmitted" },
    { id: "v4", code: "A-519", type: "craftsman", documents: 2, submitted: "2026-10-01", status: "pending" },
    { id: "v5", code: "A-520", type: "craftsman", documents: 3, submitted: "2026-09-30", status: "pending" },
    { id: "v6", code: "I-315", type: "institution", documents: 4, submitted: "2026-09-28", status: "pending" },
    { id: "v7", code: "A-521", type: "craftsman", documents: 2, submitted: "2026-09-26", status: "info" },
    { id: "v8", code: "K-211", type: "contractor", documents: 3, submitted: "2026-09-25", status: "info" },
    { id: "v9", code: "A-502", type: "craftsman", documents: 3, submitted: "2026-03-10", status: "verified" },
    { id: "v10", code: "I-301", type: "institution", documents: 4, submitted: "2026-01-15", status: "verified" },
    { id: "v11", code: "A-503", type: "craftsman", documents: 3, submitted: "2026-04-02", status: "verified" },
    { id: "v12", code: "A-506", type: "craftsman", documents: 2, submitted: "2026-09-12", status: "rejected" },
    { id: "v13", code: "K-205", type: "contractor", documents: 5, submitted: "2026-08-30", status: "rejected" },
    { id: "v14", code: "A-509", type: "craftsman", documents: 1, submitted: "2026-08-21", status: "rejected" },
];

const TABS = ["pending", "info", "verified", "rejected"];
const TYPES = ["craftsman", "institution", "contractor"];
// "أعيد التقديم" جزء من تبويب "بانتظار المراجعة"
const tabOf = (status) => (status === "resubmitted" ? "pending" : status);

export const VERIFICATION_STATUS_STYLES = {
    pending: "bg-[#FFFAE6] text-[#BF9900]",
    resubmitted: "bg-[#E4EFFA] text-[#4B87BE]",
    info: "bg-[#FDEBD3] text-[#D9822B]",
    verified: "bg-[#DDF6E3] text-[#2EAF4E]",
    rejected: "bg-[#FDE2E2] text-[#D64545]",
};

const field =
    "h-11 w-full rounded-xl border border-[#8EC0E4] bg-white text-[12px] text-[#414141] outline-none transition-colors focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";

/** قائمة فلتر بنص "العنوان: القيمة" */
function FilterSelect({ value, onChange, label, children }) {
    return (
        <div className="relative md:w-[190px]">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label={label}
                className={`${field} cursor-pointer appearance-none pe-10 ps-4 text-[#575757]`}
            >
                {children}
            </select>
            <ChevronDown size={17} className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
        </div>
    );
}

/** طلبات التوثيق: تبويبات حسب الحالة + بحث وفلاتر + جدول بزر "مراجعة" لكل طلب */
export default function AdminVerification() {
    const { t, i18n } = useTranslation("adminDashboard");
    const v = "verificationPage";
    const locale = `${i18n.language}-u-nu-latn`;
    const [tab, setTab] = useState("pending");
    const [query, setQuery] = useState("");
    const [type, setType] = useState("all");
    const [area, setArea] = useState("all");

    const name = (id) => t(`${v}.sample.${id}.name`);
    const areaOf = (id) => t(`${v}.sample.${id}.area`);
    const areas = [...new Set(VERIFICATIONS.map((x) => areaOf(x.id)))];

    const counts = {};
    VERIFICATIONS.forEach((x) => {
        counts[tabOf(x.status)] = (counts[tabOf(x.status)] || 0) + 1;
    });

    const q = query.trim().toLowerCase();
    const rows = VERIFICATIONS.filter(
        (x) =>
            tabOf(x.status) === tab &&
            (type === "all" || x.type === type) &&
            (area === "all" || areaOf(x.id) === area) &&
            (!q || name(x.id).toLowerCase().includes(q) || x.code.toLowerCase().includes(q))
    );

    const th = "px-3 pb-4 pt-6 text-center font-bold";

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
            <header>
                <h1 className="text-[24px] font-bold text-[#141415]">{t(`${v}.title`)}</h1>
                <p className="mt-2 text-[12px] text-[#575757]">{t(`${v}.subtitle`)}</p>
            </header>

            {/* البحث + الفلاتر */}
            <div className="flex flex-col gap-3 md:flex-row">
                <label className="relative block min-w-0 flex-1">
                    <Search size={16} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t(`${v}.search`)}
                        aria-label={t(`${v}.search`)}
                        className={`${field} pe-10 ps-10 placeholder:text-[#89949D] [&::-webkit-search-cancel-button]:hidden`}
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery("")}
                            aria-label={t(`${v}.clearSearch`)}
                            className="absolute end-3 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#575757] hover:bg-[#EEF5FC]"
                        >
                            <X size={15} />
                        </button>
                    )}
                </label>
                <FilterSelect value={type} onChange={setType} label={t(`${v}.typeFilter`, { value: "" })}>
                    <option value="all">{t(`${v}.typeFilter`, { value: t(`${v}.all`) })}</option>
                    {TYPES.map((k) => (
                        <option key={k} value={k}>{t(`${v}.typeFilter`, { value: t(`${v}.types.${k}`) })}</option>
                    ))}
                </FilterSelect>
                <FilterSelect value={area} onChange={setArea} label={t(`${v}.areaFilter`, { value: "" })}>
                    <option value="all">{t(`${v}.areaFilter`, { value: t(`${v}.all`) })}</option>
                    {areas.map((a) => (
                        <option key={a} value={a}>{t(`${v}.areaFilter`, { value: a })}</option>
                    ))}
                </FilterSelect>
            </div>

            {/* تبويبات الحالة مع العدد */}
            <div role="tablist" className="flex flex-wrap gap-3">
                {TABS.map((key) => {
                    const active = tab === key;
                    return (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => setTab(key)}
                            className={`flex h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-[13px] font-semibold transition-colors ${active
                                ? "bg-[#4B9AD2] text-white shadow-[0_4px_12px_rgba(75,154,210,0.3)]"
                                : "border border-[#CFE3F3] bg-[#EEF5FC] text-[#4B9AD2] hover:border-[#8EC0E4]"
                                }`}
                        >
                            <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] tabular-nums ${active ? "bg-white text-[#4B9AD2]" : "bg-[#CFE3F3] text-[#286292]"}`}>
                                {counts[key] || 0}
                            </span>
                            {t(`${v}.tabs.${key}`)}
                        </button>
                    );
                })}
            </div>

            {/* الجدول */}
            <section className="overflow-hidden rounded-[20px] border border-[#0000000D] bg-white shadow-[0_4px_24px_rgba(35,74,100,0.08)]">
                {rows.length === 0 ? (
                    <div className="flex flex-col items-center px-6 py-14 text-center">
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF5FC] text-[#4B9AD2]">
                            <Search size={26} strokeWidth={1.6} />
                        </span>
                        <h2 className="mt-5 text-[16px] font-bold text-[#141415]">{t(`${v}.noResults.title`)}</h2>
                        <p className="mt-3 text-[11px] text-[#575757]">
                            {q ? t(`${v}.noResults.withQuery`, { query: query.trim() }) : t(`${v}.noResults.filtersOnly`)}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px] text-[12px]">
                            <thead>
                                <tr className="border-b border-[#0000002E] text-[13px] text-[#4B9AD2]">
                                    <th className={th}>{t(`${v}.columns.account`)}</th>
                                    <th className={th}>{t(`${v}.columns.type`)}</th>
                                    <th className={th}>{t(`${v}.columns.field`)}</th>
                                    <th className={th}>{t(`${v}.columns.area`)}</th>
                                    <th className={th}>{t(`${v}.columns.documents`)}</th>
                                    <th className={th}>{t(`${v}.columns.submitted`)}</th>
                                    <th className={th}>{t(`${v}.columns.status`)}</th>
                                    <th className="px-5 pb-4 pt-6">
                                        <span className="sr-only">{t(`${v}.columns.actions`)}</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#0000000F]">
                                {rows.map((x) => {
                                    const n = name(x.id);
                                    return (
                                        <tr key={x.id} className="transition-colors hover:bg-[#F7FAFD]">
                                            <td className="px-4 py-3.5 ps-6">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF3FB] text-[13px] font-bold text-[#4B9AD2]">
                                                        {n.trim().charAt(0)}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-[13px] font-bold text-[#141415]">{n}</p>
                                                        <p className="text-[8px] text-[#89949D]" dir="ltr">{x.code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3.5 text-center text-[#414141]">{t(`${v}.types.${x.type}`)}</td>
                                            <td className="px-3 py-3.5 text-center text-[#414141]">{t(`${v}.sample.${x.id}.field`)}</td>
                                            <td className="px-3 py-3.5 text-center text-[#414141]">{areaOf(x.id)}</td>
                                            <td className="px-3 py-3.5 text-center text-[#575757]">
                                                <span className="inline-flex items-center gap-1 text-[10px]">
                                                    <FileText size={12} />
                                                    {t(`${v}.documents`, { count: x.documents })}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3.5 text-center text-[#414141]">
                                                {new Date(x.submitted).toLocaleDateString(locale, { day: "numeric", month: "long" })}
                                            </td>
                                            <td className="px-3 py-3.5 text-center">
                                                <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[9px] font-medium ${VERIFICATION_STATUS_STYLES[x.status]}`}>
                                                    {t(`${v}.statuses.${x.status}`)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-end">
                                                <Link
                                                    to={`${BASE}/verification/${x.id}`}
                                                    aria-label={t(`${v}.reviewLabel`, { name: n })}
                                                    className="inline-flex h-8 items-center rounded-lg border border-[#8EC0E4] px-4 text-[11px] text-[#4B9AD2] btn-wipe btn-wipe-outline"
                                                >
                                                    {t(`${v}.review`)}
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
