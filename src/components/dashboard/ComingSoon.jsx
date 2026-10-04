import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Construction } from "lucide-react";

/** صفحة مؤقتة لأي قسم بلوحة التحكم لسا ما انبنى */
export default function ComingSoon({ homePath }) {
    const { t } = useTranslation("dashboard");

    return (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-20 text-center shadow-[0_4px_24px_rgba(35,74,100,0.06)]">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF3FB] text-[#4B9AD2]">
                <Construction size={28} />
            </div>
            <h1 className="mb-2 text-xl font-bold text-[#22455E]">{t("comingSoonTitle")}</h1>
            <p className="mb-8 max-w-md text-sm text-[#89949D]">{t("comingSoonDesc")}</p>
            <Link
                to={homePath}
                className="rounded-lg bg-[#4B9AD2] px-6 py-2.5 text-sm font-medium text-white btn-wipe"
            >
                {t("backHome")}
            </Link>
        </div>
    );
}
