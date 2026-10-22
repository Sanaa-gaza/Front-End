import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ArrowDown,
    Bell,
    Bookmark,
    Briefcase,
    CalendarDays,
    Check,
    Clock,
    ChevronLeft,
    Construction,
    EllipsisVertical,
    Eye,
    EyeOff,
    FileText,
    Flag,
    ImageIcon,
    ImagePlus,
    Info,
    LayoutGrid,
    LockKeyhole,
    Mail,
    MapPin,
    MessageSquare,
    Pencil,
    Phone,
    Plus,
    ShieldCheck,
    Star,
    Trash2,
    UserRound,
    UserRoundCog,
    Wallet,
    Wrench,
} from "lucide-react";
import FormAlert from "../../../components/FormAlert";
import { changePassword, getProfile, updateProfile, uploadFile } from "../../../api/endpoints";
import { fileUrl } from "../../../api/client";
import { parseApiError } from "../../../api/errors";
import { useAreas, useGovernorates, useServices } from "../../../hooks/useReferenceData";
import { cleanPhone, getConfirmPasswordError, getEmailError, getPasswordError, getPhoneError } from "../../../utils/validators";
import ApplyModal from "./ApplyModal";

// أقسام القائمة الجانبية (كلها بنفس الصفحة) — "account" هو "تعديل الملف"
const SECTIONS = [
    { key: "account", icon: UserRound },
    { key: "verification", icon: ShieldCheck },
    { key: "works", icon: LayoutGrid },
    { key: "saved", icon: Bookmark },
    { key: "notifications", icon: Bell },
    { key: "personal", icon: UserRoundCog },
    { key: "password", icon: LockKeyhole },
];

const EXPERIENCE = ["lt1", "1_2", "2_5", "5_10", "gt10"];
const PHOTO_MAX = 5 * 1024 * 1024;

const card = "rounded-[18px] border border-[#0000000D] bg-white shadow-[0_4px_20px_rgba(35,74,100,0.07)]";
const input =
    "h-10 w-full rounded-xl border border-[#BFD9EC] bg-white px-4 text-[12px] text-[#141415] outline-none transition-colors placeholder:text-[#89949D] focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";
const label = "mb-2.5 block text-[11px] font-bold text-[#141415]";

/** بيانات الفورم من GET /profile */
function parseProfile(d) {
    const c = d?.craftsman || {};
    // الرقم بينحفظ بالسيرفر بصيغة +970XXXXXXXXX
    const phone = String(d?.phone || "").replace(/^\+97[02]/, "");
    return {
        name: d?.full_name || "",
        phone,
        governorateId: d?.governorate_id ? String(d.governorate_id) : "",
        areaId: d?.area_id ? String(d.area_id) : "",
        craftId: c.craft_id ? String(c.craft_id) : c.craft?.id ? String(c.craft.id) : "",
        experience: c.experience_range || "",
        bio: c.bio || d?.bio || "",
    };
}

/** قائمة منسدلة بأيقونة بالبداية وسهم بالنهاية */
function IconSelect({ id, icon: Icon, value, onChange, placeholder, options, error, disabled = false }) {
    return (
        <div className="relative">
            {Icon && <Icon size={15} strokeWidth={1.7} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />}
            <select
                id={id}
                value={value}
                onChange={onChange}
                disabled={disabled}
                aria-invalid={!!error}
                className={`${input} cursor-pointer appearance-none disabled:cursor-not-allowed disabled:bg-[#F5F6F8] pe-10 ${Icon ? "ps-10" : ""} ${value ? "" : "text-[#89949D]"} ${error ? "border-red-400" : ""}`}
            >
                <option value="" disabled>{placeholder}</option>
                {options.map((o) => (
                    <option key={o.value} value={o.value} className="text-[#141415]">{o.label}</option>
                ))}
            </select>
            <ArrowDown size={14} strokeWidth={1.5} className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-[#575757]" />
        </div>
    );
}

/** قسم "تعديل الملف" */
function EditProfile({ profile, onProfileChange }) {
    const { t } = useTranslation(["craftsmanDashboard", "signupCommon"]);
    const p = "profilePage.edit";
    const governorates = useGovernorates();
    const services = useServices();
    const initial = parseProfile(profile);
    const [form, setForm] = useState(initial);
    // المناطق بتنحمّل حسب المحافظة المختارة
    const areas = useAreas(form.governorateId);
    const [photo, setPhoto] = useState(null); // { file, url }
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null); // { type, text }
    const [saving, setSaving] = useState(false);
    const [loadedFor, setLoadedFor] = useState(profile);

    // لما توصل بيانات الملف من السيرفر (أو تتحدث بعد الحفظ) بنعبّي الفورم من جديد
    if (profile !== loadedFor) {
        setLoadedFor(profile);
        setForm(parseProfile(profile));
    }

    // رابط المعاينة بينمسح لما تتغير الصورة أو تتسكر الصفحة
    useEffect(() => () => photo && URL.revokeObjectURL(photo.url), [photo]);

    const update = (key) => (e) => {
        const value = e.target.value;
        // تغيير المحافظة بيفضّي المنطقة (لأنها بتتبع المحافظة القديمة)
        setForm((f) => ({ ...f, [key]: value, ...(key === "governorateId" && value !== f.governorateId ? { areaId: "" } : {}) }));
        setErrors((er) => ({ ...er, [key]: "" }));
        setMessage(null);
    };

    const pickPhoto = (file) => {
        if (!file) return;
        if (!/^image\/(jpeg|png)$/.test(file.type)) return setErrors((er) => ({ ...er, photo: t(`${p}.photoType`) }));
        if (file.size > PHOTO_MAX) return setErrors((er) => ({ ...er, photo: t(`${p}.photoSize`) }));
        setErrors((er) => ({ ...er, photo: "" }));
        setPhoto({ file, url: URL.createObjectURL(file) });
    };

    const reset = () => {
        setForm(parseProfile(profile));
        setPhoto(null);
        setErrors({});
        setMessage(null);
    };

    const submit = async (e) => {
        e.preventDefault();
        const phoneCode = getPhoneError(form.phone);
        const next = {
            name: form.name.trim() ? "" : t(`${p}.nameRequired`),
            phone: phoneCode ? t(`signupCommon:${phoneCode}`) : "",
            governorateId: form.governorateId ? "" : t(`${p}.required`),
            areaId: form.areaId ? "" : t(`${p}.required`),
            craftId: form.craftId ? "" : t(`${p}.required`),
        };
        setErrors(next);
        if (Object.values(next).some(Boolean)) return;

        setSaving(true);
        setMessage(null);
        try {
            const photoPath = photo ? await uploadFile(photo.file) : undefined;
            await updateProfile({
                full_name: form.name.trim(),
                phone: `+970${cleanPhone(form.phone)}`,
                governorate_id: Number(form.governorateId),
                area_id: Number(form.areaId),
                craft_id: Number(form.craftId),
                bio: form.bio.trim(),
                // ⚠️ نطاق الخبرة: لسا مش متأكدين إن السيرفر بيحفظه
                experience_range: form.experience,
                ...(photoPath ? { personal_photo_path: photoPath } : {}),
            });
            const fresh = (await getProfile()).data;
            onProfileChange(fresh);
            setPhoto(null);
            setMessage({ type: "success", text: t(`${p}.saved`) });
        } catch (err) {
            const { message: msg, fields } = parseApiError(err);
            setErrors({ name: fields.full_name || "", phone: fields.phone || "", areaId: fields.area_id || "", craftId: fields.craft_id || "" });
            setMessage({ type: "error", text: msg || t("signupCommon:networkError") });
        } finally {
            setSaving(false);
        }
    };

    const photoSrc = photo?.url || fileUrl(profile?.craftsman?.personal_photo_path);
    const verified = Boolean(profile?.craftsman?.is_trusted);
    const err = (key) => (errors[key] ? <p className="mt-1 text-[11px] text-red-500">{errors[key]}</p> : null);

    return (
        <form onSubmit={submit} noValidate className={`${card} p-5 sm:p-6`}>
            <h2 className="text-[15px] font-bold text-[#141415]">{t(`${p}.title`)}</h2>

            {/* الصورة الشخصية */}
            <div className="mt-4 flex items-center gap-3">
                <span className="relative shrink-0">
                    {photoSrc ? (
                        <img src={photoSrc} alt="" className="h-14 w-14 rounded-full object-cover" />
                    ) : (
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF3FB] text-[18px] font-bold text-[#4B9AD2]">
                            {form.name.trim().charAt(0)}
                        </span>
                    )}
                    {verified && (
                        <span className="absolute -bottom-0.5 -start-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#4B9AD2] text-white">
                            <ShieldCheck size={10} strokeWidth={3} />
                        </span>
                    )}
                </span>
                <div>
                    <p className="text-[12px] font-bold text-[#141415]">{t(`${p}.photo`)}</p>
                    <p className="mt-0.5 text-[9px] text-[#575757]">{t(`${p}.photoHint`)}</p>
                    <label className="mt-1 inline-block cursor-pointer text-[11px] font-semibold text-[#4B9AD2] hover:underline">
                        {t(`${p}.changePhoto`)}
                        <input
                            type="file"
                            accept="image/jpeg,image/png"
                            className="hidden"
                            onChange={(e) => {
                                pickPhoto(e.target.files?.[0]);
                                e.target.value = "";
                            }}
                        />
                    </label>
                    {err("photo")}
                </div>
            </div>

            {message && (
                <div className="mt-4">
                    {message.type === "error" ? (
                        <FormAlert messages={[message.text]} />
                    ) : (
                        <p role="status" className="rounded-lg border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-3 text-[12px] text-[#2E9E5B]">{message.text}</p>
                    )}
                </div>
            )}

            <fieldset disabled={saving} className="mt-5 grid gap-x-4 gap-y-5 sm:grid-cols-2">
                <div>
                    <label htmlFor="cp-name" className={label}>{t(`${p}.name`)}</label>
                    <input id="cp-name" value={form.name} onChange={update("name")} aria-invalid={!!errors.name} className={`${input} ${errors.name ? "border-red-400" : ""}`} />
                    {err("name")}
                </div>
                <div>
                    <label htmlFor="cp-phone" className={label}>{t(`${p}.phone`)}</label>
                    <input
                        id="cp-phone"
                        type="tel"
                        dir="ltr"
                        value={form.phone}
                        onChange={update("phone")}
                        aria-invalid={!!errors.phone}
                        className={`${input} text-end ${errors.phone ? "border-red-400" : ""}`}
                    />
                    {err("phone")}
                </div>
                <div>
                    <label htmlFor="cp-governorate" className={label}>{t(`${p}.governorate`)}</label>
                    <IconSelect
                        id="cp-governorate"
                        icon={MapPin}
                        value={form.governorateId}
                        onChange={update("governorateId")}
                        placeholder={t(`${p}.select`)}
                        options={governorates.options}
                        error={errors.governorateId}
                    />
                    {err("governorateId")}
                </div>
                <div>
                    <label htmlFor="cp-address" className={label}>{t(`${p}.address`)}</label>
                    <IconSelect
                        id="cp-address"
                        value={form.areaId}
                        onChange={update("areaId")}
                        placeholder={
                            !form.governorateId
                                ? t(`${p}.chooseGovernorateFirst`)
                                : areas.loading
                                    ? t(`${p}.loading`)
                                    : t(`${p}.select`)
                        }
                        options={areas.options}
                        error={errors.areaId}
                        disabled={!form.governorateId || areas.loading}
                    />
                    {err("areaId")}
                </div>
                <div>
                    <label htmlFor="cp-craft" className={label}>{t(`${p}.craft`)}</label>
                    <IconSelect
                        id="cp-craft"
                        icon={Wrench}
                        value={form.craftId}
                        onChange={update("craftId")}
                        placeholder={t(`${p}.select`)}
                        options={services.options}
                        error={errors.craftId}
                    />
                    {err("craftId")}
                </div>
                <div>
                    <label htmlFor="cp-experience" className={label}>{t(`${p}.experience`)}</label>
                    <IconSelect
                        id="cp-experience"
                        value={form.experience}
                        onChange={update("experience")}
                        placeholder={t(`${p}.select`)}
                        options={EXPERIENCE.map((k) => ({ value: k, label: t(`${p}.experienceOptions.${k}`) }))}
                    />
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="cp-bio" className={label}>
                        {t(`${p}.bio`)} <span className="font-normal text-[#89949D]">{t(`${p}.optional`)}</span>
                    </label>
                    <textarea
                        id="cp-bio"
                        rows={3}
                        maxLength={500}
                        value={form.bio}
                        onChange={update("bio")}
                        placeholder={t(`${p}.bioPlaceholder`)}
                        className={`${input} h-auto min-h-[84px] resize-none py-3 leading-[1.8]`}
                    />
                </div>
            </fieldset>

            {/* تنبيه: تغيير الحرفة بيروح للمراجعة */}
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#F2D27A] bg-[#FFF8DD] px-4 py-3.5">
                <Info size={14} className="mt-0.5 shrink-0 text-[#BF9900]" />
                <div>
                    <p className="text-[11px] font-semibold text-[#8A6D00]">{t(`${p}.craftNoteTitle`)}</p>
                    <p className="mt-1 text-[9px] text-[#8A6D00]">{t(`${p}.craftNoteDesc`)}</p>
                </div>
            </div>

            {/* الأزرار على جهة اليسار: "حفظ" بالطرف و"إلغاء" جنبه */}
            <div className="mt-5 flex flex-row-reverse flex-wrap gap-3">
                <button
                    type="submit"
                    disabled={saving}
                    className="h-10 min-w-[128px] cursor-pointer rounded-lg bg-linear-to-l from-[#1591DCCC] to-[#1383C6] px-5 text-[12px] font-semibold text-white shadow-[0_3px_8px_rgba(19,131,198,0.25)] btn-wipe disabled:cursor-not-allowed disabled:opacity-60 ltr:bg-linear-to-r"
                >
                    {saving ? t(`${p}.saving`) : t(`${p}.save`)}
                </button>
                <button
                    type="button"
                    onClick={reset}
                    disabled={saving}
                    className="h-10 min-w-[66px] cursor-pointer rounded-lg border border-[#4B9AD2] bg-white px-5 text-[12px] font-semibold text-[#4B9AD2] btn-wipe btn-wipe-outline"
                >
                    {t(`${p}.cancel`)}
                </button>
            </div>
        </form>
    );
}

// ==================== قسم "أعمالي" ====================

// ⚠️ ما في endpoint لأعمال الحرفي لسا، فالأعمال بتنحفظ بالصفحة بس.
// photos: صور مرفوعة بالصفحة { file, url } — photoCount: عدد الصور بالأعمال التجريبية
const SAMPLE_WORKS = [
    { id: "w1", title: "اصلاحات تمديد مياه لعمارة", place: "جباليا", date: "2026-10", photos: [], photoCount: 5 },
    { id: "w2", title: "اصلاحات تمديد مياه لعمارة", place: "جباليا", date: "2026-10", photos: [], photoCount: 5 },
    { id: "w3", title: "اصلاحات تمديد مياه لعمارة", place: "جباليا", date: "2026-10", photos: [], photoCount: 5 },
];

const imagesOnly = (files) => Array.from(files || []).filter((f) => /^image\/(jpeg|png)$/.test(f.type));

const WORK_PHOTOS_MAX = 5;

/** آخر 24 شهر لقائمة "تاريخ التنفيذ" بصيغة YYYY-MM */
function recentMonths() {
    const now = new Date();
    return Array.from({ length: 24 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    });
}

/** نافذة إضافة/تعديل عمل: الصور (حتى 5) + العنوان + المنطقة + تاريخ التنفيذ + الوصف */
function WorkModal({ work, initialFiles = [], governorateId, onSave, onClose }) {
    const { t, i18n } = useTranslation("craftsmanDashboard");
    const w = "profilePage.works.modal";
    const locale = `${i18n.language}-u-nu-latn`;
    // المناطق حسب محافظة الحرفي
    const areas = useAreas(governorateId);
    const [title, setTitle] = useState(work?.title || "");
    const [areaId, setAreaId] = useState(work?.areaId || "");
    const [date, setDate] = useState(work?.date || "");
    const [desc, setDesc] = useState(work?.desc || "");
    const [photos, setPhotos] = useState(() => [
        ...(work?.photos || []),
        ...initialFiles.slice(0, WORK_PHOTOS_MAX).map((file) => ({ file, url: URL.createObjectURL(file) })),
    ]);
    const [errors, setErrors] = useState({});
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

    const addFiles = (files) => {
        setPhotos((list) => [
            ...list,
            ...imagesOnly(files)
                .slice(0, WORK_PHOTOS_MAX - list.length)
                .map((file) => ({ file, url: URL.createObjectURL(file) })),
        ]);
        setErrors((er) => ({ ...er, photos: "" }));
    };

    const submit = (e) => {
        e.preventDefault();
        const next = {
            photos: photos.length ? "" : t(`${w}.photosRequired`),
            title: title.trim() ? "" : t(`${w}.titleRequired`),
        };
        setErrors(next);
        if (Object.values(next).some(Boolean)) return;
        const place = areas.options.find((o) => o.value === areaId)?.label || work?.place || "";
        onSave({ title: title.trim(), desc: desc.trim(), areaId, place, date, photos });
    };

    const fieldLabel = "mb-2 block text-[12px] font-bold text-[#141415]";
    const selectBox = `${input} cursor-pointer appearance-none ps-10 pe-10`;
    const arrow = <ArrowDown size={14} strokeWidth={1.5} className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-[#575757]" />;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#141415]/40 p-4 backdrop-blur-[2px]"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="work-modal-title"
                noValidate
                onSubmit={submit}
                className="flex max-h-[92vh] w-full max-w-[440px] flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_24px_60px_rgba(20,20,21,0.25)]"
            >
                <h2 id="work-modal-title" className="border-b border-[#0000000F] px-6 py-4 text-center text-[16px] font-bold text-[#141415]">
                    {work ? t(`${w}.editTitle`) : t(`${w}.addTitle`)}
                </h2>

                <div className="overflow-y-auto px-4 py-4">
                    {/* صور العمل */}
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-[12px] font-bold text-[#141415]">{t(`${w}.photos`)}</p>
                        <p className="text-[10px] text-[#286292]">{t(`${w}.photosCount`, { count: photos.length, max: WORK_PHOTOS_MAX })}</p>
                    </div>
                    <ul className="grid grid-cols-3 gap-2">
                        {photos.map((ph, i) => (
                            <li key={ph.url} className="relative h-[72px] overflow-hidden rounded-lg bg-linear-to-br from-[#BFDDF4] to-[#8EC0E4]">
                                <img src={ph.url} alt="" className="h-full w-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setPhotos((list) => list.filter((_, j) => j !== i))}
                                    aria-label={t("portfolio.remove")}
                                    className="absolute end-1 top-1 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-[#3F4650] text-white"
                                >
                                    <X size={10} strokeWidth={3} />
                                </button>
                            </li>
                        ))}
                        {photos.length < WORK_PHOTOS_MAX && (
                            <li>
                                <label
                                    className={`flex h-[72px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed bg-[#F7FBFE] text-[9px] text-[#575757] ${errors.photos ? "border-red-400" : "border-[#8EC0E4]"}`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        addFiles(e.dataTransfer.files);
                                    }}
                                >
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#4B9AD2] shadow-sm">
                                        <Plus size={13} />
                                    </span>
                                    {photos.length ? t(`${w}.morePhoto`) : t(`${w}.addPhoto`)}
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                            addFiles(e.target.files);
                                            e.target.value = "";
                                        }}
                                    />
                                </label>
                            </li>
                        )}
                    </ul>
                    {errors.photos && <p className="mt-1 text-[11px] text-red-500">{errors.photos}</p>}

                    {/* عنوان العمل */}
                    <label htmlFor="work-title" className={`${fieldLabel} mt-4`}>
                        {t(`${w}.title`)} <span className="text-[#D64545]">*</span>
                    </label>
                    <input
                        id="work-title"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            setErrors((er) => ({ ...er, title: "" }));
                        }}
                        placeholder={t(`${w}.titlePlaceholder`)}
                        aria-invalid={!!errors.title}
                        className={`${input} ${errors.title ? "border-red-400" : ""}`}
                    />
                    {errors.title && <p className="mt-1 text-[11px] text-red-500">{errors.title}</p>}

                    {/* المنطقة */}
                    <label htmlFor="work-area" className={`${fieldLabel} mt-4`}>{t(`${w}.area`)}</label>
                    <div className="relative">
                        <MapPin size={15} strokeWidth={1.7} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                        <select
                            id="work-area"
                            value={areaId}
                            onChange={(e) => setAreaId(e.target.value)}
                            disabled={!governorateId || areas.loading}
                            className={`${selectBox} disabled:cursor-not-allowed disabled:bg-[#F5F6F8] ${areaId ? "" : "text-[#89949D]"}`}
                        >
                            <option value="">{!governorateId ? t(`${w}.noGovernorate`) : areas.loading ? t("profilePage.edit.loading") : t(`${w}.chooseArea`)}</option>
                            {areas.options.map((o) => (
                                <option key={o.value} value={o.value} className="text-[#141415]">{o.label}</option>
                            ))}
                        </select>
                        {arrow}
                    </div>

                    {/* تاريخ التنفيذ */}
                    <label htmlFor="work-date" className={`${fieldLabel} mt-4`}>{t(`${w}.date`)}</label>
                    <div className="relative">
                        <CalendarDays size={15} strokeWidth={1.7} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                        <select
                            id="work-date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className={`${selectBox} ${date ? "" : "text-[#89949D]"}`}
                        >
                            <option value="">{t(`${w}.chooseDate`)}</option>
                            {recentMonths().map((ym) => (
                                <option key={ym} value={ym} className="text-[#141415]">
                                    {new Date(`${ym}-01`).toLocaleDateString(locale, { month: "long", year: "numeric" })}
                                </option>
                            ))}
                        </select>
                        {arrow}
                    </div>

                    {/* وصف العمل */}
                    <label htmlFor="work-desc" className={`${fieldLabel} mt-6`}>
                        {t(`${w}.desc`)} <span className="font-normal text-[#89949D]">{t("profilePage.edit.optional")}</span>
                    </label>
                    <textarea
                        id="work-desc"
                        rows={3}
                        maxLength={500}
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        placeholder={t(`${w}.descPlaceholder`)}
                        className={`${input} h-auto min-h-[84px] resize-none py-3 leading-[1.8]`}
                    />
                </div>

                <div className="flex gap-3 border-t border-[#0000000F] px-4 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 flex-1 cursor-pointer rounded-xl border border-[#4B9AD2] bg-white text-[13px] font-semibold text-[#4B9AD2] btn-wipe btn-wipe-outline"
                    >
                        {t(`${w}.cancel`)}
                    </button>
                    <button
                        type="submit"
                        className="h-11 flex-1 cursor-pointer rounded-xl bg-linear-to-l from-[#1591DCCC] to-[#1383C6] text-[13px] font-semibold text-white shadow-[0_4px_10px_rgba(19,131,198,0.3)] btn-wipe ltr:bg-linear-to-r"
                    >
                        {t(`${w}.save`)}
                    </button>
                </div>
            </form>
        </div>
    );
}

/** قائمة خيارات العمل (⋮): تعديل / حذف */
function WorkMenu({ label: menuLabel, onEdit, onDelete }) {
    const { t } = useTranslation("craftsmanDashboard");
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
        window.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onDown);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onDown);
        };
    }, [open]);

    const item = "flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[11px] hover:bg-[#EEF5FC]";
    return (
        <div ref={ref} className="relative shrink-0">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={menuLabel}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#89949D] hover:bg-[#EEF5FC] hover:text-[#4B9AD2]"
            >
                <EllipsisVertical size={15} />
            </button>
            {open && (
                <div role="menu" className="absolute end-0 top-full z-20 mt-1 w-[120px] rounded-xl border border-[#0000000D] bg-white p-1 shadow-[0_10px_30px_rgba(35,74,100,0.18)]">
                    <button type="button" role="menuitem" onClick={() => { setOpen(false); onEdit(); }} className={`${item} text-[#414141]`}>
                        <Pencil size={13} className="text-[#4B9AD2]" />
                        {t("profilePage.works.edit")}
                    </button>
                    <button type="button" role="menuitem" onClick={() => { setOpen(false); onDelete(); }} className={`${item} text-[#D64545] hover:bg-[#FFF3F3]`}>
                        <Trash2 size={13} />
                        {t("profilePage.works.delete")}
                    </button>
                </div>
            )}
        </div>
    );
}

/** قسم "أعمالي": شبكة الأعمال + مربع إضافة بالسحب أو الضغط */
function WorksSection({ governorateId }) {
    const { t, i18n } = useTranslation("craftsmanDashboard");
    const ws = "profilePage.works";
    const locale = `${i18n.language}-u-nu-latn`;
    const [works, setWorks] = useState(SAMPLE_WORKS);
    // { work?: عمل للتعديل, files?: صور مختارة من مربع السحب }
    const [modal, setModal] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [flash, setFlash] = useState("");

    // روابط معاينة الصور بتنمسح لما تتسكر الصفحة
    const worksRef = useRef(works);
    useEffect(() => {
        worksRef.current = works;
    }, [works]);
    useEffect(() => () => worksRef.current.forEach((w) => w.photos.forEach((p) => URL.revokeObjectURL(p.url))), []);

    const monthLabel = (ym) => (ym ? new Date(`${ym}-01`).toLocaleDateString(locale, { month: "long", year: "numeric" }) : "");

    const save = (data) => {
        if (modal.work) {
            setWorks((list) => list.map((w) => (w.id === modal.work.id ? { ...w, ...data, photoCount: data.photos.length || w.photoCount } : w)));
            setFlash(t(`${ws}.updated`));
        } else {
            setWorks((list) => [...list, { id: `w-${Date.now()}`, ...data, photoCount: data.photos.length }]);
            setFlash(t(`${ws}.added`));
        }
        setModal(null);
    };

    return (
        <section className={`${card} p-5 sm:p-6`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-[15px] font-bold text-[#141415]">{t(`${ws}.title`)}</h2>
                    <p className="mt-1.5 text-[12px] text-[#89949D]">{t(`${ws}.subtitle`)}</p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setFlash("");
                        setModal({});
                    }}
                    className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-linear-to-l from-[#1591DCCC] to-[#1383C6] px-4 text-[11px] font-semibold text-white shadow-[0_3px_8px_rgba(19,131,198,0.25)] btn-wipe ltr:bg-linear-to-r"
                >
                    <Plus size={16} />
                    {t(`${ws}.add`)}
                </button>
            </div>

            {flash && <p role="status" className="mt-4 rounded-lg border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-2.5 text-[12px] text-[#2E9E5B]">{flash}</p>}
            {confirmDelete && (
                <div role="alertdialog" className="mt-4 flex flex-col gap-3 rounded-xl border border-[#F3C4C4] bg-[#FFF6F6] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[12px] text-[#A61B29]">{t(`${ws}.confirmDelete`, { title: confirmDelete.title })}</p>
                    <div className="flex shrink-0 gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                confirmDelete.photos.forEach((p) => URL.revokeObjectURL(p.url));
                                setWorks((list) => list.filter((w) => w.id !== confirmDelete.id));
                                setConfirmDelete(null);
                                setFlash(t(`${ws}.deleted`));
                            }}
                            className="h-9 cursor-pointer rounded-lg bg-[#D64545] px-4 text-[12px] font-medium text-white hover:bg-[#B83636]"
                        >
                            {t(`${ws}.delete`)}
                        </button>
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(null)}
                            className="h-9 cursor-pointer rounded-lg border border-[#0000001A] bg-white px-4 text-[12px] font-medium text-[#575757] hover:bg-[#F5F6F8]"
                        >
                            {t(`${ws}.modal.cancel`)}
                        </button>
                    </div>
                </div>
            )}

            <ul className="mt-6 grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {works.map((w) => (
                    <li key={w.id}>
                        <div className="relative h-[150px] overflow-hidden rounded-2xl bg-[#D6E6F4]">
                            {w.photos[0] && <img src={w.photos[0].url} alt={w.title} className="h-full w-full object-cover" />}
                            <span dir="ltr" className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-[#3F4650]/75 px-2.5 py-1 text-[11px] font-bold text-white">
                                <span className="tabular-nums">{w.photos.length || w.photoCount}</span>
                                <ImageIcon size={12} />
                            </span>
                        </div>
                        <div className="mt-3.5 flex items-start justify-between gap-2 ps-1">
                            <div className="min-w-0">
                                <h3 className="truncate text-[14px] font-bold text-[#141415]">{w.title}</h3>
                                {w.desc && <p className="mt-1.5 line-clamp-2 text-[11px] leading-[1.7] text-[#414141]">{w.desc}</p>}
                                <p className="mt-2 text-[12px] text-[#575757]">
                                    {[w.place, monthLabel(w.date)].filter(Boolean).join(" _ ")}
                                </p>
                            </div>
                            <WorkMenu
                                label={t(`${ws}.options`, { title: w.title })}
                                onEdit={() => {
                                    setFlash("");
                                    setModal({ work: w });
                                }}
                                onDelete={() => {
                                    setFlash("");
                                    setConfirmDelete(w);
                                }}
                            />
                        </div>
                    </li>
                ))}
                {/* مربع الإضافة: الصور المسحوبة أو المختارة بتفتح نافذة "إضافة عمل" */}
                <li>
                    <label
                        className="flex h-[160px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#8EC0E4] bg-[#EEF5FC] text-[12px] font-semibold text-[#4B9AD2] transition-colors hover:bg-[#E4EFFA] lg:me-3"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            const files = imagesOnly(e.dataTransfer.files);
                            if (files.length) setModal({ files });
                        }}
                    >
                        <ImagePlus size={26} strokeWidth={1.5} />
                        {t(`${ws}.drop`)}
                        <input
                            type="file"
                            accept="image/jpeg,image/png"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                                const files = imagesOnly(e.target.files);
                                e.target.value = "";
                                if (files.length) setModal({ files });
                            }}
                        />
                    </label>
                </li>
            </ul>

            {modal && (
                <WorkModal
                    key={modal.work?.id || "new"}
                    work={modal.work}
                    initialFiles={modal.files}
                    governorateId={governorateId}
                    onSave={save}
                    onClose={() => setModal(null)}
                />
            )}
        </section>
    );
}

// ==================== قسم "قائمة الحفظ" ====================

// ⚠️ ما في endpoint للفرص المحفوظة لسا — بيانات تجريبية (النصوص بملف الترجمة: profilePage.saved.sample.<id>)
// status: open (مفتوحة للتقديم) | closed (انتهى التقديم) — budget: [أقل، أعلى] بالشيكل
const SAVED = [
    { id: "s1", ref: "302-2026-1", status: "open", budget: [1000, 1400], deadline: "2026-10-16", distance: 2.4 },
    { id: "s2", ref: "302-2026-2", status: "open", budget: [1000, 1400], deadline: "2026-10-16", distance: 2.4 },
    { id: "s3", ref: "298-2026-4", status: "closed", budget: [600, 900], deadline: "2026-09-28", distance: 5.1 },
];
const SAVED_TABS = ["all", "open", "closed"];

/** قسم "قائمة الحفظ": الفرص اللي حفظها الحرفي مع فلتر مفتوحة/مغلقة */
function SavedSection() {
    const { t, i18n } = useTranslation("craftsmanDashboard");
    const sv = "profilePage.saved";
    const locale = `${i18n.language}-u-nu-latn`;
    const [tab, setTab] = useState("all");
    const [removed, setRemoved] = useState([]);
    const [undo, setUndo] = useState(null); // آخر فرصة انشالت (للتراجع)
    const [applyJob, setApplyJob] = useState(null);
    const [applied, setApplied] = useState({});
    const [flash, setFlash] = useState("");

    const items = SAVED.filter((x) => !removed.includes(x.id) && (tab === "all" || x.status === tab));
    const text = (id, key) => t(`${sv}.sample.${id}.${key}`);

    const unsave = (x) => {
        setRemoved((list) => [...list, x.id]);
        setUndo(x);
        setFlash("");
    };

    return (
        <section className={`${card} p-4 sm:p-5`}>
            <div role="tablist" className="flex flex-wrap gap-2">
                {SAVED_TABS.map((key) => {
                    const active = tab === key;
                    return (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => setTab(key)}
                            className={`h-9 cursor-pointer rounded-full px-4 text-[11px] font-semibold transition-colors ${active
                                ? "min-w-[66px] bg-[#4B9AD2] text-white shadow-[0_4px_12px_rgba(75,154,210,0.3)]"
                                : "border border-[#CFE3F3] bg-white text-[#4B9AD2] hover:border-[#8EC0E4]"
                                }`}
                        >
                            {t(`${sv}.tabs.${key}`)}
                        </button>
                    );
                })}
            </div>

            {undo && (
                <div role="status" className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-[#CFE3F3] bg-[#EEF5FC] px-4 py-2.5 text-[12px] text-[#286292]">
                    {t(`${sv}.removed`)}
                    <button
                        type="button"
                        onClick={() => {
                            setRemoved((list) => list.filter((id) => id !== undo.id));
                            setUndo(null);
                        }}
                        className="cursor-pointer font-semibold hover:underline"
                    >
                        {t(`${sv}.undo`)}
                    </button>
                </div>
            )}
            {flash && <p role="status" className="mt-4 rounded-lg border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-2.5 text-[12px] text-[#2E9E5B]">{flash}</p>}

            {items.length ? (
                <ul className="mt-4 flex flex-col gap-3">
                    {items.map((x) => {
                        const org = text(x.id, "org");
                        const closed = x.status === "closed";
                        return (
                            <li key={x.id} className="rounded-2xl border border-[#0000000F] bg-white p-4 shadow-[0_2px_10px_rgba(35,74,100,0.05)]">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#EAF3FB] bg-white text-[13px] font-bold text-[#4B9AD2]">
                                            {org.trim().charAt(0)}
                                        </span>
                                        <div className="min-w-0">
                                            <h3 className="truncate text-[13px] font-bold text-[#141415]">{text(x.id, "title")}</h3>
                                            <p className="mt-1 truncate text-[11px] text-[#575757]">
                                                {org} _ <bdi dir="ltr">{x.ref}</bdi>
                                            </p>
                                        </div>
                                    </div>
                                    <span className="shrink-0 rounded-full border border-[#CFE3F3] bg-[#EEF5FC] px-2.5 py-0.5 text-[9px] text-[#4B9AD2]">
                                        {t("jobs.orgType")}
                                    </span>
                                </div>

                                {/* الميزانية / آخر موعد / الموقع */}
                                <dl className="mt-4 grid grid-cols-3 rounded-xl bg-[#EEF5FC] text-center">
                                    {[
                                        { key: "budget", value: t(`${sv}.budgetValue`, { min: x.budget[0], max: x.budget[1] }) },
                                        { key: "deadline", value: new Date(x.deadline).toLocaleDateString(locale, { day: "numeric", month: "long" }) },
                                        { key: "location", value: text(x.id, "location") },
                                    ].map((row, i) => (
                                        <div key={row.key} className={`px-2 py-3 ${i > 0 ? "border-s border-white" : ""}`}>
                                            <dt className="text-[11px] text-[#575757]">{t(`${sv}.${row.key}`)}</dt>
                                            <dd className="mt-1.5 text-[14px] font-bold text-[#141415] tabular-nums">{row.value}</dd>
                                        </div>
                                    ))}
                                </dl>

                                <div className="mt-3 flex items-center justify-end gap-2 border-t border-[#0000000A] pt-3">
                                    <button
                                        type="button"
                                        onClick={() => unsave(x)}
                                        aria-label={t(`${sv}.unsave`)}
                                        title={t(`${sv}.unsave`)}
                                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[#4B9AD2] hover:bg-[#EEF5FC]"
                                    >
                                        <Bookmark size={19} fill="currentColor" />
                                    </button>
                                    {closed ? (
                                        <span className="inline-flex h-9 items-center rounded-lg bg-[#EEF0F2] px-4 text-[11px] font-medium text-[#6B7280]">
                                            {t(`${sv}.closedLabel`)}
                                        </span>
                                    ) : applied[x.id] ? (
                                        <span className="inline-flex h-9 items-center gap-1 rounded-lg bg-[#DDF6E3] px-4 text-[11px] font-medium text-[#2EAF4E]">
                                            {t("jobs.applied")}
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFlash("");
                                                setApplyJob(x);
                                            }}
                                            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-linear-to-l from-[#1591DCCC] to-[#1383C6] px-4 text-[11px] font-semibold text-white shadow-[0_3px_8px_rgba(19,131,198,0.25)] btn-wipe ltr:bg-linear-to-r"
                                        >
                                            {t("jobs.details")}
                                            <ChevronLeft size={15} strokeWidth={2.5} className="ltr:rotate-180" />
                                        </button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="py-12 text-center text-[12px] text-[#89949D]">{t(`${sv}.empty`)}</p>
            )}

            {applyJob && (
                <ApplyModal
                    key={applyJob.id}
                    job={{
                        id: applyJob.id,
                        title: text(applyJob.id, "title"),
                        org: text(applyJob.id, "org"),
                        desc: text(applyJob.id, "desc"),
                        location: text(applyJob.id, "location"),
                        time: new Date(applyJob.deadline).toLocaleDateString(locale, { day: "numeric", month: "long" }),
                        distance: applyJob.distance,
                        budget: applyJob.budget,
                    }}
                    onClose={() => setApplyJob(null)}
                    // ⚠️ التقديم بالصفحة بس لحد ما يصير في endpoint
                    onSend={(offer) => {
                        setApplied((a) => ({ ...a, [applyJob.id]: offer }));
                        setFlash(t("jobs.modal.sent", { org: text(applyJob.id, "org") }));
                        setApplyJob(null);
                    }}
                />
            )}
        </section>
    );
}

// ==================== قسم "إعدادات الإشعارات" ====================

// locked: إشعارات إلزامية ما بتنطفى (مرتبطة بمواعيد ومبالغ)
const APP_NOTIFICATIONS = [
    { key: "requests", icon: Briefcase, locked: true },
    { key: "payments", icon: Wallet, locked: true },
    { key: "tenders", icon: Flag },
    { key: "messages", icon: MessageSquare },
    { key: "reviews", icon: Star },
];
const SMS_NOTIFICATIONS = [{ key: "sms", icon: MessageSquare }];

// ⚠️ ما في endpoint لتفضيلات إشعارات الحرفي لسا، فبتنحفظ بالمتصفح مؤقتاً.
// لما يجهز، استبدلي readNotificationPrefs/saveNotificationPrefs بطلبات GET/PUT من src/api/endpoints.js
const NOTIFICATION_PREFS_KEY = "sanaa_craftsman_notification_prefs";
const DEFAULT_NOTIFICATION_PREFS = { tenders: true, messages: true, reviews: false, sms: true };

function readNotificationPrefs() {
    try {
        return { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(localStorage.getItem(NOTIFICATION_PREFS_KEY) || "{}") };
    } catch {
        return DEFAULT_NOTIFICATION_PREFS;
    }
}

function saveNotificationPrefs(prefs) {
    try {
        localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
    } catch {
        // التخزين ممكن يكون ممنوع بالمتصفح، مش مشكلة
    }
}

/** مفتاح تشغيل/إيقاف بشكل التصميم: التشغيل أزرق والدائرة على جهة النهاية */
function PrefSwitch({ checked, onChange, label: switchLabel, locked }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={switchLabel}
            aria-disabled={locked || undefined}
            onClick={() => !locked && onChange(!checked)}
            className={`relative h-[19px] w-8 shrink-0 rounded-full transition-colors duration-300 ${locked ? "cursor-not-allowed" : "cursor-pointer"} ${checked ? "bg-[#4B87BE]" : "bg-[#D5DCE2]"
                }`}
        >
            <span
                className={`absolute top-1/2 h-[13px] w-[13px] -translate-y-1/2 rounded-full bg-white shadow-sm transition-all duration-300 ${checked ? "end-[3px]" : "start-[3px]"}`}
            />
        </button>
    );
}

/** قسم "إعدادات الإشعارات": إشعارات التطبيق + رسائل SMS */
function NotificationSettings() {
    const { t } = useTranslation("craftsmanDashboard");
    const ns = "profilePage.notificationSettings";
    const [prefs, setPrefs] = useState(readNotificationPrefs);

    const toggle = (key) => (value) => {
        const next = { ...prefs, [key]: value };
        setPrefs(next);
        saveNotificationPrefs(next);
    };

    const group = (titleKey, items) => (
        <div>
            <h3 className="mb-2.5 text-[11px] font-semibold text-[#575757]">{t(`${ns}.${titleKey}`)}</h3>
            <ul className="divide-y divide-[#0000000F] rounded-2xl border border-[#0000000F] px-3">
                {items.map(({ key, icon: Icon, locked }) => {
                    const base = `${ns}.items.${key}`;
                    return (
                        <li key={key} className="flex items-center justify-between gap-4 py-3.5">
                            <div className="flex items-start gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF3FB] text-[#4B9AD2]">
                                    <Icon size={15} />
                                </span>
                                <div>
                                    <p className="text-[12px] font-bold text-[#141415]">{t(`${base}.title`)}</p>
                                    <p className="mt-1 max-w-[260px] text-[10px] leading-[1.8] text-[#575757]">{t(`${base}.desc`)}</p>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                                {locked && <span className="text-[9px] text-[#89949D]">{t(`${ns}.required`)}</span>}
                                <PrefSwitch
                                    checked={locked ? true : Boolean(prefs[key])}
                                    onChange={toggle(key)}
                                    locked={locked}
                                    label={t(`${base}.title`)}
                                />
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );

    return (
        <section className={`${card} flex flex-col gap-5 p-5 sm:p-6`}>
            {group("appTitle", APP_NOTIFICATIONS)}
            {group("smsTitle", SMS_NOTIFICATIONS)}
            <p className="flex items-center gap-2 px-3 text-[10px] text-[#575757]">
                <Info size={12} className="shrink-0 text-[#89949D]" />
                {t(`${ns}.lockedNote`)}
            </p>
        </section>
    );
}

// ==================== قسم "المعلومات الشخصية" ====================

/** قسم "المعلومات الشخصية": عرض البيانات مع تعديل الجوال والبريد والعنوان بنفس السطر */
function PersonalInfo({ profile, onProfileChange }) {
    const { t, i18n } = useTranslation(["craftsmanDashboard", "signupCommon"]);
    const pi = "profilePage.personal";
    const locale = `${i18n.language}-u-nu-latn`;
    const governorates = useGovernorates();
    // السطر اللي بنعدّله هلأ: "phone" | "email" | "address" | null
    const [editing, setEditing] = useState(null);
    const [draft, setDraft] = useState({});
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [flash, setFlash] = useState("");
    const areasForDraft = useAreas(draft.governorateId || "");
    const savedAreas = useAreas(profile?.governorate_id ? String(profile.governorate_id) : "");

    const phone = String(profile?.phone || "").replace(/^\+97[02]/, "");
    const governorateName = governorates.items.find((g) => g.id === profile?.governorate_id)?.name;
    const areaName = savedAreas.items.find((a) => a.id === profile?.area_id)?.name;
    const address = [governorateName, areaName].filter(Boolean).join(" ، ");
    const joined = profile?.created_at ? new Date(profile.created_at).toLocaleDateString(locale, { month: "long", year: "numeric" }) : "";

    const startEdit = (key) => {
        setFlash("");
        setError("");
        setEditing(key);
        setDraft(
            key === "phone"
                ? { phone }
                : key === "email"
                    ? { email: profile?.email || "" }
                    : { governorateId: profile?.governorate_id ? String(profile.governorate_id) : "", areaId: profile?.area_id ? String(profile.area_id) : "" }
        );
    };

    const save = async () => {
        let body;
        if (editing === "phone") {
            const code = getPhoneError(draft.phone);
            if (code) return setError(t(`signupCommon:${code}`));
            body = { phone: `+970${cleanPhone(draft.phone)}` };
        } else if (editing === "email") {
            const code = getEmailError(draft.email);
            if (code) return setError(t(`signupCommon:${code}`));
            body = { email: draft.email.trim() };
        } else {
            if (!draft.governorateId || !draft.areaId) return setError(t("profilePage.edit.required"));
            body = { governorate_id: Number(draft.governorateId), area_id: Number(draft.areaId) };
        }
        setSaving(true);
        setError("");
        try {
            await updateProfile(body);
            onProfileChange((await getProfile()).data);
            setEditing(null);
            setFlash(t(`${pi}.saved`));
        } catch (err) {
            const { message, fields } = parseApiError(err);
            setError(fields.phone || fields.email || fields.area_id || message || t("signupCommon:networkError"));
        } finally {
            setSaving(false);
        }
    };

    const rows = [
        { key: "name", icon: UserRound, value: profile?.full_name },
        { key: "phone", icon: Phone, value: phone, ltr: true, action: "change" },
        { key: "email", icon: Mail, value: profile?.email, ltr: true, action: "edit" },
        { key: "address", icon: UserRound, value: address, action: "edit" },
        { key: "joined", icon: CalendarDays, value: joined },
    ];

    const editor = () => {
        if (editing === "address") {
            return (
                <div className="grid gap-2 sm:grid-cols-2">
                    <IconSelect
                        id="pi-governorate"
                        icon={MapPin}
                        value={draft.governorateId}
                        onChange={(e) => setDraft({ governorateId: e.target.value, areaId: "" })}
                        placeholder={t("profilePage.edit.governorate")}
                        options={governorates.options}
                    />
                    <IconSelect
                        id="pi-area"
                        value={draft.areaId}
                        onChange={(e) => setDraft((d) => ({ ...d, areaId: e.target.value }))}
                        placeholder={!draft.governorateId ? t("profilePage.edit.chooseGovernorateFirst") : areasForDraft.loading ? t("profilePage.edit.loading") : t("profilePage.edit.select")}
                        options={areasForDraft.options}
                        disabled={!draft.governorateId || areasForDraft.loading}
                    />
                </div>
            );
        }
        const key = editing;
        return (
            <input
                autoFocus
                type={key === "email" ? "email" : "tel"}
                dir="ltr"
                value={draft[key]}
                onChange={(e) => {
                    setDraft({ [key]: e.target.value });
                    setError("");
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        save();
                    }
                    if (e.key === "Escape") setEditing(null);
                }}
                aria-label={t(`${pi}.rows.${key}`)}
                className={`${input} text-end`}
            />
        );
    };

    return (
        <section className={`${card} px-4 py-3 sm:px-5`}>
            {flash && <p role="status" className="mb-2 mt-2 rounded-lg border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-2.5 text-[12px] text-[#2E9E5B]">{flash}</p>}
            <ul className="divide-y divide-[#0000000F]">
                {rows.map(({ key, icon: Icon, value, ltr, action }) => (
                    <li key={key} className="flex items-start gap-3 py-4">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF3FB] text-[#4B9AD2]">
                            <Icon size={15} />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-bold text-[#141415]">{t(`${pi}.rows.${key}`)}</p>
                            {editing === key ? (
                                <div className="mt-2">
                                    {editor()}
                                    {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
                                    <div className="mt-2 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={save}
                                            disabled={saving}
                                            className="h-8 cursor-pointer rounded-lg bg-[#4B9AD2] px-4 text-[11px] font-semibold text-white btn-wipe disabled:opacity-60"
                                        >
                                            {saving ? t("profilePage.edit.saving") : t(`${pi}.save`)}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditing(null)}
                                            disabled={saving}
                                            className="h-8 cursor-pointer rounded-lg border border-[#0000001A] bg-white px-4 text-[11px] font-medium text-[#575757] hover:bg-[#F5F6F8]"
                                        >
                                            {t("profilePage.edit.cancel")}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-1.5 truncate text-[12px] text-[#575757]">
                                    {value ? <bdi dir={ltr ? "ltr" : undefined}>{value}</bdi> : "—"}
                                </p>
                            )}
                        </div>
                        {action && editing !== key && (
                            <button
                                type="button"
                                onClick={() => startEdit(key)}
                                className="shrink-0 self-center cursor-pointer text-[12px] font-semibold text-[#4B87BE] hover:underline"
                            >
                                {t(`${pi}.${action}`)}
                            </button>
                        )}
                    </li>
                ))}
            </ul>
            <p className="border-t border-[#0000000F] pb-1 pt-2.5 text-[9px] text-[#575757]">{t(`${pi}.nameNote`)}</p>
        </section>
    );
}

// ==================== قسم "كلمة المرور" ====================

const EMPTY_PASSWORDS = { current: "", password: "", confirm: "" };

/** قسم "كلمة المرور": الحالية + الجديدة وتأكيدها */
function PasswordSection() {
    const { t } = useTranslation(["craftsmanDashboard", "signupCommon"]);
    const pw = "profilePage.password";
    const [form, setForm] = useState(EMPTY_PASSWORDS);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null); // { type, text }
    const [saving, setSaving] = useState(false);
    // الحقول اللي كلمتها ظاهرة
    const [visible, setVisible] = useState({});

    const update = (key) => (e) => {
        setForm((f) => ({ ...f, [key]: e.target.value }));
        setErrors((er) => ({ ...er, [key]: "" }));
        setMessage(null);
    };

    const submit = async (e) => {
        e.preventDefault();
        const passwordCode = getPasswordError(form.password);
        const confirmCode = getConfirmPasswordError(form.confirm, form.password);
        const next = {
            current: form.current ? "" : t(`${pw}.currentRequired`),
            password: passwordCode ? t(`signupCommon:${passwordCode}`) : form.password === form.current ? t(`${pw}.sameAsCurrent`) : "",
            confirm: confirmCode ? t(`signupCommon:${confirmCode}`) : "",
        };
        setErrors(next);
        if (Object.values(next).some(Boolean)) return;

        setSaving(true);
        setMessage(null);
        try {
            const res = await changePassword(form.current, form.password, form.confirm);
            setForm(EMPTY_PASSWORDS);
            setMessage({ type: "success", text: res.message || t(`${pw}.success`) });
        } catch (err) {
            const { status, message: msg, fields } = parseApiError(err);
            if (status === 404 || status === 405) {
                setMessage({ type: "error", text: t(`${pw}.unavailable`) });
            } else {
                setErrors({ current: fields.current_password || "", password: fields.password || "", confirm: fields.password_confirmation || "" });
                setMessage({ type: "error", text: msg || t("signupCommon:networkError") });
            }
        } finally {
            setSaving(false);
        }
    };

    const field = (key, autoComplete) => (
        <div>
            <label htmlFor={`pw-${key}`} className="mb-2.5 block text-[13px] font-bold text-[#22303C]">{t(`${pw}.${key}`)}</label>
            <div className="relative">
                <input
                    id={`pw-${key}`}
                    type={visible[key] ? "text" : "password"}
                    dir="ltr"
                    autoComplete={autoComplete}
                    value={form[key]}
                    onChange={update(key)}
                    aria-invalid={!!errors[key]}
                    className={`h-9 w-full rounded-lg border bg-white pl-10 pr-3 text-right text-[13px] tracking-wider text-[#141415] outline-none transition-colors focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2] ${errors[key] ? "border-red-400" : "border-[#4B9AD2]"
                        }`}
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => ({ ...v, [key]: !v[key] }))}
                    aria-label={visible[key] ? t("signupCommon:hidePassword") : t("signupCommon:showPassword")}
                    aria-pressed={!!visible[key]}
                    className="absolute left-3 top-1/2 flex -translate-y-1/2 cursor-pointer text-[#4B9AD2]"
                >
                    {visible[key] ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
            </div>
            {errors[key] && <p className="mt-1 text-[11px] text-red-500">{errors[key]}</p>}
        </div>
    );

    return (
        <form onSubmit={submit} noValidate className={`${card} p-5 sm:p-6`}>
            <h2 className="text-[19px] font-bold text-[#22303C]">{t(`${pw}.title`)}</h2>

            {message && (
                <div className="mt-4">
                    {message.type === "error" ? (
                        <FormAlert messages={[message.text]} />
                    ) : (
                        <p role="status" className="rounded-lg border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-3 text-[12px] text-[#2E9E5B]">{message.text}</p>
                    )}
                </div>
            )}

            <fieldset disabled={saving} className="mt-6 flex flex-col gap-7">
                {field("current", "current-password")}
                <div className="grid gap-x-2 gap-y-5 sm:grid-cols-2">
                    {field("password", "new-password")}
                    {field("confirm", "new-password")}
                </div>
            </fieldset>

            <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
                <Link to="/forget-password" className="ms-auto text-[13px] font-medium text-[#4B87BE] hover:underline sm:order-first sm:ms-0 sm:me-24">
                    {t(`${pw}.forgot`)}
                </Link>
                <button
                    type="submit"
                    disabled={saving}
                    className="h-10 w-full cursor-pointer rounded-xl bg-linear-to-l from-[#1591DCCC] to-[#1383C6] text-[12px] font-semibold text-white shadow-[0_4px_10px_rgba(19,131,198,0.3)] btn-wipe disabled:cursor-not-allowed disabled:opacity-60 sm:w-[186px] ltr:bg-linear-to-r"
                >
                    {saving ? t(`${pw}.saving`) : t(`${pw}.save`)}
                </button>
            </div>
        </form>
    );
}

// ==================== قسم "التوثيق" ====================

const VERIFY_GREEN = "#10B981";
const VERIFY_STEPS = ["submitted", "reviewing", "approved"];

/** قسم "التوثيق": حالة الحساب + مراحل التوثيق + المستندات المرفوعة */
function VerificationSection({ profile }) {
    const { t, i18n } = useTranslation("craftsmanDashboard");
    const vs = "profilePage.verification";
    const locale = `${i18n.language}-u-nu-latn`;
    const c = profile?.craftsman || {};
    const verified = Boolean(c.is_trusted);
    // المرحلة الحالية: 3 = كل المراحل مكتملة (موثّق)، 1 = المستندات انبعتت وبانتظار المراجعة
    const stage = verified ? VERIFY_STEPS.length : 1;
    const approvedAt = c.verified_at || c.trusted_at;

    // المستندات اللي انرفعت وقت التسجيل
    const documents = [
        { key: "photo", path: c.personal_photo_path },
        { key: "id", path: c.id_selfie_path },
    ];

    return (
        <div className="flex flex-col gap-4">
            {/* حالة الحساب */}
            {verified ? (
                <section className="flex items-start gap-3 rounded-[18px] border border-[#A7E8CF] bg-[#ECFBF4] px-5 py-4">
                    <ShieldCheck size={17} className="mt-0.5 shrink-0" style={{ color: VERIFY_GREEN }} />
                    <div>
                        <h2 className="text-[13px] font-bold text-[#0B7A55]">{t(`${vs}.verifiedTitle`)}</h2>
                        <p className="mt-1.5 text-[10px] text-[#0B7A55]">
                            {approvedAt
                                ? t(`${vs}.verifiedDesc`, { date: new Date(approvedAt).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }) })
                                : t(`${vs}.verifiedDescNoDate`)}
                        </p>
                    </div>
                </section>
            ) : (
                <section className="flex items-start gap-3 rounded-[18px] border border-[#F2D27A] bg-[#FFF8DD] px-5 py-4">
                    <Clock size={17} className="mt-0.5 shrink-0 text-[#BF9900]" />
                    <div>
                        <h2 className="text-[13px] font-bold text-[#8A6D00]">{t(`${vs}.pendingTitle`)}</h2>
                        <p className="mt-1.5 text-[10px] text-[#8A6D00]">{t(`${vs}.pendingDesc`)}</p>
                    </div>
                </section>
            )}

            {/* مراحل التوثيق */}
            <section className={`${card} px-5 py-5`}>
                <div className="relative">
                    <span aria-hidden="true" className="absolute inset-x-4 top-4 h-[3px] -translate-y-1/2 rounded-full bg-[#E6EBF0]" />
                    <span
                        aria-hidden="true"
                        className="absolute start-4 top-4 h-[3px] -translate-y-1/2 rounded-full transition-all"
                        style={{ width: `calc((100% - 2rem) * ${Math.min(stage, VERIFY_STEPS.length - 1) / (VERIFY_STEPS.length - 1)})`, background: VERIFY_GREEN }}
                    />
                    <ol className="relative flex items-start justify-between">
                        {VERIFY_STEPS.map((key, i) => {
                            const done = i < stage;
                            const current = i === stage;
                            const align = i === 0 ? "items-start text-start" : i === VERIFY_STEPS.length - 1 ? "items-end text-end" : "items-center text-center";
                            return (
                                <li key={key} className={`flex flex-col ${align}`}>
                                    <span
                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${current ? "ring-4 ring-[#FDEFC4]" : ""}`}
                                        style={{ background: done ? VERIFY_GREEN : current ? "#E8B21C" : "#E6EBF0" }}
                                    >
                                        {done ? <Check size={16} strokeWidth={3} /> : current ? <Clock size={15} /> : <span className="text-[11px] font-bold text-[#89949D]">{i + 1}</span>}
                                    </span>
                                    <span className={`mt-2.5 max-w-[80px] text-[11px] font-bold leading-[1.5] ${done || current ? "text-[#141415]" : "text-[#89949D]"}`}>
                                        {t(`${vs}.steps.${key}`)}
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </section>

            {/* المستندات */}
            <section className={`${card} px-5 py-6 sm:px-8`}>
                <h2 className="text-[15px] font-bold text-[#141415]">{t(`${vs}.documentsTitle`)}</h2>
                <ul className="mt-5 flex flex-col gap-3">
                    {documents.map((doc) => (
                        <li key={doc.key} className="flex items-center gap-3 rounded-xl border border-[#CFE3F3] bg-[#EEF5FC] px-4 py-3.5">
                            <FileText size={18} strokeWidth={1.6} className="shrink-0 text-[#4B9AD2]" />
                            <div className="min-w-0 flex-1">
                                <p className="text-[12px] text-[#141415]">{t(`${vs}.documents.${doc.key}.title`)}</p>
                                <p className="mt-1 text-[9px] text-[#575757]">
                                    {(verified ? t(`${vs}.statusAccepted`) : t(`${vs}.statusReviewing`))} . {t(`${vs}.documents.${doc.key}.visibility`)}
                                </p>
                            </div>
                            {doc.path ? (
                                <span className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-medium text-white ${verified ? "bg-[#4B9AD2]" : "bg-[#E8B21C]"}`}>
                                    {verified ? t(`${vs}.statusAccepted`) : t(`${vs}.statusReviewing`)}
                                </span>
                            ) : (
                                <span className="shrink-0 rounded-lg bg-[#EEF0F2] px-3 py-1.5 text-[11px] font-medium text-[#6B7280]">{t(`${vs}.statusMissing`)}</span>
                            )}
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}

/** قسم لسا ما إله تصميم */
function SectionPlaceholder({ title }) {
    const { t } = useTranslation("craftsmanDashboard");
    return (
        <section className={`${card} flex flex-col items-center px-6 py-16 text-center`}>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF3FB] text-[#4B9AD2]">
                <Construction size={24} />
            </span>
            <h2 className="mt-4 text-[15px] font-bold text-[#141415]">{title}</h2>
            <p className="mt-2 text-[12px] text-[#89949D]">{t("profilePage.soon")}</p>
        </section>
    );
}

/** الصفحة الشخصية للحرفي: قائمة أقسام على جنب + القسم المختار */
export default function CraftsmanProfile({ profile, onProfileChange }) {
    const { t } = useTranslation("craftsmanDashboard");
    const [section, setSection] = useState("account");
    const pageTitle = section === "account" ? t("profilePage.edit.title") : t(`profilePage.sections.${section}`);

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-4">
            <nav aria-label="breadcrumb" className="flex items-center gap-1 text-[11px] text-[#575757]">
                <button type="button" onClick={() => setSection("account")} className="cursor-pointer text-[#4B9AD2] hover:underline">
                    {t("profilePage.sections.account")}
                </button>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{pageTitle}</span>
            </nav>
            <h1 className="text-[22px] font-bold text-[#141415]">{pageTitle}</h1>

            <div className="grid items-start gap-5 lg:grid-cols-[260px_1fr]">
                {/* القائمة الجانبية */}
                <nav className={`${card} p-2`}>
                    <ul className="flex flex-col">
                        {SECTIONS.map(({ key, icon: Icon }) => {
                            const active = section === key;
                            return (
                                <li key={key}>
                                    <button
                                        type="button"
                                        onClick={() => setSection(key)}
                                        aria-current={active ? "page" : undefined}
                                        className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors ${active ? "bg-[#EEF5FC]" : "hover:bg-[#F7FAFD]"}`}
                                    >
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF3FB] text-[#4B9AD2]">
                                            <Icon size={15} />
                                        </span>
                                        <span className={`flex-1 text-[12px] ${active ? "font-bold text-[#4B9AD2]" : "font-semibold text-[#141415]"}`}>
                                            {t(`profilePage.sections.${key}`)}
                                        </span>
                                        <ChevronLeft size={14} className="shrink-0 text-[#89949D] ltr:rotate-180" />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {section === "account" ? (
                    <EditProfile profile={profile} onProfileChange={onProfileChange} />
                ) : section === "verification" ? (
                    <VerificationSection profile={profile} />
                ) : section === "password" ? (
                    <PasswordSection />
                ) : section === "personal" ? (
                    <PersonalInfo profile={profile} onProfileChange={onProfileChange} />
                ) : section === "notifications" ? (
                    <NotificationSettings />
                ) : section === "saved" ? (
                    <SavedSection />
                ) : section === "works" ? (
                    <WorksSection governorateId={profile?.governorate_id ? String(profile.governorate_id) : ""} />
                ) : (
                    <SectionPlaceholder title={t(`profilePage.sections.${section}`)} />
                )}
            </div>
        </div>
    );
}
