import axios from "axios";
import i18n from "../i18n/i18n";
import { getToken, clearAuth } from "./session";

/**
 * نسخة axios الموحّدة لكل طلبات الباك إند (Laravel).
 * الرابط بيجي من VITE_API_URL بملف .env، ولو مش موجود بنستخدم سيرفر Railway.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://back-end-production-9aa3.up.railway.app/api",
    headers: { Accept: "application/json" },
    timeout: 30000,
});

// بنضيف التوكن ولغة الواجهة لكل طلب
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers["Accept-Language"] = i18n.language || "ar";
    return config;
});

// لو التوكن انتهى أو انسحب، بنمسح بيانات الدخول المحفوظة
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && getToken()) clearAuth();
        return Promise.reject(error);
    }
);

/**
 * رابط كامل لملف مرفوع على السيرفر من مساره (مثلاً uploads/x.jpg).
 * Laravel بيخدم الملفات من /storage على نفس دومين الـ API.
 */
export function fileUrl(pathOrUrl) {
    if (!pathOrUrl) return "";
    if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
    const origin = api.defaults.baseURL.replace(/\/api\/?$/, "");
    return `${origin}/storage/${pathOrUrl.replace(/^\/+/, "")}`;
}

export default api;
