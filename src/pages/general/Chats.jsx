import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown, MessageSquare } from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import useLangDir from "../../hooks/useLangDir";

// ===== بيانات تجريبية =====
// ⚠️ ما في endpoints للمحادثات بالسيرفر لسا. لما تجهز، استبدلي CONVERSATIONS بطلب من src/api/endpoints.js
// type: craftsman | institution (لفلتر القائمة) — messages: from "them" | "me"
const CONVERSATIONS = [
    { id: "c1", type: "craftsman", messages: [{ id: "m1", from: "them" }] },
    { id: "c2", type: "craftsman", messages: [] },
    { id: "c3", type: "craftsman", messages: [] },
    { id: "c4", type: "craftsman", messages: [] },
    { id: "c5", type: "institution", messages: [] },
    { id: "c6", type: "craftsman", messages: [] },
];

const FILTERS = ["all", "craftsman", "institution"];

const panel =
    "flex flex-col overflow-hidden rounded-[20px] border border-[#0000000D] border-t-2 border-t-[#9CC9EA] bg-white shadow-[0_6px_24px_rgba(35,74,100,0.1)]";
const input =
    "h-10 w-full rounded-xl border border-[#8EC0E4] bg-white text-[12px] text-[#414141] outline-none placeholder:text-[#89949D] focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";

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
                className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border text-[#4B9AD2] transition-colors ${open || value !== "all" ? "border-[#4B9AD2] bg-[#EEF5FC]" : "border-[#8EC0E4] bg-white hover:bg-[#F7FAFD]"}`}
            >
                <ChevronDown size={17} className={`transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <ul className="absolute end-0 top-full z-20 mt-1.5 w-40 rounded-xl border border-[#0000000D] bg-white p-1.5 shadow-[0_10px_30px_rgba(35,74,100,0.14)]">
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
    const { t } = useTranslation("chats");
    const { state } = useLocation();
    const target = state?.craftsman;

    const [conversations, setConversations] = useState(() => {
        const list = CONVERSATIONS.map((c) => ({
            ...c,
            name: t(`sample.${c.id}.name`),
            preview: t(`sample.${c.id}.preview`),
            time: t("timeAgo"),
            messages: c.messages.map((m) => ({ ...m, text: t(`sample.${c.id}.${m.id}`) })),
        }));
        if (!target?.full_name) return list;
        return [{ id: `new-${target.id ?? target.full_name}`, type: "craftsman", name: target.full_name, preview: "", time: "", messages: [] }, ...list];
    });
    const [activeId, setActiveId] = useState(conversations[0]?.id);
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const [draft, setDraft] = useState("");
    const listRef = useRef(null);

    const active = conversations.find((c) => c.id === activeId);
    const q = query.trim().toLowerCase();
    const visible = conversations.filter((c) => (filter === "all" || c.type === filter) && (!q || c.name.toLowerCase().includes(q)));

    // آخر رسالة دايماً ظاهرة
    useEffect(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [activeId, active?.messages.length]);

    const send = (e) => {
        e.preventDefault();
        const text = draft.trim();
        if (!text || !active) return;
        // ⚠️ الإرسال محلي بس لحد ما يصير في endpoint للمحادثات
        setConversations((list) =>
            list.map((c) =>
                c.id === active.id
                    ? { ...c, preview: text, time: t("now"), messages: [...c.messages, { id: `m${Date.now()}`, from: "me", text }] }
                    : c
            )
        );
        setDraft("");
    };

    return (
                <div className="grid gap-5 lg:h-[620px] lg:grid-cols-[360px_1fr]">
                    {/* قائمة المحادثات */}
                    <section className={`${panel} max-h-[420px] lg:max-h-none`}>
                        <div className="flex items-center gap-2 p-3">
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                aria-label={t("search")}
                                placeholder={t("search")}
                                className={`${input} flex-1 px-4 [&::-webkit-search-cancel-button]:hidden`}
                            />
                            <FilterMenu value={filter} onChange={setFilter} />
                        </div>

                        <ul className="flex-1 overflow-y-auto px-3 pb-3">
                            {visible.map((c) => {
                                const on = c.id === activeId;
                                return (
                                    <li key={c.id} className="border-b border-[#0000000F] py-1.5 last:border-b-0">
                                        <button
                                            type="button"
                                            onClick={() => setActiveId(c.id)}
                                            aria-current={on}
                                            className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-3 text-start transition-colors ${on ? "bg-[#EEF5FC]" : "hover:bg-[#F7FAFD]"}`}
                                        >
                                            <span
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold ${on ? "bg-[#4B9AD2] text-white" : "bg-[#EEF5FC] text-[#475569]"}`}
                                            >
                                                {c.name.trim().charAt(0)}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-[13px] font-semibold text-[#1E293B]">{c.name}</span>
                                                {c.preview && <span className="mt-0.5 block truncate text-[11px] text-[#475569]">{c.preview}</span>}
                                            </span>
                                            {c.time && <span className="shrink-0 text-[10px] text-[#89949D]">{c.time}</span>}
                                        </button>
                                    </li>
                                );
                            })}
                            {!visible.length && <li className="py-10 text-center text-[12px] text-[#89949D]">{t("noResults")}</li>}
                        </ul>
                    </section>

                    {/* المحادثة المفتوحة */}
                    <section className={`${panel} h-[520px] lg:h-auto`}>
                        <div ref={listRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
                            {active?.messages.length ? (
                                active.messages.map((m) => (
                                    <p
                                        key={m.id}
                                        className={`max-w-[75%] rounded-2xl px-5 py-3 text-[14px] leading-[1.8] ${m.from === "me"
                                            ? "self-end bg-[#4B9AD2] text-white"
                                            : "self-start border border-[#CFE3F3] bg-[#EEF5FC] text-[#475569]"
                                            }`}
                                    >
                                        {m.text}
                                    </p>
                                ))
                            ) : (
                                <div className="m-auto flex flex-col items-center text-center text-[#89949D]">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF5FC] text-[#4B9AD2]">
                                        <MessageSquare size={20} />
                                    </span>
                                    <p className="mt-3 text-[12px]">{active ? t("empty", { name: active.name }) : t("pick")}</p>
                                </div>
                            )}
                        </div>

                        <form onSubmit={send} className="flex items-center gap-3 p-4">
                            <input
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                disabled={!active}
                                aria-label={t("placeholder")}
                                placeholder={t("placeholder")}
                                className={`${input} h-11 flex-1 px-4 disabled:bg-[#F7FAFD]`}
                            />
                            <button
                                type="submit"
                                disabled={!draft.trim() || !active}
                                className="h-11 min-w-[96px] shrink-0 cursor-pointer rounded-xl bg-[#4B9AD2] px-5 text-[13px] font-semibold text-white btn-wipe disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {t("send")}
                            </button>
                        </form>
                    </section>
                </div>
    );
}

/** صفحة المحادثات العامة (/chats) — بتفتح من "بدء محادثة" بالملف المهني للحرفي */
export default function Chats() {
    const { t } = useTranslation("chats");
    useLangDir();
    return (
        <div className="relative min-h-dvh overflow-x-hidden bg-white">
            <Header />
            <main className="mx-auto max-w-[1230px] px-5 pb-24 pt-32 sm:px-10 sm:pt-40">
                <h1 className="sr-only">{t("title")}</h1>
                <ChatBox />
            </main>
            <Footer />
        </div>
    );
}
