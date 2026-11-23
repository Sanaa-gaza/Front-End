import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Crosshair, Loader2, MapPin, Search, X } from "lucide-react";

// مركز افتراضي: قطاع غزة
const DEFAULT_CENTER = [31.4167, 34.3333];
const DEFAULT_ZOOM = 10;
const PICKED_ZOOM = 16;
// OpenStreetMap: مجاني ومن غير مفتاح — Nominatim للبحث والعنوان
const TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const NOMINATIM = "https://nominatim.openstreetmap.org";

// دبوس بـ HTML بدل صورة leaflet الافتراضية (صورتها بتضيع مع vite)
const pinIcon = L.divIcon({
    className: "",
    html: `<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg"><path d="M17 1C8.2 1 1 8 1 16.8 1 28.5 17 43 17 43s16-14.5 16-26.2C33 8 25.8 1 17 1Z" fill="#2B95DA" stroke="#fff" stroke-width="2"/><circle cx="17" cy="16.5" r="6" fill="#fff"/></svg>`,
    iconSize: [34, 44],
    iconAnchor: [17, 43],
});

/**
 * خريطة Leaflet. interactive=false للمعاينة الصغيرة (من غير سحب أو زوم).
 * value: { lat, lng } أو null — onPick بيتنادى لما ينضغط على الخريطة.
 */
function LeafletMap({ value, onPick, interactive = true, className = "" }) {
    const boxRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const pickRef = useRef(onPick);
    pickRef.current = onPick;

    useEffect(() => {
        const map = L.map(boxRef.current, {
            zoomControl: interactive,
            dragging: interactive,
            scrollWheelZoom: interactive,
            doubleClickZoom: interactive,
            touchZoom: interactive,
            boxZoom: false,
            keyboard: interactive,
            attributionControl: interactive,
        }).setView(value ? [value.lat, value.lng] : DEFAULT_CENTER, value ? PICKED_ZOOM : DEFAULT_ZOOM);
        L.tileLayer(TILES, { maxZoom: 19, attribution: "&copy; OpenStreetMap" }).addTo(map);
        if (interactive) map.on("click", (e) => pickRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng }));
        mapRef.current = map;
        // النافذة بتنفتح بحركة، فبنعيد حساب الحجم بعدها
        const id = setTimeout(() => map.invalidateSize(), 120);
        return () => {
            clearTimeout(id);
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
        // الخريطة بتنعمل مرة وحدة؛ تحديث الدبوس بالـ effect الثاني
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        if (!value) {
            markerRef.current?.remove();
            markerRef.current = null;
            return;
        }
        const pos = [value.lat, value.lng];
        if (markerRef.current) markerRef.current.setLatLng(pos);
        else markerRef.current = L.marker(pos, { icon: pinIcon, interactive: false }).addTo(map);
        map.setView(pos, Math.max(map.getZoom(), interactive ? PICKED_ZOOM : 15), { animate: interactive });
    }, [value, interactive]);

    // dir=ltr: leaflet ما بيدعم الاتجاه العكسي؛ isolate عشان طبقاتها ما تطلع فوق باقي الصفحة
    return <div ref={boxRef} dir="ltr" className={`isolate ${className}`} />;
}

/** نافذة اختيار الموقع: بحث + ضغط على الخريطة + موقعي الحالي */
function PickerModal({ initial, onClose, onConfirm }) {
    const { t, i18n } = useTranslation("dashboard");
    const [point, setPoint] = useState(initial);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    // "" | "searching" | "noResults" | "searchFailed" | "locating" | "denied" | "failed"
    const [status, setStatus] = useState("");
    const [resolving, setResolving] = useState(false);
    const lang = i18n.language;

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    // العنوان من الإحداثيات (لما يجي من ضغطة أو موقعي)
    useEffect(() => {
        if (!point || point.label) return undefined;
        const ctrl = new AbortController();
        setResolving(true);
        fetch(`${NOMINATIM}/reverse?format=json&lat=${point.lat}&lon=${point.lng}&zoom=17&accept-language=${lang}`, { signal: ctrl.signal })
            .then((r) => r.json())
            .then((data) => setPoint((p) => (p && p.lat === point.lat && p.lng === point.lng ? { ...p, label: data.display_name || "" } : p)))
            .catch(() => {})
            .finally(() => setResolving(false));
        return () => ctrl.abort();
    }, [point, lang]);

    const search = async () => {
        const q = query.trim();
        if (!q) return;
        setStatus("searching");
        setResults([]);
        try {
            const r = await fetch(`${NOMINATIM}/search?format=json&limit=5&accept-language=${lang}&q=${encodeURIComponent(q)}`);
            const data = await r.json();
            setResults(data);
            setStatus(data.length ? "" : "noResults");
        } catch {
            setStatus("searchFailed");
        }
    };

    const useMyLocation = () => {
        if (!navigator.geolocation) {
            setStatus("failed");
            return;
        }
        setStatus("locating");
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                setPoint({ lat: coords.latitude, lng: coords.longitude });
                setStatus("");
            },
            (err) => setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "failed"),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div aria-hidden="true" onClick={onClose} className="dim-backdrop absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="map-picker-title"
                className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[760px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.25)]"
            >
                <div className="flex items-center gap-4 border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E3EFFA] text-[#3D8BC9]">
                        <MapPin size={20} strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h2 id="map-picker-title" className="text-[18px] font-semibold text-[#1E293B]">
                            {t("mapPicker.title")}
                        </h2>
                        <p className="mt-0.5 text-[12px] text-[#64748B]">{t("mapPicker.subtitle")}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t("mapPicker.close")}
                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#64748B] transition-colors hover:bg-[#F1F5F9]"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col gap-3 overflow-y-auto px-6 py-5">
                    {/* البحث */}
                    <div className="relative">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    name="map_search"
                                    type="search"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            search();
                                        }
                                    }}
                                    aria-label={t("mapPicker.search")}
                                    placeholder={t("mapPicker.search")}
                                    className="h-11 w-full rounded-xl border border-[#DDDDDD] bg-white pe-10 ps-4 text-[13px] text-[#1E293B] outline-none placeholder:text-[#94A3B8] focus:border-[#4B9AD2] [&::-webkit-search-cancel-button]:hidden"
                                />
                                <Search size={17} className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                            </div>
                            <button
                                type="button"
                                onClick={search}
                                disabled={!query.trim() || status === "searching"}
                                className="h-11 shrink-0 cursor-pointer rounded-xl bg-[#4B9AD2] px-5 text-[13px] font-semibold text-white btn-wipe disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {t("mapPicker.searchBtn")}
                            </button>
                            <button
                                type="button"
                                onClick={useMyLocation}
                                disabled={status === "locating"}
                                title={t("mapPicker.myLocation")}
                                aria-label={t("mapPicker.myLocation")}
                                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#C7E0F1] text-[#3D8BC9] transition-colors hover:bg-[#F3F8FD] disabled:cursor-wait"
                            >
                                {status === "locating" ? <Loader2 size={17} className="animate-spin" /> : <Crosshair size={17} />}
                            </button>
                        </div>
                        {results.length > 0 && (
                            <ul className="absolute inset-x-0 top-full z-[1100] mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-[#DDDDDD] bg-white p-1.5 shadow-[0_10px_30px_rgba(35,74,100,0.14)]">
                                {results.map((r) => (
                                    <li key={r.place_id}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPoint({ lat: Number(r.lat), lng: Number(r.lon), label: r.display_name });
                                                setResults([]);
                                            }}
                                            className="flex w-full cursor-pointer items-start gap-2 rounded-lg px-3 py-2 text-start text-[12px] leading-[1.7] text-[#334155] hover:bg-[#F3F8FD]"
                                        >
                                            <MapPin size={14} className="mt-1 shrink-0 text-[#4B9AD2]" />
                                            {r.display_name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {status && status !== "searching" && status !== "locating" && (
                        <p role="alert" className="text-[11px] text-red-500">{t(`mapPicker.errors.${status}`)}</p>
                    )}

                    <LeafletMap value={point} onPick={setPoint} className="h-[340px] w-full overflow-hidden rounded-xl border border-[#E2E8F0]" />
                    <p className="text-[11px] text-[#94A3B8]">{t("mapPicker.hint")}</p>
                </div>

                <div className="flex flex-col gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="min-w-0 text-[12px] text-[#475569]">
                        {point ? (
                            <span className="flex items-start gap-1.5">
                                <MapPin size={14} className="mt-0.5 shrink-0 text-[#4B9AD2]" />
                                <span className="line-clamp-2">
                                    {resolving && !point.label ? t("mapPicker.resolving") : point.label || `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`}
                                </span>
                            </span>
                        ) : (
                            t("mapPicker.none")
                        )}
                    </p>
                    <div className="flex shrink-0 justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-11 min-w-[100px] cursor-pointer rounded-xl border border-[#DDDDDD] bg-white px-6 text-[14px] font-medium text-[#334155] transition-colors hover:bg-[#F1F5F9]"
                        >
                            {t("mapPicker.cancel")}
                        </button>
                        <button
                            type="button"
                            disabled={!point}
                            onClick={() => onConfirm(point)}
                            className="h-11 cursor-pointer rounded-xl bg-[#4B9AD2] px-6 text-[14px] font-semibold text-white btn-wipe disabled:cursor-not-allowed disabled:bg-[#DCE6EF] disabled:text-[#94A3B8]"
                        >
                            {t("mapPicker.confirm")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * خانة "تحديد الموقع على الخريطة": معاينة صغيرة + العنوان المختار، والضغط بيفتح نافذة اختيار بخريطة حقيقية.
 * value: { lat, lng, label } أو null
 */
export default function MapPicker({ id, value, onChange, invalid }) {
    const { t } = useTranslation("dashboard");
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-start ${invalid ? "border-red-400" : "border-[#DDDDDD]"}`}>
                <div className="min-w-0 flex-1">
                    {value ? (
                        <>
                            <p className="flex items-start gap-1.5 text-[13px] font-medium text-[#1E293B]">
                                <MapPin size={15} className="mt-0.5 shrink-0 text-[#4B9AD2]" />
                                <span className="line-clamp-2">{value.label || `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`}</span>
                            </p>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
                                <button id={id} type="button" onClick={() => setOpen(true)} className="cursor-pointer font-semibold text-[#4B9AD2] hover:underline">
                                    {t("mapPicker.change")}
                                </button>
                                <a
                                    href={`https://www.openstreetmap.org/?mlat=${value.lat}&mlon=${value.lng}#map=17/${value.lat}/${value.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-[#64748B] hover:underline"
                                >
                                    {t("mapPicker.open")}
                                </a>
                                <button type="button" onClick={() => onChange(null)} className="cursor-pointer font-semibold text-[#DC2626] hover:underline">
                                    {t("mapPicker.remove")}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <button
                                id={id}
                                type="button"
                                onClick={() => setOpen(true)}
                                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-[#EEF5FC] px-4 text-[12px] font-semibold text-[#3D8BC9] transition-colors hover:bg-[#E3EFFA]"
                            >
                                <MapPin size={14} />
                                {t("mapPicker.pick")}
                            </button>
                        </>
                    )}
                </div>
                {/* المعاينة: الضغط عليها بيفتح نافذة الاختيار */}
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-label={t("mapPicker.pick")}
                    className="relative h-[90px] w-full shrink-0 cursor-pointer overflow-hidden rounded-xl border border-[#E2E8F0] sm:w-[230px]"
                >
                    <LeafletMap key={value ? `${value.lat},${value.lng}` : "empty"} value={value} interactive={false} className="pointer-events-none h-full w-full" />
                </button>
            </div>

            {open && (
                <PickerModal
                    initial={value}
                    onClose={() => setOpen(false)}
                    onConfirm={(p) => {
                        onChange(p);
                        setOpen(false);
                    }}
                />
            )}
        </>
    );
}
