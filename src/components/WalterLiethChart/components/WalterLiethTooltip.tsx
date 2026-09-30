import { TOOLTIP_DIGITS, WALTER_LIETH_COLORS } from "@/constants";
import { useFormatNumber } from "@/hooks";
import { isAridMonth } from "@/utils";
import { useTranslations } from "next-intl";
import type { TWalterLiethTooltipProps } from "../WalterLiethChart.type";

export function WalterLiethTooltip({ active, payload }: TWalterLiethTooltipProps) {
  const t = useTranslations();
  const formatNumber = useFormatNumber();
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;

  const isArid = isAridMonth(row);

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-[13px]">
      <p className="mb-1 font-semibold text-[var(--color-text)]">
        {t(`months.${row.monthIndex + 1}`)}
      </p>
      <p style={{ color: WALTER_LIETH_COLORS.TEMP }}>
        {t("chart.avgTemperature")}:{" "}
        {t("units.celsiusValue", { value: formatNumber(row.tavg, { digits: TOOLTIP_DIGITS.WL }) })}
      </p>
      <p style={{ color: WALTER_LIETH_COLORS.PREC }}>
        {t("chart.precipitation")}:{" "}
        {t("units.mmValue", { value: formatNumber(row.prec, { digits: TOOLTIP_DIGITS.WL }) })}
      </p>
      <p
        className="mt-1"
        style={{ color: isArid ? WALTER_LIETH_COLORS.ARID_HATCH : WALTER_LIETH_COLORS.HUMID_HATCH }}
      >
        {isArid ? t("chart.aridPeriod") : t("chart.humidPeriod")}
      </p>
    </div>
  );
}
