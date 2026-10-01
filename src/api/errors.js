/**
 * يحوّل خطأ axios لشكل سهل الاستخدام بالفورم:
 *   message → الرسالة العامة من السيرفر (أو null إذا مشكلة اتصال)
 *   fields  → { backend_field: "أول رسالة خطأ" }
 *   status  → كود HTTP
 *   data    → data المرفقة بالخطأ (مثل requires_verification)
 */
export function parseApiError(error) {
    const res = error?.response;
    if (!res) return { status: 0, message: null, fields: {}, data: null };

    const fields = {};
    const rawErrors = res.data?.errors;
    if (rawErrors && !Array.isArray(rawErrors)) {
        Object.entries(rawErrors).forEach(([key, msgs]) => {
            fields[key] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
    }

    return {
        status: res.status,
        message: res.data?.message || null,
        fields,
        data: res.data?.data ?? null,
    };
}

/**
 * يحوّل أخطاء السيرفر لأسماء حقول الفورم.
 * القيمة بتنحفظ { server: "رسالة" } عشان نفرّقها عن أكواد الترجمة.
 * map: { backend_field: "formField" }
 * بيرجع { mapped, unmapped } — unmapped رسائل حقول مش موجودة بهاي الصفحة.
 */
export function mapServerErrors(fields, map) {
    const mapped = {};
    const unmapped = [];
    Object.entries(fields).forEach(([key, msg]) => {
        if (map[key]) mapped[map[key]] = { server: msg };
        else unmapped.push(msg);
    });
    return { mapped, unmapped };
}

/**
 * يترجم خطأ الحقل: كود ترجمة (نص) أو رسالة سيرفر جاهزة ({ server }).
 */
export function errorText(t, code, ns = "") {
    if (!code) return "";
    if (typeof code === "object") return code.server;
    return t(ns ? `${ns}:${code}` : code);
}
