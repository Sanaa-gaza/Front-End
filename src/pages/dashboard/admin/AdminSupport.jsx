import React, { useCallback, useEffect, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import { ChevronDown, CircleCheck, Ellipsis, Eye, Hourglass, LayoutGrid, Reply, Search, X } from "lucide-react";
import SupportReplyModal from "./SupportReplyModal";

// ===== بيانات تجريبية =====
// الباك إند لسا ما فيه endpoint لرسائل التواصل. لما يجهز، استبدلي TICKETS بطلب من src/api/endpoints.js
// النصوص (الموضوع، المرسل) بملف الترجمة: supportPage.sample.<id>
export const TICKETS = [
    { id: "t1", ref: "M-4112", type: "complaint", priority: "high", status: "replied", lastActiveHours: 2, date: "2026-10-12" },
    { id: "t2", ref: "M-4113", type: "inquiry", priority: "low", status: "new", lastActiveHours: 3, date: "2026-10-12" },
    { id: "t3", ref: "M-4114", type: "complaint", priority: "high", status: "following", lastActiveHours: 5, date: "2026-10-11" },
    { id: "t4", ref: "M-4115", type: "inquiry", priority: "high", status: "replied", lastActiveHours: 8, date: "2026-10-11" },
    { id: "t5", ref: "M-4116", type: "suggestion", priority: "low", status: "closed", lastActiveHours: 30, date: "2026-10-09" },
    { id: "t6", ref: "M-4117", type: "appeal", priority: "medium", status: "new", lastActiveHours: 4, date: "2026-10-12" },
    { id: "t7", ref: "M-4118", type: "inquiry", priority: "medium", status: "closed", lastActiveHours: 75, date: "2026-10-07" },
];

const TABS = ["all", "new", "following", "replied", "closed"];
const TYPES = ["complaint", "inquiry", "suggestion", "appeal"];

const STATUS_STYLES = {
    new: "bg-[#DCEBFA] text-[#4B9AD2]",
    following: "bg-[#FDEBD3] text-[#D9822B]",
    replied: "bg-[#DDF6E3] text-[#2EAF4E]",
    closed: "bg-[#EEF0F2] text-[#6B7280]",
};

const PRIORITY_STYLES = {
    high: "bg-[#FDE2E2] text-[#D64545]",
    medium: "bg-[#FDEBD3] text-[#D9822B]",
    low: "bg-[#DCEBFA] text-[#4B9AD2]",
};

const field =
    "h-12 w-full rounded-xl border border-[#8EC0E4] bg-white text-[12px] text-[#414141] outline-none transition-colors focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";

/** قائمة إجراءات الرسالة — بمكان ثابت تحت زر "..." عشان ما تنقص بحاوية الجدول */
function ActionsMenu({ anchor, ticket, label, onAction, onClose }) {
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

    const closed = ticket.status === "closed";
    const items = [
        { key: "details", icon: Eye, show: true },
        { key: "reply", icon: Reply, show: !closed },
        { key: "follow", icon: Hourglass, show: ticket.status === "new" },
        { key: "close", icon: CircleCheck, show: !closed },
    ].filter((i) => i.show);

    return (
        <div
            ref={ref}
            role="menu"
            aria-label={label}
            style={{ top: rect.bottom + 6, left: Math.max(8, Math.min(rect.left - 4, window.innerWidth - 170)) }}
            className="fixed z-50 w-[160px] rounded-xl border border-[#0000000D] bg-white p-1.5 shadow-[0_10px_30px_rgba(35,74,100,0.18)]"
        >
            {items.map(({ key, icon: Icon }) => (
                <button
                    key={key}
                    type="button"
                    role="menuitem"
                    onClick={() => onAction(key)}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-[12px] text-[#414141] hover:bg-[#EEF5FC]"
                >
                    <Icon size={15} className="shrink-0 text-[#4B9AD2]" />
                    {t(`supportPage.menu.${key}`)}
                </button>
            ))}
        </div>
    );
}

/** التواصل والاستفسارات: تبويبات حسب الحالة + بحث وفلتر تصنيف + جدول بقائمة إجراءات لكل رسالة */
export default function AdminSupport() {
    const { t, i18n } = useTranslation("adminDashboard");
    const sp = "supportPage";
    const locale = `${i18n.language}-u-nu-latn`;
    const [tab, setTab] = useState("all");
    const [query, setQuery] = useState("");
    const [type, setType] = useState("all");
    const [menu, setMenu] = useState(null);
    const [flash, setFlash] = useState("");
    // الرسالة اللي نافذة الرد مفتوحة عليها
    const [replying, setReplying] = useState(null);
    // ⚠️ تغييرات الحالة بالصفحة بس لحد ما يصير في endpoint
    const [changes, setChanges] = useState({});

    const subject = (id) => t(`${sp}.sample.${id}.subject`);
    const tickets = TICKETS.map((x) => (changes[x.id] ? { ...x, status: changes[x.id] } : x));
    const newCount = tickets.filter((x) => x.status === "new").length;

    const q = query.trim().toLowerCase();
    const rows = tickets.filter(
        (x) =>
            (tab === "all" || x.status === tab) &&
            (type === "all" || x.type === type) &&
            (!q || subject(x.id).toLowerCase().includes(q) || x.ref.toLowerCase().includes(q))
    );

    const closeMenu = useCallback(() => setMenu(null), []);
    const handleAction = (x, action) => {
        setMenu(null);
        setFlash("");
        if (action === "details" || action === "reply") setReplying(x);
        else if (action === "follow") {
            setChanges((c) => ({ ...c, [x.id]: "following" }));
            setFlash(t(`${sp}.flash.following`, { name: subject(x.id) }));
        } else if (action === "close") {
            setChanges((c) => ({ ...c, [x.id]: "closed" }));
            setFlash(t(`${sp}.flash.closed`, { name: subject(x.id) }));
        }
    };

    const lastActive = (h) => (h < 24 ? t(`${sp}.hoursAgo`, { count: h }) : t(`${sp}.daysAgo`, { count: Math.round(h / 24) }));
    const openTicket = menu && rows.find((x) => x.id === menu.id);
    const th = "px-3 pb-4 pt-6 text-center font-bold";
    const chip = "inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[9px] font-medium";

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
                        placeholder={t(`${sp}.search`)}
                        aria-label={t(`${sp}.search`)}
                        className={`${field} pe-10 ps-10 placeholder:text-[#89949D] [&::-webkit-search-cancel-button]:hidden`}
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery("")}
                            aria-label={t(`${sp}.clearSearch`)}
                            className="absolute end-3 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#575757] hover:bg-[#EEF5FC]"
                        >
                            <X size={15} />
                        </button>
                    )}
                </label>
                <div className="relative md:w-[270px]">
                    <LayoutGrid size={15} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        aria-label={t(`${sp}.type`)}
                        className={`${field} cursor-pointer appearance-none pe-10 ps-10 ${type === "all" ? "text-[#89949D]" : ""}`}
                    >
                        <option value="all">{t(`${sp}.type`)}</option>
                        {TYPES.map((k) => (
                            <option key={k} value={k} className="text-[#414141]">{t(`${sp}.types.${k}`)}</option>
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
                            {t(`${sp}.tabs.${key}`)}
                            {key === "new" && newCount > 0 && (
                                <span className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] tabular-nums ${active ? "bg-white/25 text-white" : "bg-[#CFE3F3] text-[#286292]"}`}>
                                    {newCount}
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

            {/* الجدول */}
            <section className="overflow-hidden rounded-[20px] border border-[#0000000D] bg-white shadow-[0_4px_24px_rgba(35,74,100,0.08)]">
                {rows.length === 0 ? (
                    <div className="flex flex-col items-center px-6 py-14 text-center">
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF5FC] text-[#4B9AD2]">
                            <Search size={26} strokeWidth={1.6} />
                        </span>
                        <h2 className="mt-5 text-[16px] font-bold text-[#141415]">{t(`${sp}.noResults.title`)}</h2>
                        <p className="mt-3 text-[11px] text-[#575757]">
                            {q ? t(`${sp}.noResults.withQuery`, { query: query.trim() }) : t(`${sp}.noResults.filtersOnly`)}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px] text-[12px]">
                            <thead>
                                <tr className="border-b border-[#0000002E] text-[13px] text-[#4B9AD2]">
                                    <th className="px-4 pb-4 pt-6 ps-6 text-start font-bold">{t(`${sp}.columns.subject`)}</th>
                                    <th className={th}>{t(`${sp}.columns.sender`)}</th>
                                    <th className={th}>{t(`${sp}.columns.type`)}</th>
                                    <th className={th}>{t(`${sp}.columns.lastActive`)}</th>
                                    <th className={th}>{t(`${sp}.columns.date`)}</th>
                                    <th className={th}>{t(`${sp}.columns.priority`)}</th>
                                    <th className={th}>{t(`${sp}.columns.status`)}</th>
                                    <th className="px-5 pb-4 pt-6">
                                        <span className="sr-only">{t(`${sp}.columns.actions`)}</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((x) => (
                                    <tr key={x.id} className="transition-colors hover:bg-[#F7FAFD]">
                                        <td className="px-4 py-3 ps-6">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFlash("");
                                                    setReplying(x);
                                                }}
                                                className="cursor-pointer text-start text-[13px] font-bold text-[#141415] hover:text-[#4B9AD2] hover:underline"
                                            >
                                                {subject(x.id)}
                                            </button>
                                            <p className="mt-0.5 text-[9px] text-[#89949D]" dir="ltr">{x.ref}</p>
                                        </td>
                                        <td className="px-3 py-3 text-center text-[#414141]">{t(`${sp}.sample.${x.id}.sender`)}</td>
                                        <td className="px-3 py-3 text-center text-[#414141]">{t(`${sp}.types.${x.type}`)}</td>
                                        <td className="px-3 py-3 text-center text-[#414141]">{lastActive(x.lastActiveHours)}</td>
                                        <td className="px-3 py-3 text-center text-[#414141]">
                                            {new Date(x.date).toLocaleDateString(locale, { day: "numeric", month: "long" })}
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <span className={`${chip} ${PRIORITY_STYLES[x.priority]}`}>{t(`${sp}.priorities.${x.priority}`)}</span>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <span className={`${chip} ${STATUS_STYLES[x.status]}`}>{t(`${sp}.statuses.${x.status}`)}</span>
                                        </td>
                                        <td className="px-5 py-3 text-end">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    const anchor = e.currentTarget;
                                                    setMenu((m) => (m?.id === x.id ? null : { id: x.id, anchor }));
                                                }}
                                                aria-haspopup="menu"
                                                aria-expanded={menu?.id === x.id}
                                                aria-label={t(`${sp}.menu.open`, { name: subject(x.id) })}
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
                )}
            </section>

            {replying && (
                <SupportReplyModal
                    key={replying.id}
                    title={subject(replying.id)}
                    sender={t(`${sp}.sample.${replying.id}.sender`)}
                    type={t(`${sp}.types.${replying.type}`)}
                    onClose={() => setReplying(null)}
                    // ⚠️ الرد بالصفحة بس لحد ما يصير في endpoint — بيحوّل الحالة لـ "تم الرد"
                    onSend={() => {
                        setChanges((c) => ({ ...c, [replying.id]: "replied" }));
                        setFlash(t(`${sp}.flash.replied`, { name: t(`${sp}.sample.${replying.id}.sender`) }));
                        setReplying(null);
                    }}
                />
            )}

            {openTicket && (
                <ActionsMenu
                    anchor={menu.anchor}
                    ticket={openTicket}
                    label={t(`${sp}.menu.open`, { name: subject(openTicket.id) })}
                    onAction={(action) => handleAction(openTicket, action)}
                    onClose={closeMenu}
                />
            )}
        </div>
    );
}
