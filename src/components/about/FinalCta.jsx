import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function FinalCta() {
    const navigate = useNavigate();
    const { t } = useTranslation("about");

    return (
        <section className="bg-linear-to-br from-white via-white to-[#E4EFFD] px-5 py-20 sm:px-10 sm:py-24">
            <div className="mx-auto max-w-[760px] text-center">
                <p className="text-[12px] font-medium text-[#4B9AD2]">{t("final.tag")}</p>
                <h2 className="mt-5 text-[24px] font-bold leading-[1.5] text-[#38749E] sm:text-[32px]">
                    {t("final.title")}
                </h2>
                <p className="mx-auto mt-5 max-w-[560px] text-[13px] leading-[2] text-[#4B9AD2] sm:text-[14px]">
                    {t("final.desc")}
                </p>

                <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => navigate("/craftsmen")}
                        className="h-12 rounded-xl bg-[#4B9AD2] px-7 text-[13px] font-semibold text-white shadow-[0_4px_8px_rgba(0,0,0,0.18)] cursor-pointer btn-wipe"
                    >
                        {t("final.browse")}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/contact")}
                        className="h-12 rounded-xl bg-[#3A78A3] px-7 text-[13px] font-semibold text-white shadow-[0_4px_8px_rgba(0,0,0,0.18)] cursor-pointer btn-wipe btn-wipe-alt"
                    >
                        {t("final.contact")}
                    </button>
                </div>
            </div>
        </section>
    );
}
