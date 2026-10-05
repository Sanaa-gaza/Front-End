import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell, ChevronsLeft, ChevronsRight, LogOut, Menu, Plus, Search, X } from "lucide-react";
import useLangDir from "../../hooks/useLangDir";
import { getMe, logout } from "../../api/endpoints";
import { clearAuth, getStoredUser } from "../../api/session";

/**
 * الهيكل المشترك لكل لوحات التحكم: قائمة جانبية + شريط علوي + المحتوى.
 * navItems: [{ key, label, icon, to, end }] — كل لوحة بتبعت قائمتها.
 */
export default function DashboardLayout({ navItems, children }) {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { t, i18n } = useTranslation("dashboard");
    useLangDir();

    const [user, setUser] = useState(getStoredUser);
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [lastPath, setLastPath] = useState(pathname);

    // قائمة الجوال بتتسكر لحالها لما تتغير الصفحة
    if (lastPath !== pathname) {
        setLastPath(pathname);
        setMobileOpen(false);
    }

    // بنتأكد إن التوكن لسا صالح ونجيب بيانات المستخدم المحدثة
    useEffect(() => {
        getMe()
            .then((res) => setUser(res.data))
            .catch(() => {
                clearAuth();
                navigate("/login", { replace: true });
            });
    }, [navigate]);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await logout();
        } catch {
            // حتى لو فشل الطلب، بنطلعه محليًا
        }
        clearAuth();
        navigate("/login");
    };

    const name = user?.full_name || user?.institution_name || "";
    const isRtl = i18n.language === "ar";
    // سهم الطي بيأشر لجهة الإغلاق حسب اتجاه الصفحة
    const CollapseIcon = collapsed === isRtl ? ChevronsLeft : ChevronsRight;

    const sidebar = (isMobile) => {
        const compact = collapsed && !isMobile;
        return (
            <div className="flex h-full flex-col bg-linear-to-b from-[#9FCBEA] via-[#79B3DE] to-[#4B9AD2] px-4 py-5 text-white">
                <div className={`flex items-center ${compact ? "justify-center" : "justify-between"} mb-8`}>
                    {!compact && (
                        // الشعار بيرجّع للصفحة الرئيسية للموقع
                        <Link to="/" className="rounded-md focus-visible:outline-2 focus-visible:outline-white">
                            <img
                                src="/images/logo w 1.svg"
                                alt="صنعة"
                                className="w-[92px] brightness-0 invert transition-opacity hover:opacity-80"
                            />
                        </Link>
                    )}
                    {isMobile ? (
                        <button
                            type="button"
                            onClick={() => setMobileOpen(false)}
                            aria-label={t("closeMenu")}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/15 cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setCollapsed((c) => !c)}
                            aria-label={collapsed ? t("expand") : t("collapse")}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/15 cursor-pointer"
                        >
                            <CollapseIcon size={20} />
                        </button>
                    )}
                </div>

                <nav className="flex flex-1 flex-col gap-1.5">
                    {navItems.map(({ key, label, icon: Icon, to, end }) => (
                        <NavLink
                            key={key}
                            to={to}
                            end={end}
                            title={compact ? label : undefined}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-xl py-2.5 text-[15px] font-medium transition-colors ${compact ? "justify-center px-2" : "px-3"
                                } ${isActive
                                    ? "bg-white text-[#4B9AD2] shadow-sm"
                                    : "text-white hover:bg-white/15"
                                }`
                            }
                        >
                            <Icon size={19} strokeWidth={1.9} className="shrink-0" />
                            {!compact && <span className="truncate">{label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    title={compact ? t("logout") : undefined}
                    className={`mt-6 flex items-center gap-3 rounded-xl py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-white/15 cursor-pointer disabled:opacity-60 ${compact ? "justify-center px-2" : "px-3"
                        }`}
                >
                    <LogOut size={19} strokeWidth={1.9} className="shrink-0 rtl:rotate-180" />
                    {!compact && <span>{loggingOut ? t("loggingOut") : t("logout")}</span>}
                </button>
            </div>
        );
    };

    return (
        <div className="flex min-h-dvh bg-[#F7FAFD]">
            {/* القائمة الجانبية على الشاشات الكبيرة */}
            <aside
                className={`sticky top-0 hidden h-dvh shrink-0 overflow-hidden rounded-e-[28px] shadow-[0_0_30px_rgba(35,74,100,0.12)] transition-[width] duration-300 lg:block ${collapsed ? "w-[84px]" : "w-[250px]"
                    }`}
            >
                {sidebar(false)}
            </aside>

            {/* القائمة الجانبية على الجوال (درج) */}
            <div
                aria-hidden="true"
                onClick={() => setMobileOpen(false)}
                className={`fixed inset-0 z-40 bg-[#141415]/40 transition-opacity duration-300 lg:hidden ${mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
            />
            <aside
                inert={!mobileOpen}
                className={`fixed inset-y-0 start-0 z-50 w-[260px] overflow-hidden rounded-e-[28px] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${mobileOpen ? "translate-x-0" : "ltr:-translate-x-full rtl:translate-x-full"
                    }`}
            >
                {sidebar(true)}
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                {/* الشريط العلوي */}
                <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between gap-4 border-b border-[#0000000D] bg-white px-4 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            aria-label={t("openMenu")}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#4B9AD2] text-[#4B9AD2] cursor-pointer lg:hidden"
                        >
                            <Menu size={18} />
                        </button>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E5E7EB] text-sm font-bold text-[#575757]">
                            {name.charAt(0)}
                        </div>
                        <span className="truncate text-sm font-semibold text-[#22455E]">{name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="relative hidden md:block">
                            <Search size={16} className="pointer-events-none absolute top-1/2 start-3 -translate-y-1/2 text-[#4B9AD2]" />
                            <input
                                type="search"
                                placeholder={t("search")}
                                className="h-9 w-[300px] rounded-full border border-[#4B9AD2] bg-white ps-9 pe-4 text-[12px] text-[#414141] placeholder-[#89949D] outline-none focus:ring-1 focus:ring-[#4B9AD2] xl:w-[380px]"
                            />
                        </label>
                        <button
                            type="button"
                            onClick={() => i18n.changeLanguage(isRtl ? "en" : "ar")}
                            aria-label={t("language")}
                            title={t("language")}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#4B9AD2] text-[11px] font-bold text-[#4B9AD2] cursor-pointer btn-wipe btn-wipe-outline"
                        >
                            {isRtl ? "EN" : "AR"}
                        </button>
                        <button
                            type="button"
                            aria-label={t("addNew")}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#4B9AD2] text-[#4B9AD2] cursor-pointer btn-wipe btn-wipe-outline"
                        >
                            <Plus size={17} />
                        </button>
                        <button
                            type="button"
                            aria-label={t("notifications")}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#4B9AD2] text-[#4B9AD2] cursor-pointer btn-wipe btn-wipe-outline"
                        >
                            <Bell size={17} />
                        </button>
                    </div>
                </header>

                <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
            </div>
        </div>
    );
}
