import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Search } from "lucide-react";
import StatusTabs from "../../../components/dashboard/StatusTabs";
import { OFFERS } from "./offersData";

const BASE = "/dashboard/institution";

const TABS = ["all", "executing", "awaiting", "completed"];

const STATUS_STYLES = {
    new: "bg-[#DDF6E3] text-[#2EAF4E]",
    reviewed: "bg-[#E4EEF7] text-[#5F7D96]",
    shortlisted: "bg-[#DCEBFA] text-[#4B9AD2]",
    excluded: "bg-[#FDE2E2] text-[#D64545]",
};

const COLUMNS = ["tender", "applicants", "bidder", "price", "duration", "status"];

export default function InstitutionOffers() {
    const { t } = useTranslation("institutionDashboard");
    const [query, setQuery] = useState("");
    const [tab, setTab] = useState("all");

    const counts = useMemo(() => {
        const c = { all: OFFERS.length };
        OFFERS.forEach((o) => {
            c[o.stage] = (c[o.stage] || 0) + 1;
        });
        return c;
    }, []);

    const rows = useMemo(() => {
        const q = query.trim().toLowerCase();
        return OFFERS.filter((o) => {
            if (tab !== "all" && o.stage !== tab) return false;
            if (!q) return true;
            return t(`offersPage.sample.${o.id}.tender`).toLowerCase().includes(q);
        });
    }, [tab, query, t]);

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
            {/* البحث + إضافة مناقصة */}
            <section className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <label className="relative block flex-1">
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
                    className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#4B9AD2] px-5 text-[14px] font-medium text-white shadow-[0_4px_12px_rgba(75,154,210,0.3)] btn-wipe sm:min-w-[190px]"
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
                    <table className="w-full min-w-[760px] text-[13px]">
                        <thead>
                            <tr className="border-b border-[#0000002E] text-[13px] text-[#4B9AD2]">
                                {COLUMNS.map((c) => (
                                    <th key={c} className="px-4 pb-4 pt-6 text-center font-medium first:ps-5 first:text-start">
                                        {t(`offersPage.columns.${c}`)}
                                    </th>
                                ))}
                                <th className="px-5 pb-4 pt-6">
                                    <span className="sr-only">{t("offersPage.columns.actions")}</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#0000002E]">
                            {rows.map((o) => {
                                const s = `offersPage.sample.${o.id}`;
                                return (
                                    <tr key={o.id} className="transition-colors hover:bg-[#F7FAFD]">
                                        <td className="max-w-[150px] px-4 py-6 ps-5 text-[14px] leading-[1.8] text-[#141415]">{t(`${s}.tender`)}</td>
                                        <td className="px-4 py-6 text-center text-[#141415] tabular-nums">{o.applicants}</td>
                                        <td className="px-4 py-6 text-center leading-[1.7] text-[#141415]">{t(`${s}.bidder`)}</td>
                                        <td className="px-4 py-6 text-center text-[#575757] tabular-nums">
                                            {t("offersPage.price", { amount: o.price.toLocaleString("en-US") })}
                                        </td>
                                        <td className="px-4 py-6 text-center text-[#141415] tabular-nums">{o.duration}</td>
                                        <td className="px-4 py-6 text-center">
                                            <span
                                                className={`inline-block whitespace-nowrap rounded-full px-3 py-0.5 text-[10px] font-medium ${STATUS_STYLES[o.status]}`}
                                            >
                                                {t(`offersPage.status.${o.status}`)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-6 text-end">
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
