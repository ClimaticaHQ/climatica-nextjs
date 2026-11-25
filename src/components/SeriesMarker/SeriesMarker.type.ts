import type { TSeriesHatch, TSeriesShape } from "@/types";

export type TSeriesMarkerProps = {
  shape: TSeriesShape;
  hatch?: TSeriesHatch | undefined;
  fill?: string | undefined;
  color?: string | undefined;
};
