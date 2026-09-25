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
  aridityLegendY: 642,
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
  chartMarginLeft: 70,
  chartMarginRight: 70,
  chartTop: 310,
  chartHeight: 380,
  legendY: 756,
  footerY: 806,
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
