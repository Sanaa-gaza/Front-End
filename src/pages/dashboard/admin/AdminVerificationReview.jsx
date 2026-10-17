import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, CircleAlert, Download, Eye, FileText, Info, RotateCw, X } from "lucide-react";
import { VERIFICATIONS, VERIFICATION_STATUS_STYLES } from "./AdminVerification";
import ApproveModal from "./ApproveModal";
import InfoRequestModal from "./InfoRequestModal";
import RejectModal from "./RejectModal";

const BASE = "/dashboard/admin";

const card = "rounded-[18px] border border-[#0000000D] bg-white shadow-[0_4px_20px_rgba(35,74,100,0.07)]";

// ⚠️ تفاصيل تجريبية (المستندات، بيانات التسجيل، السجل) لحد ما يجهز endpoint طلب التوثيق
// url: رابط الملف من السيرفر (فاضي بالتجريبي فالمعاينة والتحميل معطّلين)
const DOCUMENTS = [
    { key: "id", ext: "JPG", size: "1.2 MB", url: "" },
    { key: "photo", ext: "JPG", size: "620 KB", url: "" },
    { key: "license", ext: "PDF", size: "840 KB", url: "" },
];
const CHECKLIST = ["name", "photo", "valid"];
const SUBMITTED_HOURS = 9;

/** صفحة مراجعة طلب توثيق (/dashboard/admin/verification/:verificationId) */
export default function AdminVerificationReview() {
    const { t, i18n } = useTranslation("adminDashboard");
    const { verificationId } = useParams();
    const item = VERIFICATIONS.find((x) => x.id === verificationId);
    const locale = `${i18n.language}-u-nu-latn`;
    const v = "verificationPage";
    const rv = `${v}.reviewPage`;

    // ⚠️ القرار بالصفحة بس لحد ما يصير في endpoint
    const [status, setStatus] = useState(item?.status);
    const [previewKey, setPreviewKey] = useState("id");
    const [checked, setChecked] = useState({ name: true });
    const [modal, setModal] = useState(null); // "approve" | "info" | "reject"
    const [flash, setFlash] = useState("");
    const [events, setEvents] = useState([]);
    // تعارض: مشرف ثاني اتخذ قرار قبلنا — { by, decision }
    const [conflict, setConflict] = useState(null);

    if (!item) {
        return (
            <div className={`${card} mx-auto max-w-[1100px] p-10 text-center`}>
                <p className="text-[15px] font-bold text-[#414141]">{t(`${rv}.notFound`)}</p>
                <Link to={`${BASE}/verification`} className="mt-4 inline-block text-[13px] text-[#4B9AD2] hover:underline">
                    {t(`${v}.title`)}
                </Link>
            </div>
        );
    }

    const s = `${v}.sample.${item.id}`;
    const name = t(`${s}.name`);
    const fieldText = t(`${s}.field`);
    const area = t(`${s}.area`);
    const docName = (key) => t(`${rv}.documents.${item.type}.${key}`);
    const decided = status === "verified" || status === "rejected" || !!conflict;
    const time = (iso) =>
        new Date(iso).toLocaleString(locale, { day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });

    // note: ملاحظة داخلية (بالاعتماد) بتنضاف لسطر السجل
    const decide = (next, flashKey, note) => {
        setModal(null);
        // لو في مشرف ثاني سبقنا: قرارنا ما بينحفظ وبنعرض قراره هو
        if (item.concurrent && !conflict) {
            const { by, decision } = item.concurrent;
            const byName = t(`requestsPage.staff.${by}`);
            setConflict({ by: byName, decision });
            setStatus(decision);
            setFlash("");
            setEvents((list) => [
                {
                    id: `c-${Date.now()}`,
                    text: `${t(`${rv}.history.${decision === "verified" ? "approved" : decision}`)} — ${byName}`,
                    date: t(`${rv}.conflict.minuteAgo`),
                    dot: decision === "rejected" ? "#D64545" : decision === "info" ? "#D9822B" : "#2EC65A",
                },
                ...list,
            ]);
            return;
        }
        setStatus(next);
        setFlash(t(`${rv}.flash.${flashKey}`, { name }));
        setEvents((list) => [
            { id: `e-${Date.now()}`, text: t(`${rv}.history.${flashKey}`) + (note ? ` — ${note}` : ""), date: t(`${rv}.now`), dot: next === "rejected" ? "#D64545" : next === "info" ? "#D9822B" : "#2EC65A" },
            ...list,
        ]);
    };

    const registration = [
        { key: "fullName", value: name },
        { key: "phone", value: "0599-214-778", ltr: true },
        { key: "email", value: "a.shaheen@gmail.com", ltr: true },
        { key: "providerType", value: t(`${rv}.providerTypes.${item.type}`) },
        { key: "specialty", value: fieldText },
        { key: "area", value: area },
        { key: "registeredAt", value: new Date(item.submitted).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }) },
    ];

    const history = [
        ...events,
        { id: "documents", text: t(`${rv}.history.documents`, { count: DOCUMENTS.length }), date: time(`${item.submitted}T10:12`), dot: "#4B9AD2" },
        { id: "phone", text: t(`${rv}.history.phone`), date: time(`${item.submitted}T10:05`), dot: "#2EC65A" },
        { id: "created", text: t(`${rv}.history.created`), date: time(`${item.submitted}T10:01`), dot: "#9AA3AB" },
    ];

    const btn = "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-5">
            {/* مسار الصفحة */}
            <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-[11px] text-[#89949D]">
                <Link to={`${BASE}/verification`} className="text-[#4B9AD2] hover:underline">{t(`${v}.title`)}</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page" className="text-[#575757]">{name}</span>
            </nav>

            {conflict && (
                <div role="alert" className="flex flex-col gap-3 rounded-xl border border-[#F2D27A] bg-[#FFF8DD] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <CircleAlert size={20} className="mt-0.5 shrink-0 text-[#BF9900]" />
                        <div>
                            <p className="text-[13px] font-bold text-[#BF9900]">{t(`${rv}.conflict.title`)}</p>
                            <p className="mt-1 text-[11px] text-[#414141]">
                                {t(`${rv}.conflict.desc.${conflict.decision}`, { name: conflict.by })}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        // ⚠️ لما يصير في API: بنعيد جلب الطلب من السيرفر هون
                        onClick={() => setConflict(null)}
                        className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#4B9AD2] bg-white px-5 text-[13px] font-medium text-[#4B9AD2] btn-wipe btn-wipe-outline"
                    >
                        <RotateCw size={15} />
                        {t(`${rv}.conflict.refresh`)}
                    </button>
                </div>
            )}

            {/* الرأس */}
            <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EAF3FB] text-[20px] font-bold text-[#4B9AD2]">
                        {name.trim().charAt(0)}
                    </span>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-[24px] font-bold text-[#141415]">{name}</h1>
                            <span className="rounded-full bg-[#EEF0F2] px-2.5 py-0.5 text-[9px] text-[#575757]">{t(`${rv}.providerKinds.${item.type}`)}</span>
                            <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-medium ${VERIFICATION_STATUS_STYLES[status]}`}>
                                {t(`${v}.statuses.${status}`)}
                            </span>
                        </div>
                        <p className="mt-1.5 text-[12px] text-[#575757]">
                            {fieldText} · {area} · {t(`${rv}.submittedAgo`, { count: SUBMITTED_HOURS })} · <bdi dir="ltr">{item.code}</bdi>
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => setModal("reject")}
                            disabled={decided}
                            className={`${btn} min-w-[92px] border border-[#D64545] text-[#D64545] hover:bg-[#FFF6F6]`}
                        >
                            <X size={15} />
                            {t(`${rv}.reject`)}
                        </button>
                        <button
                            type="button"
                            onClick={() => setModal("info")}
                            disabled={decided}
                            className={`${btn} min-w-[140px] border border-[#4B9AD2] text-[#4B9AD2] btn-wipe btn-wipe-outline`}
                        >
                            <Info size={15} />
                            {t(`${rv}.requestInfo`)}
                        </button>
                        <button
                            type="button"
                            onClick={() => setModal("approve")}
                            disabled={decided}
                            className={`${btn} min-w-[140px] bg-[#4B9AD2] text-white shadow-[0_4px_10px_rgba(75,154,210,0.3)] btn-wipe`}
                        >
                            <Check size={16} />
                            {t(`${rv}.approve`)}
                        </button>
                </div>
            </header>

            {flash && (
                <p role="status" className="rounded-lg border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-3 text-[13px] text-[#2E9E5B]">
                    {flash}
                </p>
            )}

            <div className="grid items-start gap-5 lg:grid-cols-[1fr_270px]">
                <div className="flex min-w-0 flex-col gap-5">
                    {/* المستندات المرفوعة */}
                    <section className={`${card} p-5`}>
                        <h2 className="flex items-center gap-2 text-[16px] font-bold text-[#141415]">
                            {t(`${rv}.documentsTitle`)}
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EAF3FB] px-1.5 text-[10px] text-[#4B9AD2]">{DOCUMENTS.length}</span>
                        </h2>
                        <ul className="mt-4 flex flex-col gap-3">
                            {DOCUMENTS.map((doc) => {
                                const active = previewKey === doc.key;
                                return (
                                    <li
                                        key={doc.key}
                                        className={`flex items-center gap-3 rounded-xl border px-4 py-4 ${active ? "border-[#BFDCF1] bg-[#EEF5FC]" : "border-transparent"}`}
                                    >
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF3FB] text-[#4B9AD2]">
                                            <FileText size={18} strokeWidth={1.7} />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-[13px] text-[#141415]">{docName(doc.key)}</p>
                                            <p className="mt-0.5 text-[9px] text-[#89949D]" dir="ltr">{doc.ext} · {doc.size}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setPreviewKey(doc.key)}
                                            aria-pressed={active}
                                            className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-4 text-[12px] font-medium transition-colors ${active ? "bg-[#4B9AD2] text-white" : "border border-[#4B9AD2] text-[#4B9AD2] hover:bg-[#EEF5FC]"
                                                }`}
                                        >
                                            <Eye size={13} />
                                            {t(`${rv}.preview`)}
                                        </button>
                                        {doc.url ? (
                                            <a href={doc.url} download className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#F2F4F6] px-4 text-[12px] font-medium text-[#414141] hover:bg-[#E6E9EC]">
                                                <Download size={13} />
                                                {t(`${rv}.download`)}
                                            </a>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled
                                                title={t(`${rv}.unavailable`)}
                                                className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-lg bg-[#F2F4F6] px-4 text-[12px] font-medium text-[#414141]"
                                            >
                                                <Download size={13} />
                                                {t(`${rv}.download`)}
                                            </button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>

                        <p className="mb-3 mt-6 text-[13px] text-[#141415]">{t(`${rv}.previewOf`, { name: docName(previewKey) })}</p>
                        {/* المعاينة — لما ييجي رابط الملف من السيرفر بنعرضه هون (صورة أو PDF) */}
                        <div className="flex h-[90px] items-center justify-center rounded-xl border-2 border-dashed border-[#D5DAE0] bg-[#F2F3F5] text-[11px] text-[#575757]">
                            {t(`${rv}.openFull`)}
                        </div>
                    </section>

                    {/* قائمة التحقق */}
                    <section className={`${card} p-5`}>
                        <h2 className="text-[14px] font-bold text-[#141415]">{t(`${rv}.checklistTitle`)}</h2>
                        <ul className="mt-4 flex flex-col gap-3">
                            {CHECKLIST.map((k) => (
                                <li key={k}>
                                    <label className="flex cursor-pointer items-center gap-2.5 text-[12px] text-[#414141]">
                                        <input
                                            type="checkbox"
                                            checked={!!checked[k]}
                                            disabled={decided}
                                            onChange={(e) => setChecked((c) => ({ ...c, [k]: e.target.checked }))}
                                            className="h-4 w-4 cursor-pointer accent-[#4B9AD2]"
                                        />
                                        {t(`${rv}.checklist.${k}`)}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                <aside className="flex flex-col gap-5">
                    {/* بيانات التسجيل */}
                    <section className={`${card} border-t-2 border-t-[#9CC9EA] p-5`}>
                        <h2 className="text-[14px] font-bold text-[#141415]">{t(`${rv}.registrationTitle`)}</h2>
                        <dl className="mt-4 flex flex-col gap-4 text-[11px]">
                            {registration.map((row) => (
                                <div key={row.key} className="flex items-center justify-between gap-3">
                                    <dt className="shrink-0 text-[#575757]">{t(`${rv}.registration.${row.key}`)}</dt>
                                    <dd className="truncate font-medium text-[#141415]" dir={row.ltr ? "ltr" : undefined}>{row.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    {/* سجل الحساب */}
                    <section className={`${card} p-5`}>
                        <h2 className="text-[14px] font-bold text-[#141415]">{t(`${rv}.historyTitle`)}</h2>
                        <ol className="mt-4 flex flex-col gap-5">
                            {history.map((h) => (
                                <li key={h.id} className="flex items-start gap-3">
                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: h.dot }} aria-hidden="true" />
                                    <div>
                                        <p className="text-[12px] text-[#141415]">{h.text}</p>
                                        <p className="mt-0.5 text-[9px] text-[#89949D]">{h.date}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </section>
                </aside>
            </div>

            {modal === "approve" && (
                <ApproveModal
                    name={name}
                    summary={[
                        {
                            label: t(`${rv}.approveModal.account`),
                            value: `${t(`${rv}.providerKinds.${item.type}`)} · ${fieldText} · ${item.code}`,
                        },
                        {
                            label: t(`${rv}.approveModal.documents`),
                            value: `${t(`${v}.documents`, { count: DOCUMENTS.length })} · ${CHECKLIST.every((k) => checked[k])
                                ? t(`${rv}.approveModal.checklistDone`)
                                : t(`${rv}.approveModal.checklistPartial`, { done: CHECKLIST.filter((k) => checked[k]).length, total: CHECKLIST.length })
                                }`,
                        },
                    ]}
                    onClose={() => setModal(null)}
                    onConfirm={(note) => decide("verified", "approved", note)}
                />
            )}
            {modal === "info" && (
                <InfoRequestModal
                    recipient={t(`${rv}.infoModal.recipients.${item.type}`)}
                    documents={DOCUMENTS.map((doc) => ({ key: doc.key, label: docName(doc.key) }))}
                    onClose={() => setModal(null)}
                    // المستندات المطلوبة بتنضاف لسطر السجل
                    onConfirm={({ documents }) => decide("info", "info", documents.map(docName).join("، "))}
                />
            )}
            {modal === "reject" && (
                <RejectModal
                    onClose={() => setModal(null)}
                    // سبب الرفض بينضاف لسطر السجل
                    onConfirm={({ reason }) => decide("rejected", "rejected", t(`${rv}.rejectModal.reasons.${reason}`))}
                />
            )}
        </div>
    );
}
