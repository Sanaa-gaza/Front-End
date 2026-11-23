import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    Check,
    ChevronDown,
    ChevronLeft,
    Clock,
    FileText,
    MessageSquareText,
    PencilLine,
    Settings,
    UsersRound,
    X,
} from "lucide-react";
import { PROJECTS, allProjects, defaultStartChecks, projectProvider, projectTitle } from "./projectsData";
import StartApproveModal from "./StartApproveModal";

const BASE = "/dashboard/institution";

// ===== بيانات تجريبية =====
// ⚠️ ما في endpoint لطلب بدء التنفيذ لسا. لما يجهز، استبدلي هالقيم بطلب من src/api/endpoints.js
// النصوص بملف الترجمة: startRequest
// بطاقات الملخص: الأيقونة ولون خلفيتها
const STATS = [
    { key: "team", icon: UsersRound, tone: "bg-[#E3EFFA] text-[#3D8BC9]" },
    { key: "start", icon: CalendarDays, tone: "bg-[#DCFCE7] text-[#16A34A]" },
    { key: "duration", icon: Clock, tone: "bg-[#FEF3C7] text-[#D97706]" },
    { key: "files", icon: FileText, tone: "bg-[#EDE9FE] text-[#7C3AED]" },
];
// بيانات الطلب الوارد (2×2)
const INFO = ["representative", "provider", "arrival", "contact"];
// فريق التنفيذ (أول 4 بيظهروا، والباقي بزر "عرض بقية الفريق")
const TEAM = [
    { id: "t1", years: 12 },
    { id: "t2", years: 8 },
    { id: "t3", years: 10 },
    { id: "t4", years: 7 },
    { id: "t5", years: 6 },
    { id: "t6", years: 9 },
    { id: "t7", years: 5 },
    { id: "t8", years: 4 },
    { id: "t9", years: 11 },
    { id: "t10", years: 6 },
    { id: "t11", years: 3 },
    { id: "t12", years: 5 },
];
const TEAM_PREVIEW = 4;
// خطة التنفيذ
const PLAN = [
    { id: "day", icon: CalendarDays },
    { id: "week", icon: Settings },
    { id: "phase", icon: BriefcaseBusiness },
];
// مرفقات مقدم الخدمة
const FILES = [
    { id: "f1", size: "2.8 MB" },
    { id: "f2", size: "1.2 MB" },
    { id: "f3", size: "3.1 MB" },
    { id: "f4", size: "980 KB" },
    { id: "f5", size: "1.5 MB" },
];
// مراجعو الطلب بالمؤسسة
const REVIEWERS = ["r1", "r2", "r3"];
// مراحل الطلب: استلام ← مراجعتكم ← قراركم
const STEPS = ["received", "review", "decision"];

const card = "rounded-2xl border border-[#DDDDDD] bg-white";

/** مراحل الطلب: الأيقونة جنب النص، والمراحل بينها خطوط */
function RequestSteps({ current }) {
    const { t } = useTranslation("institutionDashboard");
    return (
        <ol className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {STEPS.map((key, i) => {
                const state = i < current ? "done" : i === current ? "current" : "upcoming";
                return (
                    <React.Fragment key={key}>
                        {i > 0 && (
                            <span
                                aria-hidden="true"
                                className={`mx-6 hidden h-[2px] flex-1 rounded-full sm:block ${i <= current ? "bg-[#16A34A]" : "bg-[#E2E8F0]"}`}
                            />
                        )}
                        <li className="flex shrink-0 items-center gap-2.5">
                            <span
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${state === "done"
                                    ? "bg-[#16A34A] text-white ring-4 ring-[#16A34A]/15"
                                    : state === "current"
                                        ? "bg-[#5DA5D5] text-white ring-4 ring-[#5DA5D5]/25"
                                        : "border-2 border-white bg-[#F1F5F9] text-[#94A3B8] ring-1 ring-[#E2E8F0]"
                                    }`}
                            >
                                {state === "done" ? <Check size={14} strokeWidth={3} /> : i + 1}
                            </span>
                            <span>
                                <span
                                    className={`block text-[11px] font-bold ${state === "current" ? "text-[#5DA5D5]" : state === "done" ? "text-[#334155]" : "text-[#94A3B8]"}`}
                                >
                                    {t(`startRequest.steps.${key}.title`)}
                                </span>
                                <span className="mt-0.5 block text-[10px] text-[#94A3B8]">{t(`startRequest.steps.${key}.note`)}</span>
                            </span>
                        </li>
                    </React.Fragment>
                );
            })}
        </ol>
    );
}

/** عنوان قسم مرقّم (01، 02...) + عنصر على الطرف */
function SectionTitle({ number, title, children }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2.5 text-[15px] font-bold text-[#1E293B]">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EEF5FC] text-[11px] font-bold text-[#3D8BC9]">{number}</span>
                {title}
            </h2>
            {children}
        </div>
    );
}

// بنود طلب الاستكمال ومهلته
const REQUEST_ITEMS = ["certificates", "replaceWorker", "startDate", "schedule", "equipment", "safety"];
const REQUEST_DEADLINES = ["24h", "48h", "3d", "week"];

/** نافذة "طلب استكمال المتطلبات" — النواقص اللي لازم فريق التنفيذ يكملها */
function RequestModal({ code, title, provider, startDate, onClose, onSend }) {
    const { t } = useTranslation("institutionDashboard");
    const m = "startRequest.requestModal";
    const [items, setItems] = useState([]);
    const [notes, setNotes] = useState("");
    const [deadline, setDeadline] = useState("48h");
    const valid = items.length > 0 && notes.trim();

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const toggle = (id) => setItems((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
    const field =
        "w-full rounded-xl border border-[#DDDDDD] bg-white px-4 text-[13px] text-[#1E293B] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#4B9AD2]";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div aria-hidden="true" onClick={onClose} className="dim-backdrop absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" />
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="request-title"
                onSubmit={(e) => {
                    e.preventDefault();
                    // ⚠️ محلي لحد ما يصير في endpoint
                    if (valid) onSend({ items, notes: notes.trim(), deadline });
                }}
                className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[640px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.25)]"
            >
                {/* الرأس */}
                <div className="flex items-center gap-4 border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FEF2F2] text-[#DC2626]">
                        <PencilLine size={19} strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-bold text-[#3D8BC9]">
                            {t("startRequest.approveModal.label")} · <bdi dir="ltr">{code}</bdi>
                        </p>
                        <h2 id="request-title" className="mt-0.5 text-[18px] font-semibold text-[#1E293B]">
                            {t(`${m}.title`)}
                        </h2>
                        <p className="mt-0.5 text-[12px] text-[#64748B]">{t(`${m}.subtitle`)}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t("startRequest.approveModal.close")}
                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#64748B] transition-colors hover:bg-[#F1F5F9]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* المحتوى */}
                <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5 [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent]">
                    {/* المشروع */}
                    <div className="flex items-center gap-3 rounded-xl border border-[#D6E6F5] bg-[#F3F8FD] p-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E3EFFA] text-[#3D8BC9]">
                            <Building2 size={20} strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] text-[#94A3B8]">{t("startRequest.approveModal.project")}</p>
                            <p className="mt-0.5 truncate text-[13px] font-bold text-[#1E293B]">{title}</p>
                            <p className="mt-0.5 text-[12px] text-[#64748B]">
                                {t("startRequest.approveModal.projectMeta", { provider, date: startDate })}
                            </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-[#FFF7D6] px-3 py-1 text-[11px] font-semibold text-[#9A7400]">
                            {t("startRequest.approveModal.pending")}
                        </span>
                    </div>

                    {/* المتطلبات */}
                    <fieldset>
                        <legend className="mb-2.5 text-[13px] font-bold text-[#1E293B]">{t(`${m}.itemsTitle`)}</legend>
                        <div className="flex flex-col gap-2">
                            {REQUEST_ITEMS.map((id) => {
                                const on = items.includes(id);
                                return (
                                    <label
                                        key={id}
                                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${on ? "border-[#F5B5B5] bg-[#FEF7F7]" : "border-[#E2E8F0] hover:bg-[#F8FAFC]"}`}
                                    >
                                        <input
                                            type="checkbox"
                                            name="request_items"
                                            value={id}
                                            checked={on}
                                            onChange={() => toggle(id)}
                                            className="peer sr-only"
                                        />
                                        <span
                                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#DC2626]/30 ${on ? "border-[#DC2626] bg-[#DC2626] text-white" : "border-[#CBD5E1] bg-white"}`}
                                        >
                                            {on && <Check size={13} strokeWidth={3} />}
                                        </span>
                                        <span className={`text-[13px] ${on ? "font-semibold text-[#1E293B]" : "text-[#475569]"}`}>
                                            {t(`${m}.items.${id}`)}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </fieldset>

                    <label className="block">
                        <span className="mb-2 block text-[13px] font-medium text-[#1E293B]">
                            {t(`${m}.notes`)} <span className="text-[#D64545]">*</span>
                        </span>
                        <textarea
                            name="request_notes"
                            required
                            rows={3}
                            maxLength={1000}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t(`${m}.notesPlaceholder`)}
                            className={`${field} resize-none py-3 leading-[1.8]`}
                        />
                        <span className="mt-1.5 block text-[11px] text-[#94A3B8]">{t(`${m}.notesHint`)}</span>
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-[13px] font-medium text-[#1E293B]">{t(`${m}.deadline`)}</span>
                        <span className="relative block">
                            <select
                                name="request_deadline"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className={`${field} h-11 cursor-pointer appearance-none pe-10`}
                            >
                                {REQUEST_DEADLINES.map((key) => (
                                    <option key={key} value={key}>
                                        {t(`${m}.deadlines.${key}`)}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={18} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[#334155]" />
                        </span>
                    </label>
                </div>

                {/* الأزرار */}
                <div className="flex justify-end gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 min-w-[100px] cursor-pointer rounded-xl border border-[#DDDDDD] bg-white px-6 text-[14px] font-medium text-[#334155] transition-colors hover:bg-[#F1F5F9]"
                    >
                        {t("startRequest.approveModal.cancel")}
                    </button>
                    <button
                        type="submit"
                        disabled={!valid}
                        className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#DC2626] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:bg-[#DCE6EF] disabled:text-[#94A3B8]"
                    >
                        <PencilLine size={16} />
                        {t(`${m}.send`)}
                    </button>
                </div>
            </form>
        </div>
    );
}

/** مراجعة طلب بدء التنفيذ (من "عرض الطلب" بتفاصيل المشروع) */
export default function InstitutionStartRequest() {
    const { t } = useTranslation("institutionDashboard");
    const navigate = useNavigate();
    // حالة قائمة التحقق من صفحة المشروع (أو الافتراضية إذا فتحت الصفحة مباشرة)
    const { state: navState } = useLocation();
    const checks = navState?.checks || defaultStartChecks();
    const remaining = Object.values(checks).filter((x) => !x).length;
    const allDone = remaining === 0;
    const { projectId } = useParams();
    const project = allProjects().find((p) => p.id === projectId);
    const sr = "startRequest";

    // ⚠️ المراجعة والملاحظة والقرار بالصفحة بس لحد ما يصير في endpoint
    const [reviewer, setReviewer] = useState("r1");
    const [changingReviewer, setChangingReviewer] = useState(false);
    const [note, setNote] = useState("");
    const [showTeam, setShowTeam] = useState(false);
    const [requesting, setRequesting] = useState(false);
    const [flash, setFlash] = useState("");
    const [approving, setApproving] = useState(false);

    if (!project) {
        return (
            <div className={`${card} mx-auto max-w-[1100px] p-10 text-center`}>
                <p className="text-[15px] font-bold text-[#334155]">{t("projectView.notFound")}</p>
                <Link to={`${BASE}/projects`} className="mt-4 inline-block text-[13px] text-[#4B9AD2] hover:underline">
                    {t("projectView.back")}
                </Link>
            </div>
        );
    }

    const provider = projectProvider(project, t);
    const title = projectTitle(project, t);
    const projectPath = `${BASE}/projects/${project.id}`;
    const requestCode = `REQ-START-2025-${String(14 + Math.max(0, PROJECTS.indexOf(project))).padStart(3, "0")}`;
    const team = showTeam ? TEAM : TEAM.slice(0, TEAM_PREVIEW);
    const reviewerName = t(`${sr}.reviewer.people.${reviewer}`);

    const say = (text) => {
        setFlash(text);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-3">
            <Link to={projectPath} state={{ checks }} className="inline-flex w-fit items-center gap-1 text-[12px] font-medium text-[#4B9AD2] hover:underline">
                <ChevronLeft size={14} className="rtl:rotate-180" />
                {t(`${sr}.back`)}
            </Link>

            {/* الرأس */}
            <section className={`${card} flex flex-col gap-4 px-5 py-6 shadow-[0_4px_16px_rgba(35,74,100,0.06)] sm:flex-row sm:items-center sm:justify-between sm:px-6`}>
                <div className="flex items-center gap-4">
                    <span className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[#3D8BC9]">
                        <FileText size={26} strokeWidth={1.7} />
                    </span>
                    <div className="min-w-0">
                        {/* bdi بدل dir على الفقرة كلها، عشان الرقم ينحاذى مع بداية العنوان مش ينزاح للنص */}
                        <p className="font-mono text-[11px] text-[#94A3B8]">
                            <bdi dir="ltr">{requestCode}</bdi>
                        </p>
                        <h1 className="mt-1 text-[23px] font-medium leading-[1.4] text-[#1E293B]">{t(`${sr}.title`)}</h1>
                        <p className="mt-1 text-[12px] text-[#64748B]">{t(`${sr}.subtitle`, { project: title })}</p>
                    </div>
                </div>
                <div className="shrink-0 border-[#E2E8F0] sm:min-w-[130px] sm:border-s sm:ps-5">
                    <p className="text-[10px] text-[#94A3B8]">{t(`${sr}.receivedAt`)}</p>
                    <p className="mt-1.5 text-[12px] font-bold text-[#1E293B]">{t(`${sr}.receivedDate`)}</p>
                    <p className="mt-0.5 text-[10px] text-[#64748B]">{t(`${sr}.receivedTime`)}</p>
                </div>
            </section>

            {flash && (
                <p role="status" className="rounded-xl border border-[#A7E8CF] bg-[#ECFDF5] px-4 py-3 text-[13px] text-[#059669]">
                    {flash}
                </p>
            )}

            {/* مراحل الطلب */}
            <section className={`${card} px-5 py-3 sm:px-10`}>
                <RequestSteps current={1} />
            </section>

            {/* الملخص */}
            <ul className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                {STATS.map(({ key, icon: Icon, tone }) => (
                    <li key={key} className={`${card} flex items-center gap-3 px-4 py-4`}>
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                            <Icon size={18} strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0">
                            <p className="text-[10px] text-[#94A3B8]">{t(`${sr}.stats.${key}.label`)}</p>
                            <p className="mt-1 text-[14px] font-bold text-[#1E293B]">{t(`${sr}.stats.${key}.value`)}</p>
                            <p className="mt-1 text-[10px] text-[#94A3B8]">{t(`${sr}.stats.${key}.note`)}</p>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
                {/* العمود الرئيسي */}
                <div className="flex min-w-0 flex-col gap-5">
                    {/* 01 بيانات الطلب الوارد */}
                    <section className={`${card} p-5 sm:p-6`}>
                        <SectionTitle number="01" title={t(`${sr}.info.title`)}>
                            <span className="flex items-center gap-1 rounded-full bg-[#DCFCE7] px-3 py-1 text-[11px] font-semibold text-[#16A34A]">
                                <Check size={12} strokeWidth={3} />
                                {t(`${sr}.info.complete`)}
                            </span>
                        </SectionTitle>

                        <dl className="mt-5 grid overflow-hidden rounded-2xl border border-[#E2E8F0] sm:grid-cols-2">
                            {INFO.map((key, i) => (
                                <div
                                    key={key}
                                    className={`p-4 ${i % 2 === 1 ? "sm:border-s sm:border-[#E2E8F0]" : ""} ${i >= 2 ? "border-t border-[#E2E8F0]" : i === 1 ? "border-t border-[#E2E8F0] sm:border-t-0" : ""}`}
                                >
                                    <dt className="text-[11px] text-[#94A3B8]">{t(`${sr}.info.items.${key}.label`)}</dt>
                                    {/* الرقم: bdi عشان ترتيب أرقامه يضل صح، والسطر نفسه بمحاذاة باقي الكلام (يمين) */}
                                    <dd className="mt-1.5 text-[14px] font-bold text-[#1E293B]">
                                        {key === "contact" ? (
                                            <bdi dir="ltr">{t(`${sr}.info.items.${key}.value`, { provider })}</bdi>
                                        ) : (
                                            t(`${sr}.info.items.${key}.value`, { provider })
                                        )}
                                    </dd>
                                    <dd className="mt-0.5 text-[11px] text-[#94A3B8]">{t(`${sr}.info.items.${key}.note`)}</dd>
                                </div>
                            ))}
                        </dl>

                        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#EEF5FC] p-4">
                            <MessageSquareText size={18} className="mt-0.5 shrink-0 text-[#4B9AD2]" />
                            <div>
                                <p className="text-[13px] font-bold text-[#1E293B]">{t(`${sr}.info.messageTitle`)}</p>
                                <p className="mt-1 text-[12px] leading-[1.9] text-[#475569]">{t(`${sr}.info.message`)}</p>
                            </div>
                        </div>
                    </section>

                    {/* 02 فريق التنفيذ */}
                    <section className={`${card} p-5 sm:p-6`}>
                        <SectionTitle number="02" title={t(`${sr}.team.title`)}>
                            <a href="#request-files" className="text-[12px] font-semibold text-[#4B9AD2] hover:underline">
                                {t(`${sr}.team.files`)}
                            </a>
                        </SectionTitle>

                        <div className="mt-5 overflow-x-auto rounded-2xl border border-[#E2E8F0]">
                            <table className="w-full min-w-[520px] text-start text-[12px]">
                                <thead className="bg-[#F8FAFC] text-[11px] text-[#64748B]">
                                    <tr>
                                        {["name", "specialty", "experience", "verification"].map((k) => (
                                            <th key={k} scope="col" className="px-4 py-3 text-start font-medium">
                                                {t(`${sr}.team.cols.${k}`)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E2E8F0]">
                                    {team.map(({ id, years }) => {
                                        const name = t(`${sr}.team.members.${id}.name`);
                                        const initials = name.split(" ").map((w) => w.charAt(0)).slice(0, 2).join("");
                                        return (
                                            <tr key={id}>
                                                <td className="px-4 py-3">
                                                    <span className="flex items-center gap-2.5">
                                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF5FC] text-[11px] font-semibold text-[#3D8BC9]">
                                                            {initials}
                                                        </span>
                                                        <span className="font-bold text-[#1E293B]">{name}</span>
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-[#475569]">{t(`${sr}.team.members.${id}.role`)}</td>
                                                <td className="px-4 py-3 text-[#475569] tabular-nums">{t(`${sr}.team.years`, { count: years })}</td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center gap-1 font-medium text-[#16A34A]">
                                                        <Check size={13} strokeWidth={2.5} />
                                                        {t(`${sr}.team.verified`)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowTeam((x) => !x)}
                            className="mx-auto mt-4 flex cursor-pointer items-center gap-1.5 text-[12px] font-semibold text-[#4B9AD2] hover:underline"
                        >
                            {showTeam ? t(`${sr}.team.less`) : t(`${sr}.team.more`, { count: TEAM.length - TEAM_PREVIEW })}
                            {!showTeam && <ArrowLeft size={14} className="ltr:rotate-180" />}
                        </button>
                    </section>

                    {/* 03 خطة التنفيذ */}
                    <section className={`${card} p-5 sm:p-6`}>
                        <SectionTitle number="03" title={t(`${sr}.plan.title`)}>
                            <span className="rounded-full bg-[#EEF5FC] px-3 py-1 text-[11px] font-semibold text-[#3D8BC9]">{t(`${sr}.plan.badge`)}</span>
                        </SectionTitle>
                        <ol className="mt-5 flex flex-col gap-3 md:flex-row md:items-stretch md:gap-0">
                            {PLAN.map(({ id, icon: Icon }, i) => (
                                <React.Fragment key={id}>
                                    {i > 0 && <span aria-hidden="true" className="hidden h-px w-6 shrink-0 self-center bg-[#C7E0F1] md:block" />}
                                    <li className="flex flex-1 items-start gap-3 rounded-2xl border border-[#E2E8F0] p-4">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FC] text-[#3D8BC9]">
                                            <Icon size={17} strokeWidth={1.8} />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-[11px] text-[#94A3B8]">{t(`${sr}.plan.items.${id}.when`)}</span>
                                            <span className="mt-0.5 block text-[13px] font-bold leading-[1.6] text-[#1E293B]">{t(`${sr}.plan.items.${id}.title`)}</span>
                                            <span className="mt-1 block text-[11px] text-[#64748B] tabular-nums">{t(`${sr}.plan.items.${id}.date`)}</span>
                                        </span>
                                    </li>
                                </React.Fragment>
                            ))}
                        </ol>
                    </section>

                    {/* 04 المرفقات والإقرارات */}
                    <section id="request-files" className={`${card} scroll-mt-24 p-5 sm:p-6`}>
                        <SectionTitle number="04" title={t(`${sr}.files.title`)}>
                            <span className="rounded-full bg-[#DCFCE7] px-3 py-1 text-[11px] font-semibold text-[#16A34A] tabular-nums">
                                {t(`${sr}.files.complete`, { count: FILES.length, total: FILES.length })}
                            </span>
                        </SectionTitle>
                        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                            {FILES.map(({ id, size }) => (
                                <li key={id} className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FC] text-[#3D8BC9]">
                                        <FileText size={18} strokeWidth={1.7} />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block truncate text-[12px] font-bold text-[#1E293B]">{t(`${sr}.files.items.${id}`)}</span>
                                        <span className="mt-0.5 block text-[11px] text-[#94A3B8]">
                                            {t(`${sr}.files.verified`)} · <bdi dir="ltr">{size}</bdi>
                                        </span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#ECFDF5] p-4">
                            <Check size={18} strokeWidth={2.5} className="mt-0.5 shrink-0 text-[#16A34A]" />
                            <div>
                                <p className="text-[13px] font-bold text-[#166534]">{t(`${sr}.files.declarationTitle`)}</p>
                                <p className="mt-1 text-[12px] leading-[1.8] text-[#15803D]">{t(`${sr}.files.declaration`)}</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* العمود الجانبي: المراجع ← ملاحظة للفريق */}
                <aside className="flex flex-col gap-4">
                    <section className={`${card} p-5`}>
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-[14px] font-bold text-[#1E293B]">{t(`${sr}.reviewer.title`)}</h2>
                            <button
                                type="button"
                                onClick={() => setChangingReviewer((x) => !x)}
                                aria-expanded={changingReviewer}
                                className="cursor-pointer text-[12px] font-semibold text-[#4B9AD2] hover:underline"
                            >
                                {t(`${sr}.reviewer.change`)}
                            </button>
                        </div>
                        {changingReviewer ? (
                            <ul className="mt-3 flex flex-col gap-1">
                                {REVIEWERS.map((id) => (
                                    <li key={id}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setReviewer(id);
                                                setChangingReviewer(false);
                                            }}
                                            className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-start text-[12px] hover:bg-[#F3F8FD] ${reviewer === id ? "font-semibold text-[#3D8BC9]" : "text-[#334155]"}`}
                                        >
                                            {t(`${sr}.reviewer.people.${id}`)}
                                            {reviewer === id && <Check size={14} />}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="mt-3 flex items-center gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FC] text-[12px] font-bold text-[#3D8BC9]">
                                    {reviewerName.replace(/^م\.\s*/, "").split(" ").map((w) => w.charAt(0)).slice(0, 2).join("")}
                                </span>
                                <span>
                                    <span className="block text-[13px] font-bold text-[#1E293B]">{reviewerName}</span>
                                    <span className="block text-[11px] text-[#94A3B8]">{t(`${sr}.reviewer.role`)}</span>
                                </span>
                            </div>
                        )}
                        <p className="mt-4 flex items-center gap-1.5 border-t border-[#E2E8F0] pt-3 text-[12px] font-medium text-[#D97706]">
                            <Clock size={14} />
                            {t(`${sr}.reviewer.deadline`)}
                        </p>
                    </section>

                    <section className={`${card} p-5`}>
                        <h2 className="text-[14px] font-bold text-[#1E293B]">{t(`${sr}.note.title`)}</h2>
                        <textarea name="note"
                            rows={4}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            aria-label={t(`${sr}.note.title`)}
                            placeholder={t(`${sr}.note.placeholder`)}
                            className="mt-3 w-full resize-none rounded-xl border border-[#DDDDDD] px-3 py-2.5 text-[12px] leading-[1.8] text-[#334155] outline-none placeholder:text-[#94A3B8] focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]"
                        />
                        <button
                            type="button"
                            disabled={!note.trim()}
                            onClick={() => {
                                setNote("");
                                say(t(`${sr}.note.saved`));
                            }}
                            className="mt-3 h-10 w-full cursor-pointer rounded-xl bg-[#4B9AD2] text-[13px] font-semibold text-white btn-wipe disabled:cursor-not-allowed disabled:bg-[#E2E8F0] disabled:text-[#94A3B8]"
                        >
                            {t(`${sr}.note.save`)}
                        </button>
                    </section>
                </aside>
            </div>

            {/* القرار — مفصول بمسافة عن باقي الصفحة */}
            <section className={`${card} mt-6 p-5`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FC] text-[#3D8BC9]">
                            <Building2 size={20} strokeWidth={1.8} />
                        </span>
                        <div>
                            <p className="text-[14px] font-bold text-[#1E293B]">{t(`${sr}.decision.title`)}</p>
                            <p className="mt-0.5 text-[12px] text-[#64748B]">
                                {allDone ? t(`${sr}.decision.ready`) : t(`${sr}.decision.remaining`, { count: remaining })}
                                {!allDone && (
                                    <>
                                        {" "}
                                        <Link
                                            to={`${projectPath}#project-checklist`}
                                            state={{ checks }}
                                            className="font-semibold text-[#4B9AD2] hover:underline"
                                        >
                                            {t(`${sr}.decision.completeChecklist`)}
                                        </Link>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        <button
                            type="button"
                            onClick={() => setRequesting(true)}
                            aria-haspopup="dialog"
                            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#FEF2F2] px-4 text-[13px] font-medium text-[#DC2626] transition-colors hover:bg-[#FEE2E2]"
                        >
                            <PencilLine size={16} />
                            {t(`${sr}.decision.request`)}
                        </button>
                        <button
                            type="button"
                            disabled={!allDone}
                            title={allDone ? undefined : t(`${sr}.decision.disabledHint`)}
                            onClick={() => setApproving(true)}
                            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#4B9AD2] px-5 text-[13px] font-bold text-white btn-wipe disabled:cursor-not-allowed disabled:bg-[#E2E8F0] disabled:text-[#94A3B8]"
                        >
                            <Check size={16} strokeWidth={2.5} />
                            {t(`${sr}.decision.approve`)}
                        </button>
                    </div>
                </div>
            </section>

            {requesting && (
                <RequestModal
                    code={requestCode}
                    title={title}
                    provider={provider}
                    startDate={t(`${sr}.stats.start.value`)}
                    onClose={() => setRequesting(false)}
                    onSend={() => {
                        setRequesting(false);
                        say(t(`${sr}.decision.requested`, { provider }));
                    }}
                />
            )}

            {approving && (
                <StartApproveModal
                    code={requestCode}
                    title={title}
                    provider={provider}
                    startDate={t(`${sr}.stats.start.value`)}
                    remaining={remaining}
                    onClose={() => setApproving(false)}
                    onApprove={() => navigate(projectPath, { state: { startApproved: true, checks } })}
                />
            )}
        </div>
    );
}
