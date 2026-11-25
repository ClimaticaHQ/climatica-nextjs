import type { SERIES_HATCHES, SERIES_SHAPES } from "@/constants";

export type TSeriesShape = (typeof SERIES_SHAPES)[number];

export type TMarkerPathArgs = {
  shape: TSeriesShape;
  cx: number;
  cy: number;
  size: number;
};

export type TSeriesHatch = (typeof SERIES_HATCHES)[number];

export type THatchTile = {
  d: string;
  paint: "stroke" | "fill";
};

export type TSeriesIdentity = {
  shape: TSeriesShape;
  hatch: TSeriesHatch;
};

export type TEntityMarker = TSeriesIdentity & {
  markerSlot: number;
};

export type TMarkerSlots = Readonly<Record<string, number>>;
