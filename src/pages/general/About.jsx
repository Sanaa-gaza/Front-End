import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

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

// ==================== عدّاد الأرقام ====================

const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

// يعد من صفر لحد القيمة المحددة أول ما العنصر يظهر بالشاشة (مرة وحدة)
function CountUp({ to, duration = 1800, decimals = 0, prefix = "", suffix = "" }) {
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

// ==================== الرؤية والرسالة ====================

// الأول بيظهر عند بداية السطر (يمين بالعربي)
const ITEMS = [
    { key: "mission", icon: "plane" },
    { key: "vision", icon: "eye" },
];

function TabIcon({ name }) {
    if (name === "eye") return <i className="fa-regular fa-eye text-[26px]"></i>;
    return (
        <svg viewBox="0 0 28 24" className="h-[26px] w-[30px]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M26 2 13.5 13" />
            <path d="M26 2 18 22l-4.5-9L4.5 8.5 26 2z" />
            <path d="M2 13h5.5" />
            <path d="M4 17.5h5" />
            <path d="M7 22h4" />
        </svg>
    );
}

function VisionMission() {
    const { t } = useTranslation("about");

    return (
        <section className="px-5 pb-20 pt-12 sm:px-10">
            <div className="mx-auto max-w-[900px] text-center">
                <p className="text-[13px] font-medium text-[#2B2B2B]">{t("vm.tag")}</p>
                <h2 className="mt-4 text-[26px] font-bold text-[#4B9AD2] sm:text-[32px]">
                    {t("vm.title")}
                </h2>
                <p className="mx-auto mt-3 max-w-[470px] text-[12px] leading-[2] text-[#575757] sm:text-[13px]">
                    {t("vm.subtitle")}
                </p>

                <div className="mt-10 grid grid-cols-1 justify-items-center gap-x-[130px] gap-y-10 md:grid-cols-2">
                    {ITEMS.map((item) => (
                        <div key={item.key} className="flex w-full max-w-[370px] flex-col items-center">
                            <div className="flex h-[98px] w-[168px] items-center justify-center gap-3 rounded-3xl bg-[#F6FAFD] text-[19px] font-bold text-[#3A7FB0] shadow-[0_6px_12px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:bg-[#EAF3FB] hover:shadow-[0_12px_24px_rgba(75,154,210,0.3)]">
                                <TabIcon name={item.icon} />
                                {t(`vm.${item.key}.tab`)}
                            </div>

                            <article className="mt-9 w-full flex-1 rounded-3xl bg-[#FDFBFC] px-7 py-8 text-start shadow-[0_4px_6px_rgba(0,0,0,0.22)] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_16px_32px_rgba(75,154,210,0.28)]">
                                <h3 className="text-[18px] font-bold text-[#414141]">
                                    {t(`vm.${item.key}.title`)}
                                </h3>
                                <p className="mt-4 ps-10 text-[15px] leading-[2.3] text-[#575757]">
                                    {t(`vm.${item.key}.desc`)}
                                </p>
                            </article>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ==================== قيمنا ====================

const SHIELD = "M12 2 4 5v6c0 5 3.4 9.2 8 11 4.6-1.8 8-6 8-11V5l-8-3z";

const ICONS = {
    shield: (
        <>
            <path d={SHIELD} />
            <path d="m9 12 2 2 4-4" />
        </>
    ),
    users: (
        <>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
    ),
    lock: (
        <>
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </>
    ),
};

// الأول بيظهر عند بداية السطر (يمين بالعربي)
const VALUES = [
    { key: "quality", icon: "shield", color: "#22B45A", bg: "#E6F7EC" },
    { key: "community", icon: "users", color: "#4B9AD2", bg: "#E6F1FA" },
    { key: "transparency", icon: "lock", color: "#C851E0", bg: "#F9E9FC" },
    { key: "heritage", icon: "shield", color: "#F0B400", bg: "#FFF5D0" },
];

function ValuesSection() {
    const { t } = useTranslation("about");

    return (
        <section className="px-5 pb-24 pt-4 sm:px-10">
            <div className="mx-auto max-w-[1230px] text-center">
                <h2 className="text-[24px] font-bold text-[#4B9AD2] sm:text-[30px]">
                    {t("values.title")}
                </h2>
                <p className="mx-auto mt-4 max-w-[560px] text-[13px] leading-[2] text-[#2B2B2B] sm:text-[14px]">
                    {t("values.subtitle")}
                </p>

                <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {VALUES.map((v) => (
                        <article
                            key={v.key}
                            className="group rounded-2xl bg-white px-5 pb-8 pt-6 shadow-[0_4px_10px_rgba(0,0,0,0.14)] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_16px_32px_rgba(75,154,210,0.28)]"
                        >
                            <span
                                className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                                style={{ backgroundColor: v.bg, color: v.color }}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-[22px] w-[22px]"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    {ICONS[v.icon]}
                                </svg>
                            </span>
                            <h3 className="mt-4 text-[15px] font-bold text-[#414141]">
                                {t(`values.${v.key}.title`)}
                            </h3>
                            <p className="mt-4 text-start text-[12.5px] leading-[2.1] text-[#575757]">
                                {t(`values.${v.key}.desc`)}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ==================== انضم إلينا ====================

function JoinCta() {
    const navigate = useNavigate();
    const { t } = useTranslation("about");

    return (
        <section className="px-5 pb-8 pt-2 sm:px-10">
            <div className="mx-auto flex max-w-[1230px] flex-col items-start gap-6 rounded-3xl bg-white px-6 py-8 shadow-[0_4px_12px_rgba(0,0,0,0.16)] sm:px-10 md:flex-row md:items-center md:justify-between md:gap-8">
                <div className="flex items-center gap-4 sm:gap-5">
                    <img
                        src="/images/شراكة موثوقة.svg"
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                    <div className="max-w-[720px]">
                        <h2 className="text-[19px] font-bold text-[#1F1F1F] sm:text-[22px]">
                            {t("join.title")}
                        </h2>
                        <p className="mt-2 text-[12px] leading-[1.9] text-[#575757] sm:text-[13px]">
                            {t("join.desc")}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/get-started")}
                    className="h-11 shrink-0 rounded-lg bg-[#4B9AD2] px-7 text-[14px] font-semibold text-white cursor-pointer btn-wipe"
                >
                    {t("join.button")}
                </button>
            </div>
        </section>
    );
}

// ==================== الدعوة الأخيرة ====================

function FinalCta() {
    const navigate = useNavigate();
    const { t } = useTranslation("about");

    return (
        <section className="bg-linear-to-br from-white via-white to-[#E4EFFD] px-5 py-20 sm:px-10 sm:py-24">
            <div className="mx-auto max-w-[760px] text-center">
                <p className="text-[12px] font-medium text-[#4B9AD2]">{t("final.tag")}</p>
                <h2 className="mt-5 text-[24px] font-bold leading-[1.5] text-[#38749E] sm:text-[32px]">
                    {t("final.title")}
                </h2>
                <p className="mx-auto mt-5 max-w-[560px] text-[13px] leading-[2] text-[#4B9AD2] sm:text-[14px]">
                    {t("final.desc")}
                </p>

                <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => navigate("/craftsmen")}
                        className="h-12 rounded-xl bg-[#4B9AD2] px-7 text-[13px] font-semibold text-white shadow-[0_4px_8px_rgba(0,0,0,0.18)] cursor-pointer btn-wipe"
                    >
                        {t("final.browse")}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/contact")}
                        className="h-12 rounded-xl bg-[#3A78A3] px-7 text-[13px] font-semibold text-white shadow-[0_4px_8px_rgba(0,0,0,0.18)] cursor-pointer btn-wipe btn-wipe-alt"
                    >
                        {t("final.contact")}
                    </button>
                </div>
            </div>
        </section>
    );
}

// ==================== الصفحة ====================

// الصورة فيها الكرت والظل جاهزين (478×562)، والكرت نفسه بأخذ 335×419 من وسطها
const ABOUT_IMAGE = "/images/2.svg";

const STATS = [
    { key: "users", to: 5000, prefix: "+" },
    { key: "craftsmen", to: 180, prefix: "+" },
    { key: "orders", to: 1200, prefix: "+" },
    { key: "rating", to: 4.8, decimals: 1, star: true },
];

export default function About() {
    const { t } = useTranslation("about");

    return (
        <SiteLayout>
            <div className="mx-auto max-w-[1320px] px-5 pb-16 pt-28 sm:px-10 sm:pt-32 lg:px-[6%]">
                <nav aria-label="breadcrumb" className="flex items-center gap-2 text-[11px]">
                    <Link to="/" className="font-medium text-[#141415] hover:text-[#4B9AD2]">
                        {t("breadcrumb.home")}
                    </Link>
                    <i className="fa-solid fa-chevron-left text-[8px] text-[#89949D] ltr:rotate-180"></i>
                    <span className="text-[#4B9AD2]">{t("breadcrumb.about")}</span>
                </nav>

                <section className="mt-6 flex flex-col items-center gap-10 lg:mt-4 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
                    <div className="w-full max-w-[560px] lg:pt-16">
                        <h1 className="text-[30px] font-bold leading-[1.4] text-[#38749E] sm:text-[40px]">
                            {t("hero.title")}
                        </h1>
                        <p className="mt-5 text-[14px] leading-[2.1] text-[#575757] sm:text-[16px]">
                            {t("hero.desc")}
                        </p>
                        <p className="mt-4 inline-flex items-center gap-2 text-[11px] font-medium text-[#141415]">
                            <i className="fa-solid fa-shield-halved text-[13px] text-[#4B9AD2]"></i>
                            {t("hero.badge")}
                        </p>
                    </div>

                    <div className="relative aspect-[478/562] w-full max-w-[478px] shrink-0 lg:-me-[71px] lg:-my-10">
                        <img
                            src={ABOUT_IMAGE}
                            alt=""
                            className="h-full w-full select-none"
                            draggable="false"
                        />
                        <div className="absolute inset-x-[20%] bottom-[15.5%] flex items-center gap-3 rounded-2xl border border-white/20 bg-neutral-600/45 p-3 backdrop-blur-md">
                            <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-[#CFE2F2] text-[#4B9AD2]">
                                <i className="fa-solid fa-award text-[18px]"></i>
                            </span>
                            <div>
                                <p className="text-[15px] font-bold text-white">
                                    {t("hero.standardsTitle")}
                                </p>
                                <p className="mt-1 text-[12px] leading-[1.7] text-white">
                                    {t("hero.standardsDesc")}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative -mt-6 grid grid-cols-2 lg:-mt-1 gap-y-8 rounded-3xl bg-white px-6 py-9 shadow-[0_10px_40px_rgba(43,91,120,0.16)] sm:grid-cols-4 sm:px-10">
                    {STATS.map((s) => (
                        <div key={s.key} className="text-center">
                            <p className="text-[26px] font-bold text-[#38749E] sm:text-[30px]" dir="ltr">
                                <CountUp to={s.to} prefix={s.prefix} decimals={s.decimals} />
                                {s.star && <i className="fa-solid fa-star ms-1 text-[22px]"></i>}
                            </p>
                            <p className="mt-2 text-[12px] font-medium text-[#4B9AD2]">
                                {t(`stats.${s.key}`)}
                            </p>
                        </div>
                    ))}
                </section>
            </div>
            <VisionMission />
            <ValuesSection />
            <JoinCta />
            <FinalCta />
        </SiteLayout>
    );
}
