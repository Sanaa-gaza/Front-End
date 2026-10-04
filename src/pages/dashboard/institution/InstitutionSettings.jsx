import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, Camera, ChevronDown, CircleAlert, Eye, EyeOff, FileText, MapPin } from "lucide-react";
import StatusTabs from "../../../components/dashboard/StatusTabs";
import FormAlert from "../../../components/FormAlert";
import DropzoneField from "../../../components/DropzoneField";
import { useAreas, useGovernorates } from "../../../hooks/useReferenceData";
import { changePassword, deleteAccount, getProfile, updateProfile, uploadFile } from "../../../api/endpoints";
import { fileUrl } from "../../../api/client";
import { clearAuth } from "../../../api/session";
import { cleanPhone, getConfirmPasswordError, getPasswordError, getPhoneError } from "../../../utils/validators";
import { parseApiError } from "../../../api/errors";

const TABS = ["general", "notifications", "security"];

const card = "rounded-[20px] border border-[#0000000D] bg-white p-5 shadow-[0_4px_24px_rgba(35,74,100,0.06)] sm:p-6";
const label = "mb-1.5 block text-[12px] text-[#575757]";
const input =
    "h-11 w-full rounded-xl border border-[#8EC0E4] bg-white px-4 text-[13px] text-[#414141] outline-none transition-colors focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";
const saveButton =
    "h-10 cursor-pointer rounded-lg bg-[#4B9AD2] px-6 text-[13px] font-medium text-white btn-wipe disabled:cursor-not-allowed disabled:opacity-60";

/** قائمة منسدلة بأيقونة دبوس بالبداية وسهم بالنهاية */
function PinSelect({ id, value, onChange, disabled, placeholder, options, error }) {
    return (
        <div>
            <div className="relative">
                <MapPin size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                <select
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className={`${input} cursor-pointer appearance-none ps-9 pe-9 disabled:cursor-not-allowed disabled:opacity-60 ${error ? "border-red-400" : ""}`}
                >
                    <option value="" disabled hidden>
                        {placeholder}
                    </option>
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
            </div>
            {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
        </div>
    );
}

/**
 * يقرأ بيانات المؤسسة من رد GET /profile.
 * شكل الرد للمؤسسة مش موثق بالـ Postman، فبندوّر بالمستوى الأول وداخل كائن institution.
 */
function parseProfile(d = {}) {
    const inst = d.institution || d.institution_profile || {};
    const pick = (...keys) => {
        for (const k of keys) {
            const v = inst[k] ?? d[k];
            if (v) return v;
        }
        return "";
    };
    // الرقم بينحفظ بالسيرفر بصيغة +970XXXXXXXXX
    const phoneMatch = String(d.phone || "").match(/^(\+97[02])(\d+)$/);
    return {
        name: pick("institution_name", "full_name"),
        activity: pick("activity_type"),
        phoneCode: phoneMatch ? phoneMatch[1] : "+970",
        phone: phoneMatch ? phoneMatch[2] : String(d.phone || ""),
        governorateId: d.governorate_id ? String(d.governorate_id) : "",
        areaId: d.area_id ? String(d.area_id) : "",
        licensePath: pick("license_file_path", "license_path"),
        licenseUrl: pick("license_file_url", "license_url"),
        photoPath: pick("profile_photo_path", "logo_path", "personal_photo_path"),
        photoUrl: pick("profile_photo_url", "logo_url", "personal_photo_url"),
    };
}

const EMPTY_PROFILE = parseProfile();

// ==================== تبويب الإعدادات العامة ====================

/** تبويب "الإعدادات العامة": بيانات المؤسسة */
function GeneralSettings() {
    const { t } = useTranslation("institutionDashboard");

    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(EMPTY_PROFILE);
    // الملفات اللي بالسيرفر حالياً (الرخصة والصورة)
    const [files, setFiles] = useState({ licensePath: "", licenseUrl: "", photoPath: "", photoUrl: "" });
    const [licenseFile, setLicenseFile] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null); // { type: "success" | "warning" | "error", text }
    const [saving, setSaving] = useState(false);


    const governorates = useGovernorates();
    const areas = useAreas(form.governorateId);

    const applyProfile = (p) => {
        setForm(p);
        setFiles({ licensePath: p.licensePath, licenseUrl: p.licenseUrl, photoPath: p.photoPath, photoUrl: p.photoUrl });
    };

    useEffect(() => {
        getProfile()
            .then((res) => applyProfile(parseProfile(res.data)))
            .catch((err) => {
                setMessage({ type: "error", text: parseApiError(err).message || t("signupCommon:networkError") });
            })
            .finally(() => setLoading(false));
    }, [t]);

    const update = (field) => (value) => {
        setForm((f) => ({ ...f, [field]: value }));
        setErrors((e) => ({ ...e, [field]: "" }));
        setMessage(null);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        setMessage(null);
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const next = {
            name: form.name.trim() ? "" : t("settingsPage.info.nameRequired"),
            activity: form.activity.trim() ? "" : t("settingsPage.info.activityRequired"),
            phone: getPhoneError(form.phone) ? t(`signupCommon:${getPhoneError(form.phone)}`) : "",
            areaId: form.areaId ? "" : t("settingsPage.info.areaRequired"),
        };
        setErrors(next);
        if (Object.values(next).some(Boolean)) return;

        setSaving(true);
        setMessage(null);
        try {
            // الملفات الجديدة بتنرفع أول، وبعدين بنبعت مساراتها مع باقي البيانات
            const [licensePath, photoPath] = await Promise.all([
                licenseFile ? uploadFile(licenseFile) : null,
                photoFile ? uploadFile(photoFile) : null,
            ]);

            const phone = `${form.phoneCode}${cleanPhone(form.phone)}`;
            await updateProfile({
                full_name: form.name.trim(),
                institution_name: form.name.trim(),
                activity_type: form.activity.trim(),
                phone,
                governorate_id: Number(form.governorateId),
                area_id: Number(form.areaId),
                ...(licensePath && { license_file_path: licensePath }),
                ...(photoPath && { profile_photo_path: photoPath }),
            });

            // السيرفر بيتجاهل الحقول اللي ما بيسمح بتعديلها بدون ما يرجع خطأ،
            // فبنجيب البيانات من جديد ونقارن عشان ما نعرض "تم الحفظ" على شي ما انحفظ
            const saved = parseProfile((await getProfile()).data);
            const ignored = [];
            if (saved.name !== form.name.trim()) ignored.push(t("settingsPage.info.name"));
            if (saved.activity !== form.activity.trim()) ignored.push(t("settingsPage.info.activity"));
            if (`${saved.phoneCode}${saved.phone}` !== phone) ignored.push(t("settingsPage.info.phone"));
            if (saved.areaId !== form.areaId) ignored.push(t("settingsPage.info.area"));
            if (licensePath && saved.licensePath !== licensePath) ignored.push(t("settingsPage.info.license"));
            if (photoPath && saved.photoPath !== photoPath) ignored.push(t("settingsPage.info.photo"));

            setFiles({
                licensePath: saved.licensePath,
                licenseUrl: saved.licenseUrl,
                photoPath: saved.photoPath,
                photoUrl: saved.photoUrl,
            });
            setLicenseFile(null);
            if (!ignored.includes(t("settingsPage.info.photo"))) {
                setPhotoFile(null);
                setPhotoPreview("");
            }

            setMessage(
                ignored.length
                    ? { type: "warning", text: t("settingsPage.notSaved", { fields: ignored.join("، ") }) }
                    : { type: "success", text: t("settingsPage.saved") }
            );
        } catch (err) {
            const { message: msg, fields } = parseApiError(err);
            setErrors({
                name: fields.full_name || fields.institution_name || "",
                activity: fields.activity_type || "",
                phone: fields.phone || "",
                areaId: fields.area_id || fields.governorate_id || "",
                license: fields.license_file_path || fields.file || "",
                photo: fields.profile_photo_path || "",
            });
            setMessage({ type: "error", text: msg || t("signupCommon:networkError") });
        } finally {
            setSaving(false);
        }
    };

    const photoSrc = photoPreview || fileUrl(files.photoUrl || files.photoPath);
    const licenseHref = fileUrl(files.licenseUrl || files.licensePath);
    const messageStyles = {
        success: "border-[#BFEBCD] bg-[#E8F8EE] text-[#2E9E5B]",
        warning: "border-[#F6D58E] bg-[#FFF7E3] text-[#9A6B00]",
    };

    return (
        <form onSubmit={handleSave} noValidate className={card}>
                <h2 className="mb-5 text-[15px] font-bold text-[#22455E]">{t("settingsPage.info.title")}</h2>

                {message &&
                    (message.type === "error" ? (
                        <FormAlert messages={[message.text]} />
                    ) : (
                        <p role="status" className={`mb-5 rounded-lg border px-4 py-3 text-[13px] ${messageStyles[message.type]}`}>
                            {message.text}
                        </p>
                    ))}

                <fieldset disabled={loading || saving} className="flex flex-col gap-4">
                    {/* الصورة الشخصية للمؤسسة */}
                    <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[#0000001A] bg-[#F5F6F8] ring-4 ring-[#E4EFFA]">
                                {photoSrc ? (
                                    <img src={photoSrc} alt={t("settingsPage.info.photo")} className="h-full w-full object-cover" />
                                ) : (
                                    <Building2 size={30} className="text-[#89949D]" />
                                )}
                            </div>
                            <label
                                htmlFor="inst-photo"
                                aria-label={t("settingsPage.info.changePhoto")}
                                className="absolute -bottom-1 end-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#4B9AD2] text-white transition-colors hover:bg-[#3d82b3]"
                            >
                                <Camera size={13} />
                            </label>
                            <input
                                id="inst-photo"
                                type="file"
                                accept="image/jpeg,image/png"
                                className="hidden"
                                onChange={handlePhotoChange}
                            />
                        </div>
                        <div>
                            <p className="text-[13px] font-semibold text-[#414141]">{t("settingsPage.info.photo")}</p>
                            <label htmlFor="inst-photo" className="mt-1 inline-block cursor-pointer text-[12px] font-medium text-[#4B9AD2] underline-offset-4 hover:underline">
                                {photoSrc ? t("settingsPage.info.changePhoto") : t("settingsPage.info.addPhoto")}
                            </label>
                            {errors.photo && <p className="mt-1 text-[11px] text-red-500">{errors.photo}</p>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="inst-name" className={label}>{t("settingsPage.info.name")}</label>
                        <input
                            id="inst-name"
                            value={form.name}
                            onChange={(e) => update("name")(e.target.value)}
                            placeholder={loading ? t("settingsPage.loading") : ""}
                            className={`${input} ${errors.name ? "border-red-400" : ""}`}
                        />
                        {errors.name && <p className="mt-1 text-[11px] text-red-500">{errors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="inst-activity" className={label}>{t("settingsPage.info.activity")}</label>
                        <input
                            id="inst-activity"
                            value={form.activity}
                            onChange={(e) => update("activity")(e.target.value)}
                            className={`${input} ${errors.activity ? "border-red-400" : ""}`}
                        />
                        {errors.activity && <p className="mt-1 text-[11px] text-red-500">{errors.activity}</p>}
                    </div>

                    <div>
                        <label htmlFor="inst-phone" className={label}>{t("settingsPage.info.phone")}</label>
                        <div className="flex" dir="ltr">
                            <select
                                value={form.phoneCode}
                                onChange={(e) => update("phoneCode")(e.target.value)}
                                aria-label={t("signupCommon:countryCode")}
                                className={`h-11 shrink-0 cursor-pointer appearance-none rounded-s-xl border border-e-0 bg-[#EAF3FB] px-4 text-[12px] font-bold text-[#414141] outline-none ${errors.phone ? "border-red-400" : "border-[#8EC0E4]"}`}
                            >
                                <option value="+970">+970</option>
                                <option value="+972">+972</option>
                            </select>
                            <input
                                id="inst-phone"
                                type="tel"
                                value={form.phone}
                                onChange={(e) => update("phone")(e.target.value)}
                                placeholder="59xxxxxxx"
                                className={`${input} rounded-s-none text-end ${errors.phone ? "border-red-400" : ""}`}
                            />
                        </div>
                        {errors.phone && <p className="mt-1 text-[11px] text-red-500">{errors.phone}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="inst-gov" className={label}>{t("settingsPage.info.governorate")}</label>
                            <PinSelect
                                id="inst-gov"
                                value={form.governorateId}
                                onChange={(v) => {
                                    update("governorateId")(v);
                                    update("areaId")("");
                                }}
                                placeholder={t("settingsPage.select")}
                                options={governorates.options}
                            />
                        </div>
                        <div>
                            <label htmlFor="inst-area" className={label}>{t("settingsPage.info.area")}</label>
                            <PinSelect
                                id="inst-area"
                                value={form.areaId}
                                onChange={update("areaId")}
                                disabled={!form.governorateId}
                                placeholder={t("settingsPage.select")}
                                options={areas.options}
                                error={errors.areaId}
                            />
                        </div>
                    </div>

                    {/* الرخصة التجارية اللي انرفعت وقت إنشاء الحساب */}
                    <div>
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                            <span className="text-[12px] text-[#575757]">{t("settingsPage.info.license")}</span>
                            {licenseHref ? (
                                <a
                                    href={licenseHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[12px] font-medium text-[#4B9AD2] underline-offset-4 hover:underline"
                                >
                                    <FileText size={14} />
                                    {t("settingsPage.info.viewLicense")}
                                </a>
                            ) : (
                                !loading && <span className="text-[11px] text-[#89949D]">{t("settingsPage.info.noLicense")}</span>
                            )}
                        </div>
                        <DropzoneField
                            id="inst-license"
                            icon="fa-solid fa-paperclip"
                            dropHint={t("settingsPage.info.replaceLicense")}
                            hint={t("settingsPage.info.licenseHint")}
                            accept="image/jpeg,image/png,application/pdf"
                            file={licenseFile}
                            onChange={(e) => {
                                setLicenseFile(e.target.files?.[0] || null);
                                setErrors((er) => ({ ...er, license: "" }));
                                setMessage(null);
                            }}
                            error={errors.license}
                        />
                    </div>
                </fieldset>

                <button type="submit" disabled={loading || saving} className={`${saveButton} mt-2`}>
                    {saving ? t("settingsPage.saving") : t("settingsPage.save")}
                </button>
        </form>
    );
}

// ==================== تبويب الإشعارات والخصوصية ====================

const prefsCard = "rounded-[20px] border border-[#0000000D] bg-white px-5 pb-2 pt-5 shadow-[0_4px_24px_rgba(35,74,100,0.06)] sm:px-6";

const SECTIONS = [
    { key: "notifications", items: ["newTenders", "offerReplies", "messages", "deadlines", "email"] },
    { key: "privacy", items: ["showContact", "searchVisible"] },
];

// القيم الافتراضية زي التصميم
const DEFAULTS = {
    newTenders: false,
    offerReplies: false,
    messages: false,
    deadlines: true,
    email: false,
    showContact: false,
    searchVisible: false,
};

// ⚠️ الباك إند ما فيه endpoint للتفضيلات لسا، فبتنحفظ بالمتصفح مؤقتاً.
// لما يجهز، استبدلي readPrefs/savePrefs بطلبات GET/PUT من src/api/endpoints.js
const STORAGE_KEY = "sanaa_institution_prefs";

function readPrefs() {
    try {
        return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
    } catch {
        return DEFAULTS;
    }
}

function savePrefs(prefs) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
        // التخزين ممكن يكون ممنوع بالمتصفح، مش مشكلة
    }
}

/** مفتاح تشغيل/إيقاف */
function Toggle({ checked, onChange, label }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            dir="ltr"
            className={`relative h-7 w-[50px] shrink-0 cursor-pointer rounded-full transition-colors duration-300 ${checked ? "bg-[#4B9AD2]" : "bg-[#E4EFFA]"
                }`}
        >
            <span
                className={`absolute top-1/2 left-1 h-5 w-5 -translate-y-1/2 rounded-full shadow-sm transition-all duration-300 ${checked ? "translate-x-[22px] bg-white" : "bg-[#4B9AD2]"
                    }`}
            />
        </button>
    );
}

/** تبويب "الإشعارات والخصوصية" بصفحة الإعدادات */
function PreferencesSettings() {
    const { t } = useTranslation("institutionDashboard");
    const [prefs, setPrefs] = useState(readPrefs);

    const toggle = (key) => (value) => {
        const next = { ...prefs, [key]: value };
        setPrefs(next);
        savePrefs(next);
    };

    return (
        <div className="flex flex-col gap-6">
            {SECTIONS.map((section) => (
                <section key={section.key} className={prefsCard}>
                    <h2 className="border-b border-[#0000001A] pb-4 text-[16px] font-bold text-[#22455E]">
                        {t(`preferencesPage.${section.key}.title`)}
                    </h2>
                    <ul className="divide-y divide-[#0000000F]">
                        {section.items.map((item) => {
                            const base = `preferencesPage.${section.key}.${item}`;
                            return (
                                <li key={item} className="flex items-center justify-between gap-4 py-4">
                                    <div>
                                        <p className="text-[13px] font-bold text-[#414141]">{t(`${base}.title`)}</p>
                                        <p className="mt-1 text-[11px] text-[#89949D]">{t(`${base}.desc`)}</p>
                                    </div>
                                    <Toggle checked={prefs[item]} onChange={toggle(item)} label={t(`${base}.title`)} />
                                </li>
                            );
                        })}
                    </ul>
                </section>
            ))}
        </div>
    );
}

// ==================== تبويب الأمان ====================


const EMPTY = { current: "", password: "", confirm: "" };

// الـ endpoint مش موجود بالسيرفر لسا → 404 أو 405
const isUnavailable = (status) => status === 404 || status === 405;

/** حقل كلمة مرور مع زر عين لإظهارها وإخفائها */
function PasswordInput({ className = "", ...props }) {
    const { t } = useTranslation("signupCommon");
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <input {...props} type={visible ? "text" : "password"} className={`${input} pe-11 ${className}`} />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? t("hidePassword") : t("showPassword")}
                className="absolute end-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#4B9AD2]"
            >
                {visible ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
        </div>
    );
}

/** رسالة خطأ تحت الحقل */
function FieldError({ text }) {
    return text ? <p className="mt-1 text-[11px] text-red-500">{text}</p> : null;
}

/** بطاقة تغيير كلمة المرور */
function ChangePasswordCard() {
    const { t } = useTranslation(["institutionDashboard", "signupCommon"]);
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null); // { type: "success" | "error", text }
    const [saving, setSaving] = useState(false);

    const update = (field) => (e) => {
        setForm((f) => ({ ...f, [field]: e.target.value }));
        setErrors((er) => ({ ...er, [field]: "" }));
        setMessage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const passwordCode = getPasswordError(form.password);
        const confirmCode = getConfirmPasswordError(form.confirm, form.password);
        const next = {
            current: form.current ? "" : t("securityPage.password.currentRequired"),
            password: passwordCode
                ? t(`signupCommon:${passwordCode}`)
                : form.password === form.current
                    ? t("securityPage.password.sameAsCurrent")
                    : "",
            confirm: confirmCode ? t(`signupCommon:${confirmCode}`) : "",
        };
        setErrors(next);
        if (Object.values(next).some(Boolean)) return;

        setSaving(true);
        setMessage(null);
        try {
            const res = await changePassword(form.current, form.password, form.confirm);
            setForm(EMPTY);
            setMessage({ type: "success", text: res.message || t("securityPage.password.success") });
        } catch (err) {
            const { status, message: msg, fields } = parseApiError(err);
            if (isUnavailable(status)) {
                setMessage({ type: "error", text: t("securityPage.unavailable") });
            } else {
                setErrors({
                    current: fields.current_password || "",
                    password: fields.password || "",
                    confirm: fields.password_confirmation || "",
                });
                setMessage({ type: "error", text: msg || t("signupCommon:networkError") });
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className={card}>
            <h2 className="mb-5 text-[15px] font-bold text-[#22455E]">{t("securityPage.password.title")}</h2>

            {message &&
                (message.type === "error" ? (
                    <FormAlert messages={[message.text]} />
                ) : (
                    <p role="status" className="mb-5 rounded-lg border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-3 text-[13px] text-[#2E9E5B]">
                        {message.text}
                    </p>
                ))}

            <fieldset disabled={saving} className="flex flex-col gap-4">
                <div>
                    <label htmlFor="sec-current" className={label}>{t("securityPage.password.current")}</label>
                    <PasswordInput
                        id="sec-current"
                        autoComplete="current-password"
                        value={form.current}
                        onChange={update("current")}
                        className={`${errors.current ? "border-red-400" : ""}`}
                    />
                    <FieldError text={errors.current} />
                    <Link
                        to="/forget-password"
                        className="mt-2 inline-block text-[12px] font-medium text-[#4B9AD2] underline-offset-4 hover:underline"
                    >
                        {t("securityPage.password.forgot")}
                    </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="sec-new" className={label}>{t("securityPage.password.new")}</label>
                        <PasswordInput
                            id="sec-new"
                            autoComplete="new-password"
                            value={form.password}
                            onChange={update("password")}
                            className={`${errors.password ? "border-red-400" : ""}`}
                        />
                        <FieldError text={errors.password} />
                    </div>
                    <div>
                        <label htmlFor="sec-confirm" className={label}>{t("securityPage.password.confirm")}</label>
                        <PasswordInput
                            id="sec-confirm"
                            autoComplete="new-password"
                            value={form.confirm}
                            onChange={update("confirm")}
                            className={`${errors.confirm ? "border-red-400" : ""}`}
                        />
                        <FieldError text={errors.confirm} />
                    </div>
                </div>
            </fieldset>

            <button
                type="submit"
                disabled={saving}
                className="mt-6 h-10 cursor-pointer rounded-lg bg-[#4B9AD2] px-6 text-[13px] font-medium text-white btn-wipe disabled:cursor-not-allowed disabled:opacity-60"
            >
                {saving ? t("securityPage.password.submitting") : t("securityPage.password.submit")}
            </button>
        </form>
    );
}

/** بطاقة حذف الحساب — الحذف بيحتاج تأكيد بكلمة المرور */
function DeleteAccountCard() {
    const { t } = useTranslation(["institutionDashboard", "signupCommon"]);
    const navigate = useNavigate();
    const [confirming, setConfirming] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);

    const cancel = () => {
        setConfirming(false);
        setPassword("");
        setError("");
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        if (!password) {
            setError(t("signupCommon:passwordRequired"));
            return;
        }
        setDeleting(true);
        setError("");
        try {
            await deleteAccount(password);
            clearAuth();
            navigate("/", { replace: true });
        } catch (err) {
            const { status, message, fields } = parseApiError(err);
            setError(
                isUnavailable(status)
                    ? t("securityPage.unavailable")
                    : fields.password || message || t("signupCommon:networkError")
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <section className={card}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F9D6D9] text-[#A61B29]">
                        <CircleAlert size={22} strokeWidth={1.8} />
                    </span>
                    <div>
                        <h2 className="text-[14px] font-bold text-[#414141]">{t("securityPage.delete.title")}</h2>
                        <p className="mt-1 text-[12px] leading-[1.8] text-[#89949D]">{t("securityPage.delete.desc")}</p>
                    </div>
                </div>
                {!confirming && (
                    <button
                        type="button"
                        onClick={() => setConfirming(true)}
                        className="h-10 shrink-0 cursor-pointer self-start rounded-lg border border-[#D64545] px-5 text-[13px] font-medium text-[#D64545] transition-colors hover:bg-[#D64545] hover:text-white sm:self-center"
                    >
                        {t("securityPage.delete.button")}
                    </button>
                )}
            </div>

            {confirming && (
                <form onSubmit={handleDelete} noValidate className="mt-5 rounded-xl border border-[#F3C4C4] bg-[#FFF6F6] p-4">
                    <label htmlFor="sec-delete-password" className="mb-2 block text-[12px] font-medium text-[#A61B29]">
                        {t("securityPage.delete.confirmTitle")}
                    </label>
                    <PasswordInput
                        id="sec-delete-password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setError("");
                        }}
                        autoFocus
                        className={`border-[#F3C4C4] focus:border-[#D64545] focus:ring-[#D64545] ${error ? "border-red-400" : ""}`}
                    />
                    <FieldError text={error} />
                    <div className="mt-4 flex flex-wrap gap-3">
                        <button
                            type="submit"
                            disabled={deleting}
                            className="h-10 cursor-pointer rounded-lg bg-[#D64545] px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#B83636] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {deleting ? t("securityPage.delete.deleting") : t("securityPage.delete.confirm")}
                        </button>
                        <button
                            type="button"
                            onClick={cancel}
                            disabled={deleting}
                            className="h-10 cursor-pointer rounded-lg border border-[#0000001A] bg-white px-5 text-[13px] font-medium text-[#575757] transition-colors hover:bg-[#F5F6F8]"
                        >
                            {t("securityPage.delete.cancel")}
                        </button>
                    </div>
                </form>
            )}
        </section>
    );
}

/** تبويب "الأمان" بصفحة الإعدادات */
function SecuritySettings() {
    return (
        <div className="flex flex-col gap-6">
            <ChangePasswordCard />
            <DeleteAccountCard />
        </div>
    );
}

// ==================== الصفحة ====================

export default function InstitutionSettings() {
    const { t } = useTranslation("institutionDashboard");
    const [tab, setTab] = useState("general");

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
            <StatusTabs
                tabs={TABS.map((key) => ({ key, label: t(`settingsPage.tabs.${key}`) }))}
                value={tab}
                onChange={setTab}
            />

            {tab === "general" && <GeneralSettings />}
            {tab === "notifications" && <PreferencesSettings />}
            {tab === "security" && <SecuritySettings />}
        </div>
    );
}
