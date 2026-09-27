import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function JoinCta() {
    const navigate = useNavigate();
    const { t } = useTranslation("about");

    return (
        <section className="px-5 pb-8 pt-2 sm:px-10">
            <div className="mx-auto flex max-w-[1230px] flex-col items-start gap-6 rounded-3xl bg-white px-6 py-8 shadow-[0_4px_12px_rgba(0,0,0,0.16)] sm:px-10 md:flex-row md:items-center md:justify-between md:gap-8">
                <div className="flex items-center gap-4 sm:gap-5">
                    <img
                        src="/images/شراكة موثوقة.svg"
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                    <div className="max-w-[720px]">
                        <h2 className="text-[19px] font-bold text-[#1F1F1F] sm:text-[22px]">
                            {t("join.title")}
                        </h2>
                        <p className="mt-2 text-[12px] leading-[1.9] text-[#575757] sm:text-[13px]">
                            {t("join.desc")}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/get-started")}
                    className="h-11 shrink-0 rounded-lg bg-[#4B9AD2] px-7 text-[14px] font-semibold text-white cursor-pointer btn-wipe"
                >
                    {t("join.button")}
                </button>
            </div>
        </section>
    );
}
