/**
 * تخزين بيانات الدخول (التوكن + المستخدم).
 * "تذكرني" → localStorage (يضل بعد سكر المتصفح)، غير هيك → sessionStorage.
 */
const TOKEN_KEY = "sanaa_token";
const USER_KEY = "sanaa_user";

export function saveAuth({ token, user }, remember = false) {
    clearAuth();
    const store = remember ? localStorage : sessionStorage;
    store.setItem(TOKEN_KEY, token);
    store.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    try {
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function clearAuth() {
    [localStorage, sessionStorage].forEach((store) => {
        store.removeItem(TOKEN_KEY);
        store.removeItem(USER_KEY);
    });
}

/**
 * وين يروح المستخدم بعد الدخول حسب نوع حسابه (role من رد السيرفر، مش من صفحة الدخول).
 * حالياً في لوحة تحكم وحدة للكل — لما تنبنى لوحة لكل نوع، غيّري المسار هون بس.
 */
const ROLE_HOME = {
    customer: "/dashboard",
    craftsman: "/dashboard",
    institution: "/dashboard",
    contractor: "/dashboard",
};

export function homePathForRole(role) {
    return ROLE_HOME[role] || "/dashboard";
}

/**
 * بيانات التحقق من الإيميل بين الصفحات:
 * email + purpose (register | reset) + وين نروح بعد التحقق.
 */
export function setPendingVerification(email, purpose, redirect) {
    sessionStorage.setItem("sanaa_pending_email", email);
    sessionStorage.setItem("sanaa_verification_purpose", purpose);
    sessionStorage.setItem("sanaa_verification_redirect", redirect);
}

export function getPendingVerification() {
    return {
        email: sessionStorage.getItem("sanaa_pending_email") || "",
        purpose: sessionStorage.getItem("sanaa_verification_purpose") || "register",
        redirect: sessionStorage.getItem("sanaa_verification_redirect") || "/dashboard",
    };
}

export function clearPendingVerification() {
    ["sanaa_pending_email", "sanaa_verification_purpose", "sanaa_verification_redirect"].forEach((k) =>
        sessionStorage.removeItem(k)
    );
}
