import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SiteLayout from "../../components/home/SiteLayout";
import VisionMission from "../../components/about/VisionMission";
import ValuesSection from "../../components/about/ValuesSection";
import JoinCta from "../../components/about/JoinCta";
import FinalCta from "../../components/about/FinalCta";
import CountUp from "../../components/common/CountUp";

// الصورة فيها الكرت والظل جاهزين (478×562)، والكرت نفسه بأخذ 335×419 من وسطها
const ABOUT_IMAGE = "/images/2.svg";

const STATS = [
    { key: "users", to: 5000, prefix: "+" },
    { key: "craftsmen", to: 180, prefix: "+" },
    { key: "orders", to: 1200, prefix: "+" },
    { key: "rating", to: 4.8, decimals: 1, star: true },
];

export default function About() {
    const { t } = useTranslation("about");

    return (
        <SiteLayout>
            <div className="mx-auto max-w-[1320px] px-5 pb-16 pt-28 sm:px-10 sm:pt-32 lg:px-[6%]">
                <nav aria-label="breadcrumb" className="flex items-center gap-2 text-[11px]">
                    <Link to="/" className="font-medium text-[#141415] hover:text-[#4B9AD2]">
                        {t("breadcrumb.home")}
                    </Link>
                    <i className="fa-solid fa-chevron-left text-[8px] text-[#89949D] ltr:rotate-180"></i>
                    <span className="text-[#4B9AD2]">{t("breadcrumb.about")}</span>
                </nav>

                <section className="mt-6 flex flex-col items-center gap-10 lg:mt-4 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
                    <div className="w-full max-w-[560px] lg:pt-16">
                        <h1 className="text-[30px] font-bold leading-[1.4] text-[#38749E] sm:text-[40px]">
                            {t("hero.title")}
                        </h1>
                        <p className="mt-5 text-[14px] leading-[2.1] text-[#575757] sm:text-[16px]">
                            {t("hero.desc")}
                        </p>
                        <p className="mt-4 inline-flex items-center gap-2 text-[11px] font-medium text-[#141415]">
                            <i className="fa-solid fa-shield-halved text-[13px] text-[#4B9AD2]"></i>
                            {t("hero.badge")}
                        </p>
                    </div>

                    <div className="relative aspect-[478/562] w-full max-w-[478px] shrink-0 lg:-me-[71px] lg:-my-10">
                        <img
                            src={ABOUT_IMAGE}
                            alt=""
                            className="h-full w-full select-none"
                            draggable="false"
                        />
                        <div className="absolute inset-x-[20%] bottom-[15.5%] flex items-center gap-3 rounded-2xl border border-white/20 bg-neutral-600/45 p-3 backdrop-blur-md">
                            <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-[#CFE2F2] text-[#4B9AD2]">
                                <i className="fa-solid fa-award text-[18px]"></i>
                            </span>
                            <div>
                                <p className="text-[15px] font-bold text-white">
                                    {t("hero.standardsTitle")}
                                </p>
                                <p className="mt-1 text-[12px] leading-[1.7] text-white">
                                    {t("hero.standardsDesc")}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative -mt-6 grid grid-cols-2 lg:-mt-1 gap-y-8 rounded-3xl bg-white px-6 py-9 shadow-[0_10px_40px_rgba(43,91,120,0.16)] sm:grid-cols-4 sm:px-10">
                    {STATS.map((s) => (
                        <div key={s.key} className="text-center">
                            <p className="text-[26px] font-bold text-[#38749E] sm:text-[30px]" dir="ltr">
                                <CountUp to={s.to} prefix={s.prefix} decimals={s.decimals} />
                                {s.star && <i className="fa-solid fa-star ms-1 text-[22px]"></i>}
                            </p>
                            <p className="mt-2 text-[12px] font-medium text-[#4B9AD2]">
                                {t(`stats.${s.key}`)}
                            </p>
                        </div>
                    ))}
                </section>
            </div>
            <VisionMission />
            <ValuesSection />
            <JoinCta />
            <FinalCta />
        </SiteLayout>
    );
}
