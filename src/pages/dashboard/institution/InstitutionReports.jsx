import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, Package, ShoppingBag, Users } from "lucide-react";

// ===== بيانات تجريبية =====
// الباك إند لسا ما فيه endpoints للتقارير المالية. لما تجهز، استبدلي STATS و SPENDING بطلبات من src/api/endpoints.js

const STATS = [
    { key: "total", icon: ArrowUpRight, tone: "bg-[#DDF6E3] text-[#2EAF4E]", value: 12000500 },
    { key: "pending", icon: ShoppingBag, tone: "bg-[#DCEBFA] text-[#4B9AD2]", value: 15, total: 83 },
    { key: "cancelled", icon: Package, tone: "bg-[#FDE2E2] text-[#D64545]", value: 30 },
    { key: "newOrders", icon: Users, tone: "bg-[#F2E1FA] text-[#A24BC8]", value: 244, count: 24 },
];

const YEAR = 2027;
// بالآلاف (شيكل) — قيمة كل نص شهر، من نص شهر قبل يناير لنص شهر بعد يوليو (15 نقطة)،
// عشان شكل المنحنى يطابق التصميم. قيمة الشهر نفسه هي النقطة رقم (2 × رقم الشهر + 1).
const SPENDING = {
    actual: [11.6, 13.6, 6.0, 8.3, 11.4, 14.3, 14.2, 24.5, 24.7, 28.4, 20.9, 22.6, 17.8, 22.8, 23.8],
    planned: [4.8, 13.1, 12.9, 12.4, 16.9, 20.3, 7.4, 6.4, 6.2, 14.7, 12.6, 24.7, 25.5, 27.8, 31],
};
const monthValue = (key, month) => SPENDING[key][month * 2 + 1];

// ألوان السلسلتين — متحقق منها لعمى الألوان (أزرق + برتقالي)
const SERIES = [
    { key: "actual", color: "#2a78d6", dashed: false },
    { key: "planned", color: "#eb6834", dashed: true },
];

const card = "rounded-[20px] border border-[#0000000D] bg-white shadow-[0_4px_24px_rgba(35,74,100,0.08)]";

/**
 * منحنى ناعم يمر بالنقاط بدون ما "يطلع" فوق أو تحت القيم الحقيقية (monotone cubic).
 */
function smoothPath(points) {
    if (points.length < 2) return "";
    const n = points.length;
    const dx = [];
    const slope = [];
    for (let i = 0; i < n - 1; i++) {
        dx[i] = points[i + 1][0] - points[i][0];
        slope[i] = (points[i + 1][1] - points[i][1]) / dx[i];
    }
    const tangent = [slope[0]];
    for (let i = 1; i < n - 1; i++) {
        tangent[i] = slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2;
    }
    tangent[n - 1] = slope[n - 2];

    let d = `M${points[0][0]},${points[0][1]}`;
    for (let i = 0; i < n - 1; i++) {
        const [x0, y0] = points[i];
        const [x1, y1] = points[i + 1];
        const h = dx[i] / 3;
        d += ` C${x0 + h},${y0 + tangent[i] * h} ${x1 - h},${y1 - tangent[i + 1] * h} ${x1},${y1}`;
    }
    return d;
}

/** عرض العنصر الفعلي بالبكسل عشان الرسم يكون واضح على كل الشاشات */
function useWidth() {
    const ref = useRef(null);
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    return [ref, width];
}

function SpendingChart() {
    const { t, i18n } = useTranslation("institutionDashboard");
    const months = t("reportsPage.chart.months", { returnObjects: true });
    const [ref, width] = useWidth();
    const [hover, setHover] = useState(null);
    const [showTable, setShowTable] = useState(false);

    const height = 260;
    const pad = { top: 16, right: 16, bottom: 34, left: 44 };
    const maxY = 32;
    const ticks = [0, 10, 20, 30];

    const geo = useMemo(() => {
        const innerW = Math.max(width - pad.left - pad.right, 0);
        const innerH = height - pad.top - pad.bottom;
        // pos: رقم الشهر (ممكن يكون كسر، مثلاً 1.5 = نص فبراير)
        const x = (pos) => pad.left + (innerW * (pos + 0.5)) / months.length;
        const y = (v) => pad.top + innerH - (innerH * v) / maxY;
        const lines = SERIES.map((s) => {
            const pts = SPENDING[s.key].map((v, i) => [x(i / 2 - 0.5), y(v)]);
            return { ...s, pts, d: smoothPath(pts) };
        });
        return { innerW, innerH, x, y, lines, baseY: y(0) };
    }, [width, months.length]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleMove = (e) => {
        if (!geo.innerW) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const px = e.clientX - rect.left - pad.left;
        const i = Math.floor((px / geo.innerW) * months.length);
        setHover(Math.min(Math.max(i, 0), months.length - 1));
    };

    const fmt = (v) => t("reportsPage.chart.unit", { value: v });
    const actual = geo.lines[0];

    return (
        <section className={`${card} p-5 sm:p-6`}>
            <h2 className="text-[16px] font-bold text-[#22455E]">{t("reportsPage.chart.title")}</h2>
            <p className="mt-1 text-[12px] text-[#89949D]">{t("reportsPage.chart.subtitle", { year: YEAR })}</p>

            {/* المفتاح */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[#575757]">
                {SERIES.map((s) => (
                    <span key={s.key} className="flex items-center gap-2">
                        <svg width="22" height="8" aria-hidden="true">
                            <line
                                x1="1" y1="4" x2="21" y2="4"
                                stroke={s.color}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeDasharray={s.dashed ? "4 4" : undefined}
                            />
                        </svg>
                        {t(`reportsPage.chart.${s.key}`)}
                    </span>
                ))}
            </div>

            {/* الرسم — الزمن من اليسار لليمين حتى بالعربي، متل التصميم */}
            <div ref={ref} dir="ltr" className="relative mt-3">
                {width > 0 && (
                    <svg
                        width={width}
                        height={height}
                        role="img"
                        aria-label={t("reportsPage.chart.title")}
                        onMouseMove={handleMove}
                        onMouseLeave={() => setHover(null)}
                        className="block"
                    >
                        <defs>
                            <linearGradient id="spend-fill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={actual.color} stopOpacity="0.12" />
                                <stop offset="100%" stopColor={actual.color} stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* خطوط الشبكة وقيم المحور */}
                        {ticks.map((v) => (
                            <g key={v}>
                                <line x1={pad.left} x2={pad.left + geo.innerW} y1={geo.y(v)} y2={geo.y(v)} stroke="#EEF1F4" />
                                <text x={pad.left - 10} y={geo.y(v)} dy="0.35em" textAnchor="end" fontSize="11" fill="#89949D">
                                    {v ? `${v}K` : "0"}
                                </text>
                            </g>
                        ))}
                        {months.map((m, i) => (
                            <text key={m} x={geo.x(i)} y={height - 10} textAnchor="middle" fontSize="11" fill="#89949D">
                                {m}
                            </text>
                        ))}

                        {/* مساحة تحت الإنفاق الفعلي */}
                        <path
                            d={`${actual.d} L${actual.pts.at(-1)[0]},${geo.baseY} L${actual.pts[0][0]},${geo.baseY} Z`}
                            fill="url(#spend-fill)"
                        />

                        {geo.lines.map((s) => (
                            <path
                                key={s.key}
                                d={s.d}
                                fill="none"
                                stroke={s.color}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeDasharray={s.dashed ? "5 5" : undefined}
                            />
                        ))}

                        {/* خط التتبع والنقاط عند المرور */}
                        {hover !== null && (
                            <g pointerEvents="none">
                                <line
                                    x1={geo.x(hover)} x2={geo.x(hover)}
                                    y1={pad.top} y2={geo.baseY}
                                    stroke="#C7D3DE"
                                />
                                {geo.lines.map((s) => (
                                    <circle
                                        key={s.key}
                                        cx={s.pts[hover * 2 + 1][0]}
                                        cy={s.pts[hover * 2 + 1][1]}
                                        r="5"
                                        fill={s.color}
                                        stroke="#fff"
                                        strokeWidth="2"
                                    />
                                ))}
                            </g>
                        )}

                        {/* منطقة لمس كبيرة لكل الرسم */}
                        <rect x={pad.left} y={pad.top} width={geo.innerW} height={geo.innerH} fill="transparent" />
                    </svg>
                )}

                {hover !== null && width > 0 && (
                    <div
                        dir={i18n.language === "ar" ? "rtl" : "ltr"}
                        className="pointer-events-none absolute top-2 z-10 min-w-[150px] rounded-xl border border-[#0000000F] bg-white px-3 py-2 text-[12px] shadow-[0_8px_24px_rgba(35,74,100,0.15)]"
                        style={
                            geo.x(hover) > width / 2
                                ? { right: width - geo.x(hover) + 12 }
                                : { left: geo.x(hover) + 12 }
                        }
                    >
                        <p className="mb-1 font-bold text-[#414141]">{months[hover]} {YEAR}</p>
                        {SERIES.map((s) => (
                            <p key={s.key} className="flex items-center justify-between gap-4 text-[#575757]">
                                <span className="flex items-center gap-1.5">
                                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
                                    {t(`reportsPage.chart.${s.key}`)}
                                </span>
                                <span className="font-semibold text-[#414141] tabular-nums">{fmt(monthValue(s.key, hover))}</span>
                            </p>
                        ))}
                    </div>
                )}
            </div>

            {/* نفس البيانات كجدول — لقارئات الشاشة ولمن يفضّل الأرقام */}
            <button
                type="button"
                onClick={() => setShowTable((v) => !v)}
                aria-expanded={showTable}
                className="mt-3 cursor-pointer text-[12px] font-medium text-[#4B9AD2] underline-offset-4 hover:underline"
            >
                {showTable ? t("reportsPage.chart.hideTable") : t("reportsPage.chart.showTable")}
            </button>
            {showTable && (
                <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[420px] text-[12px]">
                        <thead>
                            <tr className="border-b border-[#0000000F] text-[#4B9AD2]">
                                <th className="px-3 py-2 text-start font-semibold">{t("reportsPage.chart.month")}</th>
                                {SERIES.map((s) => (
                                    <th key={s.key} className="px-3 py-2 text-start font-semibold">
                                        {t(`reportsPage.chart.${s.key}`)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {months.map((m, i) => (
                                <tr key={m} className="border-b border-[#0000000A] last:border-0">
                                    <td className="px-3 py-2 text-[#414141]">{m}</td>
                                    {SERIES.map((s) => (
                                        <td key={s.key} className="px-3 py-2 text-[#575757] tabular-nums">
                                            {fmt(monthValue(s.key, i))}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

export default function InstitutionReports() {
    const { t } = useTranslation("institutionDashboard");

    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {STATS.map(({ key, icon: Icon, tone, value, total, count }) => (
                    <div key={key} className={`${card} p-4`}>
                        <div className="flex items-start justify-between gap-2">
                            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
                                <Icon size={18} strokeWidth={2} />
                            </span>
                            <span className="rounded-full bg-[#EEF0F2] px-2.5 py-0.5 text-[10px] text-[#6B7280]">
                                {t(`reportsPage.stats.${key}.chip`, { total, count })}
                            </span>
                        </div>
                        <p className="mt-3 text-[12px] text-[#575757]">{t(`reportsPage.stats.${key}.title`)}</p>
                        <p className="mt-1 text-[14px] font-bold text-[#414141] tabular-nums">
                            {t(`reportsPage.stats.${key}.value`, { value: value.toLocaleString("en-US") })}
                        </p>
                    </div>
                ))}
            </section>

            <SpendingChart />
        </div>
    );
}
