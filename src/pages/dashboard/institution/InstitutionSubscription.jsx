import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Building2, CalendarDays, Check, Clock, CreditCard, FileText, Landmark, RotateCcw, Smartphone, TriangleAlert, Wallet, X } from "lucide-react";

const card = "rounded-[20px] border border-[#DDDDDD] bg-white";

// ===== بيانات تجريبية =====
// ⚠️ ما في endpoints للاشتراكات والفواتير لسا — النصوص بملف الترجمة: subscription
const PLAN = { price: 150, renewsOn: "2027-01-14", since: "2026-12-14", published: 4 };
const INVOICES = [
    { id: "INV-2026-000147", date: "2026-12-14", from: "2026-12-14", to: "2027-01-14", total: 150 },
    { id: "INV-2026-000131", date: "2026-11-14", from: "2026-11-14", to: "2026-12-14", total: 150 },
    { id: "INV-2026-000118", date: "2026-10-14", from: "2026-10-14", to: "2026-11-14", total: 150 },
];
const INVOICES_PREVIEW = 1;
const FEATURES = ["tenders", "invites", "badge"];
const METHODS = [
    { id: "bank", icon: Landmark },
    { id: "card", icon: CreditCard },
    { id: "wallet", icon: Smartphone },
];

/** نافذة بسيطة بنفس شكل نوافذ اللوحة — بتسكر بزر X أو Esc أو الضغط برا */
function Modal({ icon: Icon, tone, title, subtitle, onClose, children, footer }) {
    const { t } = useTranslation("institutionDashboard");
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div aria-hidden="true" onClick={onClose} className="dim-backdrop absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="sub-modal-title"
                className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[520px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.25)]"
            >
                <div className="flex items-center gap-4 border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-5">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                        <Icon size={20} strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h2 id="sub-modal-title" className="text-[18px] font-semibold text-[#1E293B]">
                            {title}
                        </h2>
                        <p className="mt-0.5 text-[12px] text-[#64748B]">{subtitle}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t("subscription.close")}
                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#64748B] transition-colors hover:bg-[#F1F5F9]"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="overflow-y-auto px-6 py-5">{children}</div>
                <div className="flex justify-end gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4">{footer}</div>
            </div>
        </div>
    );
}

/** صفحة "اشتراكي" — باقة المؤسسة ووسيلة الدفع والفواتير */
export default function InstitutionSubscription() {
    const { t, i18n } = useTranslation("institutionDashboard");
    const locale = `${i18n.language}-u-nu-latn`;
    const sb = "subscription";

    // ⚠️ كل الإجراءات محلية لحد ما تجهز الـ endpoints
    const [method, setMethod] = useState("bank");
    const [pickedMethod, setPickedMethod] = useState("bank");
    const [autoRenew, setAutoRenew] = useState(true);
    const [modal, setModal] = useState(null); // "method" | "cancel" | null
    const [showAll, setShowAll] = useState(false);
    const [flash, setFlash] = useState("");

    const fmt = (d, opts = { day: "numeric", month: "long", year: "numeric" }) => new Date(`${d}T00:00`).toLocaleDateString(locale, opts);
    const money = (n) => t(`${sb}.money`, { value: n.toFixed(2) });
    const invoices = showAll ? INVOICES : INVOICES.slice(0, INVOICES_PREVIEW);

    const info = [
        { key: autoRenew ? "renews" : "ends", icon: Clock, value: fmt(PLAN.renewsOn) },
        { key: "method", icon: Wallet, value: t(`${sb}.methods.${method}.label`) },
        { key: "since", icon: CalendarDays, value: fmt(PLAN.since) },
    ];

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-5">
            <h1 className="text-[24px] font-bold text-[#1E293B]">{t(`${sb}.title`)}</h1>

            {flash && (
                <p role="status" className="rounded-xl border border-[#A7E8CF] bg-[#ECFDF5] px-4 py-3 text-[13px] text-[#059669]">
                    {flash}
                </p>
            )}

            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="flex min-w-0 flex-col gap-8">
                    {/* الباقة */}
                    <section className={`${card} p-5 sm:p-6`}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-[20px] font-bold text-[#1E293B]">{t(`${sb}.plan.name`)}</h2>
                                <p className="mt-1 text-[12px] text-[#64748B]">{t(`${sb}.plan.price`, { price: PLAN.price })}</p>
                            </div>
                            <span
                                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${autoRenew ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FFF7D6] text-[#9A7400]"}`}
                            >
                                <span className={`h-1.5 w-1.5 rounded-full ${autoRenew ? "bg-[#16A34A]" : "bg-[#D97706]"}`} aria-hidden="true" />
                                {t(`${sb}.plan.${autoRenew ? "active" : "ending"}`)}
                            </span>
                        </div>

                        <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                            {info.map(({ key, icon: Icon, value }) => (
                                <div key={key} className="rounded-xl bg-[#F8FAFC] px-4 py-3.5">
                                    <dt className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                                        <Icon size={13} strokeWidth={1.8} />
                                        {t(`${sb}.info.${key}`)}
                                    </dt>
                                    <dd className="mt-1.5 text-[14px] font-bold text-[#1E293B] tabular-nums">{value}</dd>
                                </div>
                            ))}
                        </dl>

                        <div className="mt-5 flex flex-wrap gap-3 border-t border-[#F1F5F9] pt-5">
                            <button
                                type="button"
                                onClick={() => {
                                    setPickedMethod(method);
                                    setModal("method");
                                }}
                                className="h-11 cursor-pointer rounded-xl border border-[#4B9AD2] px-5 text-[13px] font-semibold text-[#3D8BC9] btn-wipe btn-wipe-outline"
                            >
                                {t(`${sb}.changeMethod`)}
                            </button>
                            {autoRenew ? (
                                <button
                                    type="button"
                                    onClick={() => setModal("cancel")}
                                    className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-xl border border-[#F5B5B5] px-5 text-[13px] font-semibold text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
                                >
                                    <X size={15} />
                                    {t(`${sb}.cancelRenewal`)}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAutoRenew(true);
                                        setFlash(t(`${sb}.resumedFlash`));
                                    }}
                                    className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-xl bg-[#16A34A] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#15803D]"
                                >
                                    <RotateCcw size={15} />
                                    {t(`${sb}.resumeRenewal`)}
                                </button>
                            )}
                        </div>
                    </section>

                    {/* الفواتير */}
                    <section>
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-[17px] font-bold text-[#1E293B]">{t(`${sb}.invoices.title`)}</h2>
                            {INVOICES.length > INVOICES_PREVIEW && (
                                <button
                                    type="button"
                                    onClick={() => setShowAll((x) => !x)}
                                    aria-expanded={showAll}
                                    className="cursor-pointer text-[12px] font-semibold text-[#4B9AD2] hover:underline"
                                >
                                    {t(`${sb}.invoices.${showAll ? "less" : "all"}`)}
                                </button>
                            )}
                        </div>
                        <div className="mt-3 overflow-x-auto rounded-2xl border border-[#E2E8F0] bg-white">
                            <table className="w-full min-w-[560px] text-[12px]">
                                <thead className="bg-[#F8FAFC] text-[11px] text-[#64748B]">
                                    <tr>
                                        {["number", "date", "period", "total"].map((k) => (
                                            <th key={k} scope="col" className="px-4 py-3 text-start font-medium">
                                                {t(`${sb}.invoices.cols.${k}`)}
                                            </th>
                                        ))}
                                        <th scope="col" className="px-4 py-3">
                                            <span className="sr-only">{t(`${sb}.invoices.cols.file`)}</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F1F5F9]">
                                    {invoices.map((inv) => (
                                        <tr key={inv.id}>
                                            <td className="px-4 py-3.5 font-bold text-[#3D8BC9]">
                                                <bdi dir="ltr">{inv.id}</bdi>
                                            </td>
                                            <td className="px-4 py-3.5 text-[#334155] tabular-nums">{fmt(inv.date)}</td>
                                            <td className="px-4 py-3.5 text-[#334155] tabular-nums">
                                                {t(`${sb}.invoices.period`, {
                                                    from: fmt(inv.from, { day: "numeric", month: "long" }),
                                                    to: fmt(inv.to, { day: "numeric", month: "long" }),
                                                })}
                                            </td>
                                            <td className="px-4 py-3.5 font-semibold text-[#1E293B] tabular-nums">{money(inv.total)}</td>
                                            <td className="px-4 py-3.5 text-end">
                                                {/* ⚠️ ما في رابط PDF لسا */}
                                                <button
                                                    type="button"
                                                    disabled
                                                    title={t(`${sb}.invoices.soon`)}
                                                    className="inline-flex h-7 items-center gap-1 rounded-md bg-[#EEF5FC] px-2.5 text-[10px] font-semibold text-[#3D8BC9] disabled:cursor-not-allowed"
                                                >
                                                    <FileText size={12} />
                                                    PDF
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* ما يشمله الاشتراك */}
                <aside className={`${card} p-5`}>
                    <h2 className="text-[15px] font-bold text-[#1E293B]">{t(`${sb}.features.title`)}</h2>
                    <ul className="mt-4 flex flex-col gap-3.5">
                        {FEATURES.map((id) => (
                            <li key={id} className="flex items-start gap-2.5 text-[13px] text-[#334155]">
                                <Check size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-[#10B981]" />
                                {t(`${sb}.features.items.${id}`, { count: PLAN.published })}
                            </li>
                        ))}
                    </ul>
                </aside>
            </div>

            {modal === "method" && (
                <Modal
                    icon={Wallet}
                    tone="bg-[#E3EFFA] text-[#3D8BC9]"
                    title={t(`${sb}.methodModal.title`)}
                    subtitle={t(`${sb}.methodModal.subtitle`)}
                    onClose={() => setModal(null)}
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setModal(null)}
                                className="h-11 min-w-[100px] cursor-pointer rounded-xl border border-[#DDDDDD] bg-white px-6 text-[14px] font-medium text-[#334155] transition-colors hover:bg-[#F1F5F9]"
                            >
                                {t(`${sb}.cancel`)}
                            </button>
                            <button
                                type="button"
                                disabled={pickedMethod === method}
                                onClick={() => {
                                    setMethod(pickedMethod);
                                    setModal(null);
                                    setFlash(t(`${sb}.methodFlash`, { method: t(`${sb}.methods.${pickedMethod}.label`) }));
                                }}
                                className="h-11 cursor-pointer rounded-xl bg-[#4B9AD2] px-6 text-[14px] font-semibold text-white btn-wipe disabled:cursor-not-allowed disabled:bg-[#DCE6EF] disabled:text-[#94A3B8]"
                            >
                                {t(`${sb}.save`)}
                            </button>
                        </>
                    }
                >
                    <div role="radiogroup" className="flex flex-col gap-2.5">
                        {METHODS.map(({ id, icon: Icon }) => {
                            const on = pickedMethod === id;
                            return (
                                <label
                                    key={id}
                                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors ${on ? "border-[#4B9AD2] bg-[#F3F8FD]" : "border-[#DDDDDD] hover:bg-[#F8FAFC]"}`}
                                >
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value={id}
                                        checked={on}
                                        onChange={() => setPickedMethod(id)}
                                        className="sr-only"
                                    />
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FC] text-[#3D8BC9]">
                                        <Icon size={18} strokeWidth={1.8} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-[13px] font-bold text-[#1E293B]">{t(`${sb}.methods.${id}.label`)}</span>
                                        <span className="mt-0.5 block text-[11px] text-[#64748B]">{t(`${sb}.methods.${id}.desc`)}</span>
                                    </span>
                                    {on && <Check size={18} strokeWidth={2.5} className="shrink-0 text-[#4B9AD2]" />}
                                </label>
                            );
                        })}
                    </div>
                </Modal>
            )}

            {modal === "cancel" && (
                <Modal
                    icon={TriangleAlert}
                    tone="bg-[#FEF2F2] text-[#DC2626]"
                    title={t(`${sb}.cancelModal.title`)}
                    subtitle={t(`${sb}.cancelModal.subtitle`)}
                    onClose={() => setModal(null)}
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setModal(null)}
                                className="h-11 min-w-[100px] cursor-pointer rounded-xl border border-[#DDDDDD] bg-white px-6 text-[14px] font-medium text-[#334155] transition-colors hover:bg-[#F1F5F9]"
                            >
                                {t(`${sb}.cancelModal.keep`)}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setAutoRenew(false);
                                    setModal(null);
                                    setFlash(t(`${sb}.cancelledFlash`, { date: fmt(PLAN.renewsOn) }));
                                }}
                                className="h-11 cursor-pointer rounded-xl bg-[#DC2626] px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[#B91C1C]"
                            >
                                {t(`${sb}.cancelModal.confirm`)}
                            </button>
                        </>
                    }
                >
                    <p className="text-[13px] leading-[1.9] text-[#475569]">{t(`${sb}.cancelModal.body`, { date: fmt(PLAN.renewsOn) })}</p>
                    <div className="mt-4 flex items-start gap-3 rounded-xl bg-[#F8FAFC] p-4">
                        <Building2 size={18} className="mt-0.5 shrink-0 text-[#64748B]" />
                        <p className="text-[12px] leading-[1.8] text-[#64748B]">{t(`${sb}.cancelModal.note`)}</p>
                    </div>
                </Modal>
            )}
        </div>
    );
}
