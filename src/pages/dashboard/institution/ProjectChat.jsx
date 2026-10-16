import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image as ImageIcon, LayoutGrid, MessagesSquare, Mic, SendHorizontal, Square, SwitchCamera, Video } from "lucide-react";

// خيارات زر المرفقات: كاميرا (تصوير مباشر) / استديو (صور) / فيديو
const ATTACH = [
    { key: "camera", icon: SwitchCamera, accept: "image/*", capture: "environment" },
    { key: "studio", icon: ImageIcon, accept: "image/*" },
    { key: "video", icon: Video, accept: "video/*" },
];

const formatTime = (date, locale) => date.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
const formatSeconds = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * المحادثة المباشرة بصفحة تفاصيل المشروع: نص + صور/فيديو + رسائل صوتية.
 * ⚠️ الرسائل بالصفحة بس لحد ما يصير في endpoint للمحادثات — لما يجهز، ابعتي كل رسالة من addMessage
 */
export default function ProjectChat() {
    const { t, i18n } = useTranslation("institutionDashboard");
    const locale = `${i18n.language}-u-nu-latn`;
    const c = "projectDetails.chat";

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [recording, setRecording] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [error, setError] = useState("");

    const menuRef = useRef(null);
    const fileRef = useRef(null);
    const listRef = useRef(null);
    const recorderRef = useRef(null);
    const urlsRef = useRef([]);

    // روابط الملفات المؤقتة بتنحذف لما نطلع من الصفحة
    useEffect(() => () => urlsRef.current.forEach((u) => URL.revokeObjectURL(u)), []);

    // آخر رسالة دايماً ظاهرة
    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, [messages]);

    // قائمة المرفقات بتسكر بـ Escape أو بالضغط برّاها
    useEffect(() => {
        if (!menuOpen) return undefined;
        const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
        const onDown = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
        window.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onDown);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onDown);
        };
    }, [menuOpen]);

    // عدّاد التسجيل
    useEffect(() => {
        if (!recording) return undefined;
        const id = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(id);
    }, [recording]);

    const addMessage = (msg) => {
        setMessages((list) => [...list, { id: `${Date.now()}-${list.length}`, time: new Date(), ...msg }]);
        setError("");
    };

    const send = (e) => {
        e.preventDefault();
        const value = text.trim();
        if (!value) return;
        addMessage({ type: "text", text: value });
        setText("");
    };

    const pickFile = ({ accept, capture }) => {
        const input = fileRef.current;
        input.accept = accept;
        if (capture) input.setAttribute("capture", capture);
        else input.removeAttribute("capture");
        setMenuOpen(false);
        input.click();
    };

    const onFiles = (e) => {
        Array.from(e.target.files || []).forEach((file) => {
            const url = URL.createObjectURL(file);
            urlsRef.current.push(url);
            addMessage({ type: file.type.startsWith("video/") ? "video" : "image", url, name: file.name });
        });
        e.target.value = "";
    };

    const toggleRecording = async () => {
        if (recording) {
            recorderRef.current?.stop();
            return;
        }
        if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
            setError(t(`${c}.micUnsupported`));
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];
            recorder.ondataavailable = (ev) => ev.data.size && chunks.push(ev.data);
            recorder.onstop = () => {
                stream.getTracks().forEach((tr) => tr.stop());
                setRecording(false);
                if (!chunks.length) return;
                const url = URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType }));
                urlsRef.current.push(url);
                addMessage({ type: "audio", url });
            };
            recorderRef.current = recorder;
            recorder.start();
            setSeconds(0);
            setRecording(true);
            setError("");
        } catch {
            setError(t(`${c}.micDenied`));
        }
    };

    return (
        <section className="rounded-[20px] border border-[#0000000D] bg-white p-5 shadow-[0_4px_24px_rgba(35,74,100,0.08)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF3FB] text-[#286292]">
                        <MessagesSquare size={18} strokeWidth={1.8} />
                    </span>
                    <div>
                        <h2 className="text-[14px] font-semibold text-[#141415]">{t(`${c}.title`)}</h2>
                        <p className="mt-1 max-w-[340px] text-[10px] leading-[2] text-[#89949D]">{t(`${c}.subtitle`)}</p>
                    </div>
                </div>
                <span className="mt-3 flex shrink-0 items-center gap-2 text-[11px] text-[#2EAF4E]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#2EC65A]" aria-hidden="true" />
                    {t(`${c}.online`)}
                </span>
            </div>

            {/* الرسائل */}
            <div ref={listRef} aria-live="polite" className="mt-4 flex max-h-[360px] min-h-[110px] flex-col gap-3 overflow-y-auto py-2">
                {messages.length === 0 ? (
                    <p className="m-auto text-[11px] text-[#B5BDC4]">{t(`${c}.empty`)}</p>
                ) : (
                    messages.map((m) => (
                        <div key={m.id} className="flex max-w-[78%] flex-col items-start gap-1 self-start">
                            <div className="overflow-hidden rounded-2xl rounded-ss-sm bg-[#4B9AD2] text-[12px] leading-[1.8] text-white">
                                {m.type === "text" && <p className="whitespace-pre-wrap break-words px-4 py-2">{m.text}</p>}
                                {m.type === "image" && <img src={m.url} alt={m.name} className="max-h-[220px] w-auto object-cover" />}
                                {m.type === "video" && <video src={m.url} controls className="max-h-[240px] w-auto" />}
                                {m.type === "audio" && (
                                    <div className="px-3 py-2">
                                        <audio src={m.url} controls className="h-9 max-w-[240px]" />
                                    </div>
                                )}
                            </div>
                            <span className="px-1 text-[9px] text-[#89949D]">
                                {t(`${c}.you`)} · {formatTime(m.time, locale)}
                            </span>
                        </div>
                    ))
                )}
            </div>

            {error && <p role="alert" className="mb-2 text-[11px] text-red-500">{error}</p>}

            {/* شريط الكتابة */}
            <form onSubmit={send} className="flex h-[60px] items-center gap-3 rounded-full bg-[#F0F0F0] px-5 shadow-[0_3px_6px_rgba(0,0,0,0.08)]">
                <button
                    type="submit"
                    disabled={!text.trim()}
                    aria-label={t(`${c}.send`)}
                    className="flex shrink-0 cursor-pointer text-[#4B9AD2] disabled:cursor-default disabled:opacity-60"
                >
                    <SendHorizontal size={22} strokeWidth={1.7} />
                </button>
                {recording ? (
                    <p className="flex flex-1 items-center gap-2 text-[13px] text-[#D64545]">
                        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#D64545]" aria-hidden="true" />
                        {t(`${c}.recording`)}
                        <span className="tabular-nums" dir="ltr">{formatSeconds(seconds)}</span>
                    </p>
                ) : (
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={t(`${c}.placeholder`)}
                        aria-label={t(`${c}.placeholder`)}
                        className="min-w-0 flex-1 bg-transparent text-[14px] text-[#414141] outline-none placeholder:text-[#89949D]"
                    />
                )}
                <button
                    type="button"
                    onClick={toggleRecording}
                    aria-label={recording ? t(`${c}.stopRecording`) : t(`${c}.mic`)}
                    aria-pressed={recording}
                    className={`flex shrink-0 cursor-pointer ${recording ? "text-[#D64545]" : "text-[#4B9AD2]"}`}
                >
                    {recording ? <Square size={20} fill="currentColor" /> : <Mic size={22} strokeWidth={1.7} />}
                </button>

                <div ref={menuRef} className="relative flex shrink-0">
                    <button
                        type="button"
                        onClick={() => setMenuOpen((v) => !v)}
                        disabled={recording}
                        aria-label={t(`${c}.attach`)}
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                        className="flex cursor-pointer text-[#4B9AD2] disabled:cursor-default disabled:opacity-50"
                    >
                        <LayoutGrid size={22} strokeWidth={1.7} />
                    </button>
                    {menuOpen && (
                        <ul
                            role="menu"
                            className="absolute end-[-22px] top-[calc(100%+22px)] z-30 w-[140px] rounded-xl bg-white px-1.5 py-1 shadow-[0_6px_18px_rgba(0,0,0,0.16)]"
                        >
                            {ATTACH.map((opt, i) => (
                                <li key={opt.key} className={i > 0 ? "border-t border-dashed border-[#D5D9DD]" : ""}>
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => pickFile(opt)}
                                        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2.5 text-[14px] font-semibold text-[#575757] hover:bg-[#F5F8FB]"
                                    >
                                        <opt.icon size={22} strokeWidth={1.5} className="text-[#4B9AD2]" />
                                        {t(`${c}.${opt.key}`)}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <input ref={fileRef} type="file" multiple className="hidden" onChange={onFiles} />
            </form>
        </section>
    );
}
