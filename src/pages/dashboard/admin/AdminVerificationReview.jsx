import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown, CircleAlert, Download, Eye, FileText, Info, RotateCw, ShieldCheck, X } from "lucide-react";
import { VERIFICATIONS, VERIFICATION_STATUS_STYLES } from "./AdminVerification";

const BASE = "/dashboard/admin";

const card = "rounded-[18px] border border-[#0000000D] bg-white shadow-[0_4px_20px_rgba(35,74,100,0.07)]";

// ⚠️ تفاصيل تجريبية (المستندات، بيانات التسجيل، السجل) لحد ما يجهز endpoint طلب التوثيق
// url: رابط الملف من السيرفر (فاضي بالتجريبي فالمعاينة والتحميل معطّلين)
const DOCUMENTS = [
    { key: "id", ext: "JPG", size: "1.2 MB", url: "" },
    { key: "photo", ext: "JPG", size: "620 KB", url: "" },
    { key: "license", ext: "PDF", size: "840 KB", url: "" },
];
const CHECKLIST = ["name", "photo", "valid"];
const SUBMITTED_HOURS = 9;

// ==================== نافذة اعتماد التوثيق ====================

const APPROVE_NOTE_MAX = 500;

/**
 * نافذة "اعتماد التوثيق": ملخص الحساب والمستندات + ملاحظة داخلية اختيارية.
 * summary: [{ label, value }] — onConfirm(note)
 */
function ApproveModal({ name, summary, onConfirm, onClose }) {
    const { t } = useTranslation("adminDashboard");
    const a = "verificationPage.reviewPage.approveModal";
    const [note, setNote] = useState("");
    const confirmRef = useRef(null);
    const closeRef = useRef(onClose);
    useEffect(() => {
        closeRef.current = onClose;
    }, [onClose]);

    // مرة وحدة عند الفتح: Escape بيسكر النافذة، والصفحة اللي وراها ما بتتمرر
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && closeRef.current();
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        confirmRef.current?.focus();
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, []);

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#141415]/40 p-4 backdrop-blur-[2px]"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="approve-title"
                onSubmit={(e) => {
                    e.preventDefault();
                    onConfirm(note.trim());
                }}
                className="w-full max-w-[452px] rounded-[20px] bg-white p-6 shadow-[0_24px_60px_rgba(20,20,21,0.25)]"
            >
                <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E3F6EA] text-[#2EAF4E]">
                        <ShieldCheck size={22} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h2 id="approve-title" className="text-[18px] font-bold text-[#141415]">{t(`${a}.title`, { name })}</h2>
                        <p className="mt-1.5 text-[11px] leading-[1.9] text-[#575757]">{t(`${a}.desc`)}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t(`${a}.cancel`)}
                        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#575757] hover:bg-[#F2F4F6]"
                    >
                        <X size={17} />
                    </button>
                </div>

                {/* ملخص الحساب */}
                <dl className="mt-5 flex flex-col gap-3 rounded-xl bg-[#F3F4F6] px-4 py-3.5 text-[11px]">
                    {summary.map((row) => (
                        <div key={row.label} className="flex items-center justify-between gap-3">
                            <dt className="text-[#89949D]">{row.label}</dt>
                            <dd className="text-end font-medium text-[#141415]">{row.value}</dd>
                        </div>
                    ))}
                </dl>

                {/* ملاحظة داخلية (ما بتوصل للمستخدم) */}
                <div className="mt-4 rounded-xl border border-[#8EC0E4] px-4 pb-1.5 pt-3 focus-within:border-[#4B9AD2] focus-within:ring-1 focus-within:ring-[#4B9AD2]">
                    <textarea
                        rows={2}
                        maxLength={APPROVE_NOTE_MAX}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        aria-label={t(`${a}.notePlaceholder`)}
                        placeholder={t(`${a}.notePlaceholder`)}
                        className="w-full resize-none bg-transparent text-[12px] leading-[1.8] text-[#414141] outline-none placeholder:text-[#89949D]"
                    />
                    <p className="text-end text-[9px] text-[#89949D] tabular-nums" dir="ltr">{note.length} / {APPROVE_NOTE_MAX}</p>
                </div>

                <div className="mt-5 flex gap-3">
                    <button
                        ref={confirmRef}
                        type="submit"
                        className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#4B9AD2] text-[13px] font-semibold text-white btn-wipe"
                    >
                        <Check size={16} />
                        {t(`${a}.submit`)}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 flex-1 cursor-pointer rounded-xl bg-[#F2F4F6] text-[13px] font-semibold text-[#414141] hover:bg-[#E6E9EC]"
                    >
                        {t(`${a}.cancel`)}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ==================== نافذة طلب معلومات إضافية ====================

const INFO_MAX = 500;

/**
 * نافذة "طلب معلومات إضافية": اختيار المستندات المطلوب إعادة رفعها + نص المطلوب (إلزامي).
 * documents: [{ key, label }] — recipient: "للحرفي" / "للمؤسسة"...
 * onConfirm({ documents: [keys], message })
 */
function InfoRequestModal({ documents, recipient, onConfirm, onClose }) {
    const { t } = useTranslation("adminDashboard");
    const m = "verificationPage.reviewPage.infoModal";
    const [selected, setSelected] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const textRef = useRef(null);
    const closeRef = useRef(onClose);
    useEffect(() => {
        closeRef.current = onClose;
    }, [onClose]);

    // مرة وحدة عند الفتح: Escape بيسكر النافذة، والصفحة اللي وراها ما بتتمرر
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && closeRef.current();
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, []);

    const toggle = (key) => setSelected((list) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key]));

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#141415]/40 p-4 backdrop-blur-[2px]"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="info-title"
                noValidate
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!message.trim()) {
                        setError(t(`${m}.required`));
                        textRef.current?.focus();
                        return;
                    }
                    onConfirm({ documents: selected, message: message.trim() });
                }}
                className="max-h-[92vh] w-full max-w-[388px] overflow-y-auto rounded-[20px] bg-white p-6 shadow-[0_24px_60px_rgba(20,20,21,0.25)]"
            >
                <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E4EFFA] text-[#4B9AD2]">
                        <Info size={22} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h2 id="info-title" className="text-[18px] font-bold text-[#141415]">{t(`${m}.title`)}</h2>
                        <p className="mt-1.5 text-[11px] leading-[1.9] text-[#575757]">{t(`${m}.desc`, { recipient })}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t(`${m}.cancel`)}
                        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#575757] hover:bg-[#F2F4F6]"
                    >
                        <X size={17} />
                    </button>
                </div>

                {/* المستندات المطلوب إعادة رفعها */}
                <fieldset className="mt-5">
                    <legend className="mb-3 text-[12px] font-semibold text-[#141415]">{t(`${m}.documentsLabel`)}</legend>
                    <ul className="flex flex-col gap-3">
                        {documents.map((doc) => (
                            <li key={doc.key}>
                                <label className="flex cursor-pointer items-center gap-2.5 text-[12px] text-[#414141]">
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(doc.key)}
                                        onChange={() => toggle(doc.key)}
                                        className="h-4 w-4 cursor-pointer accent-[#4B9AD2]"
                                    />
                                    {doc.label}
                                </label>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <label htmlFor="info-message" className="mb-2 mt-5 block text-[12px] font-semibold text-[#141415]">
                    {t(`${m}.label`)} *
                </label>
                <div className={`rounded-xl border px-4 pb-1.5 pt-3 focus-within:border-[#4B9AD2] focus-within:ring-1 focus-within:ring-[#4B9AD2] ${error ? "border-red-400" : "border-[#8EC0E4]"}`}>
                    <textarea
                        id="info-message"
                        ref={textRef}
                        rows={3}
                        maxLength={INFO_MAX}
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            setError("");
                        }}
                        aria-invalid={!!error}
                        placeholder={t(`${m}.placeholder`)}
                        className="w-full resize-none bg-transparent text-[12px] leading-[1.8] text-[#414141] outline-none placeholder:text-[#89949D]"
                    />
                    <p className="text-end text-[9px] text-[#89949D] tabular-nums" dir="ltr">{message.length} / {INFO_MAX}</p>
                </div>
                {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}

                <div className="mt-5 flex gap-3">
                    <button type="submit" className="h-11 flex-1 cursor-pointer rounded-xl bg-[#4B9AD2] text-[13px] font-semibold text-white btn-wipe">
                        {t(`${m}.submit`)}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 flex-1 cursor-pointer rounded-xl bg-[#F2F4F6] text-[13px] font-semibold text-[#414141] hover:bg-[#E6E9EC]"
                    >
                        {t(`${m}.cancel`)}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ==================== نافذة رفض التوثيق ====================

const REJECT_MAX = 500;
const REJECT_MIN = 10;
const REJECT_REASONS = ["mismatch", "unclear", "expired", "incomplete", "duplicate", "other"];

/**
 * نافذة "رفض توثيق الحساب": سبب الرفض + تفاصيله (10 أحرف على الأقل).
 * onConfirm({ reason, details }) — reason: مفتاح السبب
 */
function RejectModal({ onConfirm, onClose }) {
    const { t } = useTranslation("adminDashboard");
    const m = "verificationPage.reviewPage.rejectModal";
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [errors, setErrors] = useState({});
    const selectRef = useRef(null);
    const closeRef = useRef(onClose);
    useEffect(() => {
        closeRef.current = onClose;
    }, [onClose]);

    // مرة وحدة عند الفتح: Escape بيسكر النافذة، والصفحة اللي وراها ما بتتمرر
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && closeRef.current();
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        selectRef.current?.focus();
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        const next = {
            reason: reason ? "" : t(`${m}.reasonRequired`),
            details: details.trim().length >= REJECT_MIN ? "" : t(`${m}.detailsMin`, { count: REJECT_MIN }),
        };
        setErrors(next);
        if (next.reason || next.details) return;
        onConfirm({ reason, details: details.trim() });
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#141415]/40 p-4 backdrop-blur-[2px]"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="reject-title"
                noValidate
                onSubmit={submit}
                className="max-h-[92vh] w-full max-w-[440px] overflow-y-auto rounded-[20px] bg-white p-6 shadow-[0_24px_60px_rgba(20,20,21,0.25)]"
            >
                <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FDE4E4] text-[#D64545]">
                        <X size={22} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h2 id="reject-title" className="text-[18px] font-bold text-[#141415]">{t(`${m}.title`)}</h2>
                        <p className="mt-1.5 text-[11px] leading-[1.9] text-[#575757]">{t(`${m}.desc`)}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t(`${m}.cancel`)}
                        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#575757] hover:bg-[#F2F4F6]"
                    >
                        <X size={17} />
                    </button>
                </div>

                <label htmlFor="reject-reason" className="mb-2 mt-6 block text-[12px] text-[#141415]">
                    {t(`${m}.reason`)} *
                </label>
                <div className="relative">
                    <select
                        id="reject-reason"
                        ref={selectRef}
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value);
                            setErrors((er) => ({ ...er, reason: "" }));
                        }}
                        aria-invalid={!!errors.reason}
                        className={`h-11 w-full cursor-pointer appearance-none rounded-xl border bg-white pe-10 ps-4 text-[12px] outline-none focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2] ${reason ? "text-[#414141]" : "text-[#89949D]"
                            } ${errors.reason ? "border-red-400" : "border-[#8EC0E4]"}`}
                    >
                        <option value="" disabled>{t(`${m}.reasonPlaceholder`)}</option>
                        {REJECT_REASONS.map((key) => (
                            <option key={key} value={key} className="text-[#414141]">{t(`${m}.reasons.${key}`)}</option>
                        ))}
                    </select>
                    <ChevronDown size={17} className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                </div>
                {errors.reason && <p className="mt-1 text-[11px] text-[#C62828]">{errors.reason}</p>}

                <label htmlFor="reject-details" className="mb-2 mt-5 block text-[12px] text-[#141415]">
                    {t(`${m}.details`)} *
                </label>
                <div
                    className={`rounded-xl border px-4 pb-1.5 pt-3 ${errors.details
                        ? "border-[#C62828] ring-1 ring-[#C62828]/20"
                        : "border-[#8EC0E4] focus-within:border-[#4B9AD2] focus-within:ring-1 focus-within:ring-[#4B9AD2]"
                        }`}
                >
                    <textarea
                        id="reject-details"
                        rows={2}
                        maxLength={REJECT_MAX}
                        value={details}
                        onChange={(e) => {
                            setDetails(e.target.value);
                            if (errors.details && e.target.value.trim().length >= REJECT_MIN) setErrors((er) => ({ ...er, details: "" }));
                        }}
                        aria-invalid={!!errors.details}
                        aria-describedby={errors.details ? "reject-details-error" : undefined}
                        placeholder={t(`${m}.detailsPlaceholder`)}
                        className="w-full resize-none bg-transparent text-[12px] leading-[1.8] text-[#414141] outline-none placeholder:text-[#89949D]"
                    />
                    <p className="text-end text-[9px] text-[#89949D] tabular-nums" dir="ltr">{details.length} / {REJECT_MAX}</p>
                </div>
                {errors.details && <p id="reject-details-error" className="mt-2 text-[11px] text-[#C62828]">{errors.details}</p>}

                <p className="mt-5 flex items-center gap-2 rounded-lg bg-[#EEF5FC] px-4 py-3 text-[11px] text-[#38749E]">
                    <Info size={15} className="shrink-0 text-[#4B9AD2]" />
                    {t(`${m}.appealNote`)}
                </p>

                <div className="mt-5 flex gap-3">
                    <button
                        type="submit"
                        className="h-11 flex-1 cursor-pointer rounded-xl bg-[#C62828] text-[13px] font-semibold text-white transition-colors hover:bg-[#A82020]"
                    >
                        {t(`${m}.submit`)}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 flex-1 cursor-pointer rounded-xl bg-[#F2F4F6] text-[13px] font-semibold text-[#414141] hover:bg-[#E6E9EC]"
                    >
                        {t(`${m}.cancel`)}
                    </button>
                </div>
            </form>
        </div>
    );
}

/** صفحة مراجعة طلب توثيق (/dashboard/admin/verification/:verificationId) */
export default function AdminVerificationReview() {
    const { t, i18n } = useTranslation("adminDashboard");
    const { verificationId } = useParams();
    const item = VERIFICATIONS.find((x) => x.id === verificationId);
    const locale = `${i18n.language}-u-nu-latn`;
    const v = "verificationPage";
    const rv = `${v}.reviewPage`;

    // ⚠️ القرار بالصفحة بس لحد ما يصير في endpoint
    const [status, setStatus] = useState(item?.status);
    const [previewKey, setPreviewKey] = useState("id");
    const [checked, setChecked] = useState({ name: true });
    const [modal, setModal] = useState(null); // "approve" | "info" | "reject"
    const [flash, setFlash] = useState("");
    const [events, setEvents] = useState([]);
    // تعارض: مشرف ثاني اتخذ قرار قبلنا — { by, decision }
    const [conflict, setConflict] = useState(null);

    if (!item) {
        return (
            <div className={`${card} mx-auto max-w-[1100px] p-10 text-center`}>
                <p className="text-[15px] font-bold text-[#414141]">{t(`${rv}.notFound`)}</p>
                <Link to={`${BASE}/verification`} className="mt-4 inline-block text-[13px] text-[#4B9AD2] hover:underline">
                    {t(`${v}.title`)}
                </Link>
            </div>
        );
    }

    const s = `${v}.sample.${item.id}`;
    const name = t(`${s}.name`);
    const fieldText = t(`${s}.field`);
    const area = t(`${s}.area`);
    const docName = (key) => t(`${rv}.documents.${item.type}.${key}`);
    const decided = status === "verified" || status === "rejected" || !!conflict;
    const time = (iso) =>
        new Date(iso).toLocaleString(locale, { day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });

    // note: ملاحظة داخلية (بالاعتماد) بتنضاف لسطر السجل
    const decide = (next, flashKey, note) => {
        setModal(null);
        // لو في مشرف ثاني سبقنا: قرارنا ما بينحفظ وبنعرض قراره هو
        if (item.concurrent && !conflict) {
            const { by, decision } = item.concurrent;
            const byName = t(`requestsPage.staff.${by}`);
            setConflict({ by: byName, decision });
            setStatus(decision);
            setFlash("");
            setEvents((list) => [
                {
                    id: `c-${Date.now()}`,
                    text: `${t(`${rv}.history.${decision === "verified" ? "approved" : decision}`)} — ${byName}`,
                    date: t(`${rv}.conflict.minuteAgo`),
                    dot: decision === "rejected" ? "#D64545" : decision === "info" ? "#D9822B" : "#2EC65A",
                },
                ...list,
            ]);
            return;
        }
        setStatus(next);
        setFlash(t(`${rv}.flash.${flashKey}`, { name }));
        setEvents((list) => [
            { id: `e-${Date.now()}`, text: t(`${rv}.history.${flashKey}`) + (note ? ` — ${note}` : ""), date: t(`${rv}.now`), dot: next === "rejected" ? "#D64545" : next === "info" ? "#D9822B" : "#2EC65A" },
            ...list,
        ]);
    };

    const registration = [
        { key: "fullName", value: name },
        { key: "phone", value: "0599-214-778", ltr: true },
        { key: "email", value: "a.shaheen@gmail.com", ltr: true },
        { key: "providerType", value: t(`${rv}.providerTypes.${item.type}`) },
        { key: "specialty", value: fieldText },
        { key: "area", value: area },
        { key: "registeredAt", value: new Date(item.submitted).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }) },
    ];

    const history = [
        ...events,
        { id: "documents", text: t(`${rv}.history.documents`, { count: DOCUMENTS.length }), date: time(`${item.submitted}T10:12`), dot: "#4B9AD2" },
        { id: "phone", text: t(`${rv}.history.phone`), date: time(`${item.submitted}T10:05`), dot: "#2EC65A" },
        { id: "created", text: t(`${rv}.history.created`), date: time(`${item.submitted}T10:01`), dot: "#9AA3AB" },
    ];

    const btn = "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-5">
            {/* مسار الصفحة */}
            <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-[11px] text-[#89949D]">
                <Link to={`${BASE}/verification`} className="text-[#4B9AD2] hover:underline">{t(`${v}.title`)}</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page" className="text-[#575757]">{name}</span>
            </nav>

            {conflict && (
                <div role="alert" className="flex flex-col gap-3 rounded-xl border border-[#F2D27A] bg-[#FFF8DD] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <CircleAlert size={20} className="mt-0.5 shrink-0 text-[#BF9900]" />
                        <div>
                            <p className="text-[13px] font-bold text-[#BF9900]">{t(`${rv}.conflict.title`)}</p>
                            <p className="mt-1 text-[11px] text-[#414141]">
                                {t(`${rv}.conflict.desc.${conflict.decision}`, { name: conflict.by })}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        // ⚠️ لما يصير في API: بنعيد جلب الطلب من السيرفر هون
                        onClick={() => setConflict(null)}
                        className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#4B9AD2] bg-white px-5 text-[13px] font-medium text-[#4B9AD2] btn-wipe btn-wipe-outline"
                    >
                        <RotateCw size={15} />
                        {t(`${rv}.conflict.refresh`)}
                    </button>
                </div>
            )}

            {/* الرأس */}
            <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EAF3FB] text-[20px] font-bold text-[#4B9AD2]">
                        {name.trim().charAt(0)}
                    </span>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-[24px] font-bold text-[#141415]">{name}</h1>
                            <span className="rounded-full bg-[#EEF0F2] px-2.5 py-0.5 text-[9px] text-[#575757]">{t(`${rv}.providerKinds.${item.type}`)}</span>
                            <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-medium ${VERIFICATION_STATUS_STYLES[status]}`}>
                                {t(`${v}.statuses.${status}`)}
                            </span>
                        </div>
                        <p className="mt-1.5 text-[12px] text-[#575757]">
                            {fieldText} · {area} · {t(`${rv}.submittedAgo`, { count: SUBMITTED_HOURS })} · <bdi dir="ltr">{item.code}</bdi>
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => setModal("reject")}
                            disabled={decided}
                            className={`${btn} min-w-[92px] border border-[#D64545] text-[#D64545] hover:bg-[#FFF6F6]`}
                        >
                            <X size={15} />
                            {t(`${rv}.reject`)}
                        </button>
                        <button
                            type="button"
                            onClick={() => setModal("info")}
                            disabled={decided}
                            className={`${btn} min-w-[140px] border border-[#4B9AD2] text-[#4B9AD2] btn-wipe btn-wipe-outline`}
                        >
                            <Info size={15} />
                            {t(`${rv}.requestInfo`)}
                        </button>
                        <button
                            type="button"
                            onClick={() => setModal("approve")}
                            disabled={decided}
                            className={`${btn} min-w-[140px] bg-[#4B9AD2] text-white shadow-[0_4px_10px_rgba(75,154,210,0.3)] btn-wipe`}
                        >
                            <Check size={16} />
                            {t(`${rv}.approve`)}
                        </button>
                </div>
            </header>

            {flash && (
                <p role="status" className="rounded-lg border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-3 text-[13px] text-[#2E9E5B]">
                    {flash}
                </p>
            )}

            <div className="grid items-start gap-5 lg:grid-cols-[1fr_270px]">
                <div className="flex min-w-0 flex-col gap-5">
                    {/* المستندات المرفوعة */}
                    <section className={`${card} p-5`}>
                        <h2 className="flex items-center gap-2 text-[16px] font-bold text-[#141415]">
                            {t(`${rv}.documentsTitle`)}
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EAF3FB] px-1.5 text-[10px] text-[#4B9AD2]">{DOCUMENTS.length}</span>
                        </h2>
                        <ul className="mt-4 flex flex-col gap-3">
                            {DOCUMENTS.map((doc) => {
                                const active = previewKey === doc.key;
                                return (
                                    <li
                                        key={doc.key}
                                        className={`flex items-center gap-3 rounded-xl border px-4 py-4 ${active ? "border-[#BFDCF1] bg-[#EEF5FC]" : "border-transparent"}`}
                                    >
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF3FB] text-[#4B9AD2]">
                                            <FileText size={18} strokeWidth={1.7} />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-[13px] text-[#141415]">{docName(doc.key)}</p>
                                            <p className="mt-0.5 text-[9px] text-[#89949D]" dir="ltr">{doc.ext} · {doc.size}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setPreviewKey(doc.key)}
                                            aria-pressed={active}
                                            className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-4 text-[12px] font-medium transition-colors ${active ? "bg-[#4B9AD2] text-white" : "border border-[#4B9AD2] text-[#4B9AD2] hover:bg-[#EEF5FC]"
                                                }`}
                                        >
                                            <Eye size={13} />
                                            {t(`${rv}.preview`)}
                                        </button>
                                        {doc.url ? (
                                            <a href={doc.url} download className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#F2F4F6] px-4 text-[12px] font-medium text-[#414141] hover:bg-[#E6E9EC]">
                                                <Download size={13} />
                                                {t(`${rv}.download`)}
                                            </a>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled
                                                title={t(`${rv}.unavailable`)}
                                                className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-lg bg-[#F2F4F6] px-4 text-[12px] font-medium text-[#414141]"
                                            >
                                                <Download size={13} />
                                                {t(`${rv}.download`)}
                                            </button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>

                        <p className="mb-3 mt-6 text-[13px] text-[#141415]">{t(`${rv}.previewOf`, { name: docName(previewKey) })}</p>
                        {/* المعاينة — لما ييجي رابط الملف من السيرفر بنعرضه هون (صورة أو PDF) */}
                        <div className="flex h-[90px] items-center justify-center rounded-xl border-2 border-dashed border-[#D5DAE0] bg-[#F2F3F5] text-[11px] text-[#575757]">
                            {t(`${rv}.openFull`)}
                        </div>
                    </section>

                    {/* قائمة التحقق */}
                    <section className={`${card} p-5`}>
                        <h2 className="text-[14px] font-bold text-[#141415]">{t(`${rv}.checklistTitle`)}</h2>
                        <ul className="mt-4 flex flex-col gap-3">
                            {CHECKLIST.map((k) => (
                                <li key={k}>
                                    <label className="flex cursor-pointer items-center gap-2.5 text-[12px] text-[#414141]">
                                        <input
                                            type="checkbox"
                                            checked={!!checked[k]}
                                            disabled={decided}
                                            onChange={(e) => setChecked((c) => ({ ...c, [k]: e.target.checked }))}
                                            className="h-4 w-4 cursor-pointer accent-[#4B9AD2]"
                                        />
                                        {t(`${rv}.checklist.${k}`)}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                <aside className="flex flex-col gap-5">
                    {/* بيانات التسجيل */}
                    <section className={`${card} border-t-2 border-t-[#9CC9EA] p-5`}>
                        <h2 className="text-[14px] font-bold text-[#141415]">{t(`${rv}.registrationTitle`)}</h2>
                        <dl className="mt-4 flex flex-col gap-4 text-[11px]">
                            {registration.map((row) => (
                                <div key={row.key} className="flex items-center justify-between gap-3">
                                    <dt className="shrink-0 text-[#575757]">{t(`${rv}.registration.${row.key}`)}</dt>
                                    <dd className="truncate font-medium text-[#141415]" dir={row.ltr ? "ltr" : undefined}>{row.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    {/* سجل الحساب */}
                    <section className={`${card} p-5`}>
                        <h2 className="text-[14px] font-bold text-[#141415]">{t(`${rv}.historyTitle`)}</h2>
                        <ol className="mt-4 flex flex-col gap-5">
                            {history.map((h) => (
                                <li key={h.id} className="flex items-start gap-3">
                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: h.dot }} aria-hidden="true" />
                                    <div>
                                        <p className="text-[12px] text-[#141415]">{h.text}</p>
                                        <p className="mt-0.5 text-[9px] text-[#89949D]">{h.date}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </section>
                </aside>
            </div>

            {modal === "approve" && (
                <ApproveModal
                    name={name}
                    summary={[
                        {
                            label: t(`${rv}.approveModal.account`),
                            value: `${t(`${rv}.providerKinds.${item.type}`)} · ${fieldText} · ${item.code}`,
                        },
                        {
                            label: t(`${rv}.approveModal.documents`),
                            value: `${t(`${v}.documents`, { count: DOCUMENTS.length })} · ${CHECKLIST.every((k) => checked[k])
                                ? t(`${rv}.approveModal.checklistDone`)
                                : t(`${rv}.approveModal.checklistPartial`, { done: CHECKLIST.filter((k) => checked[k]).length, total: CHECKLIST.length })
                                }`,
                        },
                    ]}
                    onClose={() => setModal(null)}
                    onConfirm={(note) => decide("verified", "approved", note)}
                />
            )}
            {modal === "info" && (
                <InfoRequestModal
                    recipient={t(`${rv}.infoModal.recipients.${item.type}`)}
                    documents={DOCUMENTS.map((doc) => ({ key: doc.key, label: docName(doc.key) }))}
                    onClose={() => setModal(null)}
                    // المستندات المطلوبة بتنضاف لسطر السجل
                    onConfirm={({ documents }) => decide("info", "info", documents.map(docName).join("، "))}
                />
            )}
            {modal === "reject" && (
                <RejectModal
                    onClose={() => setModal(null)}
                    // سبب الرفض بينضاف لسطر السجل
                    onConfirm={({ reason }) => decide("rejected", "rejected", t(`${rv}.rejectModal.reasons.${reason}`))}
                />
            )}
        </div>
    );
}
