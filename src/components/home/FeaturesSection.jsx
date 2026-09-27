import React from "react";
import { useTranslation } from "react-i18next";

// الترتيب: أول عنصر بيظهر عند بداية السطر (يمين بالعربي)
const FEATURES = [
    { key: "search", icon: "fa-solid fa-magnifying-glass", iconColor: "text-white" },
    { key: "choice", icon: "fa-solid fa-screwdriver-wrench", iconColor: "text-[#F6C90E]" },
    { key: "payment", icon: "fa-solid fa-award", iconColor: "text-white" },
];

export default function FeaturesSection() {
    const { t } = useTranslation("home");

    return (
        <section
            id="about"
            className="bg-linear-to-br from-[#E9F2FC] via-[#F5F9FE] to-white px-5 py-16 sm:px-10 sm:py-20"
        >
            <div className="mx-auto max-w-[980px] text-center">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#DCEAF8] px-3 py-1 text-[11px] font-medium text-[#38749E]">
                    {t("features.tag")}
                    <i className="fa-solid fa-chevron-left text-[8px] ltr:rotate-180"></i>
                </span>

                <h2 className="mt-4 text-[26px] font-bold text-[#2B2B2B] sm:text-[32px]">
                    {t("features.title")}{" "}
                    <span className="text-[#F6C90E]">{t("features.titleHighlight")}</span>
                </h2>
                <p className="mt-3 text-[12px] text-[#575757] sm:text-[13px]">
                    {t("features.subtitle")}
                </p>

                <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-7">
                    {FEATURES.map((f) => (
                        <article
                            key={f.key}
                            className="group rounded-3xl bg-white px-6 pb-11 pt-8 text-center shadow-[0_10px_35px_rgba(43,91,120,0.12)] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_16px_32px_rgba(75,154,210,0.28)]"
                        >
                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-[#4B9AD2] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                                <i className={`${f.icon} ${f.iconColor} text-[18px]`}></i>
                            </div>
                            <h3 className="mt-5 text-[16px] font-bold text-[#2B2B2B]">
                                {t(`features.${f.key}.title`)}
                            </h3>
                            <p className="mt-4 text-[13px] leading-[2] text-[#575757]">
                                {t(`features.${f.key}.desc`)}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
