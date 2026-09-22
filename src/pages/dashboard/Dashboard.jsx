import React from "react";
import { useNavigate } from "react-router-dom";
import AuthHeader from "../../components/AuthHeader";
import useLangDir from "../../hooks/useLangDir";

/**
 * صفحة مؤقتة (placeholder) لحد ما تتبنى لوحة التحكم الفعلية.
 * كل صفحات إنشاء الحساب بعد التحقق من الكود بتوصل هون.
 */
export default function Dashboard() {
    const navigate = useNavigate();
    useLangDir();

    return (
        <div className="min-h-dvh flex flex-col bg-gradient-to-t from-[#dbeaf5] dark:from-slate-950 to-white dark:to-slate-900">
            <AuthHeader />

            <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-[#DEE8FC] dark:bg-[#4B9AD2]/15 text-[#4B9AD2] flex items-center justify-center mb-5">
                    <i className="fa-solid fa-gauge text-2xl"></i>
                </div>
                <h1 className="text-[#141415D1] dark:text-slate-100 text-2xl font-bold mb-2">تم إنشاء حسابك بنجاح</h1>
                <p className="text-[#89949D] dark:text-slate-400 max-w-md mb-8">
                    لوحة التحكم لسا قيد الإنشاء، هترجع تلاقيها جاهزة قريبًا.
                </p>
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="text-white bg-[#4B9AD2] hover:bg-[#3d82b3] transition-colors rounded-lg py-2.5 px-6 font-medium cursor-pointer"
                >
                    العودة للصفحة الرئيسية
                </button>
            </main>
        </div>
    );
}
