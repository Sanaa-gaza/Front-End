import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarDays, ChevronLeft } from "lucide-react";
import StatusTabs from "../../../components/dashboard/StatusTabs";
import SearchField from "../../../components/dashboard/SearchField";
import { PROJECTS } from "./projectsData";

const BASE = "/dashboard/institution";

const TABS = ["all", "executing", "pending", "completed"];

const STATUS_STYLES = {
    executing: "bg-[#DDF6E3] text-[#2EAF4E]",
    pending: "bg-[#FDE7E7] text-[#D64545]",
    completed: "bg-[#E8EEF4] text-[#6B7F94]",
};

export default function InstitutionProjects() {
    const { t, i18n } = useTranslation("institutionDashboard");
    const locale = `${i18n.language}-u-nu-latn`;
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
                    // نسبة الإنجاز من المهام المنجزة
                    const percent = Math.round((p.tasks.done / p.tasks.total) * 100);
                    return (
                        <li key={p.id} className="rounded-[20px] border border-[#DDDDDD] bg-white p-5 sm:p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <h3 className="text-[19px] font-bold leading-[1.5] text-[#22455E]">{t(`${s}.title`)}</h3>
                                    <p className="mt-1.5 flex items-center gap-2 text-[12px] text-[#38749E]">
                                        <span className="h-4 w-4 shrink-0 rounded-full bg-[#D9DDE1]" aria-hidden="true" />
                                        {t(`${s}.provider`)}
                                    </p>
                                </div>
                                {/* الحالة: أكبر وبعيدة عن حافة البطاقة */}
                                <span
                                    className={`mt-1 shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-[12px] font-semibold ${STATUS_STYLES[p.status]}`}
                                >
                                    {t(`projectsPage.status.${p.status}`)}
                                </span>
                            </div>

                            {/* نسبة الإنجاز جنب الخط — موعد التسليم تحت الخط (يمين) */}
                            <div className="mt-5">
                                <div className="flex items-center gap-3">
                                    <span className="flex shrink-0 items-center gap-1.5 text-[13px]">
                                        <span className="text-[#286292]">{t("projectsPage.progressLabel")}</span>
                                        <span className="font-bold text-[#4B9AD2] tabular-nums">{percent}%</span>
                                    </span>
                                    <div
                                        className="h-2 flex-1 overflow-hidden rounded-full bg-[#E3E9EE]"
                                        role="progressbar"
                                        aria-valuenow={percent}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label={t("projectsPage.progressLabel")}
                                    >
                                        <div className="h-full rounded-full bg-[#4B9AD2]" style={{ width: `${percent}%` }} />
                                    </div>
                                </div>
                                <div className="mt-6 flex text-[12px]">
                                    <span className="flex items-center gap-1.5 text-[#38749E]">
                                        <CalendarDays size={15} strokeWidth={1.8} />
                                        {t("projectsPage.deadline")}:
                                        <span className="font-semibold text-[#22455E] tabular-nums">
                                            {p.deadline
                                                ? new Date(p.deadline).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })
                                                : t("projectsPage.awaitingUpdate")}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            {/* قيمة المشروع + فتح */}
                            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#DDDDDD] pt-4">
                                <div>
                                    <p className="text-[12px] text-[#38749E]">{t("projectsPage.projectValue")}</p>
                                    <p className="mt-2 text-[22px] font-bold leading-none text-[#22455E] tabular-nums">
                                        {t("projectsPage.amount", { amount: p.value.toLocaleString("en-US") })}
                                    </p>
                                </div>
                                <Link
                                    to={`${BASE}/projects/${p.id}`}
                                    className="inline-flex h-11 min-w-[120px] shrink-0 items-center justify-center rounded-xl bg-[#4B9AD2] px-8 text-[16px] font-semibold text-white btn-wipe"
                                >
                                    {/* الكلمة بنص الزر تماماً، والسهم لزق بآخرها بدون ما يزيحها */}
                                    <span className="relative">
                                        {completed ? t("projectsPage.review") : t("projectsPage.open")}
                                        <ChevronLeft size={16} className="absolute start-full top-1/2 ms-1 -translate-y-1/2 ltr:rotate-180" />
                                    </span>
                                </Link>
                            </div>
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
