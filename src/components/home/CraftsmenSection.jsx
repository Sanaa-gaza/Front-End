import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CRAFTSMEN } from "../../data/craftsmen";

export default function CraftsmenSection() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation("home");
    const isRtl = i18n.language === "ar";
    const trackRef = useRef(null);
    const [progress, setProgress] = useState(0);

    const total = CRAFTSMEN.length;
    const active = Math.round(progress * (total - 1));
    const atStart = progress <= 0.01;
    const atEnd = progress >= 0.99;

    const updateProgress = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        setProgress(max > 0 ? Math.min(Math.abs(el.scrollLeft) / max, 1) : 0);
    }, []);

    useEffect(() => {
        updateProgress();
        window.addEventListener("resize", updateProgress);
        return () => window.removeEventListener("resize", updateProgress);
    }, [updateProgress, isRtl]);

    const scrollStep = (direction) => {
        const el = trackRef.current;
        const card = el?.children[0];
        if (!el || !card) return;
        const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
        el.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: "smooth" });
    };

    const scrollToIndex = (i) => {
        const el = trackRef.current;
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        const target = (i / (total - 1)) * max;
        el.scrollTo({ left: isRtl ? -target : target, behavior: "smooth" });
    };

    const pad = (n) => String(n).padStart(2, "0");

    const dashes = CRAFTSMEN.map((c, i) => (
        <button
            key={c.key}
            type="button"
            onClick={() => scrollToIndex(i)}
            aria-label={t(`craftsmen.list.${c.key}.name`)}
            className="group flex h-4 items-center cursor-pointer"
        >
            <span
                className={`block h-[2px] rounded-full transition-all ${
                    i === active
                        ? "w-7 bg-[#4B9AD2]"
                        : "w-5 bg-[#D5DEE6] group-hover:bg-[#9DB7CB]"
                }`}
            ></span>
        </button>
    ));

    return (
        <section id="craftsmen" className="overflow-hidden bg-white pb-20 pt-6 sm:pt-10">
            <div className="mx-auto max-w-[1440px] px-5 text-center sm:px-10">
                <h2 className="text-[22px] font-bold text-[#1F4E70] sm:text-[28px]">
                    <span className="text-[#4B9AD2]">{t("craftsmen.titleHighlight")}</span>{" "}
                    {t("craftsmen.title")}
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-[13px] text-[#575757] sm:text-[15px]">
                    {t("craftsmen.desc")}
                </p>
            </div>

            <div
                ref={trackRef}
                onScroll={updateProgress}
                className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[9%] [scroll-padding-inline:9%] py-6 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] [scrollbar-width:none] sm:gap-6 [&::-webkit-scrollbar]:hidden"
            >
                {CRAFTSMEN.map((c) => (
                    <article
                        key={c.key}
                        className="group relative w-[210px] shrink-0 snap-start transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_16px_32px_rgba(75,154,210,0.28)] rounded-2xl bg-white px-5 pb-5 pt-10 text-center shadow-[0_8px_28px_rgba(43,91,120,0.13)] sm:w-[250px]"
                    >
                        <span className="absolute start-4 top-3 text-[10px] font-medium text-[#4B9AD2]">
                            {t(`craftsmen.list.${c.key}.craft`)}
                        </span>

                        <div className="relative mx-auto h-[112px] w-[112px] sm:h-[120px] sm:w-[120px]">
                            <img
                                src={c.avatar}
                                alt={t(`craftsmen.list.${c.key}.name`)}
                                draggable="false"
                                className="h-full w-full rounded-full object-cover ring-4 ring-[#EAF3FB] transition-all duration-300 group-hover:scale-105 group-hover:ring-[#CFE2F2]"
                            />
                            <span className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-md bg-[#F6C90E] px-2.5 py-0.5 text-[11px] font-bold text-[#141415] shadow-sm">
                                <i className="fa-regular fa-star text-[10px]"></i>
                                <bdi dir="ltr">{c.rating}</bdi>
                            </span>
                        </div>

                        <h3 className="mt-6 text-[15px] font-bold text-[#141415]">
                            {t(`craftsmen.list.${c.key}.name`)}
                        </h3>
                        <p className="mt-1 text-[11px] text-[#575757]">
                            {t(`craftsmen.list.${c.key}.city`)}
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate(`/craftsmen/${c.key}`)}
                            className="mt-4 h-9 w-full rounded-lg bg-[#CFE2F2] text-[12px] font-semibold text-[#1F4E70] cursor-pointer btn-wipe btn-wipe-light"
                        >
                            {t("craftsmen.profile")}
                        </button>
                    </article>
                ))}
            </div>

            <div className="mt-2 flex flex-col items-center gap-3">
                <span className="text-[12px] text-[#575757]" dir="ltr">
                    <span className="text-[#4B9AD2]">{pad(active + 1)}</span> / {pad(total)}
                </span>

                <div className="flex items-center gap-4" dir="ltr">
                    <button
                        type="button"
                        onClick={() => scrollStep(-1)}
                        disabled={isRtl ? atEnd : atStart}
                        aria-label={isRtl ? t("craftsmen.next") : t("craftsmen.prev")}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4B9AD2] text-white disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer btn-wipe"
                    >
                        <i className="fa-solid fa-arrow-left text-sm"></i>
                    </button>

                    <div className="flex items-center gap-1">
                        {isRtl ? [...dashes].reverse() : dashes}
                    </div>

                    <button
                        type="button"
                        onClick={() => scrollStep(1)}
                        disabled={isRtl ? atStart : atEnd}
                        aria-label={isRtl ? t("craftsmen.prev") : t("craftsmen.next")}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4B9AD2] text-white disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer btn-wipe"
                    >
                        <i className="fa-solid fa-arrow-right text-sm"></i>
                    </button>
                </div>
            </div>
        </section>
    );
}
