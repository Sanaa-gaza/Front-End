import { useEffect, useState } from "react";
import { getGovernorates, getAreas, getServices } from "../api/endpoints";

// كاش بسيط عشان ما نعيد نفس الطلب كل ما تنفتح صفحة
const cache = new Map();

function cached(key, fetcher) {
    if (!cache.has(key)) {
        cache.set(
            key,
            fetcher().catch((err) => {
                cache.delete(key);
                throw err;
            })
        );
    }
    return cache.get(key);
}

function useList(key, fetcher) {
    // بنحفظ النتيجة مع مفتاحها، فلو المفتاح تغيّر بنعرف إن البيانات قديمة
    const [result, setResult] = useState({ key: null, items: [] });

    useEffect(() => {
        if (!key) return;
        let active = true;
        cached(key, fetcher)
            .then((data) => active && setResult({ key, items: data }))
            .catch(() => active && setResult({ key, items: [] }));
        return () => {
            active = false;
        };
    }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

    const items = result.key === key ? result.items : [];
    const loading = Boolean(key) && result.key !== key;

    // بصيغة options جاهزة لـ SelectField
    const options = items.map((item) => ({ value: String(item.id), label: item.name }));
    return { items, options, loading };
}

export const useGovernorates = () => useList("governorates", getGovernorates);
export const useAreas = (governorateId) =>
    useList(governorateId ? `areas-${governorateId}` : null, () => getAreas(governorateId));
export const useServices = () => useList("services", getServices);
