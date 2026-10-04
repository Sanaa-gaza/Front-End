import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircleAlert, Hourglass } from "lucide-react";
import { getProfile } from "../../../api/endpoints";

const BASE = "/dashboard/institution";

// ===== بيانات تجريبية =====
// الباك إند لسا ما فيه endpoints للمناقصات والإحصائيات (سبرنت 1 بس للحسابات).
// لما تجهز، استبدلي هاي القيم بطلبات من src/api/endpoints.js

const STATS = [
    { key: "openTenders", value: 8 },
    { key: "newOffers", value: 23 },
    { key: "activeProjects", value: 12 },
    { key: "pendingReviews", value: 3 },
];

const TENDERS = [
    { key: "t1", offers: 12, status: "open", progress: 78, highlighted: true },
    { key: "t2", offers: 12, status: "submitting", progress: 28 },
    { key: "t3", offers: 12, status: "submitting", progress: 28 },
];

const ACTIONS = [
    { key: "completeKyc", urgent: true, to: `${BASE}/settings` },
    { key: "unanswered", to: `${BASE}/tenders` },
    { key: "unrated", to: `${BASE}/projects` },
    { key: "draft", to: `${BASE}/tenders` },
];

const STATUS_STYLES = {
    open: "bg-[#DDF6E3] text-[#2EAF4E]",
    submitting: "bg-[#CFE3F3] text-[#4B9AD2]",
};

const card = "rounded-[20px] border border-[#0000000D] bg-white shadow-[0_4px_24px_rgba(35,74,100,0.08)]";

/**
 * حالة توثيق المؤسسة من GET /profile (pending | approved | rejected).
 * الأدمن بيغيرها من لوحته؛ شكل الرد للمؤسسة مش موثق، فبندوّر بأكثر من مكان.
 * ملاحظة: users.status (active/suspended) شي ثاني — هاد حالة الحساب مش التوثيق.
 */
function readVerification(d = {}) {
    const inst = d.institution || d.institution_profile || {};
    return {
        status: inst.status || d.verification_status || d.account_status || "pending",
        reason: inst.rejection_reason || d.rejection_reason || "",
    };
}

export default function InstitutionHome() {
    const { t } = useTranslation("institutionDashboard");
    // null = لسا عم نحمّل، عشان التنبيه ما يطلع ويختفي فجأة
    const [verification, setVerification] = useState(null);

    useEffect(() => {
        getProfile()
            .then((res) => setVerification(readVerification(res.data)))
            .catch(() => setVerification(readVerification()));
    }, []);

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
            {/* الإحصائيات */}
            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {STATS.map((s) => (
                    <div key={s.key} className={`${card} px-4 py-6 text-center`}>
                        <p className="text-[30px] font-bold leading-none text-[#4B9AD2] tabular-nums">{s.value}</p>
                        <p className="mt-3 text-[12px] font-medium text-[#414141]">{t(`stats.${s.key}`)}</p>
                    </div>
                ))}
            </section>

            {/* تنبيه التوثيق — بيختفي لما الأدمن يعتمد حساب المؤسسة */}
            {verification && verification.status !== "approved" && (
                <section className={`${card} flex items-start gap-4 p-5 sm:p-6`}>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F9D6D9] text-[#A61B29]">
                        <CircleAlert size={24} strokeWidth={1.8} />
                    </span>
                    <div>
                        {verification.status === "rejected" ? (
                            <>
                                <h2 className="text-[16px] font-bold text-[#414141]">{t("kyc.rejectedTitle")}</h2>
                                <p className="mt-1.5 text-[12px] leading-[1.9] text-[#89949D]">
                                    {verification.reason || t("kyc.rejectedDesc")}
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-[16px] font-bold text-[#414141]">{t("kyc.title")}</h2>
                                <p className="mt-1.5 text-[12px] leading-[1.9] text-[#89949D]">{t("kyc.desc")}</p>
                            </>
                        )}
                    </div>
                </section>
            )}

            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                {/* المناقصات الجارية */}
                <section className={`${card} p-5`}>
                    <h2 className="mb-5 text-[17px] font-bold text-[#4B9AD2]">{t("tenders.title")}</h2>
                    <ul className="flex flex-col gap-4">
                        {TENDERS.map((tender) => (
                            <li
                                key={tender.key}
                                className={`rounded-2xl border px-5 pb-5 pt-4 ${tender.highlighted
                                    ? "border-[#BFDCF1] bg-[#EAF3FB]"
                                    : "border-[#0000000F] bg-[#F7F8FA]"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="text-[16px] font-semibold leading-[1.6] text-[#414141]">
                                            {t(`sample.${tender.key}.title`)}
                                        </h3>
                                        <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-[#89949D]">
                                            <span>{t("tenders.offers", { count: tender.offers })}</span>
                                            <span>{t(`sample.${tender.key}.location`)}</span>
                                        </p>
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[tender.status]}`}
                                    >
                                        {t(`tenders.status.${tender.status}`)}
                                    </span>
                                </div>

                                <div className="mt-8 flex items-center gap-4">
                                    <span className="flex shrink-0 items-center gap-1 text-[11px] text-[#4B9AD2]">
                                        <Hourglass size={12} />
                                        {t("tenders.remaining", { time: t(`sample.${tender.key}.remaining`) })}
                                    </span>
                                    <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-[#CFE3F3]">
                                        <div
                                            className="h-full rounded-full bg-[#4B9AD2]"
                                            style={{ width: `${tender.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* مهام بانتظار إجراء */}
                <section className={`${card} self-start p-5`}>
                    <h2 className="text-[16px] font-bold text-[#22455E]">{t("actions.title")}</h2>
                    <p className="mt-1 text-[11px] text-[#89949D]">
                        {t("actions.subtitle", { count: ACTIONS.length })}
                    </p>
                    <ul className="mt-4 divide-y divide-[#0000000F]">
                        {ACTIONS.map((a) => (
                            <li key={a.key}>
                                <Link to={a.to} className="group flex items-start gap-3 py-3.5">
                                    <span
                                        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${a.urgent ? "bg-[#D64545]" : "bg-[#4B9AD2]"
                                            }`}
                                    />
                                    <span>
                                        <span className="block text-[13px] font-semibold text-[#414141] transition-colors group-hover:text-[#4B9AD2]">
                                            {t(`actions.${a.key}.title`)}
                                        </span>
                                        <span className="mt-0.5 block text-[11px] text-[#89949D]">
                                            {t(`actions.${a.key}.sub`)}
                                        </span>
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}
