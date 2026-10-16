// ===== بيانات تجريبية =====
// الباك إند لسا ما فيه endpoints للمشاريع. لما تجهز، استبدلي PROJECTS بطلب من src/api/endpoints.js
// النصوص (العنوان، المزوّد، الموقع، التواريخ...) بملف الترجمة: projectsPage.sample و projectDetails.sample
export const PROJECTS = [
    { id: "p1", status: "executing", progress: 75, value: 11200 },
    { id: "p2", status: "completed", progress: 100, value: 11200 },
    { id: "p3", status: "pending", progress: 75, value: 11200 },
    { id: "p4", status: "executing", progress: 40, value: 8500 },
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
