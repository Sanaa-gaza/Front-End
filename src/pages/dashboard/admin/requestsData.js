// ===== بيانات تجريبية =====
// الباك إند لسا ما فيه endpoint لطلبات الأدمن. لما يجهز، استبدلي REQUESTS بطلب من src/api/endpoints.js
// النصوص (العنوان، العميل، المنطقة، الوصف...) بملف الترجمة: requestsPage.sample.<id>
// owner: مفتاح موظف من requestsPage.staff — provider: رقم حرفي من usersData (مزود الخدمة المسند)
// photos: عدد الصور المرفقة، clientPhone/clientSince/clientCode/previous: بيانات العميل بصفحة التفاصيل
export const REQUESTS = [
    { id: "q1", ref: "M-4112", category: "plumbing", status: "assigned", owner: "s1", provider: "c4", lastActiveHours: 2, photos: 2, clientPhone: "0599-214-778", clientSince: "2026-08-01", clientCode: "A-517", previous: 2 },
    { id: "q2", ref: "M-4113", category: "painting", status: "new", owner: "", provider: "", lastActiveHours: 1, photos: 3, clientPhone: "0598-741-203", clientSince: "2026-05-02", clientCode: "A-518", previous: 1 },
    { id: "q3", ref: "M-4114", category: "plumbing", status: "reviewing", owner: "", provider: "", lastActiveHours: 5, photos: 1, clientPhone: "0592-360-418", clientSince: "2026-09-21", clientCode: "A-519", previous: 0 },
    { id: "q4", ref: "M-4115", category: "plumbing", status: "assigned", owner: "s2", provider: "c1", lastActiveHours: 8, photos: 3, clientPhone: "0567-712-094", clientSince: "2026-10-01", clientCode: "A-520", previous: 3 },
    { id: "q5", ref: "M-4116", category: "plumbing", status: "closed", owner: "s3", provider: "c4", lastActiveHours: 30, photos: 0, clientPhone: "0599-883-120", clientSince: "2026-02-14", clientCode: "A-521", previous: 5 },
    { id: "q6", ref: "M-4117", category: "plumbing", status: "closed", owner: "s4", provider: "c2", lastActiveHours: 52, photos: 2, clientPhone: "0597-440-916", clientSince: "2026-04-09", clientCode: "A-522", previous: 1 },
    { id: "q7", ref: "M-4118", category: "plumbing", status: "rejected", owner: "", provider: "", lastActiveHours: 75, photos: 1, clientPhone: "0595-102-337", clientSince: "2026-07-18", clientCode: "A-523", previous: 0 },
];

export const REQUEST_CATEGORIES = ["plumbing", "painting", "electrical", "carpentry"];

// المسؤولون عن الطلبات (موظفو الإدارة)
export const STAFF = ["s1", "s2", "s3", "s4"];

export const REQUEST_STATUS_STYLES = {
    new: "bg-[#DCEBFA] text-[#4B9AD2]",
    reviewing: "bg-[#FDEBD3] text-[#D9822B]",
    assigned: "bg-[#DDF6E3] text-[#2EAF4E]",
    closed: "bg-[#EEF0F2] text-[#6B7280]",
    rejected: "bg-[#FDE2E2] text-[#D64545]",
};
