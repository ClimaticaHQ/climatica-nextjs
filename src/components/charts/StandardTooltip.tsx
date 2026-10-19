import { LegendSwatch } from "@/components/ChartLegend";
import { SeriesMarker } from "@/components/SeriesMarker";
import { MISSING_VALUE_LABEL, TOOLTIP_DIGITS } from "@/constants";
import { useFormatNumber } from "@/hooks/ui/useFormatNumber";
import { getSeriesTextColor, getSwatchSize } from "@/utils";
import { useTranslations } from "next-intl";
import { TOOLTIP_CLASSES as C, TOOLTIP_FONT_SIZE } from "./charts.constant";
import type { TStandardTooltipProps } from "./charts.type";

/**
 * A standard chart's tooltip: the hovered month, then each line and bar drawn — its name and
 * value in the text colour, after its series' marker where the chart holds several series, or
 * its variable's legend swatch in a chart of one.
 */
export function StandardTooltip({
  active,
  payload,
  label,
  formatLabel,
  markerOf,
  swatchOf,
}: TStandardTooltipProps) {
  const t = useTranslations();
  const formatNumber = useFormatNumber();
  if (!active || !payload || payload.length === 0) return null;

  const formatValue = (value: unknown, name: string) => {
    // * a missing month is unknown — Number(null) / Number("") would print "0.00"
    if (value === null || value === undefined) return MISSING_VALUE_LABEL;
    const num = Number(value);
    if (isNaN(num)) return String(value);
    const unit = name.includes(t("chart.precipitation")) ? "units.mm" : "units.celsius";
    return `${formatNumber(num, { digits: TOOLTIP_DIGITS.STANDARD })} ${t(unit)}`;
  };

  return (
    <div className={C.FRAME}>
      <p className={C.TITLE}>{formatLabel(label)}</p>
      {payload.map(({ name, value, color = "" }) => {
        const itemName = String(name ?? "");
        const marker = markerOf?.(itemName);
        const swatch = swatchOf?.(itemName);
        return (
          <p
            key={itemName}
            className={C.ROW}
            style={{ color: getSeriesTextColor({ color, isLargeText: false }) }}
          >
            {marker && <SeriesMarker {...marker} />}
            {swatch && <LegendSwatch swatch={swatch} size={getSwatchSize(TOOLTIP_FONT_SIZE)} />}
            <span>{`${itemName}: ${formatValue(value, itemName)}`}</span>
          </p>
        );
      })}
    </div>
  );
}
