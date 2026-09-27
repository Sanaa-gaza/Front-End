import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

// لما يتوفر الفيديو الحقيقي: حط الملف في public/videos/ وحط مساره هون، مثال "/videos/guide.mp4"
// وإذا بدك صورة تظهر قبل التشغيل حط مسارها في GUIDE_VIDEO_POSTER
const GUIDE_VIDEO_SRC = "";
const GUIDE_VIDEO_POSTER = "";

const STEPS = ["trusted", "clear", "easy", "safe"];

export default function GuideSection() {
    const { t } = useTranslation("home");
    const videoRef = useRef(null);
    const [playing, setPlaying] = useState(false);

    const handlePlay = () => {
        if (!GUIDE_VIDEO_SRC) return;
        setPlaying(true);
        requestAnimationFrame(() => videoRef.current?.play());
    };

    return (
        <section id="guide" className="bg-white px-5 py-16 sm:px-10 sm:py-24">
            <div className="mx-auto grid max-w-[1100px] items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
                <div>
                    <h2 className="text-[24px] font-bold text-[#2B2B2B] sm:text-[28px]">
                        {t("guide.title")}{" "}
                        <span className="text-[#4B9AD2]">{t("guide.titleHighlight")}</span>
                    </h2>
                    <p className="mt-2 text-[12px] text-[#575757] sm:text-[13px]">
                        {t("guide.subtitle")}
                    </p>

                    <ul className="mt-7 space-y-6">
                        {STEPS.map((key) => (
                            <li key={key} className="flex items-start gap-3">
                                <i className="fa-solid fa-award mt-0.5 text-[18px] text-[#4B9AD2]"></i>
                                <div>
                                    <h3 className="text-[16px] font-bold text-[#4B9AD2]">
                                        {t(`guide.${key}.title`)}
                                    </h3>
                                    <p className="mt-1.5 text-[13px] text-[#2B2B2B]">
                                        {t(`guide.${key}.desc`)}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative mx-auto aspect-[8/7] w-full max-w-[520px] overflow-hidden rounded-3xl bg-white shadow-[0_10px_40px_rgba(43,91,120,0.16)]">
                    {GUIDE_VIDEO_SRC && (
                        <video
                            ref={videoRef}
                            src={GUIDE_VIDEO_SRC}
                            poster={GUIDE_VIDEO_POSTER || undefined}
                            controls={playing}
                            playsInline
                            preload="metadata"
                            className="h-full w-full object-cover"
                        />
                    )}

                    {!playing && (
                        <button
                            type="button"
                            onClick={handlePlay}
                            aria-label={t("guide.playVideo")}
                            className="absolute inset-0 flex items-center justify-center cursor-pointer"
                        >
                            <svg
                                viewBox="0 0 48 56"
                                className="h-[72px] w-[62px] transition-transform hover:scale-110"
                                fill="none"
                                stroke="#4B9AD2"
                                strokeWidth="2.5"
                                strokeLinejoin="round"
                            >
                                <path d="M6 5 L42 28 L6 51 Z" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
