import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Ban, ChevronDown, CircleCheck, Ellipsis, Eye, Hourglass, LayoutGrid, Search, UserRoundPlus, X } from "lucide-react";

const BASE = "/dashboard/admin";

const TABS = ["all", "new", "reviewing", "assigned", "closed", "rejected"];
const field =
    "h-12 w-full rounded-xl border border-[#8EC0E4] bg-white text-[12px] text-[#414141] outline-none transition-colors focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";

/** قائمة إجراءات الطلب — بمكان ثابت تحت زر "..." عشان ما تنقص بحاوية الجدول */
function ActionsMenu({ anchor, request, label, onAction, onClose }) {
    const { t } = useTranslation("adminDashboard");
    const ref = useRef(null);
    const rect = anchor.getBoundingClientRect();

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        const onDown = (e) => !ref.current?.contains(e.target) && !anchor.contains(e.target) && onClose();
        window.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onDown);
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

    // الإجراءات المتاحة حسب حالة الطلب
    const finished = request.status === "closed" || request.status === "rejected";
    const items = [
        { key: "details", icon: Eye, show: true },
        { key: "assign", icon: UserRoundPlus, show: !finished },
        { key: "review", icon: Hourglass, show: request.status === "new" },
        { key: "close", icon: CircleCheck, show: !finished },
    ].filter((i) => i.show);
    const item = "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-[12px] text-[#414141] hover:bg-[#EEF5FC]";

    return (
        <div
            ref={ref}
            role="menu"
            aria-label={label}
            style={{ top: rect.bottom + 6, left: Math.max(8, Math.min(rect.left - 4, window.innerWidth - 170)) }}
            className="fixed z-50 w-[160px] rounded-xl border border-[#0000000D] bg-white p-1.5 shadow-[0_10px_30px_rgba(35,74,100,0.18)]"
        >
            {items.map(({ key, icon: Icon }) => (
                <button key={key} type="button" role="menuitem" onClick={() => onAction(key)} className={item}>
                    <Icon size={15} className="shrink-0 text-[#4B9AD2]" />
                    {t(`requestsPage.menu.${key}`)}
                </button>
            ))}
            {!finished && (
                <>
                    <hr className="my-1 border-[#0000000F]" />
                    <button type="button" role="menuitem" onClick={() => onAction("reject")} className={`${item} text-[#D64545] hover:bg-[#FFF3F3]`}>
                        <Ban size={15} className="shrink-0 text-[#D64545]" />
                        {t("requestsPage.menu.reject")}
                    </button>
                </>
            )}
        </div>
    );
}

// ==================== بيانات الطلبات ====================

// ===== بيانات تجريبية =====
// الباك إند لسا ما فيه endpoint لطلبات الأدمن. لما يجهز، استبدلي REQUESTS بطلب من src/api/endpoints.js
// النصوص (العنوان، العميل، المنطقة، الوصف...) بملف الترجمة: requestsPage.sample.<id>
// owner: مفتاح موظف من requestsPage.staff — provider: رقم حرفي من usersData (مزود الخدمة المسند)
// photos: عدد الصور المرفقة، clientPhone/clientSince/clientCode/previous: بيانات العميل بصفحة التفاصيل
export const REQUESTS = [
    { id: "q1", ref: "M-4112", category: "plumbing", status: "assigned", owner: "s1", provider: "c4", lastActiveHours: 2, photos: 2, clientPhone: "0599-214-778", clientSince: "2026-08-01", clientCode: "A-517", previous: 2 },
    { id: "q2", ref: "M-4113", category: "painting", status: "new", owner: "", provider: "", lastActiveHours: 1, photos: 3, clientPhone: "0598-741-203", clientSince: "2026-05-02", clientCode: "A-518", previous: 1 },
    { id: "q3", ref: "M-4114", category: "plumbing", status: "reviewing", owner: "", provider: "", lastActiveHours: 5, photos: 1, clientPhone: "0592-360-418", clientSince: "2026-09-21", clientCode: "A-519", previous: 0 },
    { id: "q4", ref: "M-4115", category: "plumbing", status: "assigned", owner: "s2", provider: "c1", lastActiveHours: 8, photos: 3, clientPhone: "0567-712-094", clientSince: "2026-10-01", clientCode: "A-520", previous: 3 },
    { id: "q5", ref: "M-4116", category: "plumbing", status: "closed", owner: "s3", provider: "c4", lastActiveHours: 30, photos: 0, clientPhone: "0599-883-120", clientSince: "2026-02-14", clientCode: "A-521", previous: 5 },
    { id: "q6", ref: "M-4117", category: "plumbing", status: "closed", owner: "s4", provider: "c2", lastActiveHours: 52, photos: 2, clientPhone: "0597-440-916", clientSince: "2026-04-09", clientCode: "A-522", previous: 1 },
    { id: "q7", ref: "M-4118", category: "plumbing", status: "rejected", owner: "", provider: "", lastActiveHours: 75, photos: 1, clientPhone: "0595-102-337", clientSince: "2026-07-18", clientCode: "A-523", previous: 0 },
];

export const REQUEST_CATEGORIES = ["plumbing", "painting", "electrical", "carpentry"];

// المسؤولون عن الطلبات (موظفو الإدارة)
export const STAFF = ["s1", "s2", "s3", "s4"];

export const REQUEST_STATUS_STYLES = {
    new: "bg-[#DCEBFA] text-[#4B9AD2]",
    reviewing: "bg-[#FDEBD3] text-[#D9822B]",
    assigned: "bg-[#DDF6E3] text-[#2EAF4E]",
    closed: "bg-[#EEF0F2] text-[#6B7280]",
    rejected: "bg-[#FDE2E2] text-[#D64545]",
};

// ==================== نافذة الإسناد ====================

/**
 * نافذة إسناد عامة (لمسؤول من الفريق أو لمزود خدمة): ملخص + قائمة اختيار.
 * texts: { title, label, placeholder, required, submit, cancel }
 * options: [{ value, label }] — onConfirm(value)
 */
export function AssignModal({ summary, texts, options, onConfirm, onClose }) {
    const [value, setValue] = useState("");
    const [error, setError] = useState("");
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

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#141415]/40 p-4 backdrop-blur-[2px]"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="assign-title"
                noValidate
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!value) {
                        setError(texts.required);
                        return;
                    }
                    onConfirm(value);
                }}
                className="w-full max-w-[400px] rounded-[20px] border-t-4 border-[#BFDCF1] bg-white p-6 shadow-[0_24px_60px_rgba(20,20,21,0.25)]"
            >
                <h2 id="assign-title" className="text-[16px] font-bold text-[#22455E]">{texts.title}</h2>
                <p className="mt-3 rounded-xl bg-[#EEF5FC] px-4 py-3 text-[12px] font-bold text-[#141415]">{summary}</p>

                <label htmlFor="assign-value" className="mb-2 mt-5 block text-[12px] text-[#575757]">{texts.label}</label>
                <div className="relative">
                    <select
                        id="assign-value"
                        ref={selectRef}
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            setError("");
                        }}
                        aria-invalid={!!error}
                        className={`h-11 w-full cursor-pointer appearance-none rounded-xl border bg-white pe-10 ps-4 text-[12px] outline-none focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2] ${value ? "text-[#414141]" : "text-[#89949D]"
                            } ${error ? "border-red-400" : "border-[#8EC0E4]"}`}
                    >
                        <option value="" disabled>{texts.placeholder}</option>
                        {options.map((o) => (
                            <option key={o.value} value={o.value} className="text-[#414141]">{o.label}</option>
                        ))}
                    </select>
                    <ChevronDown size={17} className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                </div>
                {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}

                <div className="mt-6 flex gap-3">
                    <button type="submit" className="h-10 flex-1 cursor-pointer rounded-xl bg-[#4B9AD2] text-[13px] font-semibold text-white btn-wipe">
                        {texts.submit}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 flex-1 cursor-pointer rounded-xl bg-[#F2F4F6] text-[13px] font-semibold text-[#414141] hover:bg-[#E6E9EC]"
                    >
                        {texts.cancel}
                    </button>
                </div>
            </form>
        </div>
    );
}

// أسماء مختصرة داخل الصفحة
const CATEGORIES = REQUEST_CATEGORIES;
const STATUS_STYLES = REQUEST_STATUS_STYLES;

/** الطلبات الواردة: تبويبات حسب الحالة + بحث وفلتر تصنيف + جدول بقائمة إجراءات لكل طلب */
export default function AdminRequests() {
    const { t } = useTranslation("adminDashboard");
    const navigate = useNavigate();
    const [tab, setTab] = useState("all");
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("all");
    const [menu, setMenu] = useState(null);
    const [assigning, setAssigning] = useState(null);
    const [rejecting, setRejecting] = useState(null);
    const [flash, setFlash] = useState("");
    // ⚠️ التغييرات بالصفحة بس لحد ما يصير في endpoint: { [id]: { status, owner } }
    const [changes, setChanges] = useState({});

    const title = (id) => t(`requestsPage.sample.${id}.title`);
    const requests = REQUESTS.map((r) => ({ ...r, ...changes[r.id] }));

    const counts = { all: requests.length };
    requests.forEach((r) => {
        counts[r.status] = (counts[r.status] || 0) + 1;
    });

    const q = query.trim().toLowerCase();
    const rows = requests.filter(
        (r) =>
            (tab === "all" || r.status === tab) &&
            (category === "all" || r.category === category) &&
            (!q || title(r.id).toLowerCase().includes(q) || r.ref.toLowerCase().includes(q))
    );

    const closeMenu = useCallback(() => setMenu(null), []);
    const update = (id, patch, flashKey, extra = {}) => {
        setChanges((c) => ({ ...c, [id]: { ...c[id], ...patch } }));
        setFlash(t(`requestsPage.flash.${flashKey}`, { name: title(id), ...extra }));
    };

    const handleAction = (r, action) => {
        setMenu(null);
        setFlash("");
        if (action === "details") navigate(`${BASE}/requests/${r.id}`);
        else if (action === "assign") setAssigning(r);
        else if (action === "review") update(r.id, { status: "reviewing" }, "reviewing");
        else if (action === "close") update(r.id, { status: "closed" }, "closed");
        else if (action === "reject") setRejecting(r);
    };

    const lastActive = (h) => (h < 24 ? t("requestsPage.hoursAgo", { count: h }) : t("requestsPage.daysAgo", { count: Math.round(h / 24) }));
    const openRequest = menu && rows.find((r) => r.id === menu.id);
    const th = "px-3 pb-4 pt-6 text-center font-bold";

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
            {/* البحث + فلتر التصنيف */}
            <div className="flex flex-col gap-3 md:flex-row">
                <label className="relative block min-w-0 flex-1">
                    <Search size={16} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t("requestsPage.search")}
                        aria-label={t("requestsPage.search")}
                        className={`${field} pe-10 ps-10 placeholder:text-[#89949D] [&::-webkit-search-cancel-button]:hidden`}
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery("")}
                            aria-label={t("requestsPage.clearSearch")}
                            className="absolute end-3 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#575757] hover:bg-[#EEF5FC]"
                        >
                            <X size={15} />
                        </button>
                    )}
                </label>
                <div className="relative md:w-[270px]">
                    <LayoutGrid size={15} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        aria-label={t("requestsPage.category")}
                        className={`${field} cursor-pointer appearance-none pe-10 ps-10 ${category === "all" ? "text-[#89949D]" : ""}`}
                    >
                        <option value="all">{t("requestsPage.category")}</option>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c} className="text-[#414141]">{t(`requestsPage.categories.${c}`)}</option>
                        ))}
                    </select>
                    <ChevronDown size={18} className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                </div>
            </div>

            {/* تبويبات الحالة */}
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
                                ? "min-w-[88px] justify-center bg-[#4B9AD2] text-white shadow-[0_4px_12px_rgba(75,154,210,0.3)]"
                                : "border border-[#CFE3F3] bg-[#EEF5FC] text-[#4B9AD2] hover:border-[#8EC0E4]"
                                }`}
                        >
                            {t(`requestsPage.tabs.${key}`)}
                            {/* عدد الطلبات الجديدة بس (زي التصميم) */}
                            {key === "new" && counts.new > 0 && (
                                <span className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] tabular-nums ${active ? "bg-white/25 text-white" : "bg-[#CFE3F3] text-[#286292]"}`}>
                                    {counts.new}
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

            {/* تأكيد الرفض */}
            {rejecting && (
                <div role="alertdialog" className="flex flex-col gap-3 rounded-xl border border-[#F3C4C4] bg-[#FFF6F6] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[13px] text-[#A61B29]">{t("requestsPage.confirmReject", { name: title(rejecting.id) })}</p>
                    <div className="flex shrink-0 gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                update(rejecting.id, { status: "rejected" }, "rejected");
                                setRejecting(null);
                            }}
                            className="h-9 cursor-pointer rounded-lg bg-[#D64545] px-4 text-[12px] font-medium text-white hover:bg-[#B83636]"
                        >
                            {t("requestsPage.confirmRejectBtn")}
                        </button>
                        <button
                            type="button"
                            onClick={() => setRejecting(null)}
                            className="h-9 cursor-pointer rounded-lg border border-[#0000001A] bg-white px-4 text-[12px] font-medium text-[#575757] hover:bg-[#F5F6F8]"
                        >
                            {t("requestsPage.cancel")}
                        </button>
                    </div>
                </div>
            )}

            {/* الجدول */}
            <section className="overflow-hidden rounded-[20px] border border-[#0000000D] bg-white shadow-[0_4px_24px_rgba(35,74,100,0.08)]">
                {rows.length === 0 ? (
                    <div className="flex flex-col items-center px-6 py-14 text-center">
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF5FC] text-[#4B9AD2]">
                            <Search size={26} strokeWidth={1.6} />
                        </span>
                        <h2 className="mt-5 text-[16px] font-bold text-[#141415]">{t("requestsPage.noResults.title")}</h2>
                        <p className="mt-3 text-[11px] text-[#575757]">
                            {q ? t("requestsPage.noResults.withQuery", { query: query.trim() }) : t("requestsPage.noResults.filtersOnly")}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px] text-[12px]">
                            <thead>
                                <tr className="border-b border-[#0000002E] text-[13px] text-[#4B9AD2]">
                                    <th className="px-4 pb-4 pt-6 ps-6 text-start font-bold">{t("requestsPage.columns.request")}</th>
                                    <th className={th}>{t("requestsPage.columns.client")}</th>
                                    <th className={th}>{t("requestsPage.columns.area")}</th>
                                    <th className={th}>{t("requestsPage.columns.lastActive")}</th>
                                    <th className={th}>{t("requestsPage.columns.owner")}</th>
                                    <th className={th}>{t("requestsPage.columns.category")}</th>
                                    <th className={th}>{t("requestsPage.columns.status")}</th>
                                    <th className="px-5 pb-4 pt-6">
                                        <span className="sr-only">{t("requestsPage.columns.actions")}</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r) => {
                                    const s = `requestsPage.sample.${r.id}`;
                                    return (
                                        <tr key={r.id} className="transition-colors hover:bg-[#F7FAFD]">
                                            <td className="px-4 py-3 ps-6">
                                                <Link to={`${BASE}/requests/${r.id}`} className="text-[13px] font-bold text-[#141415] hover:text-[#4B9AD2] hover:underline">
                                                    {title(r.id)}
                                                </Link>
                                                <p className="mt-0.5 text-[9px] text-[#89949D]" dir="ltr">{r.ref}</p>
                                            </td>
                                            <td className="px-3 py-3 text-center text-[#414141]">{t(`${s}.client`)}</td>
                                            <td className="px-3 py-3 text-center text-[#414141]">{t(`${s}.area`)}</td>
                                            <td className="px-3 py-3 text-center text-[#414141]">{lastActive(r.lastActiveHours)}</td>
                                            <td className={`px-3 py-3 text-center ${r.owner ? "text-[#414141]" : "text-[#89949D]"}`}>
                                                {r.owner ? t(`requestsPage.staff.${r.owner}`) : t("requestsPage.unassigned")}
                                            </td>
                                            <td className="px-3 py-3 text-center text-[#414141]">{t(`requestsPage.categories.${r.category}`)}</td>
                                            <td className="px-3 py-3 text-center">
                                                <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[9px] font-medium ${STATUS_STYLES[r.status]}`}>
                                                    {t(`requestsPage.statuses.${r.status}`)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-end">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        const anchor = e.currentTarget;
                                                        setMenu((m) => (m?.id === r.id ? null : { id: r.id, anchor }));
                                                    }}
                                                    aria-haspopup="menu"
                                                    aria-expanded={menu?.id === r.id}
                                                    aria-label={t("requestsPage.menu.open", { name: title(r.id) })}
                                                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#4B9AD2] hover:bg-[#EEF5FC]"
                                                >
                                                    <Ellipsis size={20} strokeWidth={2.5} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {openRequest && (
                <ActionsMenu
                    anchor={menu.anchor}
                    request={openRequest}
                    label={t("requestsPage.menu.open", { name: title(openRequest.id) })}
                    onAction={(action) => handleAction(openRequest, action)}
                    onClose={closeMenu}
                />
            )}

            {assigning && (
                <AssignModal
                    summary={title(assigning.id)}
                    texts={t("requestsPage.assignModal", { returnObjects: true })}
                    options={STAFF.map((id) => ({ value: id, label: t(`requestsPage.staff.${id}`) }))}
                    onClose={() => setAssigning(null)}
                    onConfirm={(owner) => {
                        update(assigning.id, { owner, status: "assigned" }, "assigned", { owner: t(`requestsPage.staff.${owner}`) });
                        setAssigning(null);
                    }}
                />
            )}
        </div>
    );
}
