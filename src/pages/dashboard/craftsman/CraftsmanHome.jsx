import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Bookmark,
    Briefcase,
    Check,
    ChevronDown,
    ChevronLeft,
    ImagePlus,
    LayoutGrid,
    Search,
    Star,
    X,
} from "lucide-react";
import { getServiceRequests } from "../../../api/endpoints";
import { useServices } from "../../../hooks/useReferenceData";
import ApplyModal from "./ApplyModal";

const BASE = "/dashboard/craftsman";

// ===== بيانات تجريبية =====
// فرص العمل (طلبات المؤسسات) لسا ما إلها endpoint. لما يجهز، استبدلي JOBS بطلب من src/api/endpoints.js
// serviceId: رقم الحرفة من GET /services عشان فلتر "نوع الخدمة" يشتغل على القائمة الحقيقية
// distance: بالكيلومتر، budget: [أقل، أعلى] بالشيكل
const JOBS = [
    { id: "j1", serviceId: 1, experience: 3, distance: 1.2, budget: [80, 120] },
    { id: "j2", serviceId: 1, experience: 3, distance: 3.5, budget: [80, 120] },
    { id: "j3", serviceId: 2, experience: 5, distance: 8, budget: [80, 120] },
    { id: "j4", serviceId: 4, experience: 2, distance: 12.4, budget: [150, 220] },
];

// ⚠️ أرقام ما إلها بيانات بالباك إند لسا (الأرباح، مهلة الرد، آخر نشاط)
const SAMPLE = { earningsToday: 11, earningsMonth: 2340, nearestDeadlineHours: 18 };

const card = "rounded-[20px] border border-[#0000000D] bg-white shadow-[0_4px_24px_rgba(35,74,100,0.08)]";
const field =
    "h-11 w-full rounded-xl border border-[#8EC0E4] bg-white text-[12px] text-[#414141] outline-none transition-colors focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";

/** مفتاح تشغيل/إيقاف أخضر (حالة "متاح") — size: "sm" للشريط العلوي، "md" لبطاقة الصفحة الرئيسية */
export function AvailabilityToggle({ checked, onChange, label, disabled, size = "md" }) {
    const sm = size === "sm";
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            dir="ltr"
            className={`relative shrink-0 cursor-pointer rounded-full transition-colors duration-300 disabled:cursor-wait disabled:opacity-70 ${sm ? "h-5 w-9" : "h-8 w-[58px]"
                } ${checked ? "bg-[#22B34B]" : "bg-[#D5DCE2]"}`}
        >
            <span
                className={`absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm transition-all duration-300 ${sm ? "h-3.5 w-3.5" : "h-6 w-6"
                    } ${checked ? (sm ? "translate-x-[15px]" : "translate-x-[26px]") : ""}`}
            />
        </button>
    );
}

/** بطاقة "متاح للعمل" + صور الأعمال */
function SideCard({ availability }) {
    const { t } = useTranslation("craftsmanDashboard");
    const [photos, setPhotos] = useState([]);
    const [dragging, setDragging] = useState(false);

    const addPhotos = (files) => {
        const images = Array.from(files || []).filter((f) => f.type.startsWith("image/"));
        if (!images.length) return;
        setPhotos((list) => [...list, ...images.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
    };

    // روابط المعاينة بتنمسح لما تنشال الصورة، والباقي لما تتسكر الصفحة
    const photosRef = useRef(photos);
    useEffect(() => {
        photosRef.current = photos;
    }, [photos]);
    useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

    const removePhoto = (index) => {
        setPhotos((list) => {
            URL.revokeObjectURL(list[index].url);
            return list.filter((_, j) => j !== index);
        });
    };

    return (
        <section className={`${card} self-start p-5`}>
            <div className="flex items-center justify-between gap-4 pt-2">
                <div>
                    <h2 className="text-[14px] font-bold text-[#141415]">{t("availability.title")}</h2>
                    <p className="mt-1.5 text-[10px] text-[#575757]">
                        {availability.available ? t("availability.on") : t("availability.off")}
                    </p>
                </div>
                <AvailabilityToggle
                    checked={availability.available}
                    onChange={availability.toggle}
                    disabled={!availability.ready || availability.saving}
                    label={t("availability.title")}
                />
            </div>
            {availability.note && <p role="status" className="mt-2 text-[11px] text-[#9A6B00]">{availability.note}</p>}

            <hr className="my-6 border-[#0000001A]" />

            <h2 className="text-[14px] font-bold text-[#141415]">{t("portfolio.title")}</h2>
            <p className="mt-1.5 text-[10px] leading-[1.8] text-[#575757]">{t("portfolio.desc")}</p>

            <label
                htmlFor="portfolio-input"
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    addPhotos(e.dataTransfer.files);
                }}
                className={`mt-4 flex h-[118px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-[9px] text-[#4B9AD2] transition-colors ${dragging ? "border-[#4B9AD2] bg-[#EAF3FB]" : "border-[#8EC0E4]"
                    }`}
            >
                <ImagePlus size={20} strokeWidth={1.6} />
                {t("portfolio.drop")}
            </label>
            <input
                id="portfolio-input"
                type="file"
                accept="image/jpeg,image/png"
                multiple
                className="hidden"
                onChange={(e) => {
                    addPhotos(e.target.files);
                    e.target.value = "";
                }}
            />

            {photos.length > 0 && (
                <>
                    <ul className="mt-3 grid grid-cols-3 gap-2">
                        {photos.map((p, i) => (
                            <li key={p.url} className="relative aspect-square overflow-hidden rounded-lg">
                                <img src={p.url} alt="" className="h-full w-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removePhoto(i)}
                                    aria-label={t("portfolio.remove")}
                                    className="absolute end-1 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[#D64545]"
                                >
                                    <X size={12} />
                                </button>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-2 text-[10px] text-[#9A6B00]">{t("portfolio.notSaved")}</p>
                </>
            )}
        </section>
    );
}

/** الصفحة الرئيسية للحرفي: تنبيه الطلبات + الإحصائيات + فرص العمل + بطاقة التوفر */
export default function CraftsmanHome({ profile, availability }) {
    const { t } = useTranslation("craftsmanDashboard");
    const services = useServices();
    const [requests, setRequests] = useState(null);

    const [location, setLocation] = useState("");
    const [serviceId, setServiceId] = useState("all");
    const [filters, setFilters] = useState({ location: "", serviceId: "all" });
    // الفرصة المفتوحة بنافذة التفاصيل/التقديم، والفرص اللي انقدّم عليها أو انحفظت
    const [applyJob, setApplyJob] = useState(null);
    const [applied, setApplied] = useState({});
    const [saved, setSaved] = useState([]);
    const [flash, setFlash] = useState("");

    // ⚠️ ما في endpoint للتقديم على فرص المؤسسات لسا، فالعرض بينحفظ بالصفحة بس
    const handleApply = (offer) => {
        setApplied((a) => ({ ...a, [applyJob.id]: offer }));
        setFlash(t("jobs.modal.sent", { org: t(`jobs.sample.${applyJob.id}.org`) }));
        setApplyJob(null);
    };

    // الطلبات اللي وصلت للحرفي (GET /service-requests) عشان أرقام الطلبات والأعمال المكتملة
    useEffect(() => {
        let active = true;
        getServiceRequests()
            .then((res) => active && setRequests(Array.isArray(res.data) ? res.data : []))
            .catch(() => active && setRequests([]));
        return () => {
            active = false;
        };
    }, []);

    const craftsman = profile?.craftsman;
    const loading = "…";
    const count = (status) => (requests ? requests.filter((r) => !status || r.status === status).length : loading);
    const h = "home.stats";

    const stats = [
        { key: "earnings", symbol: "₪", value: t(`${h}.earnings.value`, { value: SAMPLE.earningsToday }), note: t(`${h}.earnings.note`, { amount: SAMPLE.earningsMonth.toLocaleString("en-US") }) },
        { key: "completed", icon: Briefcase, value: count("completed"), note: t(`${h}.completed.note`) },
        { key: "requests", icon: Briefcase, value: count(), note: t(`${h}.requests.note`) },
        {
            key: "rating",
            icon: Star,
            value: craftsman ? Number(craftsman.avg_rating || 0).toFixed(1) : loading,
            note: t(`${h}.rating.note`, { count: craftsman?.reviews_count ?? 0 }),
        },
    ];

    const jobs = useMemo(() => {
        const q = filters.location.trim().toLowerCase();
        return JOBS.filter((j) => {
            if (filters.serviceId !== "all" && String(j.serviceId) !== filters.serviceId) return false;
            if (!q) return true;
            const s = `jobs.sample.${j.id}`;
            return [t(`${s}.location`), t(`${s}.org`), t(`${s}.title`)].join(" ").toLowerCase().includes(q);
        });
    }, [filters, t]);

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
            {/* تنبيه الطلبات بانتظار الرد */}
            {/* التدرّج من #CAEBFF (جهة البداية) لـ #FFFFFF (جهة النهاية) */}
            <section className="flex flex-col gap-4 rounded-[20px] border border-[#D6ECFB] bg-linear-to-l from-[#CAEBFF] to-[#FFFFFF] px-5 py-5 shadow-[0_2px_10px_rgba(75,154,210,0.08)] ltr:bg-linear-to-r sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div className="flex items-center gap-4">
                    {/* أيقونة لوح الطلبات مع علامة ✓ */}
                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true" className="shrink-0">
                        <rect x="11" y="9" width="30" height="39" rx="4" fill="#EAF5FE" stroke="#4B9AD2" strokeWidth="1.8" />
                        <rect x="18.5" y="5" width="15" height="8" rx="2.5" fill="#4B9AD2" />
                        <path d="M17 21h18M17 27h18M17 33h12" stroke="#8EC0E4" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="40" cy="42" r="9.5" fill="#4B9AD2" stroke="#FFFFFF" strokeWidth="2.5" />
                        <path d="m35.8 42.2 2.9 2.9 5.6-5.8" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div>
                        <h2 className="text-[17px] font-bold text-[#141415]">{t("home.banner.title")}</h2>
                        <p className="mt-1.5 text-[11px] text-[#414141]">{t("home.banner.subtitle", { count: SAMPLE.nearestDeadlineHours })}</p>
                    </div>
                </div>
                <Link
                    to={`${BASE}/requests`}
                    className="inline-flex h-10 w-fit shrink-0 items-center gap-2 rounded-xl bg-linear-to-l from-[#1591DCCC] to-[#1383C6] px-5 text-[12px] font-semibold text-white shadow-[0_3px_8px_rgba(19,131,198,0.25)] ltr:bg-linear-to-r btn-wipe"
                >
                    {t("home.banner.cta")}
                    <ChevronLeft size={15} className="ltr:rotate-180" />
                </Link>
            </section>

            {/* الإحصائيات */}
            <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map(({ key, icon: Icon, symbol, value, note }) => (
                    <li key={key} className={`${card} px-5 py-5`}>
                        <p className="flex items-center gap-2 text-[12px] text-[#575757]">
                            {t(`${h}.${key}.label`)}
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EAF3FB] text-[#4B9AD2]" aria-hidden="true">
                                {Icon ? <Icon size={12} strokeWidth={2} /> : <span className="text-[11px] font-bold leading-none">{symbol}</span>}
                            </span>
                        </p>
                        <p className="mt-4 text-[22px] font-bold text-[#22455E] tabular-nums">{value}</p>
                        <p className="mt-2 text-[10px] text-[#575757]">{note}</p>
                    </li>
                ))}
            </ul>

            <div className="grid items-start gap-6 lg:grid-cols-[1fr_300px]">
                {/* فرص العمل */}
                <section className={`${card} p-5`}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setFilters({ location, serviceId });
                        }}
                        className="flex flex-col gap-3 sm:flex-row sm:items-center"
                    >
                        <div className="relative min-w-0 flex-1">
                            <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                            <input
                                type="search"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder={t("jobs.location")}
                                aria-label={t("jobs.location")}
                                className={`${field} pe-4 ps-9 placeholder:text-[#89949D]`}
                            />
                        </div>
                        <div className="relative min-w-0 sm:w-[170px]">
                            <LayoutGrid size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                            <select
                                value={serviceId}
                                onChange={(e) => setServiceId(e.target.value)}
                                aria-label={t("jobs.serviceType")}
                                className={`${field} cursor-pointer appearance-none pe-9 ps-9 ${serviceId === "all" ? "text-[#89949D]" : ""}`}
                            >
                                <option value="all">{t("jobs.serviceType")}</option>
                                {services.options.map((o) => (
                                    <option key={o.value} value={o.value} className="font-bold">
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                        </div>
                        <button type="submit" className="h-11 shrink-0 cursor-pointer rounded-xl bg-linear-to-l from-[#1591DCCC] to-[#1383C6] ltr:bg-linear-to-r px-10 text-[14px] font-semibold text-white btn-wipe">
                            {t("jobs.search")}
                        </button>
                    </form>

                    {flash && (
                        <p role="status" className="mt-4 rounded-lg border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-2.5 text-[12px] text-[#2E9E5B]">
                            {flash}
                        </p>
                    )}

                    <h2 className="mt-6 text-[12px] font-semibold text-[#4B9AD2]">{t("jobs.title")}</h2>

                    {jobs.length ? (
                        <ul className="mt-3 flex flex-col gap-3">
                            {jobs.map((j) => {
                                const s = `jobs.sample.${j.id}`;
                                const org = t(`${s}.org`);
                                const isSaved = saved.includes(j.id);
                                return (
                                    <li key={j.id} className="rounded-2xl border border-[#0000000F] bg-white p-4 shadow-[0_2px_10px_rgba(35,74,100,0.05)]">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EEF5FC] text-[14px] font-bold text-[#575757]">
                                                    {org.trim().charAt(0)}
                                                </span>
                                                <div className="min-w-0">
                                                    <h3 className="truncate text-[15px] font-bold text-[#141415]">{t(`${s}.title`)}</h3>
                                                    <p className="mt-1.5 truncate text-[11px] text-[#89949D]">
                                                        {t(`${s}.location`)} · {t("jobs.distance", { km: j.distance })}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="shrink-0 rounded-full border border-[#CFE3F3] bg-[#EEF5FC] px-3 py-0.5 text-[11px] text-[#4B9AD2]">
                                                {t("jobs.orgType")}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex items-end justify-between gap-3 border-t border-[#0000000A] pt-3">
                                            <div>
                                                <p className="text-[12px] text-[#575757]">{t("jobs.budget")}</p>
                                                <p className="mt-1 text-[14px] font-bold text-[#141415] tabular-nums">
                                                    {t("jobs.budgetValue", { min: j.budget[0], max: j.budget[1] })}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setSaved((list) => (isSaved ? list.filter((x) => x !== j.id) : [...list, j.id]))}
                                                    aria-pressed={isSaved}
                                                    aria-label={isSaved ? t("jobs.unsave") : t("jobs.save")}
                                                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#4B9AD2] hover:bg-[#EEF5FC]"
                                                >
                                                    <Bookmark size={17} fill={isSaved ? "currentColor" : "none"} />
                                                </button>
                                                {applied[j.id] ? (
                                                    <span className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#DDF6E3] px-3 text-[11px] font-medium text-[#2EAF4E]">
                                                        <Check size={13} />
                                                        {t("jobs.applied")}
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFlash("");
                                                            setApplyJob(j);
                                                        }}
                                                        className="inline-flex h-10 cursor-pointer items-center gap-3 rounded-xl bg-linear-to-l from-[#1591DCCC] to-[#1383C6] ltr:bg-linear-to-r px-4 text-[13px] font-semibold text-white shadow-[0_3px_8px_rgba(19,131,198,0.25)] btn-wipe"
                                                    >
                                                        {t("jobs.details")}
                                                        <ChevronLeft size={17} strokeWidth={2.5} className="ltr:rotate-180" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="py-10 text-center text-[13px] text-[#89949D]">{t("jobs.empty")}</p>
                    )}
                </section>

                <SideCard availability={availability} />
            </div>

            {applyJob && (
                <ApplyModal
                    key={applyJob.id}
                    job={{
                        id: applyJob.id,
                        title: t(`jobs.sample.${applyJob.id}.title`),
                        org: t(`jobs.sample.${applyJob.id}.org`),
                        desc: t(`jobs.sample.${applyJob.id}.desc`),
                        location: t(`jobs.sample.${applyJob.id}.location`),
                        time: t(`jobs.sample.${applyJob.id}.time`),
                        distance: applyJob.distance,
                        budget: applyJob.budget,
                    }}
                    onClose={() => setApplyJob(null)}
                    onSend={handleApply}
                />
            )}
        </div>
    );
}
