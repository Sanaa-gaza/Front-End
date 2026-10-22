import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Ban, Briefcase, CircleCheck, Clock, FileText, MessageSquare, Star } from "lucide-react";
import { STATUS_STYLES, SuspendModal, VERIFICATION_STYLES, findUser } from "./AdminUsers";

const BASE = "/dashboard/admin";

const card = "rounded-[18px] border border-[#0000000D] bg-white shadow-[0_4px_20px_rgba(35,74,100,0.07)]";

// ⚠️ تفاصيل إضافية تجريبية (التواريخ، الطلبات المسندة، سجل الحالة) لحد ما يجهز endpoint تفاصيل المستخدم
const MEMBER_SINCE = "2026-03-10";
const VERIFIED_AT = "2026-03-12";
const REQUESTS = ["r1", "r2", "r3"];

// الإحصائيات حسب نوع الحساب: value من بيانات المستخدم أو قيمة تجريبية
const STAT_SETS = {
    craftsmen: (u) => [
        { key: "rating", icon: Star, value: u.rating ?? 4.8, note: ["ratingNote", { count: 86 }] },
        { key: "completed", icon: Briefcase, value: u.completed ?? 71, note: ["completedNote"] },
        { key: "experience", icon: Clock, value: u.years ?? 12, years: true, note: ["experienceNote"] },
        { key: "assigned", icon: FileText, value: 9, note: ["assignedNote", { count: 2 }] },
    ],
    contractors: (u) => [
        { key: "rating", icon: Star, value: 4.6, note: ["ratingNote", { count: 54 }] },
        { key: "activeProjects", icon: Briefcase, value: u.activeProjects ?? 0 },
        { key: "workers", icon: Clock, value: u.workers ?? 0 },
        { key: "assigned", icon: FileText, value: 9, note: ["assignedNote", { count: 2 }] },
    ],
    customers: (u) => [
        { key: "requests", icon: FileText, value: u.requests ?? 0 },
        { key: "activeRequests", icon: Clock, value: 2 },
        { key: "completedRequests", icon: Briefcase, value: Math.max(0, (u.requests ?? 0) - 2) },
        { key: "reviewsGiven", icon: Star, value: 5 },
    ],
    institutions: (u) => [
        { key: "tenders", icon: FileText, value: u.tenders ?? 0 },
        { key: "activeProjects", icon: Briefcase, value: u.activeProjects ?? 0 },
        { key: "completedProjects", icon: CircleCheck, value: 4 },
        { key: "offers", icon: Clock, value: 37 },
    ],
};

const REQUEST_STATUS_STYLES = {
    executing: "bg-[#FFFAE6] text-[#BF9900]",
    closed: "bg-[#EEF0F2] text-[#6B7280]",
};

/** "12 سنة" / "5 سنوات" / "سنة" (نفس منطق جدول المستخدمين) */
function yearsText(t, n) {
    if (n === 1) return t("usersPage.oneYear");
    if (n >= 3 && n <= 10) return t("usersPage.years_few", { count: n });
    return t("usersPage.years", { count: n });
}

/** صفحة تفاصيل المستخدم بلوحة الأدمن (/dashboard/admin/users/:userId) */
export default function AdminUserDetails() {
    const { t, i18n } = useTranslation("adminDashboard");
    const navigate = useNavigate();
    const { userId } = useParams();
    const found = findUser(userId);
    const locale = `${i18n.language}-u-nu-latn`;
    const d = "usersPage.details";

    // ⚠️ الإيقاف/التفعيل بالصفحة بس لحد ما يصير في endpoint
    const [status, setStatus] = useState(found?.user.status);
    const [confirming, setConfirming] = useState(false);
    const [flash, setFlash] = useState("");
    const [events, setEvents] = useState([]);

    if (!found) {
        return (
            <div className={`${card} mx-auto max-w-[1100px] p-10 text-center`}>
                <p className="text-[15px] font-bold text-[#414141]">{t(`${d}.notFound`)}</p>
                <Link to={`${BASE}/users`} className="mt-4 inline-block text-[13px] text-[#4B9AD2] hover:underline">
                    {t(`${d}.breadcrumb`)}
                </Link>
            </div>
        );
    }

    const { user, type, index } = found;
    const s = `usersPage.sample.${user.id}`;
    const name = t(`${s}.name`);
    const fieldText = t(`${s}.field`, { defaultValue: "" });
    const area = t(`${s}.area`);
    const code = `A-${502 + index}`;
    const date = (iso, opts = { day: "numeric", month: "long", year: "numeric" }) => new Date(iso).toLocaleDateString(locale, opts);
    const suspended = status === "suspended";
    const activeStatus = type === "craftsmen" || type === "contractors" ? "available" : "active";

    const subtitle = [
        t(`${d}.providerTypes.${type}`),
        fieldText,
        area,
        t(`${d}.memberSince`, { date: date(MEMBER_SINCE, { month: "long", year: "numeric" }) }),
        code,
    ].filter(Boolean);

    const account = [
        { key: "phone", value: user.phone ? user.phone.replace(/^(\d{4})(\d{3})(\d{3})$/, "$1-$2-$3") : "0599-731-204", ltr: true },
        { key: "email", value: `${user.id}.sanaa@gmail.com`, ltr: true },
        { key: "providerType", value: type === "customers" ? "" : t(`${d}.providerTypes.${type}`) },
        { key: "specialty", value: fieldText },
        { key: "area", value: area },
        { key: "verifiedAt", value: user.verification === "verified" ? date(VERIFIED_AT) : "" },
        { key: "lastActive", value: t(`${d}.lastActiveDefault`) },
    ].filter((row) => row.value);

    // سجل الحالة: الأحداث الجديدة (إيقاف/تفعيل) فوق، وبعدها التاريخ الثابت
    const history = [
        ...events,
        ...(user.verification === "verified" ? [{ id: "verified", text: t(`${d}.history.verified`, { by: t(`${d}.verifier`) }), date: date(VERIFIED_AT), dot: "#2EC65A" }] : []),
        { id: "documents", text: t(`${d}.history.documents`), date: date(MEMBER_SINCE), dot: "#4B9AD2" },
        { id: "created", text: t(`${d}.history.created`), date: date(MEMBER_SINCE), dot: "#9AA3AB" },
    ];

    // reason: سبب الإيقاف (بيظهر بسجل الحالة)
    const toggleStatus = (next, reason) => {
        setStatus(next);
        setConfirming(false);
        const isSuspend = next === "suspended";
        setFlash(t(`${d}.${isSuspend ? "suspendedMsg" : "activatedMsg"}`, { name }));
        setEvents((list) => [
            {
                id: `e-${Date.now()}`,
                text:
                    t(`${d}.history.${isSuspend ? "suspended" : "activated"}`, { by: t(`${d}.verifier`) }) +
                    (reason ? ` (${t(`usersPage.suspendModal.reasons.${reason}`)})` : ""),
                date: t(`${d}.today`),
                dot: isSuspend ? "#D64545" : "#2EC65A",
            },
            ...list,
        ]);
    };

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-5">
            {/* مسار الصفحة */}
            <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#89949D]">
                <Link to={`${BASE}/users`} className="text-[#4B9AD2] hover:underline">{t(`${d}.breadcrumb`)}</Link>
                <span aria-hidden="true">/</span>
                <Link to={`${BASE}/users?tab=${type}`} className="text-[#4B9AD2] hover:underline">{t(`usersPage.tabs.${type}`)}</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page" className="text-[#575757]">{name}</span>
            </nav>

            {/* رأس الصفحة */}
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EAF3FB] text-[18px] font-bold text-[#4B9AD2]">
                        {name.trim().charAt(0)}
                    </span>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-[20px] font-bold text-[#141415]">{name}</h1>
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${VERIFICATION_STYLES[user.verification]}`}>
                                {t(`usersPage.verification.${user.verification}`)}
                            </span>
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[status]}`}>
                                {t(`usersPage.statuses.${status}`)}
                            </span>
                        </div>
                        <p className="mt-1 text-[11px] text-[#575757]">{subtitle.join(" · ")}</p>
                    </div>
                </div>
                <div className="flex shrink-0 gap-3">
                    {suspended ? (
                        <button
                            type="button"
                            onClick={() => toggleStatus(activeStatus)}
                            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-[#9FD9B2] px-5 text-[12px] font-medium text-[#2EAF4E] transition-colors hover:bg-[#EEFAF2]"
                        >
                            <CircleCheck size={15} />
                            {t(`${d}.activate`)}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setConfirming(true)}
                            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-[#E8A5AB] px-5 text-[12px] font-medium text-[#D64545] transition-colors hover:bg-[#FFF6F6]"
                        >
                            <Ban size={15} />
                            {t(`${d}.suspend`)}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => navigate(`${BASE}/chats`)}
                        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-[#8EC0E4] px-5 text-[12px] font-medium text-[#4B9AD2] btn-wipe btn-wipe-outline"
                    >
                        <MessageSquare size={15} />
                        {t(`${d}.message`)}
                    </button>
                </div>
            </header>

            {confirming && (
                <SuspendModal
                    name={name}
                    onClose={() => setConfirming(false)}
                    onConfirm={({ reason }) => toggleStatus("suspended", reason)}
                />
            )}
            {flash && (
                <p role="status" className="rounded-lg border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-3 text-[13px] text-[#2E9E5B]">
                    {flash}
                </p>
            )}

            {/* الإحصائيات */}
            <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {STAT_SETS[type](user).map(({ key, icon: Icon, value, years, note }) => (
                    <li key={key} className={`${card} px-5 py-4`}>
                        <p className="flex items-center gap-2.5 text-[12px] text-[#575757]">
                            {t(`${d}.stats.${key}`)}
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF3FB] text-[#4B9AD2]">
                                <Icon size={15} />
                            </span>
                        </p>
                        <p className="mt-3 text-[24px] font-bold text-[#414141] tabular-nums">{years ? yearsText(t, value) : value}</p>
                        {note && <p className="mt-2 text-[10px] text-[#575757]">{t(`${d}.stats.${note[0]}`, note[1])}</p>}
                    </li>
                ))}
            </ul>

            <div className="grid items-start gap-5 lg:grid-cols-[1fr_300px]">
                <div className="flex min-w-0 flex-col gap-5">
                    {/* آخر الطلبات المسندة */}
                    <section className={`${card} p-5`}>
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-[14px] font-bold text-[#141415]">{t(`${d}.latestTitle`)}</h2>
                            <Link to={`${BASE}/requests`} className="text-[11px] text-[#4B9AD2] hover:underline">{t(`${d}.viewAll`)}</Link>
                        </div>
                        <ul className="mt-3 divide-y divide-[#0000000F] border-t border-[#0000000F]">
                            {REQUESTS.map((id) => {
                                const r = `${d}.requests.${id}`;
                                const st = t(`${r}.status`);
                                return (
                                    <li key={id} className="flex items-center justify-between gap-3 py-4">
                                        <div className="min-w-0">
                                            <p className="text-[12px] font-semibold text-[#141415]">{t(`${r}.title`)}</p>
                                            <p className="mt-1 text-[10px] text-[#89949D]">
                                                {t(`${r}.place`)} · {t(`${r}.time`)} · <bdi dir="ltr">{t(`${r}.ref`)}</bdi>
                                            </p>
                                        </div>
                                        <span className={`shrink-0 rounded-full px-3 py-0.5 text-[10px] font-medium ${REQUEST_STATUS_STYLES[st]}`}>
                                            {t(`${d}.requestStatus.${st}`)}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    {/* سجل الحالة */}
                    <section className={`${card} p-5`}>
                        <h2 className="text-[14px] font-bold text-[#141415]">{t(`${d}.historyTitle`)}</h2>
                        <ol className="mt-4 flex flex-col gap-5">
                            {history.map((h) => (
                                <li key={h.id} className="flex items-start gap-3">
                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: h.dot }} aria-hidden="true" />
                                    <div>
                                        <p className="text-[12px] text-[#141415]">{h.text}</p>
                                        <p className="mt-0.5 text-[10px] text-[#89949D]">{h.date}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </section>
                </div>

                {/* بيانات الحساب */}
                <aside className={`${card} p-5`}>
                    <h2 className="text-[14px] font-bold text-[#141415]">{t(`${d}.accountTitle`)}</h2>
                    <dl className="mt-4 flex flex-col gap-4 text-[11px]">
                        {account.map((row) => (
                            <div key={row.key} className="flex items-center justify-between gap-3">
                                <dt className="text-[#575757]">{t(`${d}.account.${row.key}`)}</dt>
                                <dd className="truncate font-medium text-[#141415]" dir={row.ltr ? "ltr" : undefined}>{row.value}</dd>
                            </div>
                        ))}
                    </dl>
                </aside>
            </div>
        </div>
    );
}
