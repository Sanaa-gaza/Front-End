import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Building2,
    Check,
    ChevronDown,
    ChevronLeft,
    CircleCheck,
    CircleHelp,
    Clock,
    Eye,
    MessageSquareText,
    Plus,
    X,
} from "lucide-react";
import { PROJECTS } from "./projectsData";

const BASE = "/dashboard/institution";

// ===== بيانات تجريبية =====
// ⚠️ ما في endpoints لتفاصيل المشروع (طلب بدء التنفيذ، قائمة التحقق، الموعد) لسا.
// لما تجهز، استبدلي هالقيم بطلبات من src/api/endpoints.js — النصوص بملف الترجمة: projectView
const CHECKLIST = [
    { id: "team", done: true },
    { id: "site", done: true },
    { id: "plan", done: true },
    { id: "materials", done: false },
    { id: "kickoff", done: false },
];
// موعد التنفيذ المقترح
const PROPOSED_START = "2026-05-20T08:00";
const DURATION_DAYS = 102;

// مراحل المشروع: قبول العروض ← بدء التنفيذ ← قيد التنفيذ ← تسليم المشروع
const STAGES = ["accepted", "start", "executing", "delivery"];

const card = "rounded-[20px] border border-[#DDDDDD] bg-white";

// شارة حالة المشروع بالرأس
const STATUS_BADGES = {
    executing: "bg-[#DDF6E3] text-[#10B981]",
    pending: "bg-[#FFF4E5] text-[#D97706]",
    completed: "bg-[#F1F5F9] text-[#64748B]",
};

/** مراحل المشروع: المنتهية خضرا، الحالية زرقا، والجاية رمادية فاتحة */
function Stepper({ current }) {
    const { t } = useTranslation("institutionDashboard");
    const v = "projectView.stages";
    return (
        // --half: نص عرض المرحلة (الخط بيبدأ وبينتهي بنص الدوائر)
        <ol className="relative flex items-start justify-between [--half:36px] sm:[--half:65px]">
            {/* الخط الواصل: رمادي، والجزء لحد المرحلة الحالية أخضر */}
            <span aria-hidden="true" className="absolute inset-x-[var(--half)] top-[17px] h-[3px] rounded-full bg-[#F1F5F9]" />
            <span
                aria-hidden="true"
                className="absolute start-[var(--half)] top-[17px] h-[3px] rounded-full bg-[#10B981]"
                style={{ width: `calc((100% - var(--half) * 2) * ${current / (STAGES.length - 1)})` }}
            />
            {STAGES.map((key, i) => {
                const state = i < current ? "done" : i === current ? "current" : "upcoming";
                return (
                    <li key={key} className="relative z-10 flex w-[72px] flex-col items-center text-center sm:w-[130px]">
                        <span
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold ${state === "done"
                                ? "bg-[#10B981] text-white ring-4 ring-[#10B981]/15"
                                : state === "current"
                                    ? "bg-[#5DA5D5] text-white ring-4 ring-[#5DA5D5]/25"
                                    : "border-2 border-white bg-[#F1F5F9] text-[#94A3B8] ring-1 ring-[#E2E8F0]"
                                }`}
                        >
                            {state === "done" ? <Check size={17} strokeWidth={3} /> : state === "current" ? <Clock size={17} /> : i + 1}
                        </span>
                        <span
                            className={`mt-3 text-[13px] font-bold ${state === "current" ? "text-[#5DA5D5]" : state === "done" ? "text-[#334155]" : "text-[#94A3B8]"}`}
                        >
                            {t(`${v}.${key}.title`)}
                        </span>
                        <span
                            className={`mt-1 text-[10px] ${state === "done"
                                ? "text-[#10B981]"
                                : state === "current"
                                    ? "rounded-full border border-[#5DA5D5]/30 bg-[#5DA5D5]/10 px-2.5 py-0.5 font-medium text-[#5DA5D5]"
                                    : "text-[#CBD5E1]"
                                }`}
                        >
                            {state === "current" ? t(`${v}.waiting`) : t(`${v}.${key}.note`)}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}

// عناصر "طلب تحديث التنفيذ" (المحدد افتراضياً: الأربع الأوائل)
const UPDATE_ITEMS = ["progress", "done", "photos", "remaining", "risks", "schedule"];
const UPDATE_DEFAULTS = ["progress", "done", "photos", "remaining"];
const DEADLINES = ["24h", "48h", "3d", "week"];
const PRIORITIES = ["normal", "important", "urgent"];

/** نافذة "طلب تحديث التنفيذ": المؤسسة بتطلب من المقاول آخر المستجدات (عناصر التحديث + التفاصيل + المهلة والأولوية) */
function UpdateModal({ project, onClose, onSend }) {
    const { t } = useTranslation("institutionDashboard");
    const u = "projectView.updateModal";
    const [items, setItems] = useState(UPDATE_DEFAULTS);
    const [details, setDetails] = useState(() => t(`${u}.detailsDefault`));
    const [deadline, setDeadline] = useState("48h");
    const [priority, setPriority] = useState("normal");
    const [errors, setErrors] = useState({});
    const closeRef = useRef(null);

    // Escape بيسكر النافذة + منع سكرول الصفحة وراها
    useEffect(() => {
        closeRef.current?.focus();
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [onClose]);

    const toggle = (key) => {
        setItems((list) => (list.includes(key) ? list.filter((x) => x !== key) : [...list, key]));
        setErrors((e) => ({ ...e, items: "" }));
    };

    const select =
        "h-11 w-full cursor-pointer appearance-none rounded-xl border border-[#DDDDDD] bg-white pe-10 ps-4 text-[13px] text-[#334155] outline-none focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";
    const label = "mb-1.5 block text-[13px] font-bold text-[#1E293B]";

    return (
        <div
            className="fixed inset-0 z-[60] overflow-y-auto bg-[#0F172A]/40 px-4 py-8 backdrop-blur-[2px]"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="pv-update-title"
                noValidate
                onSubmit={(e) => {
                    e.preventDefault();
                    const next = {};
                    if (!items.length) next.items = t(`${u}.itemsRequired`);
                    if (!details.trim()) next.details = t(`${u}.required`);
                    setErrors(next);
                    if (Object.keys(next).length) return;
                    onSend({ items, details: details.trim(), deadline, priority });
                }}
                className="mx-auto w-full max-w-[600px] overflow-hidden rounded-[22px] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.25)]"
            >
                {/* العنوان */}
                <div className="relative border-b border-[#DDDDDD] px-6 pb-5 pt-6">
                    <p className="text-[11px] font-semibold text-[#4B9AD2]">{t(`${u}.eyebrow`)}</p>
                    <h2 id="pv-update-title" className="mt-1 text-[21px] font-bold text-[#1E293B]">{t(`${u}.title`)}</h2>
                    <p className="mt-1 text-[12px] text-[#64748B]">{t(`${u}.subtitle`)}</p>
                    <button
                        ref={closeRef}
                        type="button"
                        onClick={onClose}
                        aria-label={t(`${u}.close`)}
                        className="absolute end-4 top-5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#334155]"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex flex-col gap-5 px-6 py-5">
                    {/* المشروع والمستلم */}
                    <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FC] text-[#3D8BC9]">
                                <Building2 size={21} strokeWidth={1.7} />
                            </span>
                            <div className="min-w-0">
                                <p className="text-[10px] text-[#94A3B8]">
                                    {t(`${u}.project`)} · <bdi dir="ltr">{project.code}</bdi>
                                </p>
                                <p className="truncate text-[15px] font-bold text-[#1E293B]">{project.title}</p>
                            </div>
                        </div>
                        <p className="mt-3 text-[11px] text-[#334155]">
                            <span className="text-[#94A3B8]">{t(`${u}.to`)}</span> {t(`${u}.recipient`, { provider: project.provider })}
                        </p>
                    </div>

                    {/* عناصر التحديث */}
                    <fieldset>
                        <div className="flex items-baseline justify-between gap-3">
                            <legend className="text-[14px] font-bold text-[#1E293B]">{t(`${u}.itemsTitle`)}</legend>
                            <span className="text-[11px] font-semibold text-[#4B9AD2] tabular-nums">{t(`${u}.selected`, { count: items.length })}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-[#94A3B8]">{t(`${u}.itemsDesc`)}</p>
                        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                            {UPDATE_ITEMS.map((key) => {
                                const on = items.includes(key);
                                return (
                                    <label
                                        key={key}
                                        className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 text-[12px] transition-colors ${on ? "border-[#C7E0F1] bg-[#EEF5FC] font-semibold text-[#22455E]" : "border-[#DDDDDD] bg-white text-[#334155] hover:border-[#8EC0E4]"
                                            }`}
                                    >
                                        <input type="checkbox" checked={on} onChange={() => toggle(key)} className="peer sr-only" />
                                        <span
                                            aria-hidden="true"
                                            className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-[#4B9AD2] ${on ? "border-[#4B9AD2] bg-[#4B9AD2] text-white" : "border-[#CBD5E1] bg-white"
                                                }`}
                                        >
                                            {on && <Check size={12} strokeWidth={3} />}
                                        </span>
                                        {t(`${u}.items.${key}`)}
                                    </label>
                                );
                            })}
                        </div>
                        {errors.items && <p className="mt-1.5 text-[11px] text-red-500">{errors.items}</p>}
                    </fieldset>

                    {/* التفاصيل */}
                    <div>
                        <label htmlFor="pv-update-details" className={label}>{t(`${u}.details`)}</label>
                        <textarea
                            id="pv-update-details"
                            rows={3}
                            value={details}
                            onChange={(e) => {
                                setDetails(e.target.value);
                                setErrors((er) => ({ ...er, details: "" }));
                            }}
                            aria-invalid={!!errors.details}
                            className="w-full resize-none rounded-xl border border-[#DDDDDD] px-4 py-3 text-[12px] leading-[1.9] text-[#334155] outline-none focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2] aria-[invalid=true]:border-red-400"
                        />
                        {errors.details && <p className="mt-1 text-[11px] text-red-500">{errors.details}</p>}
                    </div>

                    {/* المهلة والأولوية */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="pv-update-deadline" className={label}>{t(`${u}.deadline`)}</label>
                            <div className="relative">
                                <select id="pv-update-deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={select}>
                                    {DEADLINES.map((k) => (
                                        <option key={k} value={k}>{t(`${u}.deadlines.${k}`)}</option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="pv-update-priority" className={label}>{t(`${u}.priority`)}</label>
                            <div className="relative">
                                <select id="pv-update-priority" value={priority} onChange={(e) => setPriority(e.target.value)} className={select}>
                                    {PRIORITIES.map((k) => (
                                        <option key={k} value={k}>{t(`${u}.priorities.${k}`)}</option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                            </div>
                        </div>
                    </div>

                    <p className="rounded-xl bg-[#F1F5F9] px-4 py-3 text-[11px] text-[#64748B]">{t(`${u}.note`)}</p>
                </div>

                {/* الأزرار */}
                <div className="flex justify-end gap-3 border-t border-[#DDDDDD] bg-[#F8FAFC] px-6 py-4">
                    <button
                        type="submit"
                        className="h-11 min-w-[150px] cursor-pointer rounded-xl bg-[#4B9AD2] px-6 text-[13px] font-semibold text-white btn-wipe"
                    >
                        {t(`${u}.send`)}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 min-w-[90px] cursor-pointer rounded-xl border border-[#DDDDDD] bg-white px-5 text-[13px] font-semibold text-[#334155] transition-colors hover:bg-[#F8FAFC]"
                    >
                        {t(`${u}.cancel`)}
                    </button>
                </div>
            </form>
        </div>
    );
}

/** تفاصيل مشروع جاري (من "فتح" بالمشاريع الجارية): طلب اعتماد بدء التنفيذ + قائمة التحقق + موعد التنفيذ */
export default function InstitutionProjectDetails() {
    const { t, i18n } = useTranslation("institutionDashboard");
    const { projectId } = useParams();
    const project = PROJECTS.find((p) => p.id === projectId);
    const locale = `${i18n.language}-u-nu-latn`;
    const v = "projectView";

    // ⚠️ كل الإجراءات بالصفحة بس لحد ما تجهز الـ endpoints
    const [checks, setChecks] = useState(() => Object.fromEntries(CHECKLIST.map((c) => [c.id, c.done])));
    // الاعتماد ممكن ييجي من صفحة "مراجعة طلب بدء التنفيذ"
    const { state: navState } = useLocation();
    const [approved, setApproved] = useState(() => Boolean(navState?.startApproved));
    const [reportReviewed, setReportReviewed] = useState(false);
    const [requesting, setRequesting] = useState(false);
    const [requestText, setRequestText] = useState("");
    const [updating, setUpdating] = useState(false);
    const [flash, setFlash] = useState("");
    const [editingDate, setEditingDate] = useState(false);
    const [start, setStart] = useState(PROPOSED_START);
    const [draftStart, setDraftStart] = useState(PROPOSED_START);

    if (!project) {
        return (
            <div className={`${card} mx-auto max-w-[1100px] p-10 text-center`}>
                <p className="text-[15px] font-bold text-[#334155]">{t(`${v}.notFound`)}</p>
                <Link to={`${BASE}/projects`} className="mt-4 inline-block text-[13px] text-[#4B9AD2] hover:underline">
                    {t(`${v}.back`)}
                </Link>
            </div>
        );
    }

    const s = `projectsPage.sample.${project.id}`;
    const provider = t(`${s}.provider`);
    const code = `PRJ-2025-${String(14 + PROJECTS.indexOf(project)).padStart(3, "0")}`;
    const doneCount = Object.values(checks).filter(Boolean).length;
    const percent = Math.round((doneCount / CHECKLIST.length) * 100);
    const allDone = doneCount === CHECKLIST.length;
    // بعد الاعتماد: المرحلة الحالية "قيد التنفيذ"
    const stage = approved ? 2 : 1;

    const startDate = new Date(start);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + DURATION_DAYS);
    const fmtDay = (d) => d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });

    const say = (text) => {
        setFlash(text);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-5">
            <Link to={`${BASE}/projects`} className="inline-flex w-fit items-center gap-1 text-[12px] font-medium text-[#4B9AD2] hover:underline">
                <ChevronLeft size={14} className="rtl:rotate-180" />
                {t(`${v}.back`)}
            </Link>

            {/* رأس المشروع */}
            <section className={`${card} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6`}>
                <div className="flex items-center gap-4">
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[#3D8BC9]">
                        <Building2 size={28} strokeWidth={1.7} />
                    </span>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_BADGES[project.status]}`}>
                                {t(`projectsPage.status.${project.status}`)}
                            </span>
                            <span className="font-mono text-[11px] text-[#94A3B8]" dir="ltr">
                                {code}
                            </span>
                        </div>
                        <h1 className="mt-2 text-[24px] font-semibold leading-[1.4] text-[#1E293B]">{t(`${s}.title`)}</h1>
                        <p className="mt-1 text-[12px] text-[#64748B]">{t(`${v}.subtitle`)}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setUpdating(true)}
                    className="inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-[#3D8BC9] px-7 text-[14px] font-semibold text-white shadow-[0_8px_18px_rgba(61,139,201,0.3)] btn-wipe"
                >
                    <Plus size={17} />
                    {t(`${v}.requestUpdate`)}
                </button>
            </section>

            {flash && (
                <p role="status" className="rounded-xl border border-[#A7E8CF] bg-[#ECFDF5] px-4 py-3 text-[13px] text-[#059669]">
                    {flash}
                </p>
            )}

            {/* التقرير الأسبوعي */}
            {reportReviewed ? (
                <section className="flex items-center gap-3 rounded-[20px] border border-[#A7E8CF] bg-[#ECFDF5] px-5 py-4 text-[#059669]">
                    <CircleCheck size={18} className="shrink-0" />
                    <p className="text-[13px] font-semibold">{t(`${v}.report.reviewed`)}</p>
                </section>
            ) : (
                <section className="flex flex-col gap-3 rounded-[20px] border border-[#F6D58E] bg-[#FFF9E8] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3.5">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDEFC3] text-[#D97706]">
                            <Clock size={19} />
                        </span>
                        <div>
                            <p className="text-[13px] font-bold text-[#1E293B]">{t(`${v}.report.title`)}</p>
                            <p className="mt-1 text-[11px] text-[#B7791F]">{t(`${v}.report.desc`)}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setReportReviewed(true)}
                        className="h-10 shrink-0 cursor-pointer rounded-xl border border-[#E8C547] bg-white px-5 text-[12px] font-semibold text-[#9A7400] transition-colors hover:bg-[#FFFBEB]"
                    >
                        {t(`${v}.report.review`)}
                    </button>
                </section>
            )}

            {/* المراحل */}
            <section className={`${card} px-3 py-5 sm:py-6`}>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-2 px-2 sm:px-3">
                    <h2 className="text-[12px] font-semibold text-[#94A3B8]">{t(`${v}.stagesTitle`)}</h2>
                    <p className="text-[12px] text-[#334155]">{t(`${v}.currentStage.${approved ? "executing" : "start"}`)}</p>
                </div>
                <Stepper current={stage} />
            </section>

            <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
                {/* العمود الجانبي: موعد التنفيذ */}
                <aside className="flex flex-col gap-4">
                    <section className={`${card} p-4`}>
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-[13px] font-bold text-[#22455E]">{t(`${v}.schedule.title`)}</h2>
                            {!editingDate && !approved && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDraftStart(start);
                                        setEditingDate(true);
                                    }}
                                    className="cursor-pointer text-[12px] font-semibold text-[#4B9AD2] hover:underline"
                                >
                                    {t(`${v}.schedule.edit`)}
                                </button>
                            )}
                        </div>

                        {editingDate ? (
                            <div className="mt-3 flex flex-col gap-2">
                                <input
                                    type="datetime-local"
                                    value={draftStart}
                                    onChange={(e) => setDraftStart(e.target.value)}
                                    aria-label={t(`${v}.schedule.title`)}
                                    className="h-10 rounded-xl border border-[#DDDDDD] px-3 text-[12px] text-[#334155] outline-none focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]"
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (draftStart) setStart(draftStart);
                                            setEditingDate(false);
                                        }}
                                        className="h-9 flex-1 cursor-pointer rounded-lg bg-[#4B9AD2] text-[12px] font-semibold text-white btn-wipe"
                                    >
                                        {t(`${v}.schedule.save`)}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingDate(false)}
                                        className="h-9 flex-1 cursor-pointer rounded-lg border border-[#DDDDDD] text-[12px] text-[#334155] hover:bg-[#F8FAFC]"
                                    >
                                        {t(`${v}.schedule.cancel`)}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-3 flex items-center gap-3 rounded-xl bg-[#EEF5FC] px-4 py-3">
                                <span className="text-[30px] font-bold leading-none text-[#3D8BC9] tabular-nums">{startDate.getDate()}</span>
                                <span className="text-[11px] leading-[1.7] text-[#334155]">
                                    <span className="block font-semibold">{startDate.toLocaleDateString(locale, { month: "long", year: "numeric" })}</span>
                                    {startDate.toLocaleDateString(locale, { weekday: "long" })} ·{" "}
                                    {startDate.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" })}
                                </span>
                            </div>
                        )}

                        <dl className="mt-3 flex flex-col gap-2.5 text-[12px]">
                            {[
                                { key: "requester", value: provider },
                                { key: "duration", value: t(`${v}.schedule.days`, { count: DURATION_DAYS }) },
                                { key: "delivery", value: fmtDay(endDate) },
                            ].map((row) => (
                                <div key={row.key} className="flex items-center justify-between gap-3">
                                    <dt className="text-[#94A3B8]">{t(`${v}.schedule.${row.key}`)}</dt>
                                    <dd className="text-end font-semibold text-[#334155] tabular-nums">{row.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                </aside>

                {/* طلب اعتماد بدء التنفيذ + قائمة التحقق */}
                <section className={`${card} p-5 sm:p-6`}>
                    <div className="flex flex-col gap-3 rounded-2xl border border-[#C7E0F1] bg-[#F3F8FD] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                        <div className="flex items-start gap-3.5">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#DCEBFA] text-[15px] font-bold text-[#3D8BC9]">
                                {provider.trim().charAt(0)}
                            </span>
                            <div>
                                <p className="flex items-center gap-2 text-[12px] font-bold text-[#4B9AD2]">
                                    <span className="h-2 w-2 rounded-full bg-[#4B9AD2]" aria-hidden="true" />
                                    {t(`${v}.request.label`)}
                                </p>
                                <p className="mt-1.5 text-[13px] font-bold text-[#1E293B]">{t(`${v}.request.title`)}</p>
                                <p className="mt-1 text-[12px] leading-[1.8] text-[#475569]">{t(`${v}.request.desc`, { provider })}</p>
                            </div>
                        </div>
                        <Link
                            to={`${BASE}/projects/${project.id}/start-request`}
                            className="inline-flex h-10 w-fit shrink-0 items-center gap-2 rounded-xl bg-white px-4 text-[12px] text-[#475569] transition-colors hover:text-[#4B9AD2]"
                        >
                            <Eye size={16} className="text-[#4B9AD2]" />
                            {t(`${v}.request.view`)}
                        </Link>
                    </div>

                    <div id="project-checklist" className="mt-6 flex scroll-mt-24 flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="flex items-center gap-1.5 text-[12px] text-[#64748B]">
                                <Building2 size={14} strokeWidth={1.8} />
                                {t(`${v}.checklist.label`)}
                            </p>
                            <h2 className="mt-1.5 text-[18px] font-medium text-[#1E293B]">{t(`${v}.checklist.title`)}</h2>
                            <p className="mt-1 text-[12px] text-[#94A3B8]">{t(`${v}.checklist.desc`)}</p>
                        </div>
                        <span className="rounded-lg bg-[#EEF5FC] px-3 py-1.5 text-[12px] font-medium text-[#3D8BC9] tabular-nums">
                            {t(`${v}.checklist.count`, { done: doneCount, total: CHECKLIST.length })}
                        </span>
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                        <div
                            className="h-2 flex-1 overflow-hidden rounded-full bg-[#F1F5F9]"
                            role="progressbar"
                            aria-valuenow={percent}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={t(`${v}.checklist.title`)}
                        >
                            <div className="h-full rounded-full bg-[#4B9AD2] transition-all duration-300" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="shrink-0 text-[12px] font-bold text-[#4B9AD2] tabular-nums">{percent}%</span>
                    </div>

                    <ul className="mt-5 flex flex-col gap-3 sm:px-4">
                        {CHECKLIST.map(({ id }) => {
                            const on = checks[id];
                            return (
                                <li key={id}>
                                    <label
                                        className={`flex cursor-pointer items-center gap-3.5 rounded-2xl border border-[#DDDDDD] bg-white px-5 py-4 transition-colors ${approved ? "cursor-default" : "hover:border-[#8EC0E4]"}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={on}
                                            disabled={approved}
                                            onChange={() => setChecks((c) => ({ ...c, [id]: !c[id] }))}
                                            className="peer sr-only"
                                        />
                                        <span
                                            aria-hidden="true"
                                            className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#4B9AD2] ${on ? "border-[#10B981] bg-[#10B981] text-white" : "border-[#CBD5E1] bg-white"
                                                }`}
                                        >
                                            {on && <Check size={15} strokeWidth={3} />}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-[14px] font-bold text-[#1E293B]">{t(`${v}.checklist.items.${id}`)}</span>
                                            <span className="mt-1 block text-[12px] text-[#94A3B8]">
                                                {t(`${v}.checklist.${on ? "verified" : "pending"}`)}
                                            </span>
                                        </span>
                                        {!on && (
                                            <span className="shrink-0 pe-4 text-[13px] font-medium text-[#D97706]">
                                                {t(`${v}.checklist.required`)}
                                            </span>
                                        )}
                                    </label>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#EEF5FC] px-5 pb-8 pt-5">
                        <CircleHelp size={20} className="mt-0.5 shrink-0 text-[#4B9AD2]" />
                        <div>
                            <p className="text-[14px] font-bold text-[#1E293B]">{t(`${v}.decision.title`)}</p>
                            <p className="mt-1 text-[12px] leading-[1.8] text-[#475569]">{t(`${v}.decision.desc`)}</p>
                        </div>
                    </div>

                    {/* طلب استكمال: ملاحظة لفريق التنفيذ */}
                    {requesting && (
                        <div className="mt-4">
                            <textarea
                                rows={3}
                                value={requestText}
                                onChange={(e) => setRequestText(e.target.value)}
                                aria-label={t(`${v}.decision.requestLabel`)}
                                placeholder={t(`${v}.decision.requestPlaceholder`)}
                                className="w-full resize-none rounded-xl border border-[#DDDDDD] px-4 py-3 text-[12px] leading-[1.8] text-[#334155] outline-none placeholder:text-[#94A3B8] focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]"
                            />
                        </div>
                    )}

                    {approved ? (
                        <p className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#ECFDF5] py-3 text-[13px] font-semibold text-[#059669]">
                            <CircleCheck size={17} />
                            {t(`${v}.decision.approvedNote`)}
                        </p>
                    ) : (
                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!requesting) {
                                        setRequesting(true);
                                        return;
                                    }
                                    if (!requestText.trim()) return;
                                    setRequesting(false);
                                    setRequestText("");
                                    say(t(`${v}.decision.requested`, { provider }));
                                }}
                                className="inline-flex h-[52px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#C7E0F1] bg-white text-[14px] text-[#4B9AD2] btn-wipe btn-wipe-outline sm:min-w-0 sm:flex-[0_1_275px]"
                            >
                                <MessageSquareText size={18} />
                                {t(`${v}.decision.${requesting ? "sendRequest" : "request"}`)}
                            </button>
                            <button
                                type="button"
                                disabled={!allDone}
                                title={allDone ? undefined : t(`${v}.decision.disabledHint`)}
                                onClick={() => {
                                    setApproved(true);
                                    setRequesting(false);
                                    say(t(`${v}.decision.approved`));
                                }}
                                className="inline-flex h-[52px] cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-[#4B9AD2] text-[14px] font-bold text-white btn-wipe disabled:cursor-not-allowed disabled:bg-[#E2E8F0] disabled:text-[#94A3B8] sm:min-w-0 sm:flex-[0_1_510px]"
                            >
                                <Check size={18} strokeWidth={2.5} />
                                {t(`${v}.decision.approve`)}
                            </button>
                        </div>
                    )}
                </section>
            </div>

            {updating && (
                <UpdateModal
                    project={{ code, title: t(`${s}.title`), provider }}
                    onClose={() => setUpdating(false)}
                    // ⚠️ الطلب بالصفحة بس لحد ما يصير في endpoint لطلبات التحديث
                    onSend={() => {
                        setUpdating(false);
                        say(t(`${v}.updateModal.sent`, { provider }));
                    }}
                />
            )}
        </div>
    );
}
