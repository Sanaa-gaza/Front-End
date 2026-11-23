import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

// التاريخ بصيغة "YYYY-MM-DD" (نفس صيغة السيرفر) بدون مشاكل المنطقة الزمنية
const toKey = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fromKey = (key) => {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
};
const addDays = (date, n) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);

// اختيارات سريعة: بعد كم يوم من اليوم
const QUICK = [
    { key: "week", days: 7 },
    { key: "twoWeeks", days: 14 },
    { key: "month", days: 30 },
];

/**
 * خانة تاريخ بتقويم بتصميم الموقع: الشهر + أسهم + أيام، واختيارات سريعة (بعد أسبوع/أسبوعين/شهر).
 * value/onChange بصيغة "YYYY-MM-DD"، min: أقل تاريخ مسموح بنفس الصيغة.
 * portal: التقويم بينرسم فوق كل الصفحة (position: fixed) — للاستخدام جوا نافذة فيها سكرول عشان ما ينقص.
 */
const POPOVER_W = 290;
const POPOVER_H = 390;

export default function DateField({ id, value, onChange, min, placeholder, invalid, portal = false, autoFocus = false }) {
    const { t, i18n } = useTranslation("dashboard");
    const locale = `${i18n.language}-u-nu-latn`;
    const isRtl = i18n.dir() === "rtl";
    const wrapRef = useRef(null);
    const popRef = useRef(null);
    const btnRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState(null);
    const today = new Date();
    const start = value ? fromKey(value) : min ? fromKey(min) : today;
    const [view, setView] = useState({ y: start.getFullYear(), m: start.getMonth() });

    // Escape أو الضغط برا التقويم بيسكره
    useEffect(() => {
        if (!open) return undefined;
            const onDown = (e) =>
            wrapRef.current &&
            !wrapRef.current.contains(e.target) &&
            !(popRef.current && popRef.current.contains(e.target)) &&
            setOpen(false);
        // Escape جوا نافذة: بنسكر التقويم بس، مش النافذة كلها
        const onKeyCapture = (e) => {
            if (e.key === "Escape") {
                e.stopPropagation();
                setOpen(false);
            }
        };
        window.addEventListener("keydown", onKeyCapture, true);
        document.addEventListener("mousedown", onDown);
        return () => {
            window.removeEventListener("keydown", onKeyCapture, true);
            document.removeEventListener("mousedown", onDown);
        };
    }, [open]);

    // مكان التقويم بوضع portal: تحت الخانة، أو فوقها إذا ما في مساحة؛ وبيلحق الخانة مع السكرول
    useLayoutEffect(() => {
        if (!open || !portal) return undefined;
        const place = () => {
            const rect = btnRef.current?.getBoundingClientRect();
            if (!rect) return;
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const below = vh - rect.bottom >= POPOVER_H + 12 || rect.top < POPOVER_H + 12;
            const top = below ? rect.bottom + 8 : rect.top - 8 - POPOVER_H;
            // بداية التقويم مع بداية الخانة حسب الاتجاه
            let left = isRtl ? rect.right - POPOVER_W : rect.left;
            left = Math.min(Math.max(8, left), vw - POPOVER_W - 8);
            setPos({ top: Math.max(8, top), left });
        };
        place();
        window.addEventListener("resize", place);
        window.addEventListener("scroll", place, true);
        return () => {
            window.removeEventListener("resize", place);
            window.removeEventListener("scroll", place, true);
        };
    }, [open, portal, isRtl]);

    const toggle = () => {
        if (!open) setView({ y: start.getFullYear(), m: start.getMonth() });
        setOpen((v) => !v);
    };

    const pick = (key) => {
        onChange(key);
        setOpen(false);
    };

    const disabled = (key) => Boolean(min) && key < min;

    // أيام الشهر: الأسبوع بيبدأ السبت بالعربي والأحد بالإنجليزي
    const weekStart = isRtl ? 6 : 0;
    const first = new Date(view.y, view.m, 1);
    const offset = (first.getDay() - weekStart + 7) % 7;
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const cells = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => new Date(view.y, view.m, i + 1))];
    const weekdays = Array.from({ length: 7 }, (_, i) =>
        new Date(2024, 0, 7 + ((weekStart + i) % 7)).toLocaleDateString(locale, { weekday: "short" })
    );
    const monthTitle = first.toLocaleDateString(locale, { month: "long", year: "numeric" });
    const todayKey = toKey(today);

    const shiftMonth = (n) => setView(({ y, m }) => {
        const d = new Date(y, m + n, 1);
        return { y: d.getFullYear(), m: d.getMonth() };
    });
    // السهم "السابق" لازم يشاور للبداية حسب اتجاه اللغة
    const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
    const NextIcon = isRtl ? ChevronLeft : ChevronRight;

    const text = value
        ? fromKey(value).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })
        : placeholder;

    const popover = (
                <div
                    ref={popRef}
                    role="dialog"
                    aria-label={placeholder}
                    dir={isRtl ? "rtl" : "ltr"}
                    style={portal && pos ? { top: pos.top, left: pos.left } : undefined}
                    className={`w-[290px] rounded-2xl border border-[#DDDDDD] bg-white p-4 shadow-[0_18px_50px_rgba(35,74,100,0.18)] ${portal ? "fixed z-[60]" : "absolute start-0 top-full z-40 mt-2"}`}
                >
                    {/* اختيارات سريعة */}
                    <div className="flex gap-1.5">
                        {QUICK.map(({ key, days }) => {
                            const k = toKey(addDays(today, days));
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => pick(k)}
                                    className={`h-8 flex-1 cursor-pointer whitespace-nowrap rounded-full border text-[11px] font-medium transition-colors ${value === k
                                        ? "border-[#4B9AD2] bg-[#4B9AD2] text-white"
                                        : "border-[#CFE3F3] bg-[#EAF3FB] text-[#38749E] hover:border-[#4B9AD2]"
                                        }`}
                                >
                                    {t(`datePicker.${key}`)}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => shiftMonth(-1)}
                            aria-label={t("datePicker.prev")}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#4B9AD2] hover:bg-[#EAF3FB]"
                        >
                            <PrevIcon size={17} />
                        </button>
                        <p className="text-[14px] font-bold text-[#22455E]" aria-live="polite">{monthTitle}</p>
                        <button
                            type="button"
                            onClick={() => shiftMonth(1)}
                            aria-label={t("datePicker.next")}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#4B9AD2] hover:bg-[#EAF3FB]"
                        >
                            <NextIcon size={17} />
                        </button>
                    </div>

                    <div className="mt-2 grid grid-cols-7 gap-1 text-center">
                        {weekdays.map((d) => (
                            <span key={d} className="py-1 text-[10px] text-[#89949D]">{d}</span>
                        ))}
                        {cells.map((date, i) => {
                            if (!date) return <span key={`e${i}`} />;
                            const key = toKey(date);
                            const selected = key === value;
                            const off = disabled(key);
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    disabled={off}
                                    onClick={() => pick(key)}
                                    aria-pressed={selected}
                                    aria-label={date.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}
                                    className={`flex h-9 cursor-pointer items-center justify-center rounded-full text-[12px] tabular-nums transition-colors disabled:cursor-default disabled:text-[#D3DAE0] ${selected
                                        ? "bg-[#4B9AD2] font-bold text-white shadow-[0_4px_12px_rgba(75,154,210,0.3)]"
                                        : key === todayKey
                                            ? "border border-[#4B9AD2] font-semibold text-[#4B9AD2] hover:bg-[#EAF3FB]"
                                            : "text-[#414141] hover:bg-[#EAF3FB]"
                                        }`}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>
                </div>
    );

    return (
        <div ref={wrapRef} className="relative">
            <button
                ref={btnRef}
                type="button"
                id={id}
                autoFocus={autoFocus}
                onClick={toggle}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-invalid={invalid}
                className={`flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-xl border bg-white pe-10 ps-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] text-start text-[13px] outline-none transition-colors focus:ring-1 focus:ring-[#4B9AD2] ${invalid ? "border-red-400" : open ? "border-[#4B9AD2]" : "border-[#DDDDDD]"
                    } ${value ? "text-[#414141]" : "text-[#89949D]"}`}
            >
                <span className="flex-1 truncate">{text}</span>
            </button>
            {/* أيقونة التقويم على النهاية، وبتتبدّل بزر المسح لما يتحدد تاريخ */}
            {!value && (
                <CalendarDays
                    size={17}
                    strokeWidth={1.7}
                    className="pointer-events-none absolute end-3.5 top-[22px] -translate-y-1/2 text-[#6F7B85]"
                />
            )}
            {value && (
                <button
                    type="button"
                    onClick={() => onChange("")}
                    aria-label={t("datePicker.clear")}
                    className="absolute end-3 top-[22px] flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#89949D] hover:bg-[#EAF3FB] hover:text-[#575757]"
                >
                    <X size={13} />
                </button>
            )}

            {open && (portal ? (pos ? createPortal(popover, document.body) : null) : popover)}
        </div>
    );
}