import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronRight, MessagesSquare, Search, X } from "lucide-react";

// ===== بيانات تجريبية =====
// الباك إند لسا ما فيه endpoint لمحادثات الأدمن. لما يجهز، استبدلي CHATS بطلب من src/api/endpoints.js
// النصوص (الاسم والرسائل) بملف الترجمة: chatsPage.sample.<id>
const CHATS = [
    { id: "h1", type: "team", hoursAgo: 5 },
    { id: "h2", type: "contractor", hoursAgo: 5 },
    { id: "h3", type: "craftsman", hoursAgo: 7 },
    { id: "h4", type: "institution", hoursAgo: 9 },
    { id: "h5", type: "customer", hoursAgo: 26 },
    { id: "h6", type: "contractor", hoursAgo: 50 },
];

const TYPES = ["all", "craftsman", "team", "contractor", "institution", "customer"];

const panel = "rounded-[22px] border border-[#0000000D] border-t-2 border-t-[#9CC9EA] bg-white shadow-[0_4px_20px_rgba(35,74,100,0.08)]";

/** المحادثات: قائمة على جنب (بحث + فلتر نوع الحساب) والمحادثة المختارة جنبها */
export default function AdminChats() {
    const { t } = useTranslation("adminDashboard");
    const c = "chatsPage";
    const [query, setQuery] = useState("");
    const [type, setType] = useState("all");
    const [selectedId, setSelectedId] = useState(null);
    const [text, setText] = useState("");
    // ⚠️ الرسائل الجديدة بالصفحة بس لحد ما يصير في endpoint: { [chatId]: [نصوص] }
    const [sent, setSent] = useState({});
    const listRef = useRef(null);

    const name = (id) => t(`${c}.sample.${id}.name`);
    const incoming = (id) => {
        const list = t(`${c}.sample.${id}.messages`, { returnObjects: true });
        return Array.isArray(list) ? list : [];
    };
    const ago = (h) => (h < 24 ? t(`${c}.hoursAgo`, { count: h }) : t(`${c}.daysAgo`, { count: Math.round(h / 24) }));

    const q = query.trim().toLowerCase();
    const chats = CHATS.filter((x) => (type === "all" || x.type === type) && (!q || name(x.id).toLowerCase().includes(q)));
    const selected = CHATS.find((x) => x.id === selectedId);
    const messages = selected
        ? [...incoming(selected.id).map((m) => ({ text: m, mine: false })), ...(sent[selected.id] || []).map((m) => ({ text: m, mine: true }))]
        : [];

    // آخر رسالة دايماً ظاهرة
    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, [selectedId, messages.length]);

    const send = (e) => {
        e.preventDefault();
        const value = text.trim();
        if (!value || !selected) return;
        setSent((s) => ({ ...s, [selected.id]: [...(s[selected.id] || []), value] }));
        setText("");
    };

    // آخر رسالة بالمحادثة (للمعاينة بالقائمة)
    const preview = (id) => {
        const mine = sent[id];
        if (mine?.length) return `${t(`${c}.you`)}: ${mine[mine.length - 1]}`;
        const list = incoming(id);
        return list[0] || "";
    };

    return (
        <div className="mx-auto grid max-w-[1100px] items-stretch gap-4 lg:h-[calc(100dvh-140px)] lg:min-h-[480px] lg:grid-cols-[300px_1fr]">
            {/* قائمة المحادثات (على الجوال بتختفي لما تنفتح محادثة) */}
            <section className={`${panel} flex min-h-0 flex-col p-3 ${selected ? "hidden lg:flex" : "flex"}`}>
                <div className="flex gap-2 px-1 pt-3">
                    <label className="relative block min-w-0 flex-1">
                        <Search size={14} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t(`${c}.search`)}
                            aria-label={t(`${c}.search`)}
                            className="h-9 w-full rounded-xl border border-[#8EC0E4] bg-white pe-8 ps-8 text-[10px] text-[#414141] outline-none placeholder:text-[#89949D] focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2] [&::-webkit-search-cancel-button]:hidden"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                aria-label={t(`${c}.clearSearch`)}
                                className="absolute end-2 top-1/2 flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#575757] hover:bg-[#EEF5FC]"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </label>
                    {/* فلتر نوع الحساب — بالتصميم بيظهر كسهم بس، والاختيار بيظهر لما تفتحه */}
                    <div className="relative w-12 shrink-0">
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            aria-label={t(`${c}.filter`)}
                            title={t(`${c}.types.${type}`)}
                            className="h-9 w-full cursor-pointer appearance-none rounded-xl border border-[#8EC0E4] bg-white text-transparent outline-none focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]"
                        >
                            {TYPES.map((k) => (
                                <option key={k} value={k} className="text-[#414141]">{t(`${c}.types.${k}`)}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                        {type !== "all" && <span className="absolute -top-1 end-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#4B9AD2]" aria-hidden="true" />}
                    </div>
                </div>

                <ul className="mt-4 min-h-0 flex-1 divide-y divide-[#0000000F] overflow-y-auto px-1">
                    {chats.map((x) => {
                        const n = name(x.id);
                        const active = x.id === selectedId;
                        return (
                            <li key={x.id}>
                                <button
                                    type="button"
                                    onClick={() => setSelectedId(x.id)}
                                    aria-pressed={active}
                                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-4 text-start transition-colors ${active ? "bg-[#EEF5FC]" : "hover:bg-[#F7FAFD]"}`}
                                >
                                    <span
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${active ? "bg-[#4B9AD2] text-white" : "bg-[#EEF5FC] text-[#575757]"
                                            }`}
                                    >
                                        {n.trim().charAt(0)}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-[11px] font-semibold text-[#141415]">{n}</span>
                                        <span className="mt-1 block truncate text-[8px] text-[#575757]">{preview(x.id)}</span>
                                    </span>
                                    <span className="shrink-0 self-center text-[8px] text-[#89949D]">{ago(x.hoursAgo)}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
                {chats.length === 0 && <p className="px-2 py-10 text-center text-[11px] text-[#89949D]">{t(`${c}.empty`)}</p>}
            </section>

            {/* المحادثة المختارة */}
            <section className={`${panel} min-h-[420px] flex-col ${selected ? "flex" : "hidden lg:flex"}`}>
                {selected ? (
                    <>
                        <h2 className="sr-only">{name(selected.id)}</h2>
                        <button
                            type="button"
                            onClick={() => setSelectedId(null)}
                            className="mx-4 mt-4 inline-flex w-fit cursor-pointer items-center gap-1 text-[12px] text-[#4B9AD2] lg:hidden"
                        >
                            <ChevronRight size={16} className="ltr:rotate-180" />
                            {t(`${c}.back`)}
                        </button>

                        <div ref={listRef} aria-live="polite" className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-6">
                            {messages.map((m, i) => (
                                <p
                                    key={i}
                                    className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-5 py-3 text-[14px] leading-[1.8] ${m.mine
                                        ? "self-end bg-[#4B9AD2] text-white"
                                        : "self-start border border-[#BFDCF1] bg-[#EEF5FC] text-[#414141]"
                                        }`}
                                >
                                    {m.text}
                                </p>
                            ))}
                        </div>

                        <form onSubmit={send} className="flex items-center gap-3 p-4">
                            <input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder={t(`${c}.placeholder`)}
                                aria-label={t(`${c}.placeholder`)}
                                className="h-11 min-w-0 flex-1 rounded-xl border border-[#4B9AD2] bg-white px-4 text-[13px] text-[#414141] outline-none placeholder:text-[#89949D] focus:ring-1 focus:ring-[#4B9AD2]"
                            />
                            <button
                                type="submit"
                                disabled={!text.trim()}
                                className="h-11 shrink-0 cursor-pointer rounded-lg bg-[#4B9AD2] px-7 text-[13px] font-semibold text-white btn-wipe disabled:cursor-default disabled:opacity-60"
                            >
                                {t(`${c}.send`)}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                        <MessagesSquare size={28} className="text-[#BFD9EC]" aria-hidden="true" />
                        <p className="text-[17px] text-[#38749E]">{t(`${c}.selectHint`)}</p>
                    </div>
                )}
            </section>
        </div>
    );
}
