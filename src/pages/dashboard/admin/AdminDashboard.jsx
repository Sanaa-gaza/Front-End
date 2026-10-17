import React from "react";
import { Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell, CircleHelp, ClipboardList, House, MessageSquare, Settings, ShieldCheck, Users } from "lucide-react";
import RequireRole from "../../../components/dashboard/RequireRole";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import ComingSoon from "../../../components/dashboard/ComingSoon";
import AdminHome from "./AdminHome";
import AdminUsers from "./AdminUsers";
import AdminUserDetails from "./AdminUserDetails";
import AdminRequests from "./AdminRequests";
import AdminRequestDetails from "./AdminRequestDetails";
import AdminVerification from "./AdminVerification";
import AdminVerificationReview from "./AdminVerificationReview";
import AdminSupport from "./AdminSupport";
import AdminChats from "./AdminChats";
import AdminNotifications from "./AdminNotifications";
import AdminSettings from "./AdminSettings";

const BASE = "/dashboard/admin";
const LOGIN = "/admin-login";

/**
 * لوحة تحكم الأدمن — كل صفحاتها جوا نفس الهيكل (قائمة جانبية + شريط علوي).
 * الصفحات اللي لسا ما انبنت بتعرض "قيد الإنشاء".
 */
export default function AdminDashboard() {
    const { t } = useTranslation("adminDashboard");

    const navItems = [
        { key: "home", icon: House, to: BASE, end: true },
        { key: "users", icon: Users, to: `${BASE}/users` },
        { key: "requests", icon: ClipboardList, to: `${BASE}/requests` },
        { key: "verification", icon: ShieldCheck, to: `${BASE}/verification` },
        { key: "support", icon: CircleHelp, to: `${BASE}/support` },
        { key: "chats", icon: MessageSquare, to: `${BASE}/chats` },
        { key: "notifications", icon: Bell, to: `${BASE}/notifications` },
        { key: "settings", icon: Settings, to: `${BASE}/settings` },
    ].map((item) => ({ ...item, label: t(`nav.${item.key}`) }));

    return (
        <RequireRole role="admin" loginPath={LOGIN}>
            <DashboardLayout
                navItems={navItems}
                greeting
                showAdd={false}
                searchPlaceholder={t("search")}
                loginPath={LOGIN}
            >
                <Routes>
                    <Route index element={<AdminHome />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="users/:userId" element={<AdminUserDetails />} />
                    <Route path="requests" element={<AdminRequests />} />
                    <Route path="requests/:requestId" element={<AdminRequestDetails />} />
                    <Route path="verification" element={<AdminVerification />} />
                    <Route path="verification/:verificationId" element={<AdminVerificationReview />} />
                    <Route path="support" element={<AdminSupport />} />
                    <Route path="chats" element={<AdminChats />} />
                    <Route path="notifications" element={<AdminNotifications />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="*" element={<ComingSoon homePath={BASE} />} />
                </Routes>
            </DashboardLayout>
        </RequireRole>
    );
}
