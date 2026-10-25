import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Check,
    ChevronDown,
    CircleCheck,
    FilePlus2,
    FileText,
    Map as MapIcon,
    MapPin,
    Paperclip,
    Search,
    Settings,
    X,
} from "lucide-react";
import { useGovernorates, useServices } from "../../../hooks/useReferenceData";
import DateField from "../../../components/dashboard/DateField";

const BASE = "/dashboard/institution";
const DESC_MAX = 1000;
const CATEGORIES = ["construction", "maintenance", "electrical", "plumbing", "supply", "furnishing", "other"];

const card = "rounded-[20px] border border-[#0000000D] bg-white shadow-[0_4px_24px_rgba(35,74,100,0.08)]";
const field =
    "h-11 w-full rounded-xl border border-[#DDE3E8] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] text-[13px] text-[#414141] outline-none placeholder:text-[#89949D] focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2] aria-[invalid=true]:border-red-400";
const label = "mb-1.5 block text-[12px] font-bold text-[#22455E]";
const iconEnd = "pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-[#6F7B85]";

/** عنوان القسم: شريط أزرق فاتح مع رقم وأيقونة */
function SectionHeader({ icon: Icon, children }) {
    return (
        <h2 className="flex items-center gap-2 rounded-t-[20px] border-b border-[#DCEAF8] bg-[#EAF4FC] px-5 py-3.5 text-[14px] font-semibold text-[#286292]">
            <Icon size={17} className="shrink-0 text-[#286292]" />
            {children}
        </h2>
    );
}

/** خانة بأيقونة (أو رمز) على النهاية */
function IconInput({ adornment, ...props }) {
    return (
        <div className="relative">
            <span className={`${iconEnd} flex text-[14px]`}>{adornment}</span>
            <input {...props} className={`${field} pe-10 ps-4`} />
        </div>
    );
}

function Label({ htmlFor, required, children }) {
    const { t } = useTranslation("institutionDashboard");
    return (
        <label htmlFor={htmlFor} className={label}>
            {children}
            {required ? <span className="ms-0.5 text-red-500">*</span> : <span className="ms-1">{t("createTender.optional")}</span>}
        </label>
    );
}

/** قائمة منسدلة للخدمات المطلوبة — بتسمح باختيار أكثر من خدمة (من GET /services) */
function ServicesSelect({ id, value, onChange, invalid }) {
    const { t } = useTranslation("institutionDashboard");
    const services = useServices();
    const [open, setOpen] = useState(false);
    const boxRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const onDown = (e) => !boxRef.current?.contains(e.target) && setOpen(false);
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const toggle = (v) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
    const names = services.options.filter((o) => value.includes(String(o.value))).map((o) => o.label);

    return (
        <div ref={boxRef} className="relative">
            <button
                id={id}
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-invalid={invalid}
                className={`${field} flex cursor-pointer items-center pe-10 ps-4 text-start ${names.length ? "" : "text-[#89949D]"}`}
            >
                <span className="truncate">{names.length ? names.join("، ") : t("createTender.servicesPlaceholder")}</span>
            </button>
            <ChevronDown size={16} className={`${iconEnd} transition-transform ${open ? "rotate-180" : ""}`} />
            {open && (
                <ul
                    role="listbox"
                    aria-multiselectable="true"
                    className="absolute inset-x-0 top-full z-20 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-[#DDE3E8] bg-white p-1.5 shadow-[0_10px_30px_rgba(35,74,100,0.14)]"
                >
                    {services.loading ? (
                        <li className="px-3 py-2 text-[12px] text-[#89949D]">{t("createTender.loading")}</li>
                    ) : (
                        services.options.map((o) => {
                            const v = String(o.value);
                            const on = value.includes(v);
                            return (
                                <li key={v} role="option" aria-selected={on}>
                                    <button
                                        type="button"
                                        onClick={() => toggle(v)}
                                        className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-start text-[13px] transition-colors hover:bg-[#F2F8FD] ${on ? "text-[#286292]" : "text-[#414141]"}`}
                                    >
                                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${on ? "border-[#4B9AD2] bg-[#4B9AD2] text-white" : "border-[#C9D3DB]"}`}>
                                            {on && <Check size={11} strokeWidth={3} />}
                                        </span>
                                        {o.label}
                                    </button>
                                </li>
                            );
                        })
                    )}
                </ul>
            )}
        </div>
    );
}

const FieldError = ({ text }) => (text ? <p className="mt-1 text-[11px] text-red-500">{text}</p> : null);

/** صفحة "إنشاء مناقصة جديدة" — بتفتح من زر "+" بالشريط العلوي */
export default function InstitutionCreateTender() {
    const { t } = useTranslation("institutionDashboard");
    const governorates = useGovernorates();
    const [form, setForm] = useState({
        desc: "",
        name: "",
        number: "",
        category: "",
        closeDate: "",
        services: [],
        governorateId: "",
        value: "",
        submitDate: "",
    });
    const [files, setFiles] = useState([]);
    const [mapQuery, setMapQuery] = useState("");
    const [mapPlace, setMapPlace] = useState("");
    // حالة تحديد الموقع: "" | "locating" | "denied" | "failed" | "empty"
    const [mapStatus, setMapStatus] = useState("");
    const [errors, setErrors] = useState({});
    const [created, setCreated] = useState(false);
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const update = (key) => (e) => {
        setForm((f) => ({ ...f, [key]: e.target.value }));
        setErrors((er) => ({ ...er, [key]: "" }));
    };

    const setDate = (key) => (value) => update(key)({ target: { value } });

    const addFiles = (list) => {
        const picked = Array.from(list || []);
        if (picked.length) setFiles((f) => [...f, ...picked]);
    };

    // لو في نص بالبحث بنعرضه على الخريطة، ولو فاضي بنجيب موقع الجهاز الحالي
    const locateOnMap = () => {
        const q = mapQuery.trim();
        if (q) {
            setMapStatus("");
            setMapPlace(q);
            return;
        }
        if (!navigator.geolocation) {
            setMapStatus("empty");
            return;
        }
        setMapStatus("locating");
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                setMapPlace(`${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`);
                setMapStatus("");
            },
            (err) => setMapStatus(err.code === err.PERMISSION_DENIED ? "denied" : "failed"),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const submit = (e) => {
        e.preventDefault();
        const next = {};
        const req = t("createTender.required");
        // نفس ترتيب الحقول بالصفحة، عشان التركيز يروح لأول حقل فيه خطأ
        if (!form.name.trim()) next.name = req;
        if (!form.number.trim()) next.number = req;
        if (!form.category) next.category = req;
        if (!form.closeDate) next.closeDate = req;
        if (!form.services.length) next.services = req;
        if (!form.desc.trim()) next.desc = req;
        if (!form.governorateId) next.governorateId = req;
        if (!form.value) next.value = req;
        else if (!(Number(form.value) > 0)) next.value = t("createTender.invalidValue");
        if (!form.submitDate) next.submitDate = req;
        else if (form.closeDate && form.submitDate > form.closeDate) next.submitDate = t("createTender.submitAfterClose");
        setErrors(next);
        if (Object.keys(next).length) {
            document.getElementById(`tender-${Object.keys(next)[0]}`)?.focus();
            return;
        }
        // ⚠️ ما في endpoint للمناقصات بالسيرفر لسا — لما يجهز، ابعتي form + files + mapPlace من هون
        setCreated(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (created) {
        return (
            <div className={`${card} mx-auto flex max-w-[560px] flex-col items-center px-6 py-12 text-center`}>
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#DDF6E3] text-[#2EAF4E]">
                    <CircleCheck size={32} />
                </span>
                <h1 className="mt-5 text-[20px] font-bold text-[#22455E]">{t("createTender.successTitle")}</h1>
                <p className="mt-2 text-[13px] leading-[1.9] text-[#575757]">
                    {t("createTender.successDesc", { name: form.name.trim() })}
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <Link
                        to={`${BASE}/tenders`}
                        className="inline-flex h-11 min-w-[160px] items-center justify-center rounded-xl bg-[#4B9AD2] px-6 text-[14px] font-semibold text-white btn-wipe"
                    >
                        {t("createTender.goTenders")}
                    </Link>
                    <button
                        type="button"
                        onClick={() => {
                            setForm({ desc: "", name: "", number: "", category: "", closeDate: "", services: [], governorateId: "", value: "", submitDate: "" });
                            setFiles([]);
                            setMapQuery("");
                            setMapPlace("");
                            setMapStatus("");
                            setCreated(false);
                        }}
                        className="inline-flex h-11 min-w-[160px] cursor-pointer items-center justify-center rounded-xl border border-[#4B9AD2] px-6 text-[14px] font-semibold text-[#4B9AD2] btn-wipe btn-wipe-outline"
                    >
                        {t("createTender.another")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={submit} noValidate className="mx-auto flex max-w-[1100px] flex-col gap-6">
            <header>
                <h1 className="flex items-center gap-2 text-[22px] font-bold text-[#22455E]">
                    {t("createTender.title")}
                    <FilePlus2 size={22} className="text-[#4B9AD2]" />
                </h1>
                <p className="mt-1 text-[12px] text-[#89949D]">{t("createTender.subtitle")}</p>
            </header>

            {/* 1. المعلومات الأساسية */}
            <section className={card}>
                <SectionHeader icon={FileText}>{t("createTender.basic")}</SectionHeader>
                <div className="p-5">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <Label htmlFor="tender-name" required>{t("createTender.name")}</Label>
                            <input
                                id="tender-name"
                                value={form.name}
                                onChange={update("name")}
                                aria-invalid={!!errors.name}
                                placeholder={t("createTender.namePlaceholder")}
                                className={`${field} px-4`}
                            />
                            <FieldError text={errors.name} />
                        </div>
                        <div>
                            <Label htmlFor="tender-number" required>{t("createTender.number")}</Label>
                            <input
                                id="tender-number"
                                value={form.number}
                                onChange={update("number")}
                                aria-invalid={!!errors.number}
                                placeholder={t("createTender.numberPlaceholder")}
                                className={`${field} px-4`}
                            />
                            <FieldError text={errors.number} />
                        </div>
                        <div>
                            <Label htmlFor="tender-category" required>{t("createTender.category")}</Label>
                            <div className="relative">
                                <select
                                    id="tender-category"
                                    value={form.category}
                                    onChange={update("category")}
                                    aria-invalid={!!errors.category}
                                    className={`${field} cursor-pointer appearance-none pe-10 ps-4 ${form.category ? "" : "text-[#89949D]"}`}
                                >
                                    <option value="" disabled>{t("createTender.categoryPlaceholder")}</option>
                                    {CATEGORIES.map((key) => (
                                        <option key={key} value={key} className="text-[#414141]">
                                            {t(`createTender.categories.${key}`)}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className={iconEnd} />
                            </div>
                            <FieldError text={errors.category} />
                        </div>
                        <div>
                            <Label htmlFor="tender-closeDate" required>{t("createTender.closeDate")}</Label>
                            <DateField
                                id="tender-closeDate"
                                min={today}
                                value={form.closeDate}
                                onChange={setDate("closeDate")}
                                invalid={!!errors.closeDate}
                                placeholder={t("createTender.closeDatePlaceholder")}
                            />
                            <FieldError text={errors.closeDate} />
                        </div>
                    </div>

                    <div className="mt-4">
                        <Label htmlFor="tender-services" required>{t("createTender.services")}</Label>
                        <ServicesSelect
                            id="tender-services"
                            value={form.services}
                            onChange={(services) => {
                                setForm((f) => ({ ...f, services }));
                                setErrors((er) => ({ ...er, services: "" }));
                            }}
                            invalid={!!errors.services}
                        />
                        <FieldError text={errors.services} />
                    </div>

                    <div className="mt-4">
                        <Label htmlFor="tender-desc" required>{t("createTender.desc")}</Label>
                        <textarea
                            id="tender-desc"
                            rows={4}
                            maxLength={DESC_MAX}
                            value={form.desc}
                            onChange={update("desc")}
                            aria-invalid={!!errors.desc}
                            placeholder={t("createTender.descPlaceholder")}
                            className={`${field} h-auto resize-none px-4 py-3 leading-[1.8]`}
                        />
                        <div className="mt-1 flex justify-between gap-3">
                            <FieldError text={errors.desc} />
                            <span className="ms-auto text-[10px] tabular-nums text-[#89949D]" dir="ltr">
                                {form.desc.length}/{DESC_MAX}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. تفاصيل إضافية */}
            <section className={card}>
                <SectionHeader icon={Settings}>{t("createTender.extra")}</SectionHeader>
                <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <Label htmlFor="tender-governorateId" required>{t("createTender.location")}</Label>
                        <div className="relative">
                            <select
                                id="tender-governorateId"
                                value={form.governorateId}
                                onChange={update("governorateId")}
                                aria-invalid={!!errors.governorateId}
                                className={`${field} cursor-pointer appearance-none pe-10 ps-4 ${form.governorateId ? "" : "text-[#89949D]"}`}
                            >
                                <option value="" disabled>
                                    {governorates.loading ? t("createTender.loading") : t("createTender.locationPlaceholder")}
                                </option>
                                {governorates.options.map((o) => (
                                    <option key={o.value} value={o.value} className="text-[#414141]">
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                            <MapPin size={17} strokeWidth={1.7} className={iconEnd} />
                        </div>
                        <FieldError text={errors.governorateId} />
                    </div>
                    <div>
                        <Label htmlFor="tender-value" required>{t("createTender.value")}</Label>
                        <IconInput
                            adornment="₪"
                            id="tender-value"
                            type="number"
                            min="1"
                            inputMode="decimal"
                            value={form.value}
                            onChange={update("value")}
                            aria-invalid={!!errors.value}
                            placeholder={t("createTender.valuePlaceholder")}
                        />
                        <FieldError text={errors.value} />
                    </div>
                    <div>
                        <Label htmlFor="tender-submitDate" required>{t("createTender.submitDate")}</Label>
                        <DateField
                            id="tender-submitDate"
                            min={today}
                            value={form.submitDate}
                            onChange={setDate("submitDate")}
                            invalid={!!errors.submitDate}
                            placeholder={t("createTender.submitDatePlaceholder")}
                        />
                        <FieldError text={errors.submitDate} />
                    </div>
                    <div>
                        <Label htmlFor="tender-files">{t("createTender.files")}</Label>
                        <label
                            htmlFor="tender-files"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                addFiles(e.dataTransfer.files);
                            }}
                            className="flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#8EC0E4] bg-[#F7FBFE] px-3 py-3 text-center transition-colors hover:bg-[#EAF3FB]"
                        >
                            <Paperclip size={16} className="text-[#4B9AD2]" />
                            <span className="text-[12px] font-semibold text-[#4B9AD2]">{t("createTender.filesCta")}</span>
                            <span className="text-[10px] text-[#89949D]">{t("createTender.filesHint")}</span>
                        </label>
                        <input
                            id="tender-files"
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                            className="hidden"
                            onChange={(e) => {
                                addFiles(e.target.files);
                                e.target.value = "";
                            }}
                        />
                        {files.length > 0 && (
                            <ul className="mt-2 flex flex-wrap gap-1.5">
                                {files.map((f, i) => (
                                    <li
                                        key={`${f.name}-${i}`}
                                        className="flex items-center gap-1 rounded-full bg-[#EAF3FB] py-0.5 pe-1 ps-2.5 text-[10px] text-[#38749E]"
                                    >
                                        <span className="max-w-[120px] truncate" dir="ltr">{f.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => setFiles((list) => list.filter((_, j) => j !== i))}
                                            aria-label={t("createTender.removeFile", { name: f.name })}
                                            className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full hover:bg-white"
                                        >
                                            <X size={10} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </section>

            {/* 3. الموقع على الخريطة */}
            <section className={card}>
                <SectionHeader icon={MapIcon}>{t("createTender.map")}</SectionHeader>
                <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                    <button
                        type="button"
                        onClick={locateOnMap}
                        disabled={mapStatus === "locating"}
                        className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#D9DEE3] px-5 text-[12px] font-bold text-[#22455E] shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors hover:border-[#4B9AD2] hover:text-[#4B9AD2] disabled:cursor-wait disabled:opacity-60"
                    >
                        <MapIcon size={16} className="text-[#286292]" />
                        {mapStatus === "locating" ? t("createTender.locating") : t("createTender.locate")}
                    </button>
                    <div className="relative flex-1">
                        <input
                            type="search"
                            value={mapQuery}
                            onChange={(e) => {
                                setMapQuery(e.target.value);
                                if (mapStatus !== "locating") setMapStatus("");
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    locateOnMap();
                                }
                            }}
                            aria-label={t("createTender.mapSearch")}
                            placeholder={t("createTender.mapSearch")}
                            className={`${field} pe-10 ps-4 [&::-webkit-search-cancel-button]:hidden`}
                        />
                        <Search size={17} strokeWidth={1.7} className={iconEnd} />
                    </div>
                    {/* معاينة الخريطة (Google Maps embed — ما بيحتاج مفتاح) */}
                    <div className="h-[120px] w-full shrink-0 overflow-hidden rounded-2xl border border-[#DCE3E8] bg-[#E5ECF1] md:h-[80px] md:w-[190px]">
                        {mapPlace ? (
                            <iframe
                                title={t("createTender.mapPreview")}
                                src={`https://www.google.com/maps?q=${encodeURIComponent(mapPlace)}&z=14&output=embed`}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="h-full w-full border-0"
                            />
                        ) : (
                            // رسمة خريطة بسيطة لحد ما يتحدد مكان
                            <svg viewBox="0 0 430 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className="h-full w-full">
                                <rect width="430" height="180" fill="#E5ECF1" />
                                <path d="M22 0 H262 C280 12 276 46 252 62 C220 80 150 64 96 50 C52 38 26 22 22 0 Z" fill="#DBF5EC" />
                                <path d="M0 68 L290 98" stroke="#F8FBFD" strokeWidth="18" />
                                <path d="M4 158 L356 82" stroke="#F8FBFD" strokeWidth="18" />
                                <ellipse cx="226" cy="96" rx="42" ry="12" fill="#B9D4E8" opacity="0.6" />
                                <circle cx="214" cy="88" r="31" fill="#C6E6FA" />
                                <path d="M214 63 C200 63 190 73 190 86 C190 101 214 113 214 113 C214 113 238 101 238 86 C238 73 228 63 214 63 Z" fill="#2B95DA" />
                                <circle cx="214" cy="85" r="7.5" fill="none" stroke="#1F78B8" strokeWidth="3" />
                            </svg>
                        )}
                    </div>
                </div>
                {(mapStatus && mapStatus !== "locating") || mapPlace ? (
                    <div className="-mt-1 flex flex-wrap items-center justify-between gap-2 px-5 pb-4 text-[11px]">
                        {mapStatus && mapStatus !== "locating" ? (
                            <p role="alert" className="text-red-500">{t(`createTender.mapErrors.${mapStatus}`)}</p>
                        ) : (
                            <p className="text-[#2E9E5B]">{t("createTender.mapSelected")}</p>
                        )}
                        {mapPlace && (
                            <a
                                href={`https://www.google.com/maps?q=${encodeURIComponent(mapPlace)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-[#4B9AD2] hover:underline"
                            >
                                {t("createTender.openMap")}
                            </a>
                        )}
                    </div>
                ) : (
                    <p className="-mt-1 px-5 pb-4 text-[11px] text-[#89949D]">{t("createTender.mapHint")}</p>
                )}
            </section>

            <div className="flex flex-wrap gap-3">
                <button
                    type="submit"
                    className="inline-flex h-11 min-w-[180px] cursor-pointer items-center justify-center rounded-xl bg-[#4B9AD2] px-6 text-[14px] font-semibold text-white btn-wipe"
                >
                    {t("createTender.submit")}
                </button>
                <Link
                    to={`${BASE}/tenders`}
                    className="inline-flex h-11 min-w-[150px] items-center justify-center rounded-xl border border-[#E8A5AB] px-6 text-[14px] font-semibold text-[#D64545] transition-colors hover:bg-[#FFF6F6]"
                >
                    {t("createTender.cancel")}
                </Link>
            </div>
        </form>
    );
}
