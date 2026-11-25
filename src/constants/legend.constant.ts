export const CHART_LEGEND = {
  FONT_SIZE: 13,
  SWATCH_WIDTH_RATIO: 1.25,
  SWATCH_HEIGHT_RATIO: 0.9,
  SWATCH_RADIUS: 2,
  BAR_WIDTH_RATIO: 0.6,
  LINE_WIDTH: 2,
  MARKER_RADIUS_RATIO: 0.35,
  ENTITY_GAP: 3,
  MUTED_OPACITY: 0.35,
  GAP_CLASS: "mt-4",
  NEUTRAL_COLOR: "var(--color-text-secondary)",
} as const;

/** a pair draws all three of a side's lines in one colour, so the dash tells the variables apart */
export const CHART_LINE_DASH = {
  STANDARD: { tavg: "5 3", tmin: "2 3" },
  SERIES: { tavg: "5 3", tmin: "2 3" },
} as const;
