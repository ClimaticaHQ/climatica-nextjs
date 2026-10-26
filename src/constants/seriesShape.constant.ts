import { EWalterLiethSeriesId } from "@/enums";

/**
 * A compared entity's marker shape, by its place: a pair's A and B, the compared weather years
 * in list order — its curves' points. Charts never tell entities apart by colour (docs/colors.md).
 */
export const SERIES_SHAPES = ["circle", "square", "triangle", "diamond", "cross"] as const;

// * the entity's bar hatch in an overlay, by the same place: knocked out of the humid / arid fill
export const SERIES_HATCHES = ["solid", "diagonal", "dots", "horizontal", "cross"] as const;

// * a hatch tile (px): ~2 px strokes on an 8 px tile, dots ~1.7 px — legible on the narrowest bar
export const SERIES_HATCH_GEOMETRY = { TILE: 8, STROKE: 2, DOT_RADIUS: 1.7 } as const;

// * the hatch's colour: the chart card's surface, so it reads as cut out of the fill
export const SERIES_HATCH_COLOR = "var(--color-chart-bar-hatch)";

// * a pair's sides are the list's first two places, so A and B look alike on every page
export const PAIR_SHAPE_POSITION = {
  [EWalterLiethSeriesId.A]: 0,
  [EWalterLiethSeriesId.B]: 1,
} as const;

// * every entity marker is this neutral graphite: the shape tells entities apart
export const SERIES_MARKER_COLOR = "var(--color-series-marker)";

// * shapes drawn in one box: the square and diamond a little inside it, the cross's arms a third
export const SERIES_SHAPE_GEOMETRY = {
  SQUARE_SIDE: 0.84,
  DIAMOND_RADIUS: 0.56,
  TRIANGLE_HEIGHT: 0.9,
  CROSS_ARM: 0.34,
} as const;
