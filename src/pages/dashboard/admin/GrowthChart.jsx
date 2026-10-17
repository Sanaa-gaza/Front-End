import React from "react";
import { useTranslation } from "react-i18next";

// أبعاد الرسم (بالوحدات الداخلية للـ SVG — العرض الفعلي بيتمدد حسب البطاقة)
const W = 800;
const H = 250;
const GRID_START = 52;
const GRID_END = 790;
const Y_TOP = 30; // مكان خط الـ 30
const Y_ZERO = 170; // مكان خط الـ 0
const Y_TICKS = [0, 10, 20, 30];
// الأشهر موزعة بالتساوي من اليسار (يناير) لليمين (ديسمبر) زي التصميم
const MONTH_START = 72;
const MONTH_STEP = 64.5;
const MONTH_Y = 232;

const x = (m) => MONTH_START + m * MONTH_STEP;
const y = (v) => Y_ZERO - (v / 30) * (Y_ZERO - Y_TOP);
const tickLabel = (v) => String(v).padStart(2, "0");

/**
 * رسم خطي لنمو المستخدمين بنفس شكل التصميم: خطوط ملونة بتوهّج خفيف ونقاط.
 * series: [{ key, label, color, points: [[رقم الشهر (0 = يناير، ممكن كسور), القيمة], ...] }]
 */
export default function GrowthChart({ series, months }) {
    const { t } = useTranslation("adminDashboard");

    return (
        <div>
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={t("growth.title")} direction="ltr">
                <defs>
                    {/* توهّج خفيف حوالين الخطوط والنقاط */}
                    <filter id="growth-glow" x="-20%" y="-40%" width="140%" height="180%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* خطوط الشبكة + أرقام المحور العمودي */}
                {Y_TICKS.map((v) => (
                    <g key={v}>
                        <line
                            x1={GRID_START}
                            x2={v === 0 ? W : GRID_END}
                            y1={y(v)}
                            y2={y(v)}
                            stroke="#8F8F8F"
                            strokeWidth="1"
                        />
                        <text x={36} y={y(v)} textAnchor="middle" dominantBaseline="middle" fontSize="18" fill="#6B6B6B">
                            {tickLabel(v)}
                        </text>
                    </g>
                ))}

                {/* أسماء الأشهر */}
                {months.map((m, i) => (
                    <text key={m} x={x(i)} y={MONTH_Y} textAnchor="middle" fontSize="13" fill="#6B6B6B">
                        {m}
                    </text>
                ))}

                {/* الخطوط والنقاط */}
                {series.map((s) => (
                    <g key={s.key} filter="url(#growth-glow)">
                        <polyline
                            points={s.points.map(([m, v]) => `${x(m)},${y(v)}`).join(" ")}
                            fill="none"
                            stroke={s.color}
                            strokeWidth="2"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                        {s.points.map(([m, v]) => (
                            <circle key={`${m}-${v}`} cx={x(m)} cy={y(v)} r="5" fill={s.color}>
                                <title>{`${s.label}: ${v}`}</title>
                            </circle>
                        ))}
                    </g>
                ))}
            </svg>

            {/* أسماء الخطوط لقارئات الشاشة */}
            <ul className="sr-only">
                {series.map((s) => (
                    <li key={s.key}>
                        {s.label}: {s.points.map(([, v]) => v).join("، ")}
                    </li>
                ))}
            </ul>
        </div>
    );
}
