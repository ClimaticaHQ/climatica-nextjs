import { SeriesMarker } from "@/components/SeriesMarker";
import { EDisplayMetric } from "@/enums";
import { useDisplayFormat } from "@/hooks/ui/useDisplayFormat";
import { useTranslations } from "next-intl";
import { TOOLTIP_CLASSES as C } from "./charts.constant";
import type { TOverlayTooltipProps } from "./charts.type";

/** The hovered month for every overlaid series: its marker and name, then its values. */
export function OverlayTooltip({ active, payload, entries }: TOverlayTooltipProps) {
  const t = useTranslations();
  const { formatValue } = useDisplayFormat();
  const metric = EDisplayMetric.WALTER_LIETH_TOOLTIP_VALUE;
  const hovered = payload?.[0]?.payload;
  if (!active || !hovered) return null;

  return (
    <div className={C.FRAME}>
      <p className={C.TITLE}>{t(`months.${hovered.monthIndex + 1}`)}</p>
      {entries.map(({ key, label, marker, rows }) => {
        const row = rows[hovered.position];
        if (!row) return null;
        return (
          <div key={key} className={C.SERIES}>
            <p className={C.SERIES_LABEL}>
              <SeriesMarker {...marker} />
              {label}
            </p>
            <p>
              {t("chart.avgTemperature")}:{" "}
              {t("units.celsiusValue", {
                value: formatValue(row.tavg, { metric }),
              })}{" "}
              · {t("chart.precipitation")}:{" "}
              {t("units.mmValue", { value: formatValue(row.prec, { metric }) })}
            </p>
          </div>
        );
      })}
    </div>
  );
}
