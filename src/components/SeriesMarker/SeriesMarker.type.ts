import type { TSeriesHatch, TSeriesShape } from "@/types";

export type TSeriesMarkerProps = {
  shape: TSeriesShape;
  /** its bars' hatch too, beside the shape — where the marker stands for its bars */
  hatch?: TSeriesHatch | undefined;
  /** its bars' own fill under the hatch (the shades style); absent: the humid fill */
  fill?: string | undefined;
};
