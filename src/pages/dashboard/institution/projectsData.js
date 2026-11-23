// ===== بيانات تجريبية =====
// الباك إند لسا ما فيه endpoints للمشاريع. لما تجهز، استبدلي PROJECTS بطلب من src/api/endpoints.js
// النصوص (العنوان، المزوّد، الموقع، التواريخ...) بملف الترجمة: projectsPage.sample و projectDetails.sample
// tasks: المهام المنجزة من الكل (نسبة الإنجاز بتنحسب منها) — deadline: موعد التسليم (null = بانتظار التحديث)
export const PROJECTS = [
    { id: "p1", status: "executing", progress: 75, value: 11200, tasks: { done: 15, total: 20 }, deadline: "2026-12-20" },
    { id: "p2", status: "completed", progress: 100, value: 11200, tasks: { done: 20, total: 20 }, deadline: "2026-10-30" },
    { id: "p3", status: "pending", progress: 35, value: 95000, tasks: { done: 7, total: 20 }, deadline: null },
    { id: "p4", status: "executing", progress: 40, value: 8500, tasks: { done: 8, total: 20 }, deadline: "2027-01-15" },
    // phase: "delivery" = الحرفيين سلّموا الأعمال والمشروع بانتظار اعتماد المؤسسة للاستلام
    { id: "p5", status: "pending", phase: "delivery", progress: 100, value: 124500, tasks: { done: 20, total: 20 }, deadline: "2026-11-30" },
];

// مراحل المشروع بالترتيب
export const PROJECT_STAGES = ["created", "accepted", "started", "executing", "delivered"];

// توثيق التنفيذ: صور ميدانية + مستندات (العناوين والأسماء بملف الترجمة: projectDetails.docs)
// image: حطّي الصور بـ public/images/projects/ — لو الصورة مش موجودة بيظهر مكانها شكل افتراضي
// phase: before | during | after، by: craftsman | contractor
export const PROJECT_PHOTOS = [
    { id: "ph1", image: "/images/projects/1.jpg", phase: "during", date: "10/11/2026", by: "craftsman", approved: true },
    { id: "ph2", image: "/images/projects/2.jpg", phase: "during", date: "28/10/2024", by: "contractor", approved: true },
    { id: "ph3", image: "/images/projects/3.jpg", phase: "before", date: "15/10/2024", by: "craftsman", approved: true },
];

// url: رابط الملف من السيرفر (فاضي بالبيانات التجريبية فزر التحميل معطّل)
export const PROJECT_FILES = [
    { id: "f1", size: "2.4 MB", url: "" },
    { id: "f2", size: "1.1 MB", url: "" },
];

// المرحلة الحالية حسب حالة المشروع (5 = كل المراحل مكتملة)
export const STAGE_BY_STATUS = { pending: 1, executing: 3, completed: 5 };

// قائمة التحقق قبل بدء التنفيذ (صفحة تفاصيل المشروع) — اعتماد البدء ما بيصير إلا لما تكتمل كلها
// ⚠️ تجريبية؛ الحالة بتنتقل بين صفحة المشروع وصفحة مراجعة الطلب عن طريق navigation state
export const START_CHECKLIST = [
    { id: "team", done: true },
    { id: "site", done: true },
    { id: "plan", done: true },
    { id: "materials", done: false },
    { id: "kickoff", done: false },
];
export const defaultStartChecks = () => Object.fromEntries(START_CHECKLIST.map((c) => [c.id, c.done]));

// ===== مشاريع من عروض مقبولة =====
// ⚠️ لحد ما يصير في endpoint: قبول عرض متقدم (صفحة تفاصيل العرض) بيضيف مشروع هون،
// محفوظ بالمتصفح عشان يظهر بصفحة المشاريع الجارية، وبيفتح على مرحلة "بدء التنفيذ"
const ACCEPTED_KEY = "sanaa.institution.acceptedProjects";

export function getAcceptedProjects() {
    try {
        const list = JSON.parse(localStorage.getItem(ACCEPTED_KEY) || "[]");
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
}

function saveAcceptedProjects(list) {
    try {
        localStorage.setItem(ACCEPTED_KEY, JSON.stringify(list));
    } catch {
        // التخزين مش متاح (وضع خاص مثلاً) — بنتجاهل
    }
}

export function addAcceptedProject(project) {
    saveAcceptedProjects([project, ...getAcceptedProjects().filter((p) => p.id !== project.id)]);
}

export function removeAcceptedProject(id) {
    saveAcceptedProjects(getAcceptedProjects().filter((p) => p.id !== id));
}

/** كل المشاريع: المقبولة حديثاً أول، وبعدها التجريبية */
export const allProjects = () => [...getAcceptedProjects(), ...PROJECTS];

// العنوان والمزوّد: المقبولة فيها النص نفسه، والتجريبية من ملف الترجمة
export const projectTitle = (p, t) => p.title || t(`projectsPage.sample.${p.id}.title`);
export const projectProvider = (p, t) => p.provider || t(`projectsPage.sample.${p.id}.provider`);
