import { createLucideIcon } from "lucide-react";

// أيقونات القائمة الجانبية اللي مش موجودة بمكتبة lucide بنفس شكل التصميم

// مربع جواه خط صاعد (إدارة المناقصات)
export const SquareTrendingUp = createLucideIcon("square-trending-up", [
    ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "4", key: "sq" }],
    ["path", { d: "m7.5 14.5 3-3 2 2 4-4", key: "line" }],
    ["path", { d: "M14 9.5h2.5V12", key: "arrow" }],
]);

// مستندين فوق بعض (صاحب المشروع)
export const DocumentsStack = createLucideIcon("documents-stack", [
    ["path", { d: "M8 6V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-1", key: "back" }],
    ["rect", { width: "11", height: "15", x: "4", y: "6", rx: "2", key: "front" }],
    ["path", { d: "M7.5 10.5h4", key: "l1" }],
    ["path", { d: "M7.5 14h4", key: "l2" }],
    ["path", { d: "M8.5 17.5h2", key: "l3" }],
]);

// شخص داخل شارة (الجهة المنفذة)
export const UserBadge = createLucideIcon("user-badge", [
    ["path", { d: "M7 3h10a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-2.5L12 21l-2.5-3H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z", key: "badge" }],
    ["circle", { cx: "12", cy: "8.5", r: "2.2", key: "head" }],
    ["path", { d: "M8.5 15c0-1.9 1.6-3.2 3.5-3.2s3.5 1.3 3.5 3.2", key: "body" }],
]);

// معرض صور: صورة فوق صورة (توثيق التنفيذ)
export const PhotoLibrary = createLucideIcon("photo-library", [
    ["rect", { width: "14", height: "14", x: "7", y: "3", rx: "2", key: "front" }],
    ["path", { d: "M3 7v12a2 2 0 0 0 2 2h12", key: "back" }],
    ["path", { d: "m9.5 14 3-3.5 2 2.5 1.5-1.5 2.5 2.5Z", key: "mount", fill: "currentColor" }],
]);

// لوح ورق بسطرين (المشاريع الجارية / المراسلات)
export const ClipboardLines = createLucideIcon("clipboard-lines", [
    ["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", key: "clip" }],
    ["path", { d: "M16 4h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1", key: "board" }],
    ["path", { d: "M9 12h6", key: "l1" }],
    ["path", { d: "M9 16h6", key: "l2" }],
]);
