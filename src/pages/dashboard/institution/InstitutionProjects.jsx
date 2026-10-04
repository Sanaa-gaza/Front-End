import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Hourglass } from "lucide-react";
import StatusTabs from "../../../components/dashboard/StatusTabs";
import SearchField from "../../../components/dashboard/SearchField";

const BASE = "/dashboard/institution";

// ===== بيانات تجريبية =====
// الباك إند لسا ما فيه endpoints للمشاريع. لما تجهز، استبدلي PROJECTS بطلب من src/api/endpoints.js
const PROJECTS = [
    { id: "p1", status: "executing", progress: 75, value: 11200 },
    { id: "p2", status: "completed", progress: 100, value: 11200 },
    { id: "p3", status: "pending", progress: 75, value: 11200 },
    { id: "p4", status: "executing", progress: 40, value: 8500 },
];

const TABS = ["all", "executing", "pending", "completed"];

const STATUS_STYLES = {
    executing: "bg-[#DDF6E3] text-[#2EAF4E]",
    pending: "bg-[#FDE7E7] text-[#D64545]",
    completed: "bg-[#E8EEF4] text-[#6B7F94]",
};

export default function InstitutionProjects() {
    const { t } = useTranslation("institutionDashboard");
    const [tab, setTab] = useState("all");
    const [query, setQuery] = useState("");

    const counts = useMemo(() => {
        const c = { all: PROJECTS.length };
        PROJECTS.forEach((p) => {
            c[p.status] = (c[p.status] || 0) + 1;
        });
        return c;
    }, []);

    const projects = useMemo(() => {
        const q = query.trim().toLowerCase();
        return PROJECTS.filter((p) => {
            if (tab !== "all" && p.status !== tab) return false;
            if (!q) return true;
            return t(`projectsPage.sample.${p.id}.title`).toLowerCase().includes(q);
        });
    }, [tab, query, t]);

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-5">
            <StatusTabs
                tabs={TABS.map((key) => ({ key, label: t(`projectsPage.tabs.${key}`), count: counts[key] || 0 }))}
                value={tab}
                onChange={setTab}
            />

            <SearchField value={query} onChange={setQuery} placeholder={t("projectsPage.search")} />

            <ul className="flex flex-col gap-4">
                {projects.map((p) => {
                    const s = `projectsPage.sample.${p.id}`;
                    const completed = p.status === "completed";
                    return (
                        <li
                            key={p.id}
                            className="rounded-[20px] border border-[#0000000D] bg-white px-5 py-4 shadow-[0_4px_24px_rgba(35,74,100,0.06)] sm:px-6"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="text-[16px] font-semibold text-[#414141]">{t(`${s}.title`)}</h3>
                                    <p className="mt-2 flex items-center gap-2 text-[11px] text-[#89949D]">
                                        <span className="h-4 w-4 shrink-0 rounded-full bg-[#D9DDE1]" aria-hidden="true" />
                                        {t(`${s}.provider`)}
                                    </p>
                                </div>
                                <span
                                    className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[p.status]}`}
                                >
                                    {t(`projectsPage.status.${p.status}`)}
                                </span>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
                                <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-[#4B9AD2]">
                                    {!completed && <Hourglass size={12} />}
                                    {completed
                                        ? t("projectsPage.done")
                                        : t("projectsPage.remaining", { time: t(`${s}.time`) })}
                                </span>
                                <div className="h-[3px] min-w-[120px] flex-1 overflow-hidden rounded-full bg-[#CFE3F3]">
                                    <div
                                        className="h-full rounded-full bg-[#4B9AD2]"
                                        style={{ width: `${p.progress}%` }}
                                    />
                                </div>
                                <Link
                                    to={`${BASE}/projects/${p.id}`}
                                    className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-[#4B9AD2] px-4 text-[12px] font-medium text-white btn-wipe"
                                >
                                    {completed ? t("projectsPage.review") : t("projectsPage.open")}
                                    <ChevronLeft size={14} className="ltr:rotate-180" />
                                </Link>
                            </div>

                            <p className="mt-4 text-[11px] text-[#4B9AD2]">
                                {t("projectsPage.value", { amount: p.value.toLocaleString("en-US") })}
                            </p>
                        </li>
                    );
                })}
            </ul>

            {projects.length === 0 && (
                <p className="rounded-[20px] bg-white px-5 py-12 text-center text-[13px] text-[#89949D]">
                    {t("projectsPage.empty")}
                </p>
            )}
        </div>
    );
}
