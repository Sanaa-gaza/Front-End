import React from "react";

export default function FormField({
    label,
    id,
    type = "text",
    value = "",
    onChange,
    error,
    icon,
    onIconClick,
    iconLabel,
    placeholder,
    dir,
    accentColor = "#286292",
    inputProps = {},
}) {
    const errorId = `${id}-error`;
    const { className: extraClassName, ...restInputProps } = inputProps;

    return (
        <div className="mb-4" style={{ "--accent": accentColor }}>
            {label && (
                <label htmlFor={id} className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type={type}
                    id={id}
                    name={id}
                    dir={dir}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    {...restInputProps}
                    className={`w-full bg-[#F5F6F8] dark:bg-slate-800 border rounded-lg py-2.5 text-[12px] text-[#141415D1] dark:text-slate-100 placeholder-[#89949D] focus:outline-none focus:ring-1 focus:ring-[#4ba0d8] focus:border-[#4ba0d8] ${icon ? "pe-10" : "pe-4"} ps-4 ${error ? "border-red-400" : "border-[#4B9AD2]"} ${extraClassName || ""}`}
                />
                {icon && (
                    onIconClick ? (
                        <button
                            type="button"
                            onClick={onIconClick}
                            aria-label={iconLabel}
                            className="absolute top-1/2 -translate-y-1/2 end-3 text-[color:var(--accent)] text-[18px]"
                        >
                            <i aria-hidden="true" className={icon}></i>
                        </button>
                    ) : (
                        <i
                            aria-hidden="true"
                            className={`${icon} absolute top-1/2 -translate-y-1/2 end-3 text-[color:var(--accent)] text-[18px]`}
                        ></i>
                    )
                )}
            </div>
            <p id={errorId} role="alert" className={`text-red-500 text-xs mt-1 text-start ${error ? "" : "hidden"}`}>{error}</p>
        </div>
    );
}