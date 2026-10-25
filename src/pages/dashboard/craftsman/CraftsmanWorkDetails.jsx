import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Camera, Check, ChevronDown, CircleCheck, Clock, Flag, ImageIcon, Info, LockKeyhole, MessageSquare, PencilLine, Plus, Send, SendHorizontal, ShieldCheck, TriangleAlert, Wrench, X } from "lucide-react";
import { WORKS } from "./CraftsmanCurrent";

const BASE = "/dashboard/craftsman";
const box = "rounded-[20px] border border-[#0000001A] bg-white";

// شريط الحالة أعلى الصفحة (نفس ألوان شريط البطاقة بالأعمال الجارية)
// scheduled = المبلغ محجوز وموعد التنفيذ لسا ما إجا (العدّاد)، accepted = التنفيذ شغّال (زر "تم إنجاز العمل")
const BANNERS = {
    scheduled: { style: "border-[#A5FFC9] bg-[#A5FFC9]/25 text-[#03C03C]", icon: ShieldCheck, showAmount: true },
    accepted: { style: "border-[#A5FFC9] bg-[#A5FFC9]/25 text-[#03C03C]", icon: ShieldCheck, showAmount: false },
    awaitingPayment: { style: "border-[#F3D66B] bg-[#FFF7D6] text-[#9A7400]", icon: Clock, showAmount: true },
    awaitingConfirm: { style: "border-[#C7E0F1] bg-[#C7E0F1]/35 text-[#4B9AD2]", icon: Clock, showAmount: true },
};

// ⚠️ صور الطلب والمحادثة تجريبية لحد ما يصير في endpoint لتفاصيل الطلب والمحادثات
const PHOTOS = 4;

// صور التسليم بنافذة "إعلان انتهاء العمل"
const MAX_DONE_PHOTOS = 5;

/** صورة مرفوعة بالنافذة (معاينة + زر حذف) */
function DonePhoto({ file, onRemove, removeLabel, label, size = "aspect-square" }) {
    const [url, setUrl] = useState("");
    useEffect(() => {
        const u = URL.createObjectURL(file);
        setUrl(u);
        return () => URL.revokeObjectURL(u);
    }, [file]);
    return (
        <li className={`relative ${size} overflow-hidden rounded-xl bg-[#E4EFFA]`}>
            {url && <img src={url} alt="" className="h-full w-full object-cover" />}
            <button
                type="button"
                onClick={onRemove}
                aria-label={removeLabel}
                className="absolute end-1.5 top-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-[#3F4650] text-white hover:bg-[#1E293B]"
            >
                <X size={12} strokeWidth={2.5} />
            </button>
            {label && <span className="absolute bottom-1.5 end-1.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[9px] text-[#475569]">{label}</span>}
        </li>
    );
}

/** نافذة "إعلان انتهاء العمل": تنبيه + ملخص الإنجاز (مطلوب) + صور التسليم (اختياري) */
function DoneModal({ institution, onClose, onConfirm }) {
    const { t } = useTranslation("craftsmanDashboard");
    const d = "currentPage.details.doneModal";
    const closeRef = useRef(null);
    const fileRef = useRef(null);
    const [summary, setSummary] = useState("");
    const [photos, setPhotos] = useState([]);
    const [error, setError] = useState("");

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

    const pick = () => fileRef.current?.click();

    return (
        <div
            className="fixed inset-0 z-[60] overflow-y-auto bg-[#0F172A]/40 px-4 py-8 backdrop-blur-[2px]"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="done-title"
                noValidate
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!summary.trim()) {
                        setError(t(`${d}.required`));
                        return;
                    }
                    onConfirm({ summary: summary.trim(), files: photos });
                }}
                className="mx-auto w-full max-w-[440px] rounded-[22px] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.25)]"
            >
                <div className="relative border-b border-[#0000000F] px-12 py-4 text-center">
                    <h2 id="done-title" className="text-[17px] font-bold text-[#1E293B]">{t(`${d}.title`)}</h2>
                    <button
                        ref={closeRef}
                        type="button"
                        onClick={onClose}
                        aria-label={t(`${d}.close`)}
                        className="absolute end-3 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#89949D] hover:bg-[#F4F7FA] hover:text-[#475569]"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex flex-col gap-4 px-5 pb-5 pt-4">
                    <p role="note" className="flex items-center gap-2.5 rounded-xl border border-[#F3D66B] bg-[#FFF7D6] px-4 py-3 text-[12px] text-[#9A7400]">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F2C200]/30">
                            <TriangleAlert size={13} />
                        </span>
                        {t(`${d}.${institution ? "noticeOrg" : "noticeCustomer"}`)}
                    </p>

                    <div>
                        <label htmlFor="done-summary" className="mb-1.5 block text-[13px] font-bold text-[#1E293B]">
                            {t(`${d}.summary`)}
                            <span className="ms-0.5 text-red-500">*</span>
                        </label>
                        <textarea
                            id="done-summary"
                            rows={4}
                            value={summary}
                            onChange={(e) => {
                                setSummary(e.target.value);
                                setError("");
                            }}
                            aria-invalid={!!error}
                            placeholder={t(`${d}.summaryPlaceholder`)}
                            className="w-full resize-none rounded-xl border border-[#CFE3F3] bg-white px-4 py-3 text-[13px] leading-[1.9] text-[#1E293B] outline-none placeholder:text-[#A9B3BB] focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2] aria-[invalid=true]:border-red-400"
                        />
                        <div className="mt-1 flex items-center justify-between gap-3">
                            {error ? <p className="text-[11px] text-red-500">{error}</p> : <span />}
                            <span className="text-[10px] text-[#A9B3BB] tabular-nums">{t(`${d}.chars`, { count: summary.trim().length })}</span>
                        </div>
                    </div>

                    <div>
                        <div className="mb-1.5 flex items-baseline justify-between gap-3">
                            <p className="text-[13px] font-bold text-[#1E293B]">
                                {t(`${d}.photos`)} <span className="text-[11px] font-normal text-[#89949D]">{t(`${d}.optional`)}</span>
                            </p>
                            <span className="text-[11px] font-semibold text-[#3D8BC9]">{t(`${d}.photosCount`, { count: photos.length, max: MAX_DONE_PHOTOS })}</span>
                        </div>
                        <ul className="grid grid-cols-3 gap-3">
                            {photos.map((f, i) => (
                                <DonePhoto
                                    key={`${f.name}-${i}`}
                                    file={f}
                                    label={t(`${d}.attached`)}
                                    size="h-[86px]"
                                    removeLabel={t(`${d}.remove`)}
                                    onRemove={() => setPhotos((list) => list.filter((_, j) => j !== i))}
                                />
                            ))}
                            {photos.length < MAX_DONE_PHOTOS && (
                                <li>
                                    <button
                                        type="button"
                                        onClick={pick}
                                        className="flex h-[86px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#4B9AD2] bg-[#EEF5FC] text-[12px] font-bold text-[#286292] transition-colors hover:bg-[#E4EFFA]"
                                    >
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#4B9AD2]">
                                            <Camera size={15} />
                                        </span>
                                        {t(`${d}.add`)}
                                    </button>
                                </li>
                            )}
                            {photos.length < MAX_DONE_PHOTOS - 1 && (
                                <li>
                                    <button
                                        type="button"
                                        onClick={pick}
                                        className="flex h-[86px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#C9DDED] bg-[#F7FAFD] text-[12px] text-[#89949D] transition-colors hover:border-[#8EC0E4]"
                                    >
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#8EC0E4]">
                                            <Plus size={15} />
                                        </span>
                                        {t(`${d}.another`)}
                                    </button>
                                </li>
                            )}
                        </ul>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                                const picked = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
                                setPhotos((list) => [...list, ...picked].slice(0, MAX_DONE_PHOTOS));
                                e.target.value = "";
                            }}
                        />
                    </div>
                </div>

                <div className="border-t border-[#0000000F] px-5 py-4">
                    <button
                        type="submit"
                        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-l from-[#1A78BE] to-[#5BAEE4] text-[14px] font-semibold text-white shadow-[0_6px_16px_rgba(26,120,190,0.3)] btn-wipe ltr:bg-linear-to-r"
                    >
                        <Check size={17} strokeWidth={2.5} />
                        {t(`${d}.confirm`)}
                    </button>
                </div>
            </form>
        </div>
    );
}

/**
 * المحادثة: رسائل الحرفي (أزرق)، الطرف الثاني (أبيض)، ورسائل النظام (أخضر بالنص).
 * initial: الرسائل الأولية (افتراضياً رسائل العيّنة)
 */
function Chat({ initial }) {
    const { t } = useTranslation("craftsmanDashboard");
    const d = "currentPage.details";
    const [messages, setMessages] = useState(() => {
        const list = initial ?? t(`${d}.messages`, { returnObjects: true });
        return (Array.isArray(list) ? list : []).map((m, i) => ({ ...m, id: `m${i}` }));
    });
    const [draft, setDraft] = useState("");
    const listRef = useRef(null);
    const fileRef = useRef(null);

    // آخر رسالة دايماً ظاهرة
    useEffect(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages.length]);

    // ⚠️ الإرسال محلي بس لحد ما يصير في endpoint للمحادثات
    const add = (text) => setMessages((list) => [...list, { id: `m${Date.now()}`, from: "me", text }]);

    return (
        <section className={`${box} flex h-[520px] flex-col overflow-hidden border-t-2 border-t-[#9CC9EA] lg:h-auto lg:min-h-[480px] lg:flex-1`}>
            <div ref={listRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                {messages.map((m) =>
                    m.from === "system" ? (
                        <p key={m.id} className="self-center rounded-full bg-[#E6F9EC] px-3 py-1.5 text-center text-[9px] leading-[1.7] text-[#2EAF4E]">
                            {m.text}
                        </p>
                    ) : (
                        <p
                            key={m.id}
                            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[11px] leading-[1.8] ${m.from === "me"
                                ? "self-start bg-[#4B87BE] text-white"
                                : "self-end border border-[#0000001A] bg-white text-[#1E293B]"
                                }`}
                        >
                            {m.text}
                        </p>
                    )
                )}
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!draft.trim()) return;
                    add(draft.trim());
                    setDraft("");
                }}
                className="flex items-center gap-2 p-3"
            >
                <div className="relative flex-1">
                    <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder={t(`${d}.chatPlaceholder`)}
                        aria-label={t(`${d}.chatPlaceholder`)}
                        className="h-10 w-full rounded-xl border border-[#0000001A] bg-white pe-10 ps-3 text-[11px] text-[#414141] outline-none placeholder:text-[#A9B3BB] focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]"
                    />
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        aria-label={t(`${d}.attach`)}
                        title={t(`${d}.attach`)}
                        className="absolute end-2 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#475569] hover:bg-[#F4F7FA]"
                    >
                        <Plus size={17} />
                    </button>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) add(`📎 ${f.name}`);
                            e.target.value = "";
                        }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={!draft.trim()}
                    aria-label={t(`${d}.send`)}
                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#0000001A] text-[#475569] transition-colors hover:border-[#4B9AD2] hover:text-[#4B9AD2] disabled:cursor-default disabled:opacity-60"
                >
                    <SendHorizontal size={17} className="rotate-180 ltr:rotate-0" />
                </button>
            </form>
        </section>
    );
}

// ==================== تفاصيل مشروع مؤسسة (مناقصة) ====================

// مراحل المشروع: الترسية → دفع المؤسسة → التنفيذ → التسليم → مكتمل
const PROJECT_STEPS = ["awarded", "payment", "execution", "delivery", "completed"];
// المرحلة الحالية حسب حالة العمل
const PROJECT_STEP = { awaitingPayment: 1, scheduled: 2, accepted: 2, awaitingConfirm: 3 };
// الحالات اللي فيها المبلغ محجوز للحرفي (بطاقة "محجوز لك لدى صنعة")
const HELD = ["scheduled", "accepted"];
const PROJECT_TABS = ["details", "log", "chat"];

/** شريط مراحل المشروع: المنتهية خضرا بعلامة ✓، الحالية صفرا (الدفع) أو زرقا، والجاية رمادية */
function ProjectSteps({ current, institution }) {
    const { t } = useTranslation("craftsmanDashboard");
    return (
        <ol className="flex items-start">
            {PROJECT_STEPS.map((key, i) => {
                const done = i < current;
                const active = i === current;
                return (
                    <li key={key} className="relative flex flex-1 flex-col items-center gap-2 text-center">
                        {/* الخط الواصل بالمرحلة اللي قبلها */}
                        {i > 0 && (
                            <span aria-hidden="true" className={`absolute end-1/2 top-[17px] h-1 w-full ${i <= current ? "bg-[#10B981]" : "bg-[#EEF1F4]"}`} />
                        )}
                        <span
                            className={`relative z-[1] flex h-9 w-9 items-center justify-center rounded-full ${done
                                ? "bg-[#10B981] text-white"
                                : active
                                    ? i === 1
                                        ? "bg-[#F2C200]"
                                        : "bg-[#3D8BC9]"
                                    : "border-2 border-[#DDE3E8] bg-[#F7FAFD]"
                                }`}
                        >
                            {done && <Check size={16} strokeWidth={3} />}
                        </span>
                        <span aria-current={active ? "step" : undefined} className={`text-[12px] ${done || active ? "font-bold text-[#1E293B]" : "text-[#89949D]"}`}>
                            {t(`currentPage.details.project.steps.${key === "payment" && !institution ? "customerPayment" : key}`)}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}

/** أيام التنفيذ (حتى 7 أيام): اسم اليوم + التاريخ، واليوم الحالي (current) مميّز بالأزرق */
function DaysStrip({ start, days, current }) {
    const { t } = useTranslation("craftsmanDashboard");
    const first = new Date(start);
    const weekdays = t("currentPage.details.project.countdown.weekdays", { returnObjects: true });
    const schedule = Array.from({ length: Math.min(days, 7) }, (_, i) => new Date(first.getFullYear(), first.getMonth(), first.getDate() + i));
    return (
        <ul className="grid grid-cols-7 gap-1.5">
            {schedule.map((date, i) => (
                <li
                    key={date.toISOString()}
                    aria-current={i === current ? "date" : undefined}
                    className={`rounded-lg py-2 text-center ${i === current ? "bg-[#3D8BC9] text-white" : "bg-[#EEF2F6] text-[#1E293B]"}`}
                >
                    <span className={`block text-[9px] ${i === current ? "text-white/85" : "text-[#89949D]"}`}>
                        {Array.isArray(weekdays) ? weekdays[date.getDay()] : ""}
                    </span>
                    <span className="mt-0.5 block text-[12px] font-bold tabular-nums">{date.getDate()}</span>
                </li>
            ))}
        </ul>
    );
}

// كاتب كل تحديث بسجل التنفيذ: الأيقونة على الخط ولون الاسم
const LOG_AUTHORS = {
    me: { icon: PencilLine, dot: "bg-[#EAF3FB] text-[#3D8BC9]", name: "text-[#3D8BC9]" },
    org: { icon: MessageSquare, dot: "bg-[#EAF3FB] text-[#3D8BC9]", name: "text-[#1E293B]" },
    system: { icon: Flag, dot: "bg-[#E6F9EC] text-[#10B981]", name: "text-[#10B981]" },
};
// ألوان الصور التجريبية بسجل التنفيذ (لحد ما تيجي صور حقيقية)
const SAMPLE_PHOTO_COLORS = ["bg-[#A9C7E2]", "bg-[#A8DDB5]", "bg-[#CBD3DC]"];

/** تحديث واحد بسجل التنفيذ: الكاتب + الوقت + العنوان + النص + الصور. الأحدث (latest) بإطار أزرق */
function LogEntry({ entry, ownerName, latest }) {
    const { t } = useTranslation("craftsmanDashboard");
    const a = LOG_AUTHORS[entry.author] || LOG_AUTHORS.system;
    const name = entry.author === "org" ? ownerName : t(`currentPage.details.project.authors.${entry.author}`);
    return (
        <li className="relative flex gap-3 ps-0.5">
            <span className={`relative z-[1] mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${a.dot}`}>
                <a.icon size={13} />
            </span>
            <article
                className={`min-w-0 flex-1 rounded-xl border p-3.5 ${latest
                    ? "border-[#8EC0E4] bg-white shadow-[0_0_0_3px_rgba(142,192,228,0.18)]"
                    : entry.author === "org"
                        ? "border-[#0000000F] bg-[#F7F9FB]"
                        : "border-[#0000001A] bg-white"
                    }`}
            >
                <p className="flex items-center justify-between gap-3 text-[10px]">
                    <span className={`font-semibold ${a.name}`}>{name}</span>
                    <span className="text-[#A9B3BB]">{entry.time}</span>
                </p>
                <h3 className="mt-1.5 text-[13px] font-bold text-[#1E293B]">{entry.title}</h3>
                <p className="mt-1 text-[12px] leading-[1.8] text-[#475569]">{entry.text}</p>
                {(entry.urls?.length || entry.photos > 0) && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                        {entry.urls
                            ? entry.urls.map((url) => (
                                <li key={url} className="h-14 w-[72px] overflow-hidden rounded-lg">
                                    <img src={url} alt="" className="h-full w-full object-cover" />
                                </li>
                            ))
                            : Array.from({ length: entry.photos }, (_, i) => (
                                <li
                                    key={i}
                                    className={`flex h-14 w-[72px] items-center justify-center rounded-lg text-white/80 ${SAMPLE_PHOTO_COLORS[i % SAMPLE_PHOTO_COLORS.length]}`}
                                >
                                    <ImageIcon size={14} />
                                </li>
                            ))}
                    </ul>
                )}
            </article>
        </li>
    );
}

// أقصى عدد صور بتحديث التنفيذ
const MAX_UPDATE_PHOTOS = 5;

/** نافذة "إضافة تحديث" أثناء التنفيذ: عنوان + تفاصيل + صور (اختياري) — بينضاف لسجل التنفيذ */
function UpdateModal({ onClose, onAdd }) {
    const { t } = useTranslation("craftsmanDashboard");
    const u = "currentPage.details.project.update";
    const closeRef = useRef(null);
    const fileRef = useRef(null);
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [photos, setPhotos] = useState([]);
    const [errors, setErrors] = useState({});

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

    const pick = () => fileRef.current?.click();
    const field =
        "w-full rounded-xl border border-[#8EC0E4] bg-white text-[13px] text-[#1E293B] outline-none placeholder:text-[#A9B3BB] focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2] aria-[invalid=true]:border-red-400";
    const label = "text-[13px] font-bold text-[#1E293B]";
    const Req = () => <span className="ms-0.5 text-red-500">*</span>;

    return (
        <div
            className="fixed inset-0 z-[60] overflow-y-auto bg-[#0F172A]/40 px-4 py-8 backdrop-blur-[2px]"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="update-title"
                noValidate
                onSubmit={(e) => {
                    e.preventDefault();
                    const next = {};
                    if (!title.trim()) next.title = t(`${u}.required`);
                    if (!text.trim()) next.text = t(`${u}.required`);
                    setErrors(next);
                    if (Object.keys(next).length) return;
                    onAdd({ title: title.trim(), text: text.trim(), files: photos });
                }}
                className="mx-auto w-full max-w-[440px] rounded-[22px] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.25)]"
            >
                <div className="relative border-b border-[#0000000F] px-12 py-4 text-center">
                    <h2 id="update-title" className="text-[17px] font-bold text-[#1E293B]">{t(`${u}.title`)}</h2>
                    <p className="mt-1 text-[11px] text-[#89949D]">{t(`${u}.subtitle`)}</p>
                    <button
                        ref={closeRef}
                        type="button"
                        onClick={onClose}
                        aria-label={t("currentPage.details.doneModal.close")}
                        className="absolute end-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#89949D] hover:bg-[#F4F7FA] hover:text-[#475569]"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex flex-col gap-4 px-5 pb-5 pt-4">
                    <div>
                        <div className="mb-1.5 flex items-baseline justify-between gap-3">
                            <label htmlFor="update-title-input" className={label}>
                                {t(`${u}.titleLabel`)}
                                <Req />
                            </label>
                            <span className="text-[11px] text-[#89949D]">{t(`${u}.titleHint`)}</span>
                        </div>
                        <div className="relative">
                            <input
                                id="update-title-input"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    setErrors((er) => ({ ...er, title: "" }));
                                }}
                                aria-invalid={!!errors.title}
                                placeholder={t(`${u}.titlePlaceholder`)}
                                className={`${field} h-12 pe-11 ps-4 font-semibold`}
                            />
                            {title.trim() && <CircleCheck size={18} className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />}
                        </div>
                        {errors.title && <p className="mt-1 text-[11px] text-red-500">{errors.title}</p>}
                    </div>

                    <div>
                        <div className="mb-1.5 flex items-baseline justify-between gap-3">
                            <label htmlFor="update-text" className={label}>
                                {t(`${u}.details`)}
                                <Req />
                            </label>
                            <span className="text-[11px] text-[#89949D]">{t(`${u}.detailsHint`)}</span>
                        </div>
                        <textarea
                            id="update-text"
                            rows={4}
                            value={text}
                            onChange={(e) => {
                                setText(e.target.value);
                                setErrors((er) => ({ ...er, text: "" }));
                            }}
                            aria-invalid={!!errors.text}
                            placeholder={t(`${u}.placeholder`)}
                            className={`${field} resize-none border-[#CFE3F3] px-4 py-3 leading-[1.9]`}
                        />
                        {errors.text && <p className="mt-1 text-[11px] text-red-500">{errors.text}</p>}
                    </div>

                    <div>
                        <div className="mb-1.5 flex items-baseline justify-between gap-3">
                            <span className={label}>{t(`${u}.photos`)}</span>
                            <span className="text-[11px] text-[#89949D]">{t(`${u}.photosCount`, { count: photos.length, max: MAX_UPDATE_PHOTOS })}</span>
                        </div>
                        <ul className="grid grid-cols-3 gap-3">
                            {photos.map((f, i) => (
                                <DonePhoto
                                    key={`${f.name}-${i}`}
                                    file={f}
                                    label={t(`${u}.attached`)}
                                    size="h-[86px]"
                                    removeLabel={t("currentPage.details.doneModal.remove")}
                                    onRemove={() => setPhotos((list) => list.filter((_, j) => j !== i))}
                                />
                            ))}
                            {photos.length < MAX_UPDATE_PHOTOS && (
                                <li>
                                    <button
                                        type="button"
                                        onClick={pick}
                                        className="flex h-[86px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#4B9AD2] bg-[#EEF5FC] text-[12px] font-bold text-[#286292] transition-colors hover:bg-[#E4EFFA]"
                                    >
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#4B9AD2]">
                                            <Camera size={15} />
                                        </span>
                                        {t(`${u}.addPhoto`)}
                                    </button>
                                </li>
                            )}
                            {photos.length < MAX_UPDATE_PHOTOS - 1 && (
                                <li>
                                    <button
                                        type="button"
                                        onClick={pick}
                                        className="flex h-[86px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#C9DDED] bg-[#F7FAFD] text-[12px] text-[#89949D] transition-colors hover:border-[#8EC0E4]"
                                    >
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#8EC0E4]">
                                            <Plus size={15} />
                                        </span>
                                        {t(`${u}.anotherPhoto`)}
                                    </button>
                                </li>
                            )}
                        </ul>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                                const picked = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
                                setPhotos((list) => [...list, ...picked].slice(0, MAX_UPDATE_PHOTOS));
                                e.target.value = "";
                            }}
                        />
                    </div>
                </div>

                <div className="border-t border-[#0000000F] px-5 py-4">
                    <button
                        type="submit"
                        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-l from-[#1A78BE] to-[#5BAEE4] text-[14px] font-semibold text-white shadow-[0_6px_16px_rgba(26,120,190,0.3)] btn-wipe ltr:bg-linear-to-r"
                    >
                        <Send size={16} className="rtl:-scale-x-100" />
                        {t(`${u}.submit`)}
                    </button>
                </div>
            </form>
        </div>
    );
}

/** "يبدأ التنفيذ بعد": عدّاد (أيام/ساعات/دقائق) + أيام التنفيذ، وبيبلّغ لما يوصل الموعد */
function Countdown({ start, days, onStart }) {
    const { t } = useTranslation("craftsmanDashboard");
    const c = "currentPage.details.project.countdown";
    const [now, setNow] = useState(() => Date.now());
    const startMs = new Date(start).getTime();
    const left = Math.max(0, startMs - now);

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 30000);
        return () => clearInterval(id);
    }, []);
    // الحالة بتتغير لحالها لـ"قيد التنفيذ" بالموعد
    useEffect(() => {
        if (left === 0) onStart();
    }, [left, onStart]);

    const units = [
        { key: "days", value: Math.floor(left / 86400000) },
        { key: "hours", value: Math.floor(left / 3600000) % 24 },
        { key: "minutes", value: Math.floor(left / 60000) % 60 },
    ];

    return (
        <section className="rounded-[20px] border border-[#DCEAF8] bg-[#F5F9FD] p-4">
            <h2 className="text-[12px] font-bold text-[#1E293B]">{t(`${c}.title`)}</h2>
            <dl className="mt-3 grid grid-cols-3 gap-3">
                {units.map(({ key, value }) => (
                    <div key={key} className="rounded-xl border border-[#0000001A] bg-white py-3 text-center">
                        <dd className="text-[16px] font-bold text-[#3D8BC9] tabular-nums">{value}</dd>
                        <dt className="mt-1 text-[10px] text-[#89949D]">{t(`${c}.${key}`)}</dt>
                    </div>
                ))}
            </dl>
            {/* أيام التنفيذ — أول يوم مميّز */}
            <div className="mt-3">
                <DaysStrip start={start} days={days} current={0} />
            </div>
            <p className="mt-3 flex items-center justify-between gap-2 text-[10px] text-[#475569]">
                {t(`${c}.note`)}
                <Info size={12} className="shrink-0 text-[#89949D]" />
            </p>
        </section>
    );
}

/**
 * تفاصيل عمل جاري (طلب عميل أو مشروع مؤسسة): الحالة + المراحل + (التفاصيل / سجل التنفيذ / المحادثة).
 * النصوص بتختلف حسب المصدر (العميل / المؤسسة)
 */
function ProjectView({ work }) {
    const { t, i18n } = useTranslation("craftsmanDashboard");
    const locale = `${i18n.language}-u-nu-latn`;
    const d = "currentPage.details";
    const pr = `${d}.project`;
    // ⚠️ "تم إنجاز العمل" بالصفحة بس لحد ما نربطها بالسيرفر
    const [status, setStatus] = useState(work.status);
    const [tab, setTab] = useState("details");
    const [confirming, setConfirming] = useState(false);
    const [updating, setUpdating] = useState(false);

    const institution = work.source === "institution";
    // نصوص الحالة والشريط: المؤسسة (pr) أو العميل (d)
    const tx = institution ? pr : d;
    const s = `currentPage.works.${work.id}`;
    const text = (key) => work[key] || t(`${s}.${key}`);
    const owner = text("owner");
    const place = text("place");
    const banner = BANNERS[status];
    const fmt = (date) => date.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
    let rows;
    if (institution) {
        const startDate = new Date(work.start);
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + work.days - 1);
        rows = [
            { key: `${pr}.rows.value`, value: t(`${d}.amount`, { amount: work.amount }), accent: true },
            { key: `${pr}.rows.duration`, value: t(`${pr}.days`, { count: work.days }) },
            { key: `${pr}.rows.start`, value: fmt(startDate) },
            { key: `${pr}.rows.end`, value: fmt(endDate) },
        ];
    } else {
        rows = [
            { key: `${d}.time`, value: t(`${d}.timeValue`) },
            { key: `${d}.distance`, value: t(`${d}.distanceValue`, { km: work.distance }) },
            { key: `${d}.budget`, value: t(`${d}.budgetValue`, { min: work.budget[0], max: work.budget[1] }) },
        ];
    }
    // سجل التنفيذ حسب الحالة (الأحدث أول)، والتحديثات الجديدة بتنضاف فوق
    const [log, setLog] = useState(() => {
        const all = t(`${pr}.${institution ? "logs" : "customerLogs"}`, { returnObjects: true }) || {};
        const list = all[work.status] || all.accepted;
        return Array.isArray(list) ? list : [];
    });
    const startLabel = work.start ? fmt(new Date(work.start)) : "";
    // العدّاد بيخلص → التنفيذ بيبدأ (useCallback عشان ما يتنفّذ أثر العدّاد مع كل رندر)
    const startExecution = React.useCallback(() => setStatus((st) => (st === "scheduled" ? "accepted" : st)), []);

    // ===== أثناء التنفيذ: اليوم الحالي من أيام التنفيذ ونسبة التقدّم =====
    const startDate = work.start ? new Date(work.start) : null;
    const inProgress = status === "accepted" && startDate && work.days;
    let dayN = 1;
    let endLabel = "";
    if (startDate && work.days) {
        const today = new Date();
        const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        dayN = Math.min(work.days, Math.max(1, Math.round((todayDay - startDay) / 86400000) + 1));
        endLabel = fmt(new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate() + work.days - 1));
    }
    const percent = work.days ? Math.round((dayN / work.days) * 100) : 0;

    // تفاصيل المشروع (بتنعرض مباشرة، أو جوّا "التفاصيل" القابلة للطي أثناء التنفيذ)
    const projectCard = (
        <section className={`${box} p-5`}>
            <h1 className="text-[17px] font-bold text-[#1E293B]">{text("title")}</h1>
            <p className="mt-2 text-[13px] leading-[1.9] text-[#475569]">{institution ? t(`${pr}.desc`) : work.desc || t(`${d}.desc`)}</p>
            <ul className="mt-4 grid grid-cols-4 gap-2">
                {Array.from({ length: PHOTOS }, (_, i) => (
                    <li key={i} className="flex aspect-square items-center justify-center rounded-xl bg-[#E4EFFA] text-[#8EC0E4]">
                        <ImageIcon size={16} />
                    </li>
                ))}
            </ul>
        </section>
    );
    const rowsCard = (
        <section className={`${box} flex flex-col gap-3 p-5`}>
            {rows.map(({ key, value, accent }) => (
                <p key={key} className="flex items-center justify-between gap-3 text-[12px]">
                    <span className="text-[#89949D]">{t(key)}</span>
                    <span className={`font-bold tabular-nums ${accent ? "text-[#4B9AD2]" : "text-[#1E293B]"}`}>{value}</span>
                </p>
            ))}
        </section>
    );
    const mapCard = (
        <section className="relative h-[220px] overflow-hidden rounded-[20px] border border-[#0000001A] bg-[#E5ECF1]">
            <iframe
                title={t(`${d}.map`)}
                src={`https://www.google.com/maps?q=${encodeURIComponent(place)}&t=k&z=15&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0"
            />
            <span className="pointer-events-none absolute bottom-3 end-3 rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-[#1E293B] shadow">
                {t(`${d}.address`, { place })}
            </span>
        </section>
    );
    const ownerCard = (
        <section className={`${box} flex items-center justify-between gap-3 p-4`}>
            <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 border-[#EEF5FC] bg-white text-[13px] font-bold text-[#4B9AD2]">
                    {owner.trim().charAt(0)}
                </span>
                <div>
                    <p className="text-[14px] font-bold text-[#1E293B]">{owner}</p>
                    <p className="mt-0.5 text-[10px] text-[#89949D]">
                        {institution ? t(`${pr}.since`, { year: 2024 }) : t(`${d}.since`, { year: 2025 })}
                    </p>
                </div>
            </div>
            {institution && (
                <span className="shrink-0 rounded-full bg-[#E4EFFA] px-3 py-1 text-[10px] text-[#4B9AD2]">
                    {t(`${pr}.tender`, { number: work.tender })}
                </span>
            )}
        </section>
    );

    return (
        <div className="mx-auto flex max-w-[1000px] flex-col gap-4">
            <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-[11px] text-[#575757]">
                <Link to={`${BASE}/current`} className="text-[#4B9AD2] hover:underline">
                    {t("nav.current")}
                </Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{t(institution ? `${pr}.title` : `${d}.title`)}</span>
            </nav>

            {status === "scheduled" && work.start && <Countdown start={work.start} days={work.days || 1} onStart={startExecution} />}

            {inProgress ? (
                /* قيد التنفيذ: التسليم المتوقع + اليوم الحالي */
                <section role="status" className="flex items-start justify-between gap-3 rounded-xl border border-[#C7E0F1] bg-[#EAF3FB] px-4 py-4">
                    <div>
                        <p className="flex items-center gap-2 text-[13px] font-bold text-[#3D8BC9]">
                            <Wrench size={15} />
                            {t(`${pr}.inProgress.title`)}
                        </p>
                        <p className="mt-2 ps-6 text-[11px] text-[#475569]">{t(`${pr}.inProgress.delivery`, { date: endLabel })}</p>
                    </div>
                    <p className="shrink-0 text-[11px] font-semibold text-[#3D8BC9]">{t(`${pr}.inProgress.day`, { n: dayN, total: work.days })}</p>
                </section>
            ) : (
                banner && (
                    <section role="status" className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-4 ${banner.style}`}>
                        <div>
                            <p className="flex items-center gap-2 text-[13px] font-bold">
                                <banner.icon size={15} />
                                {t(`${tx}.headings.${status}`)}
                            </p>
                            <p className="mt-2 ps-6 text-[11px] opacity-90">{t(`${tx}.notes.${status}`, { date: startLabel })}</p>
                        </div>
                        {banner.showAmount && <p className="shrink-0 text-[12px] font-bold tabular-nums">{t(`${d}.amount`, { amount: work.amount })}</p>}
                    </section>
                )
            )}

            <section className={`${box} px-3 py-6 sm:px-8`}>
                <ProjectSteps current={PROJECT_STEP[status] ?? 0} institution={institution} />
            </section>

            <div className="grid items-start gap-5 lg:grid-cols-[1fr_380px]">
                <div className="flex min-w-0 flex-col gap-3">
                    <div role="tablist" className={`${box} grid grid-cols-3 gap-1 p-1.5`}>
                        {PROJECT_TABS.map((key) => (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={tab === key}
                                onClick={() => setTab(key)}
                                className={`h-10 cursor-pointer rounded-xl text-[12px] text-[#3D8BC9] transition-colors ${tab === key ? "bg-[#E3EFFA] font-bold" : "hover:bg-[#F3F8FD]"}`}
                            >
                                {t(`${pr}.tabs.${key}`)}
                            </button>
                        ))}
                    </div>

                    {tab === "details" &&
                        (inProgress ? (
                            <>
                                {/* التقدّم: اليوم الحالي + النسبة + أيام التنفيذ */}
                                <section className={`${box} p-4`}>
                                    <p className="flex items-center justify-between gap-3 text-[12px]">
                                        <span className="text-[#475569]">{t(`${pr}.inProgress.day`, { n: dayN, total: work.days })}</span>
                                        <span className="font-bold text-[#3D8BC9] tabular-nums">{percent}%</span>
                                    </p>
                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E4E9EE]" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                                        <div className="h-full rounded-full bg-[#3D8BC9] transition-all" style={{ width: `${percent}%` }} />
                                    </div>
                                    <div className="mt-3">
                                        <DaysStrip start={work.start} days={work.days} current={dayN - 1} />
                                    </div>
                                </section>
                                {ownerCard}
                                {/* باقي التفاصيل مطوية */}
                                <details className={`${box} group`}>
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-[14px] font-bold text-[#1E293B] [&::-webkit-details-marker]:hidden">
                                        {t(`${pr}.tabs.details`)}
                                        <ChevronDown size={18} className="text-[#475569] transition-transform group-open:rotate-180" />
                                    </summary>
                                    <div className="flex flex-col gap-3 px-3 pb-3">
                                        {projectCard}
                                        {rowsCard}
                                        {mapCard}
                                    </div>
                                </details>
                            </>
                        ) : (
                            <>
                                {ownerCard}
                                {projectCard}
                                {rowsCard}
                                {mapCard}
                            </>
                        ))}

                    {tab === "log" &&
                        (log.length ? (
                            <ol className="relative flex flex-col gap-3">
                                {/* الخط الواصل بين أيقونات التحديثات */}
                                <span aria-hidden="true" className="absolute bottom-4 start-[15px] top-4 w-px bg-[#DCE3EA]" />
                                {log.map((entry, i) => (
                                    <LogEntry key={entry.id || i} entry={entry} ownerName={owner} latest={i === 0} />
                                ))}
                            </ol>
                        ) : (
                            <p className={`${box} px-5 py-10 text-center text-[12px] text-[#89949D]`}>{t(`${pr}.logEmpty`)}</p>
                        ))}

                    {tab === "chat" && (
                        <div className="flex h-[520px] flex-col">
                            <Chat initial={institution ? [] : undefined} />
                        </div>
                    )}
                </div>

                {/* الجنب: أزرار التنفيذ (على مستوى التبويبات) + المبلغ المحجوز + المحادثة (بتختفي لما تبويب المحادثة مفتوح) */}
                {tab !== "chat" && (
                    <div className={`flex flex-col gap-3 lg:h-[620px] ${status === "accepted" ? "" : "lg:mt-[66px]"}`}>
                        {status === "accepted" && (
                            <div className="grid shrink-0 grid-cols-2 gap-3 lg:h-[54px] lg:items-center">
                                <button
                                    type="button"
                                    onClick={() => setUpdating(true)}
                                    className="h-11 cursor-pointer rounded-xl border border-[#4B9AD2] bg-white text-[13px] font-semibold text-[#4B9AD2] btn-wipe btn-wipe-outline"
                                >
                                    {t(`${pr}.update.button`)}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirming(true)}
                                    className="h-11 cursor-pointer rounded-xl bg-[#4B9AD2] text-[13px] font-semibold text-white shadow-[0_4px_10px_rgba(75,154,210,0.25)] btn-wipe"
                                >
                                    {t(`${d}.done`)}
                                </button>
                            </div>
                        )}
                        {HELD.includes(status) && (
                            <section className="flex shrink-0 items-center justify-between gap-3 rounded-xl bg-linear-to-l from-[#3D8BC9] to-[#5BAEE4] px-5 py-3.5 text-white shadow-[0_6px_16px_rgba(61,139,201,0.3)] ltr:bg-linear-to-r">
                                <div>
                                    <p className="text-[10px] text-white/85">{t(`${pr}.held`)}</p>
                                    <p className="mt-0.5 text-[17px] font-bold tabular-nums">{t(`${d}.amount`, { amount: work.amount })}</p>
                                </div>
                                <LockKeyhole size={17} className="shrink-0" />
                            </section>
                        )}
                        <Chat initial={institution ? [] : undefined} />
                    </div>
                )}
            </div>

            {confirming && (
                <DoneModal
                    institution={institution}
                    onClose={() => setConfirming(false)}
                    // ⚠️ الملخص والصور بالصفحة بس لحد ما يصير في endpoint لإنجاز العمل
                    onConfirm={({ summary, files }) => {
                        setLog((list) => [
                            {
                                id: `done${Date.now()}`,
                                author: "me",
                                title: t(`${d}.doneModal.logTitle`),
                                text: summary,
                                time: t(`${pr}.now`),
                                urls: files.map((f) => URL.createObjectURL(f)),
                            },
                            ...list,
                        ]);
                        setStatus("awaitingConfirm");
                        setConfirming(false);
                    }}
                />
            )}
            {updating && (
                <UpdateModal
                    onClose={() => setUpdating(false)}
                    // ⚠️ التحديث بينضاف لسجل التنفيذ بالصفحة بس لحد ما يصير في endpoint
                    onAdd={({ title, text: note, files }) => {
                        const entry = {
                            id: `u${Date.now()}`,
                            author: "me",
                            title,
                            text: note,
                            time: t(`${pr}.now`),
                            urls: files.map((f) => URL.createObjectURL(f)),
                        };
                        setLog((list) => [entry, ...list]);
                        setUpdating(false);
                        setTab("log");
                    }}
                />
            )}
        </div>
    );
}

/** تفاصيل عمل جاري (من شريط الحالة بالأعمال الجارية) — نفس الشكل لطلبات العملاء ومشاريع المؤسسات */
export default function CraftsmanWorkDetails() {
    const { t } = useTranslation("craftsmanDashboard");
    const { workId } = useParams();
    const { state } = useLocation();
    // الطلب بييجي مع الرابط (لأن المقبول للتو مش موجود بالبيانات الثابتة)، ولو انفتح مباشرة بندوّر بالبيانات
    const work = state?.work || WORKS.find((w) => w.id === workId);

    if (!work) {
        return (
            <div className={`${box} mx-auto max-w-[1000px] p-10 text-center`}>
                <p className="text-[14px] font-bold text-[#414141]">{t("currentPage.details.notFound")}</p>
                <Link to={`${BASE}/current`} className="mt-4 inline-block text-[13px] text-[#4B9AD2] hover:underline">
                    {t("nav.current")}
                </Link>
            </div>
        );
    }
    return <ProjectView key={work.id} work={work} />;
}
