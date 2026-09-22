/**
 * دوال تحقق مشتركة — بدل ما تتكرر نفس الـ regex والشروط بكل صفحة فورم،
 * كل الصفحات بتستدعي هاي الدوال. تغيير واحد هون بينعكس على كل المشروع.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PALESTINE_PHONE_PATTERN = /^(59|56)\d{7}$/;

/** يتحقق من صحة صيغة البريد الإلكتروني */
export function isValidEmail(value) {
    return EMAIL_PATTERN.test(value.trim());
}

/** يتحقق من رقم جوال فلسطيني (يبدأ بـ 59 أو 56، 9 أرقام) بعد إزالة المسافات */
export function isValidPalestinePhone(value) {
    return PALESTINE_PHONE_PATTERN.test(cleanPhone(value));
}

/** يشيل كل المسافات من رقم الهاتف قبل التحقق أو الحفظ */
export function cleanPhone(value) {
    return value.trim().replace(/\s+/g, "");
}

/** يتحقق من طول كلمة المرور الأدنى (8 أحرف افتراضياً) */
export function isValidPassword(value, minLength = 8) {
    return value.length >= minLength;
}

/**
 * دوال getXError بترجع "كود خطأ" (مش نص مترجم جاهز) عشان الصفحة تترجمه
 * وقت العرض (render) مش وقت الـ submit — كده لو المستخدم بدّل اللغة بعد
 * ما ظهرت رسالة خطأ، هي بتتحدث لنفس اللحظة بدل ما تفضل عالقة باللغة
 * القديمة. راجعي signupCommon.json (ar/en) للنصوص المقابلة لكل كود.
 */

/** يرجع كود خطأ الإيميل المناسب، أو نص فاضي إذا سليم */
export function getEmailError(value) {
    if (!value.trim()) return "emailRequired";
    if (!isValidEmail(value)) return "emailInvalid";
    return "";
}

/** يرجع كود خطأ الهاتف المناسب، أو نص فاضي إذا سليم */
export function getPhoneError(value) {
    const cleaned = cleanPhone(value);
    if (!cleaned) return "phoneRequired";
    if (!isValidPalestinePhone(value)) return "phoneInvalid";
    return "";
}

export function getPasswordError(value) {
    if (!value) return "passwordRequired";
    if (!meetsAllPasswordRequirements(value)) return "passwordWeak";
    return "";
}

/** يرجع كود خطأ تأكيد كلمة المرور، أو نص فاضي إذا متطابقة */
export function getConfirmPasswordError(confirmValue, passwordValue) {
    if (!confirmValue) return "confirmPasswordRequired";
    if (confirmValue !== passwordValue) return "passwordMismatch";
    return "";
}

/** يرجع كود الخطأ الممرَّر (اسم مفتاح ترجمة) لحقل نصي عام إذا كان فاضي */
export function getRequiredError(value, code = "fieldRequired") {
    return value.trim() ? "" : code;
}

/**
 * يرجع حالة كل شرط من شروط كلمة المرور القوية (طول، أحرف، أرقام، رموز خاصة)
 * تستخدمها صفحة تغيير كلمة المرور لعرض قائمة شروط حية أثناء الكتابة.
 */
export function passwordRequirements(value) {
    return {
        hasLength: value.length >= 8,
        hasLetter: /[a-zA-Z]/.test(value),
        hasNumber: /[0-9]/.test(value),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-]/.test(value),
    };
}

/** يتحقق إذا كلمة المرور القوية تحقق كل الشروط الأربعة مع بعض */
export function meetsAllPasswordRequirements(value) {
    const { hasLength, hasLetter, hasNumber, hasSpecial } = passwordRequirements(value);
    return hasLength && hasLetter && hasNumber && hasSpecial;
}