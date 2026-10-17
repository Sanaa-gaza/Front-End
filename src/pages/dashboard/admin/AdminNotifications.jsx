import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BellOff, ChevronDown, LayoutGrid } from "lucide-react";

const BASE = "/dashboard/admin";

// ===== بيانات تجريبية =====
// الباك إند لسا ما فيه endpoint لإشعارات الأدمن. لما يجهز، استبدلي NOTIFICATIONS بطلب من src/api/endpoints.js
// النصوص بملف الترجمة: notificationsPage.sample.<id> — to: الصفحة اللي بيفتحها الإشعار
const NOTIFICATIONS = [
    { id: "n1", category: "requests", hoursAgo: 5, read: false, to: `${BASE}/requests/q5` },
    { id: "n2", category: "verification", hoursAgo: 5, read: false, to: `${BASE}/verification/v1` },
    { id: "n3", category: "support", hoursAgo: 6, read: false, to: `${BASE}/support` },
    { id: "n4", category: "chats", hoursAgo: 7, read: false, to: `${BASE}/chats` },
    { id: "n5", category: "verification", hoursAgo: 26, read: true, to: `${BASE}/verification/v3` },
    { id: "n6", category: "requests", hoursAgo: 50, read: true, to: `${BASE}/requests/q2` },
];

const CATEGORIES = ["requests", "verification", "support", "chats"];
const TABS = ["all", "unread"];

/** الإشعارات: فلتر تصنيف + تبويب الكل/غير مقروءة + قائمة (الضغط بيعلّم مقروء وبيفتح الصفحة المرتبطة) */
export default function AdminNotifications() {
    const { t } = useTranslation("adminDashboard");
    const navigate = useNavigate();
    const np = "notificationsPage";
    const [category, setCategory] = useState("all");
    const [tab, setTab] = useState("all");
    // ⚠️ حالة "مقروء" بالصفحة بس لحد ما يصير في endpoint
    const [readIds, setReadIds] = useState([]);

    const items = NOTIFICATIONS.map((n) => ({ ...n, read: n.read || readIds.includes(n.id) }));
    const unreadCount = items.filter((n) => !n.read).length;
    const rows = items.filter((n) => (category === "all" || n.category === category) && (tab === "all" || !n.read));
    const ago = (h) => (h < 24 ? t(`${np}.hoursAgo`, { count: h }) : t(`${np}.daysAgo`, { count: Math.round(h / 24) }));

    const open = (n) => {
        setReadIds((ids) => (ids.includes(n.id) ? ids : [...ids, n.id]));
        navigate(n.to);
    };

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
            {/* فلتر التصنيف */}
            <div className="relative">
                <LayoutGrid size={15} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    aria-label={t(`${np}.category`)}
                    className={`h-11 w-full cursor-pointer appearance-none rounded-xl border border-[#8EC0E4] bg-white pe-10 ps-10 text-[12px] outline-none focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2] ${category === "all" ? "text-[#89949D]" : "text-[#414141]"
                        }`}
                >
                    <option value="all">{t(`${np}.category`)}</option>
                    {CATEGORIES.map((k) => (
                        <option key={k} value={k} className="text-[#414141]">{t(`${np}.categories.${k}`)}</option>
                    ))}
                </select>
                <ChevronDown size={18} className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
            </div>

            {/* الكل / غير مقروءة */}
            <div role="tablist" className="flex flex-wrap gap-3">
                {TABS.map((key) => {
                    const active = tab === key;
                    return (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => setTab(key)}
                            className={`flex h-10 cursor-pointer items-center gap-2 rounded-xl px-5 text-[13px] font-semibold transition-colors ${active
                                ? "min-w-[88px] justify-center bg-[#4B9AD2] text-white shadow-[0_4px_12px_rgba(75,154,210,0.3)]"
                                : "border border-[#CFE3F3] bg-[#EEF5FC] text-[#4B9AD2] hover:border-[#8EC0E4]"
                                }`}
                        >
                            {t(`${np}.tabs.${key}`)}
                            {key === "unread" && unreadCount > 0 && (
                                <span className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] tabular-nums ${active ? "bg-white/25 text-white" : "bg-[#CFE3F3] text-[#286292]"}`}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* القائمة */}
            <section className="rounded-[20px] border border-[#0000000D] border-t-2 border-t-[#9CC9EA] bg-white p-5 shadow-[0_4px_24px_rgba(35,74,100,0.08)]">
                <div className="mx-1 flex items-center justify-between gap-3 border-b border-[#0000002E] pb-4">
                    <h1 className="text-[17px] font-bold text-[#141415]">{t(`${np}.title`)}</h1>
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={() => setReadIds(NOTIFICATIONS.map((n) => n.id))}
                            className="cursor-pointer text-[11px] text-[#4B9AD2] hover:underline"
                        >
                            {t(`${np}.markAll`)}
                        </button>
                    )}
                </div>

                {rows.length ? (
                    <ul className="mt-5 flex flex-col gap-2">
                        {rows.map((n) => {
                            const s = `${np}.sample.${n.id}`;
                            return (
                                <li key={n.id}>
                                    <button
                                        type="button"
                                        onClick={() => open(n)}
                                        className={`flex w-full cursor-pointer items-start justify-between gap-3 rounded-xl border px-4 py-4 text-start transition-colors ${n.read
                                            ? "border-[#0000000A] bg-[#F7F8FA] hover:border-[#BFDCF1]"
                                            : "border-[#BFDCF1] bg-[#EEF5FC] hover:border-[#8EC0E4]"
                                            }`}
                                    >
                                        <span className="min-w-0">
                                            <span className="flex items-center gap-2 text-[14px] font-bold text-[#141415]">
                                                {!n.read && (
                                                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#4B9AD2]" aria-label={t(`${np}.unreadLabel`)} />
                                                )}
                                                {t(`${s}.title`)}
                                            </span>
                                            <span className="mt-1.5 block text-[8px] text-[#4B9AD2]">{t(`${s}.party`)}</span>
                                            <span className="mt-0.5 block truncate text-[10px] text-[#414141]">{t(`${s}.body`)}</span>
                                        </span>
                                        <span className="flex shrink-0 flex-col items-center gap-2">
                                            <span className="rounded-full bg-[#ECEEF0] px-3 py-0.5 text-[9px] text-[#575757]">{t(`${np}.categories.${n.category}`)}</span>
                                            <span className="text-[8px] text-[#89949D]">{ago(n.hoursAgo)}</span>
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center gap-3 py-14 text-center">
                        <BellOff size={28} className="text-[#BFD9EC]" aria-hidden="true" />
                        <p className="text-[13px] text-[#89949D]">{tab === "unread" ? t(`${np}.emptyUnread`) : t(`${np}.empty`)}</p>
                    </div>
                )}
            </section>
        </div>
    );
}
