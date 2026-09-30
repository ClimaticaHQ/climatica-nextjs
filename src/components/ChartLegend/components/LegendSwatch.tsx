import { CHART_LEGEND } from "@/constants";
import { ELegendSwatch } from "@/enums";
import type { TLegendSwatchProps } from "../ChartLegend.type";
import { SwatchShape } from "./SwatchShape";

/** A swatch's SVG box; a series A|B pair gets two half-width shapes side by side. */
export function LegendSwatch({ swatch, size }: TLegendSwatchProps) {
  const half = { width: (size.width - CHART_LEGEND.PAIR_GAP) / 2, height: size.height };

  return (
    <svg width={size.width} height={size.height} aria-hidden="true" className="shrink-0">
      {swatch.kind === ELegendSwatch.PAIR ? (
        <>
          <SwatchShape swatch={swatch.a} size={half} />
          <g transform={`translate(${half.width + CHART_LEGEND.PAIR_GAP} 0)`}>
            <SwatchShape swatch={swatch.b} size={half} />
          </g>
        </>
      ) : (
        <SwatchShape swatch={swatch} size={size} />
      )}
    </svg>
  );
}
