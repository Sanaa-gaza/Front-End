import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import AuthHeader from "../../components/AuthHeader";
import useLangDir from "../../hooks/useLangDir";
import { passwordRequirements, meetsAllPasswordRequirements } from "../../utils/validators";

export default function ResetPassword() {
    const { t } = useTranslation("resetPassword");
    const navigate = useNavigate();
    useLangDir();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [touched, setTouched] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const reqs = passwordRequirements(password);
    const isValid = meetsAllPasswordRequirements(password) && password === confirmPassword;
    const confirmError =
        touched && confirmPassword && password !== confirmPassword
            ? t("passwordsMismatch")
            : "";

    const handleSubmit = (e) => {
        e.preventDefault();
        setTouched(true);
        if (!isValid) return;

        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            sessionStorage.removeItem("sanaa_pending_email");
            const redirectPath = sessionStorage.getItem("sanaa_verification_redirect") || "/login";
            sessionStorage.removeItem("sanaa_verification_redirect");
            navigate(redirectPath);
        }, 800);
    };

    return (
        <div className="min-h-dvh flex flex-col bg-gradient-to-t from-[#dbeaf5] dark:from-slate-950 to-white dark:to-slate-900">
            <AuthHeader />

            <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
                <div className="grid grid-cols-3 items-center mb-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="justify-self-start flex items-center gap-1.5 text-[#4B9AD2] text-sm font-medium cursor-pointer"
                    >
                        <span className="w-6 h-6 flex items-center justify-center border border-[#4B9AD2] rounded-full">
                            <i className="fa-solid fa-arrow-left rtl:rotate-180 text-xs"></i>
                        </span>
                        <span>{t("signupCommon:back")}</span>
                    </button>

                    <h1 className="col-start-2 justify-self-center text-[#141415D1] dark:text-slate-100 text-xl font-bold">
                        {t("title")}
                    </h1>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-black/30 w-full max-w-xl border border-slate-100 dark:border-white/10 text-center">
                    <div className="flex justify-center mb-4">
                        <button type="button" onClick={() => navigate("/")} className="cursor-pointer">
                            <img src="/images/logo w 1.svg" alt="صنعة" className="h-12 w-auto" />
                        </button>
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed max-w-md mx-auto">
                        {t("desc")}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5 text-start">
                        <div>
                            <label htmlFor="newPassword" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                                {t("newPassword")}
                            </label>
                            <div className="relative">
                                <input
                                    id="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-[#4B9AD2] rounded-xl text-sm focus:border-[#4ba0d8] focus:ring-1 focus:ring-[#4ba0d8] outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? t("signupCommon:hidePassword") : t("signupCommon:showPassword")}
                                    className="absolute inset-y-0 ltr:right-3 rtl:left-3 flex items-center text-[#4B9AD2]"
                                >
                                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                            {touched && !password && (
                                <p className="text-red-500 text-xs mt-1 text-start">{t("newPasswordRequired")}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                                {t("signupCommon:confirmPassword")}
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-[#4B9AD2] rounded-xl text-sm focus:border-[#4ba0d8] focus:ring-1 focus:ring-[#4ba0d8] outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((v) => !v)}
                                    aria-label={showConfirmPassword ? t("signupCommon:hidePassword") : t("signupCommon:showPassword")}
                                    className="absolute inset-y-0 ltr:right-3 rtl:left-3 flex items-center text-[#4B9AD2]"
                                >
                                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                            {confirmError && <p className="text-red-500 text-xs mt-1 text-start">{confirmError}</p>}
                        </div>

                        <div className="pt-2">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                                {t("passwordRequirements")}
                            </p>
                            <div className="space-y-1.5 text-xs">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${reqs.hasLength ? "bg-[#4B9AD2] border-[#4B9AD2] text-white" : "border-slate-300 dark:border-white/10"
                                            }`}
                                    >
                                        {reqs.hasLength && <i className="fa-solid fa-check text-[8px]"></i>}
                                    </span>
                                    <span className="text-[#4B9AD2]">{t("min8Chars")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${reqs.hasNumber ? "bg-[#4B9AD2] border-[#4B9AD2] text-white" : "border-slate-300 dark:border-white/10"
                                            }`}
                                    >
                                        {reqs.hasNumber && <i className="fa-solid fa-check text-[8px]"></i>}
                                    </span>
                                    <span className="text-[#4B9AD2]">{t("atLeastOneNumber")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${reqs.hasSpecial ? "bg-[#4B9AD2] border-[#4B9AD2] text-white" : "border-slate-300 dark:border-white/10"
                                            }`}
                                    >
                                        {reqs.hasSpecial && <i className="fa-solid fa-check text-[8px]"></i>}
                                    </span>
                                    <span className="text-[#4B9AD2]">{t("atLeastOneSpecialChar")}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#4ba0d8] hover:bg-[#3b8cc4] active:bg-[#327cae] text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-md shadow-blue-400/20 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? t("saving") : t("savePassword")}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
