import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthHeader from "../../components/AuthHeader";
import useLangDir from "../../hooks/useLangDir";
import { getMe, logout } from "../../api/endpoints";
import { getToken, getStoredUser, clearAuth } from "../../api/session";

const ROLE_LABELS = {
    customer: "عميل",
    craftsman: "حرفي",
    institution: "مؤسسة",
    contractor: "مقاول",
};

/**
 * صفحة مؤقتة (placeholder) لحد ما تتبنى لوحة التحكم الفعلية.
 * كل صفحات إنشاء الحساب وتسجيل الدخول بتوصل هون.
 */
export default function Dashboard() {
    const navigate = useNavigate();
    useLangDir();

    const [user, setUser] = useState(getStoredUser);
    const [loggingOut, setLoggingOut] = useState(false);

    // بنتأكد إن التوكن لسا صالح ونجيب بيانات المستخدم المحدثة
    useEffect(() => {
        if (!getToken()) {
            navigate("/login", { replace: true });
            return;
        }
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

    return (
        <div className="min-h-dvh flex flex-col bg-gradient-to-t from-[#dbeaf5] to-white">
            <AuthHeader />

            <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-[#DEE8FC] text-[#4B9AD2] flex items-center justify-center mb-5">
                    <i className="fa-solid fa-gauge text-2xl"></i>
                </div>
                <h1 className="text-[#141415D1] text-2xl font-bold mb-2">
                    {user ? `أهلاً ${user.full_name}` : "أهلاً بك"}
                </h1>
                {user && <p className="text-[#4B9AD2] text-sm mb-1" dir="ltr">{user.email}</p>}
                {user?.role && (
                    <p className="text-[#89949D] text-sm mb-2">نوع الحساب: {ROLE_LABELS[user.role] || user.role}</p>
                )}
                <p className="text-[#89949D] max-w-md mb-8">
                    لوحة التحكم لسا قيد الإنشاء، هترجع تلاقيها جاهزة قريبًا.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="text-white bg-[#4B9AD2] hover:bg-[#3d82b3] transition-colors rounded-lg py-2.5 px-6 font-medium cursor-pointer"
                    >
                        العودة للصفحة الرئيسية
                    </button>
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="text-[#4B9AD2] border border-[#4B9AD2] hover:bg-[#4B9AD2] hover:text-white transition-colors rounded-lg py-2.5 px-6 font-medium cursor-pointer disabled:opacity-60"
                    >
                        {loggingOut ? "جارِ تسجيل الخروج..." : "تسجيل الخروج"}
                    </button>
                </div>
            </main>
        </div>
    );
}
