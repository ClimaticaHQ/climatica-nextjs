import { TOOLTIP_DIGITS } from "@/constants";
import { useFormatNumber } from "@/hooks/ui/useFormatNumber";
import { useTranslations } from "next-intl";
import type { TOverlayTooltipProps } from "../WalterLiethComparison.type";

/** The hovered month for every overlaid series, each in its colour. */
export function OverlayTooltip({ active, payload, entries }: TOverlayTooltipProps) {
  const t = useTranslations();
  const formatNumber = useFormatNumber();
  const hovered = payload?.[0]?.payload;
  if (!active || !hovered) return null;

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-[13px]">
      <p className="mb-1 font-semibold text-[var(--color-text)]">
        {t(`months.${hovered.monthIndex + 1}`)}
      </p>
      {entries.map(({ key, label, color, rows }) => {
        const row = rows[hovered.position];
        if (!row) return null;
        return (
          <div key={key} className="mb-1" style={{ color }}>
            <p className="font-medium">{label}</p>
            <p>
              {t("chart.avgTemperature")}:{" "}
              {t("units.celsiusValue", {
                value: formatNumber(row.tavg, { digits: TOOLTIP_DIGITS.WL }),
              })}{" "}
              · {t("chart.precipitation")}:{" "}
              {t("units.mmValue", { value: formatNumber(row.prec, { digits: TOOLTIP_DIGITS.WL }) })}
            </p>
          </div>
        );
      })}
    </div>
  );
}
