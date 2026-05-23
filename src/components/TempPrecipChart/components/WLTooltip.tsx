import { MONTH_NAMES } from "@/constants";
import { useTranslation } from "react-i18next";
import type { TWLTooltipProps } from "../TempPrecipChart.type";
import { CHART_COLORS } from "../TempPrecipChart.constant";

export function WLTooltip({ active, label, wlData }: TWLTooltipProps) {
  const { t } = useTranslation();
  if (!active || !label) return null;

  const point = wlData?.find((d) => d.monthName === label);
  if (!point) return null;

  const isArid = point.tavg * 2 > point.prec;
  const monthIdx = (MONTH_NAMES as readonly string[]).indexOf(label);
  const displayLabel = monthIdx >= 0 ? t(`months.${monthIdx + 1}`) : label;

  return (
    <div
      className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-2"
      style={{ fontSize: 13 }}
    >
      <p className="mb-1 font-semibold text-[var(--color-text)]">{displayLabel}</p>
      <p style={{ color: CHART_COLORS.wl.tempStroke }}>
        {t("chart.avgTemperature")}: {point.tavg.toFixed(1)}°C
      </p>
      <p style={{ color: CHART_COLORS.wl.precStroke }}>
        {t("chart.precipitation")}: {Math.round(point.prec)} mm
      </p>
      <p
        className="mt-1"
        style={{ color: isArid ? CHART_COLORS.wl.aridTooltip : CHART_COLORS.wl.humidTooltip }}
      >
        {isArid ? t("chart.aridPeriod") : t("chart.humidPeriod")}
      </p>
    </div>
  );
}
