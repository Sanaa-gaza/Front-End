import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronLeft, ImagePlus, LayoutGrid, Search, X } from "lucide-react";
import { getProfile, getServiceRequests, updateProfile } from "../../../api/endpoints";
import { useServices } from "../../../hooks/useReferenceData";

const BASE = "/dashboard/craftsman";

// ===== بيانات تجريبية =====
// فرص العمل (طلبات المؤسسات) لسا ما إلها endpoint. لما يجهز، استبدلي JOBS بطلب من src/api/endpoints.js
// serviceId: رقم الحرفة من GET /services عشان فلتر "نوع الخدمة" يشتغل على القائمة الحقيقية
const JOBS = [
    { id: "j1", serviceId: 1, experience: 3 },
    { id: "j2", serviceId: 1, experience: 3 },
    { id: "j3", serviceId: 2, experience: 5 },
    { id: "j4", serviceId: 4, experience: 2 },
];

const card = "rounded-[20px] border border-[#0000000D] bg-white shadow-[0_4px_24px_rgba(35,74,100,0.08)]";
const field =
    "h-11 w-full rounded-xl border border-[#8EC0E4] bg-white text-[12px] text-[#414141] outline-none transition-colors focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";

/** مفتاح تشغيل/إيقاف */
function Toggle({ checked, onChange, label, disabled }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            dir="ltr"
            className={`relative h-8 w-[58px] shrink-0 cursor-pointer rounded-full transition-colors duration-300 disabled:cursor-wait disabled:opacity-70 ${checked ? "bg-[#4B9AD2]" : "bg-[#E4EFFA]"
                }`}
        >
            <span
                className={`absolute top-1/2 left-1 h-6 w-6 -translate-y-1/2 rounded-full shadow-sm transition-all duration-300 ${checked ? "translate-x-[26px] bg-white" : "bg-[#4B9AD2]"
                    }`}
            />
        </button>
    );
}

/** بطاقة "متاح للعمل" + صور الأعمال */
function SideCard({ profile, onProfileChange }) {
    const { t } = useTranslation("craftsmanDashboard");
    // القيمة الحقيقية من السيرفر، والـ override بس وقت الحفظ
    const [override, setOverride] = useState(null);
    const [saving, setSaving] = useState(false);
    const [note, setNote] = useState("");
    const [photos, setPhotos] = useState([]);
    const [dragging, setDragging] = useState(false);

    const available = override ?? Boolean(profile?.craftsman?.is_available);

    const toggle = async (value) => {
        setOverride(value);
        setSaving(true);
        setNote("");
        try {
            await updateProfile({ is_available: value });
            // السيرفر ممكن يتجاهل الحقل بصمت، فبنتأكد من القيمة المحفوظة فعلاً
            const fresh = (await getProfile()).data;
            onProfileChange(fresh);
            if (Boolean(fresh?.craftsman?.is_available) !== value) setNote(t("availability.notSaved"));
        } catch {
            setNote(t("availability.notSaved"));
        } finally {
            setOverride(null);
            setSaving(false);
        }
    };

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
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-[15px] font-bold text-[#414141]">{t("availability.title")}</h2>
                    <p className="mt-1 text-[11px] text-[#89949D]">
                        {available ? t("availability.on") : t("availability.off")}
                    </p>
                </div>
                <Toggle
                    checked={available}
                    onChange={toggle}
                    disabled={!profile || saving}
                    label={t("availability.title")}
                />
            </div>
            {note && <p role="status" className="mt-2 text-[11px] text-[#9A6B00]">{note}</p>}

            <hr className="my-5 border-[#0000001A]" />

            <h2 className="text-[15px] font-bold text-[#414141]">{t("portfolio.title")}</h2>
            <p className="mt-1 text-[11px] leading-[1.8] text-[#89949D]">{t("portfolio.desc")}</p>

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
                className={`mt-4 flex h-[150px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-[11px] text-[#4B9AD2] transition-colors ${dragging ? "border-[#4B9AD2] bg-[#EAF3FB]" : "border-[#8EC0E4]"
                    }`}
            >
                <ImagePlus size={22} />
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

export default function CraftsmanHome({ profile, onProfileChange }) {
    const { t } = useTranslation("craftsmanDashboard");
    const services = useServices();
    const [requests, setRequests] = useState(null);

    const [location, setLocation] = useState("");
    const [serviceId, setServiceId] = useState("all");
    const [filters, setFilters] = useState({ location: "", serviceId: "all" });

    // الطلبات اللي وصلت للحرفي (GET /service-requests) عشان أرقام "مكتملة" و"جديدة"
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
    const count = (status) => (requests ? requests.filter((r) => r.status === status).length : null);
    const loadingText = "…";

    const stats = [
        // الأرباح لسا ما إلها بيانات بالباك إند
        { key: "earnings", value: "—", tone: "text-[#2EAF4E]" },
        { key: "completed", value: count("completed") ?? loadingText, tone: "text-[#4B9AD2]" },
        { key: "newRequests", value: count("pending") ?? loadingText, tone: "text-[#22455E]" },
        {
            key: "rating",
            value: craftsman ? Number(craftsman.avg_rating || 0).toFixed(1) : loadingText,
            tone: "text-[#F2A007]",
        },
    ];

    const jobs = useMemo(() => {
        const q = filters.location.trim().toLowerCase();
        return JOBS.filter((j) => {
            if (filters.serviceId !== "all" && String(j.serviceId) !== filters.serviceId) return false;
            if (!q) return true;
            const s = `jobs.sample.${j.id}`;
            return [t(`${s}.location`), t(`${s}.org`)].join(" ").toLowerCase().includes(q);
        });
    }, [filters, t]);

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
            {/* الإحصائيات */}
            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map((s) => (
                    <div key={s.key} className={`${card} px-4 py-6 text-center`}>
                        <p className={`text-[22px] font-bold leading-none tabular-nums ${s.tone}`}>
                            {t(`stats.${s.key}.value`, { value: s.value })}
                        </p>
                        <p className="mt-3 text-[12px] font-medium text-[#414141]">{t(`stats.${s.key}.label`)}</p>
                    </div>
                ))}
            </section>

            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                {/* فرص العمل */}
                <section className={`${card} p-5`}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setFilters({ location, serviceId });
                        }}
                        className="flex flex-col gap-3 rounded-2xl border border-[#0000000D] p-3 shadow-[0_2px_12px_rgba(35,74,100,0.06)] sm:flex-row sm:items-center"
                    >
                        <div className="relative min-w-0 flex-1">
                            <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                            <input
                                type="search"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder={t("jobs.location")}
                                aria-label={t("jobs.location")}
                                className={`${field} ps-9 pe-4 placeholder:text-[#89949D]`}
                            />
                        </div>
                        <div className="relative min-w-0 sm:w-[170px]">
                            <LayoutGrid size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#4B9AD2]" />
                            <select
                                value={serviceId}
                                onChange={(e) => setServiceId(e.target.value)}
                                aria-label={t("jobs.serviceType")}
                                className={`${field} cursor-pointer appearance-none ps-9 pe-9 ${serviceId === "all" ? "text-[#89949D]" : ""}`}
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
                        <button
                            type="submit"
                            className="h-11 shrink-0 cursor-pointer rounded-xl bg-[#4B9AD2] px-10 text-[14px] font-semibold text-white btn-wipe"
                        >
                            {t("jobs.search")}
                        </button>
                    </form>

                    <div className="mt-4 flex items-center justify-between text-[11px] text-[#89949D]">
                        <span>{t("jobs.nearby")}</span>
                        <span>{t("jobs.sorted")}</span>
                    </div>

                    {jobs.length ? (
                        <ul className="mt-3 flex flex-col gap-4">
                            {jobs.map((j) => {
                                const s = `jobs.sample.${j.id}`;
                                return (
                                    <li
                                        key={j.id}
                                        className="flex flex-col gap-4 rounded-2xl border border-[#0000000F] p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="min-w-0">
                                            <h3 className="text-[16px] font-bold text-[#414141]">{t(`${s}.service`)}</h3>
                                            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#575757]">
                                                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#22455E] text-[8px] font-bold text-white">
                                                    {t(`${s}.org`).charAt(0)}
                                                </span>
                                                {t(`${s}.org`)}
                                            </p>
                                            <p className="mt-1.5 text-[13px] text-[#414141]">{t(`${s}.desc`)}</p>
                                            <p className="mt-3 text-[10px] text-[#4B9AD2]">
                                                {t("jobs.deadline", { date: t(`${s}.date`) })}
                                            </p>
                                            <span className="mt-2 inline-block rounded-md bg-[#4B9AD2] px-2 py-0.5 text-[10px] font-medium text-white">
                                                {t("jobs.experience", { years: j.experience })}
                                            </span>
                                        </div>
                                        <Link
                                            to={`${BASE}/jobs/${j.id}`}
                                            className="inline-flex h-8 shrink-0 items-center gap-1 self-start rounded-full bg-[#4B9AD2] px-4 text-[12px] font-medium text-white btn-wipe sm:self-center"
                                        >
                                            {t("jobs.apply")}
                                            <ChevronLeft size={14} className="ltr:rotate-180" />
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="py-10 text-center text-[13px] text-[#89949D]">{t("jobs.empty")}</p>
                    )}
                </section>

                <SideCard profile={profile} onProfileChange={onProfileChange} />
            </div>
        </div>
    );
}
