import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, CircleAlert, Hash, MapPin, MessageSquareText, UserRound, Wrench } from "lucide-react";
import StatusTabs from "../../../components/dashboard/StatusTabs";
import SearchField from "../../../components/dashboard/SearchField";

// ===== بيانات تجريبية =====
// ما في endpoint بالسيرفر للأعمال الحالية بمراحلها (الأقرب GET /service-requests + complete بـ src/api/endpoints.js).
// لما يضيفها الباك إند، استبدلي WORKS بالبيانات الحقيقية.
// step: رقم المرحلة الحالية من STEPS (0 = استلام الطلب)، phone: رقم العميل لزر "تواصل مع العميل"
const WORKS = [
    { id: "w1", number: "89253", status: "inProgress", step: 0, phone: "+970599000001", synced: 15 },
    { id: "w2", number: "89261", status: "inProgress", step: 1, phone: "+970599000002", synced: 40 },
    { id: "w3", number: "89274", status: "inProgress", step: 2, phone: "+970599000003", synced: 5 },
    { id: "w4", number: "89280", status: "inProgress", step: 1, phone: "+970599000004", synced: 25 },
    { id: "w5", number: "89102", status: "completed", step: 3, phone: "+970599000005" },
    { id: "w6", number: "89110", status: "cancelled", step: 0, phone: "+970599000006" },
];

const TABS = ["all", "open", "submitted", "inProgress", "completed", "cancelled", "draft"];
const STEPS = ["received", "started", "finishing", "delivered"];

const STATUS_STYLES = {
    open: "bg-[#E4EFFA] text-[#4B9AD2]",
    submitted: "bg-[#FFF3D6] text-[#B7791F]",
    inProgress: "bg-[#DDF6E3] text-[#2EAF4E]",
    completed: "bg-[#E4EFFA] text-[#4B9AD2]",
    cancelled: "bg-[#FDE2E2] text-[#D64545]",
    draft: "bg-[#EEF0F2] text-[#575757]",
};

const card = "rounded-[20px] border border-[#0000000D] bg-white shadow-[0_4px_24px_rgba(35,74,100,0.08)]";

/** مراحل العمل: المنتهية والحالية أزرق، والجاية باهتة */
function Steps({ current }) {
    const { t } = useTranslation("craftsmanDashboard");
    return (
        <ol className="flex items-start">
            {STEPS.map((key, i) => {
                const done = i < current;
                const active = i === current;
                const reached = i <= current;
                return (
                    <li key={key} className="relative flex flex-1 flex-col items-center gap-2 text-center">
                        {/* الخط الواصل بالمرحلة اللي قبلها */}
                        {i > 0 && (
                            <span
                                aria-hidden
                                className={`absolute end-1/2 top-[13px] h-px w-full ${reached ? "bg-[#4B9AD2]" : "bg-[#CFDCE6]"}`}
                            />
                        )}
                        <span
                            className={`relative z-[1] flex h-[27px] w-[27px] items-center justify-center rounded-full border-2 bg-white ${reached ? "border-[#4B9AD2]" : "border-[#DCEAF8]"
                                }`}
                        >
                            {done ? (
                                <Check size={13} strokeWidth={3} className="text-[#4B9AD2]" />
                            ) : (
                                <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-[#4B9AD2]" : "bg-[#C9DFF0]"}`} />
                            )}
                        </span>
                        <span
                            aria-current={active ? "step" : undefined}
                            className={`text-[11px] ${reached ? "font-medium text-[#4B9AD2]" : "text-[#B4BEC6]"}`}
                        >
                            {t(`currentPage.steps.${key}`)}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}

/** بطاقة عمل واحد: العنوان والمعلومات والمراحل والملاحظات */
function WorkCard({ work, onComplete }) {
    const { t } = useTranslation("craftsmanDashboard");
    const s = `currentPage.sample.${work.id}`;

    const infos = ["startDate", "delivery", "service", "place"];
    const meta = [
        { key: "customer", icon: UserRound, text: t("currentPage.customer", { name: t(`${s}.customer`) }) },
        { key: "place", icon: MapPin, text: t(`${s}.place`) },
        { key: "number", icon: Hash, text: t("currentPage.number", { number: work.number }) },
    ];

    return (
        <li className={card}>
            <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#8EC0E4] text-[#4B9AD2]">
                            <Wrench size={20} />
                        </span>
                        <h2 className="text-[18px] font-bold leading-[1.6] text-[#22455E]">{t(`${s}.title`)}</h2>
                    </div>
                    <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[work.status]}`}>
                        {t(`currentPage.tabs.${work.status}`)}
                    </span>
                </div>

                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] text-[#575757]">
                    {meta.map(({ key, icon: Icon, text }) => (
                        <li key={key} className="flex items-center gap-1.5">
                            <Icon size={13} className="text-[#4B9AD2]" />
                            {text}
                        </li>
                    ))}
                </ul>

                <div className="mt-6 flex flex-col gap-5 lg:flex-row">
                    <div className="min-w-0 flex-1">
                        <Steps current={work.step} />

                        <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                            {infos.map((key) => (
                                <div key={key} className="rounded-xl border border-[#DCEAF8] bg-white px-3 py-3">
                                    <dt className="text-[10px] text-[#89949D]">{t(`currentPage.${key}`)}</dt>
                                    <dd className="mt-2 text-[11px] font-semibold text-[#414141]">{t(`${s}.${key}`)}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    <aside className="rounded-2xl bg-[#FDE8E8] px-5 py-5 text-center lg:w-[230px] lg:shrink-0">
                        <h3 className="flex items-center justify-center gap-2 text-[14px] font-semibold text-[#414141]">
                            <CircleAlert size={15} className="text-[#D64545]" />
                            {t("currentPage.notes")}
                        </h3>
                        <p className="mt-3 text-[11px] leading-[2] text-[#575757]">{t(`${s}.notes`)}</p>
                    </aside>
                </div>
            </div>

            {work.status === "inProgress" && (
                <div className="flex flex-col gap-4 border-t border-[#0000000F] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <p className="flex items-center gap-1.5 text-[11px] text-[#575757]">
                        <span className="flex h-4 w-4 items-center justify-center rounded border border-[#2EAF4E] text-[#2EAF4E]">
                            <Check size={11} strokeWidth={3} />
                        </span>
                        {t("currentPage.synced", { count: work.synced })}
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => onComplete(work)}
                            className="inline-flex h-10 min-w-[120px] cursor-pointer items-center justify-center rounded-xl border border-[#4B9AD2] px-5 text-[13px] font-semibold text-[#4B9AD2] btn-wipe btn-wipe-outline"
                        >
                            {t("currentPage.markComplete")}
                        </button>
                        <a
                            href={`tel:${work.phone}`}
                            className="inline-flex h-10 min-w-[150px] items-center justify-center gap-2 rounded-xl bg-[#4B9AD2] px-5 text-[13px] font-semibold text-white btn-wipe"
                        >
                            <MessageSquareText size={15} />
                            {t("currentPage.contact")}
                        </a>
                    </div>
                </div>
            )}
        </li>
    );
}

/** صفحة "الأعمال الحالية" للحرفي: بحث بالعنوان + فلترة بالحالة */
export default function CraftsmanCurrent() {
    const { t } = useTranslation("craftsmanDashboard");
    const [query, setQuery] = useState("");
    const [tab, setTab] = useState("all");
    // ⚠️ "تحديد كمكتمل" بالصفحة بس لحد ما نربطها بالسيرفر
    const [works, setWorks] = useState(WORKS);
    const [flash, setFlash] = useState("");

    const complete = (work) => {
        setWorks((list) => list.map((w) => (w.id === work.id ? { ...w, status: "completed", step: STEPS.length - 1 } : w)));
        setFlash(t("currentPage.completed", { title: t(`currentPage.sample.${work.id}.title`) }));
    };

    const counts = useMemo(() => {
        const c = { all: works.length };
        works.forEach((w) => {
            c[w.status] = (c[w.status] || 0) + 1;
        });
        return c;
    }, [works]);

    const q = query.trim().toLowerCase();
    const visible = works.filter(
        (w) =>
            (tab === "all" || w.status === tab) &&
            (!q || t(`currentPage.sample.${w.id}.title`).toLowerCase().includes(q))
    );

    return (
        <div className="mx-auto flex max-w-[1000px] flex-col gap-6">
            <SearchField value={query} onChange={setQuery} placeholder={t("currentPage.searchPlaceholder")} />

            <StatusTabs
                tabs={TABS.map((key) => ({ key, label: t(`currentPage.tabs.${key}`), count: counts[key] || 0 }))}
                value={tab}
                onChange={(key) => {
                    setTab(key);
                    setFlash("");
                }}
            />

            {flash && (
                <p role="status" className="rounded-lg border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-3 text-[13px] text-[#2E9E5B]">
                    {flash}
                </p>
            )}

            {visible.length ? (
                <ul className="flex flex-col gap-5">
                    {visible.map((w) => (
                        <WorkCard key={w.id} work={w} onComplete={complete} />
                    ))}
                </ul>
            ) : (
                <p className={`${card} px-6 py-12 text-center text-[13px] text-[#89949D]`}>{t("currentPage.empty")}</p>
            )}
        </div>
    );
}
