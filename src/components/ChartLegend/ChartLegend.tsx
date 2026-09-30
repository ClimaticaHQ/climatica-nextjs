import { CHART_LEGEND } from "@/constants";
import { getSwatchSize } from "@/utils";
import { CHART_LEGEND_CLASSES as C } from "./ChartLegend.constant";
import type { TChartLegendProps } from "./ChartLegend.type";
import { LegendSwatch } from "./components";

/**
 * The legend under every chart and split pair: items are data (see chartLegend.util), so the
 * export draws the same entries. Swatches scale with fontSize.
 */
export function ChartLegend({ items, fontSize = CHART_LEGEND.FONT_SIZE }: TChartLegendProps) {
  const size = getSwatchSize(fontSize);

  return (
    <ul className={C.LIST} style={{ fontSize }}>
      {items.map(({ key, label, swatch, isMuted }) => (
        <li
          key={key}
          className={C.ITEM}
          style={isMuted ? { opacity: CHART_LEGEND.MUTED_OPACITY } : undefined}
        >
          <LegendSwatch swatch={swatch} size={size} />
          {label}
        </li>
      ))}
    </ul>
  );
}
