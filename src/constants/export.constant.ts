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
  chartMarginLeft: 70,
  chartMarginRight: 70,
  chartTop: 170,
  chartHeight: 380,
  legendY: 616,
  dataTableY: 670,
  dataTableRowHeight: 26,
  dataTableLabelWidth: 110,
  footerY: 780,
} as const;

// * shared settings obj by compare-cities, compare-periods pages
export const COMPARE_EXPORT_SVG_LAYOUT = {
  ...EXPORT_SVG_SHARED_LAYOUT,
  statsY: 92,
  statsHeaderRowHeight: 32,
  statsRowHeight: 26,
  // * where the chart body starts; each body (WL or standard, split or overlay) sets its height
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
  panelHeaderHeight: 132,
  // * same side margins as the desktop diagram; °C / mm sit above the axes, not beside them
  panelPlotMarginX: 34,
  // * below the plot, inside the card: room for the month labels
  panelFooterHeight: 26,
  splitPlotHeight: 300,
  overlayPlotMarginX: 70,
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

// * WL export text: month labels under a panel, and the split-panel header lines
export const WALTER_LIETH_EXPORT_TEXT = {
  MONTH_LABEL_OFFSET: 18,
  MONTH_LABEL_FONT_SIZE: 11,
  PANEL_NAME_Y: 16,
  PANEL_NAME_X: 14,
  PANEL_NAME_FONT_SIZE: 15,
  PANEL_NAME_FONT_WEIGHT: 700,
  PANEL_DOT_Y: 11,
  PANEL_DOT_RADIUS: 4,
  PANEL_SUBTITLE_Y: 34,
  PANEL_TEXT_FONT_SIZE: 12,
  // * stats cells: label / value / meta rows, the meta row reserved in every panel
  STATS_Y: 46,
  STATS_HEIGHT: 58,
  // * the stats frame: a thin border, a smaller radius than the panel card's
  STATS_RADIUS: 6,
  STATS_CELL_PADDING_X: 10,
  STATS_LABEL_Y: 12,
  STATS_VALUE_Y: 33,
  STATS_META_Y: 50,
  STATS_LABEL_FONT_SIZE: 11,
  STATS_VALUE_FONT_SIZE: 15,
  STATS_VALUE_FONT_WEIGHT: 500,
  STATS_META_FONT_SIZE: 11,
  // * a Martonne badge and B's delta that don't fit one line: the delta drops a line
  STATS_META_LINE_HEIGHT: 18,
  STATS_META_GAP: 6,
  BADGE_FONT_SIZE: 10,
  BADGE_FONT_WEIGHT: 500,
  BADGE_PADDING_X: 5,
  BADGE_HEIGHT: 15,
  BADGE_RADIUS: 3,
  // * badge top above the meta baseline, and its text baseline below the badge top
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
