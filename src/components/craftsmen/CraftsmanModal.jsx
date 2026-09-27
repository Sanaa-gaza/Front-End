import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function CraftsmanModal({ craftsman, onClose }) {
    const navigate = useNavigate();
    const { t } = useTranslation(["home", "craftsmen"]);
    const c = craftsman;

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [onClose]);

    const name = t(`home:craftsmen.list.${c.key}.name`);
    const craft = t(`home:craftsmen.list.${c.key}.craft`);
    const city = t(`craftsmen:cities.${c.city}`);
    const works = t("craftsmen:modal.works", { returnObjects: true });

    const stats = [
        { value: c.rating, label: t("craftsmen:modal.rating") },
        { value: c.reviews, label: t("craftsmen:modal.reviews") },
        { value: c.orders, label: t("craftsmen:modal.completed") },
        { value: c.years, label: t("craftsmen:modal.experience") },
    ];

    return (
        <div
            className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center bg-[#2B5B78]/35 p-4 backdrop-blur-sm"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={name}
                className="modal-panel relative max-h-[92vh] w-full max-w-[520px] overflow-y-auto rounded-3xl bg-white p-6 shadow-[0_20px_60px_rgba(15,50,80,0.3)] sm:p-8"
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={t("craftsmen:modal.close")}
                    className="absolute end-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#F1F7FC] text-[#38749E] transition-colors hover:bg-[#CFE2F2]"
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>

                <div className="flex items-center gap-4">
                    <img
                        src={c.avatar}
                        alt={name}
                        className="h-[72px] w-[72px] rounded-full object-cover ring-2 ring-[#1F4E70]"
                    />
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[19px] font-bold text-[#1F4E70]">{name}</h3>
                            {c.verified && (
                                <span className="rounded-full bg-[#CFE2F2] px-3 py-0.5 text-[10px] font-medium text-[#38749E]">
                                    {t("craftsmen:card.verified")}
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-[12.5px] text-[#575757]">
                            {craft} {t("craftsmen:card.certified")}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-[#38749E]">
                            <i className="fa-solid fa-location-dot text-[#4B9AD2]"></i>
                            {city}
                        </p>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-3">
                    {stats.map((s) => (
                        <div
                            key={s.label}
                            className="rounded-xl border border-[#CFE2F2] bg-[#F8FBFE] px-1 py-3 text-center"
                        >
                            <bdi dir="ltr" className="block text-[16px] font-bold text-[#38749E]">
                                {s.value}
                            </bdi>
                            <span className="mt-1 block text-[10px] text-[#575757]">{s.label}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex items-center gap-2 text-[12px] text-[#89949D]">
                    <span className="flex text-[13px] text-[#F6C90E]">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <i key={i} className="fa-solid fa-star"></i>
                        ))}
                    </span>
                    <bdi dir="ltr" className="font-semibold text-[#141415]">
                        {c.rating}
                    </bdi>
                    <bdi dir="ltr">({c.reviews})</bdi>
                </div>

                <h4 className="mt-5 text-[14px] font-bold text-[#1F4E70]">{t("craftsmen:modal.about")}</h4>
                <p className="mt-2 text-[12.5px] leading-[2] text-[#575757]">
                    {t("craftsmen:modal.bio", { craft, city })}
                </p>

                <h4 className="mt-5 text-[14px] font-bold text-[#1F4E70]">{t("craftsmen:modal.gallery")}</h4>
                <div className="mt-3 grid grid-cols-4 gap-2">
                    {(Array.isArray(works) ? works : []).map((w) => (
                        <figure key={w} className="text-center">
                            <div className="flex aspect-square items-center justify-center rounded-xl border border-[#E3EBF2] bg-[#F5F9FC] text-[#B7CCDD]">
                                <i className="fa-regular fa-image text-[20px]"></i>
                            </div>
                            <figcaption className="mt-1.5 text-[9.5px] leading-[1.5] text-[#575757]">{w}</figcaption>
                        </figure>
                    ))}
                </div>

                <div className="mt-5 rounded-xl border border-[#CFE2F2] bg-[#EEF5FB] px-4 py-3">
                    <p className="text-[11px] text-[#575757]">{t("craftsmen:modal.priceRange")}</p>
                    <bdi dir="ltr" className="mt-0.5 block text-[18px] font-bold text-[#1F4E70]">
                        {c.price[0]}-{c.price[1]}$
                    </bdi>
                </div>

                <div className="mt-5 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/contact")}
                        className="h-11 flex-1 cursor-pointer rounded-xl bg-[#4B9AD2] text-[14px] font-semibold text-white btn-wipe"
                    >
                        {t("craftsmen:modal.order")}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/contact")}
                        aria-label={t("craftsmen:modal.chat")}
                        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[#4B9AD2] text-[#4B9AD2] btn-wipe btn-wipe-outline"
                    >
                        <i className="fa-regular fa-comment-dots text-[17px]"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}
