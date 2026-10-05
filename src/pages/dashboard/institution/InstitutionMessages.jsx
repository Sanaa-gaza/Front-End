import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, LayoutGrid, Mail, Paperclip, Search, X } from "lucide-react";
import StatusTabs from "../../../components/dashboard/StatusTabs";
import { getStoredUser } from "../../../api/session";

// ===== بيانات تجريبية =====
// الباك إند لسا ما فيه endpoints للمراسلات. لما تجهز، استبدلي MESSAGES بطلب من src/api/endpoints.js
// box: inbox (وارد) | outbox (صادر) | archive (مؤرشف) — project: رقم مشروع من صفحة المشاريع الجارية
const MESSAGES = [
    { id: "m1", box: "inbox", status: "new", project: "p1", ref: "REF-2026-014", date: "2026-09-02", attachments: ["extension-request.pdf"] },
    { id: "m2", box: "inbox", status: "new", project: "p3", ref: "REF-2026-015", date: "2026-09-02", attachments: ["invoice-phase-2.pdf", "photos.jpg"] },
    { id: "m3", box: "inbox", status: "new", project: "p1", ref: "REF-2026-016", date: "2026-09-02", attachments: [] },
    { id: "m4", box: "inbox", status: "read", project: "p4", ref: "REF-2026-017", date: "2026-09-03", attachments: ["phase-report.pdf"] },
    { id: "m5", box: "outbox", status: "replied", project: "p1", ref: "OUT-2026-008", date: "2026-09-04", attachments: [] },
    { id: "m6", box: "outbox", status: "replied", project: "p3", ref: "OUT-2026-009", date: "2026-09-05", attachments: [] },
    { id: "m7", box: "outbox", status: "replied", project: "p4", ref: "OUT-2026-010", date: "2026-09-06", attachments: [] },
    { id: "m8", box: "archive", status: "read", project: "p2", ref: "REF-2026-003", date: "2026-08-20", attachments: ["handover.pdf"] },
];

const PROJECTS = ["p1", "p2", "p3", "p4"];
const TABS = ["inbox", "outbox", "archive"];
const STATUSES = ["new", "reviewing", "read", "replied", "forwarded"];

const STATUS_STYLES = {
    new: "bg-[#DDF6E3] text-[#2EAF4E]",
    reviewing: "bg-[#FDEBD3] text-[#D9822B]",
    read: "bg-[#EEF0F2] text-[#6B7280]",
    replied: "bg-[#DCEBFA] text-[#4B9AD2]",
    forwarded: "bg-[#EFE6FA] text-[#8A5CC2]",
};

const card = "rounded-[20px] border border-[#0000000D] bg-white shadow-[0_4px_24px_rgba(35,74,100,0.08)]";
const field =
    "h-11 w-full rounded-xl border border-[#8EC0E4] bg-white text-[12px] text-[#414141] outline-none transition-colors focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";

/**
 * نص المراسلة: الردود اللي انكتبت بالصفحة نصها محفوظ معها (custom)،
 * والبيانات التجريبية نصها بملف الترجمة.
 */
function messageText(t, m, key) {
    return m.custom?.[key] ?? t(`messagesPage.sample.${m.id}.${key}`);
}

/** قائمة منسدلة بأيقونة مربعات بالبداية وسهم بالنهاية */
function FilterSelect({ value, onChange, label, children }) {
    return (
        <div className="relative min-w-0 md:w-[200px]">
            <LayoutGrid size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label={label}
                className={`${field} cursor-pointer appearance-none ps-9 pe-9 ${value === "all" ? "text-[#89949D]" : ""}`}
            >
                {children}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
        </div>
    );
}

/** لوحة التفاصيل — بدون اختيار بتعرض تلميح والأزرار معطّلة */
function MessageDetails({ message, onAction }) {
    const { t } = useTranslation("institutionDashboard");

    const institutionName = getStoredUser()?.full_name || "";
    // الوارد: من الجهة إلى المؤسسة، والصادر بالعكس
    const outgoing = message?.box === "outbox";
    const party = message && messageText(t, message, "party");
    const btn = "h-10 flex-1 cursor-pointer rounded-lg text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <section className={`${card} flex min-h-[260px] flex-col p-5 lg:sticky lg:top-24`}>
            {message ? (
                <div className="flex-1">
                    <h3 className="text-[16px] font-bold text-[#414141]">{messageText(t, message, "title")}</h3>
                    <p className="mt-1 text-[12px] font-semibold text-[#414141]">
                        {t("messagesPage.project")}: {t(`projectsPage.sample.${message.project}.title`)}
                    </p>

                    <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1.5 text-[11px] text-[#575757]">
                        <dt>{t("messagesPage.from")}:</dt>
                        <dd>{outgoing ? institutionName : party}</dd>
                        <dt>{t("messagesPage.to")}:</dt>
                        <dd>{outgoing ? party : institutionName}</dd>
                        <dt>{t("messagesPage.type")}:</dt>
                        <dd>{messageText(t, message, "type")}</dd>
                    </dl>

                    <hr className="my-4 border-[#0000001A]" />

                    <p className="mb-2 text-[11px] text-[#89949D]">{t("messagesPage.text")}</p>
                    <p className="whitespace-pre-line rounded-xl border border-[#BFD9EC] px-4 py-3 text-[12px] leading-[1.9] text-[#414141]">
                        {messageText(t, message, "body")}
                    </p>

                    <p className="mb-2 mt-4 text-[11px] text-[#89949D]">{t("messagesPage.attachments")}</p>
                    {message.attachments.length ? (
                        <ul className="flex flex-wrap gap-2">
                            {message.attachments.map((file) => (
                                <li
                                    key={file}
                                    title={file}
                                    className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-[#8EC0E4] text-[12px] font-medium uppercase text-[#4B9AD2]"
                                >
                                    {file.split(".").pop()}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-[11px] text-[#89949D]">{t("messagesPage.noAttachments")}</p>
                    )}
                </div>
            ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
                    <Mail size={28} className="text-[#BFD9EC]" />
                    <p className="text-[14px] font-semibold text-[#414141]">{t("messagesPage.selectHint")}</p>
                </div>
            )}

            <div className="mt-5 flex gap-3">
                <button
                    type="button"
                    disabled={!message || outgoing}
                    onClick={() => onAction(message, "reply")}
                    className={`${btn} bg-[#4B9AD2] text-white btn-wipe`}
                >
                    {t("messagesPage.reply")}
                </button>
                <button
                    type="button"
                    disabled={!message || outgoing}
                    onClick={() => onAction(message, "forward")}
                    className={`${btn} border border-[#4B9AD2] text-[#4B9AD2] btn-wipe btn-wipe-outline`}
                >
                    {t("messagesPage.forward")}
                </button>
            </div>
        </section>
    );
}

/** نافذة "رد رسمي" و"تحويل للموظف" — نفس الشكل، mode: reply | forward */
function ReplyModal({ message, mode, onClose, onSend }) {
    const { t } = useTranslation("institutionDashboard");
    const title = messageText(t, message, "title");
    const isForward = mode === "forward";
    const [subject, setSubject] = useState(() =>
        t(isForward ? "messagesPage.replyModal.forwardSubjectDefault" : "messagesPage.replyModal.subjectDefault", { title })
    );
    const [body, setBody] = useState("");
    const [files, setFiles] = useState([]);
    const [errors, setErrors] = useState({});
    const [dragging, setDragging] = useState(false);
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

    const addFiles = (list) => {
        const picked = Array.from(list || []);
        if (picked.length) setFiles((f) => [...f, ...picked]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const next = {
            subject: subject.trim() ? "" : t("messagesPage.replyModal.subjectRequired"),
            body: body.trim() ? "" : t("messagesPage.replyModal.bodyRequired"),
        };
        setErrors(next);
        if (Object.values(next).some(Boolean)) return;
        onSend({ subject: subject.trim(), body: body.trim(), files: files.map((f) => f.name) });
    };

    const input =
        "w-full rounded-xl border bg-white px-4 text-[13px] text-[#414141] outline-none transition-colors focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#141415]/40 p-4 backdrop-blur-[2px]"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="reply-title"
                onSubmit={handleSubmit}
                noValidate
                className="flex max-h-[92vh] w-full max-w-[520px] flex-col overflow-hidden rounded-[24px] border-t-4 border-[#BFDCF1] bg-white shadow-[0_24px_60px_rgba(20,20,21,0.25)]"
            >
                <div className="overflow-y-auto p-6">
                    <h2 id="reply-title" className="text-[17px] font-bold text-[#22455E]">
                        {isForward ? t("messagesPage.replyModal.forwardTitle") : t("messagesPage.replyModal.title")}
                    </h2>

                    {/* ملخص المراسلة اللي بنرد عليها */}
                    <div className="mt-4 rounded-xl bg-[#EAF3FB] px-4 py-3">
                        <p className="text-[10px] text-[#89949D]">
                            {t("messagesPage.replyModal.ref")}{" "}
                            <bdi dir="ltr">{message.ref}</bdi>
                        </p>
                        <p className="mt-1 text-[13px] font-bold text-[#414141]">{title}</p>
                        <p className="mt-1 text-[11px] text-[#575757]">
                            {t("messagesPage.type")}: {messageText(t, message, "type")}
                        </p>
                    </div>

                    <hr className="my-5 border-[#0000001A]" />

                    <label htmlFor="reply-subject" className="mb-1.5 block text-[12px] text-[#575757]">
                        {t("messagesPage.replyModal.subject")}
                    </label>
                    <input
                        id="reply-subject"
                        value={subject}
                        onChange={(e) => {
                            setSubject(e.target.value);
                            setErrors((er) => ({ ...er, subject: "" }));
                        }}
                        className={`${input} h-11 ${errors.subject ? "border-red-400" : "border-[#8EC0E4]"}`}
                    />
                    {errors.subject && <p className="mt-1 text-[11px] text-red-500">{errors.subject}</p>}

                    <label htmlFor="reply-body" className="mb-1.5 mt-4 block text-[12px] text-[#575757]">
                        {t("messagesPage.replyModal.body")}
                    </label>
                    <textarea
                        id="reply-body"
                        ref={bodyRef}
                        rows={5}
                        value={body}
                        onChange={(e) => {
                            setBody(e.target.value);
                            setErrors((er) => ({ ...er, body: "" }));
                        }}
                        placeholder={t("messagesPage.replyModal.bodyPlaceholder")}
                        className={`${input} resize-none py-3 placeholder:text-[#89949D] ${errors.body ? "border-red-400" : "border-[#8EC0E4]"}`}
                    />
                    {errors.body && <p className="mt-1 text-[11px] text-red-500">{errors.body}</p>}

                    <p className="mb-1.5 mt-4 text-[12px] text-[#575757]">{t("messagesPage.replyModal.attachments")}</p>
                    <label
                        htmlFor="reply-files"
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragging(false);
                            addFiles(e.dataTransfer.files);
                        }}
                        className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-center text-[11px] text-[#4B9AD2] transition-colors ${dragging ? "border-[#4B9AD2] bg-[#EAF3FB]" : "border-[#8EC0E4]"
                            }`}
                    >
                        <Paperclip size={14} />
                        {t("messagesPage.replyModal.dropHint")}
                    </label>
                    <input
                        id="reply-files"
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                            addFiles(e.target.files);
                            e.target.value = "";
                        }}
                    />
                    {files.length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-2">
                            {files.map((f, i) => (
                                <li
                                    key={`${f.name}-${i}`}
                                    className="flex items-center gap-1.5 rounded-full bg-[#EAF3FB] py-1 pe-1.5 ps-3 text-[11px] text-[#38749E]"
                                >
                                    <span className="max-w-[160px] truncate" dir="ltr">{f.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => setFiles((list) => list.filter((_, j) => j !== i))}
                                        aria-label={t("messagesPage.replyModal.removeFile", { name: f.name })}
                                        className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full hover:bg-white"
                                    >
                                        <X size={12} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex gap-3 border-t border-[#0000000F] px-6 py-4">
                    <button
                        type="submit"
                        className="h-11 flex-1 cursor-pointer rounded-xl bg-[#4B9AD2] text-[14px] font-semibold text-white btn-wipe"
                    >
                        {isForward ? t("messagesPage.replyModal.forwardSend") : t("messagesPage.replyModal.send")}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 flex-1 cursor-pointer rounded-xl border border-[#E8A5AB] text-[14px] font-semibold text-[#D64545] transition-colors hover:bg-[#FFF6F6]"
                    >
                        {t("messagesPage.replyModal.close")}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function InstitutionMessages() {
    const { t } = useTranslation("institutionDashboard");
    const [tab, setTab] = useState("inbox");
    const [query, setQuery] = useState("");
    const [submitted, setSubmitted] = useState("");
    const [project, setProject] = useState("all");
    const [status, setStatus] = useState("all");
    const [selectedId, setSelectedId] = useState(null);
    // { message, mode: "reply" | "forward" }
    const [dialog, setDialog] = useState(null);
    const [flash, setFlash] = useState("");

    // تغييرات محلية لحد ما يجهز الباك إند: حالات اتغيرت + ردود انكتبت بالصفحة
    const [statusChanges, setStatusChanges] = useState({});
    const [sentReplies, setSentReplies] = useState([]);
    const messages = useMemo(
        () =>
            [...sentReplies, ...MESSAGES].map((m) =>
                statusChanges[m.id] ? { ...m, status: statusChanges[m.id] } : m
            ),
        [statusChanges, sentReplies]
    );

    const select = (m) => {
        setFlash("");
        if (m.id === selectedId) {
            setSelectedId(null);
            return;
        }
        setSelectedId(m.id);
        // فتح مراسلة جديدة بيحوّلها لـ "قيد مراجعة"
        if (m.status === "new") setStatusChanges((c) => ({ ...c, [m.id]: "reviewing" }));
    };

    const handleSend = ({ subject, body, files }) => {
        const { message: original, mode } = dialog;
        const isForward = mode === "forward";
        const today = new Date().toISOString().slice(0, 10);
        setSentReplies((list) => [
            {
                id: `reply-${Date.now()}`,
                box: "outbox",
                status: isForward ? "forwarded" : "replied",
                project: original.project,
                ref: `OUT-${today.slice(0, 4)}-${String(list.length + 11).padStart(3, "0")}`,
                date: today,
                attachments: files,
                custom: {
                    title: subject,
                    body,
                    party: messageText(t, original, "party"),
                    type: isForward ? t("messagesPage.replyModal.forwardType") : t("messagesPage.replyModal.replyType"),
                },
            },
            ...list,
        ]);
        if (!isForward) setStatusChanges((c) => ({ ...c, [original.id]: "replied" }));
        setDialog(null);
        setFlash(isForward ? t("messagesPage.replyModal.forwarded") : t("messagesPage.replyModal.sent"));
    };

    const counts = useMemo(() => {
        const c = {};
        messages.forEach((m) => {
            c[m.box] = (c[m.box] || 0) + 1;
        });
        return c;
    }, [messages]);

    const list = useMemo(() => {
        const q = submitted.trim().toLowerCase();
        return messages.filter((m) => {
            if (m.box !== tab) return false;
            if (project !== "all" && m.project !== project) return false;
            if (status !== "all" && m.status !== status) return false;
            if (!q) return true;
            const title = messageText(t, m, "title").toLowerCase();
            return title.includes(q) || m.ref.toLowerCase().includes(q);
        });
    }, [messages, tab, project, status, submitted, t]);

    // المراسلة المختارة لازم تكون ظاهرة بالقائمة الحالية
    const selected = list.find((m) => m.id === selectedId) || null;

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-5">
            {/* البحث والفلاتر */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(query);
                }}
                className="flex flex-col gap-3 md:flex-row md:items-center"
            >
                <div className="relative min-w-0 flex-1">
                    <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t("messagesPage.search")}
                        aria-label={t("messagesPage.search")}
                        className={`${field} ps-9 pe-4 placeholder:text-[#89949D]`}
                    />
                </div>

                <FilterSelect value={project} onChange={setProject} label={t("messagesPage.allProjects")}>
                    <option value="all">{t("messagesPage.allProjects")}</option>
                    {PROJECTS.map((p) => (
                        <option key={p} value={p} className="font-bold">
                            {t(`projectsPage.sample.${p}.title`)}
                        </option>
                    ))}
                </FilterSelect>

                <FilterSelect value={status} onChange={setStatus} label={t("messagesPage.status")}>
                    <option value="all">{t("messagesPage.status")}</option>
                    {STATUSES.map((st) => (
                        <option key={st} value={st} className="font-bold">
                            {t(`messagesPage.statuses.${st}`)}
                        </option>
                    ))}
                </FilterSelect>

                <button
                    type="submit"
                    className="h-11 shrink-0 cursor-pointer rounded-xl bg-[#4B9AD2] px-12 text-[14px] font-semibold text-white btn-wipe"
                >
                    {t("messagesPage.searchButton")}
                </button>
            </form>

            <StatusTabs
                tabs={TABS.map((key) => ({ key, label: t(`messagesPage.tabs.${key}`), count: counts[key] || 0 }))}
                value={tab}
                onChange={(key) => {
                    setTab(key);
                    setSelectedId(null);
                    setFlash("");
                }}
            />

            {flash && (
                <p role="status" className="rounded-lg border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-3 text-[13px] text-[#2E9E5B]">
                    {flash}
                </p>
            )}

            <div className="grid items-start gap-6 lg:grid-cols-[1fr_330px]">
                {/* قائمة المراسلات */}
                <section className={`${card} p-5`}>
                    <h2 className="text-[16px] font-bold text-[#22455E]">{t("messagesPage.title")}</h2>
                    <p className="mt-1 text-[12px] text-[#89949D]">{t("messagesPage.subtitle")}</p>
                    <hr className="my-4 border-[#0000001A]" />

                    {list.length ? (
                        <ul className="flex flex-col gap-3">
                            {list.map((m) => {
                                const active = m.id === selected?.id;
                                return (
                                    <li key={m.id}>
                                        <button
                                            type="button"
                                            onClick={() => select(m)}
                                            aria-pressed={active}
                                            className={`w-full cursor-pointer rounded-2xl border p-4 text-start transition-colors ${active
                                                ? "border-[#BFDCF1] bg-[#EAF3FB]"
                                                : "border-[#0000000F] bg-[#F7F8FA] hover:border-[#BFDCF1]"
                                                }`}
                                        >
                                            <span className="flex items-start justify-between gap-3">
                                                <span className="text-[15px] font-bold text-[#414141]">{messageText(t, m, "title")}</span>
                                                <span
                                                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[m.status]}`}
                                                >
                                                    {t(`messagesPage.statuses.${m.status}`)}
                                                </span>
                                            </span>
                                            <span className="mt-2 flex items-center gap-2 text-[11px] text-[#89949D]">
                                                <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-[#D9DDE1]" aria-hidden="true" />
                                                {messageText(t, m, "party")}
                                            </span>
                                            <span className="mt-1 block text-[10px] text-[#89949D] tabular-nums">{m.date}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="py-10 text-center text-[13px] text-[#89949D]">{t("messagesPage.empty")}</p>
                    )}
                </section>

                <MessageDetails message={selected} onAction={(message, mode) => setDialog({ message, mode })} />
            </div>

            {dialog && (
                <ReplyModal
                    key={`${dialog.message.id}-${dialog.mode}`}
                    message={dialog.message}
                    mode={dialog.mode}
                    onClose={() => setDialog(null)}
                    onSend={handleSend}
                />
            )}
        </div>
    );
}
