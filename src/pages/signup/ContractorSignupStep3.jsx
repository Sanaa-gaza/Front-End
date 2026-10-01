import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthHeader from "../../components/AuthHeader";
import StepIndicator from "../../components/StepIndicator";
import DropzoneField from "../../components/DropzoneField";
import FormAlert from "../../components/FormAlert";
import useLangDir from "../../hooks/useLangDir";
import { registerContractor, uploadFile } from "../../api/endpoints";
import { parseApiError, mapServerErrors, errorText } from "../../api/errors";
import { setPendingVerification } from "../../api/session";
import { getDraftPassword, clearDraftPassword } from "../../api/signupDraft";

const SERVER_FIELDS = {
    license_file_path: "license",
    terms_accepted: "agreeTerms",
};

export default function ContractorSignupStep3() {
    const navigate = useNavigate();
    useEffect(() => {
        const step1Data = sessionStorage.getItem("contractor_step1");
        const step2Data = sessionStorage.getItem("contractor_step2");
        if (!step1Data || !step2Data || !getDraftPassword()) {
            navigate("/contractor-signup", { replace: true });
        }
    }, [navigate]);
    const { t } = useTranslation(["contractorSignup", "signupCommon"]);
    useLangDir();

    const [licenseFile, setLicenseFile] = useState(null);
    const [agreeTerms, setAgreeTerms] = useState(false);

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [serverMessages, setServerMessages] = useState([]);
    const te = (code) => errorText(t, code);

    const clearError = (field) => { if (errors[field]) setErrors((p) => ({ ...p, [field]: "" })); };

    const handleLicenseChange = (e) => {
        const file = e.target.files[0] || null;
        setLicenseFile(file);
        clearError("license");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerMessages([]);

        const newErrors = {
            license: licenseFile ? "" : "licenseRequired",
            agreeTerms: agreeTerms ? "" : "termsRequired",
        };

        setErrors(newErrors);
        if (Object.values(newErrors).some(Boolean)) return;

        const step1 = JSON.parse(sessionStorage.getItem("contractor_step1") || "{}");
        const step2 = JSON.parse(sessionStorage.getItem("contractor_step2") || "{}");
        const password = getDraftPassword();

        setSubmitting(true);
        try {
            // الملف لازم ينرفع أول، وبعدين بنبعت مساره مع التسجيل
            const licensePath = await uploadFile(licenseFile);

            await registerContractor({
                full_name: step1.quadName,
                national_id: step1.idNumber,
                email: step1.email,
                phone: step1.phone,
                password,
                password_confirmation: password,
                governorate_id: Number(step1.city),
                area_id: Number(step1.area),
                workers_count: Number(step2.teamSize),
                main_specialization: step2.mainSpecialty,
                description: step2.bio || undefined,
                license_file_path: licensePath,
                terms_accepted: agreeTerms,
            });

            sessionStorage.removeItem("contractor_step1");
            sessionStorage.removeItem("contractor_step2");
            clearDraftPassword();
            setPendingVerification(step1.email, "register", "/dashboard");
            navigate("/verification-code");
        } catch (err) {
            const { message, fields } = parseApiError(err);
            const { mapped, unmapped } = mapServerErrors(fields, SERVER_FIELDS);
            setErrors(mapped);
            // أخطاء حقول الخطوات السابقة (زي إيميل مستخدم) بتظهر فوق الفورم
            setServerMessages(
                Object.keys(fields).length ? unmapped : [message || t("signupCommon:networkError")]
            );
            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setSubmitting(false);
        }
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

                    <StepIndicator
                        steps={[t("step1Label"), t("step2Label"), t("step3Label")]}
                        currentStep={3}
                    />

                    <section className="bg-white border border-[#0000001A] rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-8">
                            <FormAlert messages={serverMessages} />

                            <form onSubmit={handleSubmit} noValidate>
                                <DropzoneField
                                    id="licenseInput"
                                    label={t("licenseLabel")}
                                    dropHint={t("licenseNote")}
                                    icon="fa-solid fa-paperclip"
                                    accept="image/jpeg,image/png,application/pdf"
                                    file={licenseFile}
                                    onChange={handleLicenseChange}
                                    error={te(errors.license)}
                                />

                                <div className="flex items-center gap-2 mb-6">
                                    <input
                                        id="agreeTerms"
                                        type="checkbox"
                                        checked={agreeTerms}
                                        onChange={(e) => { setAgreeTerms(e.target.checked); clearError("agreeTerms"); }}
                                        className="w-4 h-4 accent-[#4B9AD2] cursor-pointer"
                                    />
                                    <label htmlFor="agreeTerms" className="text-[#777777] text-sm cursor-pointer">
                                        {t("signupCommon:agreeTerms")}
                                    </label>
                                </div>
                                {errors.agreeTerms && (
                                    <p className="text-red-500 text-xs mb-4 -mt-4 text-start">{te(errors.agreeTerms)}</p>
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
