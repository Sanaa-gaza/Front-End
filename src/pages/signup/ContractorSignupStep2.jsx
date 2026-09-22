import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthHeader from "../../components/AuthHeader";
import StepIndicator from "../../components/StepIndicator";
import FormField from "../../components/FormField";
import useLangDir from "../../hooks/useLangDir";
import { getRequiredError } from "../../utils/validators";

export default function ContractorSignupStep2() {
    const navigate = useNavigate();
    useEffect(() => {
        const step1Data = sessionStorage.getItem("contractor_step1");
        if (!step1Data) {
            navigate("/contractor-signup", { replace: true });
        }
    }, [navigate]);
    const { t } = useTranslation(["contractorSignup", "signupCommon"]);
    useLangDir();

    const [teamSize, setTeamSize] = useState("");
    const [mainSpecialty, setMainSpecialty] = useState("");
    const [bio, setBio] = useState("");

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const clearError = (field) => { if (errors[field]) setErrors((p) => ({ ...p, [field]: "" })); };
    const tf = (code) => (code ? t(code) : "");

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {
            teamSize: getRequiredError(teamSize, "teamSizeRequired"),
            mainSpecialty: getRequiredError(mainSpecialty, "mainSpecialtyRequired"),
        };
        setErrors(newErrors);
        if (Object.values(newErrors).some(Boolean)) return;

        sessionStorage.setItem("contractor_step2", JSON.stringify({
            teamSize: teamSize.trim(),
            mainSpecialty: mainSpecialty.trim(),
            bio: bio.trim(),
        }));

        setSubmitting(true);
        setTimeout(() => navigate("/contractor-signup/step-3"), 800);
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
                        currentStep={2}
                    />

                    <section className="bg-white dark:bg-slate-900 border border-[#0000001A] dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-8">
                            <form onSubmit={handleSubmit} noValidate>
                                <div className="mb-4">
                                    <label htmlFor="teamSize" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                                        {t("teamSize")}
                                    </label>
                                    <FormField
                                        id="teamSize"
                                        type="number"
                                        placeholder={t("teamSizePlaceholder")}
                                        value={teamSize}
                                        onChange={(e) => { setTeamSize(e.target.value); clearError("teamSize"); }}
                                        error={tf(errors.teamSize)}
                                        accentColor="#4B9AD2"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="mainSpecialty" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                                        {t("mainSpecialty")}
                                    </label>
                                    <FormField
                                        id="mainSpecialty"
                                        placeholder={t("mainSpecialtyPlaceholder")}
                                        value={mainSpecialty}
                                        onChange={(e) => { setMainSpecialty(e.target.value); clearError("mainSpecialty"); }}
                                        error={tf(errors.mainSpecialty)}
                                        accentColor="#4B9AD2"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="bio" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                                        {t("bioLabel")}
                                    </label>
                                    <textarea
                                        id="bio"
                                        rows={6}
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder={t("bioPlaceholder")}
                                        className="w-full bg-[#F5F6F8] dark:bg-slate-800 border border-[#4B9AD2] rounded-lg py-2.5 px-4 text-sm text-[#141415D1] dark:text-slate-100 placeholder-[#89949D] focus:outline-none focus:ring-1 focus:ring-[#4ba0d8] focus:border-[#4ba0d8] resize-none"
                                    />
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
