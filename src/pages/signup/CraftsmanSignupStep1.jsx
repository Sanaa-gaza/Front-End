import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthHeader from "../../components/AuthHeader";
import PhoneField from "../../components/PhoneField";
import StepIndicator from "../../components/StepIndicator";
import FormField from "../../components/FormField";
import LocationFields from "../../components/LocationFields";
import useLangDir from "../../hooks/useLangDir";
import {
    getEmailError, getPhoneError, getPasswordError, getConfirmPasswordError, getRequiredError, cleanPhone,
} from "../../utils/validators";
import { errorText } from "../../api/errors";
import { setDraftPassword } from "../../api/signupDraft";

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
    const tf = (code) => errorText(t, code);
    const tc = (code) => errorText(t, code, "signupCommon");

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

        setDraftPassword(password);
        setSubmitting(true);
        setTimeout(() => navigate("/craftsman-signup/step-2"), 400);
    };

    return (
        <div className="min-h-dvh flex flex-col bg-gradient-to-t from-[#dbeaf5] to-white">
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

                        <h1 className="col-start-2 justify-self-center text-[#141415D1] text-xl font-bold">
                            {t("title")}
                        </h1>
                    </div>

                    <StepIndicator steps={[t("step1Label"), t("step2Label")]} currentStep={1} />

                    <section className="bg-white border border-[#0000001A] rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-8">
                            <form onSubmit={handleSubmit} noValidate>
                                <div className="mb-4">
                                    <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                                    <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                                    <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                                    <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 mb-1.5">
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

                                <LocationFields
                                    governorateId={city}
                                    areaId={area}
                                    onGovernorateChange={(v) => { setCity(v); clearError("city"); }}
                                    onAreaChange={(v) => { setArea(v); clearError("area"); }}
                                    governorateError={tf(errors.city)}
                                    areaError={tf(errors.area)}
                                    className="mb-6"
                                />

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full text-white bg-[#4B9AD2] btn-wipe rounded-lg py-2.5 font-medium cursor-pointer disabled:opacity-60"
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
