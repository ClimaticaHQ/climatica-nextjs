import { MONTH_NAMES } from "@/constants";
import { useTranslation } from "react-i18next";
import type { TWLPeriodsTooltipProps, TWLScaledPoint } from "../TempPrecipChart.type";
import { WL_COLORS_A, WL_COLORS_B } from "../TempPrecipChart.constant";

export function WLPeriodsTooltip({
  active,
  label,
  wlDataA,
  wlDataB,
  labelA,
  labelB,
}: TWLPeriodsTooltipProps) {
  const { t } = useTranslation();
  if (!active || !label) return null;

  const ptA = wlDataA.find((d: TWLScaledPoint) => d.monthName === label);
  const ptB = wlDataB.find((d: TWLScaledPoint) => d.monthName === label);
  if (!ptA && !ptB) return null;

  const monthIdx = (MONTH_NAMES as readonly string[]).indexOf(label);
  const displayLabel = monthIdx >= 0 ? t(`months.${monthIdx + 1}`) : label;

  return (
    <div
      className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-2"
      style={{ fontSize: 13 }}
    >
      <p className="mb-1 font-semibold text-[var(--color-text)]">{displayLabel}</p>
      {ptA && (
        <div className="mb-1.5">
          <p className="font-medium" style={{ color: WL_COLORS_A.tempLineColor }}>
            {labelA}
          </p>
          <p style={{ color: WL_COLORS_A.tempLineColor }}>
            {t("chart.avgTemperature")}: {ptA.tavg.toFixed(1)}°C
          </p>
          <p style={{ color: WL_COLORS_A.precLineColor }}>
            {t("chart.precipitation")}: {Math.round(ptA.prec)} mm
          </p>
        </div>
      )}
      {ptB && (
        <div>
          <p className="font-medium" style={{ color: WL_COLORS_B.tempLineColor }}>
            {labelB}
          </p>
          <p style={{ color: WL_COLORS_B.tempLineColor }}>
            {t("chart.avgTemperature")}: {ptB.tavg.toFixed(1)}°C
          </p>
          <p style={{ color: WL_COLORS_B.precLineColor }}>
            {t("chart.precipitation")}: {Math.round(ptB.prec)} mm
          </p>
        </div>
      )}
    </div>
  );
}
