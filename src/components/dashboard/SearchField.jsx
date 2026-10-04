import React from "react";
import { Search } from "lucide-react";

/** خانة بحث بعرض كامل للصفحات داخل لوحة التحكم */
export default function SearchField({ value, onChange, placeholder }) {
    return (
        <label className="relative block">
            <Search size={16} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
            <input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-11 w-full rounded-xl border border-[#8EC0E4] bg-white ps-10 pe-4 text-[13px] text-[#414141] outline-none placeholder:text-[#89949D] focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]"
            />
        </label>
    );
}
