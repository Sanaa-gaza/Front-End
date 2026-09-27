import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SERVICES } from "../../data/services";

const MAX_VISIBLE_OFFSET = 2;
const SCALES = [1, 0.82, 0.68];
const OPACITIES = [1, 0.7, 0.4];
const POSITIONS = [0, 1, 1.78];

export default function ServicesSection() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation("home");
    const isRtl = i18n.language === "ar";
    const [active, setActive] = useState(2);
    const touchStartX = useRef(null);

    const total = SERVICES.length;
    const canPrev = active > 0;
    const canNext = active < total - 1;
    const goPrev = () => canPrev && setActive((a) => a - 1);
    const goNext = () => canNext && setActive((a) => a + 1);

    // اتجاه ظهور الكروت اللي بعد الكرت الحالي: يسار في العربي، يمين في الإنجليزي
    const side = isRtl ? -1 : 1;

    const onTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(delta) < 40) return;
        const towardNext = isRtl ? delta > 0 : delta < 0;
        if (towardNext) goNext();
        else goPrev();
    };

    const pad = (n) => String(n).padStart(2, "0");

    const dashes = SERVICES.map((s, i) => (
        <button
            key={s.key}
            type="button"
            onClick={() => setActive(i)}
            aria-label={t(`services.items.${s.key}`)}
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
        <section id="services" className="overflow-hidden bg-white pb-20 pt-10 sm:pt-14">
            <div className="mx-auto max-w-[1440px] px-5 sm:px-10">
                <h2 className="text-center text-[22px] font-bold text-[#1F4E70] sm:text-[28px]">
                    {t("services.title")}
                </h2>
                <div className="mx-auto mt-3 h-px w-28 bg-[#1F4E70]/70 sm:w-36"></div>
            </div>

            <div
                className="relative mt-8 h-[310px] [--step:170px] [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)] sm:h-[350px] sm:[--step:265px]"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                {SERVICES.map((service, i) => {
                    const offset = i - active;
                    const abs = Math.abs(offset);
                    const visible = abs <= MAX_VISIBLE_OFFSET;
                    const isActive = offset === 0;

                    return (
                        <article
                            key={service.key}
                            onClick={() => !isActive && setActive(i)}
                            aria-hidden={!isActive}
                            className={`absolute top-4 left-1/2 w-[210px] rounded-2xl bg-white p-2.5 shadow-[0_10px_35px_rgba(43,91,120,0.16)] transition-all duration-500 ease-out sm:w-[270px] sm:p-3 ${
                                isActive ? "" : "cursor-pointer"
                            }`}
                            style={{
                                transform: `translateX(calc(-50% + ${Math.sign(offset) * side * POSITIONS[Math.min(abs, 2)]} * var(--step))) scale(${SCALES[Math.min(abs, 2)]})`,
                                opacity: visible ? OPACITIES[abs] : 0,
                                filter: abs ? `blur(${abs * 1.5}px)` : "none",
                                zIndex: 10 - abs,
                                pointerEvents: visible ? "auto" : "none",
                            }}
                        >
                            <div className="relative overflow-hidden rounded-xl">
                                <img
                                    src={service.image}
                                    alt={t(`services.items.${service.key}`)}
                                    className="aspect-[16/10] w-full object-cover"
                                    draggable="false"
                                />
                                <span
                                    aria-hidden="true"
                                    className="absolute start-0 bottom-[38px] h-2 w-2.5 bg-[#2F6F9F] sm:bottom-[46px] sm:h-2.5 sm:w-3"
                                    style={{
                                        clipPath: isRtl
                                            ? "polygon(0 100%, 100% 100%, 100% 0)"
                                            : "polygon(0 0, 0 100%, 100% 100%)",
                                    }}
                                ></span>
                                <span
                                    className="absolute start-0 bottom-2.5 flex h-[28px] min-w-[84px] items-center justify-center bg-[#4B9AD2] text-[13px] font-bold text-white sm:bottom-3 sm:h-[34px] sm:min-w-[112px] sm:text-[15px]"
                                    style={{
                                        paddingInlineStart: "14px",
                                        paddingInlineEnd: "26px",
                                        clipPath: isRtl
                                            ? "polygon(0 50%, 16px 0, 100% 0, 100% 100%, 16px 100%)"
                                            : "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)",
                                    }}
                                >
                                    {t(`services.items.${service.key}`)}
                                </span>
                            </div>

                            <div className="px-1.5 pb-1 pt-4">
                                <p className="min-h-[3.2em] text-[14px] font-bold leading-[1.6] text-[#141415] sm:text-[16px]">
                                    {t(`services.descs.${service.key}`)}
                                </p>
                                <button
                                    type="button"
                                    tabIndex={isActive ? 0 : -1}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (isActive) navigate(`/craftsmen?service=${service.key}`);
                                    }}
                                    className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-[#4B9AD2] cursor-pointer hover:underline"
                                >
                                    {t("services.more")}
                                    <i className="fa-solid fa-chevron-left text-[9px] ltr:rotate-180"></i>
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>

            <div className="mt-2 flex flex-col items-center gap-3">
                <span className="text-[12px] text-[#575757]" dir="ltr">
                    <span className="text-[#4B9AD2]">{pad(active + 1)}</span> / {pad(total)}
                </span>

                <div className="flex items-center gap-4" dir="ltr">
                    <button
                        type="button"
                        onClick={isRtl ? goNext : goPrev}
                        disabled={isRtl ? !canNext : !canPrev}
                        aria-label={isRtl ? t("services.next") : t("services.prev")}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4B9AD2] text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer btn-wipe"
                    >
                        <i className="fa-solid fa-arrow-left text-sm"></i>
                    </button>

                    <div className="flex items-center gap-1">
                        {isRtl ? [...dashes].reverse() : dashes}
                    </div>

                    <button
                        type="button"
                        onClick={isRtl ? goPrev : goNext}
                        disabled={isRtl ? !canPrev : !canNext}
                        aria-label={isRtl ? t("services.prev") : t("services.next")}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4B9AD2] text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer btn-wipe"
                    >
                        <i className="fa-solid fa-arrow-right text-sm"></i>
                    </button>
                </div>
            </div>
        </section>
    );
}
