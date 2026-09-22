import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthHeader from "../../components/AuthHeader";
import FormField from "../../components/FormField";
import useLangDir from "../../hooks/useLangDir";
import { getEmailError } from "../../utils/validators";

export default function ForgotPassword() {
    const { t } = useTranslation("forgotPassword");
    const navigate = useNavigate();
    useLangDir();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const emailErr = getEmailError(email);
        if (emailErr) {
            setError(emailErr);
            return;
        }

        setIsSubmitting(true);
        sessionStorage.setItem("sanaa_pending_email", email);
        sessionStorage.setItem("sanaa_verification_redirect", "/reset-password");

        setTimeout(() => {
            setIsSubmitting(false);
            navigate("/verification-code");
        }, 600);
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

                    <form onSubmit={handleSubmit} className="space-y-6 text-start">
                        <FormField
                            id="email"
                            label={t("emailLabel")}
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError("");
                            }}
                            placeholder={t("emailPlaceholder")}
                            icon="fa-regular fa-envelope"
                            accentColor="#4B9AD2"
                            error={error && t(`signupCommon:${error}`)}
                        />

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#4ba0d8] hover:bg-[#3b8cc4] active:bg-[#327cae] text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-md shadow-blue-400/20 text-base"
                        >
                            {isSubmitting ? t("sending") : t("sendCode")}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
