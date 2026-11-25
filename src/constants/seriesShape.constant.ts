import { EWalterLiethSeriesId } from "@/enums";

export const SERIES_SHAPES = ["circle", "square", "triangle", "diamond", "cross"] as const;

export const SERIES_HATCHES = ["solid", "diagonal", "dots", "horizontal", "cross"] as const;

export const SERIES_HATCH_GEOMETRY = { TILE: 8, STROKE: 2, DOT_RADIUS: 1.7 } as const;

export const SERIES_HATCH_COLOR = "var(--color-chart-bar-hatch)";

export const PAIR_SHAPE_POSITION = {
  [EWalterLiethSeriesId.A]: 0,
  [EWalterLiethSeriesId.B]: 1,
} as const;

export const SERIES_MARKER_COLOR = "var(--color-series-marker)";

export const SERIES_SHAPE_GEOMETRY = {
  SQUARE_SIDE: 0.84,
  DIAMOND_RADIUS: 0.56,
  TRIANGLE_HEIGHT: 0.9,
  CROSS_ARM: 0.34,
} as const;
