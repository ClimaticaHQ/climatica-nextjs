import { LegendSwatch } from "@/components/ChartLegend";
import { SeriesMarker } from "@/components/SeriesMarker";
import { MISSING_VALUE_LABEL, OVERLAY_FOCUS, TOOLTIP_DIGITS } from "@/constants";
import { useFormatNumber } from "@/hooks/ui/useFormatNumber";
import { getSwatchSize } from "@/utils";
import { useTranslations } from "next-intl";
import { TOOLTIP_CLASSES as C, TOOLTIP_FONT_SIZE } from "./charts.constant";
import type { TStandardTooltipProps } from "./charts.type";

/**
 * A standard chart's tooltip: the hovered month, then each line and bar drawn — its name and
 * value in the text colour, after its series' marker where the chart holds several series, or
 * its variable's legend swatch in a chart of one. In the overlay, a hovered curve or bar
 * replaces the list with the one line naming it.
 */
export function StandardTooltip({
  active,
  payload,
  label,
  formatLabel,
  markerOf,
  swatchOf,
  focus,
}: TStandardTooltipProps) {
  const t = useTranslations();
  const formatNumber = useFormatNumber();
  if (!active || !payload || payload.length === 0) return null;

  // * a hovered curve or bar of the overlay: only it, named by variable, entity and month
  if (focus) {
    return (
      <div className={C.FRAME} data-tooltip-focus>
        <p className={C.ROW}>
          <SeriesMarker {...focus.marker} />
          <span>{focus.text}</span>
        </p>
      </div>
    );
  }

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
      {payload.map(({ name, value }) => {
        const itemName = String(name ?? "");
        // * an overlay curve's hit area is no series of its own
        if (itemName.startsWith(OVERLAY_FOCUS.HIT_NAME_PREFIX)) return null;
        const marker = markerOf?.(itemName);
        const swatch = swatchOf?.(itemName);
        return (
          <p key={itemName} className={C.ROW}>
            {marker && <SeriesMarker {...marker} />}
            {swatch && <LegendSwatch swatch={swatch} size={getSwatchSize(TOOLTIP_FONT_SIZE)} />}
            <span>{`${itemName}: ${formatValue(value, itemName)}`}</span>
          </p>
        );
      })}
    </div>
  );
}
