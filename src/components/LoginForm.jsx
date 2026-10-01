import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FormField from "./FormField";
import FormAlert from "./FormAlert";
import { getEmailError } from "../utils/validators";
import { login } from "../api/endpoints";
import { parseApiError } from "../api/errors";
import { saveAuth, setPendingVerification, homePathForRole } from "../api/session";

export default function LoginForm({
    signupPath = "/signup",
    forgotPasswordPath = "/forget-password",
}) {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation("login");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");

    const [flip, setFlip] = useState("in");
    useEffect(() => {
        setFlip("in");
    }, []);

    useEffect(() => {
        document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    const toggleLang = () => {
        i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar");
    };

    const goTo = (path) => {
        setFlip("out");
        setTimeout(() => navigate(path), 400);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");

        const emailErr = getEmailError(email);
        const passwordErr = password ? "" : "passwordRequired";

        setEmailError(emailErr);
        setPasswordError(passwordErr);
        if (emailErr || passwordErr) return;

        setSubmitting(true);
        try {
            const res = await login(email.trim(), password, rememberMe);
            saveAuth(res.data, rememberMe);
            // نفس الطلب لكل صفحات الدخول، والتوجيه حسب نوع الحساب الراجع من السيرفر
            navigate(homePathForRole(res.data.user?.role));
        } catch (err) {
            const { status, message, data } = parseApiError(err);
            // الحساب مش مفعّل: السيرفر بعت كود جديد، بنوديه على صفحة التحقق
            if (status === 403 && data?.requires_verification) {
                setPendingVerification(data.email || email.trim(), "register", "/dashboard");
                navigate("/verification-code");
                return;
            }
            setServerError(message || t("signupCommon:networkError"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-dvh flex flex-col bg-gradient-to-b from-[#dbeaf5] to-white ">
            <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md shadow-[#0000001A]">
                <button type="button" onClick={() => navigate("/")} className="cursor-pointer">
                    <img src="/images/logo w 1.svg" alt="صنعة" className="w-[110px]" />
                </button>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleLang}
                        className="w-9 h-9 rounded-full border border-[#2563EB] text-xs text-[#2563EB] flex items-center justify-center font-bold cursor-pointer"
                    >
                        {i18n.language === "ar" ? "EN" : "AR"}
                    </button>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center px-4" style={{ perspective: "1200px" }}>
                <section className="text-center w-[450px]">
                    <div className="container">
                        <div
                            className={`bg-white border border-[#0000001A] rounded-2xl shadow-sm py-8 px-8 w-full max-w-[500px] mx-auto ${flip === "in" ? "page-flip-in" : "page-flip-out"
                                }`}
                        >
                            <div className="logo mb-5">
                                <h1 className="text-[#000000] text-xl font-bold mb-1.5">{t("title")}</h1>
                                <p className="text-[#4B9AD2] text-sm">{t("subtitle")}</p>
                            </div>

                            <FormAlert messages={[serverError]} />

                            <form onSubmit={handleSubmit} noValidate>
                                <div className="mb-1">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label htmlFor="email" className="text-xs font-semibold text-slate-700">
                                            {t("email")}
                                        </label>
                                    </div>

                                    <FormField
                                        id="email"
                                        type="email"
                                        placeholder={t("emailPlaceholder")}
                                        icon="fa-regular fa-envelope"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (emailError) setEmailError("");
                                        }}
                                        error={emailError && t(emailError)}
                                        accentColor="#4B9AD2"
                                    />
                                </div>

                                <div className="mb-1">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label htmlFor="password" className="text-xs font-semibold text-slate-700">
                                            {t("password")}
                                        </label>
                                    </div>

                                    <FormField
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••••"
                                        icon={showPassword ? "fa-regular fa-eye" : "fa-regular fa-eye-slash"}
                                        onIconClick={() => setShowPassword((v) => !v)}
                                        iconLabel={showPassword ? t("hidePassword") : t("showPassword")}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (passwordError) setPasswordError("");
                                        }}
                                        error={passwordError && t(passwordError)}
                                        accentColor="#4B9AD2"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center justify-end gap-2 mb-2">
                                        <input
                                            id="rememberMe"
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="w-4 h-4 accent-[#4B9AD2] cursor-pointer"
                                        />
                                        <label htmlFor="rememberMe" className="text-[#777777] text-xs cursor-pointer">
                                            {t("rememberMe")}
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => goTo(forgotPasswordPath)}
                                        className="text-[#000] text-xs font-medium cursor-pointer"
                                    >
                                        {t("forgotPassword")}
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full text-white bg-[#4B9AD2] hover:bg-[#1f4d73] transition-colors rounded-lg py-2.5 font-medium mt-4 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {submitting ? t("submitting") : t("submit")}
                                </button>
                            </form>

                            <p className="text-[#89949D] text-sm mt-5">
                                {t("noAccount")}{" "}
                                <button
                                    type="button"
                                    onClick={() => goTo("/get-started")}
                                    className="text-[#4B9AD2] font-medium cursor-pointer"
                                >
                                    {t("createAccount")}
                                </button>
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
