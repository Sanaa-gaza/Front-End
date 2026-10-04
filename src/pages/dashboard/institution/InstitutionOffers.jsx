import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Search } from "lucide-react";
import StatusTabs from "../../../components/dashboard/StatusTabs";

const BASE = "/dashboard/institution";

// ===== بيانات تجريبية =====
// الباك إند لسا ما فيه endpoints للعروض. لما تجهز، استبدلي OFFERS بطلب من src/api/endpoints.js
const OFFERS = [
    { id: "o1", applicants: 12, experience: 12, price: 20000, duration: 86, status: "new" },
    { id: "o2", applicants: 8, experience: 12, price: 100000, duration: 81, status: "reviewed" },
    { id: "o3", applicants: 15, experience: 12, price: 50000, duration: 78, status: "shortlisted" },
    { id: "o4", applicants: 12, experience: 12, price: 50000, duration: 64, status: "excluded" },
];

const TABS = ["all", "new", "reviewed", "shortlisted", "excluded"];

const STATUS_STYLES = {
    new: "bg-[#DDF6E3] text-[#2EAF4E]",
    reviewed: "bg-[#E4EEF7] text-[#5F7D96]",
    shortlisted: "bg-[#DCEBFA] text-[#4B9AD2]",
    excluded: "bg-[#FDE2E2] text-[#D64545]",
};

const COLUMNS = ["tender", "applicants", "bidder", "experience", "price", "duration", "status"];

export default function InstitutionOffers() {
    const { t } = useTranslation("institutionDashboard");
    const [query, setQuery] = useState("");
    const [tab, setTab] = useState("all");

    const counts = useMemo(() => {
        const c = { all: OFFERS.length };
        OFFERS.forEach((o) => {
            c[o.status] = (c[o.status] || 0) + 1;
        });
        return c;
    }, []);

    const rows = useMemo(() => {
        const q = query.trim().toLowerCase();
        return OFFERS.filter((o) => {
            if (tab !== "all" && o.status !== tab) return false;
            if (!q) return true;
            return t(`offersPage.sample.${o.id}.tender`).toLowerCase().includes(q);
        });
    }, [tab, query, t]);

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
            {/* البحث + إضافة مناقصة */}
            <section className="flex flex-col gap-3 rounded-[20px] border border-[#0000000D] bg-white p-4 shadow-[0_4px_24px_rgba(35,74,100,0.08)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <label className="relative block w-full sm:max-w-[520px]">
                    <Search size={16} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t("offersPage.search")}
                        className="h-11 w-full rounded-xl border border-[#8EC0E4] bg-white ps-10 pe-4 text-[13px] text-[#414141] outline-none placeholder:text-[#89949D] focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]"
                    />
                </label>

                <Link
                    to={`${BASE}/tenders/new`}
                    className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#4B9AD2] px-5 text-[14px] font-medium text-white btn-wipe"
                >
                    <Plus size={18} />
                    {t("offersPage.newTender")}
                </Link>
            </section>

            {/* تبويبات حالة العرض */}
            <StatusTabs
                tabs={TABS.map((key) => ({ key, label: t(`offersPage.tabs.${key}`), count: counts[key] || 0 }))}
                value={tab}
                onChange={setTab}
            />

            {/* جدول العروض */}
            <section className="overflow-hidden rounded-[20px] border border-[#0000000D] bg-white shadow-[0_4px_24px_rgba(35,74,100,0.08)]">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-[13px]">
                        <thead>
                            <tr className="border-b border-[#0000001A] text-[13px] text-[#4B9AD2]">
                                {COLUMNS.map((c) => (
                                    <th key={c} className="px-4 py-4 text-start font-semibold first:ps-5">
                                        {t(`offersPage.columns.${c}`)}
                                    </th>
                                ))}
                                <th className="px-5 py-4">
                                    <span className="sr-only">{t("offersPage.columns.actions")}</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#0000001A]">
                            {rows.map((o) => {
                                const s = `offersPage.sample.${o.id}`;
                                return (
                                    <tr key={o.id} className="transition-colors hover:bg-[#F7FAFD]">
                                        <td className="max-w-[160px] px-4 py-5 ps-5 font-medium leading-[1.7] text-[#414141]">{t(`${s}.tender`)}</td>
                                        <td className="px-4 py-5 text-[#414141] tabular-nums">{o.applicants}</td>
                                        <td className="max-w-[170px] px-4 py-5 leading-[1.7] text-[#414141]">{t(`${s}.bidder`)}</td>
                                        <td className="px-4 py-5 text-[#575757]">{t("offersPage.years", { count: o.experience })}</td>
                                        <td className="px-4 py-5 text-[#414141] tabular-nums">
                                            {t("offersPage.price", { amount: o.price.toLocaleString("en-US") })}
                                        </td>
                                        <td className="px-4 py-5 text-[#414141] tabular-nums">{o.duration}</td>
                                        <td className="px-4 py-5">
                                            <span
                                                className={`inline-block whitespace-nowrap rounded-full px-3 py-0.5 text-[10px] font-medium ${STATUS_STYLES[o.status]}`}
                                            >
                                                {t(`offersPage.status.${o.status}`)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-5 text-end">
                                            <Link
                                                to={`${BASE}/offers/${o.id}`}
                                                className="inline-flex h-7 items-center whitespace-nowrap rounded-full border border-[#4B9AD2] px-3 text-[11px] text-[#4B9AD2] btn-wipe btn-wipe-outline"
                                            >
                                                {t("offersPage.view")}
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {rows.length === 0 && (
                    <p className="px-5 py-12 text-center text-[13px] text-[#89949D]">{t("offersPage.empty")}</p>
                )}
            </section>
        </div>
    );
}
