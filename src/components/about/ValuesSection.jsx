import React from "react";
import { useTranslation } from "react-i18next";

const SHIELD = "M12 2 4 5v6c0 5 3.4 9.2 8 11 4.6-1.8 8-6 8-11V5l-8-3z";

const ICONS = {
    shield: (
        <>
            <path d={SHIELD} />
            <path d="m9 12 2 2 4-4" />
        </>
    ),
    users: (
        <>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
    ),
    lock: (
        <>
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </>
    ),
};

// الأول بيظهر عند بداية السطر (يمين بالعربي)
const VALUES = [
    { key: "quality", icon: "shield", color: "#22B45A", bg: "#E6F7EC" },
    { key: "community", icon: "users", color: "#4B9AD2", bg: "#E6F1FA" },
    { key: "transparency", icon: "lock", color: "#C851E0", bg: "#F9E9FC" },
    { key: "heritage", icon: "shield", color: "#F0B400", bg: "#FFF5D0" },
];

export default function ValuesSection() {
    const { t } = useTranslation("about");

    return (
        <section className="px-5 pb-24 pt-4 sm:px-10">
            <div className="mx-auto max-w-[1230px] text-center">
                <h2 className="text-[24px] font-bold text-[#4B9AD2] sm:text-[30px]">
                    {t("values.title")}
                </h2>
                <p className="mx-auto mt-4 max-w-[560px] text-[13px] leading-[2] text-[#2B2B2B] sm:text-[14px]">
                    {t("values.subtitle")}
                </p>

                <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {VALUES.map((v) => (
                        <article
                            key={v.key}
                            className="group rounded-2xl bg-white px-5 pb-8 pt-6 shadow-[0_4px_10px_rgba(0,0,0,0.14)] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_16px_32px_rgba(75,154,210,0.28)]"
                        >
                            <span
                                className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                                style={{ backgroundColor: v.bg, color: v.color }}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-[22px] w-[22px]"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    {ICONS[v.icon]}
                                </svg>
                            </span>
                            <h3 className="mt-4 text-[15px] font-bold text-[#1F1F1F]">
                                {t(`values.${v.key}.title`)}
                            </h3>
                            <p className="mt-4 text-start text-[12.5px] leading-[2.1] text-[#575757]">
                                {t(`values.${v.key}.desc`)}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
