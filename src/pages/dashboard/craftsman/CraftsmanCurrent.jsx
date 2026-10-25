import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, CircleCheck, CircleX, Clock, Search } from "lucide-react";

// ===== بيانات تجريبية =====
// ما في endpoint بالسيرفر للأعمال الجارية بحالاتها (الأقرب GET /service-requests + complete بـ src/api/endpoints.js).
// لما يضيفها الباك إند، استبدلي WORKS بالبيانات الحقيقية.
// source: customer (طلب عميل) | institution (مناقصة مؤسسة)
// status: awaitingPayment (بانتظار الدفع) → scheduled (المبلغ محجوز، التنفيذ لسا ما بدأ) → accepted (التنفيذ شغّال)
//         → awaitingConfirm (بانتظار تأكيد العميل/المؤسسة) | cancelled
// amount: المبلغ بالشيكل، distance: بالكيلومتر، budget: الميزانية المتوقعة [أقل، أعلى] (بتظهر بصفحة التفاصيل)
// مشاريع المؤسسات: tender رقم المناقصة، start تاريخ البدء، days مدة التنفيذ بالأيام
// ⚠️ موعد بدء تجريبي بعد يوم و14 ساعة و20 دقيقة من فتح الصفحة (عشان يبيّن العدّاد)
const SAMPLE_START = new Date(Date.now() + ((24 + 14) * 60 + 20) * 60000).toISOString();
// ⚠️ مشروع قيد التنفيذ بلّش اليوم الساعة 8 الصبح
const TODAY_START = (() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 8).toISOString();
})();

export const WORKS = [
    { id: "w1", source: "customer", status: "accepted", amount: 70, distance: 1.2, budget: [50, 80] },
    { id: "w2", source: "customer", status: "awaitingPayment", amount: 120, distance: 2.4, budget: [100, 150] },
    { id: "w3", source: "customer", status: "awaitingConfirm", amount: 90, distance: 1.8, budget: [70, 110] },
    { id: "w4", source: "institution", status: "awaitingPayment", amount: 1200, distance: 4.1, budget: [1000, 1400], tender: "T-2026-031", start: "2026-10-17", days: 7 },
    { id: "w5", source: "institution", status: "scheduled", amount: 2800, distance: 6.5, budget: [2500, 3200], tender: "T-2026-027", start: SAMPLE_START, days: 7 },
    { id: "w7", source: "institution", status: "accepted", amount: 1200, distance: 3.2, budget: [1000, 1400], tender: "T-2026-031", start: TODAY_START, days: 7 },
    { id: "w6", source: "customer", status: "cancelled", amount: 150, distance: 9, budget: [120, 180] },
];

const TABS = ["all", "customer", "institution", "cancelled"];

// ألوان كل حالة: الشارة أعلى البطاقة + الشريط تحت (الإطار فاتح والنص غامق)
const STATUS = {
    accepted: { badge: "bg-[#E6F9EC] text-[#03C03C]", bar: "border-[#A5FFC9] bg-[#A5FFC9]/25 text-[#03C03C]", icon: CircleCheck },
    scheduled: { badge: "bg-[#E6F9EC] text-[#03C03C]", bar: "border-[#A5FFC9] bg-[#A5FFC9]/25 text-[#03C03C]", icon: CircleCheck },
    awaitingPayment: { badge: "bg-[#FFEFB0]/60 text-[#A86A4E]", bar: "border-[#FFEFB0] bg-[#FFEFB0]/45 text-[#A86A4E]", icon: Clock },
    awaitingConfirm: { badge: "bg-[#C7E0F1]/50 text-[#4B9AD2]", bar: "border-[#C7E0F1] bg-[#C7E0F1]/35 text-[#4B9AD2]", icon: Clock },
    cancelled: { badge: "bg-[#F4F4F4] text-[#919191]", bar: "border-[#E4E4E4] bg-[#F4F4F4] text-[#919191]", icon: CircleX },
};

const box = "rounded-[20px] border border-[#0000001A] bg-white";

/** بطاقة عمل: صاحب الطلب + العنوان + شارة الحالة، وتحتها شريط الحالة */
function WorkCard({ work }) {
    const { t } = useTranslation("craftsmanDashboard");
    const s = `currentPage.works.${work.id}`;
    // الطلب اللي انقبل من صفحة الطلبات بييجي بنصوصه، والباقي من ملف الترجمة
    const text = (key) => work[key] || t(`${s}.${key}`);
    const owner = text("owner");
    const { badge, bar, icon: Icon } = STATUS[work.status];
    // الشريط رابط لتفاصيل الطلب (ومنها "تم إنجاز العمل")، والملغاة بدون إجراء
    const linked = work.status !== "cancelled";
    const BarTag = linked ? Link : "div";
    const barProps = linked ? { to: `/dashboard/craftsman/current/${work.id}`, state: { work } } : {};

    return (
        <li className={`${box} p-4 sm:p-5`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 border-[#EEF5FC] bg-white text-[13px] font-bold text-[#4B9AD2]">
                        {owner.trim().charAt(0)}
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-[15px] font-bold text-[#1E293B]">{text("title")}</h2>
                        <p className="mt-1 text-[11px] text-[#475569]">
                            {owner} | {text("place")}
                        </p>
                    </div>
                </div>
                <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-medium ${badge}`}>
                    {t(`currentPage.statuses.${work.status}`)}
                </span>
            </div>

            <BarTag
                {...barProps}
                className={`mt-4 flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-start text-[12px] font-semibold ${bar} ${linked ? "cursor-pointer transition-opacity hover:opacity-80" : ""}`}
            >
                <span className="flex items-center gap-2">
                    <Icon size={16} className="shrink-0" />
                    {t(`currentPage.bars.${work.status}`)}
                </span>
                <ChevronLeft size={16} className="shrink-0 ltr:rotate-180" />
            </BarTag>
        </li>
    );
}

/** صفحة "الأعمال الجارية" للحرفي: بحث + فلترة (عميل / مؤسسة / ملغاة) */
export default function CraftsmanCurrent() {
    const { t } = useTranslation("craftsmanDashboard");
    const navigate = useNavigate();
    const { state, pathname } = useLocation();
    const accepted = state?.accepted;
    const [query, setQuery] = useState("");
    const [tab, setTab] = useState("all");
    // الطلب اللي انقبل للتو من صفحة الطلبات بيظهر بأول القائمة "بانتظار الدفع"
    const [works] = useState(() =>
        accepted ? [{ ...accepted, id: `new-${accepted.id}`, source: "customer", status: "awaitingPayment" }, ...WORKS] : WORKS
    );
    const [flash, setFlash] = useState("");
    // رسالة "تم قبول الطلب" فوق، بتختفي لحالها
    const [toast, setToast] = useState(accepted ? t("currentPage.acceptedToast") : "");

    useEffect(() => {
        if (!accepted) return undefined;
        // بنمسح الـ state عشان الرسالة ما ترجع مع تحديث الصفحة
        navigate(pathname, { replace: true, state: null });
        const id = setTimeout(() => setToast(""), 4000);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const q = query.trim().toLowerCase();
    const visible = works.filter((w) => {
        if (tab === "cancelled" ? w.status !== "cancelled" : tab !== "all" && w.source !== tab) return false;
        if (!q) return true;
        const s = `currentPage.works.${w.id}`;
        return [w.title || t(`${s}.title`), w.owner || t(`${s}.owner`), w.place || t(`${s}.place`)].join(" ").toLowerCase().includes(q);
    });

    return (
        <div className="mx-auto flex max-w-[1000px] flex-col gap-5">
            {toast && (
                <p
                    role="status"
                    className="fixed left-1/2 top-[84px] z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#1B7F3B] px-7 py-3 text-[12px] font-semibold text-white shadow-[0_10px_24px_rgba(27,127,59,0.3)]"
                >
                    <CircleCheck size={15} />
                    {toast}
                </p>
            )}

            <h1 className="text-[24px] font-bold text-[#22455E]">{t("nav.current")}</h1>

            <div className="relative">
                <Search size={15} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[#A9B3BB]" />
                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("currentPage.search")}
                    aria-label={t("currentPage.search")}
                    className="h-12 w-full rounded-2xl border border-[#0000001A] bg-white pe-4 ps-11 text-[13px] text-[#414141] outline-none transition-colors placeholder:text-[#A9B3BB] focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2] [&::-webkit-search-cancel-button]:hidden"
                />
            </div>

            <div role="tablist" className="flex flex-wrap gap-2">
                {TABS.map((key) => {
                    const active = tab === key;
                    return (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => {
                                setTab(key);
                                setFlash("");
                            }}
                            className={`h-9 min-w-[56px] cursor-pointer rounded-full border px-4 text-[12px] transition-colors ${active
                                ? "min-w-[72px] border-[#4B9AD2] bg-[#4B9AD2] font-semibold text-white"
                                : "border-[#0000001A] bg-white text-[#475569] hover:border-[#8EC0E4] hover:text-[#4B9AD2]"
                                }`}
                        >
                            {t(`currentPage.filters.${key}`)}
                        </button>
                    );
                })}
            </div>

            {flash && (
                <p role="status" className="rounded-xl border border-[#BFEBCD] bg-[#E8F8EE] px-4 py-3 text-[13px] text-[#2E9E5B]">
                    {flash}
                </p>
            )}

            {visible.length ? (
                <ul className="flex flex-col gap-4">
                    {visible.map((w) => (
                        <WorkCard key={w.id} work={w} />
                    ))}
                </ul>
            ) : (
                <p className={`${box} px-6 py-12 text-center text-[13px] text-[#89949D]`}>{t("currentPage.empty")}</p>
            )}
        </div>
    );
}
