import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BriefcaseBusiness, Check, CircleCheck, CircleHelp, Clock, Eye, FileText, MessageSquareText, Scale, Star, Wallet, X } from "lucide-react";
import { APPLICANTS, OFFERS } from "./offersData";
import { addAcceptedProject, getAcceptedProjects, removeAcceptedProject } from "./projectsData";

const BASE = "/dashboard/institution";

const card = "rounded-[20px] border border-[#DDDDDD] bg-white";

// ===== بيانات تجريبية =====
// ⚠️ ما في endpoint لتفاصيل عرض المتقدم لسا — النصوص بملف الترجمة: applicantOffer
const DETAILS = { duration: 96, validity: 90, warranty: 24, team: 18, startWithin: 7, reviews: 28, projects: 17 };
const STRENGTHS = ["fast", "experienced", "safety", "warranty"];
const TECH = ["plan", "quality", "team"];
// بنود العرض المالي كنسبة من الإجمالي (الباقي ضريبة)
const COSTS = [
    { id: "prep", share: 0.1004 },
    { id: "civil", share: 0.4691 },
    { id: "mep", share: 0.2538 },
    { id: "finishing", share: 0.1285 },
];
const DOCS = [
    { id: "technical", size: "2.1 MB" },
    { id: "financial", size: "640 KB" },
    { id: "schedule", size: "1.3 MB" },
    { id: "license", size: "820 KB" },
    { id: "portfolio", size: "4.6 MB" },
    { id: "bond", size: "310 KB" },
];
const TABS = ["summary", "technical", "financial", "documents"];

// ⚠️ أرقام المقارنة التجريبية لكل متقدم (مدة التنفيذ بالأيام، التقييم الفني %، الضمان بالأشهر)
const COMPARE_DATA = {
    a1: { duration: 96, score: 86, warranty: 24 },
    a2: { duration: 104, score: 84, warranty: 18 },
    a3: { duration: 92, score: 81, warranty: 24 },
};

/** نافذة "مقارنة العروض": العرض الحالي جنب أفضل العروض المنافسة */
function CompareModal({ current, tender, onClose, onOpenOffers }) {
    const { t } = useTranslation("institutionDashboard");
    const c = "applicantOffer.compareModal";
    const ao = "applicantOffer";
    const list = [current, ...APPLICANTS.filter((a) => a.id !== current.id)].map((a) => ({ ...a, ...COMPARE_DATA[a.id] }));
    const lowest = Math.min(...list.map((a) => a.price));
    const fastest = Math.min(...list.map((a) => a.duration));
    const nameOf = (a) => t(`offerDetails.applicantsSample.${a.id}.name`);

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const tag = (text) => (
        <span className="mt-1.5 inline-block rounded-md bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-semibold text-[#16A34A]">{text}</span>
    );
    const rows = [
        {
            key: "value",
            icon: Wallet,
            value: (a) => (
                <>
                    <span className="block">{t(`${ao}.amount`, { value: a.price.toLocaleString("en-US") })}</span>
                    {a.price === lowest && tag(t(`${c}.lowest`))}
                </>
            ),
        },
        {
            key: "duration",
            icon: Clock,
            value: (a) => (
                <>
                    <span className="block">{t(`${ao}.days`, { count: a.duration })}</span>
                    {a.duration === fastest && tag(t(`${c}.fastest`))}
                </>
            ),
        },
        { key: "score", icon: Star, value: (a) => <span className="font-semibold text-[#3D8BC9]">{a.score}%</span> },
        { key: "experience", icon: BriefcaseBusiness, value: (a) => t(`${ao}.years`, { count: a.years }) },
        { key: "warranty", icon: Check, value: (a) => t(`${ao}.months`, { count: a.warranty }) },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div aria-hidden="true" onClick={onClose} className="dim-backdrop absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="compare-title"
                className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[760px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.25)]"
            >
                {/* الرأس */}
                <div className="flex items-center gap-4 border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E3EFFA] text-[#3D8BC9]">
                        <Scale size={20} strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-bold text-[#3D8BC9]">{tender}</p>
                        <h2 id="compare-title" className="mt-0.5 text-[18px] font-semibold text-[#1E293B]">
                            {t(`${c}.title`)}
                        </h2>
                        <p className="mt-0.5 text-[12px] text-[#64748B]">{t(`${c}.subtitle`, { name: nameOf(current) })}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t(`${c}.close`)}
                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#64748B] transition-colors hover:bg-[#F1F5F9]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* المحتوى */}
                <div className="flex flex-col gap-4 overflow-auto px-6 py-5 [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent]">
                    <p className="flex items-start gap-2.5 rounded-xl bg-[#EEF5FC] px-4 py-3 text-[12px] leading-[1.8] text-[#475569]">
                        <CircleHelp size={16} className="mt-0.5 shrink-0 text-[#4B9AD2]" />
                        {t(`${c}.hint`)}
                    </p>

                    <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
                        <table className="w-full min-w-[560px] text-[13px]">
                            <thead className="bg-[#F8FAFC]">
                                <tr>
                                    <th scope="col" className="w-[150px] px-4 py-3.5 text-start text-[12px] font-medium text-[#64748B]">
                                        {t(`${c}.criteria`)}
                                    </th>
                                    {list.map((a, i) => (
                                        <th key={a.id} scope="col" className="px-4 py-3.5 text-start">
                                            <span
                                                className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${i === 0 ? "bg-[#E3EFFA] text-[#3D8BC9]" : "bg-[#F1F5F9] text-[#64748B]"}`}
                                            >
                                                {t(`${c}.${i === 0 ? "current" : "competitor"}`)}
                                            </span>
                                            <span className="mt-1.5 block text-[13px] font-bold text-[#1E293B]">{nameOf(a)}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E8F0]">
                                {rows.map(({ key, icon: Icon, value }) => (
                                    <tr key={key}>
                                        <th scope="row" className="px-4 py-4 text-start text-[12px] font-medium text-[#475569]">
                                            <span className="flex items-center gap-2">
                                                <Icon size={15} className="shrink-0 text-[#4B9AD2]" />
                                                {t(`${c}.rows.${key}`)}
                                            </span>
                                        </th>
                                        {list.map((a, i) => (
                                            <td key={a.id} className={`px-4 py-4 align-top text-[#334155] tabular-nums ${i === 0 ? "bg-[#FBFDFF]" : ""}`}>
                                                {value(a)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* الأسفل */}
                <div className="flex flex-col gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[11px] text-[#94A3B8]">{t(`${c}.footer`)}</p>
                    <button
                        type="button"
                        onClick={onOpenOffers}
                        className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#4B9AD2] px-6 text-[13px] font-semibold text-white btn-wipe"
                    >
                        <Check size={16} strokeWidth={2.5} />
                        {t(`${c}.open`)}
                    </button>
                </div>
            </div>
        </div>
    );
}

const STATUS_BADGES = {
    new: "bg-[#E3EFFA] text-[#3D8BC9]",
    accepted: "bg-[#DCFCE7] text-[#16A34A]",
    excluded: "bg-[#FEF2F2] text-[#DC2626]",
};

/** تفاصيل عرض متقدم واحد على مناقصة — بتفتح من "عرض التفاصيل" بصفحة العروض */
export default function InstitutionApplicantOffer() {
    const { t, i18n } = useTranslation("institutionDashboard");
    const navigate = useNavigate();
    const { offerId, applicantId } = useParams();
    const offer = OFFERS.find((o) => o.id === offerId);
    const applicant = APPLICANTS.find((a) => a.id === applicantId);
    const locale = `${i18n.language}-u-nu-latn`;
    const ao = "applicantOffer";

    const [tab, setTab] = useState("summary");
    // ⚠️ القرار والملاحظة بالصفحة بس لحد ما يصير في endpoint
    // المشروع اللي بينضاف للمشاريع الجارية عند القبول
    const acceptedId = `acc-${offerId}-${applicantId}`;
    const [status, setStatus] = useState(() => (getAcceptedProjects().some((p) => p.id === acceptedId) ? "accepted" : "new"));
    const [note, setNote] = useState("");
    const [comparing, setComparing] = useState(false);
    const [flash, setFlash] = useState("");

    if (!offer || !applicant) {
        return (
            <div className={`${card} mx-auto max-w-[1100px] p-10 text-center`}>
                <p className="text-[15px] font-bold text-[#475569]">{t("offerDetails.notFound")}</p>
                <Link to={`${BASE}/offers`} className="mt-4 inline-block text-[13px] text-[#4B9AD2] hover:underline">
                    {t("offerDetails.back")}
                </Link>
            </div>
        );
    }

    const p = `offerDetails.applicantsSample.${applicant.id}`;
    const name = t(`${p}.name`);
    const initials = name.replace(/^(شركة|مؤسسة)\s+/, "").split(" ").map((w) => w.charAt(0)).slice(0, 2).join("");
    const code = `OFF-2025-${String(108 + APPLICANTS.indexOf(applicant)).padStart(3, "0")}`;
    const tender = t(`offersPage.sample.${offer.id}.tender`);
    const submitted = new Date(`${applicant.date}T10:42:00`);
    const money = (n) => t(`${ao}.amount`, { value: Math.round(n).toLocaleString("en-US") });
    const offerPath = `${BASE}/offers/${offer.id}`;

    const say = (text) => {
        setFlash(text);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const info = [
        { key: "value", value: money(applicant.price) },
        { key: "duration", value: t(`${ao}.days`, { count: DETAILS.duration }) },
        { key: "validity", value: t(`${ao}.days`, { count: DETAILS.validity }) },
        { key: "warranty", value: t(`${ao}.months`, { count: DETAILS.warranty }) },
        { key: "team", value: t(`${ao}.members`, { count: DETAILS.team }) },
        { key: "start", value: t(`${ao}.startWithin`, { count: DETAILS.startWithin }) },
    ];

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-5">
            {/* الرأس */}
            <section className={`${card} flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between sm:p-6`}>
                <div className="flex min-w-0 items-center gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[15px] font-bold text-[#3D8BC9]">
                        {initials}
                    </span>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[#3D8BC9]">
                            {t(`${ao}.offerNo`)} <bdi dir="ltr">{code}</bdi>
                        </p>
                        <h1 className="mt-0.5 text-[22px] font-semibold leading-[1.4] text-[#1E293B]">{name}</h1>
                        <p className="mt-0.5 text-[12px] text-[#64748B]">
                            {t(`${ao}.appliedTo`)} <span className="font-bold text-[#1E293B]">{tender}</span>
                        </p>
                    </div>
                </div>
                <dl className="flex items-center">
                    <div className="pe-5">
                        <dt className="text-[11px] text-[#94A3B8]">{t(`${ao}.submittedAt`)}</dt>
                        <dd className="mt-1 whitespace-nowrap text-[13px] font-bold text-[#1E293B] tabular-nums">
                            {t(`${ao}.dateTime`, {
                                date: submitted.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }),
                                time: submitted.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }),
                            })}
                        </dd>
                    </div>
                    <div className="border-s border-[#E2E8F0] ps-5">
                        <dt className="text-[11px] text-[#94A3B8]">{t(`${ao}.statusLabel`)}</dt>
                        <dd className="mt-1">
                            <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_BADGES[status]}`}>
                                {t(`${ao}.status.${status}`)}
                            </span>
                        </dd>
                    </div>
                </dl>
            </section>

            {flash && (
                <p role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#A7E8CF] bg-[#ECFDF5] px-4 py-3 text-[13px] text-[#059669]">
                    <span>
                        {flash}
                        {status === "accepted" && (
                            <>
                                {" "}
                                <Link to={`${BASE}/projects/${acceptedId}`} className="font-semibold text-[#286292] hover:underline">
                                    {t(`${ao}.decision.openProject`)}
                                </Link>
                            </>
                        )}
                    </span>
                    {status !== "new" && (
                        <button
                            type="button"
                            onClick={() => {
                                if (status === "accepted") removeAcceptedProject(acceptedId);
                                setStatus("new");
                                setFlash("");
                            }}
                            className="shrink-0 cursor-pointer text-[12px] font-semibold text-[#286292] hover:underline"
                        >
                            {t(`${ao}.undo`)}
                        </button>
                    )}
                </p>
            )}

            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
                {/* التبويبات */}
                <section className={`${card} min-w-0`}>
                    <div
                        role="tablist"
                        className="flex gap-6 overflow-x-auto overflow-y-hidden px-5 shadow-[inset_0_-1px_0_#DDDDDD] [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden"
                    >
                        {TABS.map((key) => (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={tab === key}
                                onClick={() => setTab(key)}
                                className={`flex shrink-0 cursor-pointer items-center gap-1.5 border-b-2 py-4 text-[13px] font-semibold transition-colors ${tab === key ? "border-[#4B9AD2] text-[#3D8BC9]" : "border-transparent text-[#64748B] hover:text-[#334155]"}`}
                            >
                                {t(`${ao}.tabs.${key}`)}
                                {key === "documents" && (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E3EFFA] px-1.5 text-[10px] font-bold text-[#3D8BC9] tabular-nums">
                                        {DOCS.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-5 sm:p-6">
                        {tab === "summary" && (
                            <div className="flex flex-col gap-7">
                                <div className="flex items-start gap-3 rounded-2xl bg-[#EEF5FC] p-4">
                                    <MessageSquareText size={18} className="mt-0.5 shrink-0 text-[#4B9AD2]" />
                                    <div>
                                        <p className="text-[13px] font-bold text-[#1E293B]">{t(`${ao}.message.title`)}</p>
                                        <p className="mt-1 text-[12px] leading-[1.9] text-[#475569]">{t(`${ao}.message.text`)}</p>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-[16px] font-semibold text-[#1E293B]">{t(`${ao}.info.title`)}</h2>
                                    <p className="mt-1 text-[11px] text-[#94A3B8]">{t(`${ao}.info.desc`)}</p>
                                    <dl className="mt-4 grid overflow-hidden rounded-xl border border-[#E2E8F0] sm:grid-cols-3">
                                        {info.map(({ key, value }, i) => (
                                            <div
                                                key={key}
                                                className={`px-4 py-4 ${i < 3 ? "border-b border-[#E2E8F0]" : "border-b border-[#E2E8F0] sm:border-b-0"} ${i % 3 !== 2 ? "sm:border-e" : ""} ${i === info.length - 1 ? "border-b-0" : ""}`}
                                            >
                                                <dt className="text-[11px] text-[#94A3B8]">{t(`${ao}.info.items.${key}`)}</dt>
                                                <dd className="mt-1.5 text-[13px] font-bold text-[#1E293B] tabular-nums">{value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>

                                <div>
                                    <h3 className="text-[13px] font-bold text-[#1E293B]">{t(`${ao}.strengths.title`)}</h3>
                                    <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                                        {STRENGTHS.map((id) => (
                                            <li key={id} className="flex items-start gap-2.5 rounded-lg bg-[#F8FAFC] px-4 py-2.5 text-[12px] leading-[1.8] text-[#334155]">
                                                <Check size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-[#10B981]" />
                                                {t(`${ao}.strengths.items.${id}`)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setComparing(true)}
                                    aria-haspopup="dialog"
                                    className="inline-flex h-11 w-fit cursor-pointer items-center justify-center rounded-xl border border-[#4B9AD2] px-6 text-[13px] font-semibold text-[#3D8BC9] btn-wipe btn-wipe-outline"
                                >
                                    {t(`${ao}.compare`)}
                                </button>
                            </div>
                        )}

                        {tab === "technical" && (
                            <div>
                                <h2 className="text-[16px] font-semibold text-[#1E293B]">{t(`${ao}.technical.title`)}</h2>
                                <p className="mt-1 text-[12px] text-[#94A3B8]">{t(`${ao}.technical.desc`)}</p>
                                <ol className="mt-5 flex flex-col gap-3">
                                    {TECH.map((id, i) => (
                                        <li key={id} className="flex items-start gap-4 rounded-2xl border border-[#E2E8F0] px-5 py-5">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF5FC] text-[12px] font-bold text-[#3D8BC9] tabular-nums">
                                                {String(i + 1).padStart(2, "0")}
                                            </span>
                                            <div className="min-w-0 pt-0.5">
                                                <h3 className="text-[14px] font-bold text-[#1E293B]">{t(`${ao}.technical.items.${id}.title`)}</h3>
                                                <p className="mt-1.5 text-[13px] leading-[1.8] text-[#475569]">{t(`${ao}.technical.items.${id}.text`)}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        {tab === "financial" && (
                            <div>
                                <h2 className="text-[16px] font-semibold text-[#1E293B]">{t(`${ao}.financial.title`)}</h2>
                                <p className="mt-1 text-[12px] text-[#94A3B8]">{t(`${ao}.financial.desc`)}</p>
                                <dl className="mt-4 divide-y divide-[#F1F5F9]">
                                    {COSTS.map(({ id, share }) => (
                                        <div key={id} className="flex items-center justify-between gap-4 px-3 py-4">
                                            <dt className="text-[13px] text-[#475569]">{t(`${ao}.financial.items.${id}`)}</dt>
                                            {/* مقرّب لأقرب 100 */}
                                            <dd className="shrink-0 text-[13px] font-bold text-[#1E293B] tabular-nums">
                                                {money(Math.round((applicant.price * share) / 100) * 100)}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                                <div className="mt-2 flex items-center justify-between gap-4 rounded-xl bg-[#EEF5FC] px-4 py-4">
                                    <span className="text-[13px] font-medium text-[#334155]">{t(`${ao}.financial.total`)}</span>
                                    <span className="text-[16px] font-bold text-[#3D8BC9] tabular-nums">{money(applicant.price)}</span>
                                </div>
                            </div>
                        )}

                        {tab === "documents" && (
                            <ul className="flex flex-col gap-2.5">
                                {DOCS.map(({ id, size }) => (
                                    <li key={id} className="flex items-center gap-3.5 rounded-2xl border border-[#E2E8F0] bg-[#FBFCFE] px-4 py-3.5">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FC] text-[#3D8BC9]">
                                            <FileText size={18} strokeWidth={1.7} />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-[13px] font-bold text-[#1E293B]">{t(`${ao}.docs.${id}`)}</span>
                                            <span className="mt-1 block text-[11px] text-[#94A3B8]">
                                                <bdi dir="ltr">{size}</bdi>
                                            </span>
                                        </span>
                                        {/* ⚠️ ما في رابط ملف لسا */}
                                        <button
                                            type="button"
                                            disabled
                                            title={t("projectView.exec.docSoon")}
                                            aria-label={t("projectView.exec.view")}
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#64748B] disabled:cursor-not-allowed"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>

                {/* العمود الجانبي */}
                <aside className="flex flex-col gap-4">
                    <section className={`${card} p-5`}>
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-[14px] font-bold text-[#1E293B]">{t(`${ao}.provider.title`)}</h2>
                            <Link
                                to={`${BASE}/providers/${applicant.provider}`}
                                state={{
                                    provider: {
                                        name,
                                        craft: t(`${p}.specialty`),
                                        location: t(`${p}.location`),
                                        rating: applicant.rating,
                                        years: applicant.years,
                                        verified: applicant.verified,
                                    },
                                }}
                                className="text-[12px] font-semibold text-[#4B9AD2] hover:underline"
                            >
                                {t(`${ao}.provider.profile`)}
                            </Link>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FC] text-[13px] font-bold text-[#3D8BC9]">
                                {initials}
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-[13px] font-bold text-[#1E293B]">{name}</p>
                                {applicant.verified && (
                                    <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-[#16A34A]">
                                        <Check size={12} strokeWidth={3} />
                                        {t(`${ao}.provider.verified`)}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 border-y border-[#F1F5F9] py-3 text-center">
                            <div>
                                <p className="text-[16px] font-bold text-[#1E293B] tabular-nums">{applicant.rating}</p>
                                <p className="mt-0.5 flex justify-center gap-0.5" aria-label={t(`${ao}.provider.ratingLabel`, { rating: applicant.rating })}>
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <Star
                                            key={n}
                                            size={12}
                                            className={n <= Math.round(applicant.rating) ? "fill-[#F2C200] text-[#F2C200]" : "text-[#CBD5E1]"}
                                        />
                                    ))}
                                </p>
                                <p className="mt-0.5 text-[10px] text-[#94A3B8]">{t(`${ao}.provider.reviews`, { count: DETAILS.reviews })}</p>
                            </div>
                            <div className="border-s border-[#F1F5F9]">
                                <p className="text-[16px] font-bold text-[#1E293B] tabular-nums">{DETAILS.projects}</p>
                                <p className="mt-0.5 text-[11px] font-medium text-[#D97706]">{t(`${ao}.provider.projects`)}</p>
                                <p className="mt-0.5 text-[10px] text-[#94A3B8]">{t(`${ao}.provider.projectsDesc`)}</p>
                            </div>
                        </div>
                        <dl className="divide-y divide-[#F1F5F9] text-[12px]">
                            {[
                                ["category", t(`${p}.specialty`)],
                                ["experience", t(`${ao}.years`, { count: applicant.years })],
                                ["location", t(`${p}.location`)],
                            ].map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between gap-3 py-2.5">
                                    <dt className="text-[#94A3B8]">{t(`${ao}.provider.${key}`)}</dt>
                                    <dd className="font-medium text-[#334155]">{value}</dd>
                                </div>
                            ))}
                        </dl>
                        <button
                            type="button"
                            onClick={() => navigate(`${BASE}/chats`, { state: { craftsman: { id: applicant.provider, full_name: name } } })}
                            className="mt-3 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#C7E0F1] text-[13px] font-semibold text-[#3D8BC9] btn-wipe btn-wipe-outline"
                        >
                            <MessageSquareText size={16} />
                            {t(`${ao}.provider.message`)}
                        </button>
                    </section>

                    <section className={`${card} p-5`}>
                        <h2 className="text-[14px] font-bold text-[#1E293B]">{t(`${ao}.note.title`)}</h2>
                        <textarea
                            name="internal_note"
                            rows={4}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            aria-label={t(`${ao}.note.title`)}
                            placeholder={t(`${ao}.note.placeholder`)}
                            className="mt-3 w-full resize-none rounded-xl border border-[#DDDDDD] px-3 py-2.5 text-[12px] leading-[1.8] text-[#334155] outline-none placeholder:text-[#94A3B8] focus:border-[#4B9AD2]"
                        />
                        <button
                            type="button"
                            disabled={!note.trim()}
                            onClick={() => {
                                setNote("");
                                say(t(`${ao}.note.saved`));
                            }}
                            className="mt-3 h-10 w-full cursor-pointer rounded-xl bg-[#4B9AD2] text-[13px] font-semibold text-white btn-wipe disabled:cursor-not-allowed disabled:bg-[#E2E8F0] disabled:text-[#94A3B8]"
                        >
                            {t(`${ao}.note.save`)}
                        </button>
                    </section>
                </aside>
            </div>

            {/* القرار */}
            <section className={`${card} mt-4 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between`}>
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF5FC] text-[#3D8BC9]">
                        <CircleHelp size={20} />
                    </span>
                    <div>
                        <p className="text-[14px] font-bold text-[#1E293B]">{t(`${ao}.decision.title`)}</p>
                        <p className="mt-0.5 text-[12px] text-[#64748B]">{t(`${ao}.decision.desc`)}</p>
                    </div>
                </div>
                {status === "new" ? (
                    <div className="flex flex-wrap gap-2.5">
                        <button
                            type="button"
                            onClick={() => {
                                setStatus("excluded");
                                say(t(`${ao}.decision.excludedFlash`, { name }));
                            }}
                            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#FEF2F2] px-5 text-[13px] font-semibold text-[#DC2626] transition-colors hover:bg-[#FEE2E2]"
                        >
                            <X size={16} />
                            {t(`${ao}.decision.exclude`)}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                addAcceptedProject({
                                    id: acceptedId,
                                    status: "pending",
                                    progress: 0,
                                    value: applicant.price,
                                    tasks: { done: 0, total: 20 },
                                    deadline: null,
                                    title: tender,
                                    provider: name,
                                    offerId: offer.id,
                                    applicantId: applicant.id,
                                    acceptedAt: new Date().toISOString(),
                                });
                                setStatus("accepted");
                                say(t(`${ao}.decision.acceptedFlash`, { name }));
                            }}
                            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#16A34A] px-6 text-[13px] font-semibold text-white transition-colors hover:bg-[#15803D]"
                        >
                            <Check size={16} strokeWidth={2.5} />
                            {t(`${ao}.decision.accept`)}
                        </button>
                    </div>
                ) : (
                    <span className={`inline-flex h-11 items-center gap-2 rounded-xl px-5 text-[13px] font-semibold ${STATUS_BADGES[status]}`}>
                        {status === "accepted" ? <CircleCheck size={16} /> : <X size={16} />}
                        {t(`${ao}.status.${status}`)}
                    </span>
                )}
            </section>

            {comparing && (
                <CompareModal
                    current={applicant}
                    tender={tender}
                    onClose={() => setComparing(false)}
                    onOpenOffers={() => navigate(offerPath)}
                />
            )}
        </div>
    );
}
