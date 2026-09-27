import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CONTACT = [
    { icon: "fa-solid fa-phone", key: "phone", ltr: true },
    { icon: "fa-regular fa-envelope", key: "email", ltr: true },
    { icon: "fa-solid fa-location-dot", key: "location" },
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
    { label: "LinkedIn", icon: "fa-brands fa-linkedin-in", href: "#" },
    { label: "Instagram", icon: "fa-brands fa-instagram", href: "#" },
    { label: "Facebook", icon: "fa-brands fa-facebook-f", href: "#" },
];

function LinkList({ items, t }) {
    return (
        <ul className="mt-5 space-y-3.5 text-[12px] text-white/80">
            {items.map((item) => (
                <li key={item.key}>
                    {item.to.startsWith("/") ? (
                        <Link to={item.to} className="transition-colors hover:text-white">
                            {t(`footer.${item.key}`)}
                        </Link>
                    ) : (
                        <a href={item.to} className="transition-colors hover:text-white">
                            {t(`footer.${item.key}`)}
                        </a>
                    )}
                </li>
            ))}
        </ul>
    );
}

export default function Footer() {
    const { t } = useTranslation("home");

    return (
        <footer className="bg-[#4B9AD2] px-5 pb-6 pt-14 text-white sm:px-10">
            <div className="mx-auto grid max-w-[1300px] grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
                <div className="col-span-2 lg:col-span-1">
                    <h3 className="text-[15px] font-semibold">{t("footer.contactUs")}</h3>
                    <ul className="mt-5 space-y-3.5 text-[12px] text-white/85">
                        {CONTACT.map((c) => (
                            <li key={c.key} className="flex items-center gap-2.5">
                                <i className={`${c.icon} w-4 text-center text-[13px] text-white`}></i>
                                <span dir={c.ltr ? "ltr" : undefined}>{t(`footer.${c.key}`)}</span>
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
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3F82B6] text-[14px] text-white transition-colors hover:bg-[#2F6F9F]"
                            >
                                <i className={s.icon}></i>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mx-auto mt-12 max-w-[1300px] border-t border-white/40 pt-6 text-center text-[12px] text-white">
                {t("footer.copyright")}
            </div>
        </footer>
    );
}
