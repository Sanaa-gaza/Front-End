import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FormField from "../../components/FormField";
import FormAlert from "../../components/FormAlert";
import { getEmailError } from "../../utils/validators";
import { login, logout } from "../../api/endpoints";
import { parseApiError } from "../../api/errors";
import { clearAuth, saveAuth } from "../../api/session";
import useLangDir from "../../hooks/useLangDir";

/**
 * تسجيل دخول الأدمن (/admin-login): صورة على جنب + بطاقة الدخول.
 * نفس طلب الدخول العادي، بس بنقبل حسابات الإدارة فقط.
 */
export default function AdminLogin() {
    const navigate = useNavigate();
    const { t } = useTranslation("login");
    useLangDir();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");

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
            if (res.data.user?.role !== "admin") {
                // حساب مش إداري: بنلغي الجلسة اللي انفتحت وبنوضح السبب
                saveAuth(res.data, false);
                try {
                    await logout();
                } catch {
                    // حتى لو فشل الطلب بنمسح الجلسة محلياً
                }
                clearAuth();
                setServerError(t("notAdmin"));
                return;
            }
            saveAuth(res.data, rememberMe);
            navigate("/dashboard/admin");
        } catch (err) {
            const { message } = parseApiError(err);
            setServerError(message || t("signupCommon:networkError"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-dvh bg-white">
            <main className="flex flex-1 items-center justify-center px-4 py-10">
                <section className="w-full max-w-[440px] rounded-[28px] border border-[#0000001A] bg-white px-6 py-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:px-9">
                    <h1 className="mb-2 text-[24px] font-bold text-[#000000]">{t("title")}</h1>
                    <p className="mb-8 text-[14px] text-[#4B9AD2]">{t("adminSubtitle")}</p>

                    <FormAlert messages={[serverError]} />

                    <form onSubmit={handleSubmit} noValidate className="text-start">
                        <label htmlFor="email" className="mb-2 block text-[13px] font-semibold text-slate-700">
                            {t("email")}
                        </label>
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

                        <label htmlFor="password" className="mb-2 block text-[13px] font-semibold text-slate-700">
                            {t("password")}
                        </label>
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

                        <div className="-mt-2 flex items-center justify-between">
                            <label htmlFor="rememberMe" className="flex cursor-pointer items-center gap-1.5 text-[12px] text-[#777777]">
                                <input
                                    id="rememberMe"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 cursor-pointer accent-[#4B9AD2]"
                                />
                                {t("rememberMe")}
                            </label>
                            <button
                                type="button"
                                onClick={() => navigate("/forget-password")}
                                className="cursor-pointer text-[11px] text-[#4B9AD2] underline-offset-4 hover:underline"
                            >
                                {t("forgotPassword")}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="mt-10 h-[54px] w-full cursor-pointer rounded-xl bg-[#4B9AD2] text-[17px] font-medium text-white btn-wipe disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? t("submitting") : t("submit")}
                        </button>
                    </form>
                </section>
            </main>

            {/* الصورة الجانبية كاملة بدون قص: ارتفاعها بطول الشاشة وعرضها حسب نسبتها (بتختفي على الشاشات الصغيرة) */}
            <aside className="sticky top-0 hidden h-dvh shrink-0 md:block">
                <img src="/images/admin-login.png" alt="" className="h-full w-auto max-w-none" />
            </aside>
        </div>
    );
}
