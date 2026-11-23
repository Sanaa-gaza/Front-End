import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    ChevronDown,
    CircleCheck,
    CalendarDays,
    CircleHelp,
    FileText,
    Lightbulb,
    PencilLine,
    X,
} from "lucide-react";
import { useGovernorates, useServices } from "../../../hooks/useReferenceData";
import DateField from "../../../components/dashboard/DateField";
import MapPicker from "../../../components/dashboard/MapPicker";

const BASE = "/dashboard/institution";
const TITLE_MAX = 100;
const DESC_MAX = 500;
const SCOPE_MAX = 2000;
const REQUIREMENTS_MAX = 1000;
// أيقونة رأس كل خطوة
const STEP_ICONS = { basic: FileText, scope: PencilLine, budget: CalendarDays, review: Check };
const CATEGORIES = ["construction", "maintenance", "electrical", "plumbing", "supply", "furnishing", "other"];
// خطوات الإنشاء
const STEPS = ["basic", "scope", "budget", "review"];
// ⚠️ رقم المسودة تجريبي لحد ما يرجعه السيرفر
const DRAFT_NUMBER = "DRF-2025-052";

const card = "rounded-[20px] border border-[#DDDDDD] bg-white";
const field =
    "h-11 w-full rounded-xl border border-[#DDDDDD] bg-white text-[13px] text-[#1E293B] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#4B9AD2] aria-[invalid=true]:border-red-400";
const iconEnd = "pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-[#64748B]";

const EMPTY = {
    name: "",
    category: "",
    governorateId: "",
    desc: "",
    services: [],
    scope: "",
    requirements: "",
    value: "",
    submitDate: "",
    startDate: "",
    duration: "",
    confirm: false,
};

function Label({ htmlFor, required, children }) {
    const { t } = useTranslation("institutionDashboard");
    return (
        <label htmlFor={htmlFor} className="mb-2 block text-[13px] font-medium text-[#1E293B]">
            {children}
            {required ? <span className="ms-0.5 text-red-500">*</span> : <span className="ms-1 text-[#94A3B8]">{t("createTender.optional")}</span>}
        </label>
    );
}

/** حجم الملف بشكل مقروء */
const formatSize = (bytes) =>
    bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const FieldError = ({ text }) => (text ? <p className="mt-1 text-[11px] text-red-500">{text}</p> : null);

/** عدّاد الحروف تحت الحقل */
function Counter({ value, max }) {
    const { t } = useTranslation("institutionDashboard");
    return <span className="text-[11px] text-[#94A3B8] tabular-nums">{t("createTender.counter", { count: value.length, max })}</span>;
}

/** قائمة منسدلة للخدمات المطلوبة — بتسمح باختيار أكثر من خدمة (من GET /services) */
function ServicesSelect({ id, value, onChange, invalid }) {
    const { t } = useTranslation("institutionDashboard");
    const services = useServices();
    const [open, setOpen] = useState(false);
    const boxRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
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
                className={`${field} flex cursor-pointer items-center pe-10 ps-4 text-start ${names.length ? "" : "text-[#94A3B8]"}`}
            >
                <span className="truncate">{names.length ? names.join("، ") : t("createTender.servicesPlaceholder")}</span>
            </button>
            <ChevronDown size={16} className={`${iconEnd} transition-transform ${open ? "rotate-180" : ""}`} />
            {open && (
                <ul
                    role="listbox"
                    aria-multiselectable="true"
                    className="absolute inset-x-0 top-full z-20 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-[#DDDDDD] bg-white p-1.5 shadow-[0_10px_30px_rgba(35,74,100,0.14)]"
                >
                    {services.loading ? (
                        <li className="px-3 py-2 text-[12px] text-[#94A3B8]">{t("createTender.loading")}</li>
                    ) : (
                        services.options.map((o) => {
                            const v = String(o.value);
                            const on = value.includes(v);
                            return (
                                <li key={v} role="option" aria-selected={on}>
                                    <button
                                        type="button"
                                        onClick={() => toggle(v)}
                                        className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-start text-[13px] transition-colors hover:bg-[#F3F8FD] ${on ? "text-[#3D8BC9]" : "text-[#334155]"}`}
                                    >
                                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${on ? "border-[#4B9AD2] bg-[#4B9AD2] text-white" : "border-[#DDDDDD]"}`}>
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

/** مراحل الإنشاء: المنتهية خضرا (وبترجعلها)، الحالية زرقا، والجاية رمادية */
function Steps({ current, onGo }) {
    const { t } = useTranslation("institutionDashboard");
    return (
        <ol className="flex items-start gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {STEPS.map((key, i) => {
                const state = i < current ? "done" : i === current ? "current" : "upcoming";
                return (
                    <React.Fragment key={key}>
                        {i > 0 && (
                            <li aria-hidden="true" className={`mt-4 h-0.5 min-w-6 flex-1 rounded-full ${i <= current ? "bg-[#10B981]/50" : "bg-[#E2E8F0]"}`} />
                        )}
                        <li className="shrink-0">
                            <button
                                type="button"
                                onClick={() => state === "done" && onGo(i)}
                                disabled={state !== "done"}
                                aria-current={state === "current" ? "step" : undefined}
                                className="flex items-center gap-2.5 text-start enabled:cursor-pointer disabled:cursor-default"
                            >
                                <span
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${state === "done" ? "bg-[#10B981] text-white" : state === "current" ? "bg-[#4B9AD2] text-white ring-4 ring-[#4B9AD2]/20" : "bg-[#F1F5F9] text-[#94A3B8]"}`}
                                >
                                    {state === "done" ? <Check size={15} strokeWidth={3} /> : i + 1}
                                </span>
                                <span>
                                    <span className={`block text-[13px] font-bold ${state === "current" ? "text-[#3D8BC9]" : state === "done" ? "text-[#334155]" : "text-[#64748B]"}`}>
                                        {t(`createTender.steps.${key}.title`)}
                                    </span>
                                    <span className="block text-[11px] text-[#94A3B8]">{t(`createTender.steps.${key}.desc`)}</span>
                                </span>
                            </button>
                        </li>
                    </React.Fragment>
                );
            })}
        </ol>
    );
}

/** صفحة "إنشاء مناقصة جديدة" — بتفتح من زر "+" بالشريط العلوي */
export default function InstitutionCreateTender() {
    const { t, i18n } = useTranslation("institutionDashboard");
    const governorates = useGovernorates();
    const services = useServices();
    const locale = `${i18n.language}-u-nu-latn`;
    const isRtl = i18n.dir() === "rtl";
    const [step, setStep] = useState(0);
    const [form, setForm] = useState(EMPTY);
    const [files, setFiles] = useState([]);
    // الموقع على الخريطة: { lat, lng, label } أو null
    const [mapPlace, setMapPlace] = useState(null);
    const [errors, setErrors] = useState({});
    const [savedAt, setSavedAt] = useState(null);
    const [created, setCreated] = useState(false);
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const stepKey = STEPS[step];
    const NextIcon = isRtl ? ArrowLeft : ArrowRight;
    // "إلغاء" (الخطوة الأولى) سهمه بنفس اتجاه "التالي"؛ "السابق" سهمه بيشاور لورا (يمين بالعربي)
    const BackIcon = isRtl ? ArrowRight : ArrowLeft;

    const set = (key, value) => {
        setForm((f) => ({ ...f, [key]: value }));
        setErrors((er) => ({ ...er, [key]: "" }));
    };
    const update = (key) => (e) => set(key, e.target.value);

    const addFiles = (list) => {
        const picked = Array.from(list || []);
        if (picked.length) setFiles((f) => [...f, ...picked]);
    };

    /** التحقق من حقول خطوة وحدة — بيرجع الأخطاء */
    const validate = (key) => {
        const next = {};
        const req = t("createTender.required");
        if (key === "basic") {
            if (!form.name.trim()) next.name = req;
            if (!form.category) next.category = req;
            if (!form.governorateId) next.governorateId = req;
            if (!mapPlace) next.mapPlace = t("createTender.mapRequired");
        }
        if (key === "scope") {
            if (!form.services.length) next.services = req;
            if (!form.scope.trim()) next.scope = req;
        }
        if (key === "budget") {
            if (!form.value) next.value = req;
            else if (!(Number(form.value) > 0)) next.value = t("createTender.invalidValue");
            if (!form.duration) next.duration = req;
            else if (!(Number(form.duration) > 0)) next.duration = t("createTender.invalidValue");
            // البدء المتوقع (اختياري) لازم يكون بعد آخر موعد للتقديم
            if (form.startDate && form.submitDate && form.startDate < form.submitDate) next.startDate = t("createTender.startBeforeSubmit");
            if (!form.submitDate) next.submitDate = req;
        }
        if (key === "review" && !form.confirm) next.confirm = t("createTender.confirmRequired");
        return next;
    };

    const goNext = () => {
        const next = validate(stepKey);
        setErrors(next);
        if (Object.keys(next).length) {
            document.getElementById(`tender-${Object.keys(next)[0]}`)?.focus();
            return;
        }
        if (step < STEPS.length - 1) {
            setStep(step + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        // ⚠️ ما في endpoint للمناقصات بالسيرفر لسا — لما يجهز، ابعتي form + files + mapPlace من هون
        setCreated(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // ⚠️ حفظ المسودة محلي لحد ما يصير في endpoint
    const saveDraft = () => setSavedAt(new Date());

    if (created) {
        return (
            <div className={`${card} mx-auto flex max-w-[560px] flex-col items-center px-6 py-12 text-center`}>
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A]">
                    <CircleCheck size={32} />
                </span>
                <h1 className="mt-5 text-[20px] font-bold text-[#1E293B]">{t("createTender.successTitle")}</h1>
                <p className="mt-2 text-[13px] leading-[1.9] text-[#475569]">{t("createTender.successDesc", { name: form.name.trim() })}</p>
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
                            setForm(EMPTY);
                            setFiles([]);
                            setMapPlace(null);
                            setStep(0);
                            setSavedAt(null);
                            setCreated(false);
                        }}
                        className="inline-flex h-11 min-w-[160px] cursor-pointer items-center justify-center rounded-xl border border-[#4B9AD2] px-6 text-[14px] font-semibold text-[#3D8BC9] btn-wipe btn-wipe-outline"
                    >
                        {t("createTender.another")}
                    </button>
                </div>
            </div>
        );
    }

    const governorateName = governorates.options.find((o) => String(o.value) === String(form.governorateId))?.label || "—";
    const serviceNames = services.options.filter((o) => form.services.includes(String(o.value))).map((o) => o.label);
    const fmtDate = (d) => (d ? new Date(`${d}T00:00`).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }) : "—");
    const percent = Math.round(((step + 1) / STEPS.length) * 100);

    // ملخص المراجعة: كل قسم برجعلو بزر "تعديل"
    const review = [
        {
            step: 0,
            rows: [
                ["name", form.name.trim() || "—"],
                ["category", form.category ? t(`createTender.categories.${form.category}`) : "—"],
                ["location", governorateName, true],
                ["desc", form.desc.trim() || "—", true],
                ["mapPoint", mapPlace ? mapPlace.label || `${mapPlace.lat.toFixed(5)}, ${mapPlace.lng.toFixed(5)}` : "—", true],
            ],
        },
        {
            step: 1,
            rows: [
                ["services", serviceNames.join("، ") || "—", true],
                ["scope", form.scope.trim() || "—", true],
                ["requirements", form.requirements.trim() || "—", true],
                ["files", files.length ? t("createTender.filesCount", { count: files.length }) : "—"],
            ],
        },
        {
            step: 2,
            rows: [
                ["value", form.value ? t("createTender.money", { value: Number(form.value).toLocaleString("en-US") }) : "—"],
                ["duration", form.duration ? t("createTender.daysCount", { count: Number(form.duration) }) : "—"],
                ["submitDate", fmtDate(form.submitDate)],
                ...(form.startDate ? [["startDate", fmtDate(form.startDate)]] : []),
            ],
        },
    ];

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                goNext();
            }}
            noValidate
            className="mx-auto flex max-w-[1100px] flex-col gap-5"
        >
            {/* العنوان + حفظ كمسودة */}
            <header className={`${card} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6`}>
                <div className="flex items-start gap-3">
                    <FileText size={26} strokeWidth={1.8} className="mt-0.5 shrink-0 text-[#3D8BC9]" />
                    <div>
                        <h1 className="text-[24px] font-bold leading-[1.3] text-[#1E293B]">{t("createTender.title")}</h1>
                        <p className="mt-1 text-[12px] text-[#64748B]">{t("createTender.subtitle")}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={saveDraft}
                    className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#C7E0F1] px-5 text-[13px] font-semibold text-[#3D8BC9] btn-wipe btn-wipe-outline"
                >
                    <FileText size={16} />
                    {t("createTender.saveDraft")}
                </button>
            </header>

            {savedAt && (
                <p role="status" className="rounded-xl border border-[#A7E8CF] bg-[#ECFDF5] px-4 py-3 text-[13px] text-[#059669]">
                    {t("createTender.draftSaved")}
                </p>
            )}

            {/* المراحل */}
            <section className={`${card} px-5 py-4`}>
                <Steps current={step} onGo={setStep} />
            </section>

            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                {/* الخطوة الحالية */}
                <section className={`${card} overflow-hidden`}>
                    <div className="flex items-center gap-3 border-b border-[#F1F5F9] px-5 py-5 sm:px-6">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FC] text-[#3D8BC9]">
                            {React.createElement(STEP_ICONS[stepKey], { size: 20, strokeWidth: 1.8 })}
                        </span>
                        <div>
                            <h2 className="text-[16px] font-semibold text-[#1E293B]">{t(`createTender.steps.${stepKey}.heading`, { defaultValue: t(`createTender.steps.${stepKey}.title`) })}</h2>
                            <p className="mt-0.5 text-[12px] text-[#64748B]">{t(`createTender.steps.${stepKey}.intro`)}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-5 px-5 py-6 sm:px-6">
                        {stepKey === "basic" && (
                            <>
                                <div>
                                    <Label htmlFor="tender-name" required>{t("createTender.name")}</Label>
                                    <input
                                        name="name"
                                        id="tender-name"
                                        value={form.name}
                                        maxLength={TITLE_MAX}
                                        onChange={update("name")}
                                        aria-invalid={!!errors.name}
                                        placeholder={t("createTender.namePlaceholder")}
                                        className={`${field} px-4`}
                                    />
                                    {/* العدّاد على بداية السطر (يمين) والخطأ تحته */}
                                    <div className="mt-1">
                                        <Counter value={form.name} max={TITLE_MAX} />
                                        <FieldError text={errors.name} />
                                    </div>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="tender-category" required>{t("createTender.category")}</Label>
                                        <div className="relative">
                                            <select
                                                name="category"
                                                id="tender-category"
                                                value={form.category}
                                                onChange={update("category")}
                                                aria-invalid={!!errors.category}
                                                className={`${field} cursor-pointer appearance-none pe-10 ps-4 ${form.category ? "" : "text-[#94A3B8]"}`}
                                            >
                                                <option value="" disabled>{t("createTender.categoryPlaceholder")}</option>
                                                {CATEGORIES.map((key) => (
                                                    <option key={key} value={key} className="text-[#1E293B]">
                                                        {t(`createTender.categories.${key}`)}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown size={16} className={iconEnd} />
                                        </div>
                                        <FieldError text={errors.category} />
                                    </div>
                                    <div>
                                        <Label htmlFor="tender-governorateId" required>{t("createTender.location")}</Label>
                                        <div className="relative">
                                            <select
                                                name="governorate_id"
                                                id="tender-governorateId"
                                                value={form.governorateId}
                                                onChange={update("governorateId")}
                                                aria-invalid={!!errors.governorateId}
                                                className={`${field} cursor-pointer appearance-none pe-10 ps-4 ${form.governorateId ? "" : "text-[#94A3B8]"}`}
                                            >
                                                <option value="" disabled>
                                                    {governorates.loading ? t("createTender.loading") : t("createTender.locationPlaceholder")}
                                                </option>
                                                {governorates.options.map((o) => (
                                                    <option key={o.value} value={o.value} className="text-[#1E293B]">
                                                        {o.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown size={16} className={iconEnd} />
                                        </div>
                                        <FieldError text={errors.governorateId} />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="tender-desc">{t("createTender.desc")}</Label>
                                    <textarea
                                        name="desc"
                                        id="tender-desc"
                                        rows={4}
                                        maxLength={DESC_MAX}
                                        value={form.desc}
                                        onChange={update("desc")}
                                        placeholder={t("createTender.descPlaceholder")}
                                        className={`${field} h-auto resize-none px-4 py-3 leading-[1.8]`}
                                    />
                                    <div className="mt-1">
                                        <Counter value={form.desc} max={DESC_MAX} />
                                    </div>
                                </div>

                                {/* الموقع على الخريطة (Leaflet + OpenStreetMap) */}
                                <div>
                                    <Label htmlFor="tender-mapPlace" required>{t("createTender.map")}</Label>
                                    <MapPicker
                                        id="tender-mapPlace"
                                        value={mapPlace}
                                        onChange={(p) => {
                                            setMapPlace(p);
                                            setErrors((er) => ({ ...er, mapPlace: "" }));
                                        }}
                                        invalid={!!errors.mapPlace}
                                    />
                                    <FieldError text={errors.mapPlace} />
                                </div>
                            </>
                        )}

                        {stepKey === "scope" && (
                            <>
                                <div>
                                    <Label htmlFor="tender-services" required>{t("createTender.services")}</Label>
                                    <ServicesSelect
                                        id="tender-services"
                                        value={form.services}
                                        onChange={(v) => set("services", v)}
                                        invalid={!!errors.services}
                                    />
                                    <FieldError text={errors.services} />
                                </div>
                                <div>
                                    <Label htmlFor="tender-scope" required>{t("createTender.scope")}</Label>
                                    <textarea
                                        name="scope"
                                        id="tender-scope"
                                        rows={6}
                                        maxLength={SCOPE_MAX}
                                        value={form.scope}
                                        onChange={update("scope")}
                                        aria-invalid={!!errors.scope}
                                        placeholder={t("createTender.scopePlaceholder")}
                                        className={`${field} h-auto resize-none px-4 py-3 leading-[1.8]`}
                                    />
                                    <div className="mt-1">
                                        <Counter value={form.scope} max={SCOPE_MAX} />
                                        <FieldError text={errors.scope} />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="tender-requirements">{t("createTender.requirements")}</Label>
                                    <textarea
                                        name="requirements"
                                        id="tender-requirements"
                                        rows={4}
                                        maxLength={REQUIREMENTS_MAX}
                                        value={form.requirements}
                                        onChange={update("requirements")}
                                        placeholder={t("createTender.requirementsPlaceholder")}
                                        className={`${field} h-auto resize-none px-4 py-3 leading-[1.8]`}
                                    />
                                    <div className="mt-1">
                                        <Counter value={form.requirements} max={REQUIREMENTS_MAX} />
                                    </div>
                                </div>

                                {/* المرفقات: سحب وإفلات أو اختيار */}
                                <div>
                                    <label
                                        htmlFor="tender-files"
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            addFiles(e.dataTransfer.files);
                                        }}
                                        className="flex cursor-pointer flex-col gap-4 rounded-2xl border border-[#C7E0F1] bg-[#F3F8FD] p-5 transition-colors hover:bg-[#EEF5FC] sm:flex-row sm:items-center"
                                    >
                                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E3EFFA] text-[#3D8BC9]">
                                            <FileText size={22} strokeWidth={1.7} />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-[14px] font-bold text-[#1E293B]">{t("createTender.filesTitle")}</span>
                                            <span className="mt-1 block text-[12px] text-[#64748B]">{t("createTender.filesHint")}</span>
                                        </span>
                                        <span className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-[#DDDDDD] bg-white px-5 text-[13px] font-semibold text-[#334155]">
                                            {t("createTender.filesCta")}
                                        </span>
                                    </label>
                                    <input
                                        name="files"
                                        id="tender-files"
                                        type="file"
                                        multiple
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg"
                                        className="sr-only"
                                        onChange={(e) => {
                                            addFiles(e.target.files);
                                            e.target.value = "";
                                        }}
                                    />
                                    {files.length > 0 && (
                                        <ul className="mt-3 flex flex-col gap-2">
                                            {files.map((file, i) => (
                                                <li
                                                    key={`${file.name}-${i}`}
                                                    className="flex items-center gap-3 rounded-xl border border-[#BFEBCD] bg-[#F0FDF4] px-4 py-3"
                                                >
                                                    <FileText size={18} className="shrink-0 text-[#16A34A]" />
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block truncate text-[13px] font-bold text-[#1E293B]" dir="auto">{file.name}</span>
                                                        <span className="mt-0.5 block text-[11px] text-[#64748B]">
                                                            {t("createTender.uploaded")} · <bdi dir="ltr">{formatSize(file.size)}</bdi>
                                                        </span>
                                                    </span>
                                                    <Check size={16} strokeWidth={2.5} className="shrink-0 text-[#16A34A]" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFiles((list) => list.filter((_, j) => j !== i))}
                                                        aria-label={t("createTender.removeFile", { name: file.name })}
                                                        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#94A3B8] transition-colors hover:bg-white hover:text-[#DC2626]"
                                                    >
                                                        <X size={15} />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </>
                        )}

                        {stepKey === "budget" && (
                            <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="tender-value" required>{t("createTender.value")}</Label>
                                    <div className="relative">
                                        <input
                                            id="tender-value"
                                            name="value"
                                            type="number"
                                            min="1"
                                            inputMode="decimal"
                                            value={form.value}
                                            onChange={update("value")}
                                            aria-invalid={!!errors.value}
                                            className={`${field} pe-10 ps-4 tabular-nums`}
                                        />
                                        <span className={`${iconEnd} text-[13px]`}>{t("createTender.currency")}</span>
                                    </div>
                                    {errors.value ? (
                                        <FieldError text={errors.value} />
                                    ) : (
                                        <p className="mt-1.5 text-[11px] text-[#94A3B8]">{t("createTender.valueHint")}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="tender-duration" required>{t("createTender.duration")}</Label>
                                    <div className="relative">
                                        <input
                                            id="tender-duration"
                                            name="duration_days"
                                            type="number"
                                            min="1"
                                            inputMode="numeric"
                                            value={form.duration}
                                            onChange={update("duration")}
                                            aria-invalid={!!errors.duration}
                                            className={`${field} pe-12 ps-4 tabular-nums`}
                                        />
                                        <span className={`${iconEnd} text-[12px]`}>{t("createTender.day")}</span>
                                    </div>
                                    <FieldError text={errors.duration} />
                                </div>
                                <div>
                                    <Label htmlFor="tender-startDate">{t("createTender.startDate")}</Label>
                                    <DateField
                                        id="tender-startDate"
                                        min={form.submitDate || today}
                                        value={form.startDate}
                                        onChange={(v) => set("startDate", v)}
                                        invalid={!!errors.startDate}
                                        placeholder={t("createTender.datePlaceholder")}
                                    />
                                    <FieldError text={errors.startDate} />
                                </div>
                                <div>
                                    <Label htmlFor="tender-submitDate" required>{t("createTender.submitDate")}</Label>
                                    <DateField
                                        id="tender-submitDate"
                                        min={today}
                                        value={form.submitDate}
                                        onChange={(v) => set("submitDate", v)}
                                        invalid={!!errors.submitDate}
                                        placeholder={t("createTender.datePlaceholder")}
                                    />
                                    <FieldError text={errors.submitDate} />
                                </div>
                            </div>
                        )}

                        {stepKey === "review" && (
                            <>
                                {review.map((section) => (
                                    <div key={section.step} className="overflow-hidden rounded-2xl border border-[#E2E8F0]">
                                        <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                                            <h3 className="text-[13px] font-semibold text-[#1E293B]">{t(`createTender.steps.${STEPS[section.step]}.title`)}</h3>
                                            <button
                                                type="button"
                                                onClick={() => setStep(section.step)}
                                                className="cursor-pointer text-[12px] font-semibold text-[#4B9AD2] hover:underline"
                                            >
                                                {t("createTender.edit")}
                                            </button>
                                        </div>
                                        {/* العنوان فوق والقيمة تحته؛ النصوص الطويلة بعرض السطر كامل */}
                                        <dl className="grid gap-x-6 gap-y-5 px-4 py-5 sm:grid-cols-2">
                                            {section.rows.map(([key, value, full]) => (
                                                <div key={key} className={full ? "sm:col-span-2" : ""}>
                                                    <dt className="text-[12px] text-[#94A3B8]">{t(`createTender.reviewRows.${key}`)}</dt>
                                                    <dd className="mt-1.5 whitespace-pre-line text-[13px] font-medium text-[#1E293B] tabular-nums [overflow-wrap:anywhere]">{value}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </div>
                                ))}
                                <label
                                    className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-[#F3F8FD] px-4 py-4 transition-colors ${errors.confirm ? "border-red-400" : "border-[#C7E0F1]"}`}
                                >
                                    <input
                                        id="tender-confirm"
                                        type="checkbox"
                                        name="confirm"
                                        checked={form.confirm}
                                        onChange={(e) => set("confirm", e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <span
                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#4B9AD2]/40 ${form.confirm ? "border-[#16A34A] bg-[#16A34A] text-white" : "border-[#64748B] bg-white"}`}
                                    >
                                        {form.confirm && <Check size={13} strokeWidth={3} />}
                                    </span>
                                    <span className="text-[13px] text-[#334155]">{t("createTender.confirm")}</span>
                                </label>
                                <FieldError text={errors.confirm} />
                            </>
                        )}

                        {stepKey !== "review" && (
                        <p className="flex items-start gap-2 rounded-xl bg-[#EEF5FC] px-4 py-3 text-[12px] leading-[1.8] text-[#475569]">
                            <CircleHelp size={16} className="mt-0.5 shrink-0 text-[#4B9AD2]" />
                            {t(`createTender.steps.${stepKey}.note`)}
                        </p>
                        )}
                    </div>

                    {/* الخطوة الأولى: التالي يمين والإلغاء يسار — باقي الخطوات: السابق يمين والتالي يسار */}
                    <div className="flex items-center justify-between gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4 sm:px-6">
                        <button
                            type="submit"
                            className={`group inline-flex h-11 min-w-[130px] cursor-pointer items-center justify-center gap-2 rounded-xl px-6 text-[14px] font-semibold text-white ${step === STEPS.length - 1 ? "bg-[#16A34A] transition-colors hover:bg-[#15803D]" : "bg-[#4B9AD2] btn-wipe"}`}
                        >
                            {step === STEPS.length - 1 ? t("createTender.submit") : t("createTender.next")}
                            {step === STEPS.length - 1 ? (
                                <BackIcon size={16} className="transition-transform duration-200 ease-out rtl:group-hover:translate-x-1 ltr:group-hover:-translate-x-1" />
                            ) : (
                                // السهم بيمشي لقدّام (يسار بالعربي) مع المرور، وأكثر مع الضغط
                                <NextIcon
                                    size={16}
                                    className="transition-transform duration-200 ease-out rtl:group-hover:-translate-x-1 rtl:group-active:-translate-x-2.5 ltr:group-hover:translate-x-1 ltr:group-active:translate-x-2.5"
                                />
                            )}
                        </button>
                        {step === 0 ? (
                            <Link
                                to={`${BASE}/tenders`}
                                className="inline-flex h-11 min-w-[110px] items-center justify-center gap-2 rounded-xl border border-[#DDDDDD] bg-white px-5 text-[14px] font-medium text-[#334155] transition-colors hover:bg-[#F1F5F9]"
                            >
                                <NextIcon size={16} />
                                {t("createTender.cancel")}
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setErrors({});
                                    setStep(step - 1);
                                }}
                                className="group order-first inline-flex h-11 min-w-[110px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#DDDDDD] bg-white px-5 text-[14px] font-medium text-[#334155] transition-colors hover:bg-[#F1F5F9]"
                            >
                                {/* السهم بيمشي لورا (يمين بالعربي) مع المرور، وأكثر مع الضغط */}
                                {step < STEPS.length - 1 && (
                                    <BackIcon
                                        size={16}
                                        className="transition-transform duration-200 ease-out rtl:group-hover:translate-x-1 rtl:group-active:translate-x-2.5 ltr:group-hover:-translate-x-1 ltr:group-active:-translate-x-2.5"
                                    />
                                )}
                                {t("createTender.back")}
                            </button>
                        )}
                    </div>
                </section>

                {/* العمود الجانبي */}
                <aside className="flex flex-col gap-4">
                    <section className={`${card} flex items-center gap-4 p-5`}>
                        <span className="text-[26px] font-bold text-[#3D8BC9] tabular-nums">{percent}%</span>
                        <div>
                            <p className="text-[13px] font-bold text-[#1E293B]">{t("createTender.progress")}</p>
                            <p className="mt-0.5 text-[11px] text-[#94A3B8]">{t("createTender.stepOf", { step: step + 1, total: STEPS.length })}</p>
                        </div>
                    </section>

                    <section className="rounded-[20px] border border-[#F3D66B] bg-[#FFF7D6] p-4">
                        <p className="flex items-center gap-2 text-[13px] font-bold text-[#9A7400]">
                            <Lightbulb size={16} className="shrink-0" />
                            {t(`createTender.steps.${stepKey}.tipTitle`)}
                        </p>
                        <p className="mt-1.5 text-[12px] leading-[1.8] text-[#9A7400]/85">{t(`createTender.steps.${stepKey}.tip`)}</p>
                    </section>

                    <section className={`${card} p-5`}>
                        <h2 className="text-[13px] font-bold text-[#1E293B]">{t("createTender.info.title")}</h2>
                        <dl className="mt-2 divide-y divide-[#F1F5F9] text-[12px]">
                            <div className="flex items-center justify-between gap-3 py-2.5">
                                <dt className="text-[#94A3B8]">{t("createTender.info.number")}</dt>
                                <dd className="font-semibold text-[#334155]">
                                    <bdi dir="ltr">{DRAFT_NUMBER}</bdi>
                                </dd>
                            </div>
                            <div className="flex items-center justify-between gap-3 py-2.5">
                                <dt className="text-[#94A3B8]">{t("createTender.info.saved")}</dt>
                                <dd className="font-semibold text-[#334155] tabular-nums">
                                    {savedAt ? savedAt.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }) : t("createTender.info.notSaved")}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between gap-3 py-2.5">
                                <dt className="text-[#94A3B8]">{t("createTender.info.status")}</dt>
                                <dd>
                                    <span className="rounded-full bg-[#F1F5F9] px-3 py-1 text-[11px] font-semibold text-[#64748B]">{t("createTender.info.draft")}</span>
                                </dd>
                            </div>
                        </dl>
                    </section>
                </aside>
            </div>
        </form>
    );
}
