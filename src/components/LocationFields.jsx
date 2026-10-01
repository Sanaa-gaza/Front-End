import React from "react";
import { useTranslation } from "react-i18next";
import SelectField from "./SelectField";
import { useGovernorates, useAreas } from "../hooks/useReferenceData";

/**
 * المحافظة + المنطقة من الباك إند (governorate_id / area_id).
 * المناطق بتنحمّل حسب المحافظة المختارة، وتغيير المحافظة بيفضّي المنطقة.
 */
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
                icon="fa-solid fa-location-dot"
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
                icon="fa-solid fa-location-dot"
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
