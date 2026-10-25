import React, { useState } from "react";
import { Route, Routes, matchPath, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Briefcase, ChevronLeft, CircleDollarSign, House, UserRound, Wallet } from "lucide-react";
import { ClipboardLines, SquareTrendingUp } from "../../../components/dashboard/navIcons";
import RequireRole from "../../../components/dashboard/RequireRole";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import ComingSoon from "../../../components/dashboard/ComingSoon";
import InstitutionHome from "./InstitutionHome";
import InstitutionTenders from "./InstitutionTenders";
import InstitutionTenderDetails from "./InstitutionTenderDetails";
import InstitutionCreateTender from "./InstitutionCreateTender";
import InstitutionProjects from "./InstitutionProjects";
import InstitutionProjectDetails from "./InstitutionProjectDetails";
import InstitutionSettings from "./InstitutionSettings";
import InstitutionProviders from "./InstitutionProviders";
import InstitutionProviderProfile from "./InstitutionProviderProfile";
import InstitutionOffers from "./InstitutionOffers";
import InstitutionOfferDetails from "./InstitutionOfferDetails";
import InstitutionMessages from "./InstitutionMessages";
import { ChatBox } from "../../general/Chats";

const BASE = "/dashboard/institution";

// ===== إشعارات تجريبية =====
// ما في endpoint للإشعارات بالسيرفر لسا؛ لما ينضاف، استبدلي NOTIFICATIONS بالبيانات الحقيقية.
// category: التبويب اللي بيظهر فيه، to: الصفحة اللي بيفتحها الإشعار
const NOTIFICATIONS = [
    { id: "n1", type: "tender", category: "tenders", to: `${BASE}/tenders` },
    { id: "n2", type: "accepted", category: "requests", to: `${BASE}/offers` },
    { id: "n3", type: "message", category: "requests", to: `${BASE}/messages` },
    { id: "n4", type: "update", category: "tenders", to: `${BASE}/tenders`, read: true },
    { id: "n5", type: "closed", category: "tenders", to: `${BASE}/tenders`, read: true },
    { id: "n6", type: "payment", category: "finance", to: `${BASE}/projects`, read: true },
];
// نفس تبويبات قائمة إشعارات الحرفي
const NOTIFICATION_TABS = ["all", "requests", "tenders", "finance"];

/** المحادثات (من "بدء محادثة" بالملف المهني) — بدون قائمة جانبية، فزر الرجوع هو طريق الخروج */
function InstitutionChats() {
    const { t } = useTranslation("providerProfile");
    const navigate = useNavigate();
    return (
        <div className="mx-auto flex max-w-[1100px] flex-col gap-4">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex w-fit cursor-pointer items-center gap-1 text-[12px] font-medium text-[#4B9AD2] hover:underline"
            >
                <ChevronLeft size={14} className="rtl:rotate-180" />
                {t("back")}
            </button>
            <ChatBox />
        </div>
    );
}

/**
 * لوحة تحكم المؤسسة — كل صفحاتها بتنعرض جوا نفس الهيكل (قائمة جانبية + شريط علوي).
 * الصفحات اللي لسا ما انبنت بتعرض "قيد الإنشاء".
 */
export default function InstitutionDashboard() {
    const { t } = useTranslation("institutionDashboard");
    const { pathname } = useLocation();
    const isProviderProfile = Boolean(matchPath(`${BASE}/providers/:providerId`, pathname));
    const isChats = Boolean(matchPath(`${BASE}/chats`, pathname));
    // ⚠️ حالة "مقروء" بالصفحة بس لحد ما يصير في endpoint
    const [readIds, setReadIds] = useState([]);
    const notifications = NOTIFICATIONS.map((n) => ({
        ...n,
        read: n.read || readIds.includes(n.id),
        title: t(`notifications.sample.${n.id}.title`),
        body: t(`notifications.sample.${n.id}.body`),
        time: t(`notifications.sample.${n.id}.time`),
    }));

    const navItems = [
        { key: "home", icon: House, to: BASE, end: true },
        { key: "tenders", icon: SquareTrendingUp, to: `${BASE}/tenders` },
        { key: "offers", icon: Briefcase, to: `${BASE}/offers` },
        { key: "projects", icon: ClipboardLines, to: `${BASE}/projects` },
        { key: "messages", icon: ClipboardLines, to: `${BASE}/messages` },
        { key: "providers", icon: Wallet, to: `${BASE}/providers` },
        // صفحة التقارير المالية لسا مش جاهزة — رابطها بيعرض "قيد الإنشاء"
        { key: "reports", icon: CircleDollarSign, to: `${BASE}/reports` },
        { key: "settings", icon: UserRound, to: `${BASE}/settings` },
    ].map((item) => ({ ...item, label: t(`nav.${item.key}`) }));

    // ===== فهرس البحث العلوي =====
    // من نفس البيانات التجريبية اللي بالصفحات (نصوص sample بملف الترجمة). لما يصير في API بنبدلها.
    const samples = (key) => {
        const data = t(`${key}.sample`, { returnObjects: true });
        return data && typeof data === "object" ? Object.entries(data) : [];
    };
    const searchSections = [
        { key: "pages", icon: House },
        { key: "tenders", icon: SquareTrendingUp },
        { key: "offers", icon: Briefcase },
        { key: "projects", icon: ClipboardLines },
        { key: "messages", icon: ClipboardLines },
        { key: "providers", icon: Wallet },
    ].map((sec) => ({ ...sec, label: t(`searchSections.${sec.key}`) }));
    const searchItems = [
        ...navItems.map((n) => ({ id: n.key, section: "pages", title: n.label, to: n.to })),
        ...samples("tendersPage").map(([id, d]) => ({
            id,
            section: "tenders",
            title: d.title,
            subtitle: [d.category, d.area].filter(Boolean).join(" · "),
            to: `${BASE}/tenders/${id}`,
        })),
        ...samples("offersPage").map(([id, d]) => ({ id, section: "offers", title: d.tender, subtitle: d.bidder, to: `${BASE}/offers` })),
        ...samples("projectsPage").map(([id, d]) => ({ id, section: "projects", title: d.title, subtitle: d.provider, to: `${BASE}/projects` })),
        ...samples("messagesPage").map(([id, d]) => ({
            id,
            section: "messages",
            title: d.title,
            subtitle: d.party,
            keywords: [d.type],
            to: `${BASE}/messages`,
        })),
        ...samples("providersPage").map(([id, d]) => ({
            id,
            section: "providers",
            title: d.name,
            subtitle: [d.specialty, d.location].filter(Boolean).join(" · "),
            keywords: d.tags,
            to: `${BASE}/providers`,
        })),
    ];

    return (
        <RequireRole role="institution">
            <DashboardLayout
                navItems={navItems}
                // الملف المهني لمزوّد الخدمة والمحادثات: بدون قائمة جانبية، والشريط العلوي بدون بحث وبدون "+"
                showAdd={!isProviderProfile && !isChats}
                hideSearch={isProviderProfile || isChats}
                hideSidebar={isProviderProfile || isChats}
                addTo={`${BASE}/tenders/new`}
                searchSections={searchSections}
                searchItems={searchItems}
                notifications={notifications}
                // نفس شكل قائمة إشعارات لوحة الحرفي
                notificationVariant="compact"
                notificationTabs={NOTIFICATION_TABS}
                onReadNotifications={(ids) => setReadIds((list) => [...new Set([...list, ...ids])])}
            >
                <Routes>
                    <Route index element={<InstitutionHome />} />
                    <Route path="tenders" element={<InstitutionTenders />} />
                    <Route path="tenders/new" element={<InstitutionCreateTender />} />
                    <Route path="tenders/:tenderId" element={<InstitutionTenderDetails />} />
                    <Route path="offers" element={<InstitutionOffers />} />
                    <Route path="offers/:offerId" element={<InstitutionOfferDetails />} />
                    <Route path="projects" element={<InstitutionProjects />} />
                    <Route path="projects/:projectId" element={<InstitutionProjectDetails />} />
                    <Route path="messages" element={<InstitutionMessages />} />
                    {/* بتفتح من "بدء محادثة" بالملف المهني لمزوّد الخدمة */}
                    <Route path="chats" element={<InstitutionChats />} />
                    <Route path="providers" element={<InstitutionProviders />} />
                    <Route path="providers/:providerId" element={<InstitutionProviderProfile />} />
                    <Route path="settings" element={<InstitutionSettings />} />
                    <Route path="*" element={<ComingSoon homePath={BASE} />} />
                </Routes>
            </DashboardLayout>
        </RequireRole>
    );
}
