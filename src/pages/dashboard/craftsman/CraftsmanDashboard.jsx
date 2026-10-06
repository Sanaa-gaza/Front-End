import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Briefcase, ClipboardList, House, Search, UserRound, Wallet } from "lucide-react";
import RequireRole from "../../../components/dashboard/RequireRole";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import ComingSoon from "../../../components/dashboard/ComingSoon";
import { getProfile } from "../../../api/endpoints";
import CraftsmanHome from "./CraftsmanHome";

const BASE = "/dashboard/craftsman";

/**
 * لوحة تحكم الحرفي — كل صفحاتها جوا نفس الهيكل (قائمة جانبية + شريط علوي).
 * الصفحات اللي لسا ما إلها تصميم بتعرض "قيد الإنشاء".
 */
export default function CraftsmanDashboard() {
    const { t } = useTranslation("craftsmanDashboard");
    // بيانات الحرفي من GET /profile (الحرفة، التقييم، التوفر، الصورة...)
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        let active = true;
        getProfile()
            .then((res) => active && setProfile(res.data))
            .catch(() => {});
        return () => {
            active = false;
        };
    }, []);

    const navItems = [
        { key: "home", icon: House, to: BASE, end: true },
        { key: "search", icon: Search, to: `${BASE}/search` },
        { key: "requests", icon: Briefcase, to: `${BASE}/requests` },
        { key: "current", icon: ClipboardList, to: `${BASE}/current` },
        { key: "wallet", icon: Wallet, to: `${BASE}/wallet` },
        { key: "profile", icon: UserRound, to: `${BASE}/profile` },
    ].map((item) => ({ ...item, label: t(`nav.${item.key}`) }));

    return (
        <RequireRole role="craftsman">
            <DashboardLayout
                navItems={navItems}
                searchTo={`${BASE}/search`}
                showAdd={false}
                greeting
                avatarPath={profile?.craftsman?.personal_photo_path}
            >
                <Routes>
                    <Route index element={<CraftsmanHome profile={profile} onProfileChange={setProfile} />} />
                    <Route path="*" element={<ComingSoon homePath={BASE} />} />
                </Routes>
            </DashboardLayout>
        </RequireRole>
    );
}
