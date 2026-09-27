// صور الحرفيين اللي بخوذة متوفرة 5 بس، فبتتكرر لحد ما تنضاف صور جديدة
const HELMET_AVATARS = [
    "/images/Ellipse 1595 (1).svg",
    "/images/Ellipse 1595 (2).svg",
    "/images/Ellipse 1595 (3).svg",
    "/images/Ellipse 1595 (4).svg",
    "/images/Ellipse 1595 (5).svg",
];

// category: تصنيف الصفحة، city: مفتاح المدينة، verified: موثوق
const DATA = [
    { rating: "4.5", category: "ac", city: "nuseirat", verified: true, reviews: 120, orders: 200, years: 12, price: [100, 500], featured: true },
    { rating: "4.5", category: "electricity", city: "khanyounis", verified: true, reviews: 86, orders: 140, years: 8, price: [80, 400], featured: false },
    { rating: "4.9", category: "electricity", city: "gaza", verified: true, reviews: 210, orders: 320, years: 15, price: [120, 600], featured: true },
    { rating: "4.8", category: "painting", city: "rafah", verified: false, reviews: 64, orders: 95, years: 6, price: [60, 300], featured: false },
    { rating: "4.7", category: "carpentry", city: "jabalia", verified: true, reviews: 98, orders: 150, years: 10, price: [90, 450], featured: false },
    { rating: "4.5", category: "carpentry", city: "deirbalah", verified: true, reviews: 55, orders: 80, years: 5, price: [70, 350], featured: false },
    { rating: "4.6", category: "painting", city: "khanyounis", verified: false, reviews: 73, orders: 110, years: 7, price: [60, 320], featured: false },
    { rating: "4.9", category: "blacksmith", city: "gaza", verified: true, reviews: 180, orders: 260, years: 14, price: [110, 550], featured: true },
    { rating: "4.7", category: "plumbing", city: "rafah", verified: true, reviews: 92, orders: 130, years: 9, price: [50, 280], featured: false },
    { rating: "4.8", category: "cleaning", city: "nuseirat", verified: true, reviews: 140, orders: 210, years: 11, price: [40, 200], featured: false },
];

export const CRAFTSMEN = DATA.map((d, i) => ({
    key: `c${i + 1}`,
    avatar: HELMET_AVATARS[i % HELMET_AVATARS.length],
    ...d,
}));

export const CATEGORY_KEYS = ["electricity", "plumbing", "carpentry", "painting", "cleaning", "solar", "blacksmith", "ac"];
export const CITY_KEYS = ["nuseirat", "khanyounis", "gaza", "rafah", "jabalia", "deirbalah"];

// مفاتيح الخدمات بالصفحة الرئيسية -> تصنيف الحرفيين
export const SERVICE_TO_CATEGORY = {
    painting: "painting",
    cleaning: "cleaning",
    carpentry: "carpentry",
    electricity: "electricity",
    plumbing: "plumbing",
    acMaintenance: "ac",
};
