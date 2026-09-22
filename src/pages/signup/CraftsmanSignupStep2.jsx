import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthHeader from "../../components/AuthHeader";
import StepIndicator from "../../components/StepIndicator";
import SelectField from "../../components/SelectField";
import DropzoneField from "../../components/DropzoneField";
import useLangDir from "../../hooks/useLangDir";

export default function CraftsmanSignupStep2() {
    const navigate = useNavigate();
    // داخل CraftsmanSignupStep2.jsx
    useEffect(() => {
        const step1Data = sessionStorage.getItem("craftsman_step1");
        if (!step1Data) {
            navigate("/craftsman-signup", { replace: true });
        }
    }, [navigate]);
    const { t } = useTranslation(["craftsmanSignup", "signupCommon"]);
    useLangDir();

    const [avatarPreview, setAvatarPreview] = useState(null);
    const [idPhotoFile, setIdPhotoFile] = useState(null);
    const [craft, setCraft] = useState("");
    const [otherCraft, setOtherCraft] = useState("");
    const [bio, setBio] = useState("");
    const [agreeTerms, setAgreeTerms] = useState(false);

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const clearError = (field) => { if (errors[field]) setErrors((p) => ({ ...p, [field]: "" })); };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setAvatarPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleIdPhotoChange = (e) => {
        const file = e.target.files[0] || null;
        setIdPhotoFile(file);
        clearError("idPhoto");
    };

    const CRAFT_OPTIONS = [
        { value: "plumber", label: t("craftOptions.plumber") },
        { value: "electrician", label: t("craftOptions.electrician") },
        { value: "carpenter", label: t("craftOptions.carpenter") },
        { value: "painter", label: t("craftOptions.painter") },
        { value: "blacksmith", label: t("craftOptions.blacksmith") },
        { value: "other", label: t("craftOptions.other") },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {
            idPhoto: idPhotoFile ? "" : "idPhotoRequired",
            craft: !craft
                ? "craftRequired"
                : craft === "other" && !otherCraft.trim()
                    ? "craftOtherRequired"
                    : "",
            bio: bio.trim().length === 0
                ? "bioRequired"
                : bio.trim().length < 10
                    ? "bioMinLength"
                    : "",
            agreeTerms: agreeTerms ? "" : "termsRequired",
        };

        setErrors(newErrors);
        if (Object.values(newErrors).some(Boolean)) return;

        const step1Data = JSON.parse(sessionStorage.getItem("craftsman_step1") || "{}");
        const step2Data = {
            craft: craft === "other" ? otherCraft.trim() : craft,
            bio: bio.trim(),
            hasAvatar: !!avatarPreview,
            hasIdPhoto: !!idPhotoFile,
        };
        sessionStorage.setItem("craftsman_step2", JSON.stringify(step2Data));
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

                    <StepIndicator steps={[t("step1Label"), t("step2Label")]} currentStep={2} />

                    <section className="bg-white dark:bg-slate-900 border border-[#0000001A] dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-8">
                            <form onSubmit={handleSubmit} noValidate>
                                {/* الصورة الشخصية */}
                                <div className="flex flex-col items-center justify-center mb-6">
                                    <div className="relative mb-2">
                                        <div className="w-24 h-24 rounded-full bg-[#F5F6F8] dark:bg-slate-800 border border-[#0000001A] dark:border-white/10 flex items-center justify-center overflow-hidden">
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="صورة شخصية" className="w-full h-full object-cover" />
                                            ) : (
                                                <i className="fa-regular fa-user text-[#89949D] dark:text-slate-400 text-4xl"></i>
                                            )}
                                        </div>
                                        <label
                                            htmlFor="avatarInput"
                                            className="absolute bottom-0 end-0 w-7 h-7 rounded-full bg-[#4B9AD2] hover:bg-[#3d82b3] transition-colors text-white flex items-center justify-center border-2 border-white cursor-pointer"
                                        >
                                            <i className="fa-solid fa-plus text-[18px]"></i>
                                        </label>
                                        <input type="file" id="avatarInput" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                    </div>
                                    <p className="text-[#89949D] dark:text-slate-400 text-sm">{t("addPhoto")}</p>
                                </div>

                                {/* صورة الهوية */}
                                <DropzoneField
                                    id="idPhotoInput"
                                    label={t("idPhotoLabel")}
                                    hint={t("idPhotoDesc")}
                                    dropHint={t("dropHint")}
                                    file={idPhotoFile}
                                    onChange={handleIdPhotoChange}
                                    error={errors.idPhoto && t(errors.idPhoto)}
                                />

                                {/* تحديد الحرفة */}
                                <SelectField
                                    label={t("craft")}
                                    id="craft"
                                    placeholder={t("craftPlaceholder")}
                                    value={craft}
                                    onChange={(e) => {
                                        setCraft(e.target.value);
                                        clearError("craft");
                                        if (e.target.value !== "other") setOtherCraft("");
                                    }}
                                    error={craft === "other" ? "" : (errors.craft && t(errors.craft))}
                                    accentColor="#4B9AD2"
                                    options={CRAFT_OPTIONS}
                                />

                                {craft === "other" && (
                                    <div className="relative mb-4 -mt-2">
                                        <input
                                            type="text"
                                            value={otherCraft}
                                            onChange={(e) => { setOtherCraft(e.target.value); clearError("craft"); }}
                                            placeholder={t("craftOtherPlaceholder")}
                                            className="w-full bg-[#F5F6F8] dark:bg-slate-800 border border-[#0000001A] dark:border-white/10 rounded-lg py-2.5 px-4 text-sm text-[#141415D1] dark:text-slate-100 placeholder-[#89949D] focus:outline-none focus:ring-1 focus:ring-[#4ba0d8] focus:border-[#4ba0d8]"
                                        />
                                        <p className={`text-red-500 text-xs mt-1 text-start ${errors.craft ? "" : "hidden"}`}>{errors.craft && t(errors.craft)}</p>
                                    </div>
                                )}

                                {/* نبذة عني */}
                                <div className="mb-4">
                                    <label htmlFor="bio" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                                        {t("bioLabel")}
                                    </label>
                                    <textarea
                                        id="bio"
                                        rows={6}
                                        value={bio}
                                        onChange={(e) => { setBio(e.target.value); clearError("bio"); }}
                                        placeholder={t("bioPlaceholder")}
                                        className={`w-full bg-[#F5F6F8] dark:bg-slate-800 border rounded-lg py-2.5 px-4 text-sm text-[#141415D1] dark:text-slate-100 placeholder-[#89949D] focus:outline-none focus:ring-1 focus:ring-[#4ba0d8] focus:border-[#4ba0d8] resize-none ${errors.bio ? "border-red-400" : "border-[#0000001A] dark:border-white/10"
                                            }`}
                                    />
                                    <p className={`text-red-500 text-xs mt-1 text-start ${errors.bio ? "" : "hidden"}`}>{errors.bio && t(errors.bio)}</p>
                                </div>

                                <div className="flex items-center gap-2 mb-6 ">
                                    <input
                                        id="agreeTerms"
                                        type="checkbox"
                                        checked={agreeTerms}
                                        onChange={(e) => { setAgreeTerms(e.target.checked); clearError("agreeTerms"); }}
                                        className="w-4 h-4 accent-[#4B9AD2] cursor-pointer"
                                    />
                                    <label htmlFor="agreeTerms" className="text-[#777777] dark:text-slate-400 text-sm cursor-pointer">
                                        {t("agreeTerms")}
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