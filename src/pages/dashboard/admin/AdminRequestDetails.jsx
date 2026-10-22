import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, ImageIcon, X } from "lucide-react";
import { getStoredUser } from "../../../api/session";
import { AssignModal, REQUESTS, REQUEST_STATUS_STYLES } from "./AdminRequests";
import { USERS } from "./AdminUsers";

const BASE = "/dashboard/admin";

const card = "rounded-[18px] border border-[#0000000D] bg-white shadow-[0_4px_20px_rgba(35,74,100,0.07)]";

/** صفحة تفاصيل الطلب بلوحة الأدمن (/dashboard/admin/requests/:requestId) */
export default function AdminRequestDetails() {
    const { t, i18n } = useTranslation("adminDashboard");
    const { requestId } = useParams();
    const base = REQUESTS.find((r) => r.id === requestId);
    const locale = `${i18n.language}-u-nu-latn`;
    const d = "requestsPage.details";

    // ⚠️ الإسناد/الأخذ/الرفض بالصفحة بس لحد ما يصير في endpoint
    const [changes, setChanges] = useState({});
    const [providerModal, setProviderModal] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [flash, setFlash] = useState("");

    if (!base) {
        return (
            <div className={`${card} mx-auto max-w-[1100px] p-10 text-center`}>
                <p className="text-[15px] font-bold text-[#414141]">{t(`${d}.notFound`)}</p>
                <Link to={`${BASE}/requests`} className="mt-4 inline-block text-[13px] text-[#4B9AD2] hover:underline">
                    {t(`${d}.breadcrumb`)}
                </Link>
            </div>
        );
    }

    const r = { ...base, ...changes };
    const s = `requestsPage.sample.${r.id}`;
    const title = t(`${s}.title`);
    const client = t(`${s}.client`);
    const area = t(`${s}.area`);
    const finished = r.status === "closed" || r.status === "rejected";
    // "أخذ الطلب": المسؤول بيصير الأدمن الحالي
    const meName = getStoredUser()?.full_name || t(`${d}.you`);
    const ownerName = r.owner === "me" ? meName : r.owner ? t(`requestsPage.staff.${r.owner}`) : "";
    const providerName = r.provider ? t(`usersPage.sample.${r.provider}.name`) : "";
    const ago = r.lastActiveHours < 24
        ? t("requestsPage.hoursAgo", { count: r.lastActiveHours })
        : t("requestsPage.daysAgo", { count: Math.round(r.lastActiveHours / 24) });

    const update = (patch, msg) => {
        setChanges((c) => ({ ...c, ...patch }));
        setFlash(msg);
    };

    const btn = "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-[12px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-5">
            {/* مسار الصفحة */}
            <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-[11px] text-[#89949D]">
                <Link to={`${BASE}/requests`} className="text-[#4B9AD2] hover:underline">{t(`${d}.breadcrumb`)}</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page" className="text-[#575757]" dir="ltr">{r.ref}</span>
            </nav>

            {/* رأس الطلب */}
            <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-[21px] font-bold text-[#141415]">{title}</h1>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${REQUEST_STATUS_STYLES[r.status]}`}>
                            {t(`requestsPage.statuses.${r.status}`)}
                        </span>
                        <span className="rounded-full bg-[#EEF0F2] px-2.5 py-0.5 text-[10px] text-[#575757]">
                            {t(`requestsPage.categories.${r.category}`)}
                        </span>
                    </div>
                    <p className="mt-1.5 text-[11px] text-[#575757]">
                        {t(`${d}.receivedAgo`, { time: ago })} · {area} · <bdi dir="ltr">{r.ref}</bdi>
                    </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setProviderModal(true)}
                        disabled={finished}
                        className={`${btn} min-w-[140px] bg-[#4B9AD2] text-white btn-wipe`}
                    >
                        <Check size={15} />
                        {t(`${d}.assignProvider`)}
                    </button>
                    <button
                        type="button"
                        onClick={() => update({ owner: "me", status: r.status === "new" ? "reviewing" : r.status }, t(`${d}.flash.taken`))}
                        disabled={finished || r.owner === "me"}
                        className={`${btn} min-w-[140px] border border-[#8EC0E4] text-[#4B9AD2] btn-wipe btn-wipe-outline`}
                    >
                        <Check size={15} />
                        {r.owner === "me" ? t(`${d}.taken`) : t(`${d}.take`)}
                    </button>
                    <button
                        type="button"
                        onClick={() => setRejecting(true)}
                        disabled={finished}
                        className={`${btn} min-w-[82px] border border-[#E8A5AB] text-[#D64545] hover:bg-[#FFF6F6]`}
                    >
                        <X size={15} />
                        {t(`${d}.reject`)}
                    </button>
                </div>
            </header>

            {rejecting && (
                <div role="alertdialog" className="flex flex-col gap-3 rounded-xl border border-[#F3C4C4] bg-[#FFF6F6] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[13px] text-[#A61B29]">{t(`${d}.confirmReject`)}</p>
                    <div className="flex shrink-0 gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                update({ status: "rejected" }, t(`${d}.flash.rejected`));
                                setRejecting(false);
                            }}
                            className="h-9 cursor-pointer rounded-lg bg-[#D64545] px-4 text-[12px] font-medium text-white hover:bg-[#B83636]"
                        >
                            {t(`${d}.confirmRejectBtn`)}
                        </button>
                        <button
                            type="button"
                            onClick={() => setRejecting(false)}
                            className="h-9 cursor-pointer rounded-lg border border-[#0000001A] bg-white px-4 text-[12px] font-medium text-[#575757] hover:bg-[#F5F6F8]"
                        >
                            {t(`${d}.cancel`)}
                        </button>
                    </div>
                </div>
            )}
            {flash && (
                <p role="status" className="rounded-lg border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-3 text-[13px] text-[#2E9E5B]">
                    {flash}
                </p>
            )}

            <div className="grid items-start gap-5 lg:grid-cols-[1fr_250px]">
                {/* وصف الطلب + الصور */}
                <section className={`${card} p-5 sm:p-6`}>
                    <h2 className="text-[14px] font-bold text-[#141415]">{t(`${d}.descTitle`)}</h2>
                    <p className="mt-4 text-[12px] leading-[2] text-[#414141]">{t(`${s}.desc`)}</p>
                    <p className="mb-3 mt-5 text-[11px] text-[#414141]">
                        {r.photos ? t(`${d}.photos`, { count: r.photos }) : t(`${d}.noPhotos`)}
                    </p>
                    {r.photos > 0 && (
                        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {Array.from({ length: r.photos }, (_, i) => (
                                <li
                                    key={i}
                                    aria-label={t(`${d}.photoAlt`, { n: i + 1 })}
                                    className="flex h-[72px] items-center justify-center rounded-xl bg-[#EFEFEF] text-[#9AA3AB]"
                                >
                                    <ImageIcon size={20} strokeWidth={1.5} />
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <aside className="flex flex-col gap-4">
                    {/* العميل */}
                    <section className={`${card} border-t-2 border-t-[#9CC9EA] p-4`}>
                        <h2 className="text-[14px] font-bold text-[#141415]">{t(`${d}.clientTitle`)}</h2>
                        <div className="mt-3 flex items-center gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF3FB] text-[13px] font-bold text-[#4B9AD2]">
                                {client.trim().charAt(0)}
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-[12px] font-bold text-[#141415]">{client}</p>
                                <p className="text-[8px] text-[#89949D]">
                                    {t(`${d}.clientSince`, { date: new Date(r.clientSince).toLocaleDateString(locale, { month: "long", year: "numeric" }) })} · <bdi dir="ltr">{r.clientCode}</bdi>
                                </p>
                            </div>
                        </div>
                        <dl className="mt-4 flex flex-col gap-3.5 text-[11px]">
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-[#575757]">{t(`${d}.phone`)}</dt>
                                <dd className="font-medium text-[#141415]" dir="ltr">{r.clientPhone}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <dt className="shrink-0 text-[#575757]">{t(`${d}.address`)}</dt>
                                <dd className="truncate font-medium text-[#141415]">{area}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-[#575757]">{t(`${d}.previous`)}</dt>
                                <dd className="font-medium text-[#141415]">{t(`${d}.previousCount`, { count: r.previous })}</dd>
                            </div>
                        </dl>
                    </section>

                    {/* المسؤول والإسناد */}
                    <section className={`${card} p-4`}>
                        <h2 className="text-[12px] font-bold text-[#141415]">{t(`${d}.assignTitle`)}</h2>
                        <dl className="mt-4 flex flex-col gap-3.5 text-[11px]">
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-[#575757]">{t(`${d}.owner`)}</dt>
                                <dd className={`font-medium ${ownerName ? "text-[#141415]" : "text-[#89949D]"}`}>
                                    {ownerName || t("requestsPage.unassigned")}
                                </dd>
                            </div>
                            {providerName && (
                                <div className="flex items-center justify-between gap-3">
                                    <dt className="text-[#575757]">{t(`${d}.provider`)}</dt>
                                    <dd className="font-medium text-[#141415]">{providerName}</dd>
                                </div>
                            )}
                        </dl>
                    </section>
                </aside>
            </div>

            {providerModal && (
                <AssignModal
                    summary={title}
                    texts={t(`${d}.providerModal`, { returnObjects: true })}
                    options={USERS.craftsmen
                        .filter((u) => u.status !== "suspended")
                        .map((u) => ({ value: u.id, label: `${t(`usersPage.sample.${u.id}.name`)} — ${t(`usersPage.sample.${u.id}.field`)}` }))}
                    onClose={() => setProviderModal(false)}
                    onConfirm={(provider) => {
                        update({ provider, status: "assigned" }, t(`${d}.flash.provider`, { name: t(`usersPage.sample.${provider}.name`) }));
                        setProviderModal(false);
                    }}
                />
            )}
        </div>
    );
}
