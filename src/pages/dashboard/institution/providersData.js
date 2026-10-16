// ===== بيانات تجريبية =====
// الباك إند لسا ما فيه endpoint لقائمة مزودي الخدمة. لما يجهز، استبدلي PROVIDERS بطلب من src/api/endpoints.js
// serviceId: رقم الحرفة من GET /api/services (عشان فلتر "نوع الخدمة" يشتغل على القائمة الحقيقية)
export const PROVIDERS = [
    { id: "p1", type: "team", serviceId: 1, rating: 4.9, reviews: 100, years: 8, verified: true, available: true },
    { id: "p2", type: "craftsman", serviceId: 2, rating: 4.7, reviews: 86, years: 6, verified: true, available: true },
    { id: "p3", type: "contractor", serviceId: 8, rating: 4.5, reviews: 54, years: 15, verified: true, available: false },
    { id: "p4", type: "craftsman", serviceId: 4, rating: 4.8, reviews: 120, years: 10, verified: true, available: true },
    { id: "p5", type: "team", serviceId: 5, rating: 4.2, reviews: 38, years: 5, verified: false, available: true },
    { id: "p6", type: "craftsman", serviceId: 10, rating: 4.6, reviews: 72, years: 9, verified: true, available: true },
    { id: "p7", type: "contractor", serviceId: 8, rating: 3.9, reviews: 21, years: 12, verified: true, available: true },
    { id: "p8", type: "craftsman", serviceId: 7, rating: 4.4, reviews: 47, years: 7, verified: false, available: false },
    { id: "p9", type: "team", serviceId: 2, rating: 4.8, reviews: 93, years: 6, verified: true, available: true },
    { id: "p10", type: "craftsman", serviceId: 6, rating: 3.6, reviews: 15, years: 4, verified: false, available: true },
    { id: "p11", type: "contractor", serviceId: 5, rating: 4.3, reviews: 40, years: 11, verified: true, available: true },
    { id: "p12", type: "craftsman", serviceId: 1, rating: 4.9, reviews: 132, years: 13, verified: true, available: true },
];
