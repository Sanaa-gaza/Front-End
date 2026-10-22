import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarDays, ChevronLeft, CircleCheck, Clock, ImagePlus, LockKeyhole, MapPin, X } from "lucide-react";

// ===== بيانات تجريبية =====
// الطلبات الحقيقية موجودة بالسيرفر (GET /service-requests + accept/reject/complete بـ src/api/endpoints.js)،
// بس ما فيها "القيمة المعلن عنها" ولا "الموقع الجغرافي". لما يضيفهم الباك إند، استبدلي REQUESTS بالطلب الحقيقي.
// status: pending (بانتظار الرد) | accepted | rejected | offered (عرض بسعر آخر — بيظهر بتبويب "عروضي")
// urgent: مهلة الرد قربت تخلص (الشريط أصفر)
const REQUESTS = [
    { id: "q1", number: "M2026-001", status: "pending", urgent: true, value: 70, distance: 2 },
    { id: "q2", number: "M2026-002", status: "pending", urgent: false, value: 70, distance: 2 },
    { id: "q3", number: "M2026-003", status: "accepted", value: 300, distance: 4.1 },
    { id: "q4", number: "M2026-004", status: "rejected", value: 450, distance: 9.5, reason: "far" },
    { id: "q5", number: "M2026-005", status: "offered", value: 180, distance: 3.2, offer: { price: 220, duration: "يومين" } },
];

const REJECT_REASONS = ["price", "far", "unavailable", "outOfScope"];
const START_OPTIONS = ["today", "tomorrow", "week"];

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

/** نافذة "تفاصيل الطلب": الوصف + المعلومات، ومنها القبول أو تقديم عرض بسعر آخر */
function DetailsModal({ request, onClose, onAccept, onOffer }) {
    const { t } = useTranslation("craftsmanDashboard");
    const rp = "requestsPage";
    const s = `${rp}.sample.${request.id}`;
    const pending = request.status === "pending";
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

    const rows = [
        { key: "customer", value: t(`${s}.customer`) },
        { key: "value", value: t(`${rp}.valueAmount`, { amount: request.value.toLocaleString("en-US") }) },
        { key: "slot", value: t(`${s}.delivery`) },
        { key: "location", value: t(`${s}.place`) },
    ];

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#141415]/40 p-4 backdrop-blur-[2px]"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="details-title"
                className="flex max-h-[92vh] w-full max-w-[480px] flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_24px_60px_rgba(20,20,21,0.25)]"
            >
                <div className="flex items-start justify-between gap-3 border-b border-[#0000000F] px-6 py-4">
                    <div className="min-w-0">
                        <h2 id="details-title" className="text-[16px] font-bold text-[#141415]">{t(`${s}.title`)}</h2>
                        <p className="mt-1 text-[10px] text-[#89949D]" dir="ltr">#{request.number}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t(`${rp}.page.close`)}
                        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#575757] hover:bg-[#F2F4F6]"
                    >
                        <X size={17} />
                    </button>
                </div>

                <div className="overflow-y-auto px-6 py-5">
                    <p className="text-[12px] font-bold text-[#141415]">{t(`${rp}.detailsModal.desc`)}</p>
                    <p className="mt-2 rounded-xl bg-[#F5F8FB] px-4 py-3 text-[12px] leading-[1.9] text-[#414141]">{t(`${s}.desc`)}</p>
                    <dl className="mt-4 divide-y divide-[#0000000F] rounded-xl border border-[#0000000F] px-4">
                        {rows.map((row) => (
                            <div key={row.key} className="flex items-center justify-between gap-3 py-3 text-[12px]">
                                <dt className="text-[#575757]">{t(`${rp}.page.${row.key}`)}</dt>
                                <dd className="text-end font-semibold text-[#141415]">{row.value}</dd>
                            </div>
                        ))}
                    </dl>
                    {request.offer && (
                        <p className="mt-4 rounded-xl bg-[#FFF8DD] px-4 py-3 text-[12px] text-[#8A6D00]">
                            {t(`${rp}.offerLabel`, { price: request.offer.price.toLocaleString("en-US"), duration: request.offer.duration })}
                        </p>
                    )}
                </div>

                {pending && (
                    <div className="flex gap-3 border-t border-[#0000000F] px-6 py-4">
                        <button
                            type="button"
                            onClick={() => onOffer(request)}
                            className="h-11 flex-1 cursor-pointer rounded-xl border border-[#4B9AD2] bg-white text-[13px] font-semibold text-[#4B9AD2] btn-wipe btn-wipe-outline"
                        >
                            {t(`${rp}.page.otherPrice`)}
                        </button>
                        <button
                            type="button"
                            onClick={() => onAccept(request)}
                            className="h-11 flex-1 cursor-pointer rounded-xl bg-linear-to-l from-[#1591DCCC] to-[#1383C6] text-[13px] font-semibold text-white shadow-[0_4px_10px_rgba(19,131,198,0.3)] btn-wipe ltr:bg-linear-to-r"
                        >
                            {t(`${rp}.page.accept`)}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

/** بطاقة طلب: العنوان + العميل + الموقع والموعد + مهلة الرد + الأزرار حسب الحالة */
function RequestCard({ request, onDetails, onReject }) {
    const { t } = useTranslation("craftsmanDashboard");
    const rp = "requestsPage";
    const s = `${rp}.sample.${request.id}`;
    const customer = t(`${s}.customer`);
    const rejectText =
        request.reason && [t(`${rp}.rejectModal.reasons.${request.reason}`), request.rejectNotes].filter(Boolean).join(" — ");

    return (
        <li className="rounded-[18px] border border-[#0000000D] border-t-2 border-t-[#9CC9EA] bg-white px-4 py-4 shadow-[0_4px_18px_rgba(35,74,100,0.07)] sm:px-5">
            <h2 className="text-[16px] font-bold text-[#141415]">{t(`${s}.title`)}</h2>

            <div className="mt-3 flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#EAF3FB] bg-white text-[12px] font-bold text-[#4B9AD2]">
                    {customer.trim().charAt(0)}
                </span>
                <div>
                    <p className="text-[11px] font-bold text-[#141415]">{customer}</p>
                    <p className="text-[9px] text-[#89949D]">
                        {t(`${rp}.page.customerType`)} . {t(`${rp}.page.distance`, { km: request.distance })}
                    </p>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-10 gap-y-2 text-[11px] text-[#414141]">
                <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#575757]" />
                    <span className="font-bold">{t(`${rp}.page.location`)} :</span> {t(`${s}.place`)}
                </span>
                <span className="flex items-center gap-1.5">
                    <CalendarDays size={13} className="text-[#575757]" />
                    <span className="font-bold">{t(`${rp}.page.slot`)} :</span> {t(`${s}.delivery`)}
                </span>
            </div>

            {/* مهلة الرد (للطلبات بانتظار الرد) */}
            {request.status === "pending" && (
                <p
                    className={`mt-3 flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-semibold ${request.urgent ? "bg-[#FFFAE6] text-[#FFCC00]" : "bg-[#F2F3F5] text-[#575757]"
                        }`}
                >
                    <Clock size={13} />
                    {t(`${s}.deadline`)}
                </p>
            )}
            {request.status === "accepted" && (
                <p className="mt-3 flex items-center gap-2 rounded-full bg-[#E3F6EA] px-3 py-2 text-[10px] font-semibold text-[#1F8A4C]">
                    <CircleCheck size={13} />
                    {t(`${rp}.page.acceptedNote`)}
                </p>
            )}
            {request.status === "rejected" && (
                <p className="mt-3 flex items-center gap-2 rounded-full bg-[#FDECEC] px-3 py-2 text-[10px] font-semibold text-[#D64545]">
                    <X size={13} />
                    {rejectText ? t(`${rp}.rejectedBecause`, { reason: rejectText }) : t(`${rp}.page.rejectedNote`)}
                </p>
            )}
            {request.status === "offered" && request.offer && (
                <p className="mt-3 flex items-center gap-2 rounded-full bg-[#FFF5D6] px-3 py-2 text-[10px] font-semibold text-[#C99400]">
                    <Clock size={13} />
                    {t(`${rp}.offerLabel`, { price: request.offer.price.toLocaleString("en-US"), duration: request.offer.duration })} · {t(`${rp}.page.awaitingCustomer`)}
                </p>
            )}

            <div className="mt-3 flex flex-row-reverse flex-wrap gap-3 border-t border-[#0000000A] pt-3">
                <button
                    type="button"
                    onClick={() => onDetails(request)}
                    className="h-9 w-full cursor-pointer rounded-lg bg-linear-to-l from-[#1591DCCC] to-[#1383C6] text-[11px] font-semibold text-white shadow-[0_3px_8px_rgba(19,131,198,0.25)] btn-wipe sm:w-[130px] ltr:bg-linear-to-r"
                >
                    {t(`${rp}.page.details`)}
                </button>
                {request.status === "pending" && (
                    <button
                        type="button"
                        onClick={() => onReject(request)}
                        className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#F2B8BE] bg-white text-[11px] font-semibold text-[#D64545] transition-colors hover:bg-[#FFF6F6] sm:w-[88px]"
                    >
                        <X size={13} />
                        {t(`${rp}.reject`)}
                    </button>
                )}
            </div>
        </li>
    );
}

// ==================== تبويب "عروضي" ====================

// ⚠️ عروض الحرفي على مناقصات المؤسسات — ما إلها endpoint لسا (النصوص بملف الترجمة: requestsPage.offers.sample.<id>)
// status: pending (مرسل - قيد المراجعة) | closed (أغلق التقديم بانتظار النتيجة) | accepted (تم اختيار عرضك) | rejected
const MY_OFFERS = [
    { id: "o1", ref: "t-2023-028", status: "pending", price: 200 },
    { id: "o2", ref: "t-2023-028", status: "closed", price: 200 },
    { id: "o3", ref: "t-2023-028", status: "accepted", price: 200 },
];
const OFFER_FILTERS = ["all", "accepted", "rejected"];

// ألوان كل حالة (الشارة والشريط اللي تحت)
const OFFER_STYLES = {
    pending: { box: "bg-[#FFF6DC] text-[#A86A4E]", icon: CalendarDays },
    closed: { box: "bg-[#F4F4F4] text-[#919191]", icon: LockKeyhole },
    accepted: { box: "bg-[#E6F9EC] text-[#1FC752]", icon: CircleCheck },
    rejected: { box: "bg-[#FDECEC] text-[#D64545]", icon: X },
};

/** تبويب "عروضي": عروضي على المناقصات + العروض بسعر آخر على الطلبات */
function OffersView({ counterOffers }) {
    const { t } = useTranslation("craftsmanDashboard");
    const navigate = useNavigate();
    const of = "requestsPage.offers";
    const [filter, setFilter] = useState("all");

    // العروض بسعر آخر على طلبات العملاء بتنضاف بحالة "قيد المراجعة"
    const offers = [
        ...MY_OFFERS.map((o) => ({
            ...o,
            org: t(`${of}.sample.${o.id}.org`),
            title: t(`${of}.sample.${o.id}.title`),
            duration: t(`${of}.sample.${o.id}.duration`),
            note: t(`${of}.notes.${o.status}`, t(`${of}.sample.${o.id}.noteArgs`, { returnObjects: true }) || {}),
        })),
        ...counterOffers.map((r) => ({
            id: r.id,
            ref: r.number,
            status: "pending",
            price: r.offer.price,
            org: t(`requestsPage.sample.${r.id}.customer`),
            title: t(`requestsPage.sample.${r.id}.title`),
            duration: r.offer.duration,
            note: t(`${of}.notes.awaitingCustomer`),
        })),
    ];
    const visible = offers.filter((o) => filter === "all" || o.status === filter);

    return (
        <div className="flex flex-col gap-4">
            <div role="tablist" className="flex flex-wrap gap-3">
                {OFFER_FILTERS.map((key) => {
                    const active = filter === key;
                    return (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => setFilter(key)}
                            className={`h-10 cursor-pointer rounded-full px-5 text-[11px] font-semibold transition-colors ${active
                                ? "min-w-[60px] bg-[#4B9AD2] text-white shadow-[0_4px_12px_rgba(75,154,210,0.3)]"
                                : "border border-[#E3E7EB] bg-white text-[#4B9AD2] hover:border-[#BFDCF1]"
                                }`}
                        >
                            {t(`${of}.filters.${key}`)}
                        </button>
                    );
                })}
            </div>

            {visible.length ? (
                <ul className="flex flex-col gap-3">
                    {visible.map((o) => {
                        const { box, icon: Icon } = OFFER_STYLES[o.status];
                        const accepted = o.status === "accepted";
                        return (
                            <li key={o.id} className="rounded-[18px] border border-[#0000000D] border-t-2 border-t-[#9CC9EA] bg-white px-4 py-4 shadow-[0_4px_18px_rgba(35,74,100,0.07)] sm:px-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#EAF3FB] bg-white text-[12px] font-bold text-[#4B9AD2]">
                                            {o.org.trim().charAt(0)}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate text-[12px] font-bold text-[#141415]">{o.org}</p>
                                            <p className="mt-0.5 text-[10px] text-[#575757]" dir="ltr">{o.ref}</p>
                                        </div>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-medium ${box}`}>{t(`${of}.statuses.${o.status}`)}</span>
                                </div>

                                <h2 className="mt-3 text-[15px] font-bold text-[#141415]">{o.title}</h2>
                                <p className="mt-2.5 flex flex-wrap gap-x-10 gap-y-1 text-[11px] text-[#414141]">
                                    <span>
                                        <span className="font-bold">{t(`${of}.duration`)} :</span> {o.duration}
                                    </span>
                                    <span>
                                        <span className="font-bold">{t(`${of}.myOffer`)} :</span>{" "}
                                        <span className="tabular-nums">{t(`${of}.price`, { amount: o.price.toLocaleString("en-US") })}</span>
                                    </span>
                                </p>

                                {accepted ? (
                                    <button
                                        type="button"
                                        onClick={() => navigate("/dashboard/craftsman/current")}
                                        className={`mt-3 flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-[11px] font-semibold transition-opacity hover:opacity-90 ${box}`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <Icon size={14} />
                                            {o.note}
                                        </span>
                                        <ChevronLeft size={15} className="ltr:rotate-180" />
                                    </button>
                                ) : (
                                    <p className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-semibold ${box}`}>
                                        <Icon size={14} />
                                        {o.note}
                                    </p>
                                )}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className={`${card} px-5 py-12 text-center text-[13px] text-[#89949D]`}>{t(`${of}.empty`)}</p>
            )}
        </div>
    );
}

/** طلبات الحرفي: الواردة (بانتظار الرد / مقبولة / مرفوضة) + عروضي */
export default function CraftsmanRequests() {
    const { t } = useTranslation("craftsmanDashboard");
    const rp = "requestsPage";
    const [view, setView] = useState("incoming");
    const [filter, setFilter] = useState("pending");
    // ⚠️ القبول/الرفض/العروض بالصفحة بس لحد ما نربطها بالسيرفر
    const [requests, setRequests] = useState(REQUESTS);
    // النافذة المفتوحة: { request, type: "details" | "reject" | "offer" }
    const [dialog, setDialog] = useState(null);
    const [flash, setFlash] = useState("");

    const updateRequest = (id, changes) => setRequests((list) => list.map((r) => (r.id === id ? { ...r, ...changes } : r)));
    const open = (type) => (request) => {
        setFlash("");
        setDialog({ request, type });
    };

    const accept = (request) => {
        updateRequest(request.id, { status: "accepted" });
        setFlash(t(`${rp}.page.acceptedFlash`, { customer: t(`${rp}.sample.${request.id}.customer`) }));
        setDialog(null);
    };

    const confirmReject = ({ reason, notes }) => {
        updateRequest(dialog.request.id, { status: "rejected", reason, rejectNotes: notes });
        setFlash(t(`${rp}.rejectModal.done`));
        setDialog(null);
    };

    // عرض بسعر آخر: الطلب بينتقل لتبويب "عروضي"
    const confirmOffer = (offer) => {
        updateRequest(dialog.request.id, { status: "offered", offer });
        setFlash(t("jobs.modal.sent", { org: t(`${rp}.sample.${dialog.request.id}.customer`) }));
        setDialog(null);
    };

    const pendingCount = requests.filter((r) => r.status === "pending").length;
    const visible = requests.filter((r) => r.status === filter);

    return (
        <div className="mx-auto flex max-w-[1000px] flex-col gap-5">
            <h1 className="text-[24px] font-bold text-[#22303C]">{t(`${rp}.page.title`)}</h1>

            {/* الواردة / عروضي */}
            <div role="tablist" className="mt-6 flex gap-16 ps-3 sm:gap-20">
                {["incoming", "offers"].map((key) => {
                    const active = view === key;
                    return (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => {
                                setView(key);
                                setFlash("");
                            }}
                            className={`relative cursor-pointer px-1 pb-3 text-[19px] font-bold text-[#4B9AD2] transition-opacity ${active ? "" : "opacity-90 hover:opacity-100"}`}
                        >
                            {t(`${rp}.page.views.${key}`)}
                            {active && <span aria-hidden="true" className="absolute inset-x-[-10px] bottom-0 h-[1.5px] rounded-full bg-[#4B9AD2]" />}
                        </button>
                    );
                })}
            </div>

            {/* فلتر الواردة */}
            {view === "incoming" && (
                <div role="tablist" className="mt-2 flex flex-wrap gap-3">
                    {["pending", "accepted", "rejected"].map((key) => {
                        const active = filter === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => {
                                    setFilter(key);
                                    setFlash("");
                                }}
                                className={`flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-4 text-[11px] font-semibold transition-colors ${active
                                    ? "bg-[#4B9AD2] text-white shadow-[0_4px_12px_rgba(75,154,210,0.3)]"
                                    : "border border-[#E3E7EB] bg-white text-[#4B9AD2] hover:border-[#BFDCF1]"
                                    }`}
                            >
                                {t(`${rp}.page.filters.${key}`)}
                                {key === "pending" && pendingCount > 0 && <span className="tabular-nums">{pendingCount}</span>}
                            </button>
                        );
                    })}
                </div>
            )}

            {flash && <p role="status" className="rounded-lg border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-3 text-[13px] text-[#2E9E5B]">{flash}</p>}

            {view === "offers" ? (
                <OffersView counterOffers={requests.filter((r) => r.status === "offered")} />
            ) : visible.length ? (
                <ul className="flex flex-col gap-4">
                    {visible.map((r) => (
                        <RequestCard key={r.id} request={r} onDetails={open("details")} onReject={open("reject")} />
                    ))}
                </ul>
            ) : (
                <p className={`${card} px-5 py-12 text-center text-[13px] text-[#89949D]`}>
                    {t(`${rp}.page.empty.${filter}`)}
                </p>
            )}

            {dialog?.type === "details" && (
                <DetailsModal
                    key={`details-${dialog.request.id}`}
                    request={dialog.request}
                    onClose={() => setDialog(null)}
                    onAccept={accept}
                    onOffer={(request) => setDialog({ request, type: "offer" })}
                />
            )}
            {dialog?.type === "offer" && (
                <OfferModal key={`offer-${dialog.request.id}`} request={dialog.request} onClose={() => setDialog(null)} onConfirm={confirmOffer} />
            )}
            {dialog?.type === "reject" && (
                <RejectModal key={`reject-${dialog.request.id}`} request={dialog.request} onClose={() => setDialog(null)} onConfirm={confirmReject} />
            )}
        </div>
    );
}
