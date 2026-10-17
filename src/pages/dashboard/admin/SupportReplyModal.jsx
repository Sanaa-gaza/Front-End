import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * نافذة الرد على رسالة تواصل: ملخص (المرسل + النوع) + الموضوع + نص الرد.
 * onSend({ subject, body })
 */
export default function SupportReplyModal({ title, sender, type, onSend, onClose }) {
    const { t } = useTranslation("adminDashboard");
    const m = "supportPage.replyModal";
    const [subject, setSubject] = useState(() => t(`${m}.subjectDefault`, { title }));
    const [body, setBody] = useState("");
    const [errors, setErrors] = useState({});
    const bodyRef = useRef(null);
    const closeRef = useRef(onClose);
    useEffect(() => {
        closeRef.current = onClose;
    }, [onClose]);

    // مرة وحدة عند الفتح: Escape بيسكر النافذة، والصفحة اللي وراها ما بتتمرر
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && closeRef.current();
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        bodyRef.current?.focus();
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        const next = {
            subject: subject.trim() ? "" : t(`${m}.subjectRequired`),
            body: body.trim() ? "" : t(`${m}.bodyRequired`),
        };
        setErrors(next);
        if (next.subject || next.body) return;
        onSend({ subject: subject.trim(), body: body.trim() });
    };

    const box = "w-full rounded-xl border bg-white px-4 text-[13px] text-[#414141] outline-none transition-colors placeholder:text-[#414141] focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#141415]/40 p-4 backdrop-blur-[2px]"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="support-reply-title"
                noValidate
                onSubmit={submit}
                className="flex max-h-[92vh] w-full max-w-[370px] flex-col overflow-y-auto rounded-[22px] border-t-4 border-[#BFDCF1] bg-white px-6 pb-4 pt-6 shadow-[0_24px_60px_rgba(20,20,21,0.25)]"
            >
                <h2 id="support-reply-title" className="text-[16px] font-bold text-[#22455E]">{title}</h2>

                {/* ملخص الرسالة */}
                <div className="mt-5 rounded-xl bg-[#EEF5FC] px-4 py-4">
                    <p className="text-[10px] font-bold text-[#141415]">{sender}</p>
                    <p className="mt-1 text-[9px] text-[#575757]">{t(`${m}.type`)}: {type}</p>
                </div>

                <hr className="my-5 border-[#0000001A]" />

                <label htmlFor="support-subject" className="mb-3 block text-[12px] text-[#575757]">{t(`${m}.subject`)}</label>
                <input
                    id="support-subject"
                    value={subject}
                    onChange={(e) => {
                        setSubject(e.target.value);
                        setErrors((er) => ({ ...er, subject: "" }));
                    }}
                    aria-invalid={!!errors.subject}
                    placeholder={t(`${m}.subjectPlaceholder`)}
                    className={`${box} h-11 ${errors.subject ? "border-red-400" : "border-[#BFD9EC]"}`}
                />
                {errors.subject && <p className="mt-1 text-[11px] text-red-500">{errors.subject}</p>}

                <label htmlFor="support-body" className="mb-3 mt-5 block text-[12px] text-[#575757]">{t(`${m}.body`)}</label>
                <textarea
                    id="support-body"
                    ref={bodyRef}
                    rows={5}
                    value={body}
                    onChange={(e) => {
                        setBody(e.target.value);
                        setErrors((er) => ({ ...er, body: "" }));
                    }}
                    aria-invalid={!!errors.body}
                    placeholder={t(`${m}.bodyPlaceholder`)}
                    className={`${box} resize-none py-3 leading-[1.8] ${errors.body ? "border-red-400" : "border-[#BFD9EC]"}`}
                />
                {errors.body && <p className="mt-1 text-[11px] text-red-500">{errors.body}</p>}

                <div className="-mx-2 mt-5 flex gap-3">
                    <button type="submit" className="h-10 flex-1 cursor-pointer rounded-xl bg-[#4B9AD2] text-[13px] font-semibold text-white btn-wipe">
                        {t(`${m}.send`)}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 flex-1 cursor-pointer rounded-xl border border-[#F2B8BE] text-[13px] font-semibold text-[#D64545] transition-colors hover:bg-[#FFF6F6]"
                    >
                        {t(`${m}.close`)}
                    </button>
                </div>
            </form>
        </div>
    );
}
