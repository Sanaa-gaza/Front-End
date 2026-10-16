import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, Check, ChevronLeft, CircleCheck, Clock, MapPin } from "lucide-react";
import { TENDERS } from "./tendersData";

const BASE = "/dashboard/institution";

// ===== بيانات تجريبية =====
// تفاصيل إضافية لكل مناقصة (الرقم، المدة، نوع التعاقد...). لما يجهز الباك إند، بتيجي من GET /tenders/{id}
const DETAILS = {
    r1: { number: "TND-2024-089", remainingHours: 26, durationDays: 30, contract: "lumpSum" },
};
const DEFAULT_DETAILS = { remainingHours: 48, durationDays: 20, contract: "lumpSum" };

// المرحلة الحالية حسب حالة المناقصة (رقم المرحلة من 0 لـ 4، و5 = كل المراحل مكتملة)
const STAGE_BY_STATUS = { draft: 0, open: 1, submitting: 1, cancelled: 1, executing: 4, completed: 5 };
const STAGES = ["publish", "receive", "compare", "select", "deliver"];

const card = "rounded-[20px] border border-[#0000000D] bg-white shadow-[0_4px_24px_rgba(35,74,100,0.08)]";

/** مراحل المناقصة: مكتملة (أخضر) / حالية (أزرق) / قادمة (رمادي) */
function Stepper({ current, labels }) {
    const { t } = useTranslation("institutionDashboard");

    return (
        <ol className="relative flex items-start justify-between pt-1">
            {/* الخط الواصل بين المراحل */}
            <span aria-hidden="true" className="absolute inset-x-[10%] top-[17px] h-[2px] bg-[#E6EBF0] sm:top-[21px]" />
            {STAGES.map((key, i) => {
                const state = i < current ? "done" : i === current ? "current" : "upcoming";
                return (
                    <li key={key} className="relative z-10 flex flex-1 flex-col items-center text-center">
                        <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold sm:h-10 sm:w-10 sm:text-[13px] ${state === "done"
                                ? "bg-[#2EAF4E] text-white"
                                : state === "current"
                                    ? "bg-[#4B9AD2] text-white ring-4 ring-[#CFE3F3]"
                                    : "bg-[#EEF0F2] text-[#89949D]"
                                }`}
                        >
                            {state === "done" ? <Check size={18} strokeWidth={3} /> : state === "current" ? <Clock size={18} /> : i + 1}
                        </span>
                        <span
                            className={`mt-3 px-1 text-[11px] font-bold leading-[1.5] sm:text-[13px] ${state === "current" ? "text-[#4B9AD2]" : state === "done" ? "text-[#414141]" : "text-[#89949D]"
                                }`}
                        >
                            {t(`tenderDetails.stages.${key}.title`)}
                        </span>
                        {labels[key] && (
                            <span
                                className={`mt-1 text-[10px] ${state === "done"
                                    ? "text-[#2EAF4E]"
                                    : state === "current"
                                        ? "rounded-full bg-[#DCEBFA] px-2.5 py-0.5 text-[#4B9AD2]"
                                        : "text-[#89949D]"
                                    }`}
                            >
                                {labels[key]}
                            </span>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

export default function InstitutionTenderDetails() {
    const { t } = useTranslation("institutionDashboard");
    const { tenderId } = useParams();
    const tender = TENDERS.find((x) => x.id === tenderId);
    // التأكيد المفتوح: "" | "close" | "award"
    const [confirming, setConfirming] = useState("");
    const [closed, setClosed] = useState(tender?.status === "cancelled");
    // ⚠️ اختيار العرض الفائز بالصفحة بس لحد ما يصير في endpoint
    const [awarded, setAwarded] = useState(tender?.status === "executing" || tender?.status === "completed");
    const [justAwarded, setJustAwarded] = useState(false);

    if (!tender) {
        return (
            <div className={`${card} mx-auto max-w-[1100px] p-10 text-center`}>
                <p className="text-[15px] font-bold text-[#414141]">{t("tenderDetails.notFound")}</p>
                <Link to={`${BASE}/tenders`} className="mt-4 inline-block text-[13px] text-[#4B9AD2] hover:underline">
                    {t("tenderDetails.back")}
                </Link>
            </div>
        );
    }

    const base = `tendersPage.sample.${tender.id}`;
    const sample = `tenderDetails.sample.${tender.id}`;
    const hasSample = t(`${sample}.published`, { defaultValue: "" }) !== "";
    const details = { ...DEFAULT_DETAILS, ...DETAILS[tender.id] };
    const index = TENDERS.indexOf(tender);
    const number = details.number || `TND-2026-${String(90 + index).padStart(3, "0")}`;

    const title = t(`${base}.title`);
    const category = t(`${base}.category`);
    const area = t(`${base}.area`);
    const location = hasSample ? t(`${sample}.location`) : area;
    const published = hasSample ? t(`${sample}.published`) : "—";
    const deadline = hasSample ? t(`${sample}.deadline`) : "—";
    const description = hasSample
        ? t(`${sample}.desc`, { returnObjects: true })
        : [t("tenderDetails.genericDesc", { title, area })];

    // بعد اختيار الفائز: كل المراحل لحد "اختيار الحرفي" بتصير مكتملة والحالية "التنفيذ والتسليم"
    const baseStage = STAGE_BY_STATUS[tender.status] ?? 1;
    const stage = awarded ? Math.max(baseStage, 4) : baseStage;
    const receiving = stage === 1 && !closed;
    const stageLabels = {
        publish: stage > 0 && hasSample ? t("tenderDetails.doneOn", { date: t(`${sample}.publishedShort`) }) : "",
        receive: receiving && hasSample ? t("tenderDetails.remaining", { time: t(`${sample}.remainingTime`) }) : "",
        compare: hasSample ? t("tenderDetails.startsOn", { date: t(`${sample}.deadlineShort`) }) : "",
        select: t("tenderDetails.stages.select.note"),
        deliver: t("tenderDetails.stages.deliver.note"),
    };

    const infoRows = [
        { key: "number", value: number, mono: true },
        { key: "category", value: category },
        { key: "location", value: area },
        { key: "published", value: published },
        { key: "deadline", value: deadline, tone: "text-[#D64545]" },
        {
            key: "remaining",
            value: receiving ? t("tenderDetails.remainingHours", { count: details.remainingHours }) : "—",
            chip: receiving,
        },
        { key: "duration", value: t("tenderDetails.durationDays", { count: details.durationDays }) },
        { key: "contract", value: t(`tenderDetails.contracts.${details.contract}`) },
    ];

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
            <Link
                to={`${BASE}/tenders`}
                className="inline-flex w-fit items-center gap-1 rounded-full bg-[#EAF3FB] px-3 py-1 text-[11px] font-medium text-[#38749E] transition-colors hover:bg-[#DCEBFA]"
            >
                <ChevronLeft size={13} className="rtl:rotate-180" />
                {t("tenderDetails.back")}
            </Link>

            {/* مراحل المناقصة */}
            <section className={`${card} p-5 sm:p-6`}>
                <h2 className="mb-6 text-[12px] font-semibold text-[#89949D]">{t("tenderDetails.stagesTitle")}</h2>
                <Stepper current={stage} labels={stageLabels} />
            </section>

            {/* رأس المناقصة */}
            <section className={`${card} flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6`}>
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#EEF0F2] px-3 py-0.5 text-[11px] text-[#575757]">
                            {t("tenderDetails.category", { category })}
                        </span>
                        <span className="rounded-md bg-[#EEF0F2] px-2 py-0.5 font-mono text-[11px] text-[#575757]" dir="ltr">
                            #{number}
                        </span>
                        {awarded ? (
                            <span className="rounded-full bg-[#DDF6E3] px-3 py-0.5 text-[11px] font-medium text-[#2EAF4E]">
                                {t("tenderDetails.awardedBadge")}
                            </span>
                        ) : closed && (
                            <span className="rounded-full bg-[#FDE7E7] px-3 py-0.5 text-[11px] font-medium text-[#D64545]">
                                {t("tenderDetails.closedBadge")}
                            </span>
                        )}
                    </div>
                    <h1 className="mt-3 text-[20px] font-bold text-[#414141]">{title}</h1>
                    <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-[#89949D]">
                        <span className="flex items-center gap-1">
                            <MapPin size={13} />
                            {location}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar size={13} />
                            {t("tenderDetails.published", { date: published })}
                        </span>
                    </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-3">
                    {awarded ? (
                        <span className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#DDF6E3] px-4 text-[12px] font-medium text-[#2EAF4E]">
                            <CircleCheck size={15} />
                            {t("tenderDetails.awardedBadge")}
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setConfirming("award")}
                            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-[#4B9AD2] px-4 text-[12px] font-medium text-white btn-wipe"
                        >
                            <Check size={15} />
                            {t("tenderDetails.chooseWinner")}
                        </button>
                    )}
                    {!closed && !awarded && (
                        <button
                            type="button"
                            onClick={() => setConfirming("close")}
                            className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-[#E8A5AB] px-4 text-[12px] font-medium text-[#D64545] transition-colors hover:bg-[#FFF6F6]"
                        >
                            {t("tenderDetails.close")}
                        </button>
                    )}
                </div>
            </section>

            {/* تأكيد الإغلاق / اختيار الفائز — ⚠️ بالصفحة بس لحد ما يصير في endpoint */}
            {confirming && (
                <div
                    role="alertdialog"
                    className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${confirming === "award" ? "border-[#CFE3F3] bg-[#F3F9FE]" : "border-[#F3C4C4] bg-[#FFF6F6]"
                        }`}
                >
                    <p className={`text-[13px] ${confirming === "award" ? "text-[#22455E]" : "text-[#A61B29]"}`}>
                        {t(confirming === "award" ? "tenderDetails.awardConfirm" : "tenderDetails.closeConfirm")}
                    </p>
                    <div className="flex shrink-0 gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                if (confirming === "award") {
                                    setAwarded(true);
                                    setJustAwarded(true);
                                } else {
                                    setClosed(true);
                                }
                                setConfirming("");
                            }}
                            className={`h-9 cursor-pointer rounded-lg px-4 text-[12px] font-medium text-white transition-colors ${confirming === "award" ? "bg-[#4B9AD2] hover:bg-[#3C88BF]" : "bg-[#D64545] hover:bg-[#B83636]"
                                }`}
                        >
                            {t(confirming === "award" ? "tenderDetails.confirmAward" : "tenderDetails.confirmClose")}
                        </button>
                        <button
                            type="button"
                            onClick={() => setConfirming("")}
                            className="h-9 cursor-pointer rounded-lg border border-[#0000001A] bg-white px-4 text-[12px] font-medium text-[#575757] hover:bg-[#F5F6F8]"
                        >
                            {t("tenderDetails.cancel")}
                        </button>
                    </div>
                </div>
            )}
            {justAwarded && (
                <p role="status" className="rounded-lg border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-3 text-[13px] text-[#2E9E5B]">
                    {t("tenderDetails.awarded")}
                </p>
            )}
            {closed && !justAwarded && tender.status !== "cancelled" && (
                <p role="status" className="rounded-lg border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-3 text-[13px] text-[#2E9E5B]">
                    {t("tenderDetails.closed")}
                </p>
            )}

            <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
                {/* الوصف */}
                <section className={`${card} p-5 sm:p-6`}>
                    <h2 className="text-[16px] font-bold text-[#22455E]">{t("tenderDetails.descTitle")}</h2>
                    <div className="mt-4 flex flex-col gap-3 text-[13px] leading-[2] text-[#575757]">
                        {(Array.isArray(description) ? description : [description]).map((p) => (
                            <p key={p}>{p}</p>
                        ))}
                    </div>
                </section>

                {/* بطاقة المعلومات */}
                <section className={`${card} p-5`}>
                    <h2 className="text-[15px] font-bold text-[#22455E]">{t("tenderDetails.infoTitle")}</h2>
                    <dl className="mt-3 divide-y divide-[#0000000F]">
                        {infoRows.map((row) => (
                            <div key={row.key} className="flex items-center justify-between gap-3 py-3 text-[12px]">
                                <dt className="text-[#89949D]">{t(`tenderDetails.info.${row.key}`)}</dt>
                                <dd
                                    className={`text-end font-semibold ${row.tone || "text-[#414141]"} ${row.mono ? "font-mono" : ""}`}
                                    dir={row.mono ? "ltr" : undefined}
                                >
                                    {row.chip ? (
                                        <span className="rounded-full bg-[#DCEBFA] px-2.5 py-0.5 text-[11px] text-[#4B9AD2]">{row.value}</span>
                                    ) : (
                                        row.value
                                    )}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </section>
            </div>
        </div>
    );
}
