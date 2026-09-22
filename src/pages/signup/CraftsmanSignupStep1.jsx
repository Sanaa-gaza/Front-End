import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthHeader from "../../components/AuthHeader";
import PhoneField from "../../components/PhoneField";
import StepIndicator from "../../components/StepIndicator";
import FormField from "../../components/FormField";
import SelectField from "../../components/SelectField";
import useLangDir from "../../hooks/useLangDir";
import {
    getEmailError, getPhoneError, getPasswordError, getConfirmPasswordError, getRequiredError, cleanPhone,
} from "../../utils/validators";

export default function CraftsmanSignupStep1() {
    const navigate = useNavigate();
    const { t } = useTranslation(["craftsmanSignup", "signupCommon"]);
    useLangDir();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [countryCode, setCountryCode] = useState("+970");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [city, setCity] = useState("");
    const [area, setArea] = useState("");
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const clearError = (field) => { if (errors[field]) setErrors((p) => ({ ...p, [field]: "" })); };

    // أكواد أخطاء validators.js/الحقول المشتركة بتترجم وقت العرض (مش وقت
    // الـ submit) عشان تتحدث فورًا لو المستخدم بدّل اللغة بعد ظهور الخطأ
    const tf = (code) => (code ? t(code) : "");
    const tc = (code) => (code ? t(`signupCommon:${code}`) : "");

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {
            fullName: getRequiredError(fullName, "fullNameRequired"),
            email: getEmailError(email),
            phone: getPhoneError(phone),
            password: getPasswordError(password),
            confirmPassword: getConfirmPasswordError(confirmPassword, password),
            city: city ? "" : "cityRequired",
            area: area ? "" : "areaRequired",
        };
        setErrors(newErrors);
        if (Object.values(newErrors).some(Boolean)) return;

        sessionStorage.setItem("craftsman_step1", JSON.stringify({
            fullName: fullName.trim(), email: email.trim(), phone: `${countryCode}${cleanPhone(phone)}`, city, area,
        }));

        setSubmitting(true);
        setTimeout(() => navigate("/craftsman-signup/step-2"), 800);
    };

    return (
        <div className="min-h-dvh flex flex-col bg-gradient-to-t from-[#dbeaf5] dark:from-slate-950 to-white dark:to-slate-900">
            <AuthHeader />

            <main className="flex-1 py-10 px-4">
                <div className="max-w-[730px] mx-auto">
                    <div className="grid grid-cols-3 items-center mb-6">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="justify-self-start flex items-center gap-1.5 text-[#4B9AD2] text-sm font-medium cursor-pointer"
                        >
                            <span className="w-6 h-6 flex items-center justify-center border border-[#4B9AD2] rounded-full">
                                <i className="fa-solid fa-arrow-left rtl:rotate-180 text-xs"></i>
                            </span>
                            <span>{t("back")}</span>
                        </button>

                        <h1 className="col-start-2 justify-self-center text-[#141415D1] dark:text-slate-100 text-xl font-bold">
                            {t("title")}
                        </h1>
                    </div>

                    <StepIndicator steps={[t("step1Label"), t("step2Label")]} currentStep={1} />

                    <section className="bg-white dark:bg-slate-900 border border-[#0000001A] dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-8">
                            <form onSubmit={handleSubmit} noValidate>
                                <div className="mb-4">
                                    <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                                        {t("fullName")}
                                    </label>
                                    <FormField
                                        id="fullName"
                                        icon="fa-regular fa-user"
                                        placeholder={t("fullNamePlaceholder")}
                                        value={fullName}
                                        onChange={(e) => { setFullName(e.target.value); clearError("fullName"); }}
                                        error={tf(errors.fullName)}
                                        accentColor="#4B9AD2"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="email" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                                        {t("signupCommon:email")}
                                    </label>
                                    <FormField
                                        id="email"
                                        type="email"
                                        icon="fa-regular fa-envelope"
                                        placeholder={t("signupCommon:emailPlaceholder")}
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                                        error={tc(errors.email)}
                                        accentColor="#4B9AD2"
                                    />
                                </div>

                                <PhoneField
                                    value={phone}
                                    onChange={(e) => { setPhone(e.target.value); clearError("phone"); }}
                                    error={tc(errors.phone)}
                                    countryCode={countryCode}
                                    onCountryCodeChange={setCountryCode}
                                />

                                <div className="mb-4">
                                    <label htmlFor="password" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                                        {t("signupCommon:createPassword")}
                                    </label>
                                    <FormField
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        icon={showPassword ? "fa-regular fa-eye" : "fa-regular fa-eye-slash"}
                                        onIconClick={() => setShowPassword((v) => !v)}
                                        placeholder={t("signupCommon:passwordPlaceholder")}
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                                        error={tc(errors.password)}
                                        accentColor="#4B9AD2"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                                        {t("signupCommon:confirmPassword")}
                                    </label>
                                    <FormField
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        icon={showConfirmPassword ? "fa-regular fa-eye" : "fa-regular fa-eye-slash"}
                                        onIconClick={() => setShowConfirmPassword((v) => !v)}
                                        placeholder={t("signupCommon:passwordPlaceholder")}
                                        value={confirmPassword}
                                        onChange={(e) => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
                                        error={tc(errors.confirmPassword)}
                                        accentColor="#4B9AD2"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    <SelectField
                                        label={t("signupCommon:city")}
                                        id="city"
                                        icon="fa-solid fa-location-dot"
                                        placeholder={t("signupCommon:cityPlaceholder")}
                                        value={city}
                                        onChange={(e) => { setCity(e.target.value); clearError("city"); }}
                                        error={tf(errors.city)}
                                        accentColor="#4B9AD2"
                                        options={[
                                            { value: "rafah", label: t("signupCommon:cities.rafah") },
                                            { value: "khanyounis", label: t("signupCommon:cities.khanyounis") },
                                            { value: "gaza", label: t("signupCommon:cities.gaza") },
                                            { value: "wusta", label: t("signupCommon:cities.wusta") },
                                            { value: "north", label: t("signupCommon:cities.north") },
                                        ]}
                                    />

                                    <div>
                                        <label htmlFor="area" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                                            {t("signupCommon:area")}
                                        </label>
                                        <FormField
                                            id="area"
                                            icon="fa-solid fa-location-dot"
                                            placeholder={t("signupCommon:areaPlaceholder")}
                                            value={area}
                                            onChange={(e) => { setArea(e.target.value); clearError("area"); }}
                                            error={tf(errors.area)}
                                            accentColor="#4B9AD2"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full text-white bg-[#4B9AD2] hover:bg-[#3d82b3] transition-colors rounded-lg py-2.5 font-medium cursor-pointer disabled:opacity-60"
                                >
                                    {submitting ? t("signupCommon:creating") : t("signupCommon:next")}
                                </button>
                            </form>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}