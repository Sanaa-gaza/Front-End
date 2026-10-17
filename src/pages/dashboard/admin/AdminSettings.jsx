import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Eye, EyeOff, LockKeyhole } from "lucide-react";
import FormAlert from "../../../components/FormAlert";
import { Toggle } from "../institution/InstitutionSettings";
import { changePassword, updateProfile } from "../../../api/endpoints";
import { parseApiError } from "../../../api/errors";
import { getStoredUser } from "../../../api/session";
import { cleanPhone, getEmailError, getPhoneError, passwordRequirements } from "../../../utils/validators";

const TABS = ["profile", "security", "notifications"];
const PREFS = ["requests", "support", "verification", "tenders", "email"];

const card = "rounded-[20px] border border-[#0000000D] bg-white p-5 shadow-[0_4px_24px_rgba(35,74,100,0.08)] sm:p-6";
const input =
    "h-10 w-full rounded-lg border border-[#BFD9EC] bg-white px-3 text-[12px] text-[#141415] outline-none transition-colors focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2] disabled:bg-[#F5F6F8] disabled:text-[#89949D]";
const label = "mb-2.5 block text-[12px] text-[#575757]";

// ⚠️ الباك إند ما فيه endpoint لتفضيلات الأدمن لسا، فبتنحفظ بالمتصفح مؤقتاً.
// لما يجهز، استبدلي readPrefs/savePrefs بطلبات GET/PUT من src/api/endpoints.js
const STORAGE_KEY = "sanaa_admin_prefs";
const DEFAULT_PREFS = { requests: false, support: false, verification: false, tenders: true, email: false };

function readPrefs() {
    try {
        return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
    } catch {
        return DEFAULT_PREFS;
    }
}

function savePrefs(prefs) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
        // التخزين ممكن يكون ممنوع بالمتصفح، مش مشكلة
    }
}

/** تبويب "الملف الشخصي": الاسم والبريد والجوال (الدور للعرض بس) + حفظ وتراجع */
function ProfileSettings() {
    const { t } = useTranslation(["adminDashboard", "signupCommon"]);
    const pr = "settingsPage.profile";
    const user = getStoredUser() || {};
    // الدور: المسمى الوظيفي من السيرفر لو موجود، وإلا "مدير النظام"
    const role = user.job_title || user.position || t(`${pr}.roleValue`);
    const initial = { name: user.full_name || "", email: user.email || "", phone: user.phone || "" };
    const [saved, setSaved] = useState(initial);
    const [form, setForm] = useState(initial);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null); // { type, text }
    const [saving, setSaving] = useState(false);
    const changed = form.name !== saved.name || form.email !== saved.email || form.phone !== saved.phone;

    const update = (key) => (e) => {
        setForm((f) => ({ ...f, [key]: e.target.value }));
        setErrors((er) => ({ ...er, [key]: "" }));
        setMessage(null);
    };

    const revert = () => {
        setForm(saved);
        setErrors({});
        setMessage(null);
    };

    const submit = async (e) => {
        e.preventDefault();
        const emailCode = getEmailError(form.email);
        const phoneCode = form.phone ? getPhoneError(form.phone) : "";
        const next = {
            name: form.name.trim() ? "" : t(`${pr}.nameRequired`),
            email: emailCode ? t(`signupCommon:${emailCode}`) : "",
            phone: phoneCode ? t(`signupCommon:${phoneCode}`) : "",
        };
        setErrors(next);
        if (Object.values(next).some(Boolean)) return;

        setSaving(true);
        setMessage(null);
        try {
            await updateProfile({
                full_name: form.name.trim(),
                email: form.email.trim(),
                ...(form.phone ? { phone: cleanPhone(form.phone) } : {}),
            });
            setSaved(form);
            setMessage({ type: "success", text: t(`${pr}.saved`) });
        } catch (err) {
            const { message: msg, fields } = parseApiError(err);
            setErrors({ name: fields.full_name || "", email: fields.email || "", phone: fields.phone || "" });
            setMessage({ type: "error", text: msg || t("signupCommon:networkError") });
        } finally {
            setSaving(false);
        }
    };

    const fieldInput = (key) => `${input} ${errors[key] ? "border-red-400" : ""}`;
    const err = (key) => (errors[key] ? <p className="mt-1 text-[11px] text-red-500">{errors[key]}</p> : null);

    return (
        <form onSubmit={submit} noValidate className={`${card} border-t-2 border-t-[#9CC9EA]`}>
            {/* الصورة + الاسم + الدور */}
            <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EAF3FB] text-[15px] font-bold text-[#4B9AD2]">
                    {(saved.name || "").trim().charAt(0)}
                </span>
                <div className="min-w-0">
                    <p className="truncate text-[16px] font-bold text-[#141415]">{saved.name}</p>
                    <p className="mt-1 text-[13px] text-[#575757]">{role}</p>
                </div>
            </div>

            {message &&
                (message.type === "error" ? (
                    <div className="mt-5"><FormAlert messages={[message.text]} /></div>
                ) : (
                    <p role="status" className="mt-5 rounded-lg border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-3 text-[13px] text-[#2E9E5B]">{message.text}</p>
                ))}

            <fieldset disabled={saving} className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="admin-name" className={label}>{t(`${pr}.name`)}</label>
                    <input id="admin-name" value={form.name} onChange={update("name")} aria-invalid={!!errors.name} className={fieldInput("name")} />
                    {err("name")}
                </div>
                <div>
                    <label htmlFor="admin-role" className={label}>{t(`${pr}.role`)}</label>
                    <div className="relative">
                        <input
                            id="admin-role"
                            value={role}
                            readOnly
                            className="h-10 w-full cursor-default rounded-lg border border-transparent bg-[#F2F3F5] pe-11 ps-3 text-[12px] text-[#141415] outline-none"
                        />
                        <LockKeyhole size={16} className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-[#575757]" aria-hidden="true" />
                    </div>
                </div>
                <div>
                    <label htmlFor="admin-email" className={label}>{t(`${pr}.email`)}</label>
                    <input id="admin-email" type="email" dir="ltr" value={form.email} onChange={update("email")} aria-invalid={!!errors.email} className={`${fieldInput("email")} text-end`} />
                    {err("email")}
                </div>
                <div>
                    <label htmlFor="admin-phone" className={label}>{t(`${pr}.phone`)}</label>
                    <input id="admin-phone" type="tel" dir="ltr" value={form.phone} onChange={update("phone")} aria-invalid={!!errors.phone} className={`${fieldInput("phone")} text-end`} />
                    {err("phone")}
                </div>
            </fieldset>

            <div className="mt-6 flex flex-wrap gap-3">
                <button
                    type="submit"
                    disabled={saving || !changed}
                    className="inline-flex h-10 min-w-[130px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#4B9AD2] px-6 text-[13px] font-medium text-white btn-wipe disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Check size={15} />
                    {saving ? t(`${pr}.saving`) : t(`${pr}.save`)}
                </button>
                <button
                    type="button"
                    onClick={revert}
                    disabled={saving || !changed}
                    className="h-10 min-w-[74px] cursor-pointer rounded-lg bg-[#F2F4F6] px-5 text-[13px] font-medium text-[#414141] transition-colors hover:bg-[#E6E9EC] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {t(`${pr}.revert`)}
                </button>
            </div>
        </form>
    );
}

/** حقل كلمة مرور مع زر عين لإظهارها وإخفائها */
function PasswordField({ id, label: text, value, onChange, autoComplete, error }) {
    const { t } = useTranslation("signupCommon");
    const [visible, setVisible] = useState(false);
    return (
        <div>
            <label htmlFor={id} className="mb-2.5 block text-[12px] text-[#575757]">{text}</label>
            <div className="relative">
                <input
                    id={id}
                    type={visible ? "text" : "password"}
                    dir="ltr"
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete}
                    placeholder="••••••••••"
                    aria-invalid={!!error}
                    className={`h-10 w-full rounded-lg border bg-white pl-11 pr-3 text-right text-[13px] tracking-wider text-[#141415] outline-none placeholder:text-[#575757] transition-colors focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2] ${error ? "border-red-400" : "border-[#BFD9EC]"}`}
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? t("hidePassword") : t("showPassword")}
                    className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#4B9AD2]"
                >
                    {visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
            </div>
            {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
        </div>
    );
}

const EMPTY_PASSWORDS = { current: "", password: "", confirm: "" };

/** تبويب "الحساب والامان": تغيير كلمة المرور مع شروط بتتحقق أثناء الكتابة */
function SecuritySettings() {
    const { t } = useTranslation(["adminDashboard", "signupCommon"]);
    const sec = "settingsPage.security";
    const [form, setForm] = useState(EMPTY_PASSWORDS);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null); // { type, text }
    const [saving, setSaving] = useState(false);

    const req = passwordRequirements(form.password);
    // الشروط الظاهرة (نفس شروط التسجيل بالمشروع + مختلفة عن الحالية)
    const rules = [
        { key: "length", ok: req.hasLength },
        { key: "number", ok: req.hasNumber },
        { key: "special", ok: req.hasSpecial },
        { key: "different", ok: !!form.password && form.password !== form.current },
    ];
    const valid = !!form.current && rules.every((r) => r.ok) && form.confirm === form.password;

    const update = (key) => (e) => {
        setForm((f) => ({ ...f, [key]: e.target.value }));
        setErrors((er) => ({ ...er, [key]: "" }));
        setMessage(null);
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!valid) {
            setErrors({ confirm: form.confirm && form.confirm !== form.password ? t("signupCommon:passwordMismatch") : "" });
            return;
        }
        setSaving(true);
        setMessage(null);
        try {
            const res = await changePassword(form.current, form.password, form.confirm);
            setForm(EMPTY_PASSWORDS);
            setMessage({ type: "success", text: res.message || t(`${sec}.success`) });
        } catch (err) {
            const { status, message: msg, fields } = parseApiError(err);
            if (status === 404 || status === 405) {
                setMessage({ type: "error", text: t(`${sec}.unavailable`) });
            } else {
                setErrors({ current: fields.current_password || "", password: fields.password || "", confirm: fields.password_confirmation || "" });
                setMessage({ type: "error", text: msg || t("signupCommon:networkError") });
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} noValidate className={`${card} border-t-2 border-t-[#9CC9EA] sm:px-6 sm:pt-7`}>
            {message &&
                (message.type === "error" ? (
                    <FormAlert messages={[message.text]} />
                ) : (
                    <p role="status" className="mb-5 rounded-lg border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-3 text-[13px] text-[#2E9E5B]">{message.text}</p>
                ))}

            <fieldset disabled={saving} className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
                <PasswordField id="sec-current" label={t(`${sec}.current`)} value={form.current} onChange={update("current")} autoComplete="current-password" error={errors.current} />
                <PasswordField id="sec-new" label={t(`${sec}.new`)} value={form.password} onChange={update("password")} autoComplete="new-password" error={errors.password} />
                <div className="sm:col-span-2">
                    <PasswordField id="sec-confirm" label={t(`${sec}.confirm`)} value={form.confirm} onChange={update("confirm")} autoComplete="new-password" error={errors.confirm} />
                </div>
            </fieldset>

            {/* شروط كلمة المرور — الشرط المتحقق بيصير أزرق */}
            <div className="mt-5">
                <p className="text-[12px] font-semibold text-[#141415]">{t(`${sec}.rulesTitle`)}</p>
                <ul className="mt-2.5 flex flex-col gap-1.5" aria-live="polite">
                    {rules.map((rule) => (
                        <li key={rule.key} className={`flex items-center gap-3 text-[10px] ${rule.ok ? "text-[#575757]" : "text-[#89949D]"}`}>
                            <Check size={13} strokeWidth={2.5} className={rule.ok ? "text-[#4B9AD2]" : "text-[#C9D2DA]"} aria-hidden="true" />
                            {t(`${sec}.rules.${rule.key}`)}
                            <span className="sr-only">{rule.ok ? t(`${sec}.met`) : t(`${sec}.notMet`)}</span>
                        </li>
                    ))}
                </ul>
                {form.confirm && form.confirm !== form.password && (
                    <p className="mt-2 text-[11px] text-red-500">{t("signupCommon:passwordMismatch")}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={saving || !valid}
                className="mt-7 h-10 w-[150px] cursor-pointer rounded-lg bg-[#4B9AD2] text-[12px] font-medium text-white btn-wipe disabled:cursor-not-allowed disabled:opacity-40"
            >
                {saving ? t(`${sec}.submitting`) : t(`${sec}.submit`)}
            </button>
        </form>
    );
}

/** تبويب "تفضيلات الاشعارات" */
function NotificationPrefs() {
    const { t } = useTranslation("adminDashboard");
    const [prefs, setPrefs] = useState(readPrefs);

    const toggle = (key) => (value) => {
        const next = { ...prefs, [key]: value };
        setPrefs(next);
        savePrefs(next);
    };

    return (
        <section className={`${card} sm:py-3`}>
            <ul className="divide-y divide-[#0000000F]">
                {PREFS.map((key) => {
                    const base = `settingsPage.prefs.${key}`;
                    const desc = t(`${base}.desc`);
                    return (
                        <li key={key} className="flex items-center justify-between gap-4 py-4">
                            <div>
                                <p className="text-[13px] font-bold text-[#141415]">{t(`${base}.title`)}</p>
                                {desc && <p className="mt-1.5 text-[11px] text-[#575757]">{desc}</p>}
                            </div>
                            <Toggle checked={prefs[key]} onChange={toggle(key)} label={t(`${base}.title`)} />
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

/** إعدادات الأدمن: الملف الشخصي + الحساب والأمان + تفضيلات الإشعارات */
export default function AdminSettings() {
    const { t } = useTranslation("adminDashboard");
    const [tab, setTab] = useState("profile");

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
            <header>
                <h1 className="text-[24px] font-bold text-[#141415]">{t("settingsPage.title")}</h1>
                <p className="mt-2 text-[12px] text-[#575757]">{t("settingsPage.subtitle")}</p>
            </header>

            <div role="tablist" className="flex flex-wrap gap-3">
                {TABS.map((key) => {
                    const active = tab === key;
                    return (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => setTab(key)}
                            className={`h-10 cursor-pointer rounded-full px-5 text-[12px] font-semibold transition-colors ${active
                                ? "bg-[#4B9AD2] text-white shadow-[0_4px_12px_rgba(75,154,210,0.3)]"
                                : "border border-[#CFE3F3] bg-[#EEF5FC] text-[#4B9AD2] hover:border-[#8EC0E4]"
                                }`}
                        >
                            {t(`settingsPage.tabs.${key}`)}
                        </button>
                    );
                })}
            </div>

            {tab === "profile" && <ProfileSettings />}
            {tab === "security" && <SecuritySettings />}
            {tab === "notifications" && <NotificationPrefs />}
        </div>
    );
}
