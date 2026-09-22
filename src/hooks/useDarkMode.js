import { useEffect, useState } from "react";

const STORAGE_KEY = "sanaa_theme";

function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * يبدأ بالثيم المحفوظ يدويًا إن وُجد، وإلا بثيم النظام. لو المستخدم غيّر
 * ثيم جهازه من غير ما يختار يدويًا، بيتابع التغيير تلقائيًا. أول ما يضغط
 * زر التبديل، بيتحفظ اختياره ويفضل عليه لحد ما يمسح بيانات الموقع.
 */
export default function useDarkMode() {
    const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEY) || getSystemTheme());

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = () => {
            if (!localStorage.getItem(STORAGE_KEY)) setTheme(getSystemTheme());
        };
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => {
            const next = prev === "dark" ? "light" : "dark";
            localStorage.setItem(STORAGE_KEY, next);
            return next;
        });
    };

    return { theme, toggleTheme };
}
