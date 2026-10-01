import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, MapPin, Phone } from "lucide-react";

const CONTACT = [
    { Icon: Phone, key: "phone", ltr: true },
    { Icon: Mail, key: "email", ltr: true },
    { Icon: MapPin, key: "location" },
];

const QUICK_LINKS = [
    { key: "aboutPlatform", to: "/about" },
    { key: "joinAsCraftsman", to: "/craftsman-signup" },
    { key: "faq", to: "#" },
    { key: "helpCenter", to: "#" },
];

const LEGAL_LINKS = [
    { key: "privacyPolicy", to: "#" },
    { key: "termsOfUse", to: "#" },
    { key: "warrantyPolicy", to: "#" },
    { key: "craftsmenAgreement", to: "#" },
];

// روابط الحسابات: حط الروابط الحقيقية هون
const SOCIALS = [
    { label: "TikTok", icon: "fa-brands fa-tiktok", href: "#" },
    { label: "Facebook", icon: "fa-brands fa-facebook-f", href: "#" },
    { label: "LinkedIn", icon: "fa-brands fa-linkedin-in", href: "#" },
    { label: "Instagram", icon: "fa-brands fa-instagram", href: "#" },
];

const linkClass = "transition-colors hover:text-[#4B9AD2]";

function LinkList({ items, t }) {
    return (
        <ul className="mt-5 space-y-3.5 text-[12px] text-[#575757]">
            {items.map((item) => (
                <li key={item.key}>
                    {item.to.startsWith("/") ? (
                        <Link to={item.to} className={linkClass}>
                            {t(`footer.${item.key}`)}
                        </Link>
                    ) : (
                        <a href={item.to} className={linkClass}>
                            {t(`footer.${item.key}`)}
                        </a>
                    )}
                </li>
            ))}
        </ul>
    );
}

export default function Footer() {
    const { t, i18n } = useTranslation("home");

    // اسم المنصة بلون مميز داخل نص الحقوق
    const brand = i18n.language === "ar" ? "صنعة" : "Sanaa";
    const [beforeBrand, afterBrand] = t("footer.copyright").split(brand);

    return (
        <footer className="bg-linear-to-r from-[#E4EFFA] via-[#F4F9FD] to-white px-5 pb-6 pt-14 text-[#22455E] sm:px-10">
            <div className="mx-auto grid max-w-[1300px] grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
                <div className="col-span-2 lg:col-span-1">
                    <h3 className="text-[15px] font-semibold">{t("footer.contactUs")}</h3>
                    <ul className="mt-5 space-y-3.5 text-[12px] text-[#575757]">
                        {CONTACT.map(({ Icon, key, ltr }) => (
                            <li key={key} className="flex items-center gap-2.5">
                                <Icon size={15} strokeWidth={1.8} className="shrink-0 text-[#4B9AD2]" />
                                <span dir={ltr ? "ltr" : undefined}>{t(`footer.${key}`)}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-[15px] font-semibold">{t("footer.quickLinks")}</h3>
                    <LinkList items={QUICK_LINKS} t={t} />
                </div>

                <div>
                    <h3 className="text-[15px] font-semibold">{t("footer.legalPolicies")}</h3>
                    <LinkList items={LEGAL_LINKS} t={t} />
                </div>

                <div className="col-span-2 lg:col-span-1">
                    <h3 className="text-[15px] font-semibold">{t("footer.followUs")}</h3>
                    <div className="mt-5 flex items-center gap-3">
                        {SOCIALS.map((s) => (
                            <a
                                key={s.label}
                                href={s.href}
                                aria-label={s.label}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#CFE3F3] text-[15px] text-[#4B9AD2] transition-colors hover:bg-[#4B9AD2] hover:text-white"
                            >
                                <i className={s.icon}></i>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mx-auto mt-12 max-w-[1300px] border-t border-[#0000001A] pt-6 text-center text-[12px] text-[#575757]">
                {afterBrand === undefined ? (
                    t("footer.copyright")
                ) : (
                    <>
                        {beforeBrand}
                        <span className="text-[#4B9AD2]">{brand}</span>
                        {afterBrand}
                    </>
                )}
            </div>
        </footer>
    );
}
