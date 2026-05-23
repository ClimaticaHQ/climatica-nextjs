import { useTranslation } from "react-i18next";

export function AridityLegend() {
  const { t } = useTranslation();
  return (
    <div className="mt-2 flex justify-center gap-6 text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block h-3 w-3 rounded-sm"
          style={{ backgroundColor: "var(--chart-arid)" }}
        />
        {t("chart.aridPeriod")}
      </span>
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block h-3 w-3 rounded-sm"
          style={{ backgroundColor: "var(--chart-humid)" }}
        />
        {t("chart.humidPeriod")}
      </span>
    </div>
  );
}
