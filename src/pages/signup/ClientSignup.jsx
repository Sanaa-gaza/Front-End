import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthHeader from "../../components/AuthHeader";
import PhoneField from "../../components/PhoneField";
import FormField from "../../components/FormField";
import LocationFields from "../../components/LocationFields";
import FormAlert from "../../components/FormAlert";
import useLangDir from "../../hooks/useLangDir";
import {
    getEmailError, getPhoneError, getPasswordError, getConfirmPasswordError, cleanPhone, getRequiredError,
} from "../../utils/validators";
import { registerCustomer } from "../../api/endpoints";
import { parseApiError, mapServerErrors, errorText } from "../../api/errors";
import { setPendingVerification } from "../../api/session";

// اسم الحقل بالباك إند → اسم الحقل بالفورم
const SERVER_FIELDS = {
    full_name: "fullName",
    email: "email",
    phone: "phone",
    password: "password",
    password_confirmation: "confirmPassword",
    governorate_id: "city",
    area_id: "area",
    terms_accepted: "agreeTerms",
};

export default function ClientSignup() {
    const navigate = useNavigate();
    const { t } = useTranslation(["clientSignup", "signupCommon"]);
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
    const [agreeTerms, setAgreeTerms] = useState(false);

    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("idle");
    const [serverMessages, setServerMessages] = useState([]);

    const clearError = (field) => {
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    // أكواد أخطاء validators.js/الحقول المشتركة بتترجم وقت العرض (مش وقت
    // الـ submit) عشان تتحدث فورًا لو المستخدم بدّل اللغة بعد ظهور الخطأ
    const tf = (code) => errorText(t, code);
    const tc = (code) => errorText(t, code, "signupCommon");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerMessages([]);

        const newErrors = {
            fullName: getRequiredError(fullName, "fullNameRequired"),
            email: getEmailError(email),
            phone: getPhoneError(phone),
            password: getPasswordError(password),
            confirmPassword: getConfirmPasswordError(confirmPassword, password),
            city: city ? "" : "cityRequired",
            area: area ? "" : "areaRequired",
            agreeTerms: agreeTerms ? "" : "termsRequired",
        };

        setErrors(newErrors);
        if (Object.values(newErrors).some(Boolean)) return;

        setStatus("creating");
        try {
            await registerCustomer({
                full_name: fullName.trim(),
                email: email.trim(),
                phone: `${countryCode}${cleanPhone(phone)}`,
                password,
                password_confirmation: confirmPassword,
                governorate_id: Number(city),
                area_id: Number(area),
                terms_accepted: agreeTerms,
            });
            setPendingVerification(email.trim(), "register", "/dashboard");
            setStatus("created");
            setTimeout(() => navigate("/verification-code"), 1200);
        } catch (err) {
            const { message, fields } = parseApiError(err);
            const { mapped, unmapped } = mapServerErrors(fields, SERVER_FIELDS);
            setErrors(mapped);
            setServerMessages(
                Object.keys(fields).length ? unmapped : [message || t("signupCommon:networkError")]
            );
            setStatus("idle");
        }
    };

    const buttonLabel =
        status === "creating"
            ? t("signupCommon:creating")
            : status === "created"
                ? t("signupCommon:created")
                : t("createAccount");

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

                    <section className="bg-white border border-[#0000001A] rounded-2xl shadow-sm p-8">
                        <FormAlert messages={serverMessages} />

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
                                    {t("signupCommon:password")}
                                </label>
                                <FormField
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    icon={showPassword ? "fa-regular fa-eye" : "fa-regular fa-eye-slash"}
                                    onIconClick={() => setShowPassword((v) => !v)}
                                    iconLabel={showPassword ? t("signupCommon:hidePassword") : t("signupCommon:showPassword")}
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
                                    iconLabel={showConfirmPassword ? t("signupCommon:hidePassword") : t("signupCommon:showPassword")}
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
                            />

                            <div className="flex items-center  gap-2 mb-2">
                                <input
                                    id="agreeTerms"
                                    type="checkbox"
                                    checked={agreeTerms}
                                    onChange={(e) => { setAgreeTerms(e.target.checked); clearError("agreeTerms"); }}
                                    className="w-4 h-4 accent-[#4B9AD2] cursor-pointer order-first"
                                />
                                <label htmlFor="agreeTerms" className="text-[#777777] text-sm cursor-pointer">
                                    {t("agreeTerms")}
                                </label>
                            </div>
                            {errors.agreeTerms && (
                                <p className="text-red-500 text-xs mb-4 text-start">{tf(errors.agreeTerms)}</p>
                            )}

                            <button
                                type="submit"
                                disabled={status !== "idle"}
                                className="w-full text-white bg-[#4B9AD2] btn-wipe rounded-lg py-2.5 font-medium mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {buttonLabel}
                            </button>
                        </form>
                    </section>
                </div>
            </main>
        </div>
    );
}
