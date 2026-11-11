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

// لو الطلب فشل (السيرفر بطيء أو نايم) بنعيد المحاولة كم مرة قبل ما نستسلم
const RETRIES = 4;
const RETRY_DELAY = 3000;

function useList(key, fetcher) {
    // بنحفظ النتيجة مع مفتاحها، فلو المفتاح تغيّر بنعرف إن البيانات قديمة
    const [result, setResult] = useState({ key: null, items: [] });
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        setAttempt(0);
    }, [key]);

    useEffect(() => {
        if (!key) return;
        let active = true;
        let timer;
        cached(key, fetcher)
            .then((data) => active && setResult({ key, items: data }))
            .catch(() => {
                if (!active) return;
                if (attempt < RETRIES) timer = setTimeout(() => active && setAttempt((n) => n + 1), RETRY_DELAY);
                else setResult({ key, items: [] });
            });
        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [key, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

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
