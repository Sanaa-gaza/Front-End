import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Ban, ChevronDown, CircleCheck, Ellipsis, Eye, Info, LayoutGrid, MessageSquare, RotateCw, Search, ShieldCheck, Star, WifiOff, X } from "lucide-react";
import { STATUS_STYLES, USERS, USER_TABS as TABS, VERIFICATION_STYLES } from "./usersData";
import SuspendModal from "./SuspendModal";

const BASE = "/dashboard/admin";

// عدد التسجيلات الجديدة بكل تبويب (الشارة جنب اسم التبويب)
const NEW_COUNTS = { customers: 4 };


// أعمدة كل تبويب (بعد عمود الاسم، وقبل التوثيق والحالة)
const COLUMNS = {
    craftsmen: ["field", "area", "experience", "rating", "completed"],
    contractors: ["area", "specialty", "workers", "activeProjects", "licenses"],
    customers: ["phone", "area", "joined", "requests", "lastActive"],
    institutions: ["area", "sector", "tenders", "activeProjects"],
};

// تبويبات بدون عمود "الحالة" بالتصميم (الحالة لسا بتشتغل بالفلتر وبالإيقاف)
const HIDE_STATUS = ["customers", "contractors", "institutions"];

const STATUSES = ["available", "busy", "active", "suspended"];

const field =
    "h-12 w-full rounded-xl border border-[#8EC0E4] bg-white text-[12px] text-[#414141] outline-none transition-colors focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";

/** "12 سنة" / "5 سنوات" / "سنة" */
function yearsText(t, n) {
    if (n === 1) return t("usersPage.oneYear");
    if (n >= 3 && n <= 10) return t("usersPage.years_few", { count: n });
    return t("usersPage.years", { count: n });
}

/** قائمة إجراءات المستخدم — بتنفتح بمكان ثابت تحت زر "..." عشان ما تنقص بحاوية الجدول */
function ActionsMenu({ anchor, user, name, onAction, onClose }) {
    const { t } = useTranslation("adminDashboard");
    const ref = useRef(null);
    const rect = anchor.getBoundingClientRect();

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        const onDown = (e) => !ref.current?.contains(e.target) && !anchor.contains(e.target) && onClose();
        window.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onDown);
        // التمرير أو تغيير الحجم بيحرّك الزر، فبنسكر القائمة
        window.addEventListener("scroll", onClose, true);
        window.addEventListener("resize", onClose);
        ref.current?.querySelector("button")?.focus();
        return () => {
            window.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onDown);
            window.removeEventListener("scroll", onClose, true);
            window.removeEventListener("resize", onClose);
        };
    }, [anchor, onClose]);

    const suspended = user.status === "suspended";
    const items = [
        { key: "details", icon: Eye },
        { key: "review", icon: ShieldCheck },
        { key: "message", icon: MessageSquare },
        { key: "requestInfo", icon: Info },
    ];
    const item = "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-[12px] text-[#414141] hover:bg-[#EEF5FC]";

    return (
        <div
            ref={ref}
            role="menu"
            aria-label={t("usersPage.menu.open", { name })}
            style={{ top: rect.bottom + 6, left: Math.max(8, Math.min(rect.left - 4, window.innerWidth - 150)) }}
            className="fixed z-50 w-[142px] rounded-xl border border-[#0000000D] bg-white p-1.5 shadow-[0_10px_30px_rgba(35,74,100,0.18)]"
        >
            {items.map(({ key, icon: Icon }) => (
                <button key={key} type="button" role="menuitem" onClick={() => onAction(key)} className={item}>
                    <Icon size={15} className="shrink-0 text-[#4B9AD2]" />
                    {t(`usersPage.menu.${key}`)}
                </button>
            ))}
            <hr className="my-1 border-[#0000000F]" />
            <button
                type="button"
                role="menuitem"
                onClick={() => onAction(suspended ? "activate" : "suspend")}
                className={`${item} ${suspended ? "" : "text-[#D64545] hover:bg-[#FFF3F3]"}`}
            >
                {suspended ? <CircleCheck size={15} className="shrink-0 text-[#2EAF4E]" /> : <Ban size={15} className="shrink-0 text-[#D64545]" />}
                {t(suspended ? "usersPage.menu.activate" : "usersPage.menu.suspend")}
            </button>
        </div>
    );
}

/**
 * حالة الاتصال بالإنترنت (بتتحدث لحالها لما ينقطع أو يرجع الاتصال).
 * ⚠️ لما تصير القائمة من السيرفر، فشل الطلب كمان لازم يعرض نفس رسالة الخطأ (loadError).
 */
function useOnline() {
    const [online, setOnline] = useState(() => navigator.onLine);
    useEffect(() => {
        const up = () => setOnline(true);
        const down = () => setOnline(false);
        window.addEventListener("online", up);
        window.addEventListener("offline", down);
        return () => {
            window.removeEventListener("online", up);
            window.removeEventListener("offline", down);
        };
    }, []);
    return [online, setOnline];
}

/** رسالة "تعذّر تحميل القائمة" مع زر إعادة المحاولة */
function LoadError({ tab, retrying, onRetry }) {
    const { t } = useTranslation("adminDashboard");
    return (
        <div role="alert" className="flex flex-col items-center px-6 py-14 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FDE4E4] text-[#B42318]">
                <WifiOff size={28} strokeWidth={1.6} />
            </span>
            <h2 className="mt-5 text-[16px] font-bold text-[#141415]">{t("usersPage.loadError.title", { list: t(`usersPage.loadError.lists.${tab}`) })}</h2>
            <p className="mt-3 text-[11px] text-[#575757]">{t("usersPage.loadError.desc")}</p>
            <button
                type="button"
                onClick={onRetry}
                disabled={retrying}
                className="mt-6 inline-flex cursor-pointer items-center gap-1.5 text-[12px] font-medium text-[#4B9AD2] hover:underline disabled:cursor-wait disabled:opacity-60"
            >
                <RotateCw size={14} className={retrying ? "animate-spin" : ""} />
                {retrying ? t("usersPage.loadError.retrying") : t("usersPage.loadError.retry")}
            </button>
        </div>
    );
}

/** رسالة "لا توجد نتائج" — مع كلمة البحث لو موجودة */
function NoResults({ tab, query }) {
    const { t } = useTranslation("adminDashboard");
    const who = t(`usersPage.noResults.who.${tab}`);
    return (
        <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF5FC] text-[#4B9AD2]">
                <Search size={26} strokeWidth={1.6} />
            </span>
            <h2 className="mt-5 text-[16px] font-bold text-[#141415]">{t("usersPage.noResults.title")}</h2>
            <p className="mt-3 text-[11px] text-[#575757]">
                {query ? t("usersPage.noResults.withQuery", { who, query }) : t("usersPage.noResults.filtersOnly", { who })}
            </p>
        </div>
    );
}

/** إدارة المستخدمين: تبويب لكل نوع حساب + بحث وفلتر حالة + جدول بقائمة إجراءات لكل مستخدم */
export default function AdminUsers() {
    const { t, i18n } = useTranslation("adminDashboard");
    const navigate = useNavigate();
    const locale = `${i18n.language}-u-nu-latn`;
    // التبويب ممكن ييجي من الرابط (?tab=customers) — مثلاً من مسار الصفحة بتفاصيل المستخدم
    const [searchParams] = useSearchParams();
    const [tab, setTab] = useState(() => (TABS.includes(searchParams.get("tab")) ? searchParams.get("tab") : "craftsmen"));
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("all");
    // { id, anchor } للقائمة المفتوحة
    const [menu, setMenu] = useState(null);
    const [confirming, setConfirming] = useState(null);
    const [flash, setFlash] = useState("");
    // ⚠️ تغييرات الحالة بالصفحة بس لحد ما يصير في endpoint
    const [statusChanges, setStatusChanges] = useState({});

    const name = (id) => t(`usersPage.sample.${id}.name`);
    const [online, setOnline] = useOnline();
    const [retrying, setRetrying] = useState(false);

    // إعادة المحاولة: بنفحص الاتصال من جديد (لما يصير في API بنعيد الطلب هون)
    const retry = () => {
        setRetrying(true);
        setTimeout(() => {
            setOnline(navigator.onLine);
            setRetrying(false);
        }, 800);
    };

    const q = query.trim().toLowerCase();
    const rows = USERS[tab]
        .map((u) => (statusChanges[u.id] ? { ...u, status: statusChanges[u.id] } : u))
        .filter((u) => (status === "all" || u.status === status) && (!q || name(u.id).toLowerCase().includes(q)));

    // ثابتة بين الرندرات عشان القائمة ما تعيد تسجيل الأحداث كل مرة
    const closeMenu = useCallback(() => setMenu(null), []);

    const handleAction = (user, action) => {
        setMenu(null);
        setFlash("");
        if (action === "details") navigate(`${BASE}/users/${user.id}`);
        else if (action === "review") navigate(`${BASE}/verification`);
        else if (action === "message") navigate(`${BASE}/chats`);
        else if (action === "requestInfo") setFlash(t("usersPage.infoRequested", { name: name(user.id) }));
        else if (action === "suspend") setConfirming(user);
        else if (action === "activate") {
            setStatusChanges((c) => ({ ...c, [user.id]: tab === "craftsmen" || tab === "contractors" ? "available" : "active" }));
            setFlash(t("usersPage.activated", { name: name(user.id) }));
        }
    };

    const cell = (u, col) => {
        const s = `usersPage.sample.${u.id}`;
        switch (col) {
            case "field":
            case "specialty":
            case "sector":
                return t(`${s}.field`);
            case "area":
                return t(`${s}.area`);
            case "experience":
                return yearsText(t, u.years);
            case "rating":
                return (
                    <span className="inline-flex items-center gap-1 font-semibold text-[#141415] tabular-nums">
                        <Star size={12} className="text-[#F5B400]" fill="currentColor" />
                        {u.rating}
                    </span>
                );
            case "joined":
                return new Date(u.joined).toLocaleDateString(locale, tab === "customers" ? { day: "numeric", month: "long" } : { day: "numeric", month: "short", year: "numeric" });
            case "phone":
                return <bdi dir="ltr" className="tabular-nums">{u.phone}</bdi>;
            case "lastActive":
                return u.lastActiveHours < 24
                    ? t("usersPage.hoursAgo", { count: u.lastActiveHours })
                    : t("usersPage.daysAgo", { count: Math.round(u.lastActiveHours / 24) });
            default:
                return <span className="tabular-nums">{u[col]}</span>;
        }
    };

    const columns = COLUMNS[tab];
    const showStatus = !HIDE_STATUS.includes(tab);
    const openUser = menu && rows.find((u) => u.id === menu.id);

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
            {/* البحث + فلتر الحالة */}
            <div className="flex flex-col gap-3 md:flex-row">
                <label className="relative block min-w-0 flex-1">
                    <Search size={16} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t("usersPage.search")}
                        aria-label={t("usersPage.search")}
                        className={`${field} pe-10 ps-10 placeholder:text-[#89949D] [&::-webkit-search-cancel-button]:hidden`}
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery("")}
                            aria-label={t("usersPage.clearSearch")}
                            className="absolute end-3 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#575757] hover:bg-[#EEF5FC]"
                        >
                            <X size={15} />
                        </button>
                    )}
                </label>
                <div className="relative md:w-[270px]">
                    <LayoutGrid size={15} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        aria-label={t("usersPage.status")}
                        className={`${field} cursor-pointer appearance-none pe-10 ps-10 ${status === "all" ? "text-[#89949D]" : ""}`}
                    >
                        <option value="all">{t("usersPage.status")}</option>
                        {STATUSES.map((st) => (
                            <option key={st} value={st} className="text-[#414141]">
                                {t(`usersPage.statuses.${st}`)}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={18} className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                </div>
            </div>

            {/* أنواع الحسابات */}
            <div role="tablist" className="flex flex-wrap gap-3">
                {TABS.map((key) => {
                    const active = tab === key;
                    return (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => {
                                setTab(key);
                                setMenu(null);
                                setFlash("");
                            }}
                            className={`flex h-10 cursor-pointer items-center gap-2 rounded-xl px-5 text-[13px] font-semibold transition-colors ${active
                                ? "bg-[#4B9AD2] text-white shadow-[0_4px_12px_rgba(75,154,210,0.3)]"
                                : "border border-[#CFE3F3] bg-[#EEF5FC] text-[#4B9AD2] hover:border-[#8EC0E4]"
                                }`}
                        >
                            {t(`usersPage.tabs.${key}`)}
                            {NEW_COUNTS[key] > 0 && (
                                <span
                                    title={t("usersPage.newBadge", { count: NEW_COUNTS[key] })}
                                    className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] tabular-nums ${active ? "bg-white/25 text-white" : "bg-[#CFE3F3] text-[#286292]"
                                        }`}
                                >
                                    {NEW_COUNTS[key]}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {flash && (
                <p role="status" className="rounded-lg border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-3 text-[13px] text-[#2E9E5B]">
                    {flash}
                </p>
            )}

            {/* الجدول (أو رسالة الخطأ لو ما في اتصال) */}
            <section className="overflow-hidden rounded-[20px] border border-[#0000000D] bg-white shadow-[0_4px_24px_rgba(35,74,100,0.08)]">
                {!online ? (
                    <LoadError tab={tab} retrying={retrying} onRetry={retry} />
                ) : rows.length === 0 ? (
                    <NoResults tab={tab} query={query.trim()} />
                ) : (
                <>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-[12px]">
                        <thead>
                            <tr className="border-b border-[#0000002E] text-[13px] text-[#4B9AD2]">
                                <th className="px-4 pb-4 pt-6 text-start font-bold first:ps-6">{t(`usersPage.columns.name.${tab}`)}</th>
                                {columns.map((c) => (
                                    <th key={c} className="px-3 pb-4 pt-6 text-center font-bold">{t(`usersPage.columns.${c}`)}</th>
                                ))}
                                <th className="px-3 pb-4 pt-6 text-center font-bold">
                                    {t(tab === "customers" ? "usersPage.columns.verificationShort" : "usersPage.columns.verification")}
                                </th>
                                {showStatus && <th className="px-3 pb-4 pt-6 text-center font-bold">{t("usersPage.columns.state")}</th>}
                                <th className="px-5 pb-4 pt-6">
                                    <span className="sr-only">{t("usersPage.columns.actions")}</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((u) => (
                                <tr key={u.id} className="transition-colors hover:bg-[#F7FAFD]">
                                    <td className="px-4 py-3.5 ps-6 text-[13px] font-bold text-[#141415]">
                                        {name(u.id)}
                                        {!showStatus && u.status === "suspended" && (
                                            <span className={`ms-2 inline-block rounded-full px-2 py-0.5 align-middle text-[9px] font-medium ${STATUS_STYLES.suspended}`}>
                                                {t("usersPage.statuses.suspended")}
                                            </span>
                                        )}
                                    </td>
                                    {columns.map((c) => (
                                        <td key={c} className="px-3 py-3.5 text-center text-[#414141]">{cell(u, c)}</td>
                                    ))}
                                    <td className="px-3 py-3.5 text-center">
                                        <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[9px] font-medium ${VERIFICATION_STYLES[u.verification]}`}>
                                            {t(`usersPage.verification.${u.verification}`)}
                                        </span>
                                    </td>
                                    {showStatus && (
                                        <td className="px-3 py-3.5 text-center">
                                            <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[9px] font-medium ${STATUS_STYLES[u.status]}`}>
                                                {t(`usersPage.statuses.${u.status}`)}
                                            </span>
                                        </td>
                                    )}
                                    <td className="px-5 py-3.5 text-end">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                const anchor = e.currentTarget;
                                                setMenu((m) => (m?.id === u.id ? null : { id: u.id, anchor }));
                                            }}
                                            aria-haspopup="menu"
                                            aria-expanded={menu?.id === u.id}
                                            aria-label={t("usersPage.menu.open", { name: name(u.id) })}
                                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#4B9AD2] hover:bg-[#EEF5FC]"
                                        >
                                            <Ellipsis size={20} strokeWidth={2.5} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                </>
                )}
            </section>

            {confirming && (
                <SuspendModal
                    name={name(confirming.id)}
                    onClose={() => setConfirming(null)}
                    onConfirm={() => {
                        setStatusChanges((c) => ({ ...c, [confirming.id]: "suspended" }));
                        setFlash(t("usersPage.suspended", { name: name(confirming.id) }));
                        setConfirming(null);
                    }}
                />
            )}

            {openUser && (
                <ActionsMenu
                    anchor={menu.anchor}
                    user={openUser}
                    name={name(openUser.id)}
                    onAction={(action) => handleAction(openUser, action)}
                    onClose={closeMenu}
                />
            )}
        </div>
    );
}
