import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthHeader from "../../components/AuthHeader";
import StepIndicator from "../../components/StepIndicator";
import DropzoneField from "../../components/DropzoneField";
import useLangDir from "../../hooks/useLangDir";

export default function ContractorSignupStep3() {
    const navigate = useNavigate();
    useEffect(() => {
        const step1Data = sessionStorage.getItem("contractor_step1");
        const step2Data = sessionStorage.getItem("contractor_step2");
        if (!step1Data || !step2Data) {
            navigate("/contractor-signup", { replace: true });
        }
    }, [navigate]);
    const { t } = useTranslation(["contractorSignup", "signupCommon"]);
    useLangDir();

    const [licenseFile, setLicenseFile] = useState(null);
    const [agreeTerms, setAgreeTerms] = useState(false);

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const clearError = (field) => { if (errors[field]) setErrors((p) => ({ ...p, [field]: "" })); };

    const handleLicenseChange = (e) => {
        const file = e.target.files[0] || null;
        setLicenseFile(file);
        clearError("license");
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {
            license: licenseFile ? "" : "licenseRequired",
            agreeTerms: agreeTerms ? "" : "termsRequired",
        };

        setErrors(newErrors);
        if (Object.values(newErrors).some(Boolean)) return;

        const step1Data = JSON.parse(sessionStorage.getItem("contractor_step1") || "{}");

        sessionStorage.setItem("contractor_step3", JSON.stringify({
            hasLicense: !!licenseFile,
        }));
        sessionStorage.setItem("sanaa_pending_email", step1Data.email || "");
        sessionStorage.setItem("sanaa_verification_redirect", "/dashboard");

        setSubmitting(true);
        setTimeout(() => navigate("/verification-code"), 800);
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

                    <StepIndicator
                        steps={[t("step1Label"), t("step2Label"), t("step3Label")]}
                        currentStep={3}
                    />

                    <section className="bg-white dark:bg-slate-900 border border-[#0000001A] dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-8">
                            <form onSubmit={handleSubmit} noValidate>
                                <DropzoneField
                                    id="licenseInput"
                                    label={t("licenseLabel")}
                                    dropHint={t("licenseNote")}
                                    icon="fa-solid fa-paperclip"
                                    file={licenseFile}
                                    onChange={handleLicenseChange}
                                    error={errors.license && t(errors.license)}
                                />

                                <div className="flex items-center gap-2 mb-6">
                                    <input
                                        id="agreeTerms"
                                        type="checkbox"
                                        checked={agreeTerms}
                                        onChange={(e) => { setAgreeTerms(e.target.checked); clearError("agreeTerms"); }}
                                        className="w-4 h-4 accent-[#4B9AD2] cursor-pointer"
                                    />
                                    <label htmlFor="agreeTerms" className="text-[#777777] dark:text-slate-400 text-sm cursor-pointer">
                                        {t("signupCommon:agreeTerms")}
                                    </label>
                                </div>
                                {errors.agreeTerms && (
                                    <p className="text-red-500 text-xs mb-4 -mt-4 text-start">{t(errors.agreeTerms)}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full text-white bg-[#4B9AD2] hover:bg-[#3d82b3] transition-colors rounded-lg py-2.5 font-medium cursor-pointer disabled:opacity-60"
                                >
                                    {submitting ? t("sending") : t("signupCommon:createAccount")}
                                </button>
                            </form>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
