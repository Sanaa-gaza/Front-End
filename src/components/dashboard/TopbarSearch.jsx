import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, X } from "lucide-react";

// أقصى عدد نتائج بكل قسم لما يكون الفلتر "الكل"
const PER_SECTION = 4;

const normalize = (text) =>
    String(text || "")
        .toLowerCase()
        // بنوحّد الهمزات والتاء المربوطة والألف المقصورة عشان البحث بالعربي يكون أسهل
        .replace(/[أإآ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/ى/g, "ي")
        .trim();

/**
 * خانة البحث بالشريط العلوي: نتائج بتنزل تحتها مع فلتر حسب أقسام اللوحة.
 * sections: [{ key, label, icon }] — ترتيب الأقسام والفلاتر
 * items:    [{ id, section, title, subtitle, keywords, to }]
 */
export default function TopbarSearch({ sections, items }) {
    const { t } = useTranslation("dashboard");
    const navigate = useNavigate();
    const wrapRef = useRef(null);
    const inputRef = useRef(null);
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const [open, setOpen] = useState(false);

    // Escape أو الضغط برا الخانة بيسكر النتائج
    useEffect(() => {
        if (!open) return undefined;
        const onDown = (e) => wrapRef.current && !wrapRef.current.contains(e.target) && setOpen(false);
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [open]);

    const q = normalize(query);
    const matches = items.filter(
        (item) =>
            (filter === "all" || item.section === filter) &&
            (!q || normalize([item.title, item.subtitle, ...(item.keywords || [])].join(" ")).includes(q))
    );
    // عدد النتائج بكل قسم (للأرقام على الفلاتر)
    const countFor = (key) =>
        items.filter((item) => item.section === key && (!q || normalize([item.title, item.subtitle, ...(item.keywords || [])].join(" ")).includes(q))).length;

    const groups = sections
        .map((section) => {
            const list = matches.filter((item) => item.section === section.key);
            return { ...section, list: filter === "all" ? list.slice(0, PER_SECTION) : list, more: list.length };
        })
        .filter((g) => g.list.length);
    const first = groups[0]?.list[0];

    const go = (item) => {
        setOpen(false);
        setQuery("");
        inputRef.current?.blur();
        navigate(item.to);
    };

    return (
        <div ref={wrapRef} className="relative hidden md:block">
            <label className="relative block">
                <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            setOpen(false);
                            inputRef.current?.blur();
                        } else if (e.key === "Enter" && first) {
                            e.preventDefault();
                            go(first);
                        }
                    }}
                    placeholder={t("search")}
                    aria-label={t("search")}
                    aria-expanded={open}
                    aria-controls="topbar-search-results"
                    className="h-9 w-[300px] rounded-full border border-[#4B9AD2] bg-white pe-4 ps-9 text-[12px] text-[#414141] outline-none placeholder-[#89949D] focus:ring-1 focus:ring-[#4B9AD2] xl:w-[380px] [&::-webkit-search-cancel-button]:hidden"
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => {
                            setQuery("");
                            inputRef.current?.focus();
                        }}
                        aria-label={t("searchBox.clear")}
                        className="absolute end-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#89949D] hover:bg-[#EAF3FB]"
                    >
                        <X size={12} />
                    </button>
                )}
            </label>

            {open && (
                <div
                    id="topbar-search-results"
                    className="absolute end-0 top-full z-50 mt-2 w-[460px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[20px] border border-[#0000000D] bg-white shadow-[0_18px_50px_rgba(35,74,100,0.18)]"
                >
                    {/* فلتر الأقسام */}
                    <div className="flex flex-wrap gap-1.5 border-b border-[#0000000D] px-4 py-3" role="tablist">
                        {[{ key: "all", label: t("searchBox.all") }, ...sections].map(({ key, label }) => {
                            const active = filter === key;
                            const count = key === "all" ? null : countFor(key);
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() => {
                                        setFilter(key);
                                        inputRef.current?.focus();
                                    }}
                                    className={`flex h-7 cursor-pointer items-center gap-1 rounded-full border px-3 text-[11px] transition-colors ${active
                                        ? "border-[#4B9AD2] bg-[#4B9AD2] text-white"
                                        : "border-[#E3E9EE] bg-[#F5F8FA] text-[#575757] hover:border-[#8EC0E4]"
                                        }`}
                                >
                                    {label}
                                    {q && count > 0 && <span className={`tabular-nums ${active ? "text-white/80" : "text-[#89949D]"}`}>({count})</span>}
                                </button>
                            );
                        })}
                    </div>

                    <div className="max-h-[380px] overflow-y-auto px-2 py-2">
                        {groups.length ? (
                            groups.map(({ key, label, icon: Icon, list, more }) => (
                                <section key={key} className="py-1">
                                    <h3 className="flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-[#89949D]">
                                        <span className="flex items-center gap-1.5">
                                            {Icon && <Icon size={13} />}
                                            {label}
                                        </span>
                                        {filter === "all" && more > list.length && (
                                            <button
                                                type="button"
                                                onClick={() => setFilter(key)}
                                                className="cursor-pointer font-medium text-[#4B9AD2] hover:underline"
                                            >
                                                {t("searchBox.showAll", { count: more })}
                                            </button>
                                        )}
                                    </h3>
                                    <ul>
                                        {list.map((item) => (
                                            <li key={`${item.section}-${item.id}`}>
                                                <button
                                                    type="button"
                                                    onClick={() => go(item)}
                                                    className={`flex w-full cursor-pointer flex-col rounded-xl px-3 py-2 text-start transition-colors hover:bg-[#EAF3FB] ${item === first && q ? "bg-[#F4F9FD]" : ""
                                                        }`}
                                                >
                                                    <span className="text-[12px] font-semibold text-[#22455E]">{item.title}</span>
                                                    {item.subtitle && <span className="mt-0.5 text-[10px] text-[#89949D]">{item.subtitle}</span>}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            ))
                        ) : (
                            <p className="px-3 py-8 text-center text-[12px] text-[#89949D]">{t("searchBox.empty")}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
