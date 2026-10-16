import React from "react";
import { useTranslation } from "react-i18next";
import SelectField from "./SelectField";
import { useGovernorates, useAreas } from "../hooks/useReferenceData";

/**
 * المحافظة + المنطقة من الباك إند (governorate_id / area_id).
 * المناطق بتنحمّل حسب المحافظة المختارة، وتغيير المحافظة بيفضّي المنطقة.
 */
const LocationPinIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

export default function LocationFields({
    governorateId,
    areaId,
    onGovernorateChange,
    onAreaChange,
    governorateError,
    areaError,
    className = "mb-4",
}) {
    const { t } = useTranslation("signupCommon");
    const governorates = useGovernorates();
    const areas = useAreas(governorateId);

    return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
            <SelectField
                label={t("city")}
                id="city"
                icon={LocationPinIcon}
                placeholder={governorates.loading ? t("loadingOptions") : t("cityPlaceholder")}
                value={governorateId}
                onChange={(e) => {
                    onGovernorateChange(e.target.value);
                    onAreaChange("");
                }}
                error={governorateError}
                accentColor="#4B9AD2"
                options={governorates.options}
            />

            <SelectField
                label={t("area")}
                id="area"
                icon={LocationPinIcon}
                placeholder={areas.loading ? t("loadingOptions") : t("areaPlaceholder")}
                value={areaId}
                onChange={(e) => onAreaChange(e.target.value)}
                error={areaError}
                accentColor="#4B9AD2"
                options={areas.options}
                disabled={!governorateId}
            />
        </div>
    );
}
