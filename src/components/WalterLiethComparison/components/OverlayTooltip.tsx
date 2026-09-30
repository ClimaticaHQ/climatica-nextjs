import { TOOLTIP_DIGITS, WALTER_LIETH_COLORS } from "@/constants";
import { useFormatNumber } from "@/hooks";
import { useTranslations } from "next-intl";
import type { TOverlayTooltipProps } from "../WalterLiethComparison.type";

export function OverlayTooltip({ active, payload, rowsB, seriesA, seriesB }: TOverlayTooltipProps) {
  const t = useTranslations();
  const formatNumber = useFormatNumber();
  const rowA = payload?.[0]?.payload;
  const rowB = rowA ? rowsB[rowA.position] : undefined;
  if (!active || !rowA || !rowB) return null;

  const entries = [
    { series: seriesA, row: rowA },
    { series: seriesB, row: rowB },
  ];

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-[13px]">
      <p className="mb-1 font-semibold text-[var(--color-text)]">
        {t(`months.${rowA.monthIndex + 1}`)}
      </p>
      {entries.map(({ series, row }) => (
        <div
          key={series.id}
          className="mb-1"
          style={{ color: WALTER_LIETH_COLORS.SERIES[series.id] }}
        >
          <p className="font-medium">{series.label}</p>
          <p>
            {t("chart.avgTemperature")}:{" "}
            {t("units.celsiusValue", {
              value: formatNumber(row.tavg, { digits: TOOLTIP_DIGITS.WL }),
            })}{" "}
            · {t("chart.precipitation")}:{" "}
            {t("units.mmValue", { value: formatNumber(row.prec, { digits: TOOLTIP_DIGITS.WL }) })}
          </p>
        </div>
      ))}
    </div>
  );
}
