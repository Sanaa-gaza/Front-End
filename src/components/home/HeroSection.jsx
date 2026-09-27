import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { CATEGORY_KEYS } from "../../data/craftsmen";


const AVATARS = [
    "/images/Ellipse 1595 (2).svg",
    "/images/Ellipse 1595 (3).svg",
    "/images/Ellipse 1595 (4).svg",
    "/images/Ellipse 1595 (5).svg",
];

export default function HeroSection() {
    const navigate = useNavigate();
    const { t } = useTranslation(["home", "craftsmen"]);
    const [query, setQuery] = useState("");
    const [service, setService] = useState("");

    return (
        <section
            id="home"
            className="relative overflow-hidden bg-linear-to-br from-[#E4EFFA] via-[#F2F8FD] to-white"
        >
            <div className="relative mx-auto flex min-h-[640px] max-w-[1440px] flex-col justify-start px-5 pb-28 pt-28 lg:pt-[8.5rem] sm:px-10 lg:min-h-[100svh] lg:px-[6%] lg:pb-40">
                <div className="relative z-30 max-w-[760px]">
                    <h1 className="text-[32px] font-bold leading-[1.4] text-[#38749E] sm:text-[40px] xl:text-[42px]">
                        {t("hero.title")}
                    </h1>

                    <p className="mt-3 max-w-[560px] text-[16px] leading-[1.9] text-[#575757] sm:text-[19px]">
                        {t("hero.desc")}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-[#575757]">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2 rtl:space-x-reverse">
                                {AVATARS.map((src, i) => (
                                    <img
                                        key={i}
                                        src={src}
                                        alt=""
                                        className="h-6 w-6 rounded-full border border-white object-cover"
                                    />
                                ))}
                            </div>
                            <span>
                                <bdi dir="ltr" className="inline-block font-medium">{t("hero.usersCount")}</bdi>{" "}
                                {t("hero.usersLabel")}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <i className="fa-solid fa-star text-[11px] text-[#F6C343]"></i>
                            <span>
                                <bdi dir="ltr" className="inline-block font-medium">{t("hero.rating")}</bdi>{" "}
                                {t("hero.ratingLabel")}
                            </span>
                        </div>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const params = new URLSearchParams();
                            if (query.trim()) params.set("q", query.trim());
                            if (service) params.set("category", service);
                            const qs = params.toString();
                            navigate(qs ? `/craftsmen?${qs}` : "/craftsmen");
                        }}
                        className="mt-9 flex w-full max-w-[600px] flex-wrap items-center gap-2.5 rounded-2xl bg-white p-3 shadow-[0_10px_35px_rgba(43,91,120,0.12)] sm:flex-nowrap"
                    >
                        <div className="relative min-w-0 flex-1 basis-full sm:basis-auto">
                            <i className="fa-solid fa-magnifying-glass pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[13px] text-[#4B9AD2]"></i>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={t("hero.searchPlaceholder")}
                                className="h-11 w-full rounded-full border border-[#4B9AD2]/40 bg-white ps-10 pe-4 text-[13px] text-[#141415] outline-none placeholder:text-[#89949D] focus:border-[#4B9AD2]"
                            />
                        </div>

                        <div className="relative w-[46%] shrink-0 sm:w-[170px]">
                            <i className="fa-solid fa-table-cells-large pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[13px] text-[#4B9AD2]"></i>
                            <select
                                value={service}
                                onChange={(e) => setService(e.target.value)}
                                className={`h-11 w-full cursor-pointer appearance-none rounded-full border border-[#4B9AD2]/40 bg-white ps-10 pe-8 text-[13px] outline-none focus:border-[#4B9AD2] ${service ? "text-[#141415]" : "text-[#89949D]"
                                    }`}
                            >
                                <option value="">{t("hero.serviceType")}</option>
                                {CATEGORY_KEYS.map((key) => (
                                    <option key={key} value={key}>
                                        {t(`craftsmen:categories.${key}`)}
                                    </option>
                                ))}
                            </select>
                            <i className="fa-solid fa-chevron-down pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[10px] text-[#89949D]"></i>
                        </div>

                        <button
                            type="submit"
                            className="h-11 flex-1 shrink-0 rounded-xl bg-[#4B9AD2] px-7 text-[14px] font-semibold text-white cursor-pointer sm:flex-none btn-wipe"
                        >
                            {t("hero.search")}
                        </button>
                    </form>
                </div>

                <img
                    src="/images/Hero.svg"
                    alt=""
                    className="pointer-events-none relative z-10 mt-10 w-full select-none lg:absolute lg:bottom-0 lg:end-0 lg:mt-0 lg:w-[54%] lg:max-w-[820px]"
                />
            </div>

            <svg
                viewBox="0 0 1440 120"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-[-1px] z-20 ltr:-scale-x-100 h-[80px] w-full sm:h-[120px]"
            >
                <path
                    d="M0,96 C220,100 520,92 760,68 C940,48 1040,14 1160,14 C1300,14 1380,32 1440,46 L1440,120 L0,120 Z"
                    fill="#ffffff"
                />
            </svg>
        </section>
    );
}
