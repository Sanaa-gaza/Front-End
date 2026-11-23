import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Bell,
    BriefcaseBusiness,
    CalendarDays,
    ChevronDown,
    Check,
    CircleCheck,
    CirclePause,
    CirclePlay,
    Clock,
    Download,
    Ellipsis,
    FileText,
    Hourglass,
    Inbox,
    Mail,
    MessageSquareText,
    Pencil,
    PencilLine,
    Plus,
    TriangleAlert,
    Users,
    Wallet,
    X,
} from "lucide-react";
import { TENDERS } from "./tendersData";
import DateField from "../../../components/dashboard/DateField";

const BASE = "/dashboard/institution";

// ===== بيانات تجريبية =====
// ⚠️ لما يجهز الباك إند، كل هاد بييجي من GET /tenders/{id}
// deadline: آخر موعد لاستقبال العروض (منه بنحسب العداد بالبانر)
const DETAILS = {
    r1: {
        number: "TND-2025-041",
        publishedAt: "2026-11-08",
        deadline: "2026-11-22T17:00:00",
        offers: 12,
        budget: 150000,
        durationDays: 102,
        startWithinDays: 7,
        bidBond: 5,
        views: 284,
        saves: 31,
        inquiries: 9,
        officer: 0,
    },
    r2: { deadline: "2026-11-21T12:00:00", offers: 5 },
    r3: { deadline: "2026-11-23T12:00:00", offers: 3 },
};
const DEFAULT_DETAILS = {
    publishedAt: "2026-10-20",
    deadline: "2026-11-10T17:00:00",
    offers: 8,
    budget: 90000,
    durationDays: 60,
    startWithinDays: 10,
    bidBond: 5,
    views: 120,
    saves: 14,
    inquiries: 4,
    officer: 0,
};

const STATUS_BADGES = {
    open: "bg-[#DDF6E3] text-[#2EAF4E]",
    paused: "bg-[#FFF7D6] text-[#9A7400]",
    draft: "bg-[#F1F5F9] text-[#64748B]",
    executing: "bg-[#E3EFFA] text-[#3D8BC9]",
    completed: "bg-[#DDF6E3] text-[#2EAF4E]",
    cancelled: "bg-[#FDE7E7] text-[#D64545]",
};

const STATS = [
    { key: "offers", icon: Users, tone: "bg-[#E3EFFA] text-[#3D8BC9]" },
    { key: "deadline", icon: CalendarDays, tone: "bg-[#DDF6E3] text-[#10B981]" },
    { key: "duration", icon: Clock, tone: "bg-[#FFF7D6] text-[#C99A00]" },
    { key: "budget", icon: Wallet, tone: "bg-[#F1EAFB] text-[#8B5CF6]" },
];

const TABS = ["overview", "requirements", "activity"];

// أيقونة كل نوع حدث بسجل النشاط
const ACTIVITY_ICONS = { offer: Inbox, clarify: MessageSquareText, deadline: CalendarDays, publish: Check, edit: Pencil };

const card = "rounded-[20px] border border-[#DDDDDD] bg-white";

/** الوقت الباقي لحد الموعد: { days, hours } أو null إذا خلص */
function timeLeft(deadline) {
    const ms = new Date(deadline) - Date.now();
    if (ms <= 0) return null;
    const totalHours = Math.floor(ms / 3600000);
    return { days: Math.floor(totalHours / 24), hours: totalHours % 24 };
}

/** نافذة منبثقة بسيطة — بتسكر بزر X أو Esc أو الضغط برا */
function Modal({ title, onClose, children }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div aria-hidden="true" onClick={onClose} className="dim-backdrop absolute inset-0 bg-[#0F172A]/40" />
            <div role="dialog" aria-modal="true" aria-label={title} className="relative w-full max-w-[480px] rounded-[20px] bg-white p-6 shadow-[0_18px_50px_rgba(35,74,100,0.18)]">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <h2 className="text-[17px] font-bold text-[#1E293B]">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="close"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#64748B] transition-colors hover:bg-[#F1F5F9]"
                    >
                        <X size={18} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

const MESSAGE_MAX = 1000;
const CHANNELS = [
    { key: "platform", icon: Bell },
    { key: "email", icon: MessageSquareText },
];

/** نافذة "رسالة للمتقدمين" — رسالة موحدة لكل مقدمي العروض */
function NotifyModal({ number, title, applicants, onClose, onSent }) {
    const { t } = useTranslation("institutionDashboard");
    const [subject, setSubject] = useState(() => t("tenderManage.notify.defaultSubject", { title }));
    const [body, setBody] = useState("");
    const [channels, setChannels] = useState({ platform: true, email: true });
    const valid = subject.trim() && body.trim() && (channels.platform || channels.email);

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const field =
        "w-full rounded-xl border border-[#DDDDDD] bg-white px-4 text-[13px] text-[#1E293B] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#4B9AD2]";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div aria-hidden="true" onClick={onClose} className="dim-backdrop absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" />
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="notify-title"
                onSubmit={(e) => {
                    e.preventDefault();
                    // ⚠️ محلي لحد ما يصير في endpoint
                    if (valid) onSent();
                }}
                className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[640px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.25)]"
            >
                {/* الرأس */}
                <div className="flex items-center gap-4 border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E3EFFA] text-[#3D8BC9]">
                        <MessageSquareText size={20} strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0 flex-1">
                        {/* الرقم بمحاذاة العنوان (بداية السطر)، وbdi بس عشان ترتيب حروفه */}
                        <p className="text-[12px] font-bold text-[#3D8BC9]"><bdi dir="ltr">{number}</bdi></p>
                        <h2 id="notify-title" className="mt-0.5 text-[18px] font-semibold text-[#1E293B]">
                            {t("tenderManage.notify.title")}
                        </h2>
                        <p className="mt-0.5 text-[12px] text-[#64748B]">{t("tenderManage.notify.subtitle")}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t("tenderManage.notify.close")}
                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#64748B] transition-colors hover:bg-[#F1F5F9]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* المحتوى */}
                <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5 [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent]">
                    {/* المستلمون */}
                    <div className="flex items-center gap-3 rounded-xl border border-[#D6E6F5] bg-[#F3F8FD] p-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E3EFFA] text-[#3D8BC9]">
                            <Users size={20} strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] text-[#94A3B8]">{t("tenderManage.notify.recipients")}</p>
                            <p className="mt-0.5 text-[13px] font-bold text-[#1E293B]">
                                {t("tenderManage.notify.allApplicants", { count: applicants })}
                            </p>
                            <p className="mt-0.5 text-[12px] text-[#64748B]">{t("tenderManage.notify.hidden")}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-[#E3EFFA] px-3 py-1 text-[11px] font-semibold text-[#3D8BC9]">
                            {t("tenderManage.notify.bulk")}
                        </span>
                    </div>

                    <label className="block">
                        <span className="mb-2 block text-[13px] font-medium text-[#1E293B]">
                            {t("tenderManage.notify.subject")} <span className="text-[#D64545]">*</span>
                        </span>
                        <input
                            name="subject"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className={`${field} h-11`}
                        />
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-[13px] font-medium text-[#1E293B]">
                            {t("tenderManage.notify.body")} <span className="text-[#D64545]">*</span>
                        </span>
                        <textarea
                            name="message"
                            required
                            autoFocus
                            rows={4}
                            maxLength={MESSAGE_MAX}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder={t("tenderManage.notify.bodyPlaceholder")}
                            className={`${field} resize-none py-3 leading-[1.8]`}
                        />
                        <span className="mt-1.5 block text-[11px] text-[#94A3B8] tabular-nums">
                            {t("tenderManage.notify.counter", { count: body.length, max: MESSAGE_MAX })}
                        </span>
                    </label>

                    <fieldset>
                        <legend className="mb-2 text-[13px] font-bold text-[#1E293B]">{t("tenderManage.notify.method")}</legend>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {CHANNELS.map(({ key, icon: Icon }) => {
                                const on = channels[key];
                                return (
                                    <label
                                        key={key}
                                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${on ? "border-[#8EC0E4] bg-[#F3F8FD]" : "border-[#DDDDDD] hover:bg-[#F8FAFC]"}`}
                                    >
                                        <input
                                            type="checkbox"
                                            name="channels"
                                            value={key}
                                            checked={on}
                                            onChange={() => setChannels((c) => ({ ...c, [key]: !c[key] }))}
                                            className="peer sr-only"
                                        />
                                        <span
                                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#4B9AD2]/40 ${on ? "border-[#4B9AD2] bg-[#4B9AD2] text-white" : "border-[#CBD5E1] bg-white"}`}
                                        >
                                            {on && <Check size={13} strokeWidth={3} />}
                                        </span>
                                        <span className="min-w-0">
                                            <span className="flex items-center gap-1.5 text-[13px] font-bold text-[#1E293B]">
                                                {t(`tenderManage.notify.channels.${key}.title`)}
                                                <Icon size={15} className="text-[#64748B]" />
                                            </span>
                                            <span className="mt-1 block text-[11px] text-[#64748B]">
                                                {t(`tenderManage.notify.channels.${key}.desc`)}
                                            </span>
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </fieldset>
                </div>

                {/* الأزرار */}
                <div className="flex justify-end gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 min-w-[100px] cursor-pointer rounded-xl border border-[#DDDDDD] bg-white px-6 text-[14px] font-medium text-[#334155] transition-colors hover:bg-[#F1F5F9]"
                    >
                        {t("tenderManage.cancel")}
                    </button>
                    <button
                        type="submit"
                        disabled={!valid}
                        className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#4B9AD2] px-5 text-[14px] font-semibold text-white btn-wipe disabled:cursor-not-allowed disabled:bg-[#DCE6EF] disabled:text-[#94A3B8]"
                    >
                        <MessageSquareText size={16} />
                        {t("tenderManage.notify.send")}
                    </button>
                </div>
            </form>
        </div>
    );
}

const CLARIFY_CATEGORIES = ["technical", "schedule", "financial", "documents", "other"];

/** نافذة "إضافة توضيح للعطاء" — توضيح علني بيظهر لكل المتقدمين وبينضاف لسجل النشاط */
function ClarifyModal({ number, title, onClose, onPublish }) {
    const { t } = useTranslation("institutionDashboard");
    const [category, setCategory] = useState("technical");
    const [heading, setHeading] = useState("");
    const [body, setBody] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const valid = heading.trim() && body.trim() && confirmed;

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const field =
        "w-full rounded-xl border border-[#DDDDDD] bg-white px-4 text-[13px] text-[#1E293B] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#4B9AD2]";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div aria-hidden="true" onClick={onClose} className="dim-backdrop absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" />
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="clarify-title"
                onSubmit={(e) => {
                    e.preventDefault();
                    // ⚠️ محلي لحد ما يصير في endpoint
                    if (valid) onPublish({ category, heading: heading.trim() });
                }}
                className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[640px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.25)]"
            >
                {/* الرأس */}
                <div className="flex items-center gap-4 border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E3EFFA] text-[#3D8BC9]">
                        <Plus size={20} strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                        {/* الرقم بمحاذاة العنوان (بداية السطر)، وbdi بس عشان ترتيب حروفه */}
                        <p className="text-[12px] font-bold text-[#3D8BC9]"><bdi dir="ltr">{number}</bdi></p>
                        <h2 id="clarify-title" className="mt-0.5 text-[18px] font-semibold text-[#1E293B]">
                            {t("tenderManage.clarify.title")}
                        </h2>
                        <p className="mt-0.5 text-[12px] text-[#64748B]">{t("tenderManage.clarify.subtitle")}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t("tenderManage.notify.close")}
                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#64748B] transition-colors hover:bg-[#F1F5F9]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* المحتوى */}
                <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5 [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent]">
                    {/* وين رح ينشر */}
                    <div className="flex items-center gap-3 rounded-xl border border-[#D6E6F5] bg-[#F3F8FD] p-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E3EFFA] text-[#3D8BC9]">
                            <FileText size={20} strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] text-[#94A3B8]">{t("tenderManage.clarify.publishedIn")}</p>
                            <p className="mt-0.5 truncate text-[13px] font-bold text-[#1E293B]">{title}</p>
                            <p className="mt-0.5 text-[12px] text-[#64748B]">{t("tenderManage.clarify.notice")}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-[#FFF7D6] px-3 py-1 text-[11px] font-semibold text-[#9A7400]">
                            {t("tenderManage.clarify.public")}
                        </span>
                    </div>

                    <label className="block">
                        <span className="mb-2 block text-[13px] font-medium text-[#1E293B]">{t("tenderManage.clarify.category")}</span>
                        <span className="relative block">
                            <select
                                name="clarification_category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className={`${field} h-11 cursor-pointer appearance-none pe-10`}
                            >
                                {CLARIFY_CATEGORIES.map((key) => (
                                    <option key={key} value={key}>
                                        {t(`tenderManage.clarify.categories.${key}`)}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={18} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[#334155]" />
                        </span>
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-[13px] font-medium text-[#1E293B]">
                            {t("tenderManage.clarify.heading")} <span className="text-[#D64545]">*</span>
                        </span>
                        <input
                            name="clarification_title"
                            required
                            autoFocus
                            value={heading}
                            onChange={(e) => setHeading(e.target.value)}
                            placeholder={t("tenderManage.clarify.headingPlaceholder")}
                            className={`${field} h-11`}
                        />
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-[13px] font-medium text-[#1E293B]">
                            {t("tenderManage.clarify.body")} <span className="text-[#D64545]">*</span>
                        </span>
                        <textarea
                            name="clarification_body"
                            required
                            rows={4}
                            maxLength={MESSAGE_MAX}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder={t("tenderManage.clarify.bodyPlaceholder")}
                            className={`${field} resize-none py-3 leading-[1.8]`}
                        />
                        <span className="mt-1.5 block text-[11px] text-[#94A3B8] tabular-nums">
                            {t("tenderManage.notify.counter", { count: body.length, max: MESSAGE_MAX })}
                        </span>
                    </label>

                    {/* معاينة: بتتحدث مع الكتابة */}
                    <div className="rounded-xl border-s-[3px] border-[#4B9AD2] bg-[#F8FAFC] px-4 py-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#94A3B8]">
                            <span>{t("tenderManage.clarify.preview")}</span>
                            <span>
                                {t(`tenderManage.clarify.categories.${category}`)} · {t("tenderManage.clarify.now")}
                            </span>
                        </div>
                        <p className="mt-2 break-words text-[13px] font-bold text-[#1E293B]">
                            {heading.trim() || t("tenderManage.clarify.previewHeading")}
                        </p>
                        <p className="mt-1 whitespace-pre-line break-words text-[12px] leading-[1.8] text-[#475569]">
                            {body.trim() || t("tenderManage.clarify.previewBody")}
                        </p>
                    </div>

                    {/* تأكيد النشر */}
                    <label
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${confirmed ? "border-[#8EC0E4] bg-[#F3F8FD]" : "border-[#DDDDDD] hover:bg-[#F8FAFC]"}`}
                    >
                        <input
                            type="checkbox"
                            name="confirm_publish"
                            checked={confirmed}
                            onChange={(e) => setConfirmed(e.target.checked)}
                            className="peer sr-only"
                        />
                        <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#4B9AD2]/40 ${confirmed ? "border-[#4B9AD2] bg-[#4B9AD2] text-white" : "border-[#CBD5E1] bg-white"}`}
                        >
                            {confirmed && <Check size={13} strokeWidth={3} />}
                        </span>
                        <span className="min-w-0">
                            <span className="block text-[13px] font-bold text-[#1E293B]">{t("tenderManage.clarify.confirm")}</span>
                            <span className="mt-1 block text-[11px] text-[#64748B]">{t("tenderManage.clarify.confirmDesc")}</span>
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
                        {t("tenderManage.cancel")}
                    </button>
                    <button
                        type="submit"
                        disabled={!valid}
                        className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#4B9AD2] px-5 text-[14px] font-semibold text-white btn-wipe disabled:cursor-not-allowed disabled:bg-[#DCE6EF] disabled:text-[#94A3B8]"
                    >
                        <Check size={16} strokeWidth={2.5} />
                        {t("tenderManage.clarify.publish")}
                    </button>
                </div>
            </form>
        </div>
    );
}

// YYYY-MM-DD بالتوقيت المحلي (لحقل type=date)
const toInputDate = (d) => {
    const x = new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};

/**
 * نافذة "تعديل العطاء": العنوان والميزانية والموعد النهائي + سبب التعديل.
 * بتنفتح من "تعديل العطاء" بالقائمة، ومن زر "تمديد الموعد" (والتركيز على حقل الموعد).
 */
function EditModal({ number, initial, focus, onClose, onSave }) {
    const { t } = useTranslation("institutionDashboard");
    const current = new Date(initial.deadline);
    const [title, setTitle] = useState(initial.title);
    const [budget, setBudget] = useState(String(initial.budget));
    const [date, setDate] = useState(() => toInputDate(current));
    const [reason, setReason] = useState("");

    // الموعد الجديد بنفس ساعة الإغلاق القديمة
    const picked = date
        ? new Date(`${date}T${String(current.getHours()).padStart(2, "0")}:${String(current.getMinutes()).padStart(2, "0")}:00`)
        : null;
    const budgetNum = Number(budget);
    const valid = title.trim() && budgetNum > 0 && picked && picked > new Date();

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const field =
        "w-full rounded-xl border border-[#DDDDDD] bg-white px-4 text-[13px] text-[#1E293B] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#4B9AD2]";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div aria-hidden="true" onClick={onClose} className="dim-backdrop absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" />
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-title"
                onSubmit={(e) => {
                    e.preventDefault();
                    // ⚠️ محلي لحد ما يصير في endpoint
                    if (valid) onSave({ title: title.trim(), budget: budgetNum, deadline: picked.toISOString(), reason: reason.trim() });
                }}
                className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[640px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.25)]"
            >
                {/* الرأس */}
                <div className="flex items-center gap-4 border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E3EFFA] text-[#3D8BC9]">
                        <Pencil size={19} strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-bold text-[#3D8BC9]"><bdi dir="ltr">{number}</bdi></p>
                        <h2 id="edit-title" className="mt-0.5 text-[18px] font-semibold text-[#1E293B]">
                            {t("tenderManage.edit.title")}
                        </h2>
                        <p className="mt-0.5 text-[12px] text-[#64748B]">{t("tenderManage.edit.subtitle")}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t("tenderManage.notify.close")}
                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#64748B] transition-colors hover:bg-[#F1F5F9]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* المحتوى */}
                <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5 [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent]">
                    <label className="block">
                        <span className="mb-2 block text-[13px] font-medium text-[#1E293B]">{t("tenderManage.edit.name")}</span>
                        <input
                            name="title"
                            required
                            autoFocus={focus !== "deadline"}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={`${field} h-11`}
                        />
                    </label>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-2 block text-[13px] font-medium text-[#1E293B]">{t("tenderManage.edit.budget")}</span>
                            <span className="relative block">
                                <input
                                    name="budget"
                                    type="number"
                                    inputMode="numeric"
                                    min={1}
                                    required
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    className={`${field} h-11 pe-10 tabular-nums`}
                                />
                                <span className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-[13px] text-[#94A3B8]">
                                    {t("tenderManage.edit.currency")}
                                </span>
                            </span>
                        </label>
                        <div>
                            <label htmlFor="edit-deadline" className="mb-2 block text-[13px] font-medium text-[#1E293B]">
                                {t("tenderManage.edit.deadline")}
                            </label>
                            {/* نفس تقويم الموقع؛ portal عشان ما ينقص جوا سكرول النافذة */}
                            <DateField
                                id="edit-deadline"
                                portal
                                autoFocus={focus === "deadline"}
                                value={date}
                                onChange={setDate}
                                min={toInputDate(new Date())}
                                placeholder={t("tenderManage.edit.deadline")}
                                invalid={!date}
                            />
                            <input type="hidden" name="deadline" value={date} />
                        </div>
                    </div>

                    <label className="block">
                        <span className="mb-2 block text-[13px] font-medium text-[#1E293B]">{t("tenderManage.edit.reason")}</span>
                        <textarea
                            name="edit_reason"
                            rows={4}
                            maxLength={MESSAGE_MAX}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={t("tenderManage.edit.reasonPlaceholder")}
                            className={`${field} resize-none py-3 leading-[1.8]`}
                        />
                    </label>

                    {/* اللي ما بينفع يتعدل */}
                    <p className="flex items-start gap-2.5 rounded-xl border border-[#F3D66B] bg-[#FFF7D6] px-4 py-3 text-[12px] leading-[1.8] text-[#9A7400]">
                        <TriangleAlert size={17} className="mt-0.5 shrink-0" />
                        {t("tenderManage.edit.locked")}
                    </p>
                </div>

                {/* الأزرار */}
                <div className="flex justify-end gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 min-w-[100px] cursor-pointer rounded-xl border border-[#DDDDDD] bg-white px-6 text-[14px] font-medium text-[#334155] transition-colors hover:bg-[#F1F5F9]"
                    >
                        {t("tenderManage.cancel")}
                    </button>
                    <button
                        type="submit"
                        disabled={!valid}
                        className="h-11 min-w-[120px] cursor-pointer rounded-xl bg-[#4B9AD2] px-6 text-[14px] font-semibold text-white btn-wipe disabled:cursor-not-allowed disabled:bg-[#DCE6EF] disabled:text-[#94A3B8]"
                    >
                        {t("tenderManage.edit.save")}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function InstitutionTenderDetails() {
    const { t, i18n } = useTranslation("institutionDashboard");
    const { tenderId } = useParams();
    const tender = TENDERS.find((x) => x.id === tenderId);
    const locale = `${i18n.language}-u-nu-latn`;

    const [tab, setTab] = useState("overview");
    const [menuOpen, setMenuOpen] = useState(false);
    // ⚠️ الإيقاف المؤقت محلي لحد ما يصير في endpoint
    const [paused, setPaused] = useState(false);
    // notify | clarify | officer | null
    const [modal, setModal] = useState(null);
    const [toast, setToast] = useState("");
    // ⚠️ أحداث انضافت من الصفحة (توضيحات) — بتنعرض فوق سجل النشاط
    const [newActivity, setNewActivity] = useState([]);
    // ⚠️ تعديلات العطاء محلية لحد ما يصير في endpoint
    const [edits, setEdits] = useState({});
    const [details, setDetails] = useState(() => ({ ...DEFAULT_DETAILS, ...DETAILS[tenderId] }));
    const [officer, setOfficer] = useState(details.officer);
    const [pickedOfficer, setPickedOfficer] = useState(details.officer);

    // قائمة الإجراءات: Esc بيسكرها
    useEffect(() => {
        if (!menuOpen) return undefined;
        const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [menuOpen]);

    useEffect(() => {
        if (!toast) return undefined;
        const id = setTimeout(() => setToast(""), 3000);
        return () => clearTimeout(id);
    }, [toast]);

    if (!tender) {
        return (
            <div className={`${card} mx-auto max-w-[1100px] p-10 text-center`}>
                <p className="text-[15px] font-bold text-[#334155]">{t("tenderManage.notFound")}</p>
                <Link to={`${BASE}/tenders`} className="mt-4 inline-block text-[13px] text-[#4B9AD2] hover:underline">
                    {t("tenderManage.back")}
                </Link>
            </div>
        );
    }

    const index = TENDERS.indexOf(tender);
    const number = details.number || `TND-2025-${String(42 + index).padStart(3, "0")}`;
    const base = `tendersPage.sample.${tender.id}`;
    const title = edits.title || t(`${base}.title`);
    const category = t(`${base}.category`);
    const area = t(`${base}.area`);
    const sample = `tenderManage.sample.${tender.id}`;
    const description = t(`${sample}.desc`, { returnObjects: true, defaultValue: "" });
    const paragraphs = Array.isArray(description) && description.length ? description : [t("tenderManage.genericDesc", { title, area })];
    const scope = t("tenderManage.overview.scope", { returnObjects: true });
    const people = t("tenderManage.officer.people", { returnObjects: true });
    const person = people[officer] || people[0];

    const status = tender.status === "open" && paused ? "paused" : tender.status;
    const isLive = tender.status === "open";
    const left = timeLeft(details.deadline);
    const offers = tender.status === "draft" ? 0 : details.offers;

    const fmtDate = (d) => new Date(d).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
    const duration = (l) => {
        const d = t("tenderManage.days", { count: l.days });
        const h = t("tenderManage.hours", { count: l.hours });
        if (!l.days) return h;
        if (!l.hours) return d;
        return t("tenderManage.and", { a: d, b: h });
    };

    const statValue = {
        offers: { value: t("tenderManage.offersCount", { count: offers }), sub: t("tenderManage.stats.offers.sub") },
        deadline: {
            value: fmtDate(details.deadline),
            sub: left && isLive ? duration(left) : t("tenderManage.stats.deadline.ended"),
        },
        duration: {
            value: t("tenderManage.days", { count: details.durationDays }),
            sub: t("tenderManage.stats.duration.sub", { count: details.startWithinDays }),
        },
        budget: {
            value: t("tenderManage.stats.budget.value", { value: details.budget.toLocaleString("en-US") }),
            sub: t("tenderManage.stats.budget.sub"),
        },
    };

    const execRows = [
        { key: "category", value: category },
        { key: "location", value: area },
        { key: "duration", value: t("tenderManage.days", { count: details.durationDays }) },
        // آخر خانة بتاخد عرض السطر كامل
        { key: "bidBond", value: t("tenderManage.overview.bidBondValue", { value: details.bidBond }), full: true },
    ];

    // حالة النشر بالعمود الجانبي
    const publishState =
        status === "open"
            ? { label: t("tenderManage.publish.published"), sub: t("tenderManage.publish.since", { date: fmtDate(details.publishedAt) }), tone: "border-[#BFEBCD] bg-[#E8F8EE] text-[#10B981]", icon: CircleCheck }
            : status === "paused"
                ? { label: t("tenderManage.publish.paused"), sub: t("tenderManage.publish.pausedSub"), tone: "border-[#F3D66B] bg-[#FFF7D6] text-[#9A7400]", icon: CirclePause }
                : status === "draft"
                    ? { label: t("tenderManage.publish.draft"), sub: t("tenderManage.publish.draftSub"), tone: "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]", icon: FileText }
                    : { label: t("tenderManage.publish.closed"), sub: t("tenderManage.publish.closedSub"), tone: "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]", icon: CircleCheck };

    const closeModal = () => {
        setModal(null);
    };

    const togglePause = () => {
        setPaused((p) => !p);
        setToast(t(paused ? "tenderManage.toastResumed" : "tenderManage.toastPaused"));
        setMenuOpen(false);
    };

    // ⚠️ ملخص نصي محلي لحد ما يصير في endpoint بيطلع PDF
    const downloadSummary = () => {
        const lines = [
            title,
            number,
            "",
            `${t("tenderManage.overview.exec.category")}: ${category}`,
            `${t("tenderManage.overview.exec.location")}: ${area}`,
            `${t("tenderManage.stats.deadline.label")}: ${statValue.deadline.value}`,
            `${t("tenderManage.stats.offers.label")}: ${statValue.offers.value}`,
            `${t("tenderManage.stats.budget.label")}: ${statValue.budget.value}`,
            `${t("tenderManage.stats.duration.label")}: ${statValue.duration.value}`,
            "",
            ...paragraphs,
            "",
            `${t("tenderManage.overview.scopeTitle")}:`,
            ...scope.map((s) => `- ${s}`),
        ];
        const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = `${number}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        setToast(t("tenderManage.quick.downloaded"));
    };

    const quickActions = [
        { key: "notify", icon: Bell, onClick: () => setModal("notify"), disabled: !isLive },
        { key: "clarify", icon: Plus, onClick: () => setModal("clarify"), disabled: !isLive },
        { key: "download", icon: Download, onClick: downloadSummary },
    ];

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-4">
            {/* ===== رأس المناقصة ===== */}
            <section className={`${card} flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6`}>
                <div className="flex min-w-0 items-center gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E3EFFA] text-[#3D8BC9]">
                        <FileText size={26} strokeWidth={1.7} />
                    </span>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_BADGES[status]}`}>
                                {t(`tenderManage.status.${status}`)}
                            </span>
                            <bdi dir="ltr" className="text-[12px] font-medium text-[#94A3B8]">
                                {number}
                            </bdi>
                        </div>
                        <h1 className="mt-1.5 text-[22px] font-bold leading-[1.5] text-[#1E293B]">{title}</h1>
                        <p className="mt-0.5 text-[13px] text-[#64748B]">
                            {area} · {category}
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <Link
                        to={`${BASE}/offers`}
                        className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#4B9AD2] px-5 text-[14px] font-semibold text-[#3D8BC9] btn-wipe btn-wipe-outline"
                    >
                        <Users size={17} strokeWidth={1.8} />
                        {t("tenderManage.viewOffers", { count: offers })}
                    </Link>

                    {/* قائمة إجراءات العطاء — الشاشة بتتعتم لما تنفتح */}
                    {(isLive || tender.status === "draft") && (
                        <div className={`relative ${menuOpen ? "z-50" : ""}`}>
                            <button
                                type="button"
                                onClick={() => setMenuOpen((v) => !v)}
                                aria-label={t("tenderManage.more")}
                                aria-expanded={menuOpen}
                                aria-haspopup="menu"
                                className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border transition-colors ${menuOpen ? "border-[#4B9AD2] bg-[#4B9AD2] text-white" : "border-[#DDDDDD] bg-white text-[#475569] hover:bg-[#F8FAFC]"}`}
                            >
                                <Ellipsis size={20} />
                            </button>
                            {menuOpen && (
                                <div
                                    role="menu"
                                    className="absolute end-0 top-full z-50 mt-2 w-[260px] overflow-hidden rounded-2xl border border-[#DDDDDD] bg-white p-2 shadow-[0_18px_50px_rgba(35,74,100,0.18)]"
                                >
                                    <p className="px-3 pb-1.5 pt-2 text-[11px] font-semibold text-[#94A3B8]">{t("tenderManage.menu.title")}</p>
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            setModal("edit");
                                        }}
                                        className="flex w-full cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 text-start transition-colors hover:bg-[#F1F5F9]"
                                    >
                                        <PencilLine size={17} className="mt-0.5 shrink-0 text-[#475569]" />
                                        <span>
                                            <span className="block text-[13px] font-semibold text-[#1E293B]">{t("tenderManage.menu.edit.title")}</span>
                                            <span className="block text-[11px] text-[#64748B]">{t("tenderManage.menu.edit.desc")}</span>
                                        </span>
                                    </button>
                                    {isLive && (
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={togglePause}
                                            className={`flex w-full cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 text-start transition-colors ${paused ? "hover:bg-[#E8F8EE]" : "hover:bg-[#FFF6F6]"}`}
                                        >
                                            {paused ? (
                                                <CirclePlay size={17} className="mt-0.5 shrink-0 text-[#10B981]" />
                                            ) : (
                                                <CirclePause size={17} className="mt-0.5 shrink-0 text-[#D64545]" />
                                            )}
                                            <span>
                                                <span className={`block text-[13px] font-semibold ${paused ? "text-[#10B981]" : "text-[#D64545]"}`}>
                                                    {t(`tenderManage.menu.${paused ? "resume" : "pause"}.title`)}
                                                </span>
                                                <span className="block text-[11px] text-[#64748B]">
                                                    {t(`tenderManage.menu.${paused ? "resume" : "pause"}.desc`)}
                                                </span>
                                            </span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
            {menuOpen && (
                <div aria-hidden="true" onClick={() => setMenuOpen(false)} className="dim-backdrop fixed inset-0 z-40 bg-[#0F172A]/40" />
            )}

            {/* ===== بانر موعد استقبال العروض ===== */}
            {isLive && (
                <section
                    role="status"
                    className={`flex items-start gap-3 rounded-2xl border px-5 py-4 ${paused ? "border-[#E2E8F0] bg-[#F8FAFC]" : "border-[#F3D66B] bg-[#FFF7D6]"}`}
                >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${paused ? "bg-[#E2E8F0] text-[#64748B]" : "bg-[#F9E7A0] text-[#9A7400]"}`}>
                        {paused ? <CirclePause size={18} /> : <Hourglass size={18} />}
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className={`text-[14px] font-bold ${paused ? "text-[#334155]" : "text-[#9A7400]"}`}>
                            {paused
                                ? t("tenderManage.banner.pausedTitle")
                                : left
                                    ? t("tenderManage.banner.title", { time: duration(left) })
                                    : t("tenderManage.banner.endedTitle")}
                        </p>
                        <p className={`mt-1 text-[12px] ${paused ? "text-[#64748B]" : "text-[#9A7400]/80"}`}>
                            {paused
                                ? t("tenderManage.banner.pausedDesc")
                                : t(left ? "tenderManage.banner.desc" : "tenderManage.banner.endedDesc", { offers: t("tenderManage.offersCount", { count: offers }) })}
                        </p>
                    </div>
                    {!paused && (
                        <button
                            type="button"
                            onClick={() => setModal("extend")}
                            className="h-9 shrink-0 cursor-pointer self-center rounded-lg border border-[#E8C860] bg-white px-4 text-[12px] font-semibold text-[#9A7400] transition-colors hover:bg-[#FFFBEB]"
                        >
                            {t("tenderManage.banner.extend")}
                        </button>
                    )}
                    {paused && (
                        <button
                            type="button"
                            onClick={togglePause}
                            className="h-9 shrink-0 cursor-pointer rounded-lg bg-[#10B981] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#0E9F6E]"
                        >
                            {t("tenderManage.banner.resume")}
                        </button>
                    )}
                </section>
            )}

            {/* ===== الإحصائيات ===== */}
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                {STATS.map(({ key, icon: Icon, tone }) => (
                    <div key={key} className={`${card} flex items-start gap-3 p-4`}>
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                            <Icon size={19} strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0">
                            <p className="text-[12px] text-[#64748B]">{t(`tenderManage.stats.${key}.label`)}</p>
                            <p className="mt-1 text-[17px] font-bold text-[#1E293B] tabular-nums">{statValue[key].value}</p>
                            <p className="mt-0.5 text-[11px] text-[#94A3B8]">{statValue[key].sub}</p>
                        </div>
                    </div>
                ))}
            </section>

            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_290px]">
                {/* ===== التبويبات ===== */}
                <section className={`${card} min-w-0`}>
                    {/* الخط السفلي shadow داخلي بدل border عشان ما يطلع سكرول عمودي؛ والسكرول الأفقي (للموبايل) مخفي */}
                    <div role="tablist" className="flex gap-6 overflow-x-auto overflow-y-hidden px-5 shadow-[inset_0_-1px_0_#DDDDDD] [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
                        {TABS.map((key) => (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={tab === key}
                                onClick={() => setTab(key)}
                                className={`shrink-0 cursor-pointer border-b-2 py-4 text-[13px] font-semibold transition-colors ${tab === key ? "border-[#4B9AD2] text-[#3D8BC9]" : "border-transparent text-[#64748B] hover:text-[#334155]"}`}
                            >
                                {t(`tenderManage.tabs.${key}`)}
                            </button>
                        ))}
                    </div>

                    <div className="p-5 sm:p-6">
                        {tab === "overview" && (
                            <div className="flex flex-col gap-7">
                                <div>
                                    <h2 className="text-[16px] font-semibold text-[#1E293B]">{t("tenderManage.overview.descTitle")}</h2>
                                    <p className="mt-1 text-[12px] text-[#94A3B8]">{t("tenderManage.overview.descSub")}</p>
                                    <div className="mt-4 flex flex-col gap-3 text-[13px] leading-[1.9] text-[#475569]">
                                        {paragraphs.map((p) => (
                                            <p key={p}>{p}</p>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[13px] font-bold text-[#1E293B]">{t("tenderManage.overview.execTitle")}</h3>
                                    {/* 3 خانات بالسطر الأول، والمبلغ الابتدائي سطر كامل تحتهم */}
                                    <dl className="mt-3 grid overflow-hidden rounded-xl border border-[#E2E8F0] sm:grid-cols-3">
                                        {execRows.map((row, i) => (
                                            <div
                                                key={row.key}
                                                className={`px-4 py-4 ${row.full ? "sm:col-span-3" : "border-b border-[#E2E8F0]"} ${!row.full && i < 2 ? "sm:border-e" : ""}`}
                                            >
                                                <dt className="text-[12px] text-[#94A3B8]">{t(`tenderManage.overview.exec.${row.key}`)}</dt>
                                                <dd className="mt-1.5 text-[13px] font-medium text-[#1E293B]">{row.value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>

                                <div>
                                    <h3 className="text-[13px] font-bold text-[#1E293B]">{t("tenderManage.overview.scopeTitle")}</h3>
                                    <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                                        {scope.map((item) => (
                                            <li key={item} className="flex items-start gap-2.5 rounded-lg bg-[#F8FAFC] px-4 py-2.5 text-[12px] leading-[1.8] text-[#334155]">
                                                <Check size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-[#10B981]" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* المتطلبات: بطاقة متطلبات التأهيل بنص العرض */}
                        {tab === "requirements" && (
                            <div className="grid gap-4 md:grid-cols-2">
                                <section className="rounded-2xl border border-[#E2E8F0] p-4">
                                    <h2 className="flex items-center gap-3 text-[14px] font-semibold text-[#1E293B]">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E3EFFA] text-[#3D8BC9]">
                                            <BriefcaseBusiness size={18} strokeWidth={1.8} />
                                        </span>
                                        {t("tenderManage.requirements.qualTitle")}
                                    </h2>
                                    <ul className="mt-3 divide-y divide-[#F1F5F9] border-t border-[#F1F5F9]">
                                        {t("tenderManage.requirements.qual", { returnObjects: true }).map((item) => (
                                            <li key={item} className="flex items-start gap-2.5 py-2.5 text-[13px] leading-[1.7] text-[#475569]">
                                                <Check size={15} strokeWidth={2.5} className="mt-1 shrink-0 text-[#10B981]" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            </div>
                        )}

                        {/* سجل النشاط: أيقونة بدائرة لكل حدث وخط بيوصل بينهم */}
                        {tab === "activity" && (
                            <ol className="flex flex-col py-2">
                                {[...newActivity, ...t("tenderManage.activity", { returnObjects: true })].map((item, i, all) => {
                                    const Icon = ACTIVITY_ICONS[item.type] || Check;
                                    return (
                                        <li key={`${i}-${item.text}`} className={`relative flex items-start gap-4 ${i < all.length - 1 ? "pb-8" : ""}`}>
                                            {i < all.length - 1 && (
                                                <span aria-hidden="true" className="absolute start-[18px] top-11 bottom-2 w-0.5 rounded-full bg-[#E3EFFA]" />
                                            )}
                                            <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[#EEF5FC] text-[#3D8BC9]">
                                                <Icon size={17} strokeWidth={1.8} />
                                            </span>
                                            <div className="min-w-0 pt-0.5">
                                                <p className="text-[13px] font-bold text-[#1E293B]">{item.text}</p>
                                                <p className="mt-1 text-[12px] text-[#94A3B8]">
                                                    {t("tenderManage.activityBy", { name: people[0].name, time: item.time })}
                                                </p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        )}
                    </div>
                </section>

                {/* ===== العمود الجانبي ===== */}
                <aside className="flex flex-col gap-4">
                    {/* حالة النشر */}
                    <section className={`${card} p-5`}>
                        <h2 className="text-[14px] font-bold text-[#1E293B]">{t("tenderManage.publish.title")}</h2>
                        <div className={`mt-3 flex items-center gap-3 rounded-xl border px-3.5 py-3 ${publishState.tone}`}>
                            <publishState.icon size={20} className="shrink-0" />
                            <div>
                                <p className="text-[13px] font-bold text-[#1E293B]">{publishState.label}</p>
                                <p className="text-[11px] text-[#64748B]">{publishState.sub}</p>
                            </div>
                        </div>
                        <dl className="mt-2 divide-y divide-[#F1F5F9] text-[12px]">
                            {[
                                ["views", details.views.toLocaleString("en-US")],
                                ["saves", t("tenderManage.times", { count: details.saves })],
                                ["inquiries", t("tenderManage.inquiries", { count: details.inquiries })],
                            ].map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between gap-3 py-2.5">
                                    <dt className="text-[#64748B]">{t(`tenderManage.publish.${key}`)}</dt>
                                    <dd className="font-semibold text-[#334155] tabular-nums">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    {/* مسؤول العطاء */}
                    <section className={`${card} p-5`}>
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-[14px] font-bold text-[#1E293B]">{t("tenderManage.officer.title")}</h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setPickedOfficer(officer);
                                    setModal("officer");
                                }}
                                className="cursor-pointer text-[12px] font-semibold text-[#4B9AD2] hover:underline"
                            >
                                {t("tenderManage.officer.change")}
                            </button>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E3EFFA] text-[13px] font-bold text-[#3D8BC9]">
                                {person.initials}
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-[13px] font-bold text-[#1E293B]">{person.name}</p>
                                <p className="text-[11px] text-[#64748B]">{person.role}</p>
                            </div>
                        </div>
                        <a
                            href={`mailto:${person.email}`}
                            className="mt-3 flex items-center gap-2 border-t border-[#F1F5F9] pt-3 text-[12px] text-[#475569] hover:text-[#3D8BC9]"
                        >
                            <Mail size={15} className="shrink-0 text-[#94A3B8]" />
                            <bdi dir="ltr" className="truncate">{person.email}</bdi>
                        </a>
                    </section>

                    {/* إجراءات سريعة */}
                    <section className={`${card} p-5`}>
                        <h2 className="text-[14px] font-bold text-[#1E293B]">{t("tenderManage.quick.title")}</h2>
                        <ul className="mt-2 flex flex-col">
                            {quickActions.map(({ key, icon: Icon, onClick, disabled }) => (
                                <li key={key}>
                                    <button
                                        type="button"
                                        onClick={onClick}
                                        disabled={disabled}
                                        className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 text-start text-[13px] text-[#334155] transition-colors hover:bg-[#F1F5F9] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                                    >
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E3EFFA] text-[#3D8BC9]">
                                            <Icon size={16} />
                                        </span>
                                        {t(`tenderManage.quick.${key}`)}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </section>
                </aside>
            </div>

            {/* ===== النوافذ ===== */}
            {modal === "notify" && (
                <NotifyModal
                    number={number}
                    title={title}
                    applicants={offers}
                    onClose={closeModal}
                    onSent={() => {
                        setToast(t("tenderManage.quick.notifyDone"));
                        closeModal();
                    }}
                />
            )}

            {/* "تمديد الموعد" و"تعديل العطاء" نفس النافذة */}
            {(modal === "extend" || modal === "edit") && (
                <EditModal
                    number={number}
                    initial={{ title, budget: details.budget, deadline: details.deadline }}
                    focus={modal === "extend" ? "deadline" : "title"}
                    onClose={closeModal}
                    onSave={({ title: newTitle, budget, deadline, reason }) => {
                        const extendedDays = Math.round((new Date(deadline) - new Date(details.deadline)) / 86400000);
                        setEdits((e) => ({ ...e, title: newTitle }));
                        setDetails((d) => ({ ...d, budget, deadline }));
                        const text =
                            extendedDays > 0
                                ? t("tenderManage.edit.activityExtended", { days: t("tenderManage.days", { count: extendedDays }) })
                                : t("tenderManage.edit.activity");
                        setNewActivity((list) => [
                            { type: extendedDays > 0 ? "deadline" : "edit", text: reason ? `${text} — ${reason}` : text, time: t("tenderManage.clarify.now") },
                            ...list,
                        ]);
                        setToast(t("tenderManage.edit.done"));
                        closeModal();
                    }}
                />
            )}

            {modal === "clarify" && (
                <ClarifyModal
                    number={number}
                    title={title}
                    onClose={closeModal}
                    onPublish={({ heading }) => {
                        setNewActivity((list) => [
                            { type: "clarify", text: t("tenderManage.clarify.activity", { heading }), time: t("tenderManage.clarify.now") },
                            ...list,
                        ]);
                        setToast(t("tenderManage.quick.clarifyDone"));
                        closeModal();
                    }}
                />
            )}

            {modal === "officer" && (
                <Modal title={t("tenderManage.officer.modalTitle")} onClose={closeModal}>
                    <div role="radiogroup" className="flex flex-col gap-2">
                        {people.map((p, i) => (
                            <label
                                key={p.email}
                                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors ${pickedOfficer === i ? "border-[#4B9AD2] bg-[#F3F8FD]" : "border-[#DDDDDD] hover:bg-[#F8FAFC]"}`}
                            >
                                <input
                                    type="radio"
                                    name="officer"
                                    value={i}
                                    checked={pickedOfficer === i}
                                    onChange={() => setPickedOfficer(i)}
                                    className="sr-only"
                                />
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E3EFFA] text-[12px] font-bold text-[#3D8BC9]">
                                    {p.initials}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-[13px] font-bold text-[#1E293B]">{p.name}</span>
                                    <span className="block text-[11px] text-[#64748B]">{p.role}</span>
                                </span>
                                {pickedOfficer === i && <Check size={18} strokeWidth={2.5} className="shrink-0 text-[#4B9AD2]" />}
                            </label>
                        ))}
                    </div>
                    <div className="mt-5 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="h-11 cursor-pointer rounded-xl border border-[#DDDDDD] px-6 text-[14px] font-medium text-[#475569] transition-colors hover:bg-[#F8FAFC]"
                        >
                            {t("tenderManage.cancel")}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setOfficer(pickedOfficer);
                                setToast(t("tenderManage.officer.changed"));
                                closeModal();
                            }}
                            className="h-11 cursor-pointer rounded-xl bg-[#4B9AD2] px-6 text-[14px] font-semibold text-white btn-wipe"
                        >
                            {t("tenderManage.officer.save")}
                        </button>
                    </div>
                </Modal>
            )}

            {toast && (
                <p
                    role="status"
                    className="fixed bottom-6 start-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#1E293B] px-5 py-3 text-[13px] font-medium text-white shadow-lg rtl:translate-x-1/2"
                >
                    {toast}
                </p>
            )}
        </div>
    );
}
