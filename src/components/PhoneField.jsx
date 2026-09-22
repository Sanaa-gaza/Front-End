import React from "react";
import { useTranslation } from "react-i18next";

export default function PhoneField({ id = "phone", value, onChange, error, countryCode = "+970", onCountryCodeChange }) {
    const { t, i18n } = useTranslation("signupCommon");
    const isRtl = i18n.language === "ar";

    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                {t("phone")}
            </label>
            <div
                className={`flex ${isRtl ? "flex-row-reverse" : "flex-row"} rounded-lg border bg-[#F5F6F8] dark:bg-slate-800 overflow-hidden focus-within:ring-1 focus-within:ring-[#4ba0d8] focus-within:border-[#4ba0d8] ${error ? "border-red-400" : "border-[#4B9AD2]"
                    }`}
            >
                <select
                    value={countryCode}
                    onChange={(e) => onCountryCodeChange && onCountryCodeChange(e.target.value)}
                    dir="ltr"
                    aria-label={t("countryCode")}
                    className="bg-[#d4eafa] dark:bg-slate-800 text-[#000000BF] text-sm pl-2 pr-1.5 flex items-center justify-center font-bold border-0 rounded-lg focus:outline-none cursor-pointer appearance-none"
                >
                    <option value="+970">+970</option>
                    <option value="+972">+972</option>
                </select>
                <input
                    type="tel"
                    id={id}
                    dir="ltr"
                    value={value}
                    onChange={onChange}
                    placeholder={t("phoneHint")}
                    className="w-full bg-transparent py-2.5 px-3 text-[12px] text-[#000000BF] placeholder-[#89949D] focus:outline-none text-end"
                />
            </div>
            <p className={`text-red-500 text-xs mt-1 text-start ${error ? "" : "hidden"}`}>{error}</p>
        </div>
    );
}