import type { EWalterLiethSeriesId } from "@/enums";

export type TSeriesMarkerProps = {
  id: EWalterLiethSeriesId;
  /** overrides the series colour — a compared weather year has its own */
  color?: string | undefined;
};
