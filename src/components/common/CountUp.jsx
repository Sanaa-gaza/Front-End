import React, { useEffect, useRef, useState } from "react";

const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

// يعد من صفر لحد القيمة المحددة أول ما العنصر يظهر بالشاشة (مرة وحدة)
export default function CountUp({ to, duration = 1800, decimals = 0, prefix = "", suffix = "" }) {
    const ref = useRef(null);
    const [value, setValue] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduceMotion || !("IntersectionObserver" in window)) {
            setValue(to);
            return;
        }

        let frame;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                observer.disconnect();
                const start = performance.now();
                const tick = (now) => {
                    const progress = Math.min((now - start) / duration, 1);
                    setValue(to * easeOutCubic(progress));
                    if (progress < 1) frame = requestAnimationFrame(tick);
                };
                frame = requestAnimationFrame(tick);
            },
            { threshold: 0.4 },
        );
        observer.observe(el);

        return () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
        };
    }, [to, duration]);

    const text = value.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    return (
        <span ref={ref}>
            {prefix}
            {text}
            {suffix}
        </span>
    );
}
