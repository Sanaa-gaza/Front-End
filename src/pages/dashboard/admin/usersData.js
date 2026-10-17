// ===== بيانات تجريبية =====
// الباك إند لسا ما فيه endpoints لإدارة المستخدمين. لما تجهز، استبدلي USERS بطلب من src/api/endpoints.js
// النصوص (الاسم، المجال، المنطقة) بملف الترجمة: usersPage.sample.<id>
export const USERS = {
    craftsmen: [
        { id: "c1", years: 12, rating: 4.9, completed: 21, verification: "verified", status: "available" },
        { id: "c2", years: 5, rating: 4.9, completed: 1, verification: "verified", status: "available" },
        { id: "c3", years: 1, rating: 4.9, completed: 33, verification: "verified", status: "available" },
        { id: "c4", years: 10, rating: 4.7, completed: 18, verification: "pending", status: "busy" },
        { id: "c5", years: 7, rating: 4.2, completed: 6, verification: "unverified", status: "available" },
    ],
    customers: [
        { id: "u1", phone: "0595289936", requests: 21, joined: "2026-10-05", lastActiveHours: 5, verification: "verified", status: "active" },
        { id: "u2", phone: "0598741203", requests: 1, joined: "2026-11-03", lastActiveHours: 5, verification: "verified", status: "active" },
        { id: "u3", phone: "0592360418", requests: 33, joined: "2026-12-09", lastActiveHours: 5, verification: "verified", status: "active" },
        { id: "u4", phone: "0567712094", requests: 2, joined: "2026-10-01", lastActiveHours: 26, verification: "pending", status: "active" },
    ],
    contractors: [
        { id: "k1", workers: 21, activeProjects: 3, licenses: 0, verification: "verified", status: "available" },
        { id: "k2", workers: 1, activeProjects: 5, licenses: 0, verification: "verified", status: "available" },
        { id: "k3", workers: 33, activeProjects: 9, licenses: 0, verification: "verified", status: "available" },
    ],
    institutions: [
        { id: "i1", tenders: 21, activeProjects: 3, verification: "verified", status: "active" },
        { id: "i2", tenders: 1, activeProjects: 5, verification: "verified", status: "active" },
        { id: "i3", tenders: 33, activeProjects: 9, verification: "verified", status: "active" },
    ],
};

export const USER_TABS = ["craftsmen", "customers", "contractors", "institutions"];

export const VERIFICATION_STYLES = {
    verified: "bg-[#DDF6E3] text-[#2EAF4E]",
    pending: "bg-[#FDEBD3] text-[#D9822B]",
    unverified: "bg-[#EEF0F2] text-[#6B7280]",
};

export const STATUS_STYLES = {
    available: "bg-[#DDF6E3] text-[#2EAF4E]",
    active: "bg-[#DDF6E3] text-[#2EAF4E]",
    busy: "bg-[#DCEBFA] text-[#4B9AD2]",
    suspended: "bg-[#FDE2E2] text-[#D64545]",
};

/** المستخدم + نوع حسابه (التبويب اللي هو فيه) من رقمه */
export function findUser(id) {
    for (const type of USER_TABS) {
        const index = USERS[type].findIndex((u) => u.id === id);
        if (index !== -1) return { user: USERS[type][index], type, index };
    }
    return null;
}
