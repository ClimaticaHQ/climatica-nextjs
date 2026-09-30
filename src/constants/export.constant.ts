import type { TVisibleSeries } from "@/types";
import { WALTER_LIETH_AXIS, WALTER_LIETH_FROST } from "./walterLieth.constant";
import type { TGridAxesStyle } from "@/types";
/**
 * every drawn svg export (single-city, compare-cities/periods, heat-map)
 * shares the same main setting obj
 *
 * and each page-specific export settings obj spread this obj
 * and adds only the geometry unique to its own content (stats table, chart, etc).
 */
export const EXPORT_SVG_SHARED_LAYOUT = {
  width: 1000,
  paddingX: 40,
  headerTitleY: 36,
  headerSubtitleY: 58,
  headerSubtitleFontSize: 14,
  headerRuleY: 78,
  footerLineHeight: 15,
  footerFontSize: 11,

  // * share url shrinks down to this size, then wraps
  footerUrlMinFontSize: 10,
  footerUrlAvgCharWidthRatio: 0.55,
  footerBottomMargin: 20,
} as const;

// * heat-map tiles are fetched at fittedZoom + log2(scale) to match
export const EXPORT_PNG_SCALE = 2;

/**
 * single-city climate-statistics export — the only one with a monthly data
 * table and aridity legend, since it's the only mode with a per-month breakdown.
 **/
export const EXPORT_SVG_LAYOUT = {
  ...EXPORT_SVG_SHARED_LAYOUT,
  statsY: 92,
  statsHeight: 54,
  // * the screen's full plot margins inside the page padding
  chartMarginLeft: EXPORT_SVG_SHARED_LAYOUT.paddingX + WALTER_LIETH_AXIS.WIDTH,
  chartMarginRight: EXPORT_SVG_SHARED_LAYOUT.paddingX + WALTER_LIETH_AXIS.WIDTH,
  chartTop: 170,
  chartHeight: 380,
  // * below the legend (which follows the plot's monthly strip)
  footerGap: 44,
} as const;

// * shared settings obj by compare-cities, compare-periods pages
export const COMPARE_EXPORT_SVG_LAYOUT = {
  ...EXPORT_SVG_SHARED_LAYOUT,
  statsY: 92,
  statsHeaderRowHeight: 32,
  statsRowHeight: 26,
  // * where the chart body starts under the stats table (overlay, weather years); each body
  // * (WL or standard, split or overlay) sets its own height
  chartTop: 310,
} as const;

// * heat-map export with NO fixed height
export const HEATMAP_EXPORT_SVG_LAYOUT = {
  ...EXPORT_SVG_SHARED_LAYOUT,
  statsY: 96,
  statsHeight: 70,

  // * map section: fills the same content width as every other section (width -
  // paddingX * 2), fitted to the selection's bbox (+ paddingRatio) at a zoom
  // computed independently of the live map's own pan/zoom — see buildFitZoom()
  mapY: 190,
  mapWidth: 920,
  mapHeight: 400,
  mapPaddingRatio: 0.1,
  gradientY: 614,
  gradientHeight: 16,
  footerY: 670,
} as const;

// * safety limits for the heat-map export's basemap-tile fetch
export const HEATMAP_EXPORT_TILE_LIMITS = {
  fetchTimeoutMs: 5000,
  // * above this, tiles are fetched at fittedZoom instead of the sharpened zoom
  maxTileCount: 64,
} as const;

// * compare export in Walter-Lieth mode — starts where the standard chart would (chartTop)
export const COMPARE_WL_EXPORT_LAYOUT = {
  splitGap: 30,
  // * split panel card: header (name, period, stats cells) above the plot, all inside it
  panelPadding: 16,
  panelRadius: 10,
  // * name and subtitle, then room for °C / mm above the plot — the table on top has the stats
  panelHeaderHeight: 64,
  // * same side margins as the desktop diagram; °C / mm sit above the axes, not beside them
  panelPlotMarginX: WALTER_LIETH_AXIS.WIDTH,
  // * below the plot, inside the card: room for the frost band and the month labels
  panelFooterHeight: 26 + WALTER_LIETH_FROST.BAND_HEIGHT.FULL,
  splitPlotHeight: 300,
  overlayPlotMarginX: EXPORT_SVG_SHARED_LAYOUT.paddingX + WALTER_LIETH_AXIS.WIDTH,
  overlayPlotHeight: 360,
  footerGap: 44,
} as const;

// * every export SVG's font stack — text is measured in the same stack (measureExportText)
export const EXPORT_FONT_FAMILY = "Inter, Roboto, Helvetica Neue, Arial, sans-serif";

// * text metrics for exports: the fallback estimate where no canvas can measure text
export const EXPORT_TEXT = {
  // * average glyph width as a share of font size (Inter/Roboto-like sans-serif)
  AVG_CHAR_WIDTH_RATIO: 0.55,
  LINE_HEIGHT_RATIO: 1.4,
  NOTICE_FONT_SIZE: 13,
} as const;

// * compare exports before the chart has reported its chips: max, min and precipitation
export const COMPARE_EXPORT_DEFAULT_VISIBLE: TVisibleSeries = {
  tmax: true,
  tmin: true,
  tavg: false,
  prec: true,
};

// * the monthly values table under each exported plot, in that plot's gutters — the screen's
export const EXPORT_MONTHLY_VALUES = {
  // * px below the month labels' baseline
  GAP_ABOVE: 8,
  RADIUS: 4,
  // * one line per series in a cell (overlay: A above B), padded top and bottom
  LINE_HEIGHT: 16,
  ROW_PADDING: 5,
  // * the values' size follows the table's width, as on screen: a split panel's is smaller
  WIDE_MIN_WIDTH: 576,
  VALUE_FONT_SIZE: { WIDE: 13, NARROW: 11 },
  VALUE_FONT_WEIGHT: 500,
  UNIT_FONT_SIZE: 11,
  UNIT_FONT_WEIGHT: 600,
  // * a line's baseline below its centre
  BASELINE: 4,
} as const;

// * the compare exports' comparison table, on top — the page's ComparisonTable
export const EXPORT_COMPARISON_TABLE = {
  HEADER_HEIGHT: 46,
  ROW_HEIGHT: 28,
  // * share of the table's width for the metric column
  METRIC_WIDTH_RATIO: 0.28,
  PADDING_X: 12,
  RADIUS: 8,
  FONT_SIZE: 13,
  HEAD_FONT_WEIGHT: 600,
  VALUE_FONT_WEIGHT: 500,
  SMALL_FONT_SIZE: 11,
  // * header text baselines: names / "Difference", then the direction line under it
  HEAD_BASELINE: 22,
  DIRECTION_BASELINE: 37,
  BASELINE: 5,
  MARKER_SIZE: 8,
  MARKER_GAP: 6,
  // * space below the table, above the chart
  GAP_BELOW: 24,
} as const;

// * the exports' monthly table: the city page's two rows, or a row per variable and series
export const EXPORT_MONTHLY_TABLE = {
  ROW_HEIGHT: 26,
  // * px — the label column: variable only (one series), or variable — series (compare)
  LABEL_WIDTH: { SINGLE: 110, MULTI: 250 },
  LABEL_PADDING_X: 10,
  LABEL_FONT_SIZE: 11,
  // * the unit in a row label, in its chart color
  UNIT_FONT_WEIGHT: 600,
  // * px between the plot's month labels and the table below them (city export)
  GAP_BELOW_PLOT: 10,
  VALUE_FONT_SIZE: 16,
  VALUE_FONT_WEIGHT: 600,
  // * text baselines within a row (px below the row's centre)
  LABEL_BASELINE: 4,
  VALUE_BASELINE: 5,
  // * a series' marker before its row label, and the gap after it
  MARKER_SIZE: 8,
  MARKER_GAP: 6,
  // * compare export: space between the chart's legend and the table
  GAP_ABOVE: 32,
} as const;

// * WL export text: month labels under a panel, the panel header lines, the Martonne badge
export const WALTER_LIETH_EXPORT_TEXT = {
  // * every export's month labels (WL and standard), below the frost band's reserved room
  MONTH_LABEL_OFFSET: 18 + WALTER_LIETH_FROST.BAND_HEIGHT.FULL,
  MONTH_LABEL_FONT_SIZE: 11,
  PANEL_NAME_Y: 16,
  PANEL_NAME_X: 14,
  PANEL_NAME_FONT_SIZE: 15,
  PANEL_NAME_FONT_WEIGHT: 700,
  PANEL_DOT_Y: 11,
  PANEL_DOT_RADIUS: 4,
  PANEL_SUBTITLE_Y: 34,
  PANEL_TEXT_FONT_SIZE: 12,
  // * the Martonne class badge (comparison table)
  BADGE_FONT_SIZE: 10,
  BADGE_FONT_WEIGHT: 500,
  BADGE_PADDING_X: 5,
  BADGE_HEIGHT: 15,
  BADGE_RADIUS: 3,
  // * badge top above the value's baseline, and its text baseline below the badge top
  BADGE_RISE: 11,
  BADGE_TEXT_Y: 11,
} as const;

// * every export plot's axes, like the screen: tick labels this far from the plot, °C / mm
// * upright this far above it
export const EXPORT_AXES_STYLE = {
  tickGap: 4,
  unitTitlesAbove: 8,
} as const satisfies TGridAxesStyle;

// * WL export legends: items flow left to right and wrap onto new rows
// * (font size and swatch box come from CHART_LEGEND, like the screen's ChartLegend)
export const EXPORT_LEGEND = {
  ROW_HEIGHT: 22,
  ITEM_GAP: 24,
  SWATCH_TEXT_GAP: 6,
  // * the swatch sits this far below the text baseline's top, so both look centered
  SWATCH_BASELINE_DROP: 1,
  // * from the content above (split cards, or an overlay's month labels) to the legend's first
  // * baseline — the same for every compare export layout
  GAP: 30,
} as const;

// * attribute that makes an element re-declare the light (:root) tokens — see global.css
export const EXPORT_PALETTE_ATTRIBUTE = "data-export-palette";
