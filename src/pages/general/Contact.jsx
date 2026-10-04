import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

// ==================== بيانات التواصل ====================

// الإيميل اللي بتوصله رسائل صفحة "تواصل معنا" — غيّريه للإيميل الحقيقي
const SUPPORT_EMAIL = "support@example.com";

const CONTACT_TOPICS = ["general", "technical", "payment", "join", "complaint", "other"];

// ==================== اتجاه الصفحة حسب اللغة ====================

function useLangDir() {
    const { i18n } = useTranslation();
    useEffect(() => {
        document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);
    return i18n;
}

// ==================== ظهور الأقسام أثناء التمرير ====================

const STAGGER_MS = 110;
const DURATION_MS = 900;
const SPLASH_END_MS = 2100;

const isDecor = (el) =>
    el.tagName === "svg" || el.classList.contains("absolute") || el.hasAttribute("aria-hidden");

const contentChildren = (el) => Array.from(el.children).filter((c) => !isDecor(c));

// بيجمع عناصر القسم اللي رح تظهر بالتتابع (العناوين، الكروت، الصور...)
function collectBlocks(root) {
    if (root.className && String(root.className).includes("shadow-[")) return [[root]];

    let container = root;
    let kids = contentChildren(container);
    while (kids.length === 1 && kids[0].tagName === "DIV") {
        if (String(kids[0].className).includes("shadow-[")) return [[kids[0]]];
        container = kids[0];
        kids = contentChildren(container);
    }

    const groups = [];
    const loose = [];
    kids.forEach((kid) => {
        if (kid.classList.contains("grid") && kid.children.length > 1) {
            groups.push(contentChildren(kid));
        } else {
            loose.push(kid);
        }
    });
    return [loose, ...groups].filter((g) => g.length);
}

function useScrollReveal(rootRef) {
    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return undefined;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
        if (!("IntersectionObserver" in window)) return undefined;

        const targets = root.querySelectorAll("main section, footer");
        const items = [];
        targets.forEach((section) => {
            collectBlocks(section).forEach((group) => {
                group.forEach((el, i) => items.push({ el, delay: i * STAGGER_MS }));
            });
        });

        const timers = [];
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const item = items.find((it) => it.el === entry.target);
                    observer.unobserve(entry.target);
                    const boot = Math.max(0, SPLASH_END_MS - performance.now());
                    const delay = item.delay + boot;
                    entry.target.style.setProperty("--rv-delay", `${delay}ms`);
                    requestAnimationFrame(() => entry.target.classList.add("rv-in"));
                    // بعد ما تخلص الحركة بنرجع العنصر لحالته الطبيعية عشان الهوفر يشتغل
                    timers.push(
                        setTimeout(() => {
                            entry.target.classList.remove("rv", "rv-in");
                            entry.target.style.removeProperty("--rv-delay");
                        }, delay + DURATION_MS + 100),
                    );
                });
            },
            { threshold: 0, rootMargin: "0px 0px 12% 0px" },
        );

        items.forEach(({ el }) => {
            el.classList.add("rv");
            observer.observe(el);
        });

        return () => {
            observer.disconnect();
            timers.forEach(clearTimeout);
            items.forEach(({ el }) => {
                el.classList.remove("rv", "rv-in");
                el.style.removeProperty("--rv-delay");
            });
        };
    }, [rootRef]);
}

// ==================== زر المساعد ====================

function AssistantButton() {
    const { t } = useTranslation("home");

    return (
        <div className="fixed bottom-5 right-4 z-50 sm:bottom-6 sm:right-8">
            <button
                type="button"
                aria-label={t("assistant.label")}
                className="group relative block h-[76px] w-[76px] cursor-pointer sm:h-[88px] sm:w-[88px]"
            >
                <span className="absolute inset-0 rounded-full bg-white assistant-pulse transition-transform group-hover:scale-105"></span>
                <img
                    src="/images/تنزيل (3)-Photoroom 1.svg"
                    alt=""
                    className="absolute bottom-[8px] left-1/2 h-[62px] w-auto -translate-x-1/2 object-contain transition-transform group-hover:scale-105 sm:h-[74px]"
                />

                <span className="absolute right-[58px] top-1 z-10 whitespace-nowrap rounded-2xl bg-[#4B9AD2] px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-[0_6px_18px_rgba(75,154,210,0.3)] sm:right-[68px] sm:top-2 sm:text-[12px]">
                    {t("assistant.label")}
                    <span className="absolute -bottom-[5px] right-3 h-0 w-0 border-l-[6px] border-r-[2px] border-t-[7px] border-l-transparent border-r-transparent border-t-[#4B9AD2]"></span>
                </span>
            </button>
        </div>
    );
}

// ==================== هيكل الصفحة (هيدر + محتوى + فوتر) ====================

function SiteLayout({ children }) {
    useLangDir();
    const rootRef = useRef(null);
    useScrollReveal(rootRef);

    return (
        <div ref={rootRef} className="relative min-h-dvh overflow-x-hidden bg-white">
            <Header />
            <main>{children}</main>
            <Footer />
            <AssistantButton />
        </div>
    );
}

// ==================== الصفحة ====================

const inputBase =
    "h-11 w-full rounded-lg border bg-white text-[13px] text-[#141415] outline-none transition-colors placeholder:text-[#89949D] focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";

export default function Contact() {
    const { t } = useTranslation("contact");
    const [form, setForm] = useState({ name: "", city: "", topic: "", message: "" });
    const [errors, setErrors] = useState({});

    const update = (field) => (e) => {
        setForm((f) => ({ ...f, [field]: e.target.value }));
        if (errors[field]) setErrors((er) => ({ ...er, [field]: "" }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const next = {
            name: form.name.trim() ? "" : "name",
            city: form.city.trim() ? "" : "city",
            topic: form.topic ? "" : "topic",
            message: form.message.trim() ? "" : "message",
        };
        setErrors(next);
        if (Object.values(next).some(Boolean)) return;

        const topic = t(`topics.${form.topic}`);
        const body = [
            t("mail.greeting"),
            "",
            `${t("mail.name")}: ${form.name.trim()}`,
            `${t("mail.city")}: ${form.city.trim()}`,
            `${t("mail.topic")}: ${topic}`,
            "",
            `${t("mail.message")}:`,
            form.message.trim(),
        ].join("\n");

        // بيفتح نافذة كتابة رسالة جديدة بـ Gmail وكل الحقول معبّاة
        const params = Object.entries({
            view: "cm",
            fs: "1",
            to: SUPPORT_EMAIL,
            su: t("mail.subject", { topic }),
            body,
        })
            .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
            .join("&");
        window.open(`https://mail.google.com/mail/?${params}`, "_blank", "noopener,noreferrer");
    };

    const borderFor = (field) => (errors[field] ? "border-red-400" : "border-[#4B9AD2]");
    const errorText = (field) =>
        errors[field] ? (
            <p className="mt-1 text-[11px] text-red-500">{t(`form.errors.${field}`)}</p>
        ) : null;

    return (
        <SiteLayout>
            <section className="mx-auto max-w-[1230px] px-5 pb-24 pt-28 sm:px-10 sm:pt-32">
                <nav aria-label="breadcrumb" className="flex items-center gap-2 text-[11px]">
                    <Link to="/" className="font-medium text-[#141415] hover:text-[#4B9AD2]">
                        {t("breadcrumb.home")}
                    </Link>
                    <i className="fa-solid fa-chevron-left text-[8px] text-[#89949D] ltr:rotate-180"></i>
                    <span className="text-[#4B9AD2]">{t("breadcrumb.contact")}</span>
                </nav>

                <div className="relative mt-8 overflow-hidden rounded-3xl border border-[#DCE6EE] bg-[#F8FAFC] px-6 py-10 shadow-[0_6px_18px_rgba(43,91,120,0.1)] sm:px-10 sm:py-12 lg:px-14">
                    <img
                        src="/images/contact-bg.jpg"
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.14] grayscale"
                    />

                    <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
                        <div>
                            <h1 className="max-w-[400px] text-[28px] font-bold leading-[1.7] text-[#2B2B2B] sm:text-[38px]">
                                <span className="text-[#4B9AD2]">{t("titleHighlight")}</span>{" "}
                                {t("titleRest")}
                            </h1>
                            <p className="mt-5 max-w-[440px] text-[14px] leading-[2] text-[#575757]">
                                {t("desc")}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} noValidate className="w-full">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="c-name" className="mb-1.5 block text-[11px] font-bold text-[#2B2B2B]">
                                        {t("form.name")}
                                    </label>
                                    <div className="relative">
                                        <i className="fa-regular fa-user pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[13px] text-[#4B9AD2]"></i>
                                        <input
                                            id="c-name"
                                            value={form.name}
                                            onChange={update("name")}
                                            className={`${inputBase} ${borderFor("name")} pe-9 ps-3`}
                                        />
                                    </div>
                                    {errorText("name")}
                                </div>
                                <div>
                                    <label htmlFor="c-city" className="mb-1.5 block text-[11px] font-bold text-[#2B2B2B]">
                                        {t("form.city")}
                                    </label>
                                    <div className="relative">
                                        <i className="fa-solid fa-location-dot pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[13px] text-[#4B9AD2]"></i>
                                        <input
                                            id="c-city"
                                            value={form.city}
                                            onChange={update("city")}
                                            className={`${inputBase} ${borderFor("city")} pe-9 ps-3`}
                                        />
                                    </div>
                                    {errorText("city")}
                                </div>
                            </div>

                            <div className="mt-4">
                                <label htmlFor="c-topic" className="mb-1.5 block text-[11px] font-bold text-[#2B2B2B]">
                                    {t("form.topic")}
                                </label>
                                <div className="relative">
                                    <select
                                        id="c-topic"
                                        value={form.topic}
                                        onChange={update("topic")}
                                        className={`${inputBase} ${borderFor("topic")} cursor-pointer appearance-none ps-9 pe-3 ${
                                            form.topic ? "" : "text-[#89949D]"
                                        }`}
                                    >
                                        <option value="" disabled hidden>
                                            {t("form.topicPlaceholder")}
                                        </option>
                                        {CONTACT_TOPICS.map((k) => (
                                            <option key={k} value={k} className="text-[#141415]">
                                                {t(`topics.${k}`)}
                                            </option>
                                        ))}
                                    </select>
                                    <i className="fa-solid fa-chevron-down pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[10px] text-[#4B9AD2]"></i>
                                </div>
                                {errorText("topic")}
                            </div>

                            <div className="mt-4">
                                <label htmlFor="c-message" className="mb-1.5 block text-[11px] font-bold text-[#2B2B2B]">
                                    {t("form.message")}
                                </label>
                                <textarea
                                    id="c-message"
                                    rows={5}
                                    value={form.message}
                                    onChange={update("message")}
                                    className={`w-full resize-none rounded-lg border bg-white p-3 text-[13px] text-[#141415] outline-none transition-colors focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2] ${borderFor("message")}`}
                                />
                                {errorText("message")}
                            </div>

                            <button
                                type="submit"
                                className="btn-wipe mt-5 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#4B9AD2] text-[14px] font-semibold text-white"
                            >
                                <i className="fa-regular fa-envelope text-[17px]"></i>
                                {t("form.send")}
                            </button>

                            <p className="mt-3 flex items-start gap-1.5 text-[10.5px] leading-[1.7] text-[#7A828A]">
                                <i className="fa-solid fa-triangle-exclamation mt-0.5 text-[10px]"></i>
                                {t("form.note")}
                            </p>
                        </form>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
