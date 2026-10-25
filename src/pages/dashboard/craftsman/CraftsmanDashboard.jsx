import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Briefcase, ClipboardList, House, Search, UserRound, Wallet } from "lucide-react";
import RequireRole from "../../../components/dashboard/RequireRole";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import ComingSoon from "../../../components/dashboard/ComingSoon";
import { getProfile, updateProfile } from "../../../api/endpoints";
import CraftsmanHome, { AvailabilityToggle } from "./CraftsmanHome";
import CraftsmanSearch from "./CraftsmanSearch";
import CraftsmanRequests, { CraftsmanRequestDetails } from "./CraftsmanRequests";
import CraftsmanCurrent from "./CraftsmanCurrent";
import CraftsmanWorkDetails from "./CraftsmanWorkDetails";
import CraftsmanProfile from "./CraftsmanProfile";

const BASE = "/dashboard/craftsman";

// ===== إشعارات تجريبية =====
// ما في endpoint للإشعارات بالسيرفر لسا؛ لما ينضاف، استبدلي NOTIFICATIONS بالبيانات الحقيقية.
// category: التبويب اللي بيظهر فيه، to: الصفحة اللي بيفتحها الإشعار
const NOTIFICATIONS = [
    { id: "n1", type: "deadline", category: "requests", to: `${BASE}/requests` },
    { id: "n2", type: "request", category: "requests", to: `${BASE}/requests` },
    { id: "n3", type: "payment", category: "finance", to: `${BASE}/wallet` },
    { id: "n4", type: "chat", category: "tenders", to: `${BASE}/current`, read: true },
];
const NOTIFICATION_TABS = ["all", "requests", "tenders", "finance"];

/** "متاح للطلبات" بالشريط العلوي */
function AvailabilityPill({ availability }) {
    const { t } = useTranslation("craftsmanDashboard");
    return (
        <div className="flex h-9 items-center gap-2 rounded-full border border-[#BFEBCD] bg-[#EEFAF2] pe-3 ps-2">
            <AvailabilityToggle
                size="sm"
                checked={availability.available}
                onChange={availability.toggle}
                disabled={!availability.ready || availability.saving}
                label={t("availability.pill")}
            />
            <span className="whitespace-nowrap text-[11px] font-medium text-[#1F7A3A]">{t("availability.pill")}</span>
        </div>
    );
}

/**
 * لوحة تحكم الحرفي — كل صفحاتها جوا نفس الهيكل (قائمة جانبية + شريط علوي).
 * الصفحات اللي لسا ما إلها تصميم بتعرض "قيد الإنشاء".
 */
export default function CraftsmanDashboard() {
    const { t } = useTranslation("craftsmanDashboard");
    // بيانات الحرفي من GET /profile (الحرفة، التقييم، التوفر، الصورة...)
    const [profile, setProfile] = useState(null);
    // حالة "متاح" مشتركة بين الشريط العلوي وبطاقة الصفحة الرئيسية
    const [override, setOverride] = useState(null);
    const [saving, setSaving] = useState(false);
    const [note, setNote] = useState("");
    // ⚠️ حالة "مقروء" بالصفحة بس لحد ما يصير في endpoint
    const [readIds, setReadIds] = useState([]);
    const notifications = NOTIFICATIONS.map((n) => ({
        ...n,
        read: n.read || readIds.includes(n.id),
        title: t(`notifications.${n.id}.title`),
        body: t(`notifications.${n.id}.body`),
        time: t(`notifications.${n.id}.time`),
    }));

    useEffect(() => {
        let active = true;
        getProfile()
            .then((res) => active && setProfile(res.data))
            .catch(() => {});
        return () => {
            active = false;
        };
    }, []);

    const toggleAvailability = async (value) => {
        setOverride(value);
        setSaving(true);
        setNote("");
        try {
            await updateProfile({ is_available: value });
            // السيرفر ممكن يتجاهل الحقل بصمت، فبنتأكد من القيمة المحفوظة فعلاً
            const fresh = (await getProfile()).data;
            setProfile(fresh);
            if (Boolean(fresh?.craftsman?.is_available) !== value) setNote(t("availability.notSaved"));
        } catch {
            setNote(t("availability.notSaved"));
        } finally {
            setOverride(null);
            setSaving(false);
        }
    };

    const availability = {
        available: override ?? Boolean(profile?.craftsman?.is_available),
        ready: Boolean(profile),
        saving,
        note,
        toggle: toggleAvailability,
    };

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
                hideSearch
                hideLanguage
                showAdd={false}
                greeting
                avatarPath={profile?.craftsman?.personal_photo_path}
                topbarExtra={<AvailabilityPill availability={availability} />}
                notifications={notifications}
                onReadNotifications={(ids) => setReadIds((r) => [...new Set([...r, ...ids])])}
                notificationTabs={NOTIFICATION_TABS}
                notificationVariant="compact"
            >
                <Routes>
                    <Route index element={<CraftsmanHome profile={profile} availability={availability} />} />
                    <Route path="search" element={<CraftsmanSearch />} />
                    <Route path="requests" element={<CraftsmanRequests />} />
                    <Route path="requests/:requestId" element={<CraftsmanRequestDetails />} />
                    <Route path="current" element={<CraftsmanCurrent />} />
                    <Route path="current/:workId" element={<CraftsmanWorkDetails />} />
                    <Route path="profile" element={<CraftsmanProfile profile={profile} onProfileChange={setProfile} />} />
                    <Route path="*" element={<ComingSoon homePath={BASE} />} />
                </Routes>
            </DashboardLayout>
        </RequireRole>
    );
}
