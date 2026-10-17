import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2 } from "lucide-react";
import GrowthChart from "./GrowthChart";

const BASE = "/dashboard/admin";

const card = "rounded-[20px] border border-[#0000000D] bg-white shadow-[0_4px_24px_rgba(35,74,100,0.08)]";

// ===== بيانات تجريبية =====
// الباك إند لسا ما فيه endpoints لإحصائيات الأدمن. لما تجهز، استبدلي هالبيانات بطلبات من src/api/endpoints.js
const STATS = [
    { key: "projects", value: 9 },
    { key: "verification", value: 4 },
    { key: "chats", value: 7 },
    { key: "craftsmen", value: 13 },
    { key: "institutions", value: 23 },
    { key: "contractors", value: 20 },
    { key: "customers", value: 12 },
];

// نمو المستخدمين — نقاط كل خط: [رقم الشهر (0 = يناير، ممكن كسور), القيمة] بنفس أماكنها بالتصميم
// الأحمر: قيد المراجعة، الأزرق: لم يتم الاطلاع عليها بعد، الأخضر: الطلبات والإجراءات المكتملة
const GROWTH = [
    { key: "reviewing", color: "#DC4A4A", points: [[0.05, 16.5], [1.15, 6], [4, 16.5], [7.7, 16.5], [10.2, 26]] },
    { key: "unseen", color: "#4B9AD2", points: [[0.15, 24], [2.65, 14], [6.4, 14], [9.25, 3.5], [10.35, 14]] },
    { key: "completed", color: "#10C24A", points: [[0, 21], [2.7, 9.5], [6.75, 9.5], [9.8, -3], [11, 9.5]] },
];

// مهام تحتاج إجراء: dot = لون النقطة، count = عدد المهام
const ACTIONS = [
    { key: "requests", dot: "#E5484D", count: 2, to: `${BASE}/requests` },
    { key: "verification", dot: "#4B9AD2", count: 2, to: `${BASE}/verification` },
];

const LATEST = ["q1", "q2", "q3", "q4"];

/** الصفحة الرئيسية للوحة الأدمن */
export default function AdminHome() {
    const { t } = useTranslation("adminDashboard");
    const months = t("growth.months", { returnObjects: true });
    const series = GROWTH.map((s) => ({ ...s, label: t(`growth.series.${s.key}`) }));
    const pending = ACTIONS.reduce((sum, a) => sum + a.count, 0);

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
            {/* الإحصائيات */}
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {STATS.map((s) => (
                    <li key={s.key} className={`${card} flex flex-col items-center justify-center gap-1.5 px-2 py-4 text-center`}>
                        <span className="text-[24px] font-bold leading-none text-[#4B9AD2] tabular-nums">{s.value}</span>
                        <span className="text-[10px] text-[#575757]">{t(`stats.${s.key}`)}</span>
                    </li>
                ))}
            </ul>

            <div className="grid items-start gap-6 lg:grid-cols-[1fr_250px]">
                <div className="flex min-w-0 flex-col gap-6">
                    {/* نمو المستخدمين */}
                    <section className={`${card} border-t-2 border-t-[#9CC9EA] px-3 pb-4 pt-5`}>
                        <div className="border-b border-[#0000000A] px-2 pb-4">
                            <h2 className="text-[19px] font-bold text-[#22303C]">{t("growth.title")}</h2>
                            <p className="mt-1 text-[10px] text-[#414141]">{t("growth.subtitle", { year: 2026 })}</p>
                        </div>
                        <div className="mt-5">
                            <GrowthChart series={series} months={months} />
                        </div>
                    </section>

                    {/* آخر الطلبات الواردة */}
                    <section className={`${card} border-t-2 border-t-[#9CC9EA] p-5`}>
                        <div className="flex items-center justify-between gap-3 border-b border-[#0000000F] pb-4">
                            <h2 className="text-[15px] font-bold text-[#141415]">{t("latest.title")}</h2>
                            <Link to={`${BASE}/requests`} className="text-[12px] text-[#4B9AD2] hover:underline">
                                {t("latest.all")}
                            </Link>
                        </div>
                        <ul className="mt-5 flex flex-col gap-4">
                            {LATEST.map((id, i) => {
                                const s = `latest.sample.${id}`;
                                return (
                                    <li key={id}>
                                        <Link
                                            to={`${BASE}/requests`}
                                            className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3.5 transition-colors ${i === 0
                                                ? "border-[#BFDCF1] bg-[#EEF5FC]"
                                                : "border-[#0000000F] bg-[#F7F8FA] hover:border-[#BFDCF1]"
                                                }`}
                                        >
                                            <span className="min-w-0">
                                                <span className="block text-[13px] font-bold text-[#141415]">{t(`${s}.title`)}</span>
                                                <span className="mt-1.5 flex items-center gap-1 text-[10px] text-[#575757]">
                                                    <Building2 size={11} className="text-[#89949D]" />
                                                    {t(`${s}.party`)}
                                                </span>
                                                <span className="mt-0.5 block text-[9px] text-[#89949D]">{t(`${s}.time`)}</span>
                                            </span>
                                            <span className="shrink-0 rounded-full bg-[#DDF6E3] px-3 py-0.5 text-[10px] font-medium text-[#2EAF4E]">
                                                {t("latest.new")}
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                </div>

                {/* تحتاج إجراء منك */}
                <aside className={`${card} border-t-2 border-t-[#9CC9EA] p-4`}>
                    <h2 className="text-[13px] font-bold text-[#141415]">{t("actions.title")}</h2>
                    <p className="mt-1 text-[9px] text-[#89949D]">{t("actions.subtitle", { count: pending })}</p>
                    <ul className="mt-3 divide-y divide-[#0000000F] border-t border-[#0000000F]">
                        {ACTIONS.map((a) => (
                            <li key={a.key}>
                                <Link to={a.to} className="flex items-center gap-2.5 py-4 hover:opacity-80">
                                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: a.dot }} aria-hidden="true" />
                                    <span className="min-w-0">
                                        <span className="block text-[11px] text-[#141415]">{t(`actions.items.${a.key}`)}</span>
                                        <span className="mt-0.5 block text-[9px] text-[#89949D]">{t("actions.time")}</span>
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </aside>
            </div>
        </div>
    );
}
