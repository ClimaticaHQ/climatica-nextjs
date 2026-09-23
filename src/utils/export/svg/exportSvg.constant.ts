export const EXPORT_SVG_LAYOUT = {
  width: 1000,
  // +40 vs the old 800 -- headroom for the 3-line footer attribution block below,
  // plus a clear gap above it so it doesn't crowd the data table.
  height: 840,
  paddingX: 40,
  headerTitleY: 36,
  headerSubtitleY: 58,
  // Matches the --font-base (14px) design token, not a bespoke value.
  headerSubtitleFontSize: 14,
  headerRuleY: 78,
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
  // 32px below the data table's bottom edge (dataTableY + dataTableRowHeight * 3 = 748) --
  // matches the single-line footer's old gap so it doesn't read as crowding the table.
  footerY: 780,
  footerLineHeight: 15,
  footerFontSize: 11,
  // The share-URL footer line's length varies with city name/selected variables and can
  // overflow the canvas at footerFontSize -- these bound how far it shrinks to still fit.
  footerUrlMinFontSize: 8,
  footerUrlAvgCharWidthRatio: 0.55,
} as const;
