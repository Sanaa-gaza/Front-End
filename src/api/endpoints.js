import api from "./client";

/**
 * كل endpoints الباك إند بمكان واحد. كل دالة بترجع response.data
 * اللي شكلها: { success, data, message }.
 */
const post = (url, body) => api.post(url, body).then((r) => r.data);
const get = (url) => api.get(url).then((r) => r.data);

// ===== Auth =====
export const registerCustomer = (body) => post("/auth/register/customer", body);
export const registerCraftsman = (body) => post("/auth/register/craftsman", body);
export const registerInstitution = (body) => post("/auth/register/institution", body);
export const registerContractor = (body) => post("/auth/register/contractor", body);

/** purpose: "register" (بيرجع token + user) أو "reset" (بيرجع reset_token) */
export const verifyEmail = (email, code, purpose) => post("/auth/verify-email", { email, code, purpose });
export const resendCode = (email, purpose) => post("/auth/resend-code", { email, purpose });

export const login = (email, password, remember) => post("/auth/login", { email, password, remember });
export const getMe = () => get("/auth/me");
export const logout = () => post("/auth/logout");

// ===== Password reset =====
export const forgotPassword = (email) => post("/auth/forgot-password", { email });
export const resetPassword = (reset_token, password, password_confirmation) =>
    post("/auth/reset-password", { reset_token, password, password_confirmation });

// ===== Reference data =====
export const getGovernorates = () => get("/governorates").then((r) => r.data);
export const getAreas = (governorateId) => get(`/governorates/${governorateId}/areas`).then((r) => r.data);
export const getServices = () => get("/services").then((r) => r.data);

// ===== Profile =====
/** يرفع ملف (JPG/PNG/PDF حتى 10MB) ويرجع المسار اللي بينبعت مع التسجيل */
export const uploadFile = (file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/uploads", form).then((r) => r.data.data.path);
};
// ===== Security =====
// ⚠️ هدول مش موجودين بالباك إند لسا (سبرنت 1) — الأسماء مقترحة، لازم تتأكد مع مطور الباك إند
export const changePassword = (current_password, password, password_confirmation) =>
    post("/auth/change-password", { current_password, password, password_confirmation });
export const deleteAccount = (password) => api.delete("/profile", { data: { password } }).then((r) => r.data);

export const getProfile = () => get("/profile");
export const updateProfile = (body) => api.put("/profile", body).then((r) => r.data);

// ===== Craftsmen (سبرنت 2) =====
/**
 * params: { search, service_id, governorate_id, area_id, min_rating, trusted, page }
 * بيرجع { craftsmen: [...], meta: { current_page, last_page, total } }
 */
export const getCraftsmen = (params = {}) => {
    // بنشيل الفلاتر الفاضية عشان ما تنبعت كـ ?service_id=
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined));
    return api.get("/craftsmen", { params: clean }).then((r) => r.data.data);
};
export const getFeaturedCraftsmen = () => get("/craftsmen/featured").then((r) => r.data);

// ===== Service requests (سبرنت 2) =====
export const createServiceRequest = (body) => post("/service-requests", body);
export const getServiceRequests = (status) =>
    api.get("/service-requests", { params: status ? { status } : {} }).then((r) => r.data);
export const acceptServiceRequest = (id) => post(`/service-requests/${id}/accept`);
export const rejectServiceRequest = (id, reason) => post(`/service-requests/${id}/reject`, { reason });
export const completeServiceRequest = (id) => post(`/service-requests/${id}/complete`);
export const reviewServiceRequest = (id, rating, comment) => post(`/service-requests/${id}/review`, { rating, comment });

// ===== Contact (سبرنت 2) =====
/** { full_name, city, email (للزائر بس), subject: general|complaint|suggestion|support|partnership, message } */
export const sendContactMessage = (body) => post("/contact", body);
