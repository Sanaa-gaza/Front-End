import React from "react";
import { Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Briefcase, CircleDollarSign, ClipboardList, FileText, House, SquareActivity, UserRound, Users } from "lucide-react";
import RequireRole from "../../../components/dashboard/RequireRole";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import ComingSoon from "../../../components/dashboard/ComingSoon";
import InstitutionHome from "./InstitutionHome";
import InstitutionTenders from "./InstitutionTenders";
import InstitutionProjects from "./InstitutionProjects";
import InstitutionSettings from "./InstitutionSettings";
import InstitutionProviders from "./InstitutionProviders";
import InstitutionOffers from "./InstitutionOffers";
import InstitutionMessages from "./InstitutionMessages";

const BASE = "/dashboard/institution";

/**
 * لوحة تحكم المؤسسة — كل صفحاتها بتنعرض جوا نفس الهيكل (قائمة جانبية + شريط علوي).
 * الصفحات اللي لسا ما انبنت بتعرض "قيد الإنشاء".
 */
export default function InstitutionDashboard() {
    const { t } = useTranslation("institutionDashboard");

    const navItems = [
        { key: "home", icon: House, to: BASE, end: true },
        { key: "tenders", icon: SquareActivity, to: `${BASE}/tenders` },
        { key: "offers", icon: Briefcase, to: `${BASE}/offers` },
        { key: "projects", icon: ClipboardList, to: `${BASE}/projects` },
        { key: "messages", icon: FileText, to: `${BASE}/messages` },
        { key: "providers", icon: Users, to: `${BASE}/providers` },
        // صفحة التقارير المالية لسا مش جاهزة — رابطها بيعرض "قيد الإنشاء"
        { key: "reports", icon: CircleDollarSign, to: `${BASE}/reports` },
        { key: "settings", icon: UserRound, to: `${BASE}/settings` },
    ].map((item) => ({ ...item, label: t(`nav.${item.key}`) }));

    return (
        <RequireRole role="institution">
            <DashboardLayout navItems={navItems}>
                <Routes>
                    <Route index element={<InstitutionHome />} />
                    <Route path="tenders" element={<InstitutionTenders />} />
                    <Route path="offers" element={<InstitutionOffers />} />
                    <Route path="projects" element={<InstitutionProjects />} />
                    <Route path="messages" element={<InstitutionMessages />} />
                    <Route path="providers" element={<InstitutionProviders />} />
                    <Route path="settings" element={<InstitutionSettings />} />
                    <Route path="*" element={<ComingSoon homePath={BASE} />} />
                </Routes>
            </DashboardLayout>
        </RequireRole>
    );
}
