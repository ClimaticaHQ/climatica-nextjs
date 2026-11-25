import type { TVisibleSeries } from "@/types";
import { WALTER_LIETH_AXIS, WALTER_LIETH_FROST } from "./walterLieth.constant";
import type { TGridAxesStyle } from "@/types";
export const EXPORT_SVG_SHARED_LAYOUT = {
  width: 1000,
  paddingX: 40,
  headerTitleY: 36,
  headerSubtitleY: 58,
  headerSubtitleFontSize: 14,
  headerRuleY: 78,
  footerLineHeight: 15,
  footerFontSize: 11,

  footerUrlMinFontSize: 10,
  footerUrlAvgCharWidthRatio: 0.55,
  footerBottomMargin: 20,
} as const;

// * heat-map tiles are fetched at fittedZoom + log2(scale) to match
export const EXPORT_PNG_SCALE = 2;

// * "." whatever the locale: these files are for machines
export const CSV_DECIMALS = { COORDINATE: 4, HEATMAP_VALUE: 2, MARTONNE: 1 } as const;

export const EXPORT_SVG_LAYOUT = {
  ...EXPORT_SVG_SHARED_LAYOUT,
  statsY: 92,
  statsHeight: 54,
  chartMarginLeft: EXPORT_SVG_SHARED_LAYOUT.paddingX + WALTER_LIETH_AXIS.WIDTH,
  chartMarginRight: EXPORT_SVG_SHARED_LAYOUT.paddingX + WALTER_LIETH_AXIS.WIDTH,
  chartTop: 170,
  chartHeight: 380,
  footerGap: 44,
} as const;

export const COMPARE_EXPORT_SVG_LAYOUT = {
  ...EXPORT_SVG_SHARED_LAYOUT,
  statsY: 92,
  hatchPrefix: "cmp-hatch",
} as const;

export const HEATMAP_EXPORT_SVG_LAYOUT = {
  ...EXPORT_SVG_SHARED_LAYOUT,
  statsY: 96,
  statsHeight: 70,

  mapY: 190,
  mapWidth: 920,
  mapHeight: 400,
  mapPaddingRatio: 0.1,
  gradientY: 614,
  gradientHeight: 16,
  footerY: 670,
} as const;

export const HEATMAP_EXPORT_TILE_LIMITS = {
  fetchTimeoutMs: 5000,
  maxTileCount: 64,
} as const;

export const COMPARE_WL_EXPORT_LAYOUT = {
  splitGap: 30,
  panelPadding: 16,
  panelRadius: 10,
  panelHeaderHeight: 64,
  panelPlotMarginX: WALTER_LIETH_AXIS.WIDTH,
  panelFooterHeight: 26 + WALTER_LIETH_FROST.BAND_HEIGHT.FULL,
  splitPlotHeight: 300,
  overlayPlotMarginX: EXPORT_SVG_SHARED_LAYOUT.paddingX + WALTER_LIETH_AXIS.WIDTH,
  overlayPlotHeight: 360,
  footerGap: 44,
} as const;

export const URL_BREAK_PATTERN = /(?=[?&])/;

// * exported text is measured in the same stack (measureExportText)
export const EXPORT_FONT_FAMILY = "Inter, Roboto, Helvetica Neue, Arial, sans-serif";

export const EXPORT_TEXT = {
  AVG_CHAR_WIDTH_RATIO: 0.55,
  LINE_HEIGHT_RATIO: 1.4,
  NOTICE_FONT_SIZE: 13,
} as const;

export const COMPARE_EXPORT_DEFAULT_VISIBLE: TVisibleSeries = {
  tmax: true,
  tmin: true,
  tavg: false,
  prec: true,
};

export const EXPORT_MONTHLY_VALUES = {
  GAP_ABOVE: 8,
  LINE_HEIGHT: 16,
  ROW_PADDING: 5,
  WIDE_MIN_WIDTH: 576,
  VALUE_FONT_SIZE: { WIDE: 13, NARROW: 11 },
  // * a static file can't switch layout: a too-narrow column's values shrink to fit, never below the floor
  FIT: { CHAR_WIDTH_EM: 0.6, CELL_GAP: 4, MIN_FONT_SIZE: 8 },
  VALUE_FONT_WEIGHT: 500,
  UNIT_FONT_SIZE: 11,
  UNIT_FONT_WEIGHT: 600,
  UNIT_MARKER_GAP: 2,
  ROW_HEADER: { PADDING_X: 6, UNIT_GAP: 6 },
  ROW_HEADER_MAX_WIDTH: 120,
  BASELINE: 4,
} as const;

export const EXPORT_TABLE = {
  HEADER_HEIGHT: 32,
  HEADER_WITH_SUBTITLE_HEIGHT: 44,
  ROW_HEIGHT: 26,
  PADDING_X: 10,
  LABEL_FONT_SIZE: 12,
  HEADER_FONT_SIZE: 13,
  HEADER_FONT_WEIGHT: 700,
  SUBTITLE_FONT_SIZE: 11,
  SUBTITLE_OFFSET: 8,
  VALUE_FONT_SIZE: 13,
  VALUE_FONT_WEIGHT: 600,
  BASELINE: 4,
  MARKER_SIZE: 8,
  MARKER_GAP: 8,
  GAP_BELOW: 36,
} as const;

export const EXPORT_MONTHLY_TABLE = {
  HATCH_PREFIX: "tbl-hatch",
  ROW_HEIGHT: 26,
  LABEL_MIN_WIDTH: 110,
  LABEL_PADDING_X: 10,
  LABEL_FONT_SIZE: 11,
  UNIT_FONT_WEIGHT: 600,
  GAP_BELOW_PLOT: 10,
  VALUE_FONT_SIZE: 16,
  VALUE_FONT_WEIGHT: 600,
  LABEL_BASELINE: 4,
  VALUE_BASELINE: 5,
  MARKER_SIZE: 8,
  MARKER_GAP: 6,
  GAP_ABOVE: 32,
} as const;

export const WALTER_LIETH_EXPORT_TEXT = {
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
} as const;

export const EXPORT_AXES_STYLE = {
  tickGap: 4,
  unitTitlesAbove: 8,
} as const satisfies TGridAxesStyle;

export const EXPORT_LEGEND = {
  ROW_HEIGHT: 22,
  ITEM_GAP: 24,
  SWATCH_TEXT_GAP: 6,
  SWATCH_BASELINE_DROP: 1,
  GAP: 30,
} as const;

// * makes an element re-declare the light :root tokens (global.css)
export const EXPORT_PALETTE_ATTRIBUTE = "data-export-palette";

export const CSS_VAR_REFERENCE_PATTERN = /var\((--[\w-]+)\)/g;
