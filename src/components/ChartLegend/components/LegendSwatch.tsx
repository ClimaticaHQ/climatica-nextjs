import type { TLegendSwatchProps } from "../ChartLegend.type";
import { SwatchShape } from "./SwatchShape";

/** A swatch's SVG box. */
export function LegendSwatch({ swatch, size }: TLegendSwatchProps) {
  return (
    <svg width={size.width} height={size.height} aria-hidden="true" className="shrink-0">
      <SwatchShape swatch={swatch} size={size} />
    </svg>
  );
}
