import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Info, X } from "lucide-react";

const MAX = 500;

/**
 * نافذة "طلب معلومات إضافية": اختيار المستندات المطلوب إعادة رفعها + نص المطلوب (إلزامي).
 * documents: [{ key, label }] — recipient: "للحرفي" / "للمؤسسة"...
 * onConfirm({ documents: [keys], message })
 */
export default function InfoRequestModal({ documents, recipient, onConfirm, onClose }) {
    const { t } = useTranslation("adminDashboard");
    const m = "verificationPage.reviewPage.infoModal";
    const [selected, setSelected] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const textRef = useRef(null);
    const closeRef = useRef(onClose);
    useEffect(() => {
        closeRef.current = onClose;
    }, [onClose]);

    // مرة وحدة عند الفتح: Escape بيسكر النافذة، والصفحة اللي وراها ما بتتمرر
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && closeRef.current();
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, []);

    const toggle = (key) => setSelected((list) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key]));

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#141415]/40 p-4 backdrop-blur-[2px]"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="info-title"
                noValidate
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!message.trim()) {
                        setError(t(`${m}.required`));
                        textRef.current?.focus();
                        return;
                    }
                    onConfirm({ documents: selected, message: message.trim() });
                }}
                className="max-h-[92vh] w-full max-w-[388px] overflow-y-auto rounded-[20px] bg-white p-6 shadow-[0_24px_60px_rgba(20,20,21,0.25)]"
            >
                <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E4EFFA] text-[#4B9AD2]">
                        <Info size={22} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h2 id="info-title" className="text-[18px] font-bold text-[#141415]">{t(`${m}.title`)}</h2>
                        <p className="mt-1.5 text-[11px] leading-[1.9] text-[#575757]">{t(`${m}.desc`, { recipient })}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t(`${m}.cancel`)}
                        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#575757] hover:bg-[#F2F4F6]"
                    >
                        <X size={17} />
                    </button>
                </div>

                {/* المستندات المطلوب إعادة رفعها */}
                <fieldset className="mt-5">
                    <legend className="mb-3 text-[12px] font-semibold text-[#141415]">{t(`${m}.documentsLabel`)}</legend>
                    <ul className="flex flex-col gap-3">
                        {documents.map((doc) => (
                            <li key={doc.key}>
                                <label className="flex cursor-pointer items-center gap-2.5 text-[12px] text-[#414141]">
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(doc.key)}
                                        onChange={() => toggle(doc.key)}
                                        className="h-4 w-4 cursor-pointer accent-[#4B9AD2]"
                                    />
                                    {doc.label}
                                </label>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <label htmlFor="info-message" className="mb-2 mt-5 block text-[12px] font-semibold text-[#141415]">
                    {t(`${m}.label`)} *
                </label>
                <div className={`rounded-xl border px-4 pb-1.5 pt-3 focus-within:border-[#4B9AD2] focus-within:ring-1 focus-within:ring-[#4B9AD2] ${error ? "border-red-400" : "border-[#8EC0E4]"}`}>
                    <textarea
                        id="info-message"
                        ref={textRef}
                        rows={3}
                        maxLength={MAX}
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            setError("");
                        }}
                        aria-invalid={!!error}
                        placeholder={t(`${m}.placeholder`)}
                        className="w-full resize-none bg-transparent text-[12px] leading-[1.8] text-[#414141] outline-none placeholder:text-[#89949D]"
                    />
                    <p className="text-end text-[9px] text-[#89949D] tabular-nums" dir="ltr">{message.length} / {MAX}</p>
                </div>
                {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}

                <div className="mt-5 flex gap-3">
                    <button type="submit" className="h-11 flex-1 cursor-pointer rounded-xl bg-[#4B9AD2] text-[13px] font-semibold text-white btn-wipe">
                        {t(`${m}.submit`)}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 flex-1 cursor-pointer rounded-xl bg-[#F2F4F6] text-[13px] font-semibold text-[#414141] hover:bg-[#E6E9EC]"
                    >
                        {t(`${m}.cancel`)}
                    </button>
                </div>
            </form>
        </div>
    );
}
