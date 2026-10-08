import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CircleCheck, ImagePlus, Wrench, X } from "lucide-react";
import StatusTabs from "../../../components/dashboard/StatusTabs";

// ===== بيانات تجريبية =====
// الطلبات الحقيقية موجودة بالسيرفر (GET /service-requests + accept/reject/complete بـ src/api/endpoints.js)،
// بس ما فيها "القيمة المعلن عنها" ولا "الموقع الجغرافي". لما يضيفهم الباك إند، استبدلي REQUESTS بالطلب الحقيقي.
const REQUESTS = [
    { id: "q1", number: "M2026-001", status: "new", value: 250, distance: 1.2, budget: [200, 300] },
    { id: "q2", number: "M2026-002", status: "new", value: 180, distance: 2.4, budget: [150, 220] },
    { id: "q3", number: "M2026-003", status: "new", value: 300, distance: 4.1, budget: [250, 350] },
    { id: "q4", number: "M2026-004", status: "reviewed", value: 450, distance: 9.5, budget: [400, 500] },
];

const TABS = ["all", "new", "reviewed", "shortlisted", "excluded"];
const TASK_STAGES = ["onTheWay", "started", "completed"];
const REJECT_REASONS = ["price", "far", "unavailable", "outOfScope"];
const START_OPTIONS = ["today", "tomorrow", "week"];

const STATUS_STYLES = {
    new: "bg-[#DDF6E3] text-[#2EAF4E]",
    reviewed: "bg-[#E4EFFA] text-[#4B9AD2]",
    shortlisted: "bg-[#FFF3D6] text-[#B7791F]",
    excluded: "bg-[#FDE2E2] text-[#D64545]",
};

const card = "rounded-[20px] border border-[#0000000D] bg-white shadow-[0_4px_24px_rgba(35,74,100,0.08)]";
const input =
    "h-11 w-full rounded-xl border border-[#8EC0E4] bg-white px-4 text-[13px] text-[#414141] outline-none placeholder:text-[#89949D] focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";
const textarea =
    "w-full resize-none rounded-xl border border-[#8EC0E4] bg-white px-4 py-3 text-[13px] text-[#414141] outline-none placeholder:text-[#89949D] focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";

/** زر اختيار (حالة المهمة / سبب الرفض) — المختار أزرق */
function ChoiceButton({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`min-h-11 cursor-pointer rounded-xl border px-3 py-2 text-[13px] font-semibold transition-colors ${active
                ? "border-[#4B9AD2] bg-[#4B9AD2] text-white shadow-[0_4px_12px_rgba(75,154,210,0.3)]"
                : "border-[#8EC0E4] bg-white text-[#414141] hover:bg-[#EAF3FB]"
                }`}
        >
            {children}
        </button>
    );
}

/** منطقة رفع المرفقات (سحب وإفلات أو ضغط) مع قائمة الملفات المختارة */
function FileDrop({ id, files, onChange }) {
    const { t } = useTranslation("craftsmanDashboard");
    const [dragging, setDragging] = useState(false);

    const addFiles = (list) => {
        const picked = Array.from(list || []);
        if (picked.length) onChange((f) => [...f, ...picked]);
    };

    return (
        <>
            <label
                htmlFor={id}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    addFiles(e.dataTransfer.files);
                }}
                className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-5 text-center text-[11px] text-[#4B9AD2] transition-colors ${dragging ? "border-[#4B9AD2] bg-[#EAF3FB]" : "border-[#8EC0E4]"
                    }`}
            >
                <ImagePlus size={18} />
                {t("requestsPage.followModal.dropHint")}
            </label>
            <input
                id={id}
                type="file"
                multiple
                accept="image/jpeg,image/png,application/pdf"
                className="hidden"
                onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                }}
            />
            {files.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                    {files.map((f, i) => (
                        <li
                            key={`${f.name}-${i}`}
                            className="flex items-center gap-1.5 rounded-full bg-[#EAF3FB] py-1 pe-1.5 ps-3 text-[11px] text-[#38749E]"
                        >
                            <span className="max-w-[160px] truncate" dir="ltr">{f.name}</span>
                            <button
                                type="button"
                                onClick={() => onChange((list) => list.filter((_, j) => j !== i))}
                                aria-label={t("requestsPage.followModal.removeFile", { name: f.name })}
                                className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full hover:bg-white"
                            >
                                <X size={12} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}

/**
 * الإطار المشترك لنوافذ الطلبات: خلفية غامقة، عنوان، ملخص الطلب، والأزرار تحت.
 * Escape أو الضغط على الخلفية بيسكرها، والصفحة اللي وراها ما بتتمرر.
 */
function RequestModal({ id, title, request, subtitle, confirmLabel, onClose, onSubmit, children }) {
    const { t } = useTranslation("craftsmanDashboard");
    const s = `requestsPage.sample.${request.id}`;
    const closeRef = useRef(onClose);
    useEffect(() => {
        closeRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && closeRef.current();
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
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
                aria-labelledby={id}
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                }}
                noValidate
                className="flex max-h-[92vh] w-full max-w-[520px] flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_24px_60px_rgba(20,20,21,0.25)]"
            >
                <div className="overflow-y-auto p-6">
                    <h2 id={id} className="text-[17px] font-bold text-[#22455E]">{title}</h2>

                    <div className="mt-5 rounded-2xl bg-[#EEF5FC] px-4 py-3 shadow-[0_2px_10px_rgba(35,74,100,0.08)]">
                        <p className="text-[13px] font-bold text-[#414141]">{t(`${s}.title`)}</p>
                        <p className="mt-1 text-[11px] text-[#575757]">
                            {subtitle ?? t("requestsPage.followModal.customerLine", { customer: t(`${s}.customer`), time: t(`${s}.delivery`) })}
                        </p>
                    </div>

                    {children}
                </div>

                <div className="flex gap-3 border-t border-[#0000000F] px-6 py-4">
                    <button
                        type="submit"
                        className="h-11 flex-1 cursor-pointer rounded-xl bg-[#4B9AD2] text-[15px] font-semibold text-white btn-wipe"
                    >
                        {confirmLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 flex-1 cursor-pointer rounded-xl border border-[#E8A5AB] text-[15px] font-semibold text-[#D64545] transition-colors hover:bg-[#FFF6F6]"
                    >
                        {t("requestsPage.followModal.close")}
                    </button>
                </div>
            </form>
        </div>
    );
}

/** نافذة "متابعة المهمة": حالة المهمة + ملاحظات + مرفقات */
function FollowModal({ request, onClose, onConfirm }) {
    const { t } = useTranslation("craftsmanDashboard");
    const [stage, setStage] = useState(request.stage || "");
    const [notes, setNotes] = useState(request.notes || "");
    const [files, setFiles] = useState([]);
    const [error, setError] = useState("");

    const submit = () => {
        if (!stage) {
            setError(t("requestsPage.followModal.stageRequired"));
            return;
        }
        onConfirm({ stage, notes: notes.trim(), files: files.map((f) => f.name) });
    };

    return (
        <RequestModal
            id="follow-title"
            title={t("requestsPage.followModal.title")}
            request={request}
            confirmLabel={t("requestsPage.followModal.confirm")}
            onClose={onClose}
            onSubmit={submit}
        >
            <fieldset className="mt-5">
                <legend className="mb-3 text-[13px] font-semibold text-[#414141]">{t("requestsPage.followModal.stage")}</legend>
                <div className="grid grid-cols-3 gap-3">
                    {TASK_STAGES.map((key) => (
                        <ChoiceButton
                            key={key}
                            active={stage === key}
                            onClick={() => {
                                setStage(key);
                                setError("");
                            }}
                        >
                            {t(`requestsPage.followModal.stages.${key}`)}
                        </ChoiceButton>
                    ))}
                </div>
                {error && <p className="mt-2 text-[11px] text-red-500">{error}</p>}
            </fieldset>

            <label htmlFor="follow-notes" className="mb-1.5 mt-5 block text-[12px] text-[#575757]">
                {t("requestsPage.followModal.notes")}
            </label>
            <textarea
                id="follow-notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("requestsPage.followModal.notesPlaceholder")}
                className={textarea}
            />

            <p className="mb-1.5 mt-5 text-[12px] text-[#575757]">{t("requestsPage.followModal.attachments")}</p>
            <FileDrop id="follow-files" files={files} onChange={setFiles} />
        </RequestModal>
    );
}

/** نافذة "رفض الطلب": تنبيه + سبب الرفض + ملاحظات اختيارية */
function RejectModal({ request, onClose, onConfirm }) {
    const { t } = useTranslation("craftsmanDashboard");
    const [reason, setReason] = useState("");
    const [notes, setNotes] = useState("");
    const [error, setError] = useState("");

    const submit = () => {
        if (!reason) {
            setError(t("requestsPage.rejectModal.reasonRequired"));
            return;
        }
        onConfirm({ reason, notes: notes.trim() });
    };

    return (
        <RequestModal
            id="reject-title"
            title={t("requestsPage.rejectModal.title")}
            request={request}
            confirmLabel={t("requestsPage.rejectModal.confirm")}
            onClose={onClose}
            onSubmit={submit}
        >
            <p role="note" className="mt-4 rounded-xl border border-[#F3C4C4] bg-white px-4 py-3 text-center text-[12px] text-[#D64545]">
                {t("requestsPage.rejectModal.warning")}
            </p>

            <fieldset className="mt-5">
                <legend className="mb-3 text-[12px] text-[#575757]">{t("requestsPage.rejectModal.reason")}</legend>
                <div className="flex flex-wrap gap-3">
                    {REJECT_REASONS.map((key) => (
                        <ChoiceButton
                            key={key}
                            active={reason === key}
                            onClick={() => {
                                setReason(key);
                                setError("");
                            }}
                        >
                            <span className="px-3">{t(`requestsPage.rejectModal.reasons.${key}`)}</span>
                        </ChoiceButton>
                    ))}
                </div>
                {error && <p className="mt-2 text-[11px] text-red-500">{error}</p>}
            </fieldset>

            <label htmlFor="reject-notes" className="mb-1.5 mt-5 block text-[12px] text-[#575757]">
                {t("requestsPage.rejectModal.notes")}
            </label>
            <textarea
                id="reject-notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("requestsPage.rejectModal.notesPlaceholder")}
                className={textarea}
            />
        </RequestModal>
    );
}

/** نافذة "تقديم عرض": القيمة + المدة + موعد البدء + ملاحظات + مرفقات */
function OfferModal({ request, onClose, onConfirm }) {
    const { t } = useTranslation("craftsmanDashboard");
    const s = `requestsPage.sample.${request.id}`;
    const [price, setPrice] = useState("");
    const [duration, setDuration] = useState("");
    const [start, setStart] = useState("");
    const [notes, setNotes] = useState("");
    const [files, setFiles] = useState([]);
    const [errors, setErrors] = useState({});

    const submit = () => {
        const next = {};
        if (!(Number(price) > 0)) next.price = t("requestsPage.offerModal.priceRequired");
        if (!(Number(duration) > 0)) next.duration = t("requestsPage.offerModal.durationRequired");
        if (!start) next.start = t("requestsPage.offerModal.startRequired");
        setErrors(next);
        if (Object.keys(next).length) return;
        onConfirm({
            price: Number(price),
            duration: t("requestsPage.offerModal.days", { count: Number(duration) }),
            start,
            notes: notes.trim(),
            files: files.map((f) => f.name),
        });
    };

    const clearError = (key) => setErrors((e) => ({ ...e, [key]: "" }));

    return (
        <RequestModal
            id="offer-title"
            title={t("requestsPage.offerModal.title")}
            request={request}
            subtitle={t("requestsPage.offerModal.summary", {
                customer: t(`${s}.customer`),
                value: request.value.toLocaleString("en-US"),
            })}
            confirmLabel={t("requestsPage.offerModal.confirm")}
            onClose={onClose}
            onSubmit={submit}
        >
            <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="offer-price" className="mb-1.5 block text-[12px] text-[#575757]">
                        {t("requestsPage.offerModal.price")}
                    </label>
                    <input
                        id="offer-price"
                        type="number"
                        min="1"
                        inputMode="decimal"
                        placeholder="0"
                        value={price}
                        onChange={(e) => {
                            setPrice(e.target.value);
                            clearError("price");
                        }}
                        aria-invalid={!!errors.price}
                        className={input}
                    />
                    {errors.price && <p className="mt-1 text-[11px] text-red-500">{errors.price}</p>}
                </div>
                <div>
                    <label htmlFor="offer-duration" className="mb-1.5 block text-[12px] text-[#575757]">
                        {t("requestsPage.offerModal.duration")}
                    </label>
                    <div className="relative">
                        <input
                            id="offer-duration"
                            type="number"
                            min="1"
                            inputMode="numeric"
                            placeholder="0"
                            value={duration}
                            onChange={(e) => {
                                setDuration(e.target.value);
                                clearError("duration");
                            }}
                            aria-invalid={!!errors.duration}
                            className={`${input} pe-12`}
                        />
                        <span className="pointer-events-none absolute inset-y-0 end-4 flex items-center text-[12px] text-[#575757]">
                            {t("requestsPage.offerModal.day")}
                        </span>
                    </div>
                    {errors.duration && <p className="mt-1 text-[11px] text-red-500">{errors.duration}</p>}
                </div>
            </div>

            <fieldset className="mt-5">
                <legend className="mb-3 text-[12px] text-[#575757]">{t("requestsPage.offerModal.start")}</legend>
                <div className="flex flex-wrap gap-3">
                    {START_OPTIONS.map((key) => (
                        <ChoiceButton
                            key={key}
                            active={start === key}
                            onClick={() => {
                                setStart(key);
                                clearError("start");
                            }}
                        >
                            <span className="px-3">{t(`requestsPage.offerModal.starts.${key}`)}</span>
                        </ChoiceButton>
                    ))}
                </div>
                {errors.start && <p className="mt-2 text-[11px] text-red-500">{errors.start}</p>}
            </fieldset>

            <label htmlFor="offer-notes" className="mb-1.5 mt-5 block text-[12px] text-[#575757]">
                {t("requestsPage.offerModal.notes")}
            </label>
            <textarea
                id="offer-notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("requestsPage.offerModal.notesPlaceholder")}
                className={textarea}
            />

            <p className="mb-1.5 mt-5 text-[12px] text-[#575757]">{t("requestsPage.followModal.attachments")}</p>
            <FileDrop id="offer-files" files={files} onChange={setFiles} />
        </RequestModal>
    );
}

/** نافذة "تفاصيل الطلب": الوصف + المعلومات + المرفقات */
function DetailsModal({ request, onClose, onConfirm }) {
    const { t } = useTranslation("craftsmanDashboard");
    const s = `requestsPage.sample.${request.id}`;
    const [files, setFiles] = useState([]);
    // الملفات اللي انرفعت قبل (من المتابعة أو التفاصيل)
    const savedFiles = request.files || [];

    const rows = [
        { key: "customer", value: t(`${s}.customer`) },
        { key: "value", value: t("requestsPage.valueAmount", { amount: request.value.toLocaleString("en-US") }) },
        { key: "delivery", value: t(`${s}.delivery`) },
        { key: "place", value: t(`${s}.place`) },
    ];

    return (
        <RequestModal
            id="details-title"
            title={t("requestsPage.detailsModal.title")}
            request={request}
            subtitle={t("requestsPage.detailsModal.subtitle", {
                status: t(`requestsPage.statuses.${request.status}`),
                number: request.number,
            })}
            confirmLabel={t("requestsPage.detailsModal.confirm")}
            onClose={onClose}
            onSubmit={() => onConfirm({ files: [...savedFiles, ...files.map((f) => f.name)] })}
        >
            <p className="mb-2 mt-5 text-[12px] text-[#575757]">{t("requestsPage.detailsModal.desc")}</p>
            <p className="rounded-xl border border-[#BFD9EC] px-4 py-3 text-[12px] leading-[1.9] text-[#414141]">{t(`${s}.desc`)}</p>

            <dl className="mt-4 divide-y divide-[#0000001A] border-b border-[#0000001A]">
                {rows.map((row) => (
                    <div key={row.key} className="flex items-center justify-between gap-3 py-3 text-[12px]">
                        <dt className="text-[#575757]">{t(`requestsPage.${row.key}`)}</dt>
                        <dd className="font-medium text-[#414141]">{row.value}</dd>
                    </div>
                ))}
            </dl>

            <p className="mb-1.5 mt-5 text-[12px] text-[#575757]">{t("requestsPage.followModal.attachments")}</p>
            {savedFiles.length > 0 && (
                <ul className="mb-3 flex flex-wrap gap-2">
                    {savedFiles.map((name, i) => (
                        <li key={`${name}-${i}`} className="rounded-full bg-[#EAF3FB] px-3 py-1 text-[11px] text-[#38749E]" dir="ltr">
                            {name}
                        </li>
                    ))}
                </ul>
            )}
            <FileDrop id="details-files" files={files} onChange={setFiles} />
        </RequestModal>
    );
}

/** بطاقة طلب واحد مع "متابعة المهمة" و"رفض" */
function RequestCard({ request, onFollow, onReject, onOffer, onDetails }) {
    const { t } = useTranslation("craftsmanDashboard");
    const s = `requestsPage.sample.${request.id}`;

    const infos = [
        { key: "value", value: t("requestsPage.valueAmount", { amount: request.value.toLocaleString("en-US") }) },
        { key: "customer", value: t(`${s}.customer`) },
        { key: "delivery", value: t(`${s}.delivery`) },
        { key: "place", value: t(`${s}.place`) },
    ];

    // سبب الرفض + الملاحظات (إن وجدت)
    const rejectText =
        request.reason &&
        [t(`requestsPage.rejectModal.reasons.${request.reason}`), request.rejectNotes].filter(Boolean).join(" — ");

    return (
        <li className={`${card} p-5 sm:p-6`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#8EC0E4] text-[#4B9AD2]">
                        <Wrench size={17} />
                    </span>
                    <h2 className="text-[16px] font-bold leading-[1.6] text-[#22455E]">{t(`${s}.title`)}</h2>
                </div>
                <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[request.status]}`}>
                    {t(`requestsPage.statuses.${request.status}`)}
                </span>
            </div>

            <p className="mt-4 text-[13px] leading-[1.9] text-[#575757]">{t(`${s}.desc`)}</p>

            <dl className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                {infos.map((info) => (
                    <div key={info.key} className="rounded-xl border border-[#DCEAF8] bg-[#F4F8FC] px-3 py-3 text-center">
                        <dt className="text-[11px] text-[#89949D]">{t(`requestsPage.${info.key}`)}</dt>
                        <dd className="mt-1.5 text-[12px] font-semibold text-[#414141]">{info.value}</dd>
                    </div>
                ))}
            </dl>

            {request.stage && (
                <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#DCEBFA] px-3 py-1 text-[11px] font-medium text-[#4B9AD2]">
                    <CircleCheck size={13} />
                    {t("requestsPage.followModal.stageLabel", { stage: t(`requestsPage.followModal.stages.${request.stage}`) })}
                </p>
            )}

            {request.offer && (
                <p className="ms-2 mt-4 inline-flex items-center rounded-full bg-[#FFF3D6] px-3 py-1 text-[11px] font-medium text-[#B7791F]">
                    {t("requestsPage.offerLabel", { price: request.offer.price.toLocaleString("en-US"), duration: request.offer.duration })}
                </p>
            )}

            {request.status === "excluded" && rejectText && (
                <p className="mt-4 text-[12px] text-[#D64545]">{t("requestsPage.rejectedBecause", { reason: rejectText })}</p>
            )}

            {request.status === "new" && (
                <div className="mt-5 flex flex-wrap justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => onFollow(request)}
                        className="inline-flex h-11 min-w-[200px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#4B9AD2] px-6 text-[14px] font-semibold text-white btn-wipe"
                    >
                        {t("requestsPage.follow")}
                        <CircleCheck size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => onReject(request)}
                        className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-[#FDE2E2] px-6 text-[14px] font-semibold text-[#D64545] transition-colors hover:bg-[#FBD0D0]"
                    >
                        {t("requestsPage.reject")}
                    </button>
                </div>
            )}

            {/* تمت المراجعة: تفاصيل المتابعة، تقديم العرض، أو الرفض */}
            {request.status === "reviewed" && (
                <div className="mt-5 flex flex-wrap justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => onDetails(request)}
                        className="inline-flex h-11 min-w-[150px] cursor-pointer items-center justify-center rounded-xl border border-[#4B9AD2] px-6 text-[14px] font-semibold text-[#4B9AD2] btn-wipe btn-wipe-outline"
                    >
                        {t("requestsPage.details")}
                    </button>
                    <button
                        type="button"
                        onClick={() => onOffer(request)}
                        className="inline-flex h-11 min-w-[150px] cursor-pointer items-center justify-center rounded-xl bg-[#4B9AD2] px-6 text-[14px] font-semibold text-white btn-wipe"
                    >
                        {t("requestsPage.submitOffer")}
                    </button>
                    <button
                        type="button"
                        onClick={() => onReject(request)}
                        className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-[#FDE2E2] px-6 text-[14px] font-semibold text-[#D64545] transition-colors hover:bg-[#FBD0D0]"
                    >
                        {t("requestsPage.reject")}
                    </button>
                </div>
            )}

            {/* قائمة مختصرة: بعد تقديم العرض بيضل زر التفاصيل بس */}
            {request.status === "shortlisted" && (
                <div className="mt-5 flex justify-end">
                    <button
                        type="button"
                        onClick={() => onDetails(request)}
                        className="inline-flex h-11 min-w-[150px] cursor-pointer items-center justify-center rounded-xl border border-[#4B9AD2] px-6 text-[14px] font-semibold text-[#4B9AD2] btn-wipe btn-wipe-outline"
                    >
                        {t("requestsPage.details")}
                    </button>
                </div>
            )}
        </li>
    );
}

export default function CraftsmanRequests() {
    const { t } = useTranslation("craftsmanDashboard");
    const [tab, setTab] = useState("all");
    // ⚠️ التغييرات (متابعة/رفض) بالصفحة بس لحد ما نربطها بالسيرفر
    const [requests, setRequests] = useState(REQUESTS);
    // النافذة المفتوحة: { request, type: "follow" | "reject" | "offer" | "details" }
    const [dialog, setDialog] = useState(null);
    const [flash, setFlash] = useState("");

    const updateRequest = (id, changes) => setRequests((list) => list.map((r) => (r.id === id ? { ...r, ...changes } : r)));

    const open = (type) => (request) => {
        setFlash("");
        setDialog({ request, type });
    };

    // تأكيد المتابعة: الطلب الجديد بيصير "تمت المراجعة"، والباقي بيحافظ على حالته
    const confirmFollow = ({ stage, notes, files }) => {
        const status = dialog.request.status === "new" ? "reviewed" : dialog.request.status;
        updateRequest(dialog.request.id, { status, stage, notes, files });
        setFlash(t("requestsPage.followModal.saved", { stage: t(`requestsPage.followModal.stages.${stage}`) }));
        setDialog(null);
    };

    // تأكيد الرفض: الطلب بينتقل لـ "مستبعد" مع السبب
    const confirmReject = ({ reason, notes }) => {
        updateRequest(dialog.request.id, { status: "excluded", reason, rejectNotes: notes });
        setFlash(t("requestsPage.rejectModal.done"));
        setDialog(null);
    };

    // تقديم العرض: الطلب بينتقل لـ "قائمة مختصرة" ومعه العرض
    const confirmOffer = (offer) => {
        const s = `requestsPage.sample.${dialog.request.id}`;
        updateRequest(dialog.request.id, { status: "shortlisted", offer });
        setFlash(t("jobs.modal.sent", { org: t(`${s}.customer`) }));
        setDialog(null);
    };

    // تأكيد التفاصيل: بنحفظ المرفقات مع الطلب
    const confirmDetails = ({ files }) => {
        updateRequest(dialog.request.id, { files });
        setFlash(t("requestsPage.detailsModal.saved"));
        setDialog(null);
    };

    const counts = useMemo(() => {
        const c = { all: requests.length };
        requests.forEach((r) => {
            c[r.status] = (c[r.status] || 0) + 1;
        });
        return c;
    }, [requests]);

    const visible = tab === "all" ? requests : requests.filter((r) => r.status === tab);

    return (
        <div className="mx-auto flex max-w-[1000px] flex-col gap-6">
            <StatusTabs
                tabs={TABS.map((key) => ({ key, label: t(`requestsPage.tabs.${key}`), count: counts[key] || 0 }))}
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
                    {visible.map((r) => (
                        <RequestCard
                            key={r.id}
                            request={r}
                            onFollow={open("follow")}
                            onReject={open("reject")}
                            onOffer={open("offer")}
                            onDetails={open("details")}
                        />
                    ))}
                </ul>
            ) : (
                <p className={`${card} px-5 py-12 text-center text-[13px] text-[#89949D]`}>{t("requestsPage.empty")}</p>
            )}

            {dialog?.type === "follow" && (
                <FollowModal
                    key={`follow-${dialog.request.id}`}
                    request={dialog.request}
                    onClose={() => setDialog(null)}
                    onConfirm={confirmFollow}
                />
            )}
            {dialog?.type === "offer" && (
                <OfferModal
                    key={`offer-${dialog.request.id}`}
                    request={dialog.request}
                    onClose={() => setDialog(null)}
                    onConfirm={confirmOffer}
                />
            )}
            {dialog?.type === "details" && (
                <DetailsModal
                    key={`details-${dialog.request.id}`}
                    request={dialog.request}
                    onClose={() => setDialog(null)}
                    onConfirm={confirmDetails}
                />
            )}
            {dialog?.type === "reject" && (
                <RejectModal
                    key={`reject-${dialog.request.id}`}
                    request={dialog.request}
                    onClose={() => setDialog(null)}
                    onConfirm={confirmReject}
                />
            )}
        </div>
    );
}
