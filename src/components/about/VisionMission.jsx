import React from "react";
import { useTranslation } from "react-i18next";

// الأول بيظهر عند بداية السطر (يمين بالعربي)
const ITEMS = [
    { key: "mission", icon: "plane" },
    { key: "vision", icon: "eye" },
];

function TabIcon({ name }) {
    if (name === "eye") return <i className="fa-regular fa-eye text-[26px]"></i>;
    return (
        <svg viewBox="0 0 28 24" className="h-[26px] w-[30px]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M26 2 13.5 13" />
            <path d="M26 2 18 22l-4.5-9L4.5 8.5 26 2z" />
            <path d="M2 13h5.5" />
            <path d="M4 17.5h5" />
            <path d="M7 22h4" />
        </svg>
    );
}

export default function VisionMission() {
    const { t } = useTranslation("about");

    return (
        <section className="px-5 pb-20 pt-12 sm:px-10">
            <div className="mx-auto max-w-[900px] text-center">
                <p className="text-[13px] font-medium text-[#2B2B2B]">{t("vm.tag")}</p>
                <h2 className="mt-4 text-[26px] font-bold text-[#4B9AD2] sm:text-[32px]">
                    {t("vm.title")}
                </h2>
                <p className="mx-auto mt-3 max-w-[470px] text-[12px] leading-[2] text-[#575757] sm:text-[13px]">
                    {t("vm.subtitle")}
                </p>

                <div className="mt-10 grid grid-cols-1 justify-items-center gap-x-[130px] gap-y-10 md:grid-cols-2">
                    {ITEMS.map((item) => (
                        <div key={item.key} className="flex w-full max-w-[370px] flex-col items-center">
                            <div className="flex h-[98px] w-[168px] items-center justify-center gap-3 rounded-3xl bg-[#F6FAFD] text-[19px] font-bold text-[#3A7FB0] shadow-[0_6px_12px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:bg-[#EAF3FB] hover:shadow-[0_12px_24px_rgba(75,154,210,0.3)]">
                                <TabIcon name={item.icon} />
                                {t(`vm.${item.key}.tab`)}
                            </div>

                            <article className="mt-9 w-full flex-1 rounded-3xl bg-[#FDFBFC] px-7 py-8 text-start shadow-[0_4px_6px_rgba(0,0,0,0.22)] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_16px_32px_rgba(75,154,210,0.28)]">
                                <h3 className="text-[18px] font-bold text-[#0B3253]">
                                    {t(`vm.${item.key}.title`)}
                                </h3>
                                <p className="mt-4 ps-10 text-[15px] leading-[2.3] text-[#575757]">
                                    {t(`vm.${item.key}.desc`)}
                                </p>
                            </article>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
