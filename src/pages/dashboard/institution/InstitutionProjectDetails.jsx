import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Check,
    CircleCheck,
    Clock,
    Download,
    FileText,
    ImageIcon,
    MapPin,
    Paperclip,
    UserRound,
} from "lucide-react";
import { PROJECTS, PROJECT_FILES, PROJECT_PHOTOS, PROJECT_STAGES, STAGE_BY_STATUS } from "./projectsData";
import ProjectChat from "./ProjectChat";
import { DocumentsStack, PhotoLibrary, UserBadge } from "../../../components/dashboard/navIcons";

const BASE = "/dashboard/institution";

const card = "rounded-[20px] border border-[#0000000D] bg-white shadow-[0_4px_24px_rgba(35,74,100,0.08)]";

const STATUS_STYLES = {
    executing: "bg-[#DDF6E3] text-[#2EAF4E]",
    pending: "bg-[#FDE7E7] text-[#D64545]",
    completed: "bg-[#E8EEF4] text-[#6B7F94]",
};

/** مراحل المشروع: مكتملة (أخضر) / حالية (أزرق) / قادمة (رمادي)، والخط بين المكتملة أخضر عريض */
function ProjectStepper({ current, notes }) {
    const { t } = useTranslation("institutionDashboard");

    return (
        <ol className="flex items-start">
            {PROJECT_STAGES.map((key, i) => {
                const state = i < current ? "done" : i === current ? "current" : "upcoming";
                const isLast = i === PROJECT_STAGES.length - 1;
                // الخط بعد المرحلة أخضر لو المرحلة اللي بعدها وصلناها
                const lineDone = i < current;
                return (
                    <li key={key} className="relative flex flex-1 flex-col items-center text-center">
                        {!isLast && (
                            <span
                                aria-hidden="true"
                                className={`absolute start-1/2 top-[18px] w-full -translate-y-1/2 rounded-full ${lineDone ? "h-[4px] bg-[#1FB57A]" : "h-[2px] bg-[#E6EBF0]"
                                    }`}
                            />
                        )}
                        <span
                            className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold ${state === "done"
                                ? "bg-[#1FB57A] text-white"
                                : state === "current"
                                    ? "bg-[#4B9AD2] text-white ring-4 ring-[#CFE3F3]"
                                    : "bg-[#F1F3F5] text-[#B5BDC4] ring-4 ring-white"
                                }`}
                        >
                            {state === "done" ? <Check size={17} strokeWidth={3} /> : state === "current" ? <Clock size={17} /> : i + 1}
                        </span>
                        <span
                            className={`mt-3 px-1 text-[11px] font-bold leading-[1.5] sm:text-[12px] ${state === "current" ? "text-[#4B9AD2]" : state === "done" ? "text-[#141415]" : "text-[#89949D]"
                                }`}
                        >
                            {t(`projectDetails.stages.${key}`)}
                        </span>
                        {state === "current" && key === "executing" ? (
                            <span className="mt-1 rounded-full border border-[#9CC9EA] bg-[#EAF3FB] px-2.5 py-0.5 text-[9px] text-[#4B9AD2]">
                                {t("projectDetails.waiting")}
                            </span>
                        ) : (
                            notes[key] && (
                                <span className={`mt-0.5 text-[10px] ${state === "done" ? "text-[#1FB57A]" : "text-[#B5BDC4]"}`}>
                                    {notes[key]}
                                </span>
                            )
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

/** صندوق معلومات (صاحب المشروع / الجهة المنفذة) */
function InfoBox({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-3 rounded-xl bg-[#F3F5F7] px-4 py-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#C9E1F4] text-[#3B79A8]">
                <Icon size={24} strokeWidth={1.6} />
            </span>
            <div className="min-w-0">
                <p className="text-[10px] text-[#575757]">{label}</p>
                <p className="mt-0.5 truncate text-[11px] font-semibold text-[#141415]">{value}</p>
            </div>
        </div>
    );
}

/** بطاقة صورة ميدانية: الصورة + مرحلتها + تاريخها، وتحتها العنوان ومين رفعها وحالة الاعتماد */
function PhotoCard({ photo }) {
    const { t } = useTranslation("institutionDashboard");
    const [broken, setBroken] = useState(false);
    const d = "projectDetails.docs";

    return (
        <figure className="overflow-hidden rounded-[20px] bg-[#F3F2FD]">
            <div className="relative aspect-[25/24] bg-[#E5ECF1]">
                {broken ? (
                    <span className="flex h-full w-full items-center justify-center text-[#AAB6C0]">
                        <ImageIcon size={36} strokeWidth={1.4} />
                    </span>
                ) : (
                    <img
                        src={photo.image}
                        alt={t(`${d}.photos.${photo.id}`)}
                        loading="lazy"
                        onError={() => setBroken(true)}
                        className="h-full w-full object-cover"
                    />
                )}
                <span
                    className={`absolute start-2.5 top-2.5 rounded-full px-3 py-1 text-[11px] leading-none ${photo.phase === "before" ? "bg-white/90 text-[#4B9AD2]" : "bg-[#4B9AD2]/90 text-white"
                        }`}
                >
                    {t(`${d}.phases.${photo.phase}`)}
                </span>
                <span className="absolute bottom-3 end-3 rounded-lg bg-[#3F4650]/70 px-3 py-1.5 text-[11px] leading-none text-white tabular-nums" dir="ltr">
                    {photo.date}
                </span>
            </div>
            <figcaption className="px-3.5 pb-3.5 pt-3">
                <p className="truncate text-[11px] font-semibold text-[#141415]">{t(`${d}.photos.${photo.id}`)}</p>
                <div className="mt-2 flex items-center justify-between gap-2 text-[10px]">
                    <span className="flex items-center gap-1 text-[#6B7280]">
                        <UserRound size={12} strokeWidth={1.8} />
                        {t(`${d}.uploadedBy.${photo.by}`)}
                    </span>
                    <span className={`flex items-center gap-1 text-[11px] ${photo.approved ? "text-[#2EC65A]" : "text-[#E39B2B]"}`}>
                        {photo.approved ? t(`${d}.approved`) : t(`${d}.pendingApproval`)}
                        {photo.approved && <Check size={13} strokeWidth={2} />}
                    </span>
                </div>
            </figcaption>
        </figure>
    );
}

/** مستند مرفق: أيقونة PDF + الاسم + التاريخ والحجم + زر تحميل */
function FileItem({ file }) {
    const { t } = useTranslation("institutionDashboard");
    const f = `projectDetails.docs.files.${file.id}`;
    const name = t(`${f}.name`);
    const btn = "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF3FB] text-[#286292]";

    return (
        <li className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-[0_2px_8px_rgba(35,74,100,0.05)]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FDDCDC] text-[#E5484D]">
                <FileText size={20} strokeWidth={1.7} />
            </span>
            <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-bold text-[#141415]">{name}</p>
                <p className="mt-0.5 text-[11px] text-[#575757]">
                    {t(`${f}.date`)} • <span dir="ltr">{file.size}</span>
                </p>
            </div>
            {file.url ? (
                <a href={file.url} download aria-label={t("projectDetails.docs.download", { name })} className={`${btn} hover:bg-[#DCEBFA]`}>
                    <Download size={16} />
                </a>
            ) : (
                <button
                    type="button"
                    disabled
                    title={t("projectDetails.docs.unavailable")}
                    aria-label={t("projectDetails.docs.download", { name })}
                    className={`${btn} cursor-not-allowed opacity-70`}
                >
                    <Download size={16} />
                </button>
            )}
        </li>
    );
}

/** صفحة تفاصيل المشروع — بتفتح من "فتح" / "مراجعة" بصفحة المشاريع الجارية */
export default function InstitutionProjectDetails() {
    const { t } = useTranslation("institutionDashboard");
    const { projectId } = useParams();
    const project = PROJECTS.find((p) => p.id === projectId);

    if (!project) {
        return (
            <div className={`${card} mx-auto max-w-[1100px] p-10 text-center`}>
                <p className="text-[15px] font-bold text-[#414141]">{t("projectDetails.notFound")}</p>
                <Link to={`${BASE}/projects`} className="mt-4 inline-block text-[13px] text-[#4B9AD2] hover:underline">
                    {t("projectDetails.back")}
                </Link>
            </div>
        );
    }

    const list = `projectsPage.sample.${project.id}`;
    const s = `projectDetails.sample.${project.id}`;
    const stage = STAGE_BY_STATUS[project.status] ?? 0;
    const completed = stage >= PROJECT_STAGES.length;
    const notes = {
        created: t(`${s}.created`),
        accepted: t(`${s}.accepted`, { defaultValue: "" }),
        started: t(`${s}.started`, { defaultValue: "" }),
        delivered: t("projectDetails.deliveredNote"),
    };

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
            {/* مراحل المشروع */}
            <section className={`${card} p-5 sm:px-6`}>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-[11px] font-medium text-[#89949D]">{t("projectDetails.stagesTitle")}</h2>
                    <p className="text-[11px] font-semibold text-[#575757]">
                        {completed
                            ? t("projectDetails.allDone")
                            : t("projectDetails.currentStage", {
                                ordinal: t(`projectDetails.ordinals.${stage}`),
                                name: t(`projectDetails.stages.${PROJECT_STAGES[stage]}`),
                            })}
                    </p>
                </div>
                <ProjectStepper current={stage} notes={notes} />
            </section>

            {/* بيانات المشروع + الوقت المتبقي */}
            <section className={`${card} flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between sm:px-6`}>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-medium ${STATUS_STYLES[project.status]}`}>
                            {t(`projectsPage.status.${project.status}`)}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-[#89949D]">
                            <MapPin size={13} />
                            {t(`${s}.location`)}
                        </span>
                    </div>
                    <h1 className="mt-3 text-[18px] font-bold text-[#141415]">{t(`${list}.title`)}</h1>
                    <div className="mt-4 grid gap-3 sm:max-w-[480px] sm:grid-cols-2">
                        <InfoBox icon={DocumentsStack} label={t("projectDetails.owner")} value={t(`${s}.owner`)} />
                        <InfoBox icon={UserBadge} label={t("projectDetails.contractor")} value={t(`${list}.provider`)} />
                    </div>
                </div>

                {completed ? (
                    <div className="flex w-full shrink-0 items-center gap-4 rounded-xl bg-[#E8F8EE] px-5 py-4 lg:w-[210px]">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#2EAF4E]">
                            <CircleCheck size={20} />
                        </span>
                        <div>
                            <p className="text-[12px] font-bold text-[#2E9E5B]">{t("projectDetails.completedTitle")}</p>
                            <p className="mt-1 text-[9px] text-[#575757]">{t("projectDetails.deadline", { date: t(`${s}.deadline`) })}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex w-full shrink-0 items-center gap-4 rounded-xl bg-[#FBDADA] px-5 py-4 lg:w-[210px]">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#D64545]">
                            <Clock size={20} />
                        </span>
                        <div>
                            <p className="text-[12px] text-[#575757]">{t("projectDetails.remaining")}</p>
                            <p className="mt-1.5 text-[11px] font-bold text-[#D64545]">
                                {t("projectDetails.remainingValue", { time: t(`${list}.time`) })}
                            </p>
                            <p className="mt-1.5 text-[9px] text-[#575757]">{t("projectDetails.deadline", { date: t(`${s}.deadline`) })}</p>
                        </div>
                    </div>
                )}
            </section>

            {/* توثيق التنفيذ والمحادثة (العمود الرئيسي) + المستندات (العمود الجانبي) */}
            <div className="grid items-start gap-6 lg:grid-cols-[1fr_330px]">
                <div className="flex min-w-0 flex-col gap-6">
                    <section className={`${card} p-5 sm:p-6`}>
                        <div className="flex items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D6EAFB] text-[#1F6696]">
                                <PhotoLibrary size={22} strokeWidth={1.8} />
                            </span>
                            <div>
                                <h2 className="text-[13px] font-bold text-[#141415]">{t("projectDetails.docs.title")}</h2>
                                <p className="mt-1 text-[11px] text-[#89949D]">{t("projectDetails.docs.subtitle")}</p>
                            </div>
                        </div>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {PROJECT_PHOTOS.map((photo) => (
                                <PhotoCard key={photo.id} photo={photo} />
                            ))}
                        </div>
                    </section>

                    {/* المحادثة المباشرة */}
                    <ProjectChat />
                </div>

                <aside className="rounded-[20px] bg-[#F2F2FD] p-5">
                    <h2 className="flex items-center gap-2 text-[11px] font-medium text-[#414141]">
                        <Paperclip size={14} className="text-[#286292]" />
                        {t("projectDetails.docs.filesTitle")}
                    </h2>
                    <ul className="mt-5 flex flex-col gap-4">
                        {PROJECT_FILES.map((file) => (
                            <FileItem key={file.id} file={file} />
                        ))}
                    </ul>
                </aside>
            </div>
        </div>
    );
}
