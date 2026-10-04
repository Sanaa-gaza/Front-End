import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react";
import StatusTabs from "../../../components/dashboard/StatusTabs";
import SearchField from "../../../components/dashboard/SearchField";

const BASE = "/dashboard/institution";

// ===== بيانات تجريبية =====
// الباك إند لسا ما فيه endpoints للمناقصات. لما تجهز، استبدلي TENDERS بطلب من src/api/endpoints.js
// urgent: الموعد قريب (بيظهر بالأزرق)
const TENDERS = [
    { id: "r1", status: "open" },
    { id: "r2", status: "open", urgent: true },
    { id: "r3", status: "open", urgent: true },
    { id: "r4", status: "completed" },
    { id: "r5", status: "cancelled" },
    { id: "r6", status: "cancelled" },
    { id: "r7", status: "draft" },
    { id: "r8", status: "draft" },
];

// ترتيب التبويبات زي التصميم
const TABS = ["all", "open", "executing", "submitting", "completed", "cancelled", "draft"];

const STATUS_STYLES = {
    open: "bg-[#DDF6E3] text-[#2EAF4E]",
    executing: "bg-[#FFF3D6] text-[#B7791F]",
    submitting: "bg-[#CFE3F3] text-[#4B9AD2]",
    completed: "bg-[#E2F4F1] text-[#2C8C7E]",
    cancelled: "bg-[#FDE7E7] text-[#D64545]",
    draft: "bg-[#EEF0F2] text-[#6B7280]",
};

// المناقصات المفتوحة بس إلها موعد متبقي
const HAS_DEADLINE = ["open", "submitting"];

export default function InstitutionTenders() {
    const { t } = useTranslation("institutionDashboard");
    const [tab, setTab] = useState("open");
    const [query, setQuery] = useState("");

    const counts = useMemo(() => {
        const c = { all: TENDERS.length };
        TENDERS.forEach((tender) => {
            c[tender.status] = (c[tender.status] || 0) + 1;
        });
        return c;
    }, []);

    const rows = useMemo(() => {
        const q = query.trim().toLowerCase();
        return TENDERS.filter((tender) => {
            if (tab !== "all" && tender.status !== tab) return false;
            if (!q) return true;
            return t(`tendersPage.sample.${tender.id}.title`).toLowerCase().includes(q);
        });
    }, [tab, query, t]);

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-5">
            <StatusTabs
                tabs={TABS.map((key) => ({ key, label: t(`tendersPage.tabs.${key}`), count: counts[key] || 0 }))}
                value={tab}
                onChange={setTab}
            />

            <SearchField value={query} onChange={setQuery} placeholder={t("tendersPage.search")} />

            {/* الجدول */}
            <section className="overflow-hidden rounded-[20px] border border-[#0000000D] bg-white shadow-[0_4px_24px_rgba(35,74,100,0.08)]">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-start text-[13px]">
                        <thead>
                            <tr className="border-b border-[#0000000F] text-[14px] font-semibold text-[#4B9AD2]">
                                <th className="px-5 py-4 text-start font-semibold">{t("tendersPage.columns.title")}</th>
                                <th className="px-4 py-4 text-start font-semibold">{t("tendersPage.columns.category")}</th>
                                <th className="px-4 py-4 text-start font-semibold">{t("tendersPage.columns.area")}</th>
                                <th className="px-4 py-4 text-start font-semibold">{t("tendersPage.columns.deadline")}</th>
                                <th className="px-4 py-4 text-start font-semibold">{t("tendersPage.columns.status")}</th>
                                <th className="px-5 py-4">
                                    <span className="sr-only">{t("tendersPage.columns.actions")}</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((tender) => {
                                const s = `tendersPage.sample.${tender.id}`;
                                return (
                                    <tr key={tender.id} className="transition-colors hover:bg-[#F7FAFD]">
                                        <td className="px-5 py-3.5 font-bold text-[#414141]">{t(`${s}.title`)}</td>
                                        <td className="px-4 py-3.5 text-[#575757]">{t(`${s}.category`)}</td>
                                        <td className="px-4 py-3.5 text-[#575757]">{t(`${s}.area`)}</td>
                                        <td className={`px-4 py-3.5 ${tender.urgent ? "text-[#4B9AD2]" : "text-[#89949D]"}`}>
                                            {HAS_DEADLINE.includes(tender.status)
                                                ? t("tendersPage.remaining", { time: t(`${s}.time`) })
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span
                                                className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[tender.status]}`}
                                            >
                                                {t(`tendersPage.status.${tender.status}`)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-end">
                                            <Link
                                                to={`${BASE}/tenders/${tender.id}`}
                                                className="inline-flex h-7 items-center gap-1 rounded-full bg-[#4B9AD2] px-3 text-[11px] font-medium text-white btn-wipe"
                                            >
                                                {t("tendersPage.view")}
                                                <ChevronLeft size={13} className="ltr:rotate-180" />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {rows.length === 0 && (
                    <p className="px-5 py-12 text-center text-[13px] text-[#89949D]">{t("tendersPage.empty")}</p>
                )}
            </section>
        </div>
    );
}
