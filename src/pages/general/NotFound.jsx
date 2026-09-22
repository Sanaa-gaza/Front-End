import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, ArrowRight, ArrowLeft, AlertTriangle } from "lucide-react";
import AuthHeader from "../../components/AuthHeader";

export default function NotFound() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-dvh flex flex-col bg-gradient-to-t from-[#dbeaf5] dark:from-slate-950 to-white dark:to-slate-900">
            {/* الترويسة العلوية لصفحات الشعار واللغة */}
            <AuthHeader />

            <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
                {/* زر العودة العلوي */}
                {/* <div className="w-full max-w-xl mb-4 flex justify-between items-center">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {t("pageNotFoundTitle", "خطأ 404")}
                    </h1>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 text-sm font-medium transition"
                    >
                        {i18n.language === "ar" ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
                        <span>{t("back", "عودة")}</span>
                    </button>
                </div> */}

                <div className="grid grid-cols-3 items-center mb-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="justify-self-start flex items-center gap-1.5 text-[#4B9AD2] text-sm font-medium cursor-pointer"
                    >
                        <span className="w-6 h-6 flex items-center justify-center border border-[#4B9AD2] rounded-full">
                            <i className="fa-solid fa-arrow-left rtl:rotate-180 text-xs"></i>
                        </span>
                        <span>{t("back")}</span>
                    </button>

                    <h1 className="col-start-2 justify-self-center text-[#141415D1] dark:text-slate-100 text-2xl font-bold">
                        {t("pageNotFoundTitle", "خطأ 404")}
                    </h1>
                </div>

                {/* الكارت الرئيسي بنفس نمط الكروت السابقة */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-black/30 w-full max-w-xl border border-slate-100 dark:border-white/10 text-center">


                    {/* أيقونة تنبيه ملائمة للتصميم */}
                    <div className="w-20 h-20 bg-[#f0f6fa] text-[#4ba0d8] rounded-full mx-auto flex items-center justify-center mb-4">
                        <AlertTriangle size={40} />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">
                        {t("pageNotFound", "الصفحة غير موجودة")}
                    </h2>

                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed max-w-md mx-auto">
                        {t(
                            "pageNotFoundDesc",
                            "عذراً، الرابط الذي حاولت الوصول إليه غير صحيح أو تم نقل الصفحة إلى مكان آخر."
                        )}
                    </p>

                    {/* زر العودة للرئيسية بنفس لون وتصميم باقي الصفحات */}
                    <Link
                        to="/"
                        className="w-full inline-flex items-center justify-center gap-2 bg-[#4ba0d8] hover:bg-[#3b8cc4] active:bg-[#327cae] text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-md shadow-blue-400/20 text-base"
                    >
                        <Home size={20} />
                        <span>{t("backToHome", "العودة للرئيسية")}</span>
                    </Link>
                </div>
            </main>
        </div>
    );
}