// ===== بيانات تجريبية =====
// الباك إند لسا ما فيه endpoints للعروض. لما تجهز، استبدلي OFFERS بطلب من src/api/endpoints.js
// stage: مرحلة المناقصة (التبويبات)، status: حالة العرض (الشارة بالجدول)
// years/rating/reviews: بيانات صاحب العرض بصفحة التفاصيل
export const OFFERS = [
    { id: "o1", applicants: 12, price: 20000, duration: 86, stage: "awaiting", status: "new", years: 12, rating: 4.8, reviews: 124 },
    { id: "o2", applicants: 8, price: 100000, duration: 81, stage: "executing", status: "reviewed", years: 9, rating: 4.6, reviews: 87 },
    { id: "o3", applicants: 15, price: 50000, duration: 78, stage: "awaiting", status: "shortlisted", years: 15, rating: 4.9, reviews: 203 },
    { id: "o4", applicants: 12, price: 50000, duration: 64, stage: "completed", status: "excluded", years: 7, rating: 4.5, reviews: 56 },
];

// المتقدمين على المناقصة (النصوص بملف الترجمة: offerDetails.applicantsSample.<id>)
// provider: رقم ملفه المهني بلوحة المؤسسة (/dashboard/institution/providers/:providerId)
export const APPLICANTS = [
    { id: "a1", provider: "p2", price: 1980, years: 8, rating: 4.9, reviews: 100, date: "2026-10-01", verified: true },
    { id: "a2", provider: "p4", price: 2350, years: 11, rating: 4.7, reviews: 64, date: "2026-10-02", verified: true },
    { id: "a3", provider: "p6", price: 1750, years: 5, rating: 4.4, reviews: 31, date: "2026-10-03", verified: false },
];
