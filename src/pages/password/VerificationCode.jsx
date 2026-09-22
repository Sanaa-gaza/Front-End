import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthHeader from "../../components/AuthHeader";
import useLangDir from "../../hooks/useLangDir";

const OTP_LENGTH = 6;
const TIMER_SECONDS = 3 * 60;
const RESEND_COOLDOWN = 45;
const MAX_RESENDS = 3;
const LONG_LOCKOUT = 10 * 60;

function maskEmail(rawEmail) {
    const [local, domain] = rawEmail.split("@");
    if (!local || !domain) return rawEmail;
    return `${local.slice(0, 1)}${"•".repeat(Math.max(local.length - 1, 3))}@${domain}`;
}

export default function VerificationCode() {
    const { t } = useTranslation("verificationCode");
    const navigate = useNavigate();
    useLangDir();

    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
    const inputsRef = useRef([]);

    const [remaining, setRemaining] = useState(TIMER_SECONDS);
    const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
    const [resendCount, setResendCount] = useState(0);
    const [codeError, setCodeError] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);

    const rawEmail = sessionStorage.getItem("sanaa_pending_email");
    const email = rawEmail ? maskEmail(rawEmail) : "m•••••@gmail.com";

    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (remaining <= 0 && resendCooldown <= 0) return;
        const interval = setInterval(() => {
            setRemaining((r) => Math.max(r - 1, 0));
            setResendCooldown((c) => Math.max(c - 1, 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [remaining <= 0, resendCooldown <= 0]); // eslint-disable-line react-hooks/exhaustive-deps

    // لما تنتهي مدة الحظر الطويلة (15 دقيقة)، ترجع دورة المحاولات من جديد
    useEffect(() => {
        if (resendCooldown <= 0 && resendCount >= MAX_RESENDS) {
            setResendCount(0);
        }
    }, [resendCooldown, resendCount]);

    const resendMinutes = Math.floor(resendCooldown / 60).toString().padStart(2, "0");
    const resendSeconds = (resendCooldown % 60).toString().padStart(2, "0");
    const expired = remaining <= 0;
    const resendLimitReached = resendCount >= MAX_RESENDS;
    const canResend = !resendLimitReached && resendCooldown <= 0;

    const handleChange = (index, value) => {
        const digit = value.replace(/[^0-9]/g, "").slice(-1);
        const next = [...otp];
        next[index] = digit;
        setOtp(next);

        if (digit) {
            triggerDigitAnim(index, 0);
            if (index < OTP_LENGTH - 1) {
                inputsRef.current[index + 1]?.focus();
            }
        }
    };

    const triggerDigitAnim = (index, delayMs = 0) => {
        const el = inputsRef.current[index];
        if (!el) return;

        el.style.animationDelay = `${delayMs}ms`;
        el.classList.remove("digit-animate");
        void el.offsetWidth;
        el.classList.add("digit-animate");
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
        if (!pasted) return;

        const next = [...otp];
        pasted
            .slice(0, OTP_LENGTH)
            .split("")
            .forEach((digit, i) => {
                next[i] = digit;
                triggerDigitAnim(i, i * 70);
            });
        setOtp(next);

        const nextEmptyIndex = next.findIndex((v) => v === "");
        inputsRef.current[nextEmptyIndex === -1 ? OTP_LENGTH - 1 : nextEmptyIndex]?.focus();
    };

    const handleResend = () => {
        if (!canResend) return;

        setOtp(Array(OTP_LENGTH).fill(""));
        inputsRef.current[0]?.focus();
        setRemaining(TIMER_SECONDS);

        const nextCount = resendCount + 1;
        setResendCount(nextCount);
        setResendCooldown(nextCount >= MAX_RESENDS ? LONG_LOCKOUT : RESEND_COOLDOWN);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const code = otp.join("");
        if (code.length < OTP_LENGTH) {
            setCodeError("codeIncomplete");
            return;
        }
        setCodeError("");

        setVerifying(true);
        setTimeout(() => {
            setVerifying(false);
            setVerified(true);

            setTimeout(() => {
                const redirectPath = sessionStorage.getItem("sanaa_verification_redirect") || "/login";
                sessionStorage.removeItem("sanaa_verification_redirect");
                navigate(redirectPath);
            }, 1500);
        }, 1000);
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
                    {verified ? (
                        <div className="success-screen relative py-4">
                            <div className="confetti-wrapper inset-0">
                                {Array.from({ length: 12 }, (_, i) => (
                                    <span key={i} className={`particle p-${i + 1} top-1/2 left-1/2`}></span>
                                ))}
                            </div>

                            <div className="check-card relative z-10 w-20 h-20 rounded-full bg-[#4ba0d8] flex items-center justify-center mx-auto mb-4">
                                <svg className="check-icon w-10 h-10" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M5 13l4 4L19 7"
                                        stroke="white"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>

                            <h2 className="text-[#4B9AD2] text-xl font-bold mb-1.5">{t("verifiedTitle")}</h2>
                            <p className="text-slate-400 dark:text-slate-500 text-sm">{t("redirecting")}</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-center mb-4">
                                <button type="button" onClick={() => navigate("/")} className="cursor-pointer">
                                    <img src="/images/logo w 1.svg" alt="صنعة" className="h-12 w-auto" />
                                </button>
                            </div>

                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed max-w-md mx-auto">
                                {t("codeSentTo")}{" "}
                                <span className="font-medium text-slate-600 dark:text-slate-300">{email}</span>
                            </p>

                            <form onSubmit={handleSubmit} noValidate>
                                <div className="flex items-center justify-center gap-2.5 mb-2" dir="ltr">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (inputsRef.current[index] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            aria-label={t("digitLabel", { index: index + 1, total: OTP_LENGTH })}
                                            value={digit}
                                            disabled={expired}
                                            onChange={(e) => handleChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            onPaste={handlePaste}
                                            className="otp-input w-12 h-12 text-center text-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#4ba0d8] focus:ring-1 focus:ring-[#4ba0d8] disabled:opacity-60"
                                        />
                                    ))}
                                </div>
                                <p className={`text-red-500 text-xs mt-1 mb-2 text-center ${codeError ? "" : "hidden"}`}>
                                    {codeError && t(codeError)}
                                </p>

                                <button
                                    type="submit"
                                    disabled={verifying || expired}
                                    className="w-full bg-[#4ba0d8] hover:bg-[#3b8cc4] active:bg-[#327cae] text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-md shadow-blue-400/20 text-base mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {verifying ? t("verifying") : t("confirmCode")}
                                </button>
                            </form>

                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-5">
                                {resendLimitReached ? (
                                    <span className="text-red-500 font-medium">
                                        {t("resendLimitReached")} {resendMinutes}:{resendSeconds}
                                    </span>
                                ) : (
                                    <>
                                        {t("noCode")}{" "}
                                        <button
                                            type="button"
                                            onClick={handleResend}
                                            disabled={!canResend}
                                            className={`text-[#4B9AD2] font-medium ${canResend ? "cursor-pointer" : "pointer-events-none opacity-60"}`}
                                        >
                                            {t("resendCode")} {resendCooldown > 0 && t("resendIn")}
                                        </button>{" "}
                                        {resendCooldown > 0 && (
                                            <span className="text-[#4B9AD2] font-medium">{resendMinutes}:{resendSeconds}</span>
                                        )}
                                    </>
                                )}
                            </p>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
