import React from "react";

/**
 * تبويبات فلترة حسب الحالة (مستخدمة بصفحات المناقصات والمشاريع).
 * tabs: [{ key, label, count }] — الرقم بيختفي لما يكون صفر.
 */
export default function StatusTabs({ tabs, value, onChange }) {
    return (
        <div className="flex flex-wrap gap-2.5" role="tablist">
            {tabs.map(({ key, label, count }) => {
                const active = value === key;
                return (
                    <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(key)}
                        className={`flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-[13px] font-semibold transition-colors ${active
                            ? "border-[#4B9AD2] bg-[#4B9AD2] text-white shadow-[0_4px_12px_rgba(75,154,210,0.3)]"
                            : "border-[#CFE3F3] bg-[#EAF3FB] text-[#38749E] hover:border-[#4B9AD2]"
                            }`}
                    >
                        {label}
                        {count > 0 && (
                            <span
                                className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] tabular-nums ${active ? "bg-white text-[#4B9AD2]" : "bg-white text-[#38749E]"
                                    }`}
                            >
                                {count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
