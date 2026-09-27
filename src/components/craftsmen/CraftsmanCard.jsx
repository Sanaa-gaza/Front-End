import React from "react";
import { useTranslation } from "react-i18next";

export default function CraftsmanCard({ craftsman, onView }) {
    const { t } = useTranslation(["home", "craftsmen"]);
    const c = craftsman;

    return (
        <article className="group rounded-2xl bg-white p-4 shadow-[0_6px_20px_rgba(43,91,120,0.14)] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_16px_32px_rgba(75,154,210,0.28)]">
            <div className="flex items-start justify-between gap-3">
                <img
                    src={c.avatar}
                    alt={t(`home:craftsmen.list.${c.key}.name`)}
                    draggable="false"
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-[#1F4E70] transition-transform duration-300 group-hover:scale-105"
                />
                <div className="flex flex-col items-start gap-2">
                    {c.featured && (
                        <span className="rounded-full bg-[#FFF3C7] px-5 py-1 text-[11px] font-medium text-[#B58A00]">
                            {t("craftsmen:card.featured")}
                        </span>
                    )}
                    {c.verified && (
                        <span className="rounded-full bg-[#CFE2F2] px-5 py-1 text-[11px] font-medium text-[#38749E]">
                            {t("craftsmen:card.verified")}
                        </span>
                    )}
                </div>
            </div>

            <h3 className="mt-3 text-[15px] font-bold text-[#1F4E70]">
                {t(`home:craftsmen.list.${c.key}.name`)}
            </h3>
            <p className="mt-0.5 text-[12px] text-[#575757]">
                {t(`home:craftsmen.list.${c.key}.craft`)} {t("craftsmen:card.certified")}
            </p>

            <div className="mt-2 flex items-center justify-between text-[11px] text-[#89949D]">
                <div className="flex items-center gap-1.5">
                    <span className="flex text-[12px] text-[#F6C90E]">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <i key={i} className="fa-solid fa-star"></i>
                        ))}
                    </span>
                    <bdi dir="ltr" className="font-semibold text-[#141415]">
                        {c.rating}
                    </bdi>
                    <bdi dir="ltr">({c.reviews})</bdi>
                </div>
                <span>
                    <bdi dir="ltr">({c.orders})</bdi> {t("craftsmen:card.orders")}
                </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[#38749E]">
                    <i className="fa-solid fa-location-dot text-[#4B9AD2]"></i>
                    {t(`craftsmen:cities.${c.city}`)}
                </span>
                <span className="text-[10.5px] text-[#89949D]">
                    <bdi dir="ltr">{c.years}</bdi> {t("craftsmen:card.years")}
                </span>
            </div>

            <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                    <p className="text-[10.5px] text-[#575757]">{t("craftsmen:card.startsFrom")}</p>
                    <bdi dir="ltr" className="text-[15px] font-bold text-[#38749E]">
                        {c.price[0]}$
                    </bdi>
                </div>
                <button
                    type="button"
                    onClick={() => onView(c)}
                    className="h-10 cursor-pointer rounded-xl border border-[#CFE2F2] bg-[#F1F7FC] px-6 text-[13px] font-medium text-[#38749E] shadow-[0_2px_6px_rgba(0,0,0,0.1)] btn-wipe btn-wipe-light"
                >
                    {t("craftsmen:card.view")}
                </button>
            </div>
        </article>
    );
}
