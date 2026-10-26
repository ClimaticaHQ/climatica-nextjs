import type { TSeriesShape } from "@/types";

export type TDotLabelProps = {
  label: string;
  /** the entity the label names (Period A, City B): its shape */
  markerShape?: TSeriesShape;
};
