import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Bell,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    CircleCheck,
    FileText,
    LockKeyhole,
    Megaphone,
    MessageCircle,
    X,
} from "lucide-react";

// شكل كل نوع إشعار: الأيقونة ولونها
const TYPES = {
    tender: { icon: FileText, style: "bg-[#E4EFFA] text-[#4B9AD2]" },
    accepted: { icon: CircleCheck, style: "bg-[#DDF6E3] text-[#2EAF4E]" },
    message: { icon: MessageCircle, style: "bg-[#E4EFFA] text-[#4B9AD2]" },
    update: { icon: CalendarDays, style: "bg-[#F1E6FB] text-[#9B51E0]" },
    closed: { icon: LockKeyhole, style: "bg-[#FDE2E2] text-[#D64545]" },
    announcement: { icon: Megaphone, style: "bg-[#E4EFFA] text-[#4B9AD2]" },
};

const TABS = ["all", "unread", "tenders", "messages", "system"];

/**
 * زر الجرس + قائمة الإشعارات اللي بتنزل تحته.
 * notifications: [{ id, type, category: "tenders"|"messages"|"system", title, body, time, read, to }]
 * onRead(ids): لما تنقرأ إشعارات (ضغطة على إشعار أو "تحديد الكل كمقروء")
 */
export default function NotificationsPanel({ notifications = [], onRead }) {
    const { t, i18n } = useTranslation("dashboard");
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState("all");
    const wrapRef = useRef(null);
    const isRtl = i18n.dir() === "rtl";
    const Chevron = isRtl ? ChevronLeft : ChevronRight;

    // Escape أو الضغط برا القائمة بيسكرها
    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        const onDown = (e) => wrapRef.current && !wrapRef.current.contains(e.target) && setOpen(false);
        window.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onDown);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onDown);
        };
    }, [open]);

    const unread = notifications.filter((n) => !n.read);
    const inTab = (key) =>
        key === "all" ? notifications : key === "unread" ? unread : notifications.filter((n) => n.category === key);
    // الرقم جنب كل تبويب = عدد غير المقروء فيه
    const countFor = (key) => inTab(key).filter((n) => !n.read).length;
    const visible = inTab(tab);

    const openItem = (n) => {
        if (!n.read) onRead?.([n.id]);
        setOpen(false);
        if (n.to) navigate(n.to);
    };

    return (
        <div ref={wrapRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label={t("notifications")}
                aria-expanded={open}
                aria-haspopup="dialog"
                className={`relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border ${open ? "border-[#4B9AD2] bg-[#4B9AD2] text-white" : "border-[#C7E0F1] text-[#4B9AD2] btn-wipe btn-wipe-outline"
                    }`}
            >
                <Bell size={17} />
                {unread.length > 0 && (
                    <span className="absolute -end-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#D64545]" />
                )}
            </button>

            {open && (
                <div
                    role="dialog"
                    aria-label={t("notificationsPanel.title")}
                    className="fixed inset-x-3 top-[76px] z-50 flex max-h-[calc(100vh-96px)] flex-col overflow-hidden rounded-[20px] border border-[#0000000D] bg-white shadow-[0_18px_50px_rgba(35,74,100,0.18)] sm:absolute sm:inset-x-auto sm:end-0 sm:top-full sm:mt-3 sm:w-[540px]"
                >
                    <div className="flex items-center justify-between gap-3 border-b border-[#0000000D] px-5 py-4">
                        <h2 className="flex items-center gap-2.5 text-[17px] font-medium text-[#414141]">
                            {t("notificationsPanel.title")}
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF3FB] text-[#4B9AD2]">
                                <Bell size={15} />
                            </span>
                        </h2>
                        <div className="flex items-center gap-5">
                            <button
                                type="button"
                                onClick={() => onRead?.(unread.map((n) => n.id))}
                                disabled={!unread.length}
                                className="flex cursor-pointer items-center gap-1.5 text-[12px] text-[#4B9AD2] hover:underline disabled:cursor-default disabled:text-[#B4BEC6] disabled:no-underline"
                            >
                                <CircleCheck size={15} />
                                {t("notificationsPanel.markAll")}
                            </button>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                aria-label={t("notificationsPanel.close")}
                                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#89949D] hover:bg-[#F4F7FA] hover:text-[#575757]"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 border-b border-[#0000000D] px-5 py-3.5" role="tablist">
                        {TABS.map((key) => {
                            const active = tab === key;
                            const count = countFor(key);
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() => setTab(key)}
                                    className={`flex h-9 flex-auto cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-[12px] transition-colors ${active
                                        ? "border-[#4B9AD2] bg-[#4B9AD2] text-white shadow-[0_4px_12px_rgba(75,154,210,0.25)]"
                                        : "border-[#E3E9EE] bg-[#F5F8FA] text-[#575757] hover:border-[#8EC0E4]"
                                        }`}
                                >
                                    {t(`notificationsPanel.tabs.${key}`)}
                                    {count > 0 && (
                                        <span
                                            className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] tabular-nums ${active ? "bg-white/25 text-white" : "bg-[#E3E9EE] text-[#575757]"
                                                }`}
                                        >
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="overflow-y-auto px-5 py-4">
                        {visible.length ? (
                            <ul className="flex flex-col gap-3">
                                {visible.map((n) => {
                                    const { icon: Icon, style } = TYPES[n.type] || TYPES.announcement;
                                    return (
                                        <li key={n.id}>
                                            <button
                                                type="button"
                                                onClick={() => openItem(n)}
                                                className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl border px-3.5 py-3 text-start transition-colors hover:border-[#8EC0E4] ${n.read ? "border-[#0000000D] bg-white" : "border-[#DCEAF8] bg-[#F7FBFE]"
                                                    }`}
                                            >
                                                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style}`}>
                                                    <Icon size={18} />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="flex items-start justify-between gap-2">
                                                        <span
                                                            className={`text-[12px] text-[#22455E] ${n.read ? "font-medium" : "font-bold"}`}
                                                        >
                                                            {n.title}
                                                        </span>
                                                        <span className="shrink-0 text-[9px] text-[#89949D]">{n.time}</span>
                                                    </span>
                                                    <span className="mt-1 block text-[10px] leading-[1.7] text-[#575757]">{n.body}</span>
                                                </span>
                                                <Chevron size={15} className="shrink-0 text-[#B4BEC6]" />
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="py-10 text-center text-[12px] text-[#89949D]">{t("notificationsPanel.empty")}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
