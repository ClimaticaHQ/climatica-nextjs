// * one legend for every chart, on screen and in exports
export const CHART_LEGEND = {
  FONT_SIZE: 13,
  // * the swatch box scales with the text: width and height as multiples of the font size
  SWATCH_WIDTH_RATIO: 1.25,
  SWATCH_HEIGHT_RATIO: 0.9,
  SWATCH_RADIUS: 2,
  // * a bar is drawn narrower than the box, like a chart's precipitation bar
  BAR_WIDTH_RATIO: 0.6,
  LINE_WIDTH: 2,
  // * WL overlay markers: radius as a share of the swatch height
  MARKER_RADIUS_RATIO: 0.35,
  // * a series A|B pair: the gap between the two halves, px
  PAIR_GAP: 2,
  MUTED_OPACITY: 0.35,
  // * the gap between the plot area (or the split panels) and the legend — the same everywhere
  GAP_CLASS: "mt-4",
  // * line-style entries of multi-series legends: series differ by color, variables by style
  NEUTRAL_COLOR: "var(--color-text-secondary)",
} as const;

/**
 * Line dash per variable (tmax is always solid). The single-city chart and its split panels
 * tell tmin from tmax by color; the multi-series charts (overlay, multi-period) also dash it.
 */
export const CHART_LINE_DASH = {
  STANDARD: { tavg: "5 3" },
  SERIES: { tavg: "5 3", tmin: "4 2" },
} as const;
