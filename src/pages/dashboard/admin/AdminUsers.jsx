import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Ban, ChevronDown, CircleAlert, CircleCheck, Ellipsis, Eye, Info, LayoutGrid, MessageSquare, RotateCw, Search, ShieldCheck, Star, WifiOff, X } from "lucide-react";

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

// ==================== بيانات المستخدمين ====================

// ===== بيانات تجريبية =====
// الباك إند لسا ما فيه endpoints لإدارة المستخدمين. لما تجهز، استبدلي USERS بطلب من src/api/endpoints.js
// النصوص (الاسم، المجال، المنطقة) بملف الترجمة: usersPage.sample.<id>
export const USERS = {
    craftsmen: [
        { id: "c1", years: 12, rating: 4.9, completed: 21, verification: "verified", status: "available" },
        { id: "c2", years: 5, rating: 4.9, completed: 1, verification: "verified", status: "available" },
        { id: "c3", years: 1, rating: 4.9, completed: 33, verification: "verified", status: "available" },
        { id: "c4", years: 10, rating: 4.7, completed: 18, verification: "pending", status: "busy" },
        { id: "c5", years: 7, rating: 4.2, completed: 6, verification: "unverified", status: "available" },
    ],
    customers: [
        { id: "u1", phone: "0595289936", requests: 21, joined: "2026-10-05", lastActiveHours: 5, verification: "verified", status: "active" },
        { id: "u2", phone: "0598741203", requests: 1, joined: "2026-11-03", lastActiveHours: 5, verification: "verified", status: "active" },
        { id: "u3", phone: "0592360418", requests: 33, joined: "2026-12-09", lastActiveHours: 5, verification: "verified", status: "active" },
        { id: "u4", phone: "0567712094", requests: 2, joined: "2026-10-01", lastActiveHours: 26, verification: "pending", status: "active" },
    ],
    contractors: [
        { id: "k1", workers: 21, activeProjects: 3, licenses: 0, verification: "verified", status: "available" },
        { id: "k2", workers: 1, activeProjects: 5, licenses: 0, verification: "verified", status: "available" },
        { id: "k3", workers: 33, activeProjects: 9, licenses: 0, verification: "verified", status: "available" },
    ],
    institutions: [
        { id: "i1", tenders: 21, activeProjects: 3, verification: "verified", status: "active" },
        { id: "i2", tenders: 1, activeProjects: 5, verification: "verified", status: "active" },
        { id: "i3", tenders: 33, activeProjects: 9, verification: "verified", status: "active" },
    ],
};

export const USER_TABS = ["craftsmen", "customers", "contractors", "institutions"];

export const VERIFICATION_STYLES = {
    verified: "bg-[#DDF6E3] text-[#2EAF4E]",
    pending: "bg-[#FDEBD3] text-[#D9822B]",
    unverified: "bg-[#EEF0F2] text-[#6B7280]",
};

export const STATUS_STYLES = {
    available: "bg-[#DDF6E3] text-[#2EAF4E]",
    active: "bg-[#DDF6E3] text-[#2EAF4E]",
    busy: "bg-[#DCEBFA] text-[#4B9AD2]",
    suspended: "bg-[#FDE2E2] text-[#D64545]",
};

/** المستخدم + نوع حسابه (التبويب اللي هو فيه) من رقمه */
export function findUser(id) {
    for (const type of USER_TABS) {
        const index = USERS[type].findIndex((u) => u.id === id);
        if (index !== -1) return { user: USERS[type][index], type, index };
    }
    return null;
}

// ==================== نافذة إيقاف الحساب ====================

const SUSPEND_DETAILS_MAX = 500;
const SUSPEND_REASONS = ["complaints", "terms", "documents", "suspicious", "userRequest", "other"];

/**
 * نافذة "إيقاف حساب": سبب الإيقاف + تفاصيله + إشعار المستخدم.
 * onConfirm({ reason, details, notify }) — reason: مفتاح السبب
 */
export function SuspendModal({ name, onConfirm, onClose }) {
    const { t } = useTranslation("adminDashboard");
    const m = "usersPage.suspendModal";
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [notify, setNotify] = useState(true);
    const [errors, setErrors] = useState({});
    const selectRef = useRef(null);
    const closeRef = useRef(onClose);
    useEffect(() => {
        closeRef.current = onClose;
    }, [onClose]);

    // مرة وحدة عند الفتح: Escape بيسكر النافذة، والصفحة اللي وراها ما بتتمرر
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && closeRef.current();
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        selectRef.current?.focus();
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        const next = {
            reason: reason ? "" : t(`${m}.reasonRequired`),
            details: details.trim() ? "" : t(`${m}.detailsRequired`),
        };
        setErrors(next);
        if (next.reason || next.details) return;
        onConfirm({ reason, details: details.trim(), notify });
    };

    const box = "w-full rounded-xl border bg-white text-[13px] text-[#414141] outline-none transition-colors focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#141415]/40 p-4 backdrop-blur-[2px]"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="suspend-title"
                onSubmit={submit}
                noValidate
                className="flex max-h-[92vh] w-full max-w-[430px] flex-col overflow-y-auto rounded-[20px] bg-white p-6 shadow-[0_24px_60px_rgba(20,20,21,0.25)]"
            >
                <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FDE4E4] text-[#D64545]">
                        <Ban size={22} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h2 id="suspend-title" className="text-[17px] font-bold text-[#141415]">{t(`${m}.title`, { name })}</h2>
                        <p className="mt-1.5 text-[11px] leading-[1.9] text-[#575757]">{t(`${m}.desc`)}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t(`${m}.close`)}
                        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#575757] hover:bg-[#F2F4F6]"
                    >
                        <X size={17} />
                    </button>
                </div>

                <label htmlFor="suspend-reason" className="mb-2 mt-6 block text-[12px] text-[#414141]">
                    {t(`${m}.reason`)} <span className="text-[#D64545]">*</span>
                </label>
                <div className="relative">
                    <select
                        id="suspend-reason"
                        ref={selectRef}
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value);
                            setErrors((er) => ({ ...er, reason: "" }));
                        }}
                        aria-invalid={!!errors.reason}
                        className={`${box} h-11 cursor-pointer appearance-none pe-10 ps-4 ${reason ? "" : "text-[#89949D]"} ${errors.reason ? "border-red-400" : "border-[#8EC0E4]"}`}
                    >
                        <option value="" disabled>{t(`${m}.reasonPlaceholder`)}</option>
                        {SUSPEND_REASONS.map((key) => (
                            <option key={key} value={key} className="text-[#414141]">
                                {t(`${m}.reasons.${key}`)}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={17} className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                </div>
                {errors.reason && <p className="mt-1 text-[11px] text-red-500">{errors.reason}</p>}

                <label htmlFor="suspend-details" className="mb-2 mt-5 block text-[12px] text-[#414141]">
                    {t(`${m}.details`)} <span className="text-[#D64545]">*</span>
                </label>
                <div className={`${box} px-4 pb-1.5 pt-3 focus-within:border-[#4B9AD2] focus-within:ring-1 focus-within:ring-[#4B9AD2] ${errors.details ? "border-red-400" : "border-[#8EC0E4]"}`}>
                    <textarea
                        id="suspend-details"
                        rows={2}
                        maxLength={SUSPEND_DETAILS_MAX}
                        value={details}
                        onChange={(e) => {
                            setDetails(e.target.value);
                            setErrors((er) => ({ ...er, details: "" }));
                        }}
                        aria-invalid={!!errors.details}
                        placeholder={t(`${m}.detailsPlaceholder`)}
                        className="w-full resize-none bg-transparent leading-[1.8] outline-none placeholder:text-[#89949D]"
                    />
                    <p className="text-end text-[9px] text-[#89949D] tabular-nums" dir="ltr">
                        {details.length} / {SUSPEND_DETAILS_MAX}
                    </p>
                </div>
                {errors.details && <p className="mt-1 text-[11px] text-red-500">{errors.details}</p>}

                <label className="mt-5 flex cursor-pointer items-center gap-2 text-[12px] text-[#414141]">
                    <input
                        type="checkbox"
                        checked={notify}
                        onChange={(e) => setNotify(e.target.checked)}
                        className="h-4 w-4 cursor-pointer accent-[#4B9AD2]"
                    />
                    {t(`${m}.notify`)}
                </label>

                <p className="mt-5 flex items-center gap-2 rounded-lg bg-[#FDECEC] px-4 py-3 text-[11px] text-[#D64545]">
                    <CircleAlert size={15} className="shrink-0" />
                    {t(`${m}.warning`)}
                </p>

                <div className="mt-5 flex gap-3">
                    <button
                        type="submit"
                        className="h-11 flex-1 cursor-pointer rounded-xl bg-[#C62828] text-[13px] font-semibold text-white transition-colors hover:bg-[#A82020]"
                    >
                        {t(`${m}.submit`)}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 flex-1 cursor-pointer rounded-xl bg-[#F2F4F6] text-[13px] font-semibold text-[#414141] transition-colors hover:bg-[#E6E9EC]"
                    >
                        {t(`${m}.cancel`)}
                    </button>
                </div>
            </form>
        </div>
    );
}

// اسم مختصر للتبويبات داخل الصفحة
const TABS = USER_TABS;

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
