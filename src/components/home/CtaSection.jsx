import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function CtaSection() {
    const navigate = useNavigate();
    const { t } = useTranslation("home");

    return (
        <section id="contact" className="bg-white px-5 py-14 sm:px-10 sm:py-20">
            <div className="mx-auto flex max-w-[1230px] flex-col items-start gap-6 rounded-3xl bg-white px-6 py-8 shadow-[0_10px_40px_rgba(43,91,120,0.16)] sm:px-10 sm:py-10 md:flex-row md:items-center md:justify-between md:gap-8">
                <div className="flex items-center gap-4 sm:gap-5">
                    <span className="relative hidden h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-linear-to-br from-[#EAF3FC] to-white sm:block">
                        <img
                            src="/images/logo w 1.svg"
                            alt=""
                            aria-hidden="true"
                            className="absolute right-[11px] top-1/2 h-[34px] w-auto max-w-none -translate-y-1/2"
                            style={{ clipPath: "inset(0 0 0 64%)" }}
                        />
                    </span>
                    <div className="max-w-[640px]">
                        <h2 className="text-[20px] font-bold text-[#2B2B2B] sm:text-[24px]">
                            {t("cta.title")}
                        </h2>
                        <p className="mt-2 text-[12px] leading-[1.9] text-[#575757] sm:text-[13px]">
                            {t("cta.desc")}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/get-started")}
                    className="h-11 shrink-0 rounded-lg bg-[#4B9AD2] px-7 text-[14px] font-semibold text-white cursor-pointer btn-wipe"
                >
                    {t("cta.button")}
                </button>
            </div>
        </section>
    );
}
