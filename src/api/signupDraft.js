/**
 * كلمة المرور بين خطوات التسجيل بتنحفظ بالذاكرة فقط (مش sessionStorage)
 * عشان ما تنكتب على الجهاز. لو المستخدم عمل refresh بترجع للخطوة الأولى.
 */
let draftPassword = "";

export const setDraftPassword = (value) => {
    draftPassword = value;
};

export const getDraftPassword = () => draftPassword;

export const clearDraftPassword = () => {
    draftPassword = "";
};
