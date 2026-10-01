import React from "react";

/**
 * حقل select موحّد (مدينة/منطقة/حرفة...) — نفس نمط FormField بس للـ <select>.
 * options: [{ value, label }]
 */
export default function SelectField({
    label,
    id,
    icon,
    placeholder,
    value = "",
    onChange,
    error,
    options = [],
    accentColor = "#286292",
    disabled = false,
}) {
    const errorId = `${id}-error`;

    return (
        <div className="mb-4" style={{ "--accent": accentColor }}>
            {label && (
                <label htmlFor={id} className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    id={id}
                    name={id}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    className={`w-full bg-[#F5F6F8] border rounded-lg py-2.5 ps-4 pe-10 text-[12px] appearance-none focus:outline-none focus:ring-1 focus:ring-[#4ba0d8] focus:border-[#4ba0d8] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${value ? "text-[#141415D1]" : "text-[#89949D]"
                        } ${error ? "border-red-400" : "border-[#4B9AD2]"}`}
                >
                    <option value="" disabled hidden>
                        {placeholder}
                    </option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="text-[#141415D1]">
                            {opt.label}
                        </option>
                    ))}
                </select>
                {icon && (
                    <i
                        aria-hidden="true"
                        className={`${icon} absolute top-1/2 -translate-y-1/2 end-3 text-[color:var(--accent)] text-[18px] pointer-events-none`}
                    ></i>
                )}
            </div>
            <p id={errorId} role="alert" className={`text-red-500 text-xs mt-1 text-start ${error ? "" : "hidden"}`}>{error}</p>
        </div>
    );
}
