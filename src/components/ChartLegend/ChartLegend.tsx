import { CHART_LEGEND, CHART_TEXT_MIN_PX } from "@/constants";
import { useTextScale } from "@/hooks/ui/useTextScale";
import { getLegendSwatchWidth, getSwatchSize, scaleChartFont } from "@/utils";
import { CHART_LEGEND_CLASSES as C } from "./ChartLegend.constant";
import type { TChartLegendProps } from "./ChartLegend.type";
import { LegendSwatch } from "./components";

export function ChartLegend({ items, fontSize = CHART_LEGEND.FONT_SIZE }: TChartLegendProps) {
  const scaledFontSize = scaleChartFont({
    size: fontSize,
    textScale: useTextScale(),
    min: CHART_TEXT_MIN_PX.TEXT,
  });
  const size = getSwatchSize(scaledFontSize);

  return (
    <ul className={C.LIST} style={{ fontSize: scaledFontSize }}>
      {items.map(({ key, label, swatch, isMuted }) => (
        <li
          key={key}
          className={C.ITEM}
          style={isMuted ? { opacity: CHART_LEGEND.MUTED_OPACITY } : undefined}
        >
          <LegendSwatch
            swatch={swatch}
            size={{ ...size, width: getLegendSwatchWidth(swatch, size) }}
          />
          {label}
        </li>
      ))}
    </ul>
  );
}
