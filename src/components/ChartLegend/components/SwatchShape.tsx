import { CHART_LEGEND } from "@/constants";
import { ELegendSwatch } from "@/enums";
import type { TLegendSwatchProps } from "../ChartLegend.type";
import { FillSwatch } from "./FillSwatch";
import { FrostSwatch } from "./FrostSwatch";
import { HatchSwatch } from "./HatchSwatch";
import { LineSwatch } from "./LineSwatch";
import { MarkerSwatch } from "./MarkerSwatch";

/** One swatch's shape inside its box; a pair is split by LegendSwatch first. */
export function SwatchShape({ swatch, size }: TLegendSwatchProps) {
  // * a switch narrows the descriptor union without casts
  switch (swatch.kind) {
    case ELegendSwatch.LINE:
      return <LineSwatch color={swatch.color} dash={swatch.dash} size={size} />;
    case ELegendSwatch.BAR:
      return (
        <FillSwatch
          color={swatch.color}
          size={size}
          width={size.width * CHART_LEGEND.BAR_WIDTH_RATIO}
        />
      );
    case ELegendSwatch.PERHUMID:
      return <FillSwatch color={swatch.color} size={size} />;
    case ELegendSwatch.FROST:
      return <FrostSwatch color={swatch.color} outline={swatch.outline} size={size} />;
    case ELegendSwatch.MARKER:
      return <MarkerSwatch color={swatch.color} shape={swatch.shape} size={size} />;
    case ELegendSwatch.HUMID:
    case ELegendSwatch.ARID:
      return <HatchSwatch color={swatch.color} regime={swatch.kind} size={size} />;
    case ELegendSwatch.PAIR:
      return null;
  }
}
