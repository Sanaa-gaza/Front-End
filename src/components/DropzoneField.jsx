import React, { useState } from "react";

/**
 * صندوق رفع ملف بشكل منقّط (drag & drop) — يستخدم لصورة الهوية، رخصة تجارية...
 */
export default function DropzoneField({ id, label, hint, icon = "fa-regular fa-image", dropHint, file, onChange, error }) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) onChange({ target: { files: [droppedFile] } });
    };

    return (
        <div className="mb-4">
            {label && <label htmlFor={id} className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">{label}</label>}
            {hint && <p className="text-[#89949D] dark:text-slate-400 text-xs mb-2 leading-[1.6]">{hint}</p>}

            <label
                htmlFor={id}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center w-full py-8 border-2 border-dashed rounded-lg cursor-pointer gap-2 transition-colors ${isDragging ? "bg-[#EAF2F8]" : "bg-white dark:bg-slate-900"
                    } ${error ? "border-red-400" : "border-[#4B9AD2]"}`}
            >
                <i className={`${icon} text-[#4B9AD2] text-[18px]`}></i>
                <span className="text-sm text-[#89949D] dark:text-slate-400">{file ? file.name : dropHint}</span>
            </label>
            <input type="file" id={id} accept="image/*" className="hidden" onChange={onChange} />
            <p className={`text-red-500 text-xs mt-1 text-start ${error ? "" : "hidden"}`}>{error}</p>
        </div>
    );
}