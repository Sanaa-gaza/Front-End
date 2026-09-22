import React from "react";

export default function FileDropField({ id, label, hint, hintNote, icon = "fa-solid fa-paperclip", file, onChange, error }) {
    return (
        <div className="mb-4">
            {label && <label htmlFor={id} className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">{label}</label>}
            {hint && <p className="text-[#89949D] dark:text-slate-400 text-xs mb-2">{hint}</p>}
            <label
                htmlFor={id}
                className={`flex flex-col items-center justify-center w-full py-8 border-2 border-dashed rounded-lg cursor-pointer text-[#4B9AD2] gap-2 ${error ? "border-red-400" : "border-[#4B9AD2]/50"
                    }`}
            >
                <i className={`${icon} text-[18px]`}></i>
                <span className="text-sm">{file ? file.name : hintNote}</span>
            </label>
            <input type="file" id={id} className="hidden" onChange={onChange} />
            <p className={`text-red-500 text-xs mt-1 text-start ${error ? "" : "hidden"}`}>{error}</p>
        </div>
    );
}