import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Award,
    CalendarDays,
    Camera,
    ChevronDown,
    ChevronLeft,
    CircleCheck,
    Clock,
    ImageIcon,
    ImageUp,
    MapPin,
    Map as MapIcon,
    MessageSquare,
    Plus,
    Send,
    ShieldCheck,
    Star,
    Tags,
    UserRound,
    X,
} from "lucide-react";
import DateField from "../dashboard/DateField";
import { createServiceRequest, uploadFile } from "../../api/endpoints";
import { parseApiError } from "../../api/errors";
import { getToken } from "../../api/session";

const TABS = ["profile", "reviews", "portfolio"];

// مميزات "نبذة عني" (الافتراضية لو ما وصلت من السيرفر)
const FEATURE_ICONS = { quality: ShieldCheck, prices: Tags, punctual: Clock };
const DEFAULT_FEATURES = ["quality", "prices", "punctual"];

// عدد الصور الظاهرة بمعاينة معرض الأعمال (الباقي بيظهر "+N صورة")
const PREVIEW_COUNT = 4;
// عدد التقييمات الظاهرة بتبويب "الملف الشخصي" (الكل بتبويب "التقييمات")
const REVIEWS_PREVIEW = 2;

const panel = "rounded-[20px] border border-[#0000000D] bg-white p-5 shadow-[0_2px_12px_rgba(35,74,100,0.05)] sm:p-6";

/** صورة من معرض الأعمال، ولو ما انفتحت بيظهر شكل افتراضي */
function WorkImage({ src, alt, className = "" }) {
    const [failed, setFailed] = useState(false);
    if (!src || failed) {
        return (
            <span className={`${className} flex items-center justify-center bg-[#E5ECF1] text-[#AAB6C0]`}>
                <ImageIcon size={28} strokeWidth={1.4} />
            </span>
        );
    }
    return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`${className} object-cover`} />;
}

/** تقييم عميل: صورة + اسم + تاريخ + نجوم + تعليق */
function ReviewCard({ review }) {
    const full = Math.round(review.rating);
    return (
        <li className="rounded-2xl border border-[#0000000A] bg-[#F9FBFD] px-4 pb-4 pt-6">
            <div className="flex items-center gap-2.5 border-t border-[#0000000F] pt-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E4EFFA] text-[#4B9AD2]">
                    <UserRound size={14} />
                </span>
                <div>
                    <p className="text-[11px] font-bold text-[#141415]">{review.name}</p>
                    <p className="text-[9px] text-[#89949D]">{review.date}</p>
                </div>
            </div>
            <span className="mt-2 flex gap-0.5" aria-label={`${review.rating}/5`}>
                {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={13} className={i < full ? "text-[#F5B400]" : "text-[#E1E5EA]"} fill="currentColor" aria-hidden="true" />
                ))}
            </span>
            <p className="mt-2 text-[12px] leading-[1.8] text-[#414141]">{review.comment}</p>
        </li>
    );
}

/** عنوان بطاقة داخل التبويب: أيقونة + نص */
function PanelTitle({ icon: Icon, children }) {
    return (
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#141415]">
            <Icon size={17} strokeWidth={1.8} className="text-[#4B9AD2]" />
            {children}
        </h2>
    );
}

/** صورة مزوّد الخدمة، ولو ما في صورة (أو ما انفتحت) بنعرض أول حرف من اسمه */
function Avatar({ src, name }) {
    const [failed, setFailed] = useState(false);
    const base = "h-24 w-24 rounded-full border-4 border-white shadow-[0_4px_14px_rgba(0,0,0,0.18)]";
    if (!src || failed) {
        return (
            <span className={`${base} flex items-center justify-center bg-[#EAF3FB] text-[30px] font-bold text-[#4B9AD2]`}>
                {name.trim().charAt(0)}
            </span>
        );
    }
    return <img src={src} alt={name} onError={() => setFailed(true)} className={`${base} object-cover`} />;
}

/** نجوم التقييم (مقرّبة لأقرب نجمة) + الرقم */
function Stars({ rating }) {
    const { t } = useTranslation("providerProfile");
    const full = Math.round(rating);
    return (
        <p className="flex items-center gap-1.5" aria-label={t("ratingLabel", { rating: rating.toFixed(1) })}>
            <span className="flex gap-0.5" aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={14} className={i < full ? "text-[#F5B400]" : "text-[#E1E5EA]"} fill="currentColor" />
                ))}
            </span>
            <span className="text-[12px] font-bold text-[#414141] tabular-nums">{rating.toFixed(1)}</span>
        </p>
    );
}

/** بطاقة جانبية صغيرة (ساعات العمل / مناطق الخدمة) */
function SideCard({ icon: Icon, title, children }) {
    return (
        <section className="rounded-[18px] border border-[#0000000D] bg-white p-4 shadow-[0_2px_12px_rgba(35,74,100,0.06)]">
            <h2 className="flex items-center gap-2 text-[13px] font-bold text-[#141415]">
                <Icon size={15} className="text-[#4B9AD2]" />
                {title}
            </h2>
            <div className="mt-3 text-[11px] leading-[2] text-[#414141]">{children}</div>
        </section>
    );
}

// ==================== نافذة "تفاصيل الطلب" (زر طلب خدمة) ====================

const MAX_PHOTOS = 5;
// ساعات الزيارة المتاحة بقائمة "الوقت" (من 8 الصبح لـ 8 المسا)
const HOURS = Array.from({ length: 13 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

const reqField =
    "w-full rounded-xl border border-[#CFE3F3] bg-white text-[13px] text-[#414141] outline-none placeholder:text-[#89949D] focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2] aria-[invalid=true]:border-red-400";
const reqLabel = "text-[13px] font-bold text-[#1E293B]";

const Req = () => <span className="ms-0.5 text-red-500">*</span>;
const ReqError = ({ text }) => (text ? <p className="mt-1 text-[11px] text-red-500">{text}</p> : null);

/** صورة مرفوعة بالنافذة: معاينة + زر حذف + "مرفق" */
function AttachedPhoto({ file, onRemove, label, removeLabel }) {
    const [url, setUrl] = useState("");
    useEffect(() => {
        const u = URL.createObjectURL(file);
        setUrl(u);
        return () => URL.revokeObjectURL(u);
    }, [file]);
    return (
        <li className="relative h-[86px] overflow-hidden rounded-xl bg-linear-to-br from-[#B9D9F2] to-[#8EC0E4]">
            {url && <img src={url} alt="" className="h-full w-full object-cover" />}
            <button
                type="button"
                onClick={onRemove}
                aria-label={removeLabel}
                className="absolute end-1.5 top-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-[#3F4650] text-white hover:bg-[#1E293B]"
            >
                <X size={12} strokeWidth={2.5} />
            </button>
            <span className="absolute bottom-1.5 end-1.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[9px] text-[#475569]">{label}</span>
        </li>
    );
}

function RequestModal({ provider, onClose }) {
    const { t } = useTranslation("providerProfile");
    const navigate = useNavigate();
    const closeRef = useRef(null);
    const fileRef = useRef(null);
    const [form, setForm] = useState({ title: "", details: "", date: "", time: "" });
    const [photos, setPhotos] = useState([]);
    const [errors, setErrors] = useState({});
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [serverError, setServerError] = useState("");
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const r = "requestModal";

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

    const set = (key) => (value) => {
        setForm((f) => ({ ...f, [key]: value }));
        setErrors((er) => ({ ...er, [key]: "" }));
    };

    const addPhotos = (list) => {
        const picked = Array.from(list || []).filter((f) => f.type.startsWith("image/"));
        setPhotos((p) => [...p, ...picked].slice(0, MAX_PHOTOS));
    };

    const submit = async (e) => {
        e.preventDefault();
        const next = {};
        const req = t(`${r}.required`);
        if (!form.title.trim()) next.title = req;
        if (!form.details.trim()) next.details = req;
        if (!form.date) next.date = req;
        if (!form.time) next.time = req;
        setErrors(next);
        if (Object.keys(next).length) {
            document.getElementById(`req-${Object.keys(next)[0]}`)?.focus();
            return;
        }
        // طلب الخدمة بيحتاج تسجيل دخول كعميل
        if (!getToken()) {
            navigate("/login");
            return;
        }
        setSending(true);
        setServerError("");
        try {
            const paths = await Promise.all(photos.map((f) => uploadFile(f)));
            // ⚠️ أسماء الحقول مقترحة — لازم تتأكد مع مطور الباك إند (POST /service-requests)
            await createServiceRequest({
                craftsman_id: provider.id,
                title: form.title.trim(),
                description: form.details.trim(),
                preferred_date: form.date,
                preferred_time: form.time,
                images: paths,
            });
            setSent(true);
        } catch (err) {
            const { message } = parseApiError(err);
            setServerError(message || t(`${r}.failed`));
        } finally {
            setSending(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[60] overflow-y-auto bg-[#0F172A]/40 px-4 py-8 backdrop-blur-[2px]"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="req-heading"
                className="mx-auto w-full max-w-[440px] rounded-[22px] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.25)]"
            >
                <div className="relative flex items-center justify-center border-b border-[#0000000F] px-12 py-4">
                    <h2 id="req-heading" className="text-[17px] font-bold text-[#1E293B]">{t(`${r}.title`)}</h2>
                    <button
                        ref={closeRef}
                        type="button"
                        onClick={onClose}
                        aria-label={t(`${r}.close`)}
                        className="absolute end-4 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#89949D] hover:bg-[#F4F7FA] hover:text-[#475569]"
                    >
                        <X size={18} />
                    </button>
                </div>

                {sent ? (
                    <div className="flex flex-col items-center px-6 py-10 text-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#DDF6E3] text-[#2EAF4E]">
                            <CircleCheck size={28} />
                        </span>
                        <p className="mt-4 text-[15px] font-bold text-[#1E293B]">{t(`${r}.sentTitle`)}</p>
                        <p className="mt-1.5 text-[12px] leading-[1.9] text-[#475569]">{t(`${r}.sentDesc`, { name: provider.name })}</p>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-6 h-10 min-w-[140px] cursor-pointer rounded-xl bg-[#4B9AD2] px-6 text-[13px] font-semibold text-white btn-wipe"
                        >
                            {t(`${r}.done`)}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={submit} noValidate>
                        <div className="flex flex-col gap-4 px-5 pb-5 pt-4">
                            <div>
                                <label htmlFor="req-title" className={`${reqLabel} mb-1.5 block`}>
                                    {t(`${r}.problem`)}
                                    <Req />
                                </label>
                                <input
                                    id="req-title"
                                    value={form.title}
                                    onChange={(e) => set("title")(e.target.value)}
                                    aria-invalid={!!errors.title}
                                    placeholder={t(`${r}.problemPlaceholder`)}
                                    className={`${reqField} h-11 px-4`}
                                />
                                <ReqError text={errors.title} />
                            </div>

                            <div>
                                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                                    <label htmlFor="req-details" className={reqLabel}>
                                        {t(`${r}.details`)}
                                        <Req />
                                    </label>
                                    <span className="text-[11px] text-[#89949D]">{t(`${r}.detailsHint`)}</span>
                                </div>
                                <textarea
                                    id="req-details"
                                    rows={3}
                                    value={form.details}
                                    onChange={(e) => set("details")(e.target.value)}
                                    aria-invalid={!!errors.details}
                                    placeholder={t(`${r}.detailsPlaceholder`)}
                                    className={`${reqField} resize-none px-4 py-3 leading-[1.8]`}
                                />
                                <ReqError text={errors.details} />
                            </div>

                            <div>
                                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                                    <span className={reqLabel}>{t(`${r}.photos`)}</span>
                                    <span className="text-[11px] text-[#89949D]">
                                        {t(`${r}.photosCount`, { count: photos.length, max: MAX_PHOTOS })}
                                    </span>
                                </div>
                                <ul className="grid grid-cols-3 gap-3">
                                    {photos.map((f, i) => (
                                        <AttachedPhoto
                                            key={`${f.name}-${i}`}
                                            file={f}
                                            label={t(`${r}.attached`)}
                                            removeLabel={t(`${r}.removePhoto`)}
                                            onRemove={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                                        />
                                    ))}
                                    {photos.length < MAX_PHOTOS && (
                                        <li>
                                            <button
                                                type="button"
                                                onClick={() => fileRef.current?.click()}
                                                className="flex h-[86px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#4B9AD2] bg-[#EEF5FC] text-[12px] font-bold text-[#286292] transition-colors hover:bg-[#E4EFFA]"
                                            >
                                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#4B9AD2]">
                                                    <Camera size={15} />
                                                </span>
                                                {t(`${r}.addPhoto`)}
                                            </button>
                                        </li>
                                    )}
                                    {photos.length < MAX_PHOTOS - 1 && (
                                        <li>
                                            <button
                                                type="button"
                                                onClick={() => fileRef.current?.click()}
                                                className="flex h-[86px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#C9DDED] bg-[#F7FAFD] text-[12px] text-[#89949D] transition-colors hover:border-[#8EC0E4]"
                                            >
                                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#8EC0E4]">
                                                    <Plus size={15} />
                                                </span>
                                                {t(`${r}.anotherPhoto`)}
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
                                        addPhotos(e.target.files);
                                        e.target.value = "";
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="req-date" className={`${reqLabel} mb-1.5 block`}>
                                        {t(`${r}.day`)}
                                        <Req />
                                    </label>
                                    <DateField
                                        id="req-date"
                                        min={today}
                                        value={form.date}
                                        onChange={set("date")}
                                        invalid={!!errors.date}
                                        placeholder={t(`${r}.dayPlaceholder`)}
                                    />
                                    <ReqError text={errors.date} />
                                </div>
                                <div>
                                    <label htmlFor="req-time" className={`${reqLabel} mb-1.5 block`}>
                                        {t(`${r}.time`)}
                                        <Req />
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="req-time"
                                            value={form.time}
                                            onChange={(e) => set("time")(e.target.value)}
                                            aria-invalid={!!errors.time}
                                            className={`${reqField} h-11 cursor-pointer appearance-none pe-9 ps-4 ${form.time ? "" : "text-[#89949D]"}`}
                                        >
                                            <option value="" disabled>{t(`${r}.timePlaceholder`)}</option>
                                            {HOURS.map((h) => (
                                                <option key={h} value={h} className="text-[#414141]">{h}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[#89949D]" />
                                    </div>
                                    <ReqError text={errors.time} />
                                </div>
                            </div>

                            {serverError && <p role="alert" className="text-[12px] text-red-500">{serverError}</p>}
                        </div>

                        <div className="border-t border-[#0000000F] px-5 py-4">
                            <button
                                type="submit"
                                disabled={sending}
                                className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-l from-[#1A78BE] to-[#5BAEE4] text-[14px] font-semibold text-white shadow-[0_6px_16px_rgba(26,120,190,0.3)] transition-opacity hover:opacity-95 disabled:cursor-wait disabled:opacity-70 ltr:bg-linear-to-r"
                            >
                                <Send size={16} className="rtl:-scale-x-100" />
                                {sending ? t(`${r}.sending`) : t(`${r}.send`)}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}


/**
 * الملف المهني لمزوّد الخدمة (حرفي / فريق / مقاول) — مشترك بين لوحة المؤسسة وصفحة الحرفيين العامة.
 * زر "طلب خدمة" بيفتح نافذة "تفاصيل الطلب" بكل الصفحات.
 * profile: { id, name, craft, location, bio, about, rating, verified, photo, cover, hours: { days, time }, areas,
 *            features: ["quality" | "prices" | "punctual"], portfolio: [روابط صور], portfolioTotal,
 *            reviews: [{ name, date, rating, comment }] }
 * chatState: state بينبعت مع رابط "بدء محادثة" (مثلاً الحرفي عشان تنفتح المحادثة معه)
 * chatTo: رابط زر "بدء محادثة"
 * backTo / backLabel: رابط رجوع أعلى الصفحة (اختياري)
 */
export default function ProviderProfile({ profile, chatTo, chatState, backTo, backLabel }) {
    const { t } = useTranslation("providerProfile");
    const [tab, setTab] = useState("profile");
    const [requesting, setRequesting] = useState(false);
    const features = profile.features?.length ? profile.features : DEFAULT_FEATURES;
    const portfolio = profile.portfolio || [];
    const reviews = profile.reviews || [];
    // عدد الصور اللي ما بتظهر بالمعاينة (من العدد الكلي لو السيرفر بعته)
    const extra = Math.max(0, (profile.portfolioTotal || portfolio.length) - (PREVIEW_COUNT - 1));

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col">
            {backTo && (
                <Link
                    to={backTo}
                    className="mb-4 inline-flex w-fit items-center gap-1 text-[12px] font-medium text-[#4B9AD2] hover:underline"
                >
                    <ChevronLeft size={14} className="rtl:rotate-180" />
                    {backLabel}
                </Link>
            )}

            {/* الغلاف */}
            <div className="relative h-[140px] overflow-hidden rounded-[20px] bg-[#EFEFEF]">
                {profile.cover ? (
                    <img src={profile.cover} alt={t("cover")} className="h-full w-full object-cover" />
                ) : (
                    <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#4B9AD2] text-white" aria-hidden="true">
                        <Camera size={20} strokeWidth={1.8} />
                    </span>
                )}
            </div>

            <div className="grid gap-6 px-1 lg:grid-cols-[1fr_300px] lg:gap-12">
                {/* العمود الرئيسي */}
                <div className="min-w-0">
                    {/* relative + z-10 عشان الصورة تطلع فوق الغلاف مش تحته */}
                    <div className="relative z-10 -mt-12 ps-4">
                        <Avatar src={profile.photo} name={profile.name} />
                    </div>
                    <h1 className="mt-3 text-[24px] font-bold text-[#141415]">{profile.name}</h1>
                    <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[11px] text-[#89949D]">
                        {profile.craft && <span>{profile.craft}</span>}
                        {profile.craft && profile.location && <span aria-hidden="true">•</span>}
                        {profile.location && (
                            <span className="flex items-center gap-1">
                                <MapPin size={12} />
                                {profile.location}
                            </span>
                        )}
                    </p>
                    {profile.bio && <p className="mt-3 max-w-[340px] text-[12px] leading-[1.9] text-[#414141]">{profile.bio}</p>}
                    <div className="mt-3">
                        <Stars rating={profile.rating} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <span className="flex items-center gap-1 rounded-full border border-[#BFEBCD] bg-[#EEFAF2] px-3 py-1 text-[10px] text-[#2EAF4E]">
                            <Award size={12} />
                            {t("customerRated")}
                        </span>
                        {profile.verified && (
                            <span className="flex items-center gap-1 rounded-full border border-[#CFE3F3] bg-[#EEF5FC] px-3 py-1 text-[10px] text-[#38749E]">
                                <ShieldCheck size={12} />
                                {t("verified")}
                            </span>
                        )}
                    </div>

                    {/* التبويبات */}
                    <div role="tablist" className="mt-6 flex rounded-[18px] border border-[#0000000D] bg-white px-4 shadow-[0_2px_12px_rgba(35,74,100,0.05)]">
                        {TABS.map((key) => (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={tab === key}
                                onClick={() => setTab(key)}
                                className={`relative flex-1 cursor-pointer py-4 text-[12px] transition-colors ${tab === key ? "font-bold text-[#4B9AD2]" : "text-[#575757] hover:text-[#4B9AD2]"
                                    }`}
                            >
                                {t(`tabs.${key}`)}
                                {tab === key && (
                                    <span aria-hidden="true" className="absolute inset-x-[20%] bottom-2 h-[2px] rounded-full bg-[#4B9AD2]" />
                                )}
                            </button>
                        ))}
                    </div>
                    <div role="tabpanel" className="mt-4 flex flex-col gap-6 lg:me-12">
                        {tab === "profile" && (
                            <>
                                {/* نبذة عني */}
                                <section className={panel}>
                                    <PanelTitle icon={UserRound}>{t("about")}</PanelTitle>
                                    <p className="mt-4 text-[13px] leading-[1.9] text-[#414141]">{profile.about || profile.bio}</p>
                                    <ul className="mt-5 grid gap-3 border-t border-[#0000000F] pt-5 sm:grid-cols-3">
                                        {features.map((key) => {
                                            const Icon = FEATURE_ICONS[key] || ShieldCheck;
                                            return (
                                                <li
                                                    key={key}
                                                    className="flex h-9 items-center justify-center gap-2 rounded-xl bg-[#EEF5FC] text-[12px] font-bold text-[#448BBD]"
                                                >
                                                    <Icon size={14} />
                                                    {t(`features.${key}`)}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </section>

                                {/* معاينة معرض الأعمال */}
                                <section className={panel}>
                                    <PanelTitle icon={ImageUp}>{t("tabs.portfolio")}</PanelTitle>
                                    {portfolio.length ? (
                                        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                            {portfolio.slice(0, PREVIEW_COUNT).map((src, i) => {
                                                const isMore = i === PREVIEW_COUNT - 1 && extra > 0;
                                                return (
                                                    <li key={src + i} className="relative h-[92px] overflow-hidden rounded-xl">
                                                        <WorkImage src={src} alt={t("workAlt", { n: i + 1 })} className="h-full w-full" />
                                                        {isMore && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setTab("portfolio")}
                                                                className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/55 text-white"
                                                            >
                                                                <span className="text-[16px] font-bold" dir="ltr">+{extra}</span>
                                                                <span className="text-[10px]">{t("photos")}</span>
                                                            </button>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <p className="mt-4 text-[12px] text-[#89949D]">{t("tabEmpty.portfolio")}</p>
                                    )}
                                </section>

                                {/* معاينة تقييمات العملاء */}
                                <section className={panel}>
                                    <div className="flex items-center justify-between gap-3">
                                        <PanelTitle icon={Star}>{t("customerReviews")}</PanelTitle>
                                        {reviews.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setTab("reviews")}
                                                className="cursor-pointer text-[11px] text-[#4B9AD2] hover:underline"
                                            >
                                                {t("allReviews")}
                                            </button>
                                        )}
                                    </div>
                                    {reviews.length ? (
                                        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                                            {reviews.slice(0, REVIEWS_PREVIEW).map((rv, i) => (
                                                <ReviewCard key={rv.name + i} review={rv} />
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-4 text-[12px] text-[#89949D]">{t("tabEmpty.reviews")}</p>
                                    )}
                                </section>
                            </>
                        )}

                        {tab === "portfolio" && (
                            <section className={panel}>
                                <PanelTitle icon={ImageUp}>{t("tabs.portfolio")}</PanelTitle>
                                {portfolio.length ? (
                                    <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                        {portfolio.map((src, i) => (
                                            <li key={src + i} className="h-[120px] overflow-hidden rounded-xl">
                                                <WorkImage src={src} alt={t("workAlt", { n: i + 1 })} className="h-full w-full" />
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="mt-4 text-[12px] text-[#89949D]">{t("tabEmpty.portfolio")}</p>
                                )}
                            </section>
                        )}

                        {tab === "reviews" &&
                            (reviews.length ? (
                                <section className={panel}>
                                    <PanelTitle icon={Star}>{t("customerReviews")}</PanelTitle>
                                    <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                                        {reviews.map((rv, i) => (
                                            <ReviewCard key={rv.name + i} review={rv} />
                                        ))}
                                    </ul>
                                </section>
                            ) : (
                                <p className={`${panel} py-10 text-center text-[12px] text-[#89949D]`}>{t("tabEmpty.reviews")}</p>
                            ))}
                    </div>
                </div>

                {/* العمود الجانبي */}
                <aside className="flex flex-col gap-6 lg:pt-16">
                    <div className="flex gap-3">
                        <Link
                            to={chatTo}
                            state={chatState}
                            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#4B87BE] text-[13px] font-semibold text-white btn-wipe"
                        >
                            <MessageSquare size={15} />
                            {t("startChat")}
                        </Link>
                        <button
                            type="button"
                            onClick={() => setRequesting(true)}
                            className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#9CC9EA] text-[13px] font-semibold text-[#4B87BE] btn-wipe btn-wipe-outline"
                        >
                            <CalendarDays size={15} />
                            {t("requestService")}
                        </button>
                    </div>

                    {profile.hours && (
                        <SideCard icon={Clock} title={t("hours")}>
                            <p>{profile.hours.days}</p>
                            <p>{profile.hours.time}</p>
                        </SideCard>
                    )}

                    {profile.areas && (
                        <SideCard icon={MapPin} title={t("areas")}>
                            <p className="flex items-start gap-2">
                                <MapIcon size={13} className="mt-1 shrink-0 text-[#4B9AD2]" />
                                {profile.areas}
                            </p>
                        </SideCard>
                    )}
                </aside>
            </div>

            {requesting && <RequestModal provider={profile} onClose={() => setRequesting(false)} />}
        </div>
    );
}
