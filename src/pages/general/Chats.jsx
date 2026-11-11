import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown, MessageSquare, Paperclip, Search, Send } from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import useLangDir from "../../hooks/useLangDir";

// ===== بيانات تجريبية =====
// ⚠️ ما في endpoints للمحادثات بالسيرفر لسا. لما تجهز، استبدلي CONVERSATIONS بطلب من src/api/endpoints.js
// type: craftsman | institution (لفلتر القائمة) — online: متصل الآن — unread: رسائل ما انقرت
// messages: from "them" | "me" + وقت الرسالة (النص من ملف الترجمة sample.<id>.<messageId>)
const CONVERSATIONS = [
    {
        id: "c1",
        type: "craftsman",
        online: true,
        unread: 0,
        messages: [
            { id: "m2", from: "me", time: "9:05 ص" },
            { id: "m3", from: "them", time: "9:12 ص" },
            { id: "m4", from: "me", time: "9:14 ص" },
            { id: "m1", from: "them", time: "9:20 ص" },
        ],
    },
    { id: "c2", type: "craftsman", online: true, unread: 2, messages: [] },
    { id: "c3", type: "craftsman", unread: 0, messages: [] },
    { id: "c4", type: "craftsman", unread: 1, messages: [] },
    { id: "c5", type: "institution", unread: 0, messages: [] },
    { id: "c6", type: "craftsman", unread: 0, messages: [] },
];

const FILTERS = ["all", "craftsman", "institution"];

const panel = "flex flex-col overflow-hidden rounded-[20px] border border-[#DDDDDD] bg-white";
const input =
    "h-10 w-full rounded-xl border border-[#DDDDDD] bg-white text-[12px] text-[#414141] outline-none placeholder:text-[#A9B3BB] focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";

/** دائرة بأول حرف من الاسم + نقطة خضرا لو متصل */
function Avatar({ name, online, active }) {
    return (
        <span className="relative shrink-0">
            <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-semibold ${active ? "bg-[#4B9AD2] text-white" : "bg-[#EEF5FC] text-[#475569]"}`}
            >
                {name.trim().charAt(0)}
            </span>
            {online && <span className="absolute bottom-0 end-0 h-3 w-3 rounded-full border-2 border-white bg-[#10B981]" aria-hidden="true" />}
        </span>
    );
}

/** فلتر القائمة (الكل / الحرفيين / المؤسسات) — زر مربع بسهم وقائمة صغيرة */
function FilterMenu({ value, onChange }) {
    const { t } = useTranslation("chats");
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", onDown);
        window.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            window.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <div ref={ref} className="relative shrink-0">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label={t("filter")}
                aria-expanded={open}
                className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border text-[#4B9AD2] transition-colors ${open || value !== "all" ? "border-[#4B9AD2] bg-[#EEF5FC]" : "border-[#DDDDDD] bg-white hover:bg-[#F7FAFD]"}`}
            >
                <ChevronDown size={17} className={`transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <ul className="absolute end-0 top-full z-20 mt-1.5 w-40 rounded-xl border border-[#DDDDDD] bg-white p-1.5 shadow-[0_10px_30px_rgba(35,74,100,0.14)]">
                    {FILTERS.map((key) => (
                        <li key={key}>
                            <button
                                type="button"
                                onClick={() => {
                                    onChange(key);
                                    setOpen(false);
                                }}
                                className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-[12px] hover:bg-[#F2F8FD] ${value === key ? "font-semibold text-[#286292]" : "text-[#475569]"}`}
                            >
                                {t(`filters.${key}`)}
                                {value === key && <Check size={13} />}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/**
 * قائمة المحادثات + المحادثة المفتوحة — بتنعرض بالصفحة العامة (/chats) وبلوحة المؤسسة (/dashboard/institution/chats).
 * لو جاي من ملف مهني (location.state.craftsman = { id, full_name }) بنفتح محادثة معه بأول القائمة.
 */
export function ChatBox() {
    const { t, i18n } = useTranslation("chats");
    const { state } = useLocation();
    const target = state?.craftsman;
    const locale = `${i18n.language}-u-nu-latn`;

    const [conversations, setConversations] = useState(() => {
        const list = CONVERSATIONS.map((c) => ({
            ...c,
            name: t(`sample.${c.id}.name`),
            preview: t(`sample.${c.id}.preview`),
            time: t(c.messages.length ? "timeAgo" : "yesterday"),
            messages: c.messages.map((m) => ({ ...m, text: t(`sample.${c.id}.${m.id}`) })),
        }));
        if (!target?.full_name) return list;
        return [
            { id: `new-${target.id ?? target.full_name}`, type: "craftsman", name: target.full_name, preview: "", time: "", unread: 0, messages: [] },
            ...list,
        ];
    });
    const [activeId, setActiveId] = useState(conversations[0]?.id);
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const [draft, setDraft] = useState("");
    const listRef = useRef(null);
    const fileRef = useRef(null);

    const active = conversations.find((c) => c.id === activeId);
    const q = query.trim().toLowerCase();
    const visible = conversations.filter((c) => (filter === "all" || c.type === filter) && (!q || c.name.toLowerCase().includes(q)));
    const unreadTotal = conversations.reduce((sum, c) => sum + (c.unread || 0), 0);
    const quick = t("quickReplies", { returnObjects: true });

    // آخر رسالة دايماً ظاهرة
    useEffect(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [activeId, active?.messages.length]);

    const open = (id) => {
        setActiveId(id);
        // فتح المحادثة بيعلّم رسائلها كمقروءة
        setConversations((list) => list.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
    };

    // ⚠️ الإرسال محلي بس لحد ما يصير في endpoint للمحادثات
    const sendText = (text) => {
        if (!text || !active) return;
        const time = new Date().toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
        setConversations((list) =>
            list.map((c) =>
                c.id === active.id
                    ? { ...c, preview: text, time: t("now"), messages: [...c.messages, { id: `m${Date.now()}`, from: "me", text, time }] }
                    : c
            )
        );
    };

    const send = (e) => {
        e.preventDefault();
        sendText(draft.trim());
        setDraft("");
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                    <h1 className="text-[22px] font-bold text-[#1E293B]">{t("title")}</h1>
                    <p className="mt-1 text-[12px] text-[#89949D]">{t("subtitle")}</p>
                </div>
                {unreadTotal > 0 && (
                    <span className="rounded-full bg-[#EEF5FC] px-3 py-1 text-[11px] font-semibold text-[#3D8BC9]">
                        {t("unreadTotal", { count: unreadTotal })}
                    </span>
                )}
            </div>

            <div className="grid gap-5 lg:h-[620px] lg:grid-cols-[340px_1fr]">
                {/* قائمة المحادثات */}
                <section className={`${panel} max-h-[420px] lg:max-h-none`}>
                    <div className="flex items-center gap-2 border-b border-[#DDDDDD] p-3">
                        <div className="relative flex-1">
                            <Search size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#A9B3BB]" />
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                aria-label={t("search")}
                                placeholder={t("search")}
                                className={`${input} pe-3 ps-9 [&::-webkit-search-cancel-button]:hidden`}
                            />
                        </div>
                        <FilterMenu value={filter} onChange={setFilter} />
                    </div>

                    <ul className="flex-1 overflow-y-auto p-2">
                        {visible.map((c) => {
                            const on = c.id === activeId;
                            return (
                                <li key={c.id}>
                                    <button
                                        type="button"
                                        onClick={() => open(c.id)}
                                        aria-current={on}
                                        className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-3 text-start transition-colors ${on ? "bg-[#EEF5FC]" : "hover:bg-[#F7FAFD]"}`}
                                    >
                                        <Avatar name={c.name} online={c.online} active={on} />
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-center justify-between gap-2">
                                                <span className={`truncate text-[13px] text-[#1E293B] ${c.unread ? "font-bold" : "font-semibold"}`}>{c.name}</span>
                                                {c.time && <span className="shrink-0 text-[10px] text-[#89949D]">{c.time}</span>}
                                            </span>
                                            <span className="mt-1 flex items-center justify-between gap-2">
                                                <span className={`truncate text-[11px] ${c.unread ? "font-semibold text-[#1E293B]" : "text-[#89949D]"}`}>
                                                    {c.preview || t(`types.${c.type}`)}
                                                </span>
                                                {c.unread > 0 && (
                                                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#4B9AD2] px-1.5 text-[10px] font-bold text-white tabular-nums">
                                                        {c.unread}
                                                    </span>
                                                )}
                                            </span>
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                        {!visible.length && <li className="py-10 text-center text-[12px] text-[#89949D]">{t("noResults")}</li>}
                    </ul>
                </section>

                {/* المحادثة المفتوحة */}
                <section className={`${panel} h-[560px] lg:h-auto`}>
                    {active ? (
                        <>
                            {/* رأس المحادثة: الاسم + النوع + الحالة */}
                            <div className="flex items-center gap-3 border-b border-[#DDDDDD] px-5 py-3.5">
                                <Avatar name={active.name} online={active.online} active />
                                <div className="min-w-0">
                                    <p className="truncate text-[14px] font-bold text-[#1E293B]">{active.name}</p>
                                    <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#89949D]">
                                        {t(`types.${active.type}`)}
                                        <span aria-hidden="true">·</span>
                                        <span className={active.online ? "text-[#10B981]" : ""}>{active.online ? t("online") : t("lastSeen")}</span>
                                    </p>
                                </div>
                            </div>

                            <div ref={listRef} className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[#FAFBFC] p-5">
                                {active.messages.length ? (
                                    <>
                                        <span className="mb-1 self-center rounded-full bg-white px-3 py-1 text-[10px] text-[#89949D] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                                            {t("today")}
                                        </span>
                                        {active.messages.map((m) => (
                                            <div key={m.id} className={`flex max-w-[75%] flex-col ${m.from === "me" ? "items-end self-end" : "items-start self-start"}`}>
                                                <p
                                                    className={`rounded-2xl px-4 py-2.5 text-[13px] leading-[1.8] ${m.from === "me"
                                                        ? "rounded-ee-md bg-[#4B9AD2] text-white"
                                                        : "rounded-es-md border border-[#DDDDDD] bg-white text-[#1E293B]"
                                                        }`}
                                                >
                                                    {m.text}
                                                </p>
                                                {m.time && <span className="mt-1 px-1 text-[10px] text-[#A9B3BB] tabular-nums">{m.time}</span>}
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    /* محادثة جديدة: رسائل سريعة للبداية */
                                    <div className="m-auto flex max-w-[360px] flex-col items-center text-center">
                                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF5FC] text-[#4B9AD2]">
                                            <MessageSquare size={22} />
                                        </span>
                                        <p className="mt-3 text-[14px] font-bold text-[#1E293B]">{t("empty", { name: active.name })}</p>
                                        <p className="mt-1 text-[11px] text-[#89949D]">{t("quickTitle")}</p>
                                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                                            {(Array.isArray(quick) ? quick : []).map((text) => (
                                                <button
                                                    key={text}
                                                    type="button"
                                                    onClick={() => sendText(text)}
                                                    className="cursor-pointer rounded-full border border-[#C7E0F1] bg-white px-3.5 py-2 text-[11px] text-[#3D8BC9] transition-colors hover:border-[#4B9AD2] hover:bg-[#EEF5FC]"
                                                >
                                                    {text}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={send} className="flex items-center gap-2 border-t border-[#DDDDDD] p-3">
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    aria-label={t("attach")}
                                    title={t("attach")}
                                    className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-[#89949D] transition-colors hover:bg-[#F3F8FD] hover:text-[#4B9AD2]"
                                >
                                    <Paperclip size={18} />
                                </button>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) sendText(`📎 ${f.name}`);
                                        e.target.value = "";
                                    }}
                                />
                                <input
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    aria-label={t("placeholder")}
                                    placeholder={t("placeholder")}
                                    className={`${input} h-11 flex-1 px-4`}
                                />
                                <button
                                    type="submit"
                                    disabled={!draft.trim()}
                                    className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-[#4B9AD2] px-5 text-[13px] font-semibold text-white btn-wipe disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Send size={15} className="rtl:-scale-x-100" />
                                    {t("send")}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="m-auto flex flex-col items-center text-center text-[#89949D]">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF5FC] text-[#4B9AD2]">
                                <MessageSquare size={20} />
                            </span>
                            <p className="mt-3 text-[12px]">{t("pick")}</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

/** صفحة المحادثات العامة (/chats) — بتفتح من "بدء محادثة" بالملف المهني للحرفي */
export default function Chats() {
    useLangDir();
    return (
        <div className="relative min-h-dvh overflow-x-hidden bg-white">
            <Header />
            <main className="mx-auto max-w-[1230px] px-5 pb-24 pt-32 sm:px-10 sm:pt-40">
                <ChatBox />
            </main>
            <Footer />
        </div>
    );
}
