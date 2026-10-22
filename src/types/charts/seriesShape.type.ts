import type { SERIES_HATCHES, SERIES_SHAPES } from "@/constants";

/** An entity's marker shape (SERIES_SHAPES). */
export type TSeriesShape = (typeof SERIES_SHAPES)[number];

export type TMarkerPathArgs = {
  shape: TSeriesShape;
  /** the marker's centre */
  cx: number;
  cy: number;
  /** the box the shape fills, in px */
  size: number;
};

/** An entity's overlay bar hatch (SERIES_HATCHES). */
export type TSeriesHatch = (typeof SERIES_HATCHES)[number];

/** One hatch tile's drawing: a path, stroked (lines) or filled (dots); none for solid. */
export type THatchTile = {
  d: string;
  paint: "stroke" | "fill";
};

/** An entity's identity on a chart: its curves' shape and its bars' hatch. */
export type TSeriesIdentity = {
  shape: TSeriesShape;
  hatch: TSeriesHatch;
};
