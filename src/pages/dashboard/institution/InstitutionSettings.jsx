import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, MapPin } from "lucide-react";
import StatusTabs from "../../../components/dashboard/StatusTabs";
import ComingSoon from "../../../components/dashboard/ComingSoon";
import FormAlert from "../../../components/FormAlert";
import { useAreas, useGovernorates } from "../../../hooks/useReferenceData";
import { getProfile, updateProfile } from "../../../api/endpoints";
import { parseApiError } from "../../../api/errors";

const BASE = "/dashboard/institution";
const TABS = ["general", "notifications", "security", "verification"];
const THEME_KEY = "sanaa_theme";

const card = "rounded-[20px] border border-[#0000000D] bg-white p-5 shadow-[0_4px_24px_rgba(35,74,100,0.06)] sm:p-6";
const label = "mb-1.5 block text-[12px] text-[#575757]";
const input =
    "h-11 w-full rounded-xl border border-[#8EC0E4] bg-white px-4 text-[13px] text-[#414141] outline-none transition-colors focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";
const readOnlyInput = "cursor-not-allowed bg-[#F7FAFD] text-[#575757]";
const saveButton =
    "h-10 cursor-pointer rounded-lg bg-[#4B9AD2] px-6 text-[13px] font-medium text-white btn-wipe disabled:cursor-not-allowed disabled:opacity-60";

function readTheme() {
    try {
        return localStorage.getItem(THEME_KEY) || "auto";
    } catch {
        return "auto";
    }
}

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

/** تبويب "الإعدادات العامة": بيانات المؤسسة + المظهر واللغة */
function GeneralSettings() {
    const { t, i18n } = useTranslation("institutionDashboard");

    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name: "", activity: "", phone: "", governorateId: "", areaId: "" });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null); // { type: "success" | "error", text }
    const [saving, setSaving] = useState(false);

    const [language, setLanguage] = useState(i18n.language === "en" ? "en" : "ar");
    const [theme, setTheme] = useState(readTheme);
    const [appearanceSaved, setAppearanceSaved] = useState(false);

    const governorates = useGovernorates();
    const areas = useAreas(form.governorateId);

    // بيانات المؤسسة من GET /profile — بيانات المؤسسة الخاصة ممكن تيجي داخل كائن institution
    useEffect(() => {
        getProfile()
            .then((res) => {
                const d = res.data || {};
                const inst = d.institution || {};
                setForm({
                    name: inst.institution_name || d.institution_name || d.full_name || "",
                    activity: inst.activity_type || d.activity_type || "",
                    phone: d.phone || "",
                    governorateId: d.governorate_id ? String(d.governorate_id) : "",
                    areaId: d.area_id ? String(d.area_id) : "",
                });
            })
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

    const handleSave = async (e) => {
        e.preventDefault();
        const next = {
            name: form.name.trim() ? "" : t("settingsPage.info.nameRequired"),
            areaId: form.areaId ? "" : t("settingsPage.info.areaRequired"),
        };
        setErrors(next);
        if (Object.values(next).some(Boolean)) return;

        setSaving(true);
        setMessage(null);
        try {
            // PUT /profile بيقبل للمؤسسة: الاسم + المحافظة والمنطقة مع بعض + النبذة.
            // الهاتف وطبيعة النشاط وكلمة المرور ما بتتعدل من هون.
            const res = await updateProfile({
                full_name: form.name.trim(),
                governorate_id: Number(form.governorateId),
                area_id: Number(form.areaId),
            });
            setMessage({ type: "success", text: res.message || t("settingsPage.saved") });
        } catch (err) {
            const { message: msg, fields } = parseApiError(err);
            setErrors({
                name: fields.full_name || "",
                areaId: fields.area_id || fields.governorate_id || "",
            });
            setMessage({ type: "error", text: msg || t("signupCommon:networkError") });
        } finally {
            setSaving(false);
        }
    };

    const handleAppearance = (e) => {
        e.preventDefault();
        i18n.changeLanguage(language);
        // الوضع الداكن لسا مش مبني بالموقع — بنحفظ الاختيار بس لحد ما ينبنى
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch {
            // التخزين ممكن يكون ممنوع بالمتصفح، مش مشكلة
        }
        setAppearanceSaved(true);
    };

    // الرقم بينحفظ بالسيرفر بصيغة +970XXXXXXXXX، بنعرض المفتاح لحاله
    const phoneMatch = form.phone.match(/^(\+\d{3})(\d+)$/);
    const phonePrefix = phoneMatch ? phoneMatch[1] : "+970";
    const phoneLocal = phoneMatch ? `0${phoneMatch[2]}` : form.phone;

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <form onSubmit={handleSave} noValidate className={card}>
                <h2 className="mb-5 text-[15px] font-bold text-[#22455E]">{t("settingsPage.info.title")}</h2>

                {message && (
                    message.type === "error" ? (
                        <FormAlert messages={[message.text]} />
                    ) : (
                        <p role="status" className="mb-5 rounded-lg border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-3 text-[13px] text-[#2E9E5B]">
                            {message.text}
                        </p>
                    )
                )}

                <fieldset disabled={loading} className="flex flex-col gap-4">
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
                            readOnly
                            title={t("settingsPage.info.readOnly")}
                            className={`${input} ${readOnlyInput}`}
                        />
                    </div>

                    <div>
                        <label htmlFor="inst-phone" className={label}>{t("settingsPage.info.phone")}</label>
                        <div className="flex" dir="ltr">
                            <span className="flex h-11 shrink-0 items-center rounded-s-xl border border-e-0 border-[#8EC0E4] bg-[#EAF3FB] px-5 text-[12px] font-bold text-[#414141]">
                                {phonePrefix}
                            </span>
                            <input
                                id="inst-phone"
                                value={phoneLocal}
                                readOnly
                                title={t("settingsPage.info.readOnly")}
                                className={`${input} ${readOnlyInput} rounded-s-none text-end`}
                            />
                        </div>
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

                    <div>
                        <div className="mb-1.5 flex items-center justify-between">
                            <label htmlFor="inst-password" className="text-[12px] text-[#575757]">
                                {t("settingsPage.info.password")}
                            </label>
                            <Link to="/forget-password" className="text-[11px] font-medium text-[#4B9AD2] hover:underline underline-offset-4">
                                {t("settingsPage.info.changePassword")}
                            </Link>
                        </div>
                        {/* كلمة المرور الحقيقية ما بترجع من السيرفر، فبنعرض نقاط بس؛ التغيير من رابط "تغيير كلمة المرور" */}
                        <input
                            id="inst-password"
                            type="password"
                            value="••••••••••"
                            readOnly
                            title={t("settingsPage.info.readOnly")}
                            className={`${input} ${readOnlyInput}`}
                        />
                    </div>
                </fieldset>

                <button type="submit" disabled={loading || saving} className={`${saveButton} mt-6`}>
                    {saving ? t("settingsPage.saving") : t("settingsPage.save")}
                </button>
            </form>

            <form onSubmit={handleAppearance} className={`${card} self-start`}>
                <h2 className="mb-5 text-[15px] font-bold text-[#22455E]">{t("settingsPage.appearance.title")}</h2>

                <div className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="pref-lang" className={label}>{t("settingsPage.appearance.language")}</label>
                        <div className="relative">
                            <select
                                id="pref-lang"
                                value={language}
                                onChange={(e) => {
                                    setLanguage(e.target.value);
                                    setAppearanceSaved(false);
                                }}
                                className={`${input} cursor-pointer appearance-none pe-9`}
                            >
                                <option value="ar">العربية</option>
                                <option value="en">English</option>
                            </select>
                            <ChevronDown size={16} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="pref-theme" className={label}>{t("settingsPage.appearance.theme")}</label>
                        <div className="relative">
                            <select
                                id="pref-theme"
                                value={theme}
                                onChange={(e) => {
                                    setTheme(e.target.value);
                                    setAppearanceSaved(false);
                                }}
                                className={`${input} cursor-pointer appearance-none pe-9`}
                            >
                                {["auto", "light", "dark"].map((k) => (
                                    <option key={k} value={k}>
                                        {t(`settingsPage.appearance.themes.${k}`)}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                        </div>
                    </div>
                </div>

                <button type="submit" className={`${saveButton} mt-5`}>
                    {t("settingsPage.save")}
                </button>
                {appearanceSaved && (
                    <p role="status" className="mt-3 text-[12px] text-[#2E9E5B]">{t("settingsPage.saved")}</p>
                )}
            </form>
        </div>
    );
}

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

            {/* باقي التبويبات لسا ما إلها تصميم */}
            {tab === "general" ? <GeneralSettings /> : <ComingSoon homePath={BASE} />}
        </div>
    );
}
