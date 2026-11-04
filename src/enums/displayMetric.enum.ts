// * what a displayed number is: each metric is rounded and printed one way (DISPLAY_PRECISION)
export enum EDisplayMetric {
  TEMPERATURE = "temperature",
  PRECIPITATION = "precipitation",
  ELEVATION = "elevation",
  MARTONNE = "martonne",
  // * arid / frost months
  MONTH_COUNT = "monthCount",
  // * a heat map region's cells, with thousands separators
  CELL_COUNT = "cellCount",
  AXIS_TICK = "axisTick",
  // * a heat map cell's or the region's value, whatever the variable
  HEATMAP_VALUE = "heatmapValue",
  HEATMAP_COORDINATE = "heatmapCoordinate",
  // * a monthly value in a standard chart's tooltip
  CHART_TOOLTIP_VALUE = "chartTooltipValue",
  // * a monthly value in a Walter-Lieth tooltip
  WALTER_LIETH_TOOLTIP_VALUE = "walterLiethTooltipValue",
  // * how many of something the Info pages list (resolutions, normals, languages)
  COUNT = "count",
  // * a grid cell's side at the equator, in km
  CELL_SIZE_KM = "cellSizeKm",
  // * a grid's resolution in arc-minutes (2.5′) or arc-seconds (30″)
  ARC_MINUTES = "arcMinutes",
  ARC_SECONDS = "arcSeconds",
}
