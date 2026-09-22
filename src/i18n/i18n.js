import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import arRoleSelection from "./locales/ar/roleSelection.json";
import enRoleSelection from "./locales/en/roleSelection.json";
import arLogin from "./locales/ar/login.json";
import enLogin from "./locales/en/login.json";
import arSignupCommon from "./locales/ar/signupCommon.json";
import enSignupCommon from "./locales/en/signupCommon.json";
import arClientSignup from "./locales/ar/clientSignup.json";
import enClientSignup from "./locales/en/clientSignup.json";
import arCraftsmanSignup from "./locales/ar/craftsmanSignup.json";
import enCraftsmanSignup from "./locales/en/craftsmanSignup.json";
import arInstitutionSignup from "./locales/ar/institutionSignup.json";
import enInstitutionSignup from "./locales/en/institutionSignup.json";
import arContractorSignup from "./locales/ar/contractorSignup.json";
import enContractorSignup from "./locales/en/contractorSignup.json";
import arForgotPassword from "./locales/ar/forgotPassword.json";
import enForgotPassword from "./locales/en/forgotPassword.json";
import arResetPassword from "./locales/ar/resetPassword.json";
import enResetPassword from "./locales/en/resetPassword.json";
import arVerificationCode from "./locales/ar/verificationCode.json";
import enVerificationCode from "./locales/en/verificationCode.json";
import arHome from "./locales/ar/home.json";
import enHome from "./locales/en/home.json";


i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            ar: {
                roleSelection: arRoleSelection,
                login: arLogin,
                signupCommon: arSignupCommon,
                clientSignup: arClientSignup,
                craftsmanSignup: arCraftsmanSignup,
                institutionSignup: arInstitutionSignup,
                contractorSignup: arContractorSignup,
                forgotPassword: arForgotPassword,
                resetPassword: arResetPassword,
                verificationCode: arVerificationCode,
                home: arHome,

            },
            en: {
                roleSelection: enRoleSelection,
                login: enLogin,
                signupCommon: enSignupCommon,
                clientSignup: enClientSignup,
                craftsmanSignup: enCraftsmanSignup,
                institutionSignup: enInstitutionSignup,
                contractorSignup: enContractorSignup,
                forgotPassword: enForgotPassword,
                resetPassword: enResetPassword,
                verificationCode: enVerificationCode,
                home: enHome,

            },
        },
        fallbackLng: "ar",
        defaultNS: "roleSelection",
        interpolation: { escapeValue: false },
    });

export default i18n;