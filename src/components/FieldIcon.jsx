import React from "react";
import { Briefcase, Eye, EyeOff, IdCard, Mail, Paperclip, UserRound } from "lucide-react";

// أيقونات الحقول بخط رفيع موحّد (نفس سمك أيقونة الموقع)
const ICONS = {
    "fa-user": UserRound,
    "fa-envelope": Mail,
    "fa-eye": Eye,
    "fa-eye-slash": EyeOff,
    "fa-id-card": IdCard,
    "fa-briefcase": Briefcase,
    "fa-paperclip": Paperclip,
};

/**
 * بتستقبل اسم أيقونة Font Awesome (مثل "fa-regular fa-user") وبترجع أيقونة lucide خطية مقابلة.
 * لو الأيقونة مش بالقائمة بترجع <i> العادية.
 */
export default function FieldIcon({ icon, className = "" }) {
    const name = icon.split(" ").find((c) => ICONS[c]);
    const Icon = name && ICONS[name];
    if (!Icon) return <i aria-hidden="true" className={`${icon} text-[18px] ${className}`}></i>;
    return <Icon aria-hidden="true" size={18} strokeWidth={1.6} className={className} />;
}
