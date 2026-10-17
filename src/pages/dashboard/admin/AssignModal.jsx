import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * نافذة إسناد عامة (لمسؤول من الفريق أو لمزود خدمة): ملخص + قائمة اختيار.
 * texts: { title, label, placeholder, required, submit, cancel }
 * options: [{ value, label }] — onConfirm(value)
 */
export default function AssignModal({ summary, texts, options, onConfirm, onClose }) {
    const [value, setValue] = useState("");
    const [error, setError] = useState("");
    const selectRef = useRef(null);
    const closeRef = useRef(onClose);
    useEffect(() => {
        closeRef.current = onClose;
    }, [onClose]);

    // مرة وحدة عند الفتح: Escape بيسكر النافذة، والصفحة اللي وراها ما بتتمرر
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && closeRef.current();
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        selectRef.current?.focus();
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, []);

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#141415]/40 p-4 backdrop-blur-[2px]"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="assign-title"
                noValidate
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!value) {
                        setError(texts.required);
                        return;
                    }
                    onConfirm(value);
                }}
                className="w-full max-w-[400px] rounded-[20px] border-t-4 border-[#BFDCF1] bg-white p-6 shadow-[0_24px_60px_rgba(20,20,21,0.25)]"
            >
                <h2 id="assign-title" className="text-[16px] font-bold text-[#22455E]">{texts.title}</h2>
                <p className="mt-3 rounded-xl bg-[#EEF5FC] px-4 py-3 text-[12px] font-bold text-[#141415]">{summary}</p>

                <label htmlFor="assign-value" className="mb-2 mt-5 block text-[12px] text-[#575757]">{texts.label}</label>
                <div className="relative">
                    <select
                        id="assign-value"
                        ref={selectRef}
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            setError("");
                        }}
                        aria-invalid={!!error}
                        className={`h-11 w-full cursor-pointer appearance-none rounded-xl border bg-white pe-10 ps-4 text-[12px] outline-none focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2] ${value ? "text-[#414141]" : "text-[#89949D]"
                            } ${error ? "border-red-400" : "border-[#8EC0E4]"}`}
                    >
                        <option value="" disabled>{texts.placeholder}</option>
                        {options.map((o) => (
                            <option key={o.value} value={o.value} className="text-[#414141]">{o.label}</option>
                        ))}
                    </select>
                    <ChevronDown size={17} className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                </div>
                {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}

                <div className="mt-6 flex gap-3">
                    <button type="submit" className="h-10 flex-1 cursor-pointer rounded-xl bg-[#4B9AD2] text-[13px] font-semibold text-white btn-wipe">
                        {texts.submit}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 flex-1 cursor-pointer rounded-xl bg-[#F2F4F6] text-[13px] font-semibold text-[#414141] hover:bg-[#E6E9EC]"
                    >
                        {texts.cancel}
                    </button>
                </div>
            </form>
        </div>
    );
}
