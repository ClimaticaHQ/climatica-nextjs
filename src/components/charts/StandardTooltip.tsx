import { LegendSwatch } from "@/components/ChartLegend";
import { SeriesMarker } from "@/components/SeriesMarker";
import { MISSING_VALUE_LABEL, OVERLAY_FOCUS } from "@/constants";
import { EDisplayMetric } from "@/enums";
import { useDisplayFormat } from "@/hooks/ui/useDisplayFormat";
import { useTextScale } from "@/hooks/ui/useTextScale";
import { getSwatchSize } from "@/utils";
import { useTranslations } from "next-intl";
import { TOOLTIP_CLASSES as C, TOOLTIP_FONT_SIZE } from "./charts.constant";
import type { TStandardTooltipProps } from "./charts.type";

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
  const { formatValue: formatDisplayValue } = useDisplayFormat();
  const swatchSize = getSwatchSize(TOOLTIP_FONT_SIZE * useTextScale());
  if (!active || !payload || payload.length === 0) return null;

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
    return `${formatDisplayValue(num, { metric: EDisplayMetric.CHART_TOOLTIP_VALUE })} ${t(unit)}`;
  };

  return (
    <div className={C.FRAME}>
      <p className={C.TITLE}>{formatLabel(label)}</p>
      {payload.map(({ name, value }) => {
        const itemName = String(name ?? "");
        if (itemName.startsWith(OVERLAY_FOCUS.HIT_NAME_PREFIX)) return null;
        const marker = markerOf?.(itemName);
        const swatch = swatchOf?.(itemName);
        return (
          <p key={itemName} className={C.ROW}>
            {marker && <SeriesMarker {...marker} />}
            {swatch && <LegendSwatch swatch={swatch} size={swatchSize} />}
            <span>{`${itemName}: ${formatValue(value, itemName)}`}</span>
          </p>
        );
      })}
    </div>
  );
}
