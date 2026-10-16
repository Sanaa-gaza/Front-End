import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, TriangleAlert } from "lucide-react";
import StatusTabs from "../../../components/dashboard/StatusTabs";
import SearchField from "../../../components/dashboard/SearchField";
import { TENDERS } from "./tendersData";

const BASE = "/dashboard/institution";

// ترتيب التبويبات زي التصميم
const TABS = ["all", "open", "executing", "submitting", "completed", "cancelled", "draft"];

const STATUS_STYLES = {
    open: "bg-[#DDF6E3] text-[#2EAF4E]",
    executing: "bg-[#FFF3D6] text-[#B7791F]",
    submitting: "bg-[#CFE3F3] text-[#4B9AD2]",
    completed: "bg-[#E2F4F1] text-[#2C8C7E]",
    cancelled: "bg-[#FDE7E7] text-[#D64545]",
    draft: "bg-[#EEF0F2] text-[#6B7280]",
};

// المناقصات المفتوحة بس إلها موعد متبقي
const HAS_DEADLINE = ["open", "submitting"];
// الحالات اللي بينفع فيها "إلغاء"
const CAN_CANCEL = ["open", "submitting", "draft"];

/** نافذة تأكيد إلغاء المناقصة */
function CancelModal({ title, onClose, onConfirm }) {
    const { t } = useTranslation("institutionDashboard");
    const closeRef = useRef(onClose);
    useEffect(() => {
        closeRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && closeRef.current();
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, []);

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#141415]/40 p-4 backdrop-blur-[2px]"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="cancel-tender-title"
                className="w-full max-w-[420px] rounded-[24px] bg-white p-6 text-center shadow-[0_24px_60px_rgba(20,20,21,0.25)]"
            >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FDE7E7] text-[#D64545]">
                    <TriangleAlert size={26} />
                </span>
                <h2 id="cancel-tender-title" className="mt-4 text-[17px] font-bold text-[#22455E]">
                    {t("tendersPage.cancelModal.title")}
                </h2>
                <p className="mt-2 text-[13px] leading-[1.9] text-[#575757]">{t("tendersPage.cancelModal.desc", { title })}</p>
                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onConfirm}
                        autoFocus
                        className="h-11 flex-1 cursor-pointer rounded-xl bg-[#D64545] text-[14px] font-semibold text-white transition-colors hover:bg-[#BF3A3A]"
                    >
                        {t("tendersPage.cancelModal.confirm")}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 flex-1 cursor-pointer rounded-xl border border-[#D9DEE3] text-[14px] font-semibold text-[#575757] transition-colors hover:bg-[#F5F8FA]"
                    >
                        {t("tendersPage.cancelModal.back")}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function InstitutionTenders() {
    const { t } = useTranslation("institutionDashboard");
    const [tab, setTab] = useState("open");
    const [query, setQuery] = useState("");
    // ⚠️ "إلغاء" بالصفحة بس لحد ما يصير في endpoint للمناقصات
    const [tenders, setTenders] = useState(TENDERS);
    const [cancelling, setCancelling] = useState(null);
    const [flash, setFlash] = useState("");

    const confirmCancel = () => {
        setTenders((list) => list.map((x) => (x.id === cancelling.id ? { ...x, status: "cancelled" } : x)));
        setFlash(t("tendersPage.cancelModal.done", { title: t(`tendersPage.sample.${cancelling.id}.title`) }));
        setCancelling(null);
    };

    const counts = useMemo(() => {
        const c = { all: tenders.length };
        tenders.forEach((tender) => {
            c[tender.status] = (c[tender.status] || 0) + 1;
        });
        return c;
    }, [tenders]);

    const rows = useMemo(() => {
        const q = query.trim().toLowerCase();
        return tenders.filter((tender) => {
            if (tab !== "all" && tender.status !== tab) return false;
            if (!q) return true;
            return t(`tendersPage.sample.${tender.id}.title`).toLowerCase().includes(q);
        });
    }, [tenders, tab, query, t]);

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-5">
            <SearchField value={query} onChange={setQuery} placeholder={t("tendersPage.search")} />

            <StatusTabs
                tabs={TABS.map((key) => ({ key, label: t(`tendersPage.tabs.${key}`), count: counts[key] || 0 }))}
                value={tab}
                onChange={(key) => {
                    setTab(key);
                    setFlash("");
                }}
            />

            {flash && (
                <p role="status" className="rounded-lg border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-3 text-[13px] text-[#2E9E5B]">
                    {flash}
                </p>
            )}

            {/* الجدول */}
            <section className="overflow-hidden rounded-[20px] border border-[#0000000D] bg-white shadow-[0_4px_24px_rgba(35,74,100,0.08)]">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-[13px]">
                        <thead>
                            <tr className="text-[14px] text-[#4B9AD2]">
                                <th className="px-5 pb-4 pt-6 text-start font-semibold">{t("tendersPage.columns.title")}</th>
                                <th className="px-4 pb-4 pt-6 text-center font-semibold">{t("tendersPage.columns.category")}</th>
                                <th className="px-4 pb-4 pt-6 text-center font-semibold">{t("tendersPage.columns.area")}</th>
                                <th className="px-4 pb-4 pt-6 text-center font-semibold">{t("tendersPage.columns.deadline")}</th>
                                <th colSpan={2} className="px-4 pb-4 pt-6 text-center font-semibold">
                                    {t("tendersPage.columns.status")}
                                    <span className="sr-only"> / {t("tendersPage.columns.actions")}</span>
                                </th>
                            </tr>
                            <tr aria-hidden="true">
                                <td colSpan={6} className="px-3">
                                    <div className="h-px bg-[#0000001F]" />
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((tender) => {
                                const s = `tendersPage.sample.${tender.id}`;
                                return (
                                    <tr key={tender.id} className="transition-colors hover:bg-[#F7FAFD]">
                                        <td className="px-5 py-3 text-[15px] font-bold text-[#22455E]">{t(`${s}.title`)}</td>
                                        <td className="px-4 py-3 text-center text-[#414141]">{t(`${s}.category`)}</td>
                                        <td className="px-4 py-3 text-center text-[#414141]">{t(`${s}.area`)}</td>
                                        <td className={`px-4 py-3 text-center ${tender.urgent ? "text-[#4B9AD2]" : "text-[#89949D]"}`}>
                                            {HAS_DEADLINE.includes(tender.status)
                                                ? t("tendersPage.remaining", { time: t(`${s}.time`) })
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[tender.status]}`}
                                            >
                                                {t(`tendersPage.status.${tender.status}`)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end gap-3">
                                                <Link
                                                    to={`${BASE}/tenders/${tender.id}`}
                                                    className="inline-flex h-7 items-center gap-1 rounded-full bg-[#4B9AD2] px-3 text-[11px] font-medium text-white btn-wipe"
                                                >
                                                    {t("tendersPage.view")}
                                                    <ChevronLeft size={13} className="ltr:rotate-180" />
                                                </Link>
                                                {CAN_CANCEL.includes(tender.status) ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFlash("");
                                                            setCancelling(tender);
                                                        }}
                                                        className="inline-flex h-7 min-w-[52px] cursor-pointer items-center justify-center rounded-lg border border-[#F3C4C4] px-2.5 text-[11px] font-medium text-[#D64545] transition-colors hover:bg-[#FFF6F6]"
                                                    >
                                                        {t("tendersPage.cancel")}
                                                    </button>
                                                ) : (
                                                    <span className="inline-block min-w-[52px]" aria-hidden="true" />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {rows.length === 0 && (
                    <p className="px-5 py-12 text-center text-[13px] text-[#89949D]">{t("tendersPage.empty")}</p>
                )}
            </section>

            {cancelling && (
                <CancelModal
                    title={t(`tendersPage.sample.${cancelling.id}.title`)}
                    onClose={() => setCancelling(null)}
                    onConfirm={confirmCancel}
                />
            )}
        </div>
    );
}
