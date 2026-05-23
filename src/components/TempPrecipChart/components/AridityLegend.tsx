import { useTranslation } from "react-i18next";
import { CHART_COLORS } from "../TempPrecipChart.constant";

export function AridityLegend() {
  const { t } = useTranslation();
  return (
    <div className="mt-2 flex justify-center gap-6 text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block h-3 w-3 rounded-sm"
          style={{ backgroundColor: CHART_COLORS.arid }}
        />
        {t("chart.aridPeriod")}
      </span>
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block h-3 w-3 rounded-sm"
          style={{ backgroundColor: CHART_COLORS.humid }}
        />
        {t("chart.humidPeriod")}
      </span>
    </div>
  );
}
